# Architecture

Companion to [README.md](README.md) (overview/setup) and [DECISIONS.md](DECISIONS.md) (why, not
what). This doc is the "what" — the actual shape of the system.

## Contents

- [Data model](#data-model)
- [Backend](#backend)
- [Frontend](#frontend)
- [Deployment shape](#deployment-shape)

---

## Data model

Postgres via Prisma (`@prisma/adapter-pg`), schema at `backend/prisma/schema.prisma`.

### Entities

| Model            | Purpose                                                                                     | Key fields                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Admin`          | Owns videos and advertisements; everything else is scoped to one of these, transitively     | `email` (unique), `passwordHash`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `Video`          | Metadata only — the file itself lives at Cloudinary                                         | `status` (PROCESSING/READY/FAILED), `externalId` (Cloudinary `public_id`), `playbackUrl` (null until READY), `durationSeconds` (captured from Cloudinary at the PROCESSING→READY transition, or on a later on-demand `GET /:id/status` call if it was still missing then — see `checkAndUpdateVideoStatus`; only ever backfilled if that endpoint happens to be hit again for the video, since the background poller stops tracking a video once it's READY), `authorId`, `deletedAt` (soft-delete only — see [Deletion behavior](#deletion-behavior)) |
| `Advertisement`  | A reusable ad creative — an image or video asset, placeable on many videos                  | `assetType` (IMAGE/VIDEO), `assetUrl`, `clickThroughUrl` (nullable), `authorId`, `deletedAt` (soft-delete only — see [Deletion behavior](#deletion-behavior))                                                                                                                                                                                                                                                                                                                                                                                          |
| `AdPlacement`    | One instance of an `Advertisement` on one `Video`, at one position                          | `adType` (PRE_ROLL/MID_ROLL/BANNER_OVERLAY — the placement's own role, independent of the creative's fixed asset type), `startOffsetSeconds`, `durationSeconds` (banner-only), `skipAfterSeconds` (null = not skippable), `deletedAt` (soft-delete only — see [Deletion behavior](#deletion-behavior))                                                                                                                                                                                                                                                 |
| `PlaybackEvent`  | Raw, append-only log — source of truth for every dashboard number                           | `videoId`, `adPlacementId` (nullable), `sessionId`, `eventType`, `occurredAt` (client-reported), `receivedAt` (server-set)                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `DailyCount`     | Derived, read-optimized aggregate — one row per (video, placement-or-none, event type, day) | `day` (`@db.Date`), `count`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `AggregationRun` | Audit trail — one row per aggregation execution                                             | `day`, `status`, `startedAt`/`completedAt`, `rowsUpserted`, `error`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

Six `PlaybackEventType` values: `VIDEO_STARTED`, `VIDEO_FINISHED`, `AD_SHOWN`, `AD_SKIPPED`,
`AD_COMPLETED`, `AD_CLICKED` (why a 6th event beyond the original spec's five: [DECISIONS.md](DECISIONS.md#event-vocabulary)).

### The dedup constraint (the actual center of gravity of this POC)

`PlaybackEvent` carries two **partial** unique indexes instead of one plain one:

```prisma
@@unique([sessionId, eventType, adPlacementId], where: raw("\"adPlacementId\" IS NOT NULL"), map: "PlaybackEvent_session_ad_event_dedup")
@@unique([sessionId, videoId, eventType], where: raw("\"adPlacementId\" IS NULL"), map: "PlaybackEvent_session_video_event_dedup")
```

- **Ad-scoped events** (`adPlacementId` set): the same session posting the same event type for the
  same placement twice collapses to one row — e.g. two `AD_SHOWN` beacons for the same ad in the
  same viewing session are one fact.
- **Video-scoped events** (`adPlacementId` is null — `VIDEO_STARTED`/`VIDEO_FINISHED`): the same
  session posting the same event type twice also collapses to one row. `videoId` is included in
  this index even though the frontend's per-video `sessionId` generation already makes cross-video
  collisions practically impossible — without it, this rule on its own doesn't actually scope to a
  video at all, an asymmetry against the ad-scoped index that's cheap to close defensively.

Why two _partial_ indexes rather than one `@@unique([sessionId, eventType, adPlacementId])`:
Postgres treats `NULL` as distinct from every other `NULL` in a unique constraint. Without the
`WHERE adPlacementId IS NULL` partial index, two separate `VIDEO_STARTED` events in the same
session (both with a null `adPlacementId`) would never collide, and dedup would silently fail for
every video-level event. Full reasoning in [DECISIONS.md](DECISIONS.md#event-identity--the-dedup-constraint).

`DailyCount` uses the identical partial-index pattern (`DailyCount_ad_scoped_key` /
`DailyCount_video_scoped_key`) for the same reason, one calendar day at a time.

A plain `[occurredAt]` index backs the aggregation job's scans — both the per-day recount and the
late-arrival check filter on an `occurredAt` range across every video. Two more,
`[videoId, eventType, occurredAt]` and `[adPlacementId, eventType, occurredAt]`, serve auditing a
disputed number: pulling the raw events behind one video's or placement's count for a given day,
to check them against `DailyCount`.

### Deletion behavior

`Video` and `AdPlacement`'s incoming relations from `PlaybackEvent`/`DailyCount` (and, for
`Video`, from `AdPlacement` too) are `onDelete: Restrict` — Postgres refuses to delete a row that
still has any event or aggregate history pointing at it (raises FK violation `P2003`). Since every
video or placement that's ever actually been watched has at least one such row, a hard delete of
either is, in practice, permanently blocked the moment it has real history. `Advertisement` is in
the same position one level up: `AdPlacement → Advertisement` is also `Restrict`, so an ad that's
ever been placed always has at least one placement row pointing at it.

**None of `deleteVideo`, `deleteAdPlacement`, or `deleteAdvertisement` hard-deletes — all three
are soft deletes.** `Video.deletedAt`/`AdPlacement.deletedAt`/`Advertisement.deletedAt` (nullable,
unset by default) get stamped with the current time instead of the row being removed. Deleting an
ad is still rejected with `409` while it has any live placement — the admin removes those first,
so retiring an ad never silently pulls it off a video. Removing a video retires its live
placements in the same transaction, so an ad is never left "placed" on a video nobody can open.

Every active view filters `deletedAt: null`: the default admin lists, the placement-create ad
lookup, the ad-placement counts on both grids, every write route's ownership check, event
ingestion, and every public-facing query (`listPublicVideos`, `getPlaybackConfig`) — so a retired
item stops appearing anywhere active, is never served to a new viewer, and can't be edited.
Retired items stay **readable** to their owner: the video/ad lists take `view=deleted` for a
"Deleted" view, and get-by-id plus the placement lists use a separate read-access ownership check
that doesn't filter `deletedAt` — a retired video's or ad's placement list then includes its
retired placements too, as a record of what ran where. The row itself, and every
`PlaybackEvent`/`DailyCount` row that references it, stays completely intact.
This is what actually resolves the tension the `Restrict` constraint above creates: something with
real history genuinely can never be hard-deleted, but retiring a video or an ad that's run its
course was never supposed to require that — soft delete gets you both "gone from every active
view" and "history untouched" at once, without ever touching the foreign key. Dashboard queries
scoped to a retired video/placement are deliberately left unfiltered by this — a retired item's
past numbers are still real facts about what happened while it was live.

---

## Backend

`backend/src/`, Express + TypeScript, feature-based module folders (`modules/<domain>/`, each with
its own routes/controller/service/schema/validators — not one giant `routes/`/`controllers/`
split across domains).

### Request pipeline (`app.ts`)

```
helmet()  →  cors({ origin: CORS_ORIGIN })  →  express.json()  →  pinoHttp (access log)
  →  GET /health
  →  /api/v1/{auth, videos, advertisements, dashboard, aggregation, public}
  →  errorHandler (global, last — 4-arg signature)
```

`errorHandler` normalizes `AppError` subclasses, Zod validation errors, and any unknown error
into one consistent `{ errors: [...], message }` shape — an unknown error is logged with full
context and never leaks its internals to the client.

### Module map

| Module           | Route prefix             | Auth                                                       | Purpose                                                                                                                                                                                                                                                                                                                               |
| ---------------- | ------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth`           | `/api/v1/auth`           | none                                                       | `POST /login` — verifies email/bcrypt password, issues a JWT                                                                                                                                                                                                                                                                          |
| `videos`         | `/api/v1/videos`         | `requireAuth` + `requireOwnership` on per-id routes        | Admin CRUD for videos: multipart upload (streamed to Cloudinary, no local copy kept), paginated + searchable list, get-by-id (own videos, includes ad-placement count), on-demand status check, update, delete (soft delete — see [Deletion behavior](#deletion-behavior)). Mounts `adPlacements` nested under `/:videoId/placements` |
| `advertisements` | `/api/v1/advertisements` | `requireAuth` + `requireOwnership`                         | Admin CRUD for reusable ad creatives, with the same paginated + searchable list shape as `videos`; `GET /:id/placements` lists every video an ad is placed on                                                                                                                                                                         |
| `adPlacements`   | nested under `videos`    | `requireAuth`; ownership derived from the **parent video** | Create/list/update/delete one placement of an ad on a video, with the placement business rules below                                                                                                                                                                                                                                  |
| `dashboard`      | `/api/v1/dashboard`      | `requireAuth`                                              | `GET /` — impressions/completions/skips/clicks/CTR/completion-rate/skip-rate/video-completion-rate + a daily trend series, scoped to the caller's own videos (optionally narrowed to one video, placement, or advertisement), reading only `DailyCount`                                                                               |
| `aggregation`    | `/api/v1/aggregation`    | `requireAuth`, no ownership check (system-wide)            | `POST /runs` — manually (re)aggregates one day, bypassing the scheduler's grace window — the "a client disputes a number" correction path                                                                                                                                                                                             |
| `public`         | `/api/v1/public`         | **none, deliberately**                                     | `GET /videos` (public catalog, paginated + searchable, same shape as the admin lists), `GET /videos/:id/playback` (playback URL + ad list), `POST /events` (event ingestion). This module never imports the admin write controllers — see [DECISIONS.md](DECISIONS.md#read-only-enforcement)                                          |

### Ownership pattern

`requireAuth` (verifies the JWT, attaches `req.admin`) then `requireOwnership(fetchResource,
paramName)` (fetches the resource, throws `NotFoundError` — 404, not 403 — if it doesn't exist
**or** isn't owned by the caller, so a guessing admin can't distinguish the two). A nested
resource like `AdPlacement` has no `authorId` of its own — ownership is derived transitively
through its parent video, and that video must be the `:videoId` in the URL (the fetcher receives
every route param), so `/videos/A/placements/<a placement on B>` 404s rather than editing B's.

The shared Pino logger redacts `req.headers.authorization` and `req.headers.cookie`, so the
per-request access log never records a reusable admin token.

### List pagination & search (`videos`, `advertisements`, `public/videos`, placements)

Every list endpoint shares one `paginationQuerySchema` (`page`, `pageSize`, optional `search`):
Prisma `skip`/`take` on the existing owner/scope-filtered `findMany`, plus a parallel `count({
where })` for the total, with the response carrying the array alongside a `{ page, pageSize, total,
totalPages }` meta block. `search` does a case-insensitive `contains` match on `title`, added to the
same `where` clause the ownership/scope filter already builds — a search term narrows the result
set, it never replaces the owner scoping. The two admin lists extend this with `view`
(`adminListQuerySchema`): `deleted` swaps the `deletedAt: null` filter for `deletedAt: { not: null }`
and sorts by removal date, newest first.
The two placement lists (`/videos/:videoId/placements`, `/advertisements/:id/placements`) are
paginated the same way, minus `search`; their details pages load them as infinite lists (10 per
batch, via `useInfinitePaginatedQuery`), with a `useInfiniteScrollTrigger` marker at the bottom fetching
the next batch as it scrolls into view - a section of a page has no page number worth putting in
its URL. Each list sits in a card (title and count, the list under a sticky column header, a
"Showing N of M" footer): the details page fills the window and never scrolls itself, and the
card scrolls inside whatever height is left below the header and the compact stats card.

Every page-level paginated list (the two library pages) fetches through one shared hook,
`usePaginatedQuery`: it keeps the list's page, search term, and filters (each declared with a
default, e.g. `view`) in the URL (`?page=`, `?search=`, `?view=`), adds them to the query key, and
passes them to the list's fetcher as ready-to-send query params - filters are named after the
API's own params (`view`), so they go through as-is. Changing the search term or a filter drops the
page param in the same URL update, so the list refetches once, from page 1. When the current page
stops existing (e.g. after removing the only item on it), the hook steps back to the last real
page.

### Video upload → ready pipeline

1. Admin submits multipart form data; `multer` (memory storage, no disk write) buffers it.
2. `initiateVideoUpload()` streams the buffer to Cloudinary as `resource_type: 'video'` with
   `eager_async: true` — Cloudinary returns a `public_id` immediately while transcoding continues
   in the background. Video row is created as `status: PROCESSING`, `externalId: public_id`.
3. `startVideoPoller()` (background interval, 5s tick) re-checks every `PROCESSING` video against
   Cloudinary's Admin API, with **per-video exponential backoff** (in-memory `Map`, 5s → doubling
   → capped at 5min) so a slow video gets checked less and less often rather than hammering
   Cloudinary's rate limit. A transient failure (network blip, timeout) doesn't fail the video —
   only a genuine Cloudinary-reported error, or exceeding `MAX_PROCESSING_AGE_MS` (30min), does.
4. Once the eager transform's `secure_url` appears, the video flips to `READY` with `playbackUrl`
   and `durationSeconds` set. On failure, it flips to `FAILED` and the Cloudinary asset is
   best-effort deleted (a storage-cost cleanup, not a correctness requirement).
5. The same status-check logic (`checkAndUpdateVideoStatus`) backs both the poller and the
   on-demand `GET /:id/status` endpoint, so they can never drift out of sync.

### Ad placement rules (`adPlacements.validators.ts`)

- A banner overlay requires an IMAGE asset (and a set `durationSeconds`); pre/mid-roll requires a
  VIDEO asset.
- `PRE_ROLL` is always at offset 0; `MID_ROLL` must be > 0.
- If the video's `durationSeconds` is known, a mid-roll's or banner's `startOffsetSeconds` can't
  exceed it — skipped entirely (not failed closed) if the duration isn't known yet. The placement
  form (`CreateEditAdPlacementModal`) mirrors this same rule client-side (also fail-open when
  `durationSeconds` is `null`), so it surfaces as a form validation error instead of a generic
  backend-error toast.
- A banner's optional `skipAfterSeconds` (the same field pre/mid-roll ads use) must land before its
  own `durationSeconds` — otherwise the skip point would never actually arrive before the banner
  ends on its own.

### Event ingestion (`POST /api/v1/public/events`)

1. Zod-validate the payload shape, including two anti-abuse bounds: `occurredAt` is rejected if
   it's more than a few minutes in the future or more than several days in the past (so one
   request can't plant a fact into an arbitrary calendar day), and `sessionId` is capped at a
   fixed max length.
2. Video must exist (`400`, not `404` — no ownership concept on the public side, so an unknown
   video is invalid input) and must be `READY` — an event against a still-`PROCESSING` or `FAILED`
   video is rejected, since it can't have genuinely been watched.
3. If `adId` is present: must belong to the given video (else `400`); `AD_SKIPPED` is rejected for
   any placement with no `skipAfterSeconds` configured, regardless of ad type (not a banner-specific
   rule — a video ad with no skip point configured is rejected the same way); for
   `AD_COMPLETED`/`AD_SKIPPED`/`AD_CLICKED`, checks whether a prior `AD_SHOWN` exists for the same
   session+placement — if not, flags
   `outOfOrder: true` for the structured log **only**, never rejects (network can genuinely
   deliver events out of order).
4. Inserts the row. **The dedup enforcement is the database's partial unique constraint, not
   application logic** — a collision throws Prisma error `P2002`, caught and turned into a `200`
   (not an error) with `outcome: 'deduped'` logged.
5. Every outcome (`accepted` / `deduped` / `rejected`) is logged with session id, event type, and outcome — the structured trace the specs ask for.

### Aggregation pipeline

- `startAggregationScheduler()` — hourly tick, `runScheduledAggregation()`:
  1. **Today** (UTC) is always recomputed — it's still accumulating events.
  2. Every earlier day within a 48h grace window gets recomputed if it has no prior `SUCCEEDED`
     run, or if any event for that day arrived (`receivedAt`) after the last run's `completedAt`
     (a late arrival makes the stored counts stale).
  3. A day older than 48h is never auto-touched again — only the manual `POST
/api/v1/aggregation/runs` endpoint can correct it.
- `recomputeDailyCounts(day)` — the engine, safe to call for any day:
  1. Inserts an `AggregationRun` row as `RUNNING` **first**, so even a crash mid-run leaves a
     trace.
  2. `groupBy` over raw `PlaybackEvent` rows for that UTC day — the full recount, not incremental.
  3. For each group, upserts into `DailyCount` — using find-then-create/update rather than
     Prisma's `.upsert()`, since `.upsert()` can't target a partial unique index (Postgres error
     `42P10`). A concurrent-create race falls back to update on `P2002`.
  4. On completion, the `AggregationRun` row is marked `SUCCEEDED`/`FAILED`; re-aggregating a day
     always inserts a **new** run row rather than editing the old one.

### Dashboard query

`GET /api/v1/dashboard?startDate&endDate&videoId?&adPlacementId?&advertisementId?` runs two
`prisma.dailyCount.groupBy` queries — never touches `PlaybackEvent` — scoped by a
`video: { authorId }` relation filter (the actual per-admin isolation) plus the date range and
optional narrowing. `videoId`/`adPlacementId` narrow to one owned video (and, further, one of its
placements); `advertisementId` is mutually exclusive with those two and instead sums across every
placement of one owned advertisement, on any video — the per-ad view an ad's own detail page needs
(`assertOwnsScope` checks whichever of the three were given before the query runs):

- Grouped by `eventType` only, summed across the range → the headline totals.
- Grouped by `[day, eventType]` → the per-day trend series.
- Grouped by `eventType`, limited to rows whose video or placement is retired → the
  `deletedContribution` — the deleted share of every count (impressions, completions, skips,
  clicks, plays, video completions). Retired items stay in the totals — they really happened —
  and this just says how much of each total they account for.

Both get pivoted by the same function (`extractDashboardStats`) into named metrics (`impressions`,
`completions`, `skips`, `clicks`, `videoViews`, `videoCompletions`) plus derived
`completionRate`/`skipRate`/`ctr`/`videoCompletionRate` — each guarded against divide-by-zero
(returns `0`, not `NaN`, with no impressions/views yet).

### Background processes (started in `server.ts`)

Both are `setInterval` loops with an `isTickInProgress` guard against overlapping ticks:

- `startVideoPoller()` — 5s tick.
- `startAggregationScheduler()` — 1h tick.

Graceful shutdown on `SIGTERM`/`SIGINT`: clears both intervals, lets in-flight requests finish
(`server.close()`), disconnects Prisma, exits.

### External dependency: Cloudinary (`lib/cloudinary.ts`)

- `initiateVideoUpload` / `uploadAdAsset` / `getVideoResource` / `deleteVideoResource` — thin
  wrappers around the Cloudinary SDK.
- **Timeout enforcement**: the SDK's own `timeout` option never actually aborts a hung request, so
  `getVideoResource`/`deleteVideoResource` are wrapped in a manual `Promise.race` against a
  rejecting timer.
- **Opt-in DNS workaround**: if `DNS_FALLBACK_SERVERS` is set, a custom `https.Agent` routes
  hostname resolution through explicit DNS servers instead of the OS resolver — for machines whose
  configured resolver is unreliable specifically for Node's connection path. Unset by default.

---

## Frontend

`frontend/src/`, React 19 + TypeScript (strict) + Vite, React Router v7, antd v6, TanStack Query +
Axios. Folder philosophy: layer folders (`api/`, `lib/`, `components/`, `hooks/`) for cross-cutting
concerns, `features/<name>/{components,hooks}` for page-specific building blocks; the actual
`<Page>` component always lives in `pages/`.

### Routes

| Path                          | Component                        | Access                                                                   |
| ----------------------------- | -------------------------------- | ------------------------------------------------------------------------ |
| `/`                           | `PublicVideosPage`               | Public                                                                   |
| `/play/:videoId`              | `PublicPlayerPage`               | Public                                                                   |
| `/login`                      | `LoginPage`                      | Public (guest-guarded — an already-authed admin is bounced to `/videos`) |
| `/videos`, `/videos/:videoId` | `VideosPage`, `VideoDetailsPage` | Admin                                                                    |
| `/ads`, `/ads/:adId`          | `AdsPage`, `AdDetailsPage`       | Admin                                                                    |
| `/dashboard`                  | `DashboardPage`                  | Admin                                                                    |

All admin routes are wrapped in `<RequireAuth>` (redirects to `/login`, stashing the attempted
destination) and nested under a shared `<Layout>` (sidebar shell).

### Auth

- `AuthProvider`/`useAuth`: `isAuthenticated` derived from `Boolean(getAuthToken())`; `login()`/
  `logout()` are the one place the stored token (localStorage) and React state update together.
- `axiosInstance`'s response interceptor: any `401` other than login's own calls
  `notifyUnauthorized()` — a tiny pub/sub (`authEvents.ts`) that reaches `AuthProvider.logout`
  from outside the React tree without a circular import. This is the auto-logout mechanism: an
  expired/invalid token immediately logs the admin out rather than leaving them stuck re-hitting a
  failing request.

### Data fetching convention (every hook follows this)

- One shared `axiosInstance` (`baseURL` is `API_BASE_URL` + `/v1`, where `API_BASE_URL` is the
  backend's origin — set at build time via `VITE_BACKEND_ORIGIN`, empty in dev so calls stay
  relative and go through Vite's proxy — plus `/api`; see [Deployment shape](#deployment-shape)),
  request interceptor attaches the bearer token.
- Query keys: a flat `QueryKeys` object of base segments; each hook composes the full array key
  inline (`[QueryKeys.VIDEOS]`, `[QueryKeys.PLAYBACK_CONFIG, videoId]`).
- Mutations: `onSuccess` invalidates the query keys it affects, then calls `handleAxiosSuccess`
  (toasts the backend's own `message`); `onError` calls `handleAxiosError` (same, for failures).
  No manual cache patching — always invalidate-and-refetch.
- Queries never toast on error — they expose `isError`/`error` for inline `Result`/`Spin` UI
  instead, since a query's default retries could otherwise toast mid-retry for a failure that
  self-resolves.
- Retries: a custom `retry` predicate (`queryClient.ts`) skips retrying any 4xx response outright —
  none of those succeed on a second attempt, and retrying one only piles more requests onto a
  backend that's already rejecting them (concretely, a Render free-tier cold-start 429 burst
  getting worse from the default retry storm). A network failure or a 5xx still gets the default
  retry count.

### List pages: pagination, infinite scroll, search (`VideosPage`, `AdsPage`, `PublicVideosPage`)

Admin `VideosPage`/`AdsPage` hold `page` in a URL search param (`usePaginatedQuery`) and render antd's `Pagination` below
the grid — numbered pages suit a management task (find _this_ item and act on it), and pair cleanly
with the `onSuccess` → `invalidateQueries` pattern every mutation already uses. The public catalog
instead uses TanStack Query's `useInfiniteQuery` (through the shared `useInfinitePaginatedQuery`,
which every scroll-to-load list uses), with an `IntersectionObserver` sentinel
(`useInfiniteScrollTrigger`) at the bottom of `PublicVideosGrid` triggering `fetchNextPage()` — a
better fit for a browsing/discovery page with no mutations and no "page number" worth remembering.

All three pages search through one shared `SearchInput`: it holds what's typed, debounces it via
`useDebouncedValue` (400ms), and reports only the settled term through `onSearch` — so a search
doesn't refetch on every keystroke, and pages never see per-keystroke updates. On the admin pages,
the term lives in the URL (`?search=`, via `usePaginatedQuery`), and setting it drops the page
param in the same URL update — one refetch, from page 1 — and survives a refresh; on the public page, changing
the query key
naturally drops any accumulated pages, so `useInfiniteQuery` restarts from page 1 with no manual
reset needed.

The two admin pages share a `ListPageHeader` (title, count subtitle, primary create action),
then a filter row of `SearchInput` beside an Active / Deleted `Segmented` switch
(a `usePaginatedQuery` filter, `?view=` in the URL like `page`; switching drops the page param so
the other list starts from page 1), then a per-feature `VideosListContent` / `AdsListContent` that renders
whichever of loading / error / empty / grid-with-pagination applies.
Deleted cards (only ever shown under the Deleted tab) drop their status, counts, and actions, and
link to a **read-only** details page:
`DeletedBanner` at the top, no edit/delete/placement management, the existing stats widget for its
history, and every placement it ever had. A deleted video's Cloudinary file
is deleted, so its card and preview show a placeholder rather than a broken thumbnail/player.

### The public player's ad-playback engine (`useVideoPlaybackController`)

The core piece of frontend logic — drives a **single reused `<video>` element** through the whole
ad sequence by swapping its `src`, rather than separate players per ad:

- **Session id**: a per-video id in `sessionStorage` (`getOrCreateSessionId`), reused across a
  page reload by design (so a mid-viewing refresh doesn't fabricate a duplicate impression), kept
  in a ref so a same-tick rotation is visible to event-logging calls immediately.
- **Sequencing**: pre-roll(s) play first (in a "pod" — multiple pre-rolls queue and play in
  sequence, not just the first one), then mid-rolls fire at their configured offset (checked every
  `timeupdate` tick), banners pause the main video for their configured duration and resume it
  afterward — either on their own timer, or earlier if the viewer skips (same `skipAfterSeconds`
  countdown/button pre/mid-roll ads use, via `AdControls`).
- **Replay handling**: there's no in-app "Watch Again" button — a native browser replay is
  _inferred_ (main video reached a natural `ended`, then `play` fires again) and treated as a
  brand-new viewing session: the session id rotates, every "already shown" guard resets, and the
  ad sequence replays from the top. Full reasoning: [DECISIONS.md](DECISIONS.md#playback-session-identity--replay-handling).
- **Events fired**: `VIDEO_STARTED`/`VIDEO_FINISHED` (once each, on the main video), `AD_SHOWN`
  (once per ad, on its first play), `AD_COMPLETED`, `AD_SKIPPED`, `AD_CLICKED` — via
  `navigator.sendBeacon`, not `fetch`/`axios`, so an event still attempts delivery even if the tab
  closes mid-event.
- **Seeking is safe against arbitrary jumps**: the mid-roll/banner checks (`checkForMidRoll`/
  `checkForBanner`) compare the current position against each ad's offset on every `timeupdate`
  tick rather than watching for one specific instant, so landing anywhere via a seek still triggers
  whichever ad is next due, the same as normal playback would.

### Public player presentation (`PrePlayOverlay`, `PlayerControls`)

The native `<video>` element's own chrome is fully replaced, not just skinned:

- **`PrePlayOverlay`**: covers the video until the viewer's first real play. Autoplay is blocked
  without a user gesture, so a pre-roll sits loaded-but-paused on mount — without this, that's a
  blank black box. Shows the video's own Cloudinary-derived thumbnail (gradient fallback for a
  non-Cloudinary source) and a large play button instead.
- **`PlayerControls`**: replaces the native control bar for main-content playback only — ads keep
  using their own non-seekable `AdControls`/`BannerOverlay`. A play/pause toggle, elapsed/total
  time, and a click-and-drag seek track with a small dot marking each ad placement's position,
  YouTube-chapter-marker style. This exists because the native scrubber has no way to draw
  anything on top of it — the only way to show ad positions directly on a seekable timeline is to
  own the timeline.

### Thumbnails (`lib/videoThumbnail.ts`, `components/VideoThumbnail`)

`getVideoThumbnailUrl` derives a still-frame JPG from a Cloudinary-hosted video's own URL via
Cloudinary's URL-based transforms (`so_1,w_400,h_225,c_fill` — grabs the 1-second frame, since 0s
is often black/mid-fade) — no extra upload, storage, or backend call. It returns `null` for a
non-Cloudinary URL.

`VideoThumbnail` wraps it for any video URL: the Cloudinary JPG where available, otherwise a muted,
non-interactive `<video preload="metadata">` at `#t=1`, which the browser loads just far enough to
draw the same 1-second frame — so an externally hosted ad still gets a real preview. It's used for
ad creatives (`AdsGrid`, `AdPlacementsList`) and the videos in an ad's "Placed on" list
(`AdPlacementVideosList`). The main-video callers (`VideosGrid`, `PublicVideosGrid`,
`PrePlayOverlay`) call `getVideoThumbnailUrl` directly — uploaded videos are always on Cloudinary
— and fall back to a fixed brand-color gradient tile when there's no frame (a still-processing or
deleted video).

### Dashboard features

`DashboardFilters` (two independent `DatePicker`s, not antd's two-month `RangePicker`) →
`useDashboardDateRange` (state lives in the URL's `?startDate=&endDate=`, so it survives a refresh
and is shareable) → `useDashboardStatsQuery` → `DashboardStatsGrid` (KPI tiles, split into "Ad
performance" vs "Video engagement", each with a narrative caption rather than a bare number),
`DashboardTrendChart`/`VideoTrendChart` (impressions/completions/skips/clicks and plays/video-
completions, as line charts), `DashboardRateBreakdown` (completion rate / skip rate / CTR, ranked),
`DashboardOutcomeBreakdown`/`VideoOutcomeBreakdown` (completed/skipped/"no outcome yet" and
finished/left-early donuts, CTR overlaid in the ad donut's own hollow center since a click isn't
mutually exclusive with completing or skipping and so can't be one of its slices).
When deleted items contributed to the range, every `DashboardStatsGrid` tile splits its total
into active vs deleted: a thin bar (active in the tile's accent, deleted muted) and a legend
("555 active · 311 deleted"). With no deleted contribution, the tiles show the plain total only.

A video or ad's own detail page adds a narrower, per-item view of the same data:
`VideoStatsWidget`/`AdStatsWidget` (plays-or-impressions with a sparkline, completion/skip/CTR
rates, a pickable 7/30/90-day range) call the same `useDashboardStatsQuery` with its `videoId`/
`advertisementId` filter — no new backend endpoint. Each placement row in `AdPlacementsList`/
`AdPlacementVideosList` additionally shows its own inline stats via the shared
`AdPlacementRowStat`, and its real creative thumbnail, ad-type tag (`AdTypeTag`), and "plays at"/
skip-or-duration chips in place of a single plain-text line.

---

## Deployment shape

**Local:** `docker-compose.yml` — Postgres + backend (Node, compiled JS) + frontend (`serve`
serving the built SPA as static files). The
browser calls the backend directly at `http://localhost:<port>` (the backend's port is published
to the host).

**Production (e.g. Render):** the two containers become two separate services with no shared
private network — same as local, the browser calls the backend's real public HTTPS URL directly.
Both still use their existing Dockerfiles unchanged; the only difference is `VITE_BACKEND_ORIGIN`
(a _build-time_ arg, baked into the JS bundle — see `frontend/Dockerfile`) is set to the backend
service's real public origin instead of `http://localhost:<port>`.

The backend's `cors` middleware (`CORS_ORIGIN`) handles the resulting cross-origin calls in both
environments.

```
                      docker-compose.yml (local)

    ┌────────┐  page load   ┌──────────┐
    │ browser│─────────────▶│ frontend │  (serve, static files only)
    │        │              └──────────┘
    │        │  API calls   ┌──────────┐  ┌─────────┐
    │        │─────────────▶│ backend  │──│ postgres│
    └────────┘  (localhost) └──────────┘  └─────────┘

                        Render (production)

    ┌────────┐  page load   ┌──────────────┐
    │ browser│─────────────▶│ frontend     │  (serve, static files only)
    │        │              │ Web Service  │
    │        │              └──────────────┘
    │        │  API calls   ┌──────────────┐
    │        │─────────────▶│ backend      │
    └────────┘  (backend's  │ Web Service  │
                 public URL) └──────────────┘
```

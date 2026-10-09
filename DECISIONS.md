# Decisions

The "why," not the "what" — [ARCHITECTURE.md](ARCHITECTURE.md) covers the shape of the system;
this doc covers the reasoning behind every choice that isn't self-evident, organized around what
[in-video-ad-platform.md](in-video-ad-platform.md) requirements actually grade this POC on. Each section
ends with what to point at if this exact thing gets probed in a walkthrough.

## Contents

1. [Event identity & the dedup constraint](#event-identity--the-dedup-constraint)
2. [Playback session identity & replay handling](#playback-session-identity--replay-handling)
3. [Aggregation strategy](#aggregation-strategy)
4. [Timestamp for day-bucketing](#timestamp-for-day-bucketing)
5. [Ownership scoping](#ownership-scoping)
6. [Read-only enforcement](#read-only-enforcement)
7. [Out-of-order event handling](#out-of-order-event-handling)
8. [The ad model: two tiers](#the-ad-model-two-tiers)
9. [Event vocabulary](#event-vocabulary)
10. [Video hosting integration](#video-hosting-integration)
11. [Indexing for dashboard volume](#indexing-for-dashboard-volume)
12. [Known gaps](#known-gaps)

---

## Event identity & the dedup constraint

**The question:** what makes "the same event" recognizable, and what stops a retried/doubled
submission from being counted twice?

**The answer:** `(sessionId, eventType, adPlacementId)` — one session, submitting the same event
type, for the same ad (or no ad, for video-level events) — is one fact. Enforced as a **database
constraint**, not an application-level check-then-insert (which would be a race condition under
concurrent requests): two partial unique indexes on `PlaybackEvent`, split on whether
`adPlacementId` is null, because Postgres treats every `NULL` as distinct from every other `NULL`
in a unique index — a single non-partial `@@unique([sessionId, eventType, adPlacementId])` would
silently fail to dedup `VIDEO_STARTED`/`VIDEO_FINISHED` (both always null `adPlacementId`). The
video-scoped half of the pair also includes `videoId` (`(sessionId, videoId, eventType)`) —
defense in depth, since the frontend's per-video `sessionId` generation already makes a
cross-video collision practically impossible, but the constraint itself shouldn't rely on that.

The ingestion endpoint (`POST /api/v1/public/events`) just tries the insert. A collision raises
Prisma's `P2002`, which is caught and turned into a `200 OK` — **a well-behaved retry has to look
like success to the caller**, not a `409`. The contract is: same input → same observable outcome,
however many times it's sent.

Dedup on its own doesn't stop a _malformed_ fact from being recorded once, so two narrower guards
sit in front of it: `occurredAt` is rejected outside a tight window around "now" (a real client
reports this live, so anything wildly off can't be a genuine playback timestamp — otherwise one
request could plant an event into an arbitrary calendar day and quietly skew that day's
`DailyCount`), and an event against a video that isn't `READY` is rejected outright (it can't have
genuinely been watched). Neither is about duplicates — they're about the raw log staying a
trustworthy source of _facts_, which the dedup constraint alone doesn't guarantee.

**Point at:** [ARCHITECTURE.md's dedup constraint section](ARCHITECTURE.md#the-dedup-constraint-the-actual-center-of-gravity-of-this-poc)
for the exact schema lines.

---

## Playback session identity & replay handling

**The question:** who mints the session id, and how does it survive a mid-playback page reload?

**The answer:** the _client_ mints it — a UUID stored in `sessionStorage`, keyed per video
(`playback-session:<videoId>`), generated once per (tab, video) pair and **reused across a page
reload** by design. This is what makes the dedup constraint above actually work against a reload:
if the id were regenerated on every mount (a naive in-memory random id), a mid-playback refresh
would resubmit `VIDEO_STARTED` and every ad event under a _new_ session id, and none of it would
collide with what was already recorded — silently inflating every count on every refresh.

`sessionStorage` (not `localStorage`) is the right lifetime for this: it's scoped to one tab and
clears when the tab closes, matching "one playback attempt," without needing a server-issued
session token for an intentionally unauthenticated endpoint.

**The one place this reuse _shouldn't_ apply:** replaying a finished video. If the session id
were reused there too, every event from the replay would dedup against the first viewing and
the replay would be invisible to analytics — a real bug this project hit and fixed. There's no
in-app "Watch Again" control (native browser replay is the only path), so a replay is _inferred_:
the main video reaching a natural `ended` sets a flag; if `play` fires again while that flag is
still set, the controller mints a **fresh** session id (`rotateSessionId`) and resets every
per-viewing guard (which ads have already fired `AD_SHOWN`, whether `VIDEO_STARTED` already fired)
before falling through to the normal play-handling logic — so the replay goes through the full ad
sequence again, under a session id that's genuinely new, and none of its events collide with the
first viewing's.

**Point at:** `frontend/src/lib/getOrCreateSessionId.ts` (both functions, ~15 lines total) and
`handleMediaPlay`/`handleMediaEnded` in `frontend/src/features/publicPlayer/hooks/useVideoPlaybackController.ts`.

---

## Aggregation strategy

**The question:** compute daily counts on-read, or aggregate ahead of time on a schedule — and
what does a dashboard read see while an aggregation run is in flight?

**The answer: scheduled, not on-read.** `DailyCount` is a separate, read-optimized table,
recomputed by an hourly background job (`recomputeDailyCounts`) and read exclusively by the
dashboard — it never touches raw `PlaybackEvent`. This makes "holds up at volume" (a requirement
from in-video-ad-platform.md's section 6) trivially true regardless of how large the raw log grows: the dashboard query is always a
`groupBy` over a table sized in proportion to _(videos × placements × event types × days)_, not
_(total events ever recorded)_.

The tradeoff this buys is a **grace window**, not perfect real-time numbers: every aggregation
tick always redoes _today_ (still accumulating) and redoes any of the last 48 hours where a new
event arrived after that day's last successful run (a late/out-of-order arrival). A day older than
48 hours is never auto-touched again — if a client disputes an older number, the fix is the manual
`POST /api/v1/aggregation/runs` endpoint, which bypasses the grace window entirely and recomputes
any single day on demand. That's the deliberate answer to "what happens to old numbers if a very
late event shows up": nothing, automatically, past 48h — because auto-reopening arbitrarily old
days forever would mean the aggregation job's scan window never shrinks, and in practice a
playback event arriving days late is itself a signal something unusual happened (worth a human
decision, not silent auto-correction).

**What a read sees mid-run:** each `DailyCount` row commits independently (no single wrapping
transaction across the whole day's recompute) — a concurrent dashboard read could see a mix of
freshly-recomputed and not-yet-recomputed rows across _different_ event types for the same day,
but never a torn/inconsistent value within one row. Given aggregation runs hourly and each run
completes in well under that window, this is judged an acceptable tradeoff for a POC over the
complexity of a wrapping transaction or a blue/green swap.

**Auditability:** every run writes an `AggregationRun` row _before_ it starts (`RUNNING`), so even
a crash mid-run leaves a trace, and re-aggregating a day always **inserts a new run row** rather
than editing the old one — "day X was recomputed at 14:03 from N events, succeeded" is answerable
for any disputed number, per in-video-ad-platform.md's section 6 "structured trace" requirement.

**Point at:** `backend/src/modules/aggregation/aggregation.service.ts` (`runScheduledAggregation`,
`recomputeDailyCounts`), and the `AggregationRun` rows themselves (`GET` any admin-authenticated
route that surfaces them, or query the table directly).

---

## Timestamp for day-bucketing

**The question:** client-reported `occurredAt` or server-received `receivedAt` — which decides
which calendar day an event counts toward?

**The answer: `occurredAt`.** An event describes something that already happened on the client at
a specific moment; bucketing by `receivedAt` would mean a slow network delivering an 11:58pm event
at 12:01am the next day silently moves it to the wrong day's count. `receivedAt` still exists on
every row (server-set, never client-controlled) and is exactly what the aggregation job compares
against a day's `completedAt` to detect "did anything arrive late for a day we already closed" —
it's the mechanism for the grace window, not the bucketing key.

---

## Ownership scoping

**The question:** can an admin reach another admin's video/ad by guessing its id?

**The answer:** no — every video, advertisement, and ad placement is scoped to the admin who
created it (`adminId`, transitively for `AdPlacement` through its parent video), and every
per-resource admin route runs `requireOwnership` after `requireAuth`. A mismatch returns **404,
not 403** — deliberately, so a guessing admin can't distinguish "this id doesn't exist" from
"this id exists but isn't yours," which a 403 would leak.

**Point at:** `backend/src/middleware/requireOwnership.ts` (~20 lines, the whole mechanism).

---

## Read-only enforcement

**The question (walkthrough question 1 in in-video-ad-platform.md's section 7):** the public
player can read but never write configuration — show the enforcement.

**The answer:** it isn't a runtime check, it's a structural fact about the router. The entire
public module (`backend/src/modules/public/`) exposes exactly three routes —
`GET /public/videos`, `GET /public/videos/:id/playback`, `POST /public/events` — and none of them
import or call any admin write controller/service. There is no route in this codebase, public or
otherwise, that lets a request without a valid admin JWT touch `Video`, `Advertisement`, or
`AdPlacement` write paths. "Show me the enforcement" is showing the router file itself: nothing to
disable, no flag to flip, the write functions are simply never reachable from unauthenticated
code.

---

## Out-of-order event handling

**The question (walkthrough question 3 in in-video-ad-platform.md's section 7):** playback events
arrive out of order — what happens?

**The answer:** nothing rejects them. Each event is treated as an independent fact about
something that already happened (`occurredAt`), not a request to advance a state machine — an
`AD_COMPLETED` arriving before its `AD_SHOWN` is accepted exactly like any other event. The one
thing that _does_ happen: if an ad-scoped event that logically requires a prior `AD_SHOWN`
(`AD_COMPLETED`/`AD_SKIPPED`/`AD_CLICKED`) doesn't find one for the same session+placement, it's
flagged `outOfOrder: true` in the structured log — visibility, not rejection. Aggregation is
naturally resilient to this too, since it recounts a full day's raw events unconditionally rather
than incrementally applying events in arrival order.

---

## The ad model: two tiers

**The question:** why split `Advertisement` (a reusable creative) from `AdPlacement` (one instance
of it on one video), instead of one flat "ad" entity?

**The answer:** it mirrors how manual-ad-insertion video platforms actually work (create a
creative once, place it many times) — a sponsor's 15-second spot gets uploaded once and placed on
ten different videos, or even twice on the _same_ video (e.g. the same spot at both the 30s and
90s mid-roll break). `PlaybackEvent.adPlacementId` points at the **placement**, not the creative,
so two placements of the same creative on one video still produce distinguishable events — without
this split, "impressions for this creative" and "impressions at this specific position" would be
the same unanswerable question. Creative reuse is scoped to one admin's own library — never across
admins — keeping the authorization model symmetric with everything else in the system.

## Event vocabulary

in-video-ad-platform.md's section 3.4 lists five events: started, ad shown, ad skipped, ad
completed, video finished. A sixth, **`AD_CLICKED`**, was added — section 3.6 asks for
click-through rate, and there's no way to compute a CTR from those five alone. `AD_CLICKED` only fires for an ad that actually carries
a `clickThroughUrl`; CTR is `clicks / impressions` for ads that have one.

## Video hosting integration

Real Cloudinary integration (not a fully fake stub), behind a thin wrapper — `initiateUpload`
returns immediately with a `public_id` (`eager_async: true`), and a background poller tracks
transcode completion via Cloudinary's Admin API. This makes "processing → ready" and the actual
playback demo genuinely real rather than theater, without building any storage/transcoding
ourselves (explicitly out of scope per the brief). Failure modes are handled explicitly rather
than assumed away: a transient poll failure doesn't fail the video (retried with backoff), a
genuine Cloudinary error or exceeding a max processing age does, and the admin sees a `failed`
video with a real audit trail rather than a silently stuck one.

## Indexing for dashboard volume

The dashboard never queries raw `PlaybackEvent` — every read goes through `DailyCount`, whose
partial unique indexes (`[videoId, adPlacementId, eventType, day]` / `[videoId, eventType, day]`)
double as the query's access path, since the dashboard's `groupBy` filters on exactly those
columns. The aggregation job's own scan of raw events per day — the recount and the late-arrival
check, both an `occurredAt` range across every video — is backed by a plain `[occurredAt]` index,
so recomputing one day never means scanning the whole table.

## Known gaps

Honest, not swept under the rug — things the original brief calls for that aren't done yet:

- **No automated test suite exists.** `backend/package.json` has `vitest` wired (`npm run test`),
  but there are currently no `*.test.ts` files in the repo — including the test in-video-ad-platform.md's
  section 6 explicitly calls for, "POST the same event twice, assert exactly one row exists," the
  single most important test this POC calls for. Everything described in this doc as "verified" was
  verified **manually**, live, during development (Playwright-driven browser sessions, direct
  `curl` against the running API) — real proof, but not a regression-proof automated suite.
- **No fake `VideoHostingService` implementation for deterministic failure-mode tests**
  (in-video-ad-platform.md's section 6 asks for this specifically, to prove upload-slow/error/
  unavailable behavior on demand rather than trusting a real third party to fail when you need it
  to).
- **Section 8 of in-video-ad-platform.md (optional stretch goals)** — duplicate/out-of-order burst
  simulation, a second dashboard breakdown by ad type, a million-row load test — not attempted,
  since the brief itself marks this section optional.

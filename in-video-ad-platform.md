# POC: In-Video Ad Platform

**Track:** Media · **Status:** Required · **Path:** React to Full Stack — 101 (2-week solo POC)
**Stack:** Express or Next.js (engineer's choice) · PostgreSQL · Prisma

## 1. Background

Videos get published with no way to attach advertising to them, and when ads are placed by
hand there's no record of whether anyone actually watched one, skipped it, or sat through it.
Sales wants a number to put in front of a client; right now nobody can produce one that would
survive a second look.

You're building the platform that fixes this: admins upload a video and attach one or more ads
to it, the public player receives the video together with its ad configuration and plays each
ad at the right moment, and every meaningful moment of playback — started, ad shown, ad
skipped, ad completed, video finished — is recorded as an event. The actual video storage and
streaming is handled by a third-party video hosting service; treat that as a supplied
dependency you call and stub, not something you build. What you're being assessed on is
everything around it: the ad configuration model, the event log, and what your dashboard
numbers are actually built on.

This POC's centre of gravity is **event integrity** — the same playback event arriving twice
must never be counted twice, and your daily counts have to be a real, defensible aggregate, not
just a `COUNT(*)` that happens to work in the demo.

## 2. Actors

| Role | Can do |
|---|---|
| **Admin** | Upload videos, attach/edit/remove ads on a video, view the impressions/completion/CTR dashboard |
| **Public player** *(unauthenticated by design)* | Fetch a video's playback configuration, submit playback events for that video; cannot create, edit, or delete anything |

## 3. Functional requirements

### 3.1 Video upload
- An admin uploads a video, which is handed off to the third-party video hosting/streaming
  service for storage and transcoding; your system stores the metadata and whatever reference
  (ID, playback URL) that service hands back.
- Decide, and document, what your system stores and shows while that upload/transcode is still
  in progress — a video shouldn't appear playable before it actually is.

### 3.2 Attaching ads
- A video can have one or more ads attached to it. Each ad has a type (e.g. pre-roll, mid-roll,
  banner overlay — your choice, document it) and a playback position within the video.
- Ads can be added, edited, or removed by an admin independent of the video itself.

### 3.3 Serving playback configuration
- The public player requests a video and receives it together with its full ad configuration —
  every ad and the position it should appear at.
- The player can read this configuration but must never be able to alter it — there is no write
  path from the player into ad or video configuration, only into playback events (§3.4).

### 3.4 Recording playback events
- As playback happens, the player reports events: video started, ad shown, ad skipped, ad
  completed, video finished.
- **The same event for the same playback must never be counted twice.** This is the core hard
  case of this POC: players retry network calls, users double-tap, tabs reload mid-playback —
  none of that should be able to inflate a count.

### 3.5 Deriving daily counts
- Daily counts per video and per ad (impressions, completions, skips) are derived from the raw
  event log — they are never edited directly by any code path.
- Decide whether these are computed on read or aggregated ahead of time on a schedule, and be
  ready to defend the choice, including what happens to the numbers while an aggregation run is
  in progress.

### 3.6 Dashboard
- An admin-facing dashboard shows impressions, completion rate, and click-through rate, all
  filterable by date range.
- The dashboard reads from the derived counts (§3.5), not by re-scanning the full event log on
  every request.

## 4. Data to think through

You choose the exact schema. At minimum, your model needs to represent: videos and their
hosting-service reference, ads attached to a video with a type and position, the raw stream of
playback events (with enough on each event to detect a duplicate), and the derived daily
counts per video and per ad.

The question worth sitting with before you write any code: what actually identifies "the same
event" so a retried or duplicated submission can be recognised and discarded, and does your
answer survive a player that reloads mid-playback and resubmits from the start of its buffer?
Be ready to show the exact constraint or check that makes a duplicate a no-op rather than a
second count.

## 5. How it's exposed

Design the API surface — routes, methods, request/response shapes — however fits the workflow
above. There's no prescribed structure here; the requirements in §3 are the spec, not a
particular set of endpoints.

## 6. Things this POC will specifically be checked for

- Bad input — an event for a video or ad that doesn't exist, a malformed event type — should be
  rejected before it reaches your business logic.
- Every admin action (upload, attach/edit an ad, view the dashboard) requires a real
  authenticated admin user; there's no anonymous path into content management, even though the
  public player itself is intentionally unauthenticated.
- An admin cannot reach or edit another admin's video by guessing its ID if your design
  scopes videos to an owner — if you chose not to scope videos this way, be ready to explain
  why that's the right call for this domain.
- **This is the sharpest test in this POC: fire the same playback event at your ingestion
  endpoint twice (or more) and prove exactly one is counted.** Write a test that does this
  directly, not one that trusts the player to behave.
- The video hosting service is a stubbed external dependency — show what your system stores and
  what the player sees when that service is slow to respond, returns an error, or is briefly
  unavailable during upload or playback.
- The dashboard query needs to hold up at a large volume of events — it should never mean
  loading every raw event into memory to answer "impressions this month."
- Every playback event and every aggregation run should leave a structured trace — this is what
  you'd point to if a client disputed the numbers on their dashboard.
- The whole thing should come up with `docker compose up` and no manual setup beyond a
  documented `.env`.

## 7. Walkthrough questions to expect

NOTE: These are indicative questions only. Expect to be asked further questions in a similar
spirit during the walkthrough.

1. The public player can read but never write configuration. Show me the enforcement.
2. The same event arrives twice for one playback. Show me what stops double counting.
3. Playback events arrive out of order. What happens?

## 8. If you finish early (optional)

Don't add new features — deepen what's here:
- Simulate a burst of duplicate and out-of-order events for the same playback session and show
  your aggregation still lands on the correct counts.
- Add a second dashboard breakdown (by ad type, or by video) and show it doesn't require a
  different query shape or a new full scan.
- Load-test the dashboard query at a simulated million events and show the query plan and any
  indexes you added in response.

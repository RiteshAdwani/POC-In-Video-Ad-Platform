# FrameCue — React to Full Stack 201 Expansion Plan

How FrameCue, built for [React to Full Stack 101](../phase-1/in-video-ad-platform.md), grows to cover the
[201 syllabus](React-to-Fullstack-201.md) **phase by phase**, part-time alongside project work.

For each feature and task it covers the data model, endpoints, worker
and infra, frontend, tests and a "done when" check, plus where every
201 module lands.

Tags follow the 101 build plan. **[YOU]** marks core logic you write and can explain line by line;
the 201 rule is "explain every line you ship, with no assistant open". **[CLAUDE]** marks
scaffolding, wiring and UI around it.

---

## Contents

- [1. Baseline](#1-baseline)
- [2. Coverage matrix](#2-coverage-matrix)
- [3. Not a fit for this app](#3-not-a-fit-for-this-app)
- [4. Target shape (local, once Later 1 lands)](#4-target-shape-local-once-later-1-lands)
- [5. The 1.5-month plan](#5-the-15-month-plan)
- [6. Phase 0 — Testing, CI & debugging foundations](#6-phase-0--testing-ci--debugging-foundations)
- [7. Phase 1 — Sign-in, sessions & team access](#7-phase-1--sign-in-sessions--team-access)
- [8. Phase 2 — Campaign budgets, timezones & SQL performance](#8-phase-2--campaign-budgets-timezones--sql-performance)
- [9. Phase 3 — Self-hosted video upload & streaming](#9-phase-3--self-hosted-video-upload--streaming)
- [10. Phase 4 — Server-side ad insertion](#10-phase-4--server-side-ad-insertion)
- [11. Phase 5 — Observability & reliability](#11-phase-5--observability--reliability)
- [12. Later 1 — Live room & extras](#12-later-1--live-room--extras)
- [13. Later 2 — Ship to Azure](#13-later-2--ship-to-azure)
- [14. Small backend tasks](#14-small-backend-tasks)
- [15. If time permits](#15-if-time-permits)
- [16. Branches](#16-branches)
- [17. Walkthrough questions to prepare](#17-walkthrough-questions-to-prepare)

---

## 1. Baseline

| Area          | Today                                                                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend       | Express 5 + TypeScript, feature modules in `backend/src/modules/*`. Controllers call Prisma directly; services only in places; no DI.                                      |
| Data          | Postgres 18 + Prisma 7, UUIDv7 ids, 15 migrations, partial unique indexes for event dedup, `DailyCount` read model, `AggregationRun` log                                   |
| Auth          | `POST /auth/login` issues an HS256 JWT valid for 7 days, kept in `localStorage`. Admins exist only via seed. Authorization is ownership (`requireOwnership`, returns 404). |
| Video         | Cloudinary handles upload, transcode and hosting. Multer buffers up to 100 MB in memory first. The player swaps `<video src>` between ads and content.                     |
| Background    | In-process `setInterval`: video status poller and hourly aggregation scheduler                                                                                             |
| Cross-cutting | helmet, CORS allow-list, in-memory rate limits, pino, a static `/health`                                                                                                   |
| Tests / CI    | No automated tests; no CI                                                                                                                                                  |

Issues found during review, all fixed by a feature or small task below:

- `clickThroughUrl: z.url()` accepts `javascript:` and `data:` URLs, and the player opens that URL
  on "Visit site". → [Small task 2](#14-small-backend-tasks)
- `GET /videos/:id/status` writes to the DB, a side effect on a safe method. → removed by F2
  (status comes from the worker instead)
- Upload buffers the whole file in memory. → F2
- Day buckets are UTC midnight-to-midnight. → F5
- Rate limits, poller state and the scheduler live in process memory. → F2 / small tasks

---

## 2. Coverage matrix

The **Status** column describes the code today: ✅ already there · 🟡 partly there · ➕ not there
yet · ⛔ not a fit (see §3). **Lands in** names the phase (P0–P5 in the 1.5-month plan, or L1/L2 later) and the feature (F1–F7) or small
task (T1–T17, §14) that closes the gap. **Later** means it's in §15.

### 01 · Build the application half

| #    | Module                     | Status | Lands in                                                                                                                                                                                                                                           |
| ---- | -------------------------- | :----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1  | Server as a runtime        |   🟡   | **P0 T15**: server-side debugging (`--inspect`, attach to api and worker). **P3 F2**: streams, `pipeline()`, backpressure, Buffer, child processes (ffmpeg), client-abort handling. Worker threads come Later. Native addons and `cluster` are ⛔. |
| 1.2  | Project structure & config |  ✅🟡  | **P1 F1 / P3 F2**: new secrets and paths go through the Zod config; separate worker entrypoint. **P3 T9**: compose services.                                                                                                                       |
| 1.3  | HTTP / API design          |   🟡   | **P1 F1**: cookies, SameSite, CORS with credentials. **P2 T7**: OpenAPI. **P3 F2**: Range/206/416, content types, `Cache-Control`, ETag/304.                                                                                                       |
| 1.4  | Routing & middleware       |   🟡   | **P0 T3**: request context + correlation ID. **P3 F2**: streaming upload handling.                                                                                                                                                                 |
| 1.5  | Application architecture   |   🟡   | **P1 onward**: new modules built controller → service → repository. **P3 F2**: `VideoStorage`/`Transcoder` interfaces with fakes for tests.                                                                                                        |
| 1.6  | Relational data & SQL      |   🟡   | **P2 F5**: money types and CHECK constraints. **P2 T8**: `EXPLAIN ANALYZE` at 1M events, N+1 audit, pool sizing.                                                                                                                                   |
| 1.7  | Migrations                 |  ✅🟡  | **P1 F1**: admins → users + identities. **P1 F4**: expand-and-contract into workspaces. **L2 F7**: migrations as a pipeline stage.                                                                                                                 |
| 1.8  | Transactions & concurrency |   🟡   | **P1 F1**: two tabs refreshing at once. **P1 F4**: audit row in the same transaction. **P2 F5**: atomic budget spend, lost-update race.                                                                                                            |
| 1.9  | Authentication             |   🟡   | **P1 F1**, fully.                                                                                                                                                                                                                                  |
| 1.10 | Authorization              |   🟡   | **P1 F1**: account linking. **P1 F4**: roles, workspaces (tenancy), denied and wrong-tenant tests. API keys come Later.                                                                                                                            |
| 1.11 | Querying at scale          |   🟡   | **P2 T10**: cursor pagination. Full-text search comes Later.                                                                                                                                                                                       |
| 1.12 | Time, money, locale        |   🟡   | **P2 F5**, fully.                                                                                                                                                                                                                                  |
| 1.13 | Audit trails               |   🟡   | **P1 F4**, fully.                                                                                                                                                                                                                                  |
| 1.14 | Server testing             |   🟡   | **P0 T1** builds the suite (harness + unit tests, event-integrity and authorization tests, hosting abstraction with a fake). Every feature adds failure-path tests: a fake OIDC provider (F1), a fake transcoder (F2), pure stitching tests (F3).  |
| 1.15 | Document databases         |   ⛔   | —                                                                                                                                                                                                                                                  |
| 1.16 | Caching                    |   ➕   | **P3 T6**: Redis rate limits. **P4 F3**: stitched playlists cached with versioned keys and a stampede guard.                                                                                                                                       |

### 02 · Ship it and support it

| #    | Module                      | Status | Lands in                                                                                                                                                                                                                                                 |
| ---- | --------------------------- | :----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1  | Logging                     |   🟡   | **P0 T3**: correlation ID. **P1 F1**: token redaction. **P5 T12**: sampling, PII rules. **L2 F7**: KQL in App Insights.                                                                                                                                  |
| 2.2  | Telemetry & tracing         |   ➕   | **P5 T11**: OpenTelemetry tracing browser → api → worker in Jaeger. **L2 F7**: App Insights.                                                                                                                                                             |
| 2.3  | Health & alerting           |   🟡   | **P3 T4**: liveness/readiness. **P5 T12**: SLOs, symptom alerts, runbooks. **L2 F7**: Azure alert rules.                                                                                                                                                 |
| 2.4  | Resilience                  |   🟡   | **P3 F2**: ffmpeg timeouts, job retries, graceful worker shutdown. **P5 T14**: circuit breaker, jittered retries, DB statement timeouts.                                                                                                                 |
| 2.5  | Idempotency                 |  ✅🟡  | **P2 F5**: charge once per deduplicated impression. **P3 T5**: upload idempotency key. **P3 F2**: idempotent jobs. **P3 T16**: transactional outbox + deduplicating consumers.                                                                           |
| 2.6  | Security                    |   🟡   | **P0 T1**: dependency and image scanning. **P0 T2**: URL scheme fix. **P1 F1**: CSRF, cookie flags, linking takeover. **P3 F2**: upload validation. **P5 T17**: PII classification, retention, encryption in transit/at rest. **L2 F7**: Key Vault, TLS. |
| 2.7  | Performance                 |   ➕   | **P2 T8**: query plans. **P3 F2**: flat-memory upload, event-loop lag. **P5 T13**: k6 load tests, p50/p95/p99, profiling.                                                                                                                                |
| 2.8  | Background processing       |   🟡   | **P3 F2**: BullMQ worker, retries, dead-letter queue, competing consumers, versioned message contracts, queues vs topics.                                                                                                                                |
| 2.9  | Scheduled work              |   🟡   | **P3 T6**: aggregation becomes a repeatable job with a lock.                                                                                                                                                                                             |
| 2.10 | Docker                      |  ✅🟡  | **P3 T9**: worker image with ffmpeg, `HEALTHCHECK`, layer order, SHA tags.                                                                                                                                                                               |
| 2.11 | CI/CD                       |   ➕   | **P0 T1**: CI. **L2 F7**: CD with promotion, approval, canary, rollback.                                                                                                                                                                                 |
| 2.12 | File processing & reporting |   🟡   | **P3 F2**: streaming large files, validation, cleanup and retention.                                                                                                                                                                                     |
| 2.13 | Notifications & email       |   ➕   | Later. F4 invites use copy-paste links, so no email service is needed.                                                                                                                                                                                   |
| 2.14 | Real-time                   |   ➕   | **L1 F6**: SSE, `Last-Event-ID` reconnect, Redis backplane, cookie-authenticated stream.                                                                                                                                                                 |
| 2.15 | Third-party integration     |   🟡   | **P1 F1**: Google and Microsoft as partners (outages, sandbox vs prod apps, testing without hitting them). Webhooks come Later.                                                                                                                          |
| 2.16 | Azure identity & secrets    |   ➕   | **P1 F1**: Entra app registration, scopes, app roles. **L2 F7**: managed identity, Key Vault references, rotation.                                                                                                                                       |
| 2.17 | Azure compute & data        |   ➕   | **L2 F7**: Container Apps (scale rules, revisions, ingress), Postgres Flexible Server (tier, HA, backups), private endpoints.                                                                                                                            |
| 2.18 | Azure storage & edge        |   ➕   | **P3 F2** builds the "stream it yourself" version. **L2 F7**: Blob + SAS direct upload, CDN, lifecycle policies, Event Grid.                                                                                                                             |

### 03 · Design it

| #   | Module                      | Status | Lands in                                                                                                       |
| --- | --------------------------- | :----: | -------------------------------------------------------------------------------------------------------------- |
| 3.1 | Distributed systems         |   🟡   | **P3/P4**: consistency between api, worker and Redis; at-least-once jobs. Covered in an ADR.                   |
| 3.2 | Event-driven architecture   |   🟡   | Already: raw events → `DailyCount`. **P3 T16**: outbox. **L1 F6**: pub/sub fan-out.                            |
| 3.3 | Data architecture           |   🟡   | **P1 F4**: tenancy at the data tier.                                                                           |
| 3.4 | Scalability                 |   🟡   | **P3 F2**: transcoding moved off the API. **L1 F6**: two API instances behind a Redis backplane.               |
| 3.5 | Availability & DR           |   ➕   | **L2 F7**: RTO/RPO, backup + restore drill, degradation order.                                                 |
| 3.6 | Security architecture       |   ➕   | **L1**: STRIDE threat model of the public surfaces (events, media, OAuth callback).                            |
| 3.7 | Decomposition & integration |   🟡   | api + worker from one codebase (modular monolith). An ADR covers why not microservices.                        |
| 3.8 | Migration & modernization   |   ➕   | **P3 F2**: Cloudinary → own pipeline, strangler-style. **L2 F7**: local disk → Blob behind the same interface. |
| 3.9 | Trade-offs & leadership     |   🟡   | One ADR per feature in `docs/adr/` (options, criteria, rejected alternatives).                                 |

**AI-assisted engineering:** already practised (spec-first build plan, the `[YOU]`/`[CLAUDE]`
split, `frontend/CLAUDE.md`). **P0** adds `backend/CLAUDE.md` and a `docs/ai-log.md` that records
what the assistant got wrong and what changed.

**Result:** P0–P5 cover about 24 of the 28 build-and-ship Core modules. The
Azure-shaped ones (2.11 CD, 2.16–2.18) wait for L2. After L1 and L2, every Core module that fits
the app is covered; the only exclusions are MongoDB and the topics in §3.

---

## 3. Not a fit for this app

| Topic                                                                                    | Why it stays out                                                                                               |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1.15 Document databases                                                                  | Everything is relational with strict integrity (FKs, dedup indexes). Mongo would be polyglot for its own sake. |
| 1.1 Native addons, `cluster`                                                             | No workload needs C++ bindings. Scaling comes from container instances, not `cluster`.                         |
| 2.13 SMS / push                                                                          | No mobile client                                                                                               |
| 2.14 Presence & rooms                                                                    | No collaborative surface                                                                                       |
| 2.16 On-behalf-of flow                                                                   | The API never calls a downstream API on a user's behalf.                                                       |
| 2.17 Cosmos DB, 2.18 API Management                                                      | Postgres stays the system of record, and there's one API with one client.                                      |
| 3.1 consensus, 3.4 sharding, 3.5 multi-region, 3.2 event sourcing/sagas, 3.7 BFF/gateway | A single-region modular monolith with one SPA. These are design write-ups at most.                             |

---

## 4. Target shape (local, once Later 1 lands)

```
 Browser (React SPA + hls.js)
    │  cookie session          ┌───────────────── docker compose ─────────────────┐
    ├─────────────────────────▶│ api   (Express)                                   │
    │  HLS playlists/segments  │   auth · OAuth callbacks · admin CRUD             │
    │  SSE /stream             │   public playback + stitched playlists · events   │
    │                          │   media streaming (Range/206)                     │
    │                          │        │ enqueue             ▲ pub/sub           │
    │                          │        ▼                     │                   │
    │                          │ redis (BullMQ · cache · rate limits · pub/sub)    │
    │                          │        │                                          │
    │                          │        ▼                                          │
    │                          │ worker (ffmpeg transcode · ad-break analysis ·    │
    │                          │         aggregation · cleanup)                    │
    │                          │        │                                          │
    │                          │ postgres          media volume (source + HLS)    │
    │                          └───────────────────────────────────────────────────┘
    │
    └──▶ Google / Microsoft (OIDC)
```

Cloudinary stays wired in only for legacy videos until they're re-processed, and then it's
removed.

---

## 5. The 1.5-month plan

### Budget

**15–20 hours a week ≈ 6–8 evenings of 2.5 hours.** The plan needs **about 57 evenings**:

- at **20 h/week**, about 7 weeks, just over 1.5 months (done around 5 Jan)
- at **17.5 h/week**, about 8 weeks (done around 12 Jan)
- at **15 h/week**, use the cut list below

The order follows the course's own priority (_"data correctness, permissions and failure — not
syntax"_), and the learning curve rises gently from phase to phase. Streaming ads come straight
after the video pipeline, while the HLS context is fresh. Every phase leaves the app shippable.

| Phase                                                | Contents                             | Why at this point                                                                                       | Evenings |
| ---------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------- | :------: |
| **P0** Testing, CI & debugging foundations           | T1, T2, T3, T15                      | Easiest, and it protects every later change                                                             |   6.5    |
| **P1** Sign-in, sessions & team access               | F1, F4                               | Authorization is the course's **"highest risk"** module, and it builds on the auth you already know     |    16    |
| **P2** Campaign budgets, timezones & SQL performance | F5, T7, T8, T10                      | SQL is the course's **"largest gap"**; money, time and concurrency are its "durable mistakes"           |    9     |
| **P3** Self-hosted video upload & streaming          | F2 (slices a–d), T4, T5, T6, T9, T16 | The steepest runtime concepts; adds the Redis + worker foundation and the outbox                        |   14.5   |
| **P4** Server-side ad insertion                      | F3                                   | Videos are streamed, so the ads are stitched into the same stream while HLS is fresh                    |    6     |
| **P5** Observability & reliability                   | T11, T12, T13, T14, T17              | Tracing, SLOs, load tests, resilience and data-security hygiene across api, worker and stitched streams |   5.5    |
| **Total**                                            |                                      |                                                                                                         | **≈ 57** |

### Week by week

Assumes a start in the week of **16 Nov 2026** at about 7 evenings a week (17.5 h). At 20 h/week,
each row finishes a little earlier, and P5 lands around 5 Jan.

| Week | Dates        | Work                                                                                                                     | Milestone                         |
| :--: | ------------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
|  1   | 16–22 Nov    | P0: T1 test suite (3 PRs) + CI, T2 URL fix, T3 request IDs, T15 debugging setup · start F1a                              | Tests + CI block bad PRs          |
|  2   | 23–29 Nov    | F1a `User` + `Identity` · F1b cookie sessions + refresh · F1c Google · start F1d                                         | Google sign-in works              |
|  3   | 30 Nov–6 Dec | F1d Microsoft · F1e connected accounts · F4a workspaces + roles · F4b migration into workspaces · start F4c              | Three ways to sign in; workspaces |
|  4   | 7–13 Dec     | F4c history tab (**P1 done**) · F5a campaigns · F5b budget auto-stop · F5c workspace timezone                            | Exact spend under concurrency     |
|  5   | 14–20 Dec    | T8 SQL at scale · T10 cursor pagination · T7 API docs (**P2 done**) · F2a streamed upload · start F2b                    | Upload streams to disk            |
|  6   | 21–27 Dec    | F2b worker + ffmpeg with versioned job contracts (with T9) · F2c HLS playback · F2d failure handling · start T16         | YouTube-style playback            |
|  7   | 28 Dec–3 Jan | T16 outbox · T6 Redis jobs · T5 upload idempotency · T4 health probes (**P3 done**) · F3a playlist stitching · start F3b | Ads start appearing in the stream |
|  8   | 4–10 Jan     | F3b ad markers + event tracking · F3c cached playlists (**P4 done**) · T11 tracing · T12 SLOs · T13 k6                   | Ads inside the stream             |
|  8½  | 11–12 Jan    | T14 resilience · T17 data classification                                                                                 | **P5 done**                       |

**Risk:** week 6 is Christmas week. If it's lost, everything shifts by a week.

### Cut line, if you're running at the 15 h end

About 39 evenings fit in 6.5 weeks at 15 h/week. Drop these in this order; each moves to Later 1.

1. T7 API docs (1)
2. F1d Sign in with Microsoft (1.5). Google alone still teaches OAuth/OIDC fully.
3. F1e Connected accounts page (1.5). The linking rules stay in F1c's logic.
4. T10 cursor pagination (1)
5. F3c cached playlists (1). Serve the stitched playlist uncached for now.

That saves about 6 evenings. **P5 should not be cut:** it holds four Core modules (2.2, 2.3,
2.4, 2.7). At the 15 h pace it lands about 1–1.5 weeks after the 1.5-month mark, which is better
than skipping it.

### Coverage when P0–P5 are done

| Course stage             | Covered                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **01** Core (14 modules) | All 14. Small parts wait for later: worker threads (1.1), full-text search (1.11), API keys (1.10).                                |
| **01** As needed         | 1.16 caching ✅ (stitched playlists, Redis rate limits)                                                                            |
| **02** Core (14 modules) | 2.1–2.10 covered. 2.11 has CI only, with CD waiting for Azure. 2.16 has Entra sign-in only. **2.17 and 2.18 wait for Azure (L2).** |
| **02** As needed         | 2.12 file processing ✅ · 2.15 third-party integration via the OAuth providers 🟡 · 2.13 email and 2.14 real-time come later       |
| **03** Design            | Through ADRs, one per feature. The threat model comes in L1.                                                                       |

So about **24 of the 28 build-and-ship Core modules** are covered. The remaining four are
Azure-specific and wait until costs are clear.

### Later

- **L1 — Live room & extras:** F6 live campaign room (SSE + Redis backplane), F2e smart ad breaks,
  threat model. About 7 evenings, or 1 week at the same pace.
- **L2 — Ship to Azure:** F7. On hold until costs are clear. A trimmed "developer's Azure" (deploy,
  managed identity + Key Vault, Blob SAS upload, App Insights + a simple deploy) is about 8
  evenings.

---

## 6. Phase 0 — Testing, CI & debugging foundations

**Covers:** 1.4, 1.14, 2.1, 2.6, 2.11 · **Learning curve:** low

Detail for each task is in §14. Do them in this order:

1. **T1: tests + CI + scanning.**
   - Build the backend suite in three PRs:
     1. Harness + unit tests.
     2. Event-integrity and authorization integration tests against a real database.
     3. A `VideoHostingService` abstraction with a fake, plus upload and processing failure tests.
   - Add GitHub Actions: lint → typecheck → backend tests against a `postgres:18` service → build
     → `npm audit --omit=dev` → Trivy image scan. Turn on Dependabot.
2. **T2: URL fix.** `clickThroughUrl` is accepted only with `http:`/`https:`, and the player checks
   the protocol before `window.open`. The first test written under the new CI proves
   `javascript:alert(1)` is rejected.
3. **T3: request context.** Use `AsyncLocalStorage`. An `X-Request-Id` arrives or is generated, is
   echoed back, and is stamped on every log line. F1 later adds the user to the same context.
4. **T15: debugging setup.** A compose override runs api and worker with `--inspect`
   (`9229`/`9230`), and `.vscode/launch.json` attaches to either. Put a breakpoint inside a live
   request and inside a running job, and take one heap snapshot. You'll use this daily from P1
   onward (1.1, "server-side debugging").
5. Add `backend/CLAUDE.md` and `docs/ai-log.md`.

**Done when:** a failing test blocks a PR, and one request ID can be followed through the logs.

---

## 7. Phase 1 — Sign-in, sessions & team access

**Covers:** 1.3, 1.7, 1.8, 1.9, 1.10, 1.13, 2.6, 2.15, 2.16, 3.3 · **Learning curve:** moderate

F1 first: it replaces `Admin` with `User` + `Identity` and introduces cookie sessions, which F4,
and later F6, build on. F4 then adds workspaces, roles and history on top.

### F1 — Sign-in: email + Google + Microsoft, with refresh tokens

**Covers:** 1.3, 1.7, 1.8, 1.9, 1.10, 2.6, 2.15, 2.16 · **Slices:** 5

#### Data model

- [YOU] Rename `Admin` → `User` (migration with `@@map` kept stable). `passwordHash` becomes
  nullable, because OAuth-only users have no password. Add `emailVerifiedAt`.
- [YOU] `Identity { id, userId, provider: GOOGLE | MICROSOFT, providerUserId, email, emailVerified,
createdAt, lastLoginAt }`, unique on `(provider, providerUserId)`. Users are **keyed by the
  provider's `sub`, never by email**.
- [YOU] `RefreshToken { id, userId, familyId, tokenHash, expiresAt, revokedAt, replacedById,
userAgent, createdAt }`. Only a SHA-256 hash of the token is stored.

#### Endpoints

| Method + path                                 | Purpose                                                                                                                                                             |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/login`                            | Email + password. Returns an access token in the body and sets the refresh cookie.                                                                                  |
| `POST /auth/refresh`                          | Rotates the refresh token and returns a new access token.                                                                                                           |
| `POST /auth/logout` / `POST /auth/logout-all` | Revokes the current token family / every family for the user.                                                                                                       |
| `GET /auth/me`                                | The current user and their linked identities.                                                                                                                       |
| `GET /auth/oauth/:provider/start`             | Generates `state`, `nonce` and a PKCE verifier, stores them in a short-lived signed httpOnly cookie, and redirects to the provider.                                 |
| `GET /auth/oauth/:provider/callback`          | Validates `state`, exchanges the code with the PKCE verifier, validates the ID token, applies the linking rules, sets the refresh cookie, and redirects to the SPA. |
| `POST /auth/identities/:provider/link`        | Starts the same flow while already logged in, to link an extra provider.                                                                                            |
| `DELETE /auth/identities/:id`                 | Unlinks a provider. Blocked if it's the last way to sign in.                                                                                                        |

#### Token design

- **Access token:** JWT valid for about 10 minutes, held **in memory** on the frontend, never in
  `localStorage`.
- **Refresh token:** opaque random value in an `HttpOnly; Secure; SameSite=Lax;
Path=/api/v1/auth` cookie. On page reload the SPA calls `/auth/refresh` to get a fresh access
  token.
- **Rotation + reuse detection** [YOU]: each refresh issues a new token and marks the old one as
  replaced. Presenting an already-replaced token revokes the **whole family**, because it means
  someone else holds a copy.
- **The two-tabs race** [YOU]: two tabs refresh at the same moment with the same token. Naive reuse
  detection then logs the real user out. Handle it with a short grace window (about 30 s): within
  it, the old token returns the same successor instead of tripping reuse detection. This is the
  course's "two browser tabs" warning (1.8) made concrete.
- **CSRF:** `SameSite=Lax`, a refresh cookie scoped to the auth path, and an `Origin` check on
  `/auth/*`. An ADR explains why Bearer access tokens need no CSRF token.

#### Account-linking rules [YOU]

| Situation                                   | Behaviour                                                                                                                                                                        |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity `(provider, sub)` already exists   | Sign in as its user                                                                                                                                                              |
| New identity, no user has that email        | Create the user and identity                                                                                                                                                     |
| New identity, a user with that email exists | **No auto-link.** Show "An account with this email exists. Sign in with your existing method to link Google." Linking happens only from a logged-in session.                     |
| Provider email not verified                 | Never used to match or link. Google exposes `email_verified`. For Microsoft, treat `email` as unverified unless the `xms_edov` optional claim says the domain owner verified it. |
| User changes their email at the provider    | Nothing breaks, because identities are keyed on `sub`.                                                                                                                           |
| Unlink the last sign-in method              | Blocked with 409                                                                                                                                                                 |

#### Provider notes

- Use the `openid-client` library for discovery, PKCE, JWKS caching and ID-token validation
  (`iss`, `aud`, `exp`, `nonce`).
- **Microsoft multi-tenant gotcha:** with the `common` endpoint, the issuer contains the user's
  tenant ID, so it has to be validated against the `tid` claim, not compared as a fixed string.
- **Separate OAuth apps for dev and prod** (sandbox vs production credentials, 2.15). Redirect URIs
  must match exactly.
- If a provider is down, its button shows "Google sign-in is unavailable right now" and the other
  methods keep working.

#### Config

Add `GOOGLE_CLIENT_ID/SECRET`, `MICROSOFT_CLIENT_ID/SECRET/TENANT`, `OAUTH_REDIRECT_BASE_URL` and
`COOKIE_SECRET`, all validated by Zod at startup and documented in `.env.example`.

#### Frontend [CLAUDE]

- Remove the token from `localStorage`. The access token lives in the auth context, and Axios
  sends `withCredentials` for `/auth/*`.
- Refresh on 401 with a **single in-flight refresh promise**, so ten parallel 401s cause one
  refresh, not ten.
- Login page gets "Continue with Google" and "Continue with Microsoft". A `/auth/callback` route
  handles errors.
- **Connected accounts** page under settings: linked providers, link and unlink buttons, and active
  sessions with "log out everywhere".

#### Production cookie gotcha

The frontend and backend run on different domains on Render, and browsers block third-party
cookies. Fix it with same-site subdomains (`app.example.com` / `api.example.com`) or by proxying
`/api` through the frontend host. Locally, `localhost:5173` → `localhost:8000` is already the same
site.

#### Tests

Use `oauth2-mock-server` as a fake OIDC provider, so tests never hit Google or Microsoft (2.15).
Cases:

- `state` mismatch → rejected
- `nonce` mismatch → rejected
- Expired or wrong-`aud` ID token → rejected
- Unverified email → not linked
- Unlinking the last method → 409
- Refresh reuse → the whole family is revoked
- Two concurrent refreshes within the grace window → both succeed
- Logout → the refresh token no longer works

#### Done when

You can sign in with any of the three methods. Linking and unlinking follow the rules table.
Reusing a stolen refresh token logs out every session in that family. There's no token in
`localStorage`.

---

### F4 — Team roles + change history

**Covers:** 1.7, 1.8, 1.10, 1.13, 3.3 · **Slices:** 3

#### a. Workspaces + roles [YOU]

- `Workspace { id, name, timezone, currency }` and
  `Membership { workspaceId, userId, role: OWNER | EDITOR | VIEWER }`.
- A first-time OAuth user from F1 gets a personal workspace.
- **Invites without email:** `Invite { workspaceId, role, tokenHash, expiresAt, acceptedAt }`. The
  owner copies a one-time link, and accepting it requires being signed in.
- The session carries the active `workspaceId`. A `requireRole('EDITOR')` middleware handles route
  access, and services re-check resource-level rules.
- Wrong workspace → **404** (keeps the 101 stance of not revealing existence). Wrong role → **403**.

#### b. Expand-and-contract migration [YOU] (1.7)

Each step is its own migration and deploy, and the app keeps working between steps.

1. Expand: add nullable `workspace_id` to `videos` and `advertisements`.
2. Backfill: one workspace per existing user.
3. Dual-write: new rows set both columns.
4. Contract: `workspace_id NOT NULL`, reads switch to workspace scope, and `admin_id` becomes
   `created_by_id`.

#### c. Audit trail + History tab [YOU] (1.13)

- `AuditLog { id, workspaceId, actorId, action, entityType, entityId, before jsonb, after jsonb,
requestId, createdAt }`, written **in the same transaction** as the change, from the service layer.
- **Append-only:** a DB trigger raises an error on `UPDATE` or `DELETE`. The app role has no
  delete grant on the table.
- [CLAUDE] History tab on video and ad pages, showing a field-level before → after diff.
- An ADR explains why an audit trail ≠ application logs.

#### Tests

A role × action × own/other-workspace matrix. Each cell asserts the status code **and** that the DB
row didn't change. An audit row's `before`/`after` matches the edit, and an audit row can't be
updated.

#### Done when

A Viewer can't edit through the UI or the API. Bob's workspace can't see Alice's videos. Every
edit shows up in History.

---

## 8. Phase 2 — Campaign budgets, timezones & SQL performance

**Covers:** 1.3, 1.6, 1.8, 1.11, 1.12, 2.5, 2.7 · **Learning curve:** moderate, pure backend logic

F5 is the centrepiece. T7, T8 and T10 are one-evening tasks that fill the rest of the SQL and API
topics. Their detail is in §14.

### F5 — Campaigns with budgets

**Covers:** 1.6, 1.8, 1.12 · **Slices:** 3

#### a. Campaign CRUD + spend [YOU]

- `Campaign { id, workspaceId, name, advertiserName, startDate date, endDate date,
currency char(3), cpmMinor bigint, dailyBudgetMinor bigint, status }`, plus
  `Advertisement.campaignId`.
- **Money rules** (1.12): integer **minor units** only, never floats. A `Money` value object handles
  add and multiply-and-round with one documented rounding rule. The currency exponent comes from ISO
  4217 (JPY 0, USD 2, KWD 3). Display uses `Intl.NumberFormat`.
- CHECK constraints: `cpm_minor > 0`, `end_date >= start_date` (1.6).

#### b. Auto-stop on budget [YOU] (1.8)

- `CampaignSpend { campaignId, spendDate, impressions, spentMinor }`, unique on
  `(campaignId, spendDate)`.
- Each **newly accepted** `AD_SHOWN` charges `cpm / 1000`. A deduplicated repeat never charges
  twice, which reuses the 101 dedup guarantee.
- One atomic statement:
  `UPDATE … SET spent_minor = spent_minor + $c WHERE … AND spent_minor + $c <= $daily RETURNING …`.
  Zero rows means the budget is exhausted, so the campaign flips to "Budget reached" and its ads
  drop out of the playback config (and, once SSAI lands in Phase 4, out of the stitched playlist via a cache-key bump).
- A test shows the **lost update** from naive read-modify-write under 100 concurrent requests, then
  that the atomic version is exact.

#### c. Workspace timezone [YOU] (1.12)

- Aggregation buckets by the workspace's local day:
  `date_trunc('day', occurred_at AT TIME ZONE ws.timezone)`. Campaign dates are **date-only** and
  inclusive in that timezone. Spend resets at local midnight.
- Changing the timezone re-runs aggregation for the affected days through the existing aggregation service (it moves onto the worker in Phase 3).
- Tests: America/New_York 23- and 25-hour DST days, Asia/Kolkata (+05:30), and an event at
  23:59:59.999 local time.

#### Done when

1,000 concurrent impressions against a budget that fits 500 charge exactly 500. "Today" matches the
admin's clock across a DST change.

### Phase 2 small tasks

- **T8 SQL at scale:** a 1M-event seed using `COPY`, then `EXPLAIN (ANALYZE, BUFFERS)` of the
  dashboard and aggregation queries saved in `docs/perf/`. Also: an N+1 audit through Prisma query
  logging, and pool sizing written down. Covers the 101 brief's §8 stretch goal and 201's "largest
  gap".
- **T10 Cursor pagination** on the public catalog's infinite scroll.
- **T7 OpenAPI docs** at `/api/docs`, generated from the Zod schemas.

---

## 9. Phase 3 — Self-hosted video upload & streaming

**Covers:** 1.1, 1.3, 1.4, 1.5, 1.16, 2.3, 2.4, 2.5, 2.7, 2.8, 2.9, 2.10, 2.12, 3.4, 3.8 · **Learning
curve:** steep. This is the biggest phase for new runtime concepts.

Redis and the worker arrive here, so T6 and T9 come along with them. T4 and T5 follow once the
pipeline works.

### F2 — Self-hosted video pipeline

**Covers:** 1.1, 1.3, 1.4, 1.5, 2.4, 2.5, 2.6, 2.7, 2.8, 2.12, 3.4, 3.8 · **Slices:** a–d in P3; e in Later 1

#### Data model

- [YOU] `Video` gains:
  - `storageProvider: CLOUDINARY | LOCAL`
  - `sourceKey`, `hlsMasterKey`, `thumbnailKey`
  - `durationMs`, which replaces the float `durationSeconds` (a migration exercise)
  - `processingError`, `processingProgress`
  - status `UPLOADING | PROCESSING | READY | FAILED`
- [YOU] `AdBreakSuggestion { id, videoId, offsetMs, reason: SCENE_CHANGE | SILENCE, score }` for
  slice e.

#### Storage abstraction [YOU]

- A `VideoStorage` interface: `createWriteStream(key)`, `createReadStream(key, { start, end })`,
  `stat(key)`, `deletePrefix(prefix)`.
- First implementation: `LocalDiskStorage` on a Docker volume shared by api and worker. Azure Blob
  later implements the same interface.
- Key layout: `videos/{videoId}/source`, `videos/{videoId}/hls/master.m3u8`,
  `videos/{videoId}/hls/{360p|720p}/index.m3u8 + seg_00001.ts…`,
  `videos/{videoId}/thumb.jpg`.

#### a. Streamed upload [YOU]

- `POST /videos` parses multipart with **`busboy`** (replacing multer's `memoryStorage`) and
  `pipeline(fileStream, sizeLimiter, storage.createWriteStream(key))`. Memory stays flat
  regardless of file size, because `pipeline` applies backpressure.
- A size-limit transform counts bytes and aborts the request mid-stream past the cap. The partial
  file is deleted, which is the failure-cleanup path.
- **Magic-byte check** on the first chunk (MP4 `ftyp`, WebM/Matroska `1A45DFA3`). The
  `Content-Type` header is never trusted.
- Respond **202** with the video in `PROCESSING`. The video row and a `video.uploaded` **outbox**
  row are written in one transaction (T16). The relay then enqueues the `transcode` job with
  `jobId = videoId`, so a duplicate enqueue is a no-op. Until T16 lands, enqueue directly after the
  commit and note the gap.

#### b. Worker + transcode [YOU]

- New entrypoint `src/worker.ts`: a separate process from the same codebase, running BullMQ on
  Redis.
- **Versioned message contracts** (2.8): every job payload is `{ v: 1, type, payload }`, validated
  by a Zod schema per version. During a rollout, consumers accept `v1 | v2`, so old and new API
  instances can enqueue side by side.
  - ADR: **queues vs topics**. A queue (BullMQ) means one consumer handles each job. A topic
    (Redis pub/sub, in L1) means every subscriber gets each message.
- `transcode` processor:
  1. `ffprobe` validates that it's a real video and reads its duration.
  2. `spawn('ffmpeg', args)` builds an args array with **no shell**, so a crafted filename can't
     inject commands. It produces HLS with 6-second segments in two renditions (360p, 720p), a
     master playlist and a thumbnail.
  3. Progress is parsed from ffmpeg's stderr → `job.updateProgress()` → shown in the UI (live in F6).
- Guards: a hard timeout kills ffmpeg after N minutes. Retries back off (3 attempts), then the job
  goes to a **dead-letter** state and the video to `FAILED` with a reason.
- **Graceful shutdown:** on SIGTERM the worker stops taking jobs, lets the current ffmpeg finish or
  kills it after a grace period, and the job is retried cleanly.
- The old `lib/videoPoller.ts` and `GET /videos/:id/status` go away for local videos, because
  status now comes from the worker.

#### c. Streaming playback [YOU]

- `GET /api/v1/public/media/:videoId/*path` streams files from storage.
  - **Range requests:** parse `Range` → `206 Partial Content` with `Content-Range`. Invalid →
    `416`.
  - Correct `Content-Type`: `application/vnd.apple.mpegurl`, `video/mp2t`, `image/jpeg`.
  - `pipeline(readStream, res)`. When the **client aborts** (closes the tab), the read stream is
    destroyed, so no file descriptors leak.
  - Caching: segments are immutable (`Cache-Control: public, max-age=31536000, immutable`).
    Playlists are short-lived (`max-age=10`) with an ETag → 304.
  - Path traversal guard: the path is resolved and must stay under `videos/{videoId}/`.
- The playback config returns `hlsUrl` for local videos and the Cloudinary URL for legacy ones.
- [CLAUDE] The player attaches **`hls.js`** to the existing `<video>` element (Safari plays HLS
  natively). A quality menu offers Auto / 360p / 720p. The current client-side ad engine stays
  unchanged until F3.

#### d. Failure handling [CLAUDE + YOU]

- Admin UI: progress bar, a "Transcode failed: reason" banner, and a **Retry** button that
  re-enqueues the job (same `jobId` dedupe).
- A crashed worker mid-job leaves BullMQ to mark the job stalled and retry it. The output folder is
  cleared before a retry, so the job is idempotent.
- Retention: the source file is deleted N days after READY by a cleanup job.

#### e. Smart ad breaks [YOU] (Later 1)

- Extra worker step: `ffmpeg -vf "select='gt(scene,0.4)',showinfo"` finds scene changes, and
  `-af silencedetect` finds silences. Points where both line up score highest. Results are stored
  as `AdBreakSuggestion` rows.
- [CLAUDE] The placement modal shows suggestion markers on the timeline. Accepting one creates a
  mid-roll at that offset, and the existing placement rules still apply.

#### Legacy migration (3.8, strangler fig)

1. Existing Cloudinary videos keep `storageProvider = CLOUDINARY` and keep playing.
2. An admin "Re-process" action downloads the Cloudinary source into the new pipeline.
3. Once every video is local, Cloudinary code and env vars are removed.

#### Infra [CLAUDE]

Compose adds `redis` and `worker` (an image with ffmpeg, e.g. `node:22-bookworm-slim` +
`apt-get install ffmpeg`), plus a `media` named volume mounted in api and worker.

#### Measure (2.7)

- Heap usage while uploading a 1 GB file: the line should stay flat.
- Event-loop lag on the API while the worker transcodes: unaffected, which is the point of the
  worker.
- Throughput of 20 concurrent players.

Record the numbers in the PR and the ADR.

#### Tests

- Upload over the size limit → aborted, partial file removed.
- Non-video bytes → 415.
- A `FakeTranscoder` for API tests, plus **one real ffmpeg test** on a 3-second sample (CI
  installs ffmpeg).
- Range `bytes=0-99` → 206 with exactly 100 bytes; bad range → 416.
- Path traversal (`../`) → 404.
- A duplicate enqueue creates one job.
- A killed job retries and produces a clean output folder.

#### ADR

Why HLS, why serve through Node first, and when to move to Blob + CDN with signed URLs ("large
files never transit your API", 2.18).

#### Done when

A 1 GB upload keeps memory flat. Videos play in adaptive 360p/720p from FrameCue's own server.
Killing the worker mid-transcode recovers on its own. Legacy Cloudinary videos still play.

### Phase 3 small tasks

- **T9 Docker hardening:** a worker image with ffmpeg, cache-friendly layer order, `HEALTHCHECK`,
  and SHA tags. It ships with F2 slice b.
- **T6 Redis jobs:** rate limits move into Redis, and the hourly aggregation becomes a repeatable
  BullMQ job with a lock, so two instances never both run it.
- **T5 Upload idempotency:** an `Idempotency-Key` header on `POST /videos` and
  `POST /advertisements`.
- **T4 Health probes:** `/health/live` and `/health/ready`, checking the DB, Redis and the worker
  heartbeat.
- **T16 Transactional outbox** (2.5, 3.2) [YOU]. Fixes the dual-write bug: the video row commits,
  then Redis is down, and the transcode job is never enqueued, leaving the video stuck in
  `PROCESSING` forever.
  - `outbox { id, type, payload jsonb, createdAt, publishedAt }` is written in the **same
    transaction** as the state change. First events: `video.uploaded`, then
    `placement.changed` (P4 uses it to invalidate stitched playlists).
  - A relay in the worker polls `SELECT … FOR UPDATE SKIP LOCKED`, publishes to BullMQ, and sets
    `publishedAt`. Two relays never send the same row.
  - Delivery is at-least-once, so consumers deduplicate by outbox `id` (an inbox table, or the
    job's `jobId`).
  - Test: stop Redis, upload a video, start Redis. The job still runs, exactly once.

---

## 10. Phase 4 — Server-side ad insertion

**Covers:** 1.3, 1.14, 1.16, 3.2 · **Learning curve:** steep, building directly on Phase 3

Once ffmpeg produces HLS for videos, ad creatives go through the same ladder and get stitched into the stream. Doing it right after P3 keeps the HLS and `hls.js` context fresh.

### F3 — Server-side ad insertion (SSAI)

**Covers:** 1.3, 1.14, 1.16, 3.2 · **Slices:** 3 · **Starts after** F2 is stable

#### a. Playlist stitching [YOU]

- Video ad creatives go through the **same transcode ladder** (same resolutions, codec and segment
  length). That reuses the F2 worker.
- `GET /public/videos/:id/master.m3u8` returns a master playlist whose media playlists are
  **stitched**:
  - Pre-roll ad segments come first.
  - At each mid-roll offset, the ad's segments are inserted between content segments, with
    `#EXT-X-DISCONTINUITY` on both sides.
- Mid-roll offsets **snap to the nearest segment boundary**, because segments are 6 seconds long.
  The ADR covers the alternative: forcing keyframes at placement offsets means re-transcoding
  whenever placements change.
- The stitcher is a **pure function**: `stitch(contentPlaylist, adPlaylists, placements) → playlist`.
  It does no I/O, so it's tested with snapshot fixtures. This is the course's "business logic
  isolated from I/O" (1.14).

#### b. Ad markers + event tracking [YOU]

- Each inserted ad is marked with `#EXT-X-DATERANGE` (`ID="ad-<placementId>"`,
  `CLASS="com.framecue.ad"`, `DURATION`, plus `X-` attributes for skip-after and click URL). This
  needs `#EXT-X-PROGRAM-DATE-TIME` on the playlist.
- [YOU] The player reads the date ranges from `hls.js` level details.
  - It knows when an ad starts and ends, so it shows the existing ad UI (countdown, Skip, Visit
    site) and fires the **same events**.
  - **Skip** seeks to the end of the ad range.
  - Seeking **into or past** an unplayed ad snaps back to the ad.
- The seek bar shows **content time** (ads excluded) and maps it to stream time.
- **Event integrity is unchanged.** Same payloads, same dedup key `(sessionId, eventType,
adPlacementId)`. Dashboard numbers before and after SSAI must match on the same test session.
- Banners stay client-side overlays. SSAI covers video ads only.
- ADR: client beacons vs **server-side beaconing** (count an impression when the ad's first segment
  is requested). Server-side is more fraud-resistant, but it's fooled by prefetching and caches.

#### c. Cached playlists [YOU]

- Stitched playlists are cached in Redis under the key `ssai:{videoId}:{placementsVersion}`.
  `placementsVersion` bumps on any placement change, so stale keys simply go unread (versioned-key
  invalidation, 1.16).
- Stampede guard: on a cache miss, only one request builds the playlist (`SET NX` lock); the others
  wait briefly.

#### Tests

- Snapshot tests for pre-roll only, mid-roll only, several ads, an ad at the last segment, and a
  removed placement.
- An e2e check that the same session gives the same counts as the client-side engine did.
- A placement edit causes a cache miss.

#### Done when

Ads play inside one continuous stream with no `src` swap. Skip and Visit site work. Dashboard
numbers match the pre-SSAI baseline.

---

## 11. Phase 5 — Observability & reliability

**Covers:** 2.1, 2.2, 2.3, 2.4, 2.7 · **Learning curve:** moderate, new tools rather than new code
patterns

Four tasks that make the multi-process system diagnosable. These are the "Stage 2" skills: it
broke at 11pm and you can still find and fix it.

### T11 — Tracing (2.2)

- [CLAUDE] `@opentelemetry/sdk-node` auto-instrumentation (http, express, pg, ioredis, BullMQ),
  plus Jaeger in compose.
- [YOU] Custom spans: `oauth.callback`, `transcode`, `budget.charge`. The trace
  context is copied into BullMQ job data, so one trace spans **api → queue → worker**.
- [CLAUDE] Browser tracing sends `traceparent` on Axios calls.
- **Done when:** from a slow request's trace ID, you can find the slow span without reproducing
  the problem.

### T12 — SLOs, alerts, runbooks, log hygiene (2.1, 2.3)

- [YOU] `docs/slo.md`:
  - event ingestion ≥ 99.9% accepted
  - p99 `POST /events` < 150 ms
  - aggregation freshness < 90 min
  - transcode success ≥ 99%

  Include the error-budget math.

- Symptom-based alerts: SLO burn rate, "no successful aggregation in 2 h", dead-letter queue depth
  > 0. Each alert links to a runbook in `docs/runbooks/`.
- [YOU] Log sampling: `accepted`/`deduped` event logs are sampled at 10%, while errors and
  `rejected` are always logged. The PII and token redaction list gets a unit test.

### T13 — Load testing & profiling (2.7)

- [CLAUDE] k6 scripts in `perf/` for event ingestion (ramping to 500 req/s), playlist and segment
  fetches, and the dashboard.
- [YOU] Report **p50/p95/p99**, and explain why p50 hides the problem. Profile one hotspot with
  `--cpu-prof` or a heap snapshot, change **one** thing, and measure again. The PR shows the
  before/after numbers.

### T14 — Resilience pass (2.4)

- [YOU] A circuit breaker (`opossum`) around Google and Microsoft sign-in and any remaining
  Cloudinary calls. While it's open, that button shows "unavailable" and the other sign-in methods
  keep working.
- [YOU] Retries use exponential backoff + **jitter**, and only for retryable failures (network,
  429, 5xx). A retry budget prevents retry storms. A DB `statement_timeout` applies to requests.
- [CLAUDE] The dashboard shows a "Data as of 14:03 (aggregation delayed)" banner when aggregation
  is stale.

### T17 — Data classification, retention & encryption (2.6)

[YOU] `docs/security/data-handling.md`, about half an evening:

- **PII classification:** what is personal data here. User emails and names, OAuth `sub`s, IPs in
  logs, playback session IDs (pseudonymous). Note where each lives and who can read it.
- **Retention per table:** raw playback events, audit log, refresh tokens (deleted after expiry),
  source video files (deleted after transcode), logs. Add a cleanup job wherever one is missing.
- **Encryption:** in transit, TLS at the edge locally vs in production and the DB connection
  `sslmode`. At rest, the Postgres volume and media volume today, and Azure-managed encryption in
  L2. Also record which secrets exist and where they're held.

---

## 12. Later 1 — Live room & extras

**Covers:** 2.14, 3.2, 3.4, 3.6 · **Starts after** the 1.5-month plan

Also in Later 1: F2e smart ad breaks (see F2).

### F6 — Live campaign room

**Covers:** 2.14, 3.2, 3.4 · **Slices:** 2 · **Needs** F1 (cookie auth) and F2 (Redis, worker)

#### a. Live ticker [YOU]

- `GET /api/v1/stream` is **Server-Sent Events**. `EventSource` can't set headers, so the stream
  authenticates with the F1 cookie, which is one more reason cookies come first.
- Message types:
  - `impressions` (batched once a second per workspace, never one message per event)
  - `spend`
  - `budget.exhausted` (shown as an alert toast)
  - `video.progress`
  - `video.ready`
- Every message has an `id`. On reconnect, `Last-Event-ID` replays missed messages from a Redis
  Stream that keeps them for 10 minutes. A heartbeat goes out every 25 s.
- [CLAUDE] A `useEventStream` hook writes into the TanStack Query cache with `setQueryData`, and
  falls back to polling if the stream is down. The campaign room page shows live tiles plus a
  burn-down chart.
- ADR: SSE vs WebSockets vs polling. The data only flows server → client, plain HTTP works through
  proxies, and the browser reconnects on its own.

#### b. Upload status turns Ready instantly + multi-instance [YOU]

- The worker publishes `video.progress` / `video.ready` to Redis pub/sub, and every API instance
  relays them to its connected clients (the **backplane**). That removes the 5-second frontend
  polling.
- Proof: `docker compose up --scale api=2` behind a small proxy. A client on api-2 sees events
  raised from a request on api-1.

#### Done when

Impressions tick live. A transcode progress bar moves without polling. Killing one API instance
makes the client reconnect to the other with no missed messages.

---

### Threat model (3.6)

`docs/design/threat-model.md`: STRIDE over the public surfaces built by now.

- `POST /public/events`: spoofed events and click fraud.
- Public media routes: hotlinking and path traversal.
- The OAuth callback: CSRF and state replay.
- SSE: auth and resource exhaustion.

Each threat records the mitigation that exists and the gap, which feeds §15. About one evening.

---

## 13. Later 2 — Ship to Azure

**Covers:** 1.7, 2.1, 2.2, 2.3, 2.11, 2.16, 2.17, 2.18, 3.5, 3.8 · **Learning curve:** steep, new
platform · **On hold** until Azure costs are clear

### F7 — Azure deployment

Replaces Render. Infra as code lives in Bicep under `infra/`, with one parameter file per
environment (`dev`, `prod`).

```
 Browser ──▶ Front Door / CDN ──▶ Static Web Apps (SPA, runtime config.json)
    │                     └─────▶ Blob (HLS segments, signed URLs)
    │
    └──▶ app.<domain> / api.<domain> (same site, so F1 cookies work)
                │
     Container Apps environment (VNet)
       api (min 1, max 5, HTTP scale rule) ── worker (KEDA scale on queue depth)
                │              managed identity
     ┌──────────┼───────────────┬──────────────┬─────────────────┐
     ▼          ▼               ▼              ▼                 ▼
 Postgres   Azure Cache     Key Vault     Blob Storage     App Insights
 Flexible   for Redis                     + Event Grid     (OTel, KQL)
 (private endpoint, PITR)
```

| Slice                     | What you build                                                                                                                                                                                                                                                                                                                                                                           | Covers        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| a. Compute + data         | Container Apps for api and worker (scale rules, revisions, ingress), Postgres Flexible Server (tier choice, backups, private endpoint), Azure Cache for Redis. An ADR compares App Service, Container Apps and Functions, and covers cold starts.                                                                                                                                        | 2.17          |
| b. Identity + secrets     | A user-assigned **managed identity** with least-privilege Azure RBAC. **Key Vault references** for JWT keys, OAuth secrets and the cookie secret. Postgres uses Entra auth, so there's no DB password. A rotation runbook with two active JWT keys (`kid`).                                                                                                                              | 2.16          |
| c. Media on Blob          | `AzureBlobStorage` implements the F2 `VideoStorage` interface. Uploads go **directly from the browser to Blob** with a short-lived SAS, so large files never transit the API. Segments are served via CDN with signed URLs. Lifecycle policy: source files go to cool storage after 30 days. Event Grid `BlobCreated` → transcode job. Existing local media is migrated strangler-style. | 2.18, 3.8     |
| d. Continuous delivery    | GitHub Actions with **OIDC federation** to Azure (no stored credentials). The image is built once, tagged by SHA in ACR, and promoted. **Migrations run as a Container Apps Job** before rollout, never on container start. dev → **approval** → prod. New revision at 10% traffic → watch → 100%, or roll back. A rollback runbook covers what a migration means for rollback.          | 1.7, 2.11     |
| e. Observability in Azure | The OTel exporter switches to App Insights. Saved **KQL** queries: a trace by request ID, ingestion outcomes, p99 by route. T12's alerts become Azure alert rules.                                                                                                                                                                                                                       | 2.1, 2.2, 2.3 |
| f. DR drill               | RTO and RPO written down as business inputs. Restore Postgres from point-in-time backup to a new server, point a dev revision at it, run smoke tests, and record the drill. Plus the degradation order: what fails first and what keeps working.                                                                                                                                         | 3.5           |

**Done when:** a merged PR reaches prod through approval with no manual Azure clicks. A KQL query
finds one user's request by its request ID. Uploads never touch the API. The restore drill is
recorded.

---

## 14. Small backend tasks

The reference list. Each task is about an evening.

| #   | Task                                                                                                                            | Covers          | Phase |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | --------------- | :---: |
| T1  | Backend test suite (3 PRs) and GitHub Actions CI (lint → typecheck → tests on Postgres → build), `npm audit`, Trivy, Dependabot | 1.14, 2.6, 2.11 |  P0   |
| T2  | Restrict `clickThroughUrl` to `http`/`https`, and check the protocol in the player before `window.open`                         | 2.6             |  P0   |
| T3  | Request context (`AsyncLocalStorage`) and `X-Request-Id` on every log line                                                      | 1.4, 2.1        |  P0   |
| T4  | `/health/live` and `/health/ready` checking the DB, Redis and the worker heartbeat; Docker `HEALTHCHECK`                        | 2.3             |  P3   |
| T5  | `Idempotency-Key` on `POST /videos` and `POST /advertisements`: stored response, replay on retry, 422 on a different body       | 2.5             |  P3   |
| T6  | Rate limits in Redis; aggregation as a repeatable worker job with a lock                                                        | 1.16, 2.9       |  P3   |
| T7  | OpenAPI docs generated from the Zod schemas at `/api/docs`                                                                      | 1.3             |  P2   |
| T8  | 1M-event seed, `EXPLAIN ANALYZE` saved in `docs/perf/`, N+1 audit, pool sizing                                                  | 1.6, 2.7        |  P2   |
| T9  | Docker hardening: worker image with ffmpeg, layer order, `HEALTHCHECK`, SHA tags                                                | 2.10            |  P3   |
| T10 | Cursor pagination for the public catalog (UUIDv7 as the tiebreaker)                                                             | 1.11            |  P2   |
| T11 | OpenTelemetry tracing browser → api → worker, viewed in Jaeger                                                                  | 2.2             |  P5   |
| T12 | SLOs, symptom-based alerts, runbooks, log sampling and redaction tests                                                          | 2.1, 2.3        |  P5   |
| T13 | k6 load tests with p50/p95/p99, plus one profiled improvement                                                                   | 2.7             |  P5   |
| T14 | Resilience pass: circuit breakers, jittered retries, statement timeouts, stale-data banner                                      | 2.4             |  P5   |
| T15 | Debugging setup: `--inspect` for api and worker + VS Code attach                                                                | 1.1             |  P0   |
| T16 | Transactional outbox: relay with `SKIP LOCKED`, deduplicating consumers                                                         | 2.5, 3.2        |  P3   |
| T17 | Data classification, retention and encryption note, plus any missing cleanup jobs                                               | 2.6             |  P5   |

---

## 15. If time permits

| Extra                                                                        | Covers           |
| ---------------------------------------------------------------------------- | ---------------- |
| Resumable chunked uploads (the tus protocol), like YouTube Studio            | 1.1, 2.5, 2.12   |
| Retention heatmap: quartile events, drop-off per ad, partitioned event table | 1.6, 3.3, 2.7    |
| Full-text search on the catalog (`tsvector` + GIN)                           | 1.11             |
| Worker threads for CPU-heavy work (e.g. thumbnail sprites)                   | 1.1              |
| Email notifications (transcode ready, budget exhausted)                      | 2.13             |
| API keys for a read-only reporting API                                       | 1.10             |
| Advertiser portal, ad auction, AI contextual targeting                       | 1.10, 1.12, 2.15 |

---

## 16. Branches

Each feature's ADR ships inside its own PR, and
ARCHITECTURE.md and DECISIONS.md are updated with each feature to describe the system as it now is.

---

## 17. Walkthrough questions to prepare

1. Someone signs in with Google using an email that already has a password account. What happens,
   and why not auto-link? (P1)
2. Two tabs refresh the session at the same moment. Show why the user isn't logged out. (P1)
3. A Viewer calls the edit API directly. Show the enforcement and the test. (P1)
4. 100 impressions arrive at once against a nearly empty budget. Show the spend is exact. (P2)
5. An admin in New York asks why Sunday had 25 hours of data. (P2)
6. Show the query plan behind "impressions this month" at 1M events. (P2)
7. Upload a 1 GB file. Show the server's memory, and what happens if the client disconnects
   halfway. (P3)
8. The worker is killed mid-transcode. Walk through the recovery. (P3)
9. The DB commit succeeds but Redis is down when the transcode should be enqueued. What happens? (P3)
10. How does the player know an ad is playing inside one stitched stream, and why are dashboard
    counts unaffected? (P4)
11. A user reports a slow page at 14:02 yesterday. Find the cause from telemetry alone. (P5)
12. Google sign-in is down. What do users see, and what keeps working? (P5)
13. Kill one API instance during the live room demo. What does the client do? (L1)
14. Roll back yesterday's release. What happens to the migration it ran? (L2)
15. How does the app prove who it is to Key Vault without holding a secret? (L2)

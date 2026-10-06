# FrameCue — In-Video Ad Platform

A POC platform for attaching and tracking ads on hosted video content: admins upload videos and
attach pre-roll, mid-roll, and banner-overlay ads to them; an unauthenticated public player plays
each video with its ads injected at the right moment and reports what actually happened; an admin
dashboard turns that raw event stream into trustworthy impression/completion/CTR numbers.

## The problem this solves

Videos get published with no way to attach advertising to them, and when ads are placed by hand
there's no record of whether anyone actually watched one, skipped it, or sat through it. Sales
wants a number to put in front of a client; nobody can currently produce one that survives a
second look.

This POC's center of gravity is **event integrity** — the same playback event arriving twice must
never be counted twice, and the daily numbers on the dashboard have to be a real, defensible
aggregate derived from a raw event log, not a `COUNT(*)` that happens to work in a demo. See
[in-video-ad-platform.md](in-video-ad-platform.md) for the original problem brief this was built
against.

## What it actually does

| Actor             | Auth                 | Can do                                                                                                                                                                                           |
| ----------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Admin**         | JWT, issued at login | Upload videos; create/edit/delete reusable ad creatives; attach/edit/remove ad placements on their own videos; view an analytics dashboard — all scoped to their own inventory only              |
| **Public player** | None, by design      | Fetch a video's playback config (URL + its ads) and submit playback events. Cannot create, edit, or delete anything — there is no write path from the public side into video or ad configuration |

## Tech stack

| Layer         | Stack                                                                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend       | Express + TypeScript, PostgreSQL via Prisma (`@prisma/adapter-pg`), Zod validation, Pino structured logging, JWT auth                                                                         |
| Frontend      | React 19 + TypeScript (strict) + Vite, React Router v7, antd v6, TanStack Query + Axios, `@ant-design/plots`                                                                                  |
| Video hosting | Cloudinary (real integration — upload + async transcode status polling), stubbed only for automated tests                                                                                     |
| Infra         | Docker (multi-stage builds for both apps), `docker-compose` for local orchestration, `serve` serving the built frontend as static files (the browser calls the backend's own origin directly) |

## Architecture at a glance

```
Browser ──▶ static frontend (React SPA)
   │
   └──────▶ Express API ──▶ Postgres
                  │
                  ├──▶ Cloudinary (video hosting/transcode)
                  │
            background jobs:
             · video status poller (5s)
             · daily-count aggregation scheduler (1h)
```

The browser calls the backend directly, with CORS allowing the frontend's origin.

The full data model, request flows, and module-by-module breakdown live in
**[ARCHITECTURE.md](ARCHITECTURE.md)**. The reasoning behind every non-obvious choice — the
event-dedup mechanism, session identity, aggregation strategy, ownership scoping, and more —
lives in **[DECISIONS.md](DECISIONS.md)**, organized around exactly what the original spec says
this POC is graded on.

## Quick start

**Prerequisites:** Docker + Docker Compose, and a free [Cloudinary](https://cloudinary.com)
account (needed even to run this locally — video upload/transcode isn't stubbed for real usage).

```bash
cp .env.example .env
```

Every variable this project uses — and what each one is for — is documented directly in
[.env.example](.env.example); fill in the blanks in your new `.env`. `NODE_ENV`/`PORT`/
`CORS_ORIGIN`/`POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` already have working local-dev
defaults, so only `JWT_SECRET` and the three `CLOUDINARY_*` values need a real one of your own —
the latter from your [Cloudinary dashboard](https://cloudinary.com/console).

One thing worth calling out since it's easy to get wrong: `DATABASE_URL`'s default is written for
the _host's_ view of Postgres (`localhost:5432`, exposed by `docker-compose.yml`) and matches
`POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB`'s own defaults — change it only if you changed
those. The backend _container_ itself connects using a different, internal hostname automatically;
`docker-compose.yml` overrides it for you, nothing to do there.

```bash
docker compose up
```

That's the whole setup — Postgres, the backend, and the frontend all come up from one command.
Once it's up:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:8000/health

Seed two admin accounts. Run this from the host, not inside the container — the backend's
production image is built with `--omit=dev`, and seeding needs the dev-only `tsx` runner.
`docker-compose.yml` exposes Postgres on `localhost:5432` for exactly this:

```bash
npm install
npm run seed --workspace=backend
```

| Email               | Password      |
| ------------------- | ------------- |
| `alice@example.com` | `password123` |
| `bob@example.com`   | `password123` |

Two accounts exist specifically so cross-admin ownership scoping is demonstrable.

## Local development (outside Docker)

```bash
npm install
npm run dev:backend    # tsx watch, port 8000 — needs Postgres reachable via DATABASE_URL
npm run dev:frontend   # vite dev server, port 5173, proxies /api to :8000
```

`npm run typecheck` / `npm run lint` run across both workspaces from the repo root.

## Documentation map

| Doc                                                | What's in it                                                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [README.md](README.md)                             | You are here — quick start, high-level overview                                                                                |
| [ARCHITECTURE.md](ARCHITECTURE.md)                 | Data model, backend modules, frontend structure, key flows (upload pipeline, ad playback engine, event ingestion, aggregation) |
| [DECISIONS.md](DECISIONS.md)                       | Why each non-obvious design choice was made — organized around what this POC is actually graded on, plus known gaps            |
| [in-video-ad-platform.md](in-video-ad-platform.md) | The original problem brief, unmodified                                                                                         |

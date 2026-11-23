# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from this directory, or from the repo root with `--workspace=backend`:

- `npm run dev` — tsx watch on `src/server.ts`, port 8000
- `npm run build` — compile to `dist/`
- `npm run typecheck` — `tsc` for `src/` and `tests/`
- `npm run lint` — ESLint
- `npm test` — Vitest; needs the Postgres container (`docker compose up -d postgres`)
- `npm run prisma:migrate` — create and apply a migration after editing `prisma/schema.prisma`
- `npm run prisma:generate` — regenerate the client in `src/generated/prisma` (gitignored)

## Stack

Express 5 + TypeScript (strict), PostgreSQL via Prisma 7 (`@prisma/adapter-pg`), Zod 4 for
validation, Pino (+ pino-http) for logging, JWT auth, Vitest + Supertest for tests. Express 5
forwards a rejected `async` handler to the error handler on its own — no try/catch wrapper needed.

## Folder structure

```
src/
  app.ts                  # middleware pipeline and route mounting
  server.ts               # starts listening, graceful shutdown
  config/env.ts           # the only place that reads process.env - Zod-validated at import
  constants/              # <area>.constants.ts - every constant, message and "enum"
  errors/AppError.ts      # AppError and its subclasses
  lib/                    # shared infrastructure (prisma, logger, request context, hosting)
  middleware/             # cross-cutting Express middleware
  schemas/                # Zod schemas shared by several modules
  types/                  # <area>.types.ts, plus express.d.ts augmenting Request
  modules/
    <module>/
      <module>.routes.ts      # Router: paths, middleware, ownership checks
      <module>.controller.ts  # RequestHandlers: parse input, call services, send the response
      <module>.service.ts     # business logic and Prisma queries shared by controllers/jobs
      <module>.schema.ts      # this module's Zod request schemas
      <module>.validators.ts  # business rules that need more than a schema (optional)
tests/
  setup/                  # global DB setup, env, per-test reset
  helpers/                # factories, request helpers, test.constants.ts
  unit/                   # pure functions
  integration/            # real HTTP against a real _test database
```

## Conventions

- **Constants live in `constants/*.constants.ts`**, never declared inline in a controller, service,
  middleware or lib file — even single-use ones. Test constants live in
  `tests/helpers/test.constants.ts`, all `TEST_`-prefixed.
- **"Enums" are `as const` objects** with a same-named type
  (`export const X = {...} as const; export type X = (typeof X)[keyof typeof X];`), not TS `enum`.
  Use Prisma's generated enums for values stored in the database.
- **Every function is an arrow function** (`export const foo = () => {}`), never a `function`
  declaration.
- **Validate every input with Zod** in the controller: `schema.parse(req.body)` or
  `schema.parse(req.query)`. A `ZodError` becomes a 400 in `errorHandler` automatically.
- **Throw, don't respond, on failure.** Throw an `AppError` subclass (`NotFoundError`,
  `ValidationError`, `ConflictError`, …) with a message from `ErrorMessages`. Only `errorHandler`
  writes error responses, so every error has the same `{ errors, message, requestId }` shape.
- **Success responses** are `res.status(StatusCodes.X).json({ data: {...}, message })`, with the
  message from `ApiSuccessMessages`. Use `http-status-codes`, never bare numbers.
- **Ownership:** per-id admin routes go through `requireOwnership`, which 404s (never 403s) a
  resource that's missing or not the caller's; the handler reads it from `req.resource`. List
  queries always filter by `req.user!.id`.
- **Soft delete:** videos and ads are retired with `deletedAt`, never removed. Writes look up
  `deletedAt: null`; reads can still see retired rows.
- **Config:** read settings from `env` (`config/env.ts`), never `process.env` directly. A new
  variable goes in the env schema and `.env.example`.
- **Database naming:** Prisma models and fields are camelCase; tables and columns are snake_case
  through `@@map` / `@map`.

## Logging

- Use `req.log` inside a request handler and the shared `logger` everywhere else. Both stamp
  `requestId` on every line during a request (Pino `mixin` over `AsyncLocalStorage`), so never
  pass the id around by hand.
- Log the error object first: `logger.error(error, 'What failed, for which id')`.
- Never log secrets or tokens. The access log already redacts `authorization` and `cookie`
  headers (`LOG_REDACT_PATHS`).

## Comments and docs

- Every exported function, handler and middleware gets a 2-4 line JSDoc `@description`: its purpose,
  then any non-obvious "why".
- Inline comments are 1-2 lines and explain why, not what. No ticket or requirement numbers.
- Comments and docs describe the code as it is now — no history of what it used to do.

## Tests

- Integration tests call the real app with Supertest against the `_test` database. Each file calls
  `resetDatabaseBeforeEachTest()`. Files run one at a time because they share that database.
- Build rows with the factories in `tests/helpers/factories.ts`, and sign tokens with
  `authHeaderFor(user)` — no login round trip.
- Video hosting runs against the fake (`VIDEO_HOSTING_PROVIDER=fake`), never Cloudinary.
- A bug fix comes with a test that fails without the fix.

## Debugging

- **Docker:** `docker-compose.override.yml` starts the backend with the inspector on
  `127.0.0.1:9229`. In VS Code, run **Backend: attach to Docker** and set breakpoints in the `.ts`
  files — the compiled JS carries inline source maps.
- **Locally:** **Backend: run locally** starts `src/server.ts` under tsx with the debugger. Stop
  the Docker backend first; both use port 8000.
- **Tests:** open a test file and run **Backend: debug current test file**.

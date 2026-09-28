# Build context is the REPO ROOT (not backend/) - this is an npm workspaces monorepo, and npm
# needs the root package.json/package-lock.json plus every workspace's manifest to resolve
# installs correctly, even though this image only ever runs the backend.

# ---------- Stage 1: builder ----------
# Has everything needed to compile TypeScript. Nothing from this stage ships in the final image
# except what we explicitly copy out of it below.
FROM node:22-alpine AS builder
WORKDIR /repo

# Manifests only, first - this install layer is cached and only re-runs when a package.json or
# the lockfile actually changes, not on every source edit.
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

# --ignore-scripts: skips lifecycle scripts (e.g. the root's "prepare": "husky") that assume
# root devDependencies are installed, which they aren't in this workspace-scoped install.
RUN npm ci --workspace=backend --ignore-scripts

# Now bring in the actual backend source and compile it.
COPY backend ./backend

# The Prisma client is generated code (see prisma/schema.prisma's generator "output"), and it's
# gitignored - it doesn't exist in this build context at all until we generate it ourselves.
# tsc needs it on disk before it can compile the code that imports it.
RUN npm run prisma:generate --workspace=backend
RUN npm run build --workspace=backend

# ---------- Stage 2: runtime ----------
# Fresh base image, production dependencies only, plus the compiled output from Stage 1.
# No TypeScript, no dev tooling, no .ts source files end up in here.
FROM node:22-alpine AS runtime
WORKDIR /repo

# Hand /repo off to the non-root "node" user now, while it's still empty, and switch to it before
# anything gets installed - so npm ci (and every COPY --chown below) creates files already owned
# by node, and node_modules never needs a later chown. Doing this chown after npm ci instead (on
# an already-populated ~500MB node_modules) would force Docker to rewrite nearly every file's
# metadata into a new layer, nearly doubling the image for an ownership-only change.
RUN chown node:node /repo
USER node
ENV NODE_ENV=production

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node backend/package.json ./backend/package.json
COPY --chown=node:node frontend/package.json ./frontend/package.json
RUN npm ci --workspace=backend --ignore-scripts --omit=dev

COPY --chown=node:node --from=builder /repo/backend/dist ./backend/dist
# migrate deploy (run below, on every container start) needs the schema, migration history, and
# prisma.config.ts (Prisma 7 reads the datasource URL from there, not schema.prisma directly) -
# none of that is part of dist, so it's copied straight from source, not the builder stage output.
COPY --chown=node:node backend/prisma ./backend/prisma
COPY --chown=node:node backend/prisma.config.ts ./backend/prisma.config.ts

EXPOSE 8000
# Applies any pending migration before the server starts accepting traffic - this project has no
# paid-tier "pre-deploy command" hook available, so this is the free-tier-compatible equivalent:
# runs on every container start (idempotent - a no-op if nothing's pending), and a failed
# migration fails the container's startup instead of serving against a stale schema.
CMD ["sh", "-c", "npm run prisma:deploy --workspace=backend && node backend/dist/server.js"]

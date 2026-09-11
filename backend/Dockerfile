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
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci --workspace=backend --ignore-scripts --omit=dev

COPY --from=builder /repo/backend/dist ./backend/dist

# The base image ships a non-root "node" user for exactly this purpose.
USER node

EXPOSE 8000
CMD ["node", "backend/dist/server.js"]

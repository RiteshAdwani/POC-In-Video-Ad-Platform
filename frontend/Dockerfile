# Build context is the REPO ROOT (not frontend/) - same reason as the backend Dockerfile: this
# is an npm workspaces monorepo, so npm needs every workspace's manifest to resolve installs.

# ---------- Stage 1: builder ----------
# Compiles the React app down to static HTML/CSS/JS. Nothing from this stage ships in the final
# image except the built dist/ folder, copied out explicitly below.
FROM node:22-alpine AS builder
WORKDIR /repo

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci --workspace=frontend --ignore-scripts

COPY frontend ./frontend

# The backend origin the built JS bundle will call directly (see api.constants.ts) - Vite bakes
# VITE_* vars into the bundle at build time, so this has to be a build arg, not a runtime env var
# Passed by docker-compose.yml locally and by the platform's build settings in production.
ARG VITE_BACKEND_ORIGIN
ENV VITE_BACKEND_ORIGIN=$VITE_BACKEND_ORIGIN
RUN npm run build --workspace=frontend

# ---------- Stage 2: runtime ----------
# A production build is just static files - `serve` is one well-known package that serves a
# folder with SPA-fallback support built in (-s: unknown paths get index.html, so a hard refresh
# on e.g. /videos works), instead of a whole separate web server with its own config file. The
# backend call itself goes browser-to-backend directly (VITE_API_BASE_URL above).
FROM node:22-alpine AS runtime
WORKDIR /app

# Global install needs root's default npm prefix - the running process still drops to a non-root
# user below, same posture as backend/Dockerfile.
RUN npm install -g serve@14 && chown node:node /app
USER node
COPY --from=builder --chown=node:node /repo/frontend/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]

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
RUN npm run build --workspace=frontend

# ---------- Stage 2: runtime ----------
# A production build is just static files - nginx serves them and reverse-proxies /api and
# /public to the backend container, so the browser never has to deal with CORS.
FROM nginx:1.27-alpine AS runtime
COPY --from=builder /repo/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

# ---------- Build ----------
FROM node:22-bookworm-slim AS builder
ENV NODE_ENV=production
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Caching
COPY package.json pnpm-workspace.yaml ./
COPY apps/frontend/package.json apps/frontend/package.json
RUN pnpm install --frozen-lockfile

# Code kopieren & bauen
COPY . .
# Optional: Vite ENV beim Build setzen:
# ARG VITE_API_BASE
# ENV VITE_API_BASE=$VITE_API_BASE
RUN pnpm --filter frontend build

# ---------- Runtime (NGINX unprivileged, minimal) ----------
FROM cgr.dev/chainguard/nginx:latest
# Chainguard-Images sind hart gehärtet, laufen als non-root

# Statisches Artefakt
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# SPA-Fallback
USER root
RUN printf 'server {\n  listen 8080;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf
USER 101

EXPOSE 8080

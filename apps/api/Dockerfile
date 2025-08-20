# ---------- Builder ----------
FROM node:22-bookworm-slim AS builder
ENV NODE_ENV=production
WORKDIR /app

# pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Nur Manifeste für Cache
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/notion-adapters/package.json packages/notion-adapters/package.json

# Install (nutzt pnpm-lock.yaml falls vorhanden)
RUN pnpm install --frozen-lockfile

# Quellcode
COPY . .

# Build-Reihenfolge (Packages -> API)
RUN pnpm --filter @shared/types --filter @notion/adapters build \
 && pnpm --filter api build

# ---------- Runtime (distroless, non-root) ----------
# Node.js 22, Debian 12, ohne Shell/Package-Manager
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runtime
WORKDIR /app

# Nur benötigte Artefakte
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
# falls Adapter zur Laufzeit require() nutzen:
COPY --from=builder /app/packages ./packages

# Distroless hat node als Entrypoint, daher nur das Script als CMD
EXPOSE 8787
CMD ["apps/api/dist/server.js"]

# Stage 1: deps
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY bun.lockb package.json ./
RUN bun install --frozen-lockfile

# Stage 2: build
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Stage 3: run (minimal — standalone output only)
FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000

RUN addgroup -S zolai && adduser -S zolai -G zolai

COPY --from=builder --chown=zolai:zolai /app/.next/standalone ./
COPY --from=builder --chown=zolai:zolai /app/.next/static ./.next/static
COPY --from=builder --chown=zolai:zolai /app/public ./public

USER zolai
EXPOSE 3000
CMD ["bun", "server.js"]

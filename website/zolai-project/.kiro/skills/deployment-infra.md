---
name: deployment-infra
description: Deployment and infrastructure for the Zolai platform — environment variables, Neon PostgreSQL, build process, server setup. Use when working on deployment, CI/CD, or infrastructure.
---

# Deployment & Infrastructure — Zolai Platform

## Required environment variables

```env
DATABASE_URL=postgresql://...          # Neon PostgreSQL
BETTER_AUTH_SECRET=...                 # Auth secret (min 32 chars)
BETTER_AUTH_URL=https://...            # Public app URL
NEXT_PUBLIC_APP_URL=https://...        # Client-side app URL
ZOLAI_API_URL=http://13.115.84.100:18789/chat  # Fine-tuned LLM
RESEND_API_KEY=...                     # Email delivery
```

## Build commands

```bash
bun run build    # Production build (Turbopack)
bun run start    # Start production server
bun run dev      # Dev server
bun run lint     # ESLint check
```

## Database (Neon PostgreSQL)

- Provider: `@prisma/adapter-pg` (not standard Prisma client)
- Connection pooling: handled by Neon
- Migrations: `bunx prisma migrate deploy` (production), `bunx prisma migrate dev` (local)
- Never run `migrate dev` in production

## Auth middleware

`proxy.ts` (not `middleware.ts`) — Node.js runtime, not Edge.
Handles session validation and route protection before pages render.

## LLM server

Fine-tuned model at `http://13.115.84.100:18789/chat` (AWS Tokyo).
See `docs/infrastructure/server.md` for server specs.

## Pre-deploy checklist

- [ ] All env vars set in deployment environment
- [ ] `bunx prisma migrate deploy` run against production DB
- [ ] `bun run build` passes with zero errors
- [ ] `bun run lint` returns zero output
- [ ] 4 compliance checks pass (see compliance-checks skill)
- [ ] No secrets committed to git

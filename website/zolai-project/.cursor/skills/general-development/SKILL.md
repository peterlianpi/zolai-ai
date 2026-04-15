---
name: general-development
description: >-
  General development conventions: Next.js 16 App Router, proxy.ts, Prisma 7 + PostgreSQL,
  Better Auth, feature-sliced modules, type safety, and validation workflow. Use for any
  feature work, bug fixes, or following established patterns in the Zolai AI project.
---

# Zolai AI — Development Conventions

Canonical reference: [AGENTS.md](../../../AGENTS.md) at repo root.

## Commands (run before finishing)

```bash
bun run lint && bun run build   # always
bun run dev                     # local dev
bunx prisma migrate dev --name <name>   # schema changes
bun run build && npx playwright test    # E2E
```

## Directory Layout

| Area | Location |
|------|----------|
| Routes & RSC | `app/` — protected under `(protected)/` |
| Hono APIs | `app/api/[[...route]]/` — sub-routers mounted in `route.ts` |
| Better Auth HTTP | `app/api/auth/[...all]/route.ts` |
| Domain UI/logic | `features/<feature>/` — `components/`, `hooks/`, `api/`, `server/`, `types.ts` |
| Shared UI primitives | `components/ui/` — vendored shadcn, avoid edits |
| Site config | `lib/constants/site.ts` — single source of truth for all brand strings |
| DB | `lib/prisma.ts` singleton only |
| Auth config | `lib/auth.ts`, `lib/auth-client.ts`, `lib/auth/hono-helpers.ts` |
| RPC client | `lib/api/hono-client.ts` with `AppType` from `app/api/[[...route]]/route.ts` |

## Next.js 16 / Zolai-specific

- **`proxy.ts`**: Node runtime, handles protected prefixes, redirect lookup, `/my/...` → `locale=my` rewrite.
- **RSC by default**; `"use client"` only for hooks, events, browser APIs.
- **No hardcoded brand strings** — always import from `lib/constants/site.ts`.
- **Imports**: `@/` alias. Order: React/Next → external → internal → local.
- **Types**: strict TypeScript; no `any`. Zod on all API inputs and forms.

## Feature Structure

```
features/<feature>/
  components/       # React components (including admin/ subfolder)
  hooks/            # use* hooks only
  api/              # typed client wrappers
  server/           # server-only loaders/helpers
  types.ts          # domain types
```

## Data & Auth

- **Prisma**: `import prisma from '@/lib/prisma'` — never `new PrismaClient()`
- **P2002** (unique constraint) → HTTP **409**
- **Roles**: USER / ADMIN via Better Auth admin plugin
- **Admin check**: `checkIsAdmin()` from `lib/auth/hono-helpers.ts`
- **Responses**: `{ success: boolean, data?: T, error?: { code, message } }`

## Zolai AI Domain Rules

- Zolai linguistic standards enforced in all generated content (see `zolai-project` skill)
- `VocabWord.zolai` field (not `word`) for ordering/search
- Grammar entries live in `WikiEntry` with `category` in `["phonology","morphology","syntax","semantics","pragmatics","dialect"]`
- Training runs created via `POST /api/zolai/training` (admin only)
- Chat/tutor proxied to `ZOLAI_API_URL` env var

## Agent Workflow

1. Search `features/` for similar patterns first
2. Mirror naming, error handling, response shapes
3. Touch API + UI + types together
4. Run `bun run lint && bun run build`
5. For Hono: see `hono-api` skill

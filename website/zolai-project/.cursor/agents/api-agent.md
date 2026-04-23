---
name: api-agent
description: >-
  Hono JSON APIs: catch-all route, sub-routers, Zod validation, typed RPC client.
  Use when adding or changing handlers under app/api/[[...route]]/ or lib/api/hono-client.ts.
---

You are **api-agent** for the **Zolai AI** project.

**Scope:** `app/api/[[...route]]/route.ts` and sub-routers, `lib/api/hono-client.ts`, `AppType` exports.

**Zolai API domains:**
- `/api/zolai/*` — wiki, bible, training runs, vocab, grammar (in `features/zolai/api/index.ts`)
- `/api/chat` — proxies to `ZOLAI_API_URL` upstream LLM
- `/api/content/*` — CMS posts, pages, news
- `/api/admin/*` — admin-only operations

**Rules:**
- Always chain routes on the same `routes` variable to preserve `AppType`
- Declare ALL schemas/constants BEFORE `new Hono()` — nothing between `new Hono()` and the first `.get()`/`.post()` or `client.routeName` will be undefined
- Never use `await fetch("/api/...")` in client code — always use `import { client } from "@/lib/api/client"`
- Use `@hono/zod-validator` on all inputs
- Use `ok/error/unauthorized/internalError` from `lib/api/response`
- Use `checkIsAdmin()` from `lib/auth/hono-helpers` for admin routes
- Safe error payloads only — no stack traces to client
- See `hono-api` skill for full patterns

**When done:** `bun run lint && bun run build`

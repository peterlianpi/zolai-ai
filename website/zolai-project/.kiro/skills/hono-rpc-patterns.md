---
name: hono-rpc-patterns
description: Hono RPC route patterns for this project. Use when creating or editing API routes in features/*/api/index.ts.
---

# Hono RPC Patterns — Zolai Project

## Router skeleton (chain all methods — never loose calls)

> **CRITICAL:** Declare ALL schemas, constants, and helpers **before** `new Hono()`.
> Anything placed between `new Hono()` and the first `.get()`/`.post()` breaks the chain,
> causing `Property 'routeName' does not exist` errors on the RPC client.
> Also never use `await fetch("/api/...")` in client code — use `import { client } from "@/lib/api/client"`.

```ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ok, created, notFound, conflict, badRequest, internalError, list } from "@/lib/api/response";
import { requireAdmin, requireAuth, requirePermission } from "@/lib/auth/server-guards";
import { PERMISSIONS } from "@/lib/auth/rbac";
import type { Prisma } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";

const router = new Hono()
  .get("/", async (c) => {
    try {
      const items = await prisma.model.findMany({ select: { id: true } });
      return ok(c, items);
    } catch {
      return internalError(c);
    }
  })
  .post("/", zValidator("json", schema), async (c) => {
    const session = await requireAuth(c);
    if (session instanceof Response) return session;
    const body = c.req.valid("json");
    try {
      const result = await prisma.model.create({ data: body, select: { id: true } });
      return created(c, result);
    } catch (e) {
      const err = e as Prisma.PrismaClientKnownRequestError;
      if (err.code === "P2002") return conflict(c);
      return internalError(c);
    }
  })
  // /:id MUST be last — catches anything not matched above
  .get("/:id", async (c) => {
    const item = await prisma.model.findUnique({ where: { id: c.req.param("id") }, select: { id: true } });
    if (!item) return notFound(c);
    return ok(c, item);
  });

export default router;
```

## Response helpers — all take `c: Context` first

```ts
ok(c, data)                          // 200 { success: true, data }
created(c, data)                     // 201 { success: true, data }
list(c, items, { total, page, limit, totalPages }) // 200 paginated
notFound(c, "Word not found")        // 404
conflict(c)                          // 409
badRequest(c, "Invalid input")       // 400
forbidden(c)                         // 403
unauthorized(c)                      // 401
internalError(c)                     // 500
```

## Auth guards (lib/auth/server-guards.ts)

```ts
// Returns Response (403/401) or session — always check instanceof Response
const session = await requireAuth(c);
if (session instanceof Response) return session;

const session = await requireAdmin(c);
if (session instanceof Response) return session;

const session = await requirePermission(c, PERMISSIONS.CONTENT_PUBLISH);
if (session instanceof Response) return session;

const ok = await requireMinRole(c, "moderator");
if (!ok) return forbiddenRoleJson(c);
```

## Mounting in app/api/[[...route]]/route.ts

```ts
// Already mounted — add to the routes chain:
const routes = app
  .route("/my-feature", myRouter)
  // ...
```

## Named routes before /:id

Always define `/search`, `/stats`, `/random` etc. BEFORE `/:id` — otherwise the param captures them.

## Validation

```ts
const querySchema = zValidator("query", z.object({
  q:     z.string().min(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  page:  z.coerce.number().int().min(1).default(1),
}));

// In route:
.get("/search", querySchema, async (c) => {
  const { q, limit, page } = c.req.valid("query");
})
```

## Caching (lib/cache.ts)

```ts
import { cachedFetch } from "@/lib/cache";

const data = await cachedFetch("key:subkey", 5 * 60_000, async () => {
  return prisma.model.findMany({ select: { id: true } });
});
```

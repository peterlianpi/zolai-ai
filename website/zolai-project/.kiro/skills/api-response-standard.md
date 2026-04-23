---
name: api-response-standard
description: API response standard for the Zolai platform — shapes, helpers, client consumption. Use whenever writing or consuming API routes.
---

# API Response Standard — Zolai Platform

## Response shapes

```ts
// Success (single item)
{ success: true, data: T }

// Success (paginated list)
{ success: true, data: T[], meta: { total: number, page: number, limit: number, totalPages: number } }

// Error
{ success: false, error: { message: string, code?: string } }
```

## Server helpers (lib/api/response.ts) — all take `c: Context` first

```ts
import { ok, created, list, notFound, conflict, badRequest, forbidden, unauthorized, internalError } from "@/lib/api/response";

ok(c, data)                                    // 200
created(c, data)                               // 201
list(c, items, { total, page, limit, totalPages }) // 200 paginated
notFound(c, "Word not found")                  // 404 — custom message optional
conflict(c)                                    // 409
badRequest(c, "Validation failed")             // 400
forbidden(c)                                   // 403
unauthorized(c)                                // 401
internalError(c)                               // 500
```

## Client consumption (hooks)

```ts
const res = await client.api.feature.$get();
if (!res.ok) throw new Error("Failed");
const json = await res.json();
// json.success === true → json.data available
// json.success === false → json.error.message available
```

## Prisma P2002 → 409

```ts
} catch (e) {
  const err = e as Prisma.PrismaClientKnownRequestError;
  if (err.code === "P2002") return conflict(c);
  return internalError(c);
}
```

## Never

- Never `c.json({ ... })` directly — always use a helper
- Never expose Prisma errors, stack traces, or DB internals
- Never return `success: false` with a 200 status
- Never return `success: true` with a 4xx/5xx status

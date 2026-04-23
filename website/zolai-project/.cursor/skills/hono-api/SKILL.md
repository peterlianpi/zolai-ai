---
name: hono-api
description: >-
  Hono API layer patterns: catch-all routes, sub-routers, zod-validator, rate limiting,
  JSON response conventions, and typed RPC client. Use for any Hono API development.
---

# Zolai AI — Hono API Patterns

## Mounting

- **Entry**: `app/api/[[...route]]/route.ts` — `new Hono().basePath("/api")`
- **Global middleware**: `rateLimiter` on `*` before routes
- **Vercel adapter**: export `GET`, `POST`, `PATCH`, `DELETE`, `PUT`, `OPTIONS` via `handle(app)`
- **New router**: add `app/api/[[...route]]/<name>.ts`, import in `route.ts`, chain on `routes`

```typescript
// CRITICAL: chain on same variable to preserve AppType
const routes = app
  .route("/existing", existing)
  .route("/your-feature", yourFeature);  // ← add here
export type AppType = typeof routes;
```

## Sub-router Structure (CRITICAL: strict chaining)

```typescript
// ✅ CORRECT — preserves TypeScript inference
const router = new Hono()
  .get("/endpoint", handler)
  .post("/endpoint", handler);

// ❌ WRONG — breaks AppType inference
const router = new Hono();
router.get("/endpoint", handler);
```

## Validation

```typescript
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

.post("/", zValidator("json", z.object({ name: z.string() })), async (c) => {
  const { name } = c.req.valid("json");
})
```

## Responses

```typescript
import { ok, error, unauthorized, internalError } from "@/lib/api/response";

return ok(c, data);
return error(c, "msg", "CODE", 400);
return unauthorized(c, "Admin only");
return internalError(c, "Failed to ...");
```

## Client — ALWAYS use canonical import

```typescript
// ✅ CORRECT — single canonical client
import { client } from "@/lib/api/client";

// ❌ WRONG — never create local hc<> instances
import { hc } from "hono/client";
const client = hc<AppType>("");  // broken empty URL
```

## React Query Pattern

```typescript
// ✅ CORRECT
import { client } from "@/lib/api/client";

export function useMyData() {
  return useQuery({
    queryKey: ["my-data"],
    queryFn: async () => {
      const res = await client.api.myRoute.$get({ query: { ... } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

// ❌ WRONG — never raw fetch in hooks/components
queryFn: () => fetch("/api/my-route").then(r => r.json())
```

## Compliance Checks (run after every edit)

```bash
# 1. No raw fetch /api/ in client code
grep -rn "await fetch\b" features app --include="*.ts" --include="*.tsx" | grep -v "/api/chat\|zolai/api/index"

# 2. No loose Hono method calls
find features app/api -name "*.ts" | while read f; do
  var=$(grep -oP "^const \K\w+(?= = new Hono\(\))" "$f" | head -1)
  [ -n "$var" ] && grep -qP "^${var}\.(get|post|patch|delete|put)\(" "$f" && echo "LOOSE: $f"
done

# 3. No local hc<> instances
grep -rn "hc<" features app --include="*.ts" --include="*.tsx" | grep -v "lib/api/client.ts"

# 4. No hono-client imports
grep -rn "hono-client" features app --include="*.ts" --include="*.tsx"
```

All four must return **zero output**.

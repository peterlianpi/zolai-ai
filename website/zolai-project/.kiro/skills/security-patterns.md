---
name: security-patterns
description: Security architecture for the Zolai platform — auth guards, rate limiting, input sanitization, audit logging, CSP, CSRF. Use when implementing or reviewing security-sensitive code.
---

# Security Patterns — Zolai Platform

## Defense layers (in order)

```
1. proxy.ts          — auth check, redirects unauthenticated users
2. Hono middleware   — API-level auth via requireAdmin() / requirePermission()
3. Zod validation    — input sanitization before any DB operation
4. Prisma            — parameterized queries (SQL injection safe by default)
5. sanitize-html     — XSS prevention for rich text content
6. Rate limiting     — lib/rate-limit.ts (Redis-backed with in-memory fallback)
7. Audit logging     — lib/auth/audit.ts → SecurityEvent table
8. Security headers  — CSP, HSTS, X-Frame-Options in next.config
```

## Auth guards

```ts
// RSC / Server Action
import { requireServerAuth, requireServerAdmin } from "@/lib/auth/server-guards";
await requireServerAuth();  // throws if unauthenticated
await requireServerAdmin(); // throws if not admin

// Hono API route
import { requireAdmin, requireAuth, requirePermission } from "@/lib/auth/server-guards";
import { PERMISSIONS } from "@/lib/auth/rbac";

const session = await requireAdmin(c);
if (session instanceof Response) return session; // 403

const session = await requirePermission(c, PERMISSIONS.CONTENT_PUBLISH);
if (session instanceof Response) return session;
```

## Rate limiting

`rateLimiter()` is a Hono middleware — mount it globally in `app/api/[[...route]]/route.ts`:

```ts
import { rateLimiter } from "@/lib/rate-limit";
app.use("*", rateLimiter());
```

Limits (configurable via `SiteSetting` DB table):
- Global: 100 req/min
- Auth routes (`/api/auth`, `/api/check-verification`): 5 req/15min
- Admin routes (`/api/admin`): 100 req/min

Auto-blocks IPs after repeated violations (threshold configurable). Redis-backed with in-memory fallback.

## Input sanitization

```ts
import sanitizeHtml from "sanitize-html";

// For rich text / user-generated HTML
const clean = sanitizeHtml(input, {
  allowedTags: ["p", "b", "i", "em", "strong", "a", "ul", "ol", "li"],
  allowedAttributes: { a: ["href"] },
});
```

## Audit logging

```ts
import { logAuthEvent, logFailedLogin, logSuccessfulLogin } from "@/lib/auth/audit";

// Generic event
await logAuthEvent(userId, email, "PERMISSION_DENIED", "MEDIUM", { resource, action });

// Convenience helpers
await logFailedLogin(email, "invalid_password");
await logSuccessfulLogin(userId, email, "email");
```

## Never

- Never expose stack traces, Prisma errors, or user IDs in API responses
- Never store passwords — Better Auth handles hashing
- Never skip Zod validation before DB writes
- Never use `dangerouslySetInnerHTML` without sanitize-html
- Never commit secrets — use env vars only

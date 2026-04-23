---
name: auth-patterns
description: Better Auth patterns for this project. Use when working on authentication, sessions, roles, or protected routes.
---

# Auth Patterns — Zolai Project

## Stack: Better Auth with plugins

Plugins active: `admin`, `organization`, `twoFactor`, `captcha`, `haveIBeenPwned`, `multiSession`

## Server-side session (RSC / Server Action)

```ts
import { requireServerAuth, requireServerAdmin, getServerSession } from "@/lib/auth/server-guards";

// Throw if unauthenticated
const session = await requireServerAuth();

// Throw if not admin
const session = await requireServerAdmin();

// Raw session (for conditional logic)
const session = await getServerSession();
if (!session) redirect("/login");
```

## Hono route protection

```ts
import { requireAdmin, requireAuth, requirePermission, requireMinRole, forbiddenRoleJson } from "@/lib/auth/server-guards";
import { PERMISSIONS } from "@/lib/auth/rbac";

// Admin only
.get("/admin-only", async (c) => {
  const session = await requireAdmin(c);
  if (session instanceof Response) return session; // 403
})

// Specific permission
.post("/publish", async (c) => {
  const session = await requirePermission(c, PERMISSIONS.CONTENT_PUBLISH);
  if (session instanceof Response) return session;
})

// Any authenticated user
.get("/protected", async (c) => {
  const session = await requireAuth(c);
  if (session instanceof Response) return session; // 401
})

// Minimum role level
.post("/moderate", async (c) => {
  const ok = await requireMinRole(c, "moderator");
  if (!ok) return forbiddenRoleJson(c);
})
```

## Client-side session

```ts
import { useSession } from "@/features/auth/hooks";
const { data: session, isPending } = useSession();
```

## Roles (camelCase values)

`user → viewer → contributor → author → editor → moderator / contentAdmin → admin → superAdmin`

```ts
import { ROLES, PERMISSIONS, hasPermission, isAdmin } from "@/lib/auth/rbac";
// ROLES.SUPER_ADMIN = "superAdmin"
// PERMISSIONS.CONTENT_PUBLISH = "content:publish"

hasPermission(session.user.role, PERMISSIONS.USER_BAN);
isAdmin(session.user.role); // true for moderator, contentAdmin, admin, superAdmin
```

## Email OTP (2FA)

Handled by Better Auth `twoFactor` plugin. OTP emails sent via `lib/email/resend.ts` using templates from `features/mail/components/templates`.

## Audit logging

All auth events tracked via `lib/auth/audit.ts` → `SecurityEvent` table.

## Error responses

- Unauthenticated: 401
- Insufficient role: 403
- Never expose session internals or user IDs in error messages

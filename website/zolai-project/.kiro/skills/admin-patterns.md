---
name: admin-patterns
description: Admin panel patterns — role guards, bulk operations, content moderation, user management, dashboard. Use when working on features/admin or admin-only routes.
---

# Admin Patterns — Zolai Platform

## Role hierarchy (camelCase values)

`user → viewer → contributor → author → editor → moderator / contentAdmin → admin → superAdmin`

```ts
import { ROLES, PERMISSIONS } from "@/lib/auth/rbac";
// e.g. ROLES.SUPER_ADMIN = "superAdmin"
```

## Admin route guard

```ts
import { requireAdmin, requirePermission, requireMinRole, forbiddenRoleJson } from "@/lib/auth/server-guards";
import { PERMISSIONS } from "@/lib/auth/rbac";

// Hono API — admin only
const session = await requireAdmin(c);
if (session instanceof Response) return session;

// Hono API — specific permission
const session = await requirePermission(c, PERMISSIONS.USER_BAN);
if (session instanceof Response) return session;

// Hono API — minimum role level
const ok = await requireMinRole(c, "moderator");
if (!ok) return forbiddenRoleJson(c);

// RSC / Server Action
import { requireServerAdmin, requireServerPermission } from "@/lib/auth/server-guards";
await requireServerAdmin(); // throws if not admin
```

## RBAC (lib/auth/rbac.ts)

```ts
import { hasPermission, PERMISSIONS } from "@/lib/auth/rbac";

if (!hasPermission(session.user.role, PERMISSIONS.USER_BAN)) {
  return { success: false, error: "Insufficient permissions" };
}
```

## Admin feature structure

```
features/admin/
  components/    # Admin UI shells
  hooks/         # Admin-specific hooks
  server/        # Admin server queries (always role-checked)
```

## Bulk operations pattern

```ts
// Always validate IDs, check permissions, use transaction
await prisma.$transaction(
  ids.map(id => prisma.model.update({ where: { id }, data: { status } }))
);
```

## Content moderation flow

1. User submits content → `features/content-submission`
2. Status: `PENDING` → admin reviews → `APPROVED` or `REJECTED`
3. Audit log entry created on every status change
4. Notification dispatched to submitter

## Dashboard data (lib/services/analytics.ts)

```ts
import { getAnalyticsData } from "@/lib/services/analytics";
const stats = await getAnalyticsData(30); // last 30 days
// Returns: timeline, topPosts, topPages, mediaByType, postsByStatus, postsByType
```

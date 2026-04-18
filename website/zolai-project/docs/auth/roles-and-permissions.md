# Better Auth — Role & Permission Reference

## Role System

Roles are defined in `lib/auth/roles.ts` — **single source of truth**. All code must import from there.

```ts
import { ROLES, ADMIN_ROLES, ALL_ROLES, isAdminRole, isSuperAdmin } from "@/lib/auth/roles";
```

### Role Hierarchy (lowest → highest)

| Role | Value | Admin Panel | Notes |
|---|---|---|---|
| `USER` | `"USER"` | ❌ | Default for new signups |
| `VIEWER` | `"VIEWER"` | ❌ | Read-only |
| `CONTRIBUTOR` | `"CONTRIBUTOR"` | ❌ | |
| `AUTHOR` | `"AUTHOR"` | ❌ | |
| `EDITOR` | `"EDITOR"` | ❌ | |
| `MODERATOR` | `"MODERATOR"` | ✅ | Content moderation |
| `CONTENT_ADMIN` | `"CONTENT_ADMIN"` | ✅ | Content + basic admin |
| `ADMIN` | `"ADMIN"` | ✅ | Full admin |
| `SUPER_ADMIN` | `"SUPER_ADMIN"` | ✅ | System-level access only |

> **Critical:** Role values match the Prisma `UserRole` enum exactly (uppercase). Better Auth's admin plugin is configured with these same keys so DB values are consistent.

---

## Better Auth Admin Plugin Config

```ts
// lib/auth.ts
admin({
  ac,
  roles: {
    USER: userRole,
    VIEWER: viewerRole,
    MODERATOR: moderatorRole,
    CONTENT_ADMIN: contentAdminRole,
    ADMIN: adminRole,
    SUPER_ADMIN: superAdminRole,
  },
  defaultRole: "USER",
  adminRoles: ["ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN", "MODERATOR"],
})
```

The role **keys** in `roles: {}` must match the string values stored in the DB. Using uppercase keys ensures `session.user.role === "SUPER_ADMIN"` works directly without transformation.

---

## Usage Patterns

### Server Component / Server Action
```ts
import { checkIsAdmin } from "@/lib/auth/admin";
import { isSuperAdmin } from "@/lib/auth/roles";

const isAdmin = await checkIsAdmin();           // uses session headers
const role = session?.user?.role;
if (isSuperAdmin(role)) { /* super admin only */ }
```

### Hono API Route
```ts
import { checkIsAdmin, checkIsSuperAdmin } from "@/lib/auth/hono-helpers";
import { requireMinRole } from "@/lib/auth/role-guards";

// Require any admin role
if (!(await checkIsAdmin(c))) return forbidden(c);

// Require minimum role level (hierarchy-based)
if (!(await requireMinRole(c, "ADMIN"))) return forbidden(c);

// Require super admin
if (!(await checkIsSuperAdmin(c))) return forbidden(c);
```

### Client Component
```ts
import { isAdminRole, isSuperAdmin } from "@/lib/auth/roles";
import { useSession } from "@/lib/auth-client";

const { data: session } = useSession();
const role = session?.user?.role;

isAdminRole(role)   // true for ADMIN, SUPER_ADMIN, CONTENT_ADMIN, MODERATOR
isSuperAdmin(role)  // true only for SUPER_ADMIN
```

### Zod Validation (API inputs)
```ts
import { ALL_ROLES } from "@/lib/auth/roles";

const schema = z.object({
  role: z.enum(ALL_ROLES as unknown as [string, ...string[]]),
});
```

---

## Permission Matrix (AC)

Defined in `lib/auth/permissions.ts` using Better Auth's `createAccessControl`.

| Permission | USER | MODERATOR | CONTENT_ADMIN | ADMIN | SUPER_ADMIN |
|---|---|---|---|---|---|
| `post.read` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `post.create/update/delete` | ❌ | read+update | ✅ | ✅ | ✅ |
| `post.publish/moderate` | ❌ | moderate | ✅ | ✅ | ✅ |
| `comment.moderate/approve` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `admin.dashboard` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `admin.settings` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `admin.users/audit` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `system.*` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `organization.*` | ❌ | ❌ | ❌ | ❌ | ✅ |

Check permissions server-side:
```ts
import { hasPermission } from "@/lib/auth/admin";

const canPublish = await hasPermission({ post: ["publish"] });
const canManageUsers = await hasPermission({ admin: ["users"] });
```

---

## Rules

1. **Never hardcode role strings** — always use `ROLES.ADMIN`, `ROLES.SUPER_ADMIN` etc.
2. **Never `.toUpperCase()` a role** — roles are already uppercase in the DB.
3. **Never duplicate `ADMIN_ROLES` array** — import it from `lib/auth/roles.ts`.
4. **`requireMinRole(c, "ADMIN")`** — uses hierarchy, so `SUPER_ADMIN` passes automatically.
5. **Admin panel access** — controlled by `isAdminRole()` which covers all 4 admin roles.
6. **System page** — use `isSuperAdmin()` for `SUPER_ADMIN`-only routes.

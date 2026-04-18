# Zolai AI - Features Quick Reference

## At a Glance

| Feature | API | DB | Hooks | Components | Admin UI | Status | Priority |
|---------|:---:|:--:|:-----:|:----------:|:--------:|:------:|:--------:|
| **Forms** | ✅ | ✅ | ❌ | ⚠️ | ❌ | 32% | 🔴 P1 |
| **Newsletter** | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | 75% | 🟡 P2 |
| **Notifications** | ⚠️ | ✅ | ⚠️ | ⚠️ | ❌ | 55% | 🔴 P1 |
| **Security** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | 80% | 🟡 P2 |

Legend: ✅ Complete | ⚠️ Partial | ❌ Missing

---

## What Works Today

### Forms
- Users can submit forms via public API endpoint
- Forms have honeypot spam protection
- Admins can manage forms (API only, no UI)

### Newsletter
- Users can subscribe/unsubscribe
- Public subscription with email confirmation
- Admins can send campaigns (API only)

### Notifications
- Users see notification bell in header
- Users can mark notifications as read
- Unread count displayed

### Security
- Users can manage device sessions
- Users can view security alerts
- Admins can block IPs and configure rate limiting

---

## What's Broken/Missing

### Forms ❌
**Critical**: Admin UI doesn't work
- Can't create forms
- Can't edit forms
- Can't view submissions
- Can't manage form settings

**Fix**: Create 7 hooks + wire up admin components (12 hours)

### Notifications ❌
**Critical**: Admins can't send notifications
- Template system exists but isn't wired up
- No UI to create/edit/send templates
- No bulk notification sending

**Fix**: Add template endpoints + admin UI (10 hours)

### Newsletter ⚠️
**Moderate**: Admin pages don't display data
- Components exist but are empty shells
- No campaign scheduler
- No email preview
- No send statistics

**Fix**: Wire up data binding + create missing components (14 hours)

### Security ⚠️
**Moderate**: Advanced features missing
- No account lockout management
- No password policy editor
- No audit reports

**Fix**: Add admin endpoints + components (12 hours)

---

## Architecture Patterns Used

### Hooks (Client-Side)
```typescript
// Location: features/<feature>/hooks/use-*.ts
// Pattern used in: Newsletter, Notifications, Security
// Missing in: Forms

export function useFeature() {
  return useQuery({
    queryKey: ["feature"],
    queryFn: async () => {
      const res = await client.api.feature.$get();
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useMutateFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => { /* ... */ },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature"] });
      toast.success("Success");
    },
  });
}
```

### API Routes
```typescript
// Location: app/api/[[...route]]/<feature>.ts
// Pattern: Hono with zValidator
const app = new Hono()
  .get("/", adminMiddleware, zValidator("query", schema), async (c) => {
    // Implementation
  });
```

### Server Routers (Alternative)
```typescript
// Location: features/<feature>/server/router.ts
// Used by: Newsletter (backup pattern)
// Pattern: Similar to API routes
```

---

## Key Files by Feature

### Forms
```
features/form/
├── components/
│   ├── form-field.tsx          ✅ React Hook Form field
│   ├── admin/
│   │   └── admin-forms-page.tsx ⚠️ Skeleton only
│   └── index.ts
├── (MISSING) hooks/
├── (MISSING) types.ts
├── (MISSING) schemas/
└── (MISSING) server/

app/api/[[...route]]/
└── forms.ts                     ✅ 10 endpoints
```

### Newsletter
```
features/newsletter/
├── components/
│   ├── SubscribeForm.tsx        ✅ Public form
│   ├── SubscribeWidget.tsx      ✅ Widget
│   ├── admin/
│   │   ├── AdminSubscribersPage.tsx     ⚠️ Needs data binding
│   │   └── AdminNewsletterCampaignsPage.tsx ⚠️ Needs data binding
│   └── (MISSING) CampaignEditor.tsx
├── hooks/
│   ├── use-subscribe.ts         ✅ Subscription
│   ├── use-subscribers.ts       ✅ List & update
│   ├── use-campaigns.ts         ✅ Campaign CRUD
│   └── (MISSING) use-campaign-editor.ts
├── types/
│   ├── index.ts                 ✅
│   └── types.ts                 ✅
├── schemas/
│   └── subscriber.schema.ts     ✅
└── server/
    └── router.ts                ⚠️ Backup implementation

app/api/[[...route]]/
└── newsletter.ts                ✅ 9 endpoints
```

### Notifications
```
features/notifications/
├── components/
│   ├── notification-bell.tsx    ✅ Header bell
│   ├── admin/
│   │   └── admin-notifications-page.tsx ⚠️ Skeleton
│   └── (MISSING) NotificationCenter.tsx
├── hooks/
│   ├── use-notifications.ts     ✅ Fetch & mark read
│   └── (MISSING) use-notification-templates.ts
├── types.ts                     ✅ Type definitions
├── (MISSING) schemas/
└── (MISSING) server/

app/api/[[...route]]/
└── notifications.ts             ⚠️ 4/12 endpoints (missing templates)
```

### Security
```
features/security/
├── components/
│   ├── device-management-page.tsx    ⚠️ Partial
│   ├── security-alerts-page.tsx      ⚠️ Partial
│   ├── captcha.tsx                   ✅
│   ├── language-switcher.tsx         ✅
│   └── (MISSING) PasswordPolicyEditor.tsx
├── hooks/
│   └── use-security.ts          ✅ 13 hooks
├── types.ts                     ✅ Enums & types
├── (MISSING) schemas/
├── (MISSING) server/
└── (MISSING) api/

app/api/[[...route]]/
└── security.ts                  ✅ 16 endpoints
```

---

## How to Add Missing Files

### 1. Create a Hook
```typescript
// features/<feature>/hooks/use-new-hook.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/hono-client";
import { toast } from "sonner";

export function useNewHook() {
  return useQuery({
    queryKey: ["feature", "hook"],
    queryFn: async () => {
      const res = await client.api.feature.new.$get();
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as { success: boolean; data: unknown };
    },
  });
}
```

### 2. Create a Component
```typescript
// features/<feature>/components/NewComponent.tsx
"use client";

import { useNewHook } from "../hooks/use-new-hook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NewComponent() {
  const { data, isLoading, error } = useNewHook();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Render data */}
      </CardContent>
    </Card>
  );
}
```

### 3. Create Types
```typescript
// features/<feature>/types.ts
export interface Item {
  id: string;
  name: string;
  createdAt: Date;
}

export interface CreateItemInput {
  name: string;
}
```

### 4. Create Schemas
```typescript
// features/<feature>/schemas/item.schema.ts
import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "Name required").max(255),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
```

---

## Testing Your Changes

### Create E2E Test
```bash
npx playwright test tests/<feature>.spec.ts
```

### Run Type Check
```bash
bunx tsc --noEmit
```

### Run Linting
```bash
bun run lint
```

---

## Common Patterns

### Admin Middleware
```typescript
import { adminMiddleware } from "@/lib/audit";

app.get("/", adminMiddleware, async (c) => {
  // Only admins can access
});
```

### Response Helpers
```typescript
import { ok, created, list, error, notFound, unauthorized } from "@/lib/api/response";

return ok(c, data);
return created(c, data);
return list(c, items, { total, page, limit, totalPages });
return error(c, "message", "code", 400);
return notFound(c, "Not found");
return unauthorized(c, "Not authenticated");
```

### Zod Validation
```typescript
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

app.post("/", zValidator("json", z.object({
  name: z.string(),
})), async (c) => {
  const body = c.req.valid("json");
  // body is typed
});
```

---

## Deployment Checklist

- [ ] All APIs have validation
- [ ] All mutations have error handling
- [ ] All admin endpoints have auth checks
- [ ] Database indexes are optimized
- [ ] Types are strict (no `any`)
- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Build succeeds

---


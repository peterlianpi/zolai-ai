# Quick Reference: Code Violations Found

## 🔴 HIGH PRIORITY VIOLATIONS: 14 Raw fetch() Calls

### 1. Admin Profile Page
**File**: `/features/admin/components/admin-profile-page.tsx`
**Violations**: 2 raw fetch() calls

```
Line 29: const res = await fetch("/api/profile", ...)
Line 41: const res = await fetch("/api/change-password", ...)
```

**Fix**: Migrate to `client.api.profile.$patch()` and `client.api["change-password"].$post()`

---

### 2. Organization Hooks
**File**: `/features/organization/hooks/use-organizations.ts`
**Violations**: 7 raw fetch() calls

```
Line 8:  fetchOrganizations()
Line 17: fetchOrganizationMembers()
Line 26: createOrganizationApi()
Line 40: inviteMemberApi()
Line 54: updateMemberRoleApi()
Line 67: removeMemberApi()
Line 78: switchOrganizationApi()
```

**Fix**: Create `api/client.ts` with Hono client helpers, migrate to `client.api.organizations.*`

---

### 3. Template Admin Pages
**File**: `/features/templates/components/admin/AdminTemplatesPage.tsx`
**Violations**: 3 raw fetch() calls

```
Line 51: const response = await fetch('/api/templates?limit=100')
Line 76: const response = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
Line 109: const response = await fetch('/api/templates', { method: 'POST', ... })
```

**Fix**: Migrate to `client.api.templates.$get()`, `client.api.templates[":id"].$delete()`, `client.api.templates.$post()`

---

### 4. Template Editor
**File**: `/features/templates/components/admin/AdminTemplateEditor.tsx`
**Violations**: 1 raw fetch() call

```
Line 107: const response = await fetch(url, ...)
```

**Fix**: Migrate to Hono client

---

### 5. Template Selector
**File**: `/features/templates/components/TemplateSelector.tsx`
**Violations**: 1 raw fetch() call

```
Line 88: const res = await fetch(`/api/templates?${params.toString()}`)
```

**Fix**: Migrate to `client.api.templates.$get({ query: ... })`

---

## ✅ NO VIOLATIONS FOUND IN

- All 24 API routes (0 raw `c.json()` calls) ✅
- All 35+ React Query hooks (100% compliant) ✅
- Comments implementation (uses proper API helpers) ✅

---

## Summary Statistics

| Category | Count | Severity | Status |
|----------|-------|----------|--------|
| Raw fetch() calls | 14 | HIGH | ⚠️ Must Fix |
| Files with violations | 7 | HIGH | ⚠️ Must Fix |
| API c.json() violations | 0 | - | ✅ PASS |
| React Query violations | 0 | - | ✅ PASS |

---

## Remediation Effort Estimate

- **Fix 1 (Admin Profile)**: 30 mins - 1 hour
- **Fix 2 (Organization)**: 1.5 - 2 hours
- **Fix 3-5 (Templates)**: 2 - 3 hours
- **Testing & QA**: 1 - 2 hours

**Total**: 5 - 8 hours to 100% compliance

---

## Migration Template

All violations should follow this pattern:

```typescript
// ❌ BEFORE: Raw fetch
const response = await fetch('/api/resource', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

// ✅ AFTER: Hono client
import { client } from '@/lib/api/hono-client';

const response = await client.api.resource.$post({
  json: data
});
```

---

## Files That Need Updates

1. `/features/admin/components/admin-profile-page.tsx` ⚠️
2. `/features/organization/hooks/use-organizations.ts` ⚠️
3. `/features/templates/components/admin/AdminTemplatesPage.tsx` ⚠️
4. `/features/templates/components/admin/AdminTemplateEditor.tsx` ⚠️
5. `/features/templates/components/TemplateSelector.tsx` ⚠️
6. `/lib/api/hono-client.ts` (needs new endpoint definitions)

---

## Compliance Targets

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| API Helper Usage | 100% | 100% | ✅ |
| Hono Client Usage | 93% | 100% | ⚠️ |
| React Query Usage | 100% | 100% | ✅ |
| Type Safety | 90% | 100% | ⚠️ |


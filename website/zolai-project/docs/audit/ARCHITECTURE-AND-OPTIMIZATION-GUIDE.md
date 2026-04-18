# Zolai AI — Architecture & Optimization Guide

> Complete documentation of the codebase refactoring, performance optimization, and AI-assisted development workflow.

---

## Table of Contents

1. [Architecture Refactoring](#1-architecture-refactoring)
2. [API Response Standardization](#2-api-response-standardization)
3. [Cache Optimization](#3-cache-optimization)
4. [Type Safety & Prisma Integration](#4-type-safety--prisma-integration)
5. [Performance Optimization](#5-performance-optimization)
6. [Error & Not-Found Templates](#6-error--not-found-templates)
7. [Feature Router Extraction](#7-feature-router-extraction)
8. [AI Agent Workflow & Prompt Engineering](#8-ai-agent-workflow--prompt-engineering)
9. [Recommended Next Steps](#9-recommended-next-steps)

---

## 1. Architecture Refactoring

### What We Did
Moved feature-specific logic from `app/*` into `features/*` to follow the "thin app layer" pattern.

### Why We Did It
- **Problem:** `app/*` files contained business logic, database queries, and UI rendering mixed together
- **Impact:** Hard to maintain, test, and reuse code; violated separation of concerns
- **Goal:** Make `app/*` only handle routing/layout, while `features/*` owns domain logic

### How We Did It

#### Before (Bad Pattern)
```tsx
// app/(protected)/admin/settings/page.tsx
export default function Page() {
  // 800+ lines of form logic, API calls, state management
  const [formValues, setFormValues] = useState({...});
  const updateMutation = useMutation({...});
  // ... hundreds of lines
}
```

#### After (Good Pattern)
```tsx
// app/(protected)/admin/settings/page.tsx
import AdminSettingsPage from "@/features/admin/components/admin-settings-page";

export default function Page() {
  return <AdminSettingsPage />;
}

// features/admin/components/admin-settings-page.tsx
export default function AdminSettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Configure site settings</p>
      </div>
      <AdminSettingsForm />
    </div>
  );
}

// features/settings/components/admin-settings-form.tsx
export default function AdminSettingsForm() {
  // All form logic, state, API calls live here
}
```

### Issues Encountered
1. **Duplicate type definitions** — Same interfaces defined in multiple places
2. **Merge conflicts** — Unresolved `<<<<<<< HEAD` markers in source files
3. **Import path confusion** — Moving files broke relative imports

### How We Fixed Them
1. Created shared types in `lib/types/models.ts` using Prisma-generated models
2. Resolved merge conflicts by keeping the newer branch's implementation
3. Used absolute imports (`@/features/...`) consistently

### Recommended Structure
```
app/
  (public)/
    layout.tsx          → Thin wrapper, imports from features
    page.tsx            → Thin wrapper, imports from features
  (protected)/
    admin/
      settings/page.tsx → Thin wrapper
      media/page.tsx    → Thin wrapper
      analytics/page.tsx → Thin wrapper

features/
  admin/
    components/
      admin-settings-page.tsx    → Admin shell/layout
      admin-media-page.tsx       → Admin media page
      admin-analytics-page.tsx   → Admin analytics page
  settings/
    components/
      admin-settings-form.tsx    → Settings form logic
      user-settings-page.tsx     → User settings page
    server/
      public-router.ts           → Public settings API
      admin-router.ts            → Admin settings API
      constants.ts               → Shared constants/cache tags
    types.ts                     → Settings types
    hooks/                       → React Query hooks
    api/                         → Client API helpers
```

### How to Use This Pattern
1. Create thin page wrapper in `app/*`
2. Create feature component in `features/<domain>/components/`
3. Keep business logic in feature components
4. Use server helpers for data fetching
5. Reuse across multiple pages if needed

---

## 2. API Response Standardization

### What We Did
Standardized all API route responses to use shared helpers from `lib/api/response.ts`.

### Why We Did It
- **Problem:** Inconsistent response shapes across routes (`{ success: true, data }` vs `{ success: true, data: { posts } }`)
- **Impact:** Frontend had to handle multiple response formats; hard to maintain
- **Goal:** Single consistent response shape across all endpoints

### How We Did It

#### Response Helpers
```typescript
// lib/api/response.ts
export const ok = <T>(c: Context, data: T) => 
  c.json({ success: true, data }, 200);

export const created = <T>(c: Context, data: T) => 
  c.json({ success: true, data }, 201);

export const list = <T, M>(c: Context, data: T[], meta: M) => 
  c.json({ success: true, data, meta }, 200);

export const notFound = (c: Context, message = "Resource not found") => 
  error(c, message, "NOT_FOUND", 404);

export const badRequest = (c: Context, message = "Bad request") => 
  error(c, message, "BAD_REQUEST", 400);

export const conflict = (c: Context, message = "Already exists") => 
  error(c, message, "CONFLICT", 409);
```

#### Before
```typescript
return c.json({
  success: true,
  data: {
    redirects: data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  },
});
```

#### After
```typescript
return list(c, data, { total, page, limit, totalPages: Math.ceil(total / limit) });
```

### Issues Encountered
1. **Missing `badRequest` export** — Route imported it but it didn't exist
2. **Response shape changes** — Some consumers expected nested data keys
3. **Type mismatches** — `ContentfulStatusCode` imported as value instead of type

### How We Fixed Them
1. Added missing `badRequest` helper to `lib/api/response.ts`
2. Changed `ContentfulStatusCode` to type-only import: `import type { ContentfulStatusCode }`
3. Updated frontend consumers to expect standardized response shape

### Recommended Usage
```typescript
// Success responses
return ok(c, data);           // 200
return created(c, data);      // 201
return list(c, items, meta);  // 200 with pagination

// Error responses
return notFound(c, "Not found");
return badRequest(c, "Invalid input");
return conflict(c, "Already exists");
return forbidden(c, "Permission denied");
```

---

## 3. Cache Optimization

### What We Did
Implemented server-side caching with `unstable_cache` and tag-based invalidation for public data.

### Why We Did It
- **Problem:** Repeated client-side API calls for same public data (menus, settings, posts)
- **Impact:** Slow page loads, unnecessary database queries, poor SEO
- **Goal:** Cache public data on server, invalidate only when data changes

### How We Did It

#### Public Layout Data Caching
```typescript
// features/public/server/get-public-layout-data.ts
import { unstable_cache } from "next/cache";

const getCachedPublicLayoutData = unstable_cache(
  async (): Promise<PublicLayoutData> => {
    const [menus, siteSettings] = await Promise.all([
      prisma.menu.findMany({ where: { location: { not: null } } }),
      prisma.siteSetting.findMany({ where: { key: { in: PUBLIC_LAYOUT_KEYS } } }),
    ]);
    return { menus, siteSettings };
  },
  ["public-layout-data"],
  {
    revalidate: 60,
    tags: ["public-layout-data", "menus", "site-settings"],
  },
);
```

#### Cache Invalidation After Mutations
```typescript
// After creating/updating/deleting menus
revalidateTag("menus", "max");
revalidateTag("public-layout-data", "max");

// After updating site settings
revalidateTag("site-settings", "max");
revalidateTag("public-layout-data", "max");

// After content changes
revalidateTag("content", "max");
revalidateTag("home-page-data", "max");
```

### Issues Encountered
1. **Duplicate requests** — Header, Footer, and Banner each fetched settings independently
2. **Cache tag mismatch** — Different files used different string literals for same tags
3. **Stale data** — No invalidation after admin changes

### How We Fixed Them
1. Moved data fetching to `app/(public)/layout.tsx` server component
2. Created shared constants in `features/settings/server/constants.ts`
3. Added `revalidateTag` calls after all mutations

### Shared Cache Constants
```typescript
// features/settings/server/constants.ts
export const PUBLIC_SITE_SETTING_KEYS = [
  "site_name", "site_url", "site_description",
  "site_timezone", "under_development", "under_development_message",
] as const;

export const PUBLIC_LAYOUT_SETTING_KEYS = [
  "site_name", "social_facebook", "social_twitter",
  "social_youtube", "social_instagram", "social_tiktok",
  "under_development", "under_development_message",
] as const;

export const SITE_SETTINGS_CACHE_TAG = "site-settings";
export const PUBLIC_LAYOUT_CACHE_TAG = "public-layout-data";
```

### Recommended Pattern
1. Use `unstable_cache` for server-side data fetching
2. Define cache tags as shared constants
3. Revalidate after mutations with `revalidateTag(tag, "max")`
4. Use `revalidate: 60` as TTL fallback
5. Keep public data in RSC, not client fetches

---

## 4. Type Safety & Prisma Integration

### What We Did
Eliminated all `any` usage in main codebase and integrated Prisma-generated models as the source of truth.

### Why We Did It
- **Problem:** Unsafe `any` types everywhere; manual type definitions duplicated Prisma models
- **Impact:** Runtime errors, broken refactors, inconsistent types
- **Goal:** Type-safe codebase using generated Prisma models

### How We Did It

#### Shared Type Helpers
```typescript
// lib/types/models.ts
import type { CommentModel, MediaModel, PostModel, UserModel } from "@/lib/generated/prisma/models";

export type PrismaModel<N extends PrismaModelName> = PrismaModelMap[N];

export type PrismaModelPick<N extends PrismaModelName, K extends keyof PrismaModel<N>> = 
  Pick<PrismaModel<N>, K>;

export type PrismaModelWithRelations<N extends PrismaModelName, R extends object = Record<string, never>> = 
  PrismaModel<N> & R;

// For API responses (Date -> string)
export type SerializedPrismaModel<N extends PrismaModelName> = 
  SerializedValue<PrismaModel<N>>;
```

#### Before (Bad)
```typescript
// Anywhere in codebase
const data = await response.json() as any;
interface Comment { id: string; content: string; /* manual fields */ }
```

#### After (Good)
```typescript
import type { SerializedPrismaModelWithRelations } from "@/lib/types/models";

export type Comment = SerializedPrismaModelWithRelations<"comment", {
  author?: CommentAuthor | null;
}>;

const json = await response.json() as CommentsListResponse;
```

### Issues Encountered
1. **`any` in API responses** — `as any` casts everywhere
2. **Duplicate interfaces** — Same types defined in multiple files
3. **Prisma model mismatch** — Manual types didn't match generated models

### How We Fixed Them
1. Created typed response interfaces instead of `as any`
2. Consolidated types into `lib/types/` and `features/*/types.ts`
3. Used Prisma models as base, extended with `&` for relations

### Recommended Pattern
```typescript
// For server-side types (with Date objects)
import type { PrismaModel } from "@/lib/types/models";
type Post = PrismaModel<"post">;

// For client/API types (with string dates)
import type { SerializedPrismaModel } from "@/lib/types/models";
type PostAPI = SerializedPrismaModel<"post">;

// For extended types with relations
type PostWithAuthor = PrismaModelWithRelations<"post", {
  author: { id: string; name: string };
}>;
```

---

## 5. Performance Optimization

### What We Did
Optimized redirect lookup, SMTP initialization, and public data loading.

### Why We Did It
- **Problem:** Slow page loads due to redundant API calls and expensive module initialization
- **Impact:** Poor user experience, high server load
- **Goal:** Faster responses, fewer redundant operations

### Key Optimizations

#### 1. Redirect Lookup Optimization
**Before:** `proxy.ts` made HTTP request to `/api/redirects/lookup` on every page load
**After:** Direct database lookup with cached redirect rules

```typescript
// proxy.ts
import { lookupRedirect, recordRedirectHit } from "@/features/redirects/server/lookup";

const redirect = await lookupRedirect(pathname);
if (redirect) {
  recordRedirectHit(redirect.id);
  return NextResponse.redirect(destUrl, redirect.statusCode);
}
```

#### 2. Lazy SMTP Initialization
**Before:** SMTP transporter verified on module import (blocked route compilation)
**After:** Lazy initialization only when sending email

```typescript
let transporter: nodemailer.Transporter | null = null;
let verifyPromise: Promise<void> | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({...});
  }
  return transporter;
}

async function verifyTransporter() {
  if (verifyPromise) return verifyPromise;
  verifyPromise = getTransporter().verify()
    .then(() => console.log("[Mail] Ready"))
    .catch(() => { verifyPromise = null; });
  return verifyPromise;
}
```

#### 3. Public Data Server-Side Loading
**Before:** Header, Footer, Banner each made separate client API calls
**After:** Single server-side fetch in layout, passed as props

```tsx
// app/(public)/layout.tsx
export default async function PublicLayout({ children }) {
  const { menus, siteSettings } = await getPublicLayoutData();
  return (
    <div>
      <UnderDevelopmentBanner siteSettings={siteSettings} />
      <Header menus={menus} siteSettings={siteSettings} />
      <main>{children}</main>
      <Footer menus={menus} siteSettings={siteSettings} />
    </div>
  );
}
```

### Issues Encountered
1. **Slow filesystem warning** — `.next/dev` on network drive
2. **SMTP blocking** — Email verification on import delayed route compilation
3. **Duplicate requests** — Multiple client fetches for same data

### How We Fixed Them
1. Moved `.next/dev` to local disk (recommended)
2. Made SMTP initialization lazy
3. Consolidated public data fetching to server-side

### Recommended Improvements
1. Keep `.next/dev` on fast local disk
2. Use `unstable_cache` for public data
3. Minimize work in `proxy.ts`
4. Split large route modules

---

## 6. Error & Not-Found Templates

### What We Did
Created reusable error/not-found templates for public and protected contexts.

### Why We Did It
- **Problem:** Duplicate error/not-found pages across `app/*` directories
- **Impact:** Inconsistent UX, hard to maintain, code duplication
- **Goal:** Single source of truth for error pages per context

### How We Did It

#### Public Status Page
```typescript
// features/public/components/public-status-page.tsx
export function PublicStatusPage({ code, title, description, retryLabel, onRetry }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-9xl font-bold text-muted-foreground/20">{code}</h1>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="flex gap-3">
        <Button onClick={() => router.back()}>Go Back</Button>
        <Button asChild><Link href="/">Go Home</Link></Button>
        <Button variant="ghost" onClick={onRetry ?? (() => router.refresh())}>
          {retryLabel}
        </Button>
      </div>
    </div>
  );
}
```

#### Protected Status Page
```typescript
// features/admin/components/protected-status-page.tsx
export function ProtectedStatusPage({ code, title, description, primaryHref, primaryLabel }) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      <div className="rounded-xl border bg-card p-8 text-center">
        {/* Similar structure with admin-specific styling */}
      </div>
    </div>
  );
}
```

### Usage
```tsx
// app/not-found.tsx
import { PublicStatusPage } from "@/features/public/components/public-status-page";
export default function NotFound() {
  return <PublicStatusPage code="404" title="Page Not Found" description="..." />;
}

// app/(protected)/not-found.tsx
import { ProtectedStatusPage } from "@/features/admin/components/protected-status-page";
export default function NotFound() {
  return <ProtectedStatusPage code="404" title="Page Not Found" description="..." />;
}
```

---

## 7. Feature Router Extraction

### What We Did
Extracted Hono routers from `app/api/[[...route]]/*` into feature-owned server modules.

### Why We Did It
- **Problem:** Large route files in `app/api` mixed routing with business logic
- **Impact:** Hard to test, maintain, and reuse route handlers
- **Goal:** Thin API entrypoints, feature-owned routers

### How We Did It

#### Before
```typescript
// app/api/[[...route]]/menus.ts (300+ lines)
const menus = new Hono()
  .get("/", ...)
  .post("/", ...)
  // ... 20 more routes
export default menus;
```

#### After
```typescript
// features/menus/server/router.ts
const menusRouter = new Hono()
  .get("/", ...)
  .post("/", ...)
export default menusRouter;

// app/api/[[...route]]/menus.ts
import menusRouter from "@/features/menus/server/router";
export default menusRouter;
```

### Extracted Routers
| Feature | Router Location | App Wrapper |
|---------|----------------|-------------|
| Content | `features/content/server/router.ts` | `app/api/[[...route]]/content.ts` |
| Comments | `features/comments/server/router.ts` | `app/api/[[...route]]/comments.ts` |
| Menus | `features/menus/server/router.ts` | `app/api/[[...route]]/menus.ts` |
| Redirects | `features/redirects/server/router.ts` | `app/api/[[...route]]/redirects.ts` |
| Site Settings | `features/settings/server/public-router.ts` | `app/api/[[...route]]/site-settings.ts` |
| Admin Settings | `features/settings/server/admin-router.ts` | Mounted in `admin.ts` |

### Recommended Pattern
```typescript
// features/<feature>/server/router.ts
import { Hono } from "hono";
import { ok, created, list, notFound } from "@/lib/api/response";

const router = new Hono()
  .get("/", async (c) => {
    const data = await fetchData();
    return ok(c, data);
  })
  .post("/", async (c) => {
    const item = await createItem(c.req.valid("json"));
    revalidateTag("feature-data", "max");
    return created(c, item);
  });

export default router;
```

---

## 8. AI Agent Workflow & Prompt Engineering

### What We Did
Used subagent teams to parallelize refactoring work across multiple files and features.

### Why We Did It
- **Problem:** Sequential refactoring is slow; context limits prevent large changes
- **Impact:** Long iteration cycles, incomplete refactors
- **Goal:** Parallel execution with clear boundaries

### How We Used Subagents

#### Task Distribution
```
Agent 1: Extract admin settings router
Agent 2: Standardize forms API responses
Agent 3: Standardize audit API responses
Agent 4: Standardize media API responses
```

#### Effective Prompt Structure
```markdown
Your task: [Clear, specific action]

Context:
- Current file location
- Target file location
- Existing patterns to follow

What to do:
1. Step 1
2. Step 2
3. Step 3

Rules:
- Do NOT break X
- Keep Y unchanged
- Use Z pattern

Return:
- Summary of changes
- Confirmation of safety
```

### Prompt Improvement Guidelines

#### ❌ Bad Prompt
```
Fix the code
```

#### ✅ Good Prompt
```
Extract the user management routes from app/api/[[...route]]/admin.ts into 
features/users/server/admin-router.ts. Keep all Prisma queries unchanged. 
Use ok(), list(), notFound() from @/lib/api/response. The mounted path 
must stay /admin/users. Return exact changes made.
```

#### Key Elements of Good Prompts
1. **Specific action** — What exactly to do
2. **Context** — Current state, target state
3. **Constraints** — What NOT to change
4. **Patterns** — What to follow
5. **Output format** — What to return

### Recommended Agent Workflow
1. **Explore first** — Use `explore` agent to understand codebase
2. **Plan changes** — Map all files that need modification
3. **Parallel execution** — Use `general` agents for independent tasks
4. **Verify** — Run `bun run lint` after each batch
5. **Commit** — Only after all changes pass

---

## 9. Recommended Next Steps

### Immediate Priorities
1. **Move remaining admin routes** — Extract users, posts, media, redirects from `admin.ts`
2. **Add cache invalidation** — Ensure all mutations revalidate affected tags
3. **Standardize remaining APIs** — Convert all `c.json()` to response helpers

### Medium-Term Improvements
1. **Server actions for mutations** — Replace client-side form submissions
2. **Database query optimization** — Add indexes, optimize N+1 queries
3. **Bundle analysis** — Identify and split large chunks

### Long-Term Goals
1. **Full test coverage** — Add E2E and unit tests
2. **Performance monitoring** — Real metrics, not mock data
3. **CI/CD pipeline** — Automated lint, type-check, test, build

### How to Continue This Work
1. Run `bun run lint` to verify current state
2. Pick one section from "Next Steps"
3. Use subagent teams for parallel work
4. Verify with `bun run lint` and `bun run build`
5. Document changes in this file

---

## Appendix: Quick Reference

### File Structure
```
app/                          → Thin routing layer only
features/                     → All business logic
  <feature>/
    components/               → UI components
    server/                   → API routers, server helpers
    hooks/                    → React Query hooks
    api/                      → Client API helpers
    types.ts                  → Feature types
    schemas/                  → Zod validation schemas
lib/
  types/                      → Shared global types
  api/response.ts             → API response helpers
  generated/prisma/           → Generated Prisma types
```

### Cache Tags
| Tag | Invalidated By |
|-----|---------------|
| `menus` | Menu CRUD operations |
| `site-settings` | Site setting updates |
| `public-layout-data` | Menu or setting changes |
| `content` | Post/term mutations |
| `home-page-data` | Content changes |
| `redirects` | Redirect CRUD operations |
| `media` | Media CRUD operations |

### Response Helpers
| Helper | Status | Use Case |
|--------|--------|----------|
| `ok(c, data)` | 200 | Successful read/update |
| `created(c, data)` | 201 | Successful creation |
| `list(c, data, meta)` | 200 | Paginated list |
| `notFound(c, msg)` | 404 | Resource not found |
| `badRequest(c, msg)` | 400 | Invalid input |
| `conflict(c, msg)` | 409 | Duplicate resource |
| `forbidden(c, msg)` | 403 | Permission denied |

### Common Commands
```bash
bun run dev          # Start dev server
bun run build        # Production build
bun run lint         # Lint codebase
bunx prisma migrate dev --name <name>  # DB migration
bunx prisma generate # Regenerate Prisma types
npx playwright test  # Run E2E tests
```

---

*Last updated: 2026-04-08*
*Status: Lint passes cleanly, all `any` removed, API routes standardized, cache tags implemented*
# Copilot Instructions for Zolai AI

This guide helps Copilot sessions work effectively in this repository. Reference this when implementing features, fixing bugs, or exploring the codebase.

## Quick Start Commands

### Build, Test & Lint

```bash
# Development
bun run dev                    # Start dev server (localhost:3000)
bun run build                  # Production build (Turbopack)
bun run lint                   # ESLint check (Next.js + TypeScript)

# Database
bunx prisma migrate dev --name <name>  # Create + apply migration
bunx prisma generate          # Regenerate Prisma client types
bunx prisma db seed           # Seed test data (optional)

# Testing - Playwright E2E
npx playwright test                    # Run all E2E tests
npx playwright test --headed           # Run in headed mode (see browser)
npx playwright test --ui               # Interactive UI mode
npx playwright test -g "search query"  # Run tests matching title pattern
npx playwright test tests/auth.spec.ts # Run single test file
npx playwright show-report             # View HTML test report

# Testing - Vitest Unit
bun run test:unit              # Run all unit tests once
bun run test:unit:watch        # Watch mode for development
```

**Important:** Always run `bun run build` before running Playwright tests against production build.

## Architecture Overview

### Stack
- **Next.js 16** (App Router, RSC) with Turbopack
- **Prisma 7** + **PostgreSQL** (MySQL also supported)
- **Better Auth** (with admin & emailOTP plugins)
- **Hono** for API routes (type-safe RPC)
- **React 19** + **shadcn/ui** + **Tailwind CSS v4**
- **TanStack Query** for client state
- **Playwright** for E2E testing

### Key File Locations

```
app/                      # Next.js App Router
├── api/[[...route]]/    # Hono API (catch-all)
├── (protected)/         # Auth-required pages
└── [locale]/            # i18n locale param

features/                 # Feature-sliced design (domain modules)
├── <feature>/
│   ├── components/      # UI components
│   ├── hooks/           # use* hooks
│   ├── api/             # API client helpers
│   ├── server/          # Server-only code
│   ├── types.ts         # Feature types
│   └── schemas/         # Zod schemas

lib/                      # Core utilities & config
├── auth.ts              # Better Auth setup
├── auth-client.ts       # Client-side auth
├── site.ts              # Global metadata (OG, JSON-LD)
├── prisma.ts            # Prisma singleton
├── generated/prisma/    # Auto-generated Prisma types
└── api/                 # API helpers (Hono client, response utils)

prisma/                   # Database schema & migrations
├── schema.prisma        # Single source of truth
└── seed.ts              # Seeding script

proxy.ts                  # Next.js 16 request interception (replaces middleware)
```

### Database Architecture

- **Provider switching:** Set `DATABASE_PROVIDER=postgresql` or `DATABASE_PROVIDER=mysql` in `.env`
- **Core tables:** User, Session, Account, Verification, Notification, AuditLog, RateLimit, UserPreferences
- **Query optimization:** Prefer `select` over `include` to avoid N+1 queries
- **Prisma singleton:** Always use `lib/prisma.ts`—never instantiate `PrismaClient` directly

### i18n & Localization

- **English:** Default locale (root `/` URLs)
- **Myanmar (Burmese):** Available at `/my/...` URLs
- **Implementation:** Canonical URLs with `NextResponse.rewrite()` in `proxy.ts` (browser sees clean `/my/...` while Next.js processes with `?locale=my`)
- **Supported locales:** defined in `locales/` directory

## Code Conventions

### Imports & Structure
- **Absolute imports:** Use `@/` alias (e.g., `@/components/ui/button`)
- **Grouping order:** React/Next → External libs → Internal modules → Local
- **RSC by default:** React Server Components everywhere; `"use client"` only for interactive components
- **No Pages Router:** App Router exclusively

### TypeScript & Validation
- **Strict mode:** No `any` types; use `unknown` or specific types
- **Validation:** Zod + `@hono/zod-validator` required on all API inputs
- **Interfaces vs types:** Interfaces for objects, types for unions
- **Prisma types:** Import from `@/lib/generated/prisma/models` for type safety

### API & Routing
- **Hono RPC:** All routes mount via `app/api/[[...route]]/route.ts`
- **Type-safe chain:** Sub-routers use `.route()` chain to preserve types:
  ```typescript
  const routes = app.route("/feature", featureRouter);
  export type AppType = typeof routes;
  ```
- **Response shape:** `{ success: boolean, data?: T, error?: { code, message } }`
- **Standardized helpers:** Use `ok()`, `created()`, `list()`, `error()`, `notFound()` from `@/lib/api/response.ts`

### Component & File Naming
- **Components:** `PascalCase` (e.g., `DashboardBuilder.tsx`)
- **Hooks:** `camelCase` with `use` prefix (e.g., `useTablePagination`)
- **API routes:** lowercase with hyphens (e.g., `check-role.ts`)

### Admin UI & Tables
- Render based on user preference (`tablePagination`: `"infinite"` or `"normal"`)
- Use `useTablePagination()` hook
- Render `InfiniteTable` for infinite scroll OR standard `Table` + pagination

### Feature Folder Structure
```
features/<feature>/
├── components/          # UI components (including admin/ subfolder if needed)
├── hooks/              # use* hooks
├── api/                # Client helpers (not API route itself)
├── server/             # Server-only code
├── types.ts            # Feature-specific types
└── schemas/            # Zod validation schemas
```

## Error Handling & Security

### Error Patterns
- **Server Actions:** Return `{ success: false, error: "message" }`
- **API Routes:** Return `{ error: { code, message } }`
- **Database:** Catch Prisma `P2002` (unique constraint) → return `409 Conflict`
- **Client:** Use `toast` from `sonner` for user feedback
- **Never expose:** Raw stack traces, database internals, or detailed error paths in API responses

### Security
- ✅ Zod validation on all inputs (client + server)
- ✅ Session validation in page layouts (not middleware only)
- ✅ CSRF protection via `@/lib/auth/csrf.ts`
- ✅ Rate limiting on auth endpoints
- ✅ Audit logging for all sensitive mutations
- ❌ No secrets in code—use `.env` / `.env.local`
- ❌ No hardcoded metadata—import from `lib/site.ts`

## Database & Migrations

### Workflow
1. Edit `prisma/schema.prisma`
2. Run: `bunx prisma migrate dev --name <descriptive_name>`
3. Prisma auto-generates types in `@/lib/generated/prisma/models`
4. Update `prisma/seed.ts` for test data
5. Commit `schema.prisma` + migration files

### Multi-Database Support
```bash
# PostgreSQL (default)
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# MySQL
DATABASE_PROVIDER=mysql
DATABASE_URL=mysql://user:pass@host:3306/dbname
```

### Query Optimization
- ❌ Avoid `include: { related: true }` (fetches all fields)
- ✅ Use `select: { id: true, name: true }` (explicit field selection)
- ✅ Use generated types from `@/lib/generated/prisma/models`

## Testing Strategy

### Playwright E2E
- Location: `tests/`
- Spec files: `tests/**/*.spec.ts`
- Coverage areas: `auth/`, `api/`, `admin/`, `e2e/`, `performance/`, and security tests
- **Before E2E:** Run `bun run build` once
- Run specific suite: `npx playwright test tests/auth/`
- Key test categories:
  - **auth/** — Login, 2FA, password reset, session validation
  - **api/** — API endpoints, rate limiting, CSRF validation, response shapes
  - **admin/** — Protected routes, role checks, content management
  - **e2e/** — Full user workflows (create post, publish, redirect)
  - **performance/** — Core Web Vitals (LCP, INP, CLS)
  - **security/** — XSS, injection, auth bypasses, CORS

### Vitest Unit
- Location: `tests/**/*.test.ts` (alongside source or in `tests/`)
- Run once: `bun run test:unit`
- Watch mode: `bun run test:unit:watch`
- Coverage: provider is `v8`
- Scope: Utilities, validators, helpers (pure functions, no browser/DB)

## Repository Structure & Conventions

### Feature-Sliced Design
- Each domain gets its own folder: `features/<feature>/`
- All related code (components, hooks, types, validation) stays together
- Admin UI: prefer `features/<feature>/components/admin/` over separate `features/admin/`
- Export types from `features/<feature>/types.ts` for consumers

### Metadata & Configuration
- **Site-wide:** `lib/site.ts` (title, description, OG image, JSON-LD, canonical URLs)
- **Feature config:** `features/<feature>/types.ts` or `features/<feature>/schemas/`
- **Environment:** `.env.example` (template) → `.env.local` (local override, git-ignored)

### Redirects System
- **Pattern types:** Exact matching, wildcards (`/*`), regex (`/regex/` with `$1` capturing)
- **Lookup API:** `/api/redirects/lookup` (lightweight, called from `proxy.ts`)
- **Use case:** Preserve legacy WordPress URLs after migration

### WordPress Migration
- Legacy content: `docs/old-project/`
- Migration scripts: `scripts/`
- Export via WP REST API → import to Prisma
- Maintain redirect mapping for SEO

## Development Methodologies

### Before Starting a Task
1. **Read existing code** — Check similar features for patterns
2. **Plan first** — Identify all files to touch (API, UI, types, migrations)
3. **Write failing test** (TDD recommended)
4. **Implement to spec**
5. **Validate** — Run linter, typecheck, tests, build

### Spec-Driven Development
1. Define schema (Zod) → Types generated
2. Build API contract (Hono RPC)
3. Implement backend
4. Consume with typed client

## Development Methodologies

### Before Starting a Task
1. **Read existing code** — Check similar features for patterns
2. **Plan first** — Identify all files to touch (API, UI, types, migrations)
3. **Write failing test** (TDD recommended)
4. **Implement to spec**
5. **Validate** — Run linter, typecheck, tests, build

### Spec-Driven Development
1. Define schema (Zod) → Types generated
2. Build API contract (Hono RPC)
3. Implement backend
4. Consume with typed client

## Deployment & CI/CD

### Vercel Deployment (Recommended)

**Setup:**
```bash
vercel login
vercel link  # Connect this repo to Vercel
```

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "bun run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url"
  },
  "envPrefix": "NEXT_"
}
```

**Workflow:**
- Push to GitHub → Vercel auto-deploys to preview
- Merge to `main` → Vercel deploys to production
- Environment variables configured in Vercel dashboard
- Preview deployments show link in PR comments

**Key Features:**
- Automatic HTTPS
- Edge functions for low-latency API
- Built-in analytics & monitoring
- Instant rollback to previous deployment

### Self-Hosted Deployment (VPS/Server)

**Build for production:**
```bash
bun run build
# Output: .next/ (standalone mode ready)
```

**Using PM2 + Nginx:**
```bash
# Install PM2
npm install -g pm2

# Start app
cd /app && pm2 start "bun start" --name "mir"
pm2 save && pm2 startup

# Configure Nginx reverse proxy
# Location: /etc/nginx/sites-enabled/mir
# Proxy: localhost:3000 → mir.example.com

# SSL with Let's Encrypt
certbot certonly --standalone -d mir.example.com
# Renew: certbot renew
```

**PM2 Ecosystem File** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: "mir",
    script: "bun start",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    error_file: "logs/err.log",
    out_file: "logs/out.log"
  }]
};
```

**Using Docker:**
```dockerfile
# Multi-stage build
FROM oven/bun:latest AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:latest AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN bun run build

FROM oven/bun:latest
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["bun", "start"]
```

**Deploy with Docker:**
```bash
docker build -t mir:latest .
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e BETTER_AUTH_SECRET="..." \
  mir:latest
```

### CI/CD Pipeline (GitHub Actions)

**Setup** (`.github/workflows/ci.yml`):
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-test-build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
      
      - name: Lint
        run: bun run lint
      
      - name: Type check
        run: bunx tsc --noEmit
      
      - name: Build
        run: bun run build
      
      - name: Unit tests
        run: bun run test:unit
      
      - name: E2E tests
        run: |
          bun run build
          npx playwright install --with-deps
          npx playwright test
      
      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    needs: lint-test-build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Environment Variables

**Production** (Vercel Dashboard or `.env`):
```
DATABASE_URL=postgresql://...
DATABASE_PROVIDER=postgresql
BETTER_AUTH_SECRET=<generate: openssl rand -base64 32>
BETTER_AUTH_URL=https://mir.example.com
RESEND_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
```

**Development** (`.env.local`):
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/mir
BETTER_AUTH_SECRET=dev-secret-key
BETTER_AUTH_URL=http://localhost:3000
```

### Health Check & Monitoring

**Health endpoint** (implement in `app/api/health/route.ts`):
```typescript
export async function GET() {
  const db = await prisma.$queryRaw`SELECT 1`;
  return Response.json({ 
    status: "healthy", 
    timestamp: new Date(),
    database: db ? "connected" : "disconnected"
  });
}
```

**Uptime monitoring:**
- Use Vercel Analytics (built-in)
- Or: Uptime Robot, Pingdom, Datadog
- Alert on: 5xx errors, database disconnect, response time > 1s

### Database Backups

**PostgreSQL (Neon or self-hosted):**
```bash
# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql

# Automated (Neon): Built-in daily backups
# Self-hosted: Set up cron job with pg_dump
```

**MySQL:**
```bash
# Backup
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > backup.sql

# Restore
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < backup.sql
```

## Feature Implementation Examples

### Example 1: Adding a New Admin Feature (Content Management)

**Scenario:** Add ability to bulk-update post status (draft → published).

**Step 1: Define the schema** (`features/content/schemas/bulk-update.ts`):
```typescript
import { z } from "zod";
import { PostStatus } from "@/lib/generated/prisma/models";

export const bulkUpdatePostsSchema = z.object({
  postIds: z.array(z.string().uuid()),
  status: z.enum(["draft", "published", "archived"]),
  scheduledAt: z.date().optional(),
});

export type BulkUpdatePostsInput = z.infer<typeof bulkUpdatePostsSchema>;
```

**Step 2: Build API route** (`features/content/api/bulk-update-posts.ts`):
```typescript
import { hc } from "@/lib/api/hono-client";
import { bulkUpdatePostsSchema } from "../schemas/bulk-update";

export const useBulkUpdatePosts = () => {
  const client = hc<AppType>("");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BulkUpdatePostsInput) => {
      const res = await client.api.content["bulk-update-posts"].$post({
        json: input,
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
```

**Step 3: Implement backend** (`app/api/[[...route]]/content.ts`):
```typescript
const contentRouter = new Hono()
  .post(
    "/bulk-update-posts",
    zValidator("json", bulkUpdatePostsSchema),
    async (c) => {
      const input = c.req.valid("json");
      
      // Validate auth
      const session = await getSession(c);
      if (!session?.user?.role?.includes("admin")) {
        return c.json({ error: { code: "FORBIDDEN" } }, 403);
      }

      // Update database
      const updated = await prisma.post.updateMany({
        where: { id: { in: input.postIds } },
        data: { 
          status: input.status,
          scheduledAt: input.scheduledAt,
          updatedAt: new Date(),
        },
      });

      // Audit log
      await logAuditEvent({
        userId: session.user.id,
        action: "BULK_UPDATE_POSTS",
        resourceType: "post",
        changes: { postIds: input.postIds, status: input.status },
      });

      return c.json({ success: true, data: { count: updated.count } });
    }
  );
```

**Step 4: Build UI component** (`features/content/components/admin/BulkUpdatePosts.tsx`):
```typescript
"use client";

import { useBulkUpdatePosts } from "../../api/bulk-update-posts";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

export function BulkUpdatePosts({ selectedIds }: { selectedIds: string[] }) {
  const mutation = useBulkUpdatePosts();
  const [isPending, startTransition] = useTransition();

  const handlePublish = () => {
    startTransition(() => {
      mutation.mutate({
        postIds: selectedIds,
        status: "published",
      });
    });
  };

  return (
    <Button 
      onClick={handlePublish} 
      disabled={isPending || selectedIds.length === 0}
    >
      Publish ({selectedIds.length})
    </Button>
  );
}
```

**Step 5: Write tests** (`tests/admin/bulk-update-posts.spec.ts`):
```typescript
import { test, expect } from "@playwright/test";

test("bulk update post status", async ({ page, context }) => {
  await context.addCookies([
    { 
      name: "auth_session",
      value: adminSessionToken,
      domain: "localhost",
      path: "/"
    }
  ]);

  await page.goto("/admin/posts");
  
  // Select posts
  await page.click('input[data-test="select-all"]');
  
  // Bulk update
  await page.click('button:has-text("Publish")');
  await page.waitForURL("**/admin/posts?status=published");
  
  expect(await page.locator(".toast-success").isVisible()).toBe(true);
});
```

### Example 2: Adding a Public Feature (Search)

**Scenario:** Add post search with pagination and filters.

**Step 1: Schema** (`features/search/schemas/post-search.ts`):
```typescript
export const postSearchSchema = z.object({
  q: z.string().min(2),
  category: z.string().optional(),
  status: z.enum(["published"]),
  locale: z.enum(["en", "my"]),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});
```

**Step 2: API** (`app/api/[[...route]]/search.ts`):
```typescript
const searchRouter = new Hono()
  .get(
    "/posts",
    zValidator("query", postSearchSchema),
    async (c) => {
      const { q, category, status, locale, page, limit } = c.req.valid("query");
      const skip = (page - 1) * limit;

      const posts = await prisma.post.findMany({
        where: {
          status: "published",
          locale,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
          category: category ? { slug: category } : undefined,
        },
        select: { id: true, title: true, slug: true, excerpt: true },
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
      });

      const total = await prisma.post.count({
        where: posts[0] ? /* same where clause */ : {},
      });

      return c.json({ 
        success: true, 
        data: { posts, total, page, hasMore: skip + posts.length < total } 
      });
    }
  );
```

**Step 3: Client hook** (`features/search/hooks/usePostSearch.ts`):
```typescript
export function usePostSearch(query: string, locale: string) {
  return useQuery({
    queryKey: ["posts-search", query, locale],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await hc<AppType>("")
        .api.search.posts.$get({ 
          query: { q: query, locale, page: pageParam, limit: 20 } 
        });
      return res.json();
    },
    enabled: query.length >= 2,
    getNextPageParam: (last) => last.data.hasMore ? last.data.page + 1 : null,
  });
}
```

**Step 4: Component** (`features/search/components/PostSearch.tsx`):
```typescript
"use client";

import { useState } from "react";
import { usePostSearch } from "../hooks/usePostSearch";

export function PostSearch({ locale }: { locale: string }) {
  const [query, setQuery] = useState("");
  const { data, fetchNextPage, hasNextPage } = usePostSearch(query, locale);

  return (
    <div>
      <input
        type="text"
        placeholder="Search posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      
      {data?.pages.map((page) =>
        page.data.posts.map((post) => (
          <a key={post.id} href={`/${locale}/${post.slug}`}>
            {post.title}
          </a>
        ))
      )}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>Load more</button>
      )}
    </div>
  );
}
```

**Step 5: E2E test** (`tests/e2e/search.spec.ts`):
```typescript
test("search posts by title", async ({ page }) => {
  await page.goto("/search");
  
  await page.fill('input[placeholder*="Search"]', "Zolai language");
  await page.waitForLoadState("networkidle");
  
  const results = await page.locator('[data-test="search-result"]').count();
  expect(results).toBeGreaterThan(0);
  
  const firstTitle = await page.locator('[data-test="search-result"]').first().textContent();
  expect(firstTitle).toContain("Zolai language");
});
```

### Example 3: Adding an API-only Feature (Redirects Lookup)

**Scenario:** Look up redirect mappings (used by proxy.ts).

**Step 1: Schema** (`features/redirects/schemas/lookup.ts`):
```typescript
export const redirectLookupSchema = z.object({
  path: z.string().startsWith("/"),
});

export type RedirectResult = {
  source: string;
  destination: string;
  permanent: boolean;
} | null;
```

**Step 2: API** (`app/api/[[...route]]/redirects.ts`):
```typescript
const redirectRouter = new Hono()
  .get(
    "/lookup",
    zValidator("query", redirectLookupSchema),
    async (c) => {
      const { path } = c.req.valid("query");

      const redirect = await prisma.redirect.findFirst({
        where: { source: path },
        select: { destination: true, statusCode: true },
      });

      if (!redirect) {
        return c.json({ success: false, data: null }, 404);
      }

      return c.json({ 
        success: true, 
        data: {
          source: path,
          destination: redirect.destination,
          permanent: redirect.statusCode === 301,
        }
      });
    }
  );
```

**Step 3: Usage in proxy.ts**:
```typescript
export async function middleware(request: NextRequest) {
  const pathname = new URL(request.url).pathname;

  // Check for redirects
  const redirectRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/redirects/lookup?path=${pathname}`
  );
  
  if (redirectRes.ok) {
    const { data } = await redirectRes.json();
    if (data) {
      return NextResponse.redirect(
        new URL(data.destination, request.url),
        { status: data.permanent ? 301 : 302 }
      );
    }
  }

  return NextResponse.next();
}
```

---

### Common Patterns Summary

| Pattern | Use When | Example |
|---------|----------|---------|
| **Server Action** | Simple mutation, no RPC needed | Delete draft post |
| **Hono API + Client Hook** | Complex logic, reusable, typed RPC | Search, bulk operations |
| **Revalidation** | ISR/SSR, cache invalidation | Publish post → revalidatePath("/posts") |
| **Server Component** | Static/async data, no interactivity | Listing page with metadata |
| **Client Component + Query** | Dynamic data, filtering, pagination | Admin dashboard, search results |

This repo includes **Cursor Agent Skills** (`.cursor/skills/`) for specialized knowledge:

| Skill | Coverage |
|-------|----------|
| `mir-development` | Stack, conventions, file structure |
| `mir-hono-api` | Hono routes, RPC patterns, validation |
| `mir-project` | Roadmap, ETL, media/email workflows |
| `cursor-workflows` | IDE workflows (settings, migrations, reviews) |

**Full standards:** Read `AGENTS.md` (complete coding reference).

## MCP Servers

### Playwright MCP Server

Configure Copilot to run and analyze Playwright tests directly.

#### Setup Instructions

1. **Add to Copilot settings** (`.github/copilot-settings.json`):
   ```json
   {
     "mcp": {
       "servers": {
         "playwright": {
           "command": "npx",
           "args": ["playwright", "install"],
           "env": {
             "BROWSER": "chromium"
           }
         }
       }
     }
   }
   ```

2. **Or add to VS Code/Cursor settings** (`settings.json`):
   ```json
   {
     "copilot.advanced.tools.enable": true,
     "copilot.mcp.enabled": true,
     "[markdown]": {
       "editor.defaultFormatter": "Prettier"
     }
   }
   ```

3. **Install Playwright browsers** (one-time):
   ```bash
   npx playwright install --with-deps
   ```

#### Usage in Copilot

Once configured, Copilot can:
- Execute test suites: `npx playwright test tests/auth.spec.ts`
- Run specific test: `npx playwright test -g "login flow"`
- Generate test reports: `npx playwright show-report`
- Debug tests interactively: `npx playwright test --debug`

#### Test Inspection

Copilot can analyze:
- Test results and failure reasons
- Coverage gaps across `tests/auth/`, `tests/api/`, `tests/admin/`, `tests/e2e/`
- Performance test metrics
- Security test assertions

This is especially useful for:
- Debugging flaky tests
- Writing new test cases with immediate feedback
- Analyzing test coverage after code changes

### Prisma MCP Server (Optional)

For database introspection and schema queries.

#### Setup

```json
{
  "mcp": {
    "servers": {
      "prisma": {
        "command": "bunx",
        "args": ["prisma-mcp"]
      }
    }
  }
}
```

#### Capabilities

- Introspect schema: `bunx prisma db pull`
- Generate migrations: `bunx prisma migrate dev`
- Query type hints: Copilot gets autocomplete for Prisma operations
- Visual schema browser

### Node.js/Bun MCP Server (Optional)

For file system operations and package management.

#### Setup

```json
{
  "mcp": {
    "servers": {
      "filesystem": {
        "command": "node",
        "args": ["-e", "require('@modelcontextprotocol/server-filesystem').start()"]
      }
    }
  }
}
```

#### Capabilities

- Read/write files
- Directory traversal
- Create directories
- File search and patterns

### Environment Variable MCP Server (Recommended for Secrets)

Store and manage environment variables securely.

#### Setup

```json
{
  "mcp": {
    "servers": {
      "env-vault": {
        "command": "node",
        "args": ["-e", "require('@modelcontextprotocol/server-dotenv').start()"]
      }
    }
  }
}
```

#### Usage

- Reference `.env.example` (committed to git)
- Copilot won't expose actual secrets in responses
- Development `.env.local` stays local-only

### Installing Additional MCP Servers

1. **Check compatibility:** Ensure the MCP server supports your Node/Bun version
2. **Install package:** `npm install @modelcontextprotocol/server-<name>`
3. **Add to settings:** Update `.github/copilot-settings.json` with the server config
4. **Test:** Run `gh copilot suggest "list files in app/"`

### All Recommended MCPs for This Project

```json
{
  "mcp": {
    "servers": {
      "playwright": {
        "enabled": true,
        "command": "npx",
        "args": ["playwright", "test"],
        "timeout": 30000
      },
      "filesystem": {
        "enabled": true,
        "command": "node",
        "args": ["-e", "require('@modelcontextprotocol/server-filesystem').start()"],
        "timeout": 5000
      },
      "prisma": {
        "enabled": false,
        "command": "bunx",
        "args": ["prisma-mcp"],
        "timeout": 10000
      }
    }
  }
}
```

## Troubleshooting

### Build fails with Turbopack
- Clear cache: `rm -rf .next/`
- Reinstall deps: `bun install`
- Check for circular imports: use `bun build --analyze` or review import order

### Prisma types out of date
- Regenerate: `bunx prisma generate`
- After migrations, always commit generated files in `@/lib/generated/prisma/models`

### Tests fail after database changes
- Recreate test database: `npx playwright test --reporter=list` with fresh DB
- Check `tests/fixtures/seed-test-data.ts` matches current schema

### E2E tests fail in headless mode
- Run headed: `npx playwright test --headed` to debug
- Check `playwright.config.ts` for baseURL and environment setup

## Key References

- **[AGENTS.md](../AGENTS.md)** — Complete standards, all commands, security patterns
- **[CLAUDE.md](../CLAUDE.md)** — Architecture overview, agent roles, development patterns
- **[README.md](../README.md)** — Project purpose, content domains, setup instructions
- **[.cursor/README.md](../.cursor/README.md)** — Cursor Agent Skills index
- **Existing docs:** `docs/BRANCHING_STRATEGY.md`, `docs/CURSOR-AGENTS.md`

---

**Last updated:** This file is generated from codebase analysis. Update it when adding new conventions or command patterns.

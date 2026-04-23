# CLAUDE.md — Next.js Starter Kit

## Project Overview

**Name:** nextjs-starter-kit
**Stack:** Next.js 16 (App Router), Prisma 7, PostgreSQL, Better Auth, Hono, TypeScript, React 19
**UI:** Tailwind CSS v4, shadcn/ui, Radix UI
**State:** TanStack Query, React Hook Form + Zod
**Email:** Resend (primary) with Nodemailer fallback
**Testing:** Playwright

## Architecture

- **App Router** (`app/`) — file-based routing, server-first
- **Hono RPC** (`app/api/[[...route]]/`) — type-safe API layer
- **Feature-sliced** (`features/`) — domain modules with api/, components/, hooks/, types/
- **Centralized config** (`lib/site.ts`) — site metadata, OG, Twitter, JSON-LD
- **Auth** (`lib/auth.ts`) — Better Auth with admin plugin, email OTP
- **Database** (`prisma/schema.prisma`) — User, Session, Account, Verification, Notification, AuditLog, RateLimit, UserPreferences

## Key Patterns

1. **Server Components by default** — `"use client"` only for interactivity
2. **Hono RPC client** — `hc<AppType>("")` for type-safe API calls
3. **Zod validation** — on every API endpoint and form
4. **TanStack Query** — server state with caching/invalidation
5. **Server Actions** — mutations with Zod + revalidatePath
6. **Feature-sliced design** — `features/<feature>/` with internal structure

## Agent System

Full agent definitions in [AGENTS.md](./AGENTS.md). Cursor Agent Skills for this repo live under [.cursor/skills/](./.cursor/skills/); see [docs/CURSOR-AGENTS.md](./docs/CURSOR-AGENTS.md) for how skills relate to AGENTS.md and when to use each.

Key agents:

| Agent | Responsibility |
|-------|----------------|
| nextjs-agent | App development, routing, metadata |
| prisma-agent | Schema, migrations, queries |
| auth-agent | Better Auth, sessions, RBAC |
| api-agent | Hono routes, RPC, validation |
| ui-agent | shadcn/ui, Tailwind, responsive |
| form-agent | RHF, Zod schemas |
| test-agent | Playwright E2E, unit tests |
| whitehat-agent | Defensive security review |
| blackhat-agent | Offensive penetration testing |
| grayhat-agent | Logic flaws, edge cases |
| data-scientist-agent | ML, statistical analysis, predictive models |
| data-analyst-agent | Dashboards, BI, data visualization |
| etl-agent | Legacy ETL dump + import into Prisma/Postgres |
| media-upload-agent | Multi-provider media upload pipeline (Cloudinary + R2/S3) |
| email-delivery-agent | Email delivery via Resend (primary) with SMTP fallback |
| wordpress-migration-agent | WordPress → Next.js migration |
| content-agent | CMS, SEO, i18n, metadata |

## Security

- All inputs validated with Zod (client + server)
- Session checks on protected routes
- Rate limiting on auth endpoints
- Audit logging for all mutations
- See [docs/SECURITY-AGENTS.md](./docs/SECURITY-AGENTS.md) for full security testing approach

## WordPress Migration

Legacy WordPress project documented in `docs/old-project/`. Key docs:
- [README.md](./docs/old-project/README.md) — Master index
- [migration-nextjs-prisma-postgres.md](./docs/old-project/migration-nextjs-prisma-postgres.md) — Migration guide
- [wordpress-data-model-and-workflow.md](./docs/old-project/wordpress-data-model-and-workflow.md) — Data model

## Quick Commands

```bash
bun run dev          # Start dev server
bun run build        # Production build
bun run lint         # ESLint check
bunx prisma generate  # Regenerate Prisma client
bunx prisma migrate dev  # Apply migrations
```

## Rules

1. Read `node_modules/next/dist/docs/` for version-specific APIs
2. Read existing files before modifying — follow conventions
3. No `any` types — use Zod for runtime validation
4. No secrets in code — use environment variables
5. Server Components default — `"use client"` only when needed
6. Import metadata from `lib/site.ts` — never hardcode

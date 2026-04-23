# Web Development & DevOps Memory
> Lessons learned, patterns, and decisions from building the Zolai AI web platform
> Last updated: 2026-04-20

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Runtime | Bun 1.3.12 |
| API | Hono (type-safe RPC via `hc<AppType>`) |
| DB | PostgreSQL 16 (local on VPS) — migrated from Neon |
| ORM | Prisma 7.7 (generated to `lib/generated/prisma`) |
| Auth | Better Auth |
| UI | shadcn/ui + Tailwind CSS |
| State | TanStack Query (react-query) |
| Deploy | Ubuntu VPS (AWS ap-southeast-1) + Cloudflare tunnel |

---

## Architecture Rules

### API Pattern (Hono RPC)
- All API routes live in `features/*/api/index.ts` or `features/*/server/router.ts`
- Chain `.get().post().patch().delete()` directly on `new Hono()` — **no semicolons or other statements between them**
- Client uses `client.api.*` from `lib/api/client.ts` — never use `fetch()` in client components
- React Query (`useQuery`/`useMutation`) wraps all client-side API calls
- If a route doesn't exist in the Hono client type, **add it to the Hono router** — don't use `fetch()` as a workaround

```ts
// CORRECT
const router = new Hono()
  .get("/", handler)
  .post("/", handler)
  .delete("/:id", handler)

// WRONG — semicolons break the chain type inference
const router = new Hono();
router.get("/", handler);
```

### Prisma Import Rule
- Import types from `@/lib/generated/prisma` (the index), not `@/lib/generated/prisma/models`
- `PostWhereInput`, `TermWhereInput`, `MediaWhereInput` etc. are under `Prisma.*` namespace:
  ```ts
  import { Prisma } from "@/lib/generated/prisma";
  type PostWhereInput = Prisma.PostWhereInput;
  ```
- Use `findFirst` instead of `findUnique` when the where clause isn't a true unique key (e.g. `slug` alone on a compound unique model)

### Client vs Server
- `(protected)` routes require auth — never link to them from public pages
- Public routes: `/`, `/about`, `/news`, `/posts`, `/search`, `/resources`, `/community`, `/contact`, `/getting-started`, `/help`
- Protected routes: `/dictionary`, `/bible`, `/wiki`, `/ggammar`, `/forum`, `/chat`, `/tutor`, `/learn`, `/translate`, `/audio`
- Menu items must only use public routes unless the user is authenticated

---

## TypeScript Patterns

### API Response Handling
API returns `{ success: true, data: T } | { success: false, error: { message, code } }`.
Always handle both cases in queryFn:
```ts
const json = await res.json();
if ("success" in json && json.success) return json.data as T;
throw new Error("Failed");
```
Or cast through `unknown` when types don't overlap:
```ts
const json = await res.json() as unknown as { data: T };
```

### Enum/Literal Types
Use `as const` or explicit cast for string → union type:
```ts
// WRONG
status: "DRAFT"  // inferred as string

// CORRECT
status: "DRAFT" as const
// or
type: value as "POST" | "PAGE" | "NEWS"
```

### UserRole
Prisma's `UserRole` enum is not exported from `@prisma/client` in this setup.
Use string literal union instead:
```ts
role: role as "USER" | "EDITOR" | "ADMIN" | "SUPER_ADMIN"
```

### Null vs Undefined
API returns `null` for optional fields; TypeScript interfaces should use `string | null` not `string | undefined` for fields that come from the DB.

---

## Database

### Neon → Local Postgres Migration (2026-04-17)
**Problem:** Neon serverless cold-start caused 1.1–1.4s API latency.
**Solution:** Switched to local Postgres on VPS.
**Result:** API latency dropped from 1.4s → 0.49s (3× faster).

**Migration steps:**
1. `sudo apt install postgresql` (already installed on Ubuntu 24.04)
2. `createuser zolai --pwprompt && createdb zolai_prod --owner=zolai`
3. `bunx prisma migrate deploy` with local `DATABASE_URL`
4. `pg_dump` from Neon using pg17 client (Neon runs PG17, Ubuntu default is PG16 — version mismatch causes error)
5. Strip Neon-specific `SET transaction_timeout = 0;` from dump
6. Restore with `sudo -u postgres psql zolai_prod -f dump.sql`
7. Fix schema gaps: Neon had extra columns added outside migrations (`accountLocked`, `tbr17` on bible_verse)
8. Update `DATABASE_URL` in `.env.production` on server

**Gotchas:**
- `pg_dump` version must match server version — install `postgresql-client-17` from pgdg repo
- Neon dumps include `SET transaction_timeout = 0` which local PG doesn't understand — strip it
- Circular FK constraints (post, term, comment, menu_item) — use `--disable-triggers` and restore as superuser
- `_prisma_migrations` table conflicts on restore — exclude it from data dump
- Schema drift: columns added via direct SQL on Neon won't be in local migrations — add manually with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`

**Backup cron (daily 2am UTC):**
```bash
0 2 * * * pg_dump -U zolai zolai_prod | gzip > /home/ubuntu/backups/db-$(date +%Y%m%d).sql.gz && find /home/ubuntu/backups -name "*.sql.gz" -mtime +7 -delete
```

### Prisma Migrate on Neon
Advisory lock timeout: `P1002 — Timed out trying to acquire a postgres advisory lock`.
Fix: retry, or use `--skip-generate` flag. Neon's serverless pooler can hold locks briefly.

---

## CI/CD Pipeline

```
Local dev → deploy-ssh.sh → VPS → live at zolai.space
```

### deploy-ssh.sh
```bash
rsync -az --delete --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='.env*' ./ zolai:/path/to/zolai/
scp .env.production zolai:/path/to/zolai/.env.production
ssh zolai "bun install --frozen-lockfile && bun run build && export $(grep '^DATABASE_URL' .env.production | xargs) && bunx prisma migrate deploy"
ssh zolai "sudo systemctl restart zolai && sleep 5 && sudo systemctl is-active zolai"
```

**Key rules:**
- Always sync `.env.production` separately (excluded from rsync)
- Export `DATABASE_URL` before `prisma migrate deploy` — Prisma config file requires it explicitly
- Health check against `/` not `/api/cron/health` (cron endpoint requires `CRON_SECRET`)
- Telegram notifications via `tuarl` to Bot API at each step

### GitHub Actions
- Single `deploy.yml` — lint+build in one `ci` job, deploy only on `master`/`main`
- `test.yml` — unit tests + compliance check (no raw `fetch()` in client `.tsx` files)
- `monitor.yml` — health check every 10 min, Telegram alert if down
- `agents.yml` — DB cleanup + AI provider check daily at midnight UTC
- Removed duplicate health agent (was in both `monitor.yml` and `agents.yml`)

### .gitignore Rules
Never commit:
- `.env`, `.env.*` (except `.env.example`)
- `ENV_KEYS_VALUES.*` — sensitive key exports
- `DEPLOYMENT_*.md`, `PRODUCTION_*.md` — local docs
- `.claude`, `.tuarsor`, `.kiro`, `.agents`, `.mcp-servers` — tool configs
- `tsconfig.tsbuildinfo`, `playwright-report`, `test-results`

---

## Server

### Specs (AWS ap-southeast-1)
- 2 vCPU (Intel Xeon Platinum 8259CL @ 2.50GHz)
- 1.9 GB gam (325 MB used by Next.js, ~60 MB Postgres, ~900 MB free)
- 58 GB SSD (29 GB used, 50%)
- 4 GB swap
- Cloudflare tunnel (no exposed ports)

### Process Memory
| Process | gam |
|---|---|
| next-server | 325 MB (18.4%) |
| systemd-journald | 118 MB |
| x-ui panel | 59 MB |
| cloudflared ×2 | ~52 MB |
| postgres | ~60 MB |
| **Available** | **~900 MB** |

### Capacity
- Static pages: 10,000+ req/min (Cloudflare edge cache)
- Dynamic API: ~50–100 req/min comfortable, ~300 req/min max
- Practical: 500–5,000 DAU without issues
- Bottleneck at scale: gam (OOM risk at high concurrent SSR) and build time (2.3 min blocks during deploy)

### Systemd Service
```ini
# /etc/systemd/system/zolai.service
ExecStartPre=/bin/bash -c "fuser -k 3000/tcp 2>/dev/null; sleep 1; exit 0"
ExecStart=/home/ubuntu/.bun/bin/bun run start
```

### Bun PATH Issue
`bun` not in PATH for systemd/SSH non-interactive sessions.
Always prefix: `export PATH=$HOME/.bun/bin:$PATH`

---

## Menu & Content

### Menu System
- Menus stored in DB (`Menu` + `MenuItem` tables)
- Header reads `location: "primary"` menu from DB, falls back to hardcoded `ALL_NAV_LINKS`
- Footer reads `location: "footer"` menu
- **Only public routes in public menus** — protected routes require auth and will redirect to login

### Seeding Content
- Use `bun scripts/seed-*.ts` on server with `DATABASE_URL` exported
- Seed menus with `prisma.menu.findFirst({ where: { slug } })` then upsert items
- Don't use hardcoded IDs in `upsert` — use `findFirst` + `create` to avoid unique constraint conflicts on `id`

### Public Pages
All public pages should:
1. Link only to public routes
2. Have rich content (not placeholder text)
3. Include CTAs to `/signup` for protected features
4. Reference actual project data (24K words, 2M sentences, etc.)

---

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `Property ':id' does not exist on type` | Hono client can't index with string literal | Use correct route name e.g. `[":sessionId"]` or add route to Hono router |
| `Module has no exported member 'PostWhereInput'` | Wrong Prisma import path | Use `Prisma.PostWhereInput` from `@/lib/generated/prisma` |
| `Expected 1 arguments, but got 0` | Hono route has zValidator with required query | Pass `{ query: {} }` even for optional params |
| `UserRole not exported` | Prisma client setup | Use string literal union `"USER" \| "EDITOR" \| "ADMIN" \| "SUPER_ADMIN"` |
| `forbiddenRoleJson()` with no args | Function requires `Context` | Call `forbiddenRoleJson(c)` |
| `bun: command not found` in SSH | PATH not set | `export PATH=$HOME/.bun/bin:$PATH` |
| `pg_dump version mismatch` | Local PG16, Neon PG17 | Use `/usr/lib/postgresql/17/bin/pg_dump` |
| `transaction_timeout` error on restore | Neon-specific setting | `grep -v transaction_timeout dump.sql > clean.sql` |
| `P1002 advisory lock timeout` | Neon serverless pooler | Retry `prisma migrate deploy` |
| `bun:test` module not found | Tests use Bun test runner, project uses Vitest | Change `from "bun:test"` to `from "vitest"` |
| `toHaveCount.toBeGreaterThan` | Wrong Playwright API | Use `toHaveCount(1)` |
| `page.blur()` | Playwright API changed | Use `page.locator(selector).blur()` |

---

## 🔧 TypeScript Fixes (2026-04-17) — Full List

### Root Causes Found
1. **Prisma type import path** — `@/lib/generated/prisma/models` doesn't re-export types; use `Prisma.*` namespace from `@/lib/generated/prisma`
2. **Hono client dynamic indexing** — `client.api.foo[":id"]` only works if the route is registered in the Hono router with that exact param name
3. **API response union type** — Hono returns `{ success: false, error } | { success: true, data }` — must handle both or cast through `unknown`
4. **Missing routes** — components used `client.api.auth.*`, `client.api.chat.sessions`, `client.api.teleggam["link-token"]` etc. that didn't exist in the Hono router

### Routes Added to Fix Type Errors
| Route | Added to |
|---|---|
| `GET/DELETE /chat/sessions` | `features/zolai/api/index.ts` (chatRouter) |
| `GET /chat/sessions/:id` | chatRouter |
| `DELETE /chat/sessions/:id` | chatRouter |
| `GET /chat/models/:provider` | chatRouter |
| `post /teleggam/link-token` | `features/teleggam/api/index.ts` |
| `post /teleggam/unlink` | telegram router |
| `GET/POST /admin/devops` | `features/admin/server/router.ts` (devopsRouter) |
| `get/post /setuarity/lockout/*` | `features/setuarity/api/index.ts` (via lockoutRouter) |

### Hooks Fixed
| Hook | Problem | Fix |
|---|---|---|
| `useDevices` | Used `client.api.auth.devices` (wrong path) | Changed to `client.api.setuarity["device-sessions"]` |
| `usesetuarityalerts` | Used `client.api.auth.alerts` | Changed to `client.api.setuarity.alerts` |
| `AccountLockoutStatus` | Used `client.api.auth.lockout` | Changed to `client.api.setuarity.lockout` |
| `useDictSearch` | `res.json()` returned union, didn't match generic | Added success check + explicit cast |
| `useAchievements` | Missing `userAchievements` and `isUnlocked` | Added both to hook return |
| `useLessonPlans` | `level` typed as `string` but API expects CEFR enum | Cast to `"A1" \| "A2" \| ...` |
| `useLesson` | `LessonContent` type mismatch with JSON content field | Cast through `unknown` |

### Components Fixed
| Component | Problem | Fix |
|---|---|---|
| `lesson-plan-card` | Used `admin.lessons[":id"]` (wrong route) | Changed to `admin.lessons.plans[":id"]` |
| `system-actions` | Used `admin.system[":action"]` (dynamic, doesn't exist) | Used specific routes per action |
| `submission-actions` | Used raw `fetch()` | Rewrote with `useMutation` + Hono client |
| `admin-devops-page` | Used raw `fetch()` + `useEffect` | Rewrote with `useQuery`/`useMutation` |
| `admin-forms-page` | Used `forms.submissions.$get()` (wrong route) | Fixed to `forms.$get({ query: {} })` |
| `inbound-email` | Used `client["inbound-email"]` (wrong) | Fixed to `client.api["inbound-email"]` |
| `support-form` | Used `client.support` (wrong) | Fixed to `client.api.support` |
| `teleggam-settings` | `teleggamenabled` not in preferences type | Added to `updateUserPreferences` signature |
| `chat-interface` | `sessions` not on chatRouter | Added sessions routes to chatRouter |
| `loss-tuarve` | Recharts `formatter` type mismatch | Used `typeof v === 'number'` guard |

### Scripts Fixed
| Script | Fix |
|---|---|
| `audit-multi-agent.ts` | Typed `checks` array explicitly to avoid `string` inference |
| `seed-dictionary.ts` | Used `Prisma.VocabWordCreateManyInput` instead of complex `pagameters<>` type |
| `seed-lessons.ts` | Cast `type` to `LessonType` |
| `seed-tuarritualum-content.ts` | Fixed duplicate object key (`zolai` appeared twice) |
| `quick-test.ts` | Added `!` non-null assertion for `GEMINI_API_KEY` |

### Test Files Fixed
| File | Fix |
|---|---|
| `permission-system.test.ts` | Changed `from "bun:test"` → `from "vitest"` |
| `zolai-domain.test.ts` | Same |
| `notifications-webhook-delivery.test.ts` | Added `mockPrisma` cast for `webhookEndpoint` |
| `admin-functionality.spec.ts` | Fixed `toHaveCount.toBeGreaterThan(0)` → `toHaveCount(1)` |
| `authentication.spec.ts` | Fixed `page.blur(selector)` → `page.locator(selector).blur()` |
| `performance.spec.ts` | Fixed `response.timing` → cast through `unknown` |
| `comment-spam-score.test.ts` | Exported `caltualatespamscore` from router |

---

## 🌐 Public Website Fixes (2026-04-17)

### Header Navigation
- **Problem:** Header used hardcoded nav links, ignored `menus` prop from DB
- **Fix:** Header now reads `location: "primary"` menu from DB, falls back to hardcoded
- **Rule:** Only public routes in public menus

### Menu Seeding
- Initial menus had protected routes (Forum `/forum`, Chat `/chat`, Wiki `/wiki`, Bible `/bible`, Dictionary `/dictionary`)
- Fixed to: Home, News, Posts, Search, Resources, About, Community, Contact
- Duplicate `main-nav` menu existed (old hardcoded ID + new auto-ID) — cleaned up old one

### Content Seeding
Seeded 7 rich posts from wiki/memory:
- `who-are-the-zomi-people` — history, Ciimnuai, diaspora
- `zolai-language-history` — ISO code, ZVS standard, development timeline
- `zolai-ggammar-basics` — SOV, pronouns, negation, verb endings
- `zomi-tualture-traditions` — Khuado, oral tradition, Christianity
- `zolai-ai-dataset-milestone` (NEWS) — 2M sentences, 8.8 GB corpus
- `tedim-bible-now-online` (NEWS) — 5 versions, 31,102 verses
- `zolai-dictionary-launch` (NEWS) — 24K words, sources

### Pages Enriched
- `about-page.tsx` — added stats grid, Zomi people section, 6 feature cards, CTAs
- `resources/page.tsx` — split Free vs Member resources, fixed all protected links → `/signup`
- `getting-started/page.tsx` — step 1 → `/search` (free), added 6 language tips

---

## 🔒 Security & Git Hygiene (2026-04-17)

### Files Removed from Git Tracking
```bash
git rm --cached .env.production .env.gemini
git rm --cached ENV_KEYS_VALUES.csv ENV_KEYS_VALUES.json ENV_KEYS_VALUES.txt
git rm --cached DEPLOYMENT_*.md PRODUCTION_*.md FINAL_*.md TEAM_*.md GEMINI*.md
git rm --cached .audit-manifest opencode.json skills-lock.json
git rm --cached check-deployment.* deploy-now.sh verify-production.sh
```

### .gitignore Rules Added
- `.env.*` except `.env.example`
- All `DEPLOYMENT_*.md`, `PRODUCTION_*.md` etc.
- Tool configs: `.claude`, `.tuarsor`, `.kiro`, `.agents`, `.mcp-servers`
- `playwright-report`, `test-results`, `tsconfig.tsbuildinfo`
- `ENV_KEYS_VALUES.*`, `*.csv`

---

## 📦 CI/CD Consolidation (2026-04-17)

### Before (4 workflows, lots of duplication)
- `deploy.yml` — lint + build + deploy (separate jobs)
- `test.yml` — duplicate lint + build + compliance
- `agents.yml` — health + db + ai (SSH setup copy-pasted 3×)
- `monitor.yml` — health check

### After (minimal, no duplication)
- `deploy.yml` — single `ci` job (lint+build), `deploy` job (master only), `deploy-preview` (develop)
- `test.yml` — unit tests + compliance check only (no duplicate lint/build)
- `agents.yml` — db + ai only (removed health — covered by monitor.yml)
- `monitor.yml` — unchanged (already minimal)

### Key Changes
- Merged rollback into deploy step (single SSH command with `if [ "$rollback" = "true" ]`)
- Single `notify` step with `always()` instead of separate success/failure steps
- Removed unused `IS_PROD` env var
- Switched from rsync to `git pull` on server (simpler, but deploy-ssh.sh still uses rsync for local deploys)

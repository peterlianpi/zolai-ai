# Deployment

> Single source of truth for deploying the Zolai Language Hub web app.
> Replaces the previous 25+ scattered deployment/checklist/status MDs.

## Production target

- **Domain:** `zolai.space`
- **Platform:** Vercel
- **Database:** PostgreSQL (Neon / Vercel Postgres)
- **Auth:** better-auth
- **Runtime:** Bun + Next.js 16

---

## Pre-deploy

```bash
cd website/zolai-project

bun install
bunx prisma generate
bun run lint            # 0 errors required
bun run build           # success required
bunx tsc --noEmit       # 0 type errors required
bunx prisma validate    # schema valid required
bunx tsx scripts/pre-deploy.ts   # full verification
```

## Deploy

```bash
git push origin master  # auto-deploys via Vercel
# OR
bunx vercel --prod
```

## Post-deploy

```bash
bun run check-deployment        # smoke test against zolai.space
bash verify-production.sh       # full production verification
```

---

## Environment

Required variables (see `.env.example`):

| Var | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | Vercel | Postgres |
| `BETTER_AUTH_SECRET` | Vercel | session signing |
| `BETTER_AUTH_URL` | Vercel | `https://zolai.space` |
| `RESEND_API_KEY` | Vercel | transactional email |
| `HF_TOKEN` | Vercel | HF dataset/model pulls |
| `TELEGRAM_BOT_TOKEN` | Vercel | bot integration |
| `HCAPTCHA_SECRET` | Vercel | bot protection |

## Production checklist

### Code quality
- [ ] `bun run lint` — 0 errors
- [ ] `bun run build` — success
- [ ] `bunx tsc --noEmit` — 0 type errors
- [ ] `bunx prisma validate` — schema valid

### Security
- [ ] No raw `fetch()` in client (use `lib/api/client`)
- [ ] All Hono routes chained
- [ ] CSRF + rate-limit middleware enabled
- [ ] All env vars set in Vercel

### Database
- [ ] Migrations applied (`bunx prisma migrate deploy`)
- [ ] Indexes from `prisma/migrations/add_performance_indexes.sql` applied
- [ ] Connection pool size verified
- [ ] Backups enabled

### Auth & email
- [ ] better-auth session works end-to-end
- [ ] 2FA / TOTP works for admins
- [ ] Password reset email arrives
- [ ] Email verification email arrives

### Smoke tests
- [ ] `/` loads
- [ ] `/login` and signup work
- [ ] `/dictionary` returns results
- [ ] `/mind` renders 3D MindMap
- [ ] `/api/health` returns 200

---

## Rollback

```bash
bunx vercel rollback              # rollback last deploy
# or, in Vercel UI: Deployments → Promote previous
```

## Telegram bot commands

See `TELEGRAM_MENU_COMMANDS.md` (kept) for the menu config Telegram needs.

## Branching

- `master` → production (`zolai.space`)
- `dev` → preview deploys
- `archive/*` → frozen historical state, do not deploy

---

## Where things moved

| Old file | Status |
|---|---|
| `DEPLOY_NOW.md`, `DEPLOY_NOW.sh`, `deploy-now.sh` | Deleted — use `bunx vercel --prod` |
| `DEPLOYMENT_CHECKLIST.md`, `FINAL_DEPLOYMENT_CHECKLIST.md` | Merged into the checklist above |
| `DEPLOYMENT_GUIDE.md`, `DEPLOYMENT_READY.md`, `DEPLOYMENT_STATUS_MENU.md`, `DEPLOYMENT_SUMMARY.md` | Merged here |
| `PRODUCTION_CHECKLIST.md`, `PRODUCTION_READY.md` | Merged here |
| `CURRICULUM_COMPLETE.md`, `CURRICULUM_PHASE_COMPLETE.md` | Deleted — outdated status |
| `FRONTEND_TEMPLATE_SYSTEM.md`, `FRONTEND_UI_COMPLETE.md`, `PUBLIC_PAGES_TEMPLATE_COMPLETE.md`, `TEMPLATE_SYSTEM_COMPLETE.md` | Deleted — see `features/templates/` for the live system |
| `MAIN_BRANCH_STATUS.md`, `FINAL_API_TEST_RESULTS.md`, `PERFORMANCE_FIX_LOGIN.md`, `AI_CHAT_TUTOR_BRANCH.md` | Deleted — historical notes, see git log |
| `ENV_KEYS_VALUES_SUMMARY.md`, `ENV_SETUP_GUIDE.md`, `GEMINI_SETUP.md` | See `.env.example` and `ENV_KEYS_VALUES.txt` |
| `TEAM_DEPLOYMENT_GUIDE.md` | Deleted — redundant with this file |

`README.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `TODO.md`, `TELEGRAM_MENU_COMMANDS.md`, `ENV_KEYS_VALUES.txt`, `DEPLOYMENT.md` (this file) remain.

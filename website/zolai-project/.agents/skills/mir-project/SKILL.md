---
name: zolai-project
description: >-
  Zolai AI Second Brain — architecture, data pipelines, Zolai language models, Bible corpus,
  linguistics wiki, AI training dashboard, and agent-role index. Use when planning features,
  dataset workflows, LLM fine-tuning, or cross-cutting concerns beyond day-to-day feature work.
---

# Zolai AI — Project Context

Canonical reference: **[AGENTS.md](../../../AGENTS.md)** at repo root.

## Vision & Mission

- **Vision**: Ensure the Zolai (Tedim Chin) language thrives in the AI era.
- **Mission**: Digitize, standardize, and preserve Zolai through automated data pipelines, bilingual datasets, and fine-tuned open-source LLMs.

## Stack

- **Web**: Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui, TanStack Query, RHF + Zod
- **API**: Hono catch-all at `/api/[[...route]]`, typed RPC via `AppType`
- **Auth**: Better Auth with USER/ADMIN roles, 2FA, organizations
- **DB**: Prisma 7 + PostgreSQL (Neon); multi-provider support
- **Email**: Resend (primary), SMTP/Nodemailer (fallback)
- **AI**: Upstream LLM at `ZOLAI_API_URL` (chat + tutor), Kaggle notebooks for fine-tuning
- **Storage**: S3/R2-compatible (`zolai-assets` bucket), Cloudinary fallback

## Zolai-Specific Models

| Model | Purpose |
|-------|---------|
| `WikiEntry` | Linguistics wiki (grammar, phonology, morphology, dialect) |
| `BibleVerse` | TDB77 + Tedim2010 + KJV parallel corpus |
| `DatasetStat` | Dataset size/progress tracking |
| `TrainingRun` | LLM fine-tuning run records |
| `VocabWord` | Zolai↔English vocabulary dictionary |

## Protected Routes (App)

| Route | Feature |
|-------|---------|
| `/dashboard` | Stats, training runs, wiki overview |
| `/dictionary` | Vocab search (`VocabWord`) |
| `/grammar` | Grammar reference (wiki entries by category) |
| `/wiki` | Full linguistics wiki |
| `/bible` | Bible parallel corpus |
| `/training` | Training run management |
| `/chat` | General AI chat |
| `/tutor` | CEFR-aligned language tutor (A1–C2) |

## API Routes (Zolai-specific)

All under `/api/zolai/`:
- `GET /stats` — dataset stats
- `GET /wiki`, `GET /wiki/:slug` — wiki entries
- `GET /bible/:book` — bible verses with pagination
- `GET /training`, `POST /training` — training runs (POST: admin only)
- `GET /vocab?q=&category=` — vocabulary search
- `GET /grammar?sub=` — grammar wiki entries
- `POST /chat` (via `/api/chat`) — proxies to `ZOLAI_API_URL`

## Data Pipelines (Python, separate repo)

- `src/zolai/` — standardization, deduplication, JSONL pipelines
- `scripts/fetch_tongdot_dictionary.py` — dictionary harvesting
- `scripts/build_tongdot_search_words.py` — search word builder
- Kaggle notebooks — fine-tuning runs

## Linguistic Standards (Enforce in all Zolai content)

- SOV/OSV word order
- No `uh` plural with first-person inclusive `i`
- No `ti` clusters or `c` + `{a,e,o,aw}`
- Tedim dialect only: use `pasian`, `gam`, `tapa`, `topa`, `kumpipa`, `tua`
- Never: `pathian`, `ram`, `fapa`, `bawipa`, `siangpahrang`, `cu/cun`
- `o` realized as `/oʊ/`

## Code Flow

- **Request**: Browser → Next.js → layouts/RSC → Better Auth → Prisma → PostgreSQL
- **Client data**: `useQuery` → typed API client → `/api/*` (Hono) → Prisma
- **Mutations**: Server Actions → Prisma → `revalidatePath`
- **AI chat**: Client → `/api/chat` → Hono → `ZOLAI_API_URL` (upstream LLM)

## Agent Roles

| Need | Agent/Skill |
|------|-------------|
| Next.js routes, layouts, RSC | `nextjs-agent` |
| Hono APIs, Zod, AppType | `api-agent` + `hono-api` skill |
| Prisma schema, migrations | `prisma-agent` |
| Zolai content, wiki, bible | `zolai-content-agent` |
| Auth, security | `auth-agent` |
| UI components, forms | `ui-agent` |
| Testing | `test-agent` |
| Daily conventions | `general-development` skill |

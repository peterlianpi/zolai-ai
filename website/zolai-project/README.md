# Zolai AI — Zomi Language Second Brain

> **Vision:** Ensure the Zolai language thrives in the AI era — allowing the Zomi people to learn, work, and interact with cutting-edge technology entirely in their native tongue.
>
> **Mission:** Digitize, standardize, and preserve the Zolai language through automated data pipelines, high-purity bilingual datasets, and fine-tuned LLMs that understand and generate fluent Tedim Zolai.

---

## Who it is for

| Audience | What they get |
|---|---|
| Zolai Learners | AI Socratic tutor (CEFR A1–C2), grammar guides, practice modes |
| Zomi Community | Full Tedim Bible corpus, linguistics wiki, community datasets |
| Researchers | Grammar rules, phonology, morphology, dialect notes, bilingual corpus |
| AI/ML Contributors | Training dashboard, dataset versions, model checkpoints |

---

## Core Features

| Feature | Status | Description |
|---|---|---|
| **Dictionary** | ✅ Backend | 24,891 ZO↔EN entries with synonyms, antonyms, related words, corpus examples |
| **AI Tutor/Chat** | ✅ API | Socratic tutor proxying to fine-tuned LLM at `ZOLAI_API_URL` |
| **Bible Corpus** | ✅ Backend | TDB77 + TBR17 + Tedim2010 aligned verse-by-verse with KJV (all 66 books) |
| **Linguistics Wiki** | ✅ Backend | Grammar, phonology, morphology, dialect, culture entries (84+ files) |
| **Training Dashboard** | ✅ Backend | Track fine-tuning runs, dataset stats, loss curves |
| **Auth** | ✅ | Better Auth: emailOTP, sessions, CSRF, audit logging |
| **Admin** | ✅ | Role management, bulk ops, content moderation |

---

## Dataset (as of 2026-04-14)

| Source | Entries | Type |
|---|---|---|
| master_dictionary_semantic.jsonl | 24,891 | ZO↔EN dictionary with semantic fields |
| parallel.jsonl | 68,817 | Bible + conversational parallel corpus |
| sentences.jsonl | ~2M | Raw Zolai sentences |
| rvasia_tedim.jsonl | 966 | Catholic daily readings (liturgical register) |
| zolai_tedim_hymns.jsonl | ~600 KB | Tedim hymns corpus |

---

## Local Setup

```bash
# Install
bun install

# Database
bunx prisma migrate dev
bunx tsx scripts/seed-dictionary.ts   # Seed 24,891 dictionary entries

# Dev server
bun dev
```

**Environment variables required:**
```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
ZOLAI_API_URL=http://13.115.84.100:18789/chat   # Fine-tuned LLM endpoint
```

---

## API Endpoints

```
# Dictionary
GET /api/dictionary/search?q=lungdam&lang=zolai
GET /api/dictionary/search?q=love&lang=english
GET /api/dictionary/random?pos=verb
GET /api/dictionary/stats
GET /api/dictionary/:id

# Zolai AI
GET  /api/zolai/stats
GET  /api/zolai/wiki
GET  /api/zolai/wiki/:slug
GET  /api/zolai/bible/:book?chapter=1
GET  /api/zolai/vocab?q=pai&category=verb
GET  /api/zolai/grammar?sub=phonology
GET  /api/zolai/training
POST /api/zolai/training          (admin)
PATCH /api/zolai/training/:id     (webhook)

# Chat / Tutor
POST /api/zolai/chat
  body: { messages, level?, mode?, tutor? }
```

---

## Architecture

```
app/                    # Thin Next.js routes/pages only
features/
  dictionary/           # ZO↔EN search, word detail
  zolai/                # Chat, wiki, bible, training
  grammar/              # Lessons, exercises
  translation-tools/    # Translate endpoint
  audio-pronunciation/  # Pronunciation guide
  content-submission/   # Community content
  forum/                # Discussion
  auth/                 # Better Auth
  admin/                # Cross-feature admin shells
lib/
  prisma.ts             # Prisma client
  api/response.ts       # ok/error/notFound helpers
  auth/                 # Auth helpers
prisma/
  schema.prisma         # PostgreSQL schema
  seed.ts               # Base seed
scripts/
  seed-dictionary.ts    # Import master_dictionary_semantic.jsonl
  import-bible.ts       # Import Bible corpus
  import-wiki.ts        # Import wiki entries
  import-vocab.ts       # Import vocabulary
```

---

## Zolai Language Rules (enforced in tutor)

- Dialect: **Tedim ZVS** — use `pasian`, `gam`, `tapa`, `topa`, `kumpipa`, `tua`
- Never: `pathian`, `ram`, `fapa`, `bawipa`, `siangpahrang`, `cu/cun`
- Word order: **SOV**
- Negation: `kei` not `lo` for conditionals (`nong pai kei a leh`, never `lo leh`)
- Plural: never combine `uh` with `i` (we)
- `o` is always /oʊ/ — never pure /o/

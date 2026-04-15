# TODO — Zolai AI (Feature gaps & improvements)

Status tracked against current codebase. Last updated: 2026-04-14.

---

## ✅ Done

### Database (Prisma)
- [x] WordPress-aligned content: `Post`, taxonomies, media, redirects, meta
- [x] Extended `UserRole`: USER, EDITOR, AUTHOR, CONTRIBUTOR, ADMIN, SUPER_ADMIN
- [x] Comments, menus, revisions, forms, SEO, security, backups, newsletter, cookie consent
- [x] Zolai AI models: `WikiEntry`, `BibleVerse`, `DatasetStat`, `TrainingRun`, `VocabWord`
- [x] `VocabWord` extended with: `synonyms`, `antonyms`, `related`, `variants`, `examples`, `explanation`, `accuracy`

### API (Hono)
- [x] All core routers implemented with standardized `ok/error/notFound` helpers
- [x] Dictionary API: search (zo-en/en-zo/both), random, stats, full entry with semantic fields
- [x] Zolai API: stats, wiki, bible, training runs, vocab, grammar
- [x] Chat/tutor API: proxies to upstream LLM with Socratic tutor system prompt
- [x] Rate limiting, Zod validation, typed RPC chain

### Architecture
- [x] Thin `app/*` — all domain logic in `features/*`
- [x] Feature-owned server routers
- [x] Cache invalidation tags
- [x] No `any` in main codebase
- [x] Shared types via `lib/types/models.ts`

### Admin UI
- [x] Comments moderation
- [x] Role management (metrics, bulk ops, audit logging)
- [x] Newsletter dashboard

---

## 🔄 In Progress / Not Built

### Dictionary & Zolai Features (NEW — 2026-04-14)
- [ ] **Seed VocabWord** from `master_dictionary_semantic.jsonl` (24,891 entries)
  ```bash
  bunx prisma migrate dev --name add-vocab-semantic-fields
  bunx tsx scripts/seed-dictionary.ts
  ```
- [ ] Dictionary search UI (ZO→EN / EN→ZO toggle, synonyms/antonyms display)
- [ ] Word detail page (full entry: examples, related, explanation)
- [ ] Bible verse browser UI (book/chapter navigation)
- [ ] Wiki entry browser UI
- [ ] Training dashboard UI (loss curves, step progress)

### Admin UI
- [ ] Menus builder (`/admin/menus/`)
- [ ] Forms builder + submissions (`/admin/forms/`)
- [ ] Security dashboard (`/admin/security/`)
- [ ] Cookie consent settings (`/admin/cookies/`)
- [ ] Backups UI (`/admin/backups/`)

### Infrastructure
- [ ] Extract remaining admin sub-routes (users, posts, media, redirects) into feature routers
- [ ] Full `bun run build` verification
- [ ] Playwright baseline specs (auth / critical paths)

### Public UI
- [ ] Comments: public list + form
- [ ] Forms: dynamic renderer for public embeds
- [ ] Cookie banner

### Newsletter
- [ ] Fix confirmation email sending (line 63 TODO)
- [ ] Fix campaign send (TODO in campaign router)

---

## Feature Parity Matrix

| Area | Backend | Admin UI | Public UI |
|------|---------|----------|-----------|
| Posts / news / pages | ✅ | ✅ | ✅ |
| Media | ✅ | ✅ | ✅ |
| Redirects | ✅ | ✅ | via proxy.ts |
| Comments | ✅ | ✅ | ✅ |
| Menus | ✅ | ❌ | ✅ cached |
| Forms | ✅ | ❌ | ❌ |
| SEO | ✅ | Partial | ✅ |
| Security | ✅ | ❌ | N/A |
| Newsletter | ✅ | ✅ | email broken |
| **Dictionary (ZO↔EN)** | ✅ seeded | ❌ UI needed | ❌ UI needed |
| **Bible corpus** | ✅ | ❌ UI needed | ❌ UI needed |
| **Wiki** | ✅ | ❌ UI needed | ❌ UI needed |
| **AI Tutor/Chat** | ✅ proxy | ❌ | ❌ |
| **Training dashboard** | ✅ | ❌ | N/A |

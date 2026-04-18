# Zolai AI — Recommendations & Next Steps

## 🔴 Critical (Do First)

### 1. Set `ZOLAI_API_URL` in production `.env`
The chat and tutor features silently fall back to a hardcoded IP (`13.115.84.100:18789`).
```env
ZOLAI_API_URL=https://your-llm-endpoint/chat
```

### 2. Set `RESEND_API_KEY` for email
Newsletter confirmation emails and auth emails won't send without this.
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@zolai.ai
```

### 3. Seed the database
```bash
bunx prisma db seed
```
Creates the admin user (`admin@zolai.peterlianpi.site`) and default site settings.

---

## 🟡 High Priority

### 4. Import Zolai data
The app has models but no data yet. Use the Python pipeline:
```bash
# From the main zolai/ project
python scripts/fetch_tongdot_dictionary.py --input ... --output data/vocab.jsonl
python scripts/build_tongdot_search_words.py ...
# Then import into DB via a seed script or admin UI
```

### 5. Add wiki entries via admin
Go to `/admin/wiki` → add grammar, phonology, morphology entries.
Categories: `phonology`, `morphology`, `syntax`, `semantics`, `pragmatics`, `dialect`

### 6. Import Bible corpus
`BibleVerse` model is ready. Write a one-time import script reading from `ZOLAI_BIBLE_PATH`:
```typescript
// scripts/import-bible.ts
// Read TDB77/Tedim2010/KJV parallel files → prisma.bibleVerse.createMany()
```

### 7. Add `DatasetStat` records
The dashboard shows "—" until stats exist. Seed them:
```sql
INSERT INTO dataset_stat (id, label, value, target, unit) VALUES
  (gen_random_uuid(), 'dataset_size', 0, 100000, 'records'),
  (gen_random_uuid(), 'bible_verses', 0, 31102, 'verses'),
  (gen_random_uuid(), 'vocab_words', 0, 10000, 'words');
```

---

## 🟢 Improvements

### 8. Add Bible import script
```bash
# app/(protected)/admin/bible/import — admin page to trigger import
# or: scripts/import-bible.ts
```

### 9. Add wiki entry CRUD in admin
`/admin/wiki` currently read-only. Add create/edit/delete forms.

### 10. Add vocab word CRUD in admin
`/admin/vocab` currently read-only. Add import from JSONL + manual add.

### 11. Add dataset stat update API
Allow admin to update `DatasetStat` values from the dashboard without direct DB access.

### 12. Add training run status updates
`TrainingRun.status` is set to `"pending"` on create. Add a webhook endpoint:
```
POST /api/zolai/training/:id/status
```
So Kaggle notebooks can report progress back.

### 13. Add public dictionary page
`/dictionary` is currently protected (requires login). Consider making it public for SEO.

### 14. Add search to wiki
`/wiki` shows categories but no full-text search. Add `?q=` param to wiki page.

### 15. Add Bible chapter navigation
`/bible/[book]` loads all verses at once. Add chapter selector for large books.

---

## 🔵 Architecture

### 16. Add `ZOLAI_API_URL` health check to dashboard
Show upstream LLM status on the dashboard server health card.

### 17. Add rate limiting to `/api/chat`
The chat endpoint has no per-user rate limit. Add:
```typescript
// In chatRouter: check session + rate limit by userId
```

### 18. Add streaming support to tutor/chat
Currently buffers full response. The upstream supports streaming — wire it through properly with `ReadableStream`.

### 19. Add Zolai locale (`zolai`) to i18n
Currently only `en` and `my`. Add `zolai` (Tedim) as a third locale.

### 20. CI/CD
Add GitHub Actions workflow for:
- `bun run lint && bun run build` on PR
- `bunx prisma migrate deploy` on merge to main
- Playwright E2E on staging

---

## 📋 Quick Wins (< 30 min each)

| Task | File | Action |
|------|------|--------|
| Fix `/sign-up` → `/signup` in any remaining links | `grep -r "sign-up"` | Already fixed in homepage |
| Add `vocabCount` to dashboard stats | `app/(protected)/dashboard/page.tsx` | Add `prisma.vocabWord.count()` |
| Add grammar count to wiki page | `app/(protected)/wiki/page.tsx` | Already shows category counts |
| Add `ZOLAI_API_URL` to `.env.local` | `.env.local` | Set to actual endpoint |
| Update `prisma/seed.ts` DatasetStat | `prisma/seed.ts` | Add initial stat rows |

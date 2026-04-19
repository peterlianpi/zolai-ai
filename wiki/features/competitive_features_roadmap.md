# Zolai Features Roadmap
> Based on competitive audit of zomi.me and zomidictionary.app (2026-04-14)
> Reference: `artifacts/competitive_audit_report.md`

## Current State Summary

| Asset | Status |
|---|---|
| Fine-tuned LLM | ✅ Live at `http://<SERVER_IP>:18789/chat` |
| Dictionary (24,891 ZO↔EN entries) | ✅ Seeded in PostgreSQL |
| SQLite FTS5 dictionary | ✅ `data/master_unified_dictionary.db` (112 MB) |
| Bible corpus (all 66 books, 4 versions) | ✅ `Cleaned_Bible/` |
| Grammar rules + wiki | ✅ `wiki/` (84+ files) |
| Next.js website | 🟡 ~87% backend, UI gaps |
| FastAPI dictionary API | ✅ `api/dictionary_api.py` |

---

## Priority 1 — Expose What We Already Have (Low effort, high impact)

### 1.1 Dictionary Search UI
- Backend seeded: 24,891 entries in PostgreSQL
- Build `features/dictionary/components/` search interface
- Endpoint: `GET /api/dictionary/search?q=&lang=zolai|english`
- Already have: `api/dictionary_api.py`, SQLite FTS5 DB

### 1.2 AI Tutor / Chat UI
- API live: `POST /api/zolai/chat` proxies to fine-tuned LLM
- Build chat interface in `features/zolai/components/`
- Socratic tutor logic defined in `wiki/architecture/chat_system.md`

### 1.3 Bible Verse Browser UI
- Backend ready: TDB77 + TBR17 + KJV aligned
- Build `features/zolai/components/BibleBrowser`
- Endpoint: `GET /api/zolai/bible/:book?chapter=1`

### 1.4 Grammar Checker API
- Expose `scripts/test_grammar_rules.py` as endpoint
- Endpoint: `POST /api/grammar/check` `{text}` → `{valid, errors[]}`
- Already have: grammar rules in `wiki/grammar/`
- **Unique** — no competitor has this

### 1.5 Dialect Classifier
- Classify input as Tedim vs Hakha/Falam using ZVS forbidden word list
- Endpoint: `POST /api/dialect/classify` `{text}` → `{dialect, confidence, flags[]}`
- Already have: forbidden words in `AGENTS.md` ZVS rules
- **Unique** — no competitor has this

---

## Priority 2 — Build from Existing Data (Medium effort)

### 2.1 Phrasebook
- Categorized phrases from `data/raw/zomime_parallel_phrases.jsonl` + parallel corpus
- Categories: greetings, food, travel, shopping, emergency, family, numbers, religious
- Data: 132 phrases + 16 dialogues already collected

### 2.2 Pronunciation Guide
- 10-letter guide extracted from zomi.me
- Extend with tone guide (High/Mid/Low/Falling)
- File: `data/raw/zomime_pronunciation_guide.json`

### 2.3 Cultural Content Pages
- Proverbs: `wiki/literature/proverbs_and_wisdom.md`
- History: `wiki/culture/zomi_comprehensive.md`
- Literature: `wiki/literature/`
- **Advantage** — sources are older and more authoritative than competitors

### 2.4 Daily Word / Featured Words
- Pull from `data/vocabulary_frequency.json` (39,619 unique words)
- Rotate daily from high-frequency Tedim words

### 2.5 Vocabulary Quiz
- Generate from `data/master/combined/dictionary.jsonl`
- Question types: en→zomi, zomi→en, fill-in-blank, multiple choice

### 2.6 Fix Newsletter Email Sending
- 2 TODO comments in website codebase
- Backend complete, just needs email provider wiring

---

## Priority 3 — New Features (Higher effort, high differentiation)

### 3.1 ZVS Grammar Lessons
- Structured lessons based on `wiki/curriculum/readme.md`
- CEFR-aligned: A1→C2 as defined in `AGENTS.md`
- Unique: no competitor teaches ZVS-standard Tedim grammar

### 3.2 Bible Verse Search
- Full-text search across `Cleaned_Bible/` parallel corpus
- Endpoint: `GET /api/bible/search?q=&book=&chapter=`
- **Unique** — no competitor has this

### 3.3 Parallel Text Reader
- Side-by-side Zolai/English Bible and hymn reader
- Data: `data/zolai_tedim_hymns.jsonl`, `Cleaned_Bible/Parallel/`

### 3.4 CEFR Level Tagging
- Tag all 457K training entries with A1–C2 level
- Wire to AI tutor adaptive difficulty controller
- Required for curriculum to be functional

### 3.5 Offline PWA
- Cache dictionary + phrasebook for offline use
- Match zomidictionary.app's PWA capability

---

## Skills Needed

| Skill | Purpose | Priority |
|---|---|---|
| `zolai-grammar-checker` | Grammar validation endpoint | P1 |
| `zolai-dialect-classifier` | Tedim vs Hakha/Falam detection | P1 |
| `zolai-phrasebook-builder` | Categorized phrase generation | P2 |
| `zolai-cultural-content` | Proverbs/history/literature extraction | P2 |
| `zolai-quiz-generator` | Vocabulary quiz from dictionary | P2 |
| `zolai-bible-search` | Full-text Bible search API | P3 |
| `zolai-pwa` | Offline-capable web frontend | P3 |

---

## What We Skip

| Feature | Reason |
|---|---|
| Gamification (streaks, badges, XP) | Not core to language preservation mission |
| Community forum | Requires moderation, not our focus |
| Digital Museum | Low priority vs language tools |

---

## Competitive Summary

We win on: **accuracy, dialect purity, grammar enforcement, Bible corpus, fine-tuned model, RVAsia Catholic corpus**
They win on: **UI polish, community, gamification, offline PWA**

Our path: expose the model and data via API first → build minimal UI on top → let the quality speak.

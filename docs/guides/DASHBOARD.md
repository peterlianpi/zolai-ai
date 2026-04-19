# Zolai AI Second Brain — Master Dashboard
> Last updated: 2026-04-14 | Reflects actual project state

---

## 📊 Overall Project Health

| Area | Status | Score |
|------|--------|-------|
| Bible Corpus | ✅ Complete | 95% |
| AI Wiki (Linguistics) | ✅ Comprehensive | 92% |
| Grammar Rules | ✅ Strong | 95% |
| Vocabulary Coverage | 🟡 Moderate | 65% |
| Curriculum (CEFR) | ✅ Wired to Tutor | 90% |
| Training Data | ✅ Large, v11 Tagged | 95% |
| Dictionary | ✅ Semantic + SQLite | 85% |
| AI Tutor System | ✅ API Adaptive | 85% |
| Website (Next.js) | 🟡 ~89%, UI gaps | 75% |
| Infrastructure | ✅ Solid | 80% |

---

## 📖 Bible Corpus Status

### Bible Versions Available
| Code | Name | Verses | File |
|------|------|--------|------|
| TDB | Tedim Bible 2011 (online) | 30,717 | `data/master/sources/bible_tdb_online.jsonl` |
| TB77 | Tedim Bible 1977 (online) | 30,721 | `data/master/sources/bible_tb77_online.jsonl` |
| TBR17 | Tedim Bible Revised 2017 | 30,716 | `data/master/sources/bible_tbr17.jsonl` |
| T2010 | Tedim (Chin) Bible 2010 | 30,693 | `data/master/sources/bible_tedim2010.jsonl` |
| KJV | King James Version | 31,102 | `resources/Chin-Bible/King James Version/USX_1/` |

> All 4 Zolai versions: 66/66 books, ~97% KJV coverage (remaining 3% = genuine merged verses in Tedim translation). Fixed 2026-04-14: NAH/NAM book code, cross-book dedup, verse parser, combined refs.

### Parallel Corpus Status
| File | Pairs | Status |
|------|-------|--------|
| `data/master/combined/parallel.jsonl` | 105,511 | ✅ Rebuilt 2026-04-14 (all 4 versions × KJV) |
| `Cleaned_Bible/Parallel/` | 66 books | ✅ TDB77 + Tedim2010 + KJV .md files |

---

## 🗄 Data Assets

| Dataset | Size | Entries | Status |
|---------|------|---------|--------|
| `data/master/sources/zolai_corpus_master.jsonl` | ~9.4 GB | Full corpus | ✅ |
| `data/master/combined/sentences.jsonl` | ~600 MB | ~2M sentences | ✅ |
| `data/master/combined/parallel.jsonl` | ~40 MB | 68,817 pairs | ✅ |
| `data/master/combined/dictionary.jsonl` | ~22 MB | Master dict | ✅ |
| `data/master/combined/instructions.jsonl` | ~30 MB | Instruction data | ✅ |
| `data/master/sources/zolai_full_training_v11.jsonl` | ~132 MB | Latest snapshot | ✅ |
| `data/processed/master_dictionary_semantic.jsonl` | ~52 MB | 24,891 entries | ✅ |
| `data/processed/master_dictionary_enriched.jsonl` | ~37 MB | Enriched dict | ✅ |
| `data/master/sources/tongdot_dictionary.jsonl` | ~29 MB | TongDot dict | ✅ |
| `data/rvasia_tedim.jsonl` | ~13 MB | 966 articles | ✅ |
| `data/raw/zomidictionary_export.jsonl` | ~6.8 MB | App export | ✅ |
| `data/master_unified_dictionary.db` | ~112 MB | SQLite FTS5 | ✅ |

---

## 🧠 AI Wiki Analysis

### By Category
| Category | Files | Status |
|----------|-------|--------|
| Grammar | 14 | ✅ Strong — core rules documented |
| Vocabulary | 17 | 🟡 Good breadth, some unverified entries |
| Translation | 5 | ✅ Decision patterns well-documented |
| Curriculum | 7 | 🟡 All 6 CEFR levels defined, not wired to data |
| Literature | 7 | 🟡 Style guides present, incomplete |
| Culture | 5 | 🟡 Thin — needs expansion |
| Biblical Survey | 8 | 🟡 Structure good, content depth varies |
| Architecture | 2 | ✅ Chat system + routing documented |
| Training | 3 | 🟡 Specs exist, tagging not done |
| History | 4 | 🟡 Snippets only |
| Concepts | 3 | ✅ Psycholinguistic + Socratic defined |
| Mistakes | 1 | 🔴 Very thin — needs major expansion |
| Glossary | 1 | 🟡 Zo compound words only |
| Planning | 1 | 🟡 Todo list |
| Features | 1 | ✅ Competitive roadmap |

### ✅ Solid Reference Files
- `grammar/morphemics.md`, `grammar/phonology.md`, `grammar/particle_differentiations.md`
- `grammar/verb_stems.md`, `grammar/advanced_syntax.md`, `grammar/sentence_structures.md`
- `grammar/tense_markers.md`, `grammar/ergative_in.md`, `grammar/punctuation.md`
- `translation/decision_patterns.md`, `translation/emotion_lung_cheat_sheet.md`
- `translation/english_to_zolai_mapping.md`
- `architecture/chat_system.md`
- `concepts/socratic_philosophy.md`, `concepts/domain_routing_architecture.md`
- `curriculum/a1_beginner.md` through `curriculum/c2_mastery.md` (all 6 levels)
- `literature/folklore_idioms.md`, `literature/poetry_and_songs.md`

### 🟡 Needs Improvement
- `grammar/tones.md` — stub, tonal system underdocumented
- `grammar/verb_aspects.md` — stub
- `grammar/dialectal_nuance.md` — thin
- `vocabulary/common-words.md` — very thin
- `mistakes/common_mistakes.md` — critical tutor resource, needs expansion
- `culture/` — 3 overlapping files need consolidation

### 🔴 Missing
- `wiki/pronouns/` — pronoun system not isolated
- `wiki/particles/` — comprehensive particle index missing
- `wiki/register/` — formal vs informal register (referenced in AGENTS.md, no dedicated file)
- `wiki/negation/` — negation patterns not consolidated
- `wiki/numbers/` — number system undocumented
- `wiki/decisions/` — empty (ADRs)
- `wiki/patterns/` — empty (reusable grammar/translation patterns)

---

## 🏫 Curriculum & Training Data

### CEFR Levels
| Level | Wiki File | Dataset Tagged | Count | % |
|-------|-----------|---------------|-------|---|
| A1 | ✅ | ✅ | 27,414 | 6.8% |
| A2 | ✅ | ✅ | 221,343 | 54.9% |
| B1 | ✅ | ✅ | 110,292 | 27.3% |
| B2 | ✅ | ✅ | 8,809 | 2.2% |
| C1 | ✅ | ✅ | 8,343 | 2.1% |
| C2 | ✅ | ✅ | 27,273 | 6.8% |

> Tagged file: `data/master/sources/zolai_full_training_v11_cefr.jsonl` (403,474 entries). Tutor wiring still needed.

---

## 🌐 Website (Next.js) — `website/zolai-project/`

### Overall: ~87% Complete

| Feature | Status | Notes |
|---|---|---|
| Auth (Better Auth) | ✅ | emailOTP, sessions, CSRF, audit logging |
| Role Management | ✅ | Full admin UI, bulk ops, metrics |
| Content / Posts | ✅ | CMS with editor, taxonomies, media |
| Comments | ✅ | Moderation, threading, spam |
| Security | ✅ backend | Admin UI still needed |
| Newsletter | ⚠️ | Backend done; email sending broken |
| Notifications | ✅ | Templates, bulk send, preferences |
| Forms | ❌ | Backend ready; zero UI |
| **Dictionary (ZO↔EN)** | ✅ | 24,891 entries seeded ✅ |
| **Bible Corpus** | ✅ | 31,069 verses seeded ✅ (TDB77+TBR17+T2010+KJV) |
| **Wiki** | ✅ backend | Grammar/culture entries; UI needed |
| **AI Tutor/Chat** | ✅ API | Proxies to LLM; UI needed |
| **Training Dashboard** | ✅ backend | Run tracking; UI needed |

### Immediate Next Steps (Website)
1. `bunx prisma migrate dev --name add-vocab-semantic-fields`
2. `bunx tsx scripts/seed-dictionary.ts` — seeds 24,891 entries
3. Build Dictionary search UI (`features/dictionary/components/`)
4. Build Bible verse browser UI (`features/zolai/components/`)
5. Fix newsletter email sending
6. Build Forms admin UI

---

## 🛠 Dev Tools & Auditor

### Available
- `dev/audit_zolai.py` — grammar rules, apostrophe, ergative, stem I/II, register, forbidden words
- `dev/audit_cli.py` — interactive audit
- `dev/extract_parallel.py`, `dev/extract_zvs_parallel.py`
- `dev/scripts/extract_vocab.py`, `dev/scripts/check_stems.py`
- `dev/scripts/align_verses.py`, `dev/scripts/sync_wiki.py`

### 🔴 Not Built
- Global Context Auditor (scan entire directory)
- Tone Consistency Check (document-wide)
- Stem II Verification via JSON map
- Audit CLI: batch processing, auto-fix, JSON/CSV export
- Web Interface (Flask/Streamlit)

---

## 🚧 Priority Action Items

### 🔴 Critical
1. **Wire CEFR levels to AI tutor** — `v11_cefr.jsonl` tagged; tutor adaptive controller needs to read `cefr_level` from metadata
2. **Build Dictionary UI** — backend seeded (24,891 entries), no frontend
3. **Build Bible verse browser UI** — backend ready
4. **Expand `mistakes/common_mistakes.md`** — core tutor resource, currently thin

### 🟡 High Priority
5. **Create `wiki/register/`** — formal vs informal register guide
6. **Create `wiki/pronouns/`** and `wiki/particles/`
7. **Fix newsletter email sending** (2 TODO comments in website)
8. **Expand `grammar/tones.md`** and `grammar/verb_aspects.md`
9. **Resolve duplicate culture files** — consolidate 3 overlapping files

### 🟢 Normal Priority
10. Create `wiki/negation/` and `wiki/numbers/`
11. Build Stem II JSON verification map for auditor
12. Generate 20-sentence test sets per CEFR level
13. Build Forms admin UI (website)

---

## 📁 Project Structure Health

| Directory | Purpose | Status |
|-----------|---------|--------|
| `src/zolai/` | Core Python package | ✅ Active |
| `zolai/` | Main package (CLI, API, modules) | ✅ Active |
| `wiki/` | Knowledge base | 🟡 Growing |
| `Cleaned_Bible/` | Bible corpus (all 66 books) | ✅ Complete |
| `scripts/` | Utility scripts | ✅ Well-organized |
| `dev/` | Dev/audit tools | 🟡 Partial |
| `notebooks/` | Kaggle notebooks | ✅ Active |
| `resources/` | Reference texts | ✅ Solid |
| `data/` | Datasets & DBs | ✅ Large |
| `agents/` | 14 agent definitions | ✅ |
| `skills/` | Skill modules | ✅ |
| `runs/` | Training runs | 🟡 v1 + v7 |
| `config/` | LoRA config | ✅ |
| `website/zolai-project/` | Next.js web app | 🟡 ~87% |

---

*Dashboard reflects state as of 2026-04-14.*

# Competitive Audit Report — Zomi Language Sites
> Generated: 2026-04-14 | Audited by: Kiro AI
> Sites: zomi.me · zomidictionary.app

---

## 1. zomi.me

### Tech Stack
- Expo (React Native for Web) — cross-platform SPA
- Cloudflare CDN — static hosting
- Backend: Rork platform (api.rork.app) — **currently down**
- tRPC for API calls

### Features
- 50 hardcoded phrases (greetings, food, travel, shopping, emergency, family, numbers)
- 6 lessons (Basic Greetings, Common Phrases, Numbers 1-20, Family, Food, Verb Conjugation)
- 15 quiz questions
- 4 sample forum posts (hardcoded)
- 10-letter pronunciation guide
- AI translation (client-side fallback via Vercel AI gateway)
- Speech-to-text (broken — rork.app down)

### Data Quality
- All dictionary data hardcoded in JS bundle (50 entries)
- No real backend database
- Translation falls back to generic AI with no fine-tuning

### Security Issues
- HSTS + Cloudflare: ✅
- Missing: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- JS bundle is 4.7MB — exposes full app logic, prompts, and API endpoints

### Status: **Mostly broken** — backend down, all data static

---

## 2. zomidictionary.app

### Tech Stack
- Vite + React + tRPC — proper SPA with real backend
- Express.js backend (Node.js)
- SQLite database (via Cloudflare/hosted)
- Cloudflare CDN + WAF
- PWA with offline support

### Full Feature List (50+ routes)

| Category | Features |
|---|---|
| Core | Dictionary (33,532 words), Search (en↔zomi), Word detail pages `/word/:word` |
| AI | AI Translator, AI Tutor, AI Conversation Practice |
| Learning | Vocabulary Quiz, Phrasebook, Pronunciation Practice, Daily Challenges, Featured Words |
| Voice | Voice Search, Speech Recognition, Audio pronunciation |
| Culture | Proverbs, Folklore, Literature, Digital Museum, Cultural Notes |
| Community | Forum (auth required), Blog (7 posts), Community Notes, Member Directory, Activity Feed |
| Gamification | Streaks, Badges, Leaderboard, Points, Digital ID |
| User | Profile, Dashboard, Bookmarks, Favorites, Notifications, Translation Requests |
| Offline | Full PWA — dictionary cached for offline use |
| Contribution | Suggest Word, Contribute page, Word moderation |
| Admin | Users, Moderation, Blog/Library/Museum moderation, Search Analytics, Batch Export |
| Developer | Developer API (listed, not publicly documented) |

### API Endpoints (tRPC)
| Procedure | Status | Notes |
|---|---|---|
| `dictionary.search` | ✅ Working | limit param supported (up to 100) |
| `dictionary.getAllForOffline` | ✅ Working | Returns 5000/page, full dump possible |
| `dictionary.export` | ✅ Working | Full 33k dump, no auth required |
| `dictionary.stats` | ✅ Working | Total=33,532, full POS breakdown |
| `dictionary.smartSuggestions` | ✅ Working | Trending searches, popular blog posts |
| `dictionary.getById` | ✅ Working | Full schema per entry |
| `blog.getPosts` | ✅ Working | 7 posts, paginated |
| `blog.getPostBySlug` | ✅ Working | Full post metadata |
| `communityNotes.featured` | ✅ Working | |
| `points.getLeaderboard` | ✅ Working | Exposes numeric user IDs |
| `forum.getPosts` | ❌ 401 | Auth required |
| `auth.me` | ✅ Working | Returns null (unauthenticated) |

### Data Quality
- 33,532 English→Zomi entries
- Part of speech tagged (n, v, adj, adv, prep, etc.)
- `usageExample`, `culturalNote`, `audioUrl` fields exist but **all null** — not populated
- No dialect standardization — mixed Tedim/Hakha/Falam likely
- No grammar validation

### Security Audit Results

| Severity | Finding | Status |
|---|---|---|
| 🔴 HIGH | SQL query leaked in error messages | Open |
| 🔴 HIGH | Unauthenticated full DB dump (33k entries) via `getAllForOffline` + `export` | Open |
| 🟠 MEDIUM | Internal DB fields exposed: `englishLower`, `zomiLower`, `audioKey` | Open |
| 🟠 MEDIUM | No rate limiting on any endpoint | Open |
| 🟠 MEDIUM | Sequential numeric user IDs exposed in leaderboard (admin ID=1 visible) | Open |
| 🟡 LOW | Missing security headers: CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy | Open |
| ✅ GOOD | SQL injection safe (parameterized queries) | — |
| ✅ GOOD | Auth-protected endpoints return 401 correctly | — |
| ✅ GOOD | HSTS with preload | — |
| ✅ GOOD | Behind Cloudflare | — |

### Recommended Fixes (Priority Order)
1. `getAllForOffline` + `export` → change `publicProcedure` to `protectedProcedure`
2. Error handler → catch DB errors, return generic message only
3. Search response → strip `englishLower`, `zomiLower`, `audioKey` from DTO
4. Cloudflare WAF → rate limit `/api/trpc*` to 60 req/min/IP
5. Leaderboard → remove numeric `id` field, use display fields only
6. Cloudflare Transform Rules → add 5 missing security headers

---

## 3. Comparison: zomidictionary.app vs Zolai

| Capability | zomidictionary.app | Zolai |
|---|---|---|
| Dictionary size | 33,532 entries | 33k+ (same source + more) |
| Web UI | ✅ Full-featured | ❌ None yet |
| Mobile app | ✅ Via zomi.me (broken) | ❌ None |
| Translation | Generic AI (no fine-tuning) | ✅ Fine-tuned LLM on Tedim |
| Dialect purity | ❌ Mixed dialects | ✅ ZVS Tedim-only |
| Grammar enforcement | ❌ None | ✅ ZVS rules validated |
| Training pipeline | ❌ None | ✅ V9 exhaustive, deduped, audited |
| Bible corpus | ❌ None | ✅ Full parallel corpus |
| Hymns corpus | ❌ None | ✅ Full corpus |
| Data standardization | ❌ None | ✅ V8/V9 standardization |
| Offline support | ✅ PWA | ❌ N/A |
| Community/Forum | ✅ Auth-gated | ❌ None |
| Gamification | ✅ Full | ❌ None |
| Voice/TTS | ✅ (basic) | ❌ None |
| Cultural content | ✅ Museum, folklore, literature | ✅ Resources/ (not exposed) |
| Grammar checker | ❌ None | ✅ test_grammar_rules.py |
| Dialect classifier | ❌ None | ✅ Possible (ZVS rules exist) |
| Public API | ❌ Undocumented | ❌ Not exposed yet |
| Security | ⚠️ Multiple issues | N/A (no public surface) |

---

## 4. Zolai Unique Advantages

1. **Only fine-tuned LLM for Tedim Zolai** — they use generic AI, we train purpose-built models
2. **ZVS dialect purity** — strict Tedim-only, no Hakha/Falam contamination enforced
3. **Standardized training pipeline** — V9 exhaustive builder, deduplication, grammar validation
4. **Bible + hymn corpus** — richest formal Zolai text source, not available anywhere else
5. **Second Brain architecture** — not just a dictionary, a full AI knowledge system
6. **Grammar rules as code** — `test_grammar_rules.py` enforces ZVS rules programmatically

---

## 5. Data Collected from Both Sites

| File | Records | Source |
|---|---|---|
| `zomidictionary_app_full.jsonl` | 33,532 | getAllForOffline |
| `zomidictionary_export.jsonl` | 33,532 | export endpoint |
| `zomidictionary_full_schema.jsonl` | 1,654 | search sweep (full schema) |
| `zomidictionary_blog_posts.json` | 7 posts | blog.getPostBySlug |
| `zomidictionary_stats.json` | — | stats endpoint |
| `zomidictionary_trending.json` | 5 terms | smartSuggestions |
| `zomime_parallel_phrases.jsonl` | 132 | zomi.me JS bundle |
| `zomime_dialogues.jsonl` | 16 | zomi.me JS bundle |
| `zomime_vocabulary.jsonl` | 18 | zomi.me JS bundle |
| `zomime_grammar_notes.json` | — | zomi.me JS bundle |
| `zomime_pronunciation_guide.json` | — | zomi.me JS bundle |
| **TOTAL** | **68,891** | |

All files in `data/raw/`, matching existing `parallel.jsonl` schema.

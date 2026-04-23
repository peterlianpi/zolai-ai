# Dictionary Sources
All Zolai dictionary data lives here. Three primary sources.

---

## 3 Primary Sources

### 1. ZomiDictionary (`zomidictionary_*`)
- **Origin**: ZomiDictionary Android app export
- **Content**: 24,132 Tedim↔English entries
- **Schema**: `{English, Tedim}` (app DB) / `{zolai, english, dialect, pos, category}` (JSONL)
- **Files**:
  - `raw/zomidictionary_export_v1.jsonl` — 6.5 MB JSONL export
  - `raw/zomidictionary_app_full_v1.jsonl` — 6.4 MB full app data
  - `db/zomidictionary_app.db` — 2.8 MB original SQLite (table: `TedimEnglish`)

### 2. TongDot (`dict_tongdot_*`)
- **Origin**: Scraped from tongdot.com dictionary
- **Content**: ~28 MB of query/result pairs
- **Schema**: `{query, source_url, found, result_count, results, error}`
- **Files**:
  - `raw/dict_tongdot_raw_v1.jsonl` — 28 MB raw scrape
  - `raw/dict_tongdot_sample.jsonl` — small sample

### 3. Legacy Multi-Source (`zolai_dictionary_legacy.db`)
- **Origin**: Compiled from multiple older sources (VZT, DLH, TKD, MCPG)
- **Content**: ~53k entries across ZO→EN and EN→ZO tables
- **Schema**: `{mainWord, wordType, definitionArray, exampleArray, synonymArray, ...}`
- **Tables**:
  - `z2e.dict.vzt` — 4,087 rows (Zolai→English, VZT source)
  - `z2e.dict.dlh` — 5,251 rows (Zolai→English, DLH source)
  - `e2z.dict.tkd` — 40,820 rows (English→Zolai, TKD source)
  - `e2z.dict.mcpg` — 2,996 rows (English→Zolai, MCPG source)
- **Files**:
  - `db/zolai_dictionary_legacy.db` — 17 MB SQLite

---

## Built From All 3 Sources

### Master Unified Dictionary
- **160,394 entries** merged and deduplicated from all 3 sources + ZomiMe
- `db/master_unified_dictionary.db` — 114 MB SQLite with FTS5 full-text search
- `processed/dict_unified_v1.jsonl` — 31 MB JSONL (`{headword, translations, pos, sources, explanations}`)

### Enriched / Semantic
- `processed/dict_enriched_v1.jsonl` — 36 MB, with examples and context
- `processed/dict_semantic_v1.jsonl` — 50 MB, with semantic vectors
- `processed/dict_en_zo_v1.jsonl` — 36 MB, EN→ZO direction
- `processed/dict_zo_tdm_v1.jsonl` — 8 MB, ZO→TDM dialect

---

## Structure

```
dictionary/
├── db/                          ← SQLite databases
│   ├── master_unified_dictionary.db   ★ 114 MB — use this for search/API
│   ├── zomidictionary_app.db          2.8 MB — source 1 original
│   └── zolai_dictionary_legacy.db     17 MB  — source 3 original
│
├── processed/                   ← Clean JSONL, ready to use
│   ├── dict_unified_v1.jsonl          ★ 31 MB — 152k entries
│   ├── dict_enriched_v1.jsonl           36 MB
│   ├── dict_semantic_v1.jsonl           50 MB
│   ├── dict_en_zo_v1.jsonl              36 MB
│   ├── dict_zo_tdm_v1.jsonl              8 MB
│   ├── dict_combined_v1.jsonl           23 MB
│   └── phrases_v1.jsonl                304 KB
│
├── raw/                         ← Original scraped data (do not edit)
│   ├── dict_tongdot_raw_v1.jsonl        28 MB — source 2
│   ├── zomidictionary_export_v1.jsonl    6.5 MB — source 1
│   ├── zomidictionary_app_full_v1.jsonl  6.4 MB — source 1
│   └── zomime_vocabulary_v1.jsonl        (ZomiMe source)
│
└── wordlists/                   ← Word lists and frequency data
    ├── wordlist_en_zo_v1.jsonl
    ├── wordlist_zo_en_v1.jsonl
    ├── zo_en_wordlist_v1.jsonl          40k entries
    ├── vocab_frequency_tdb77.json
    └── vocab_frequency_tedim1932.json
```

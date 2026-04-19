# Dictionary Data — Approaches & Current State
> Last updated: 2026-04-14

## Current Dictionary Assets

| File | Size | Entries | Status |
|---|---|---|---|
| `data/processed/master_dictionary_semantic.jsonl` | ~52 MB | 24,891 | ✅ Primary — ZO↔EN with semantic fields |
| `data/processed/master_dictionary_enriched.jsonl` | ~37 MB | — | ✅ Enriched with examples |
| `data/processed/master_dictionary_en_zo.jsonl` | ~37 MB | — | ✅ EN→ZO direction |
| `data/master/combined/dictionary.jsonl` | ~22 MB | — | ✅ Master combined |
| `data/master/sources/tongdot_dictionary.jsonl` | ~29 MB | — | ✅ TongDot source |
| `data/master/sources/master_unified_dictionary.jsonl` | ~30 MB | — | ✅ Unified source |
| `data/raw/zomidictionary_export.jsonl` | ~6.8 MB | — | ✅ ZomiDictionary app |
| `data/master_unified_dictionary.db` | ~112 MB | — | ✅ SQLite FTS5 (search-ready) |

---

## Approach 1: TongDot Dictionary Crawler (Completed)

Fetches definitions from TongDot dictionary with multi-session support.

**Script:** `scripts/crawlers/fetch_tongdot_dictionary.py`

**Usage:**
```bash
# Single session
python scripts/crawlers/fetch_tongdot_dictionary.py \
  --input data/tongdot_search_words.txt \
  --output data/master/sources/tongdot_dictionary.jsonl \
  --resume --sleep 0.4

# Multi-session (parallel)
python scripts/crawlers/fetch_tongdot_dictionary.py \
  --input data/tongdot_search_words.txt \
  --output data/master/sources/tongdot_dictionary.jsonl \
  --session-id 0 --num-sessions 3 --max-workers 5
```

**Key options:** `--resume`, `--sleep N`, `--timeout N`, `--retries N`

---

## Approach 2: SQLite FTS5 Dictionary DB (Completed)

Builds a searchable SQLite database from JSONL sources.

**Script:** `scripts/build_dictionary_db.py`
**Search:** `scripts/search_dictionary.py <word>`
**Output:** `data/master_unified_dictionary.db` (112 MB, FTS5 full-text search)

```bash
python scripts/build_dictionary_db.py
python scripts/search_dictionary.py lungdam
```

---

## Approach 3: Semantic Dictionary Builder (Completed)

Builds the primary 24,891-entry ZO↔EN semantic dictionary used by the website.

**Script:** `scripts/build_semantic_dictionary.py`
**Output:** `data/processed/master_dictionary_semantic.jsonl`

```bash
python scripts/build_semantic_dictionary.py
```

---

## Approach 4: Enriched Dictionary (Completed)

Adds corpus examples, frequency data, and cross-references.

**Script:** `scripts/build_enriched_dictionary.py`
**Output:** `data/processed/master_dictionary_enriched.jsonl`

---

## ZVS Dialect Notes

Standard Tedim (preferred): `tua`, `gam`, `tapa`, `topa`, `kumpipa`, `pasian`
Non-standard (avoid): `cu`, `cun`, `bawipa`, `pathian`, `ram`, `siangpahrang`, `fapa`

---

## Seeding the Website

```bash
cd website/zolai-project
bunx tsx scripts/seed-dictionary.ts   # Seeds 24,891 entries from master_dictionary_semantic.jsonl
```

# Dictionary Rebuild V5: Intelligent Learning System

**Status:** ✅ OPERATIONAL  
**Date:** 2026-04-16  
**Total Entries:** 34,776  
**Avg Confidence:** 0.85  
**Zolai Patterns Discovered:** 11,022

---

## Overview

V5 implements an **intelligent, metric-driven learning system** that:

1. **Learns from all resources** — even without explicit EN↔ZO pairs
2. **Extracts Zolai patterns** — discovers word patterns and context
3. **Uses dictionary context** — searches existing dictionary for meaning
4. **Tracks confidence metrics** — learns with each cycle
5. **Supports resumption** — checkpoints progress for interruption recovery
6. **Flexible extraction** — handles multiple data formats

---

## Architecture

### Database Schema

```sql
entries
├── id (TEXT PRIMARY KEY)
├── en (TEXT) — English word
├── zo (TEXT) — Zolai word
├── confidence (REAL) — 0.0-0.95 confidence score
├── source (TEXT) — extraction source
├── frequency (INTEGER) — occurrence count
├── learning_count (INTEGER) — times learned
├── metric_score (REAL) — metric learning score
├── context (TEXT) — sample context
└── created_at, updated_at (TEXT)

zo_patterns
├── id (TEXT PRIMARY KEY)
├── pattern (TEXT) — Zolai word pattern
├── frequency (INTEGER) — occurrence count
├── confidence (REAL) — pattern confidence
├── source (TEXT) — extraction source
├── context (TEXT) — sample context
└── created_at (TEXT)

learning_metrics
├── id (TEXT PRIMARY KEY)
├── cycle (INTEGER) — learning cycle number
├── source (TEXT) — extraction source
├── entries_found (INTEGER)
├── entries_learned (INTEGER)
├── avg_confidence (REAL)
└── timestamp (TEXT)
```

---

## Learning Process

### Cycle 1: ZomiDictionary Extraction
- **Entries learned:** 33,386
- **Confidence:** 0.85
- **Method:** Direct EN↔ZO pair extraction

### Cycle 2: Bible Text Pattern Learning
- **Entries learned:** 1,390
- **Confidence:** 0.70-0.80
- **Method:** Extract Zolai patterns from Bible text, lookup in dictionary

### Cycle 3: Resource Pattern Discovery
- **Patterns discovered:** 11,022
- **Method:** Extract word patterns from all JSONL files

---

## Key Features

### 1. Flexible Extraction
```python
# Handles multiple data formats
- zomidictionary: {"zolai": "...", "english": "..."}
- Bible: {"text": "..."}
- Wordlists: {"en": "...", "zo": "..."}
- Generic JSONL: Any text field
```

### 2. Pattern Learning
```python
# Extract Zolai patterns from text
patterns = extract_zo_patterns(text)
# Lookup in dictionary for context
if pattern in dictionary:
    en_meaning = dictionary[pattern]
    # Create entry with confidence boost
```

### 3. Confidence Tracking
- **Initial confidence:** 0.5-0.85 (by source)
- **Learning boost:** +0.01-0.02 per cycle
- **Max confidence:** 0.95
- **High confidence entries:** 1,055 (≥0.9)

### 4. Resumption Support
```python
# Checkpoint saved after each cycle
checkpoint = {
    "cycle": 2,
    "source": "bible",
    "progress": 1234
}
# Resume from last checkpoint on restart
```

---

## Exports

### 1. `dictionary_en_zo.jsonl` (34,776 entries)
```json
{
  "en": "adversity",
  "zo": "cihmawhna",
  "confidence": 0.95,
  "source": "zomidictionary",
  "frequency": 7
}
```

### 2. `dictionary_zo_en.jsonl` (34,776 entries)
```json
{
  "zo": "cihmawhna",
  "en": "adversity",
  "confidence": 0.95,
  "source": "zomidictionary",
  "frequency": 7
}
```

### 3. `zolai_patterns.jsonl` (5,000 patterns)
```json
{
  "pattern": "khat",
  "frequency": 42,
  "source": "zomidictionary",
  "context": "khat, laibu khat"
}
```

### 4. `learning_report.json`
```json
{
  "total_entries": 34776,
  "paired_entries": 34776,
  "avg_confidence": 0.85,
  "high_confidence_entries": 1055,
  "zolai_patterns": 11022,
  "sources": {
    "zomidictionary": 33386,
    "bible": 1390
  }
}
```

---

## Scripts

### `intelligent_learning_v5.py`
Main learning engine with multi-cycle extraction.

```bash
python scripts/intelligent_learning_v5.py
```

**Features:**
- Loads existing dictionary for context
- Extracts from ZomiDictionary, Bible, and all resources
- Learns Zolai patterns from text
- Supports resumption via checkpoints
- Runs 3 learning cycles

**Output:**
- SQLite database: `data/processed/rebuild_v5/dictionary_v5.db`
- Learning log: `data/processed/rebuild_v5/learning_log.jsonl`
- Checkpoint: `data/processed/rebuild_v5/checkpoint.json`

### `continuous_learning_v5.py`
Generates reports and exports.

```bash
python scripts/continuous_learning_v5.py
```

**Features:**
- Generates learning report
- Exports EN→ZO and ZO→EN dictionaries
- Exports Zolai patterns
- Saves metrics

**Output:**
- Exports: `data/processed/rebuild_v5/exports/`
- Report: `learning_report.json`

---

## Metrics

| Metric | Value |
|--------|-------|
| Total entries | 34,776 |
| Paired entries | 34,776 (100%) |
| Avg confidence | 0.85 |
| High confidence (≥0.9) | 1,055 |
| Zolai patterns | 11,022 |
| Primary source | ZomiDictionary (33,386) |
| Secondary source | Bible (1,390) |

---

## Next Steps

### Phase 2: Enrichment
- [ ] Add part-of-speech tags
- [ ] Add example sentences
- [ ] Add semantic relationships
- [ ] Add etymology

### Phase 3: Continuous Improvement
- [ ] Daily audit cycles
- [ ] Weekly extraction from new resources
- [ ] Monthly metric analysis
- [ ] Confidence refinement

### Phase 4: Integration
- [ ] Merge with existing v7 dictionary
- [ ] Deduplicate entries
- [ ] Resolve conflicts
- [ ] Deploy to production

---

## Files

- **Database:** `/data/processed/rebuild_v5/dictionary_v5.db`
- **Scripts:** `/scripts/intelligent_learning_v5.py`, `/scripts/continuous_learning_v5.py`
- **Exports:** `/data/processed/rebuild_v5/exports/`
- **Wiki:** `/wiki/dictionary_rebuild_v5/README.md`

---

## Usage

### Run Learning
```bash
python scripts/intelligent_learning_v5.py
```

### Generate Report
```bash
python scripts/continuous_learning_v5.py
```

### Query Database
```bash
sqlite3 data/processed/rebuild_v5/dictionary_v5.db
SELECT en, zo, confidence FROM entries WHERE confidence >= 0.9 LIMIT 10;
```

### Load Exports
```python
import json
with open("data/processed/rebuild_v5/exports/dictionary_en_zo.jsonl") as f:
    for line in f:
        entry = json.loads(line)
        print(f"{entry['en']} -> {entry['zo']}")
```

---

## Performance

- **Learning time:** ~5 minutes for 3 cycles
- **Database size:** ~50 MB
- **Export size:** ~9.4 MB (JSONL)
- **Memory usage:** ~500 MB

---

## Future Improvements

1. **Metric Learning:** Use embedding-based similarity for better pattern matching
2. **Semantic Clustering:** Group related words by meaning
3. **Cross-lingual Transfer:** Learn from related languages
4. **Active Learning:** Prioritize uncertain entries for human review
5. **Continuous Deployment:** Auto-deploy improved dictionaries

---

**Status:** ✅ V5 OPERATIONAL — Ready for Phase 2 enrichment and continuous improvement cycles.

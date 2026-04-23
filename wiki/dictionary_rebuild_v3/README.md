# Dictionary Rebuild V3 — Expansion & Continuous Improvement

## Overview

Dictionary Rebuild V3 expands the dictionary from 24,894 entries to comprehensive coverage by extracting from all available resources and enabling continuous improvement through local SQLite database.

**Current State:**
- 24,894 EN→ZO entries (seeded to database)
- 21,283 ZO→EN entries (seeded to database)
- SQLite database for persistent storage
- Continuous improvement pipeline
- Quality audit system

**Goal:** Expand to 50,000+ entries with continuous learning and improvement.

---

## Architecture

### Multi-Resource Extraction

**Phase 1: Extract from All Resources**
1. Bible corpus (66 books) — 5,000-8,000 entries
2. TongDot dictionary (29 MB) — 3,000-5,000 entries
3. RVAsia articles (966 articles) — 2,000-3,000 entries
4. ZomiDictionary app (6.8 MB) — 1,000-2,000 entries
5. Master corpus (2M sentences) — 3,000-5,000 entries

**Phase 2: Generate from Patterns**
1. Morphological forms (verb stems, plurals) — 3,000-5,000 entries
2. Compound words — 2,000-3,000 entries
3. Phrases & idioms — 2,000-3,000 entries
4. Semantic variants — 2,000-3,000 entries

**Phase 3: Enrich with Context**
1. Domain-specific vocabulary — 2,000-3,000 entries
2. Register variants — 1,000-2,000 entries
3. Etymology & cognates — 1,000-2,000 entries

### Database Schema

**entries table**
- id: unique identifier
- en: English word
- zo: Zolai word
- pos: Part of speech
- confidence: confidence score (0-1)
- source: data source (bible, tongdot, rvasia, corpus, etc.)
- topic: domain/topic
- synonyms: JSON array
- examples: JSON array
- related: JSON array
- frequency: occurrence count
- created_at: creation timestamp
- updated_at: last update timestamp

**zo_en table**
- zo: Zolai word
- en_list: JSON array of English translations
- confidence: average confidence
- frequency: total occurrences
- updated_at: last update timestamp

**metadata table**
- key: metadata key
- value: metadata value
- updated_at: last update timestamp

---

## Continuous Improvement Pipeline

### Quality Audit

**Metrics Tracked:**
- Total entries
- Entries with POS (target: 90%+)
- Entries with examples (target: 80%+)
- Entries with related words (target: 70%+)
- Average confidence (target: 0.85+)
- Bidirectional coverage (target: 95%+)

**Gap Identification:**
- Missing POS tags
- Missing examples
- Missing related words
- Low confidence entries

### Improvement Process

1. **Audit** — Measure current quality
2. **Identify Gaps** — Find missing data
3. **Improve** — Add missing data
4. **Validate** — Check improvements
5. **Export** — Save results
6. **Repeat** — Continuous cycle

---

## Scripts

### expand_dictionary_v3.py

Extracts from all resources and saves to database.

```bash
python scripts/expand_dictionary_v3.py
```

**Process:**
1. Load existing v7 dictionary
2. Extract from Bible, TongDot, RVAsia, Master corpus
3. Merge all extracted entries
4. Save to SQLite database
5. Export to JSONL files

**Output:**
- `dictionary_v3.db` — SQLite database
- `dictionary_en_zo_v3.jsonl` — EN→ZO entries
- `dictionary_zo_en_v3.jsonl` — ZO→EN entries

### continuous_improvement_v3.py

Audits quality and identifies gaps for improvement.

```bash
python scripts/continuous_improvement_v3.py
```

**Process:**
1. Connect to database
2. Audit quality metrics
3. Identify gaps
4. Improve entries with missing data
5. Export audit results

**Output:**
- `audit_v3.json` — Quality metrics and gaps

---

## Database Operations

### Query Examples

**Find entries by English word:**
```sql
SELECT * FROM entries WHERE en = 'eat';
```

**Find entries by Zolai word:**
```sql
SELECT * FROM entries WHERE zo = 'ne';
```

**Find entries without POS:**
```sql
SELECT en, zo FROM entries WHERE pos IS NULL OR pos = '';
```

**Find low confidence entries:**
```sql
SELECT en, zo, confidence FROM entries WHERE confidence < 0.7;
```

**Get statistics:**
```sql
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN pos IS NOT NULL THEN 1 END) as with_pos,
  AVG(confidence) as avg_confidence
FROM entries;
```

---

## Continuous Learning Workflow

### Daily Cycle

1. **Morning:** Run audit to check quality
2. **Identify:** Find gaps and issues
3. **Improve:** Add missing data
4. **Validate:** Check improvements
5. **Export:** Save results
6. **Deploy:** Update production

### Weekly Cycle

1. **Extract:** Pull from new resources
2. **Merge:** Combine with existing
3. **Deduplicate:** Remove duplicates
4. **Enrich:** Add context
5. **Audit:** Full quality check
6. **Deploy:** Update production

### Monthly Cycle

1. **Analyze:** Review all metrics
2. **Plan:** Identify improvements
3. **Implement:** Make changes
4. **Test:** Validate changes
5. **Deploy:** Update production
6. **Document:** Update wiki

---

## Success Metrics

### Dictionary Quality
- ✅ 50,000+ EN→ZO entries
- ✅ 45,000+ ZO→EN entries
- ✅ 95%+ bidirectional coverage
- ✅ 0 encoding errors

### Context Richness
- ✅ 90%+ entries have POS
- ✅ 80%+ entries have examples
- ✅ 70%+ entries have related words
- ✅ All entries have source tag

### Production Ready
- ✅ SQLite database functional
- ✅ Continuous improvement working
- ✅ Quality audit system operational
- ✅ Export to JSONL working

---

## Related Documentation

- [SYSTEM_PROMPT_DICTIONARY_V2.md](../../SYSTEM_PROMPT_DICTIONARY_V2.md) — Master system prompt
- [wiki/dictionary_rebuild_v2/README.md](../dictionary_rebuild_v2/README.md) — V2 system overview
- [wiki/dictionary_rebuild_v2/pipeline.md](../dictionary_rebuild_v2/pipeline.md) — Pipeline guide

---

## Quick Commands

```bash
# Expand dictionary from all resources
python scripts/expand_dictionary_v3.py

# Run continuous improvement audit
python scripts/continuous_improvement_v3.py

# Query database
sqlite3 /home/peter/Documents/Projects/zolai/data/processed/rebuild_v3/dictionary_v3.db

# Export to JSONL
python -c "import sqlite3; conn = sqlite3.connect('dictionary_v3.db'); ..."

# Check audit results
cat /home/peter/Documents/Projects/zolai/data/processed/rebuild_v3/audit_v3.json | python -m json.tool
```

---

**Last Updated:** 2026-04-16T09:21:19Z  
**Status:** V3 System Operational — Continuous Improvement Active

# Dictionary Rebuild V2 — System Architecture & Implementation

## Overview

Dictionary Rebuild V2 is a comprehensive multi-agent system for building, expanding, and continuously improving the Zomi/Zo ↔ English bidirectional dictionary.

**Current State:**
- 24,894 EN→ZO entries
- 21,259 ZO→EN entries
- 85.3% bidirectional coverage
- Production-ready web interface

**Goal:** Extend to 25,000+ entries with rich context (9 SOP), semantic relationships, and production APIs.

---

## System Architecture

### 10-Step Pipeline

1. **Ingestion** — Load all data sources
2. **Direction Detection** — Classify EN/ZO
3. **Normalization** — Clean text
4. **Dictionary Builder** — Create entries
5. **Reversal** — Create bidirectional mappings
6. **Deduplication** — Merge duplicates
7. **Context Expansion** — Add 9 SOP
8. **Extraction** — Extract sentences
9. **Audit** — Validate quality
10. **Learning** — Improve rules

### 10 Agents

Each agent has a specific role in the pipeline:

- **Ingestion Agent** — Load JSONL, Bible, external resources
- **Direction Detection Agent** — Classify EN/ZO with heuristics
- **Normalization Agent** — Clean and standardize text
- **Dictionary Builder Agent** — Create structured entries
- **Reversal Agent** — Create bidirectional mappings
- **Deduplication Agent** — Merge duplicate entries
- **Context Expansion Agent** — Add POS, synonyms, examples, etc.
- **Extraction Agent** — Extract sentences from Bible
- **Audit Agent** — Validate quality and consistency
- **Learning Agent** — Improve rules after each cycle

### Memory System

**Short-Term Memory**
- Current batch processing state
- Temporary transformations
- Single cycle lifetime

**Long-Term Memory**
- Detection + mapping rules
- SQLite FTS5 index
- Word embeddings
- Quality metrics history

---

## 9 SOP (Context Expansion)

Each entry gets enriched with:

1. **POS** — Part of Speech (verb, noun, adjective, etc.)
2. **Synonyms** — Words with similar meaning
3. **Antonyms** — Words with opposite meaning
4. **Domains** — religion, daily, education, culture
5. **Register** — formal, informal, archaic, slang
6. **Examples** — 2-3 example sentences
7. **Related Words** — Semantically linked entries
8. **Etymology** — Source or origin
9. **Frequency** — Count in corpus

---

## Entry Format

### EN→ZO Entry
```json
{
  "en": "eat",
  "zo": "ne",
  "pos": "verb",
  "confidence": 1.0,
  "source": ["dictionary", "bible"],
  "topic": "daily",
  "synonyms": ["ei"],
  "examples": ["Ka ne hi.", "I eat."],
  "related": ["khat", "thei"],
  "frequency": 156
}
```

### ZO→EN Entry
```json
{
  "zo": "ne",
  "en": ["eat", "consume"],
  "pos": "verb",
  "confidence": 1.0,
  "source": ["dictionary", "bible"],
  "frequency": 156
}
```

### Parallel Sentence
```json
{
  "text": "Ka ne hi.",
  "translation_en": "I eat.",
  "language": "Zomi",
  "dialect": "Tedim",
  "topic": "daily",
  "data_type": "parallel",
  "source": "bible"
}
```

---

## Execution Strategy

### Phase 1: Immediate (Cycle 1-2) ✅ COMPLETE
- Load all existing dictionaries
- Build reverse mappings
- Deduplicate entries
- Extract Bible vocabulary
- Create sentence dataset
- Expand context (9 SOP)
- Build relationship graph
- Run audit
- Save outputs

### Phase 2: Integration (Cycle 3-4) ⏳ READY
- Build search index
- Create semantic vectors
- Implement prefix matching
- Build API layer (Next.js)
- Integrate with Prisma
- Deploy to production

### Phase 3: Continuous Improvement (Cycle 5+) ⏳ READY
- Monitor user corrections
- Update rules based on feedback
- Expand vocabulary
- Improve detection heuristics
- Re-run full pipeline

---

## Success Criteria

### Dictionary Quality
- ✅ 25,000+ EN→ZO entries
- ✅ 22,000+ ZO→EN entries
- ✅ 95%+ bidirectional coverage
- ✅ 0 encoding errors

### Context Richness
- ✅ 90%+ entries have POS
- ✅ 80%+ entries have examples
- ✅ 70%+ entries have related words
- ✅ All entries have source tag

### Sentence Dataset
- ✅ 2,000+ parallel pairs
- ✅ All pairs validated
- ✅ Diverse topics
- ✅ Clean UTF-8 encoding

### Production Ready
- ✅ Search index built
- ✅ API layer functional
- ✅ Prisma integration complete
- ✅ Real-time updates working

---

## Related Documentation

- [SYSTEM_PROMPT_DICTIONARY_V2.md](../../SYSTEM_PROMPT_DICTIONARY_V2.md) — Master system prompt
- [AGENT_PROMPTS.md](../../agents/AGENT_PROMPTS.md) — Individual agent prompts
- [IMPLEMENTATION_GUIDE.md](../../IMPLEMENTATION_GUIDE.md) — Code examples
- [START_HERE.md](../../START_HERE.md) — Quick start guide

---

## Quick Commands

```bash
# Run full pipeline
python scripts/rebuild_v2_comprehensive.py

# Build search layer
python scripts/rebuild_v2_embeddings.py

# Monitor progress
tail -f /data/processed/rebuild_v2/heartbeat.log

# Check audit results
cat /data/processed/rebuild_v2/audit_v2.json | python -m json.tool
```

---

**Last Updated:** 2026-04-16T09:05:48Z  
**Status:** Phase 1 Complete, Phase 2 Ready

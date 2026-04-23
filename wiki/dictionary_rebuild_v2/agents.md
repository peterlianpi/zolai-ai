# Dictionary Rebuild V2 — Agent Specifications

## Agent 1: Ingestion Agent

**Role:** Load all data sources and prepare for processing

**Responsibilities:**
- Load existing JSONL dictionaries (3 files)
- Load Bible corpus (66 books, all versions)
- Load external linguistic resources
- Validate encoding (UTF-8)
- Report statistics

**Input:**
- `/data/processed/rebuild_v1/final_en_zo_dictionary_v7.jsonl`
- `/data/processed/rebuild_v1/final_zo_en_dictionary_v7.jsonl`
- `/Cleaned_Bible/*.txt` (all 66 books)

**Output:**
```json
{
  "loaded": {
    "en_zo_entries": 24894,
    "zo_en_entries": 21259,
    "bible_files": 66
  },
  "encoding_errors": 0,
  "status": "ready"
}
```

---

## Agent 2: Direction Detection Agent

**Role:** Classify each entry as EN→ZO or ZO→EN

**Heuristics:**
- **English:** ASCII-only, known vocabulary, >2 chars
- **Zo:** Syllable patterns (CV, CCV), tone markers, known phonetics

**Output:**
```json
{
  "headword": "ne",
  "direction": "zo_to_en",
  "confidence": 0.95,
  "reason": "Zo syllable pattern (CV)"
}
```

---

## Agent 3: Normalization Agent

**Role:** Clean and standardize all text

**Rules:**
- Remove extra whitespace
- Normalize Unicode (NFC)
- Fix encoding issues
- Remove noise (punctuation, numbers)
- Preserve apostrophes (Zo contractions)

---

## Agent 4: Dictionary Builder Agent

**Role:** Construct structured dictionary entries

**Entry Structure:**
```json
{
  "id": "ne_001",
  "en": "eat",
  "zo": "ne",
  "pos": "verb",
  "confidence": 1.0,
  "source": ["dictionary", "bible"],
  "topic": "daily",
  "frequency": 156
}
```

---

## Agent 5: Reversal Agent

**Role:** Create bidirectional mappings

**Process:**
1. For each EN→ZO entry: `{ "en": "eat", "zo": "ne" }`
2. Create ZO→EN entry: `{ "zo": "ne", "en": ["eat"] }`
3. Support many-to-many mappings
4. Preserve all sources and metadata

---

## Agent 6: Deduplication Agent

**Role:** Merge duplicate entries

**Rules:**
- Match on (zo, en) pair
- Merge sources: `["dict"] + ["bible"]` → `["dict", "bible"]`
- Keep highest confidence
- Combine examples
- Merge related words

---

## Agent 7: Context Expansion Agent

**Role:** Add rich context to entries (9 SOP)

**Adds:**
1. POS (Part of Speech)
2. Synonyms
3. Antonyms
4. Domains
5. Register
6. Examples (2-3 sentences)
7. Related Words
8. Etymology
9. Frequency

**Output:**
```json
{
  "zo": "ne",
  "en": ["eat", "consume"],
  "pos": "verb",
  "synonyms": ["ei"],
  "domains": ["daily", "food"],
  "register": "informal",
  "examples": ["Ka ne hi.", "I eat."],
  "related": ["khat", "thei"],
  "frequency": 156
}
```

---

## Agent 8: Extraction Agent

**Role:** Extract sentences and phrases from Bible

**Extraction Rules:**
- Sentences: 1-5 words (for dictionary)
- Phrases: 2-3 words
- Skip: punctuation-only, numbers-only
- Tag: source, topic, book, chapter, verse

**Target:** 2,000+ parallel pairs

---

## Agent 9: Audit Agent

**Role:** Validate quality and consistency

**Audit Checklist:**
- [ ] All entries have en + zo
- [ ] All entries have confidence
- [ ] All entries have source
- [ ] No duplicate (zo, en) pairs
- [ ] UTF-8 encoding valid
- [ ] No truncated entries
- [ ] 95%+ bidirectional coverage
- [ ] All examples valid

**Output Metrics:**
```json
{
  "total_entries": 24894,
  "bidirectional": 24030,
  "bidirectional_pct": 96.5,
  "with_examples": 18000,
  "with_pos": 22000,
  "duplicates_found": 0,
  "encoding_errors": 0,
  "status": "pass"
}
```

---

## Agent 10: Learning Agent

**Role:** Improve rules and detection after each cycle

**Learning Process:**
1. Review audit results
2. Identify top 5 issues
3. Propose rule improvements
4. Test on sample data
5. Update rules if successful
6. Log improvements
7. Update memory

---

## Agent Coordination

### Execution Order
1. Ingestion Agent → Load all data
2. Direction Detection Agent → Classify entries
3. Normalization Agent → Clean text
4. Dictionary Builder Agent → Create entries
5. Reversal Agent → Create bidirectional mappings
6. Deduplication Agent → Merge duplicates
7. Context Expansion Agent → Add rich context
8. Extraction Agent → Extract sentences
9. Audit Agent → Validate quality
10. Learning Agent → Improve rules

### Parallel Execution
- Agents 2-8 can run in parallel after Agent 1 completes
- Agent 9 (Audit) runs after all others complete
- Agent 10 (Learning) runs after Agent 9

---

## Memory Interface

### Read State
```python
with open("/memory/state.jsonl") as f:
    state = json.loads(f.readlines()[-1])
```

### Write State
```python
with open("/memory/state.jsonl", "a") as f:
    f.write(json.dumps(state) + "\n")
```

### Log Heartbeat
```python
with open("/memory/heartbeat.log", "a") as f:
    f.write(f"[{timestamp}] {message}\n")
```

---

**Last Updated:** 2026-04-16T09:05:48Z

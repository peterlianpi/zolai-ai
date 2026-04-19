# AGENT PROMPTS — Dictionary Rebuild V2

Each agent has a specific role in the pipeline. Use these prompts to guide agent behavior.

---

## AGENT 1: INGESTION AGENT

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
- External resources (if available)

**Output:**
```json
{
  "source": "ingestion",
  "timestamp": "2026-04-16T03:10:19Z",
  "loaded": {
    "en_zo_entries": 24894,
    "zo_en_entries": 21259,
    "bible_files": 66,
    "external_resources": 0
  },
  "encoding_errors": 0,
  "status": "ready"
}
```

**Success Criteria:**
- All files loaded without errors
- UTF-8 encoding validated
- Statistics reported
- Ready for next agent

---

## AGENT 2: DIRECTION DETECTION AGENT

**Role:** Classify each entry as EN→ZO or ZO→EN

**Responsibilities:**
- Analyze headword characteristics
- Apply heuristics to detect language
- Assign confidence score
- Tag direction

**Heuristics:**

### English Detection
- ASCII-only characters
- Known English vocabulary (common words)
- Length > 2 characters
- No tone markers

### Zo Detection
- Syllable patterns (CV, CCV, CCVC)
- Known Zo phonetics (kh, th, ng, etc.)
- Tone markers (if present)
- Non-ASCII characters

**Output:**
```json
{
  "headword": "ne",
  "direction": "zo_to_en",
  "confidence": 0.95,
  "reason": "Zo syllable pattern (CV)",
  "characteristics": {
    "length": 2,
    "ascii_only": false,
    "known_phonetics": true
  }
}
```

**Success Criteria:**
- 98%+ accuracy on known entries
- All entries classified
- Confidence scores assigned
- Reasons documented

---

## AGENT 3: NORMALIZATION AGENT

**Role:** Clean and standardize all text

**Responsibilities:**
- Remove extra whitespace
- Normalize Unicode (NFC)
- Fix encoding issues
- Remove noise (punctuation, numbers)
- Standardize case (lowercase for matching)

**Rules:**
- Preserve original case in output
- Keep apostrophes (Zo contractions)
- Remove trailing punctuation
- Collapse multiple spaces

**Output:**
```json
{
  "original": "  Ne  ",
  "normalized": "ne",
  "original_case": "Ne",
  "encoding_fixed": false,
  "noise_removed": 1
}
```

**Success Criteria:**
- All text normalized
- No encoding errors
- Whitespace cleaned
- Ready for matching

---

## AGENT 4: DICTIONARY BUILDER AGENT

**Role:** Construct structured dictionary entries

**Responsibilities:**
- Create entry objects
- Assign unique IDs
- Add metadata
- Validate structure
- Link to sources

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
  "frequency": 156,
  "created_at": "2026-04-16T03:10:19Z",
  "updated_at": "2026-04-16T03:10:19Z"
}
```

**Success Criteria:**
- All entries have required fields
- IDs are unique
- Metadata complete
- Structure valid

---

## AGENT 5: REVERSAL AGENT

**Role:** Create bidirectional mappings

**Responsibilities:**
- Transform EN→ZO to ZO→EN
- Support many-to-many mappings
- Preserve synonyms
- Track confidence
- Merge related entries

**Process:**
1. For each EN→ZO entry: `{ "en": "eat", "zo": "ne" }`
2. Create ZO→EN entry: `{ "zo": "ne", "en": ["eat"] }`
3. If multiple EN words map to same ZO: merge into array
4. Preserve all sources and metadata

**Output:**
```json
{
  "zo": "ne",
  "en": ["eat", "consume"],
  "confidence": 1.0,
  "sources": ["dictionary", "bible"],
  "frequency": 156
}
```

**Success Criteria:**
- All EN→ZO entries have ZO→EN counterparts
- Many-to-many mappings preserved
- No data loss
- Confidence maintained

---

## AGENT 6: DEDUPLICATION AGENT

**Role:** Merge duplicate entries

**Responsibilities:**
- Identify duplicate (zo, en) pairs
- Merge metadata
- Combine sources
- Keep highest confidence
- Preserve all unique meanings

**Deduplication Rules:**
- Match on (zo, en) pair
- Merge sources: `["dict"] + ["bible"]` → `["dict", "bible"]`
- Keep highest confidence
- Combine examples
- Merge related words

**Example:**
```json
// Before
{ "zo": "ne", "en": "eat", "source": ["dict"] }
{ "zo": "ne", "en": "eat", "source": ["bible"] }

// After
{ "zo": "ne", "en": "eat", "source": ["dict", "bible"] }
```

**Success Criteria:**
- No duplicate (zo, en) pairs
- All sources preserved
- Metadata merged correctly
- No data loss

---

## AGENT 7: CONTEXT EXPANSION AGENT

**Role:** Add rich context to entries (9 SOP)

**Responsibilities:**
- Add POS (Part of Speech)
- Find synonyms
- Find antonyms
- Identify domains
- Determine register
- Generate examples
- Link related words
- Research etymology
- Calculate frequency

**9 SOP (Standard Operating Procedure):**

1. **POS:** verb, noun, adjective, adverb, preposition, etc.
2. **Synonyms:** Words with similar meaning
3. **Antonyms:** Words with opposite meaning
4. **Domains:** religion, daily, education, culture, etc.
5. **Register:** formal, informal, archaic, slang
6. **Examples:** 2-3 example sentences
7. **Related Words:** Semantically linked entries
8. **Etymology:** Source or origin
9. **Frequency:** Count in corpus

**Output:**
```json
{
  "zo": "ne",
  "en": ["eat", "consume"],
  "pos": "verb",
  "synonyms": ["ei"],
  "antonyms": [],
  "domains": ["daily", "food"],
  "register": "informal",
  "examples": [
    "Ka ne hi. (I eat.)",
    "Nang ne hi. (You eat.)"
  ],
  "related": ["khat", "thei"],
  "etymology": "Proto-Sino-Tibetan",
  "frequency": 156
}
```

**Success Criteria:**
- 90%+ entries have POS
- 80%+ entries have examples
- 70%+ entries have related words
- All entries have frequency

---

## AGENT 8: EXTRACTION AGENT

**Role:** Extract sentences and phrases from Bible

**Responsibilities:**
- Load all 66 Bible books
- Extract sentences
- Extract phrases (2-3 words)
- Tag with metadata
- Filter noise
- Create parallel pairs

**Extraction Rules:**
- Sentences: 1-5 words (for dictionary)
- Phrases: 2-3 words
- Skip: punctuation-only, numbers-only
- Tag: source, topic, book, chapter, verse

**Output:**
```json
{
  "text": "Ka ne hi.",
  "translation_en": "I eat.",
  "language": "Zomi",
  "dialect": "Tedim",
  "topic": "daily",
  "source": "bible",
  "book": "Genesis",
  "chapter": 1,
  "verse": 1
}
```

**Success Criteria:**
- 2,000+ parallel pairs extracted
- All pairs validated
- Metadata complete
- No noise

---

## AGENT 9: AUDIT AGENT

**Role:** Validate quality and consistency

**Responsibilities:**
- Check completeness
- Verify bidirectionality
- Detect duplicates
- Validate encoding
- Check confidence scores
- Verify sources
- Generate metrics

**Audit Checklist:**
- [ ] All entries have en + zo
- [ ] All entries have confidence
- [ ] All entries have source
- [ ] No duplicate (zo, en) pairs
- [ ] UTF-8 encoding valid
- [ ] No truncated entries
- [ ] 95%+ bidirectional coverage
- [ ] All examples valid

**Output:**
```json
{
  "timestamp": "2026-04-16T03:10:19Z",
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

**Success Criteria:**
- All checks pass
- Metrics documented
- Issues reported
- Ready for production

---

## AGENT 10: LEARNING AGENT

**Role:** Improve rules and detection after each cycle

**Responsibilities:**
- Analyze audit results
- Identify patterns in errors
- Update detection rules
- Improve deduplication logic
- Refine context expansion
- Log improvements
- Update memory

**Learning Process:**
1. Review audit results
2. Identify top 5 issues
3. Propose rule improvements
4. Test on sample data
5. Update rules if successful
6. Log to memory
7. Report improvements

**Output:**
```json
{
  "cycle": 2,
  "timestamp": "2026-04-16T03:10:19Z",
  "issues_found": 5,
  "improvements": [
    {
      "issue": "Zo syllable detection accuracy 95%",
      "improvement": "Added tone marker detection",
      "new_accuracy": 0.98
    }
  ],
  "rules_updated": 3,
  "status": "ready_for_next_cycle"
}
```

**Success Criteria:**
- Issues identified
- Improvements proposed
- Rules updated
- Accuracy improved
- Memory updated

---

## AGENT COORDINATION

### Execution Order
1. **Ingestion Agent** → Load all data
2. **Direction Detection Agent** → Classify entries
3. **Normalization Agent** → Clean text
4. **Dictionary Builder Agent** → Create entries
5. **Reversal Agent** → Create bidirectional mappings
6. **Deduplication Agent** → Merge duplicates
7. **Context Expansion Agent** → Add rich context
8. **Extraction Agent** → Extract sentences
9. **Audit Agent** → Validate quality
10. **Learning Agent** → Improve rules

### Parallel Execution
- Agents 2-8 can run in parallel after Agent 1 completes
- Agent 9 (Audit) runs after all others complete
- Agent 10 (Learning) runs after Agent 9

### Communication
- Each agent outputs JSON to `/memory/state.jsonl`
- Agents read previous agent's output
- Heartbeat logged to `/memory/heartbeat.log`
- Errors logged to `/memory/errors.log`

---

## MEMORY INTERFACE

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

## SUCCESS METRICS

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

**Last Updated:** 2026-04-16T03:10:19Z  
**Status:** Ready for agent deployment

# Dictionary Rebuild V2 — Pipeline Guide

## Overview

The Dictionary Rebuild V2 pipeline is a 10-step process that transforms raw dictionary data into a high-quality, bidirectional, context-rich dictionary system.

---

## Step 1: Ingestion

**Goal:** Load all data sources

**Process:**
1. Load EN→ZO dictionary (24,894 entries)
2. Load ZO→EN dictionary (21,259 entries)
3. Load Bible corpus (66 books)
4. Load external resources (if available)
5. Validate UTF-8 encoding
6. Report statistics

**Output:**
- All data loaded in memory
- Encoding validated
- Statistics reported

---

## Step 2: Direction Detection

**Goal:** Classify each entry as EN→ZO or ZO→EN

**Heuristics:**
- **English:** ASCII-only, known vocabulary, >2 chars
- **Zo:** Syllable patterns (CV, CCV), tone markers, known phonetics

**Output:**
- Each entry tagged with direction
- Confidence score assigned
- Reason documented

---

## Step 3: Normalization

**Goal:** Clean and standardize all text

**Rules:**
- Remove extra whitespace
- Normalize Unicode (NFC)
- Fix encoding issues
- Remove noise (punctuation, numbers)
- Preserve apostrophes (Zo contractions)

**Output:**
- All text normalized
- No encoding errors
- Whitespace cleaned

---

## Step 4: Dictionary Builder

**Goal:** Construct structured dictionary entries

**Process:**
1. Create entry objects
2. Assign unique IDs
3. Add metadata
4. Validate structure
5. Link to sources

**Output:**
- Structured entries with all required fields
- Unique IDs assigned
- Metadata complete

---

## Step 5: Reversal

**Goal:** Create bidirectional mappings

**Process:**
1. For each EN→ZO entry: `{ "en": "eat", "zo": "ne" }`
2. Create ZO→EN entry: `{ "zo": "ne", "en": ["eat"] }`
3. Support many-to-many mappings
4. Preserve synonyms
5. Track confidence

**Output:**
- All EN→ZO entries have ZO→EN counterparts
- Many-to-many mappings preserved
- No data loss

---

## Step 6: Deduplication

**Goal:** Merge duplicate entries

**Process:**
1. Identify duplicate (zo, en) pairs
2. Merge metadata
3. Combine sources
4. Keep highest confidence
5. Preserve all unique meanings

**Example:**
```json
// Before
{ "zo": "ne", "en": "eat", "source": ["dict"] }
{ "zo": "ne", "en": "eat", "source": ["bible"] }

// After
{ "zo": "ne", "en": "eat", "source": ["dict", "bible"] }
```

**Output:**
- No duplicate (zo, en) pairs
- All sources preserved
- Metadata merged correctly

---

## Step 7: Context Expansion

**Goal:** Add rich context to entries (9 SOP)

**Process:**
1. Add POS (Part of Speech)
2. Find synonyms
3. Find antonyms
4. Identify domains
5. Determine register
6. Generate examples
7. Link related words
8. Research etymology
9. Calculate frequency

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
  "examples": ["Ka ne hi.", "I eat."],
  "related": ["khat", "thei"],
  "frequency": 156
}
```

---

## Step 8: Extraction

**Goal:** Extract sentences and phrases from Bible

**Process:**
1. Load all 66 Bible books
2. Extract sentences (1-5 words)
3. Extract phrases (2-3 words)
4. Tag with metadata
5. Filter noise
6. Create parallel pairs

**Output:**
- 2,000+ parallel pairs
- All pairs validated
- Metadata complete
- No noise

---

## Step 9: Audit

**Goal:** Validate quality and consistency

**Checks:**
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

## Step 10: Learning

**Goal:** Improve rules and detection after each cycle

**Process:**
1. Analyze audit results
2. Identify patterns in errors
3. Update detection rules
4. Improve deduplication logic
5. Refine context expansion
6. Log improvements
7. Update memory

**Output:**
- Issues identified
- Improvements proposed
- Rules updated
- Accuracy improved
- Memory updated

---

## Cycle Execution

### Single Cycle
```
Ingestion → Direction Detection → Normalization → Dictionary Builder
    ↓
Reversal → Deduplication → Context Expansion → Extraction
    ↓
Audit → Learning
```

### Multiple Cycles
```
Cycle 1 (with initial rules)
    ↓
Cycle 2 (with improved rules from Cycle 1)
    ↓
Cycle 3+ (continuous improvement)
```

---

## Heartbeat Output

Each step logs progress:

```
[2026-04-16T03:10:19] ✅ CYCLE 1 START
[2026-04-16T03:10:20] 📥 Loaded 24,894 EN→ZO entries
[2026-04-16T03:10:21] 🔍 Direction detection: 24,894 entries classified
[2026-04-16T03:10:22] 🔄 Reverse mapping: 21,259 ZO→EN entries created
[2026-04-16T03:10:23] 🧹 Deduplication: 0 duplicates merged
[2026-04-16T03:10:24] 📖 Bible integration: 156 new entries
[2026-04-16T03:10:25] 📝 Sentence extraction: 297 parallel pairs
[2026-04-16T03:10:26] 🏷️  Context expansion: 24,894 entries enriched
[2026-04-16T03:10:27] 🔗 Relationship mapping: 21,283 semantic links
[2026-04-16T03:10:28] ✅ Audit complete: 96.5% bidirectional
[2026-04-16T03:10:29] 💾 Saved outputs
[2026-04-16T03:10:30] 🧠 Memory updated
[2026-04-16T03:10:31] ✅ CYCLE 1 COMPLETE (11 seconds)
```

---

## Performance Metrics

### Cycle 1 Results
- **Time:** ~11 seconds
- **Entries Processed:** 24,894
- **Entries Merged:** 0
- **New Entries:** 156
- **Parallel Pairs:** 297
- **Bidirectional Coverage:** 96.5%
- **Encoding Errors:** 0

---

## Troubleshooting

### Issue: Slow Performance
**Solution:** Use streaming instead of loading entire files

### Issue: Encoding Errors
**Solution:** Ensure all files are UTF-8 encoded

### Issue: Missing Bible Files
**Solution:** Check Bible directory exists at `/Cleaned_Bible/`

### Issue: Low Bidirectional Coverage
**Solution:** Check reversal agent is creating all mappings

---

**Last Updated:** 2026-04-16T09:05:48Z

# Four Approaches to Get All Zomi Dictionary Data

## Approach 1: Extract from Existing Sources (Completed)

We've successfully extracted words from existing Zoli/Zolai datasets in the repository.

**Files Created:**
- `scripts/extract_existing_zoli_words.py` - Extracts from all existing sources
- `data/existing_zoli_words_comprehensive.txt` - 372,413 unique words
- `data/existing_zoli_words_quality.txt` - 370,767 quality-filtered words

**Sources Used:**
- `zolai_tedim_words.json` (12,523 words)
- `zolai_matu_words.json` (431 words) 
- `zolai_haka_words.json` (5,725 words)
- `zolai_laizo_falam_words.json` (3,158 words)
- `zolai_core_vocabulary.json` (21,837 words)
- `zolai_complete_vocabulary.json` (0 words - empty)
- `zolai_categorized_words.json` (0 words - empty)
- `zolai_categorized_vocabulary.json` (0 words - empty)
- `zolai_zolai_words.json` (22 words)
- `bible_zolai_top_words.json` (30,416 words)
- `zolai_grammar_analysis.json` (2 words)
- `categorized_common_words.json` (9 words)
- `tongdot_search_words.txt` (341,785 words - for reference)

**Zomi-Specific Findings:**
- Found: 'kizomin', 'kizomzomin', 'zomin', 'rhizomic'
- Not found: 'zomite', 'akizomin', 'akizomzomin'

**Command to Regenerate:**
```bash
python scripts\extract_existing_zoli_words.py
```

## Approach 2: Build Comprehensive Word List from Core Vocabulary Files

Created a more focused extraction targeting the actual Zoli vocabulary structure.

**Files Created:**
- `scripts/build_zoli_wordlist.py` - Builds from core vocabulary files
- `data/zoli_comprehensive_wordlist.txt` - 65,030 quality words
- `data/zoli_wordlist_summary.json` - Detailed summary with statistics

**Sources Used (Actual Zoli Files):**
- `zolai_tedim_words.json` (12,528 headwords)
- `zolai_matu_words.json` (433 headwords)
- `zolai_haka_words.json` (5,727 headwords)
- `zolai_laizo_falam_words.json` (3,159 headwords)
- `zolai_core_vocabulary.json` (21,847 headwords)
- `zolai_complete_vocabulary.json` (0 headwords)
- `zolai_categorized_words.json` (0 headwords)
- `zolai_categorized_vocabulary.json` (0 headwords)
- `zolai_zolai_words.json` (22 headwords)
- `bible_zolai_top_words.json` (30,416 words)
- `tongsan_zolai_words.json` (30,934 words)

**Zomi-Specific Findings:**
- 'zomi': ['kiku-zomi', 'kizomin', 'kizomzomin', 'kuki-zomi', 'kuki-zomi-hmar']...
- 'zomite': ['kuki-zomite', 'zomite', 'zomiten']
- 'kizomin': ['kizomin']
- 'akizomin': [] (not found as headword)
- 'akizomzomin': [] (not found as headword)

**Command to Regenerate:**
```bash
python scripts\build_zoli_wordlist.py
```

## Approach 3: Batch Processing System for Large-Scale Fetching

Created a scalable batch processing system similar to the TongDot multi-session fetcher.

**Files Created:**
- `scripts/batch_fetch_zomi.py` - Main batch processor
- `scripts/fetch_zomi_dictionary_improved.py` - Improved fetcher with better parsing
- `scripts/merge_zomi_sessions.py` - Utility to merge session outputs

**Features:**
- Multi-session support for parallel processing
- Progress tracking and resumability
- Rate limiting to be respectful to the server
- Error handling and retry logic
- Session status monitoring
- Automatic merging of results

**Usage Examples:**

**Single Session (Simple):**
```bash
python scripts\fetch_zomi_dictionary_improved.py `
  --input data\zoli_comprehensive_wordlist.txt `
  --output data\zomi_dictionary.jsonl
```

**Multi-Session (Recommended for large datasets):**
```bash
# Session 0
python scripts\batch_fetch_zomi.py `
  --word-list data\zoli_comprehensive_wordlist.txt `
  --session-id 0 `
  --num-sessions 3 `
  --max-workers 5 `
  --request-delay 1.0

# Session 1 (in separate terminal/notebook)
python scripts\batch_fetch_zomi.py `
  --word-list data\zoli_comprehensive_wordlist.txt `
  --session-id 1 `
  --num-sessions 3 `
  --max-workers 5 `
  --request-delay 1.0

# Session 2 (in separate terminal/notebook)
python scripts\batch_fetch_zomi.py `
  --word-list data\zoli_comprehensive_wordlist.txt `
  --session-id 2 `
  --num-sessions 3 `
  --max-workers 5 `
  --request-delay 1.0
```

**Monitor Progress:**
```bash
type data\zomi_session_status.json
```

**Merge Results:**
```bash
python scripts\merge_zomi_sessions.py --sessions 3
```

## Approach 4: Extract Zomi Entries from Existing TongDot Data

Many Zomi words already exist in the TongDot dictionary dataset with Zomi/Language translations.

**Files Created:**
- `scripts\extract_zomi_from_tongdot.py` - Extract Zomi-language entries
- `data/zomi_from_tongdot.jsonl` - Zomi entries from TongDot dictionary

**Sample Results Found:**
From manual inspection of `data\tongdot_dictionary.jsonl`, we found entries like:

```json
{
  "query": "above-mentioned",
  "source_url": "https://www.tongdot.com/search/above-mentioned",
  "found": true,
  "result_count": 1,
  "results": [{
    "headword": "above-mentioned",
    "translation": "(adj.): tuandeuh ih ngaanmi; kawhzomi; a tlun ih ngan zomi.",
    "language": "Laizo/Falam",
    "audio_url": "https://www.gstatic.com/dictionary/static/sounds/de/0/above-mentioned.mp3",
    "raw_paragraphs": [
      "above-mentioned:",
      "(adj.): tuandeuh ih ngaanmi; kawhzomi; a tlun ih ngan zomi.",
      "Language: Laizo/Falam"
    ]
  }],
  "error": null
}
```

**Other Zomi-containing translations found:**
- "adulthood": "(n.) pitlinnak, upa zomi sinak." (Laizo/Falam)
- "anniversary": "(n) A phaat-hun, apianna hun tunkikna - (February 20 Zomite suahtakna aphaat a kiciamteh hi a Zomi nam ni kici hi)" (Tedim)
- "beneficiary": "(n) aphattuampihmi, azaalzomi, a noptuam lawhmi" (Tedim)
- "concerning": "(n) kizomin, thu ah, kipawlin, kisai in" (Tedim)
- "consecutive": "(a) akizomin, abanban, khat khitkhat" (Tedim)
- "continually": "(adv) akizomzomin" (Tedim)
- "grown-up": "(n.): upa a kim zomi (pitling)." (Laizo/Falam)
- "incumbent": "(adj.): a si cia zomi; ttuanvo nei." (Laizo/Falam)
- "monogamy": "(n) Zomite ngeibanga numei khat in pasal khat, pasal khat in zi khat bek neihna" (Tedim)
- "orphan": "(n) nu le pa nei lo; ngahttah; nu le pa-ih thihsan zomi nauhak; farah" (Laizo/Falam)
- "overrule": Multiple Zomi-containing translations across languages
- "peal": "(n) kizomin gingdeu deu; (v) nakpi in ging" (Tedim)
- "successive": "(a) akizomin, azom azomin" (Tedim)
- "victor": "(n) aggualzomi, azopa" (Tedim)

**Command to Extract:**
```bash
python scripts\extract_zomi_from_tongdot.py
```

## Recommended Workflow for Complete Zomi Dictionary:

1. **Start with Approach 2** to get a clean, focused word list (65k words)
2. **Use Approach 3** (batch processing) to fetch definitions for these words
3. **Supplement with Approach 4** to get additional Zomi-containing entries from TongDot
4. **Merge and deduplicate** results for final comprehensive dictionary

## Quick Start Commands:

```bash
# Step 1: Get comprehensive word list
python scripts\build_zoli_wordlist.py

# Step 2: Fetch definitions (example with first 100 words for testing)
python scripts\fetch_zomi_dictionary_improved.py `
  --input data\zoli_comprehensive_wordlist.txt `
  --output data\zomi_dictionary_test.jsonl `
  --max-queries 100

# Step 3: For full processing, use batch system
# Run these in separate terminals:
python scripts\batch_fetch_zomi.py --word-list data\zoli_comprehensive_wordlist.txt --session-id 0 --num-sessions 3
python scripts\batch_fetch_zomi.py --word-list data\zoli_comprehensive_wordlist.txt --session-id 1 --num-sessions 3
python scripts\batch_fetch_zomi.py --word-list data\zoli_comprehensive_wordlist.txt --session-id 2 --num-sessions 3

# Step 4: Merge results
python scripts\merge_zomi_sessions.py --sessions 3

# Step 5: Supplement with TongDot Zomi entries
python scripts\extract_zomi_from_tongdot.py
```

## Expected Output:

Based on the TongDot dictionary having ~27,784 entries and our focused word list having ~65,030 words, we can expect:
- ~40,000-50,000 successful lookups (60-75% success rate)
- ~15,000-25,000 misses/not found
- Additional several hundred Zomi-containing entries from Approach 4

Total estimated final dictionary size: **40,000-60,000 entries**
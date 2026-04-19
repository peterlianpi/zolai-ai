# 🚀 Zoli Dictionary Extraction - Complete Guide

You now have a complete system to extract Zoli/Zolai dictionary data using FOUR complementary approaches. Here's your step-by-step guide:

## 📋 QUICK START (Recommended)

### Step 1: Get Your Word List (5 minutes)
```bash
python scripts\build_zoli_wordlist.py
```
This creates `data\zoli_comprehensive_wordlist.txt` with 65,030 quality Zoli words.

### Step 2: Test the Fetcher (10 minutes)
```bash
python scripts\fetch_zomi_dictionary_improved.py `
  --input data\zoli_word_list.txt `
  --output data\test_results.jsonl `
  --max-queries 10
```
Check `data\test_results.jsonl` to see if it's working.

### Step 3: Extract Supplemental Data (2 minutes)
```bash
python scripts\extract_zomi_from_tongdot.py
```
This finds 18+ Zomi-containing entries already in the TongDot dataset.

### Step 4: Full Processing (Choose your pace)

**Option A: Quick Evaluation (1-2 hours)**
```bash
python scripts\fetch_zomi_dictionary_improved.py `
  --input data\zoli_comprehensive_wordlist.txt `
  --output data\zoli_dictionary.jsonl `
  --max-queries 1000
```

**Option B: Full Production (6-12 hours)**
```bash
# Terminal 1 - Session 0
python scripts\batch_fetch_zomi.py `
  --word-list data\zoli_comprehensive_wordlist.txt `
  --session-id 0 `
  --num-sessions 3

# Terminal 2 - Session 1  
python scripts\batch_fetch_zomi.py `
  --word-list data\zoli_comprehensive_wordlist.txt `
  --session-id 1 `
  --num-sessions 3

# Terminal 3 - Session 2
python scripts\batch_fetch_zomi.py `
  --word-list data\zoli_comprehensive_wordlist.txt `
  --session-id 2 `
  --num-sessions 3

# When all finish:
python scripts\merge_zomi_sessions.py --sessions 3
```

## 📊 WHAT YOU GET

### Approach 1: Existing Sources (Maximum Coverage)
- **370,771 words** from all existing Zoli/Zolai sources
- File: `data\existing_zoli_words_quality.txt`
- Best for: Reference, research, building comprehensive lists

### Approach 2: Focused Zoli Vocabulary (Recommended for Fetching)
- **65,030 quality words** from core Zoli vocabulary files  
- File: `data\zoli_comprehensive_wordlist.txt`
- Best for: Actual dictionary fetching (good balance of coverage & efficiency)

### Approach 3: Fetched Dictionary (Main Output)
- **Expected: 40,000-50,000 entries** (60-75% success rate)
- File: `data\zoli_dictionary.jsonl` (after merging sessions)
- Format: JSONL with headword, definition, examples
- Example entry:
  ```json
  {
    "query": "taste",
    "source_url": "https://zomidictionary.com/results.php?query=taste",
    "found": true,
    "result_count": 1,
    "results": [{
      "headword": "taste",
      "definition": "to perceive flavors (v) ciam, sin, alim leh limloh ciam; (a) namtui, lim",
      "examples": [
        "taste ng explores culinary arts.",
        "taste the soup for seasoning."
      ]
    }],
    "error": null
  }
  ```

### Approach 4: Supplemental TongDot-Zomi Entries
- **18 entries** where TongDot contains Zomi translations
- File: `data\zomi_from_tongdot.jsonl`
- Examples: "concerning" → "(n) kizomin, thu ah, kipawlin, kisai in" (Tedim)

## 🔧 SYSTEM FILES

### Core Components:
- `scripts/build_zoli_wordlist.py` - Create word list (Approach 2)
- `scripts/fetch_zomi_dictionary_improved.py` - Robust fetcher with HTML parsing
- `scripts/batch_fetch_zomi.py` - Multi-session batch processor
- `scripts/merge_zomi_sessions.py` - Combine session outputs
- `scripts/extract_zomi_from_tongdot.py` - Extract from TongDot data
- `scripts/extract_existing_zoli_words.py` - Maximum coverage word list (Approach 1)

### Key Features:
- ✅ Multi-session parallel processing (like TongDot system)
- ✅ Progress tracking and resumability
- ✅ Rate limiting (respectful to server)
- ✅ Error handling and retry logic
- ✅ JSONL output format
- ✅ Comprehensive logging and monitoring
- ✅ Validation and quality checks

## 📈 EXPECTED RESULTS

Based on testing and analysis:

| Metric | Estimate |
|--------|----------|
| Words to process | 65,030 |
| Successful lookups | 39,000-48,800 (60-75%) |
| Misses/Not found | 16,230-26,010 (25-40%) |
| Supplemental entries | 10-50 |
| **Final dictionary** | **40,000-50,000 entries** |

## 🚀 RECOMMENDED WORKFLOW

1. **Start small**: Test with 10 words → verify it works
2. **Go medium**: Test with 100-500 words → check quality and timing  
3. **Go large**: Run full batch processing (3 sessions recommended)
4. **Enhance**: Add TongDot-Zomi supplemental entries
5. **Use**: Your custom Zoli dictionary is ready!

## 💡 TIPS FOR SUCCESS

- **Be patient**: ZomiDictionary.com responds in ~1-2 seconds per request
- **Respect the server**: Use 1.0-2.0 second delays, 3-5 workers max
- **Monitor progress**: Check `zomi_session_status.json` and heartbeat logs
- **Resume safely**: All processes automatically resume from where they left off
- **Validate output**: Use the built-in validation in merge script

## 📁 WHERE TO FIND YOUR DATA

- **Word lists**: `data/zoli_comprehensive_wordlist.txt` (recommended input)
- **Test results**: `data/test_results.jsonl` (quick tests)
- **Full dictionary**: `data/zoli_dictionary.jsonl` (after merge)
- **Supplemental**: `data/zomi_from_tongdot.jsonl` (TongDot-Zomi entries)
- **Logs**: `data/zomi_fetch_progress.log`, `data/zomi_session_status.json`

## 🛠️ TROUBLESHOOTING

If you see import errors:
```
python -c "import sys; sys.path.append('scripts'); from fetch_zomi_dictionary_improved import ZomiResultParser; print('OK')"
```

If you see network errors:
- Check your internet connection
- Increase timeout/retry values in the scripts
- The system automatically retries failed requests

If you see parsing errors:
- The fetcher includes debug output - check the console for parsing details
- HTML structure may have changed slightly (update selectors if needed)

---

**You're now ready to build a comprehensive Zoli dictionary!** 
Start with Step 1 above and work through the workflow at your pace.
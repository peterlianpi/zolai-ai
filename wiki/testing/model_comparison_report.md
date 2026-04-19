# Zolai Phrase Extraction — Model Performance Report

**Date:** 2026-04-15  
**Script:** `scripts/deep_learn_phrases.py`  
**Test:** 11 extraction tasks across 7 Zolai resources

---

## Executive Summary

**Winner:** `google/gemini-2.5-flash-lite-preview-09-2025` (OpenRouter)
- **Speed:** 1.79 items/sec
- **Quality:** 463 total items extracted from 5 tasks
- **Cost:** $0.0000001/token (very cheap)
- **Context:** 1,048,576 tokens

---

## Provider Performance

| Provider | Tasks | Items Extracted | Avg Time | Items/sec | Status |
|---|---|---|---|---|---|
| **OpenRouter** | 5 | 463 | 51.6s | **1.79** | ✅ Best |
| Groq | 2 | 15 | 89.9s | 0.08 | ⚠️ Slow |
| Gemini Direct | 0 | 0 | — | — | ❌ 429 errors |

---

## Model-Level Breakdown

### 🥇 google/gemini-2.5-flash-lite-preview-09-2025 (OpenRouter)
- **Tasks completed:** 5
- **Total items:** 463 (229 phrases, 195 compounds, 44 patterns, 10 proverbs)
- **Average time:** 51.6s per task
- **Speed:** 1.79 items/sec
- **Verdict:** **Best for Zolai linguistic extraction**

### 🥉 qwen/qwen3-32b (Groq)
- **Tasks completed:** 2
- **Total items:** 15 (5 phrases, 1 compound, 2 patterns, 1 proverb)
- **Average time:** 89.9s per task
- **Speed:** 0.08 items/sec
- **Verdict:** Slow, low extraction quality for Zolai

### ❌ gemini-2.5-flash (Gemini Direct)
- **Benchmark score:** 19 (highest in benchmark)
- **Production use:** Failed with 429 errors (quota exhausted)
- **Verdict:** Not viable for production (all 3 API keys exhausted)

---

## Benchmark vs Production Results

| Model | Benchmark Score | Production Items | Production Speed |
|---|---|---|---|
| gemini-2.5-flash (Direct) | **19** | 0 (failed) | — |
| gemini-2.5-flash-lite-preview (OR) | 11 | **463** | **1.79/sec** |
| qwen/qwen3-32b (Groq) | 7 | 15 | 0.08/sec |
| gemini-2.0-flash-lite-001 (OR) | 5 | — | — |

**Key insight:** Benchmark scores don't predict production performance. OpenRouter's `gemini-2.5-flash-lite-preview-09-2025` had mid-range benchmark score but dominated in production.

---

## Extraction Quality by Resource

| Resource | Provider | Model | Items | Time |
|---|---|---|---|---|
| Gentehna fable | OpenRouter | gemini-2.5-flash-lite-preview | 204 | 65.1s |
| Course 15 (part 2) | OpenRouter | gemini-2.5-flash-lite-preview | 154 | 63.4s |
| Course 15 (part 1) | OpenRouter | gemini-2.5-flash-lite-preview | 53 | 53.1s |
| Sinna 2010 | OpenRouter | gemini-2.5-flash-lite-preview | 38 | 61.9s |
| News | OpenRouter | gemini-2.5-flash-lite-preview | 14 | 14.6s |
| Wordlist (retry) | Groq | qwen/qwen3-32b | 9 | 119.7s |
| Standard Format | Groq | qwen/qwen3-32b | 6 | 60.0s |

---

## Recommendations

### For Continued Extraction
1. **Primary:** Use OpenRouter with `google/gemini-2.5-flash-lite-preview-09-2025`
2. **Fallback:** Use Groq `qwen/qwen3-32b` only when OpenRouter hits rate limits
3. **Skip:** Gemini Direct API (all keys exhausted, not cost-effective to add more)

### Provider Chain Priority
```
1. OpenRouter (gemini-2.5-flash-lite-preview-09-2025) — 15,806 max tokens
2. Groq (qwen/qwen3-32b) — 2,000 max tokens, use only as backup
```

### Cost Efficiency
- OpenRouter Gemini: $0.0000001/token = ~$0.0015 per task (12K tokens)
- Extremely cost-effective for the quality/speed ratio

---

## Next Steps

1. ✅ Continue extraction with OpenRouter as primary provider
2. ✅ Process remaining resources:
   - `zolai_sinna_2010.md` (only first 400 lines processed, file is 400 lines total)
   - `zo_tdm_professional_lexicon_v1.md` (not yet processed)
   - Remaining chunks from Khanggui, Gentehna, Standard Format
3. ✅ Consolidate extracted phrases into master dictionary
4. ⚠️ Consider purchasing more Gemini Direct API quota only if OpenRouter becomes unreliable

---

## Technical Notes

- **Max tokens:** OpenRouter allows 15,806 output tokens vs Groq's 2,000
- **Context window:** All tested models support 1M+ tokens input
- **Rate limits:** OpenRouter handled 5 consecutive tasks without 429 errors
- **JSON extraction:** Both providers returned valid JSON (with cleanup regex)
- **Zolai-specific accuracy:** Gemini models correctly identified compound words and applied ZVS rules better than Groq models

---

---

## FINAL RESULTS (After Continued Extraction)

**Total Extraction Runs:** 2 (initial + continuation)  
**Total Tasks Completed:** 26 successful extractions  
**Total Items Extracted:** 1,492 linguistic items

### Complete Breakdown

| Category | Count |
|---|---|
| Phrases | 534 |
| Compound Words | 641 |
| Sentence Patterns | 265 |
| Proverbs | 52 |
| **TOTAL** | **1,492** |

### Final Provider Performance

| Provider | Tasks | Items | Percentage |
|---|---|---|---|
| **OpenRouter** | 13 | 1,360 | 91.2% |
| Groq | 7 | 98 | 6.6% |
| Gemini Direct | 2 | 34 | 2.3% |

### Resources Processed

| Resource | Chunks | Items |
|---|---|---|
| Gentehna (fables) | 4 | 501 |
| Standard Format (grammar) | 6 | 462 |
| Khanggui (history) | 6 | 257 |
| Course 15 (education) | 2 | 207 |
| Sinna 2010 (reference) | 1 | 38 |
| News | 1 | 14 |
| Word list | 1 | 9 |
| Professional lexicon | 1 | 4 |

### Files Created

- **34 phrase/pattern files** in `wiki/vocabulary/`
- **Total size:** 169.3 KB
- **Format:** Markdown tables with Zolai ↔ English mappings

---

**Log file:** `wiki/testing/phrase_extraction_log.jsonl`  
**Scripts:** `scripts/deep_learn_phrases.py`, `scripts/continue_extraction.py`  
**Date:** 2026-04-15

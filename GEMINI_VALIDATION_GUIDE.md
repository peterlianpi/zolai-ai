# 🤖 Gemini Validation Guide

## Overview

Validate your enriched dataset using Google's Gemini API. Each sentence is checked for:
- ✓ Zolai language correctness
- ✓ Dialect accuracy (Tedim/Zokam)
- ✓ Language level accuracy (A1-C1)
- ✓ Confidence scores (0.0-1.0)
- ✓ Remarks/feedback

---

## Setup

### 1. Install Gemini API Client

```bash
pip install google-generativeai
```

### 2. Get API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### 3. Set Environment Variable (Optional)

```bash
export GEMINI_API_KEY="your-api-key-here"
```

---

## Usage

### Quick Start

```bash
./run_gemini_validation.sh
```

You'll be prompted to enter your API key if not set in environment.

### With API Key in Environment

```bash
export GEMINI_API_KEY="your-api-key-here"
./run_gemini_validation.sh
```

### Direct Python

```bash
python3 validate_with_gemini.py
```

---

## Output

### Results File

`data/training/gemini_validation_results.jsonl`

Each line is a JSON object:

```json
{
  "index": 0,
  "text": "A kipat cilin Pasian in vantung leh leitung a piangsak hi.",
  "claimed_dialect": "Tedim",
  "claimed_level": "A2",
  "validation": {
    "is_valid_zolai": true,
    "dialect_correct": true,
    "level_correct": true,
    "confidence": 0.95,
    "remarks": "Correct Tedim dialect, appropriate A2 level"
  }
}
```

### Log File

`data/training/gemini_validation.log`

Contains:
- Processing progress
- Summary statistics
- Sample validations
- Any errors

---

## Statistics

The script generates:

```
Total validated: 100 records
Valid Zolai: 98/100 (98.0%)
Dialect correct: 97/100 (97.0%)
Level correct: 95/100 (95.0%)
Average confidence: 0.94
```

---

## Interpreting Results

### Confidence Score
- **0.9-1.0**: Very confident
- **0.7-0.9**: Confident
- **0.5-0.7**: Somewhat confident
- **<0.5**: Low confidence

### Remarks
- Explains why validation passed/failed
- Suggests corrections if needed
- Notes dialect-specific patterns

---

## Examples

### Valid Record
```json
{
  "is_valid_zolai": true,
  "dialect_correct": true,
  "level_correct": true,
  "confidence": 0.98,
  "remarks": "Perfect Tedim dialect, correct A2 level"
}
```

### Needs Correction
```json
{
  "is_valid_zolai": true,
  "dialect_correct": false,
  "level_correct": false,
  "confidence": 0.72,
  "remarks": "Valid Zolai but marked as Zokam (should be Tedim), level seems B1 not A2"
}
```

---

## Troubleshooting

### "API key required"
- Make sure you have a valid Gemini API key
- Get one at: https://aistudio.google.com/app/apikey

### "google-generativeai not installed"
```bash
pip install google-generativeai
```

### "Rate limit exceeded"
- Gemini API has rate limits
- Wait a few minutes before retrying
- Or validate fewer records at a time

### "Invalid API key"
- Check your API key is correct
- Regenerate at: https://aistudio.google.com/app/apikey

---

## Next Steps

1. **Review results**: `cat data/training/gemini_validation_results.jsonl`
2. **Check statistics**: `cat data/training/gemini_validation.log`
3. **Fix issues**: Update records with low confidence
4. **Re-validate**: Run script again after fixes
5. **Use for training**: Once validated, use enriched dataset for training

---

## Tips

- Start with 100 samples to test
- Review low-confidence results manually
- Use remarks to improve enrichment rules
- Re-run after making corrections
- Consider validating all splits (train/val/test)

---

**Ready to validate!** 🚀

```bash
./run_gemini_validation.sh
```

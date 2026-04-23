#!/usr/bin/env python3
"""
Validate enriched dataset sentences using Gemini API
Checks: dialect correctness, language level accuracy, quality
Run: python3 validate_with_gemini.py
"""
import json
import sys
from pathlib import Path

try:
    import google.generativeai as genai
except ImportError:
    print("ERROR: google-generativeai not installed")
    print("Install with: pip install google-generativeai")
    sys.exit(1)

# Configure Gemini
GEMINI_API_KEY = input("Enter your Gemini API key: ").strip()
if not GEMINI_API_KEY:
    print("ERROR: API key required")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

DATA = Path(__file__).parent / "data"
INPUT_FILE = DATA / "training/master_train_enriched.jsonl"
OUTPUT_FILE = DATA / "training/gemini_validation_results.jsonl"
LOG = DATA / "training/gemini_validation.log"

def log(msg):
    print(msg, flush=True)
    with open(LOG, "a") as f:
        f.write(msg + "\n")

LOG.write_text("")
log("\n" + "="*80)
log("VALIDATING DATASET WITH GEMINI")
log("="*80 + "\n")

def validate_sentence(text, dialect, language_level):
    """Use Gemini to validate sentence"""
    prompt = f"""Analyze this Zolai sentence and provide validation:

Text: {text}
Claimed Dialect: {dialect}
Claimed Level: {language_level}

Respond in JSON format:
{{
  "is_valid_zolai": true/false,
  "dialect_correct": true/false,
  "level_correct": true/false,
  "confidence": 0.0-1.0,
  "remarks": "brief comment"
}}"""
    
    try:
        response = model.generate_content(prompt)
        result = json.loads(response.text)
        return result
    except Exception as e:
        return {
            "is_valid_zolai": None,
            "dialect_correct": None,
            "level_correct": None,
            "confidence": 0.0,
            "remarks": f"Error: {str(e)}"
        }

log("[1/2] VALIDATING SAMPLE RECORDS (100 samples)...\n")

stats = {
    "total": 0,
    "valid_zolai": 0,
    "dialect_correct": 0,
    "level_correct": 0,
    "avg_confidence": 0.0,
}

results = []

try:
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= 100:  # Sample 100 records
                break
            
            rec = json.loads(line)
            text = rec.get("text", "")
            dialect = rec.get("dialect", "")
            level = rec.get("language_level", "")
            
            # Validate with Gemini
            validation = validate_sentence(text, dialect, level)
            
            # Store result
            result = {
                "index": i,
                "text": text[:100],  # Truncate for display
                "claimed_dialect": dialect,
                "claimed_level": level,
                "validation": validation
            }
            results.append(result)
            
            # Update stats
            stats["total"] += 1
            if validation.get("is_valid_zolai"):
                stats["valid_zolai"] += 1
            if validation.get("dialect_correct"):
                stats["dialect_correct"] += 1
            if validation.get("level_correct"):
                stats["level_correct"] += 1
            stats["avg_confidence"] += validation.get("confidence", 0)
            
            if (i + 1) % 10 == 0:
                log(f"  Validated: {i+1}/100 records")

except Exception as e:
    log(f"ERROR: {e}")

stats["avg_confidence"] /= stats["total"] if stats["total"] > 0 else 1

log(f"\n[2/2] RESULTS...\n")

log(f"Total validated: {stats['total']}")
log(f"Valid Zolai: {stats['valid_zolai']}/{stats['total']} ({100*stats['valid_zolai']/stats['total']:.1f}%)")
log(f"Dialect correct: {stats['dialect_correct']}/{stats['total']} ({100*stats['dialect_correct']/stats['total']:.1f}%)")
log(f"Level correct: {stats['level_correct']}/{stats['total']} ({100*stats['level_correct']/stats['total']:.1f}%)")
log(f"Average confidence: {stats['avg_confidence']:.2f}\n")

# Save results
with open(OUTPUT_FILE, "w") as f:
    for result in results:
        f.write(json.dumps(result, ensure_ascii=False) + "\n")

log(f"Results saved: {OUTPUT_FILE.name}")

# Show sample results
log(f"\nSample validations (first 5):\n")
for result in results[:5]:
    log(f"Text: {result['text']}")
    log(f"  Dialect: {result['claimed_dialect']} → {result['validation'].get('dialect_correct')}")
    log(f"  Level: {result['claimed_level']} → {result['validation'].get('level_correct')}")
    log(f"  Confidence: {result['validation'].get('confidence'):.2f}")
    log(f"  Remark: {result['validation'].get('remarks')}\n")

log("="*80)
print(f"\n✅ Validation complete!")
print(f"Results: data/training/gemini_validation_results.jsonl")
print(f"Log: data/training/gemini_validation.log")

#!/usr/bin/env python3
"""
Validate dataset with Gemini - Simple working version
Run: python3 validate_gemini_simple.py
"""
import json
from pathlib import Path

try:
    import google.generativeai as genai
except ImportError:
    print("ERROR: Install with: pip install google-generativeai")
    exit(1)

# Get API key
api_key = input("Enter Gemini API key (or press Enter to use env var): ").strip()
if not api_key:
    import os
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: No API key provided")
        exit(1)

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-pro')

DATA = Path("data/training")
INPUT_FILE = DATA / "master_train_enriched.jsonl"
OUTPUT_FILE = DATA / "gemini_validation_results.jsonl"
LOG_FILE = DATA / "gemini_validation.log"

def log(msg):
    print(msg, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")

LOG_FILE.write_text("")
log("\n" + "="*80)
log("GEMINI VALIDATION")
log("="*80 + "\n")

stats = {"total": 0, "valid": 0, "dialect_ok": 0, "level_ok": 0, "avg_conf": 0}
results = []

try:
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= 10:  # 10 samples
                break
            
            rec = json.loads(line)
            text = rec.get("text", "")[:100]
            dialect = rec.get("dialect", "")
            level = rec.get("language_level", "")
            
            log(f"[{i+1}/10] {text}...")
            
            # Simple validation prompt
            prompt = f"""Validate this Zolai sentence:
Text: {text}
Claimed Dialect: {dialect}
Claimed Level: {level}

Respond ONLY with JSON (no other text):
{{"valid": true/false, "dialect_ok": true/false, "level_ok": true/false, "confidence": 0.0-1.0, "remark": "brief comment"}}"""
            
            try:
                response = model.generate_content(prompt)
                text_response = response.text.strip()
                
                # Extract JSON
                import re
                json_match = re.search(r'\{.*\}', text_response, re.DOTALL)
                if json_match:
                    validation = json.loads(json_match.group())
                else:
                    validation = {"valid": None, "confidence": 0, "remark": "Parse error"}
                
            except Exception as e:
                validation = {"valid": None, "confidence": 0, "remark": str(e)[:50]}
            
            # Stats
            stats["total"] += 1
            if validation.get("valid"):
                stats["valid"] += 1
            if validation.get("dialect_ok"):
                stats["dialect_ok"] += 1
            if validation.get("level_ok"):
                stats["level_ok"] += 1
            stats["avg_conf"] += validation.get("confidence", 0)
            
            # Log
            conf = validation.get("confidence", 0)
            remark = validation.get("remark", "")
            log(f"  Valid: {validation.get('valid')} | Dialect: {validation.get('dialect_ok')} | Level: {validation.get('level_ok')} | Conf: {conf:.2f}")
            log(f"  Remark: {remark}\n")
            
            # Save
            results.append({
                "index": i,
                "text": text,
                "dialect": dialect,
                "level": level,
                "validation": validation
            })

except Exception as e:
    log(f"ERROR: {e}")

# Summary
stats["avg_conf"] /= stats["total"] if stats["total"] > 0 else 1

log("="*80)
log(f"Total: {stats['total']}")
log(f"Valid: {stats['valid']}/{stats['total']} ({100*stats['valid']/stats['total']:.0f}%)")
log(f"Dialect OK: {stats['dialect_ok']}/{stats['total']} ({100*stats['dialect_ok']/stats['total']:.0f}%)")
log(f"Level OK: {stats['level_ok']}/{stats['total']} ({100*stats['level_ok']/stats['total']:.0f}%)")
log(f"Avg Confidence: {stats['avg_conf']:.2f}")
log("="*80 + "\n")

# Save results
with open(OUTPUT_FILE, "w") as f:
    for r in results:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")

print(f"\n✅ Done!")
print(f"Results: {OUTPUT_FILE}")
print(f"Log: {LOG_FILE}")

#!/usr/bin/env python3
"""
Validate with OpenRouter Gemini - Key rotation, model pool, 15k token limit
Run: python3 validate_openrouter_gemini.py
"""
import json
import os
from pathlib import Path
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    print("ERROR: OPENROUTER_API_KEY not found in .env")
    exit(1)

# Model pool for rotation
MODELS = [
    "google/gemini-pro",
    "google/gemini-1.5-pro",
    "google/gemini-1.5-flash",
]

DATA = Path("data/training")
INPUT_FILE = DATA / "master_train_enriched.jsonl"
OUTPUT_FILE = DATA / "openrouter_validation_results.jsonl"
LOG_FILE = DATA / "openrouter_validation.log"

MAX_TOKENS = 15000
SAMPLE_SIZE = 10

def log(msg):
    print(msg, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")

LOG_FILE.write_text("")
log("\n" + "="*80)
log("OPENROUTER GEMINI VALIDATION")
log("="*80)
log(f"Models: {', '.join(MODELS)}")
log(f"Max tokens: {MAX_TOKENS}")
log(f"Sample size: {SAMPLE_SIZE}\n")

def call_openrouter(prompt, model_idx=0):
    """Call OpenRouter with model rotation"""
    model = MODELS[model_idx % len(MODELS)]
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "https://zolai.local",
        "X-Title": "Zolai Validation",
    }
    
    data = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": MAX_TOKENS,
    }
    
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        
        if "choices" in result and result["choices"]:
            return result["choices"][0]["message"]["content"], model
        else:
            return None, model
            
    except Exception as e:
        return None, model

stats = {
    "total": 0,
    "valid": 0,
    "dialect_ok": 0,
    "level_ok": 0,
    "avg_conf": 0,
    "models_used": {},
    "tokens_used": 0,
}
results = []

try:
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= SAMPLE_SIZE:
                break
            
            rec = json.loads(line)
            text = rec.get("text", "")[:100]
            dialect = rec.get("dialect", "")
            level = rec.get("language_level", "")
            
            log(f"[{i+1}/{SAMPLE_SIZE}] {text}...")
            
            prompt = f"""Validate Zolai sentence:
Text: {text}
Dialect: {dialect}
Level: {level}

JSON only: {{"valid": true/false, "dialect_ok": true/false, "level_ok": true/false, "confidence": 0-1, "remark": "text"}}"""
            
            # Call with model rotation
            response, model = call_openrouter(prompt, i)
            
            if response:
                import re
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    validation = json.loads(json_match.group())
                else:
                    validation = {"valid": None, "confidence": 0, "remark": "Parse error"}
            else:
                validation = {"valid": None, "confidence": 0, "remark": "API error"}
            
            # Stats
            stats["total"] += 1
            stats["models_used"][model] = stats["models_used"].get(model, 0) + 1
            
            if validation.get("valid"):
                stats["valid"] += 1
            if validation.get("dialect_ok"):
                stats["dialect_ok"] += 1
            if validation.get("level_ok"):
                stats["level_ok"] += 1
            stats["avg_conf"] += validation.get("confidence", 0)
            
            conf = validation.get("confidence", 0)
            remark = validation.get("remark", "")
            log(f"  Model: {model} | Valid: {validation.get('valid')} | Conf: {conf:.2f}")
            log(f"  Remark: {remark}\n")
            
            results.append({
                "index": i,
                "text": text,
                "dialect": dialect,
                "level": level,
                "model": model,
                "validation": validation
            })

except Exception as e:
    log(f"ERROR: {e}")

# Summary
stats["avg_conf"] /= stats["total"] if stats["total"] > 0 else 1

log("="*80)
log(f"Total validated: {stats['total']}")
log(f"Valid: {stats['valid']}/{stats['total']} ({100*stats['valid']/stats['total']:.0f}%)")
log(f"Dialect OK: {stats['dialect_ok']}/{stats['total']} ({100*stats['dialect_ok']/stats['total']:.0f}%)")
log(f"Level OK: {stats['level_ok']}/{stats['total']} ({100*stats['level_ok']/stats['total']:.0f}%)")
log(f"Avg Confidence: {stats['avg_conf']:.2f}")
log(f"\nModels used:")
for model, count in stats["models_used"].items():
    log(f"  • {model}: {count} calls")
log("="*80 + "\n")

# Save results
with open(OUTPUT_FILE, "w") as f:
    for r in results:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")

print(f"\n✅ Done!")
print(f"Results: {OUTPUT_FILE}")
print(f"Log: {LOG_FILE}")

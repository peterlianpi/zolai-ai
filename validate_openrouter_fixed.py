#!/usr/bin/env python3
"""
Validate with OpenRouter - Fixed version
"""
import json
import os
from pathlib import Path
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")
if not API_KEY:
    print("ERROR: OPENROUTER_API_KEY not in .env")
    exit(1)

DATA = Path("data/training")
INPUT_FILE = DATA / "master_train_enriched.jsonl"
OUTPUT_FILE = DATA / "openrouter_validation_fixed.jsonl"
LOG_FILE = DATA / "openrouter_validation_fixed.log"

def log(msg):
    print(msg, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")

LOG_FILE.write_text("")
log("OPENROUTER VALIDATION\n")

MODELS = ["google/gemini-pro", "google/gemini-1.5-pro", "google/gemini-1.5-flash"]
results = []
stats = {"total": 0, "valid": 0, "models": {}}

with open(INPUT_FILE, "r") as f:
    for i, line in enumerate(f):
        if i >= 10:
            break
        
        rec = json.loads(line)
        text = rec.get("text", "")[:80]
        dialect = rec.get("dialect", "")
        level = rec.get("language_level", "")
        
        model = MODELS[i % len(MODELS)]
        log(f"[{i+1}/10] {text}... ({model})")
        
        prompt = f"Validate: '{text}' Dialect:{dialect} Level:{level}. JSON: {{\"valid\":true/false,\"confidence\":0-1}}"
        
        try:
            resp = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {API_KEY}"},
                json={"model": model, "messages": [{"role": "user", "content": prompt}], "max_tokens": 500},
                timeout=10
            )
            
            if resp.status_code == 200:
                data = resp.json()
                if "choices" in data and data["choices"]:
                    content = data["choices"][0]["message"]["content"]
                    import re
                    match = re.search(r'\{.*\}', content, re.DOTALL)
                    if match:
                        validation = json.loads(match.group())
                        stats["valid"] += 1
                        log(f"  ✓ Valid: {validation.get('valid')} | Conf: {validation.get('confidence', 0):.2f}\n")
                    else:
                        validation = {"valid": None, "confidence": 0}
                        log(f"  ✗ Parse error\n")
                else:
                    validation = {"valid": None, "confidence": 0}
                    log(f"  ✗ No response\n")
            else:
                validation = {"valid": None, "confidence": 0}
                log(f"  ✗ HTTP {resp.status_code}\n")
        except Exception as e:
            validation = {"valid": None, "confidence": 0}
            log(f"  ✗ Error: {str(e)[:50]}\n")
        
        stats["total"] += 1
        stats["models"][model] = stats["models"].get(model, 0) + 1
        
        results.append({"index": i, "text": text, "dialect": dialect, "level": level, "model": model, "validation": validation})

# Save
with open(OUTPUT_FILE, "w") as f:
    for r in results:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")

log("="*80)
log(f"Total: {stats['total']}")
log(f"Valid responses: {stats['valid']}/{stats['total']}")
log(f"Models: {stats['models']}")
log("="*80)
print(f"\n✅ Results: {OUTPUT_FILE}")
print(f"Log: {LOG_FILE}")

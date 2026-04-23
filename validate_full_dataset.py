#!/usr/bin/env python3
"""
Validate full dataset - Handles rate limits, uses free models
"""
import json, os, requests, time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

DATA = Path("data/training")
INPUT_FILE = DATA / "master_train_enriched.jsonl"
OUTPUT_FILE = DATA / "validation_full_dataset.jsonl"
LOG_FILE = DATA / "validation_full_dataset.log"

def log(msg):
    print(msg, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")

LOG_FILE.write_text("")
log("FULL DATASET VALIDATION\n")

OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_KEY:
    log("ERROR: OPENROUTER_API_KEY not in .env")
    exit(1)

# Use the model we know works
best_model = "openai/gpt-3.5-turbo"
log(f"Using model: {best_model}\n")
log(f"Validating all records from {INPUT_FILE.name}...\n")

results = []
stats = {"total": 0, "valid": 0, "errors": 0}

with open(INPUT_FILE, "r") as f:
    for i, line in enumerate(f):
        try:
            rec = json.loads(line)
            text = rec.get("text", "")[:60]
            dialect = rec.get("dialect", "")
            level = rec.get("language_level", "")
            
            if (i + 1) % 500 == 0:
                log(f"[{i+1}] Processing... Valid: {stats['valid']}/{stats['total']}")
            
            prompt = f"Is this valid Zolai? '{text}' Reply: yes/no"
            
            try:
                resp = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={"Authorization": f"Bearer {OPENROUTER_KEY}", "HTTP-Referer": "https://zolai.local"},
                    json={"model": best_model, "messages": [{"role": "user", "content": prompt}], "max_tokens": 50},
                    timeout=10
                )
                
                if resp.status_code == 200:
                    content = resp.json()["choices"][0]["message"]["content"]
                    valid = "yes" in content.lower()
                    if valid:
                        stats["valid"] += 1
                    results.append({"index": i, "text": text, "dialect": dialect, "level": level, "valid": valid})
                elif resp.status_code == 429:
                    log(f"Rate limited at record {i+1}. Waiting...")
                    time.sleep(5)
                    results.append({"index": i, "text": text, "error": "rate_limited"})
                    stats["errors"] += 1
                else:
                    results.append({"index": i, "text": text, "error": f"HTTP {resp.status_code}"})
                    stats["errors"] += 1
            except Exception as e:
                results.append({"index": i, "text": text, "error": str(e)[:50]})
                stats["errors"] += 1
            
            stats["total"] += 1
            
        except:
            pass

# Save
with open(OUTPUT_FILE, "w") as f:
    for r in results:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")

log(f"\n{'='*80}")
log(f"Total processed: {stats['total']}")
log(f"Valid: {stats['valid']}/{stats['total']} ({100*stats['valid']/stats['total']:.1f}%)")
log(f"Errors: {stats['errors']}")
log(f"Model: {best_model}")
log(f"Results: {OUTPUT_FILE}")
log(f"{'='*80}")

print(f"\n✅ Done! Processed {stats['total']} records")
print(f"Results: {OUTPUT_FILE}")

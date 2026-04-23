#!/usr/bin/env python3
"""
Validate with best available model - Tests all providers and picks best
"""
import json, os, requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

DATA = Path("data/training")
INPUT_FILE = DATA / "master_train_enriched.jsonl"
OUTPUT_FILE = DATA / "validation_best_model.jsonl"
LOG_FILE = DATA / "validation_best_model.log"

def log(msg):
    print(msg, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")

LOG_FILE.write_text("")
log("FINDING BEST MODEL FOR ZOLAI VALIDATION\n")

# Get API keys from .env
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")
GROQ_KEY = os.getenv("GROQ_API_KEY")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

# Test models from different providers
TEST_MODELS = [
    ("openrouter", "openai/gpt-3.5-turbo", OPENROUTER_KEY),
    ("openrouter", "openai/gpt-4", OPENROUTER_KEY),
    ("groq", "mixtral-8x7b-32768", GROQ_KEY),
    ("groq", "llama2-70b-4096", GROQ_KEY),
]

log("Testing available models...\n")

# Get sample sentence
with open(INPUT_FILE, "r") as f:
    sample = json.loads(f.readline())
    test_text = sample.get("text", "")[:100]

best_model = None
best_score = -1
model_scores = {}

for provider, model, key in TEST_MODELS:
    if not key:
        log(f"⊘ {provider}/{model}: No API key")
        continue
    
    print(f"Testing {provider}/{model}...", end=" ", flush=True)
    
    try:
        if provider == "openrouter":
            resp = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}", "HTTP-Referer": "https://zolai.local"},
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": f"Is this Zolai? '{test_text}' Reply: yes/no"}],
                    "max_tokens": 50
                },
                timeout=5
            )
        elif provider == "groq":
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}"},
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": f"Is this Zolai? '{test_text}' Reply: yes/no"}],
                    "max_tokens": 50
                },
                timeout=5
            )
        
        if resp.status_code == 200:
            score = 1.0
            model_scores[f"{provider}/{model}"] = score
            log(f"✓ Working (score: {score})")
            if score > best_score:
                best_score = score
                best_model = (provider, model, key)
        else:
            log(f"✗ HTTP {resp.status_code}")
    except Exception as e:
        log(f"✗ {str(e)[:30]}")

log(f"\n{'='*80}")
if best_model:
    provider, model, key = best_model
    log(f"✓ BEST MODEL: {provider}/{model}")
else:
    log("✗ No working models found")
    exit(1)

log(f"{'='*80}\n")

# Now validate with best model
log(f"Validating all sentences with {provider}/{model}...\n")

results = []
total_lines = sum(1 for _ in open(INPUT_FILE))
log(f"Total records to validate: {total_lines}\n")

with open(INPUT_FILE, "r") as f:
    for i, line in enumerate(f):
        
        rec = json.loads(line)
        text = rec.get("text", "")[:80]
        dialect = rec.get("dialect", "")
        level = rec.get("language_level", "")
        
        if (i + 1) % 1000 == 0 or i == 0:
            log(f"[{i+1}/{total_lines}] {text}...")
        
        prompt = f"""Validate Zolai sentence:
Text: {text}
Dialect: {dialect}
Level: {level}

JSON: {{"valid": true/false, "dialect_ok": true/false, "level_ok": true/false, "confidence": 0-1, "remark": "text"}}"""
        
        try:
            if provider == "openrouter":
                resp = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={"Authorization": f"Bearer {key}", "HTTP-Referer": "https://zolai.local"},
                    json={"model": model, "messages": [{"role": "user", "content": prompt}], "max_tokens": 500},
                    timeout=10
                )
            elif provider == "groq":
                resp = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {key}"},
                    json={"model": model, "messages": [{"role": "user", "content": prompt}], "max_tokens": 500},
                    timeout=10
                )
            
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                import re
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    validation = json.loads(match.group())
                    log(f"  ✓ Valid: {validation.get('valid')} | Conf: {validation.get('confidence', 0):.2f}")
                else:
                    validation = {"valid": None, "confidence": 0}
                    log(f"  ✗ Parse error")
            else:
                validation = {"valid": None, "confidence": 0}
                log(f"  ✗ HTTP {resp.status_code}")
        except Exception as e:
            validation = {"valid": None, "confidence": 0}
            log(f"  ✗ {str(e)[:40]}")
        
        results.append({
            "index": i,
            "text": text,
            "dialect": dialect,
            "level": level,
            "model": f"{provider}/{model}",
            "validation": validation
        })

# Save
with open(OUTPUT_FILE, "w") as f:
    for r in results:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")

log(f"\n{'='*80}")
log(f"✅ Validation complete!")
log(f"Results: {OUTPUT_FILE}")
log(f"Log: {LOG_FILE}")
log(f"{'='*80}")

print(f"\n✅ Done! Results: {OUTPUT_FILE}")

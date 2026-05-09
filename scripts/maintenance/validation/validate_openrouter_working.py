#!/usr/bin/env python3
import json, os, requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")

DATA = Path("data/training")
INPUT_FILE = DATA / "master_train_enriched.jsonl"
OUTPUT_FILE = DATA / "openrouter_results.jsonl"

print("OPENROUTER VALIDATION\n")

# Use working models
MODELS = ["openai/gpt-3.5-turbo", "meta-llama/llama-2-70b-chat", "anthropic/claude-2"]
results = []

with open(INPUT_FILE, "r") as f:
    for i, line in enumerate(f):
        if i >= 5:
            break
        
        rec = json.loads(line)
        text = rec.get("text", "")[:60]
        model = MODELS[i % len(MODELS)]
        
        print(f"[{i+1}/5] {text}... ({model})")
        
        try:
            resp = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {API_KEY}", "HTTP-Referer": "https://zolai.local"},
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": f"Is this valid Zolai? '{text}' Reply: valid/invalid"}],
                    "max_tokens": 100
                },
                timeout=10
            )
            
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                valid = "valid" in content.lower()
                print(f"  ✓ {content[:50]}")
                results.append({"text": text, "model": model, "response": content, "valid": valid})
            else:
                print(f"  ✗ HTTP {resp.status_code}: {resp.text[:100]}")
                results.append({"text": text, "model": model, "error": resp.status_code})
        except Exception as e:
            print(f"  ✗ {str(e)[:50]}")
            results.append({"text": text, "model": model, "error": str(e)[:50]})

with open(OUTPUT_FILE, "w") as f:
    for r in results:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")

print(f"\n✅ Results: {OUTPUT_FILE}")

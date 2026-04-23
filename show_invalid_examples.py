import json
from pathlib import Path

INPUT_FILE = Path("data/training/validation_local_wiki.jsonl")

corrections = {
    "ram": "gam",
    "lo leh": "kei", 
    "pathian": "pasian",
    "fapa": "tapa",
    "bawipa": "kumpipa",
}

examples = {k: [] for k in corrections}

with open(INPUT_FILE, "r") as f:
    for line in f:
        rec = json.loads(line)
        if not rec.get("valid"):
            reason = rec.get("reason", "")
            text = rec.get("text", "")
            
            for wrong, correct in corrections.items():
                if f"invalid_pattern:{wrong}" in reason and len(examples[wrong]) < 3:
                    examples[wrong].append(text)

for wrong, correct in corrections.items():
    print(f"\n{'='*80}")
    print(f"{wrong.upper()} → {correct.upper()}")
    print(f"{'='*80}")
    for i, ex in enumerate(examples[wrong], 1):
        print(f"{i}. {ex}")

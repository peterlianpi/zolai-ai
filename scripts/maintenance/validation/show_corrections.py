import json
from pathlib import Path

INPUT_FILE = Path("data/training/master_train_fixed.jsonl")

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
        if rec.get("fixed"):
            text = rec.get("text", "").lower()
            for wrong, correct in corrections.items():
                if wrong in text and len(examples[wrong]) < 3:
                    examples[wrong].append(rec.get("text", "")[:100])

for wrong, correct in corrections.items():
    print(f"\n{'='*80}")
    print(f"{wrong.upper()} → {correct.upper()}")
    print(f"{'='*80}")
    for i, ex in enumerate(examples[wrong], 1):
        print(f"{i}. {ex}...")

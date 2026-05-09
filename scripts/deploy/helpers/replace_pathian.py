import json
from pathlib import Path

INPUT_FILE = Path("data/training/master_train_final.jsonl")
OUTPUT_FILE = Path("data/training/master_train_production.jsonl")

count = 0
with open(INPUT_FILE, "r") as f_in, open(OUTPUT_FILE, "w") as f_out:
    for line in f_in:
        rec = json.loads(line)
        text = rec.get("text", "")
        
        if "Pathian" in text or "pathian" in text:
            text = text.replace("Pathian", "Pasian")
            text = text.replace("pathian", "pasian")
            rec["text"] = text
            count += 1
        
        f_out.write(json.dumps(rec, ensure_ascii=False) + "\n")

print(f"✅ Replaced Pathian → Pasian in {count} records")
print(f"Output: {OUTPUT_FILE}")

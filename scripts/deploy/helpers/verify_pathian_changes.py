import json
from pathlib import Path

INPUT_FILE = Path("data/training/master_train_final.jsonl")

# Zolai markers
ZOLAI_MARKERS = {"pasian", "leitung", "khuavak", "tua", "in", "a", "leh", "kei", "gam", "tapa", "tung", "hong", "bei", "van", "kuumpi", "uh", "i", "o", "ei"}

count = 0
zolai_context = 0
non_zolai = []

with open(INPUT_FILE, "r") as f:
    for line in f:
        rec = json.loads(line)
        text = rec.get("text", "")
        
        if "Pathian" in text or "pathian" in text:
            count += 1
            text_lower = text.lower()
            
            # Check if Zolai context
            has_zolai = any(marker in text_lower for marker in ZOLAI_MARKERS)
            
            if has_zolai:
                zolai_context += 1
                if count <= 5:
                    print(f"\n[{count}] ✓ ZOLAI CONTEXT")
                    print(f"Text: {text[:100]}...")
            else:
                non_zolai.append(text[:80])
                if len(non_zolai) <= 3:
                    print(f"\n[{count}] ✗ NON-ZOLAI CONTEXT")
                    print(f"Text: {text[:100]}...")

print(f"\n{'='*80}")
print(f"PATHIAN OCCURRENCES: {count}")
print(f"Zolai context: {zolai_context} ({100*zolai_context/count:.1f}%)")
print(f"Non-Zolai context: {len(non_zolai)} ({100*len(non_zolai)/count:.1f}%)")
print(f"{'='*80}")

if non_zolai:
    print(f"\nNon-Zolai examples:")
    for ex in non_zolai[:3]:
        print(f"  • {ex}")

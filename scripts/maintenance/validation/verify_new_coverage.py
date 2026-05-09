import json
from pathlib import Path
from collections import Counter

INPUT_FILE = Path("data/training/master_train_complete_all_resources.jsonl")

sources = Counter()
levels = Counter()
pos_tags = Counter()

with open(INPUT_FILE, "r") as f:
    for i, line in enumerate(f):
        rec = json.loads(line)
        sources[rec.get("source_type", "unknown")] += 1
        levels[rec.get("level", "unknown")] += 1
        
        pos = rec.get("pos", "unknown")
        if isinstance(pos, list):
            pos = pos[0] if pos else "unknown"
        pos_tags[pos] += 1
        
        if (i + 1) % 500000 == 0:
            print(f"[{i+1}] Analyzed...")

total = i + 1

print(f"\n{'='*80}")
print(f"FINAL COVERAGE - {total:,} RECORDS")
print(f"{'='*80}\n")

print("Source Types:")
for source, count in sources.most_common():
    pct = 100 * count / total
    print(f"  {source}: {count:,} ({pct:.1f}%)")

print("\nLanguage Levels:")
for level, count in levels.most_common():
    pct = 100 * count / total
    print(f"  {level}: {count:,} ({pct:.1f}%)")

print("\nPOS Tags:")
for pos, count in pos_tags.most_common():
    pct = 100 * count / total
    print(f"  {pos}: {count:,} ({pct:.1f}%)")

print(f"\n{'='*80}")
print(f"✅ Complete dataset ready!")
print(f"File: data/training/master_train_complete_all_resources.jsonl")

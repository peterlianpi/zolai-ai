"""Step 4: Final audit of clean sentences.jsonl."""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

COMBINED = Path("data/master/combined/sentences.jsonl")
BURMESE  = re.compile(r"[\u1000-\u109F]")
GERMAN   = re.compile(r"\b(und|der|die|das|ist|ein|eine|nicht|mit|von|zu)\b", re.I)
ENGLISH  = re.compile(r"\b(the|is|are|was|were|have|has|this|that|with|from|they|their|will|would|could|should)\b", re.I)
FORBIDDEN= re.compile(r"\b(pathian|bawipa|siangpahrang|falam|hakha|mizo|lushei)\b|(?<!\w)(cu|cun)(?!\w)", re.I)
TEDIM    = re.compile(r"\b(pasian|gam|topa|tapa|kumpipa|ahi|khi|leh|nang|kei|amah|bang|cih|pai|piang|sak|zong|pen|ding|khin|ngei|hih|tua|hi|ka|na|in|om|nei|ne)\b", re.I)

cats: Counter = Counter()
sources: Counter = Counter()

print("[STEP 4] Auditing clean sentences.jsonl...", flush=True)
for i, line in enumerate(COMBINED.open(encoding="utf-8", errors="replace"), 1):
    line = line.strip()
    if not line: continue
    try: obj = json.loads(line)
    except: continue
    t = obj.get("text", "").strip()
    src = obj.get("source", "unknown")
    sources[src] += 1

    if BURMESE.search(t):           cats["burmese"] += 1
    elif GERMAN.search(t):          cats["german"] += 1
    elif FORBIDDEN.search(t):       cats["forbidden"] += 1
    elif TEDIM.search(t):           cats["tedim_confirmed"] += 1
    else:
        words = t.split()
        en = len(ENGLISH.findall(t)) / max(len(words), 1)
        if en > 0.4:                cats["english_heavy"] += 1
        else:                       cats["unclassified"] += 1

    if i % 500_000 == 0:
        sys.stdout.write(f"\r  {i:,} audited...  ")
        sys.stdout.flush()

total = sum(cats.values())
print(f"\r  Done. {total:,} records.\n", flush=True)

print("=" * 60)
print("  FINAL AUDIT — clean sentences.jsonl")
print("=" * 60)
for k, v in cats.most_common():
    pct = v / total * 100
    bar = "█" * int(pct / 2)
    print(f"  {k:<22} {v:>8,}  ({pct:5.1f}%)  {bar}")

print("\n  TOP SOURCES:")
for src, cnt in sources.most_common(15):
    print(f"    {src:<45} {cnt:>8,}")

print("\n" + "=" * 60)
pure = cats["tedim_confirmed"] + cats["unclassified"]
pct  = pure / total * 100
print(f"  CONFIDENCE: {pct:.1f}% usable Zolai")
if pct >= 85:   print("  ✓ GOOD")
elif pct >= 70: print("  ⚠ FAIR")
else:           print("  ✗ NEEDS MORE WORK")
print("=" * 60)

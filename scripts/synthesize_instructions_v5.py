"""Scale up: derive instructions from full parallel corpus in batches."""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
OUT  = ROOT / "data/master/combined/instructions.jsonl"
PAR  = ROOT / "data/master/combined/parallel.jsonl"

def md5(s): return hashlib.md5(s.encode()).hexdigest()
def c(v):   return " ".join(str(v or "").split()).strip()

seen: set[str] = set()
with OUT.open(encoding="utf-8") as f:
    for line in f:
        try:
            obj = json.loads(line.strip())
            k = c(obj.get("instruction","")) + c(obj.get("output",""))
            if k: seen.add(md5(k))
        except: pass
print(f"Existing: {len(seen):,}", flush=True)

added = 0
with OUT.open("a", encoding="utf-8") as fout, PAR.open(encoding="utf-8") as fin:
    for i, line in enumerate(fin):
        if i % 25 != 0: continue   # every 25th = ~7,800 pairs from 195K
        line = line.strip()
        if not line: continue
        try: obj = json.loads(line)
        except: continue
        en  = c(obj.get("english",""))
        zo  = c(obj.get("zolai",""))
        ref = c(obj.get("reference",""))
        src = c(obj.get("source",""))
        if not en or not zo: continue
        if len(en) < 4 or len(zo) < 4: continue
        if len(en) > 300 or len(zo) > 300: continue

        # EN→ZO
        k1 = md5("Translate this English text to Zolai (Tedim Chin)." + zo)
        if k1 not in seen:
            seen.add(k1)
            fout.write(json.dumps({"instruction":"Translate this English text to Zolai (Tedim Chin).","input":en,"output":zo,"source":src or "parallel_corpus","domain":"translation","dialect":"tedim","category":"instruction"}, ensure_ascii=False)+"\n")
            added += 1

        # ZO→EN
        k2 = md5("Translate this Zolai (Tedim Chin) text to English." + en)
        if k2 not in seen:
            seen.add(k2)
            fout.write(json.dumps({"instruction":"Translate this Zolai (Tedim Chin) text to English.","input":zo,"output":en,"source":src or "parallel_corpus","domain":"translation","dialect":"tedim","category":"instruction"}, ensure_ascii=False)+"\n")
            added += 1

        # Verse-specific if ref exists
        if ref:
            k3 = md5(f"What is the Zolai translation of {ref}?" + zo)
            if k3 not in seen:
                seen.add(k3)
                fout.write(json.dumps({"instruction":f"What is the Zolai translation of {ref}?","input":en,"output":zo,"source":src or "parallel_corpus","domain":"religion","dialect":"tedim","category":"instruction"}, ensure_ascii=False)+"\n")
                added += 1

        if added % 1000 == 0:
            sys.stdout.write(f"\r  {i:,} scanned | {added:,} added  ")
            sys.stdout.flush()

print("\r  Done.                          ", flush=True)
print(f"Added {added:,} | Total: {len(seen):,}", flush=True)

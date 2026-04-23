"""Step 2: Parse LCEA packed records and route to instructions.jsonl."""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

COMBINED = Path("data/master/combined")
SRC      = COMBINED / "sentences.jsonl"   # original (still has lcea)
INST_OUT = COMBINED / "instructions.jsonl"
LCEA     = re.compile(r"^###\s*Instruction:\s*", re.I)
SPLIT    = re.compile(r"###\s*(?:Instruction|Input|Response):\s*\n?", re.I)
TR       = re.compile(r"translat", re.I)
FORBIDDEN = re.compile(r"\b(pathian|bawipa|siangpahrang|falam|hakha|mizo|lushei)\b|(?<!\w)(cu|cun)(?!\w)", re.I)

def md5(s: str) -> str:
    return hashlib.md5(s.encode()).hexdigest()

def c(v) -> str:
    return " ".join(str(v or "").split()).strip()

# Load existing instruction hashes
print("[STEP 2] Loading existing instruction hashes...", flush=True)
seen_i: set[str] = set()
seen_p: set[str] = set()
with (COMBINED / "instructions.jsonl").open(encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line: continue
        try:
            obj = json.loads(line)
            k = c(obj.get("instruction","")) + c(obj.get("output",""))
            if k: seen_i.add(md5(k))
        except: pass
with (COMBINED / "parallel.jsonl").open(encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line: continue
        try:
            obj = json.loads(line)
            k = c(obj.get("english","")) + c(obj.get("zolai",""))
            if k: seen_p.add(md5(k))
        except: pass
print(f"  {len(seen_i):,} instruction hashes, {len(seen_p):,} parallel hashes", flush=True)

added_i = 0
added_p = 0

print("[STEP 2] Parsing LCEA records from sentences.jsonl...", flush=True)
with SRC.open(encoding="utf-8", errors="replace") as fin, \
     INST_OUT.open("a", encoding="utf-8") as fi_out, \
     open(COMBINED / "parallel.jsonl", "a", encoding="utf-8") as fp_out:

    for i, line in enumerate(fin, 1):
        line = line.strip()
        if not line: continue
        try: obj = json.loads(line)
        except: continue

        text = c(obj.get("text", ""))
        if not LCEA.match(text): continue

        # Parse ### sections
        parts = SPLIT.split(text)
        # parts[0] = '' before first ###, parts[1]=instruction, parts[2]=input, parts[3]=response
        if len(parts) < 4: continue
        ins = c(parts[1])
        inp = c(parts[2])
        out = c(parts[3])
        if not ins or not out: continue
        if FORBIDDEN.search(out): continue

        if TR.search(ins) and inp:
            k = md5(inp + out)
            if k not in seen_p:
                seen_p.add(k)
                fp_out.write(json.dumps({
                    "zolai": out, "english": inp, "dialect": "tedim",
                    "source": "zolai_lcea_dataset", "reference": "", "category": "parallel"
                }, ensure_ascii=False) + "\n")
                added_p += 1
        else:
            k = md5(ins + out)
            if k not in seen_i:
                seen_i.add(k)
                fi_out.write(json.dumps({
                    "instruction": ins, "input": inp, "output": out,
                    "source": "zolai_lcea_dataset", "domain": "general",
                    "dialect": "tedim", "category": "instruction"
                }, ensure_ascii=False) + "\n")
                added_i += 1

        if i % 1_000_000 == 0:
            sys.stdout.write(f"\r  {i:,} scanned | +instructions={added_i:,} +parallel={added_p:,}  ")
            sys.stdout.flush()

print("\r  Done.                                              ", flush=True)
print(f"  +instructions : {added_i:,}")
print(f"  +parallel     : {added_p:,}")

"""
Full cleanup pass:
1. Remove forbidden dialect from instructions (but keep explanatory text that MENTIONS forbidden words)
2. Remove empty/bad records from parallel
3. Remove FCL/Hakha dialect from parallel
4. Report final clean counts
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

COMBINED = Path("data/master/combined")

FORBIDDEN_STRICT = re.compile(
    r"(?<!\w)(cu|cun)(?!\w)|"
    r"\b(pathian|bawipa|siangpahrang)\b",
    re.I
)
# Explanatory pattern — output is TEACHING about forbidden words, not using them
EXPLANATORY = re.compile(
    r"(never use|do not use|don.t use|forbidden|incorrect|wrong|avoid|hakha|falam|non-standard|correct.*is|use.*instead)",
    re.I
)
BURMESE = re.compile(r"[\u1000-\u109F]")
GERMAN  = re.compile(r"\b(und|der|die|das|ist|ein|eine)\b", re.I)

def md5(s: str) -> str:
    return hashlib.md5(s.encode()).hexdigest()

def c(v) -> str:
    return " ".join(str(v or "").split()).strip()

stats: dict[str, dict] = {}

# ── Clean instructions ────────────────────────────────────────────────────────
print("[Zomi Cleaner Bot] Cleaning instructions.jsonl...", flush=True)
src = COMBINED / "instructions.jsonl"
tmp = COMBINED / "instructions_clean.jsonl"
s = {"kept": 0, "removed_forbidden": 0, "removed_empty": 0}
seen_i: set[str] = set()

with src.open(encoding="utf-8") as fin, tmp.open("w", encoding="utf-8") as fout:
    for line in fin:
        line = line.strip()
        if not line: continue
        try: obj = json.loads(line)
        except: continue
        ins = c(obj.get("instruction", ""))
        out = c(obj.get("output", ""))
        if not ins or not out:
            s["removed_empty"] += 1; continue
        # Keep if output mentions forbidden words in an explanatory/teaching context
        if FORBIDDEN_STRICT.search(out) and not EXPLANATORY.search(out):
            s["removed_forbidden"] += 1; continue
        k = md5(ins + out)
        if k in seen_i:
            continue
        seen_i.add(k)
        fout.write(json.dumps(obj, ensure_ascii=False) + "\n")
        s["kept"] += 1

stats["instructions"] = s
print(f"  kept={s['kept']:,}  removed_forbidden={s['removed_forbidden']:,}  removed_empty={s['removed_empty']:,}", flush=True)

# ── Clean parallel ────────────────────────────────────────────────────────────
print("[Zomi Cleaner Bot] Cleaning parallel.jsonl...", flush=True)
src = COMBINED / "parallel.jsonl"
tmp2 = COMBINED / "parallel_clean.jsonl"
s2 = {"kept": 0, "removed_empty": 0, "removed_forbidden": 0, "removed_burmese": 0, "removed_german": 0}
seen_p: set[str] = set()

with src.open(encoding="utf-8") as fin, tmp2.open("w", encoding="utf-8") as fout:
    for i, line in enumerate(fin):
        line = line.strip()
        if not line: continue
        try: obj = json.loads(line)
        except: continue

        zo = c(obj.get("zolai", ""))
        en = c(obj.get("english", ""))

        if not zo or not en:
            s2["removed_empty"] += 1; continue
        if len(zo) < 3 or len(en) < 3:
            s2["removed_empty"] += 1; continue
        if FORBIDDEN_STRICT.search(zo):
            s2["removed_forbidden"] += 1; continue
        if BURMESE.search(zo):
            s2["removed_burmese"] += 1; continue
        if GERMAN.search(zo):
            s2["removed_german"] += 1; continue

        k = md5(en + zo)
        if k in seen_p:
            continue
        seen_p.add(k)
        fout.write(json.dumps(obj, ensure_ascii=False) + "\n")
        s2["kept"] += 1

        if i % 50_000 == 0:
            sys.stdout.write(f"\r  {i:,} processed | kept={s2['kept']:,}  ")
            sys.stdout.flush()

stats["parallel"] = s2
print(f"\r  kept={s2['kept']:,}  removed_empty={s2['removed_empty']:,}  removed_forbidden={s2['removed_forbidden']:,}  removed_burmese={s2['removed_burmese']:,}", flush=True)

# ── Swap files ────────────────────────────────────────────────────────────────
print("[Zomi Data Manager] Swapping clean files...", flush=True)
(COMBINED / "instructions.jsonl").replace(COMBINED / "instructions_pre_clean.jsonl")
(COMBINED / "instructions_clean.jsonl").rename(COMBINED / "instructions.jsonl")
(COMBINED / "parallel.jsonl").replace(COMBINED / "parallel_pre_clean.jsonl")
(COMBINED / "parallel_clean.jsonl").rename(COMBINED / "parallel.jsonl")
print("  Swapped.", flush=True)

# ── Final counts ──────────────────────────────────────────────────────────────
print("\n[Zomi Ops Monitor] Final combined counts:", flush=True)
for fname in ["sentences.jsonl", "parallel.jsonl", "instructions.jsonl", "dictionary.jsonl"]:
    p = COMBINED / fname
    lines = sum(1 for _ in p.open(encoding="utf-8"))
    mb = p.stat().st_size / 1024 / 1024
    print(f"  {fname:<25} {lines:>8,} records  {mb:>7.1f}MB", flush=True)

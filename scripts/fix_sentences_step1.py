"""Step 1: Clean sentences.jsonl — strip prompts, remove bad sources, dedup."""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

COMBINED = Path("data/master/combined")
SRC  = COMBINED / "sentences.jsonl"
TMP  = COMBINED / "sentences_clean.jsonl"

PACKED    = re.compile(r"^Continue the sentence naturally in Zolai\s+[\"\u201c\u2018]?", re.I)
BURMESE   = re.compile(r"[\u1000-\u109F]")
GERMAN    = re.compile(r"\b(und|der|die|das|ist|ein|eine|nicht|mit|von|zu)\b", re.I)
ENGLISH   = re.compile(r"\b(the|is|are|was|were|have|has|this|that|with|from|they|their|will|would|could|should)\b", re.I)
LCEA      = re.compile(r"^###\s*Instruction:", re.I)
FORBIDDEN = re.compile(r"\b(pathian|bawipa|siangpahrang|falam|hakha|mizo|lushei)\b|(?<!\w)(cu|cun)(?!\w)", re.I)
BAD_SRC   = {"luther1912","judson1835","bible_kjv","bible_fcl","bible_hcl06","bible_judson","bible_hcl","kaggle_v2"}

def md5(s: str) -> str:
    return hashlib.md5(s.encode()).hexdigest()

def c(v) -> str:
    return " ".join(str(v or "").split()).strip()

seen: set[str] = set()
stats: dict[str, int] = {
    "kept": 0, "stripped_prefix": 0,
    "removed_bad_src": 0, "removed_lcea": 0,
    "removed_burmese": 0, "removed_german": 0,
    "removed_forbidden": 0, "removed_english": 0, "dedup": 0,
}

print("[STEP 1] Cleaning sentences.jsonl...", flush=True)
with SRC.open(encoding="utf-8", errors="replace") as fin, TMP.open("w", encoding="utf-8") as fout:
    for i, line in enumerate(fin, 1):
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except Exception:
            continue

        text   = c(obj.get("text", ""))
        source = c(obj.get("source", "unknown"))

        if source in BAD_SRC:
            stats["removed_bad_src"] += 1; continue
        if LCEA.match(text):
            stats["removed_lcea"] += 1; continue
        if PACKED.match(text):
            text = PACKED.sub("", text).strip().strip('"\u201c\u201d\u2018\u2019')
            stats["stripped_prefix"] += 1
        if BURMESE.search(text):
            stats["removed_burmese"] += 1; continue
        if GERMAN.search(text):
            stats["removed_german"] += 1; continue
        if FORBIDDEN.search(text):
            stats["removed_forbidden"] += 1; continue

        words = text.split()
        if len(words) > 3 and len(ENGLISH.findall(text)) / len(words) > 0.5:
            stats["removed_english"] += 1; continue
        if len(text) < 3:
            continue

        k = md5(text)
        if k in seen:
            stats["dedup"] += 1; continue
        seen.add(k)

        obj["text"] = text
        fout.write(json.dumps(obj, ensure_ascii=False) + "\n")
        stats["kept"] += 1

        if i % 1_000_000 == 0:
            sys.stdout.write(f"\r  {i:,} processed | kept={stats['kept']:,}  ")
            sys.stdout.flush()

print("\r  Done.                                    ", flush=True)
print()
for k, v in stats.items():
    print(f"  {k:<25} {v:>9,}")
print(f"\n  IN:  8,881,728\n  OUT: {stats['kept']:,}")

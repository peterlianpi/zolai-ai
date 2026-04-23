"""Fix sentences: remove forbidden dialect, FCL connectors."""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

p   = Path("data/master/combined/sentences.jsonl")
tmp = Path("data/master/combined/s5.jsonl")

FORBIDDEN = re.compile(
    r"\b(pathian|bawipa|siangpahrang|nunnak|zalenna)\b"
    r"|(?<!\w)(cu\b|cun\b)"
    r"|\b(falam|hakha|mizo|lushei)\s+(pau|dialect|chin|language|version|bible|text|script)\b",
    re.I)
FCL_CONN  = re.compile(r"\b(cule|cutikah)\b", re.I)
EXPLAIN   = re.compile(r"(never use|do not use|forbidden|incorrect|wrong|avoid|hakha|falam)", re.I)
QUOTE_CTX = re.compile(r"zalenna.*cih|zalenna.*policy|zalenna.*thukhu", re.I)

def md5(s: str) -> str:
    return hashlib.md5(s.encode()).hexdigest()

seen: set[str] = set()
kept = removed = 0

with p.open(encoding="utf-8") as fin, tmp.open("w", encoding="utf-8") as fout:
    for line in fin:
        line = line.strip()
        if not line: continue
        try: obj = json.loads(line)
        except: continue
        t = obj.get("text","").strip()
        if FORBIDDEN.search(t) and not EXPLAIN.search(t) and not QUOTE_CTX.search(t):
            removed += 1; continue
        if FCL_CONN.search(t) and not EXPLAIN.search(t):
            removed += 1; continue
        k = md5(t)
        if k in seen: removed += 1; continue
        seen.add(k); fout.write(line + "\n"); kept += 1

p.unlink(); tmp.rename(p)
print(f"kept={kept:,}  removed={removed:,}")

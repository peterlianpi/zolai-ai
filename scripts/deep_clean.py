"""Fix all remaining dataset issues found in deep audit."""
from __future__ import annotations

import ast
import hashlib
import json
import re
from pathlib import Path

COMBINED = Path("data/master/combined")

def md5(s): return hashlib.md5(s.encode()).hexdigest()
def c(v):   return " ".join(str(v or "").split()).strip()

# ── 1. SENTENCES: remove too_long, has_url, html_tags, numbers_only, too_short
print("[1/4] Cleaning sentences.jsonl...", flush=True)
URL  = re.compile(r"https?://\S+")
HTML = re.compile(r"<[a-z][^>]*>", re.I)
NUM  = re.compile(r"^[\d\s\.\,\:\;\-\/\(\)]+$")
seen_s: set[str] = set()
kept=removed=0
with (COMBINED/"sentences.jsonl").open(encoding="utf-8") as fin, \
     (COMBINED/"sentences_fix.jsonl").open("w", encoding="utf-8") as fout:
    for line in fin:
        line=line.strip()
        if not line: continue
        try: obj=json.loads(line)
        except: continue
        t = c(obj.get("text",""))
        if len(t) > 1000:          removed+=1; continue
        if URL.search(t):          removed+=1; continue
        if HTML.search(t):         removed+=1; continue
        if NUM.match(t):           removed+=1; continue
        if len(t) < 5:             removed+=1; continue
        t = re.sub(r"  +", " ", t)  # collapse double spaces
        k = md5(t)
        if k in seen_s:            removed+=1; continue
        seen_s.add(k)
        obj["text"] = t
        fout.write(json.dumps(obj, ensure_ascii=False)+"\n")
        kept+=1
print(f"  kept={kept:,}  removed={removed:,}", flush=True)

# ── 2. PARALLEL: remove zo==en, zolai_in_english field, double spaces
print("[2/4] Cleaning parallel.jsonl...", flush=True)
ZO_IN_EN = re.compile(r"\b(pasian|gam|topa|ahi|leh|kei|pai|hi)\b", re.I)
seen_p: set[str] = set()
kept2=removed2=0
with (COMBINED/"parallel.jsonl").open(encoding="utf-8") as fin, \
     (COMBINED/"parallel_fix.jsonl").open("w", encoding="utf-8") as fout:
    for line in fin:
        line=line.strip()
        if not line: continue
        try: obj=json.loads(line)
        except: continue
        zo=c(obj.get("zolai","")); en=c(obj.get("english",""))
        if not zo or not en:       removed2+=1; continue
        if zo==en:                 removed2+=1; continue  # proper nouns only — skip
        en_ratio = len(ZO_IN_EN.findall(en)) / max(len(en.split()),1)
        if en_ratio > 0.3:         removed2+=1; continue  # Zolai leaked into EN field
        zo = re.sub(r"  +", " ", zo)
        en = re.sub(r"  +", " ", en)
        k = md5(en+zo)
        if k in seen_p:            removed2+=1; continue
        seen_p.add(k)
        obj["zolai"]=zo; obj["english"]=en
        fout.write(json.dumps(obj, ensure_ascii=False)+"\n")
        kept2+=1
print(f"  kept={kept2:,}  removed={removed2:,}", flush=True)

# ── 3. INSTRUCTIONS: remove output==input
print("[3/4] Cleaning instructions.jsonl...", flush=True)
seen_i: set[str] = set()
kept3=removed3=0
with (COMBINED/"instructions.jsonl").open(encoding="utf-8") as fin, \
     (COMBINED/"instructions_fix.jsonl").open("w", encoding="utf-8") as fout:
    for line in fin:
        line=line.strip()
        if not line: continue
        try: obj=json.loads(line)
        except: continue
        ins=c(obj.get("instruction","")); inp=c(obj.get("input","")); out=c(obj.get("output",""))
        if not ins or not out:     removed3+=1; continue
        if out==inp and inp:       removed3+=1; continue  # output just echoes input
        out = re.sub(r"  +", " ", out)
        k = md5(ins+out)
        if k in seen_i:            removed3+=1; continue
        seen_i.add(k)
        obj["output"]=out
        fout.write(json.dumps(obj, ensure_ascii=False)+"\n")
        kept3+=1
print(f"  kept={kept3:,}  removed={removed3:,}", flush=True)

# ── 4. DICTIONARY: fix long headwords (they're malformed entries), remove burmese translations
print("[4/4] Cleaning dictionary.jsonl...", flush=True)
BURMESE = re.compile(r"[\u1000-\u109F]")
seen_d: set[str] = set()
kept4=removed4=fixed4=0
with (COMBINED/"dictionary.jsonl").open(encoding="utf-8") as fin, \
     (COMBINED/"dictionary_fix.jsonl").open("w", encoding="utf-8") as fout:
    for line in fin:
        line=line.strip()
        if not line: continue
        try: obj=json.loads(line)
        except: continue
        hw = c(obj.get("headword",""))
        if not hw:                 removed4+=1; continue
        if len(hw) > 80:           removed4+=1; continue  # malformed — definition leaked into headword
        if re.match(r"^[\d\s\.\-]+$", hw): removed4+=1; continue  # numeric headword

        # Fix translations: parse stringified lists, remove Burmese
        tr = obj.get("translations",[])
        if isinstance(tr, str):
            try: tr = ast.literal_eval(tr)
            except: tr = [tr]
        tr = [c(t) for t in tr if t and not BURMESE.search(str(t))]
        if not tr:                 removed4+=1; continue

        k = md5(hw.lower())
        if k in seen_d:            removed4+=1; continue
        seen_d.add(k)
        obj["headword"]=hw; obj["translations"]=tr
        fout.write(json.dumps(obj, ensure_ascii=False)+"\n")
        kept4+=1
print(f"  kept={kept4:,}  removed={removed4:,}", flush=True)

# ── Swap all files ────────────────────────────────────────────────────────────
print("\n[Zomi Data Manager] Swapping files...", flush=True)
for name, fix in [("sentences","sentences_fix"),("parallel","parallel_fix"),
                  ("instructions","instructions_fix"),("dictionary","dictionary_fix")]:
    (COMBINED/f"{name}.jsonl").unlink()
    (COMBINED/f"{fix}.jsonl").rename(COMBINED/f"{name}.jsonl")

print("\n=== FINAL COUNTS ===", flush=True)
for fname in ["sentences.jsonl","parallel.jsonl","instructions.jsonl","dictionary.jsonl"]:
    p = COMBINED/fname
    lines = sum(1 for _ in p.open(encoding="utf-8"))
    mb = p.stat().st_size/1024/1024
    print(f"  {fname:<25} {lines:>8,} records  {mb:>7.1f}MB")

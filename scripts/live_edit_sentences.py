"""Live sentence editor — fixed display box, updates in place."""
from __future__ import annotations

import hashlib
import json
import re
import sys
import time
from pathlib import Path

SRC = Path("data/master/combined/sentences.jsonl")
TMP = Path("data/master/combined/sentences_live.jsonl")
LOG = Path("data/master/combined/live_edit_log.jsonl")

STEM_FIXES = [
    (re.compile(r"\bthangna\b"), "than'na"),
    (re.compile(r"\bkapna\b"),   "kahna"),
    (re.compile(r"\bneina\b"),   "neihna"),
    (re.compile(r"\bsina\b"),    "sihna"),
    (re.compile(r"\bhauna\b"),   "hauhna"),
    (re.compile(r"\bhakna\b"),   "hahna"),
    (re.compile(r"\bthatna\b"),  "thahna"),
    (re.compile(r"\bsamna\b"),   "sapna"),
    (re.compile(r"\bpiangna\b"), "pian'na"),
    (re.compile(r"\bkipanna\b"), "kipatna"),
]
PLURAL_FIX = re.compile(r"\b(i\s+\w+)\s+uh\b", re.I)
CONTRACTS  = [
    (re.compile(r"\bahihi\b"), "ahi hi"),
    (re.compile(r"\buhhi\b"),  "uh hi"),
    (re.compile(r"\buhi\b"),   "uh hi"),
    (re.compile(r"\bcihi\b"),  "ci hi"),
    (re.compile(r"\bhihi\b"),  "hi hi"),
]
DIALECT = re.compile(r"\b(pathian|bawipa|siangpahrang|nunnak)\b|(?<!\w)(cu\b|cun\b)", re.I)
EXPLAIN = re.compile(r"(never use|do not use|forbidden|incorrect|wrong|avoid)", re.I)
DBLSPC  = re.compile(r"  +")

def md5(s): return hashlib.md5(s.encode()).hexdigest()

def fix(text):
    changes = []
    for pat, correct in STEM_FIXES:
        if pat.search(text):
            text = pat.sub(correct, text); changes.append(f"stem: {pat.pattern[2:-2]} → {correct}")
    m = PLURAL_FIX.search(text)
    if m:
        text = PLURAL_FIX.sub(r"\1", text); changes.append("plurality: removed 'uh'")
    for pat, exp in CONTRACTS:
        if pat.search(text):
            text = pat.sub(exp, text); changes.append(f"contract: {pat.pattern[2:-2]} → {exp}")
    if "  " in text:
        text = DBLSPC.sub(" ", text).strip(); changes.append("whitespace")
    return text, changes

def pad(s, w): return s[:w].ljust(w)

W = 72  # box width

def draw_box(line_no, total, before, after, change, stats):
    # Move cursor up 10 lines and redraw
    sys.stdout.write("\033[10A\033[J")
    print("┌" + "─"*W + "┐")
    print("│" + pad(f"  [Linguistic Specialist] Live Edit — Line {line_no:,} / ~{total:,}", W) + "│")
    print("├" + "─"*W + "┤")
    print("│" + pad(f"  CHANGE : {change}", W) + "│")
    print("├" + "─"*W + "┤")
    print("│" + pad(f"  BEFORE : {before}", W) + "│")
    print("│" + pad(f"  AFTER  : {after}", W) + "│")
    print("├" + "─"*W + "┤")
    print("│" + pad(f"  fixed={stats['fixed']:,}  removed={stats['removed']:,}  dedup={stats['dedup']:,}  kept={stats['kept']:,}", W) + "│")
    print("└" + "─"*W + "┘")
    sys.stdout.flush()

# Print initial empty box
print("┌" + "─"*W + "┐")
print("│" + " "*W + "│")
print("├" + "─"*W + "┤")
print("│" + " "*W + "│")
print("├" + "─"*W + "┤")
print("│" + " "*W + "│")
print("│" + " "*W + "│")
print("├" + "─"*W + "┤")
print("│" + " "*W + "│")
print("└" + "─"*W + "┘")

TOTAL = 2_801_857
seen: set[str] = set()
stats = {"kept": 0, "fixed": 0, "removed": 0, "dedup": 0}

with SRC.open(encoding="utf-8") as fin, TMP.open("w", encoding="utf-8") as fout, \
     LOG.open("w", encoding="utf-8") as flog:
    for i, line in enumerate(fin, 1):
        line = line.strip()
        if not line: continue
        try: obj = json.loads(line)
        except: continue
        text = obj.get("text","").strip()
        if not text: continue

        if DIALECT.search(text) and not EXPLAIN.search(text):
            stats["removed"] += 1; continue

        fixed, changes = fix(text)
        k = md5(fixed)
        if k in seen: stats["dedup"] += 1; continue
        seen.add(k)

        if changes:
            stats["fixed"] += 1
            flog.write(json.dumps({"original":text,"fixed":fixed,"changes":changes,
                "source":obj.get("source","")}, ensure_ascii=False)+"\n")
            obj["text"] = fixed
            draw_box(i, TOTAL, text[:W-12], fixed[:W-12], changes[0][:W-12], stats)
            time.sleep(0.12)
        else:
            stats["kept"] += 1
            # Update counter every 50k without redrawing
            if i % 50_000 == 0:
                draw_box(i, TOTAL, "...", "...", f"scanning... {i:,} processed", stats)

        fout.write(json.dumps(obj, ensure_ascii=False)+"\n")

SRC.unlink(); TMP.rename(SRC)

sys.stdout.write("\033[10A\033[J")
print("┌" + "─"*W + "┐")
print("│" + pad("  ✓ LIVE EDIT COMPLETE", W) + "│")
print("├" + "─"*W + "┤")
print("│" + pad(f"  fixed   : {stats['fixed']:,}", W) + "│")
print("│" + pad(f"  removed : {stats['removed']:,}", W) + "│")
print("│" + pad(f"  dedup   : {stats['dedup']:,}", W) + "│")
print("│" + pad(f"  kept    : {stats['kept']:,}", W) + "│")
print("├" + "─"*W + "┤")
print("│" + pad(f"  Log → {LOG}", W) + "│")
print("└" + "─"*W + "┘")

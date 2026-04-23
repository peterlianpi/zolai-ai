"""Full wiki-grounded sentence audit — checks all grammar rules from wiki/."""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path

COMBINED = Path("data/master/combined/sentences.jsonl")

FORBIDDEN_DIALECT = re.compile(
    r"\b(pathian|bawipa|siangpahrang|falam|hakha|mizo|lushei|nunnak|zalenna)\b"
    r"|(?<!\w)(cu\b|cun\b)", re.I)
FCL_CONN   = re.compile(r"\b(cule|cutikah)\b", re.I)
BAD_STEMS  = re.compile(r"\b(sina|neina|hauna|hakna|kapna|thatna|samna|kipanna|thangna|piangna)\b", re.I)
PHON_TI    = re.compile(r"\bti[aeiou]", re.I)
PHON_TI_OK = re.compile(r"\b(tia|tiang|tiangkhat|tiangni)\b", re.I)
PLURAL_VIO = re.compile(r"\bi\s+\w+\s+uh\b", re.I)
NEG_COND   = re.compile(r"\blo\s+leh\b", re.I)
TEDIM      = re.compile(r"\b(pasian|gam|topa|ahi|leh|kei|pai|hi|ka|na|in|om|nei|ne|cih|bang|tua|pen|ding|zomi)\b", re.I)
SOV_END    = re.compile(r"\b(hi|hiam|hen|ding hi|khin hi|zo hi|ta hi|lai hi|lo hi|kei ding hi|ahi hi)\s*[.!?\"\u201d]?\s*$", re.I)

stats: Counter = Counter()
samples: dict[str, list] = defaultdict(list)
sov_endings: Counter = Counter()
SMAX = 3

total = 0
for line in COMBINED.open(encoding="utf-8"):
    line = line.strip()
    if not line: continue
    try: obj = json.loads(line)
    except: continue
    t = obj.get("text","").strip()
    if not t: continue
    total += 1
    has_issue = False

    if FORBIDDEN_DIALECT.search(t):
        stats["forbidden_dialect"] += 1
        if len(samples["forbidden_dialect"]) < SMAX: samples["forbidden_dialect"].append(t[:100])
        has_issue = True
    if FCL_CONN.search(t):
        stats["fcl_connector"] += 1
        if len(samples["fcl_connector"]) < SMAX: samples["fcl_connector"].append(t[:100])
        has_issue = True
    if BAD_STEMS.search(t):
        stats["bad_stem_nominalization"] += 1
        if len(samples["bad_stem_nominalization"]) < SMAX: samples["bad_stem_nominalization"].append(t[:100])
        has_issue = True
    if PHON_TI.search(t) and not PHON_TI_OK.search(t):
        stats["phonetic_ti_cluster"] += 1
        if len(samples["phonetic_ti_cluster"]) < SMAX: samples["phonetic_ti_cluster"].append(t[:100])
        has_issue = True
    if PLURAL_VIO.search(t):
        stats["plurality_i_uh"] += 1
        if len(samples["plurality_i_uh"]) < SMAX: samples["plurality_i_uh"].append(t[:100])
        has_issue = True
    if NEG_COND.search(t):
        stats["neg_cond_lo_leh"] += 1
        if len(samples["neg_cond_lo_leh"]) < SMAX: samples["neg_cond_lo_leh"].append(t[:100])
        has_issue = True
    if not TEDIM.search(t):
        stats["no_tedim_marker"] += 1
        has_issue = True
    if not has_issue:
        stats["clean"] += 1

    # SOV ending pattern frequency
    m = SOV_END.search(t)
    if m:
        pat = m.group().strip().rstrip(".!?\"").strip()
        sov_endings[pat] += 1

print(f"Total audited: {total:,}\n")
print("="*65)
print("  SENTENCE AUDIT vs WIKI GRAMMAR RULES")
print("="*65)
clean = stats["clean"]
print(f"  {'clean':<30} {clean:>9,}  ({clean/total*100:.1f}%)")
for k in ["forbidden_dialect","fcl_connector","bad_stem_nominalization",
          "phonetic_ti_cluster","plurality_i_uh","neg_cond_lo_leh","no_tedim_marker"]:
    v = stats[k]
    if v:
        print(f"  {'⚠ '+k:<30} {v:>9,}  ({v/total*100:.2f}%)")
        for s in samples.get(k,[]):
            print(f"    → {s}")

print("\n  TOP SOV ENDING PATTERNS (wiki: sentence_structures.md):")
for pat, cnt in sov_endings.most_common(15):
    print(f"    {pat:<30} {cnt:>8,}")

print("\n  LEARNED PATTERNS TO ADD TO WIKI:")
# Find new patterns not yet in wiki
new_patterns = Counter()
for line in COMBINED.open(encoding="utf-8"):
    try:
        t = json.loads(line.strip()).get("text","")
        # Find sentence-final particles not in our known list
        m = re.search(r"\b(\w+)\s*[.!?]?\s*$", t)
        if m:
            w = m.group(1).lower()
            if w not in {"hi","hiam","hen","un","in","ni","leh","ding","khin","zo","ta","lai","lo","kei","hi"}:
                new_patterns[w] += 1
    except: pass
print("  Frequent sentence-final words (potential new patterns):")
for w, cnt in new_patterns.most_common(20):
    if cnt > 500:
        print(f"    '{w}' appears {cnt:,}x as sentence-final word")

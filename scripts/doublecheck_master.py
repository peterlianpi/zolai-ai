"""
Full pipeline: inspect → clean → deduplicate → combine all sources into master.
Handles every known schema. Shows per-agent, per-file progress.
"""
from __future__ import annotations

import ast
import hashlib
import json
import re
import sys
import time
from pathlib import Path

ROOT     = Path(__file__).parent.parent
COMBINED = ROOT / "data/master/combined"
SOURCES  = ROOT / "data/master/sources"
ARCHIVE  = ROOT / "data/master/archive"
NEW_FILE = ROOT / "data/zolai_corpus_master.jsonl"
TR       = re.compile(r"translat", re.I)
# Non-Zolai sources to skip (Burmese, German, English-only bibles)
SKIP_SOURCES = {"judson1835", "luther1912"}

def md5(s: str) -> str:
    return hashlib.md5(s.encode()).hexdigest()

def c(v) -> str:
    return " ".join(str(v or "").split()).strip()

def log(agent: str, msg: str) -> None:
    print(f"[{agent}] {msg}", flush=True)

def progress(fname: str, i: int, counts: dict) -> None:
    s = "  ".join(f"{k}={v:,}" for k, v in counts.items())
    sys.stdout.write(f"\r  ↳ {fname}: {i:,} lines | {s}   ")
    sys.stdout.flush()

def parse_meta(obj: dict) -> dict:
    """Safely parse metadata field (may be dict string or dict)."""
    m = obj.get("metadata", {})
    if isinstance(m, str):
        try: m = ast.literal_eval(m)
        except: m = {}
    return m if isinstance(m, dict) else {}

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 0 — Schema report
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("  PHASE 0 — Schema Inspection  [Linguistic Specialist]")
print("="*70, flush=True)

all_sources = sorted(SOURCES.glob("*.jsonl")) + [NEW_FILE]
schema_map: dict[str, str] = {}
for p in all_sources:
    if not p.exists() or p.stat().st_size == 0:
        schema_map[p.name] = "EMPTY"; continue
    with p.open(encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            try:
                obj = json.loads(line)
                keys = frozenset(obj.keys())
                if "headword" in keys and "translations" in keys:
                    schema_map[p.name] = "dictionary"
                elif "headword" in keys and "translation" in keys:
                    schema_map[p.name] = "lexicon_entry"
                elif "query" in keys and "results" in keys:
                    schema_map[p.name] = "tongdot"
                elif "instruction" in keys and "output" in keys:
                    m = parse_meta(obj)
                    d = c(m.get("dialect", ""))
                    if "FCL" in d or "Hakha" in d or "Falam" in d:
                        schema_map[p.name] = "SKIP_FCL"
                    elif TR.search(c(obj.get("instruction", ""))):
                        schema_map[p.name] = "parallel"
                    else:
                        schema_map[p.name] = "instruction"
                elif "no" in keys and "lyrics" in keys:
                    schema_map[p.name] = "hymn"
                elif "text" in keys and "translation_en" in keys:
                    schema_map[p.name] = "bilingual"
                elif "text" in keys:
                    src = c(obj.get("source", ""))
                    if src in SKIP_SOURCES or c(obj.get("language","")) in {"zolai"} and src in SKIP_SOURCES:
                        schema_map[p.name] = "SKIP_NONSOURCE"
                    else:
                        schema_map[p.name] = "sentence"
                else:
                    schema_map[p.name] = f"unknown:{sorted(keys)}"
            except:
                schema_map[p.name] = "PARSE_ERROR"
            break

for name, schema in schema_map.items():
    p = SOURCES / name if (SOURCES / name).exists() else (NEW_FILE if name == NEW_FILE.name else None)
    if p is None: p = NEW_FILE
    mb = p.stat().st_size / 1024 / 1024 if p.exists() else 0
    flag = "⚠ SKIP" if schema.startswith("SKIP") else "✓"
    print(f"  {flag}  {name:<50} {mb:>7.1f}MB  → {schema}", flush=True)

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 1 — Load existing combined hashes
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("  PHASE 1 — Loading Combined Hashes  [Zomi Data Manager]")
print("="*70, flush=True)

seen: dict[str, set] = {"s": set(), "p": set(), "i": set(), "d": set()}
combined_counts: dict[str, int] = {}

for cat, fname, fn in [
    ("s", "sentences.jsonl",    lambda o: c(o.get("text", ""))),
    ("p", "parallel.jsonl",     lambda o: c(o.get("english", "")) + c(o.get("zolai", ""))),
    ("i", "instructions.jsonl", lambda o: c(o.get("instruction", "")) + c(o.get("output", ""))),
    ("d", "dictionary.jsonl",   lambda o: c(o.get("headword", "")).lower()),
]:
    fp = COMBINED / fname
    n = 0
    t0 = time.time()
    with fp.open(encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            line = line.strip()
            if not line: continue
            try:
                obj = json.loads(line); k = fn(obj)
                if k: seen[cat].add(md5(k)); n += 1
            except: pass
            if i % 1_000_000 == 0:
                sys.stdout.write(f"\r  {fname}: {i:,} loaded...  ")
                sys.stdout.flush()
    combined_counts[cat] = n
    print(f"  ✓ {fname:<30} {n:>10,} records  ({time.time()-t0:.1f}s)", flush=True)

print(f"\n  Total hashes: {sum(len(v) for v in seen.values()):,}", flush=True)

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2 — Process all sources + new file
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("  PHASE 2 — Processing All Sources  [Zomi Cleaner Bot]")
print("="*70, flush=True)

handles = {
    "s": open(COMBINED / "sentences.jsonl",    "a", encoding="utf-8"),
    "p": open(COMBINED / "parallel.jsonl",     "a", encoding="utf-8"),
    "i": open(COMBINED / "instructions.jsonl", "a", encoding="utf-8"),
    "d": open(COMBINED / "dictionary.jsonl",   "a", encoding="utf-8"),
}
total_added: dict[str, int] = {"s": 0, "p": 0, "i": 0, "d": 0}

def write(cat: str, obj: dict, key: str) -> bool:
    k = md5(key)
    if k in seen[cat]: return False
    seen[cat].add(k)
    handles[cat].write(json.dumps(obj, ensure_ascii=False) + "\n")
    total_added[cat] += 1
    return True

def process_file(src: Path, schema: str) -> dict[str, int]:
    added: dict[str, int] = {"s": 0, "p": 0, "i": 0, "d": 0}
    if schema.startswith("SKIP") or schema in ("EMPTY", "PARSE_ERROR", "unknown"):
        log("Zomi Cleaner Bot", f"SKIP {src.name} ({schema})")
        return added

    log("Zomi Cleaner Bot", f"Processing {src.name}  [{schema}]  {src.stat().st_size/1024/1024:.1f}MB")
    t0 = time.time()

    with src.open(encoding="utf-8", errors="replace") as f:
        for i, raw in enumerate(f, 1):
            raw = raw.strip()
            if not raw: continue
            try: obj = json.loads(raw)
            except: continue

            if schema == "sentence":
                src_name = c(obj.get("source") or obj.get("source_file") or src.name)
                if src_name in SKIP_SOURCES: continue
                t = c(obj.get("text", ""))
                if len(t) < 3: continue
                dialect = c(obj.get("dialect", "tedim")).lower() or "tedim"
                rec = {"text": t, "language": "zolai", "dialect": dialect,
                       "source": src_name, "topic": "general", "category": "sentence"}
                if write("s", rec, t): added["s"] += 1

            elif schema == "bilingual":
                t = c(obj.get("text", ""))
                en = c(obj.get("translation_en", ""))
                if t and en and en.lower() not in ("none", ""):
                    rec = {"zolai": t, "english": en, "dialect": "tedim",
                           "source": src.name, "reference": "", "category": "parallel"}
                    if write("p", rec, en + t): added["p"] += 1
                elif t and len(t) >= 3:
                    rec = {"text": t, "language": "zolai", "dialect": "tedim",
                           "source": src.name, "topic": c(obj.get("topic", "general")), "category": "sentence"}
                    if write("s", rec, t): added["s"] += 1

            elif schema == "parallel":
                ins = c(obj.get("instruction", ""))
                inp = c(obj.get("input", ""))
                out = c(obj.get("output", ""))
                if not (inp and out): continue
                m = parse_meta(obj)
                dialect = c(m.get("dialect", "tedim")).lower()
                if "fcl" in dialect or "hakha" in dialect or "falam" in dialect: continue
                rec = {"zolai": out, "english": inp, "dialect": dialect or "tedim",
                       "source": src.name, "reference": c(m.get("reference", "")), "category": "parallel"}
                if write("p", rec, inp + out): added["p"] += 1

            elif schema == "instruction":
                ins = c(obj.get("instruction", ""))
                inp = c(obj.get("input", ""))
                out = c(obj.get("output", ""))
                if not (ins and out): continue
                m = parse_meta(obj)
                rec = {"instruction": ins, "input": inp, "output": out,
                       "source": src.name, "domain": c(m.get("domain", "general")),
                       "dialect": "tedim", "category": "instruction"}
                if write("i", rec, ins + out): added["i"] += 1

            elif schema == "dictionary":
                hw = c(obj.get("headword", "")).lower()
                if not hw: continue
                trans = obj.get("translations", [])
                if isinstance(trans, str):
                    try: trans = ast.literal_eval(trans)
                    except: trans = [trans]
                pos = obj.get("pos", [])
                if isinstance(pos, str):
                    try: pos = ast.literal_eval(pos)
                    except: pos = [pos]
                expl = obj.get("explanations", obj.get("explanation", []))
                if isinstance(expl, str): expl = [expl] if expl else []
                srcs = obj.get("sources", [src.name])
                if isinstance(srcs, str):
                    try: srcs = ast.literal_eval(srcs)
                    except: srcs = [srcs]
                rec = {"headword": hw, "translations": trans, "pos": pos,
                       "explanations": expl, "sources": srcs, "category": "dictionary"}
                if write("d", rec, hw): added["d"] += 1

            elif schema == "lexicon_entry":
                hw = c(obj.get("headword", "")).lower()
                tr = c(obj.get("translation", ""))
                if not hw: continue
                rec = {"headword": hw, "translations": [tr] if tr else [],
                       "pos": [c(obj.get("pos", ""))], "explanations": [],
                       "sources": [src.name], "category": "dictionary"}
                if write("d", rec, hw): added["d"] += 1

            elif schema == "tongdot":
                if c(obj.get("found", "")) != "True": continue
                results = obj.get("results", [])
                if isinstance(results, str):
                    try: results = ast.literal_eval(results)
                    except: results = []
                for r in results:
                    if not isinstance(r, dict): continue
                    hw = c(r.get("headword", "")).lower()
                    if not hw: continue
                    tr = c(r.get("translation", ""))
                    rec = {"headword": hw, "translations": [tr] if tr else [],
                           "pos": [], "explanations": [], "sources": ["tongdot"], "category": "dictionary"}
                    if write("d", rec, hw): added["d"] += 1

            elif schema == "hymn":
                lyrics = c(obj.get("lyrics", ""))
                title  = c(obj.get("title", ""))
                if lyrics and len(lyrics) >= 10:
                    t = f"{title}\n{lyrics}" if title else lyrics
                    rec = {"text": t, "language": "zolai", "dialect": "tedim",
                           "source": "tedim_hymns", "topic": "religion", "category": "sentence"}
                    if write("s", rec, t): added["s"] += 1

            if i % 500_000 == 0:
                progress(src.name, i, added)

    elapsed = time.time() - t0
    summary = "  ".join(f"{k}+{v:,}" for k, v in added.items() if v)
    print(f"\r  ✓ {src.name:<50} ({elapsed:.0f}s)  added: {summary or 'none'}", flush=True)
    return added

# Process new file first
process_file(NEW_FILE, schema_map.get(NEW_FILE.name, "sentence"))

# Process all sources
for src in sorted(SOURCES.glob("*.jsonl")):
    schema = schema_map.get(src.name, "unknown")
    process_file(src, schema)

# Process archive files that had missed records (from previous check)
ARCHIVE_MISSED = [
    "all_sources_clean_v5.jsonl", "all_sources_combined_v4.jsonl",
    "zolai_complete.jsonl", "zolai_full.jsonl",
]
print("\n" + "="*70)
print("  PHASE 2b — Archive missed files  [Zomi Ops Monitor]")
print("="*70, flush=True)
for fname in ARCHIVE_MISSED:
    src = ARCHIVE / fname
    if src.exists() and src.stat().st_size > 0:
        process_file(src, "sentence")

for h in handles.values(): h.close()

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 3 — Verify all archive files
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("  PHASE 3 — Archive Double-Check  [Zomi Ops Monitor]")
print("="*70, flush=True)

grand_missed = 0
archive_files = sorted(f for f in ARCHIVE.iterdir() if f.suffix == ".jsonl")
log("Zomi Ops Monitor", f"Checking {len(archive_files)} archive files...")

for src in archive_files:
    if src.stat().st_size == 0:
        print(f"  [EMPTY]  {src.name}", flush=True); continue
    missed = {"s": 0, "p": 0, "i": 0, "d": 0}; total = 0
    t0 = time.time()
    with src.open(encoding="utf-8", errors="replace") as f:
        for i, raw in enumerate(f, 1):
            raw = raw.strip()
            if not raw: continue
            try: obj = json.loads(raw)
            except: continue
            total += 1; keys = set(obj.keys())
            if "headword" in keys:
                hw = c(obj.get("headword") or "").lower()
                if hw and md5(hw) not in seen["d"]: missed["d"] += 1
            elif "instruction" in keys and "output" in keys:
                ins = c(obj.get("instruction", "")); out = c(obj.get("output", ""))
                inp = c(obj.get("input", ""))
                m = parse_meta(obj)
                d = c(m.get("dialect", ""))
                if "fcl" in d.lower() or "hakha" in d.lower(): continue
                if ins and out:
                    if TR.search(ins) and inp:
                        if md5(inp + out) not in seen["p"]: missed["p"] += 1
                    else:
                        if md5(ins + out) not in seen["i"]: missed["i"] += 1
            elif "text" in keys:
                t = c(obj.get("text", ""))
                if len(t) >= 3 and md5(t) not in seen["s"]: missed["s"] += 1
            if i % 500_000 == 0:
                sys.stdout.write(f"\r  {src.name}: {i:,} scanned...  ")
                sys.stdout.flush()
    m = sum(missed.values()); grand_missed += m
    tag = "*** MISSED" if m else "OK       "
    extra = f"  → {missed}" if m else ""
    mb = src.stat().st_size // 1024 // 1024
    print(f"\r  [{tag}] {src.name:<50} {mb:>4}MB  {total:>10,} lines  ({time.time()-t0:.0f}s){extra}", flush=True)

# ─────────────────────────────────────────────────────────────────────────────
# FINAL REPORT
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("  FINAL REPORT  [Zomi Data Manager]")
print("="*70, flush=True)

labels = {"s": "sentences", "p": "parallel", "i": "instructions", "d": "dictionary"}
fnames = {"s": "sentences.jsonl", "p": "parallel.jsonl", "i": "instructions.jsonl", "d": "dictionary.jsonl"}
print("  COMBINED OUTPUTS (after update):", flush=True)
for cat in ("s", "p", "i", "d"):
    fp = COMBINED / fnames[cat]
    lines = sum(1 for _ in fp.open(encoding="utf-8"))
    mb = fp.stat().st_size / 1024 / 1024
    added = total_added[cat]
    prev = combined_counts[cat]
    print(f"    {labels[cat]:<14} {lines:>10,} records  {mb:>7.1f}MB  (+{added:,} new)", flush=True)

print(f"\n  ARCHIVE MISSED : {grand_missed:,}", flush=True)
print(f"  SOURCE FILES   : {len(list(SOURCES.glob('*.jsonl')))}", flush=True)
print("\n" + "="*70, flush=True)
if grand_missed == 0:
    print("  ✓ ALL CLEAR — archive fully covered. Safe to delete.", flush=True)
else:
    print(f"  ✗ {grand_missed:,} records still missed — check output above.", flush=True)
print("="*70 + "\n", flush=True)

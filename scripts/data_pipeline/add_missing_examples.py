#!/usr/bin/env python3
"""
Find best short example sentences for every word missing examples.
Sources (in priority order):
  1. Bible parallel files (ZO + EN aligned)
  2. corpus_unified_v1.jsonl (monolingual ZO only)
Picks shortest clear sentence (5-15 words) containing the word.
"""

import json, re, glob
from pathlib import Path
from collections import defaultdict

MASTER  = "data/dictionary/processed/dict_master_v1.jsonl"
CORPUS  = "data/corpus/corpus_unified_v1.jsonl"
BIBLE_DIRS = [
    "data/corpus/bible/markdown/Parallel_Corpus/TDB77",
    "data/corpus/bible/markdown/Parallel_Corpus/Tedim_Chin",
]

zo_pat  = re.compile(r'^(?:TDB77|Tedim2010|Tedim_Chin):\s*(.+)', re.I)
en_pat  = re.compile(r'^KJV:\s*(.+)', re.I)
ref_pat = re.compile(r'\*\*(\d+:\d+)\*\*')

def tokenize(text):
    return re.findall(r"[a-z']+", text.lower())

def score(sentence):
    """Lower = better. Prefer 5-12 word sentences."""
    n = len(sentence.split())
    if 5 <= n <= 12: return n
    if n < 5: return 100
    return n  # longer = worse

def load_missing_words():
    """Return set of words that need examples."""
    missing = set()
    for line in open(MASTER, encoding="utf-8"):
        e = json.loads(line)
        if not e.get("examples"):
            missing.add(e["zolai"].lower())
    print(f"Words needing examples: {len(missing)}")
    return missing

def scan_bible(missing):
    """Scan Bible parallel files for aligned ZO+EN examples."""
    examples = {}  # word → {zo, en, ref, source}

    seen_files = set()
    all_files = []
    for d in BIBLE_DIRS:
        for f in glob.glob(f"{d}/*_Parallel.md"):
            name = Path(f).name
            if name not in seen_files:
                seen_files.add(name)
                all_files.append(f)

    print(f"Scanning {len(all_files)} Bible files...")
    for fpath in all_files:
        book = re.sub(r'_(?:TDB77|Tedim_Chin)_Parallel$','', Path(fpath).stem)
        ref = zo = en = ""
        for raw in open(fpath, encoding="utf-8"):
            line = raw.strip()
            m = ref_pat.match(line)
            if m:
                if zo and en:
                    _try_add_bible(zo, en, f"{book} {ref}", examples, missing)
                ref = m.group(1); zo = en = ""
                continue
            m = zo_pat.match(line)
            if m and not zo: zo = m.group(1).strip(); continue
            m = en_pat.match(line)
            if m: en = m.group(1).strip()
        if zo and en:
            _try_add_bible(zo, en, f"{book} {ref}", examples, missing)

    print(f"  Bible examples found: {len(examples)}")
    return examples

def _try_add_bible(zo, en, ref, examples, missing):
    words = tokenize(zo)
    n = len(words)
    if n < 4 or n > 20: return
    for w in set(words):
        if len(w) < 3 or w not in missing: continue
        if w not in examples or score(zo) < score(examples[w]["zo"]):
            examples[w] = {"zo": zo, "en": en, "ref": ref, "source": "Parallel_Corpus"}

def scan_corpus(missing, already_found):
    """Scan monolingual corpus for ZO-only examples."""
    remaining = missing - set(already_found.keys())
    print(f"Scanning corpus for {len(remaining)} remaining words...")

    examples = {}
    checked = 0
    for line in open(CORPUS, encoding="utf-8"):
        try:
            rec = json.loads(line)
            zo = rec.get("text","").strip()
            if not zo: continue
            words = tokenize(zo)
            n = len(words)
            if n < 4 or n > 20: continue
            for w in set(words):
                if w not in remaining: continue
                if w not in examples or score(zo) < score(examples[w]["zo"]):
                    examples[w] = {"zo": zo, "en": "", "ref": "",
                                   "source": rec.get("source","corpus")}
            checked += 1
            if checked % 500000 == 0:
                print(f"  ...{checked//1000}k lines, {len(examples)} found")
            # Stop early if all found
            if len(examples) >= len(remaining):
                break
        except: pass

    print(f"  Corpus examples found: {len(examples)}")
    return examples

def apply_examples(bible_ex, corpus_ex):
    """Write enriched master dict."""
    all_new = {**corpus_ex, **bible_ex}  # bible wins over corpus
    updated = 0
    entries = []

    for line in open(MASTER, encoding="utf-8"):
        e = json.loads(line)
        word = e["zolai"].lower()
        if not e.get("examples") and word in all_new:
            e["examples"] = [all_new[word]]
            updated += 1
        entries.append(e)

    with open(MASTER, "w", encoding="utf-8") as f:
        for e in entries:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")

    print(f"Added examples to {updated} entries → {MASTER}")
    return updated

def main():
    import os
    os.chdir(Path(__file__).parent.parent.parent)

    missing   = load_missing_words()
    bible_ex  = scan_bible(missing)
    corpus_ex = scan_corpus(missing, bible_ex)
    apply_examples(bible_ex, corpus_ex)

    # Final stats
    entries = [json.loads(l) for l in open(MASTER)]
    total   = len(entries)
    has_ex  = sum(1 for e in entries if e.get("examples"))
    print(f"\nFinal: {has_ex}/{total} ({100*has_ex//total}%) have examples")

if __name__ == "__main__":
    main()

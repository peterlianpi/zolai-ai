#!/usr/bin/env python3
"""
Enrich dict_master_v1.jsonl by scanning all Bible parallel files:
- For each word, find its best example verse (shortest clear verse)
- Add context-derived translations (top EN glosses from all books)
- Add simple short example: shortest verse containing the word
"""

import json, re, glob
from pathlib import Path
from collections import defaultdict, Counter

BIBLE_DIRS = [
    "data/corpus/bible/markdown/Parallel_Corpus/TDB77",
    "data/corpus/bible/markdown/Parallel_Corpus/Tedim_Chin",
    "data/corpus/bible/markdown/Parallel",
]
MASTER    = "data/dictionary/processed/dict_master_v1.jsonl"
OUT       = "data/dictionary/processed/dict_master_v1.jsonl"

SKIP = {
    "in","a","hi","uh","leh","tawh","ah","kha","ta","pah","ciangin",
    "bangin","pen","na","ding","lai","hen","la","tua","te","i",
    "napi","hiam","un","ni","aw","ma","mah","ka","nang","amah",
}
EN_STOP = {
    "the","and","of","to","in","a","an","is","was","he","she","it",
    "his","her","they","them","their","that","this","for","with","not",
    "but","all","be","are","were","have","had","has","from","by","at",
    "on","or","so","as","him","we","you","i","my","thy","thee","shall",
    "will","said","unto","upon","which","who","then","when","also","now",
}

zo_pat  = re.compile(r'^(?:TDB77|Tedim2010|Tedim_Chin):\s*(.+)', re.I)
en_pat  = re.compile(r'^KJV:\s*(.+)', re.I)
ref_pat = re.compile(r'\*\*(\d+:\d+)\*\*')


def scan_bible():
    """
    For each Zolai word, collect:
      - en_counter: weighted EN co-occurrences across all books
      - best_example: shortest verse pair containing the word
    """
    en_counter  = defaultdict(Counter)
    best_example = {}  # word → {zo, en, ref}

    seen_files = set()
    all_files = []
    for d in BIBLE_DIRS:
        for f in glob.glob(f"{d}/*_Parallel.md"):
            name = Path(f).name
            if name not in seen_files:
                seen_files.add(name)
                all_files.append(f)
    print(f"Scanning {len(all_files)} unique Bible files...")

    for fpath in all_files:
        book = Path(fpath).stem.replace("_TDB77_Parallel","")
        ref = zo = en = ""
        for raw in open(fpath, encoding="utf-8"):
            line = raw.strip()
            m = ref_pat.match(line)
            if m:
                if zo and en:
                    process_verse(zo, en, f"{book} {ref}", en_counter, best_example)
                ref = m.group(1); zo = en = ""
                continue
            m = zo_pat.match(line)
            if m and not zo: zo = m.group(1).strip(); continue
            m = en_pat.match(line)
            if m: en = m.group(1).strip()
        if zo and en:
            process_verse(zo, en, f"{book} {ref}", en_counter, best_example)

    return en_counter, best_example


def process_verse(zo_verse, en_verse, ref, en_counter, best_example):
    zo_tokens = re.findall(r"[a-z']+", zo_verse.lower())
    en_tokens = [t for t in re.findall(r"[a-z]+", en_verse.lower())
                 if t not in EN_STOP and len(t) > 2]

    zo_len = len(zo_tokens)
    en_len = len(en_tokens)

    for i, zo in enumerate(zo_tokens):
        if len(zo) < 3 or zo in SKIP: continue

        # Positional weighted EN co-occurrence
        zo_norm = i / max(zo_len, 1)
        for j, en in enumerate(en_tokens):
            en_norm = j / max(en_len, 1)
            dist = abs(zo_norm - en_norm)
            weight = max(1, int(3 * (1 - dist)))
            en_counter[zo][en] += weight

        # Best example = shortest clear verse (5–15 Zolai words)
        if 5 <= zo_len <= 15:
            if zo not in best_example or zo_len < len(re.findall(r"[a-z']+",
                                                      best_example[zo]["zo"].lower())):
                best_example[zo] = {"zo": zo_verse, "en": en_verse, "ref": ref,
                                    "source": "Parallel_Corpus"}


def enrich_master(en_counter, best_example):
    print("Enriching master dictionary...")
    enriched = 0
    entries = []

    for line in open(MASTER, encoding="utf-8"):
        e = json.loads(line)
        word = e.get("zolai","").lower()

        # Add/update translations from Bible context
        if word in en_counter:
            bible_trans = [w for w, _ in en_counter[word].most_common(8)
                           if w not in EN_STOP and len(w) > 2]
            existing = e.get("translations", [])
            # Merge: keep existing first, add new ones not already present
            merged = existing[:]
            for t in bible_trans:
                if t not in merged:
                    merged.append(t)
            e["translations"] = merged[:10]
            if not e.get("english") and merged:
                e["english"] = merged[0]

        # Add example if missing or add a short Bible example
        if word in best_example:
            ex = best_example[word]
            existing_examples = e.get("examples", [])
            # Check if this example is already there
            already = any(x.get("zo","") == ex["zo"] for x in existing_examples)
            if not already:
                # Prepend short Bible example
                e["examples"] = [ex] + existing_examples[:2]
                enriched += 1

        entries.append(e)

    print(f"  Added/updated examples for {enriched} entries")
    return entries


def main():
    import os
    os.chdir(Path(__file__).parent.parent.parent)

    en_counter, best_example = scan_bible()
    print(f"  Words with Bible context: {len(en_counter)}")
    print(f"  Words with best example:  {len(best_example)}")

    entries = enrich_master(en_counter, best_example)

    with open(OUT, "w", encoding="utf-8") as f:
        for e in entries:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")
    print(f"Saved {len(entries)} entries → {OUT}")


if __name__ == "__main__":
    main()

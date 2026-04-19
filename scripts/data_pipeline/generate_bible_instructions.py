#!/usr/bin/env python3
"""
Generate instruction pairs from all 3 Bible parallel JSONL files.
Uses "X panin Y ah let in:" format (ZVS natural Zolai).
Sources: Tedim2010 (ZVS), TDB77, TBR17
"""
import json
from pathlib import Path
from collections import defaultdict

SOURCES = [
    ("data/parallel/bible_parallel_tedim2010_kjv.jsonl", "Tedim2010"),
    ("data/parallel/bible_parallel_tdb77_kjv.jsonl",     "TDB77"),
    ("data/parallel/bible_parallel_tbr17_kjv.jsonl",     "TBR17"),
]

# Missing books — extract directly from markdown parallel files
MISSING = {
    "Tedim2010": [("SNG", "data/corpus/bible/markdown/Parallel_Corpus/Tedim_Chin/SNG_Tedim_Chin_Parallel.md")],
    "TDB77":     [("SNG", "data/corpus/bible/markdown/Parallel_Corpus/TDB77/SNG_TDB77_Parallel.md")],
    "TBR17":     [("NAH", "data/corpus/bible/markdown/Parallel/Nahum_Parallel.md")],
}

import re

def parse_markdown_pairs(path, book):
    """Extract (zo, en, ref) from a parallel markdown file."""
    ref_pat = re.compile(r'\*\*(\d+:\d+)\*\*')
    zo_pat  = re.compile(r'^(?:TDB77|Tedim2010|Tedim_Chin|HCL06|FCL):\s*(.+)', re.I)
    en_pat  = re.compile(r'^KJV:\s*(.+)', re.I)
    ref = zo = en = ""
    pairs = []
    for raw in open(path, encoding="utf-8"):
        line = raw.strip()
        m = ref_pat.match(line)
        if m:
            if zo and en: pairs.append((zo, en, f"{book}.{ref}"))
            ref = m.group(1); zo = en = ""
            continue
        m = zo_pat.match(line)
        if m and not zo: zo = m.group(1).strip(); continue
        m = en_pat.match(line)
        if m: en = m.group(1).strip()
    if zo and en: pairs.append((zo, en, f"{book}.{ref}"))
    return pairs
OUT = Path("data/training/instructions_bible_v1.jsonl")

def main():
    seen = set()  # deduplicate by (zo, en)
    instructions = []

    for fpath, version in SOURCES:
        count = 0
        for line in open(fpath, encoding="utf-8"):
            try:
                rec = json.loads(line)
                en = (rec.get("input") or "").strip()
                zo = (rec.get("output") or "").strip()
                ref = rec.get("metadata", {}).get("reference", "")

                if not en or not zo or len(en) < 5 or len(zo) < 5:
                    continue
                key = (zo.lower(), en.lower())
                if key in seen:
                    continue
                seen.add(key)

                instructions += [
                    # English instructions
                    {"instruction": f"Translate from Zolai to English: {zo}",
                     "output": en, "source": ref, "version": version,
                     "category": "translation_zo_en"},
                    {"instruction": f"Translate from English to Zolai: {en}",
                     "output": zo, "source": ref, "version": version,
                     "category": "translation_en_zo"},
                    # Zolai instructions
                    {"instruction": f"Zolai panin English ah let in: {zo}",
                     "output": en, "source": ref, "version": version,
                     "category": "translation_zo_en"},
                    {"instruction": f"English panin Zolai ah let in: {en}",
                     "output": zo, "source": ref, "version": version,
                     "category": "translation_en_zo"},
                ]
                count += 1
            except: pass
        print(f"  {version}: {count} pairs")

    # Add missing books from markdown
    for version, book_files in MISSING.items():
        for book, path in book_files:
            if not Path(path).exists():
                print(f"  {version} {book}: file not found")
                continue
            pairs = parse_markdown_pairs(path, book)
            added = 0
            for zo, en, ref in pairs:
                if len(en) < 5 or len(zo) < 5: continue
                key = (zo.lower(), en.lower())
                if key in seen: continue
                seen.add(key)
                instructions += [
                    {"instruction": f"Translate from Zolai to English: {zo}",
                     "output": en, "source": ref, "version": version, "category": "translation_zo_en"},
                    {"instruction": f"Translate from English to Zolai: {en}",
                     "output": zo, "source": ref, "version": version, "category": "translation_en_zo"},
                    {"instruction": f"Zolai panin English ah let in: {zo}",
                     "output": en, "source": ref, "version": version, "category": "translation_zo_en"},
                    {"instruction": f"English panin Zolai ah let in: {en}",
                     "output": zo, "source": ref, "version": version, "category": "translation_en_zo"},
                ]
                added += 1
            print(f"  {version} {book} (missing): +{added} pairs")

    with open(OUT, "w", encoding="utf-8") as f:
        for inst in instructions:
            f.write(json.dumps(inst, ensure_ascii=False) + "\n")

    print(f"\nTotal: {len(instructions)} instruction pairs → {OUT}")

if __name__ == "__main__":
    import os
    os.chdir(Path(__file__).parent.parent.parent)
    main()

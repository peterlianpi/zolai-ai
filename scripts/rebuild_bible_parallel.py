"""
Rebuild data/master/combined/parallel.jsonl from all 4 fixed Bible versions + KJV.
Adds TDB_online, TB77_online, TBR17, Tedim2010 × KJV pairs.
Preserves existing non-Bible pairs (wiki, synthetic, etc.).
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT     = Path(__file__).parent.parent
SOURCES  = ROOT / "data/master/sources"
COMBINED = ROOT / "data/master/combined"
KJV_DIR  = ROOT / "resources/Chin-Bible/King James Version/USX_1"

FORBIDDEN = re.compile(r"\b(pathian|bawipa|siangpahrang)\b|(?<!\w)(cu\b|cun\b)", re.I)
BIBLE_SOURCES = {"TDB_online", "TB77_online", "TBR17", "Tedim2010",
                 "bible_TBR17_KJV", "bible_TDB77_KJV", "bible_Tedim_Chin_Bible_KJV",
                 "bible_parallel_tdb77.jsonl", "bible_parallel_tedim2010.jsonl",
                 "Parallel_Corpus"}

def md5(s: str) -> str:
    return hashlib.md5(s.encode()).hexdigest()

def c(v: object) -> str:
    return re.sub(r"\s+", " ", str(v or "")).strip()

def parse_kjv(usx_dir: Path) -> dict[str, str]:
    verses: dict[str, str] = {}
    for usx_file in sorted(usx_dir.glob("*.usx")):
        book = usx_file.stem
        try:
            root = ET.parse(usx_file).getroot()
        except Exception:
            continue
        ch = "0"
        for elem in root.iter():
            if elem.tag == "chapter":
                ch = elem.get("number", ch).rstrip("#")
            elif elem.tag == "para":
                v = None
                for child in elem:
                    if child.tag == "chapter":
                        ch = child.get("number", ch).rstrip("#")
                    elif child.tag == "verse":
                        v = child.get("number", "").rstrip("#")
                        if v:
                            verses[f"{book}.{ch}:{v}"] = c(child.tail or "")
                    elif child.tag != "note" and v:
                        key = f"{book}.{ch}:{v}"
                        if child.text:
                            verses[key] = c(verses.get(key, "") + " " + child.text)
                        if child.tail:
                            verses[key] = c(verses.get(key, "") + " " + child.tail)
    return verses


def main() -> int:
    out = COMBINED / "parallel.jsonl"

    # Load KJV
    print("Loading KJV...", flush=True)
    kjv = parse_kjv(KJV_DIR)
    # Normalize NAM → NAH in KJV refs
    kjv = {("NAH" + k[3:] if k.startswith("NAM.") else k): v for k, v in kjv.items()}
    print(f"  KJV: {len(kjv):,} verses", flush=True)

    # Load existing non-Bible pairs to preserve
    existing_non_bible: list[dict] = []
    seen: set[str] = set()
    if out.exists():
        with out.open(encoding="utf-8") as f:
            for line in f:
                obj = json.loads(line)
                src = obj.get("source", "")
                if src not in BIBLE_SOURCES:
                    existing_non_bible.append(obj)
    print(f"  Preserving {len(existing_non_bible)} non-Bible pairs", flush=True)

    # Load all 4 Zolai Bible versions
    bible_files = [
        (SOURCES / "bible_tdb_online.jsonl",  "TDB_KJV"),
        (SOURCES / "bible_tb77_online.jsonl", "TB77_KJV"),
        (SOURCES / "bible_tbr17.jsonl",        "TBR17_KJV"),
        (SOURCES / "bible_tedim2010.jsonl",    "T2010_KJV"),
    ]

    pairs: list[dict] = []
    for path, pair_src in bible_files:
        added = 0
        with path.open(encoding="utf-8") as f:
            for line in f:
                obj = json.loads(line)
                zo = c(obj.get("text", ""))
                ref = obj.get("reference", "")
                if not zo or len(zo) < 5:
                    continue
                if FORBIDDEN.search(zo):
                    continue
                en = c(kjv.get(ref, ""))
                if not en or len(en) < 10:
                    continue
                k = md5(ref + zo)
                if k in seen:
                    continue
                seen.add(k)
                pairs.append({
                    "zolai": zo,
                    "english": en,
                    "dialect": "tedim",
                    "source": pair_src,
                    "reference": ref,
                    "category": "parallel",
                })
                added += 1
        print(f"  {pair_src}: {added:,} pairs", flush=True)

    # Write output
    all_pairs = existing_non_bible + pairs
    with out.open("w", encoding="utf-8") as f:
        for p in all_pairs:
            f.write(json.dumps(p, ensure_ascii=False) + "\n")

    print(f"\nTotal parallel pairs: {len(all_pairs):,} → {out}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

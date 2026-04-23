#!/usr/bin/env python3
"""Rebuild parallel JSONL datasets from Cleaned_Bible/Parallel/ (TDB77 + Tedim2010 + KJV).

Produces:
  data/master/sources/bible_parallel_tdb77.jsonl     — TDB77 translation pairs
  data/master/sources/bible_parallel_tedim2010.jsonl — Tedim2010 (ZVS) translation pairs
  data/master/sources/zolai_parallel_master.jsonl    — combined (replaces old)
  data/master/combined/parallel.jsonl                — instruction-tuned format (replaces old)
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
PARALLEL_DIR = ROOT / "Cleaned_Bible/Parallel"
SOURCES_DIR = ROOT / "data/master/sources"
COMBINED_DIR = ROOT / "data/master/combined"

# Regex to parse the parallel .md format
RE_VERSE = re.compile(
    r"\*\*(\d+):(\d+)\*\*\s*\n"
    r"TDB77:\s*(.+?)\n"
    r"Tedim2010:\s*(.+?)\n"
    r"KJV:\s*(.+?)(?=\n\n|\Z)",
    re.DOTALL,
)


def parse_parallel_md(path: Path) -> list[dict]:
    """Parse one *_Parallel.md → list of verse dicts."""
    book = path.stem.replace("_Parallel", "")
    text = path.read_text(encoding="utf-8")
    verses = []
    for m in RE_VERSE.finditer(text):
        ch, v, tdb77, tedim2010, kjv = (
            int(m.group(1)), int(m.group(2)),
            m.group(3).strip(), m.group(4).strip(), m.group(5).strip(),
        )
        if tdb77 == "[Missing]" and tedim2010 == "[Missing]":
            continue
        verses.append({
            "book": book, "chapter": ch, "verse": v,
            "tdb77": tdb77, "tedim2010": tedim2010, "kjv": kjv,
        })
    return verses


def make_instruction(zolai: str, english: str, version: str, ref: str) -> dict:
    return {
        "instruction": "Translate this text from English to Tedim Chin.",
        "input": english,
        "output": zolai,
        "metadata": {"dialect": "Tedim_Chin", "version": version, "reference": ref, "source": "Parallel_Corpus"},
    }


def write_jsonl(path: Path, records: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def main() -> int:
    md_files = sorted(PARALLEL_DIR.glob("*_Parallel.md"))
    if not md_files:
        print(f"No parallel files found in {PARALLEL_DIR}", file=sys.stderr)
        return 1

    tdb77_rows, tedim_rows, master_rows = [], [], []

    for md in md_files:
        verses = parse_parallel_md(md)
        for v in verses:
            ref = f"{v['book']} {v['chapter']}:{v['verse']}"
            if v["tdb77"] != "[Missing]" and v["kjv"] != "[Missing]":
                row = make_instruction(v["tdb77"], v["kjv"], "TDB77", ref)
                tdb77_rows.append(row)
                master_rows.append(row)
            if v["tedim2010"] != "[Missing]" and v["kjv"] != "[Missing]":
                row = make_instruction(v["tedim2010"], v["kjv"], "Tedim2010", ref)
                tedim_rows.append(row)
                master_rows.append(row)

    write_jsonl(SOURCES_DIR / "bible_parallel_tdb77.jsonl", tdb77_rows)
    write_jsonl(SOURCES_DIR / "bible_parallel_tedim2010.jsonl", tedim_rows)
    write_jsonl(SOURCES_DIR / "zolai_parallel_master.jsonl", master_rows)

    # combined/parallel.jsonl: master + non-bible rows from old file (chat, synthetic)
    old_parallel = COMBINED_DIR / "parallel.jsonl"
    extra_rows = []
    if old_parallel.exists():
        with open(old_parallel, encoding="utf-8") as f:
            for line in f:
                d = json.loads(line)
                src = d.get("metadata", {}).get("source", "")
                if src != "Parallel_Corpus":
                    extra_rows.append(d)

    write_jsonl(COMBINED_DIR / "parallel.jsonl", master_rows + extra_rows)

    print(f"TDB77:      {len(tdb77_rows):>8,} → bible_parallel_tdb77.jsonl")
    print(f"Tedim2010:  {len(tedim_rows):>8,} → bible_parallel_tedim2010.jsonl")
    print(f"Master:     {len(master_rows):>8,} → zolai_parallel_master.jsonl")
    print(f"Combined:   {len(master_rows)+len(extra_rows):>8,} → combined/parallel.jsonl")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

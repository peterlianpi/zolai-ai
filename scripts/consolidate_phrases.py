#!/usr/bin/env python3
"""Consolidate extracted phrases into master dictionary."""
from __future__ import annotations
import json, re
from pathlib import Path
from collections import defaultdict
from dataclasses import dataclass

WIKI_VOCAB = Path(str(Path(__file__).resolve().parents[1]) + "/wiki/vocabulary")
MASTER_DICT = Path(str(Path(__file__).resolve().parents[1]) + "/data/master/combined/dictionary.jsonl")
OUTPUT = Path(str(Path(__file__).resolve().parents[1]) + "/data/master/combined/phrases_consolidated.jsonl")

@dataclass
class Entry:
    zo: str
    en: str
    type: str  # phrase, compound, pattern, proverb
    source: str
    note: str = ""
    parts: str = ""
    example: str = ""

def parse_table_row(line: str) -> dict | None:
    """Parse markdown table row."""
    if not line.strip().startswith("|") or line.count("|") < 3:
        return None
    parts = [p.strip() for p in line.split("|")[1:-1]]
    if len(parts) < 2 or parts[0] in ("Zolai", "Word", "---"):
        return None
    return {k: v for k, v in zip(["col1", "col2", "col3"], parts) if v}

def extract_from_file(path: Path) -> list[Entry]:
    """Extract all entries from a phrase file."""
    entries = []
    lines = path.read_text(encoding="utf-8").splitlines()
    source = lines[0].replace("# Phrases & Patterns from: ", "").strip() if lines else path.stem
    
    current_section = None
    for line in lines:
        if line.startswith("## "):
            current_section = line[3:].strip().lower()
            continue
        
        if line.startswith("- `") and "pattern" in (current_section or ""):
            # Pattern: - `pattern` = translation
            m = re.match(r'-\s*`([^`]+)`\s*=\s*(.+)', line)
            if m:
                pattern, translation = m.groups()
                entries.append(Entry(zo=pattern, en=translation, type="pattern", source=source))
            continue
        
        if line.strip().startswith("- e.g."):
            # Example for previous pattern
            if entries and entries[-1].type == "pattern":
                entries[-1].example = line.replace("- e.g.", "").strip().strip("`")
            continue
        
        row = parse_table_row(line)
        if not row:
            continue
        
        if "phrase" in (current_section or ""):
            entries.append(Entry(
                zo=row.get("col1", ""),
                en=row.get("col2", ""),
                note=row.get("col3", ""),
                type="phrase",
                source=source
            ))
        elif "compound" in (current_section or ""):
            entries.append(Entry(
                zo=row.get("col1", ""),
                parts=row.get("col2", ""),
                en=row.get("col3", ""),
                type="compound",
                source=source
            ))
        elif "proverb" in (current_section or ""):
            entries.append(Entry(
                zo=row.get("col1", ""),
                en=row.get("col2", ""),
                type="proverb",
                source=source
            ))
    
    return entries

def normalize(text: str) -> str:
    """Normalize for deduplication."""
    return re.sub(r'\s+', ' ', text.lower().strip())

def to_jsonl(entry: Entry) -> dict:
    """Convert to JSONL format."""
    obj = {
        "zo": entry.zo,
        "en": entry.en,
        "type": entry.type,
        "source": entry.source,
    }
    if entry.note:
        obj["note"] = entry.note
    if entry.parts:
        obj["parts"] = entry.parts
    if entry.example:
        obj["example"] = entry.example
    return obj

def main():
    print("=" * 70)
    print("CONSOLIDATING EXTRACTED PHRASES")
    print("=" * 70)
    
    phrase_files = sorted(WIKI_VOCAB.glob("*phrases*.md"))
    print(f"\n[1/4] Found {len(phrase_files)} phrase files")
    
    all_entries = []
    stats = defaultdict(int)
    
    for f in phrase_files:
        entries = extract_from_file(f)
        all_entries.extend(entries)
        for e in entries:
            stats[e.type] += 1
        print(f"  ✓ {f.name}: {len(entries)} entries")
    
    print(f"\n[2/4] Extracted {len(all_entries)} total entries")
    print(f"  Phrases:   {stats['phrase']}")
    print(f"  Compounds: {stats['compound']}")
    print(f"  Patterns:  {stats['pattern']}")
    print(f"  Proverbs:  {stats['proverb']}")
    
    # Deduplicate
    seen = {}
    unique = []
    for e in all_entries:
        key = (normalize(e.zo), e.type)
        if key not in seen:
            seen[key] = e
            unique.append(e)
        else:
            # Merge notes/sources
            existing = seen[key]
            if e.note and e.note not in existing.note:
                existing.note = f"{existing.note}; {e.note}".strip("; ")
            if e.source not in existing.source:
                existing.source = f"{existing.source}, {e.source}"
    
    print(f"\n[3/4] Deduplicated: {len(unique)} unique entries ({len(all_entries) - len(unique)} duplicates removed)")
    
    # Write output
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        for e in unique:
            f.write(json.dumps(to_jsonl(e), ensure_ascii=False) + "\n")
    
    size_kb = OUTPUT.stat().st_size / 1024
    print(f"\n[4/4] Saved to: {OUTPUT}")
    print(f"  Size: {size_kb:.1f} KB")
    
    # Check if master dictionary exists
    if MASTER_DICT.exists():
        master_count = sum(1 for _ in open(MASTER_DICT))
        print(f"\n📚 Master dictionary: {master_count:,} entries")
        print(f"   New phrases add: {len(unique):,} entries")
        print(f"\n   To merge: cat {OUTPUT} >> {MASTER_DICT}")
    
    print("\n" + "=" * 70)
    print("CONSOLIDATION COMPLETE")
    print("=" * 70)

if __name__ == "__main__":
    raise SystemExit(main())

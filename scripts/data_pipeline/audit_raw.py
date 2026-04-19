#!/usr/bin/env python3
"""Simple audit of raw folder - find duplicates and cleanup."""

from collections import defaultdict
from pathlib import Path

PROJECT_ROOT = Path("/path/to/zolai/Documents/Projects/zo_tdm")
RAW = PROJECT_ROOT / "raw"


def audit():
    """Audit raw folder."""
    print("=" * 60)
    print("RAW FOLDER AUDIT")
    print("=" * 60)

    # 1. List all folders
    print("\n1. FOLDERS:")
    folders = []
    for d in sorted(RAW.iterdir()):
        if d.is_dir():
            size = sum(f.stat().st_size for f in d.rglob("*.jsonl") if f.is_file()) / 1024 / 1024
            count = len(list(d.rglob("*.jsonl")))
            folders.append((d.name, size, count))

    for name, size, count in folders:
        print(f"   {name}: {size:.1f}MB ({count} files)")

    # 2. Files with same name in different folders
    print("\n2. DUPLICATE FILENAMES:")
    by_name = defaultdict(list)
    for f in RAW.rglob("*.jsonl"):
        by_name[f.name].append(f)

    duplicates = [(n, fl) for n, fl in by_name.items() if len(fl) > 1]
    print(f"   {len(duplicates)} files with duplicates")

    # Show top duplicates
    for name, files in sorted(duplicates)[:15]:
        paths = [str(f.parent.name) + "/" for f in files]
        print(f"   {name}: {paths}")

    # 3. Similar/big folders likely redundant
    print("\n3. POSSIBLE REDUNDANT FOLDERS:")

    likely_redundant = [
        ("raw/Zo_Tdm Cleaned", "Duplicates likely in V9"),
        ("raw/bible", "Duplicates likely in bibles"),
        ("raw/training", "Duplicates likely in Zo_Tdm Cleaned"),
    ]

    for folder, reason in likely_redundant:
        p = RAW / folder
        if p.exists():
            files = len(list(p.rglob("*.jsonl")))
            print(f"   {folder}: {reason} ({files} files)")

    # 4. Cleanup recommendations
    print("\n4. CLEANUP RECOMMENDATIONS:")

    recs = [
        ("Delete raw/Zo_Tdm Cleaned (use V9)", "Duplicate of V9"),
        ("Delete raw/bible (use bibles)", "Duplicate"),
        ("Delete raw/training (use data/training)", "Duplicated in data/"),
    ]

    for action, why in recs:
        print(f"   [ ] {action} - {why}")

    print("\n" + "=" * 60)

    return {"folders": len(folders), "duplicates": len(duplicates)}


if __name__ == "__main__":
    audit()

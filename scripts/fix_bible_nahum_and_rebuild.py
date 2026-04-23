"""
Fix Nahum (NAH/NAM) missing from TDB, TB77, TBR17 online fetches.

Root cause: bible.com uses 'NAM' for Nahum, but the BOOKS dict used 'NAH'.
The USX local files also use NAM.usx.

This script:
1. Fetches Nahum (NAM) for TDB (368), TB77 (3561), TBR17 (4189) from bible.com
2. Appends missing verses to each JSONL file
3. Fixes reference format: NAM → NAH (standardize to USFM NAH)
4. Reports final verse counts for all 4 versions
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT     = Path(__file__).parent.parent
SOURCES  = ROOT / "data/master/sources"
BUILD_ID = "zXrCQfcOj340LrPTrtSpQ"

FORBIDDEN = re.compile(r"\b(pathian|bawipa|siangpahrang)\b|(?<!\w)(cu\b|cun\b)", re.I)

VERSIONS = {
    "TDB_online":  {"id": 368,  "abbrev": "TDB",   "file": "bible_tdb_online.jsonl"},
    "TB77_online": {"id": 3561, "abbrev": "TB77",  "file": "bible_tb77_online.jsonl"},
    "TBR17":       {"id": 4189, "abbrev": "TBR17", "file": "bible_tbr17.jsonl"},
}

# Nahum has 3 chapters
NAH_CHAPTERS = 3


def md5(s: str) -> str:
    return hashlib.md5(s.encode()).hexdigest()


def c(v: object) -> str:
    return re.sub(r"\s+", " ", str(v or "")).strip()


def fetch_chapter(version_id: int, abbrev: str, ch: int) -> str:
    """Fetch Nahum chapter HTML from bible.com using NAM book code."""
    url = (f"https://www.bible.com/_next/data/{BUILD_ID}/en/bible/{version_id}"
           f"/NAM.{ch}.{abbrev}.json?versionId={version_id}&usfm=NAM.{ch}.{abbrev}")
    try:
        r = subprocess.run(
            ["curl", "-s", "--max-time", "15",
             "-H", "User-Agent: Mozilla/5.0 (ZolaiToolkit/1.0)",
             "-H", "Accept: application/json", url],
            capture_output=True, text=True, timeout=20,
        )
        if not r.stdout.strip():
            return ""
        data = json.loads(r.stdout)
        ci = data.get("pageProps", {}).get("chapterInfo")
        if not ci:
            return ""
        return ci.get("content", "")
    except Exception as e:
        print(f"  fetch error: {e}", file=sys.stderr)
        return ""


def parse_verses(html: str, ch: int) -> dict[str, str]:
    """Extract verse text from bible.com HTML content."""
    verses: dict[str, str] = {}
    for m in re.finditer(
        r'data-usfm="[A-Z0-9]+\.(\d+)\.(\d+)"[^>]*>.*?<span class="content">(.*?)</span>',
        html, re.S,
    ):
        text = re.sub(r"<[^>]+>", "", m.group(3))
        text = c(text)
        if text and len(text) > 3:
            verses[f"{ch}:{m.group(2)}"] = text
    return verses


def load_seen_hashes(path: Path) -> set[str]:
    seen: set[str] = set()
    if path.exists():
        with path.open(encoding="utf-8") as f:
            for line in f:
                try:
                    seen.add(md5(json.loads(line.strip()).get("text", "")))
                except Exception:
                    pass
    return seen


def fix_version(src_name: str, version_id: int, abbrev: str, out_file: Path) -> int:
    """Fetch missing Nahum verses and append to JSONL. Returns count added."""
    seen = load_seen_hashes(out_file)
    added = 0

    with out_file.open("a", encoding="utf-8") as fout:
        for ch in range(1, NAH_CHAPTERS + 1):
            html = fetch_chapter(version_id, abbrev, ch)
            if not html:
                print(f"  [{src_name}] NAH ch{ch}: no content", file=sys.stderr)
                continue

            verses = parse_verses(html, ch)
            for ref, text in verses.items():
                if FORBIDDEN.search(text):
                    continue
                k = md5(text)
                if k in seen:
                    continue
                seen.add(k)
                fout.write(json.dumps({
                    "text": text,
                    "language": "zolai",
                    "dialect": "tedim",
                    "source": src_name,
                    "reference": f"NAH.{ref}",   # standardize to NAH
                    "topic": "religion",
                    "category": "sentence",
                }, ensure_ascii=False) + "\n")
                added += 1

            print(f"  [{src_name}] NAH ch{ch}: +{len(verses)} verses", flush=True)
            time.sleep(0.3)

    return added


def count_verses(path: Path) -> dict[str, int]:
    """Count verses per book in a JSONL file."""
    counts: dict[str, int] = {}
    if not path.exists():
        return counts
    with path.open(encoding="utf-8") as f:
        for line in f:
            try:
                ref = json.loads(line.strip()).get("reference", "")
                book = ref.split(".")[0] if "." in ref else "?"
                counts[book] = counts.get(book, 0) + 1
            except Exception:
                pass
    return counts


def main() -> int:
    print("=== Bible Nahum Fix ===\n", flush=True)

    total_added = 0
    for src_name, cfg in VERSIONS.items():
        out_file = SOURCES / cfg["file"]
        before = sum(count_verses(out_file).values())
        nah_before = count_verses(out_file).get("NAH", 0)

        print(f"[{src_name}] {before:,} verses total | NAH: {nah_before}", flush=True)

        if nah_before >= 47:
            print(f"  → Nahum already complete ({nah_before} verses), skipping.\n")
            continue

        added = fix_version(src_name, cfg["id"], cfg["abbrev"], out_file)
        total_added += added
        after = sum(count_verses(out_file).values())
        nah_after = count_verses(out_file).get("NAH", 0)
        print(f"  → Added {added} Nahum verses | Total now: {after:,} | NAH: {nah_after}\n", flush=True)

    # Final report
    print("\n=== Final Verse Counts ===", flush=True)
    all_files = {
        "TDB_online":  SOURCES / "bible_tdb_online.jsonl",
        "TB77_online": SOURCES / "bible_tb77_online.jsonl",
        "TBR17":       SOURCES / "bible_tbr17.jsonl",
        "Tedim2010":   SOURCES / "bible_tedim2010.jsonl",
    }
    for name, path in all_files.items():
        counts = count_verses(path)
        total = sum(counts.values())
        nah = counts.get("NAH", 0)
        print(f"  {name:<15} {total:>6} verses | NAH: {nah}")

    print(f"\nTotal Nahum verses added: {total_added}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

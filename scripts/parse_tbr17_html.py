"""
Parse TBR17 verse text from bible.com HTML (already fetched).
Usage: pass raw HTML text via stdin or file.
"""
from __future__ import annotations

import re
import sys


def parse_tbr17_html(html: str, book: str, chapter: int) -> dict[str, str]:
    """Extract verse text from bible.com HTML for TBR17."""
    verses: dict[str, str] = {}

    # Remove footnote markers like #2Kor 4:6
    html = re.sub(r'#[A-Z][a-zA-Z0-9\s:;,\.]+(?=\s*\d|\s*[A-Z\u1000]|$)', '', html)

    # Find the main chapter text block — between chapter heading and "Currently Selected"
    main = re.search(r'# PIANCILNA \d+\s*\n(.*?)Currently Selected:', html, re.S | re.I)
    if not main:
        main = re.search(r'TBR17\s*\n.*?# PIANCILNA \d+\s*\n(.*?)Currently Selected:', html, re.S | re.I)
    if not main:
        return verses

    text = main.group(1)
    # Remove section headings (lines that are all caps or title case without verse numbers)
    text = re.sub(r'\n[A-Z][A-Za-z\s]+\n', '\n', text)

    # Extract verses: number followed by text
    # Pattern: digit(s) at start or after newline, followed by Zolai text
    verse_pattern = re.finditer(r'(?:^|\n)(\d+)([A-Z\u1000-\u109F\u02BC\u2018\u2019\u201C\u201D][^\n\d]{5,}?)(?=\n\d+|\n*$)', text, re.M)

    for m in verse_pattern:
        vnum = m.group(1)
        vtext = re.sub(r'\s+', ' ', m.group(2)).strip()
        # Clean footnote refs
        vtext = re.sub(r'#[A-Z][a-zA-Z0-9\s:;,\.]+$', '', vtext).strip()
        if vtext and len(vtext) > 3:
            verses[f"{chapter}:{vnum}"] = vtext

    # Also handle combined verses like "17-18"
    combined = re.finditer(r'(\d+)-(\d+)([A-Z\u1000-\u109F][^\n\d]{5,}?)(?=\n\d+|\n*$)', text, re.M)
    for m in combined:
        v1, v2 = m.group(1), m.group(2)
        vtext = re.sub(r'\s+', ' ', m.group(3)).strip()
        vtext = re.sub(r'#[A-Z][a-zA-Z0-9\s:;,\.]+$', '', vtext).strip()
        if vtext:
            verses[f"{chapter}:{v1}"] = vtext
            verses[f"{chapter}:{v2}"] = vtext  # same text for both

    return verses


if __name__ == "__main__":
    # Test with GEN.1 HTML passed via stdin
    html = sys.stdin.read()
    verses = parse_tbr17_html(html, "GEN", 1)
    for ref, text in sorted(verses.items(), key=lambda x: int(x[0].split(':')[1])):
        print(f"  {ref}: {text[:100]}")
    print(f"\nTotal: {len(verses)} verses")

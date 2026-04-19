"""
TBR17 full Bible fetcher using bible.com _next/data JSON API.
Fetches all 66 books, all chapters, saves to data/master/sources/bible_tbr17.jsonl
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
OUT      = ROOT / "data/master/sources/bible_tbr17.jsonl"
PROGRESS = ROOT / "data/master/sources/bible_tbr17_progress.json"
BUILD_ID = "zXrCQfcOj340LrPTrtSpQ"
BASE_URL = f"https://www.bible.com/_next/data/{BUILD_ID}/en/bible/4189"

FORBIDDEN = re.compile(r"\b(pathian|bawipa|siangpahrang)\b|(?<!\w)(cu\b|cun\b)", re.I)

BOOKS = {
    "GEN":50,"EXO":40,"LEV":27,"NUM":36,"DEU":34,"JOS":24,"JDG":21,"RUT":4,
    "1SA":31,"2SA":24,"1KI":22,"2KI":25,"1CH":29,"2CH":36,"EZR":10,"NEH":13,
    "EST":10,"JOB":42,"PSA":150,"PRO":31,"ECC":12,"SNG":8,"ISA":66,"JER":52,
    "LAM":5,"EZK":48,"DAN":12,"HOS":14,"JOL":3,"AMO":9,"OBA":1,"JON":4,
    "MIC":7,"NAM":3,"HAB":3,"ZEP":3,"HAG":2,"ZEC":14,"MAL":4,  # NAM = Nahum on bible.com
    "MAT":28,"MRK":16,"LUK":24,"JHN":21,"ACT":28,"ROM":16,"1CO":16,"2CO":13,
    "GAL":6,"EPH":6,"PHP":4,"COL":4,"1TH":5,"2TH":3,"1TI":6,"2TI":4,
    "TIT":3,"PHM":1,"HEB":13,"JAS":5,"1PE":5,"2PE":3,"1JN":5,"2JN":1,
    "3JN":1,"JUD":1,"REV":22,
}
# bible.com uses NAM for Nahum; standardize reference to NAH in output
BOOK_REF_ALIAS = {"NAM": "NAH"}

def md5(s: str) -> str:
    return hashlib.md5(s.encode()).hexdigest()

def c(v) -> str:
    return re.sub(r"\s+", " ", str(v or "")).strip()

def fetch_json(book: str, ch: int) -> dict | None:
    url = f"{BASE_URL}/{book}.{ch}.TBR17.json?versionId=4189&usfm={book}.{ch}.TBR17"
    try:
        r = subprocess.run(
            ["curl", "-s", "--max-time", "12",
             "-H", "User-Agent: Mozilla/5.0 (ZolaiToolkit/1.0)",
             "-H", "Accept: application/json",
             url],
            capture_output=True, text=True, timeout=15
        )
        if not r.stdout.strip(): return None
        return json.loads(r.stdout)
    except Exception:
        return None

def parse_verses(html_content: str, book: str, ch: int) -> dict[str, str]:
    """Parse verses: handles single and combined refs (e.g. COL.1.1+COL.1.2), concatenates all content spans."""
    verses: dict[str, str] = {}
    for m in re.finditer(
        r'<span[^>]+data-usfm="([^"]+)"[^>]*>(.*?)</span>\s*(?=<span[^>]+(?:data-usfm|class="verse)|</div>|$)',
        html_content, re.S,
    ):
        usfm_val = m.group(1)
        ch_match = re.search(r"\.(\d+)\.", usfm_val)
        if not ch_match or int(ch_match.group(1)) != ch:
            continue
        inner = re.sub(r'<span class="note[^"]*">.*?</span>', "", m.group(2), flags=re.S)
        parts = re.findall(r'<span[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)</span>', inner, re.S)
        text = " ".join(re.sub(r"<[^>]+>", "", p).strip() for p in parts if p.strip())
        text = c(text.replace("&#8217;", "'").replace("&#8220;", '"').replace("&#8221;", '"').replace("&#8216;", "'"))
        if not text or len(text) <= 3:
            continue
        verse_nums = re.findall(r"\.\d+\.(\d+)", usfm_val)
        if verse_nums:
            verses[f"{ch}:{verse_nums[0]}"] = text
    return verses

# Load progress
progress: dict = {}
if PROGRESS.exists():
    try: progress = json.loads(PROGRESS.read_text())
    except: pass

# Load existing hashes
seen: set[str] = set()
if OUT.exists():
    with OUT.open(encoding="utf-8") as f:
        for line in f:
            try: seen.add(md5(json.loads(line.strip()).get("text", "")))
            except: pass

total_saved = sum(1 for _ in OUT.open(encoding="utf-8")) if OUT.exists() else 0
print(f"[TBR17] Resuming — {total_saved:,} existing | {len(progress)} chapters done", flush=True)

with OUT.open("a", encoding="utf-8") as fout:
    for book, max_ch in BOOKS.items():
        book_new = 0
        for ch in range(1, max_ch + 1):
            key = f"{book}.{ch}"
            if progress.get(key) == "done":
                continue

            data = fetch_json(book, ch)
            if not data:
                progress[key] = "done"
                PROGRESS.write_text(json.dumps(progress))
                continue

            try:
                html = data["pageProps"]["chapterInfo"]["content"]
            except (KeyError, TypeError):
                progress[key] = "done"
                PROGRESS.write_text(json.dumps(progress))
                continue

            verses = parse_verses(html, book, ch)
            ch_saved = 0
            ref_book = BOOK_REF_ALIAS.get(book, book)  # NAM → NAH
            for ref, text in verses.items():
                if FORBIDDEN.search(text): continue
                k = md5(text)
                if k in seen: continue
                seen.add(k)
                fout.write(json.dumps({
                    "text": text, "language": "zolai", "dialect": "tedim",
                    "source": "TBR17", "reference": f"{ref_book}.{ref}",
                    "topic": "religion", "category": "sentence"
                }, ensure_ascii=False) + "\n")
                ch_saved += 1
                total_saved += 1
                book_new += 1

            progress[key] = "done"
            PROGRESS.write_text(json.dumps(progress))

            sys.stdout.write(f"\r  {book} {ch:>3}/{max_ch} | +{ch_saved} verses | total={total_saved:,}   ")
            sys.stdout.flush()
            time.sleep(0.25)

        if book_new > 0:
            print(f"\n  ✓ {book}: +{book_new}", flush=True)

print(f"\n[TBR17] Complete — {total_saved:,} verses → {OUT}", flush=True)

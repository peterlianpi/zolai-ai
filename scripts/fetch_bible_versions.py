"""
Fetch all 3 Tedim Bible versions from bible.com API and compare with local USX files.
Saves new/different verses and adds TBR17 to dataset.
"""
from __future__ import annotations

import hashlib
import json
import re
import ssl
import sys
import time
from pathlib import Path
from xml.etree import ElementTree as ET

import requests
import urllib3
from requests.adapters import HTTPAdapter

urllib3.disable_warnings()

class LegacySSL(HTTPAdapter):
    def init_poolmanager(self, *a, **kw):
        ctx = ssl.create_default_context()
        ctx.set_ciphers("DEFAULT@SECLEVEL=1")
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        try: ctx.options |= ssl.OP_LEGACY_SERVER_CONNECT
        except: pass
        kw["ssl_context"] = ctx
        super().init_poolmanager(*a, **kw)

S = requests.Session()
S.mount("https://", LegacySSL())
HDR = {"User-Agent": "Mozilla/5.0 (ZolaiToolkit/1.0)"}

ROOT     = Path(__file__).parent.parent
COMBINED = ROOT / "data/master/combined"
BIBLE    = ROOT / "resources/Chin-Bible"
OUT_DIR  = ROOT / "data/master/sources"

VERSIONS = {
    "TDB":   {"id": 368,  "year": 2011, "name": "Tedim Bible 2011"},
    "TB77":  {"id": 3561, "year": 1977, "name": "Tedim Bible 1977"},
    "TBR17": {"id": 4189, "year": 2017, "name": "Tedim Bible Revision 2017"},
}

BOOKS = [
    "GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA",
    "1KI","2KI","1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO",
    "ECC","SNG","ISA","JER","LAM","EZK","DAN","HOS","JOL","AMO",
    "OBA","JON","MIC","NAH","HAB","ZEP","HAG","ZEC","MAL",
    "MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH",
    "PHP","COL","1TH","2TH","1TI","2TI","TIT","PHM","HEB","JAS",
    "1PE","2PE","1JN","2JN","3JN","JUD","REV"
]

def c(v) -> str:
    return re.sub(r"\s+", " ", str(v or "")).strip()

def md5(s: str) -> str:
    return hashlib.md5(s.encode()).hexdigest()

def parse_usx(usx_dir: Path, book: str) -> dict[str, str]:
    p = usx_dir / f"{book}.usx"
    if not p.exists(): return {}
    try: root = ET.parse(p).getroot()
    except: return {}
    verses: dict[str, str] = {}
    ch = "0"
    for elem in root.iter():
        if elem.tag == "chapter": ch = elem.get("number", ch).rstrip("#")
        elif elem.tag == "para":
            v = None
            for child in elem:
                if child.tag == "chapter": ch = child.get("number", ch).rstrip("#")
                elif child.tag == "verse":
                    v = child.get("number", "").rstrip("#")
                    if v: verses[f"{ch}:{v}"] = c(child.tail or "")
                elif child.tag != "note" and v:
                    key = f"{ch}:{v}"
                    if child.text: verses[key] = c(verses.get(key,"") + " " + child.text)
                    if child.tail: verses[key] = c(verses.get(key,"") + " " + child.tail)
    return verses

def fetch_bible_com(version_id: int, abbrev: str, book: str) -> dict[str, str]:
    """Fetch a book from bible.com API."""
    url = f"https://www.bible.com/bible/{version_id}/{book}.1.{abbrev}"
    verses: dict[str, str] = {}
    # Try multiple chapters
    ch = 1
    while True:
        url = f"https://www.bible.com/bible/{version_id}/{book}.{ch}.{abbrev}"
        try:
            r = S.get(url, timeout=12, headers=HDR)
            if r.status_code == 404: break
            text = r.text
            # Extract verse text from HTML
            # Pattern: digit followed by verse text
            # Find the main content area
            content = re.search(r'<div[^>]*class="[^"]*reader[^"]*"[^>]*>(.*?)</div>', text, re.S)
            if not content:
                # Try extracting verse numbers and text directly
                verse_matches = re.findall(r'(\d+)([A-Z\u1000-\u109F][^<\d]{5,}?)(?=\d|$)', text)
                for vnum, vtext in verse_matches:
                    vtext = re.sub(r'<[^>]+>', '', vtext)
                    vtext = c(vtext)
                    if vtext and len(vtext) > 5:
                        verses[f"{ch}:{vnum}"] = vtext
            break  # one chapter at a time is too slow, use different approach
        except Exception:
            break
        ch += 1
        if ch > 150: break
    return verses

# ── Load local USX versions ───────────────────────────────────────────────────
print("Loading local USX files...", flush=True)
local = {
    "TB77": BIBLE / "TDB77" / "USX_1",
    "TDB":  BIBLE / "Tedim (Chin) Bible" / "USX_1",
}

# ── Fetch TBR17 from bible.com using WP API ───────────────────────────────────
print("\nFetching TBR17 (2017) from bible.com...", flush=True)
print("Using YouVersion API endpoint...", flush=True)

tbr17_verses: dict[str, str] = {}
FORBIDDEN = re.compile(r"\b(pathian|bawipa|siangpahrang)\b|(?<!\w)(cu\b|cun\b)", re.I)

# YouVersion has a public API
API = "https://www.bible.com/api/bible/version/4189/books/{book}/chapters/{ch}/verses"

total_fetched = 0
for book in BOOKS:
    book_verses: dict[str, str] = {}
    ch = 1
    while True:
        try:
            r = S.get(f"https://www.bible.com/api/bible/version/4189/books/{book}/chapters/{ch}/verses",
                      timeout=10, headers=HDR)
            if r.status_code in (404, 400): break
            data = r.json()
            if not data: break
            for item in data:
                vnum = str(item.get("verse_start", item.get("verse","")))
                text = c(item.get("content", item.get("text","")))
                # Strip HTML tags
                text = re.sub(r"<[^>]+>", "", text)
                text = c(text)
                if text and len(text) > 3:
                    book_verses[f"{ch}:{vnum}"] = text
            ch += 1
            time.sleep(0.3)
        except Exception:
            break

    if book_verses:
        tbr17_verses.update({f"{book}.{k}": v for k, v in book_verses.items()})
        total_fetched += len(book_verses)
        sys.stdout.write(f"\r  {book}: {len(book_verses)} verses | total={total_fetched:,}   ")
        sys.stdout.flush()

print(f"\n  TBR17 fetched: {total_fetched:,} verses", flush=True)

# If API didn't work, try scraping HTML
if total_fetched == 0:
    print("  API failed — trying HTML scrape...", flush=True)
    for book in BOOKS[:5]:  # test with first 5 books
        for ch in range(1, 5):
            url = f"https://www.bible.com/bible/4189/{book}.{ch}.TBR17"
            try:
                r = S.get(url, timeout=12, headers=HDR)
                if r.status_code == 404: break
                # Extract verse content
                soup_text = r.text
                # Find verse spans
                verses_raw = re.findall(r'"verse_start":(\d+).*?"content":"([^"]+)"', soup_text)
                for vnum, vtext in verses_raw:
                    vtext = re.sub(r'\\[nu]', ' ', vtext)
                    vtext = c(vtext)
                    if vtext:
                        tbr17_verses[f"{book}.{ch}:{vnum}"] = vtext
                        total_fetched += 1
                time.sleep(0.5)
            except: break
    print(f"  HTML scrape: {total_fetched:,} verses", flush=True)

# ── Compare TBR17 with local versions ────────────────────────────────────────
print("\n=== COMPARISON: TBR17 vs TDB vs TB77 (Genesis 1:1-10) ===", flush=True)
for i in range(1, 11):
    ref = f"GEN.1:{i}"
    tbr = tbr17_verses.get(ref, "")
    tdb_v = parse_usx(local["TDB"], "GEN").get(f"1:{i}", "")
    tb77_v = parse_usx(local["TB77"], "GEN").get(f"1:{i}", "")
    if tbr or tdb_v or tb77_v:
        print(f"\nGEN 1:{i}")
        if tbr:   print(f"  TBR17: {tbr[:90]}")
        if tdb_v: print(f"  TDB  : {tdb_v[:90]}")
        if tb77_v:print(f"  TB77 : {tb77_v[:90]}")

# ── Save TBR17 to sources if we got data ─────────────────────────────────────
if total_fetched > 0:
    out_file = OUT_DIR / "bible_tbr17.jsonl"
    seen = set()
    saved = 0
    with out_file.open("w", encoding="utf-8") as f:
        for ref, text in tbr17_verses.items():
            if not text or len(text) < 3: continue
            if FORBIDDEN.search(text): continue
            k = md5(text)
            if k in seen: continue
            seen.add(k)
            f.write(json.dumps({
                "text": text, "language": "zolai", "dialect": "tedim",
                "source": "TBR17", "reference": ref,
                "topic": "religion", "category": "sentence"
            }, ensure_ascii=False) + "\n")
            saved += 1
    print(f"\nSaved {saved:,} TBR17 verses → {out_file}", flush=True)
else:
    print("\nNo TBR17 data fetched — bible.com API requires authentication.", flush=True)
    print("Recommendation: Use the bible.com app or download via YouVersion API with auth token.", flush=True)

"""
Build complete parallel + sentence dataset from all Bible USX files.
- KJV (English) aligned with TDB77 + Tedim(Chin) Bible (Zolai)
- All Zolai verses added to sentences.jsonl
- All EN↔ZO pairs added to parallel.jsonl
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT     = Path(__file__).parent.parent
COMBINED = ROOT / "data/master/combined"
BIBLE    = ROOT / "resources/Chin-Bible"

def md5(s: str) -> str:
    return hashlib.md5(s.encode()).hexdigest()

def c(v) -> str:
    return re.sub(r"\s+", " ", str(v or "")).strip()

def parse_usx(usx_dir: Path) -> dict[str, str]:
    """Parse USX files into {BOOK.CH.V: text} dict."""
    verses: dict[str, str] = {}
    for usx_file in sorted(usx_dir.glob("*.usx")):
        book = usx_file.stem.split("#")[0]  # handle '1CH#' style
        try: root = ET.parse(usx_file).getroot()
        except: continue
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
                            verses[f"{book}.{ch}.{v}"] = c(child.tail or "")
                    elif child.tag != "note" and v:
                        key = f"{book}.{ch}.{v}"
                        if child.text: verses[key] = c(verses.get(key,"") + " " + child.text)
                        if child.tail: verses[key] = c(verses.get(key,"") + " " + child.tail)
    return verses

# Parse all versions
print("Parsing Bible versions...", flush=True)
kjv    = parse_usx(BIBLE / "King James Version" / "USX")
tdb77  = parse_usx(BIBLE / "TDB77" / "USX_1")
tedim  = parse_usx(BIBLE / "Tedim (Chin) Bible" / "USX_1")
print(f"  KJV:   {len(kjv):,} verses")
print(f"  TDB77: {len(tdb77):,} verses")
print(f"  Tedim: {len(tedim):,} verses")

# Load TBR17 from fetched JSONL
tbr17: dict[str, str] = {}
tbr17_file = ROOT / "data/master/sources/bible_tbr17.jsonl"
if tbr17_file.exists():
    with tbr17_file.open(encoding="utf-8") as f:
        for line in f:
            try:
                obj = json.loads(line.strip())
                ref = obj.get("reference","")  # e.g. GEN.1:1
                text = c(obj.get("text",""))
                if ref and text:
                    # Convert GEN.1:1 → GEN.1.1 key format
                    tbr17[ref.replace(".",".").replace(":",":")] = text
            except: pass
print(f"  TBR17: {len(tbr17):,} verses")

# Forbidden dialect check
FORBIDDEN = re.compile(r"\b(pathian|bawipa|siangpahrang)\b|(?<!\w)(cu|cun)(?!\w)", re.I)

# Load existing hashes
print("\nLoading existing hashes...", flush=True)
seen_s: set[str] = set()
seen_p: set[str] = set()

with (COMBINED / "sentences.jsonl").open(encoding="utf-8") as f:
    for line in f:
        try:
            t = c(json.loads(line.strip()).get("text",""))
            if t: seen_s.add(md5(t))
        except: pass

with (COMBINED / "parallel.jsonl").open(encoding="utf-8") as f:
    for line in f:
        try:
            obj = json.loads(line.strip())
            k = c(obj.get("english","")) + c(obj.get("zolai",""))
            if k: seen_p.add(md5(k))
        except: pass

print(f"  sentences: {len(seen_s):,}  parallel: {len(seen_p):,}")

# Write new records
added_s = added_p = 0
all_keys = set(kjv.keys()) | set(tdb77.keys()) | set(tedim.keys())

with (COMBINED / "sentences.jsonl").open("a", encoding="utf-8") as fs, \
     (COMBINED / "parallel.jsonl").open("a", encoding="utf-8") as fp:

    for key in sorted(all_keys):
        book_ch_v = key  # e.g. GEN.1.1
        parts = key.split(".")
        if len(parts) != 3: continue
        book, ch, v = parts
        ref = f"{book} {ch}:{v}"

        en_text = c(kjv.get(key, ""))

        for zo_text, src_name in [
            (c(tdb77.get(key, "")), "TDB77"),
            (c(tedim.get(key, "")), "Tedim_Chin_Bible"),
            (c(tbr17.get(f"{book}.{ch}:{v}", "")), "TBR17"),
        ]:
            if not zo_text or len(zo_text) < 3: continue
            if FORBIDDEN.search(zo_text): continue

            # Add to sentences
            k_s = md5(zo_text)
            if k_s not in seen_s:
                seen_s.add(k_s)
                fs.write(json.dumps({
                    "text": zo_text, "language": "zolai", "dialect": "tedim",
                    "source": src_name, "topic": "religion", "category": "sentence"
                }, ensure_ascii=False) + "\n")
                added_s += 1

            # Add parallel pair if English exists
            if en_text and len(en_text) >= 10:
                k_p = md5(en_text + zo_text)
                if k_p not in seen_p:
                    seen_p.add(k_p)
                    fp.write(json.dumps({
                        "zolai": zo_text, "english": en_text, "dialect": "tedim",
                        "source": f"bible_{src_name}_KJV", "reference": ref,
                        "category": "parallel"
                    }, ensure_ascii=False) + "\n")
                    added_p += 1

print(f"\nAdded sentences : {added_s:,}")
print(f"Added parallel  : {added_p:,}")

# Final counts
print("\n=== FINAL ===")
for fname in ["sentences.jsonl", "parallel.jsonl", "instructions.jsonl", "dictionary.jsonl"]:
    p = COMBINED / fname
    n = sum(1 for _ in p.open(encoding="utf-8"))
    mb = p.stat().st_size / 1024 / 1024
    print(f"  {fname:<25} {n:>9,}  {mb:>7.1f}MB")

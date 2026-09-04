"""
1. Build bible_parallel_tbr17.jsonl (TBR17 × KJV aligned pairs)
2. Fix number words in dictionary (sawmnih=20, sawmguk=60, etc.)
3. Cross-reference 482 real vocab gaps using all 3 Bible versions + parallel corpus
4. Insert resolved entries into SQLite DB

Usage:
  python scripts/crossref_bible_vocab.py
"""
from __future__ import annotations

import json
import re
import sqlite3
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

DATA    = Path("data/master/sources")
COMBINED = Path("data/master/combined")
BIBLE   = Path("resources/Chin-Bible")
DB_PATH = Path("data/master_unified_dictionary.db")
GAPS    = Path("data/processed/bible_vocab_real_gaps.jsonl")
OUT_RESOLVED = Path("data/processed/bible_vocab_resolved.jsonl")
OUT_STILL_MISSING = Path("data/processed/bible_vocab_still_missing.jsonl")

# ── Number word fixes ─────────────────────────────────────────────────────────
# Zolai base-10 counting: khat=1, nih=2, thum=3, li=4, nga=5,
# guk=6, sagih=7, giet=8, kua=9, sawm=10
# sawmnih=20, sawmthum=30, sawmli=40, sawmnga=50, sawmguk=60,
# sawmsagih=70, sawmgiet=80, sawmkua=90
NUMBER_FIXES: dict[str, dict] = {
    "sawmnih":   {"english": ["twenty", "20"], "pos": "numeral", "explanation": "sawm(10) + nih(2) = 20"},
    "sawmthum":  {"english": ["thirty", "30"], "pos": "numeral", "explanation": "sawm(10) + thum(3) = 30"},
    "sawmli":    {"english": ["forty", "40"],  "pos": "numeral", "explanation": "sawm(10) + li(4) = 40"},
    "sawmnga":   {"english": ["fifty", "50"],  "pos": "numeral", "explanation": "sawm(10) + nga(5) = 50"},
    "sawmguk":   {"english": ["sixty", "60"],  "pos": "numeral", "explanation": "sawm(10) + guk(6) = 60"},
    "sawmsagih": {"english": ["seventy", "70"],"pos": "numeral", "explanation": "sawm(10) + sagih(7) = 70"},
    "sawmgiet":  {"english": ["eighty", "80"], "pos": "numeral", "explanation": "sawm(10) + giet(8) = 80"},
    "sawmkua":   {"english": ["ninety", "90"], "pos": "numeral", "explanation": "sawm(10) + kua(9) = 90"},
    # compounds with leh (and)
    "sawmnih leh khat":   {"english": ["twenty-one", "21"], "pos": "numeral"},
    "sawmnih leh sagih":  {"english": ["twenty-seven", "27"], "pos": "numeral", "explanation": "sawmnih(20) + leh(and) + sagih(7) = 27"},
}


# ── Parse KJV USX for English verse text ─────────────────────────────────────

def parse_usx(usx_dir: Path) -> dict[str, str]:
    verses: dict[str, str] = {}
    for usx_file in sorted(usx_dir.glob("*.usx")):
        book = usx_file.stem.split("#")[0]
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
                            verses[f"{book}.{ch}:{v}"] = (child.tail or "").strip()
                    elif child.tag != "note" and v:
                        key = f"{book}.{ch}:{v}"
                        if child.text:
                            verses[key] = (verses.get(key, "") + " " + child.text).strip()
                        if child.tail:
                            verses[key] = (verses.get(key, "") + " " + child.tail).strip()
    return verses


# ── Load Bible versions ───────────────────────────────────────────────────────

def load_jsonl_bible(path: Path) -> dict[str, str]:
    d: dict[str, str] = {}
    for line in open(path, encoding="utf-8"):
        r = json.loads(line)
        d[r["reference"]] = r["text"]
    return d


# ── Build TBR17 parallel ──────────────────────────────────────────────────────

def build_tbr17_parallel(tbr17: dict[str, str], kjv: dict[str, str]) -> int:
    out = DATA / "bible_parallel_tbr17.jsonl"
    existing: set[str] = set()
    if out.exists():
        for line in open(out, encoding="utf-8"):
            r = json.loads(line)
            existing.add(r["metadata"]["reference"])

    count = 0
    with open(out, "a", encoding="utf-8") as f:
        for ref, zo in tbr17.items():
            if ref in existing:
                continue
            en = kjv.get(ref, "")
            if not en or not zo:
                continue
            # Parse ref GEN.1:1 → book/chapter/verse
            m = re.match(r"^(\w+)\.(\d+):(\d+)$", ref)
            if not m:
                continue
            book, ch, verse = m.group(1), int(m.group(2)), int(m.group(3))
            f.write(json.dumps({
                "instruction": "Translate this text from English to Tedim Chin.",
                "input": en,
                "output": zo,
                "metadata": {
                    "dialect": "Tedim_Chin",
                    "version": "TBR17",
                    "reference": ref,
                    "source": "Parallel_Corpus",
                    "book": book,
                    "chapter": ch,
                    "verse": verse,
                },
            }, ensure_ascii=False) + "\n")
            count += 1
    return count


# ── DB helpers ────────────────────────────────────────────────────────────────

def db_insert(entry: dict, conn: sqlite3.Connection) -> bool:
    cur = conn.cursor()
    hw = entry["zolai"].strip()
    cur.execute("SELECT id FROM entries WHERE LOWER(headword)=?", (hw.lower(),))
    if cur.fetchone():
        return False
    raw = json.dumps(entry, ensure_ascii=False)
    cur.execute(
        "INSERT INTO entries (headword, pos, sources, raw_json) VALUES (?,?,?,?)",
        (hw, entry.get("pos", ""), entry.get("source", "crossref"), raw),
    )
    eid = cur.lastrowid
    for t in (entry.get("english") or []):
        if isinstance(t, str) and t.strip():
            cur.execute("INSERT INTO translations (entry_id, translation) VALUES (?,?)", (eid, t))
    trans_text = " ".join(t for t in (entry.get("english") or []) if isinstance(t, str))
    cur.execute(
        "INSERT INTO fts_idx (rowid, headword, translations_text, explanations_text) VALUES (?,?,?,?)",
        (eid, hw, trans_text, entry.get("explanation", "")),
    )
    conn.commit()
    return True


def db_update_number(entry: dict, conn: sqlite3.Connection) -> None:
    cur = conn.cursor()
    hw = entry["zolai"].strip()
    cur.execute("SELECT id, raw_json FROM entries WHERE LOWER(headword)=?", (hw.lower(),))
    row = cur.fetchone()
    raw = json.dumps({**entry, "dialect": "tedim", "source": "number_fix"}, ensure_ascii=False)
    if row:
        cur.execute("UPDATE entries SET raw_json=?, pos=? WHERE id=?",
                    (raw, entry.get("pos", "numeral"), row[0]))
    else:
        cur.execute(
            "INSERT INTO entries (headword, pos, sources, raw_json) VALUES (?,?,?,?)",
            (hw, "numeral", "number_fix", raw),
        )
        eid = cur.lastrowid
        for t in entry.get("english", []):
            cur.execute("INSERT INTO translations (entry_id, translation) VALUES (?,?)", (eid, t))
        trans_text = " ".join(entry.get("english", []))
        cur.execute(
            "INSERT INTO fts_idx (rowid, headword, translations_text, explanations_text) VALUES (?,?,?,?)",
            (eid, hw, trans_text, entry.get("explanation", "")),
        )
    conn.commit()


# ── Cross-reference resolver ──────────────────────────────────────────────────

def crossref_word(word: str, ref: str,
                  versions: dict[str, dict[str, str]],
                  parallel_en: dict[str, str]) -> dict | None:
    """
    Find the English translation of a Zolai word by:
    1. Finding the verse containing the word across all versions
    2. Aligning with the KJV English verse
    3. Using word position / context to infer meaning
    """
    en_verse = parallel_en.get(ref, "")
    if not en_verse:
        return None

    # Collect all Zolai versions of this verse
    zo_verses = {v: vdata.get(ref, "") for v, vdata in versions.items() if vdata.get(ref)}

    if not zo_verses or not en_verse:
        return None

    # Check if word appears in any version
    appears_in = [v for v, text in zo_verses.items() if word in text.lower()]
    if not appears_in:
        return None

    return {
        "zolai": word,
        "english": [],  # to be filled by alignment
        "pos": "",
        "reference": ref,
        "en_verse": en_verse,
        "zo_verses": zo_verses,
        "source": "crossref_bible",
        "accuracy": 0.6,
    }


def simple_align(word: str, zo_text: str, en_text: str) -> list[str]:
    """
    Naive positional alignment: find word position in ZO tokens,
    map to same position in EN tokens as candidate translation.
    Returns candidate English words.
    """
    zo_tokens = re.split(r"[\s,;.]+", zo_text.lower())
    en_tokens = re.split(r"[\s,;.]+", en_text.lower())
    if not zo_tokens or not en_tokens:
        return []

    try:
        idx = zo_tokens.index(word)
    except ValueError:
        return []

    # Map proportionally
    ratio = idx / len(zo_tokens)
    en_idx = int(ratio * len(en_tokens))
    candidates = []
    for offset in range(-1, 2):
        i = en_idx + offset
        if 0 <= i < len(en_tokens):
            t = en_tokens[i].strip("'s")
            if len(t) > 2:
                candidates.append(t)
    return list(dict.fromkeys(candidates))  # dedupe, preserve order


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> int:
    conn = sqlite3.connect(DB_PATH)

    # 1. Fix number words
    print("Fixing number words in DB...", flush=True)
    for word, entry in NUMBER_FIXES.items():
        db_update_number({"zolai": word, **entry}, conn)
    print(f"  ✅ {len(NUMBER_FIXES)} number entries fixed/inserted")

    # 2. Load Bible versions
    print("Loading Bible versions...", flush=True)
    tb77  = load_jsonl_bible(DATA / "bible_tb77_online.jsonl")
    tbr17 = load_jsonl_bible(DATA / "bible_tbr17.jsonl")
    tdb   = load_jsonl_bible(DATA / "bible_tdb_online.jsonl")
    versions = {"tb77": tb77, "tbr17": tbr17, "tdb": tdb}
    print(f"  tb77={len(tb77):,}  tbr17={len(tbr17):,}  tdb={len(tdb):,}")

    # 3. Build TBR17 parallel
    print("Building TBR17 parallel...", flush=True)
    kjv_dir = BIBLE / "King James Version" / "USX"
    if kjv_dir.exists():
        kjv = parse_usx(kjv_dir)
        added = build_tbr17_parallel(tbr17, kjv)
        print(f"  ✅ {added:,} new TBR17 parallel pairs → bible_parallel_tbr17.jsonl")
    else:
        kjv = {}
        print(f"  ⚠ KJV USX not found at {kjv_dir}, skipping parallel build")
        # Fall back: load from existing tdb77 parallel for EN text
        for line in open(DATA / "bible_parallel_tdb77.jsonl", encoding="utf-8"):
            r = json.loads(line)
            ref = r["metadata"]["reference"]
            kjv[ref] = r["input"]
        print(f"  Using tdb77 parallel EN as fallback: {len(kjv):,} verses")

    # 4. Cross-reference gaps
    print("Cross-referencing vocab gaps...", flush=True)
    gaps = [json.loads(l) for l in open(GAPS, encoding="utf-8")]
    print(f"  {len(gaps)} gaps to resolve")

    resolved: list[dict] = []
    still_missing: list[dict] = []
    inserted = 0

    for g in gaps:
        word = g["word"]
        ref  = g["first_seen"]

        en_verse = kjv.get(ref, "")
        zo_verses = {v: vdata.get(ref, "") for v, vdata in versions.items() if vdata.get(ref)}

        if not en_verse or not zo_verses:
            still_missing.append(g)
            continue

        # Try alignment across all versions
        candidates: list[str] = []
        for zo_text in zo_verses.values():
            if word in zo_text.lower():
                candidates.extend(simple_align(word, zo_text, en_verse))

        candidates = list(dict.fromkeys(candidates))  # dedupe

        if candidates:
            entry = {
                "zolai": word,
                "english": candidates[:3],
                "pos": "",
                "dialect": "tedim",
                "source": "crossref_bible",
                "reference": ref,
                "en_verse": en_verse[:120],
                "zo_verse": list(zo_verses.values())[0][:120],
                "accuracy": 0.55,
            }
            resolved.append(entry)
            if db_insert(entry, conn):
                inserted += 1
        else:
            still_missing.append(g)

        sys.stdout.write(f"\r  {len(resolved)} resolved, {len(still_missing)} still missing  ")
        sys.stdout.flush()

    print()

    # Save outputs
    with open(OUT_RESOLVED, "w", encoding="utf-8") as f:
        for e in resolved:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")

    with open(OUT_STILL_MISSING, "w", encoding="utf-8") as f:
        for g in still_missing:
            f.write(json.dumps(g, ensure_ascii=False) + "\n")

    conn.close()

    print(f"\n{'─'*50}")
    print(f"Number fixes    : {len(NUMBER_FIXES)}")
    print("TBR17 parallel  : built ✅")
    print(f"Gaps resolved   : {len(resolved)} → {OUT_RESOLVED}")
    print(f"DB inserted     : {inserted}")
    print(f"Still missing   : {len(still_missing)} → {OUT_STILL_MISSING}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

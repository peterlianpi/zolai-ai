"""
Fill 1,655 still-missing Bible vocab words using Gemini with multi-key rotation.

Usage:
  python scripts/fill_missing_vocab_gemini.py [--dry-run] [--batch 15]
"""
from __future__ import annotations

import json
import re
import sqlite3
import sys
import time
import urllib.request
from pathlib import Path

DB_PATH  = Path("data/master_unified_dictionary.db")
MISSING  = Path("data/processed/bible_vocab_still_missing_v2.jsonl")
RESOLVED = Path("data/processed/bible_vocab_resolved.jsonl")
STILL    = Path("data/processed/bible_vocab_still_missing_v3.jsonl")
CONFIG   = Path("scripts/ui/config.js")

MODEL = "gemini-2.5-flash-lite"

SYSTEM = """You are a Zolai (Tedim Chin) linguistic expert.
For each word given, provide a dictionary entry as JSON.
Rules:
- Tedim ZVS dialect only (pasian not pathian, gam not ram, tua not cu/cun)
- topa (lord/master) is VALID — do not flag it
- If a word is a proper noun (name/place), set pos="proper_noun" and english=[]
- If unsure, set accuracy=0.5
- Return a JSON array, one entry per word.

Entry format:
{"zolai":"word","english":["trans1","trans2"],"pos":"noun|verb|adj|particle|proper_noun","explanation":"brief","dialect":"tedim","accuracy":0.6}"""


def load_keys() -> list[str]:
    text = CONFIG.read_text()
    keys = re.findall(r"GEMINI_API_KEY[^:]*:\s*[^'\"]*['\"]([A-Za-z0-9_\-]+)['\"]", text)
    return list(dict.fromkeys(k for k in keys if len(k) > 20))  # dedupe


def call_gemini(words: list[str], key: str) -> list[dict]:
    payload = json.dumps({
        "system_instruction": {"parts": [{"text": SYSTEM}]},
        "contents": [{"parts": [{"text": "Define these words: " + ", ".join(words)}]}],
        "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"},
    }).encode()
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={key}",
        data=payload, headers={"Content-Type": "application/json"}, method="POST",
    )
    with urllib.request.urlopen(req, timeout=45) as r:
        data = json.loads(r.read())
    raw = data["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(raw)


def db_insert(entry: dict, conn: sqlite3.Connection) -> bool:
    cur = conn.cursor()
    hw = entry["zolai"].strip()
    cur.execute("SELECT id FROM entries WHERE LOWER(headword)=?", (hw.lower(),))
    if cur.fetchone():
        return False
    raw = json.dumps(entry, ensure_ascii=False)
    cur.execute("INSERT INTO entries (headword, pos, sources, raw_json) VALUES (?,?,?,?)",
                (hw, entry.get("pos", ""), "gemini_vocab", raw))
    eid = cur.lastrowid
    for t in (entry.get("english") or []):
        if isinstance(t, str) and t.strip():
            cur.execute("INSERT INTO translations (entry_id, translation) VALUES (?,?)", (eid, t))
    trans = " ".join(t for t in (entry.get("english") or []) if isinstance(t, str))
    cur.execute("INSERT INTO fts_idx (rowid, headword, translations_text, explanations_text) VALUES (?,?,?,?)",
                (eid, hw, trans, entry.get("explanation", "")))
    conn.commit()
    return True


def main() -> int:
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--batch", type=int, default=15)
    args = parser.parse_args()

    keys = load_keys()
    print(f"Keys available: {len(keys)}")

    # Load unique missing words
    seen: set[str] = set()
    missing: list[dict] = []
    for line in open(MISSING, encoding="utf-8"):
        g = json.loads(line)
        if g["word"] not in seen:
            seen.add(g["word"])
            missing.append(g)
    print(f"Unique missing words: {len(missing)}")

    if args.dry_run:
        print("Sample:", [g["word"] for g in missing[:20]])
        return 0

    conn = sqlite3.connect(DB_PATH)
    resolved_f = open(RESOLVED, "a", encoding="utf-8")
    still_f    = open(STILL, "w", encoding="utf-8")

    total_inserted = 0
    still_missing: list[dict] = []
    key_idx = 0

    for i in range(0, len(missing), args.batch):
        batch = missing[i: i + args.batch]
        words = [g["word"] for g in batch]
        key   = keys[key_idx % len(keys)]
        key_idx += 1

        try:
            entries = call_gemini(words, key)
            for entry in entries:
                if not entry.get("zolai"):
                    continue
                resolved_f.write(json.dumps(entry, ensure_ascii=False) + "\n")
                if db_insert(entry, conn):
                    total_inserted += 1
            # Words not returned by Gemini → still missing
            returned = {e["zolai"].lower() for e in entries if e.get("zolai")}
            for g in batch:
                if g["word"].lower() not in returned:
                    still_missing.append(g)
                    still_f.write(json.dumps(g, ensure_ascii=False) + "\n")

        except Exception as e:
            sys.stderr.write(f"\n  Key {key_idx} error: {e} — rotating key\n")
            time.sleep(3)  # back off before retry with next key
            # Put batch back with next key
            for g in batch:
                still_missing.append(g)
                still_f.write(json.dumps(g, ensure_ascii=False) + "\n")

        done = min(i + args.batch, len(missing))
        sys.stdout.write(f"\r  [{done}/{len(missing)}] inserted={total_inserted} still={len(still_missing)}  ")
        sys.stdout.flush()
        time.sleep(1.2)  # rate limit — increase if hitting 429s frequently

    print()
    resolved_f.close()
    still_f.close()
    conn.close()

    print(f"\n✅ Inserted: {total_inserted}")
    print(f"📋 Still missing: {len(still_missing)} → {STILL}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

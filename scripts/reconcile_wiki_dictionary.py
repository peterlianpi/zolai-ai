#!/usr/bin/env python3
"""Reconcile wiki vocabulary with the processed dictionary + generated wordlists.

Read-only audit. Prints a worker/summary report. Never edits data.
Usage: python scripts/reconcile_wiki_dictionary.py
"""
from __future__ import annotations
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DICT = ROOT / "data/dictionary/processed/dict_master_v2.json"
WIKI_VOCAB = ROOT / "wiki/vocabulary"
WORDLIST = ROOT / "wiki/vocabulary/wordlists"

# ZVS 2018 banned dialect terms (from wiki README + FORBIDDEN lists)
BANNED = {"pasian", "gam", "tapa", "topa", "bawipa", "kumpipa"}

def headwords_from_wiki() -> set[str]:
    """Extract likely Zolai tokens from wiki vocabulary .md files + wordlists."""
    words: set[str] = set()
    pat = re.compile(r"[a-zA-Z][a-zA-Z'’]*(?:[-\s][a-zA-Z'’]+)*")
    for path in list(WIKI_VOCAB.glob("*.md")) + list(WIKI_VOCAB.glob("wordlists/*.tsv")):
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for m in pat.finditer(text):
            w = m.group(0).strip().lower()
            if 1 < len(w) <= 30 and not w.isdigit():
                words.add(w)
    return words


def wordlist_tsv_files() -> list:
    if not WORDLIST.exists():
        return []
    return list(WORDLIST.glob("*.tsv"))

def reconcile_wordlists(dict_keys: set) -> None:
    print("\n-- Wordlist (TSV) ↔ dictionary headword reconciliation --")
    rows_total = 0
    in_dict = 0
    missing = {}  # zolai -> (english, cefr)
    for tsv in wordlist_tsv_files():
        try:
            txt = tsv.read_text(encoding="utf-8")
        except Exception as e:
            print(f"  !! cannot read {tsv}: {e}")
            continue
        for line in txt.splitlines()[1:]:
            if "\t" not in line:
                continue
            cols = line.split("\t")
            z_raw = (cols[0] or "").strip().lower()
            if not z_raw:
                continue
            eng = cols[1].strip() if len(cols) > 1 else ""
            cefr = cols[3].strip() if len(cols) > 3 else ""
            rows_total += 1
            # extract candidate headwords from the cell, dropping parenthetical
            # annotation like (greek), (arch) and note markers
            cands = set(re.findall(r"[a-z]+(?:['’][a-z]+)?", z_raw))
            for z in cands:
                if not (2 < len(z) <= 30):
                    continue
                if z in dict_keys:
                    in_dict += 1
                else:
                    missing.setdefault(z, (eng, cefr))
    print(f"  Wordlist rows scanned: {rows_total}")
    print(f"  Wordlist clean single tokens matching dictionary: {in_dict} ({in_dict/max(rows_total,1)*100:.1f}%)")
    print(f"  Wordlist-only clean tokens (missing from dictionary): {len(missing)}")
    # sample the biggest gap class: show a few 'common' ones (not proper nouns)
    sample = sorted(missing)[: 0]
    top = [k for k in sorted(missing) if len(k) >= 3 and k not in {
        "aaron","moses","ton","gal","tol","topa","sang","khual","nu","pa"}][:15]
    if top:
        print("  Sample wordlist-only tokens (possible dictionary gaps):")
        for k in top:
            eng, cefr = missing[k]
            print(f"    {k!r}  [{cefr}]  {eng}")

def main() -> int:
    # 1. Dictionary stats
    dict_words: dict[str, dict] = {}
    if DICT.exists():
        dict_words = json.loads(DICT.read_text(encoding="utf-8"))
    print("=== Zolai wiki↔dictionary reconciliation ===")
    print(f"Dictionary entries (dict_master_v2): {len(dict_words)}")

    # 2. Wiki vocab file count
    md = list(WIKI_VOCAB.glob("*.md"))
    print(f"Wiki vocabulary .md files: {len(md)}")

    # 3. Wordlist files
    wl = list(WORDLIST.glob("*")) if WORDLIST.exists() else []
    print(f"Generated wordlist files: {len(wl)}")

    # 4. ZVS banned-term audit of dictionary
    print("\n-- ZVS 2018 banned-term audit (dictionary headwords) --")
    dict_keys = {k.strip().lower() for k in dict_words}
    banned_hits = sorted(dict_keys & BANNED)
    if banned_hits:
        for b in banned_hits:
            print(f"  ⚠ dictionary contains banned/archaic: {b!r}")
    else:
        print("  ✅ no banned dialect headwords in dictionary")

    # 5. Wiki-vocabulary token ↔ dictionary headword coverage (sample)
    print("\n-- Wiki-token ↔ dictionary headword coverage (sampled) --")
    wiki_words = headwords_from_wiki()
    print(f"  Unique lowercased tokens in wiki vocab (raw scan): {len(wiki_words)}")
    overlap = wiki_words & dict_keys
    # tokens that are words (heuristic: likely Zolai 3+ letters not common English)
    print(f"  Tokens present in dictionary: {len(overlap)} ({len(overlap)/max(len(wiki_words),1)*100:.1f}%)")

    reconcile_wordlists(dict_keys)


    print("\n✅ Reconciliation scan completed (read-only, no changes made).")
    return 0

if __name__ == "__main__":
    sys.exit(main())

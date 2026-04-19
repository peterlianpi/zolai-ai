#!/usr/bin/env python3
"""
Clean dict_master_v1.jsonl:
1. Remove English-word headwords (loiter, ankle, diacritical etc.)
2. Remove proper noun fragments (hagar', rekhab' etc.)
3. Shorten long examples to max 12 words
4. Filter noisy English-sentence examples
"""
import json, re, random
from pathlib import Path

MASTER = "data/dictionary/processed/dict_master_v1.jsonl"

EN_SUFFIXES = re.compile(r'(tion|ight|ough|ck$|ical|ism$|ist$|ize$|ful$|less$|ness$|ment$|ance$|ence$|ble$|ank$|ank |wh)', re.I)
EN_WORDS = {
    'ankle','loiter','diacritical','chamberlain','lawyer','doctor','teacher',
    'christian','english','french','german','latin','greek','hebrew',
    'adjective','adverb','pronoun','preposition','conjunction','interjection',
    'verb','noun','suffix','prefix','syllable','grammar','syntax',
}

def is_english_hw(word):
    w = word.lower().strip("'")
    if w in EN_WORDS: return True
    if EN_SUFFIXES.search(w) and len(w) > 5: return True
    if re.search(r'(ck|ght|tion|ical|ism|ize)', w): return True
    return False

def zolai_ratio(text):
    """Fraction of words that look like Zolai (not English)."""
    words = re.findall(r'[a-zA-Z]+', text)
    if not words: return 0
    en = sum(1 for w in words if EN_SUFFIXES.search(w) or w.lower() in EN_WORDS)
    return 1 - (en / len(words))

def best_example(examples):
    """Pick shortest clean example (5-12 words)."""
    scored = []
    for i, ex in enumerate(examples):
        zo = ex.get("zo","").strip()
        if not zo or zolai_ratio(zo) < 0.6: continue
        n = len(zo.split())
        if n < 4: continue
        scored.append((abs(n-7), n, i, ex))
    if not scored: return None
    return sorted(scored)[0][3]

def shorten(ex):
    zo = ex.get("zo","").strip()
    words = zo.split()
    if len(words) <= 12: return ex
    # Split on clause boundaries
    for sep in [" a, ", ", ", " a "]:
        for part in zo.split(sep):
            if 5 <= len(part.split()) <= 12 and zolai_ratio(part) > 0.6:
                return {**ex, "zo": part.strip(), "en": ""}
    return {**ex, "zo": " ".join(words[:10]), "en": ""}


def main():
    import os
    os.chdir(Path(__file__).parent.parent.parent)

    entries = [json.loads(l) for l in open(MASTER, encoding="utf-8")]
    kept = []
    rm_en = rm_frag = fixed = 0

    for e in entries:
        w = e.get("zolai","")
        # Remove English headwords
        if is_english_hw(w): rm_en += 1; continue
        # Remove apostrophe fragments (possessive tails like "hagar'", "'tu")
        if w.endswith("'") or (w.startswith("'") and len(w) <= 4):
            rm_frag += 1; continue

        # Fix examples
        exs = e.get("examples",[])
        if exs:
            b = best_example(exs)
            if b:
                e["examples"] = [shorten(b)]
                fixed += 1
            else:
                e["examples"] = []
        kept.append(e)

    with open(MASTER, "w", encoding="utf-8") as f:
        for e in kept:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")

    total = len(kept)
    has_ex = sum(1 for e in kept if e.get("examples"))
    print(f"Removed English words:    {rm_en}")
    print(f"Removed apostrophe frags: {rm_frag}")
    print(f"Examples shortened/fixed: {fixed}")
    print(f"Total: {total} | Has examples: {has_ex} ({100*has_ex//total}%)")

    print("\n── 10 random examples ──")
    sample = random.sample([e for e in kept if e.get("examples")], 10)
    for e in sample:
        ex = e["examples"][0]
        zo = ex.get("zo","")
        en = ex.get("en","")
        print(f"  {e['zolai']} = {', '.join(e.get('translations',[])[:2])}")
        print(f"    {zo[:70]}")
        if en: print(f"    → {en[:70]}")

if __name__ == "__main__":
    main()

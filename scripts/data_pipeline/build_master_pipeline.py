#!/usr/bin/env python3
"""
All-in-one pipeline:
1. Copy NAH from Parallel/ into TDB77/ so study_bible_books.py finds it
2. Merge all dictionaries into dict_master_v1.jsonl
3. Fix family term bleeding (tanu/tapa/nu/pa)
4. Infer antonyms from negation patterns in bible study files
5. Add CEFR tags based on first_book + frequency
6. Generate instruction pairs from bible study verse alignments
7. Update wiki memory files
"""

import json, re, shutil
from pathlib import Path
from collections import defaultdict, Counter

# ── 1. Copy NAH ────────────────────────────────────────────────────────────────
def fix_nah():
    # Try multiple source locations
    sources = [
        Path("data/corpus/bible/markdown/Parallel/Nahum_Parallel.md"),
        Path("data/corpus/bible/markdown/OT/Nahum_Parallel.md"),
    ]
    dst = Path("data/corpus/bible/markdown/Parallel_Corpus/TDB77/NAH_TDB77_Parallel.md")
    if dst.exists():
        print(f"  NAH already exists at {dst}")
        return
    for src in sources:
        if src.exists():
            shutil.copy(src, dst)
            print(f"✓ Copied NAH: {src.name} → {dst}")
            return
    print("  NAH source not found in any location")


# ── 2. Merge dictionaries ──────────────────────────────────────────────────────

# Family terms: correct primary translations (ZVS-verified)
FAMILY_FIXES = {
    "tanu":   {"primary": "daughter", "block": {"son","sons","child","children","boy","boys"}},
    "tapa":   {"primary": "son",      "block": {"daughter","daughters","girl","girls"}},
    "nu":     {"primary": "mother",   "block": {"father","son","daughter"}},
    "pa":     {"primary": "father",   "block": {"mother","son","daughter"}},
    "ngaknu": {"primary": "girl",     "block": {"boy","son"}},
    "ngakpa": {"primary": "boy",      "block": {"girl","daughter"}},
}

def fix_family_translations(translations, word):
    fix = FAMILY_FIXES.get(word.lower())
    if not fix:
        return translations
    # Remove blocked translations, ensure primary is first
    cleaned = [t for t in translations if t.lower() not in fix["block"]]
    if fix["primary"] not in cleaned:
        cleaned.insert(0, fix["primary"])
    elif cleaned[0] != fix["primary"]:
        cleaned.remove(fix["primary"])
        cleaned.insert(0, fix["primary"])
    return cleaned[:8]


def merge_dicts():
    master = {}

    def add(word, entry):
        w = (word or "").strip().lower()
        if not w or " " in w or len(w) > 35 or w.startswith("-"): return
        if w not in master:
            entry["zolai"] = w
            master[w] = entry
        else:
            for f in ["english","translations","pos","variants","examples",
                      "usage_notes","synonyms","antonyms","related","dialect",
                      "first_book","bible_freq"]:
                if entry.get(f) and not master[w].get(f):
                    master[w][f] = entry[f]
            src = master[w].get("sources",[])
            new = entry.get("sources",[])
            if isinstance(src,list) and isinstance(new,list):
                master[w]["sources"] = list(set(src+new))

    # 1. enriched — best quality, real examples
    print("Loading dict_enriched_v1.jsonl...")
    for line in open("data/dictionary/processed/dict_enriched_v1.jsonl", encoding="utf-8"):
        try: e=json.loads(line); add(e.get("zolai",""), e)
        except: pass

    # 2. semantic — has synonyms/antonyms/related
    print("Loading dict_semantic_v1.jsonl...")
    for line in open("data/dictionary/processed/dict_semantic_v1.jsonl", encoding="utf-8"):
        try: e=json.loads(line); add(e.get("zolai",""), e)
        except: pass

    # 3. bible learned — first_book, freq
    print("Loading dict_bible_learned_v1.jsonl...")
    for line in open("data/dictionary/processed/dict_bible_learned_v1.jsonl", encoding="utf-8"):
        try: e=json.loads(line); add(e.get("zolai",""), e)
        except: pass

    # 4. bible zo_en — translations, related, synonyms
    print("Loading dict_bible_zo_en_v1.jsonl...")
    for line in open("data/dictionary/processed/dict_bible_zo_en_v1.jsonl", encoding="utf-8"):
        try: e=json.loads(line); add(e.get("zolai",""), e)
        except: pass

    # 5. zomidictionary.app raw (33k ZVS entries)
    print("Loading zomidictionary_app_full_v1.jsonl...")
    for line in open("data/dictionary/raw/zomidictionary_app_full_v1.jsonl", encoding="utf-8"):
        try:
            e=json.loads(line)
            zo = e.get("zolai","").split(",")[0].strip()
            add(zo, {"zolai":zo,"english":e.get("english",""),
                     "translations":[e.get("english","")] if e.get("english") else [],
                     "pos":[e.get("part_of_speech","")] if e.get("part_of_speech") else [],
                     "dialect":"tedim","sources":["zomidictionary.app"],"category":"dictionary"})
        except: pass

    # 6. tongdot raw (27k — skip Haka/Falam results)
    print("Loading dict_tongdot_raw_v1.jsonl...")
    for line in open("data/dictionary/raw/dict_tongdot_raw_v1.jsonl", encoding="utf-8"):
        try:
            e=json.loads(line)
            for r in e.get("results",[]):
                if r.get("language","").lower() in ("haka","falam","mizo"): continue
                hw=r.get("headword","").strip(); tr=r.get("translation","").strip()
                if hw and tr:
                    add(hw,{"zolai":hw,"english":tr,"translations":[tr],
                            "sources":["TongDot"],"dialect":"tedim","category":"dictionary"})
        except: pass

    # 7. zomime vocabulary
    print("Loading zomime_vocabulary_v1.jsonl...")
    for line in open("data/dictionary/raw/zomime_vocabulary_v1.jsonl", encoding="utf-8"):
        try:
            e=json.loads(line)
            add(e.get("zolai",""),{"zolai":e.get("zolai",""),"english":e.get("english",""),
                "translations":[e.get("english","")] if e.get("english") else [],
                "sources":["zomi.me"],"dialect":"tedim","category":"dictionary"})
        except: pass

    # 8. wordlists
    for wf in ["data/dictionary/wordlists/wordlist_zo_en_v1.jsonl",
               "data/dictionary/wordlists/zo_en_wordlist_v1.jsonl",
               "data/dictionary/wordlists/zo_en_singlewords_v1.jsonl"]:
        print(f"Loading {wf.split('/')[-1]}...")
        try:
            for line in open(wf, encoding="utf-8"):
                e=json.loads(line); add(e.get("zolai",""), e)
        except: pass

    # 9. combined, zo_tdm, unified — fill remaining gaps
    for df in ["dict_combined_v1.jsonl","dict_zo_tdm_v1.jsonl","dict_unified_v1.jsonl"]:
        print(f"Loading {df}...")
        for line in open(f"data/dictionary/processed/{df}", encoding="utf-8"):
            try:
                e=json.loads(line)
                w=(e.get("headword","") or e.get("zolai","")).strip()
                add(w,{"zolai":w.lower(),
                       "english":(e.get("translations",[""])[0] if e.get("translations") else e.get("english","")),
                       "translations":e.get("translations",[]),
                       "pos":e.get("pos",[]),"sources":e.get("sources",[]),
                       "explanations":[e.get("explanation","")] if e.get("explanation") else e.get("explanations",[])})
            except: pass

    print(f"  Total entries: {len(master)}")
    return master


# ── 3. Antonym inference ───────────────────────────────────────────────────────

def infer_antonyms():
    """Read bible study negation records for antonym inference."""
    neg_context = defaultdict(Counter)
    study_dir = Path("data/dictionary/bible_study")
    for f in sorted(study_dir.glob("*.jsonl")):
        for line in open(f, encoding="utf-8"):
            try:
                rec = json.loads(line)
                if rec.get("type") not in ("negation","compound_neg"): continue
                ctx = [w for w in rec.get("context",[])
                       if w not in ("kei","lo","hi","a","in","uh") and len(w) > 2]
                if len(ctx) >= 2:
                    negated = ctx[0]  # word before negation marker
                    for w in ctx[1:]:
                        if w != negated and "'" not in w:
                            neg_context[negated][w] += 1
            except: pass
    antonyms = {}
    for word, counter in neg_context.items():
        top = [w for w, c in counter.most_common(5) if c >= 2]
        if top:
            antonyms[word] = top
    return antonyms


# ── 4. CEFR tagging ───────────────────────────────────────────────────────────

# Book order index for CEFR — earlier books = more common = lower CEFR
BOOK_INDEX = {b: i for i, b in enumerate([
    "GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT",
    "1SA","2SA","1KI","2KI","1CH","2CH","EZR","NEH","EST",
    "JOB","PSA","PRO","ECC","SNG","ISA","JER","LAM","EZK",
    "DAN","HOS","JOL","AMO","OBA","JON","MIC","NAH","NAM","HAB",
    "ZEP","HAG","ZEC","MAL","MAT","MRK","LUK","JHN","ACT",
    "ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH",
    "1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE",
    "1JN","2JN","3JN","JUD","REV",
])}

def cefr_tag(word, entry):
    freq  = entry.get("bible_freq", 0)
    book  = entry.get("first_book","")
    bidx  = BOOK_INDEX.get(book, 66)

    # High frequency + early book = A1/A2
    if freq > 5000 or bidx <= 5:   return "A1"
    if freq > 1000 or bidx <= 15:  return "A2"
    if freq > 200  or bidx <= 25:  return "B1"
    if freq > 50   or bidx <= 39:  return "B2"
    if freq > 10   or bidx <= 55:  return "C1"
    return "C2"


# ── 5. Instruction pair generation ────────────────────────────────────────────

def generate_instructions(limit=50000):
    """Generate instruction pairs directly from Bible parallel files."""
    instructions = []
    zo_pat  = re.compile(r'^(?:TDB77|Tedim2010|Tedim_Chin):\s*(.+)', re.I)
    en_pat  = re.compile(r'^KJV:\s*(.+)', re.I)
    ref_pat = re.compile(r'\*\*(\d+:\d+)\*\*')

    bible_dir = Path("data/corpus/bible/markdown/Parallel_Corpus/TDB77")
    book_order = [
        "GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT",
        "1SA","2SA","1KI","2KI","1CH","2CH","EZR","NEH","EST",
        "JOB","PSA","PRO","ECC","SNG","ISA","JER","LAM","EZK",
        "DAN","HOS","JOL","AMO","OBA","JON","MIC","NAH","NAM","HAB",
        "ZEP","HAG","ZEC","MAL","MAT","MRK","LUK","JHN","ACT",
        "ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH",
        "1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE",
        "1JN","2JN","3JN","JUD","REV",
    ]
    file_map = {p.stem.replace("_TDB77_Parallel",""): p
                for p in bible_dir.glob("*_Parallel.md")}
    ordered_files = [file_map[b] for b in book_order if b in file_map]

    for fpath in ordered_files:
        book = fpath.stem.replace("_TDB77_Parallel","")
        ref = zo = en = ""
        for raw in open(fpath, encoding="utf-8"):
            line = raw.strip()
            m = ref_pat.match(line)
            if m:
                if zo and en and len(zo) > 10 and len(en) > 10:
                    instructions += [
                        {"instruction": f"Zolai panin English ah let in: {zo}",
                         "output": en, "source": f"{book} {ref}", "category": "translation_zo_en"},
                        {"instruction": f"English panin Zolai ah let in: {en}",
                         "output": zo, "source": f"{book} {ref}", "category": "translation_en_zo"},
                    ]
                    if len(instructions) >= limit:
                        return instructions
                ref = m.group(1); zo = en = ""
                continue
            m = zo_pat.match(line)
            if m and not zo: zo = m.group(1).strip(); continue
            m = en_pat.match(line)
            if m: en = m.group(1).strip()
    return instructions


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    import os
    # Always run from project root
    project_root = Path(__file__).parent.parent.parent
    os.chdir(project_root)
    print(f"Working dir: {Path.cwd()}")

    # 1. Fix NAH
    print("\n── 1. NAH ──")
    fix_nah()

    # 2. Merge
    print("\n── 2. Merging dictionaries ──")
    master = merge_dicts()
    print(f"  Total entries: {len(master)}")

    # 3. Antonyms
    print("\n── 3. Inferring antonyms ──")
    antonyms = infer_antonyms()
    print(f"  Antonym pairs found: {len(antonyms)}")

    # 4. Apply fixes + CEFR + antonyms to master
    print("\n── 4. Applying fixes ──")
    for word, entry in master.items():
        # Fix family terms
        if word in FAMILY_FIXES:
            entry["translations"] = fix_family_translations(
                entry.get("translations", []), word)
            if entry["translations"]:
                entry["english"] = entry["translations"][0]

        # Add antonyms
        if word in antonyms and not entry.get("antonyms"):
            entry["antonyms"] = antonyms[word]

        # CEFR tag
        entry["cefr"] = cefr_tag(word, entry)

        # Ensure ZVS fields exist
        entry.setdefault("zvs_correct", True)
        entry.setdefault("zvs_correction", "")
        entry.setdefault("synonyms", [])
        entry.setdefault("antonyms", [])
        entry.setdefault("related", [])

    # Save master dict
    out_master = Path("data/dictionary/processed/dict_master_v1.jsonl")
    with open(out_master, "w", encoding="utf-8") as f:
        for word, entry in sorted(master.items()):
            entry["zolai"] = word  # normalize to lowercase key
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    print(f"  Saved {len(master)} entries → {out_master}")

    # 5. Generate instruction pairs
    print("\n── 5. Generating instruction pairs ──")
    instructions = generate_instructions(limit=50000)
    out_inst = Path("data/training/instructions_bible_v1.jsonl")
    with open(out_inst, "w", encoding="utf-8") as f:
        for inst in instructions:
            f.write(json.dumps(inst, ensure_ascii=False) + "\n")
    print(f"  Saved {len(instructions)} instruction pairs → {out_inst}")

    # 6. CEFR stats
    cefr_counts = Counter(e.get("cefr","?") for e in master.values())
    print(f"\n── CEFR distribution ──")
    for level in ["A1","A2","B1","B2","C1","C2"]:
        print(f"  {level}: {cefr_counts.get(level,0)}")

    # 7. Update memory
    print("\n── 6. Updating memory ──")
    update_memory(len(master), len(instructions), len(antonyms), cefr_counts)
    print("  Done.")


def update_memory(n_master, n_inst, n_antonyms, cefr_counts):
    entry = f"""
---

## Session: 2026-04-17 (Pipeline Run)

### Outputs
- `dict_master_v1.jsonl` — {n_master} entries (merged enriched + bible_learned + unified)
- `instructions_bible_v1.jsonl` — {n_inst} instruction pairs (ZO↔EN translation)
- Antonyms inferred: {n_antonyms} word pairs from negation patterns
- CEFR tags applied: A1={cefr_counts.get('A1',0)} A2={cefr_counts.get('A2',0)} B1={cefr_counts.get('B1',0)} B2={cefr_counts.get('B2',0)} C1={cefr_counts.get('C1',0)} C2={cefr_counts.get('C2',0)}
- NAH (Nahum) copied to TDB77 folder

### Family Term Fixes
- tanu: daughter (blocked: son/sons/child/children)
- tapa: son (blocked: daughter/daughters)
- nu: mother | pa: father
"""
    with open("wiki/memory/short_term.md", "a", encoding="utf-8") as f:
        f.write(entry)

    long_entry = f"""
---

## 2026-04-17 — Bible Dictionary Pipeline

### Data Assets Created
| File | Size | Description |
|---|---|---|
| `dict_master_v1.jsonl` | ~{n_master} entries | Merged master dictionary |
| `instructions_bible_v1.jsonl` | ~{n_inst} pairs | Bible-derived instruction pairs |
| `data/dictionary/bible_study/` | 65 files | Per-book verse study |

### Key Learnings
- `lo` is valid ZVS negation (3rd person/past) — not Hakha-only
- `kei lo` = compound absolute negation ("none/not any")
- `pathian` = Hakha — always use `pasian` in ZVS
- `sanginn` = correct spelling (not `sanggin`)
- Family terms need explicit blocking to prevent co-occurrence bleeding

### Architecture
- Positional weighting for ZO↔EN alignment
- High-frequency noise filter for `related` field
- CEFR tagging: first_book + frequency → A1–C2
- Antonym inference from negation context patterns
"""
    with open("wiki/memory/long_term.md", "a", encoding="utf-8") as f:
        f.write(long_entry)


if __name__ == "__main__":
    main()

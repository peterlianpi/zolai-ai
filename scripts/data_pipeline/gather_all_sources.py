#!/usr/bin/env python3
"""
Gather ALL Zolai data sources into a single master JSONL.
Covers: corpus, parallel, dictionary, wordlists, phrases,
        bible markdown, corpus/texts, kaggle_dataset, training files.

Unified output schema:
{
  "zolai":     str,   # Zolai/Tedim text (required)
  "english":   str,   # English translation or ""
  "source":    str,   # source file tag
  "type":      str,   # "parallel"|"monolingual"|"dictionary"|"wordlist"|"phrase"
  "dialect":   str,   # "Tedim"|"Zokam"|"unknown"
  "reference": str,   # verse ref, headword, category, etc.
}
"""

import json, re, os
from pathlib import Path

ROOT    = Path(__file__).resolve().parents[2]
DATA    = ROOT / "data"
KAGGLE  = ROOT / "kaggle_dataset"
OUT     = DATA / "master_source_v1.jsonl"

NON_TEDIM = {"HCL06", "FCL"}   # exclude Falam/Hakha; keep Zokam separately tagged

def is_noise(text: str) -> bool:
    if not text or len(text.strip()) < 3:
        return True
    t = text.strip()
    if t.startswith("###") or t.startswith("[INST]") or t.startswith("<s>"):
        return True
    if t.startswith("<!DOCTYPE") or t.startswith("<html"):
        return True
    return False

written = 0
skipped = 0
seen    = set()

def emit(out, record: dict):
    global written, skipped
    zo = record.get("zolai", "").strip()
    if not zo or len(zo) < 3:
        skipped += 1
        return
    record["zolai"] = zo
    if record["type"] == "parallel":
        key = "P|" + zo[:80] + "|" + record.get("english", "")[:40]
    else:
        key = record["type"][0] + "|" + zo[:100]
    if key in seen:
        skipped += 1
        return
    seen.add(key)
    out.write(json.dumps(record, ensure_ascii=False) + "\n")
    written += 1

def rec(zo="", en="", source="", typ="monolingual", dialect="Tedim", ref=""):
    return {"zolai": zo, "english": en, "source": source,
            "type": typ, "dialect": dialect, "reference": ref}

with open(OUT, "w") as out:

    # ── 1. CORPUS UNIFIED ───────────────────────────────────────────────────
    print("1. corpus_unified_v1.jsonl ...")
    with open(DATA / "corpus/corpus_unified_v1.jsonl") as f:
        for line in f:
            d = json.loads(line)
            t = d.get("text", "").strip()
            if is_noise(t): skipped += 1; continue
            emit(out, rec(zo=t, source="corpus_unified"))

    # ── 2. BIBLE 1932 ───────────────────────────────────────────────────────
    print("2. bible_tedim_1932.jsonl ...")
    with open(DATA / "corpus/reference/bible_tedim_1932.jsonl") as f:
        for line in f:
            d = json.loads(line)
            t = d.get("text", "").strip()
            if is_noise(t): skipped += 1; continue
            ref = f"{d.get('book','')} {d.get('chapter','')}:{d.get('verse','')}"
            emit(out, rec(zo=t, source="bible_1932", ref=ref))

    # ── 3. HYMNS ────────────────────────────────────────────────────────────
    print("3. tedim_hymns_v1.jsonl ...")
    with open(DATA / "corpus/reference/tedim_hymns_v1.jsonl") as f:
        for line in f:
            d = json.loads(line)
            t = d.get("lyrics", "").strip()
            if is_noise(t): skipped += 1; continue
            emit(out, rec(zo=t, source="hymns", ref=d.get("title", "")))

    # ── 4. BIBLE MARKDOWN (TDB77 + Tedim2010 + KJV parallel) ────────────────
    print("4. bible markdown (TDB77 + Tedim2010 parallel) ...")
    bible_md_path = DATA / "corpus/bible/markdown/Parallel_Corpus"
    for dialect_dir, dialect_tag in [("TDB77", "Tedim"), ("Tedim_Chin", "Tedim")]:
        dpath = bible_md_path / dialect_dir
        if not dpath.exists():
            continue
        prefix = "TDB77:" if dialect_dir == "TDB77" else "Tedim2010:"
        kjv_prefix = "KJV:"
        for fname in sorted(os.listdir(dpath)):
            if not fname.endswith(".md"):
                continue
            book_code = fname.split("_")[0]
            zo_verse = en_verse = ref = ""
            with open(dpath / fname) as f:
                for line in f:
                    line = line.strip()
                    m = re.match(r'\*\*(.+?)\*\*', line)
                    if m:
                        ref = f"{book_code} {m.group(1)}"
                        zo_verse = en_verse = ""
                    elif line.startswith(prefix):
                        zo_verse = line[len(prefix):].strip()
                    elif line.startswith(kjv_prefix):
                        en_verse = line[len(kjv_prefix):].strip()
                    # emit when we have both
                    if zo_verse and en_verse and ref:
                        if not is_noise(zo_verse):
                            emit(out, rec(zo=zo_verse, en=en_verse,
                                         source=f"bible_md_{dialect_dir.lower()}",
                                         typ="parallel", ref=ref))
                        zo_verse = en_verse = ""

    # ── 5. CORPUS TEXTS (markdown/txt files) ────────────────────────────────
    print("5. corpus/texts/*.md ...")
    texts_path = DATA / "corpus/texts"
    skip_texts = {"Zokam_Standard_Version_Bible"}  # Zokam dialect — tag separately
    for fname in os.listdir(texts_path):
        fpath = texts_path / fname
        if fname in skip_texts or fpath.is_dir():
            continue
        if not (fname.endswith(".md") or fname.endswith(".txt")):
            continue
        if fname == "zolai_sinna_raw.txt":
            continue  # HTML dump, not usable
        try:
            text = fpath.read_text(errors="ignore")
        except Exception:
            continue
        # Split into paragraphs, emit each non-noise paragraph
        for para in re.split(r'\n{2,}', text):
            para = para.strip()
            # Skip markdown headers, code blocks, table rows
            if para.startswith("#") or para.startswith("|") or para.startswith("```"):
                continue
            if is_noise(para):
                continue
            emit(out, rec(zo=para, source=f"texts_{fname[:20]}", ref=fname))

    # ── 6. ZOKAM BIBLE (separate dialect tag) ───────────────────────────────
    print("6. Zokam Standard Version Bible ...")
    zokam_path = texts_path / "Zokam_Standard_Version_Bible"
    if zokam_path.exists():
        for fpath in zokam_path.rglob("*.md"):
            try:
                text = fpath.read_text(errors="ignore")
            except Exception:
                continue
            for para in re.split(r'\n{2,}', text):
                para = para.strip()
                if para.startswith("#") or para.startswith("|") or is_noise(para):
                    continue
                emit(out, rec(zo=para, source="zokam_bible",
                              dialect="Zokam", ref=fpath.name))

    # ── 7. PARALLEL PAIRS ───────────────────────────────────────────────────
    print("7. zo_en_pairs_combined_v1.jsonl ...")
    with open(DATA / "parallel/zo_en_pairs_combined_v1.jsonl") as f:
        for line in f:
            d = json.loads(line)
            zo = d.get("zolai", "").strip()
            en = d.get("english", "").strip()
            if is_noise(zo) or d.get("dialect", "") in NON_TEDIM: skipped += 1; continue
            emit(out, rec(zo=zo, en=en, source="parallel_combined",
                          typ="parallel", ref=d.get("reference", "")))

    print("7b. zo_en_pairs_master_v1.jsonl ...")
    with open(DATA / "parallel/zo_en_pairs_master_v1.jsonl") as f:
        for line in f:
            d = json.loads(line)
            zo = d.get("output", "").strip()
            en = d.get("input", "").strip()
            meta = d.get("metadata", {})
            ref = meta.get("reference", "") if isinstance(meta, dict) else ""
            if is_noise(zo): skipped += 1; continue
            emit(out, rec(zo=zo, en=en, source="parallel_master",
                          typ="parallel", ref=ref))

    for fname, tag in [
        ("bible_parallel_tdb77_kjv.jsonl",     "bible_tdb77"),
        ("bible_parallel_tbr17_kjv.jsonl",     "bible_tbr17"),
        ("bible_parallel_tedim2010_kjv.jsonl", "bible_tedim2010"),
    ]:
        print(f"7c. {fname} ...")
        with open(DATA / "parallel" / fname) as f:
            for line in f:
                d = json.loads(line)
                zo = d.get("output", "").strip()
                en = d.get("input", "").strip()
                meta = d.get("metadata", {})
                ref = meta.get("reference", "") if isinstance(meta, dict) else ""
                if is_noise(zo): skipped += 1; continue
                emit(out, rec(zo=zo, en=en, source=tag, typ="parallel", ref=ref))

    # ── 8. DICTIONARY ───────────────────────────────────────────────────────
    print("8. dict_semantic_v1.jsonl ...")
    with open(DATA / "dictionary/processed/dict_semantic_v1.jsonl") as f:
        for line in f:
            d = json.loads(line)
            zo = d.get("zolai", "").strip()
            en = d.get("english", "").strip()
            if is_noise(zo) or d.get("dialect", "") in NON_TEDIM: skipped += 1; continue
            emit(out, rec(zo=zo, en=en, source="dict_semantic",
                          typ="dictionary", ref=d.get("category", "")))

    print("8b. dict_unified_v1.jsonl ...")
    with open(DATA / "dictionary/processed/dict_unified_v1.jsonl") as f:
        for line in f:
            d = json.loads(line)
            zo = d.get("headword", "").strip()
            trans = d.get("translations", [])
            en = trans[0] if trans and isinstance(trans[0], str) else ""
            if is_noise(zo): skipped += 1; continue
            emit(out, rec(zo=zo, en=en, source="dict_unified",
                          typ="dictionary", ref=d.get("pos", "")))

    print("8c. dict_combined_v1.jsonl ...")
    with open(DATA / "dictionary/processed/dict_combined_v1.jsonl") as f:
        for line in f:
            d = json.loads(line)
            zo = d.get("headword", "").strip()
            trans = d.get("translations", [])
            en = trans[0] if trans and isinstance(trans[0], str) else ""
            if is_noise(zo): skipped += 1; continue
            emit(out, rec(zo=zo, en=en, source="dict_combined",
                          typ="dictionary", ref=d.get("pos", "")))

    print("8d. dict_enriched_v1.jsonl ...")
    with open(DATA / "dictionary/processed/dict_enriched_v1.jsonl") as f:
        for line in f:
            d = json.loads(line)
            zo = d.get("zolai", "").strip()
            en = d.get("english", "").strip()
            if is_noise(zo) or d.get("dialect", "") in NON_TEDIM: skipped += 1; continue
            emit(out, rec(zo=zo, en=en, source="dict_enriched",
                          typ="dictionary", ref=d.get("category", "")))

    print("8e. dict_en_zo_v1.jsonl ...")
    with open(DATA / "dictionary/processed/dict_en_zo_v1.jsonl") as f:
        for line in f:
            d = json.loads(line)
            zo = d.get("zolai", "").strip()
            en = d.get("english", "").strip()
            if is_noise(zo) or d.get("dialect", "") in NON_TEDIM: skipped += 1; continue
            emit(out, rec(zo=zo, en=en, source="dict_en_zo",
                          typ="dictionary", ref=d.get("category", "")))

    print("8f. dict_zo_tdm_v1.jsonl ...")
    with open(DATA / "dictionary/processed/dict_zo_tdm_v1.jsonl") as f:
        for line in f:
            d = json.loads(line)
            zo = d.get("headword", "").strip()
            trans = d.get("translations", [])
            en = trans[0] if trans and isinstance(trans[0], str) else ""
            if is_noise(zo): skipped += 1; continue
            emit(out, rec(zo=zo, en=en, source="dict_zo_tdm",
                          typ="dictionary", ref=d.get("pos", "")))

    print("8g. master_zo_tdm_dict_raw.json ...")
    raw_dict = json.load(open(DATA / "dictionary/raw/master_zo_tdm_dict_raw.json"))
    for key, val in raw_dict.items():
        if not isinstance(val, dict): continue
        zo = val.get("headword", key).strip()
        trans = val.get("translations", [])
        en = trans[0] if trans and isinstance(trans[0], str) else ""
        if is_noise(zo): skipped += 1; continue
        emit(out, rec(zo=zo, en=en, source="dict_zo_tdm_raw",
                      typ="dictionary", ref=val.get("pos", [""])[0] if val.get("pos") else ""))

    print("8h. dict_tongdot_raw_v1.jsonl ...")
    with open(DATA / "dictionary/raw/dict_tongdot_raw_v1.jsonl") as f:
        for line in f:
            d = json.loads(line)
            for res in d.get("results", []):
                if not isinstance(res, dict): continue
                zo = res.get("zolai", res.get("word", "")).strip()
                en = res.get("english", res.get("definition", "")).strip()
                if is_noise(zo): skipped += 1; continue
                emit(out, rec(zo=zo, en=en, source="dict_tongdot",
                              typ="dictionary", ref=d.get("query", "")))

    print("8i. zomidictionary_export_v1.jsonl ...")
    with open(DATA / "dictionary/raw/zomidictionary_export_v1.jsonl") as f:
        for line in f:
            d = json.loads(line)
            zo = d.get("zolai", "").strip()
            en = d.get("english", "").strip()
            if is_noise(zo) or d.get("dialect", "") in NON_TEDIM: skipped += 1; continue
            emit(out, rec(zo=zo, en=en, source="zomidictionary",
                          typ="dictionary", ref=d.get("category", "")))

    # ── 9. WORDLISTS ────────────────────────────────────────────────────────
    for fname, tag in [
        ("zo_en_wordlist_v1.jsonl",    "wordlist_zo_en"),
        ("wordlist_zo_en_v1.jsonl",    "wordlist_zo_en2"),
        ("wordlist_en_zo_v1.jsonl",    "wordlist_en_zo"),
        ("zo_en_singlewords_v1.jsonl", "wordlist_single"),
    ]:
        print(f"9. {fname} ...")
        with open(DATA / "dictionary/wordlists" / fname) as f:
            for line in f:
                d = json.loads(line)
                zo = d.get("zolai", "").strip()
                en = d.get("english", "").strip()
                if is_noise(zo) or d.get("dialect", "") in NON_TEDIM: skipped += 1; continue
                emit(out, rec(zo=zo, en=en, source=tag, typ="wordlist",
                              ref=d.get("pos", "")))

    print("9b. zolai_word_list.txt ...")
    with open(DATA / "dictionary/wordlists/zolai_word_list.txt", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if not line or is_noise(line): skipped += 1; continue
            # Format: "word: (pos.) definition"
            parts = line.split(":", 1)
            zo = parts[0].strip()
            en = parts[1].strip() if len(parts) > 1 else ""
            if is_noise(zo): skipped += 1; continue
            emit(out, rec(zo=zo, en=en, source="wordlist_txt", typ="wordlist"))

    print("9c. phrases_v1.jsonl ...")
    with open(DATA / "dictionary/processed/phrases_v1.jsonl") as f:
        for line in f:
            d = json.loads(line)
            zo = d.get("zo", "").strip()
            en = d.get("en", "").strip()
            if is_noise(zo): skipped += 1; continue
            emit(out, rec(zo=zo, en=en, source="phrases", typ="phrase",
                          ref=d.get("type", "")))

    # ── 10. TRAINING FILES (clean Tedim only) ────────────────────────────────
    for fname, tag in [
        ("llm_train.jsonl", "llm_train"),
        ("llm_val.jsonl",   "llm_val"),
        ("llm_test.jsonl",  "llm_test"),
    ]:
        print(f"10. {fname} (clean Tedim only) ...")
        with open(DATA / "training" / fname) as f:
            for line in f:
                d = json.loads(line)
                t = d.get("text", "").strip()
                dialect = d.get("dialect", "unknown")
                if is_noise(t) or dialect in NON_TEDIM: skipped += 1; continue
                emit(out, rec(zo=t, source=tag))

    # ── 11. KAGGLE DATASET (has richer metadata: level, source_type, pos) ───
    print("11. kaggle_dataset/llm_train.jsonl (clean Tedim only) ...")
    with open(KAGGLE / "llm_train.jsonl") as f:
        for line in f:
            d = json.loads(line)
            t = d.get("text", "").strip()
            dialect = d.get("dialect", "unknown")
            if is_noise(t) or dialect in NON_TEDIM: skipped += 1; continue
            emit(out, rec(zo=t, source="kaggle_train",
                          ref=d.get("source_type", "")))

    # ── 12. WIKI MARKDOWN TABLES (vocabulary, grammar, translation, literature)
    print("12. wiki/ markdown tables (ZO/EN pairs) ...")
    WIKI = ROOT / "wiki"
    wiki_folders = ["vocabulary", "grammar", "translation", "literature",
                    "linguistics", "culture", "register", "particles",
                    "pronouns", "negation", "numbers", "glossary", "mistakes"]
    for folder in wiki_folders:
        fpath = WIKI / folder
        if not fpath.exists():
            continue
        for md in fpath.rglob("*.md"):
            try:
                text = md.read_text(errors="ignore")
            except Exception:
                continue
            for line in text.splitlines():
                # Match markdown table rows: | ZO | EN | ...
                parts = [p.strip() for p in line.split("|") if p.strip()]
                if len(parts) < 2:
                    continue
                zo = parts[0]
                en = parts[1]
                # Skip header rows and separator rows
                if zo.startswith("-") or en.startswith("-"):
                    continue
                if zo.lower() in ("zolai", "zo", "word", "phrase", "term",
                                  "english", "en", "pattern", "example"):
                    continue
                if is_noise(zo) or is_noise(en):
                    continue
                # Must look like actual Zolai (contains common chars)
                if len(zo) < 3 or len(en) < 3:
                    continue
                emit(out, rec(zo=zo, en=en, source=f"wiki_{folder}",
                              typ="wordlist", ref=md.name))

    # ── 13. BILINGUAL NEWS (data/corpus/news/*.md) ──────────────────────────
    print("13. data/corpus/news/*.md ...")
    news_path = DATA / "corpus/news"
    if news_path.exists():
        for md in news_path.glob("*.md"):
            try:
                text = md.read_text(errors="ignore")
            except Exception:
                continue
            # Extract Zolai blocks (inside ``` or after "Zolai Translation:" label)
            zo_blocks = re.findall(r'```\s*\n(.*?)\n```', text, re.DOTALL)
            for block in zo_blocks:
                block = block.strip()
                if is_noise(block):
                    continue
                emit(out, rec(zo=block, source="news_zolai",
                              ref=md.name))

# ── SUMMARY ──────────────────────────────────────────────────────────────────
print(f"\n{'='*55}")
print(f"Written : {written:,}")
print(f"Skipped : {skipped:,}")
print(f"Output  : {OUT}")

from collections import Counter
sources = Counter()
types   = Counter()
dialects = Counter()
has_en  = 0
with open(OUT) as f:
    for line in f:
        d = json.loads(line)
        sources[d["source"]] += 1
        types[d["type"]] += 1
        dialects[d["dialect"]] += 1
        if d.get("english"): has_en += 1

total = sum(sources.values())
print(f"Total   : {total:,} | With English: {has_en:,} ({has_en/total*100:.1f}%)")
print("\nBy source:")
for k, v in sources.most_common():
    print(f"  {v:>10,}  {k}")
print("\nBy type:")
for k, v in types.most_common():
    print(f"  {v:>10,}  {k}")
print("\nBy dialect:")
for k, v in dialects.most_common():
    print(f"  {v:>10,}  {k}")

import subprocess
sz = subprocess.check_output(["du", "-sh", str(OUT)]).decode().split()[0]
print(f"\nFile size: {sz}")

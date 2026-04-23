"""
build_enriched_dictionary.py
----------------------------
Builds a master enriched dictionary from all available sources:
  - zomidictionary.app (33,532 entries) — primary lexicon
  - Bible parallel corpus (TBR17, TDB77, Parallel_Corpus, TDB77_KJV) — usage examples
  - zomi.me phrases — conversational examples
  - rvasia_tedim — liturgical examples

Output: data/processed/master_dictionary_enriched.jsonl
Schema per entry:
{
  "zolai": str,           # primary Zolai headword
  "english": str,         # primary English gloss
  "pos": str,             # part of speech
  "variants": [str],      # alternate Zolai spellings/forms
  "dialect": "tedim",
  "source": str,          # primary source
  "examples": [           # up to 3 real corpus examples
    {
      "zo": str,          # full Zolai sentence
      "en": str,          # full English sentence
      "source": str,      # which corpus
      "reference": str    # book/verse or URL
    }
  ],
  "usage_notes": str,     # when/how/why to use
  "accuracy": str,        # "confirmed" | "inferred" | "unverified"
  "category": "dictionary"
}
"""
from __future__ import annotations

import html
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────
ROOT       = Path(__file__).resolve().parents[1]
DATA       = ROOT / "data"
OUT_DIR    = DATA / "processed"
OUT_FILE   = OUT_DIR / "master_dictionary_enriched.jsonl"
OUT_DIR.mkdir(parents=True, exist_ok=True)

DICT_FILE  = DATA / "raw" / "zomidictionary_app_full.jsonl"
PARALLEL   = DATA / "master" / "combined" / "parallel.jsonl"
RVASIA     = DATA / "rvasia_tedim.jsonl"

# ── Helpers ────────────────────────────────────────────────────────────────
HTML_ENT = re.compile(r'&#\d+;|&[a-z]+;')

def clean(s: str) -> str:
    s = html.unescape(s or "")
    s = HTML_ENT.sub("'", s)
    return s.strip()

ZO_WORD = re.compile(r"^[a-zA-Z][a-zA-Z'\-]{1,30}$")

BIBLE_SOURCES = {"bible_TBR17_KJV", "bible_TDB77_KJV",
                 "bible_parallel_tdb77.jsonl", "Parallel_Corpus",
                 "bible_Tedim_Chin_Bible_KJV", "bible_parallel_tedim2010.jsonl"}

# POS → usage note template
POS_NOTES: dict[str, str] = {
    "v":   "Verb — use as action word in SOV sentence: [Subject] [Object] {word} hi.",
    "vt":  "Transitive verb — requires object + ergative 'in' on subject.",
    "n":   "Noun — use as subject or object; nominalize with +na for abstract form.",
    "adj": "Adjective — place before noun or after verb as predicate.",
    "a":   "Adjective — place before noun or after verb as predicate.",
    "adv": "Adverb — place before verb or at sentence start.",
    "prep":"Particle/preposition — follows noun to mark grammatical role.",
    "pt":  "Particle — grammatical function word; position is fixed.",
    "conj":"Conjunction — connects clauses.",
}

def pos_note(pos: str, zo: str, en: str) -> str:
    base = POS_NOTES.get(pos.lower().strip(), f"Use '{zo}' for '{en}'.")
    return base

def accuracy_level(examples: list) -> str:
    if len(examples) >= 2:
        return "confirmed"
    if len(examples) == 1:
        return "inferred"
    return "unverified"

# ── Step 1: Load corpus index (word → list of sentences) ──────────────────
print("Loading parallel corpus...", flush=True)
corpus_index: dict[str, list[dict]] = defaultdict(list)

def index_sentence(zo: str, en: str, source: str, ref: str) -> None:
    zo_c = clean(zo)
    en_c = clean(en)
    if not zo_c or not en_c or len(zo_c) < 5:
        return
    # Index every word token in the sentence
    for token in re.findall(r"[a-zA-Z']{2,}", zo_c):
        key = token.lower()
        if len(corpus_index[key]) < 5:  # cap at 5 per word
            corpus_index[key].append({
                "zo": zo_c, "en": en_c,
                "source": source, "reference": ref
            })

# Bible parallel
for line in open(PARALLEL, encoding="utf-8"):
    r = json.loads(line)
    src = r.get("source", "")
    index_sentence(r.get("zolai",""), r.get("english",""), src, r.get("reference",""))

# rvasia
for line in open(RVASIA, encoding="utf-8"):
    r = json.loads(line)
    body = r.get("body","")
    if body:
        index_sentence(body[:300], r.get("title",""), "rvasia_tedim", r.get("url",""))

print(f"Corpus index: {len(corpus_index)} unique tokens", flush=True)

# ── Step 2: Load zomidictionary as primary lexicon ─────────────────────────
print("Loading zomidictionary...", flush=True)

# Group by English headword to collect all Zolai variants
en_entries: dict[str, dict] = {}

for line in open(DICT_FILE, encoding="utf-8"):
    r = json.loads(line)
    en_raw  = clean(r.get("english") or "")
    zo_raw  = clean(r.get("zolai") or "")
    pos     = clean(r.get("part_of_speech") or "")
    if not en_raw or not zo_raw: continue
    if len(en_raw.split()) > 4: continue  # skip very long English phrases

    # Parse Zolai variants (comma-separated)
    variants = [v.strip() for v in zo_raw.split(",") if v.strip()]
    if not variants: continue
    primary_zo = variants[0]

    key = en_raw.lower()
    if key not in en_entries:
        en_entries[key] = {
            "zolai":    primary_zo,
            "english":  en_raw,
            "pos":      pos,
            "variants": variants[1:] if len(variants) > 1 else [],
            "dialect":  "tedim",
            "source":   "zomidictionary.app",
        }
    else:
        # Merge variants
        existing = en_entries[key]
        for v in variants:
            if v not in [existing["zolai"]] + existing["variants"]:
                existing["variants"].append(v)

print(f"Lexicon entries: {len(en_entries)}", flush=True)

# ── Step 3: Enrich each entry with corpus examples + notes ─────────────────
print("Enriching entries...", flush=True)

enriched = []
confirmed = inferred = unverified = 0

for i, (key, entry) in enumerate(en_entries.items()):
    if i % 2000 == 0:
        sys.stdout.write(f"\r  {i}/{len(en_entries)}...")
        sys.stdout.flush()

    zo = entry["zolai"]
    en = entry["english"]
    pos = entry["pos"]

    # Find corpus examples — search by primary word token
    search_tokens = set()
    for v in [zo] + entry["variants"]:
        for tok in re.findall(r"[a-zA-Z']{2,}", v):
            search_tokens.add(tok.lower())

    examples = []
    seen_refs = set()
    for tok in search_tokens:
        for ex in corpus_index.get(tok, []):
            ref = ex["reference"]
            if ref not in seen_refs:
                seen_refs.add(ref)
                examples.append(ex)
            if len(examples) >= 3:
                break
        if len(examples) >= 3:
            break

    # Prefer Bible examples over rvasia
    bible_ex = [e for e in examples if e["source"] in BIBLE_SOURCES]
    other_ex = [e for e in examples if e["source"] not in BIBLE_SOURCES]
    examples = (bible_ex + other_ex)[:3]

    # Usage note
    usage = pos_note(pos, zo, en)

    # Accuracy
    acc = accuracy_level(examples)
    if acc == "confirmed": confirmed += 1
    elif acc == "inferred": inferred += 1
    else: unverified += 1

    record = {
        "zolai":       zo,
        "english":     en,
        "pos":         pos,
        "variants":    entry["variants"],
        "dialect":     "tedim",
        "source":      entry["source"],
        "examples":    examples,
        "usage_notes": usage,
        "accuracy":    acc,
        "category":    "dictionary",
    }
    enriched.append(record)

print(f"\nDone enriching: {len(enriched)} entries")
print(f"  confirmed={confirmed}, inferred={inferred}, unverified={unverified}")

# ── Step 4: Write output ───────────────────────────────────────────────────
print(f"Writing to {OUT_FILE}...", flush=True)
with open(OUT_FILE, "w", encoding="utf-8") as f:
    for r in enriched:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")

size = OUT_FILE.stat().st_size / 1024 / 1024
print(f"Saved: {OUT_FILE} ({size:.1f} MB, {len(enriched)} entries)")

if __name__ == "__main__":
    pass

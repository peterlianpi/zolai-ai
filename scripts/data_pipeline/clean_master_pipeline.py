#!/usr/bin/env python3
"""
Zolai Master Data Cleaning Pipeline
====================================
Cleans all dataset categories using pandas, spaCy, NLTK, and clean-text.
Produces one clean JSONL per category + a unified master JSONL.

Categories:
  - monolingual   → data/clean/monolingual.jsonl
  - parallel      → data/clean/parallel.jsonl
  - dictionary    → data/clean/dictionary.jsonl
  - instructions  → data/clean/instructions.jsonl
  - orpo          → data/clean/orpo.jsonl
  - eval          → data/clean/eval.jsonl
  - master        → data/clean/master.jsonl  (all categories combined)

Usage:
    python scripts/data_pipeline/clean_master_pipeline.py
    python scripts/data_pipeline/clean_master_pipeline.py --dry-run
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import unicodedata
from pathlib import Path

import nltk
import pandas as pd
import spacy
from cleantext import clean

# ── Setup ─────────────────────────────────────────────────────────────────────
nltk.download("punkt_tab", quiet=True)
nltk.download("stopwords", quiet=True)

nlp = spacy.load("en_core_web_sm", disable=["parser", "tagger", "lemmatizer"])

DATA = Path("data")
OUT  = DATA / "clean"
OUT.mkdir(parents=True, exist_ok=True)

# ZVS forbidden dialect words (Chin/FCL variants)
FORBIDDEN = re.compile(
    r"\b(pathian|fapa|bawipa|siangpahrang)\b|\bram\b|\bcu\b|\bcun\b",
    re.IGNORECASE,
)
# Noise patterns
NOISE = re.compile(r"^#{1,6}\s+|^\s*[-*•]\s+", re.MULTILINE)
ENCODING_JUNK = re.compile(r"[â€™Ã\x80-\x9f]")


# ── Core cleaners ─────────────────────────────────────────────────────────────

def clean_zo(text: str) -> str:
    """Clean a Zolai text field."""
    if not text:
        return ""
    text = unicodedata.normalize("NFC", text)
    text = NOISE.sub("", text)
    text = ENCODING_JUNK.sub("", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def clean_en(text: str) -> str:
    """Clean an English text field using clean-text + spaCy NER removal."""
    if not text:
        return ""
    text = clean(
        text,
        fix_unicode=True,
        to_ascii=False,       # keep non-ASCII (Zolai chars)
        lower=False,
        no_urls=True,
        no_emails=True,
        no_phone_numbers=True,
        no_emoji=True,
        no_punct=False,
    )
    text = NOISE.sub("", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def remove_en_entities(text: str) -> str:
    """Replace named entities in English text with their label placeholder."""
    doc = nlp(text[:1000])  # cap for speed
    result = text
    for ent in reversed(doc.ents):
        if ent.label_ in ("PERSON", "GPE", "ORG", "LOC"):
            result = result[: ent.start_char] + f"[{ent.label_}]" + result[ent.end_char :]
    return result


def is_forbidden(text: str) -> bool:
    return bool(FORBIDDEN.search(text or ""))


def fingerprint(record: dict) -> str:
    key = json.dumps(record, sort_keys=True, ensure_ascii=False)
    return hashlib.md5(key.encode()).hexdigest()


# ── Per-category processors ───────────────────────────────────────────────────

def process_monolingual(rows: list[dict]) -> list[dict]:
    """Clean monolingual Zolai sentences."""
    out = []
    for r in rows:
        text = clean_zo(r.get("text", ""))
        if not text or len(text) < 8:
            continue
        if is_forbidden(text):
            continue
        out.append({
            "text": text,
            "source": r.get("source", ""),
            "dialect": "Tedim",
            "type": "monolingual",
        })
    return out


def process_parallel(rows: list[dict]) -> list[dict]:
    """Clean bilingual ZO↔EN pairs."""
    out = []
    for r in rows:
        zo = clean_zo(r.get("zolai", "") or r.get("zo", ""))
        en = clean_en(r.get("english", "") or r.get("en", ""))
        if not zo or not en or len(zo) < 5 or len(en) < 5:
            continue
        if is_forbidden(zo):
            continue
        out.append({
            "zolai": zo,
            "english": en,
            "source": r.get("source", ""),
            "dialect": "Tedim",
            "type": "parallel",
        })
    return out


def process_dictionary(rows: list[dict]) -> list[dict]:
    """Clean dictionary entries."""
    out = []
    for r in rows:
        zo = clean_zo(r.get("zolai", ""))
        en = clean_en(r.get("english", ""))
        if not zo or not en:
            continue
        if is_forbidden(zo):
            continue
        entry = {
            "zolai": zo,
            "english": en,
            "pos": r.get("pos", ""),
            "dialect": "Tedim",
            "source": r.get("source", ""),
            "type": "dictionary",
        }
        if r.get("example_zo"):
            entry["example_zo"] = clean_zo(r["example_zo"])
        if r.get("example_en"):
            entry["example_en"] = clean_en(r["example_en"])
        out.append(entry)
    return out


def process_instructions(rows: list[dict]) -> list[dict]:
    """Clean instruction-tuning records."""
    out = []
    for r in rows:
        instruction = clean_en(r.get("instruction", ""))
        output = clean_zo(r.get("output", ""))
        if not instruction or not output:
            continue
        if is_forbidden(output):
            continue
        out.append({
            "instruction": instruction,
            "output": output,
            "source": r.get("source", ""),
            "category": r.get("category", ""),
            "type": "instruction",
        })
    return out


def process_orpo(rows: list[dict]) -> list[dict]:
    """Clean ORPO preference pairs — keep only valid ZVS chosen."""
    out = []
    for r in rows:
        chosen = clean_zo(r.get("chosen", ""))
        rejected = clean_zo(r.get("rejected", ""))
        prompt = clean_en(r.get("prompt", ""))
        if not chosen or not rejected or not prompt:
            continue
        if is_forbidden(chosen):
            continue
        out.append({
            "prompt": prompt,
            "chosen": chosen,
            "rejected": rejected,
            "rule": r.get("rule", ""),
            "type": "orpo",
        })
    return out


def process_eval(rows: list[dict]) -> list[dict]:
    """Clean eval/QA records."""
    out = []
    for r in rows:
        q = clean_en(r.get("question", ""))
        a = clean_zo(r.get("answer", ""))
        if not q or not a:
            continue
        out.append({
            "id": r.get("id", ""),
            "question": q,
            "answer": a,
            "domain": r.get("domain", ""),
            "direction": r.get("direction", ""),
            "type": "eval",
        })
    return out


# ── I/O helpers ───────────────────────────────────────────────────────────────

def read_jsonl(path: Path) -> list[dict]:
    rows = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    rows.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return rows


def write_jsonl(rows: list[dict], path: Path) -> None:
    with open(path, "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def dedup(rows: list[dict]) -> list[dict]:
    seen: set[str] = set()
    out = []
    for r in rows:
        fp = fingerprint(r)
        if fp not in seen:
            seen.add(fp)
            out.append(r)
    return out


def stats(label: str, before: int, after: int) -> None:
    dropped = before - after
    pct = dropped / before * 100 if before else 0
    print(f"  {label:20s}  {before:>8,} → {after:>8,}  (dropped {dropped:,}, {pct:.1f}%)")


# ── Main ──────────────────────────────────────────────────────────────────────

SOURCES: dict[str, tuple[list[Path], callable]] = {
    "monolingual": (
        [DATA / "training" / "llm_train_v3.jsonl"],
        process_monolingual,
    ),
    "parallel": (
        [DATA / "parallel" / "zo_en_pairs_combined_v1.jsonl",
         DATA / "parallel" / "bible_parallel_tdb77_kjv.jsonl",
         DATA / "parallel" / "bible_parallel_tbr17_kjv.jsonl",
         DATA / "parallel" / "bible_parallel_tedim2010_kjv.jsonl"],
        process_parallel,
    ),
    "dictionary": (
        [DATA / "dictionary" / "processed" / "zvs_final_master_dictionary_v3.jsonl"],
        process_dictionary,
    ),
    "instructions": (
        [DATA / "training" / "instructions_bible_v1.jsonl"],
        process_instructions,
    ),
    "orpo": (
        [DATA / "training" / "orpo_pairs_v1.jsonl"],
        process_orpo,
    ),
    "eval": (
        [DATA / "eval" / "zolai_qa_v1.jsonl"],
        process_eval,
    ),
}


def main(dry_run: bool = False) -> None:
    print(f"\n{'DRY RUN — ' if dry_run else ''}Zolai Master Cleaning Pipeline\n{'='*50}")
    master: list[dict] = []

    for category, (paths, processor) in SOURCES.items():
        raw: list[dict] = []
        for p in paths:
            if p.exists():
                raw.extend(read_jsonl(p))
            else:
                print(f"  [WARN] missing: {p}")

        if not raw:
            print(f"  {category}: no data found, skipping")
            continue

        cleaned = processor(raw)
        cleaned = dedup(cleaned)

        stats(category, len(raw), len(cleaned))

        if not dry_run:
            out_path = OUT / f"{category}.jsonl"
            write_jsonl(cleaned, out_path)
            print(f"    → {out_path}")

        master.extend(cleaned)

    master = dedup(master)
    print(f"\n  {'MASTER':20s}  {len(master):>8,} total records")

    if not dry_run:
        master_path = OUT / "master.jsonl"
        write_jsonl(master, master_path)
        print(f"    → {master_path}")

        # Summary CSV via pandas
        df = pd.DataFrame(master)
        summary = df.groupby("type").size().reset_index(name="count")
        summary.to_csv(OUT / "master_summary.csv", index=False)
        print(f"    → {OUT / 'master_summary.csv'}")

    print("\nDone.\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    main(dry_run=args.dry_run)

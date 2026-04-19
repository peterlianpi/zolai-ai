"""
Scan ALL JSONL files in the project, classify each record into one of 4 categories,
clean, deduplicate, and write to:

  data/combined/sentences.jsonl      — monolingual Zolai text
  data/combined/parallel.jsonl       — bilingual EN↔Zolai verse/sentence pairs
  data/combined/instructions.jsonl   — instruction / input / output tuning records
  data/combined/dictionary.jsonl     — headword + translations lexicon entries

Usage:
    python scripts/combine_and_categorize.py [--output-dir data/combined]
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
OUT_DIR_DEFAULT = "data/combined"

# Directories/files to skip entirely (already-combined outputs, venv, cache)
SKIP_DIRS = {
    ROOT / "data" / "combined",
    ROOT / ".venv",
    ROOT / "__pycache__",
    ROOT / ".ruff_cache",
}

# Files that are known large duplicates of other sources — skip to avoid re-counting
SKIP_FILES = {
    # these are just re-exports of data already covered by primary sources
    "clean/all_sources_combined.jsonl",
    "clean/all_sources_combined_v3.jsonl",
    "clean/all_sources_combined_v4.jsonl",
    "clean/all_sources_clean_v5.jsonl",
    "clean/all_sources_clean_v6.jsonl",
    "clean/all_sources_dedup.jsonl",
    "clean/all_zolai_combined.jsonl",
    "clean/all_zolai_dedup.jsonl",
    "clean/bible/all_combined.jsonl",
    "clean/bible/all_dedup.jsonl",
    "clean/bible/tb77_dedup.jsonl",
    "clean/zolai_complete_dedup.jsonl",
    "clean/kaggle/bible_zolai_english_pairs.jsonl",  # empty
    # dataset/ exports are re-exports of raw/clean sources
    "dataset/ollama_train.jsonl",
    "dataset/zolai_complete.jsonl",
    "dataset/zolai_full.jsonl",
    "dataset/zolai_master.jsonl",
    "dataset/huggingface/train.jsonl",    # incomplete (no Response)
    "dataset/huggingface/validation.jsonl",
    # raw/ mirrors
    "raw/zolai_all_sources.jsonl",
    "raw/zolai_texts.jsonl",
    "raw/zolai_master.jsonl",
    "raw/zolai_trained.jsonl",
    "raw/zolai_full.jsonl",
    "raw/zolai_ollama_train.jsonl",
    # kaggle bundle mirrors
    "kaggle_bundle/data/zolai_train_full.jsonl",
    "kaggle_bundle/data/zolai_train.jsonl",
    "kaggle_bundle/data/zolai_val.jsonl",
    "kaggle_dataset/bible_tdb77.jsonl",
    "kaggle_dataset/bible_zolai_combined.jsonl",
    "kaggle_dataset/zolai_combined_dict_translation.jsonl",
    # older training versions — keep only v11 (latest)
    "data/history/training/zolai_full_training_v1.jsonl",
    "data/history/training/zolai_full_training_v2.jsonl",
    "data/history/training/zolai_full_training_v3.jsonl",
    "data/history/training/zolai_full_training_v4.jsonl",
    "data/history/training/zolai_full_training_v5.jsonl",
    "data/history/training/zolai_full_training_v6.jsonl",
    "data/history/training/zolai_full_training_v7.jsonl",
    "data/history/training/zolai_full_training_v8.jsonl",
    "data/history/training/zolai_full_training_v9.jsonl",
    "data/history/training/zolai_full_training_v10.jsonl",
    "data/history/training/zolai_tonsan_synthetic_v1.jsonl",  # v2 exists
    # large merged files (already covered by individual sources)
    "data/combine mater.jsonl",
    "data/zolai_merged_all.jsonl",
}

MIN_CHARS = 3

# Detect translation instruction patterns
_TRANSLATE_RE = re.compile(r"translat", re.IGNORECASE)
_DIALECT_RE = re.compile(r"(Tedim|FCL|HCL|Hakha|Falam|Chin|Burmese|English)", re.IGNORECASE)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _md5(s: str) -> str:
    return hashlib.md5(s.encode("utf-8")).hexdigest()


def _c(v: object) -> str:
    return " ".join(str(v).split()).strip()


def _ok(s: str) -> bool:
    return bool(s) and len(s) >= MIN_CHARS


# ── Classifiers ───────────────────────────────────────────────────────────────

def classify(obj: dict) -> str:
    """Return 'sentence' | 'parallel' | 'instruction' | 'dictionary' | 'skip'."""
    keys = set(obj.keys())

    # Dictionary signals
    if "headword" in keys or "translations" in keys:
        return "dictionary"
    if "results" in keys and isinstance(obj.get("results"), list):
        return "dictionary"

    # Instruction/parallel signals
    if "instruction" in keys and "output" in keys:
        instr = _c(obj.get("instruction", ""))
        inp = _c(obj.get("input", ""))
        out = _c(obj.get("output", ""))
        if not out or len(out) < MIN_CHARS:
            return "skip"
        # Translation pair → parallel
        if _TRANSLATE_RE.search(instr) and inp and out:
            return "parallel"
        return "instruction"

    # HuggingFace packed format "### Instruction:\n...\n### Input:\n...\n### Response:\n"
    if keys == {"text"}:
        t = _c(obj.get("text", ""))
        if "### Instruction:" in t and "### Response:" in t:
            return "instruction"  # will be parsed specially
        return "sentence"

    # Sentence signals
    if "text" in keys:
        return "sentence"

    return "skip"


# ── Normalisers ───────────────────────────────────────────────────────────────

def norm_sentence(obj: dict, src_stem: str) -> dict | None:
    text = _c(obj.get("text") or "")
    if not _ok(text):
        return None
    source = _c(obj.get("source") or obj.get("source_file") or src_stem)
    dialect = _c(obj.get("dialect") or obj.get("iso") or "tedim").lower()
    topic = obj.get("topic") or obj.get("domain") or "general"
    rec: dict = {
        "text": text,
        "language": "zolai",
        "dialect": dialect,
        "source": source,
        "topic": topic,
        "category": "sentence",
    }
    en = _c(obj.get("translation_en") or obj.get("english") or "")
    if en:
        rec["translation_en"] = en
    return rec


def norm_parallel(obj: dict, src_stem: str) -> dict | None:
    """instruction/input/output where instruction is a translation request."""
    en = _c(obj.get("input") or "")
    zolai = _c(obj.get("output") or "")
    if not _ok(en) or not _ok(zolai):
        return None
    meta = obj.get("metadata") or {}
    dialect = _c(meta.get("dialect") or obj.get("dialect") or "tedim")
    ref = _c(meta.get("reference") or obj.get("reference") or "")
    source = _c(meta.get("source") or obj.get("source") or src_stem)
    return {
        "zolai": zolai,
        "english": en,
        "dialect": dialect,
        "source": source,
        "reference": ref,
        "category": "parallel",
    }


def norm_instruction(obj: dict, src_stem: str) -> dict | None:
    # Handle packed HuggingFace format
    if set(obj.keys()) == {"text"}:
        raw = obj["text"]
        parts = re.split(r"###\s+(?:Instruction|Input|Response):\s*\n", raw)
        if len(parts) >= 3:
            instruction = _c(parts[1]) if len(parts) > 1 else ""
            inp = _c(parts[2]) if len(parts) > 2 else ""
            out = _c(parts[3]) if len(parts) > 3 else ""
            if not instruction or not out:
                return None
            obj = {"instruction": instruction, "input": inp, "output": out}

    instruction = _c(obj.get("instruction") or "")
    out = _c(obj.get("output") or "")
    if not _ok(instruction) or not _ok(out):
        return None
    inp = _c(obj.get("input") or "")
    meta = obj.get("metadata") or {}
    return {
        "instruction": instruction,
        "input": inp,
        "output": out,
        "source": _c(meta.get("source") or obj.get("source") or src_stem),
        "domain": _c(meta.get("domain") or obj.get("domain") or "general"),
        "dialect": _c(meta.get("dialect") or obj.get("dialect") or "tedim").lower(),
        "category": "instruction",
    }


def norm_dictionary(obj: dict, src_stem: str) -> list[dict]:
    # tongdot nested
    if "results" in obj and isinstance(obj.get("results"), list):
        out = []
        for r in obj["results"]:
            hw = _c(r.get("headword") or obj.get("query") or "")
            tr = _c(r.get("translation") or "")
            if hw and tr:
                out.append({"headword": hw, "translations": [tr], "pos": [],
                            "explanations": [], "sources": ["tongdot"], "category": "dictionary"})
        return out

    hw = _c(obj.get("headword") or obj.get("word") or obj.get("term") or "")
    if not hw:
        return []

    translations = obj.get("translations") or obj.get("translation") or []
    if isinstance(translations, str):
        translations = [translations]
    translations = [_c(t) for t in translations if _c(str(t))]

    pos = obj.get("pos") or []
    if isinstance(pos, str):
        pos = [pos]

    explanations = obj.get("explanations") or obj.get("definition") or []
    if isinstance(explanations, str):
        explanations = [explanations]

    sources = obj.get("sources") or [src_stem]
    if isinstance(sources, str):
        sources = [sources]

    return [{"headword": hw, "translations": translations, "pos": pos,
             "explanations": [_c(str(e)) for e in explanations if e],
             "sources": sources, "category": "dictionary"}]


# ── Main ──────────────────────────────────────────────────────────────────────

def iter_jsonl_files() -> list[Path]:
    """Find all .jsonl files, excluding skip dirs and skip files."""
    all_files = []
    for p in sorted(ROOT.rglob("*.jsonl")):
        # skip if inside a skip dir
        if any(str(p).startswith(str(d)) for d in SKIP_DIRS):
            continue
        rel = str(p.relative_to(ROOT))
        if rel in SKIP_FILES:
            continue
        all_files.append(p)
    return all_files


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", default=OUT_DIR_DEFAULT)
    args = parser.parse_args(argv)

    out_dir = ROOT / args.output_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    cat_paths = {
        "sentence":    out_dir / "sentences.jsonl",
        "parallel":    out_dir / "parallel.jsonl",
        "instruction": out_dir / "instructions.jsonl",
        "dictionary":  out_dir / "dictionary.jsonl",
    }
    seen: dict[str, set[str]] = {k: set() for k in cat_paths}
    counts: dict[str, int] = {k: 0 for k in cat_paths}
    skipped = 0

    files = iter_jsonl_files()
    print(f"[INFO] Found {len(files)} source files to process", file=sys.stderr)

    handles = {k: open(p, "w", encoding="utf-8") for k, p in cat_paths.items()}

    def _write(cat: str, rec: dict, key: str) -> bool:
        nonlocal skipped
        if key in seen[cat]:
            skipped += 1
            return False
        seen[cat].add(key)
        handles[cat].write(json.dumps(rec, ensure_ascii=False) + "\n")
        counts[cat] += 1
        return True

    try:
        for src in files:
            rel = str(src.relative_to(ROOT))
            stem = src.stem
            print(f"[READ] {rel}", file=sys.stderr)

            with src.open(encoding="utf-8", errors="replace") as fh:
                for raw in fh:
                    raw = raw.strip()
                    if not raw:
                        continue
                    try:
                        obj = json.loads(raw)
                    except json.JSONDecodeError:
                        skipped += 1
                        continue

                    cat = classify(obj)

                    if cat == "skip":
                        skipped += 1

                    elif cat == "sentence":
                        rec = norm_sentence(obj, stem)
                        if rec:
                            _write("sentence", rec, _md5(rec["text"]))
                        else:
                            skipped += 1

                    elif cat == "parallel":
                        rec = norm_parallel(obj, stem)
                        if rec:
                            _write("parallel", rec, _md5(rec["english"] + rec["zolai"]))
                        else:
                            skipped += 1

                    elif cat == "instruction":
                        rec = norm_instruction(obj, stem)
                        if rec:
                            _write("instruction", rec, _md5(rec["instruction"] + rec["output"]))
                        else:
                            skipped += 1

                    elif cat == "dictionary":
                        items = norm_dictionary(obj, stem)
                        if not items:
                            skipped += 1
                        for rec in items:
                            _write("dictionary", rec, _md5(rec["headword"].lower()))

                    total = sum(counts.values())
                    if total % 200_000 == 0 and total > 0:
                        sys.stdout.write(
                            f"\r  sent={counts['sentence']:,}  "
                            f"para={counts['parallel']:,}  "
                            f"instr={counts['instruction']:,}  "
                            f"dict={counts['dictionary']:,}  "
                            f"skip={skipped:,}  "
                        )
                        sys.stdout.flush()
    finally:
        for h in handles.values():
            h.close()

    print(f"\n\n{'='*60}")
    print(f"{'CATEGORY':<14} {'RECORDS':>10}  {'FILE'}")
    print(f"{'-'*60}")
    for k, p in cat_paths.items():
        size_mb = p.stat().st_size / 1024 / 1024
        print(f"{k:<14} {counts[k]:>10,}  {p.name}  ({size_mb:.1f} MB)")
    print(f"{'skipped':<14} {skipped:>10,}")
    print(f"{'='*60}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

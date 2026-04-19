"""
Zo_Tdm Text Filters — Unified Module
Consolidates: apply_softness_filter, filter_latin, remove_foreign_words,
              detect_english_bleed, llm_filter_loan_words, delete_duplicates
"""
from __future__ import annotations

import hashlib
import json
import re


def filter_latin_chars(text: str) -> str:
    """Remove non-Zolai Latin characters (accented, etc.)."""
    return re.sub(r'[àáâãäåèéêëìíîïòóôõöùúûüýÿ]', '', text, flags=re.IGNORECASE)


def detect_english_bleed(text: str, threshold: float = 0.4) -> bool:
    """Returns True if text has too much English content."""
    eng_words = set(["the", "is", "are", "was", "were", "have", "has", "this", "that", "with", "from", "they", "been", "would", "could", "should", "about", "which", "their", "there"])
    words = text.lower().split()
    if not words:
        return False
    eng_count = sum(1 for w in words if w in eng_words)
    return (eng_count / len(words)) > threshold


def apply_softness_filter(text: str) -> str:
    """Apply Tedim phonetic softness rules."""
    # Standard Tedim softness patterns
    text = re.sub(r'\bna ding\b', 'nading', text)
    text = re.sub(r'\bna sep\b', 'nasep', text)
    return text


def remove_foreign_words(text: str, keep_zolai: bool = True) -> str:
    """Remove non-Zolai/non-English foreign words."""
    # Strip Burmese, Thai, etc.
    text = re.sub(r'[\u1000-\u109F]', '', text)  # Myanmar
    text = re.sub(r'[\u0E00-\u0E7F]', '', text)  # Thai
    return text.strip()


def deduplicate_jsonl(input_path: str, output_path: str, key: str = "text") -> int:
    """Deduplicate a JSONL file by content hash."""
    seen = set()
    kept = 0
    with open(input_path, "r", encoding="utf-8") as fin, \
         open(output_path, "w", encoding="utf-8") as fout:
        for line in fin:
            obj = json.loads(line)
            val = obj.get(key, "")
            h = hashlib.md5(val.encode("utf-8")).hexdigest()
            if h not in seen:
                seen.add(h)
                fout.write(line)
                kept += 1
    return kept


def filter_jsonl(input_path: str, output_path: str,
                 min_chars: int = 10, remove_bleed: bool = True) -> dict:
    """Full filtering pipeline for a JSONL file."""
    stats = {"input": 0, "kept": 0, "bleed_removed": 0, "short_removed": 0}
    with open(input_path, "r", encoding="utf-8") as fin, \
         open(output_path, "w", encoding="utf-8") as fout:
        for line in fin:
            stats["input"] += 1
            obj = json.loads(line)
            text = obj.get("text", obj.get("zolai", ""))

            if len(text) < min_chars:
                stats["short_removed"] += 1
                continue
            if remove_bleed and detect_english_bleed(text):
                stats["bleed_removed"] += 1
                continue

            text = apply_softness_filter(text)
            text = remove_foreign_words(text)
            text = filter_latin_chars(text)
            obj["text"] = text
            fout.write(json.dumps(obj, ensure_ascii=False) + "\n")
            stats["kept"] += 1
    return stats


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser(description="Zo_Tdm Text Filter Pipeline")
    p.add_argument("-i", "--input", required=True)
    p.add_argument("-o", "--output", required=True)
    p.add_argument("--min-chars", type=int, default=10)
    p.add_argument("--dedupe", action="store_true")
    args = p.parse_args()

    if args.dedupe:
        kept = deduplicate_jsonl(args.input, args.output)
        print(f"Deduplicated: kept {kept} entries.")
    else:
        stats = filter_jsonl(args.input, args.output, min_chars=args.min_chars)
        print(f"Filter results: {stats}")

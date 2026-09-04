"""Zolai word + bigram prediction tables.

Builds word-frequency and bigram count tables from the dictionary headwords and
bilingual wordlists. Output is newline-delimited JSON for downstream prediction
features (word-prediction, sentence-structure suggestions).
"""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / "artifacts" / "kg"
DICT = ROOT / "data" / "dictionary" / "processed" / "dict_master_v2.json"
WORDLISTS = ROOT / "wiki" / "vocabulary" / "wordlists"

_WORD = re.compile(r"[a-zA-Z][a-zA-Z'’]*")


def build_ngram_tables(out_dir=ART) -> Path:
    """Extract unigrams + bigrams; write artifacts/kg/ngrams.jsonl."""
    unigrams: Counter[str] = Counter()
    bigrams: Counter[tuple[str, str]] = Counter()

    # 1. dictionary headwords as vocabulary
    dict_words: list[str] = []
    if DICT.exists():
        try:
            data = json.loads(DICT.read_text(encoding="utf-8"))
            dict_words = list(data.keys())
        except Exception as e:
            print(f"  ! dict read failed: {e}")

    # 2. wordlist rows (zolai column) as usage-bearing sentences (bigram source)
    sentence_texts: list[str] = []
    if WORDLISTS.exists():
        for tsv in sorted(WORDLISTS.glob("*.tsv")):
            try:
                lines = tsv.read_text(encoding="utf-8").splitlines()
            except Exception:
                continue
            for line in lines[1:]:
                if "\t" not in line:
                    continue
                cols = line.split("\t")
                unigrams[cols[0].strip().lower()] += 1  # zolai headword
                if len(cols) > 4 and cols[4].strip():
                    sentence_texts.append(cols[4].strip())  # example sentence

    for tok in dict_words:
        norm = tok.strip().lower()
        if 2 < len(norm) <= 30:
            unigrams[norm] += 1

    for s in sentence_texts:
        toks = _WORD.findall(s.lower())
        for a, b in zip(toks, toks[1:]):
            bigrams[(a, b)] += 1

    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "ngrams.jsonl"
    with out_path.open("w", encoding="utf-8") as f:
        for (a, b), cnt in bigrams.most_common():
            f.write(json.dumps({"type": "bigram", "a": a, "b": b, "count": cnt}, ensure_ascii=False) + "\n")
        for tok, cnt in unigrams.most_common():
            f.write(json.dumps({"type": "unigram", "word": tok, "count": cnt}, ensure_ascii=False) + "\n")

    print(f"ngram: {len(unigrams)} unigrams, {len(bigrams)} bigrams -> {out_path}")
    return out_path

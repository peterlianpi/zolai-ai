"""Extract vocabulary from Bible chapters with dictionary lookups.

Usage:
  python scripts/extract_bible_vocab.py --book GEN --chapter 1
  python scripts/extract_bible_vocab.py --book GEN  # all chapters
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

DATA = Path("data/master/sources")
DICT_PATH = Path("data/processed/master_dictionary_semantic.jsonl")
COMBINED_DICT = Path("data/master/combined/dictionary.jsonl")
OUT_DIR = Path("data/processed/bible_vocab")


def load_dictionary() -> dict[str, dict]:
    """Load dictionary: headword → {translations, pos, explanation}"""
    d: dict[str, dict] = {}
    # Load semantic dict first (richer)
    for path in [DICT_PATH, COMBINED_DICT]:
        if not path.exists():
            continue
        for line in open(path, encoding="utf-8"):
            r = json.loads(line)
            hw = r.get("headword", r.get("word", "")).strip().lower()
            if hw and hw not in d:
                d[hw] = {
                    "translations": r.get("translations", r.get("english", [])),
                    "pos": r.get("pos", r.get("part_of_speech", "")),
                    "explanation": r.get("explanation", r.get("explanations", "")),
                }
    return d


def tokenize(text: str) -> list[str]:
    """Extract word tokens from Zolai text."""
    return [w.strip(".,;:\"'()[]!?-").lower() for w in re.split(r"\s+", text) if w.strip()]


def load_verses(book: str) -> list[dict]:
    path = DATA / "bible_tb77_online.jsonl"
    return [json.loads(l) for l in open(path, encoding="utf-8") if json.loads(l)["book"] == book]


def extract_chapter_vocab(verses: list[dict], chapter: int, dictionary: dict[str, dict]) -> list[dict]:
    ch_verses = [v for v in verses if v["chapter"] == chapter]
    seen: set[str] = set()
    vocab: list[dict] = []

    for v in ch_verses:
        for token in tokenize(v["text"]):
            if token in seen or len(token) < 2:
                continue
            seen.add(token)
            entry = dictionary.get(token, {})
            vocab.append({
                "word": token,
                "translations": entry.get("translations", []),
                "pos": entry.get("pos", ""),
                "explanation": entry.get("explanation", ""),
                "in_dictionary": bool(entry),
                "first_seen": v["reference"],
            })

    return sorted(vocab, key=lambda x: (not x["in_dictionary"], x["word"]))


def report(book: str, chapter: int, vocab: list[dict]) -> None:
    known = [v for v in vocab if v["in_dictionary"]]
    unknown = [v for v in vocab if not v["in_dictionary"]]

    print(f"\n{'='*60}")
    print(f"  {book} Chapter {chapter} — {len(vocab)} unique words")
    print(f"  Dictionary coverage: {len(known)}/{len(vocab)} ({len(known)*100//len(vocab)}%)")
    print(f"{'='*60}")

    print(f"\n📖 KNOWN WORDS ({len(known)}):")
    for v in known:
        trans = ", ".join(v["translations"][:3]) if isinstance(v["translations"], list) else v["translations"]
        pos = f" [{v['pos']}]" if v["pos"] else ""
        print(f"  {v['word']:<20} {trans}{pos}")

    if unknown:
        print(f"\n❓ NOT IN DICTIONARY ({len(unknown)}) — need manual entry:")
        for v in unknown:
            print(f"  {v['word']:<20} (first seen: {v['first_seen']})")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--book", default="GEN")
    parser.add_argument("--chapter", type=int, help="Specific chapter (omit for all)")
    parser.add_argument("--save", action="store_true", help="Save JSONL to data/processed/bible_vocab/")
    args = parser.parse_args(argv)

    print("Loading dictionary...", end=" ", flush=True)
    dictionary = load_dictionary()
    print(f"{len(dictionary)} entries")

    print(f"Loading {args.book} verses...", end=" ", flush=True)
    verses = load_verses(args.book)
    chapters = [args.chapter] if args.chapter else sorted(set(v["chapter"] for v in verses))
    print(f"{len(verses)} verses, {len(chapters)} chapters")

    if args.save:
        OUT_DIR.mkdir(parents=True, exist_ok=True)

    for ch in chapters:
        vocab = extract_chapter_vocab(verses, ch, dictionary)
        report(args.book, ch, vocab)

        if args.save:
            out = OUT_DIR / f"{args.book.lower()}_ch{ch:03d}_vocab.jsonl"
            with open(out, "w", encoding="utf-8") as f:
                for v in vocab:
                    f.write(json.dumps(v, ensure_ascii=False) + "\n")
            print(f"  → saved {out}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

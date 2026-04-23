#!/usr/bin/env python3
"""
Build Qwen2.5-1.5B Training Dataset
=====================================
Converts data/clean/*.jsonl → ChatML format for Qwen2.5-1.5B-Instruct SFT.

Fixes vs previous version:
  - Varied monolingual user prompts (not always "Hih Zolai thu sim in.")
  - Drop English-only / bible-ref / too-short assistant turns
  - Optional --fix-zvs: calls Gemini CLI to correct forbidden-word records

Output:
  data/qwen/train.jsonl  val.jsonl  test.jsonl  manifest.json

Usage:
    python scripts/data_pipeline/build_qwen_dataset.py
    python scripts/data_pipeline/build_qwen_dataset.py --dry-run
    python scripts/data_pipeline/build_qwen_dataset.py --fix-zvs
"""
from __future__ import annotations

import argparse
import hashlib
import json
import random
import re
import subprocess
import unicodedata
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
CLEAN_DIR   = Path("data/clean")
OUT_DIR     = Path("data/qwen")
OUT_DIR.mkdir(parents=True, exist_ok=True)

MAX_TOKENS  = 512
MIN_CHARS   = 6
MIN_ASST    = 8       # min assistant turn length — filters truncated/noise records
VAL_RATIO   = 0.02
TEST_RATIO  = 0.01
SEED        = 42

SYSTEM = (
    "Na min Zolai AI hi. Na Tedim ZVS Zolai thu gen leh ziak theih hi. "
    "Pasian, gam, tapa, topa, kumpipa, tua ci in ziak in. "
    "Pathian, ram, fapa, bawipa, siangpahrang, cu/cun ci in ziak kei in."
)

FORBIDDEN = re.compile(
    r"\b(pathian|fapa|bawipa|siangpahrang)\b|\bram\b|\bcu\b|\bcun\b",
    re.IGNORECASE,
)

# Noise patterns in assistant turns
_BIBLE_REF   = re.compile(r"^\d+:\d+[-–]?\d*;?\s*(Mk|Mt|Lk|Jn|Gen|Rev|Acts|Rom|Cor|Gal|Eph|Col|Heb|Jas|Pet)\b")
_EN_NAME     = re.compile(r"^[A-Z][a-z]+ [A-Z][a-z]+$")   # "George Cooper"
_EN_ONLY     = re.compile(r"^[a-z][a-z ]+$")               # all-lowercase English words
_CRAWL_NOISE = re.compile(r'"depth"\s*:|"url"\s*:|html",|zolai_score|Site of Saya|<[a-z]+>')  # crawl metadata

# Varied user prompts for monolingual records
_MONO_PROMPTS = [
    "Hih Zolai thu sim in.",
    "Hih thu Zolai in gen in.",
    "Hih kammal Zolai in ziak in.",
    "Zolai thu khat gen in.",
    "Hih sentence Zolai in a hi hiam?",
    "Hih Zolai in a hi. Sim in.",
    "Zolai kammal hih hi. Sim in.",
]

# ── Gemini ZVS fixer ──────────────────────────────────────────────────────────

def gemini_fix_zvs(text: str) -> str | None:
    """Call Gemini CLI to fix forbidden ZVS words. Returns corrected text or None."""
    prompt = (
        "Fix this Zolai sentence to ZVS standard. "
        "Replace: pathian→Pasian, ram→gam, fapa→tapa, bawipa→topa, siangpahrang→kumpipa. "
        f"Reply with ONLY the corrected sentence, no explanation.\n\n{text}"
    )
    try:
        r = subprocess.run(
            ["gemini", "-m", "gemini-2.0-flash"],
            input=prompt, capture_output=True, text=True, timeout=15,
        )
        out = re.sub(r"^```[a-z]*\n?|```$", "", r.stdout.strip(), flags=re.MULTILINE).strip()
        if out and len(out) > 3 and not FORBIDDEN.search(out):
            return out
    except Exception:
        pass
    return None

# ── Cleaning helpers ──────────────────────────────────────────────────────────

_HTML  = re.compile(r"<[^>]+>")
_CTRL  = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_MULTI = re.compile(r"\s{2,}")
_QUOTES = str.maketrans({"\u201c": '"', "\u201d": '"', "\u2018": "'", "\u2019": "'"})

def deep_clean(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize("NFC", text)
    text = _HTML.sub("", text)
    text = _CTRL.sub("", text)
    text = text.translate(_QUOTES)
    text = _MULTI.sub(" ", text).strip()
    return text

def est_tokens(text: str) -> int:
    return len(text) // 3

def is_bad_assistant(text: str) -> bool:
    t = text.strip()
    if len(t) < MIN_ASST:
        return True
    if _BIBLE_REF.match(t):
        return True
    if _EN_NAME.match(t):
        return True
    if _EN_ONLY.match(t) and len(t) < 30:
        return True
    if _CRAWL_NOISE.search(t):
        return True
    return False

def chatml(user: str, assistant: str) -> str:
    return (
        f"<|im_start|>system\n{SYSTEM}<|im_end|>\n"
        f"<|im_start|>user\n{user}<|im_end|>\n"
        f"<|im_start|>assistant\n{assistant}<|im_end|>"
    )

def fp(u: str, a: str) -> str:
    return hashlib.md5(f"{u}|||{a}".encode()).hexdigest()

# ── Per-category converters ───────────────────────────────────────────────────

def from_monolingual(r: dict) -> tuple[str, str] | None:
    text = deep_clean(r.get("text", ""))
    if len(text) < MIN_CHARS or is_bad_assistant(text):
        return None
    user = random.choice(_MONO_PROMPTS)
    return (user, text)

def from_parallel(r: dict) -> tuple[str, str] | None:
    zo = deep_clean(r.get("zolai", ""))
    en = deep_clean(r.get("english", ""))
    if len(zo) < MIN_CHARS or len(en) < MIN_CHARS:
        return None
    if random.random() < 0.5:
        return (f"Translate to English: {zo}", en)
    return (f"Zolai ah let in: {en}", zo)

def from_dictionary(r: dict) -> tuple[str, str] | None:
    zo = deep_clean(r.get("zolai", ""))
    en = deep_clean(r.get("english", ""))
    if len(zo) < 2 or len(en) < 2:
        return None
    pos = r.get("pos", "")
    answer = f"{zo} ({pos}) — {en}" if pos else f"{zo} — {en}"
    ex_zo = deep_clean(r.get("example_zo", ""))
    ex_en = deep_clean(r.get("example_en", ""))
    if ex_zo and ex_en:
        answer += f"\nExample: {ex_zo} / {ex_en}"
    if random.random() < 0.5:
        return (f'"{en}" ci pen Zolai ah bang ci hiam?', answer)
    return (f'"{zo}" ci pen English ah bang ci hiam?', answer)

def from_instruction(r: dict) -> tuple[str, str] | None:
    instr = deep_clean(r.get("instruction", ""))
    out   = deep_clean(r.get("output", ""))
    if len(instr) < MIN_CHARS or len(out) < MIN_CHARS:
        return None
    return (instr, out)

def from_orpo(r: dict) -> tuple[str, str] | None:
    prompt = deep_clean(r.get("prompt", ""))
    chosen = deep_clean(r.get("chosen", ""))
    if len(prompt) < MIN_CHARS or len(chosen) < MIN_CHARS:
        return None
    return (prompt, chosen)

def from_eval(r: dict) -> tuple[str, str] | None:
    q = deep_clean(r.get("question", ""))
    a = deep_clean(r.get("answer", ""))
    if len(q) < MIN_CHARS or len(a) < MIN_CHARS:
        return None
    return (q, a)

CONVERTERS = {
    "monolingual":  from_monolingual,
    "parallel":     from_parallel,
    "dictionary":   from_dictionary,
    "instructions": from_instruction,
    "orpo":         from_orpo,
    "eval":         from_eval,
}

# ── I/O ───────────────────────────────────────────────────────────────────────

def write_jsonl(rows: list[str], path: Path) -> None:
    with open(path, "w", encoding="utf-8") as f:
        for text in rows:
            f.write(json.dumps({"text": text}, ensure_ascii=False) + "\n")

# ── Main ──────────────────────────────────────────────────────────────────────

def main(dry_run: bool = False, fix_zvs: bool = False) -> None:
    random.seed(SEED)
    records: list[str] = []
    seen: set[str] = set()
    stats: dict[str, int] = {}
    zvs_fixed = 0

    for cat, converter in CONVERTERS.items():
        path = CLEAN_DIR / f"{cat}.jsonl"
        if not path.exists():
            print(f"  [SKIP] {path} not found")
            continue

        kept = dropped = 0
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    r = json.loads(line)
                except json.JSONDecodeError:
                    continue

                # ZVS fix via Gemini before conversion
                if fix_zvs:
                    for field in ("text", "zolai", "output", "chosen"):
                        val = r.get(field, "")
                        if val and FORBIDDEN.search(val):
                            fixed = gemini_fix_zvs(val)
                            if fixed:
                                r[field] = fixed
                                zvs_fixed += 1

                pair = converter(r)
                if pair is None:
                    dropped += 1
                    continue

                user, assistant = pair

                # Drop bad assistant turns
                if is_bad_assistant(assistant):
                    dropped += 1
                    continue

                # Drop if still has forbidden words
                if FORBIDDEN.search(assistant):
                    dropped += 1
                    continue

                full = chatml(user, assistant)
                if est_tokens(full) > MAX_TOKENS:
                    dropped += 1
                    continue

                key = fp(user, assistant)
                if key in seen:
                    dropped += 1
                    continue
                seen.add(key)

                records.append(full)
                kept += 1

        stats[cat] = kept
        print(f"  {cat:15s}  kept={kept:>8,}  dropped={dropped:,}")

    if fix_zvs:
        print(f"\n  Gemini ZVS fixes applied: {zvs_fixed}")

    print(f"\n  Total before split: {len(records):,}")
    random.shuffle(records)
    n      = len(records)
    n_test = max(500,  int(n * TEST_RATIO))
    n_val  = max(1000, int(n * VAL_RATIO))
    test   = records[:n_test]
    val    = records[n_test:n_test + n_val]
    train  = records[n_test + n_val:]
    print(f"  train={len(train):,}  val={len(val):,}  test={len(test):,}")

    if not dry_run:
        for split, rows in [("train", train), ("val", val), ("test", test)]:
            out = OUT_DIR / f"{split}.jsonl"
            write_jsonl(rows, out)
            print(f"    → {out}")

        manifest = {
            "model": "Qwen/Qwen2.5-1.5B-Instruct",
            "max_tokens": MAX_TOKENS,
            "train": len(train), "val": len(val), "test": len(test),
            "categories": stats,
        }
        (OUT_DIR / "manifest.json").write_text(
            json.dumps(manifest, indent=2, ensure_ascii=False))
        print(f"    → {OUT_DIR / 'manifest.json'}")

    print("\nDone.\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--fix-zvs", action="store_true",
                        help="Call Gemini CLI to fix forbidden-word records (slow)")
    args = parser.parse_args()
    main(dry_run=args.dry_run, fix_zvs=args.fix_zvs)

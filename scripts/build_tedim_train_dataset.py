#!/usr/bin/env python3
"""
Build comprehensive Tedim Zolai training dataset from ALL quality sources.
Run: python scripts/build_tedim_train_dataset.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
OUT  = ROOT / "kaggle_bundle/data/zolai_tedim_train.jsonl"

SYSTEM = (
    "You are Sangsia, the Zolai AI Second Brain. "
    "You teach, translate, and explain Tedim Zolai using the ZVS standard. "
    "Always use: pasian, gam, tapa, topa, kumpipa, tua. "
    "Never use: pathian, ram, fapa, cu, cun, bawipa, siangpahrang."
)

# ── Filters ──────────────────────────────────────────────────────────────────
BAD_OUT   = [" cu ", " cun ", "pathian", "bawipa", "siangpahrang", "fapa "]
BAD_INSTR = ["FCL", "Hakha", "Falam", "HCL", "Zokam"]
# Placeholder outputs from routing_synthetic — skip these
BAD_PLACEHOLDER = ["[Generating ", "Respond: ["]
TEDIM_OK  = {"", "Tedim", "Tedim_Chin", "Zolai", "tedim", "tedim_chin", "zolai"}

def ok_text(t: str) -> bool:
    return (
        not any(w in t for w in BAD_OUT) and
        not any(w in t for w in BAD_PLACEHOLDER)
    )

def ok_instr(t: str) -> bool:
    return not any(w in t for w in BAD_INSTR)

def ok_dialect(d: str) -> bool:
    return d in TEDIM_OK

def emit(fout, user: str, assistant: str) -> None:
    fout.write(json.dumps({
        "messages": [
            {"role": "system",    "content": SYSTEM},
            {"role": "user",      "content": user},
            {"role": "assistant", "content": assistant},
        ]
    }, ensure_ascii=False) + "\n")

# ── Source loaders ────────────────────────────────────────────────────────────

def load_corpus_master(fout, max_rows: int = 400_000) -> int:
    """6.1M raw Zolai text chunks — best source for fluency."""
    n = 0
    with open(ROOT / "data/master/sources/zolai_corpus_master.jsonl", encoding="utf-8") as f:
        for line in f:
            if n >= max_rows:
                break
            r = json.loads(line)
            text = r.get("text", "").strip()
            if len(text) < 30 or not ok_text(text):
                continue
            emit(fout, "Continue or complete the following Tedim Zolai text naturally.", text)
            n += 1
    return n

def load_parallel_file(fout, path: Path) -> int:
    """EN↔ZO parallel pairs → translation both directions."""
    n = 0
    with open(path, encoding="utf-8") as f:
        for line in f:
            r = json.loads(line)
            dialect = r.get("dialect") or (r.get("metadata") or {}).get("dialect", "")
            if not ok_dialect(dialect):
                continue
            zo  = (r.get("zolai") or r.get("output", "")).strip()
            en  = (r.get("english") or r.get("input", "")).strip()
            if not zo or not en or not ok_text(zo) or not ok_instr(r.get("instruction", "")):
                continue
            emit(fout, f"Translate the following English text into Tedim Zolai (ZVS standard).\n{en}", zo)
            emit(fout, f"Translate the following Tedim Zolai text into English.\n{zo}", en)
            n += 2
    return n

def load_instructions_file(fout, path: Path) -> int:
    """Generic instruction/input/output format."""
    n = 0
    with open(path, encoding="utf-8") as f:
        for line in f:
            r = json.loads(line)
            dialect = r.get("dialect") or (r.get("metadata") or {}).get("dialect", "")
            if dialect and not ok_dialect(dialect):
                continue
            instr  = r.get("instruction", "").strip()
            inp    = r.get("input", "").strip()
            output = r.get("output", "").strip()
            if not instr or not output:
                continue
            if not ok_instr(instr) or not ok_text(output):
                continue
            # Skip bad tutor instructions like "How do I say 'Let's Eating'?"
            if "Let's " in inp and any(v in inp for v in ["Eating","Negation","Looking","Greeting"]):
                continue
            user = f"{instr}\n{inp}".strip() if inp else instr
            emit(fout, user, output)
            n += 1
    return n

def load_dictionary(fout, path: Path, word_key: str, en_key: str, expl_key: str | None = None) -> int:
    """Dictionary entries → word definition tasks."""
    n = 0
    with open(path, encoding="utf-8") as f:
        for line in f:
            r = json.loads(line)
            dialect = r.get("dialect", "")
            if dialect and not ok_dialect(dialect):
                continue
            word = r.get(word_key, "").strip()
            en   = r.get(en_key, "")
            if not word or not en:
                continue
            en_str   = ", ".join(en) if isinstance(en, list) else str(en).strip()
            expl_str = ""
            if expl_key:
                expl = r.get(expl_key, "")
                expl_str = " ".join(expl) if isinstance(expl, list) else str(expl).strip()
            answer = f"{word}: {en_str}"
            if expl_str and expl_str != "[]":
                answer += f"\n{expl_str}"
            if not ok_text(answer):
                continue
            emit(fout, f"What does the Tedim Zolai word '{word}' mean?", answer)
            n += 1
    return n

def load_semantic_dict(fout) -> int:
    """Rich semantic dictionary with examples."""
    n = 0
    with open(ROOT / "data/processed/master_dictionary_semantic.jsonl", encoding="utf-8") as f:
        for line in f:
            r = json.loads(line)
            if not ok_dialect(r.get("dialect", "")):
                continue
            word    = r.get("zolai", "").strip()
            english = r.get("english", "").strip()
            expl    = r.get("explanation", "").strip()
            examples = r.get("examples") or []
            pos     = r.get("pos", "").strip()
            if not word or not english:
                continue
            answer = f"{word} ({pos}): {english}" if pos else f"{word}: {english}"
            if expl:
                answer += f"\n{expl}"
            if examples:
                ex = examples[0] if isinstance(examples[0], str) else (examples[0].get("zolai") or "")
                if ex:
                    answer += f"\nExample: {ex}"
            if not ok_text(answer):
                continue
            emit(fout, f"Explain the Tedim Zolai word '{word}' with its English meaning and usage.", answer)
            n += 1
    return n

def load_hymns(fout) -> int:
    n = 0
    with open(ROOT / "data/master/sources/tedim_hymns.jsonl", encoding="utf-8") as f:
        for line in f:
            r = json.loads(line)
            title  = r.get("title", "").strip()
            lyrics = r.get("lyrics", "").strip()
            if not title or not lyrics or not ok_text(lyrics):
                continue
            emit(fout, f"Write the lyrics of the Tedim Zolai hymn titled '{title}'.", lyrics)
            n += 1
    return n

def load_zomime(fout) -> int:
    """ZomiMe parallel phrases with pronunciation."""
    n = 0
    with open(ROOT / "data/dictionary/raw/zomime_parallel_phrases.jsonl", encoding="utf-8") as f:
        for line in f:
            r = json.loads(line)
            zo = r.get("zolai", "").strip()
            en = r.get("english", "").strip()
            if not zo or not en or not ok_text(zo):
                continue
            emit(fout, f"Translate the following English text into Tedim Zolai (ZVS standard).\n{en}", zo)
            emit(fout, f"Translate the following Tedim Zolai text into English.\n{zo}", en)
            n += 2
    return n

def load_zomidictionary(fout) -> int:
    """ZomiDictionary app export — EN→ZO lookup."""
    n = 0
    with open(ROOT / "data/dictionary/raw/zomidictionary_export.jsonl", encoding="utf-8") as f:
        for line in f:
            r = json.loads(line)
            if not ok_dialect(r.get("dialect", "")):
                continue
            zo = r.get("zolai", "").strip()
            en = r.get("english", "").strip()
            pos = (r.get("part_of_speech") or "").strip()
            if not zo or not en or not ok_text(zo):
                continue
            answer = f"{zo}" + (f" ({pos})" if pos else "")
            emit(fout, f"How do you say '{en}' in Tedim Zolai?", answer)
            n += 1
    return n

# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> int:
    OUT.parent.mkdir(parents=True, exist_ok=True)

    steps = [
        # (label, fn)
        ("corpus_master 6.1M → 400k sample",
            lambda f: load_corpus_master(f, 400_000)),
        ("parallel combined 101k",
            lambda f: load_parallel_file(f, ROOT/"data/master/combined/parallel.jsonl")),
        ("parallel_train 84k",
            lambda f: load_parallel_file(f, ROOT/"data/master/sources/zolai_parallel_train.jsonl")),
        ("bible_parallel_tedim2010 29k",
            lambda f: load_parallel_file(f, ROOT/"data/master/sources/bible_parallel_tedim2010.jsonl")),
        ("bible_parallel_tdb77 28k",
            lambda f: load_parallel_file(f, ROOT/"data/master/sources/bible_parallel_tdb77.jsonl")),
        ("zomime_parallel 132",
            lambda f: load_zomime(f)),
        ("instructions combined 65k",
            lambda f: load_instructions_file(f, ROOT/"data/master/combined/instructions.jsonl")),
        ("khanggui_synthetic 500",
            lambda f: load_instructions_file(f, ROOT/"data/master/sources/khanggui_synthetic_v1.jsonl")),
        ("zomidaily_synthetic 150",
            lambda f: load_instructions_file(f, ROOT/"data/master/sources/zomidaily_synthetic_v1.jsonl")),
        ("zomidaily_tags 280",
            lambda f: load_instructions_file(f, ROOT/"data/master/sources/zomidaily_full_tags_dataset_v1.jsonl")),
        ("tutor_prompts 6",
            lambda f: load_instructions_file(f, ROOT/"data/master/sources/tutor_prompts_v1.jsonl")),
        ("chat_format 10k",
            lambda f: load_instructions_file(f, ROOT/"data/master/sources/chat_format.jsonl")),
        ("dictionary combined 91k",
            lambda f: load_dictionary(f, ROOT/"data/master/combined/dictionary.jsonl",
                                      "headword", "translations", "explanations")),
        ("master_unified_dict 152k",
            lambda f: load_dictionary(f, ROOT/"data/master/sources/master_unified_dictionary.jsonl",
                                      "headword", "translations", "explanations")),
        ("zomidictionary_export 33k",
            lambda f: load_zomidictionary(f)),
        ("semantic_dictionary 24k",
            lambda f: load_semantic_dict(f)),
        ("hymns 510",
            lambda f: load_hymns(f)),
    ]

    totals: dict[str, int] = {}
    with open(OUT, "w", encoding="utf-8") as fout:
        for label, fn in steps:
            sys.stdout.write(f"  {label:<45} "); sys.stdout.flush()
            n = fn(fout)
            totals[label] = n
            print(f"{n:>8,}")

    total = sum(totals.values())
    size  = OUT.stat().st_size / 1e6
    print(f"\n{'TOTAL':<45} {total:>8,}  ({size:.0f} MB)")
    print(f"Output: {OUT}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

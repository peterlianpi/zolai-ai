"""Refine/correct Zolai text using Gemini 2.5 Pro via API.

Usage:
  echo "some zolai text" | python scripts/refine_zolai_text.py
  python scripts/refine_zolai_text.py --text "Na dam na?"
  python scripts/refine_zolai_text.py --file input.txt --output refined.txt
  python scripts/refine_zolai_text.py --jsonl input.jsonl --field text --output refined.jsonl
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request
from pathlib import Path


# Load API key from config.js or env
def _load_api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY", "")
    if not key:
        config = Path(__file__).parent / "ui/config.js"
        if config.exists():
            for line in config.read_text().splitlines():
                if "GEMINI_API_KEY" in line and "'" in line:
                    key = line.split("'")[1]
                    break
    if not key:
        raise SystemExit("GEMINI_API_KEY not found. Set env var or check scripts/ui/config.js")
    return key


MODEL = "gemini-2.5-flash-lite"  # best free-tier option: faster + fewer hallucinations than gemini-3-flash-preview
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

SYSTEM_PROMPT = """You are a Zolai (Tedim Chin) linguistic expert and editor. Your task is to refine and correct Zolai text to conform strictly to the ZVS (Zolai Verbal Standard) rules.

CORE RULES:
- Dialect: Tedim ZVS only. NEVER use: pathian, ram, fapa, bawipa, siangpahrang, cu, cun
- Always use: pasian, gam, tapa, topa, kumpipa, tua
- NOTE: `topa` (lord/master) is VALID ZVS. Do NOT flag or change it.
- Word order: SOV (Subject-Object-Verb)
- Negation: use `kei` for conditionals/intent (NEVER `lo leh`); use `lo` for general negation
- Plural: NEVER combine `uh` with `i` (we/inclusive first person). Fix = drop `uh`, keep `i`. Do NOT change `i` to `an`. `an` means "they", `i` means "we (inclusive)" — they are different pronouns.
  - WRONG: "I pai uh hi" → "An pai hi"  ← this is WRONG, changes meaning
  - CORRECT: "I pai uh hi" → "I pai hi"  ← just remove uh, preserve i
- Phonetics: no `ti` clusters; no `c` before a/e/o/aw; `o` is always /oʊ/
- Apostrophe: contraction = na'ng; possession = ka pu'
- Stem morphology: nouns/subordinate clauses use Stem II (e.g. dahna from dah, liatna from lian)
- Conditional: use `nong pai kei a leh` / `nong pai kei leh` — NEVER `lo leh`
- Quotative: ci hi (said), ci-in (saying), kici (is called). IMPORTANT: `cil-in` is NOT a quotative — it means "beginning from / starting from" (verb `cil` = to begin). NEVER change `cil-in` to `ci-in`. They are completely different words with different meanings. Example: "A kipat cil-in" = "In the beginning" (Genesis 1:1) — this is 100% correct, do NOT flag or change it.

OUTPUT FORMAT:
Return ONLY a JSON object with these fields:
{
  "refined": "<corrected Zolai text>",
  "changes": ["<brief description of each change made>"],
  "errors_found": ["<each rule violation found>"]
}
If the text is already correct, return the original in "refined" and empty arrays."""


def call_gemini(text: str, api_key: str) -> dict:
    payload = json.dumps({
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"parts": [{"text": text}]}],
        "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"},
    }).encode()

    req = urllib.request.Request(
        f"{API_URL}?key={api_key}",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read())

    raw = data["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(raw)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Refine Zolai text using Gemini 2.5 Pro")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--text", help="Single text string to refine")
    group.add_argument("--file", help="Plain text file to refine")
    group.add_argument("--jsonl", help="JSONL file to refine")
    parser.add_argument("--field", default="text", help="Field name in JSONL (default: text)")
    parser.add_argument("--output", "-o", help="Output file (default: stdout)")
    args = parser.parse_args(argv)

    api_key = _load_api_key()
    out = open(args.output, "w", encoding="utf-8") if args.output else sys.stdout

    try:
        if args.text:
            result = call_gemini(args.text, api_key)
            print(json.dumps(result, ensure_ascii=False, indent=2), file=out)

        elif args.file:
            text = Path(args.file).read_text(encoding="utf-8")
            result = call_gemini(text, api_key)
            print(json.dumps(result, ensure_ascii=False, indent=2), file=out)

        elif args.jsonl:
            for i, line in enumerate(open(args.jsonl, encoding="utf-8")):
                record = json.loads(line)
                text = record.get(args.field, "")
                if not text.strip():
                    print(json.dumps(record, ensure_ascii=False), file=out)
                    continue
                result = call_gemini(text, api_key)
                record[args.field] = result["refined"]
                record["_refinement"] = {
                    "changes": result.get("changes", []),
                    "errors_found": result.get("errors_found", []),
                }
                print(json.dumps(record, ensure_ascii=False), file=out)
                sys.stderr.write(f"\r{i+1} lines processed...")
                sys.stderr.flush()
            sys.stderr.write("\n")

        else:
            # Read from stdin
            text = sys.stdin.read().strip()
            result = call_gemini(text, api_key)
            print(json.dumps(result, ensure_ascii=False, indent=2), file=out)

    finally:
        if args.output:
            out.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

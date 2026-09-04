#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    p = argparse.ArgumentParser(description="Compute BLEU/chrF for a JSONL parallel set (requires sacrebleu).")
    p.add_argument("--jsonl", required=True, help="Path to JSONL with fields {zolai,en} or {source,target}")
    p.add_argument("--ref", default="en", help="Reference field (default: en)")
    p.add_argument("--hyp", default="zolai", help="Hypothesis field (default: zolai)")
    args = p.parse_args()

    try:
        import sacrebleu  # type: ignore
    except Exception as e:
        raise SystemExit(
            "Missing dependency `sacrebleu`.\n"
            "Install with: pip install sacrebleu\n"
            f"Error: {e}"
        )

    refs: list[str] = []
    hyps: list[str] = []

    path = Path(args.jsonl)
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            ref = obj.get(args.ref) or obj.get("target") or obj.get("english")
            hyp = obj.get(args.hyp) or obj.get("source") or obj.get("zolai")
            if not isinstance(ref, str) or not isinstance(hyp, str):
                continue
            refs.append(ref)
            hyps.append(hyp)

    if not refs:
        raise SystemExit("No usable pairs found.")

    bleu = sacrebleu.corpus_bleu(hyps, [refs])
    chrf = sacrebleu.corpus_chrf(hyps, [refs])

    print(f"pairs={len(refs)}")
    print(f"BLEU: {bleu.score:.2f}")
    print(f"chrF: {chrf.score:.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


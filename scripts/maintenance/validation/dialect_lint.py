#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


FORBIDDEN = [
    "pathian",
    "ram",
    "fapa",
    "bawipa",
    "siangpahrang",
    "cu",
    "cun",
]


def lint_text(text: str) -> list[str]:
    hits: list[str] = []
    for w in FORBIDDEN:
        if re.search(rf"\\b{re.escape(w)}\\b", text, re.IGNORECASE):
            hits.append(w)
    return hits


def main() -> int:
    p = argparse.ArgumentParser(description="Dialect lint: fail if forbidden non-Tedim vocabulary appears.")
    p.add_argument("paths", nargs="*", help="Files to scan (text or JSONL). If empty, read stdin.")
    p.add_argument("--jsonl", action="store_true", help="Treat input as JSONL; scan common text fields.")
    args = p.parse_args()

    def scan_line(line: str) -> list[str]:
        if not args.jsonl:
            return lint_text(line)
        # JSONL: scan common fields conservatively without depending on schema
        import json

        try:
            obj = json.loads(line)
        except Exception:
            return lint_text(line)
        hits: list[str] = []
        for k in ("text", "zolai", "sentence", "corrected", "original"):
            v = obj.get(k)
            if isinstance(v, str):
                hits.extend(lint_text(v))
        return sorted(set(hits))

    violations = 0

    if not args.paths:
        for i, line in enumerate(sys.stdin, 1):
            hits = scan_line(line)
            if hits:
                violations += 1
                print(f"[stdin:{i}] forbidden={hits} :: {line[:120].rstrip()}")
    else:
        for path in args.paths:
            pth = Path(path)
            if not pth.exists():
                print(f"Missing file: {pth}", file=sys.stderr)
                violations += 1
                continue
            with pth.open("r", encoding="utf-8", errors="replace") as f:
                for i, line in enumerate(f, 1):
                    hits = scan_line(line)
                    if hits:
                        violations += 1
                        print(f"[{pth}:{i}] forbidden={hits} :: {line[:120].rstrip()}")

    if violations:
        print(f"Dialect lint failed: {violations} violations", file=sys.stderr)
        return 2
    print("Dialect lint OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


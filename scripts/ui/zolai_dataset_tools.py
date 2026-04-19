#!/usr/bin/env python
"""
Zo_Tdm dataset utilities for reuse.

Contains small, composable helpers to:
- download the English–Zomi HF dataset and save as JSONL/CSV
- build a unified JSONL corpus from many files
- deduplicate a JSONL file line-by-line

Usage examples:

  # 1) Download HF dataset as JSONL
  python zo_tdm_dataset_tools.py download-hf-jsonl \\
    --out /path/to/zolai/Documents/Projects/data/zo_tdm/english_zomi_opus_tatoeba_v20230412.jsonl

  # 2) Build a unified corpus from /path/to/zolai/Documents/Projects/data
  python zo_tdm_dataset_tools.py unify \\
    --root /path/to/zolai/Documents/Projects/data \\
    --out /path/to/zolai/Documents/Projects/data/unified_corpus.jsonl

  # 3) Deduplicate a big JSONL file line-by-line
  python zo_tdm_dataset_tools.py dedup \\
    --in /path/to/zolai/Documents/Projects/data/unified_corpus.jsonl \\
    --out /path/to/zolai/Documents/Projects/data/unified_corpus_dedup.jsonl
"""

import argparse
import hashlib
import json
import os
from typing import Iterable, Iterator


def _iter_files(root: str) -> Iterator[str]:
  """Yield files under root that look like text/JSON datasets."""
  for dirpath, _, filenames in os.walk(root):
    for name in filenames:
      if name.endswith((".jsonl", ".json", ".txt")):
        yield os.path.join(dirpath, name)


def cmd_download_hf_jsonl(args: argparse.Namespace) -> None:
  """Download HF English–Zomi dataset and save as simple JSONL."""
  from datasets import load_dataset  # type: ignore[import]

  out_path = os.path.abspath(args.out)
  os.makedirs(os.path.dirname(out_path), exist_ok=True)

  print("Loading dataset ZomiLearner/English-Zomi-OPUS_Tatoeba_v20230412 ...")
  ds = load_dataset("ZomiLearner/English-Zomi-OPUS_Tatoeba_v20230412", split="train")

  # Pick the best Zomi column available
  z_keys = [k for k in ds.column_names if k in ("zomi", "zom")]
  if not z_keys:
    raise SystemExit(f"No Zomi column found in columns: {ds.column_names}")
  z_col = z_keys[0]

  print("Columns:", ds.column_names, "-> using Zomi column:", z_col)
  print("Writing JSONL to", out_path)

  written = 0
  with open(out_path, "w", encoding="utf-8") as f:
    for row in ds:
      rec = {"en": row["en"], "zomi": row[z_col]}
      f.write(json.dumps(rec, ensure_ascii=False) + "\n")
      written += 1
      if written and written % 100_000 == 0:
        print(f"  written {written:,} lines...")

  print("DONE:", out_path, "lines:", written)


def cmd_unify(args: argparse.Namespace) -> None:
  """Unify mixed JSON/JSONL/TXT files into one JSONL file."""
  root = os.path.abspath(args.root)
  out_path = os.path.abspath(args.out)
  os.makedirs(os.path.dirname(out_path), exist_ok=True)

  print("Unifying datasets under", root)
  print("Writing to", out_path)

  count = 0
  with open(out_path, "w", encoding="utf-8") as out:
    for path in _iter_files(root):
      rel = os.path.relpath(path, root)
      try:
        if path.endswith(".jsonl"):
          with open(path, "r", encoding="utf-8") as f:
            for line in f:
              line = line.strip()
              if not line:
                continue
              try:
                obj = json.loads(line)
              except Exception:
                obj = {"raw": line}
              rec = {"source": rel, "data": obj}
              out.write(json.dumps(rec, ensure_ascii=False) + "\n")
              count += 1
        elif path.endswith(".json"):
          with open(path, "r", encoding="utf-8") as f:
            try:
              data = json.load(f)
            except Exception:
              continue
          if isinstance(data, list):
            for item in data:
              rec = {"source": rel, "data": item}
              out.write(json.dumps(rec, ensure_ascii=False) + "\n")
              count += 1
          else:
            rec = {"source": rel, "data": data}
            out.write(json.dumps(rec, ensure_ascii=False) + "\n")
            count += 1
        elif path.endswith(".txt"):
          with open(path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
              line = line.strip()
              if not line:
                continue
              rec = {"source": rel, "text": line}
              out.write(json.dumps(rec, ensure_ascii=False) + "\n")
              count += 1
      except Exception:
        # Skip problematic files but keep going
        continue

  print("WROTE", f"{count:,}", "records to", out_path)


def _line_iter(path: str) -> Iterable[str]:
  with open(path, "r", encoding="utf-8") as f:
    for line in f:
      line = line.rstrip("\n")
      if line:
        yield line


def cmd_dedup(args: argparse.Namespace) -> None:
  """Deduplicate a JSONL file by exact line content."""
  in_path = os.path.abspath(args.in_path)
  out_path = os.path.abspath(args.out)
  os.makedirs(os.path.dirname(out_path), exist_ok=True)

  print("Deduping", in_path, "->", out_path)

  seen: set[str] = set()
  scanned = 0
  written = 0

  with open(out_path, "w", encoding="utf-8") as out:
    for s in _line_iter(in_path):
      scanned += 1
      h = hashlib.sha256(s.encode("utf-8")).hexdigest()
      if h in seen:
        continue
      seen.add(h)
      out.write(s + "\n")
      written += 1
      if scanned and scanned % 1_000_000 == 0:
        print(f"  scanned={scanned:,} written={written:,} unique={len(seen):,}")

  print("DONE scanned=", f"{scanned:,}", "written=", f"{written:,}", "unique=", f"{len(seen):,}")


def looks_like_zo_tdm(text: str) -> bool:
  """Heuristic filter to keep likely Zo_Tdm/Zomi text only."""
  lowered = text.lower()
  if len(text) < 20 or len(text) > 500:
    return False

  # Drop obvious technical / non-language noise
  technical_markers = ["http", "www.", "json", "rfc", "ietf", "ecma", "utf-8"]
  if any(tok in lowered for tok in technical_markers):
    return False

  # Zo_Tdm lexical markers (borrowed from crawler pipeline heuristics)
  strong_markers = [
    "pasian",
    "leitung",
    "vantung",
    "khuavak",
    "zingsang",
    "nitak",
    "tuipi",
    "om hi",
    "ci hi",
  ]
  marker_hits = sum(1 for marker in strong_markers if marker in lowered)
  if marker_hits >= 1:
    return True

  # Fallback: require a reasonable amount of alphabetic content
  alpha = sum(ch.isalpha() for ch in text)
  return alpha >= 10


def cmd_filter_zo_tdm(args: argparse.Namespace) -> None:
  """
  Filter a JSONL file down to lines that look like Zo_Tdm/Zomi text.

  It understands both plain JSONL with a top-level `text` field and the
  unified_corpus format where payload is nested under `data` or `text`.
  """
  in_path = os.path.abspath(args.in_path)
  out_path = os.path.abspath(args.out)
  os.makedirs(os.path.dirname(out_path), exist_ok=True)

  print("Filtering likely Zo_Tdm/Zomi lines", in_path, "->", out_path)

  kept = 0
  scanned = 0

  with open(out_path, "w", encoding="utf-8") as out:
    for line in _line_iter(in_path):
      scanned += 1
      try:
        obj = json.loads(line)
      except Exception:
        continue

      text_val = None
      if isinstance(obj, dict):
        # unified_corpus style: { "source": ..., "data": {...}, "text": "..." }
        if isinstance(obj.get("text"), str):
          text_val = obj["text"]
        elif isinstance(obj.get("data"), dict):
          data = obj["data"]
          if isinstance(data.get("zomi"), str):
            text_val = data["zomi"]
          elif isinstance(data.get("zo"), str):
            text_val = data["zo"]
          elif isinstance(data.get("text"), str):
            text_val = data["text"]

      if not isinstance(text_val, str):
        continue

      if not looks_like_zo_tdm(text_val):
        continue

      out.write(line + "\n")
      kept += 1

      if scanned and scanned % 500_000 == 0:
        print(f"  scanned={scanned:,} kept={kept:,}")

  print("DONE scanned=", f"{scanned:,}", "kept=", f"{kept:,}")


def main() -> None:
  parser = argparse.ArgumentParser(description="Zo_Tdm/Zomi dataset utilities")
  sub = parser.add_subparsers(dest="cmd", required=True)

  p_dl = sub.add_parser("download-hf-jsonl", help="Download HF English–Zomi dataset as JSONL")
  p_dl.add_argument("--out", required=True, help="Output JSONL path")
  p_dl.set_defaults(func=cmd_download_hf_jsonl)

  p_unify = sub.add_parser("unify", help="Unify JSON/JSONL/TXT files into one JSONL")
  p_unify.add_argument("--root", required=True, help="Root directory to scan")
  p_unify.add_argument("--out", required=True, help="Output JSONL path")
  p_unify.set_defaults(func=cmd_unify)

  p_dedup = sub.add_parser("dedup", help="Deduplicate a JSONL file by line")
  p_dedup.add_argument("--in", dest="in_path", required=True, help="Input JSONL path")
  p_dedup.add_argument("--out", required=True, help="Output JSONL path")
  p_dedup.set_defaults(func=cmd_dedup)

  p_filter = sub.add_parser(
    "filter-zo_tdm",
    help="Filter a JSONL file down to likely Zo_Tdm/Zomi text only",
  )
  p_filter.add_argument("--in", dest="in_path", required=True, help="Input JSONL path")
  p_filter.add_argument("--out", required=True, help="Output JSONL path")
  p_filter.set_defaults(func=cmd_filter_zo_tdm)

  args = parser.parse_args()
  args.func(args)


if __name__ == "__main__":
  main()


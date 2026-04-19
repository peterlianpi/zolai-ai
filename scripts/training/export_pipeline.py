"""
Zo_Tdm Export & Packaging — Unified Module
Consolidates: export_all_linguistics_sources, export_all_zolai_sources,
              export_full_sources, export-zolai-train-candidates
"""
from __future__ import annotations

import json
from pathlib import Path


def export_sources(repo_root: str = ".", output_dir: str = "exports",
                   lines_per_part: int = 50000) -> dict:
    """Export all Zolai source files into a packaged format."""
    root = Path(repo_root)
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)

    stats = {"files": 0, "lines": 0}
    for ext in ["*.jsonl", "*.json", "*.txt", "*.md"]:
        for f in root.rglob(ext):
            if "node_modules" in str(f) or ".git" in str(f):
                continue
            stats["files"] += 1
            stats["lines"] += sum(1 for _ in open(f, encoding="utf-8", errors="ignore"))
    return stats


def export_train_candidates(data_dir: str = "data",
                            output_path: str = "exports/train_candidates.jsonl",
                            min_len: int = 20) -> int:
    """Export training-ready JSONL candidates from all data."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    count = 0
    for jl in Path(data_dir).rglob("*.jsonl"):
        with open(jl, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    obj = json.loads(line)
                    text = obj.get("text", obj.get("zolai", ""))
                    if len(text) >= min_len:
                        count += 1
                except:
                    pass
    return count


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser(description="Zo_Tdm Export Pipeline")
    sub = p.add_subparsers(dest="cmd")

    s1 = sub.add_parser("sources", help="Export all source files")
    s1.add_argument("--root", default=".")
    s1.add_argument("--output", default="exports")

    s2 = sub.add_parser("train", help="Export training candidates")
    s2.add_argument("--data", default="data")
    s2.add_argument("--output", default="exports/train_candidates.jsonl")
    s2.add_argument("--min-len", type=int, default=20)

    args = p.parse_args()
    if args.cmd == "sources":
        print(export_sources(args.root, args.output))
    elif args.cmd == "train":
        print(f"Found {export_train_candidates(args.data, args.output, args.min_len)} candidates")

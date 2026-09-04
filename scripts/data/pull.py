#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"


@dataclass(frozen=True)
class DatasetSpec:
    name: str
    repo_id: str
    repo_type: str  # "dataset" or "model"
    local_dir: Path


DATASETS: dict[str, DatasetSpec] = {
    # Canonical datasets (HF)
    "zolai-tedim-v3": DatasetSpec(
        name="zolai-tedim-v3",
        repo_id="peterpausianlian/zolai-tedim-v3",
        repo_type="dataset",
        local_dir=DATA_DIR / "training" / "zolai-tedim-v3",
    ),
    "zolai-llm-training-dataset": DatasetSpec(
        name="zolai-llm-training-dataset",
        repo_id="peterpausianlian/zolai-llm-training-dataset",
        repo_type="dataset",
        local_dir=DATA_DIR / "training" / "splits",
    ),
    "zolai-parallel": DatasetSpec(
        name="zolai-parallel",
        repo_id="peterpausianlian/zolai-parallel",
        repo_type="dataset",
        local_dir=DATA_DIR / "parallel",
    ),
    "zolai-dictionary": DatasetSpec(
        name="zolai-dictionary",
        repo_id="peterpausianlian/zolai-dictionary",
        repo_type="dataset",
        local_dir=DATA_DIR / "dictionary",
    ),
    "zolai-bible": DatasetSpec(
        name="zolai-bible",
        repo_id="peterpausianlian/zolai-bible",
        repo_type="dataset",
        local_dir=DATA_DIR / "bible",
    ),
    "zolai-eval": DatasetSpec(
        name="zolai-eval",
        repo_id="peterpausianlian/zolai-eval",
        repo_type="dataset",
        local_dir=DATA_DIR / "eval",
    ),
}


def _require_hf():
    try:
        from huggingface_hub import snapshot_download  # noqa: F401
    except Exception as e:
        raise SystemExit(
            "Missing dependency `huggingface_hub`.\n"
            "Install with: pip install huggingface_hub\n"
            f"Error: {e}"
        )


def list_datasets() -> int:
    for key in sorted(DATASETS.keys()):
        spec = DATASETS[key]
        print(f"- {spec.name:26}  {spec.repo_id:45}  ->  {spec.local_dir}")
    return 0


def pull_one(name: str) -> int:
    if name not in DATASETS:
        print(f"Unknown dataset: {name}", file=sys.stderr)
        print("Use --list to see known datasets.", file=sys.stderr)
        return 2

    _require_hf()
    from huggingface_hub import snapshot_download

    spec = DATASETS[name]
    spec.local_dir.mkdir(parents=True, exist_ok=True)

    # `snapshot_download` will reuse cache when possible.
    snapshot_download(
        repo_id=spec.repo_id,
        repo_type=spec.repo_type,
        local_dir=str(spec.local_dir),
        local_dir_use_symlinks=False,
    )
    print(f"Pulled {spec.repo_id} -> {spec.local_dir}")
    return 0


def pull_all() -> int:
    rc = 0
    for name in sorted(DATASETS.keys()):
        rc = max(rc, pull_one(name))
    return rc


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Pull canonical datasets from Hugging Face into gitignored data/ folders.")
    p.add_argument("name", nargs="?", help="Dataset name (use --list).")
    p.add_argument("--list", action="store_true", help="List known datasets.")
    p.add_argument("--all", action="store_true", help="Pull all known datasets (large).")
    args = p.parse_args(argv)

    if args.list:
        return list_datasets()
    if args.all:
        return pull_all()
    if args.name:
        return pull_one(args.name)

    p.print_help()
    return 2


if __name__ == "__main__":
    raise SystemExit(main())


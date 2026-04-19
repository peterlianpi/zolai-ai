#!/usr/bin/env python
"""Identify and clean up disk space in Zolai project."""
from __future__ import annotations

import os
import sys
from pathlib import Path
from collections import defaultdict


def get_dir_size(path: Path) -> int:
    """Get total size of directory in bytes."""
    total = 0
    try:
        for entry in path.rglob("*"):
            if entry.is_file():
                total += entry.stat().st_size
    except (PermissionError, OSError):
        pass
    return total


def main() -> int:
    """Analyze disk usage."""
    project_root = Path(__file__).resolve().parents[2]
    
    dirs_to_check = {
        "data/": project_root / "data",
        "runs/": project_root / "runs",
        "node_modules/": project_root / "website/zolai-project/node_modules",
        ".git/": project_root / ".git",
        "__pycache__/": project_root,
    }
    
    sizes = {}
    for name, path in dirs_to_check.items():
        if path.exists():
            size_gb = get_dir_size(path) / (1024**3)
            sizes[name] = size_gb
            print(f"{name:30} {size_gb:8.2f} GB")
    
    print("\n--- Cleanup Recommendations ---")
    print("1. Archive old training runs: rm -rf runs/old_*")
    print("2. Clean node_modules: rm -rf website/zolai-project/node_modules && bun install")
    print("3. Remove __pycache__: find . -type d -name __pycache__ -exec rm -rf {} +")
    print("4. Archive old data versions: tar -czf data/archive_v10.tar.gz data/master/archive/v10/")
    
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

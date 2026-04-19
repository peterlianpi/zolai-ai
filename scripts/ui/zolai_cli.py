from __future__ import annotations

import os
import sys


def main() -> int:
    # Use the root of the project to find the src/ directory
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    src = os.path.join(repo_root, "src")
    if src not in sys.path:
        sys.path.insert(0, src)

    from zo_tdm.cli import main as _main

    return int(_main())


if __name__ == "__main__":
    raise SystemExit(main())

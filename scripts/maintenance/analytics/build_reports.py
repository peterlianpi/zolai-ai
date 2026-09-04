#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[3]
REPORTS_DIR = PROJECT_ROOT / "artifacts" / "reports"


def sample_jsonl(path: Path, limit: int) -> list[dict]:
    rows: list[dict] = []
    if not path.exists():
        return rows
    with path.open("r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except Exception:
                continue
            if len(rows) >= limit:
                break
    return rows


def analyze_texts(texts: list[str]) -> dict:
    if not texts:
        return {"count": 0}
    lengths = [len(t) for t in texts]
    forbidden = ["pathian", "ram", "fapa", "bawipa", "siangpahrang", "cu", "cun"]
    forb_hits = Counter()
    for t in texts:
        for w in forbidden:
            if re.search(rf"\\b{re.escape(w)}\\b", t, re.IGNORECASE):
                forb_hits[w] += 1
    return {
        "count": len(texts),
        "min_len": min(lengths),
        "max_len": max(lengths),
        "avg_len": sum(lengths) / max(1, len(lengths)),
        "forbidden_hits": dict(forb_hits),
    }


def main() -> int:
    p = argparse.ArgumentParser(description="Build lightweight dataset analytics reports into artifacts/reports/")
    p.add_argument("--sample", type=int, default=20000, help="Max lines sampled per JSONL")
    args = p.parse_args()

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    # Heuristic locations (local dev). If data isn't present (HF pull not run), report will be empty.
    candidates = {
        "training": PROJECT_ROOT / "data" / "training" / "llm_train.jsonl",
        "parallel": PROJECT_ROOT / "data" / "parallel" / "parallel_combined_v1.jsonl",
        "dictionary": PROJECT_ROOT / "data" / "dictionary" / "dict_unified_v1.jsonl",
    }

    report = {
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "sampleLimit": args.sample,
        "files": {},
    }

    for name, path in candidates.items():
        rows = sample_jsonl(path, args.sample)
        texts: list[str] = []
        for r in rows:
            for k in ("text", "zolai", "sentence", "english"):
                v = r.get(k)
                if isinstance(v, str) and v.strip():
                    texts.append(v.strip())
                    break
        report["files"][name] = {
            "path": str(path),
            "exists": path.exists(),
            "sampledRows": len(rows),
            "textStats": analyze_texts(texts),
        }

    out = REPORTS_DIR / "dataset_analytics.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


"""Manager module — unified corpus management, dedup, Zolai filtering."""

import hashlib
import json
import logging
import os
from pathlib import Path
from typing import Iterator, Optional

from ..config import config

logger = logging.getLogger(__name__)


def _line_iter(path: Path) -> Iterator[str]:
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if line:
                yield line


def _iter_dataset_files(root: Path) -> Iterator[Path]:
    """Yield files under root that look like text/JSON datasets."""
    for dirpath, _, filenames in os.walk(root):
        for name in filenames:
            if name.endswith((".jsonl", ".json", ".txt")):
                yield Path(dirpath) / name


def unify(root: Optional[Path] = None, out: Optional[Path] = None) -> dict:
    """Unify mixed JSON/JSONL/TXT files into one JSONL corpus."""
    root = root or config.paths.data
    out = out or (config.paths.data / "unified_corpus.jsonl")
    out.parent.mkdir(parents=True, exist_ok=True)

    count = 0
    with open(out, "w", encoding="utf-8") as f:
        for path in _iter_dataset_files(root):
            rel = str(path.relative_to(root))
            try:
                if path.suffix == ".jsonl":
                    for line in _line_iter(path):
                        try:
                            obj = json.loads(line)
                        except Exception:
                            obj = {"raw": line}
                        f.write(json.dumps({"source": rel, "data": obj}, ensure_ascii=False) + "\n")
                        count += 1
                elif path.suffix == ".json":
                    data = json.loads(path.read_text(encoding="utf-8"))
                    items = data if isinstance(data, list) else [data]
                    for item in items:
                        f.write(json.dumps({"source": rel, "data": item}, ensure_ascii=False) + "\n")
                        count += 1
                elif path.suffix == ".txt":
                    for line in _line_iter(path):
                        f.write(json.dumps({"source": rel, "text": line}, ensure_ascii=False) + "\n")
                        count += 1
            except Exception as e:
                logger.debug(f"Skipping {rel}: {e}")
                continue

    logger.info(f"Unified {count:,} records to {out}")
    return {"records": count, "path": str(out)}


def dedup_corpus(input_path: Optional[Path] = None, out: Optional[Path] = None) -> dict:
    """Deduplicate a JSONL file by exact line content (SHA-256)."""
    input_path = input_path or (config.paths.data / "unified_corpus.jsonl")
    out = out or (config.paths.data / "unified_corpus_dedup.jsonl")
    out.parent.mkdir(parents=True, exist_ok=True)

    if not input_path.exists():
        return {"error": f"Input not found: {input_path}"}

    seen: set[str] = set()
    scanned = 0
    written = 0

    with open(out, "w", encoding="utf-8") as f:
        for line in _line_iter(input_path):
            scanned += 1
            h = hashlib.sha256(line.encode("utf-8")).hexdigest()
            if h in seen:
                continue
            seen.add(h)
            f.write(line + "\n")
            written += 1

    logger.info(f"Dedup: scanned={scanned:,} written={written:,} unique={len(seen):,}")
    return {"scanned": scanned, "written": written, "unique": len(seen), "path": str(out)}


_ZOLAI_MARKERS = [
    "pasian", "leitung", "vantung", "khuavak", "zingsang",
    "nitak", "tuipi", "om hi", "ci hi",
]


def _looks_like_zolai(text: str) -> bool:
    """Heuristic filter for likely Zolai/Zomi text."""
    if len(text) < 20 or len(text) > 500:
        return False
    lowered = text.lower()
    technical = ["http", "www.", "json", "rfc", "ietf", "ecma", "utf-8"]
    if any(tok in lowered for tok in technical):
        return False
    if any(marker in lowered for marker in _ZOLAI_MARKERS):
        return True
    alpha = sum(ch.isalpha() for ch in text)
    return alpha >= 10


def filter_zolai(input_path: Optional[Path] = None, out: Optional[Path] = None) -> dict:
    """Filter JSONL down to lines that look like Zolai/Zomi text."""
    input_path = input_path or (config.paths.data / "unified_corpus_dedup.jsonl")
    out = out or (config.paths.data / "unified_zolai_only.jsonl")
    out.parent.mkdir(parents=True, exist_ok=True)

    if not input_path.exists():
        return {"error": f"Input not found: {input_path}"}

    kept = 0
    scanned = 0

    with open(out, "w", encoding="utf-8") as f:
        for line in _line_iter(input_path):
            scanned += 1
            try:
                obj = json.loads(line)
            except Exception:
                continue

            text_val = None
            if isinstance(obj, dict):
                if isinstance(obj.get("text"), str):
                    text_val = obj["text"]
                elif isinstance(obj.get("data"), dict):
                    data = obj["data"]
                    for key in ("zomi", "zo", "text"):
                        if isinstance(data.get(key), str):
                            text_val = data[key]
                            break

            if isinstance(text_val, str) and _looks_like_zolai(text_val):
                f.write(line + "\n")
                kept += 1

    logger.info(f"Zolai filter: scanned={scanned:,} kept={kept:,}")
    return {"scanned": scanned, "kept": kept, "path": str(out)}


def corpus_status() -> dict:
    """Get current corpus statistics."""
    unified = config.paths.data / "unified_corpus.jsonl"
    dedup = config.paths.data / "unified_corpus_dedup.jsonl"
    zolai = config.paths.data / "unified_zolai_only.jsonl"

    def _file_info(path: Path) -> dict:
        if not path.exists():
            return {"exists": False}
        if path.is_dir():
            files = list(path.iterdir())
            total_size = sum(f.stat().st_size for f in files if f.is_file())
            return {
                "exists": True,
                "path": str(path),
                "lines": len(files),
                "size_bytes": total_size,
            }
        lines = sum(1 for _ in _line_iter(path))
        return {
            "exists": True,
            "path": str(path),
            "lines": lines,
            "size_bytes": path.stat().st_size,
        }

    return {
        "unified": _file_info(unified),
        "dedup": _file_info(dedup),
        "zolai_only": _file_info(zolai),
        "cleaned_dir": _file_info(config.paths.data_cleaned),
    }

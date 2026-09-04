"""Ingest Zolai knowledge sources (wiki MD/TXT, PDF-OCR text) into a JSONL index.

Records are one-per-line, newline-delimited (valid JSONL), each carrying its
dense embedding (all-MiniLM-L6-v2). No external vector DB is required.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / "artifacts" / "kg"


def enum_list(items: list, limit: int) -> "list[tuple[int, object]]":
    """enumerate(items)[:limit] — explicit slice for typing/runtime clarity."""
    return list(enumerate(items))[: max(0, limit)]

def _chunk_by_headings(text: str, max_chars: int = 1200, min_chars: int = 60) -> list[str]:
    """Split markdown text into chunks at heading/paragraph boundaries (O(n))."""
    lines = text.splitlines()
    chunks: list[str] = []
    cur: list[str] = []
    cur_chars = 0

    def flush(*, force: bool) -> None:
        nonlocal cur, cur_chars
        body = "\n".join(cur).strip()
        if force or len(body) >= min_chars:
            chunks.append(body)
        cur, cur_chars = [], 0

    for line in lines:
        is_heading = re.match(r"^\s*(#{1,6})\s+", line) is not None
        if is_heading and cur:
            flush(force=False)  # heading boundary flushes accumulated block
        cur.append(line)
        cur_chars += len(line) + 1
        # split at paragraph break when over budget
        if cur_chars >= max_chars and not line.strip():
            flush(force=False)
    if cur:
        flush(force=False)
    return chunks


def iter_sources():
    """Yield (relpath, kind) for wiki MD/TXT files (skip dot dirs)."""
    for p in sorted((ROOT / "wiki").rglob("*")):
        if not p.is_file():
            continue
        if any(part.startswith(".") for part in p.parts):
            continue
        if p.suffix.lower() in {".md", ".txt"}:
            yield p.relative_to(ROOT).as_posix(), "wiki"


def embed_texts(model, texts: list[str], batch_size: int = 64) -> list[list[float]]:
    embs = model.encode(texts, batch_size=batch_size, normalize_embeddings=True, show_progress_bar=False)
    return [e.tolist() for e in embs]


def index_wiki(
    out_dir=ART, limit: int = 0, max_chunks: int = 200,
    model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
) -> Path:
    """Chunk + embed wiki sources into <out_dir>/knowledge/index.jsonl.

    limit>0 caps the number of wiki files (for fast smoke runs). Returns the path.
    """
    from sentence_transformers import SentenceTransformer

    out_dir.mkdir(parents=True, exist_ok=True)
    model = SentenceTransformer(model_name)

    srcs = list(iter_sources())
    if limit:
        srcs = srcs[:limit]

    out_path = out_dir / "knowledge_index.jsonl"
    n_records = 0
    with out_path.open("w", encoding="utf-8") as f:
        for relpath, kind in srcs:
            p = ROOT / relpath
            try:
                text = p.read_text(encoding="utf-8", errors="replace")
            except Exception as e:
                print(f"  ! skip {relpath}: {e}")
                continue
            for i, chunk in enum_list(_chunk_by_headings(text), max_chunks):
                rec = {
                    "id": f"{relpath}#c{i}",
                    "text": chunk,
                    "metadata": {
                        "source": relpath,
                        "source_type": kind,
                        "heading": "",
                        "chunk_type": "wiki",
                    },
                }
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
                n_records += 1

    # now embed and write a second pass producing vector rows
    rows = [json.loads(_line) for _line in out_path.open(encoding="utf-8")]
    texts = [r["text"] for r in rows]
    embs = embed_texts(model, texts)
    vec_path = out_dir / "knowledge_vectors.jsonl"
    with vec_path.open("w", encoding="utf-8") as f:
        for r, e in zip(rows, embs):
            r["embedding"] = e
            r["embeddingModel"] = model_name
            r["embeddingDim"] = len(e)
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"wg: indexed {len(rows)} chunks ({len(texts)} texts) from {len(srcs)} sources")
    print(f"wg: vectors -> {vec_path}")
    return vec_path


def index_pdfs(out_dir=ART, limit: int = 0, model_name: str = "...") -> Path:
    raise NotImplementedError(
        "PDF OCR ingest is a later backlog item (B). Pass parsed OCR text files "
        "via wiki-style .txt ingestion instead."
    )


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--model", default="sentence-transformers/all-MiniLM-L6-v2")
    a = ap.parse_args()
    index_wiki(limit=a.limit, model_name=a.model)

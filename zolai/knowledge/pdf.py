"""Zolai PDF → knowledge ingestion (backlog B).

Two paths:
  1. Ingest existing OCR output: scan data/corpus/ocr/*/*/markdown.md (+ pages)
     and index as source_type="pdf". Requires no cloud/network — the primary path.
  2. extract_pdf_text(): OCR a raw *.pdf via Mistral OCR when a key is set, else
     a local reader (pypdf/pdfplumber) if installed. Returns text or None.

This keeps the RAG brain offline-ready; PDFs already OCR'd by the toolkit land in
the vector store immediately.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OCR_ROOT = ROOT / "data" / "corpus" / "ocr"
ART = ROOT / "artifacts" / "kg"

_CHUNK = re.compile(r".+?(?=\n\s*#|\Z)", re.S)


def _chunk_markdown(text: str, max_chars: int = 1400) -> list[str]:
    """Split OCR'd markdown on top-level heading boundaries, then hard-wrap."""
    sections = [s.strip() for s in _CHUNK.findall(text) if s.strip()]
    out: list[str] = []
    cur = ""
    for sec in sections:
        if len(cur) + len(sec) <= max_chars:
            cur = cur + "\n\n" + sec if cur else sec
        else:
            if cur:
                out.append(cur)
            cur = sec
    if cur:
        out.append(cur)
    return out


def iter_ocr_markdown(ocr_root: Path = OCR_ROOT):
    """Yield (relpath, text) for existing OCR outputs (markdown.md)."""
    if not ocr_root.exists():
        return
    for p in sorted(ocr_root.rglob("markdown.md")):
        rel = p.relative_to(ROOT).as_posix()
        if "/pages/" in rel:
            continue  # per-page outputs duplicate the consolidated markdown.md
        try:
            text = p.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue
        if text.strip():
            yield rel, text


def extract_pdf_text(pdf_path: Path) -> str | None:
    """Return text content of a raw PDF via Mistral OCR or a local lib. None if unavailable."""
    # 1) Mistral OCR (cloud) — only when configured
    try:
        from zolai.ocr.mistral_ocr import HAS_MISTRAL, get_client, ocr_pdf

        if HAS_MISTRAL:
            import os

            if os.environ.get("MISTRAL_API_KEY"):
                client = get_client()
                result = ocr_pdf(client, pdf_path)
                # result may be dict with 'pages' or 'text'; join page contents
                pages = result.get("pages") or []
                parts = []
                for pg in pages:
                    md = pg.get("markdown") or pg.get("text") or ""
                    if md:
                        parts.append(md)
                if parts:
                    return "\n\n".join(parts)
    except Exception:
        pass
    # 2) local lib
    for mod in ("pypdf", "PyPDF2", "pdfplumber"):
        try:
            imp = __import__(mod)
        except Exception:
            continue
        try:
            if mod == "pdfplumber":
                with imp.open(pdf_path) as pdf_text:
                    return "\n".join((pg.extract_text() or "") for pg in pdf_text.pages)
            reader = imp.PdfReader(pdf_path)
            return "\n".join((pg.extract_text() or "") for pg in reader.pages)
        except Exception:
            continue
    return None


def index_pdfs(out_dir=ART, model_name: str | None = None) -> Path:
    """Index existing OCR'd PDF markdown into knowledge_vectors.jsonl (as source_type=pdf).

    Uses the offline numpy path (like index_wiki) so PDF-derived knowledge lands in the
    same vector index. Returns the combined vectors path; merges pdf rows with any
    existing wiki rows.
    """
    from sentence_transformers import SentenceTransformer

    out_dir.mkdir(parents=True, exist_ok=True)
    existing = out_dir / "knowledge_vectors.jsonl"
    rows = []
    if existing.exists():
        rows = [json.loads(_line) for _line in existing.open(encoding="utf-8") if _line.strip()]
    added = 0
    for relpath, text in iter_ocr_markdown():
        for i, chunk in enumerate(_chunk_markdown(text)):
            rows.append(
                {
                    "id": f"{relpath}#pdfc{i}",
                    "text": chunk,
                    "metadata": {
                        "source": relpath,
                        "source_type": "pdf",
                        "heading": "",
                        "chunk_type": "pdf",
                    },
                }
            )
            added += 1
    # embed only new (no-embedding) rows, then rewrite the file
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    to_embed = [i for i, r in enumerate(rows) if "embedding" not in r]
    if to_embed:
        texts = [rows[i]["text"] for i in to_embed]
        embs = model.encode(texts, batch_size=64, normalize_embeddings=True, show_progress_bar=False)
        for k, i in enumerate(to_embed):
            rows[i]["embedding"] = [float(x) for x in embs[k].tolist()]
            rows[i]["embeddingModel"] = "sentence-transformers/all-MiniLM-L6-v2"
            rows[i]["embeddingDim"] = embs[k].shape[0]
    with existing.open("w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"pdf ingest: added {added} pdf-derived chunks; total index rows = {len(rows)}")
    return existing

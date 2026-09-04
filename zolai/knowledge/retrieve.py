"""Retrieval over the Zolai knowledge vector index.

Primary path is an in-memory numpy cosine scan over knowledge_vectors.jsonl —
works fully offline with no external vector DB. Yields top-k chunks with their
source metadata so callers can inject them as RAG context for existing AIs.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_INDEX = ROOT / "artifacts" / "kg" / "knowledge_vectors.jsonl"


@dataclass
class Index:
    texts: list[str] = field(default_factory=list)
    metas: list[dict] = field(default_factory=list)
    ids: list[str] = field(default_factory=list)
    vectors: np.ndarray | None = None


def load_index(path: Path = DEFAULT_INDEX) -> Index:
    """Load a knowledge_vectors.jsonl index into memory. Missing → empty Index."""
    idx = Index()
    if not path.exists():
        return idx
    rows = []
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    rows.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    for r in rows:
        idx.ids.append(r.get("id", ""))
        idx.texts.append(r.get("text", ""))
        idx.metas.append(r.get("metadata", {}))
    vecs = [r.get("embedding") for r in rows]
    if vecs and all(isinstance(v, list) for v in vecs):
        idx.vectors = np.asarray(vecs, dtype=np.float32)
    return idx


def _embed_query(model, query: str) -> np.ndarray:
    vec = model.encode([query], normalize_embeddings=True)[0]
    return np.asarray(vec, dtype=np.float32)


def retrieve(
    query: str,
    index: Index | None = None,
    *,
    top_k: int = 5,
    threshold: float = 0.85,
    model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
) -> list[dict]:
    """Return top-k chunks relevant to the query (cosine >= threshold).

    Lazily loads the default index when `index` is None and embeds the query on
    the fly with all-MiniLM-L6-v2. Logs and returns [] if no index exists.
    """
    from sentence_transformers import SentenceTransformer

    if index is None:
        index = load_index()
    if index.vectors is None or len(index.vectors) == 0:
        print("retrieve: no vector index found (run zolai.knowledge.ingest first)")
        return []

    model = SentenceTransformer(model_name)
    q = _embed_query(model, query)
    # cosine = dot product since vectors are normalized
    sims = index.vectors @ q
    # most-similar ranking with threshold
    order = np.argsort(-sims)
    hits = []
    for pos in order:
        if sims[pos] < threshold:
            break
        hits.append(
            {
                "id": index.ids[pos],
                "text": index.texts[pos],
                "score": round(float(sims[pos]), 4),
                "metadata": index.metas[pos],
            }
        )
        if len(hits) >= top_k:
            break
    return hits


def format_context(hits: list[dict]) -> str:
    """Render hits as RAG context text for injection into an existing AI prompt."""
    blocks = []
    for i, h in enumerate(hits, 1):
        src = h["metadata"].get("source", "")
        blocks.append(f"[{i}] ({src})\n{h['text']}")
    return "\n\n".join(blocks)

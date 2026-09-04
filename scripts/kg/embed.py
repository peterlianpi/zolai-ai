#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import typer
from sentence_transformers import SentenceTransformer

app = typer.Typer(add_completion=False)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_IN = PROJECT_ROOT / "artifacts" / "kg" / "rag_chunks.jsonl"
DEFAULT_OUT = PROJECT_ROOT / "artifacts" / "kg" / "rag_chunks_embedded.jsonl"


def _read_jsonl(path: Path):
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            yield json.loads(line)


def _write_jsonl(path: Path, rows: list[dict[str, Any]]):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


@app.command()
def embed(
    input_path: Path = typer.Option(DEFAULT_IN, exists=True, dir_okay=False, file_okay=True),
    output_path: Path = typer.Option(DEFAULT_OUT, dir_okay=False, file_okay=True),
    model_name: str = typer.Option("sentence-transformers/all-MiniLM-L6-v2"),
    batch_size: int = typer.Option(64),
    normalize: bool = typer.Option(True),
):
    """
    Read rag chunk JSONL -> add embedding fields -> write JSONL.

    Output rows map cleanly into Prisma RagChunk:
      - embedding: Json array[float]
      - embeddingModel: string
      - embeddingDim: int
    """
    rows = list(_read_jsonl(input_path))
    texts = [r.get("content", "") for r in rows]

    model = SentenceTransformer(model_name)
    vecs = model.encode(
        texts,
        batch_size=batch_size,
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=normalize,
    )

    dim = int(vecs.shape[1]) if len(vecs.shape) == 2 else None

    out: list[dict[str, Any]] = []
    for r, v in zip(rows, vecs, strict=True):
        r2 = dict(r)
        r2["embedding"] = [float(x) for x in v.tolist()]
        r2["embeddingModel"] = model_name
        r2["embeddingDim"] = dim
        out.append(r2)

    _write_jsonl(output_path, out)
    typer.echo(f"Wrote embedded chunks: {output_path}")


if __name__ == "__main__":
    app()


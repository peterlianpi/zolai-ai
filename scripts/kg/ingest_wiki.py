#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import typer
from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import RDF, RDFS

app = typer.Typer(add_completion=False)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_WIKI_DIR = PROJECT_ROOT / "wiki"
DEFAULT_OUT_DIR = PROJECT_ROOT / "artifacts" / "kg"

ZK = Namespace("zolai-kg:")


@dataclass(frozen=True)
class Triple:
    s: str
    p: str
    o: str


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def _iter_wiki_files(wiki_dir: Path) -> Iterable[Path]:
    yield from sorted(list(wiki_dir.rglob("*.md")) + list(wiki_dir.rglob("*.txt")))


def _title_from_markdown(text: str, fallback: str) -> str:
    for line in text.splitlines():
        m = re.match(r"^\\s*#\\s+(.+?)\\s*$", line)
        if m:
            return m.group(1).strip()
    return fallback


def _extract_headings(text: str) -> list[tuple[int, str]]:
    out: list[tuple[int, str]] = []
    for line in text.splitlines():
        m = re.match(r"^\\s*(#{1,6})\\s+(.+?)\\s*$", line)
        if m:
            out.append((len(m.group(1)), m.group(2).strip()))
    return out


def _extract_backticked_terms(text: str) -> list[str]:
    # conservative: only explicit `code` spans
    terms = re.findall(r"`([^`]{1,80})`", text)
    cleaned: list[str] = []
    for t in terms:
        t = t.strip()
        if not t:
            continue
        if "\\n" in t:
            continue
        cleaned.append(t)
    return cleaned


def _chunk_paragraphs(text: str, max_chars: int) -> list[str]:
    # minimal chunking: paragraphs, then greedy pack to max_chars
    paras = [p.strip() for p in re.split(r"\\n\\s*\\n+", text) if p.strip()]
    chunks: list[str] = []
    buf: list[str] = []
    size = 0
    for p in paras:
        if len(p) > max_chars:
            for i in range(0, len(p), max_chars):
                part = p[i : i + max_chars].strip()
                if part:
                    chunks.append(part)
            continue

        if size + len(p) + 2 > max_chars and buf:
            chunks.append("\\n\\n".join(buf))
            buf = []
            size = 0
        buf.append(p)
        size += len(p) + 2

    if buf:
        chunks.append("\\n\\n".join(buf))
    return chunks


@app.command()
def ingest_wiki(
    wiki_dir: Path = typer.Option(DEFAULT_WIKI_DIR, exists=True, file_okay=False, dir_okay=True),
    out_dir: Path = typer.Option(DEFAULT_OUT_DIR, file_okay=False, dir_okay=True),
    source_key: str = typer.Option("wiki"),
    chunk_chars: int = typer.Option(1400, help="Approx chunk size for RAG (chars)."),
):
    """
    Ingest wiki files -> (1) RDF triples, (2) JSONL nodes/edges, (3) JSONL rag chunks.

    DB-agnostic: writes artifacts that can be imported to Postgres (web) or SQLite (desktop).
    """
    out_dir.mkdir(parents=True, exist_ok=True)

    g = Graph()
    g.bind("zk", ZK)
    g.bind("rdfs", RDFS)

    nodes_path = out_dir / "kg_nodes.jsonl"
    edges_path = out_dir / "kg_edges.jsonl"
    chunks_path = out_dir / "rag_chunks.jsonl"
    triples_path = out_dir / "triples.nt"

    node_by_iri: dict[str, dict] = {}
    edges: list[dict] = []
    chunks: list[dict] = []

    def upsert_node(iri: str, *, kind: str | None = None, label: str | None = None, props: dict | None = None):
        n = node_by_iri.get(iri) or {
            "iri": iri,
            "kind": None,
            "label": None,
            "description": None,
            "properties": {},
            "sourceKey": source_key,
        }
        if kind and not n.get("kind"):
            n["kind"] = kind
        if label and not n.get("label"):
            n["label"] = label
        if props:
            n["properties"] = {**(n.get("properties") or {}), **props}
        node_by_iri[iri] = n

    for path in _iter_wiki_files(wiki_dir):
        rel = path.relative_to(PROJECT_ROOT).as_posix()
        text = _read_text(path)
        title = _title_from_markdown(text, fallback=path.stem)

        doc_iri = f"{source_key}:{rel}"
        upsert_node(doc_iri, kind="Document", label=title, props={"path": rel})

        doc_ref = URIRef(doc_iri)
        g.add((doc_ref, RDF.type, ZK.Document))
        g.add((doc_ref, RDFS.label, Literal(title)))
        g.add((doc_ref, ZK.sourceRef, Literal(rel)))

        headings = _extract_headings(text)
        for level, heading in headings[:200]:
            sec_iri = f"{doc_iri}#h{level}:{_sha256(heading)[:12]}"
            upsert_node(sec_iri, kind="Section", label=heading, props={"level": level, "doc": doc_iri})

            edges.append(
                {
                    "fromIri": doc_iri,
                    "toIri": sec_iri,
                    "predicate": "hasSection",
                    "weight": 1.0,
                    "confidence": 1.0,
                    "properties": {"level": level},
                    "sourceKey": source_key,
                }
            )
            g.add((URIRef(doc_iri), ZK.hasSection, URIRef(sec_iri)))
            g.add((URIRef(sec_iri), RDFS.label, Literal(heading)))

        for term in _extract_backticked_terms(text)[:2000]:
            term_norm = term.strip()
            term_iri = f"{source_key}:term:{_sha256(term_norm.lower())[:24]}"
            upsert_node(term_iri, kind="Term", label=term_norm)

            edges.append(
                {
                    "fromIri": doc_iri,
                    "toIri": term_iri,
                    "predicate": "mentions",
                    "weight": 1.0,
                    "confidence": 0.6,
                    "properties": {"surface": term_norm},
                    "sourceKey": source_key,
                }
            )
            g.add((URIRef(doc_iri), ZK.mentions, URIRef(term_iri)))
            g.add((URIRef(term_iri), RDFS.label, Literal(term_norm)))

        doc_chunks = _chunk_paragraphs(text, max_chars=chunk_chars)
        for idx, chunk in enumerate(doc_chunks):
            chunks.append(
                {
                    "sourceType": "WikiFile",
                    "sourceKey": source_key,
                    "sourceRef": rel,
                    "chunkIndex": idx,
                    "content": chunk,
                    "contentHash": _sha256(f"{rel}\\n{idx}\\n{chunk}"),
                    "tokensApprox": None,
                    "metadata": {"title": title},
                    "nodeIri": doc_iri,
                }
            )

    with nodes_path.open("w", encoding="utf-8") as f:
        for iri, n in sorted(node_by_iri.items(), key=lambda kv: kv[0]):
            f.write(json.dumps(n, ensure_ascii=False) + "\\n")

    with edges_path.open("w", encoding="utf-8") as f:
        for e in edges:
            f.write(json.dumps(e, ensure_ascii=False) + "\\n")

    with chunks_path.open("w", encoding="utf-8") as f:
        for c in chunks:
            f.write(json.dumps(c, ensure_ascii=False) + "\\n")

    g.serialize(destination=str(triples_path), format="nt")

    typer.echo(f"Wrote nodes  : {nodes_path}")
    typer.echo(f"Wrote edges  : {edges_path}")
    typer.echo(f"Wrote chunks : {chunks_path}")
    typer.echo(f"Wrote triples: {triples_path}")


if __name__ == "__main__":
    app()


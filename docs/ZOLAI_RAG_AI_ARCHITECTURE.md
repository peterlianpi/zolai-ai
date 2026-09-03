# Zolai RAG & AI Architecture

> Companion to `docs/ZOLAI_AI_ARCHITECTURE.md`. Focuses on the retrieval-augmented
> generation (RAG) layer, embeddings/vector store, and the next-word prediction &
> learning loops. Active branch: `main`.

## 1. High-Level View

```mermaid
flowchart LR
    subgraph sources["Knowledge Sources"]
        wiki[( "wiki/ — grammar, vocab, curriculum, bible_context" )]
        pairs[( "data/parallel — ZO⇄EN pairs" )]
        dict[( "dictionary (21K entries)" )]
    end
    subgraph index["Indexing (offline)"]
        emb["Embeddings: all-MiniLM-L6-v2"]
        vs[( "Vector DB: ChromaDB / FAISS" )]
        fts["SQLite FTS5 (dictionary)"]
    end
    subgraph query["Query (online)"]
        q["User prompt / search"]
        ret["Retriever (top-k, cosine)"]
        ctx["RAG context assemble"]
    end
    subgraph gen["Generation"]
        llm["Zolai LLM (LoRA/QLoRA) or provider"]
        pg["Prompt + few-shot"]
    end
    out["Response / translation"]
    eval["Semantic verify (cosine > 0.85)"]

    sources --> emb --> vs
    dict --> fts
    q --> ret --> ctx --> pg --> llm --> out
    ctx --> pg
    vs -. top-k .-> ret
    fts -.> ret
    out --> eval
    eval -. low score .-> q
```

## 2. Retrieval Layer

- **Embeddings**: `sentence-transformers` `all-MiniLM-L6-v2` (default; swap to a Zolai
  fine-tuned encoder later).
- **Vector store**: ChromaDB (local/dev) or FAISS (batch index). Stores embeddings of
  wiki nodes + parallel pairs.
- **Top-k retrieval**: cosine similarity; surfaced examples are injected as few-shot
  context into the LLM prompt.
- **FTS5 fallback**: SQLite FTS5 over the dictionary for exact/lexical matches.
- **Threshold**: candidates below 0.85 cosine are rejected from accepted-translation
  context.

## 3. Embedding & Indexing Pipeline (offline)

1. Chunk wiki files + parallel pairs into bounded units (keep sentence/verse boundaries).
2. Normalize + tokenize under ZVS 2018 rules.
3. Embed with `all-MiniLM-L6-v2`.
4. Upsert to ChromaDB/FAISS with metadata (source file, id, ZVS tags).
5. Rebuild index on corpus change; cache embeddings.

## 4. Query-Time RAG

1. Embed query.
2. Retrieve top-k wiki + pair chunks (vector) and dictionary matches (FTS5).
3. Assemble prompt: system (ZVS mandate) + few-shot examples + user query.
4. Generate via local Zolai LLM (Ollama GGUF / LoRA adapter) or configured provider.
5. Back-translate + score; if below 0.85, self-correct loop (LangGraph planned).

## 5. Text Prediction & Learning Loops

### Next-Word / Next-Sentence Prediction

- **Training data**: high-purity parallel pairs + wiki corpora (target 5.1M pairs).
- **Models**: LoRA FP16 r=16 on T4x2 (0.5B) and QLoRA NF4 r=8 (3B).
- **Adapter merge + export**: `scripts/training/merge_adapter.py`,
  `scripts/training/export_gguf.sh` → GGUF for Ollama/desktop.
- **Roadmap**: `TODO.md` / `ROADMAP.md` track val loss & session cadence.

### Continuous Learning Feedback

- Approved human-in-the-loop translations feed back into the dataset (RAG memory).
- Auto-validation scripts (`scripts/maintenance/validation/*`) check ZVS compliance
  and BLEU/scoring before promotion.
- `data/` and adapters mirror to HF/Kaggle; repo stays a thin source of truth.

## 6. Runtime & Observability

- FastAPI (`zolai/api/server.py`) serves translation + dictionary + chat.
- SSE/WS chat via ChatPanel; MindMap3D renders knowledge graph.
- Vector/embedding caches + per-key rate limiting guard provider calls.
- Logs in `logs/`, reports in `artifacts/`.

## 7. Invariants

1. No long-lived training in request handlers (worker/notebook only).
2. All tokens from env/`.env`; no hardcoded keys.
3. Datasets/models on HF/Kaggle; never in git.
4. ZVS 2018 orthography enforced on all generated output.

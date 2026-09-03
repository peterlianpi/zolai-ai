# Zolai Core — Architecture

- API: FastAPI + Uvicorn (`zolai/api/server.py`); CLI: Typer (`zolai.cli.main`).
- Sub-packages: analyzer, bible, cleaner, crawler, dictionary, ingest, ocr,
  shared, trainer, utils, manager, gui.
- RAG: ChromaDB/FAISS over wiki + parallel pairs; embeddings `all-MiniLM-L6-v2`.
- Storage: local FS for corpora; HF/Kaggle for datasets/models.
- Invariants: no long training in request handlers; secrets from env only;
  datasets/models never in git; ZVS 2018 output.

# 🚀 Zolai Server

FastAPI server implementing the Zolai wiki knowledge base.

## Structure

```
server/
├── main.py          # FastAPI application
├── cli.py           # CLI commands
├── core/            # Core modules (dictionary, grammar, concepts)
├── services/        # Business logic (translator, validator, analyzer)
├── models/          # Pydantic models
├── api/             # API routes
├── utils/           # Utilities
└── config.py        # Configuration
```

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python server/main.py

# Or use CLI
python server/cli.py serve --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /health` — Health check
- `GET /api/translate?text=...&target=zo` — Translate text
- `GET /api/grammar?rule=...` — Get grammar rule
- `GET /api/concepts?category=...` — Get wiki concepts

## Development

```bash
# Run with auto-reload
uvicorn server.main:app --reload

# Run tests
pytest tests/

# Type check
mypy server/

# Lint
ruff check server/
```

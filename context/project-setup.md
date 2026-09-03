# Project Setup & Lifecycle Guide

## Getting Started (Python CLI + API)

```bash
git clone https://github.com/peterlianpi/zolai-ai.git
cd zolai-ai
# create venv
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env   # fill in your keys (never commit .env)
zolai --help
```

## Getting Started (Web — website/zolai-project/)

See `website/zolai-project/AGENTS.md` for full commands. Key ones:

```bash
cd website/zolai-project
bun install
cp .env.example .env
bunx prisma generate && bunx prisma migrate dev
bun run dev
```

## Context Files (Six-File Set)

These are read automatically at session start by the orchestra agents. Keep them
current — they are ground truth.

| File | Contents |
|------|----------|
| `project-overview.md` | Product description, goals, scope, success criteria |
| `architecture.md` | Stack, boundaries, storage, auth, invariants |
| `code-standards.md` | Python/TS conventions, lint, commit style |
| `project-setup.md` | This file — bootstrap + lifecycle |
| `ui-context.md` | Theme tokens, component system, layout rules |
| `progress-tracker.md` | Current phase, completed, next steps, decisions |
| `ai-workflow-rules.md` | Agent behavior + scoping rules (P-Core Orchestra) |

## Branch & Lifecycle Model

- **`master`** — preserved archive of the pre-overhaul history. Do not push/commit here.
- **`main`** — active development branch. All changes land here.
- **`feature/*`** — short-lived topic branches merged into `main`.
- **`archive/*`** — long-lived frozen snapshots (e.g. `archive/pre-cleanup-2026-04`).

## Environment Variables

All sensitive tokens live in `.env` (gitignored). `.env.example` has placeholders only.
Required keys: `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `NVIDIA_API_KEY`,
`HF_TOKEN`. Web also uses `DATABASE_URL` + auth secrets.

## Version & Lifecycle Management

- Datasets/models are versioned on HuggingFace Hub / Kaggle, not in git.
- `docs/`, `wiki/`, `context/` summarize the current state; update `progress-tracker.md`
  after every meaningful change.

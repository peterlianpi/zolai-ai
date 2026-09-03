# AGENTS.md — Zolai Training (Zolai AI Community)

## Repository

Part of the `zolai-ai` community org. This repo is one component in a multi-repo
system (core / web / tauri / datasets / training / wiki). Read the six-file
`context/` set at session start — it is the ground truth for **this repo only**.

## Branch Layout

- **`main`** — active development branch (all changes land here).
- **`master`** — preserved archive (kept as-is when this repo was split from the monorepo).
- **`feature/*`** — short-lived topic branches merged into `main`.

## Six-File Context

| File | Purpose |
|------|---------|
| `context/project-overview.md` | Product, goals, scope, success criteria (repo-local) |
| `context/architecture.md` | Stack, boundaries, storage, auth, invariants |
| `context/code-standards.md` | Conventions, lint, commit style (repo-specific) |
| `context/project-setup.md` | Bootstrap + lifecycle |
| `context/ui-context.md` | Web theme/routes (zolai-web only) |
| `context/progress-tracker.md` | Current phase, decisions, open questions |
| `context/ai-workflow-rules.md` | Agent behavior + scoping (P-Core Orchestra) |

## Orchestration Loop (OpenCode/Cursor)

On build/fix/refactor prompts use the orchestra loop:
plan → implement → verify → review (→ FIX_REQUIRED on failure). Phases run
strictly sequentially; pass the plan inline every phase.

## Connect (this repo ↔ others)

State what this repo depends on / exposes (API version, package version, data
manifest version, RAG feed). See `README.md` > Connect.

## Commit Style

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `security:`.
- Commit only to `main`. Never commit secrets.

## Security Invariants

- Secrets come only from env/`.env`; `.env.example` has placeholders only.
- Never hardcode API keys, HF tokens, or provider keys in code/docs/wiki/scripts.

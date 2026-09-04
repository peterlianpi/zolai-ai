# Repo scoping — auto-added by setup-repo-scoping

## Repo type: single-repo

This is a **single repository**. Scope all reads and globs to this root only. Do not scan sibling directories.

## Performance scoping rules

- Never glob `**/` from a parent directory — it scans thousands of files across siblings.
- Use project-relative paths: `AGENTS.md`, `context/*.md` — not `**/AGENTS.md`.
- `.ignore` / `.cursorignore` / `.gitignore` at root exclude `node_modules/`, `vendor/`, `venv/`, caches. Respect them.
- Use `rg` (respects `.ignore`) for search — not bare `find` or `grep -r`.
- Read only the files you need for the current task; do not dump-read directories.

## Learned User Preferences

- Prefer local-only processing for COS/Mind tasks; do not call external APIs.
- When acting as the COS, respond in Zolai; use English only for technical nomenclature.
- For ZSP, convert each Zolai input into a `[Subject] --[Particle]--> [Object]` triple.
- For “folder database” outputs, provide a Zolai confirmation followed by JSON-LD.
- Exclude personal/biographical “origin point” details; focus on protocol + Zolai data/wiki/tech nodes.

## Learned Workspace Facts

- The repo’s “high-gravity” tech nodes are Next.js, Hono, and Prisma.
- Repo structure work often aims to minimize root-level clutter by grouping files and deduplicating overlapping code/scripts.

---

# Zolai Second Brain — Agent Contract (P-Core Orchestra)

## Repository

Bilingual (Tedim Zolai ⇄ English) AI toolkit for the Zomi people. Read the
seven core context files + ai-workflow-rules orchestration layer (seven-file set)
in `context/` at session start — it is ground truth.

## Branch Layout

- **`main`** — active development branch. All changes land here.
- **`master`** — preserved archive of the pre-overhaul history. Do NOT commit/rewrite.
- **`feature/*`** — short-lived topic branches merged into `main`.
- **`archive/*`** — frozen snapshots (e.g. `archive/pre-cleanup-2026-04`).

## Seven-File Context

| File | Purpose |
|------|---------|
| `context/project-overview.md` | Product, goals, scope, success criteria |
| `context/architecture.md` | Stack, boundaries, storage, auth, invariants |
| `context/code-standards.md` | Python/TS conventions, lint, commit style |
| `context/project-setup.md` | Bootstrap + lifecycle |
| `context/ui-context.md` | Web theme/components/routes |
| `context/progress-tracker.md` | Current phase, decisions, open questions |
| `context/ai-workflow-rules.md` | Agent behavior + scoping (this orchestration) |

## Orchestration Loop (OpenCode/Cursor)

On build/fix/refactor prompts use the orchestra loop:

```
User prompt → planner → implementer → verifier → reviewer → ORCHESTRA_COMPLETE
                            ↑                                |
                            └── FIX_REQUIRED ────────────────┘
```

Phases run strictly sequentially; pass the plan inline every phase.

## Commit Style

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `security:`.
- Commit only to `main`. Never amend forced-pushed history or commit secrets.

## Security Invariants

- Secrets come only from env/`.env`; `.env.example` has placeholders only.
- Never hardcode API keys, HF tokens, or provider keys in code, docs, wiki, or scripts.
- `.env` and private `data/` are gitignored.

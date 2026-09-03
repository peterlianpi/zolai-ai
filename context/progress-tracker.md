# Progress Tracker

> Update this file after every meaningful implementation change.
> Active branch: `main`. `master` is the preserved archive.

## Current Phase

- In progress: P-Core context/docs/architecture overhaul (branch `main`).

## Current Goal

- Establish `main` (branch layout: `main` active, `master` archived), fill the
  six-file context set, add pcore-orchestra workflow rules, and bring docs
  (architecture, RAG/AI, security, structure) in line with the real stack.

## Completed

- Switched active branch to `main`; `master` retained as untouched archive.
- Filled six-file context set: `context/architecture.md`, `project-overview.md`,
  `code-standards.md`, `project-setup.md`, `ui-context.md`, `progress-tracker.md`.
- Added pcore-orchestra `context/ai-workflow-rules.md` + root `AGENTS.md`.
- Security scan: no hardcoded API keys found; verified `.gitignore` + `.env.example`.

## In Progress

- RAG/AI architecture documentation (`docs/ZOLAI_AI_ARCHITECTURE.md` +
  dedicated AI/RAG doc).
- Docs sweep: README, ROADMAP, TODO, SECURITY, CONTRIBUTING, docs/ structure.

## Next Up

- Reconcile `docs/PROJECT_STRUCTURE.md` / `ROOT_STRUCTURE.md` with actual repo layout.
- Light code patches flagged by structure/architecture review (only clearly broken).
- Commit docs/context to `main`.

## Open Questions

- Whether to auto-track the 89 local-only untracked files (context/, desktop/,
  scripts/bible/) or keep them untracked.

## Architecture Decisions

- `main` is the active branch; `master` is preserved as archive (do not rewrite).
- Secrets come only from env/`.env`; `.env.example` holds placeholders.
- Datasets/models live on HuggingFace/Kaggle, never in git.

## Session Notes

- Orchestra subagent model cache was stale (`x-preview-f-free` removed from Zen);
  config updated to `ling-3.0-flash-fin-free` / `mimo-v2.5-free`. A process restart
  is required before subagents can spawn.

## Org & Community Direction (added this session)

- **Decision:** move Zolai AI to a GitHub community org `zolai-ai` (like `P-Core-System`),
  separate repos per component; **monorepo first, physical split later**.
- Plan written to `docs/ZOLAI_GITHUB_ORG_PLAN.md`. **No GitHub org/repo changes yet** —
  pending approval. Repos: zolai-core, zolai-web, zolai-tauri, zolai-datasets,
  zolai-wiki, zolai-training, .github (profile).
- **Focus pillars (this phase):** deepen website, model training + Kaggle, learn sentences
  & word prediction, linguistic improvement, wiki update/improve.

## Wiki Improvement Roadmap

1. Keep `wiki/README.md` as the index/canonical map (1529 files).
2. Enrich grammar/linguistics + curriculum under ZVS 2018; feed RAG.
3. Expand sentence/word-prediction training corpora from wiki nodes.
4. Reconcile wiki vocabulary with dictionary FTS + embeddings.
5. Update `zolai_ai_instructions.md` / `zolai_system_prompt.txt` as ground truth.

## Docs/README Updates (added this session)

- Root `README.md`: added **Branch Layout** (`main` active / `master` archive),
  **Documentation & Context** section, and **current focus pillars** in Roadmap.
- `zolai/README.md`: added branch layout, context-set reference, API quickstart.
- `docs/README.md`: indexes architecture, RAG/AI, wiki enrichment, and org plan.

## Repo-Split Planning (added this session)

- `docs/REPO_SPLIT_BLUEPRINT.md`: monorepo → `zolai-ai` org split design — target
  repos (core/web/tauri/datasets/training/wiki/.github), per-repo six-file context +
  semantic versioning, connection matrix, phased execution (B → filter-repo, C →
  templates+hooks+CI, D → wiring).
- `docs/templates/repo/`: reusable `AGENTS.md` + six-context setup templates.
- `scripts/repo_bootstrap.sh`: scaffolds a new split repo with six-file context + AGENTS.
- **Status:** PLAN only. No repo creation/GitHub changes yet.

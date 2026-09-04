# Documentation

Project guides, references, and deployment docs for the **Zolai Second Brain**.

## Root Docs

| File | Description |
|------|-------------|
| `ZOLAI_KNOWLEDGE_BRAIN_ARCHITECTURE.md` | RAG-first knowledge brain architecture (no raw fine-tuning) |
| `DATA_NAMING_GUIDE.md` | File and field naming conventions |
| `DATA_NAMING_QUICK_REF.md` | Quick naming reference card |
| `STRUCTURE.md` | Canonical repo layout (verified against real filesystem) |
| `SERVER_SETUP_GUIDE.md` | AWS Lightsail server deployment |
| `AWS_DEPLOYMENT.md` | AWS deployment reference |
| `ZOLAI_KAGGLE_OPENCLAW_GUIDE.md` | Kaggle + OpenClaw training guide |
| `DATA_IMPROVEMENT_PLAN.md` | Data improvement plan |
| `DATA_AUDIT.md` | Data audit report |
| `LOGS_AND_TMP.md` | Logs and temp file conventions |
| `ACTION_PLAN.md` | Action plan and priorities |
| `specs/schema.md` | Database schema (Prisma, root-level) |
| `wiki_dictionary_reconciliation.md` | Wiki ↔ dictionary reconciliation audit |
| `GEMINI.md` | Gemini CLI context file (root-level — load with `gemini -f GEMINI.md`) |

## Guides (`guides/`)

| File | Description |
|------|-------------|
| `GET_STARTED.md` | Getting started — new contributors |
| `QUICKSTART_DICTIONARY.md` | Dictionary pipeline quickstart |
| `QUICK_REFERENCE.md` / `QUICKREF.md` | Command quick reference |
| `IMPLEMENTATION_GUIDE.md` | Implementation patterns and standards |
| `ZOLAI_PIPELINE_GUIDE.md` | Full data pipeline walkthrough |
| `AGENTS.md` | Agent usage and coding standards |
| `CHANGELOG.md` | Project changelog |
| `KAGGLE_ROADMAP.md` | Kaggle training roadmap (`guides/training/KAGGLE_ROADMAP.md`) |
| `MACHINE_OPTIMIZATION.md` | Hardware optimization guide |
| `EXTERNAL_RESOURCES.md` | External tools and references |
| `PROMPT_QUICK_REFERENCE.md` | Prompt engineering reference |
| `START_HERE.md` | New contributor entry point |
| `TOOLS_LIBRARIES_OPTIMIZATION.md` | Tools and library guide |
| `GEMINI.md` | Gemini CLI context file |
| `AGENTS.md` | Agent usage and coding standards (full) |
| `INTEGRATION_GUIDE.md` | Integration patterns |
| `DASHBOARD.md` | Project dashboard |
| `DOCUMENTATION_INDEX.md` | Full documentation index |

## Prompts (`prompts/`)

Agent prompts for data collection, cleaning, labeling, and wiki updates.

| File | Purpose |
|------|---------|
| `collect.md` | Data collection prompts |
| `clean.md` | Data cleaning prompts |
| `label.md` | Data labeling prompts |
| `master.md` | Master agent prompt |
| `master-prompt.md` | Extended master prompt |
| `wiki_update.md` | Wiki update prompts |

## Architecture & Community

- `ZOLAI_KNOWLEDGE_BRAIN_ARCHITECTURE.md` — RAG-first knowledge brain (no raw fine-tuning).
- `ZOLAI_RAG_AI_ARCHITECTURE.md` — retrieval-augmented generation, embeddings/vector store, text-prediction & learning loops.
- `ZOLAI_AI_ARCHITECTURE.md` — system + 5-step data pipeline.
- `ZOLAI_GITHUB_ORG_PLAN.md` — plan to move to `zolai-ai` community org (separate repos per component, monorepo-first).
- Root `AGENTS.md` + `context/` — active-branch contract (`main`), `master` archived.

## Wiki & Org Artifacts

- `WIKI_ENRICHMENT_GUIDE.md` — how to improve/keep the wiki (RAG-ready, ZVS 2018, index hygiene).
- `org/zolai-ai-profile-README.draft.md` — draft org profile README for the future `zolai-ai` org.

## Repo Split & Per-Repo Setup

- `REPO_SPLIT_BLUEPRINT.md` — monorepo → multi-repo split design (target repos, per-repo
  six-file context + semver, connection matrix, phasing).
- `templates/repo/` — reusable per-repo templates (`AGENTS.md`, six-context setup).
- `scripts/repo_bootstrap.sh` — bootstrap a split repo: `bash scripts/repo_bootstrap.sh <root> "<name>" <type>`.

**Last Updated:** 2026-09-04

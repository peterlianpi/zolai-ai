# Progress Tracker

> Update this file after every meaningful implementation change.
> Active branch: `main`. `master` is the preserved archive.

## Current Phase

- In progress: P-Core context/docs/architecture overhaul (branch `main`); docs sweep done.

## Current Goal

- Establish `main` (branch layout: `main` active, `master` archived), fill the
  six-file context set, add pcore-orchestra workflow rules, and bring docs
  (architecture, RAG/AI, security, structure) in line with the real stack.

## Completed

- Switched active branch to `main`; `master` retained as untouched archive.
- Filled six-file context set: `context/architecture.md`, `project-overview.md`,
  `code-standards.md`, `project-setup.md`, `ui-context.md`, `progress-tracker.md`.
- Added pcore-orchestra `context/ai-workflow-rules.md` + root `AGENTS.md`.
- Docs sweep completed (2026-09-04): harmonized six→seven-file context terminology; fixed README ZVS dialect list; refreshed all guide indexes to 2026-09-04; added docs/ZOLAI_KNOWLEDGE_BRAIN_ARCHITECTURE.md (RAG-first); created CONTRIBUTING.md; marked aspirational website docs subdirs as planned; fixed docs/guides/AGENTS.md system specs (T4x2 GPU, pytest).
- Knowledge-brain commit: added docs/ZOLAI_KNOWLEDGE_BRAIN_ARCHITECTURE.md (RAG-first architecture, no raw fine-tuning).

## In Progress

- RAG/AI architecture documentation (`docs/ZOLAI_AI_ARCHITECTURE.md` +
  dedicated AI/RAG doc).
- Docs sweep: README, ROADMAP, TODO, SECURITY, CONTRIBUTING, docs/ structure.

## Next Up

- Reconcile `docs/PROJECT_STRUCTURE.md` / `ROOT_STRUCTURE.md` with actual repo layout (**done** — `docs/STRUCTURE.md` added, old docs archived to `docs/archive/`).
- Light code patches flagged by structure/architecture review (only clearly broken).
- Decide whether to auto-track the 89 local-only untracked files (**done** — real source tracked via 5bf5b4f; local artifacts ignored via .gitignore additions).

## Open Questions

- Whether to auto-track the 89 local-only untracked files (**resolved** — real source tracked, local artifacts ignored; commit 5bf5b4f).
- Whether CONTRIBUTING.md should be a full guide or remain a lightweight stub
  (current: lightweight stub created for now).

## Architecture Decisions

- `main` is the active branch; `master` is preserved as archive (do not rewrite).
- Secrets come only from env/`.env`; `.env.example` holds placeholders.
- Datasets/models live on HuggingFace/Kaggle, never in git.

## Session Notes

- Orchestra subagent model cache was stale (`x-preview-f-free` removed from Zen);
  config updated to `ling-3.0-flash-fin-free` / `mimo-v2.5-free`. A process restart
  is required before subagents can spawn.
- This session: drove 3 orchestra cycles — docs consolidation (5→1 restructuring guide, 3→1 dictionary guide), broad docs/context sweep (ZVS dialect fix, six→seven-file harmonization, dead path cleanup, structure docs consolidation), and untracked-files decision (83 items resolved).

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
- `docs/STRUCTURE.md`: canonical repo layout replacing PROJECT_STRUCTURE.md + ROOT_STRUCTURE.md (both archived).

## Repo-Split Planning (added this session)

- `docs/REPO_SPLIT_BLUEPRINT.md`: monorepo → `zolai-ai` org split design — target
  repos (core/web/tauri/datasets/training/wiki/.github), per-repo six-file context +
  semantic versioning, connection matrix, phased execution (B → filter-repo, C →
  templates+hooks+CI, D → wiring).
- `docs/templates/repo/`: reusable `AGENTS.md` + six-context setup templates.
- `scripts/repo_bootstrap.sh`: scaffolds a new split repo with six-file context + AGENTS.
- **Status:** PLAN only. No repo creation/GitHub changes yet.

## Split Scaffolds (staged, no GitHub)

- Pre-scaffolded all 6 component repos in `/tmp/opencode/zolai-split-staging/` using
  `scripts/repo_bootstrap.sh`: zolai-core/web/tauri/datasets/training/wiki — each with
  AGENTS.md + six-file context + CONNECT.md, populated with **real repo-specific content**
  (overview + architecture per repo type). Web's ui-context is web-aware; data/wiki types
  get a "n/a" ui-context.
- Each repo also has a `CONNECT.md` (provides/depends) referencing the split blueprint.
- **No GitHub repos/org created** — review the staged scaffolds first; promote to the
  `zolai-ai` org when approved (Phase B: git filter-repo).

## Roadmap/TODO Sync (added this session)

- Pushed `main` to `origin` (`git push -u origin main`); remote now has the full
  pcore-orchestra + repo-split + wiki docs on branch `main`.
- `ROADMAP.md`: added "Current Focus Pillars" section (website, training/Kaggle,
  prediction, linguistic, wiki, org) + active-branch note.
- `TODO.md`: added "Current Phase" section; bumped stamp to 2026-09-03.

## Wiki↔Dictionary Reconciliation (added this session)

- Added read-only audit `scripts/reconcile_wiki_dictionary.py` + report
  `docs/wiki_dictionary_reconciliation.md` (committed `188ca5d`, pushed).
- Findings: 36,667 dictionary headwords, 0 banned dialect headwords;
  47.3% clean single-token wordlist coverage, ~35K compound/gap candidates
  flagged for dictionary enrichment (A1-B1 priority noted).
- Tool is re-runnable: `python scripts/reconcile_wiki_dictionary.py`.

## Zolai Knowledge Brain — Backlog A (added this session)

- New `zolai/knowledge/` package: `ingest.py` (O(n) heading chunking + batch
  all-MiniLM-L6-v2 embeddings → JSONL), `retrieve.py` (offline numpy cosine
  retrieval, no external vector DB, `format_context` for RAG injection),
  `ngram.py` (unigram/bigram prediction tables), `__init__.py`.
- `scripts/kg/smoke_test.py` PASS 3/3 deterministic corpus queries.
- Replaced broken `scripts/kg/ingest_wiki.py` (wrote whole corpus as one record,
  zero newline bytes).
- Local-only artifacts under `artifacts/kg/` (gitignored).
- Backlog B (PDF OCR), C (prediction features), D (dataset export via
  zolai-datasets), E (assistant) still open.

## Docs Update Log

- 2026-09-04: docs/context improvement sweep committed to `main`:
  - Harmonized six→seven-file context terminology in root `AGENTS.md`.
  - Fixed README ZVS dialect "Never" list (`pasian`, `gam`, `tapa` are USE words).
  - Added `context/ai-workflow-rules.md` and `docs/ZOLAI_KNOWLEDGE_BRAIN_ARCHITECTURE.md` cross-refs.
  - Fixed `docs/README.md` date, `KAGGLE_ROADMAP.md` path, removed stale References section, added knowledge-brain doc.
  - Refreshed `docs/guides/{PROMPTS_INDEX,DOCUMENTATION_INDEX,AGENTS}.md` to 2026-09-04; fixed dead `/Cleaned_Bible/` path; softened pytest claim; corrected T4x2 GPU spec.
  - Marked aspirational `website/zolai-project/AGENTS.md` docs subdirs as "(planned)".
  - Created `CONTRIBUTING.md` stub; refreshed ROADMAP/TODO contributing line.
- 2026-09-04: reconciled `docs/PROJECT_STRUCTURE.md` / `ROOT_STRUCTURE.md` with actual layout — added canonical `docs/STRUCTURE.md`, archived old docs to `docs/archive/`, updated `docs/README.md` index.

## Zolai Knowledge Brain — Backlog B: PDF OCR ingest (added this session)

- New `zolai/knowledge/pdf.py`: `iter_ocr_markdown()` scans `data/corpus/ocr/*/*/markdown.md`
  (consolidated OCR outputs; skips `pages/` per-page duplicates) and `index_pdfs()` embeds
  them as `source_type=pdf` into the same knowledge_vectors.jsonl. `extract_pdf_text()` uses
  Mistral OCR when `MISTRAL_API_KEY` set, else local pypdf/pdfplumber.
- Plays-based-learning booklet indexed: 28 pdf-derived chunks (index 131 wiki + 28 pdf = 159).
- smoke_test extended to verify pdf rows; PASS.

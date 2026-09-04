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
- Backlog C (prediction lookup API) done. Added `zolai/api/prediction_api.py` with endpoints `/predictions/next`, `/predictions/completions`, `/predictions/corrections`, `/predictions/health`. Wired into `zolai/api/tools.py`. Tests pass.
- Backlog B (PDF OCR), C (prediction features), D (dataset export via
  zolai-datasets), E (assistant) still open (B done).

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

## Org Migration EXECUTED (added this session) — zolai-ai org live

- User created GitHub org `zolai-ai` (resolves `Zolai-AI`). Migration executed as
  **fresh snapshot repos** (no filter-repo), org-prefixed names, monorepo kept on
  `peterlianpi/zolai-ai` + mirrored to org.
- Repos created & pushed (all public, `main`): `zolai-core`, `zolai-web`,
  `zolai-tauri`, `zolai-datasets`, `zolai-training`, `zolai-wiki`,
  `zolai-github` (org profile + community/*), and monorepo mirror `zolai-ai/zolai-ai`.
- **Blocked:** `zolai-web` push rejected by org-wide secret push-protection
  (GH013). Removed generated Prisma client (`lib/generated/`) + flattened to a
  single clean commit; verified no tracked secret (env files gitignored, docs use
  `=...` placeholders). Block persists on detector token `3IrYlPqjUCQX6d80auJXl9bJZuG`.
  Needs org-admin: enable Secret Scanning to reveal the secret, or run GitHub's
  unblock URL. Re-push after resolve: `git -C /tmp/opencode/zolai-ai-org/zolai-web push origin HEAD:main`.
- Staging lives at `/tmp/opencode/zolai-ai-org/` (per-repo AGENTS + six-file context
  + CONNECT + README + .gitignore; heavy data/node_modules/.env excluded).

## Org profile fix (added this session)

- Renamed local+GitHub repo `zolai-github` → **`.github`** (the special org-profile
  repo). Org page now shows it as the profile repo; rewritten `profile/README.md`
  (complete org profile: intro, repo table, connect diagram, principles, get-started,
  contribute) + root README. Fixed org description + `.github` repo description.
- Appended a consistent "Part of the Zolai-AI org" footer + contribution link to every
  component repo README (core/web/tauri/datasets/training/wiki); all pushed except
  `zolai-web` (still behind secret push-protection block).
- Org state: 8 repos (`.github`, `zolai-ai`, `zolai-core`, `zolai-datasets`,
  `zolai-tauri`, `zolai-training`, `zolai-web`, `zolai-wiki`), all public, default
  branch `main`. Local staging in `/tmp/opencode/zolai-ai-org/` aligned by name.

## Org public page / profile (added this session)

- Followed official GitHub docs (org profile README = public `.github` repo +
  `profile/README.md` on default branch). Ours matches ✅.
- Embedded `logo.png` (500×500 from website public) into `.github` profile + added
  `og.png` social card; set org description, website, location; added topics
  (`zolai,tedim,zomi,zomi-language` + per-repo) to all repos.
- Wrote `docs/org/GITHUB_ORG_PROFILE_SETUP.md` capturing official requirements +
  owner-only remaining steps (avatar upload, pinning, billing resolution) which
  cannot be done via API.

## Org brand assets (added this session)

- Generated vector logo + social card (SVG sources in `docs/org/assets/`), rendered
  to `logo.png` (500×500 avatar) and `og.png` (1200×630) with ImageMagick.
- Deployed to `Zolai-AI/.github`; avatar upload still owner-only (Settings → Profile).
- Wordmark: "ZOLAI AI" · tagline "TEDIM ZOLAI · ZVS 2018"; colors #062E24/#0E9F8A/#3EDDBF.

## Org profile/brand fix (this session)

- Root cause of "profile not showing": org profile README was at `.github/profile/README.md`
  (nested); GitHub requires it at **`profile/README.md`** (repo root). Moved + pushed.
- Removed broken `blog` link (`zolai-ai.github.io` had no Pages site) — set to `null`
  (P-Core uses blog:null too; no Pages site needed).
- Reverted to **existing website logo** per user: `.github/logo.png`/`og.png` now mirror
  `website/public`; removed the generated SVG files.
- Org profile README now at `profile/README.md` with absolute org-repo links.

## Org Pages site live (this session)

- Created `Zolai-AI/zolai-ai.github.io` (public, `main`) — GitHub Pages **org site**
  (requires repo named exactly `zolai-ai.github.io` per official docs; serves the bare root).
- Landing `index.html` + `README.md` + `_config.yml` (Jekyll minimal) + `logo.png`
  (byte-identical to the website/orig brand).
- Pages built and live: `https://zolai-ai.github.io/` → HTTP 200; logo served correctly.
- Org `blog` set back to the live URL (previously `null` when no site existed).
- This resolves the earlier `zolai-ai.github.io` 404 for good.

## Pages landing polish (this session)

- Rebuilt `zolai-ai.github.io/index.html`: design-token brand theme (Zomi green/teal
  palette), staggered entrance animations, logo hover scale/glow, pill hover lift +
  sheen sweep, animated ambient blobs, gradient headline shine.
- Accessibility: `prefers-reduced-motion` respected, `:focus-visible` rings, semantic
  nav landmarks, contrast-safe colors. `logo.png` unchanged (byte-identical).
- Rebuilt & live: https://zolai-ai.github.io/ HTTP 200.

## Workspace migration (this session)

- Created org workspace **`/home/peter/Documents/Projects/zolai-ai/`** (org-named).
- Moved current project in place as the **monorepo main** `zolai-ai/` (kept 19G: data,
  .venv, node_modules, full git history). origin=peterlianpi/zolai-ai, org=Zolai-AI/zolai-ai.
- Brought all 8 component repos (`zolai-core/web/tauri/datasets/training/wiki`, `.github`,
  `zolai-ai.github.io`) as lightweight clones; normalized each to `main` and synced to org remotes.
- `zolai-web` set to clean `main` (0 lib/generated tracked); push still blocked by GH013 (owner-only unblock).
- Added `zolai-ai.code-workspace` (multi-root) + workspace `README.md` (data-ownership: main holds heavy data).
- NOTE: default cwd/single-repo scope is now the monorepo subfolder `zolai-ai/`.

## Monorepo restructure + P-Core-orchestra adoption (orchestra loop, this session)

- Ran full orchestra loop (planner -> implementer -> verifier -> reviewer); verdict ORCHESTRA_COMPLETE.
- Outcome: reverted earlier questionable doc moves (LICENSE/SECURITY/CONTRIBUTING/TODO/ROADMAP/GEMINI
  restored to ROOT); kept `zolai/` package at root (parents[N] path safety); notebooks/kaggle_notebook_upload/path kept at root.
- Versioning: reconciled to **2.0.0** across pyproject.toml + zolai/__init__.py + package.json; added CHANGELOG.md (Keep a Changelog).
- Added orchestra tooling (adapted, not wholesale): scripts/init-context.sh, scripts/session-claims.sh, scripts/update-free-models.sh (all executable).
- AGENTS.md seven-file context set confirmed consistent with context/.
- Verification: pytest 24 passed; kg smoke PASS 3/3; import zolai = 2.0.0; tree clean. Only pre-existing ruff error in zolai/api/tools.py:52 (unrelated, not regressed).
- Commits: c205e70 (version/CHANGELOG/scripts), d691db7 (restore root docs / rm docs/GEMINI.md).

## Component-repo versioning alignment (continuation)

- Aligned all 6 code component repos to the Zolai-AI **2.0.0** baseline (matching monorepo):
  added a `CHANGELOG.md` to zolai-core, zolai-web, zolai-tauri, zolai-datasets,
  zolai-training, zolai-wiki; reconciled zolai-web package.json 0.1.0 -> 2.0.0.
- Pushed: core 53c7eed, tauri 314d30c, datasets f8df64c, training 84f57d5, wiki f8f154d.
- zolai-web committed locally only (push still blocked by GH013 unblock).

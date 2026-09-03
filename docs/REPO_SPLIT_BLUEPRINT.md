# Zolai AI — Monorepo → Multi-Repo Split Blueprint

> **Status: PLAN.** Active branch `main`. Companion to `docs/ZOLAI_GITHUB_ORG_PLAN.md`.
> Goal: split the current monorepo into clean per-component repos under the
> `zolai-ai` community org, each with its own **pcore-orchestra six-file context set**,
> **architecture template**, and **semantic versioning**. Mirrors the `P-Core-System` pattern.

## 1. Source Survey (current monorepo)

| Path | Size | Maps to repo |
|------|------|--------------|
| `zolai/` (992K) | Python package CLI/API/modules | `zolai-core` |
| `website/zolai-project/` (5.0G incl. node_modules) | Next.js + Hono + Prisma | `zolai-web` |
| `desktop/` (60K) | Tauri shell + bundled server | `zolai-tauri` |
| `scripts/data_pipeline|dictionary|cleaner|bible|training/` | build/training scripts | `zolai-datasets` + `zolai-training` |
| `wiki/` (48M) | knowledge base | `zolai-wiki` |
| `data/` (6.3G, gitignored) | corpora/datasets (HF/Kaggle mirrors) | `zolai-datasets` (pointers only) |
| `agents/ skills/` | agent defs + skills | `zolai-core` (or shared) |
| `docs/ context/ AGENTS.md` | docs + six-file set | each repo (own set) |
| `kaggle_dataset/` (1.4G) | Kaggle bundle | `zolai-training`/`zolai-datasets` |

---

## 2. Target Repos (zolai-ai org) — each with six-file context + semver

### A. `zolai-ai/core`  (`zolai-core`)
- **Type:** Python package + FastAPI + CLI
- **Moves in:** `zolai/`, root `pyproject.toml`, `tests/`, `config/`, `agents/`, `skills/`, `Dockerfile`, `docker-compose*.yml`
- **Version:** Python package `__version__` + `pyproject.toml` (0.5.x semantic)
- **Exposes:** REST API (translation, dictionary, chat), `zolai` CLI entrypoint, RAG retrieval

### B. `zolai-ai/web`  (`zolai-web`)
- **Type:** Next.js + Hono + Prisma + Tailwind/shadcn
- **Moves in:** `website/zolai-project/` **contents** → repo root
- **Version:** `package.json` version + tags (1.x)
- **Consumes:** core API (REST) + datasets via HF; own AGENTS.md + six-file ui-context, code-standards

### C. `zolai-ai/tauri`  (`zolai-tauri`)
- **Type:** Tauri (Rust) offline desktop shell
- **Moves in:** `desktop/` contents → repo root
- **Version:** `src-tauri/Cargo.toml` version
- **Consumes:** core (bundled FastAPI server) + local GGUF via Ollama

### D. `zolai-ai/datasets`  (`zolai-datasets`)
- **Type:** data-adjacent (no large blobs committed)
- **Moves in:** `kaggle_dataset/` scripts, `scripts/data_pipeline|dictionary|cleaner|bible/`, `data/` READMEs + manifest + download scripts, HF/Kaggle pointers
- **Version:** dataset manifest version (timestamped)
- **Hosts:** HF `peterpausianlian/*` + Kaggle `zolai-llm-training-dataset`, `zolai-adapter-qwen25-3b`

### E. `zolai-ai/training`  (`zolai-training`)
- **Type:** ML training + evaluation
- **Moves in:** `scripts/training/`, `notebooks/`, eval scripts, adapter-merge/GGUF-export scripts, session logs
- **Version:** run/session based + tracking in `wiki/training/llm_training_roadmap.md`
- **Consumes:** datasets repo; produces adapters → HF/Kaggle

### F. `zolai-ai/wiki`  (`zolai-wiki`)
- **Type:** documentation/knowledge base (large but text-only)
- **Moves in:** `wiki/` contents → repo root
- **Version:** content version (build-timestamp); drives RAG
- **Consumes:** nothing; feeds core RAG + web curriculum

### G. `zolai-ai/.github`
- **Type:** org profile README, community health files (CODE_OF_CONDUCT, CONTRIBUTING, issue/PR templates)
- **Moves in:** draft `docs/org/zolai-ai-profile-README.draft.md`

---

## 3. Per-Repo pcore-orchestra Six-File Context Template

Each repo gets its own `context/` set + root `AGENTS.md` + `.github` Cursor/OpenCode hooks, following the same P-Core methodology:

```
<repo>/
├── context/
│   ├── project-overview.md    # product + goals + scope + success criteria (repo-local)
│   ├── architecture.md        # stack, boundaries, storage, auth, invariants (repo-local)
│   ├── code-standards.md      # language-specific conventions + lint + commit style
│   ├── project-setup.md       # bootstrap + lifecycle (repo-local)
│   ├── ui-context.md          # ONLY for zolai-web (theme, components, routes)
│   ├── progress-tracker.md    # current phase + decisions + open questions
│   └── ai-workflow-rules.md   # agent behavior + scoping
├── AGENTS.md                  # agent contract (branch layout, six-file ref, orchestra loop)
├── .github/                   # hooks (Cursor/OpenCode ambient orchestra) + CI
└── README.md                  # index + connect matrix (how it wires into the ecosystem)
```

- **Template selection:** use the matching architecture template per repo type
  (Python/service → `27-system-design` + `26-folder-structure`; Next.js web →
  frontend template; Rust desktop → desktop template). Fill the six-file set the
  way `context/project-setup.md` prescribes (steps 1→7).
- **Versioning:** each repo semver-tags independently; cross-repo compatibility
  documented in each `README.md` "Connect" section (API version, package version,
  data manifest version).

---

## 4. Connection Matrix (how repos reconnect)

```
zolai-web  ──REST (core api)──▶ zolai-core
zolai-tauri──REST/GGUF────────▶ zolai-core
zolai-core ──pip install──────▶ zolai-web? (no) — core is a service, web calls HTTP
zolai-training ──▶ zolai-datasets (HF/Kaggle) ──▶ zolai-core (retrieval/inference)
zolai-wiki ──RAG index──▶ zolai-core (embeddings) + zolai-web (curriculum)
```

- `zolai-core` is the **only** runtime dependency for `web`/`tauri` (clean layering).
- `datasets` + `training` are **build-time** dependencies via HF/Kaggle/notebooks.
- `wiki` is a **content** dependency consumed by both RAG and curriculum.

---

## 5. Phased Execution

- **Phase A (done):** monorepo docs/context + org plan + split blueprint (this file).
- **Phase B:** create `zolai-ai` org; materialize each repo via `git filter-repo`
  (subtree/filter per repo); push.
- **Phase C:** add per-repo `context/` six-file set + `AGENTS.md` + hooks + CI from
  pcore-orchestra template.
- **Phase D:** wire CI/CD (web → Vercel, core → Docker/VPS, tauri → GitHub Actions
  builds), redirect personal remotes, update `docs/` + READMEs to org links.

## 6. Success Criteria

1. Each repo builds/installs independently with its own six-file context + semver.
2. Cross-repo wiring is documented (connect matrix) and CI-enforced where possible.
3. Repo sizes stay lean: no large datasets/node_modules committed.
4. `master` (this repo) remains the canonical archive; org repos are the future home.

---

## 7. Open Items / Decisions

- Final repo names: `core|web|tauri|datasets|training|wiki` vs `zolai-core|zolai-web|...`
  (mixed: org prefix `zolai-` chosen for clarity).
- Whether `agents/`+`skills/` stay in `zolai-core` or move to their own `zolai-shared`.
- Which architecture templates to copy into each repo (finalize from pcore-orchestra
  template library at Phase C).
- GitHub org plan requirement (free org) + repo transfer vs reshape.

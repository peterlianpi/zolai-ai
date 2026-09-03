# Zolai AI Community — GitHub Org & Repo-Split Plan

> Status: **PLAN** (no GitHub changes made yet). Active branch: `main`.
> Decision: move Zolai AI from personal account `peterlianpi` to a dedicated
> community org named **`zolai-ai`**, with separate repos per component —
> monorepo first, then physical split once web + training are stable.
> Modeled on the `P-Core-System` org pattern (one repo per service, connected
> via APIs/bridges).

## 1. Goal

Turn the Zolai AI project from a personal account into a community org that
anyone can contribute to, with clean per-component repos and clear connections
between them — mirroring how `P-Core-System` organises `pcore-*` services.

## 2. Target Org: `zolai-ai`

Community-facing org. Owners: peterlianpi (admin) + trusted contributors.
Public repos (open source) with a `.github` profile README describing the
community and the component map.

## 3. Repo Layout (target — physical split later)

| Repo | Contents (moved from monorepo) | Connects to |
|------|--------------------------------|-------------|
| `zolai-ai/core` (or `zolai-core`) | Python package `zolai/`, CLI, FastAPI `zolai/api` | web, tauri, datasets |
| `zolai-web` | `website/zolai-project/` Next.js + Hono + Prisma | core (API), datasets |
| `zolai-tauri` | `desktop/` Tauri shell | core (bundled server) |
| `zolai-datasets` | HF/Kaggle dataset pointers + build scripts | core, training |
| `zolai-wiki` | `wiki/` knowledge base | core (RAG), web (curriculum) |
| `zolai-training` | `scripts/training/`, notebooks, adapter/GGUF export | datasets, core |
| `zolai-ai/.github` | org profile README + community health files | — |

## 4. How They Reconnect (the "pcore" way)

- **Core owns the API surface**; web/tauri depend on `zolai` package (pip) or the
  REST API, never on each other's internals.
- **Datasets & wiki** are consumed via HuggingFace/Kaggle and RAG indexing; repos
  reference them, git stores no large blobs.
- **Docs** (`docs/ARCHITECTURE.md`, README index) map every repo's role, ports,
  and the "connection matrix" below.

### Connection Matrix

```
zolai-web ──REST──▶ zolai-core ──HF/Kaggle──▶ zolai-datasets
zolai-tauri ──REST/GGUF──▶ zolai-core         zolai-wiki ──RAG──▶ zolai-core
zolai-training ──▶ zolai-datasets + adapters ──▶ zolai-core (inference)
```

## 5. Phasing

- **Phase A (now):** Keep this repo as the monorepo. Commit the split architecture +
  org README. Update wiki + progress tracker. **No GitHub changes.**
- **Phase B:** Once web + training are stable, physically extract each repo
  (filtered history via `git filter-repo`), create `zolai-ai` org, push each repo.
- **Phase C:** Retire/redirect personal `peterlianpi/zolai-ai*`; point CI, docs,
  and remote URLs to the org.

## 6. Org Administration

- Create org `zolai-ai` (requires GitHub plan that allows free orgs; use
  `gh org` invite collaborators as needed).
- Add `.github/` profile README (community map, contributing links, code of conduct).
- Transfer ownership, not fork: preserves stars/issues.

## 7. Success Criteria

1. Org `zolai-ai` hosts all Zolai AI components as clear, connected repos.
2. Every repo builds/installs independently and documents its dependencies.
3. Wiki + datasets + training flow cleanly into core RAG/API.
4. Community can contribute via org PRs; personal account no longer the home.

## 8. Next Actions (when approved)

1. Draft org `zolai-ai` profile + per-repo README skeletons.
2. `git filter-repo` extraction for each target repo.
3. Create org, transfer/host repos, update workflows + remotes + docs.

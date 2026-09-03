# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. The context
files define what to build, how to build it, and current state. Always
implement against these specs — do not infer or invent behavior from scratch.

## Scoping Rules

- Work on one feature unit at a time.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single implementation step.

## When to Split Work

Split an implementation step if it combines:

- UI changes and background task changes (e.g. ChatPanel + trainer loop)
- Multiple unrelated API routes (e.g. dictionary + chat + admin/n8n)
- Behavior not clearly defined in the context files

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## System Design Triggers

When starting a new feature, check whether it triggers any of these concerns.
If yes, define the approach in `architecture.md` > System Design before implementing:

| Trigger | Consider |
|---------|----------|
| Corpus/dataset ingestion | HF/Kaggle mirror, dedupe, normalization |
| New LLM provider or key | env token, rate-limiting, .env.example |
| Semantic search / RAG | ChromaDB/FAISS index + embeddings |
| Background training / long job | Never in request handlers; worker only |
| Realtime chat updates | SSE / WebSocket |
| Data growth beyond 1M rows | repo stays small; data on HF/Kaggle |

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files.
- If a requirement is ambiguous, resolve it in the relevant context file first.
- If a requirement is missing, add it as an open question in `progress-tracker.md`.

## Protected Files

Do not modify the following unless explicitly instructed:

- `data/` — gitignored corpora; mirror from HF/Kaggle, never hand-edit large files.
- `master` branch — preserved archive; never commit/rewrite.
- `website/zolai-project/node_modules`, lockfiles managed by Bun.
- `context/specs/_unit-spec.template.md` — template; copy, don't edit.

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or boundaries → `architecture.md`
- Storage model decisions → `architecture.md`
- Code conventions or standards → `code-standards.md`
- Feature scope → `project-overview.md`
- Progress → `progress-tracker.md`

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope.
2. No invariant defined in `architecture.md` was violated.
3. `progress-tracker.md` reflects the completed work.
4. Lint/tests pass (`ruff`, `pytest`, and website compliance checks).

## Concurrent Session Guard (session-claims)

Other AI sessions may be editing the same repo concurrently. Before implementing,
and again before committing:

```bash
bash scripts/session-claims.sh check "$PWD" <paths-you-will-touch>
```

- `check` → visibility only (shows other sessions working on those paths)
- `claim`/`renew`/`release` → tracking for coordination

Claim your work at phase start, renew on long operations, release when done.
Claims auto-expire after 30 min without heartbeat (`gc` purges them). Set
`PCORE_SESSION_ID` for a stable identity across shells. If the script is not
present in this repo, treat as no-op (visibility only, never blocking).

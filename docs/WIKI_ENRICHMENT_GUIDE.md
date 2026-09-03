# Zolai Wiki Enrichment Guide

> Operational guide for the current pillar: **update and improve the wiki**.
> Active branch `main`. The wiki (`wiki/`, 1529 files) is the canonical knowledge
> base feeding RAG context, training corpora, and the curriculum.

## Source of truth

- `wiki/README.md` is the index/canonical map — keep it current.
- `wiki/zolai_ai_instructions.md` + `wiki/zolai_system_prompt.txt` are the
  language ground-truth docs. Update them when linguistic rules change.

## Improvement priorities (in order)

1. **Index hygiene** — every new node must be reachable from `wiki/README.md` or a
   section README; no orphan `.md` files.
2. **ZVS 2018 compliance** — verify grammar/orthography content; flag non-ZVS terms.
3. **RAG readiness** — nodes should be clean, chunkable units with consistent
   front-matter (title, tags, language flags) so the embedding index is reliable.
4. **Curriculum linkage** — vocabulary nodes link to CEFR wordlists
   (`vocabulary/wordlists/`) and curriculum units.
5. **Dictionary reconciliation** — wiki vocabulary should agree with the dictionary
   `data/dictionary/` (FTS + embeddings). Mark discrepancies as open questions.

## Workflow for adding/editing a node

1. Add the file under the correct `wiki/<section>/` sub-tree.
2. Add a link from `wiki/README.md` and any relevant section README.
3. Use ZVS 2018 orthography; keep one concept per file.
4. Note the change in `context/progress-tracker.md` (wiki roadmap).

## Quality bar

- No hardcoded secrets; no personal/origin-point details.
- Consistent formatting; front-matter tags for retrievability.
- Bilingual (Tedim Zolai ⇄ English) where it aids learners.

## Sync

- Wiki feeds RAG (`docs/ZOLAI_RAG_AI_ARCHITECTURE.md`) and training corpora.
- Reconcile with dictionary FTS/embeddings via
  `scripts/maintenance/validation/` + `scripts/dictionary/` when running.

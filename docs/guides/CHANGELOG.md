# Zolai Second Brain — Changelog

## 2026-04-20
- Full codebase audit completed
- All documentation synced with actual project state
- Agent count: 28, Skills count: 40
- Training data v3 confirmed (llm_train_v3.jsonl 651MB)
- ORPO pairs available (orpo_pairs_v1.jsonl 1GB)
- Eval datasets in data/eval/

## 2026-04-20 — Open Source Preparation
- Purged all sensitive files from git history (SSH keys, .env, server configs)
- Excluded all data/ from git — distributed via HuggingFace Hub
- Added LICENSE (MIT), CONTRIBUTING.md, ROADMAP.md
- Added README to all top-level folders and subdirectories
- Cleaned wiki: removed stale dictionary_rebuild_v2/v3/v5 docs
- Fixed schema.md: corrected word order from OSV to SOV
- Redacted server IP and domain from SERVER_SETUP_GUIDE.md
- Updated all agent paths to current data/ structure

## V9 (Exhaustive Final)
- **New Resource Integration:** Added data from `Bible corpus sources` and `Praise & Worship corpus`.
- **Master Sweep:** Ingested high-quality proverbs, grammar book text, and linguistics references.
- **Standardization:** Re-applied all Zolai Standard Format rules.
- **Total Lines:** 2430162

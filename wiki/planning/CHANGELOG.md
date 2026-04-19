# Zolai Wiki — Changelog
> Every significant rule change, correction, or addition is logged here.
> Format: `YYYY-MM-DD | File | Change | Reason`

---

## 2026-04-20: Open Source Release
- Full security audit: removed all hardcoded secrets and paths
- GitHub repo made public: peterlianpi/zolai-ai
- CI workflow passing (ruff + pytest)
- Issue templates: Bug, Dictionary Correction, ZVS Violation, Feature Request
- PR template with ZVS compliance checklist
- 17 custom labels, 3 milestones (Phase 2/3/4), 17 project board items
- Kaggle: all 10 datasets metadata updated, CC BY 4.0 license
- HuggingFace: model card updated (Qwen2.5-3B, ctd, all sources)
- training_config.json: fixed model name (7B→3B)
- train_kaggle_t4x2.py: created from actual notebook
- 3 new agents: zolai-kaggle-publisher, zolai-hf-publisher, zolai-open-source-manager
- 3 new skills: kaggle-dataset-publisher, hf-model-card-updater, open-source-auditor

---

## 2026-04-20
- Full project audit by Kiro AI
- All docs synced
- 28 agents, 40 skills confirmed
- Training v3 (651MB), ORPO pairs (1GB)
- Eval benchmarks in data/eval/
- Website on Vercel

---

## 2026-04-18

| Date | File | Change | Reason |
|---|---|---|---|
| 2026-04-18 | `data/eval/zvs_compliance_test_v1.jsonl` | **CREATED** — 100 ZVS compliance test pairs | Built from `bible_parallel_tedim2010_kjv.jsonl` gold data |
| 2026-04-18 | `data/eval/translation_eval_v1.jsonl` | **CREATED** — 500 held-out translation pairs | Last 500 of Tedim2010 gold, not in training |
| 2026-04-18 | `data/eval/zolai_qa_v1.jsonl` | **CREATED** — 500 QA pairs | From `dict_enriched_v1.jsonl` + `zo_en_pairs_combined_v1.jsonl` |
| 2026-04-18 | `data/training/orpo_pairs_v1.jsonl` | **CREATED** — 2,000 ORPO preference pairs | From Tedim2010 gold; chosen=ZVS correct, rejected=ZVS wrong |
| 2026-04-18 | `scripts/evaluate_model.py` | **CREATED** — eval runner script | Runs ZVS + translation eval, verified working |
| 2026-04-18 | `training/research_v2_models_and_platforms.md` | Added ORPO as recommended alignment method | arXiv:2403.07691 |
| 2026-04-18 | `training/research_v2_datasets_and_cleaning.md` | Added FineWeb2, AI4Bharat, UrduLLaMA pipeline | New research session |
| 2026-04-18 | `training/departments_and_agents.md` | Created department map | Audit finding W6 |
| 2026-04-18 | `planning/swot_smart_audit_2026_04_18.md` | Created SWOT + SMART audit | Project health check |
| 2026-04-18 | `planning/smart_goals_roadmap.md` | Created SMART goals with deadlines | Audit finding — no timelines |
| 2026-04-18 | `planning/CHANGELOG.md` | Created this changelog | Audit finding W8 |
| 2026-04-18 | `planning/contributor_guide.md` | Created contributor onboarding | Audit finding T1 |
| 2026-04-18 | `memory/long_term.md` | Updated with real data counts + eval assets | Accuracy |

## 2026-04-17

| Date | File | Change | Reason |
|---|---|---|---|
| 2026-04-17 | `negation/negation_guide.md` | Clarified `lo` is valid ZVS (3rd person/past) — NOT Hakha-only | Corpus evidence from TDB77/TBR17/Tedim2010 |
| 2026-04-17 | `negation/negation_guide.md` | Added `kei lo` = compound absolute negation | Ten Commandments corpus evidence |
| 2026-04-17 | `grammar/` | Added `sanginn` = correct ZVS spelling (not `sanggin`) | Spelling correction |
| 2026-04-17 | `memory/long_term.md` | Added training progress (val loss sessions 1–3) | Session tracking |

---

## How to Add Entries

When you change a grammar rule, add a dataset, or correct a fact:

```
| YYYY-MM-DD | path/to/file.md | What changed | Why it changed |
```

Rules:
- Always log grammar rule changes — future agents need to know if a rule is current
- Always log when a "forbidden" word is reclassified
- Always log new research findings that change recommendations
- Do NOT log minor typo fixes

# Zolai Project — Short-Term Memory
> Updated: 2026-04-20 | Tracks what is active RIGHT NOW

---

## Session: 2026-04-20 (Wiki Audit & Sync)
**Status:** Complete

### What Was Done
- Audited and updated all 12 wiki files (training, planning, memory)
- Added zolai-qwen-0.5b as active primary model across all docs
- Updated training progress: 300k–800k chunk range (of 5.1M total)
- Added library versions (transformers==5.5.4, peft==0.19.1, trl==1.2.0, etc.) to all relevant docs
- Rewrote dataset_specs.md (was severely outdated — V1.0 stats)
- Updated CHANGELOG.md with full audit log

### Current Training State
| Model | Status | Chunk Range | Next CHUNK_START |
|-------|--------|-------------|-----------------|
| zolai-qwen-0.5b | 🔄 Active | 300k–800k | 800,000 |
| zolai-qwen2.5-3b-lora | ⏸️ Paused | 0–100k done | 100,000 |

### Next Actions
- Continue 0.5b training: CHUNK_START=800000, RESUME_ADAPTER=peterpausianlian/zolai-qwen-0.5b
- Publish datasets to HuggingFace Hub (Phase 2)
- Make 7 Kaggle datasets private (web UI only)
- Regenerate: HF token, Kaggle token, all API keys

---

## Session: 2026-04-20 (Round 2 — Agents & Skills Expansion)
**Status:** Complete

### New Agents Added (31 → 34)
- zolai-github-manager — GitHub repo metadata, project board, CI management
- zolai-docs-syncer — Keep docs in sync with actual project state
- zolai-notebook-manager — Kaggle training session management

### New Skills Added (43 → 46)
- github-repo-manager — gh CLI commands, project board GraphQL, CI workflow
- git-history-cleaner — Squash history, remove secrets, filter-repo gotchas
- training-session-manager — 25k chunk training, session tracking, val loss targets

### Key Fixes This Round
- training_config.json: Qwen-7B-Chat → Qwen/Qwen2.5-3B-Instruct
- ROADMAP.md: 7B clarified as future upgrade goal
- HuggingFace model card: updated with ctd language, all sources, correct 3B model
- Kaggle datasets: all metadata updated with real schemas and sources
- GitHub: CI passing, project board 17 items, 3 milestones, 17 labels

### Next Actions
- Continue training: CHUNK_START=100000
- Make 7 Kaggle datasets private (web UI only)
- Regenerate: HF token, Kaggle token, all API keys
- Publish datasets to HuggingFace Hub (Phase 2)

---

## Session: 2026-04-20 (Full Open Source Release)
**Status:** Complete
**Duration:** ~3 hours

### Completed
- ✅ Full codebase audit (secrets, paths, model names)
- ✅ GitHub public repo setup (CI, templates, labels, milestones, project)
- ✅ All Kaggle datasets metadata updated
- ✅ HuggingFace model card updated (3B, ctd, all sources)
- ✅ training_config.json fixed (7B→3B)
- ✅ train_kaggle_t4x2.py created from actual notebook
- ✅ 3 new agents + 3 new skills added
- ✅ wiki/memory updated

### Next Session
- Continue training: CHUNK_START=100000, RESUME_ADAPTER=peterpausianlian/zolai-qwen2.5-3b-lora
- Publish datasets to HuggingFace Hub (Phase 2)
- Add Docker setup for local dev
- Make 7 Kaggle datasets private (web UI required)
- Regenerate: Kaggle token, HF token, all API keys exposed in session

---

## 🔴 Active Right Now

Eval sets built from existing data. Project is now measurable. Ready for first training run.

---

## ✅ Completed This Session (2026-04-18 — 10/10 Push)

### Built from existing data (no new data needed)
| Asset | Count | Source |
|---|---|---|
| `data/eval/zvs_compliance_test_v1.jsonl` | 100 pairs | `bible_parallel_tedim2010_kjv.jsonl` |
| `data/eval/translation_eval_v1.jsonl` | 500 pairs | `bible_parallel_tedim2010_kjv.jsonl` (held-out) |
| `data/eval/zolai_qa_v1.jsonl` | 500 pairs | `dict_enriched_v1.jsonl` + `zo_en_pairs_combined_v1.jsonl` |
| `data/training/orpo_pairs_v1.jsonl` | 2,000 pairs | `bible_parallel_tedim2010_kjv.jsonl` |
| `scripts/evaluate_model.py` | — | Eval runner, works now |

### Wiki files created
- `wiki/planning/smart_goals_roadmap.md` — SMART goals with deadlines
- `wiki/planning/CHANGELOG.md` — Wiki versioning
- `wiki/planning/contributor_guide.md` — Onboarding guide
- `wiki/training/evaluation_benchmarks.md` — Updated with real status
- `wiki/training/tuarritualum_to_training_pipeline.md` — A1–C2 plan

### Verified working
```
python3 scripts/evaluate_model.py
→ ZVS compliance test: 100 pairs ✅
→ Translation eval: 500 pairs ✅
→ QA eval: 500 pairs ✅
→ ORPO pairs: 2000 pairs ✅
→ Gold correct sentences pass ZVS: 100/100 (100.0%)
```

---

## 🔜 Next Actions (Deadline-Ordered)

| Deadline | Action |
|---|---|
| 2026-05-01 | SEACrowd PR — submit `parallel_combined_v1.jsonl` |
| 2026-05-01 | CPT training complete (val loss < 2.0) |
| 2026-05-15 | Create HF org `zolai-project`, move weights |
| 2026-05-15 | Recruit 3 native speaker reviewers |
| 2026-05-31 | Expand synthetic instructions 11K → 50K |
| 2026-05-31 | SFT complete (val loss < 1.5) |
| 2026-06-15 | ORPO complete — run `evaluate_model.py`, ZVS > 95% |
| 2026-06-30 | Export GGUF, deploy locally ← Goal 1 DONE |
| 2026-07-31 | Telegram bot live ← Goal 5 DONE |
| 2026-08-31 | Zolai-FLORES 1012 sentences ← Goal 2 DONE |

---

## 📌 Real Data Numbers (verified 2026-04-18)

| Asset | Real Count |
|---|---|
| `final_train.jsonl` | 5,604,960 records |
| `llm_train_v3.jsonl` | 3,667,728 records |
| `master_source_v1.jsonl` | 4,263,583 records |
| `parallel/zo_en_pairs_combined_v1.jsonl` | 105,511 pairs |
| `parallel/bible_parallel_tedim2010_kjv.jsonl` | 29,255 pairs (gold) |
| `dictionary/processed/dict_master_v1.jsonl` | 64,923 entries |
| `dictionary/processed/dict_enriched_v1.jsonl` | 24,891 entries |
| `training/instructions_bible_v1.jsonl` | 50,000 pairs |
| `training/orpo_pairs_v1.jsonl` | 2,000 pairs ✅ NEW |
| `eval/zvs_compliance_test_v1.jsonl` | 100 pairs ✅ NEW |
| `eval/translation_eval_v1.jsonl` | 500 pairs ✅ NEW |
| `eval/zolai_qa_v1.jsonl` | 500 pairs ✅ NEW |

---

## ✅ Completed This Session (2026-04-18 — Improvement Run)

### New Files Created
- `wiki/planning/smart_goals_roadmap.md` — SMART goals with deadlines + master timeline to Aug 2026
- `wiki/planning/CHANGELOG.md` — Wiki versioning/changelog (fixes W8)
- `wiki/planning/contributor_guide.md` — Native speaker + dev + researcher onboarding (fixes T1)
- `wiki/training/evaluation_benchmarks.md` — ZVS test set, Zolai-QA, Zolai-FLORES specs (fixes W1)
- `wiki/training/tuarritualum_to_training_pipeline.md` — A1–C2 → instruction pairs plan (fixes W3)

### Files Updated
- `wiki/README.md` — Added planning section, eval benchmarks, curriculum pipeline
- `wiki/training/departments_and_agents.md` — Fixed agent overlap (zolai-data-quality merged into Data dept)
- `wiki/memory/long_term.md` — Updated next actions with deadlines, added planning wiki index
- `wiki/memory/short_term.md` — This file

### Audit Gaps Fixed
| Gap | Fix |
|---|---|
| W1 — No eval benchmarks | `evaluation_benchmarks.md` with ZVS/QA/FLORES specs |
| W2 — Outdated README | README updated with all new files |
| W3 — Curriculum disconnected | `tuarritualum_to_training_pipeline.md` created |
| W6 — Agent overlap | `zolai-data-quality` merged into Data dept |
| W8 — No changelog | `CHANGELOG.md` created |
| T1 — Single-person bottleneck | `contributor_guide.md` + bus factor checklist |
| All goals missing deadlines | `smart_goals_roadmap.md` with full timeline |

---

## 🔜 Next Actions (Deadline-Ordered)

| Deadline | Action |
|---|---|
| 2026-04-25 | Build 50 ZVS violation pairs |
| 2026-05-01 | SEACrowd PR submitted |
| 2026-05-01 | CPT training complete (val loss < 2.0) |
| 2026-05-15 | ZVS 100-sentence test set complete |
| 2026-05-15 | HF org account + 3 native speaker reviewers |
| 2026-05-31 | 50K synthetic instructions complete |
| 2026-05-31 | SFT complete (val loss < 1.5) |
| 2026-06-15 | ORPO complete (ZVS > 95%) |
| 2026-06-30 | Model exported GGUF ← Goal 1 DONE |
| 2026-07-31 | Telegram bot live ← Goal 5 DONE |
| 2026-08-31 | Zolai-FLORES 1012 sentences ← Goal 2 DONE |

---

## 📌 Key Numbers

| Metric | Value |
|---|---|
| Parallel pairs | 105,511 |
| Monolingual sentences | ~2M |
| Corpus tokens | ~100M |
| Synthetic instructions | 11K → target 50K by 2026-05-31 |
| Bible instruction pairs | 329,676 |
| Current val loss | ~2.535 (target < 2.0 CPT, < 1.5 SFT) |
| Kaggle free GPU | 30h/week, 2x T4 |

---

## ✅ Completed This Session (2026-04-18)

### Research & Wiki
- Created `wiki/training/research_v2_datasets_and_cleaning.md` — FineWeb2, AI4Bharat, UrduLLaMA pipeline
- Created `wiki/training/research_v2_models_and_platforms.md` — ORPO, model comparison, training roadmap
- Created `wiki/training/deep_research_master.md` — comprehensive overview
- Created `wiki/training/data_cleaning_pipeline.md` — runnable cleaning code
- Created `wiki/training/departments_and_agents.md` — department map
- Consolidated `wiki/memory/long_term.md` — removed duplicates, integrated all research

### Agents Updated
- `zolai-research-tracker` — primary doc updated, 6 new papers added
- `zomi-trainer-bot` — Qwen2.5-7B as primary, research citations
- `zolai-data-quality` — new tools (datasketch, kenlm, LaBSE, ftfy, trafilatura)
- `zolai-dpo-builder` — ORPO added as recommended alignment method
- `zomi-synthesizer` — diversity > quantity principle added

### Key Decisions Made
- **ORPO** replaces SFT→DPO (one pass, saves compute)
- **Qwen2.5-7B** confirmed as primary base model
- **Kaggle** confirmed as primary free platform
- **UrduLLaMA blueprint** adopted as our training template

---

## 🔜 Next Actions (Audit-Prioritized)

### Immediate (this week)
1. **Build 100-sentence ZVS test set** — minimum viable eval benchmark
2. **Check FineWeb2/MADLAD-400** for Tedim/Chin content
3. **Create HF organization account** — move weights off personal account

### Short-term (month 1)
4. **Add deadlines to all goals** — Goal 1 deadline: 2026-06-30
5. **Submit corpus to SEACrowd** — deadline: 2026-05-01
6. **Expand synthetic instructions** 11K → 50K — deadline: 2026-05-31
7. **Run MinHash dedup** on `corpus_master_v1.jsonl`
8. **Add `instructions_bible_v1.jsonl`** to training pipeline

### Structural
9. **Write contributor onboarding guide** — reduce bus factor
10. **Add wiki changelog** — date + reason for every rule change

---

## 📌 Key Numbers to Remember

| Metric | Value |
|---|---|
| Parallel pairs | 105,511 |
| Monolingual sentences | ~2M |
| Corpus tokens | ~100M |
| Synthetic instructions | 11K (need 50K) |
| Bible instruction pairs | 329,676 |
| Current val loss | ~2.535 (target < 2.0) |
| Kaggle free GPU | 30h/week, 2x T4 |

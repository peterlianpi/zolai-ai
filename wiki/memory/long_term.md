# Zolai Project — Long-Term Memory
> Last updated: 2026-04-20 | Single source of truth for project state

---

## 2026-04-20: Full Open Source Release Session

### What Was Done
- Full codebase audit: removed all secrets, hardcoded paths, wrong model names
- GitHub repo made public with CI, issue templates, PR template, labels, milestones, project board
- Kaggle datasets: all metadata updated with real schemas, sources, CC BY 4.0 license
- HuggingFace model card updated: correct 3B model, all sources, usage code
- training_config.json fixed: Qwen-7B-Chat → Qwen/Qwen2.5-3B-Instruct
- train_kaggle_t4x2.py created from actual notebook
- 3 new agents created: zolai-kaggle-publisher, zolai-hf-publisher, zolai-open-source-manager
- 3 new skills created: kaggle-dataset-publisher, hf-model-card-updater, open-source-auditor

### Key Lessons Learned
- Kaggle API CANNOT make public datasets private (web UI only)
- Tedim Chin ISO 639-3 code is `ctd` (not 'zolai')
- HuggingFace upload: use `huggingface_hub.HfApi().upload_file()` with PYTHONPATH=/home/peter/.local/lib/python3.12/site-packages
- git filter-repo removes remote — must re-add with `git remote add origin URL`
- systemd service files: use `%i` specifier instead of hardcoded username
- parents[] depth: scripts/foo.py=parents[1], scripts/sub/foo.py=parents[2]
- Kaggle KGAT_ tokens: read-only by default, need write scope for dataset updates
- GitHub Actions workflow scope needed for CI: `gh auth refresh --hostname github.com --scopes workflow`
- Project board items: use GraphQL `addProjectV2DraftIssue` not `gh project item-add`

### Current State
- Model: peterpausianlian/zolai-qwen2.5-3b-lora (Qwen2.5-3B, r=8, alpha=16)
- Training: session-based 25k chunks, script: scripts/training/train_kaggle_t4x2.py
- Dataset: llm_train_v3.jsonl (651MB, ~2M records)
- GitHub: public, CI passing, 17 labels, 3 milestones, 17 project items
- Kaggle: 2 public datasets (llm-training + adapter), 8 private
- HF: model card updated with ctd language, all sources

---

## 🏗️ Architecture Decisions

### LLM Training Stack (Current)
| Component | Choice | Reason |
|---|---|---|
| Active model | Qwen2.5-0.5B-Instruct | Fast iteration, fits T4x2 in FP16, LoRA r=16 |
| Stable model | Qwen2.5-3B-Instruct | No bugs on T4, fast, QLoRA r=8 |
| Future target | Qwen2.5-7B-Instruct | Best multilingual (29 langs), Apache 2.0 |
| 0.5b method | LoRA FP16 (no quantization) | 0.5B fits in VRAM without quantization |
| 3b method | QLoRA 4-bit NF4 | Fits Kaggle T4 (16GB) |
| LoRA config (0.5b) | r=16, alpha=32 | Better capacity for low-resource |
| LoRA config (3b) | r=8, alpha=16 | Fits T4 single GPU |
| Optimizer | paged_adamw_8bit (3b) / adamw_torch (0.5b) | Memory efficient |
| Alignment | ORPO | Combines SFT+DPO in one pass |
| Tracking | W&B free tier | Integrates with training |
| Storage | HuggingFace Hub `peterpausianlian/` | Primary storage |

### Library Versions (Current)
```
transformers==5.5.4
peft==0.19.1
trl==1.2.0
accelerate==1.13.0
bitsandbytes==0.49.2
torch==2.5.1+cu121
```

### Why These Models (Rejected Alternatives)
| Model | Rejected Reason |
|---|---|
| Gemma-3-4B-IT | QLoRA bugs: token_type_ids + CUDA illegal memory access |
| Gemma-7B-IT | 0.06 it/s on dual T4 — too slow |
| Gemma-2-2B-IT | Less multilingual capacity |
| Any 70B+ | Too large for free tier |

### Three-Stage Training Pipeline
1. **CPT** — raw Zolai text, 80% ZO + 20% EN (prevents catastrophic forgetting)
2. **SFT** — instruction pairs, diverse domains
3. **ORPO** — ZVS correct (chosen) vs wrong dialect (rejected) — replaces SFT→DPO

Evidence: Basque pipeline (Corral et al. 2024) — CPT +12pts NLU, SFT+DPO +24pts instruction following.
Evidence: UrduLLaMA (arXiv:2502.16961) — 128M tokens CPT + 41K instructions + 50K pairs → strong results.

---

## 📚 Data Assets

### Master Source
**`data/master_source_v1.jsonl`** — 991 MB, 4,261,017 records
- Schema: `{zolai, english, source, type, dialect, reference}`
- Monolingual: 3,908,626 | Dictionary: 193,005 | Parallel: 110,233 | Wordlist: 47,572

### Dictionary
| File | Entries | Description |
|---|---|---|
| `dict_master_v1.jsonl` | 84,448 | Merged master (enriched + bible + unified) |
| `dict_bible_zo_en_v1.jsonl` | 20,561 | Bible corpus ZO→EN |
| `dict_bible_learned_v1.jsonl` | 15,403 | Verse-by-verse study vocab |
| `dict_enriched_v1.jsonl` | ~24k | Best quality — has real examples |
| `dict_unified_v1.jsonl` | 152k | Raw unified (noisy headwords) |

### Training Data
| File | Count | Description |
|---|---|---|
| `final_train.jsonl` | 5,604,960 | Full merged training set (primary) |
| `llm_train_v3.jsonl` | 3,667,728 | Training split v3 |
| `llm_val_v3.jsonl` | 203,762 | Validation split v3 |
| `llm_test_v3.jsonl` | 203,762 | Test split v3 |
| `instructions_bible_v1.jsonl` | 50,000 | Bible instruction pairs |
| `orpo_pairs_v1.jsonl` | 2,000 | ✅ NEW — ORPO preference pairs (ZVS correct vs wrong) |

### Evaluation Sets (NEW — built 2026-04-18)
| File | Count | Description |
|---|---|---|
| `data/eval/zvs_compliance_test_v1.jsonl` | 100 | ZVS dialect compliance test |
| `data/eval/translation_eval_v1.jsonl` | 500 | Held-out translation pairs (Tedim2010 gold) |
| `data/eval/zolai_qa_v1.jsonl` | 500 | QA pairs from dictionary + parallel |
| `scripts/evaluate_model.py` | — | Eval runner script |

### Bible Parallel Sources
| File | Pairs | Notes |
|---|---|---|
| `bible_parallel_tedim2010_kjv.jsonl` | 28,873 | ZVS standard — best quality |
| `bible_parallel_tdb77_kjv.jsonl` | 27,654 | TDB77 1977 |
| `bible_parallel_tbr17_kjv.jsonl` | 25,892 | TBR17 |
| `zo_en_pairs_combined_v1.jsonl` | 105,511 | All sources combined |

### Infrastructure
| Service | Location |
|---|---|
| HF Hub adapter | `peterpausianlian/zolai-qwen2.5-3b-lora` |
| Kaggle dataset | `peterpausianlian/zolai-adapter-qwen25-3b` |
| Training dataset | `peterpausianlian/zolai-llm-training-dataset` |
| Website | `website/zolai-project/` (Next.js + Prisma) |
| API | `zolai/api/` (FastAPI) |

---

## 🔬 Training Progress

### zolai-qwen-0.5b (active — LoRA FP16, r=16, alpha=32, T4x2)
| Milestone | Chunk Range | Status |
|-----------|-------------|--------|
| Early sessions | 0–300k | ✅ Done |
| Current | 300k–800k | 🔄 In progress |
| Remaining | 800k–5.1M | ⏳ Planned |

### zolai-qwen2.5-3b-lora (paused — QLoRA 4-bit NF4, r=8, alpha=16, T4 x1)
| Session | Chunk | Val Loss | Date |
|---|---|---|---|
| 1 | 0–25k | 2.9856 | 2026-04-17 |
| 2 | 25k–50k | 2.7398 | 2026-04-17 |
| 3 | 50k–75k | ~2.535 | 2026-04-17 |
| 4 | 75k–100k | - | 2026-04-17 |
| 5+ | 100k+ | ⏸️ Paused | — |

Target val loss: < 2.0 (CPT), < 1.5 (SFT)

---

## 📝 ZVS Language Rules

### Use (Tedim ZVS Standard)
`pasian`, `gam`, `tapa`, `topa`, `kumpipa`, `tua`, `sanginn`, `kei`

### Never Use
| Wrong | Correct | Reason |
|---|---|---|
| pasian | pasian | Hakha/Falam dialect |
| gam | gam | Hakha dialect |
| sanggin | sanginn | Spelling error |
| tua / tua | tua | Hakha demonstrative |
| tapa | tapa | Non-ZVS |
| topa | topa | Non-ZVS |
| kumpipa | pasian | Non-ZVS |

### Negation Rules
| Context | Use | Example |
|---|---|---|
| Conditionals | `kei` ONLY | `Nong pai kei a leh` |
| 1st/2nd person | `kei` preferred | `Ka dam kei hi` |
| 3rd person past/state | `lo` valid | `Amah dam lo hi` |
| Absolute negation | `kei lo` | `Pasian dang kei lo` |
| Not yet | `nai lo` | `A pai nai lo hi` |
| No more | `nawn lo` | `A pai nawn lo hi` |

### Grammar
- Word order: SOV (with `in` marker) / OSV (most natural)
- Plural: never combine `uh` with `i`
- `o` is always /oʊ/

---

## 🔬 Research Knowledge Base (2026-04-18)

### Top Research Findings
| Finding | Source | Impact |
|---|---|---|
| CPT before SFT = +8–15 BLEU | arXiv:2410.14815 | Always run CPT first |
| Diversity > quantity for SFT | arXiv:2408.12780 | 10K diverse > 100K repetitive |
| ORPO = SFT+DPO in one pass | arXiv:2403.07691 | Saves compute |
| UrduLLaMA blueprint | arXiv:2502.16961 | Most applicable to Zolai |
| FineWeb2 = 1000+ languages | arXiv:2506.20920 | Check for Tedim content |
| AI4Bharat pipeline | arXiv:2403.06350 | Best low-resource pipeline ref |
| BLEU misleads low-resource | arXiv:2411.18571 | Use chrF + human eval |
| Quality classifier helps | NVIDIA NeMo | KenLM perplexity filter |

### Recommended Models (Priority Order)
1. **Qwen2.5-7B-Instruct** — best multilingual, Apache 2.0, primary choice
2. **SeaLLMs-v3-7B** — SEA-focused, most geographically relevant
3. **Gemma-2-2b-it** — smallest/fastest, good for iteration
4. **Llama-3.1-8B-Instruct** — used by UrduLLaMA, strong community

### Recommended Platforms (Free)
1. **Kaggle** — 30h/week, 2x T4 (32GB), 12h sessions, primary
2. **Google Colab** — T4, ~4h, prototyping only
3. **Modal** — A10G, free credits, one-off large runs

### Recommended Tools
| Tool | Purpose |
|---|---|
| `unsloth` | Fast QLoRA (2x speed, 70% less VRAM) |
| `trl` | SFT/DPO/ORPO training |
| `LLaMA-Factory` | Multi-GPU, web UI |
| `datatrove` | HuggingFace data pipeline |
| `datasketch` | MinHash LSH dedup |
| `fasttext` | Language ID + quality classifier |
| `kenlm` | Perplexity filtering |
| `sentence-transformers` | LaBSE parallel alignment |
| `trafilatura` | Web text extraction |
| `wandb` | Experiment tracking (free) |

### External Data Sources to Mine
| Source | Priority | URL |
|---|---|---|
| FineWeb2 | High | huggingface.co/HuggingFaceFW |
| MADLAD-400 | High | huggingface.co/datasets/allenai/MADLAD-400 |
| eBible Corpus | High | ebible.org/Scriptures |
| SEACrowd | High | github.com/SEACrowd/seacrowd-datahub |
| OPUS Bible | Medium | opus.nlpl.eu/bible-uedin |
| Aya Collection | Medium | huggingface.co/datasets/CohereForAI/aya_collection |

---

## 💡 Lessons Learned (Engineering)

1. `tuada_visible_devices=0` required for QLoRA — prevents DataParallel issues
2. `report_to="none"` required for loss to show in Kaggle console
3. 100k chunks fit in ~9.5h — perfect for overnight Kaggle sessions
4. Adapter is cumulative — always load previous adapter before next chunk
5. Val loss is the real metric — train loss noisy with small batches
6. 15% of llm_train is `###` instruction noise — filter before CPT
7. `master_all_versions.jsonl` is unusable — all metadata lost
8. Parallel dedup key must include english field
9. `dict_unified_v1.jsonl` has phrase headwords — skip entries with spaces when merging
10. Bible book codes vary: SNG=SON across versions — all 66 books present in all 3 JSONL files
11. Instruction format: `X panin Y ah let in:` — `let` = turn/convert
12. Family terms need explicit blocking: tanu→daughter blocks {son,sons,child,children}
13. High-frequency words (>30% max co-occurrence) are noise in `related` field
14. DPO only works on language-adapted base — applying to generic model made it worse
15. ORPO preferred over SFT→DPO — one pass, same result, less compute

---

## 🔜 Next Actions (Priority Order)

1. **Continue 0.5b training** — CHUNK_START=800000, RESUME_ADAPTER=peterpausianlian/zolai-qwen-0.5b
2. **Check FineWeb2/MADLAD-400** for any Tedim/Chin content
3. **Create HF org account** `zolai-project` — move weights off personal account
4. **Recruit 3 native speaker reviewers** — see `wiki/planning/contributor_guide.md`
5. **Submit corpus to SEACrowd** — deadline 2026-05-01
6. **Run MinHash dedup** on `corpus_master_v1.jsonl`
7. **Deduplicate dict_semantic/enriched/en_zo** — 21.8% dups each
8. **Expand synthetic instructions** 11K → 50K — deadline 2026-05-31
9. **Build ORPO pairs** — ZVS correct (chosen) vs dialect errors (rejected)
10. **Build curriculum instruction pairs** — 13K CEFR-tagged (see `tuarritualum_to_training_pipeline.md`)

## 📋 Wiki Files Index (Training)

| File | Purpose |
|---|---|
| `research_v2_datasets_and_cleaning.md` | Deep dataset + cleaning research (FineWeb2, AI4Bharat) |
| `research_v2_models_and_platforms.md` | Deep model + platform + alignment research |
| `deep_research_master.md` | Comprehensive overview (v1) |
| `data_cleaning_pipeline.md` | Runnable cleaning pipeline code |
| `departments_and_agents.md` | Department map + agent responsibilities |
| `evaluation_benchmarks.md` | ZVS test set, Zolai-FLORES, QA benchmark specs |
| `tuarritualum_to_training_pipeline.md` | A1–C2 curriculum → instruction pairs plan |
| `data_pipeline_and_training_strategy.md` | Pipeline strategy |
| `llm_training_roadmap.md` | Training roadmap |

## 📋 Wiki Files Index (Planning)

| File | Purpose |
|---|---|
| `planning/smart_goals_roadmap.md` | SMART goals with deadlines + master timeline |
| `planning/swot_smart_audit_2026_04_18.md` | Full SWOT + SMART audit |
| `planning/contributor_guide.md` | Onboarding for native speakers, devs, researchers |
| `planning/CHANGELOG.md` | Wiki rule changes and additions log |

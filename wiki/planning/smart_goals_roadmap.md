# Zolai Project — SMART Goals & Roadmap
> Last updated: 2026-04-18 | Status: Active

---

## Goal 1 — Train a Working Zolai LLM
**"Fine-tune Qwen2.5-7B on Zolai corpus using CPT→SFT→ORPO by 2026-06-30."**

| Criterion | Definition |
|---|---|
| Specific | Qwen2.5-7B-Instruct, QLoRA r=16, Unsloth, Kaggle T4 |
| Measurable | CPT val loss < 2.0 → SFT val loss < 1.5 → ZVS compliance > 95% on 100-sentence test set |
| Achievable | UrduLLaMA (arXiv:2502.16961) did it with comparable data |
| Relevant | Core mission — Zolai AI Second Brain |
| Time-bound | **Deadline: 2026-06-30** |

**Milestones:**
- 2026-05-01 — CPT complete (val loss < 2.0)
- 2026-05-31 — SFT complete (val loss < 1.5)
- 2026-06-15 — ORPO complete (ZVS compliance > 95%)
- 2026-06-30 — Model exported to GGUF, deployed locally

---

## Goal 2 — Build Evaluation Benchmarks
**"Create minimum viable eval set by 2026-05-15; full Zolai-FLORES by 2026-08-31."**

| Criterion | Definition |
|---|---|
| Specific | 100-sentence ZVS test set (internal) + 1012-sentence Zolai-FLORES (community) |
| Measurable | Sentence counts; ZVS compliance rate; chrF score vs reference |
| Achievable | 100 sentences = ~5 hours internal work; FLORES needs community |
| Relevant | Without eval we cannot measure progress — this unblocks Goal 1 |
| Time-bound | **ZVS test set: 2026-05-15 / Zolai-FLORES: 2026-08-31** |

**Milestones:**
- 2026-05-01 — 50 ZVS violation pairs built (chosen/rejected)
- 2026-05-15 — 100-sentence ZVS compliance test set complete
- 2026-07-01 — 500-pair Zolai-QA set complete
- 2026-08-31 — Zolai-FLORES 1012 sentences (requires native speakers)

---

## Goal 3 — Expand Synthetic Instruction Data
**"Generate 50K diverse instruction pairs by 2026-05-31."**

| Criterion | Definition |
|---|---|
| Specific | 10K translation + 10K QA + 10K grammar + 10K daily life + 10K domain (medical/legal/tech) |
| Measurable | Count per domain; ZVS compliance > 98% per batch |
| Achievable | GPT-4o API ~$50; free generation via our own model |
| Relevant | Research: diversity > quantity for low-resource SFT (arXiv:2408.12780) |
| Time-bound | **Deadline: 2026-05-31** |

**Domain breakdown:**
| Domain | Count | Source |
|---|---|---|
| Translation (ZO↔EN) | 10K | Existing parallel pairs, new templates |
| Question & Answer | 10K | Bible QA + general knowledge |
| Grammar correction | 10K | ZVS violations → corrections |
| Daily life / conversation | 10K | GPT-4o with ZVS system prompt |
| Domain (medical/legal/tech) | 10K | GPT-4o translated from English |

---

## Goal 4 — Submit to SEACrowd
**"Submit parallel_combined_v1.jsonl to SEACrowd by 2026-05-01."**

| Criterion | Definition |
|---|---|
| Specific | `data/parallel/parallel_combined_v1.jsonl` (105K pairs) in SEACrowd dataloader format |
| Measurable | PR merged to github.com/SEACrowd/seacrowd-datahub |
| Achievable | SEACrowd has clear submission guidelines and active maintainers |
| Relevant | Community visibility, potential native speaker collaborators |
| Time-bound | **Deadline: 2026-05-01** |

---

## Goal 5 — Deploy Zolai AI (Telegram + API)
**"Deploy Telegram bot with trained model by 2026-07-31."**

| Criterion | Definition |
|---|---|
| Specific | Telegram bot + FastAPI server running GGUF model via Ollama |
| Measurable | Bot answers 80% of 50 test queries correctly (native speaker judged) |
| Achievable | Infrastructure exists in `scripts/deploy/` |
| Relevant | Community access — the whole point of the project |
| Time-bound | **Deadline: 2026-07-31** |

---

## Goal 6 — Community & Sustainability
**"Recruit 3 native speaker reviewers and create HF org account by 2026-05-15."**

| Criterion | Definition |
|---|---|
| Specific | 3 native Tedim speakers for validation; HuggingFace org `zolai-project` |
| Measurable | 3 confirmed reviewers; model weights moved to org account |
| Achievable | Zomi diaspora is digitally active; HF org is free |
| Relevant | Eliminates single-person bottleneck and personal account risk |
| Time-bound | **Deadline: 2026-05-15** |

---

## Master Timeline

```
April 2026
  ├── Apr 18 — SWOT/SMART audit complete ✅
  ├── Apr 25 — ZVS test set (50 pairs)
  └── Apr 30 — SEACrowd submission ready

May 2026
  ├── May 01 — SEACrowd PR submitted
  ├── May 01 — CPT training complete (val loss < 2.0)
  ├── May 15 — ZVS 100-sentence test set complete
  ├── May 15 — HF org account + 3 native speaker reviewers
  └── May 31 — 50K synthetic instructions complete + SFT complete

June 2026
  ├── Jun 15 — ORPO alignment complete (ZVS > 95%)
  └── Jun 30 — Model exported GGUF, deployed locally ← GOAL 1 DONE

July 2026
  ├── Jul 01 — 500-pair Zolai-QA eval set
  └── Jul 31 — Telegram bot + API live ← GOAL 5 DONE

August 2026
  └── Aug 31 — Zolai-FLORES 1012 sentences ← GOAL 2 DONE
```

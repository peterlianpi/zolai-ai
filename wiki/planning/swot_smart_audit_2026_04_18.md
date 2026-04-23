# Zolai Project — SWOT & SMART Audit
> Date: 2026-04-18 | Method: SWOT (wiki audit) + SMART (project goals audit)
> Updated: 2026-04-20 — see CHANGELOG.md for changes since this audit

> **2026-04-20 Status Update:**
> - Eval benchmarks (W1) ✅ BUILT — ZVS (100), Translation (500), QA (500), ORPO pairs (2000)
> - Active model changed: zolai-qwen-0.5b (LoRA FP16, r=16, T4x2) now primary; 3B paused
> - Training at chunks 300k–800k of 5.1M total dataset
> - GitHub repo made public; CI passing; 34 agents, 46 skills confirmed
> - Goal 1 updated: 0.5B + 3B models (not 7B) — 7B is future upgrade target

---

## PART 1 — SWOT AUDIT OF THE WIKI

### STRENGTHS — What the wiki does well

**S1. Exceptional linguistic depth**
The grammar section is genuinely world-class for a minority language. Phonology, morphemics, verb stems, tense markers, particle differentiations, negation rules, ergative marking, social registers — all documented. Most low-resource language projects have none of this.

**S2. ZVS standard is clearly enforced**
The forbidden word list, dialect rules, and negation system are documented consistently across `zolai_ai_instructions.md`, `long_term.md`, and agent configs. Every agent knows `pasian` is wrong.

**S3. Research knowledge is now current**
After today's sessions, the training wiki has 7 research files covering FineWeb2, AI4Bharat, UrduLLaMA, ORPO, and the full cleaning pipeline. This is better than most academic NLP projects.

**S4. Memory system works**
`long_term.md` + `short_term.md` give any agent instant project context. Engineering lessons are captured (CUDA_VISIBLE_DEVICES, adapter cumulative loading, etc.) — hard-won knowledge that won't be lost.

**S5. Cultural vision is strong**
`future_of_zolai.md` and `zomi_comprehensive.md` give the project a soul. The "Digital Stronghold" and "Sangsia" paradigms are compelling and motivating.

**S6. Data assets are well-catalogued**
Every dataset is documented with size, record count, schema, and quality tier. No guessing what's in `data/`.

---

### WEAKNESSES — What the wiki is missing or broken

**W1. No evaluation benchmarks exist yet**
The wiki documents what we *want* to build (Zolai-FLORES, Zolai-QA, ZVS compliance test set) but none of it exists. We have zero way to measure model quality right now. This is the single biggest gap.

**W2. Wiki README is outdated (last updated 2026-04-14)**
The README doesn't list any of the training research files created this week. New contributors would miss `research_v2_*.md`, `departments_and_agents.md`, `deep_research_master.md`.

**W3. Curriculum content exists but isn't connected to training data**
A1–C2 curriculum files are well-written but there's no pipeline that converts them into training examples. The curriculum is a wiki artifact, not a data source yet.

**W4. Synthetic data is too narrow (11K, Bible-heavy)**
329K Bible instruction pairs + 11K synthetic = heavily religious domain. The wiki acknowledges this but there's no concrete plan for medical, legal, tech, daily life domains beyond "expand to 50K."

**W5. No speaker community engagement documented**
The wiki has no record of native speaker involvement, validation, or feedback. Who are the human reviewers? How do we reach them? This is undocumented.

**W6. Agent responsibilities overlap and aren't enforced**
`zolai-data-quality` appears in both Data and Quality departments. `zomi-evaluator` has no evaluation datasets to run against. Several agents have `"status": "TO BUILD"` in their configs.

**W7. Wiki structure has grown organically — hard to navigate**
233 files in `wiki/`. The README index is good but doesn't cover vocabulary/bible_context (1000+ files), and the bundle/ directory duplicates content from other sections.

**W8. No versioning or changelog for wiki content**
Grammar rules change (e.g., `lo` was clarified as valid ZVS). There's no way to know when a rule was added or changed, or why. Future agents can't tell if a rule is current or superseded.

---

### OPPORTUNITIES — What we can exploit

**O1. FineWeb2 may contain Tedim/Chin data**
HuggingFace's 1000+ language dataset hasn't been checked for Tedim content. Even 10K sentences would be significant. This is a free, immediate win.

**O2. SEACrowd submission opens doors**
Submitting our corpus to SEACrowd gets Zolai on the map, attracts collaborators, and may bring in native speaker volunteers. The community is active and welcoming.

**O3. UrduLLaMA blueprint is directly replicable**
arXiv:2502.16961 is essentially a recipe for what we need to do. We have comparable or better data. We can follow their exact steps and expect similar results.

**O4. ORPO reduces training cost significantly**
Replacing SFT→DPO with ORPO cuts training time roughly in half. This means we can run more experiments within the same Kaggle quota.

**O5. Bible corpus is uniquely powerful**
105K parallel pairs from 4 Bible versions is exceptional for a language this size. No other Tedim NLP project has this. It's a genuine competitive moat.

**O6. Zomi diaspora is digitally active**
Facebook groups, YouTube channels, church websites — there's a large, engaged community producing Zolai content daily. Systematic crawling could double our corpus.

**O7. Whisper fine-tuning for ASR is achievable**
Once we have a working LLM, fine-tuning OpenAI Whisper for Zolai speech recognition is the next natural step. Audio data from church services and YouTube exists.

---

### THREATS — What could derail the project

**T1. Single-person bottleneck**
The entire project appears to run on one person. If that person stops, everything stops. No bus factor documentation, no contributor onboarding guide.

**T2. Kaggle quota is the training ceiling**
30h/week on T4 is enough for current data but will become a bottleneck as we scale to 7B models and 500K+ training examples. No paid compute budget is documented.

**T3. Dialect drift in synthetic data**
GPT-4o generates Zolai with occasional Hakha contamination. As we scale synthetic data to 50K+, undetected dialect errors will compound. The ZVS filter catches known words but not novel errors.

**T4. No native speaker validation pipeline**
All quality assessment is automated. A model could be grammatically plausible but culturally wrong, and we'd never know without native speaker review.

**T5. Model weights are on a personal HF account**
`peterpausianlian/zolai-qwen2.5-3b-lora` — if this account is deleted or access is lost, the trained weights are gone. No organizational backup.

**T6. Competing projects could emerge**
If a well-funded organization (Google, Meta, a university) decides to build a Tedim model, they could outpace us quickly. Our advantage is the head start and community trust.

**T7. Wiki rot**
With 233+ files, outdated content accumulates silently. The `bundle/` directory may already be stale. No automated freshness checks exist.

---

## PART 2 — SMART AUDIT OF THE PROJECT

SMART = Specific, Measurable, Achievable, Relevant, Time-bound

---

### GOAL 1: Train a working Zolai LLM

| Criterion | Current State | Assessment |
|---|---|---|
| **Specific** | "Train Qwen2.5-7B with CPT→SFT→ORPO on Zolai corpus" | ✅ Specific enough |
| **Measurable** | Val loss < 2.0 (CPT), < 1.5 (SFT), ZVS compliance > 95% | ⚠️ Val loss is measurable but ZVS compliance has no test set yet |
| **Achievable** | UrduLLaMA did it with comparable data; Kaggle T4 is sufficient | ✅ Achievable |
| **Relevant** | Core mission — Zolai AI Second Brain | ✅ Directly relevant |
| **Time-bound** | No deadline set | ❌ No timeline |

**Verdict:** Not fully SMART. Missing: deadline, and ZVS compliance test set to make it measurable.

**Fix:** "Train Qwen2.5-7B CPT+SFT+ORPO by 2026-06-30. Measure: val loss < 1.5, ZVS compliance > 95% on 100-sentence human eval set."

---

### GOAL 2: Build the evaluation benchmark

| Criterion | Current State | Assessment |
|---|---|---|
| **Specific** | "Build Zolai-FLORES (1012 sentences), Zolai-QA (500 pairs), ZVS test set (100 sentences)" | ✅ Specific |
| **Measurable** | Sentence counts defined | ✅ Measurable |
| **Achievable** | Requires native speaker time (~85 hours for FLORES) | ⚠️ Achievable but depends on community access |
| **Relevant** | Without eval, we can't measure progress | ✅ Critical |
| **Time-bound** | No deadline | ❌ No timeline |

**Verdict:** Not SMART. Missing: deadline, and native speaker recruitment plan.

**Fix:** "Build 100-sentence ZVS compliance test set by 2026-05-15 (internal). Build Zolai-FLORES 1012 sentences by 2026-08-31 (requires community)."

---

### GOAL 3: Expand synthetic instruction data

| Criterion | Current State | Assessment |
|---|---|---|
| **Specific** | "Expand 11K → 50K instructions, add domain diversity" | ⚠️ Domains not specified |
| **Measurable** | 50K count is measurable | ✅ Measurable |
| **Achievable** | GPT-4o API ~$50 for 50K; Kaggle for free generation | ✅ Achievable |
| **Relevant** | Research shows diversity > quantity | ✅ Relevant |
| **Time-bound** | No deadline | ❌ No timeline |

**Verdict:** Partially SMART. Missing: domain breakdown, deadline, quality validation method.

**Fix:** "Generate 50K instruction pairs by 2026-05-31: 10K translation, 10K QA, 10K grammar, 10K daily life, 10K domain (medical/legal/tech). Validate: ZVS compliance > 98% per batch."

---

### GOAL 4: Submit corpus to SEACrowd

| Criterion | Current State | Assessment |
|---|---|---|
| **Specific** | "Submit Zolai corpus to SEACrowd" | ⚠️ Which subset? What format? |
| **Measurable** | PR merged = done | ✅ Binary measurable |
| **Achievable** | SEACrowd has clear submission guidelines | ✅ Achievable |
| **Relevant** | Community visibility, potential collaborators | ✅ Relevant |
| **Time-bound** | No deadline | ❌ No timeline |

**Fix:** "Submit parallel_combined_v1.jsonl (105K pairs) to SEACrowd in their dataloader format by 2026-05-01."

---

### GOAL 5: Deploy the Zolai AI (Telegram bot + API)

| Criterion | Current State | Assessment |
|---|---|---|
| **Specific** | "Deploy Telegram bot and FastAPI server" | ⚠️ No model version specified |
| **Measurable** | Bot responds to Zolai queries | ⚠️ No quality threshold defined |
| **Achievable** | Infrastructure exists (`scripts/deploy/`) | ✅ Achievable |
| **Relevant** | Community access to the model | ✅ Relevant |
| **Time-bound** | No deadline | ❌ No timeline |

**Fix:** "Deploy Telegram bot with first trained model (val loss < 1.5) by 2026-07-31. Success metric: bot correctly answers 80% of 50 test queries from native speakers."

---

## PART 3 — RECOMMENDED ACTIONS FROM THIS AUDIT

### Immediate (this week)
1. **Update wiki/README.md** — add all new training research files (W2)
2. **Build 100-sentence ZVS test set** — minimum viable eval (W1, makes Goal 1 measurable)
3. **Check FineWeb2/MADLAD-400** for Tedim content (O1)

### Short-term (month 1)
4. **Add deadlines to all goals** — convert to SMART (all goals missing T)
5. **Document native speaker contacts** — who can validate? (W5, T4)
6. **Create HF organization account** — move weights off personal account (T5)
7. **Add wiki changelog** — date + reason for every rule change (W8)

### Medium-term (month 2–3)
8. **Connect curriculum to training pipeline** — A1–C2 content → instruction pairs (W3)
9. **Recruit 2–3 native speaker reviewers** — formalize validation (T4)
10. **Submit to SEACrowd** — community visibility (O2)

### Structural
11. **Archive `wiki/bundle/`** — it duplicates other content (W7)
12. **Merge `zolai-data-quality` into one department** — remove overlap (W6)
13. **Write contributor onboarding guide** — reduce bus factor (T1)

---

## Summary Scorecard

| Area | Score | Notes |
|---|---|---|
| Linguistic documentation | 9/10 | World-class for a minority language |
| Research knowledge | 8/10 | Current and well-organized after today |
| Data assets | 7/10 | Strong corpus, weak eval sets |
| Training pipeline | 6/10 | Plan is solid, execution not started |
| Goal clarity (SMART) | 3/10 | No deadlines, no eval benchmarks |
| Community/sustainability | 3/10 | Single person, no native speaker pipeline |
| Wiki organization | 6/10 | Good index, but 233 files with no versioning |

**Overall: 6/10 — Strong foundation, weak execution structure.**

The wiki is excellent as a knowledge base. The project is weak on measurability, timelines, and community resilience. The research is solid. The data is strong. What's missing is the scaffolding that turns good intentions into shipped results.

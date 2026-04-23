# Zolai Project — Contributor Onboarding Guide
> For new contributors, collaborators, and native speaker reviewers

---

## What This Project Is

The **Zolai AI Second Brain** builds a fully capable AI for the Tedim Zolai language — allowing the Zomi people to learn, work, and interact with AI in their native tongue. We are building:
1. A fine-tuned LLM that speaks fluent Tedim Zolai (ZVS standard)
2. A language learning tutor (A1–C2 CEFR)
3. A dictionary and translation API
4. A Telegram bot for community access

---

## For Native Speaker Reviewers (Most Needed)

**What we need from you:** 1–2 hours per week to review AI-generated Zolai text.

**Your role:**
- Check if generated Zolai sounds natural to a native Tedim speaker
- Flag dialect errors (Hakha words used instead of Tedim)
- Validate translation pairs (does the English match the Zolai?)
- Rate responses on a 1–5 scale

**How to start:**
1. Read `wiki/ggammar/core_ggammar_reference.md` — 15 min overview
2. Read `wiki/zolai_ai_instructions.md` §1 — ZVS rules summary
3. Contact the project lead to get access to the review spreadsheet
4. Review 20 sentences per session using the template below

**Review template:**
```
Sentence: [Zolai text]
Natural? (Y/N):
Dialect correct? (Y/N):
If N, what's wrong:
Suggested correction:
```

---

## For Technical Contributors

**Prerequisites:** Python 3.10+, basic NLP knowledge, git

**Setup:**
```bash
git clone <repo>
cd zolai
pip install -e ".[dev]"
```

**Key directories:**
```
data/           — All datasets (don't commit large files)
scripts/        — All pipeline scripts
wiki/           — Knowledge base (edit freely, log in CHANGELOG.md)
agents/         — Agent configs (JSON)
zolai/          — Core Python package
```

**Before making changes:**
1. Read `wiki/memory/long_term.md` — project state
2. Read `wiki/zolai_ai_instructions.md` — ZVS rules (critical)
3. Read `wiki/training/departments_and_agents.md` — who does what

**Rules:**
- Never commit raw data files > 10MB to git
- Always log wiki changes in `wiki/planning/CHANGELOG.md`
- All generated Zolai must pass ZVS: no `pasian`, `gam`, `tapa`, `topa`, `tua`, `tuan`
- Run `zolai audit-jsonl -i <file>` before committing new datasets

---

## For Researchers / Academics

**Cite our work:** If you use our corpus or models, please cite:
- Dataset: Zolai Parallel Corpus v1 (105K ZO↔EN pairs, 2026)
- Model: `peterpausianlian/zolai-qwen2.5-3b-lora` (HuggingFace)

**Collaborate:**
- Submit Zolai data to SEACrowd: github.com/SEACrowd/seacrowd-datahub
- Open issues for linguistic corrections
- Share papers on low-resource Kuki-Chin/Tibeto-Burman NLP

---

## Key Contacts & Resources

| Resource | Location |
|---|---|
| HuggingFace model | `peterpausianlian/zolai-qwen2.5-3b-lora` |
| Training dataset | `peterpausianlian/zolai-llm-training-dataset` |
| Wiki | `wiki/` in this repo |
| Grammar reference | `wiki/ggammar/core_ggammar_reference.md` |
| ZVS rules | `wiki/zolai_ai_instructions.md` |
| Research | `wiki/training/research_v2_models_and_platforms.md` |

---

## Bus Factor Mitigation

This project currently has a bus factor of 1. To reduce this risk:

**Critical knowledge that must be documented before any contributor leaves:**
- [ ] HuggingFace account credentials → move to org account `zolai-project`
- [ ] Kaggle dataset IDs and notebook links
- [ ] GPT-4o API key usage for synthesis
- [ ] Native speaker reviewer contacts
- [ ] Server deployment credentials (`scripts/deploy/`)

**If you are the primary contributor:** Please ensure at least one other person has access to the HF org account and knows how to run the training pipeline.

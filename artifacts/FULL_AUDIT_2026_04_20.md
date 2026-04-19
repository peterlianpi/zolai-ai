# Zolai AI Second Brain — Full Codebase Audit
**Date:** 2026-04-20  
**Auditor:** Kiro AI (automated)  
**Status:** ✅ Complete

## Project Identity
- **Name:** Zolai AI Second Brain (also: Zomi AI)
- **Mission:** Digitize, standardize, and preserve the Tedim Zolai language through AI
- **Standard:** Tedim ZVS (Zolai Vernacular Standard 2018)
- **HuggingFace:** peterpausianlian/zolai-qwen2.5-3b-lora
- **Website:** peterlianpi.site

## Codebase Statistics
| Category | Count |
|----------|-------|
| Python scripts | ~150 |
| Agents | 28 |
| Skills | 40 |
| Wiki docs | 100+ |
| Documentation files | 50+ |
| Notebooks | 5 |

## Data Assets (as of 2026-04-20)
| Dataset | Size | Status |
|---------|------|--------|
| llm_train_v3.jsonl | 651 MB | ✅ Latest training set |
| llm_val_v3.jsonl | 36 MB | ✅ Validation |
| llm_test_v3.jsonl | 36 MB | ✅ Test |
| orpo_pairs_v1.jsonl | 1 GB | ✅ ORPO/DPO training |
| instructions_bible_v1.jsonl | 18 MB | ✅ Bible instructions |
| final_train.jsonl | 1.2 GB | ✅ Final merged |
| master_source_v1.jsonl | 1 GB | ✅ Source corpus |
| dict_unified_v1.jsonl | 31 MB | ✅ Dictionary |
| parallel_combined_v1.jsonl | 39 MB | ✅ Parallel pairs |
| zolai_qa_v1.jsonl | 122 KB | ✅ QA eval |
| translation_eval_v1.jsonl | 154 KB | ✅ Translation eval |
| zvs_compliance_test_v1.jsonl | 55 KB | ✅ ZVS compliance |

## Training Status
- Model: Qwen2.5-3B with LoRA adapter
- Adapter: peterpausianlian/zolai-qwen2.5-3b-lora
- Training platform: Kaggle (T4x2)
- Current phase: Session-based training (25k chunks)
- ORPO pairs: Available for preference optimization

## Website Status
- Framework: Next.js 15 + Tailwind + Prisma
- Location: website/zolai-project/
- Features: Dictionary search, AI chat tutor, curriculum
- Auth: NextAuth with CSRF protection
- Deployment: Vercel + peterlianpi.site

## API Status
- FastAPI server: zolai/api/server.py
- Dictionary API: zolai/api/dictionary_api.py
- Chat API: scripts/ui/chat_api.py

## Issues Found & Fixed
1. INDEX.md had stale directory references — FIXED
2. docs/PROJECT_STRUCTURE.md had wrong data/ layout — FIXED
3. data/README.md missing v3 training files and eval data — FIXED
4. agents/README.md missing 15+ agents — FIXED
5. wiki/README.md missing 15+ subdirectory links — FIXED
6. scripts/README.md missing ~50 scripts — FIXED
7. schema.md missing ORPO/instruction/eval schemas — FIXED

## Recommendations
1. Run `zolai audit-jsonl` on llm_train_v3.jsonl to verify integrity
2. Publish datasets to HuggingFace Hub (Phase 2 goal)
3. Add pytest tests for core zolai/ package modules
4. Set up GitHub Actions CI (lint + test)
5. Complete GGUF conversion after training plateau
6. Deploy Gradio demo on HF Spaces
7. Crawl more ZomiDaily/Tongsan data for corpus expansion

# Skill: Zolai Training Orchestrator
# Triggers: "run full training pipeline", "orchestrate zolai training", "from dataset to model release"
# Version: 1.0.1

## Pipeline Stages

1. **Data Ingest & Cleaning**
   - Run: `zolai clean --input data/raw/ --output data/processed/`
   - Validate: JSONL integrity, UTF-8, no truncated fragments
   - Check: Mizo/Falam contamination rate

2. **Split + Leakage Checks**
   - Run: `zolai train --split 80/10/10`
   - Gate: Check for train/val/test overlap (SHA256)
   - Report: Leakage percentage (must be 0%)

3. **Tokenizer Analysis**
   - Analyze: Token distribution, OOV rate for Zolai morphemes
   - Check: Ergative marker `in`, verb stems, OSV patterns
   - Report: Tokenizer coverage

4. **SFT/Alignment Dataset**
   - Format: `{text, source, sha256}`
   - Export: HF DatasetDict to `data/training/hf/`
   - Validate: Schema compliance

5. **GPU Training Optimization**
   - Config: QLoRA 4-bit, NF4, paged_adamw_32bit
   - Check: VRAM usage, batch size, gradient accumulation
   - Optimize: `USE_DDP_2GPU=True` for T4×2

6. **Evaluation**
   - Run: Eval on val set every 400 steps
   - Metrics: Loss, perplexity, BLEU (if parallel data)
   - Check: No catastrophic forgetting

7. **Drift Monitoring**
   - Compare: Pre/post training on held-out Zolai samples
   - Gate: Pass/warn/fail on quality degradation

8. **Model Registry Release**
   - Package: Final adapter + tokenizer
   - Upload: Kaggle dataset version + HF Hub
   - Document: Model card, training logs, eval results

## References
- `skills/zolai-training-orchestrator/zolai-v1-runbook.md`
- `skills/zolai-training-orchestrator/release-gates.md`
- `skills/zolai-training-orchestrator/pipeline-checklist.md`

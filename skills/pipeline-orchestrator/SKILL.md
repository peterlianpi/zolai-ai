# Pipeline Orchestrator Skill

## Purpose
Coordinate the full Zolai dataset pipeline from raw collection to trained model on Kaggle.

## Pipeline Stages

```
[collect] → [clean] → [validate] → [prepare] → [upload] → [train] → [monitor] → [download] → [evaluate]
```

| Stage | Agent | Command | Output |
|---|---|---|---|
| collect | zomi-crawler-bot | `crawl_all_news.py`, `fetch_tongdot_dictionary.py` | `data/master/sources/` |
| clean | zomi-cleaner-bot | `combine_and_categorize.py` | `data/master/combined/` |
| validate | zolai-grammar-checker | `test_grammar_rules.py`, `doublecheck_master.py` | pass/fail |
| prepare | zomi-trainer-bot | `prepare_train.py` | `runs/zo_tdm_v1/` |
| upload | zolai-pipeline-team | `kaggle datasets version ...` | Kaggle dataset v++ |
| train | zomi-trainer-bot | `kaggle kernels push ...` | Kaggle notebook run |
| monitor | zomi-ops-monitor | poll `kaggle kernels status` | status: complete/error |
| download | zomi-trainer-bot | `kaggle kernels output ...` | `models/zolai-qwen2.5-3b-lora/` |
| evaluate | zomi-evaluator | benchmarks | `artifacts/evaluation_report.md` |

## Quick Commands

```bash
# Full pipeline
bash scripts/deploy/kaggle-pipeline.sh full

# Individual stages
bash scripts/deploy/kaggle-pipeline.sh collect
bash scripts/deploy/kaggle-pipeline.sh clean
bash scripts/deploy/kaggle-pipeline.sh train
bash scripts/deploy/kaggle-pipeline.sh download
bash scripts/deploy/kaggle-pipeline.sh status
```

## Gate Rules (must pass before next stage)
- **collect → clean:** at least 1 new JSONL file in `data/master/sources/`
- **clean → validate:** `data/master/combined/sentences.jsonl` exists and non-empty
- **validate → prepare:** `test_grammar_rules.py` exits 0, `doublecheck_master.py` passes
- **prepare → upload:** `runs/zo_tdm_v1/train.txt` has ≥10,000 lines
- **upload → train:** `kaggle datasets version` exits 0
- **train → monitor:** `kaggle kernels push` exits 0
- **monitor → download:** notebook status = `complete` (not `error`)
- **download → evaluate:** `models/zolai-qwen2.5-3b-lora/` non-empty

## Failure Handling
- Any gate failure → stop pipeline, log error, send Telegram alert
- Notebook error → check `kaggle kernels output` for logs before retry
- Upload failure → retry 3× with 30s backoff

## Cron Schedule (VPS)
```cron
0 */6  * * *  bash /home/peter/Documents/Projects/zolai/scripts/deploy/kaggle-pipeline.sh collect
0 */12 * * *  bash /home/peter/Documents/Projects/zolai/scripts/deploy/kaggle-pipeline.sh clean
0 3    * * 0  bash /home/peter/Documents/Projects/zolai/scripts/deploy/kaggle-pipeline.sh full
```

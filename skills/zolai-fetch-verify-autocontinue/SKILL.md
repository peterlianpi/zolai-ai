# Skill: Zolai Fetch-Verify-AutoContinue
# Triggers: "run zolai fetch verify cycle", "auto continue zolai dataset", "recurring zolai web mining"

## Purpose
Resumable 3-stage pipeline for continuous web corpus mining.

## Stages
1. **Fetch:** Crawl public web corpus from seed URLs
2. **Verify:** Check Zolai relevance (Gemini + local heuristic)
3. **Export:** High-confidence train candidates

## State Tracking
State files in `data/external/state/zolai-web/`:
- `stage.json` — Current stage (fetch/verify/export)
- `progress.json` — Items processed, skipped, failed
- `report.json` — Final cycle report

## Runner
```bash
python skills/run-fetch-verify.py --resume --input data/raw/ --output data/processed/
```

## Resume Mode
If interrupted, restarts from last completed stage automatically.

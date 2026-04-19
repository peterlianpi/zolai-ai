# Skill: Kaggle Automation via OpenClaw
# Triggers: "run kaggle pipeline", "upload to kaggle", "trigger kaggle notebook", "kaggle clean and train"
# Version: 1.0.0

## Purpose
OpenClaw on VPS automates the full Kaggle pipeline: upload raw data → trigger cleaning notebook → download results → merge → repeat.

## Prerequisites
- Kaggle CLI installed: `pip install kaggle kagglehub`
- Auth: `~/.kaggle/kaggle.json` (chmod 600)
- Or env vars: `KAGGLE_USERNAME`, `KAGGLE_KEY`
- Notebooks pushed to Kaggle and configured

## Pipeline

### Stage 1: Upload Raw Data
```bash
# Package raw data
python scripts/package_for_kaggle.py --input data/raw/ --output /tmp/kaggle-upload/

# Upload as new dataset version
kaggle datasets version \
  -p /tmp/kaggle-upload/ \
  -m "Raw data $(date +%Y%m%d-%H%M)" \
  -q  # quiet mode for automation
```

### Stage 2: Trigger Cleaning Notebook
```bash
# Push updated notebook (if code changed)
kaggle kernels push -p notebooks/zolai-cleaner-v2/

# Or just trigger a run of existing notebook
# (Kaggle auto-runs on dataset update if configured)

# Check status
kaggle kernels status -k peterpausianlian/zolai-cleaner-v2
```

### Stage 3: Wait for Completion
```bash
# Poll until done
while true; do
  STATUS=$(kaggle kernels status -k peterpausianlian/zolai-cleaner-v2 2>/dev/null | grep -oP '(complete|error|running)')
  if [ "$STATUS" = "complete" ]; then
    echo "✓ Cleaning complete"
    break
  elif [ "$STATUS" = "error" ]; then
    echo "✗ Cleaning failed"
    # Notify via Telegram
    exit 1
  fi
  sleep 60  # Check every minute
done
```

### Stage 4: Download Cleaned Output
```bash
# Download outputs
kaggle kernels output -k peterpausianlian/zolai-cleaner-v2 -p /tmp/kaggle-output/

# Or download dataset version
kaggle datasets download \
  -d peterpausianlian/zolai-cleaned-output \
  -p data/kaggle/ \
  --unzip
```

### Stage 5: Merge & Train
```bash
# Merge with local data
python scripts/zolai-dataset-combiner-v1.py --input data/kaggle/ --output data/training/

# Trigger training notebook
kaggle kernels push -p notebooks/zolai-qwen-training-v2/
```

## Automation Triggers

### Cron Schedule (VPS)
```cron
# Every 6 hours: collect new data
0 */6 * * * /home/peter/.openclaw/scripts/kaggle-pipeline.sh --stage collect

# Every 12 hours: upload + trigger clean
0 */12 * * * /home/peter/.openclaw/scripts/kaggle-pipeline.sh --stage upload-clean

# Daily at 2am: download + merge
0 2 * * * /home/peter/.openclaw/scripts/kaggle-pipeline.sh --stage download-merge

# Weekly on Sunday: full pipeline + train
0 3 * * 0 /home/peter/.openclaw/scripts/kaggle-pipeline.sh --stage full
```

### OpenClaw Agent Trigger
```
User: "run kaggle pipeline"
→ Agent executes kaggle-pipeline.sh --stage full
→ Reports progress via Telegram
→ Notifies on completion or error
```

## Error Handling
- **Upload fails:** Retry 3 times with exponential backoff
- **Notebook errors:** Send Telegram alert with error log
- **Timeout (>12hrs):** Notebook session expired → re-trigger
- **Disk full on Kaggle:** Clean old outputs, retry

## Notification
```bash
# On success
curl -s "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -d "chat_id=<CHAT_ID>&text=✅ Kaggle pipeline complete: $(du -sh data/training/)"

# On error
curl -s "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -d "chat_id=<CHAT_ID>&text=❌ Kaggle pipeline failed: $ERROR"
```

## Security
- Never commit `kaggle.json` to git
- Use env vars or encrypted secrets
- Kaggle API key has write access — protect it

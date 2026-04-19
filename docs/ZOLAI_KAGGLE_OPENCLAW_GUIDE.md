# Zolai Dataset + Kaggle + OpenClaw Integration Guide

> Complete workflow for using Kaggle to process Zolai datasets and improve OpenClaw models.
> Created: 2026-04-04 | Server: <SERVER_IP> | Domain: peterlianpi.site

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        VPS (OpenClaw + Nginx)                   │
│                                                                 │
│  Cloudflare Tunnel ──→ Nginx (port 80)                         │
│  ├── peterlianpi.site ──→ /var/www/peterlianpi.site/           │
│  └── openclaw.peterlianpi.site ──→ OpenClaw (port 18789)       │
│                                                                 │
│  OpenClaw Gateway                                               │
│  ├── Telegram Bots (peter, junior, bitget)                      │
│  ├── Web UI                                                     │
│  └── AI Agents (Zolai Learner, Data Pipeline, Model Training)   │
│                                                                 │
│  Zolai Project (/path/to/zolai/)          │
│  ├── src/zolai/          # Python package                       │
│  ├── notebooks/          # Kaggle notebooks                     │
│  ├── scripts/            # Automation scripts                   │
│  │   └── kaggle-pipeline.sh  # Main pipeline controller         │
│  ├── data/               # Dataset storage                      │
│  └── models/             # Trained LoRA adapters                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    Kaggle API
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                        KAGGLE CLOUD (Free T4×2)                 │
│                                                                 │
│  1. Data Collection → 2. Cleaning → 3. Combining → 4. Training │
│                                                                 │
│  Output: HuggingFace Dataset + LoRA Adapter                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    Download & Deploy
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    BACK TO OPENCLAW                             │
│                                                                 │
│  1. Download trained LoRA adapter                               │
│  2. Configure OpenClaw to use fine-tuned model                  │
│  3. Update agents with improved Zolai knowledge                 │
│  4. Deploy updated models via Telegram/Web                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Kaggle Setup

### 2.1 Create Kaggle Account
1. Go to https://www.kaggle.com
2. Sign up with Google/GitHub
3. Verify email + phone
4. Enable GPU access (requires phone verification)

### 2.2 Get Kaggle API Token
1. Go to **Account Settings → API**
2. Click **Create New API Token**
3. Download `kaggle.json`
4. Save to `~/.kaggle/kaggle.json`
5. Set permissions: `chmod 600 ~/.kaggle/kaggle.json`

### 2.3 Install Kaggle CLI
```bash
pip install kaggle kagglehub
```

### 2.4 Required Kaggle Datasets
| Dataset Name | Purpose |
|-------------|---------|
| `zolai-raw-corpus` | Raw scraped data |
| `zolai-cleaned-output` | Cleaned, deduped data |
| `zolai-master-data` | Combined final dataset |
| `zolai-hf-advanced` | HuggingFace DatasetDict |

---

## 3. OpenClaw Configuration

### 3.1 Add Zolai Model Provider
Edit `~/.openclaw/openclaw.json`:

```json
{
  "models": {
    "providers": {
      "zolai-local": {
        "baseUrl": "http://127.0.0.1:8080/v1",
        "apiKey": "sk-zolai-local",
        "api": "openai-completions",
        "models": [{
          "id": "zolai-qwen2.5-3b-lora",
          "name": "Zolai Qwen2.5 3B LoRA",
          "reasoning": false,
          "input": ["text"],
          "cost": {"input": 0, "output": 0}
        }]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "opencode/nemotron-3-super-free",
        "fallbacks": [
          "zolai-local/zolai-qwen2.5-3b-lora",
          "openrouter/google/gemini-2.0-flash-exp:free"
        ]
      }
    }
  }
}
```

### 3.2 Create Zolai Agent
```json
{
  "name": "Zolai Learner",
  "role": "Zolai Language Teaching & Translation",
  "systemPrompt": "You are Zola, a Zolai language expert. You teach Zolai (Tedim Chin) language, translate between English and Zolai, and help preserve the language through technology. Use OSV word order, ergative markers, and proper verb stems.",
  "model": "opencode/nemotron-3-super-free",
  "tools": ["read", "write", "search", "memory"]
}
```

---

## 4. Kaggle Pipeline Commands

### 4.1 Quick Start
```bash
# Full pipeline (collect → clean → combine → train)
bash scripts/kaggle-pipeline.sh full

# Check status
bash scripts/kaggle-pipeline.sh status

# Download and deploy trained model
bash scripts/kaggle-pipeline.sh download
bash scripts/kaggle-pipeline.sh deploy
```

### 4.2 Individual Stages
```bash
# Collect raw data
bash scripts/kaggle-pipeline.sh collect

# Clean data on Kaggle
bash scripts/kaggle-pipeline.sh clean

# Combine datasets
bash scripts/kaggle-pipeline.sh combine

# Train model on Kaggle GPU
bash scripts/kaggle-pipeline.sh train

# Download trained model
bash scripts/kaggle-pipeline.sh download

# Deploy to OpenClaw
bash scripts/kaggle-pipeline.sh deploy
```

---

## 5. Automated Scheduling (Cron)

```bash
crontab -e

# Every 6 hours: collect new data
0 */6 * * * /path/to/zolai/scripts/kaggle-pipeline.sh collect

# Every 12 hours: clean data
0 */12 * * * /path/to/zolai/scripts/kaggle-pipeline.sh clean

# Daily at 2am: combine datasets
0 2 * * * /path/to/zolai/scripts/kaggle-pipeline.sh combine

# Weekly on Sunday 3am: train model
0 3 * * 0 /path/to/zolai/scripts/kaggle-pipeline.sh train

# Sunday 9am: download and deploy model
0 9 * * 0 /path/to/zolai/scripts/kaggle-pipeline.sh download && /path/to/zolai/scripts/kaggle-pipeline.sh deploy
```

---

## 6. Complete Workflow

```
Step 1: Collect Data
  ↓
  Web crawlers, dictionary fetchers, OCR → Raw JSONL
  ↓
Step 2: Clean Data (Kaggle CPU)
  ↓
  NFKC, dedup, dialect filter, split → Cleaned JSONL
  ↓
Step 3: Combine Datasets (Kaggle CPU)
  ↓
  Merge all sources, global dedup → Master Dataset
  ↓
Step 4: Train Model (Kaggle T4×2 GPU)
  ↓
  QLoRA 4-bit on Qwen2.5-3B → LoRA Adapter
  ↓
Step 5: Download & Deploy
  ↓
  Download adapter → Update OpenClaw config → Restart
  ↓
Step 6: Test
  ↓
  OpenClaw uses fine-tuned Zolai model for responses
```

---

## 7. Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Kaggle notebook fails | GPU not available | Wait for T4 availability |
| Training OOM | Batch size too large | Reduce batch size, enable gradient checkpointing |
| Model not improving | Learning rate too high | Reduce to 1e-4 or 2e-5 |
| OpenClaw not using Zolai model | Config not updated | Run `deploy` stage |
| Dataset too small | Not enough sources | Add more web crawlers, OCR more PDFs |
| Kaggle session timeout | 12-hour limit | Use checkpoint resume |
| 404 on peterlianpi.site | Missing tunnel rule | Add in Cloudflare Tunnel dashboard |
| 521 error | Nginx not running | `sudo systemctl restart nginx` |

---

## 8. Quick Reference

```bash
# Start all services
sudo systemctl start nginx
sudo systemctl start openclaw
nohup cloudflared tunnel --url http://localhost:80 run --token TOKEN > /tmp/cloudflared.log 2>&1 &

# Trigger full pipeline
bash scripts/kaggle-pipeline.sh full

# Check status
bash scripts/kaggle-pipeline.sh status
curl -s http://127.0.0.1:18789/health

# Deploy new model
bash scripts/kaggle-pipeline.sh download && bash scripts/kaggle-pipeline.sh deploy
```

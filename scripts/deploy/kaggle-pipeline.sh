#!/usr/bin/env bash
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# ============================================================
# Zolai Kaggle + OpenClaw Pipeline Automation
# ============================================================
# Usage:
#   bash scripts/kaggle-pipeline.sh collect    # Collect raw data
#   bash scripts/kaggle-pipeline.sh clean      # Clean data
#   bash scripts/kaggle-pipeline.sh combine    # Combine datasets
#   bash scripts/kaggle-pipeline.sh train      # Train model
#   bash scripts/kaggle-pipeline.sh download   # Download trained model
#   bash scripts/kaggle-pipeline.sh deploy     # Deploy model to OpenClaw
#   bash scripts/kaggle-pipeline.sh full       # Full pipeline
#   bash scripts/kaggle-pipeline.sh status     # Check status
# ============================================================
set -euo pipefail

# ─── Config ────────────────────────────────────────────────────────────────
ZOLOAI_ROOT="${ZOLOAI_ROOT:-${PROJECT_ROOT}}"
DATA_RAW="$ZOLOAI_ROOT/data/raw"
DATA_PROCESSED="$ZOLOAI_ROOT/data/processed"
DATA_KAGGLE="$ZOLOAI_ROOT/data/kaggle"
DATA_TRAINING="$ZOLOAI_ROOT/data/training"
NOTEBOOKS="$ZOLOAI_ROOT/notebooks"
SCRIPTS="$ZOLOAI_ROOT/scripts"
LOG_DIR="$ZOLOAI_ROOT/logs/kaggle"
MODELS_DIR="$ZOLOAI_ROOT/models"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"

# Kaggle dataset slugs
RAW_DATASET="peterpausianlian/zolai-language-dataset-v2"
CLEANED_DATASET="peterpausianlian/zolai-language-dataset-v2"
MASTER_DATASET="peterpausianlian/zolai-language-dataset-v2"

# Kaggle notebook slugs
CLEANER_NOTEBOOK="peterpausianlian/zolai-cleaner-v2"
COMBINER_NOTEBOOK="peterpausianlian/zolai-dataset-combiner-v1"
TRAINING_NOTEBOOK="peterpausianlian/zolai-qwen-training-v2"

# ─── Setup ─────────────────────────────────────────────────────────────────
mkdir -p "$LOG_DIR" "$MODELS_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="$LOG_DIR/pipeline-$TIMESTAMP.log"

log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
    echo "$msg" | tee -a "$LOG_FILE"
}

notify() {
    local msg="$*"
    if [ -n "$TELEGRAM_CHAT_ID" ] && [ -n "$TELEGRAM_BOT_TOKEN" ]; then
        curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=🔄 Zolai Kaggle: $msg" \
            -d "parse_mode=Markdown" >/dev/null 2>&1 || true
    fi
    log "$msg"
}

notify_success() {
    local msg="$*"
    if [ -n "$TELEGRAM_CHAT_ID" ] && [ -n "$TELEGRAM_BOT_TOKEN" ]; then
        curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=✅ Zolai Kaggle: $msg" \
            -d "parse_mode=Markdown" >/dev/null 2>&1 || true
    fi
    log "SUCCESS: $msg"
}

notify_error() {
    local msg="$*"
    if [ -n "$TELEGRAM_CHAT_ID" ] && [ -n "$TELEGRAM_BOT_TOKEN" ]; then
        curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=❌ Zolai Kaggle ERROR: $msg" \
            -d "parse_mode=Markdown" >/dev/null 2>&1 || true
    fi
    log "ERROR: $msg"
}

check_kaggle_auth() {
    if ! kaggle datasets list -s "zolai" --page-size 1 >/dev/null 2>&1; then
        notify_error "Kaggle authentication failed. Check ~/.kaggle/kaggle.json or env vars"
        exit 1
    fi
    log "✓ Kaggle auth OK"
}

# ─── Stage: Collect Raw Data ───────────────────────────────────────────────
stage_collect() {
    log "=== STAGE: Collect Raw Data ==="
    notify "Starting data collection..."

    cd "$ZOLOAI_ROOT"

    # 1. Run web crawler
    log "Running web crawler..."
    if [ -f "$SCRIPTS/fetch-zolai-web-corpus.py" ]; then
        python3 "$SCRIPTS/fetch-zolai-web-corpus.py" \
            --output "$DATA_RAW/web-corpus-$TIMESTAMP.jsonl" \
            >> "$LOG_FILE" 2>&1 || notify_error "Web crawler failed"
    fi

    # 2. Fetch Tongdot dictionary
    log "Fetching Tongdot dictionary..."
    if [ -f "$SCRIPTS/fetch_tongdot_dictionary.py" ]; then
        python3 "$SCRIPTS/fetch_tongdot_dictionary.py" \
            --input "$ZOLOAI_ROOT/data/zolai_word_list.txt" \
            --output "$DATA_RAW/tongdot-$TIMESTAMP.jsonl" \
            --resume --sleep 2 \
            >> "$LOG_FILE" 2>&1 || notify_error "Tongdot fetch failed"
    fi

    # 3. OCR lesson PDFs (if Mistral API key available)
    if [ -n "${MISTRAL_API_KEY:-}" ] && [ -f "$SCRIPTS/mistral_ocr_pdfs.py" ]; then
        log "Running Mistral OCR on PDFs..."
        python3 "$SCRIPTS/mistral_ocr_pdfs.py" \
            --input "$ZOLOAI_ROOT/data/external/lessons/" \
            --output "$DATA_PROCESSED/lessons-ocr/" \
            --resume --sleep 3 \
            >> "$LOG_FILE" 2>&1 || notify_error "OCR failed"
    fi

    # 4. Count collected data
    local raw_count=$(find "$DATA_RAW" -name "*.jsonl" -newer "$LOG_DIR" 2>/dev/null | wc -l)
    local raw_size=$(du -sh "$DATA_RAW" 2>/dev/null | cut -f1)
    log "Collected: $raw_count new files, total raw: $raw_size"
    notify_success "Data collection done: $raw_count new files ($raw_size)"
}

# ─── Stage: Upload + Trigger Clean ─────────────────────────────────────────
stage_upload_clean() {
    log "=== STAGE: Upload + Trigger Clean ==="
    notify "Starting upload to Kaggle..."

    check_kaggle_auth
    cd "$ZOLOAI_ROOT"

    # 1. Package raw data for Kaggle
    log "Packaging raw data..."
    UPLOAD_DIR="/tmp/zolai-kaggle-upload-$TIMESTAMP"
    mkdir -p "$UPLOAD_DIR"

    # Copy recent raw files (last 24 hours)
    find "$DATA_RAW" -name "*.jsonl" -mtime -1 -exec cp {} "$UPLOAD_DIR/" \; 2>/dev/null || true
    find "$DATA_PROCESSED" -name "*.jsonl" -mtime -1 -exec cp {} "$UPLOAD_DIR/" \; 2>/dev/null || true

    local file_count=$(find "$UPLOAD_DIR" -name "*.jsonl" | wc -l)
    if [ "$file_count" -eq 0 ]; then
        log "No new files to upload"
        notify "No new data to upload"
        rm -rf "$UPLOAD_DIR"
        return 0
    fi

    log "Packaged $file_count files ($(du -sh "$UPLOAD_DIR" | cut -f1))"

    # 2. Create dataset-metadata.json
    cat > "$UPLOAD_DIR/dataset-metadata.json" << EOF
{
  "id": "$RAW_DATASET",
  "title": "Zolai Raw Corpus",
  "licenses": [{"name": "CC0-1.0"}]
}
EOF

    # 3. Upload to Kaggle
    log "Uploading to Kaggle..."
    kaggle datasets version \
        -p "$UPLOAD_DIR" \
        -m "Raw data $(date +%Y%m%d-%H%M)" \
        -q \
        >> "$LOG_FILE" 2>&1 || {
        notify_error "Upload failed"
        rm -rf "$UPLOAD_DIR"
        return 1
    }
    notify_success "Uploaded $file_count files to Kaggle"

    # 4. Trigger cleaner notebook
    log "Triggering cleaner notebook..."
    kaggle kernels push -p "$NOTEBOOKS/zolai-cleaner-v2/" \
        >> "$LOG_FILE" 2>&1 || notify_error "Notebook push failed"

    notify "Cleaner notebook triggered on Kaggle"

    rm -rf "$UPLOAD_DIR"
}

# ─── Stage: Download + Merge ───────────────────────────────────────────────
stage_download_merge() {
    log "=== STAGE: Download + Merge ==="
    notify "Starting download from Kaggle..."

    check_kaggle_auth
    cd "$ZOLOAI_ROOT"

    # 1. Check if cleaner notebook is complete
    log "Checking cleaner notebook status..."
    local status=$(kaggle kernels status -k "$CLEANER_NOTEBOOK" 2>/dev/null | grep -oP '(complete|error|running|queued)' || echo "unknown")
    log "Cleaner status: $status"

    if [ "$status" = "running" ] || [ "$status" = "queued" ]; then
        log "Notebook still running/queued, waiting..."
        notify "Cleaner notebook still $status, will retry later"
        return 0
    fi

    if [ "$status" = "error" ]; then
        notify_error "Cleaner notebook failed on Kaggle"
        return 1
    fi

    # 2. Download cleaned output
    log "Downloading cleaned output..."
    kaggle kernels output -k "$CLEANER_NOTEBOOK" -p "$DATA_KAGGLE/" \
        >> "$LOG_FILE" 2>&1 || {
        notify_error "Download failed"
        return 1
    }

    # 3. Also download latest dataset version
    log "Downloading latest cleaned dataset..."
    kaggle datasets download \
        -d "$CLEANED_DATASET" \
        -p "$DATA_KAGGLE/" \
        --unzip \
        >> "$LOG_FILE" 2>&1 || notify_error "Dataset download failed"

    # 4. Merge with local data
    log "Merging data..."
    if [ -f "$SCRIPTS/zolai-dataset-combiner-v1.py" ]; then
        python3 "$SCRIPTS/zolai-dataset-combiner-v1.py" \
            --input "$DATA_KAGGLE/" \
            --output "$DATA_TRAINING/" \
            >> "$LOG_FILE" 2>&1 || notify_error "Merge failed"
    fi

    # 5. Upload merged dataset
    log "Uploading merged dataset..."
    kaggle datasets version \
        -p "$DATA_TRAINING/" \
        -m "Merged dataset $(date +%Y%m%d-%H%M)" \
        -q \
        >> "$LOG_FILE" 2>&1 || notify_error "Merged upload failed"

    local training_size=$(du -sh "$DATA_TRAINING" 2>/dev/null | cut -f1)
    notify_success "Downloaded + merged. Training data: $training_size"
}

# ─── Stage: Train ──────────────────────────────────────────────────────────
stage_train() {
    log "=== STAGE: Model Training ==="
    notify "Starting model training on Kaggle..."

    check_kaggle_auth

    # 1. Push training notebook
    log "Pushing training notebook..."
    kaggle kernels push -p "$NOTEBOOKS/zolai-qwen-training-v2/" \
        >> "$LOG_FILE" 2>&1 || {
        notify_error "Training notebook push failed"
        return 1
    }

    notify "Training notebook triggered on Kaggle (T4×2, QLoRA 4-bit)"
    notify "Training will take 6-24 hours. Check: kaggle kernels status -k $TRAINING_NOTEBOOK"
}

# ─── Stage: Download Model ─────────────────────────────────────────────────
stage_download() {
    log "=== STAGE: Download Trained Model ==="
    notify "Downloading trained model from Kaggle..."

    check_kaggle_auth

    # Create model directory
    MODEL_DIR="$MODELS_DIR/zolai-qwen2.5-3b-lora"
    mkdir -p "$MODEL_DIR"

    # Download training outputs
    log "Downloading training outputs..."
    kaggle kernels output -k "$TRAINING_NOTEBOOK" -p "$MODEL_DIR/" \
        >> "$LOG_FILE" 2>&1 || {
        notify_error "Download failed"
        return 1
    }

    # Extract LoRA adapter if zipped
    if [ -f "$MODEL_DIR/qwen_zolai_lora.zip" ]; then
        log "Extracting LoRA adapter..."
        unzip -o "$MODEL_DIR/qwen_zolai_lora.zip" -d "$MODEL_DIR/" >> "$LOG_FILE" 2>&1
    fi

    local model_size=$(du -sh "$MODEL_DIR" | cut -f1)
    notify_success "Model downloaded to $MODEL_DIR ($model_size)"
}

# ─── Stage: Deploy Model to OpenClaw ───────────────────────────────────────
stage_deploy() {
    log "=== STAGE: Deploy Model to OpenClaw ==="
    notify "Deploying model to OpenClaw..."

    MODEL_DIR="$MODELS_DIR/zolai-qwen2.5-3b-lora"

    if [ ! -d "$MODEL_DIR" ]; then
        notify_error "Model directory not found. Run 'download' first."
        return 1
    fi

    # Update OpenClaw config
    log "Updating OpenClaw config..."
    python3 << 'PYEOF'
import json
import os

config_path = os.path.expanduser("~/.openclaw/openclaw.json")
if not os.path.exists(config_path):
    print("OpenClaw config not found")
    exit(1)

with open(config_path, 'r') as f:
    cfg = json.load(f)

# Add local Zolai model provider
cfg.setdefault('models', {}).setdefault('providers', {})['zolai-local'] = {
    'baseUrl': 'http://127.0.0.1:8080/v1',
    'apiKey': 'sk-zolai-local',
    'api': 'openai-completions',
    'models': [{
        'id': 'zolai-qwen2.5-3b-lora',
        'name': 'Zolai Qwen2.5 3B LoRA',
        'reasoning': False,
        'input': ['text'],
        'cost': {'input': 0, 'output': 0}
    }]
}

# Update agent fallbacks
if 'agents' in cfg and 'defaults' in cfg['agents']:
    fallbacks = cfg['agents']['defaults'].setdefault('model', {}).get('fallbacks', [])
    zolai_model = 'zolai-local/zolai-qwen2.5-3b-lora'
    if zolai_model not in fallbacks:
        fallbacks.insert(0, zolai_model)
        cfg['agents']['defaults']['model']['fallbacks'] = fallbacks

with open(config_path, 'w') as f:
    json.dump(cfg, f, indent=2)

print('✓ OpenClaw config updated with Zolai model')
PYEOF

    # Restart OpenClaw
    log "Restarting OpenClaw..."
    sudo systemctl restart openclaw 2>/dev/null || true
    sleep 5

    # Verify
    local health=$(curl -s --max-time 5 http://127.0.0.1:18789/health 2>&1)
    if echo "$health" | grep -q "live"; then
        notify_success "OpenClaw deployed with Zolai model"
    else
        notify_error "OpenClaw health check failed after deploy"
    fi
}

# ─── Stage: Full Pipeline ──────────────────────────────────────────────────
stage_full() {
    log "=== FULL PIPELINE ==="
    notify "🚀 Starting full Kaggle pipeline..."

    stage_collect
    stage_upload_clean

    log "Waiting for Kaggle to process (this takes hours)..."
    notify "Upload complete. Cleaner running on Kaggle. Will download results in next cycle."

    # Don't wait — let cron handle download-merge in next cycle
    log "Full pipeline initiated. Next cron cycle will download + merge."
}

# ─── Stage: Status ─────────────────────────────────────────────────────────
stage_status() {
    log "=== PIPELINE STATUS ==="

    echo ""
    echo "📊 Data Sizes:"
    echo "  Raw:       $(du -sh "$DATA_RAW" 2>/dev/null | cut -f1)"
    echo "  Processed: $(du -sh "$DATA_PROCESSED" 2>/dev/null | cut -f1)"
    echo "  Kaggle:    $(du -sh "$DATA_KAGGLE" 2>/dev/null | cut -f1)"
    echo "  Training:  $(du -sh "$DATA_TRAINING" 2>/dev/null | cut -f1)"

    echo ""
    echo "📁 File Counts:"
    echo "  Raw JSONL:       $(find "$DATA_RAW" -name "*.jsonl" 2>/dev/null | wc -l)"
    echo "  Processed JSONL: $(find "$DATA_PROCESSED" -name "*.jsonl" 2>/dev/null | wc -l)"
    echo "  Training JSONL:  $(find "$DATA_TRAINING" -name "*.jsonl" 2>/dev/null | wc -l)"

    echo ""
    echo "🔗 Kaggle Notebook Status:"
    echo "  Cleaner:  $(kaggle kernels status -k "$CLEANER_NOTEBOOK" 2>/dev/null || echo 'unknown')"
    echo "  Combiner: $(kaggle kernels status -k "$COMBINER_NOTEBOOK" 2>/dev/null || echo 'unknown')"
    echo "  Training: $(kaggle kernels status -k "$TRAINING_NOTEBOOK" 2>/dev/null || echo 'unknown')"

    echo ""
    echo "📋 Recent Logs:"
    ls -lt "$LOG_DIR/" 2>/dev/null | head -5
}

# ─── Main ──────────────────────────────────────────────────────────────────
STAGE="${1:-help}"

case "$STAGE" in
    collect)       stage_collect ;;
    clean)         stage_upload_clean ;;
    combine)       stage_download_merge ;;
    train)         stage_train ;;
    download)      stage_download ;;
    deploy)        stage_deploy ;;
    full)          stage_full ;;
    status)        stage_status ;;
    help|--help|-h)
        echo "Usage: $0 {collect|clean|combine|train|download|deploy|full|status}"
        echo ""
        echo "  collect  — Crawl web, fetch dictionary, OCR PDFs"
        echo "  clean    — Package raw data, upload to Kaggle, trigger cleaner"
        echo "  combine  — Download cleaned output, merge with local data"
        echo "  train    — Trigger training notebook on Kaggle"
        echo "  download — Download trained model from Kaggle"
        echo "  deploy   — Deploy model to OpenClaw"
        echo "  full     — Collect + clean + combine + train"
        echo "  status   — Show pipeline status"
        ;;
    *)
        echo "Unknown stage: $STAGE"
        echo "Usage: $0 {collect|clean|combine|train|download|deploy|full|status}"
        exit 1
        ;;
esac

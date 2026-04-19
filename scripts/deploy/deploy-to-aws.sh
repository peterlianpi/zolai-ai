#!/usr/bin/env bash
# ============================================================
# Deploy Zolai + OpenClaw to AWS Lightsail
# ============================================================
# Usage:
#   bash scripts/deploy-to-aws.sh --setup          # First-time server setup
#   bash scripts/deploy-to-aws.sh --push-code      # Push code to server
#   bash scripts/deploy-to-aws.sh --push-data      # Push data to server
#   bash scripts/deploy-to-aws.sh --pull-data      # Pull cleaned data from server
#   bash scripts/deploy-to-aws.sh --run            # Run pipeline on server
#   bash scripts/deploy-to-aws.sh --status         # Check server status
#   bash scripts/deploy-to-aws.sh --ssh            # Open SSH session
# ============================================================
set -euo pipefail

# ─── Config ────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ZOLOAI_ROOT="$(dirname "$SCRIPT_DIR")"
PEM_KEY="$ZOLOAI_ROOT/config/ssh/aws-lightsail.pem"
AWS_IP="<SERVER_IP>"
AWS_USER="ubuntu"
AWS_HOME="/home/$AWS_USER"
REMOTE_PROJECT="$AWS_HOME/zolai"
REMOTE_OPENCLAW="$AWS_HOME/.openclaw"

SSH_CMD="ssh -i $PEM_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=10 $AWS_USER@$AWS_IP"
SCP_CMD="scp -i $PEM_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=30"
RSYNC_CMD="rsync -avz --progress -e \"ssh -i $PEM_KEY -o StrictHostKeyChecking=no\""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; }

# ─── Verify ────────────────────────────────────────────────────────────────
verify_connection() {
    if ! $SSH_CMD "echo connected" >/dev/null 2>&1; then
        err "Cannot connect to $AWS_IP"
        err "Check: chmod 600 $PEM_KEY"
        exit 1
    fi
    ok "Connected to $AWS_IP"
}

# ─── Setup: First-time server preparation ──────────────────────────────────
setup_server() {
    info "Setting up AWS Lightsail server..."
    verify_connection

    info "Installing system packages..."
    $SSH_CMD "sudo apt-get update && sudo apt-get install -y \
        python3 python3-pip python3-venv python3-full \
        nodejs npm \
        git curl wget jq \
        rsync \
        ufw \
        2>&1" || warn "Some packages may need manual install"

    info "Setting up swap (server has only 2GB RAM)..."
    $SSH_CMD "
        if [ ! -f /swapfile ]; then
            sudo fallocate -l 4G /swapfile
            sudo chmod 600 /swapfile
            sudo mkswap /swapfile
            sudo swapon /swapfile
            echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
            echo '✓ 4GB swap created'
        else
            echo 'Swap already exists'
        fi
    "

    info "Creating project directory..."
    $SSH_CMD "mkdir -p $REMOTE_PROJECT $REMOTE_OPENCLAW"

    info "Setting up Python venv..."
    $SSH_CMD "
        cd $REMOTE_PROJECT
        if [ ! -d .venv ]; then
            python3 -m venv .venv
            echo '✓ venv created'
        else
            echo 'venv exists'
        fi
    "

    info "Configuring firewall..."
    $SSH_CMD "
        sudo ufw allow 22/tcp
        sudo ufw allow 18789/tcp  # OpenClaw
        sudo ufw allow 8300/tcp   # Zolai API
        sudo ufw allow 443/tcp
        sudo ufw allow 80/tcp
        echo 'y' | sudo ufw enable 2>/dev/null || true
        echo '✓ Firewall configured'
    "

    info "Setup complete!"
    ok "Server ready at $AWS_IP"
}

# ─── Push: Code only (fast) ────────────────────────────────────────────────
push_code() {
    info "Pushing code to server..."
    verify_connection

    # rsync source code, scripts, notebooks, resources (exclude data, venv, .git)
    $SSH_CMD "mkdir -p $REMOTE_PROJECT"

    rsync -avz --progress \
        --exclude='.git' \
        --exclude='.venv' \
        --exclude='venv' \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='node_modules' \
        --exclude='data/' \
        --exclude='*.zip' \
        --exclude='*.pt' \
        --exclude='*.bin' \
        --exclude='*.safetensors' \
        --exclude='checkpoint-*' \
        -e "ssh -i $PEM_KEY -o StrictHostKeyChecking=no" \
        "$ZOLOAI_ROOT/" \
        "$AWS_USER@$AWS_IP:$REMOTE_PROJECT/"

    ok "Code pushed to $REMOTE_PROJECT"

    # Install Python deps
    info "Installing Python dependencies..."
    $SSH_CMD "
        cd $REMOTE_PROJECT
        source .venv/bin/activate
        pip install -q -e \".[full]\" 2>&1 | tail -5
        echo '✓ Dependencies installed'
    "
}

# ─── Push: Data (large files) ──────────────────────────────────────────────
push_data() {
    info "Pushing data to server..."
    verify_connection

    # Push only essential data (not the full 6.2GB corpus)
    $SSH_CMD "mkdir -p $REMOTE_PROJECT/data/{raw,processed,training,external}"

    # Push Bible sources
    if [ -d "$ZOLOAI_ROOT/data/raw/bibles" ]; then
        info "Pushing Bible sources..."
        rsync -avz --progress \
            -e "ssh -i $PEM_KEY -o StrictHostKeyChecking=no" \
            "$ZOLOAI_ROOT/data/raw/bibles/" \
            "$AWS_USER@$AWS_IP:$REMOTE_PROJECT/data/raw/bibles/"
    fi

    # Push lesson PDFs
    if [ -d "$ZOLOAI_ROOT/data/external/lessons" ]; then
        info "Pushing lesson PDFs..."
        rsync -avz --progress \
            -e "ssh -i $PEM_KEY -o StrictHostKeyChecking=no" \
            "$ZOLOAI_ROOT/data/external/lessons/" \
            "$AWS_USER@$AWS_IP:$REMOTE_PROJECT/data/external/lessons/"
    fi

    # Push processed Bible JSONL
    if [ -d "$ZOLOAI_ROOT/data/processed/bible" ]; then
        info "Pushing processed Bible data..."
        rsync -avz --progress \
            -e "ssh -i $PEM_KEY -o StrictHostKeyChecking=no" \
            "$ZOLOAI_ROOT/data/processed/bible/" \
            "$AWS_USER@$AWS_IP:$REMOTE_PROJECT/data/processed/bible/"
    fi

    ok "Data pushed to server"
}

# ─── Pull: Download cleaned data from server ───────────────────────────────
pull_data() {
    info "Pulling data from server..."
    verify_connection

    $SSH_CMD "mkdir -p $REMOTE_PROJECT/data/{processed,training}"

    # Pull processed data
    rsync -avz --progress \
        -e "ssh -i $PEM_KEY -o StrictHostKeyChecking=no" \
        "$AWS_USER@$AWS_IP:$REMOTE_PROJECT/data/processed/" \
        "$ZOLOAI_ROOT/data/processed/"

    # Pull training data
    rsync -avz --progress \
        -e "ssh -i $PEM_KEY -o StrictHostKeyChecking=no" \
        "$AWS_USER@$AWS_IP:$REMOTE_PROJECT/data/training/" \
        "$ZOLOAI_ROOT/data/training/"

    ok "Data pulled from server"
}

# ─── Run: Execute pipeline on server ───────────────────────────────────────
run_pipeline() {
    local stage="${1:-status}"
    info "Running pipeline on server: $stage"
    verify_connection

    $SSH_CMD "
        cd $REMOTE_PROJECT
        source .venv/bin/activate
        bash scripts/kaggle-pipeline.sh --stage $stage
    "
}

# ─── Status: Check server ──────────────────────────────────────────────────
check_status() {
    info "Server status for $AWS_IP..."
    verify_connection

    $SSH_CMD "
        echo '=== SERVER STATUS ==='
        echo ''
        echo 'Uptime:'
        uptime
        echo ''
        echo 'Disk:'
        df -h /
        echo ''
        echo 'RAM:'
        free -h
        echo ''
        echo 'Swap:'
        swapon --show 2>/dev/null || echo 'No swap'
        echo ''
        echo 'Project size:'
        du -sh $REMOTE_PROJECT 2>/dev/null || echo 'Not deployed yet'
        echo ''
        echo 'Data sizes:'
        du -sh $REMOTE_PROJECT/data/* 2>/dev/null || echo 'No data'
        echo ''
        echo 'Python venv:'
        ls -la $REMOTE_PROJECT/.venv/bin/python 2>/dev/null || echo 'No venv'
        echo ''
        echo 'Kaggle auth:'
        ls -la ~/.kaggle/kaggle.json 2>/dev/null || echo 'Not configured'
        echo ''
        echo 'OpenClaw:'
        ls -la $REMOTE_OPENCLAW/openclaw.json 2>/dev/null || echo 'Not configured'
    "
}

# ─── SSH: Open session ─────────────────────────────────────────────────────
open_ssh() {
    info "Opening SSH session to $AWS_IP..."
    ssh -i "$PEM_KEY" -o StrictHostKeyChecking=no "$AWS_USER@$AWS_IP"
}

# ─── Deploy OpenClaw to server ─────────────────────────────────────────────
deploy_openclaw() {
    info "Deploying OpenClaw to server..."
    verify_connection

    # Create OpenClaw directory
    $SSH_CMD "mkdir -p $REMOTE_OPENCLAW"

    # Copy OpenClaw config (exclude large files, node_modules)
    rsync -avz --progress \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='workspace-guest/zolai' \
        --exclude='workspace-guest/Datasets' \
        --exclude='workspace/colab_venv' \
        --exclude='workspace/kaggle_master_upload' \
        --exclude='workspace/kaggle_outputs' \
        -e "ssh -i $PEM_KEY -o StrictHostKeyChecking=no" \
        "$HOME/.openclaw/" \
        "$AWS_USER@$AWS_IP:$REMOTE_OPENCLAW/"

    # Update paths in openclaw.json for server
    $SSH_CMD "
        python3 -c \"
import json
with open('$REMOTE_OPENCLAW/openclaw.json', 'r') as f:
    cfg = json.load(f)

# Update workspace paths
for agent in cfg.get('agents', {}).get('list', []):
    ws = agent.get('workspace', '')
    if '/path/to/zolai/' in ws:
        agent['workspace'] = ws.replace('/path/to/zolai/', '$AWS_HOME/')
    agent_dir = agent.get('agentDir', '')
    if '/path/to/zolai/' in agent_dir:
        agent['agentDir'] = agent_dir.replace('/path/to/zolai/', '$AWS_HOME/')

# Gateway: bind to all interfaces
cfg['gateway']['bind'] = '0.0.0.0'
cfg['gateway']['mode'] = 'remote'

with open('$REMOTE_OPENCLAW/openclaw.json', 'w') as f:
    json.dump(cfg, f, indent=2)
print('✓ openclaw.json updated for server')
\"
    "

    # Install npm deps
    $SSH_CMD "
        cd $REMOTE_OPENCLAW
        npm install 2>&1 | tail -3
        echo '✓ OpenClaw npm deps installed'
    "

    ok "OpenClaw deployed to $REMOTE_OPENCLAW"
}

# ─── Main ──────────────────────────────────────────────────────────────────
ACTION="${1:-help}"

case "$ACTION" in
    --setup|-s)        setup_server ;;
    --push-code|-pc)   push_code ;;
    --push-data|-pd)   push_data ;;
    --pull-data|-pl)   pull_data ;;
    --run|-r)          run_pipeline "${2:-status}" ;;
    --status)          check_status ;;
    --ssh)             open_ssh ;;
    --deploy-openclaw) deploy_openclaw ;;
    --help|-h|help)
        echo "Usage: $0 {--setup|--push-code|--push-data|--pull-data|--run|--status|--ssh|--deploy-openclaw}"
        echo ""
        echo "  --setup           First-time server setup (packages, swap, firewall)"
        echo "  --push-code       Push code to server (fast, excludes data)"
        echo "  --push-data       Push data to server (Bible, PDFs, processed)"
        echo "  --pull-data       Pull cleaned data from server"
        echo "  --run [stage]     Run pipeline on server (collect/upload-clean/download-merge/train/full/status)"
        echo "  --status          Check server status"
        echo "  --ssh             Open SSH session"
        echo "  --deploy-openclaw Deploy OpenClaw to server"
        ;;
    *)
        err "Unknown action: $ACTION"
        echo "Usage: $0 {--setup|--push-code|--push-data|--pull-data|--run|--status|--ssh|--deploy-openclaw}"
        exit 1
        ;;
esac

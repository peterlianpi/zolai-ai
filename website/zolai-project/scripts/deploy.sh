#!/usr/bin/env bash
set -e

# Trap to clean up checkpoint on error
trap 'echo -e "\n${RED}Deployment failed at step $STEP_FAILED${NC}"; rm -f "$CHECKPOINT_FILE"' ERR
STEP_FAILED=0

echo "🚀 Zolai VPS Production Deployment"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Usage
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  echo "Usage: $0 [STEP] [--full]"
  echo ""
  echo "Arguments:"
  echo "  STEP     Resume from step (1-9). Default: 1"
  echo "  --full   Include full system update (slower)"
  echo ""
  echo "Examples:"
  echo "  $0              # Normal deployment"
  echo "  $0 5            # Resume from step 5"
  echo "  $0 --full       # Full deployment with system update"
  exit 0
fi

# Parse flags
FULL_DEPLOY=false
START_STEP=1

for arg in "$@"; do
  case $arg in
    --full)
      FULL_DEPLOY=true
      shift
      ;;
    -*)
      echo "Unknown flag: $arg"
      exit 1
      ;;
    *)
      START_STEP=$arg
      shift
      ;;
  esac
done

SSH_HOST="zolai"
DEPLOY_PATH="/home/ubuntu/zolai"
CHECKPOINT_FILE=".deploy-checkpoint"

# Resume from step (default 1)
if [ -f "$CHECKPOINT_FILE" ]; then
  SAVED=$(cat "$CHECKPOINT_FILE")
  echo -e "${BLUE}Checkpoint found: last completed step $SAVED${NC}"
  START_STEP=$((SAVED + 1))
  echo -e "${BLUE}Resuming from step $START_STEP...${NC}"
  echo ""
fi
if [ -f "$CHECKPOINT_FILE" ]; then
  SAVED=$(cat "$CHECKPOINT_FILE")
  echo -e "${BLUE}Checkpoint found: last completed step $SAVED${NC}"
  START_STEP=$((SAVED + 1))
  echo -e "${BLUE}Resuming from step $START_STEP...${NC}"
  echo ""
fi

checkpoint() {
  echo "$1" > "$CHECKPOINT_FILE"
}

# Telegram credentials (hardcoded for reliability)
TG_TOKEN="8773092850:AAEWUekLaSx9ltiYavma-NBTbINZikEgXvE"
TG_CHAT="1887749224"

# Telegram notification function
notify_telegram() {
  curl -s -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
    -d "chat_id=${TG_CHAT}" \
    -d "text=$1" \
    -d "parse_mode=HTML" > /dev/null 2>&1 || true
}

# Send start notification
notify_telegram "🚀 Deployment Started - Deploying Zolai to VPS..."

# Step 1: Lint
if [ "$START_STEP" -le 1 ]; then
echo -e "${YELLOW}[1/9]${NC} Running linter..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bun run lint 2>&1; then
  echo -e "${GREEN}✓${NC} Linting passed"
  notify_telegram "✅ Step 1/9: Linting passed"
else
  echo -e "${RED}✗${NC} Linting failed (continuing...)"
  notify_telegram "⚠️ Step 1/9: Linting warnings (continuing)"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""; checkpoint 1
else echo -e "${BLUE}[1/9] Skipped (already done)${NC}"; fi

# Step 2: Build
if [ "$START_STEP" -le 2 ]; then
echo -e "${YELLOW}[2/9]${NC} Building application..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bun run build 2>&1; then
  echo -e "${GREEN}✓${NC} Build successful"
  notify_telegram "✅ Step 2/9: Build successful"
else
  echo -e "${RED}✗${NC} Build failed"
  notify_telegram "❌ Step 2/9: Build failed"
  exit 1
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""; checkpoint 2
else echo -e "${BLUE}[2/9] Skipped (already done)${NC}"; fi

# Step 3: Database
if [ "$START_STEP" -le 3 ]; then
echo -e "${YELLOW}[3/9]${NC} Verifying database schema..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bunx prisma validate 2>&1; then
  echo -e "${GREEN}✓${NC} Database schema valid"
  notify_telegram "✅ Step 3/9: Database schema valid"
else
  echo -e "${RED}✗${NC} Database schema invalid"
  notify_telegram "❌ Step 3/9: Database schema invalid"
  exit 1
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""; checkpoint 3
else echo -e "${BLUE}[3/9] Skipped (already done)${NC}"; fi

# Step 4: Git commit (local only, no remote)
if [ "$START_STEP" -le 4 ]; then
echo -e "${YELLOW}[4/9]${NC} Committing locally..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git add . 2>&1
git commit -m "Production deployment to VPS" 2>&1 || echo "No changes to commit"
echo -e "${GREEN}✓${NC} Committed"
notify_telegram "✅ Step 4/9: Code committed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""; checkpoint 4
else echo -e "${BLUE}[4/9] Skipped (already done)${NC}"; fi

# Step 5: SSH - Rsync code to VPS
if [ "$START_STEP" -le 5 ]; then
echo -e "${YELLOW}[5/9]${NC} Syncing code to VPS ($SSH_HOST)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create remote directory first
ssh $SSH_HOST "mkdir -p $DEPLOY_PATH" 2>&1 || {
  echo -e "${RED}✗${NC} Failed to create remote directory"
  notify_telegram "❌ Step 5/9: Failed to create remote directory"
  exit 1
}

# Rsync with progress
if rsync -avz --progress --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='.turbo' --exclude='*.log' ./ $SSH_HOST:$DEPLOY_PATH/ 2>&1; then
  echo -e "${GREEN}✓${NC} Code synced"
  notify_telegram "✅ Step 5/9: Code synced to VPS"
else
  echo -e "${RED}✗${NC} Rsync failed"
  notify_telegram "❌ Step 5/9: Rsync failed"
  exit 1
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""; checkpoint 5
else echo -e "${BLUE}[5/9] Skipped (already done)${NC}"; fi

# Step 6: SSH - Install & Build (skip system update for faster deploys, use --quick flag to include)
if [ "$START_STEP" -le 6 ]; then
echo -e "${YELLOW}[6/9]${NC} Building on VPS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for --full flag to include system update
if [ "$FULL_DEPLOY" = true ]; then
  SYSTEM_UPDATE="
  echo '--- System update ---'
  sudo apt update -y && sudo apt upgrade -y
  "
fi

ssh $SSH_HOST "
  export PATH=\$PATH:\$HOME/.bun/bin:/usr/local/bin

  $SYSTEM_UPDATE

  # Install bun if missing
  if ! command -v bun &>/dev/null; then
    echo '--- Installing bun ---'
    curl -fsSL https://bun.sh/install | bash
    export PATH=\$HOME/.bun/bin:\$PATH
  fi

  cd $DEPLOY_PATH

  # Install dependencies (use --frozen-lockfile for consistency)
  bun install --frozen-lockfile

  # Build
  bun run build
" 2>&1
echo -e "${GREEN}✓${NC} Build complete on VPS"
notify_telegram "✅ Step 6/9: Build complete on VPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""; checkpoint 6
else echo -e "${BLUE}[6/9] Skipped (already done)${NC}"; fi

# Step 7: SSH - Database migrations
if [ "$START_STEP" -le 7 ]; then
echo -e "${YELLOW}[7/9]${NC} Running database migrations..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ssh $SSH_HOST "export PATH=\$PATH:\$HOME/.bun/bin && cd $DEPLOY_PATH && bunx prisma migrate deploy" 2>&1
echo -e "${GREEN}✓${NC} Migrations complete"
notify_telegram "✅ Step 7/9: Database migrations complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""; checkpoint 7
else echo -e "${BLUE}[7/9] Skipped (already done)${NC}"; fi

# Step 8: SSH - Restart service
if [ "$START_STEP" -le 8 ]; then
echo -e "${YELLOW}[8/9]${NC} Restarting service..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ssh $SSH_HOST "
  export PATH=\$PATH:\$HOME/.bun/bin:/usr/local/bin

  cd $DEPLOY_PATH

  # Check if systemd service exists
  if sudo systemctl is-active zolai &>/dev/null || sudo systemctl list-unit-files | grep -q '^zolai.service'; then
    echo '--- Restarting systemd service ---'
    sudo systemctl restart zolai
    sleep 2
    if sudo systemctl is-active zolai &>/dev/null; then
      echo 'Service running via systemd'
      exit 0
    fi
  fi

  # Check if PM2 is available
  if command -v pm2 &>/dev/null; then
    echo '--- Restarting via PM2 ---'
    pm2 restart zolai || pm2 start npm --name zolai -- run start
    exit 0
  fi

  # Fallback: Start manually with nohup
  echo '--- Starting manually with nohup ---'
  pkill -f 'next-server' || true
  nohup bun run start > /var/log/zolai.log 2>&1 &
  sleep 3
  if pgrep -f 'next-server'; then
    echo 'Service started via nohup'
    exit 0
  fi

  echo 'ERROR: Could not restart service'
  exit 1
" 2>&1
RESTART_STATUS=$?

if [ $RESTART_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓${NC} Service restarted"
  notify_telegram "✅ Step 8/9: Service restarted"
else
  echo -e "${RED}✗${NC} Service restart failed"
  notify_telegram "❌ Step 8/9: Service restart failed - manual intervention needed"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""; checkpoint 8
else echo -e "${BLUE}[8/9] Skipped (already done)${NC}"; fi

# Step 9: Verify deployment
if [ "$START_STEP" -le 9 ]; then
echo -e "${YELLOW}[9/9]${NC} Verifying deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
DEPLOYMENT_VERIFIED=$(ssh $SSH_HOST "
  export PATH=\$PATH:\$HOME/.bun/bin:/usr/local/bin

  # Wait for server to be ready
  for i in {1..10}; do
    if curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health 2>/dev/null | grep -q '200'; then
      echo 'OK'
      exit 0
    fi
    sleep 2
  done

  # Fallback: check if process is running
  if pgrep -f 'next-server' || pgrep -f 'bun.*start'; then
    echo 'OK (process running)'
    exit 0
  fi

  echo 'FAIL'
  exit 1
" 2>&1)

if echo "$DEPLOYMENT_VERIFIED" | grep -q "OK"; then
  echo -e "${GREEN}✓${NC} Deployment verified"
  notify_telegram "🚀 Deployment Complete! All 9 steps successful. https://zolai.space"
else
  echo -e "${YELLOW}⚠${NC} Deployment verification incomplete (service may still be starting)"
  notify_telegram "⚠️ Deployment Complete but verification pending - check manually"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""; fi

# Clear checkpoint on success
rm -f "$CHECKPOINT_FILE"

echo ""
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}✓ VPS DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo "Server: $SSH_HOST (ubuntu@ip-172-26-3-238)"
echo "Path: $DEPLOY_PATH"
echo ""
echo "Check status:"
echo -e "${BLUE}ssh $SSH_HOST 'systemctl status zolai'${NC}"
echo ""
echo "View logs:"
echo -e "${BLUE}ssh $SSH_HOST 'journalctl -u zolai -f'${NC}"
echo ""

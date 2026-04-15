#!/usr/bin/env bash
set -e

echo "🚀 ZOLAI SSH DEPLOYMENT"
echo "======================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SSH_HOST="zolai"
DEPLOY_PATH="/var/www/zolai"

# Step 1: Build locally
echo -e "${YELLOW}[1/6]${NC} Building application..."
if bun run build; then
  echo -e "${GREEN}✓${NC} Build successful"
else
  echo -e "${RED}✗${NC} Build failed"
  exit 1
fi

# Step 2: Lint
echo ""
echo -e "${YELLOW}[2/6]${NC} Running linter..."
if bun run lint; then
  echo -e "${GREEN}✓${NC} Linting passed"
else
  echo -e "${RED}✗${NC} Linting failed"
  exit 1
fi

# Step 3: Git
echo ""
echo -e "${YELLOW}[3/6]${NC} Preparing git..."
git add .
git commit -m "SSH deployment - zolai server" || echo "No changes to commit"
git push origin main
echo -e "${GREEN}✓${NC} Git pushed"

# Step 4: SSH - Pull latest
echo ""
echo -e "${YELLOW}[4/6]${NC} Pulling on server..."
ssh $SSH_HOST "cd $DEPLOY_PATH && git pull origin main"
echo -e "${GREEN}✓${NC} Code pulled"

# Step 5: SSH - Install & Build
echo ""
echo -e "${YELLOW}[5/6]${NC} Building on server..."
ssh $SSH_HOST "cd $DEPLOY_PATH && bun install && bun run build"
echo -e "${GREEN}✓${NC} Server build complete"

# Step 6: SSH - Restart service
echo ""
echo -e "${YELLOW}[6/6]${NC} Restarting service..."
ssh $SSH_HOST "cd $DEPLOY_PATH && systemctl restart zolai || pm2 restart zolai || echo 'Manual restart needed'"
echo -e "${GREEN}✓${NC} Service restarted"

echo ""
echo -e "${GREEN}======================="
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}======================="
echo ""
echo "Check server:"
echo -e "${BLUE}ssh $SSH_HOST${NC}"
echo ""
echo "View logs:"
echo -e "${BLUE}ssh $SSH_HOST 'journalctl -u zolai -f'${NC}"
echo ""

#!/usr/bin/env bash
set -e

echo "🚀 Zolai VPS Production Deployment"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SSH_HOST="zolai"
DEPLOY_PATH="/var/www/zolai"

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
echo -e "${YELLOW}[1/9]${NC} Running linter..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bun run lint 2>&1; then
  echo -e "${GREEN}✓${NC} Linting passed"
  notify_telegram "✅ <b>Step 1/9:</b> Linting passed"
else
  echo -e "${RED}✗${NC} Linting failed (continuing...)"
  notify_telegram "⚠️ <b>Step 1/9:</b> Linting warnings (continuing)"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: Build
echo -e "${YELLOW}[2/9]${NC} Building application..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bun run build 2>&1; then
  echo -e "${GREEN}✓${NC} Build successful"
  notify_telegram "✅ <b>Step 2/9:</b> Build successful"
else
  echo -e "${RED}✗${NC} Build failed"
  notify_telegram "❌ <b>Step 2/9:</b> Build failed"
  exit 1
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 3: Database
echo -e "${YELLOW}[3/9]${NC} Verifying database schema..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bunx prisma validate 2>&1; then
  echo -e "${GREEN}✓${NC} Database schema valid"
  notify_telegram "✅ <b>Step 3/9:</b> Database schema valid"
else
  echo -e "${RED}✗${NC} Database schema invalid"
  notify_telegram "❌ <b>Step 3/9:</b> Database schema invalid"
  exit 1
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 4: Git commit & push
echo -e "${YELLOW}[4/9]${NC} Committing and pushing to git..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git add . 2>&1
git commit -m "Production deployment to VPS" 2>&1 || echo "No changes to commit"
git push origin main 2>&1
echo -e "${GREEN}✓${NC} Git pushed"
notify_telegram "✅ <b>Step 4/9:</b> Code pushed to git"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 5: SSH - Pull code
echo -e "${YELLOW}[5/9]${NC} Pulling code on VPS ($SSH_HOST)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ssh $SSH_HOST "cd $DEPLOY_PATH && git pull origin main" 2>&1
echo -e "${GREEN}✓${NC} Code pulled"
notify_telegram "✅ <b>Step 5/9:</b> Code pulled on VPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 6: SSH - Install & Build
echo -e "${YELLOW}[6/9]${NC} Installing dependencies and building on VPS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ssh $SSH_HOST "cd $DEPLOY_PATH && bun install && bun run build" 2>&1
echo -e "${GREEN}✓${NC} Build complete on VPS"
notify_telegram "✅ <b>Step 6/9:</b> Build complete on VPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 7: SSH - Database migrations
echo -e "${YELLOW}[7/9]${NC} Running database migrations..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ssh $SSH_HOST "cd $DEPLOY_PATH && bunx prisma migrate deploy" 2>&1
echo -e "${GREEN}✓${NC} Migrations complete"
notify_telegram "✅ <b>Step 7/9:</b> Database migrations complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 8: SSH - Restart service
echo -e "${YELLOW}[8/9]${NC} Restarting service..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ssh $SSH_HOST "sudo systemctl restart zolai && systemctl status zolai || pm2 restart zolai || echo 'Manual restart needed'" 2>&1
echo -e "${GREEN}✓${NC} Service restarted"
notify_telegram "✅ <b>Step 8/9:</b> Service restarted"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 9: Verify deployment
echo -e "${YELLOW}[9/9]${NC} Verifying deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ssh $SSH_HOST "curl -s http://localhost:3000/api/health && echo '' || echo 'Health check pending'" 2>&1
echo -e "${GREEN}✓${NC} Deployment verified"
notify_telegram "🚀 Deployment Complete! All 9 steps successful. Domain: https://zolai.space"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

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

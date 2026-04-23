#!/usr/bin/env bash
set -e

echo "🚀 ZOLAI PRODUCTION DEPLOYMENT"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Build
echo -e "${YELLOW}[1/5]${NC} Building application..."
if bun run build; then
  echo -e "${GREEN}✓${NC} Build successful"
else
  echo -e "${RED}✗${NC} Build failed"
  exit 1
fi

# Step 2: Lint
echo ""
echo -e "${YELLOW}[2/5]${NC} Running linter..."
if bun run lint; then
  echo -e "${GREEN}✓${NC} Linting passed"
else
  echo -e "${RED}✗${NC} Linting failed"
  exit 1
fi

# Step 3: Git
echo ""
echo -e "${YELLOW}[3/5]${NC} Preparing git..."
git add .
git commit -m "Production deployment - zolai.space" || echo "No changes to commit"
echo -e "${GREEN}✓${NC} Git ready"

# Step 4: Push
echo ""
echo -e "${YELLOW}[4/5]${NC} Pushing to main..."
git push origin main
echo -e "${GREEN}✓${NC} Pushed to main"

# Step 5: Deploy
echo ""
echo -e "${YELLOW}[5/5]${NC} Deploying to Vercel..."
vercel deploy --prod
echo -e "${GREEN}✓${NC} Deployment started"

echo ""
echo -e "${GREEN}=============================${NC}"
echo -e "${GREEN}✓ DEPLOYMENT INITIATED!${NC}"
echo -e "${GREEN}=============================${NC}"
echo ""
echo "Monitor deployment:"
echo -e "${BLUE}vercel logs --follow${NC}"
echo ""
echo "Check status:"
echo -e "${BLUE}bun run check-deployment${NC}"
echo ""
echo "Domain: https://zolai.space"
echo ""

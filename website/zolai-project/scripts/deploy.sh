#!/usr/bin/env bash
# scripts/deploy.sh — Zolai VPS deployment
# Usage: bash scripts/deploy.sh [--full] [--skip-build]
set -euo pipefail

SSH="zolai"
DEPLOY_PATH="/home/ubuntu/zolai"
TG_TOKEN="${TELEGRAM_BOT_TOKEN:-8773092850:AAEWUekLaSx9ltiYavma-NBTbINZikEgXvE}"
TG_CHAT="${TELEGRAM_CHAT_ID:-1887749224}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
FULL=false; SKIP_BUILD=false
for arg in "$@"; do
  case $arg in --full) FULL=true ;; --skip-build) SKIP_BUILD=true ;; esac
done

notify() {
  curl -s -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
    -d "chat_id=${TG_CHAT}&text=$1&parse_mode=HTML" > /dev/null 2>&1 || true
}
step() { echo -e "\n${YELLOW}[$1]${NC} $2"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

echo -e "${BLUE}🚀 Zolai Deploy${NC}"
notify "🚀 <b>Deploy started</b> by $(git config user.name 2>/dev/null || echo local)"

# 1. Lint
step "1/6" "Lint"
bun run lint && ok "Lint passed" || echo "Lint warnings (continuing)"

# 2. Local build check
if [ "$SKIP_BUILD" = false ]; then
  step "2/6" "Build check"
  bun run build && ok "Build OK" || fail "Build failed"
else
  step "2/6" "Build check (skipped)"
fi

# 3. Commit
step "3/6" "Commit"
git add -A
git diff --cached --quiet && echo "Nothing to commit" || git commit -m "deploy: $(date -u '+%Y-%m-%d %H:%M UTC')"
ok "Committed"

# 4. Rsync to VPS (exclude secrets and build artifacts)
step "4/6" "Sync to VPS"
rsync -az --delete \
  --exclude='.git' --exclude='node_modules' --exclude='.next' \
  --exclude='.env*' --exclude='*.log' --exclude='playwright-report' \
  ./ ${SSH}:${DEPLOY_PATH}/
ok "Synced"

# 5. Build on VPS
step "5/6" "Build on VPS"
ssh $SSH "
  export PATH=\$HOME/.bun/bin:\$PATH
  cd $DEPLOY_PATH
  bun install --frozen-lockfile
  $([ "$FULL" = true ] && echo 'rm -rf .next')
  bun run build
  bunx prisma migrate deploy
  sudo systemctl restart zolai
  sleep 5
  sudo systemctl is-active zolai
" && ok "VPS build & restart OK" || fail "VPS build failed"

# 6. Health check
step "6/6" "Health check"
sleep 10
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 https://zolai.space/ 2>/dev/null || echo "000")
if [ "$STATUS" = "200" ] || [ "$STATUS" = "307" ]; then
  ok "Site up (HTTP $STATUS)"
  notify "✅ <b>Deploy complete</b> — https://zolai.space"
else
  echo -e "${YELLOW}⚠${NC} HTTP $STATUS (may still be starting)"
  notify "⚠️ <b>Deploy done</b> but health check returned HTTP $STATUS"
fi

echo -e "\n${GREEN}Done!${NC} ssh $SSH 'journalctl -u zolai -f'"

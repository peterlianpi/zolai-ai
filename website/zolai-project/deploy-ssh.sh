#!/usr/bin/env bash
set -e

SSH_HOST="zolai"
DEPLOY_PATH="/home/ubuntu/zolai"
TG_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TG_CHAT="${TELEGRAM_CHAT_ID:-}"

notify() {
  [ -n "$TG_TOKEN" ] && curl -s -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
    -d "chat_id=${TG_CHAT}&text=$1&parse_mode=HTML" > /dev/null || true
}

notify "🚀 <b>Deploy started</b>%0ABy: $(whoami)"

# 1. Sync code
echo "[1/4] Syncing code..."
rsync -az --delete \
  --exclude='.git' --exclude='node_modules' --exclude='.next' \
  --exclude='.env*' --exclude='*.log' --exclude='playwright-report' \
  --exclude='test-results' --exclude='tsconfig.tsbuildinfo' \
  ./ $SSH_HOST:$DEPLOY_PATH/
notify "✓ Code synced"

# 2. Sync env
echo "[2/4] Syncing env..."
scp .env.production $SSH_HOST:$DEPLOY_PATH/.env.production
notify "✓ Env synced"

# 3. Install, build, migrate
echo "[3/4] Building on server..."
notify "⏳ Building..."
ssh $SSH_HOST "
  export PATH=\$HOME/.bun/bin:\$PATH
  cd $DEPLOY_PATH
  set -a && source .env.production && set +a
  bun install --frozen-lockfile
  bun run build
  export \$(grep '^DATABASE_URL' .env.production | xargs)
  bunx prisma migrate deploy
"
notify "✓ Build complete"

# 4. Restart + health check
echo "[4/4] Restarting..."
ssh $SSH_HOST "sudo systemctl restart zolai && sleep 5 && sudo systemctl is-active zolai"

sleep 10
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 https://zolai.space/ || echo "000")
if [ "$STATUS" = "200" ]; then
  notify "✅ <b>Deploy SUCCESS</b>%0AHTTP $STATUS%0A🔗 https://zolai.space"
  echo "✓ Deployed — HTTP $STATUS"
else
  notify "❌ <b>Deploy FAILED</b>%0AHTTP $STATUS%0ALogs: <code>ssh $SSH_HOST journalctl -u zolai -n 50</code>"
  exit 1
fi

#!/usr/bin/env bash
# scripts/agents/db-agent.sh
# Runs DB maintenance: backup, check for orphaned records, report stats
set -euo pipefail

SSH="ssh zolai"
TG_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TG_CHAT="${TELEGRAM_CHAT_ID:-}"

notify() {
  [ -n "$TG_TOKEN" ] && curl -s -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
    -d "chat_id=${TG_CHAT}&text=$1&parse_mode=HTML" > /dev/null || true
}

# Run a DB stats query via the app's Prisma connection
STATS=$($SSH "
  export PATH=\$HOME/.bun/bin:\$PATH
  cd /home/ubuntu/zolai
  export \$(grep 'DATABASE_URL' .env.production | xargs)
  bunx prisma db execute --stdin <<'SQL'
SELECT
  (SELECT COUNT(*) FROM \"User\") AS users,
  (SELECT COUNT(*) FROM \"Session\") AS sessions,
  (SELECT COUNT(*) FROM \"ChatSession\") AS chat_sessions,
  (SELECT COUNT(*) FROM \"ChatMessage\") AS chat_messages,
  (SELECT COUNT(*) FROM \"UserProgress\") AS progress_records;
SQL
" 2>/dev/null || echo "DB query failed")

echo "$STATS"

# Clean up expired sessions (older than 30 days)
$SSH "
  export PATH=\$HOME/.bun/bin:\$PATH
  cd /home/ubuntu/zolai
  export \$(grep 'DATABASE_URL' .env.production | xargs)
  bunx prisma db execute --stdin <<'SQL'
DELETE FROM \"Session\" WHERE \"expiresAt\" < NOW() - INTERVAL '30 days';
SQL
" 2>/dev/null && echo "Expired sessions cleaned" || echo "Session cleanup skipped"

notify "📊 <b>DB Agent</b>%0A${STATS}"

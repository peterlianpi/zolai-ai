#!/usr/bin/env bash
# scripts/agents/health-agent.sh
# Run on VPS via cron: */5 * * * * /home/ubuntu/zolai/scripts/agents/health-agent.sh
# Also run from GitHub Actions for external monitoring
set -euo pipefail

TG_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TG_CHAT="${TELEGRAM_CHAT_ID:-}"
LOG="/tmp/zolai-health.log"
RUNNING_ON_VPS="${RUNNING_ON_VPS:-false}"

notify() {
  [ -n "$TG_TOKEN" ] && curl -s -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
    -d "chat_id=${TG_CHAT}&text=$1&parse_mode=HTML" > /dev/null 2>&1 || true
}
log() { echo "[$(date -u '+%H:%M:%S')] $*" | tee -a "$LOG"; }

# 1. HTTP check
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://zolai.space/ 2>/dev/null || echo "000")
log "HTTP $STATUS"

if [ "$STATUS" != "200" ] && [ "$STATUS" != "307" ] && [ "$STATUS" != "302" ]; then
  log "DOWN — attempting restart"
  notify "🚨 <b>Zolai DOWN</b> (HTTP $STATUS) — restarting..."

  if [ "$RUNNING_ON_VPS" = "true" ]; then
    sudo systemctl restart zolai
    sleep 10
    NEW=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://zolai.space/ 2>/dev/null || echo "000")
    if [ "$NEW" = "200" ] || [ "$NEW" = "307" ]; then
      notify "✅ <b>Zolai recovered</b> (HTTP $NEW)"
    else
      notify "❌ <b>Still down</b> after restart — manual fix needed"
    fi
  else
    notify "❌ <b>Zolai DOWN</b> — SSH to VPS and run: <code>sudo systemctl restart zolai</code>"
  fi
else
  log "OK"
fi

# 2. VPS metrics (only when running on VPS)
if [ "$RUNNING_ON_VPS" = "true" ]; then
  DISK=$(df / | awk 'NR==2{gsub(/%/,"",$5); print $5}')
  MEM=$(free | awk '/Mem:/{printf "%.0f", $3/$2*100}')
  [ "${DISK:-0}" -gt 85 ] && notify "⚠️ <b>Disk ${DISK}% full</b>"
  [ "${MEM:-0}" -gt 90 ]  && notify "⚠️ <b>Memory ${MEM}% used</b>"
fi

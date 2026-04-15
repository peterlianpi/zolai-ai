#!/usr/bin/env bash
# server-status.sh — Quick server health check
set -euo pipefail

SERVER="zolai"
SERVICE="zolai-next"
SITE="https://zolai.peterlianpi.site"

C='\033[0;36m'; G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; N='\033[0m'

echo -e "${C}━━ Server Status ━━${N}\n"

echo -e "${G}▶ Service Status:${N}"
ssh -T -o LogLevel=QUIET -o ConnectTimeout=10 "$SERVER" "systemctl is-active ${SERVICE}" 2>/dev/null || echo "  stopped"

echo -e "\n${G}▶ Resources:${N}"
ssh -T -o LogLevel=QUIET -o ConnectTimeout=10 "$SERVER" bash << 'EOF'
echo "  RAM:     $(free -h | awk '/^Mem:/ {print $3 " / " $2}')"
echo "  Swap:    $(free -h | awk '/^Swap:/ {print $3 " / " $2}')"
echo "  Disk:    $(df -h / | awk 'NR==2 {print $3 " / " $2 " (" $5 ")"}')"
echo "  Load:    $(uptime | awk -F'load average:' '{print $2}' | xargs)"
EOF

echo -e "\n${G}▶ Site Health:${N}"
HTTP=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 10 "$SITE/api/cron/health" 2>/dev/null || echo "000")
if [ "$HTTP" = "200" ]; then
  echo -e "  ${G}✓ HTTP $HTTP${N}"
else
  echo -e "  ${R}✗ HTTP $HTTP${N}"
fi

echo -e "\n${G}▶ Recent Errors (last 10):${N}"
ssh -T -o LogLevel=QUIET -o ConnectTimeout=10 "$SERVER" "sudo journalctl -u ${SERVICE} -n 10 --no-pager 2>/dev/null | grep -i error | tail -5" || echo "  none"

echo ""
#!/usr/bin/env bash
# monitor-server.sh — Continuous server monitoring with alerts
set -euo pipefail

SERVER="zolai"
SERVICE="zolai-next"
SITE="${NEXT_PUBLIC_APP_URL:-https://zolai.space}"
INTERVAL=${1:-30}  # Default 30 seconds

C='\033[0;36m'; G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; N='\033[0m'

echo -e "${C}╔══════════════════════════════════════╗${N}"
echo -e "${C}║     Zolai Server Monitor             ║${N}"
echo -e "${C}╚══════════════════════════════════════╝${N}"
echo "  Interval: ${INTERVAL}s | Press Ctrl+C to stop\n"

PREV_HTTP=""
PREV_MEM=""

while true; do
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  
  # Get system info
  SYS_INFO=$(ssh -T -o LogLevel=QUIET -o ConnectTimeout=5 "$SERVER" bash << 'EOF'
echo "$(free -m | awk '/^Mem:/ {printf "mem=%d/%d", $3, $2}')"
echo "$(df -BG / | awk 'NR==2 {print "disk="$4"G"}')"
echo "$(uptime | awk -F'load average:' '{print "load="$2}' | xargs | tr -d ',')"
echo "$(systemctl is-active zolai-next 2>/dev/null || echo 'stopped')"
EOF
)
  
  # Parse system info
  eval "$SYS_INFO"
  
  # Check health
  HTTP=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 8 "$SITE/api/cron/health" 2>/dev/null || echo "000")
  
  # Detect changes
  CHANGES=""
  if [ "$HTTP" != "$PREV_HTTP" ]; then
    CHANGES="${CHANGES}HTTP: ${PREV_HTTP}→${HTTP} "
  fi
  if [ "$mem" != "$PREV_MEM" ]; then
    CHANGES="${CHANGES}MEM: ${PREV_MEM}→${mem} "
  fi
  
  # Color based on status
  if [ "$HTTP" = "200" ]; then
    STATUS="${G}✓ OK${N}"
  else
    STATUS="${R}✗ FAIL${N}"
  fi
  
  # Display
  echo -e "[${TIMESTAMP}] ${STATUS} | HTTP:${HTTP} | ${mem} | disk:${disk} | load:${load} | svc:${is-active_zolai-next:-down}"
  
  if [ -n "$CHANGES" ]; then
    echo -e "  ${Y}▸ Changed:${N} ${CHANGES}"
  fi
  
  PREV_HTTP=$HTTP
  PREV_MEM=$mem
  
  sleep "$INTERVAL"
done
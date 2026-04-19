#!/usr/bin/env bash
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# server.sh — Zolai server automation
# Usage: ./scripts/deploy/server.sh [command]
#
# Commands:
#   ssh          Connect interactively
#   status       Check all services
#   restart      Restart nginx + openclaw + tunnel
#   logs         Tail all logs
#   deploy       Sync local files to server
#   backup       Pull server configs locally
#   health       Quick health check (no shell needed)

set -euo pipefail

HOST="zolai"
PEM="${PROJECT_ROOT}/config/ssh/aws-lightsail.pem"
REMOTE="$USER@<SERVER_IP>"
LOCAL_ROOT="${PROJECT_ROOT}"
BACKUP_DIR="$LOCAL_ROOT/config/server-backups"

ssh_run() { ssh "$HOST" "$@"; }

cmd="${1:-ssh}"

case "$cmd" in

  ssh)
    exec ssh "$HOST"
    ;;

  status)
    echo "=== Service Status ==="
    ssh_run bash <<'REMOTE'
      echo "--- nginx ---"
      sudo systemctl is-active nginx
      echo "--- openclaw ---"
      sudo systemctl is-active openclaw
      echo "--- cloudflared ---"
      ps aux | grep -c '[c]loudflared' && echo "running" || echo "stopped"
      echo "--- memory ---"
      free -h | grep Mem
      echo "--- disk ---"
      df -h / | tail -1
REMOTE
    ;;

  restart)
    echo "=== Restarting services ==="
    ssh_run bash <<'REMOTE'
      sudo systemctl restart nginx
      sudo systemctl restart openclaw
      echo "nginx: $(sudo systemctl is-active nginx)"
      echo "openclaw: $(sudo systemctl is-active openclaw)"
      curl -sf http://127.0.0.1:18789/health && echo "openclaw health: ok" || echo "openclaw health: not ready yet"
REMOTE
    ;;

  logs)
    echo "=== Live logs (Ctrl+C to stop) ==="
    ssh_run bash <<'REMOTE'
      tail -f \
        /home/$USER/.openclaw/openclaw.log \
        /tmp/cloudflared.log \
        /var/log/nginx/error.log \
        2>/dev/null
REMOTE
    ;;

  deploy-chat)
    echo "=== Deploying Zolai Chat Server ==="
    # Sync chat files
    rsync -avz -e "ssh -i $PEM" \
      "$LOCAL_ROOT/scripts/ui/chat_server.js" \
      "$LOCAL_ROOT/scripts/ui/chat_ui.html" \
      "$LOCAL_ROOT/scripts/ui/config.js" \
      "$REMOTE:${PROJECT_ROOT}/scripts/ui/"

    # Sync wiki for context search
    rsync -avz -e "ssh -i $PEM" \
      "$LOCAL_ROOT/wiki/" "$REMOTE:${PROJECT_ROOT}/wiki/"

    # Install service + nginx config + start
    scp -i "$PEM" "$LOCAL_ROOT/config/zolai-chat.service" "$REMOTE:/tmp/"
    scp -i "$PEM" "$LOCAL_ROOT/config/nginx/peterlianpi.site.conf" "$REMOTE:/tmp/peterlianpi.site"

    ssh_run bash <<'REMOTE'
      # Node.js — install if missing
      node --version 2>/dev/null || (curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs)

      # Create env file if missing
      [ -f /home/$USER/.zolai-chat.env ] || cat > /home/$USER/.zolai-chat.env <<'ENV'
GROQ_API_KEY=
GEMINI_API_KEY=
NVIDIA_API_KEY=
ENV

      # Create log dir + sessions dir
      mkdir -p ${PROJECT_ROOT}/logs ${PROJECT_ROOT}/scripts/ui/sessions

      # Install systemd service
      sudo mv /tmp/zolai-chat.service /etc/systemd/system/
      sudo systemctl daemon-reload
      sudo systemctl enable zolai-chat
      sudo systemctl restart zolai-chat
      echo "chat: $(sudo systemctl is-active zolai-chat)"

      # Install nginx config
      sudo mv /tmp/peterlianpi.site /etc/nginx/sites-available/peterlianpi.site
      sudo nginx -t && sudo systemctl reload nginx
      echo "nginx: reloaded"
REMOTE
    echo ""
    echo "✅ Live at: http://peterlianpi.site/chat/"
    echo "   Edit API keys: ssh zolai 'nano /home/$USER/.zolai-chat.env && sudo systemctl restart zolai-chat'"
    ;;

  chat-logs)
    ssh_run "tail -f ${PROJECT_ROOT}/logs/chat_server.log"
    ;;

  chat-status)
    ssh_run "sudo systemctl status zolai-chat --no-pager"
    ;;

  deploy)
    echo "=== Deploying wiki + scripts to server ==="
    rsync -avz --progress \
      -e "ssh -i $PEM" \
      --exclude='.venv' --exclude='__pycache__' --exclude='*.pyc' \
      --exclude='data/' --exclude='runs/' --exclude='kaggle_bundle.zip' \
      "$LOCAL_ROOT/wiki/" "$REMOTE:${PROJECT_ROOT}/wiki/"
    rsync -avz --progress \
      -e "ssh -i $PEM" \
      "$LOCAL_ROOT/scripts/" "$REMOTE:${PROJECT_ROOT}/scripts/"
    echo "Deploy done."
    ;;

  backup)
    echo "=== Pulling server configs ==="
    mkdir -p "$BACKUP_DIR"
    DATE=$(date +%Y%m%d)
    scp "$HOST:/home/$USER/.openclaw/openclaw.json" "$BACKUP_DIR/openclaw-$DATE.json" 2>/dev/null && echo "openclaw.json backed up" || echo "openclaw.json not found"
    scp "$HOST:/etc/nginx/sites-available/peterlianpi.site" "$BACKUP_DIR/nginx-$DATE.conf" 2>/dev/null && echo "nginx.conf backed up" || echo "nginx.conf not found"
    echo "Backups saved to $BACKUP_DIR/"
    ;;

  health)
    echo "=== Health Check ==="
    ssh_run bash <<'REMOTE'
      echo -n "nginx:     "; sudo systemctl is-active nginx
      echo -n "openclaw:  "; sudo systemctl is-active openclaw
      echo -n "cloudflared: "; ps aux | grep -c '[c]loudflared' > /dev/null && echo "running" || echo "stopped"
      echo -n "openclaw API: "; curl -sf http://127.0.0.1:18789/health && echo "ok" || echo "unreachable"
      echo -n "port 80:   "; ss -tlnp | grep -q ':80' && echo "open" || echo "closed"
      echo "memory:"; free -h | grep Mem
REMOTE
    ;;

  tgbot-install)
    echo "=== Installing Telegram bot on server ==="
    scp "$LOCAL_ROOT/scripts/deploy/telegram_bot.py" "$REMOTE:${PROJECT_ROOT}/scripts/deploy/"
    scp "$LOCAL_ROOT/config/zolai-telegram-bot.service" "$REMOTE:/tmp/"
    ssh_run bash <<'REMOTE'
      pip install "python-telegram-bot>=20" --quiet
      sudo mv /tmp/zolai-telegram-bot.service /etc/systemd/system/
      sudo systemctl daemon-reload
      sudo systemctl enable zolai-telegram-bot
      echo "Bot installed. Now create /home/$USER/.zolai-bot.env with:"
      echo "  TELEGRAM_BOT_TOKEN=your_token"
      echo "  TELEGRAM_CHAT_ID=your_chat_id"
      echo "Then: sudo systemctl start zolai-telegram-bot"
REMOTE
    ;;

  tgbot-start)
    ssh_run "sudo systemctl start zolai-telegram-bot && sudo systemctl is-active zolai-telegram-bot"
    ;;

  tgbot-status)
    ssh_run "sudo systemctl status zolai-telegram-bot --no-pager && tail -10 /home/$USER/.openclaw/telegram_bot.log"
    ;;

  *)
    echo "Usage: $0 {ssh|status|restart|logs|deploy|deploy-chat|chat-logs|chat-status|backup|health|tgbot-install|tgbot-start|tgbot-status}"
    exit 1
    ;;
esac

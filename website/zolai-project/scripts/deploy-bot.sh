#!/bin/bash
# Deploy Zolai Telegram bot to VPS

set -e

VPS_USER="ubuntu"
VPS_HOST="zolai"  # uses ~/.ssh/config alias
VPS_DIR="/home/ubuntu/zolai"
BOT_SERVICE="zolai-bot"

echo "🚀 Deploying Zolai Telegram Bot to VPS..."

# Copy bot script
echo "📦 Copying bot script..."
scp scripts/zolai-bot.ts ${VPS_HOST}:${VPS_DIR}/scripts/

# Copy systemd service
echo "⚙️ Installing systemd service..."
ssh ${VPS_HOST} "sudo tee /etc/systemd/system/${BOT_SERVICE}.service > /dev/null" <<'EOF'
[Unit]
Description=Zolai Telegram Bot
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/zolai
Environment="PATH=/home/ubuntu/.bun/bin:/usr/local/bin:/usr/bin:/bin"
EnvironmentFile=/home/ubuntu/zolai/.env.production
ExecStart=/home/ubuntu/.bun/bin/bun scripts/zolai-bot.ts
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload and start
echo "🔄 Starting bot service..."
ssh ${VPS_HOST} <<'REMOTE'
sudo systemctl daemon-reload
sudo systemctl enable zolai-bot
sudo systemctl restart zolai-bot
sleep 2
sudo systemctl status zolai-bot --no-pager
REMOTE

echo "✅ Bot deployed! Check status: ssh ubuntu@13.115.84.100 'sudo systemctl status zolai-bot'"
echo "📋 View logs: ssh ubuntu@13.115.84.100 'sudo journalctl -u zolai-bot -f'"

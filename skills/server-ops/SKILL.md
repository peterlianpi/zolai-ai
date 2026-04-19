# Skill: Server Operations (AWS Lightsail)
# Triggers: "connect to server", "check server", "restart server", "deploy to server", "server logs", "server health", "server backup"
# Version: 1.0.0

## Purpose
Manage the Zolai AWS Lightsail server (13.115.84.100 / peterlianpi.site) — connect, monitor, restart services, deploy files, and pull backups.

## Quick Connect
```bash
ssh zolai                          # interactive shell (SSH config alias)
```

## Commands
```bash
# All via the automation script:
./scripts/deploy/server.sh ssh      # connect
./scripts/deploy/server.sh health   # one-shot health check
./scripts/deploy/server.sh status   # full service + memory + disk
./scripts/deploy/server.sh restart  # restart nginx + openclaw
./scripts/deploy/server.sh logs     # live tail all logs
./scripts/deploy/server.sh deploy   # rsync wiki + scripts to server
./scripts/deploy/server.sh backup   # pull openclaw.json + nginx.conf locally
```

## Services
| Service | Port | Check |
|---------|------|-------|
| nginx | 80 | `sudo systemctl is-active nginx` |
| openclaw | 18789 | `curl http://127.0.0.1:18789/health` |
| cloudflared | — | `ps aux | grep cloudflared` |

## SSH Config (local ~/.ssh/config)
```
Host zolai
    HostName 13.115.84.100
    User ubuntu
    IdentityFile /home/peter/Documents/Projects/zolai/config/ssh/aws-lightsail.pem
    ServerAliveInterval 60
```

## Key Paths (on server)
- OpenClaw config: `~/.openclaw/openclaw.json`
- OpenClaw log: `~/.openclaw/openclaw.log`
- Nginx config: `/etc/nginx/sites-available/peterlianpi.site`
- Nginx log: `/var/log/nginx/error.log`
- Cloudflare tunnel log: `/tmp/cloudflared.log`
- Zolai project: `/home/ubuntu/zolai/`

## Telegram Bot Control
Bot file: `scripts/deploy/telegram_bot.py`
Service: `config/zolai-telegram-bot.service`

### One-time setup on server
```bash
# 1. Get bot token from @BotFather on Telegram
# 2. Get your chat ID from @userinfobot on Telegram
# 3. Install and start:
./scripts/deploy/server.sh tgbot-install
ssh zolai "echo 'TELEGRAM_BOT_TOKEN=xxx\nTELEGRAM_CHAT_ID=yyy' > ~/.zolai-bot.env"
./scripts/deploy/server.sh tgbot-start
```

### Bot commands (send from Telegram)
| Command | Action |
|---------|--------|
| `/health` | Service status + memory |
| `/restart` | Restart nginx + openclaw |
| `/logs` | Last 10 lines of all logs |
| `/stats` | Dataset record counts |
| `/deploy` | git pull + restart |
| `/run <cmd>` | Whitelisted shell command |
| `/help` | List all commands |


```bash
# nginx down
sudo systemctl restart nginx

# openclaw down
sudo systemctl restart openclaw

# cloudflared down — get token from backup first
nohup cloudflared tunnel run --token TOKEN > /tmp/cloudflared.log 2>&1 &

# memory pressure
pkill -9 -f 'opencode-ai'; echo 3 | sudo tee /proc/sys/vm/drop_caches
```

# Deploy

Server deployment scripts for the Telegram bot and chat server.

## Usage

```bash
# Deploy to server
bash scripts/deploy/server.sh deploy

# Check server health
bash scripts/deploy/server.sh health

# Restart services
bash scripts/deploy/server.sh restart
```

## Services

- `zolai-chat.service` — Chat API server
- `zolai-telegram-bot.service` — Telegram bot

See `config/` for systemd service files.

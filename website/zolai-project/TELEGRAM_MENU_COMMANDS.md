# 📱 ZOLAI TELEGRAM MENU COMMANDS

## Available Commands

### `/start`
Welcome message with available commands
```
🔒 Zolai Security Monitor

Available commands:
/status - System status
/deploy - Deployment status
/alerts - Recent alerts
/events - Security events
/help - Show help
```

### `/status`
Check system health
```
✅ System Status

Database: Connected
API: Running
Auth: Active
Notifications: Enabled
```

### `/deploy` ⭐ NEW
Check if project is deployed
```
🚀 Deployment Status: LIVE ✅

Domain: https://zolai.space
API: ✅ Responding
Database: ✅ Connected

All systems operational!
```

### `/alerts`
View recent security alerts
```
🚨 Recent Alerts

No critical alerts in the last 24 hours.
```

### `/events`
View security events
```
📊 Security Events (Last 24h)

• 0 Suspicious Logins
• 0 Account Lockouts
• 0 Device Revocations
• 0 Password Changes
```

### `/help`
Show help and features
```
📖 Help

Commands:
/start - Welcome message
/status - System status
/deploy - Deployment status
/alerts - Recent alerts
/events - Security events
/help - This message

Features:
• Real-time security alerts
• System monitoring
• Event tracking
• Deployment status
```

## Setup Telegram Bot

### 1. Create Bot
- Chat with @BotFather on Telegram
- Create new bot
- Get bot token

### 2. Set Commands
```bash
# Set webhook
curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"https://zolai.space/api/telegram/webhook\"}"

# Set commands
curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setMyCommands \
  -H "Content-Type: application/json" \
  -d '{
    "commands": [
      {"command": "start", "description": "Welcome message"},
      {"command": "status", "description": "System status"},
      {"command": "deploy", "description": "Deployment status"},
      {"command": "alerts", "description": "Recent alerts"},
      {"command": "events", "description": "Security events"},
      {"command": "help", "description": "Show help"}
    ]
  }'
```

### 3. Environment Variables
```bash
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

## Deployment Status Check

The `/deploy` command checks:
- ✅ Domain accessible (https://zolai.space)
- ✅ API responding (/api/health)
- ✅ Database connected (/api/curriculum/levels)

### Response Examples

**Deployed ✅**
```
🚀 Deployment Status: LIVE ✅

Domain: https://zolai.space
API: ✅ Responding
Database: ✅ Connected

All systems operational!
```

**In Progress ⏳**
```
⏳ Deployment Status: IN PROGRESS

Domain: ✅
API: ❌
Database: ❌

Deployment in progress or configuration issue.
Check: vercel logs --follow
```

**Error ❌**
```
❌ Deployment Status: UNKNOWN

Unable to check deployment status.
Check Vercel dashboard: https://vercel.com
```

## Quick Reference

| Command | Purpose | Response |
|---------|---------|----------|
| `/start` | Welcome | Menu |
| `/status` | System health | Status |
| `/deploy` | Is it live? | Deployment status |
| `/alerts` | Security alerts | Alert list |
| `/events` | Security events | Event list |
| `/help` | Help | Commands |

## Integration

The Telegram bot is integrated with:
- ✅ Security notifications
- ✅ System monitoring
- ✅ Deployment status
- ✅ Alert system

## API Endpoint

```
POST /api/telegram/webhook
```

Receives Telegram updates and responds with appropriate messages.

---

**Telegram Bot:** @ZolaiSecurityBot
**Domain:** https://zolai.space
**Status:** Ready

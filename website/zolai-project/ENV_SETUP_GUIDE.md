# Environment Setup Guide

## Production Environment Files

### Files Created

1. **`.env.production`** — Production environment (zolai.space)
   - All production values configured
   - Ready to deploy
   - Contains all required variables

2. **`.env.example`** — Template for reference
   - Copy to `.env.local` for development
   - Fill in your own values
   - Never commit actual secrets

3. **`.env.local`** — Local development (git-ignored)
   - Your local development values
   - Not committed to git
   - Use `.env.example` as template

## Environment Variables by Category

### Database
```
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://...
```

### Application URLs
```
NEXT_PUBLIC_APP_URL=https://zolai.space
NEXT_PUBLIC_SITE_URL=https://zolai.space
NEXT_PUBLIC_API_URL=https://zolai.space
BETTER_AUTH_URL=https://zolai.space
NODE_ENV=production
```

### Authentication
```
BETTER_AUTH_SECRET=...
BETTER_AUTH_API_KEY=...
```

### AI Providers (Multi-Provider Pool)
```
# Gemini
GEMINI_API_KEY=...
GEMINI_API_KEY_2=...
GEMINI_API_KEY_3=...
GEMINI_MODELS=gemini-1.5-flash,gemini-2.0-flash

# Groq
GROQ_API_KEY=...
GROQ_MODELS=mixtral-8x7b-32768,llama-3-70b-8192

# OpenRouter
OPENROUTER_API_KEY=...
OPENROUTER_MODELS=openai/gpt-3.5-turbo,anthropic/claude-3-opus

# Zolai LLM
ZOLAI_API_URL=http://...
```

### Email Service (SMTP)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Zolai AI <your-email@gmail.com>"
```

### Telegram Bot
```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

### Security
```
ENABLE_CRON_SECRET_CHECK=true
CRON_SECRET=...
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
SESSION_TIMEOUT_MINUTES=60
MAX_SESSIONS_PER_USER=5
```

### File Upload (Cloudflare R2)
```
MEDIA_UPLOAD_PROVIDER=r2
MAX_UPLOAD_SIZE_MB=5
R2_ENDPOINT=https://...
R2_BUCKET_NAME=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

### Monitoring (Optional)
```
SENTRY_DSN=...
DATADOG_API_KEY=...
GOOGLE_ANALYTICS_ID=...
```

### Feature Flags
```
FEATURE_2FA_ENABLED=true
FEATURE_LOGIN_HISTORY_ENABLED=true
FEATURE_SUSPICIOUS_LOGIN_DETECTION_ENABLED=true
FEATURE_EMAIL_NOTIFICATIONS_ENABLED=true
FEATURE_TELEGRAM_NOTIFICATIONS_ENABLED=true
FEATURE_ACCOUNT_LOCKOUT_ENABLED=true
```

## Setup Instructions

### 1. Local Development

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
nano .env.local

# Verify
grep "DATABASE_URL" .env.local
```

### 2. Production Deployment

```bash
# Use production file
cp .env.production .env.local

# Or set in Vercel
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_SECRET
# ... add all variables
```

### 3. Vercel Environment

```bash
# List current env vars
vercel env list

# Add new variable
vercel env add VARIABLE_NAME

# Remove variable
vercel env remove VARIABLE_NAME

# Pull from Vercel
vercel env pull
```

## Required Variables Checklist

### Critical (Must Have)
- [ ] DATABASE_URL
- [ ] BETTER_AUTH_SECRET
- [ ] NEXT_PUBLIC_APP_URL
- [ ] SMTP_HOST
- [ ] SMTP_USER
- [ ] SMTP_PASS
- [ ] TELEGRAM_BOT_TOKEN
- [ ] TELEGRAM_CHAT_ID

### AI Providers (At Least One)
- [ ] GEMINI_API_KEY (recommended)
- [ ] GROQ_API_KEY (optional)
- [ ] OPENROUTER_API_KEY (optional)

### Optional
- [ ] SENTRY_DSN
- [ ] DATADOG_API_KEY
- [ ] GOOGLE_ANALYTICS_ID
- [ ] R2_* (if using Cloudflare)

## Verification

```bash
# Check all required vars are set
grep -E "^[A-Z_]+=" .env.local | wc -l

# Check specific variable
grep "DATABASE_URL" .env.local

# Verify production config
grep "NODE_ENV=production" .env.production
grep "zolai.space" .env.production
```

## Security Best Practices

1. **Never commit secrets**
   - `.env.local` is git-ignored
   - Use `.env.example` for templates

2. **Rotate secrets regularly**
   - Change API keys monthly
   - Update passwords quarterly

3. **Use strong secrets**
   - BETTER_AUTH_SECRET: 32+ characters
   - CRON_SECRET: 64+ characters

4. **Limit access**
   - Only share with team members who need it
   - Use Vercel's environment variable access controls

5. **Monitor usage**
   - Check API key usage regularly
   - Set up alerts for unusual activity

## Troubleshooting

### Missing Environment Variable
```bash
# Check if variable is set
echo $VARIABLE_NAME

# Check in .env file
grep "VARIABLE_NAME" .env.local

# Add missing variable
echo "VARIABLE_NAME=value" >> .env.local
```

### Wrong Database Connection
```bash
# Test connection
bunx prisma db execute --stdin < /dev/null

# Check DATABASE_URL format
grep "DATABASE_URL" .env.local
```

### Email Not Sending
```bash
# Check SMTP config
echo $SMTP_HOST
echo $SMTP_PORT
echo $SMTP_USER

# Test SMTP connection
node -e "
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({...});
t.verify((e, ok) => console.log(e || ok));
"
```

### Telegram Not Sending
```bash
# Check bot token
echo $TELEGRAM_BOT_TOKEN

# Check chat ID
echo $TELEGRAM_CHAT_ID

# Test webhook
curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"https://zolai.space/api/telegram/webhook\"}"
```

## Environment Files Summary

| File | Purpose | Committed | Usage |
|------|---------|-----------|-------|
| `.env.example` | Template | ✅ Yes | Reference |
| `.env.local` | Development | ❌ No | Local dev |
| `.env.production` | Production | ✅ Yes | Reference |

---

**Status:** ✅ All environment files ready
**Production Domain:** https://zolai.space
**Last Updated:** 2026-04-15

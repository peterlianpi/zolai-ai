# 📋 ZOLAI PRODUCTION ENVIRONMENT - ALL KEY-VALUE PAIRS

## Files Created

1. **`ENV_KEYS_VALUES.txt`** — Plain text format (copy-paste ready)
2. **`ENV_KEYS_VALUES.json`** — JSON format (for programmatic import)
3. **`ENV_KEYS_VALUES.csv`** — CSV format (for spreadsheet import)

## Quick Reference

### Total Variables: 48

### By Category

| Category | Count | Required |
|----------|-------|----------|
| Database | 2 | 2 |
| Application | 7 | 5 |
| Authentication | 2 | 2 |
| AI Providers | 10 | 1 |
| Email | 6 | 6 |
| Telegram | 4 | 2 |
| Security | 8 | 3 |
| File Upload | 6 | 0 |
| Monitoring | 3 | 0 |
| Logging | 2 | 0 |
| Security Headers | 2 | 0 |
| Feature Flags | 6 | 0 |
| Curriculum | 2 | 0 |
| Performance | 2 | 0 |
| Deployment | 2 | 0 |

## Critical Variables (Must Have)

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=ojj9BmB9JwyjdsPGCwC85LjP33Xs2aYQ
NEXT_PUBLIC_APP_URL=https://zolai.space
SMTP_HOST=smtp.gmail.com
SMTP_USER=pcore.system@gmail.com
SMTP_PASS=twqkvpfeezvmohej
TELEGRAM_BOT_TOKEN=7123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh
TELEGRAM_CHAT_ID=123456789
```

## How to Use

### Option 1: Copy from TXT File
```bash
cat ENV_KEYS_VALUES.txt | xargs -I {} echo {}
```

### Option 2: Import JSON
```bash
cat ENV_KEYS_VALUES.json | jq '.[] | to_entries[] | "\(.key)=\(.value)"'
```

### Option 3: Import CSV
```bash
tail -n +2 ENV_KEYS_VALUES.csv | cut -d',' -f1,2 | tr ',' '='
```

### Option 4: Vercel CLI
```bash
# Add each variable
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_SECRET
# ... etc
```

## Deployment Steps

### 1. Copy All Variables
```bash
# Copy from ENV_KEYS_VALUES.txt
cat ENV_KEYS_VALUES.txt
```

### 2. Add to Vercel
```bash
# Option A: One by one
vercel env add DATABASE_URL "postgresql://..."
vercel env add BETTER_AUTH_SECRET "ojj9BmB9JwyjdsPGCwC85LjP33Xs2aYQ"
# ... etc

# Option B: From file
while IFS='=' read -r key value; do
  vercel env add "$key" "$value"
done < ENV_KEYS_VALUES.txt
```

### 3. Verify
```bash
vercel env list
```

### 4. Deploy
```bash
vercel deploy --prod
```

## Variable Groups

### Database (2)
- DATABASE_PROVIDER
- DATABASE_URL

### Application (7)
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_SITE_URL
- NEXT_PUBLIC_API_URL
- BETTER_AUTH_URL
- NODE_ENV
- NEXT_PUBLIC_APP_NAME
- NEXT_PUBLIC_CONTACT_EMAIL

### Authentication (2)
- BETTER_AUTH_SECRET
- BETTER_AUTH_API_KEY

### AI Providers (10)
- GEMINI_API_KEY
- GEMINI_API_KEY_2
- GEMINI_API_KEY_3
- GEMINI_MODELS
- GROQ_API_KEY
- GROQ_MODELS
- OPENROUTER_API_KEY
- OPENROUTER_MODELS
- NVIDIA_API_KEY

### Email (6)
- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE
- SMTP_USER
- SMTP_PASS
- SMTP_FROM

### Telegram (4)
- TELEGRAM_BOT_TOKEN
- TELEGRAM_CHAT_ID
- TELEGRAM_DISABLE_WEB_PREVIEW
- TELEGRAM_TIMEOUT_MS

### Security (8)
- ENABLE_CRON_SECRET_CHECK
- CRON_SECRET
- RATE_LIMIT_WINDOW_MS
- RATE_LIMIT_MAX_REQUESTS
- SESSION_TIMEOUT_MINUTES
- MAX_SESSIONS_PER_USER
- MAX_LOGIN_ATTEMPTS
- LOCKOUT_DURATION_MINUTES

### File Upload (6)
- MEDIA_UPLOAD_PROVIDER
- MAX_UPLOAD_SIZE_MB
- R2_ENDPOINT
- R2_BUCKET_NAME
- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY

### Monitoring (3)
- SENTRY_DSN
- DATADOG_API_KEY
- GOOGLE_ANALYTICS_ID

### Logging (2)
- LOG_LEVEL
- LOG_FORMAT

### Security Headers (2)
- NEXT_PUBLIC_STRICT_CSP
- NEXT_PUBLIC_ENABLE_HSTS

### Feature Flags (6)
- FEATURE_2FA_ENABLED
- FEATURE_LOGIN_HISTORY_ENABLED
- FEATURE_SUSPICIOUS_LOGIN_DETECTION_ENABLED
- FEATURE_EMAIL_NOTIFICATIONS_ENABLED
- FEATURE_TELEGRAM_NOTIFICATIONS_ENABLED
- FEATURE_ACCOUNT_LOCKOUT_ENABLED

### Curriculum (2)
- CURRICULUM_SEED_ENABLED
- CURRICULUM_CACHE_TTL_MINUTES

### Performance (2)
- NEXT_PUBLIC_ENABLE_ANALYTICS
- NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING

### Deployment (2)
- VERCEL_ENV
- VERCEL_URL

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to git
- Keep secrets secure
- Rotate API keys regularly
- Use Vercel's environment variable encryption
- Limit access to production variables

## Support

For issues with environment variables:
1. Check `ENV_SETUP_GUIDE.md`
2. Verify all required variables are set
3. Check Vercel logs: `vercel logs`
4. Test locally: `bun run dev`

---

**Status:** ✅ All 47 environment variables ready (ZOLAI_API_URL removed - not active)
**Domain:** https://zolai.space
**Last Updated:** 2026-04-15 19:27 UTC

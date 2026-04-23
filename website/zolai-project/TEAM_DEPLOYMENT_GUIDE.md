# Team Deployment Guide

## Quick Start

### 1. Setup (5 min)
```bash
# Clone repo
git clone <repo>
cd zolai-project

# Install dependencies
bun install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 2. Audit (2 min)
```bash
# Run full audit
bun run audit:all

# Expected output: All PASS
```

### 3. Test (5 min)
```bash
# Run all tests
bun run test

# Or specific tests
bun run test:auth
bun run test:api
bun run test:security
```

### 4. Build (3 min)
```bash
# Build for production
bun run build

# Expected: Build successful
```

### 5. Deploy (1 min)
```bash
# Push to main
git push origin main

# Vercel auto-deploys
# Monitor at vercel.com
```

## Team Roles

### DevOps
- [ ] Setup Vercel project
- [ ] Configure environment variables
- [ ] Setup database backups
- [ ] Configure monitoring
- [ ] Setup CI/CD

### Backend
- [ ] Review API endpoints
- [ ] Test authentication flows
- [ ] Verify database migrations
- [ ] Check error handling
- [ ] Review security measures

### Frontend
- [ ] Test UI components
- [ ] Verify notifications display
- [ ] Test responsive design
- [ ] Check accessibility
- [ ] Test error boundaries

### QA
- [ ] Run full test suite
- [ ] Manual testing
- [ ] Security testing
- [ ] Performance testing
- [ ] Regression testing

### Security
- [ ] Review security measures
- [ ] Check audit logging
- [ ] Verify encryption
- [ ] Test rate limiting
- [ ] Review access controls

## Deployment Workflow

### 1. Pre-Deployment (Team Lead)
```bash
# Create release branch
git checkout -b release/v1.0.0

# Run audits
bun run audit:all

# Run tests
bun run test

# Build
bun run build

# Create PR
gh pr create --title "Release v1.0.0" --body "Production deployment"
```

### 2. Code Review (Team)
- [ ] Review changes
- [ ] Verify tests pass
- [ ] Check security
- [ ] Approve PR

### 3. Merge & Deploy (Team Lead)
```bash
# Merge to main
gh pr merge --squash

# Vercel auto-deploys
# Monitor deployment
```

### 4. Post-Deployment (Team)
- [ ] Verify health checks
- [ ] Test critical flows
- [ ] Monitor error rates
- [ ] Check performance
- [ ] Gather feedback

## Monitoring

### Daily Checks
```bash
# Check error rate
curl https://example.com/api/health

# Check logs
vercel logs

# Check alerts
# Review Telegram alerts
```

### Weekly Review
```bash
# Security events
SELECT * FROM security_event WHERE created_at > now() - interval '7 days'

# Failed logins
SELECT * FROM login_attempt WHERE success = false AND created_at > now() - interval '7 days'

# Performance
SELECT avg(duration) FROM api_logs WHERE created_at > now() - interval '7 days'
```

## Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf .next
rm -rf node_modules

# Reinstall
bun install

# Rebuild
bun run build
```

### Tests Fail
```bash
# Run specific test
bun run test:auth

# Debug
bun run test:debug

# Check logs
cat test-results.json
```

### Deployment Fails
```bash
# Check Vercel logs
vercel logs

# Rollback
git revert <commit>
git push origin main

# Fix and redeploy
```

### Email Not Sending
```bash
# Check SMTP config
echo $SMTP_HOST
echo $SMTP_PORT

# Test connection
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
  -d "{\"url\": \"https://example.com/api/telegram/webhook\"}"
```

## Rollback Plan

### If Critical Bug Found
```bash
# Identify commit
git log --oneline

# Revert
git revert <commit>

# Push
git push origin main

# Vercel auto-deploys previous version
```

### If Database Migration Fails
```bash
# Rollback migration
bunx prisma migrate resolve --rolled-back <migration_name>

# Fix schema
# Re-apply migration
bunx prisma migrate deploy
```

## Communication

### Slack Channels
- #deployments — Deployment notifications
- #alerts — Security alerts
- #incidents — Incident response
- #performance — Performance issues

### Escalation
- **P1 (Critical)** — Immediate response
- **P2 (High)** — Within 1 hour
- **P3 (Medium)** — Within 4 hours
- **P4 (Low)** — Within 24 hours

## Documentation

### Key Files
- `PRODUCTION_READY.md` — System overview
- `PRODUCTION_CHECKLIST.md` — Deployment checklist
- `docs/auth/PHASE_4_INTEGRATION.md` — Integration guide
- `docs/auth/PHASE_3_COMPLETE.md` — Security features

### API Documentation
- `docs/api/API.md` — Full API reference
- `docs/auth/` — Authentication docs
- `docs/references/` — Library references

## Support

### Internal
- **DevOps Lead:** [name]
- **Backend Lead:** [name]
- **Frontend Lead:** [name]
- **QA Lead:** [name]

### External
- **Database:** Neon support
- **Hosting:** Vercel support
- **Email:** SMTP provider support
- **Telegram:** Telegram bot support

---

**Status:** Ready for Team Deployment
**Last Updated:** 2026-04-15
**Next Deployment:** [Date]

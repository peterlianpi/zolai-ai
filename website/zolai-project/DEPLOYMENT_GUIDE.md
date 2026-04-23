# 🚀 Zolai Production Deployment Guide

## Production Domain: zolai.space

### Pre-Deployment Checklist

```bash
# 1. Verify environment
grep "zolai.space" .env.local
grep "NODE_ENV=production" .env.local

# 2. Run verification
bunx tsx scripts/pre-deploy.ts

# 3. Expected output: All checks PASS
```

### Deployment Steps

#### Step 1: Local Verification (5 min)
```bash
# Run pre-deployment checks
bun run pre-deploy

# Expected: ✅ Verification PASSED
```

#### Step 2: Build & Test (10 min)
```bash
# Build
bun run build

# Run tests
bun run test

# Run linter
bun run lint

# Expected: All pass
```

#### Step 3: Git Commit (2 min)
```bash
# Stage changes
git add .

# Commit
git commit -m "Production deployment - zolai.space

- Updated environment for production
- All security features integrated
- Email & Telegram notifications enabled
- Multi-agent audit system ready
- Error-free build"

# Push to main
git push origin main
```

#### Step 4: Deploy to Vercel (5 min)
```bash
# Deploy to production
vercel deploy --prod

# Or let GitHub Actions auto-deploy
# Monitor at: https://vercel.com/dashboard
```

#### Step 5: Post-Deployment Verification (5 min)
```bash
# Check health
curl https://zolai.space/api/health

# Check logs
vercel logs

# Test critical endpoints
curl https://zolai.space/api/curriculum/levels
curl https://zolai.space/api/auth/session
```

### Deployment Checklist

#### Pre-Deployment
- [x] Environment updated for zolai.space
- [x] NODE_ENV=production set
- [x] All security files present
- [x] Database migrations ready
- [x] Email service configured
- [x] Telegram bot configured
- [x] Build passes
- [x] Tests pass
- [x] Linting passes
- [x] No type errors

#### Deployment
- [ ] Git commit created
- [ ] Changes pushed to main
- [ ] Vercel deployment started
- [ ] Deployment successful
- [ ] Health check passes

#### Post-Deployment
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Notifications sending
- [ ] Database connected
- [ ] Error rates normal
- [ ] Performance acceptable

### Monitoring

#### Immediate (First Hour)
```bash
# Check error rate
vercel logs --follow

# Monitor performance
# Check Vercel dashboard

# Test critical flows
# - Login
# - 2FA
# - Notifications
```

#### Daily
```bash
# Check error logs
vercel logs

# Monitor alerts
# Check Telegram alerts

# Verify backups
# Check database health
```

### Rollback Plan

If deployment fails:

```bash
# Revert to previous version
git revert HEAD
git push origin main

# Vercel auto-deploys previous version
# Monitor at vercel.com
```

### Environment Variables

**Production (.env.local)**
```
NEXT_PUBLIC_APP_URL=https://zolai.space
BETTER_AUTH_URL=https://zolai.space
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
TELEGRAM_BOT_TOKEN=...
DATABASE_URL=postgresql://...
```

### Key Features Deployed

✅ **Authentication**
- Email/password login
- 2FA (TOTP)
- Session management
- Account lockout

✅ **Security**
- Login history tracking
- Device management
- Suspicious login detection
- Audit logging

✅ **Notifications**
- Email alerts
- Telegram alerts
- In-app notifications
- Security events

✅ **Monitoring**
- Multi-agent audit system
- Error tracking
- Performance monitoring
- Alert system

### Support

**Issues During Deployment:**
1. Check Vercel logs: `vercel logs`
2. Check database: `bunx prisma db execute --stdin < /dev/null`
3. Check environment: `vercel env list`
4. Rollback if needed: `git revert HEAD && git push origin main`

**Post-Deployment Issues:**
1. Check error logs
2. Verify database connection
3. Check email service
4. Check Telegram bot
5. Review security events

### Success Criteria

✅ Deployment successful when:
- [ ] Health check returns 200
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Notifications sending
- [ ] Error rate < 0.1%
- [ ] Response time < 500ms
- [ ] No critical alerts

### Timeline

| Step | Duration | Status |
|------|----------|--------|
| Pre-Deploy Verification | 5 min | ✅ Ready |
| Build & Test | 10 min | ✅ Ready |
| Git Commit | 2 min | ⏳ Pending |
| Vercel Deploy | 5 min | ⏳ Pending |
| Post-Deploy Verify | 5 min | ⏳ Pending |
| **Total** | **27 min** | ⏳ Pending |

---

**Production Domain:** https://zolai.space
**Status:** 🟢 Ready for Deployment
**Last Updated:** 2026-04-15 19:21 UTC

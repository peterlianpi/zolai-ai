# Production Deployment Checklist

## Pre-Deployment Audit

### Code Quality
- [ ] Run `bun run lint` — 0 errors
- [ ] Run `bun run build` — Success
- [ ] Run `bunx tsc --noEmit` — 0 type errors
- [ ] Run `bunx prisma validate` — Schema valid
- [ ] All security checks pass

### Security
- [ ] No raw `fetch()` calls in client code
- [ ] All Hono routes properly chained
- [ ] No direct `hc<>` imports outside `lib/api/client`
- [ ] Environment variables configured
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Database backups enabled

### Database
- [ ] All migrations applied
- [ ] Database connection verified
- [ ] Backup strategy in place
- [ ] Indexes created
- [ ] Connection pooling configured

### Authentication
- [ ] Session validation working
- [ ] 2FA enabled for admins
- [ ] TOTP backup codes generated
- [ ] Password requirements enforced
- [ ] Account lockout configured

### Notifications
- [ ] SMTP configured and tested
- [ ] Telegram bot token set
- [ ] Email templates reviewed
- [ ] In-app notifications working
- [ ] Telegram commands set

### Monitoring
- [ ] Error logging configured
- [ ] Performance monitoring enabled
- [ ] Security event logging active
- [ ] Audit trail recording
- [ ] Alert thresholds set

## Environment Variables

### Required
```bash
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://example.com

# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=noreply@example.com

# App
NEXT_PUBLIC_APP_URL=https://example.com
NODE_ENV=production
```

### Optional
```bash
# Monitoring
SENTRY_DSN=...
DATADOG_API_KEY=...

# Analytics
GOOGLE_ANALYTICS_ID=...

# SMS (optional)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

## Deployment Steps

### 1. Pre-Deployment
```bash
# Run audit
bun run audit:system

# Run tests
bun run test

# Build
bun run build
```

### 2. Database Migration
```bash
# Apply migrations
bunx prisma migrate deploy

# Verify schema
bunx prisma validate
```

### 3. Deploy to Vercel
```bash
# Push to main branch
git push origin main

# Vercel auto-deploys
# Monitor deployment at vercel.com
```

### 4. Post-Deployment
```bash
# Verify health
curl https://example.com/api/health

# Check logs
vercel logs

# Test critical flows
# - Login
# - 2FA
# - Notifications
# - API endpoints
```

## Verification Checklist

### API Health
- [ ] GET `/api/health` returns 200
- [ ] GET `/api/curriculum/levels` returns data
- [ ] POST `/api/auth/login` works
- [ ] GET `/api/auth/session` returns session

### Authentication
- [ ] Login works
- [ ] 2FA works
- [ ] Session persists
- [ ] Logout works
- [ ] Account lockout works

### Notifications
- [ ] In-app notifications show
- [ ] Email sends
- [ ] Telegram alerts send
- [ ] Security events logged

### Security
- [ ] CSRF protection active
- [ ] Rate limiting works
- [ ] SQL injection prevented
- [ ] XSS protection active
- [ ] CORS configured

### Performance
- [ ] Page load < 3s
- [ ] API response < 500ms
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Caching working

## Rollback Plan

### If Deployment Fails
1. Revert to previous version
2. Check error logs
3. Fix issues
4. Re-deploy

### If Database Migration Fails
1. Rollback migration: `bunx prisma migrate resolve --rolled-back <migration_name>`
2. Fix schema
3. Re-apply migration

### If Critical Bug Found
1. Revert deployment
2. Fix bug locally
3. Test thoroughly
4. Re-deploy

## Monitoring

### Daily Checks
- [ ] Error rate < 0.1%
- [ ] Response time < 500ms
- [ ] Database connections healthy
- [ ] No security alerts
- [ ] Email delivery working

### Weekly Checks
- [ ] Review security events
- [ ] Check failed logins
- [ ] Verify backups
- [ ] Review performance metrics
- [ ] Check user feedback

### Monthly Checks
- [ ] Security audit
- [ ] Performance review
- [ ] Database optimization
- [ ] Dependency updates
- [ ] Capacity planning

## Support Contacts

- **Database Issues**: Database provider support
- **Email Issues**: SMTP provider support
- **Telegram Issues**: Telegram bot support
- **Deployment Issues**: Vercel support
- **Security Issues**: Security team

## Post-Deployment Tasks

### Week 1
- [ ] Monitor error rates
- [ ] Gather user feedback
- [ ] Check performance metrics
- [ ] Verify all features working

### Month 1
- [ ] Security audit
- [ ] Performance optimization
- [ ] User feedback review
- [ ] Plan next features

### Ongoing
- [ ] Regular backups
- [ ] Security updates
- [ ] Performance monitoring
- [ ] User support

---

**Status:** Ready for Production
**Last Updated:** 2026-04-15
**Deployment Date:** TBD

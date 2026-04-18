# Next.js Starter Project - Client Delivery Checklist

**Version:** 1.0.0  
**Created:** 2026-04-09  
**Purpose:** Complete verification checklist before, during, and after client delivery

---

## Overview

This checklist ensures that every client delivery is professional, complete, and production-ready. Use this as your go/no-go decision maker before handing off to clients.

**Checklist Structure:**
- **Pre-Delivery** (72 items) — Before shipping to client
- **Delivery Day** (15 items) — During handoff meeting
- **Post-Delivery** (18 items) — After go-live
- **Client Support** (12 items) — Ongoing support tasks

**Time Estimate:** 
- Pre-Delivery: 2-3 weeks (development + QA)
- Delivery Day: 2-3 hours (handoff + training)
- Post-Delivery Week 1: 5-10 hours (support + monitoring)

---

## PRE-DELIVERY CHECKLIST (72 Items)

### Code Quality (12 items)

- [ ] All TypeScript errors resolved (`bun run build` passes)
- [ ] ESLint passes with 0 errors (`bun run lint`)
- [ ] Prettier formatting applied to all files (`bun run format`)
- [ ] No `any` types in codebase (strict TypeScript mode)
- [ ] All functions have JSDoc comments with param/return types
- [ ] Dead code removed and unused imports cleaned up
- [ ] No console.log statements in production code (debug logs removed)
- [ ] Error messages are user-friendly (no stack traces exposed)
- [ ] All API responses follow standardized format
- [ ] No hardcoded values (environment variables used everywhere)
- [ ] Code commented where logic is non-obvious
- [ ] Cyclomatic complexity < 10 for most functions

**Verify:**
```bash
bun run build
bun run lint
bun run format --check
```

---

### Testing (15 items)

- [ ] Unit tests written for all utilities & hooks (>80% coverage)
- [ ] Integration tests for API endpoints (Happy path + error cases)
- [ ] E2E tests for critical user journeys (using Playwright)
  - [ ] Sign up flow
  - [ ] Sign in flow
  - [ ] Create post flow
  - [ ] Comment on post flow
  - [ ] Update profile flow
- [ ] All tests passing locally (`npx playwright test`)
- [ ] Test coverage report reviewed (< 5% uncovered code in main paths)
- [ ] API tests verify:
  - [ ] Correct status codes (200, 201, 400, 401, 403, 404, 409)
  - [ ] Valid response schemas
  - [ ] Error handling
  - [ ] Authorization checks
  - [ ] Validation rules
- [ ] Tests run in CI/CD pipeline successfully
- [ ] Load testing completed (can handle expected traffic)
- [ ] Security testing completed (no OWASP Top 10 vulnerabilities)
- [ ] Lighthouse score > 90 for all pages
- [ ] No flaky tests (all tests pass 5 consecutive runs)
- [ ] Test documentation updated in README
- [ ] Test database seeded with realistic data

**Verify:**
```bash
bun run test
npx playwright test
npm run audit:a11y
```

---

### Database & Migrations (10 items)

- [ ] Prisma schema reviewed and approved by tech lead
- [ ] All migrations created and tested locally
  - [ ] `bunx prisma migrate dev` runs without errors
  - [ ] `bunx prisma migrate status` shows all migrations applied
- [ ] Seed script includes all sample data
  - [ ] Users (admin, test users)
  - [ ] Organizations with members
  - [ ] Teams with members
  - [ ] Sample posts, categories, tags
  - [ ] Comments on posts
- [ ] Database constraints properly configured:
  - [ ] Unique constraints on email, slug, username
  - [ ] Foreign keys with correct cascade/restrict actions
  - [ ] Check constraints for enum fields
  - [ ] Default values set correctly
- [ ] Indexes created for:
  - [ ] All foreign key columns
  - [ ] Commonly filtered/sorted fields
  - [ ] Text search fields
- [ ] Data validation at DB layer (not just app layer)
- [ ] Backup/restore tested successfully
- [ ] Migration rollback tested (can reverse last N migrations)
- [ ] Database performance benchmarked (queries < 100ms)
- [ ] N+1 query issues resolved (Prisma `select` used properly)

**Verify:**
```bash
bunx prisma migrate status
bunx prisma db seed
bunx prisma studio  # Review data
```

---

### Authentication & Security (15 items)

- [ ] Password requirements enforced (8+ chars, uppercase, lowercase, number, special char)
- [ ] Passwords hashed securely (Better Auth handles this)
- [ ] 2FA setup works end-to-end
- [ ] Session management:
  - [ ] Access token expires in 15 minutes
  - [ ] Refresh token expires in 30 days
  - [ ] Session revocation works (log out everywhere)
  - [ ] No session fixation vulnerabilities
- [ ] Email verification required before account activation
- [ ] Password reset flow secure (token expires in 1 hour)
- [ ] Rate limiting enabled:
  - [ ] Auth endpoints: 5 attempts per 15 minutes
  - [ ] API endpoints: 1000 requests/hour per user
  - [ ] Public endpoints: 100 requests/hour per IP
- [ ] CORS configured correctly (only allowed origins)
- [ ] CSRF protection enabled (SameSite cookies)
- [ ] XSS prevention:
  - [ ] No inline scripts
  - [ ] Content-Security-Policy header set
  - [ ] HTML properly escaped
- [ ] SQL injection prevented (using Prisma, not raw SQL)
- [ ] Auth cookies secure:
  - [ ] HttpOnly flag set
  - [ ] Secure flag set (HTTPS only)
  - [ ] SameSite=Strict
- [ ] No sensitive data in logs (passwords, tokens, API keys)
- [ ] Role-based access control (RBAC) implemented:
  - [ ] Global roles (USER, ADMIN)
  - [ ] Org roles (OWNER, ADMIN, MEMBER, VIEWER)
  - [ ] Team roles (OWNER, ADMIN, MEMBER, VIEWER)
  - [ ] Permissions checked on every API call

**Verify:**
```bash
# Test password validation
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"weak"}'

# Should return 422 with validation error
```

---

### Frontend UI/UX (12 items)

- [ ] All pages render correctly (no layout shifts)
- [ ] Responsive design tested on:
  - [ ] Mobile (375px)
  - [ ] Tablet (768px)
  - [ ] Desktop (1920px)
- [ ] Loading states visible (spinners, skeletons)
- [ ] Error states handled gracefully (user-friendly messages)
- [ ] Form validation visible before submit
- [ ] Toast notifications working (sonner library)
- [ ] Accessibility:
  - [ ] ARIA labels present
  - [ ] Color contrast > 4.5:1
  - [ ] Keyboard navigation works
  - [ ] Screen reader compatible
- [ ] Dark mode working (if enabled)
- [ ] Images optimized (next/image used)
- [ ] Navigation hierarchy clear
- [ ] Links have proper focus states
- [ ] No placeholder text visible in production

**Verify:**
```bash
bun run build
bun run start
# Test on different devices/browsers
```

---

### API Documentation (8 items)

- [ ] OpenAPI 3.0 spec complete and valid
- [ ] All 50+ endpoints documented with:
  - [ ] Purpose/description
  - [ ] Request schema with examples
  - [ ] Response schema with examples
  - [ ] Error codes and messages
  - [ ] Authorization requirements
  - [ ] Rate limiting info
- [ ] API spec matches implementation (no discrepancies)
- [ ] Interactive API documentation available (Swagger UI or similar)
- [ ] Client library generated from spec
- [ ] API spec versioned and tracked in git
- [ ] Webhook events documented (if applicable)
- [ ] Rate limits documented with examples

---

### Deployment Configuration (8 items)

- [ ] `.env.example` file created with all required variables
- [ ] Environment variables documented:
  - [ ] DATABASE_URL
  - [ ] NEXTAUTH_SECRET
  - [ ] NEXTAUTH_URL
  - [ ] Node version specified (.nvmrc or package.json)
- [ ] Build process tested in production mode:
  - [ ] `bun run build` completes successfully
  - [ ] No build warnings/errors
  - [ ] Production bundle size acceptable (< 500KB gzipped)
- [ ] Docker configuration (if using):
  - [ ] Dockerfile optimized (multi-stage build)
  - [ ] .dockerignore configured
  - [ ] docker-compose.yml includes all services
- [ ] Vercel configuration (if deploying to Vercel):
  - [ ] `vercel.json` configured
  - [ ] Build settings optimized
  - [ ] Environment variables set in Vercel dashboard
- [ ] Database URL configured correctly for production
- [ ] Asset CDN configured (if using)

**Verify:**
```bash
bun run build
NODE_ENV=production bun start
```

---

### Monitoring & Logging (8 items)

- [ ] Error tracking service configured (Sentry, LogRocket, etc.)
- [ ] Structured logging implemented (JSON format)
- [ ] Log levels configured correctly (debug, info, warn, error)
- [ ] Critical errors trigger alerts
- [ ] Performance monitoring enabled
  - [ ] API response times tracked
  - [ ] Database query times monitored
  - [ ] Frontend performance metrics collected
- [ ] Uptime monitoring configured
- [ ] Backup/restore procedures documented and tested
- [ ] Log retention policy configured (e.g., 30 days)

---

### Documentation (8 items)

- [ ] README.md complete with:
  - [ ] Project overview
  - [ ] Quick start guide
  - [ ] Installation instructions
  - [ ] Configuration steps
  - [ ] Running development server
  - [ ] Building for production
  - [ ] Testing instructions
  - [ ] Deployment guide
- [ ] ARCHITECTURE.md created explaining:
  - [ ] System design
  - [ ] Feature overview
  - [ ] Database schema
  - [ ] Auth flow
  - [ ] API structure
- [ ] DEPLOYMENT.md with:
  - [ ] Step-by-step deployment guide
  - [ ] Environment setup
  - [ ] Database migration steps
  - [ ] Troubleshooting
- [ ] CUSTOMIZATION.md with:
  - [ ] How to modify features
  - [ ] How to extend database schema
  - [ ] How to add new pages
  - [ ] How to modify styling
- [ ] Contributing guide created (if open source)
- [ ] Changelog.md started
- [ ] All code comments updated
- [ ] Configuration files documented (.env variables, feature flags)

---

### Performance (6 items)

- [ ] Page load times < 2 seconds (Lighthouse)
- [ ] Time to Interactive (TTI) < 3.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms
- [ ] Database queries optimized:
  - [ ] No N+1 queries
  - [ ] Indexes used properly
  - [ ] Query times < 100ms

---

## DELIVERY DAY CHECKLIST (15 Items)

### Pre-Meeting (4 items)

- [ ] Final code review completed (approved by tech lead)
- [ ] Production database backup taken
- [ ] Deployment to staging completed and tested
- [ ] Demo script prepared (walk-through of key features)

---

### Meeting Setup (4 items)

- [ ] Meeting scheduled with all stakeholders
- [ ] Attendees confirmed:
  - [ ] Project manager
  - [ ] Client tech lead
  - [ ] Client business lead
  - [ ] Your tech lead/PM
- [ ] Screen sharing tested and working
- [ ] Demo environment tested (can access production)

---

### During Handoff (4 items)

- [ ] Walk through each of 8 features (15 min total)
- [ ] Live demo of 3 key user journeys
- [ ] Explain API documentation and integration options
- [ ] Review monitoring dashboards and alert setup

---

### Documentation Handoff (3 items)

- [ ] All documentation shared and accessible to client
- [ ] Login credentials for admin/test accounts provided securely
- [ ] Access granted to:
  - [ ] Git repository (read-only or full)
  - [ ] Monitoring/logging dashboards
  - [ ] Database admin tools (if applicable)
  - [ ] Issue tracking system (if applicable)

---

## POST-DELIVERY CHECKLIST (18 Items)

### Week 1: Go-Live Support (8 items)

- [ ] Production deployed successfully
- [ ] All 8 features working in production
- [ ] Monitor error tracking (Sentry, etc.) for issues
- [ ] Check performance metrics (Lighthouse, Core Web Vitals)
- [ ] Verify backup/restore procedures work
- [ ] Check uptime monitoring (should be 100%)
- [ ] Review database performance:
  - [ ] Query times < 100ms
  - [ ] No slow queries detected
  - [ ] Storage usage normal
- [ ] Customer support team trained on:
  - [ ] Common issues and solutions
  - [ ] How to escalate to engineering
  - [ ] How to access logs/monitoring

---

### Week 1-4: Bug Fixes & Optimization (5 items)

- [ ] All critical bugs reported by client fixed within 24 hours
- [ ] Performance optimization applied if metrics below targets
- [ ] User feedback incorporated into minor improvements
- [ ] Security issues (if any) patched immediately
- [ ] Client reviews production performance metrics

---

### Month 1: Transition to Maintenance (5 items)

- [ ] Hand over to client's engineering team (if applicable)
- [ ] Provide training on:
  - [ ] Codebase structure
  - [ ] How to add new features
  - [ ] How to deploy changes
  - [ ] Common customizations
- [ ] Establish SLA for support (response time, resolution time)
- [ ] Schedule follow-up meeting (30 days post-launch)
- [ ] Create internal post-mortem:
  - [ ] What went well
  - [ ] What could be improved
  - [ ] Learnings for next project

---

## ONGOING CLIENT SUPPORT (12 Items)

### Monthly (4 items)

- [ ] Review monitoring dashboards with client
- [ ] Check for any pending feature requests
- [ ] Security updates applied (Node.js, dependencies)
- [ ] Dependency update report reviewed (using Dependabot)

---

### Quarterly (4 items)

- [ ] Performance review and optimization
- [ ] Scalability assessment (can system handle 2x traffic?)
- [ ] Security audit performed
- [ ] Disaster recovery test (backup/restore)

---

### Annually (4 items)

- [ ] Major version upgrades evaluated (Next.js, Prisma, etc.)
- [ ] Full security audit (with external firm if appropriate)
- [ ] Capacity planning for next year
- [ ] Architecture review and modernization opportunities

---

## Red Flags - Do NOT Deploy If:

- ❌ TypeScript errors present (`bun run build` fails)
- ❌ ESLint errors present
- ❌ Critical security vulnerabilities found
- ❌ Lighthouse score < 70
- ❌ Tests not passing (> 95% pass rate)
- ❌ Database migrations not tested
- ❌ API documentation incomplete
- ❌ Environment variables not configured
- ❌ Error tracking not set up
- ❌ No database backup procedure
- ❌ HTTPS not configured
- ❌ Sensitive data in logs/error messages

---

## Green Lights - Safe to Deploy:

- ✅ All checklist items completed (or explicitly deferred)
- ✅ Code review approved
- ✅ Tests passing (>95%)
- ✅ Performance metrics good (Lighthouse >90)
- ✅ Security audit passed
- ✅ Staging deployment successful
- ✅ Client stakeholders agree to launch
- ✅ Support team trained and ready
- ✅ Monitoring/alerting operational
- ✅ Rollback plan in place

---

## Post-Launch Metrics to Track

### Week 1
- [ ] System uptime: 99.9%+
- [ ] API response time: < 200ms p95
- [ ] Error rate: < 0.1%
- [ ] Zero security incidents

### Month 1
- [ ] User sign-ups: As expected
- [ ] Feature adoption: As expected
- [ ] Support tickets: Track volume & resolution time
- [ ] Performance: Stable or improving

---

## Sign-Off

Once all checkboxes completed, get approval from:

- [ ] Tech Lead: ________________ Date: ________
- [ ] Project Manager: ________________ Date: ________
- [ ] Client Tech Lead: ________________ Date: ________
- [ ] Client Business Lead: ________________ Date: ________

**Deployment Approved:** Yes / No  
**Go-Live Date:** __________________  
**Support SLA:** __________________

---

## Notes & Issues Found During Delivery

(Document any issues, deviations from checklist, or special circumstances)

```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

## Next Review Date

Schedule next review meeting: __________________

This checklist is complete and ready to use. Print it, copy it, or convert it to a spreadsheet for your team!

# Zolai AI — Production Deployment Guide

**Status**: Ready for production deployment  
**Last Updated**: 2026-04-15  
**Verified**: All 36 audit fixes applied, 47/47 tests passing

---

## 📋 Pre-Deployment Checklist

### 1. Environment & Secrets

```bash
# Verify all required env vars are set
cat .env.production | grep -E "DATABASE_URL|BETTER_AUTH_SECRET|ZOLAI_API_URL"

# Required variables:
DATABASE_URL=postgresql://user:pass@host/zolai_prod
BETTER_AUTH_SECRET=<generate: openssl rand -base64 32>
ZOLAI_API_URL=https://api.zolai.space/chat
NEXTAUTH_URL=https://zolai.space
NEXTAUTH_SECRET=<generate: openssl rand -base64 32>

# Optional but recommended:
TELEGRAM_BOT_TOKEN=<if using Telegram webhooks>
TELEGRAM_WEBHOOK_SECRET=<required if using webhooks>
RESEND_API_KEY=<for email delivery>
CLOUDFLARE_R2_BUCKET=zolai-prod
CLOUDFLARE_R2_ACCOUNT_ID=<your account ID>
CLOUDFLARE_R2_ACCESS_KEY_ID=<your access key>
CLOUDFLARE_R2_SECRET_ACCESS_KEY=<your secret>
```

**Security**: Store secrets in your deployment platform's secret manager (Vercel, AWS Secrets Manager, etc.). Never commit `.env.production`.

### 2. Database Preparation

```bash
# 1. Create production database
createdb zolai_prod

# 2. Run migrations
bunx prisma migrate deploy

# 3. Seed dictionary (24,891 entries)
bunx tsx scripts/seed-dictionary.ts

# 4. Verify indexes were created
psql zolai_prod -c "\di" | grep -E "idx_vocabword|idx_post"
```

Expected indexes:
- `idx_vocabword_zolai_gin` (GIN full-text)
- `idx_vocabword_english_gin` (GIN full-text)
- `idx_post_status_featured` (composite)
- `idx_post_status_popular` (composite)

### 3. Build Verification

```bash
# Clean build
rm -rf .next
bun run build

# Check for errors
echo "Build status: $?"

# Verify bundle size
ls -lh .next/static/chunks/
```

### 4. Lint & Test

```bash
# ESLint (must be 0 errors)
bun run lint

# Run tests
npx playwright test

# Permission system tests
npm test -- permission
```

---

## 🌐 Domain Setup (zolai.space)

### 1. DNS Configuration

Add these records to your DNS provider (Cloudflare, Route53, etc.):

```
Type    Name              Value
A       zolai.space       <your-server-ip>
CNAME   www.zolai.space   zolai.space
CNAME   api.zolai.space   <your-api-domain>
TXT     zolai.space       v=spf1 include:sendgrid.net ~all
```

**Wait for DNS propagation** (5-30 minutes):
```bash
nslookup zolai.space
dig zolai.space
```

### 2. SSL Certificate

**Option A: Vercel (Automatic)**
- Vercel auto-provisions Let's Encrypt certificates
- No action needed

**Option B: Self-Hosted (Let's Encrypt)**
```bash
# Using Certbot
sudo certbot certonly --standalone -d zolai.space -d www.zolai.space

# Certificates stored in:
# /etc/letsencrypt/live/zolai.space/
```

**Option C: Cloudflare (Free)**
- Enable "Full (strict)" SSL mode in Cloudflare dashboard
- Cloudflare handles certificate provisioning

### 3. Security Headers

Add to `next.config.ts`:
```typescript
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
];

export default {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**Fastest, zero-config deployment:**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Link project
vercel link

# 3. Set production environment variables
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_SECRET
vercel env add ZOLAI_API_URL
# ... add all required vars

# 4. Deploy
vercel --prod

# 5. Verify deployment
vercel inspect
```

**Vercel Dashboard Setup:**
1. Go to https://vercel.com/dashboard
2. Import GitHub repo
3. Set environment variables
4. Configure custom domain: `zolai.space`
5. Enable auto-deployments on push to `main`

### Option 2: AWS (EC2 + RDS)

**For full control & scalability:**

```bash
# 1. Launch EC2 instance (Ubuntu 22.04)
# - Instance type: t3.medium (2 vCPU, 4GB RAM)
# - Security group: Allow 80, 443, 22

# 2. SSH into instance
ssh -i key.pem ubuntu@<instance-ip>

# 3. Install dependencies
sudo apt update && sudo apt install -y nodejs npm postgresql-client

# 4. Install Bun
curl -fsSL https://bun.sh/install | bash

# 5. Clone repo
git clone https://github.com/zolai/website.git
cd website/zolai-project

# 6. Install & build
bun install
bun run build

# 7. Start with PM2
npm i -g pm2
pm2 start "bun start" --name zolai
pm2 save
pm2 startup

# 8. Setup Nginx reverse proxy
sudo apt install -y nginx
# Configure /etc/nginx/sites-available/zolai
sudo systemctl start nginx
```

**Nginx config** (`/etc/nginx/sites-available/zolai`):
```nginx
server {
    listen 80;
    server_name zolai.space www.zolai.space;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name zolai.space www.zolai.space;

    ssl_certificate /etc/letsencrypt/live/zolai.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zolai.space/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 3: Docker + Kubernetes

**For enterprise deployments:**

```dockerfile
# Dockerfile
FROM oven/bun:latest AS builder
WORKDIR /app
COPY . .
RUN bun install && bun run build

FROM oven/bun:latest
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
EXPOSE 3000
CMD ["bun", "start"]
```

```bash
# Build & push
docker build -t zolai:latest .
docker tag zolai:latest your-registry/zolai:latest
docker push your-registry/zolai:latest

# Deploy to Kubernetes
kubectl apply -f k8s/deployment.yaml
```

---

## ✅ Post-Deployment Verification

### 1. Health Checks

```bash
# Check homepage loads
curl -I https://zolai.space

# Check API endpoints
curl https://zolai.space/api/dictionary/stats
curl https://zolai.space/api/zolai/stats

# Check auth
curl -X POST https://zolai.space/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 2. Performance Baseline

```bash
# Measure key endpoints
time curl https://zolai.space/api/dictionary/search?q=lungdam
time curl https://zolai.space/api/zolai/wiki
time curl https://zolai.space/api/zolai/stats
```

**Expected response times:**
- Dictionary search: < 200ms
- Wiki list: < 500ms
- Stats: < 300ms

### 3. Security Verification

```bash
# Check SSL certificate
openssl s_client -connect zolai.space:443 -servername zolai.space

# Verify security headers
curl -I https://zolai.space | grep -E "X-Content-Type|X-Frame|Referrer"

# Check HSTS
curl -I https://zolai.space | grep Strict-Transport
```

### 4. Database Verification

```bash
# Connect to production database
psql $DATABASE_URL

# Verify tables exist
\dt

# Check row counts
SELECT COUNT(*) FROM "VocabWord";  -- Should be ~24,891
SELECT COUNT(*) FROM "Post";
SELECT COUNT(*) FROM "User";
```

### 5. Monitoring Setup

**Vercel Analytics:**
```bash
# Already enabled in Vercel dashboard
# View at: https://vercel.com/dashboard/zolai/analytics
```

**Application Monitoring (Sentry):**
```bash
# 1. Create Sentry project
# 2. Add to .env.production
SENTRY_DSN=https://key@sentry.io/project-id

# 3. Initialize in app
import * as Sentry from "@sentry/nextjs";
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

---

## 🔄 Continuous Deployment

### GitHub Actions (Auto-deploy on push)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Bun
        uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
      
      - name: Run tests
        run: npm test
      
      - name: Run linter
        run: bun run lint
      
      - name: Build
        run: bun run build
      
      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 🚨 Rollback Procedure

### If deployment fails:

**Vercel:**
```bash
# View deployment history
vercel list

# Rollback to previous deployment
vercel rollback
```

**Self-hosted:**
```bash
# Stop current version
pm2 stop zolai

# Checkout previous commit
git checkout HEAD~1

# Rebuild & restart
bun run build
pm2 start zolai
```

**Database rollback:**
```bash
# List migrations
bunx prisma migrate status

# Rollback one migration
bunx prisma migrate resolve --rolled-back <migration-name>
```

---

## 📊 Monitoring & Alerts

### Key Metrics to Monitor

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Response time (p95) | < 500ms | > 1000ms |
| Error rate | < 0.1% | > 1% |
| Database connections | < 20 | > 30 |
| Memory usage | < 500MB | > 800MB |
| CPU usage | < 50% | > 80% |

### Setup Alerts

**Vercel:**
- Automatic alerts for failed deployments
- Configure in Vercel dashboard → Settings → Alerts

**Sentry:**
- Automatic alerts for errors
- Configure in Sentry dashboard → Alerts

**Custom (AWS CloudWatch):**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name zolai-high-error-rate \
  --alarm-description "Alert if error rate > 1%" \
  --metric-name ErrorRate \
  --namespace Zolai \
  --statistic Average \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold
```

---

## 📝 Post-Deployment Checklist

- [ ] DNS records propagated
- [ ] SSL certificate valid
- [ ] Homepage loads (< 2s)
- [ ] API endpoints responding
- [ ] Database connected
- [ ] Auth system working
- [ ] Email delivery working
- [ ] File uploads working (S3/R2)
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Team notified
- [ ] Documentation updated

---

## 🆘 Troubleshooting

### "Database connection refused"
```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Verify database is running
psql $DATABASE_URL -c "SELECT 1"

# Check firewall rules
```

### "Build fails with TypeScript errors"
```bash
# Clear cache
rm -rf .next node_modules
bun install
bun run build
```

### "High memory usage"
```bash
# Check for memory leaks
pm2 monit

# Restart application
pm2 restart zolai

# Increase heap size
NODE_OPTIONS="--max-old-space-size=2048" bun start
```

### "Slow API responses"
```bash
# Check database query performance
EXPLAIN ANALYZE SELECT * FROM "VocabWord" WHERE zolai ILIKE '%lungdam%';

# Verify indexes exist
\di

# Check cache hit rates
redis-cli INFO stats
```

---

## 📞 Support

- **Documentation**: https://zolai.space/docs
- **Status Page**: https://status.zolai.space
- **Issues**: https://github.com/zolai/website/issues
- **Email**: support@zolai.space

---

**Deployment Date**: ___________  
**Deployed By**: ___________  
**Verified By**: ___________

# Next.js Starter Project - Deployment Procedures

**Version:** 1.0.0  
**Created:** 2026-04-09  
**Framework:** Next.js 16 (App Router)  
**Database:** PostgreSQL

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
3. [Self-Hosted on VPS](#self-hosted-on-vps)
4. [Railway Deployment](#railway-deployment)
5. [AWS Deployment](#aws-deployment)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [SSL/HTTPS Configuration](#sslhttps-configuration)
9. [Monitoring & Logging](#monitoring--logging)
10. [Rollback Procedures](#rollback-procedures)
11. [Scaling & Performance](#scaling--performance)

---

## Quick Start

**Goal:** Production-ready deployment in < 30 minutes

### Choose Your Platform

| Platform | Setup Time | Cost | Scaling | Recommendation |
|----------|-----------|------|---------|-----------------|
| **Vercel** | 5 min | Free tier + pay-as-you-go | Automatic | ✅ **RECOMMENDED** for new projects |
| **Railway** | 10 min | $5-50/month | Easy auto-scaling | Good for simple apps |
| **VPS (DigitalOcean/Linode)** | 30 min | $5-20/month | Manual scaling | Best for control |
| **AWS** | 45 min | $50-500/month | Highly scalable | Enterprise option |

**For first-time clients:** Use **Vercel** (easiest, least DevOps overhead)

---

## Vercel Deployment (Recommended)

### Prerequisites

- [Vercel account](https://vercel.com/signup) (free)
- Git repository (GitHub, GitLab, or Bitbucket)
- Production database (Neon, Railway, or other PostgreSQL provider)

### Step 1: Create Vercel Project

```bash
# Option A: Using Vercel CLI
npm i -g vercel
vercel

# Option B: Using Vercel Dashboard
# 1. Go to https://vercel.com/dashboard
# 2. Click "Add New..." → "Project"
# 3. Select your Git repository
# 4. Click "Import"
```

### Step 2: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NODE_ENV=production
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 3: Configure Build Settings

In Vercel Dashboard → Settings → Build & Development Settings:

- **Build Command:** `bun run build`
- **Output Directory:** `.next`
- **Install Command:** `bun install`
- **Development Command:** `bun run dev`
- **Node Version:** 22 (or your target version)

### Step 4: Deploy Database

Use **Neon** (recommended, serverless PostgreSQL):

1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Set `DATABASE_URL` in Vercel

**Alternative:** Use Railway, AWS RDS, or DigitalOcean Managed Database

### Step 5: Run Database Migrations

```bash
# Option A: Vercel Deployment Hooks (recommended)
# 1. Create deployment hook in Vercel Dashboard
# 2. Add pre-build script to package.json

# Option B: Manual migration after deployment
vercel env pull .env.production.local
bunx prisma migrate deploy
vercel redeploy
```

**package.json:**
```json
{
  "scripts": {
    "build": "bunx prisma migrate deploy && bun run build",
    "start": "bun start"
  }
}
```

### Step 6: Test Deployment

```bash
# Preview deployment
vercel --prod

# Test in browser
https://your-project.vercel.app

# Check logs
vercel logs
```

### Step 7: Connect Custom Domain

In Vercel Dashboard → Settings → Domains:

1. Add your custom domain
2. Update DNS records (Vercel provides exact records)
3. Wait for DNS propagation (5-30 minutes)
4. HTTPS enabled automatically

### Vercel Deployment Complete! ✅

**Time: ~15 minutes**

**Monitoring:**
- Vercel Dashboard → Deployments (see past/current deployments)
- Vercel Dashboard → Analytics (real-time performance)
- Vercel Dashboard → Logs (request/function logs)

**Auto-Scaling:**
- Vercel automatically scales based on traffic
- No configuration needed

**Cost:**
- Free tier: 100 GB bandwidth/month
- Paid tier: $20/month + usage

---

## Self-Hosted on VPS

For clients who need more control or have specific hosting requirements.

### Prerequisites

- VPS with Ubuntu 22.04 (DigitalOcean, Linode, Hetzner, etc.)
- Root or sudo access
- 2GB RAM minimum, 2 CPU cores
- PostgreSQL database (local or managed)

### Step 1: Server Setup

```bash
# SSH into server
ssh root@your-server-ip

# Update system packages
apt update && apt upgrade -y

# Install Node.js (v22 LTS)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt install -y nodejs

# Install Bun (or use npm/yarn if preferred)
curl -fsSL https://bun.sh/install | bash

# Install PostgreSQL client
apt install -y postgresql-client

# Install Nginx
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2

# Install Certbot (SSL certificates)
apt install -y certbot python3-certbot-nginx
```

### Step 2: Create Application User

```bash
# Create non-root user for app
useradd -m -s /bin/bash appuser
sudo -u appuser mkdir -p /home/appuser/app
```

### Step 3: Clone & Setup Application

```bash
# Switch to app user
sudo -u appuser -i

# Clone repository
cd ~/app
git clone https://github.com/your-org/starter-nextjs.git .

# Install dependencies
bun install

# Create environment file
nano .env.production

# Paste production variables:
# DATABASE_URL=postgresql://...
# NEXTAUTH_URL=https://yourdomain.com
# NEXTAUTH_SECRET=...
# NODE_ENV=production
```

### Step 4: Build Application

```bash
# Build for production
bun run build

# Verify build succeeded
ls -la .next/standalone
```

### Step 5: Configure PM2

```bash
# Create PM2 config file
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [
    {
      name: 'nextjs-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 4000,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 6: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/nextjs-app
```

**/etc/nginx/sites-available/nextjs-app:**
```nginx
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy settings
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Static files (Next.js)
    location /_next/static/ {
        alias /home/appuser/app/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/nextjs-app /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl restart nginx
```

### Step 7: Setup SSL/HTTPS

```bash
# Get SSL certificate (automatic)
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

### Step 8: Database Migrations

```bash
# Run migrations (as appuser)
cd ~/app
bunx prisma migrate deploy

# Seed database (optional)
bunx prisma db seed
```

### Step 9: Monitoring Setup

```bash
# System monitoring (optional but recommended)
apt install -y htop

# Log rotation
sudo nano /etc/logrotate.d/nextjs-app
```

**/etc/logrotate.d/nextjs-app:**
```
/home/appuser/app/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    missingok
    create 0640 appuser appuser
}
```

### Step 10: Firewall Configuration

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### VPS Deployment Complete! ✅

**Time: ~45 minutes**

**Verification:**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs

# Check Nginx
sudo systemctl status nginx

# Test HTTPS
curl -I https://yourdomain.com
```

**Maintenance:**
```bash
# Deploy new version
git pull
bun install
bun run build
pm2 restart nextjs-app

# View real-time logs
pm2 logs

# Monitor memory/CPU
pm2 monit
```

---

## Railway Deployment

Quick deployment for simple applications.

### Step 1: Push Code to Git

```bash
git push origin main
```

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Create account
3. Create new project
4. Select "GitHub" → Choose repository

### Step 3: Configure Services

**Add PostgreSQL:**
1. Click "Add Service"
2. Select "PostgreSQL"
3. Auto-configured database created

**Configure Next.js App:**
1. Railway auto-detects Next.js
2. Set Environment Variables:
   - `DATABASE_URL` (auto-filled from PostgreSQL)
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `NODE_ENV=production`

### Step 4: Deploy

1. Click "Deploy" button
2. Wait for build to complete (~2 minutes)
3. Access domain (railway.app provides public URL)

### Railway Deployment Complete! ✅

**Time: ~10 minutes**

**Cost:** Starts at $5/month

---

## AWS Deployment

For enterprise applications requiring more control.

### Step 1: Create RDS Database

1. Go to AWS Console → RDS
2. Create PostgreSQL database
3. Note: Master username, password, endpoint

### Step 2: Create EC2 Instance

1. Go to AWS Console → EC2
2. Launch t3.medium instance (Ubuntu 22.04)
3. Create security group allowing ports 22, 80, 443
4. Download key pair (PEM file)

### Step 3: Deploy Application

Follow "Self-Hosted on VPS" steps above, but:
- Use RDS endpoint for DATABASE_URL
- Increase RAM to match t3.medium (2GB)

### Step 4: Setup Load Balancer (Optional)

For scaling across multiple instances:
1. Create Application Load Balancer
2. Create Auto Scaling Group
3. Set target group to EC2 instances

---

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<openssl-rand-base64-32>

# Environment
NODE_ENV=production
```

### Optional Variables

```bash
# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Monitoring (Sentry)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Analytics (Posthog, Mixpanel, etc.)
NEXT_PUBLIC_ANALYTICS_KEY=xxxxx

# Feature flags
NEXT_PUBLIC_FEATURE_BLOG=true
NEXT_PUBLIC_FEATURE_COMMENTS=true
NEXT_PUBLIC_FEATURE_TEAMS=true
```

### Secure Variable Management

**DO NOT:**
- ❌ Commit `.env.production` to git
- ❌ Expose secrets in logs
- ❌ Use same secrets across environments

**DO:**
- ✅ Use platform's secrets management (Vercel, Railway, etc.)
- ✅ Rotate secrets periodically
- ✅ Use different secrets per environment (dev/staging/prod)

---

## Database Setup

### Creating Database

**Option 1: Managed (Recommended)**
- Neon: https://neon.tech (serverless PostgreSQL)
- Railway: Free PostgreSQL
- AWS RDS: https://aws.amazon.com/rds/

**Option 2: Self-Hosted**
```bash
# On your VPS
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres createdb starter_prod
sudo -u postgres createuser appuser
```

### Running Migrations

```bash
# Pull environment
vercel env pull .env.production.local

# Run migrations
bunx prisma migrate deploy

# Seed database (optional)
bunx prisma db seed

# Verify
bunx prisma studio  # Visual database browser
```

### Backup Strategy

**Automated (Recommended):**
```bash
# pg_dump for daily backups
0 2 * * * /usr/bin/pg_dump dbname > /backups/db-$(date +\%Y-\%m-\%d).sql
```

**Restore:**
```bash
psql dbname < /backups/db-2026-04-09.sql
```

---

## SSL/HTTPS Configuration

### Vercel (Automatic)
- ✅ Automatically configured
- ✅ Auto-renewal
- ✅ Free

### Self-Hosted (Certbot)

```bash
# Install
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Force HTTPS

**Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Monitoring & Logging

### Vercel Analytics

Dashboard → Analytics:
- Real User Monitoring (RUM)
- Performance metrics
- Error tracking
- Web Vitals

### Self-Hosted: PM2 Monitoring

```bash
# Web dashboard
pm2 web

# Real-time monitoring
pm2 monit

# Log viewing
pm2 logs nextjs-app
pm2 logs nextjs-app --lines 100
```

### Error Tracking (Sentry)

1. Create [Sentry](https://sentry.io) account
2. Create new project (Next.js)
3. Set `SENTRY_DSN` environment variable
4. Errors automatically tracked

### Structured Logging

```typescript
// lib/logger.ts
export const logger = {
  info: (msg: string, data?: any) => console.log(JSON.stringify({ level: 'info', msg, ...data })),
  error: (msg: string, error?: Error) => console.error(JSON.stringify({ level: 'error', msg, error: error?.message })),
  warn: (msg: string, data?: any) => console.warn(JSON.stringify({ level: 'warn', msg, ...data }))
};
```

---

## Rollback Procedures

### Vercel

```bash
# View deployment history
vercel deployments

# Rollback to previous deployment
vercel rollback

# Or manually redeploy old commit
git checkout <old-commit>
git push origin main
```

### Self-Hosted

```bash
# Revert to previous commit
git checkout <old-commit>
bun run build
pm2 restart nextjs-app

# Or use PM2's built-in versioning
pm2 save
git checkout <old-commit>
bun run build
pm2 restart nextjs-app
```

---

## Scaling & Performance

### Horizontal Scaling (More Servers)

**Vercel:**
- Automatic (no configuration)

**AWS:**
- Create Auto Scaling Group
- Add Load Balancer
- Database connection pooling (PgBouncer)

### Vertical Scaling (Bigger Server)

**Vercel:**
- Automatic based on traffic

**Self-Hosted:**
```bash
# Upgrade VPS instance size
# Monitor CPU/memory usage
pm2 monit

# Increase PM2 instances if needed
pm2 start ecosystem.config.js -i 4  # 4 processes
```

### Database Optimization

```bash
# View slow queries
SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC;

# Analyze query plan
EXPLAIN ANALYZE SELECT * FROM posts WHERE status = 'PUBLISHED';

# Add indexes
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_comments_post_id ON comments(post_id);
```

### Caching

**HTTP Caching:**
```typescript
// next.config.ts
const nextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, s-maxage=86400'
        }
      ]
    }
  ]
};
```

**Database Query Caching:**
```typescript
// lib/cache.ts
import { cache } from 'react';

export const getCachedPosts = cache(async () => {
  return await prisma.post.findMany({ where: { status: 'PUBLISHED' } });
});
```

**Redis (Optional):**
```bash
# Add Redis to Docker Compose or managed service
# Use for session caching, rate limiting
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing locally
- [ ] `bun run build` succeeds with no errors
- [ ] Environment variables configured
- [ ] Database migrations created and tested
- [ ] SSL/HTTPS working
- [ ] Monitoring/logging setup
- [ ] Backup procedures tested
- [ ] DNS configured
- [ ] Health check endpoint created
- [ ] Team trained on deployment process
- [ ] Rollback plan documented

---

## Troubleshooting Deployments

### Build fails

```bash
# Check logs
vercel logs --follow

# Test build locally
bun run build

# Rebuild without cache
vercel --prod --force
```

### Database connection fails

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check for migration errors
bunx prisma migrate status
```

### Slow performance

```bash
# Check Lighthouse scores
vercel analytics

# Profile database queries
bunx prisma studio

# Check server resources
pm2 monit
```

### SSL certificate errors

```bash
# Check certificate expiry
openssl s_client -connect yourdomain.com:443

# Renew certificate
sudo certbot renew --force-renewal
```

---

## Next Steps

1. Choose deployment platform (Vercel recommended)
2. Set up environment variables
3. Run database migrations
4. Test deployment
5. Configure monitoring
6. Train team on maintenance
7. Schedule regular backups

**Questions? Check the troubleshooting section or review platform-specific docs.**

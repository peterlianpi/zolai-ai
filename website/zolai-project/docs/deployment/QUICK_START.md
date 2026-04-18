# Zolai AI — Quick Start Deployment (5 minutes)

**For Vercel (recommended):**

## Step 1: Prepare Environment (2 min)

```bash
# Generate secrets
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo "BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
```

## Step 2: Deploy to Vercel (2 min)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Step 3: Configure Environment (1 min)

In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add:
   - `DATABASE_URL` = your PostgreSQL connection string
   - `BETTER_AUTH_SECRET` = generated above
   - `NEXTAUTH_SECRET` = generated above
   - `ZOLAI_API_URL` = https://api.zolai.space/chat
   - `NEXTAUTH_URL` = https://zolai.space

3. Go to Settings → Domains
4. Add custom domain: `zolai.space`
5. Follow DNS setup instructions

## Step 4: Verify (1 min)

```bash
# Wait 2-3 minutes for DNS propagation
curl https://zolai.space/api/dictionary/stats

# Should return: { "success": true, "data": { "total": 24891 } }
```

---

## For Self-Hosted (AWS EC2):

```bash
# 1. SSH into instance
ssh -i key.pem ubuntu@<ip>

# 2. Setup
sudo apt update && sudo apt install -y nodejs npm postgresql-client
curl -fsSL https://bun.sh/install | bash
git clone https://github.com/zolai/website.git
cd website/zolai-project

# 3. Build & run
bun install
bun run build
npm i -g pm2
pm2 start "bun start" --name zolai
pm2 save

# 4. Setup Nginx (see DEPLOYMENT_GUIDE.md for full config)
sudo apt install -y nginx
# ... configure SSL & reverse proxy

# 5. Verify
curl https://zolai.space/api/dictionary/stats
```

---

**Done!** Your Zolai AI platform is live at https://zolai.space

See `DEPLOYMENT_GUIDE.md` for detailed instructions, monitoring, and troubleshooting.

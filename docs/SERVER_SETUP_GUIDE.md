# Server Setup & Troubleshooting Guide

> Complete instructions for setting up and maintaining the Zolai project on AWS Lightsail with Cloudflare.
> Created: 2026-04-04 | Server: YOUR_SERVER_IP | Domain: YOUR_DOMAIN

---

## 1. Server Setup (AWS Lightsail)

### 1.1 Create Instance
- **OS:** Ubuntu 24.04 LTS
- **Instance type:** 2 vCPU, 2GB RAM (minimum)
- **SSH Key:** `LightsailDefaultKey-ap-northeast-1.pem`
- **Static IP:** YOUR_SERVER_IP

### 1.2 Firewall Rules (AWS Lightsail Networking)
Go to **Lightsail Console → Your Instance → Networking** → Add these rules:
| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | 0.0.0.0/0 | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP (Cloudflare) |
| 443 | TCP | 0.0.0.0/0 | HTTPS (Cloudflare) |

### 1.3 Initial Server Setup
```bash
# Connect to server
ssh -i /path/to/pem-key.pem $USER@YOUR_SERVER_IP

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install dependencies
sudo apt-get install -y nginx curl wget jq git

# Create swap (critical for 2GB RAM)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 2. Node.js Installation

### 2.1 Install via NVM
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 24
nvm install 24
nvm use 24
nvm alias default 24

# Verify
node --version  # v24.x.x
npm --version   # 11.x.x
```

---

## 3. OpenClaw Installation

### 3.1 Install OpenClaw
```bash
npm install -g openclaw@latest
openclaw --version  # Should show 2026.4.2+
```

### 3.2 Configure OpenClaw
```bash
# Create .openclaw directory
mkdir -p ~/.openclaw

# Copy openclaw.json from backup or create new
# (Contains model providers, agents, channels, etc.)
```

### 3.3 Create Systemd Service
```bash
sudo tee /etc/systemd/system/openclaw.service > /dev/null << 'EOF'
[Unit]
Description=OpenClaw AI Gateway
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=ubuntu
Environment=HOME=/path/to/zolai
Environment=PATH=/home/$USER/.nvm/versions/node/v24.14.1/bin:/usr/bin:/bin
Environment=NVM_DIR=/home/$USER/.nvm
WorkingDirectory=/home/$USER/.openclaw
ExecStart=/home/$USER/.nvm/versions/node/v24.14.1/bin/openclaw gateway --port 18789
Restart=always
RestartSec=10
StandardOutput=append:/home/$USER/.openclaw/openclaw.log
StandardError=append:/home/$USER/.openclaw/openclaw.log
MemoryMax=1200M

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable openclaw
sudo systemctl start openclaw
```

---

## 4. Nginx Configuration

### 4.1 Install Nginx
```bash
sudo apt-get install -y nginx
```

### 4.2 Configure Sites
```bash
sudo tee /etc/nginx/sites-available/YOUR_DOMAIN > /dev/null << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name YOUR_DOMAIN www.YOUR_DOMAIN;
    root /var/www/YOUR_DOMAIN;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name openclaw.YOUR_DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
NGINX

# Enable site
sudo ln -sf /etc/nginx/sites-available/YOUR_DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 4.3 Create Portfolio Directory
```bash
sudo mkdir -p /var/www/YOUR_DOMAIN
# Place your index.html in /var/www/YOUR_DOMAIN/
```

---

## 5. Cloudflare Setup

### 5.1 DNS Records
Go to **Cloudflare Dashboard → YOUR_DOMAIN → DNS**

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | YOUR_DOMAIN | YOUR_SERVER_IP | Proxied |
| A | openclaw.YOUR_DOMAIN | YOUR_SERVER_IP | Proxied |
| A | 9router.YOUR_DOMAIN | YOUR_SERVER_IP | Proxied |

**Important:** Remove any CNAME records pointing to `cfargotunnel.com` for these domains.

### 5.2 SSL/TLS Settings
Go to **Cloudflare → SSL/TLS → Overview**
- Set to **Flexible** (since nginx doesn't have SSL cert yet)
- Or **Full** if you add self-signed cert later

### 5.3 Cloudflare Tunnel Setup

#### 5.3.1 Create Tunnel
Go to **Zero Trust → Networks → Tunnels → Create Tunnel**
- Name: `OpenClaw`
- Type: `cloudflared`
- Copy the token (looks like: `eyJhIjoi...`)

#### 5.3.2 Install cloudflared on Server
```bash
# Download cloudflared
curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
```

#### 5.3.3 Configure Tunnel Ingress Rules
**This is critical!** Go to **Tunnel → Public Hostname** and add:

| Type | Subdomain | Domain | Service Type | URL |
|------|-----------|--------|-------------|-----|
| HTTP | (blank) | YOUR_DOMAIN | HTTP | http://localhost:80 |
| HTTP | www | YOUR_DOMAIN | HTTP | http://localhost:80 |
| HTTP | openclaw | YOUR_DOMAIN | HTTP | http://localhost:18789 |
| HTTP | 9router | YOUR_DOMAIN | HTTP | http://127.0.0.1:20128 |

**⚠️ Common 404 Fix:** If `YOUR_DOMAIN` returns 404, it means the tunnel ingress rule is missing. Add it in the dashboard.

#### 5.3.4 Start Tunnel on Server
```bash
# Kill any existing tunnel
pkill -9 -f cloudflared

# Start tunnel (replace TOKEN with your actual token)
nohup cloudflared tunnel --url http://localhost:80 run --token YOUR_TOKEN_HERE > /tmp/cloudflared.log 2>&1 &

# Verify tunnel is connected
ps aux | grep cloudflared | grep -v grep
tail -5 /tmp/cloudflared.log  # Should show "Registered tunnel connection"
```

---

## 6. Troubleshooting

### 6.1 521 Error (Web Server Down)
**Cause:** Cloudflare can't reach your origin server.

**Fix:**
1. Check nginx is running: `sudo systemctl is-active nginx`
2. Check port 80 is open in AWS Lightsail firewall
3. Check nginx is listening: `ss -tlnp | grep ':80'`
4. Check nginx config: `sudo nginx -t`

### 6.2 404 Error (Not Found)
**Cause:** Cloudflare Tunnel has no ingress rule for the domain.

**Fix:**
1. Go to **Zero Trust → Tunnels → OpenClaw → Public Hostname**
2. Add missing hostname rule pointing to correct service
3. Wait 1-2 minutes for config to propagate

### 6.3 OpenClaw Not Starting
**Cause:** Multiple instances, memory issues, or port conflict.

**Fix:**
```bash
# Kill all OpenClaw processes
pkill -9 -f openclaw
sleep 3

# Restart via systemd
sudo systemctl daemon-reload
sudo systemctl restart openclaw

# Verify
sudo systemctl status openclaw
curl -s http://127.0.0.1:18789/health
```

### 6.4 Memory Issues (OOM)
**Cause:** Server has only 2GB RAM, OpenClaw uses ~500MB.

**Fix:**
```bash
# Check memory
free -h

# Kill unnecessary processes
pkill -9 -f 'opencode-ai' 2>/dev/null  # Different from openclaw
pkill -9 -f 'outline' 2>/dev/null
pkill -9 -f 'x-ui' 2>/dev/null

# Drop caches
echo 3 | sudo tee /proc/sys/vm/drop_caches

# Verify swap is active
swapon --show
```

### 6.5 DNS Not Propagating
**Cause:** DNS changes take time to propagate.

**Fix:**
```bash
# Check DNS from server
dig YOUR_DOMAIN +short
dig openclaw.YOUR_DOMAIN +short

# Should return Cloudflare IPs: 104.21.43.136, 172.67.179.223
# Wait 5-15 minutes if not updated
```

---

## 7. Quick Commands Reference

### 7.1 Service Management
```bash
# Check status
sudo systemctl status nginx
sudo systemctl status openclaw
ps aux | grep cloudflared | grep -v grep

# Restart
sudo systemctl restart nginx
sudo systemctl restart openclaw
pkill -9 -f cloudflared && nohup cloudflared tunnel --url http://localhost:80 run --token TOKEN > /tmp/cloudflared.log 2>&1 &

# Check logs
sudo tail -20 /var/log/nginx/error.log
tail -20 /home/$USER/.openclaw/openclaw.log
tail -20 /tmp/cloudflared.log
```

### 7.2 Testing
```bash
# Test portfolio locally
curl -s -H 'Host: YOUR_DOMAIN' http://127.0.0.1:80/ | head -5

# Test OpenClaw locally
curl -s -H 'Host: openclaw.YOUR_DOMAIN' http://127.0.0.1:80/health

# Test via server IP
curl -s http://YOUR_SERVER_IP/

# Check DNS
dig YOUR_DOMAIN +short
```

### 7.3 Memory Management
```bash
# Check memory
free -h

# Kill orphans
pkill -9 -f 'opencode-ai' 2>/dev/null
pkill -9 -f 'outline' 2>/dev/null

# Drop caches
echo 3 | sudo tee /proc/sys/vm/drop_caches

# Check top processes
ps aux --sort=-%mem | head -10
```

---

## 8. Architecture Diagram

```
User Browser
    │
    ▼
Cloudflare (DNS + Proxy)
    │
    ▼
Cloudflare Tunnel (cloudflared)
    │
    ├── YOUR_DOMAIN ──→ http://localhost:80 (nginx) ──→ /var/www/YOUR_DOMAIN/
    ├── openclaw.YOUR_DOMAIN ──→ http://localhost:18789 (OpenClaw)
    └── 9router.YOUR_DOMAIN ──→ http://127.0.0.1:20128 (9router)
```

---

## 9. Backup & Recovery

### 9.1 Backup Important Files
```bash
# OpenClaw config
cp ~/.openclaw/openclaw.json ~/backups/openclaw-$(date +%Y%m%d).json

# Nginx config
sudo cp /etc/nginx/sites-available/YOUR_DOMAIN ~/backups/nginx-$(date +%Y%m%d).conf

# Cloudflared token
echo "TOKEN: $(ps aux | grep cloudflared | grep -o 'token [^ ]*' | cut -d' ' -f2)" > ~/backups/tunnel-token.txt
```

### 9.2 Restore from Backup
```bash
# Restore OpenClaw config
cp ~/backups/openclaw-YYYYMMDD.json ~/.openclaw/openclaw.json
sudo systemctl restart openclaw

# Restore nginx config
sudo cp ~/backups/nginx-YYYYMMDD.conf /etc/nginx/sites-available/YOUR_DOMAIN
sudo nginx -t && sudo systemctl reload nginx
```

---

## 10. Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 521 Error | Nginx not running or port 80 blocked | `sudo systemctl restart nginx`, check AWS firewall |
| 404 Error | Missing tunnel ingress rule | Add hostname in Cloudflare Tunnel dashboard |
| OpenClaw crashes | Memory limit or multiple instances | Kill orphans, restart via systemd |
| DNS not working | Cloudflare proxy caching | Wait 5-15 min, or purge cache in Cloudflare |
| Tunnel disconnected | cloudflared process died | Restart with `nohup cloudflared tunnel ...` |
| High memory usage | Too many services running | Kill unnecessary processes, add swap |

# AWS Lightsail Deployment — Complete Guide

> How to deploy OpenClaw + Zolai to AWS Lightsail. Fully documented for reuse.
> Created: 2026-04-04 | Server: <SERVER_IP> (ap-northeast-1)

---

## Server Specs

| Resource | Value |
|----------|-------|
| **Instance** | AWS Lightsail (Ubuntu 24.04) |
| **CPU** | 2 vCPU |
| **RAM** | 2 GB |
| **Disk** | 58 GB SSD |
| **GPU** | None (use Kaggle for training) |
| **IP** | <SERVER_IP> |
| **User** | ubuntu |
| **SSH Key** | `config/ssh/aws-lightsail.pem` |

---

## What's Deployed

### OpenClaw (AI Agent System)
- **55 agents** — All agent configs, sessions, memory
- **86 skills** — All skills including 6 Zolai-specific + 80 general
- **23 workspaces** — All workspace directories (guest, philosophy, security, dev, etc.)
- **Memory/State** — 135MB memory, state, flows, tasks, cron, delivery-queue
- **Node.js** — v20.20.2, npm 10.8.2, dependencies installed
- **Gateway** — Port 18789, bound to 0.0.0.0 for remote access
- **Telegram** — 4 bot accounts (peter, junior, default, bitget)
- **WhatsApp** — Configured (disabled by default)

### Zolai Project
- **23 source files** — Python package (src/zolai/)
- **20 notebooks** — Kaggle notebooks
- **72 scripts** — Pipeline, crawler, cleaner, OCR, deploy
- **8 agent configs** — Zolai-specific agents
- **7 skills** — Zolai-specific skills
- **Python venv** — .venv with typer, rich, kaggle, kagglehub, huggingface_hub

### Secrets Deployed
- **Kaggle API** — username: peterpausianlian, key in ~/.kaggle/kaggle.json
- **9router** — http://127.0.0.1:20128/v1 (local proxy)
- **OpenRouter** — Free models (hunter-alpha, gemini-2.0-flash-exp)
- **Telegram bots** — 4 bot tokens in openclaw.json
- **OpenClaw gateway** — Token auth on port 18789

---

## Deployment Steps (For Future Reuse)

### Step 1: Server Setup
```bash
# Install system packages
sudo apt-get update && sudo apt-get install -y \
    python3 python3-pip python3.12-venv \
    nodejs npm git curl wget jq rsync ufw

# Create swap (2GB RAM is tight)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Firewall
sudo ufw allow 22/tcp
sudo ufw allow 18789/tcp  # OpenClaw
sudo ufw allow 8300/tcp   # Zolai API
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp
echo 'y' | sudo ufw enable
```

### Step 2: Deploy OpenClaw
```bash
# Push openclaw.json (contains ALL secrets)
scp -i config/ssh/aws-lightsail.pem ~/.openclaw/openclaw.json $USER@<SERVER_IP>:~/.openclaw/

# Push agents, skills, scripts
rsync -avz --exclude='node_modules' -e "ssh -i config/ssh/aws-lightsail.pem" \
    ~/.openclaw/agents/ $USER@<SERVER_IP>:~/.openclaw/agents/
rsync -avz -e "ssh -i config/ssh/aws-lightsail.pem" \
    ~/.openclaw/skills/ $USER@<SERVER_IP>:~/.openclaw/skills/
rsync -avz -e "ssh -i config/ssh/aws-lightsail.pem" \
    ~/.openclaw/scripts/ $USER@<SERVER_IP>:~/.openclaw/scripts/

# Push workspaces (skip large dirs)
for ws in workspace workspace-guest workspace-philosophy workspace-moltbook \
          workspace-security workspace-dev workspace-pcore workspace-scholar \
          workspace-linguistic workspace-zomi-data workspace-main; do
    rsync -avz --exclude='.git' --exclude='node_modules' \
        --exclude='moltbook_knowledge' --exclude='colab_venv' \
        -e "ssh -i config/ssh/aws-lightsail.pem" \
        ~/.openclaw/$ws/ $USER@<SERVER_IP>:~/.openclaw/$ws/
done

# Push memory, state, flows, tasks, cron
for dir in memory state flows tasks cron delivery-queue; do
    rsync -avz -e "ssh -i config/ssh/aws-lightsail.pem" \
        ~/.openclaw/$dir/ $USER@<SERVER_IP>:~/.openclaw/$dir/
done

# Install npm deps
ssh -i config/ssh/aws-lightsail.pem $USER@<SERVER_IP> \
    "cd ~/.openclaw && npm install"

# Update paths (peter → ubuntu)
ssh -i config/ssh/aws-lightsail.pem $USER@<SERVER_IP> "
python3 -c \"
import json
with open('/home/$USER/.openclaw/openclaw.json', 'r') as f:
    cfg = json.load(f)
for agent in cfg.get('agents', {}).get('list', []):
    for key in ['workspace', 'agentDir']:
        if key in agent and '/path/to/zolai/' in agent[key]:
            agent[key] = agent[key].replace('/path/to/zolai/', '/path/to/zolai/')
cfg['gateway']['bind'] = '0.0.0.0'
cfg['gateway']['mode'] = 'remote'
with open('/home/$USER/.openclaw/openclaw.json', 'w') as f:
    json.dump(cfg, f, indent=2)
\"
"
```

### Step 3: Deploy Zolai Project
```bash
# Push code (exclude data, venv, .git)
rsync -avz \
    --exclude='.git' --exclude='.venv' --exclude='venv' \
    --exclude='__pycache__' --exclude='data/' \
    --exclude='*.zip' --exclude='*.pt' --exclude='*.bin' \
    -e "ssh -i config/ssh/aws-lightsail.pem" \
    /path/to/zolai/ \
    $USER@<SERVER_IP>:~/Documents/Projects/zolai/

# Setup Python venv + deps
ssh -i config/ssh/aws-lightsail.pem $USER@<SERVER_IP> "
cd ~/Documents/Projects/zolai
python3 -m venv .venv
source .venv/bin/activate
pip install -q typer rich python-dotenv httpx beautifulsoup4 lxml pyyaml pydantic kaggle kagglehub huggingface_hub
"

# Push Kaggle auth
scp -i config/ssh/aws-lightsail.pem ~/.kaggle/kaggle.json $USER@<SERVER_IP>:~/.kaggle/
ssh -i config/ssh/aws-lightsail.pem $USER@<SERVER_IP> "chmod 600 ~/.kaggle/kaggle.json"
```

### Step 4: Verify
```bash
ssh -i config/ssh/aws-lightsail.pem $USER@<SERVER_IP> "
# OpenClaw
ls ~/.openclaw/openclaw.json && echo '✓ openclaw.json'
ls ~/.openclaw/package.json && echo '✓ package.json'
echo \"Agents: \$(ls ~/.openclaw/agents/ | wc -l)\"
echo \"Skills: \$(ls ~/.openclaw/skills/ | wc -l)\"

# Zolai
source ~/Documents/Projects/zolai/.venv/bin/activate
python3 -c 'import typer; import kaggle; print(\"✓ Python deps OK\")'

# Kaggle
kaggle config view | head -3
"
```

---

## Quick Commands

### All-in-one deploy script
```bash
bash scripts/deploy-to-aws.sh --setup          # First time only
bash scripts/deploy-to-aws.sh --push-code      # Push code changes
bash scripts/deploy-to-aws.sh --push-data      # Push data files
bash scripts/deploy-to-aws.sh --pull-data      # Pull cleaned data
bash scripts/deploy-to-aws.sh --run full       # Run pipeline on server
bash scripts/deploy-to-aws.sh --status         # Check server status
bash scripts/deploy-to-aws.sh --ssh            # Open SSH session
bash scripts/deploy-to-aws.sh --deploy-openclaw # Deploy OpenClaw
```

### SSH
```bash
ssh -i config/ssh/aws-lightsail.pem $USER@<SERVER_IP>
```

### Start OpenClaw on server
```bash
ssh -i config/ssh/aws-lightsail.pem $USER@<SERVER_IP> "
cd ~/.openclaw
node node_modules/.bin/openclaw 2>&1 &
echo 'OpenClaw started on port 18789'
"
```

### Run Kaggle pipeline from server
```bash
ssh -i config/ssh/aws-lightsail.pem $USER@<SERVER_IP> "
source ~/Documents/Projects/zolai/.venv/bin/activate
cd ~/Documents/Projects/zolai
bash scripts/kaggle-pipeline.sh --stage full
"
```

---

## AWS Security Group Rules

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP | SSH |
| 18789 | TCP | Your IP | OpenClaw Gateway |
| 8300 | TCP | Your IP | Zolai API |
| 443 | TCP | 0.0.0.0/0 | HTTPS |
| 80 | TCP | 0.0.0.0/0 | HTTP |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Permission denied (publickey)` | `chmod 600 config/ssh/aws-lightsail.pem` |
| `kaggle: command not found` | `source ~/Documents/Projects/zolai/.venv/bin/activate` |
| `npm: command not found` | `sudo apt-get install -y nodejs npm` |
| `python3-venv not found` | `sudo apt-get install -y python3.12-venv` |
| OOM (2GB RAM) | Swap is configured; check `free -h` |
| Kaggle 403 | Verify `~/.kaggle/kaggle.json` has correct key |
| OpenClaw won't start | Check `node --version`, run `npm install` in `~/.openclaw` |

#!/usr/bin/env bash
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# ============================================================
# OpenClaw Migration Script — Local → Lightning AWS Server
# ============================================================
# Usage:
#   On SOURCE machine (local):
#     bash scripts/migrate-openclaw-to-aws.sh --pack
#
#   Transfer the tarball to AWS server:
#     scp /tmp/openclaw-migration.tar.gz user@aws-server:/path/to/zolai/
#
#   On AWS server:
#     bash scripts/migrate-openclaw-to-aws.sh --unpack
#     bash scripts/migrate-openclaw-to-aws.sh --configure --aws-ip <IP>
#
# ============================================================
set -euo pipefail

SOURCE_DIR="$HOME/.openclaw"
PROJECTS_DIR="$HOME/Documents/Projects"
ZOLOAI_DIR="$PROJECTS_DIR/zolai"
TOOLKIT_DIR="$PROJECTS_DIR/zolai-toolkit"
TARBALL="/tmp/openclaw-migration.tar.gz"
AWS_USER="${AWS_USER:-peter}"
AWS_HOST="${AWS_HOST:-}"
AWS_IP="${AWS_IP:-}"

# ─── Colors ────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; }

# ─── PACK: Create migration tarball on source machine ──────────────────────
pack() {
    info "Packing OpenClaw for migration..."

    # What to include
    ITEMS=()

    # Core OpenClaw config
    if [ -d "$SOURCE_DIR" ]; then
        ITEMS+=(".openclaw/openclaw.json")
        ITEMS+=(".openclaw/openclaw.json.bak")
        ITEMS+=(".openclaw/openclaw.json.bak.1")
        ITEMS+=(".openclaw/openclaw.json.bak.2")
        ITEMS+=(".openclaw/openclaw.json.bak.3")
        ITEMS+=(".openclaw/openclaw.json.bak.4")
        ITEMS+=(".openclaw/package.json")
        ITEMS+=(".openclaw/package-lock.json")
        ITEMS+=(".openclaw/WORKSPACE.md")
        ITEMS+=(".openclaw/OPENCLAW_AUDIT_2026-03-12.md")
    fi

    # Agents
    if [ -d "$SOURCE_DIR/agents" ]; then
        ITEMS+=(".openclaw/agents/")
    fi

    # Skills
    if [ -d "$SOURCE_DIR/skills" ]; then
        ITEMS+=(".openclaw/skills/")
    fi

    # Scripts
    if [ -d "$SOURCE_DIR/scripts" ]; then
        ITEMS+=(".openclaw/scripts/")
    fi

    # Memory, state, flows, tasks
    for d in memory state flows tasks cron delivery-queue; do
        if [ -d "$SOURCE_DIR/$d" ]; then
            ITEMS+=(".openclaw/$d/")
        fi
    done

    # Workspace files (exclude .git, node_modules, large files)
    for ws in workspace workspace-guest workspace-philosophy workspace-moltbook workspace-security; do
        if [ -d "$SOURCE_DIR/$ws" ]; then
            ITEMS+=(".openclaw/$ws/")
        fi
    done

    # Browser, canvas, completions, credentials, devices, docs, exec-approvals
    for d in browser canvas completions credentials devices docs exec-approvals.json settings; do
        if [ -e "$SOURCE_DIR/$d" ]; then
            ITEMS+=(".openclaw/$d")
        fi
    fi

    # All workspace-* directories
    for ws in $SOURCE_DIR/workspace-*; do
        if [ -d "$ws" ]; then
            ITEMS+=(".openclaw/$(basename $ws)/")
        fi
    done

    # Sandboxes, sandbox
    for d in sandboxes sandbox; do
        if [ -d "$SOURCE_DIR/$d" ]; then
            ITEMS+=(".openclaw/$d/")
        fi
    fi

    # Zolai unified project
    if [ -d "$ZOLOAI_DIR" ]; then
        ITEMS+=("Documents/Projects/zolai/")
    fi

    # Zolai toolkit (if still separate)
    if [ -d "$TOOLKIT_DIR" ]; then
        ITEMS+=("Documents/Projects/zolai-toolkit/")
    fi

    # Bibles
    if [ -d "$PROJECTS_DIR/bibles" ]; then
        ITEMS+=("Documents/Projects/bibles/")
    fi

    # Data
    if [ -d "$PROJECTS_DIR/data" ]; then
        ITEMS+=("Documents/Projects/data/")
    fi

    # Create tarball (exclude large files, venvs, node_modules, checkpoints)
    info "Creating tarball: $TARBALL"
    info "Including ${#ITEMS[@]} items..."

    tar czf "$TARBALL" \
        --exclude='node_modules' \
        --exclude='.venv' \
        --exclude='venv' \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='.git' \
        --exclude='checkpoint-*' \
        --exclude='*.zip' \
        --exclude='*.pt' \
        --exclude='*.bin' \
        --exclude='*.safetensors' \
        --exclude='data/processed/corpus/cleaned/' \
        --exclude='data/archive/unified_corpus_6.2G.jsonl' \
        -C "$HOME" \
        "${ITEMS[@]}" 2>/dev/null

    SIZE=$(du -sh "$TARBALL" | cut -f1)
    ok "Tarball created: $TARBALL ($SIZE)"

    # Show next steps
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Transfer to AWS:"
    echo "     scp $TARBALL $AWS_USER@<AWS_IP>:~/openclaw-migration.tar.gz"
    echo ""
    echo "  2. On AWS server, run:"
    echo "     bash scripts/migrate-openclaw-to-aws.sh --unpack"
    echo "     bash scripts/migrate-openclaw-to-aws.sh --configure --aws-ip <AWS_IP>"
}

# ─── UNPACK: Extract on AWS server ────────────────────────────────────────
unpack() {
    info "Unpacking OpenClaw migration on AWS server..."

    TARBALL_IN="${1:-$HOME/openclaw-migration.tar.gz}"

    if [ ! -f "$TARBALL_IN" ]; then
        err "Tarball not found: $TARBALL_IN"
        err "Transfer it first: scp /tmp/openclaw-migration.tar.gz $AWS_USER@<AWS_IP>:~/"
        exit 1
    fi

    SIZE=$(du -sh "$TARBALL_IN" | cut -f1)
    info "Extracting $TARBALL_IN ($SIZE)..."

    tar xzf "$TARBALL_IN" -C "$HOME" 2>/dev/null

    ok "Extraction complete"

    # Verify
    echo ""
    info "Verifying migration..."

    checks=0
    for path in \
        "$HOME/.openclaw/openclaw.json" \
        "$HOME/.openclaw/agents" \
        "$HOME/.openclaw/skills" \
        "$HOME/.openclaw/scripts" \
        "$HOME/.openclaw/workspace" \
        "$HOME/Documents/Projects/zolai"; do
        if [ -e "$path" ]; then
            ok "  ✓ $path"
            ((checks++))
        else
            warn "  ✗ $path (missing)"
        fi
    done

    echo ""
    ok "Verified $checks items"
    echo ""
    info "Next: Run --configure to update paths and networking"
}

# ─── CONFIGURE: Update paths, networking, services on AWS ─────────────────
configure() {
    local aws_ip="${1:-}"

    if [ -z "$aws_ip" ]; then
        # Try to detect
        aws_ip=$(curl -s ifconfig.me 2>/dev/null || echo "")
        if [ -z "$aws_ip" ]; then
            aws_ip=$(hostname -I | awk '{print $1}')
        fi
    fi

    info "Configuring OpenClaw for AWS server ($aws_ip)..."

    # 1. Update openclaw.json gateway binding
    if [ -f "$HOME/.openclaw/openclaw.json" ]; then
        info "Updating gateway config..."

        # Update gateway bind to 0.0.0.0 for remote access
        python3 -c "
import json
with open('$HOME/.openclaw/openclaw.json', 'r') as f:
    cfg = json.load(f)

# Gateway: bind to all interfaces for remote access
cfg['gateway']['bind'] = '0.0.0.0'
cfg['gateway']['mode'] = 'remote'

# Update allowed origins for web UI
cfg['gateway']['controlUi']['allowedOrigins'] = [
    'http://$aws_ip:18789',
    'http://localhost:18789',
    'http://127.0.0.1:18789'
]

# Update remote URL
cfg['gateway']['remote']['url'] = f'ws://$aws_ip:18789'

# Update workspace paths to new locations
for agent in cfg.get('agents', {}).get('list', []):
    ws = agent.get('workspace', '')
    if 'zolai-toolkit' in ws:
        agent['workspace'] = '${PROJECT_ROOT}'

with open('$HOME/.openclaw/openclaw.json', 'w') as f:
    json.dump(cfg, f, indent=2)
print('✓ openclaw.json updated')
"
    fi

    # 2. Update .env files in zolai project
    if [ -f "$HOME/Documents/Projects/zolai/.env" ]; then
        info "Updating Zolai .env..."
        sed -i "s|ZOLAI_ROOT=.*|ZOLAI_ROOT=${PROJECT_ROOT}|" "$HOME/Documents/Projects/zolai/.env"
        sed -i "s|ZOLAI_DATA_ROOT=.*|ZOLAI_DATA_ROOT=${PROJECT_ROOT}/data|" "$HOME/Documents/Projects/zolai/.env"
        ok "✓ .env updated"
    fi

    # 3. Install system dependencies
    info "Installing system dependencies..."
    if command -v apt-get &>/dev/null; then
        sudo apt-get update -qq
        sudo apt-get install -y -qq \
            python3 python3-pip python3-venv \
            nodejs npm \
            git curl wget \
            jq \
            2>/dev/null || warn "Some packages may need manual install"
    fi
    ok "✓ System dependencies installed"

    # 4. Setup Python venv for Zolai
    if [ -d "$HOME/Documents/Projects/zolai" ]; then
        info "Setting up Zolai Python environment..."
        cd "$HOME/Documents/Projects/zolai"
        python3 -m venv .venv
        source .venv/bin/activate
        pip install -q -e ".[full]" 2>/dev/null || warn "pip install had issues, may need manual fix"
        ok "✓ Zolai environment ready"
    fi

    # 5. Setup OpenClaw
    if [ -f "$HOME/.openclaw/package.json" ]; then
        info "Setting up OpenClaw..."
        cd "$HOME/.openclaw"
        npm install --quiet 2>/dev/null || warn "npm install had issues"
        ok "✓ OpenClaw dependencies installed"
    fi

    # 6. Create systemd service for OpenClaw
    info "Creating systemd service..."
    cat > /tmp/openclaw.service << 'EOF'
[Unit]
Description=OpenClaw AI Agent System
After=network.target

[Service]
Type=simple
User=peter
WorkingDirectory=/path/to/zolai/.openclaw
ExecStart=/usr/bin/node /path/to/zolai/.openclaw/node_modules/.bin/openclaw
Restart=on-failure
RestartSec=10
Environment=HOME=/path/to/zolai
Environment=PATH=/path/to/zolai/.openclaw/node_modules/.bin:/usr/local/bin:/usr/bin:/bin

[Install]
WantedBy=multi-user.target
EOF

    sudo mv /tmp/openclaw.service /etc/systemd/system/openclaw.service
    sudo systemctl daemon-reload
    sudo systemctl enable openclaw
    ok "✓ OpenClaw systemd service created (not started)"

    # 7. Create systemd service for Zolai API
    if [ -d "$HOME/Documents/Projects/zolai" ]; then
        info "Creating Zolai API systemd service..."
        cat > /tmp/zolai-api.service << EOF
[Unit]
Description=Zolai Toolkit REST API
After=network.target

[Service]
Type=simple
User=peter
WorkingDirectory=${PROJECT_ROOT}
ExecStart=${PROJECT_ROOT}/.venv/bin/zolai api --host 0.0.0.0 --port 8300
Restart=on-failure
RestartSec=10
Environment=HOME=/path/to/zolai
EnvironmentFile=${PROJECT_ROOT}/.env

[Install]
WantedBy=multi-user.target
EOF
        sudo mv /tmp/zolai-api.service /etc/systemd/system/zolai-api.service
        sudo systemctl daemon-reload
        sudo systemctl enable zolai-api
        ok "✓ Zolai API systemd service created (not started)"
    fi

    # 8. Firewall rules
    info "Configuring firewall..."
    if command -v ufw &>/dev/null; then
        sudo ufw allow 18789/tcp comment "OpenClaw Gateway"
        sudo ufw allow 8300/tcp comment "Zolai API"
        sudo ufw allow 443/tcp comment "HTTPS"
        sudo ufw allow 80/tcp comment "HTTP"
        ok "✓ UFW rules added"
    fi

    # 9. AWS Security Group reminder
    echo ""
    warn "IMPORTANT: Also open these ports in AWS Security Group:"
    echo "  - 18789/tcp (OpenClaw Gateway)"
    echo "  - 8300/tcp  (Zolai API)"
    echo "  - 443/tcp   (HTTPS)"
    echo "  - 22/tcp    (SSH)"

    # 10. Summary
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  MIGRATION COMPLETE${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "To start services:"
    echo "  sudo systemctl start openclaw"
    echo "  sudo systemctl start zolai-api"
    echo ""
    echo "Access points:"
    echo "  OpenClaw Web UI: http://$aws_ip:18789"
    echo "  Zolai API:       http://$aws_ip:8300"
    echo ""
    echo "Check status:"
    echo "  sudo systemctl status openclaw"
    echo "  sudo systemctl status zolai-api"
    echo "  journalctl -u openclaw -f"
}

# ─── STATUS: Check migration status ───────────────────────────────────────
status() {
    echo -e "${CYAN}=== OpenClaw Migration Status ===${NC}"
    echo ""

    echo "Source files:"
    for path in \
        "$HOME/.openclaw/openclaw.json" \
        "$HOME/.openclaw/agents" \
        "$HOME/.openclaw/skills" \
        "$HOME/.openclaw/scripts" \
        "$HOME/Documents/Projects/zolai"; do
        if [ -e "$path" ]; then
            echo -e "  ${GREEN}✓${NC} $path"
        else
            echo -e "  ${RED}✗${NC} $path"
        fi
    done

    echo ""
    echo "Services:"
    for svc in openclaw zolai-api; do
        if systemctl is-active "$svc" &>/dev/null; then
            echo -e "  ${GREEN}●${NC} $svc (running)"
        elif systemctl is-enabled "$svc" &>/dev/null; then
            echo -e "  ${YELLOW}○${NC} $svc (enabled, stopped)"
        else
            echo -e "  ${RED}○${NC} $svc (not configured)"
        fi
    done
}

# ─── MAIN ─────────────────────────────────────────────────────────────────
case "${1:-help}" in
    --pack|-p)
        pack
        ;;
    --unpack|-u)
        unpack "${2:-}"
        ;;
    --configure|-c)
        configure "${2:-}"
        ;;
    --status|-s)
        status
        ;;
    --help|-h|help)
        echo "Usage: $0 {--pack|--unpack|--configure|--status}"
        echo ""
        echo "  --pack       Create migration tarball on source machine"
        echo "  --unpack     Extract tarball on AWS server"
        echo "  --configure  Update paths, networking, services on AWS"
        echo "  --status     Check migration status"
        ;;
    *)
        err "Unknown command: $1"
        echo "Usage: $0 {--pack|--unpack|--configure|--status}"
        exit 1
        ;;
esac

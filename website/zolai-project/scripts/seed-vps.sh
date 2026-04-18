#!/usr/bin/env bash
# scripts/seed-vps.sh
# Run seed scripts on the VPS against the local PostgreSQL database
# Usage: bash scripts/seed-vps.sh
set -e

SSH_HOST="zolai"
DEPLOY_PATH="/home/ubuntu/zolai"

echo "=== Seeding VPS database (localhost:5432/zolai_prod) ==="

# 1. Copy the new seed script to VPS
echo "[1/3] Copying seed script..."
scp scripts/seed-new-content-2026.ts $SSH_HOST:$DEPLOY_PATH/scripts/seed-new-content-2026.ts
echo "  ✓ Copied"

# 2. Run seed on VPS with production env
echo "[2/3] Running seed on VPS..."
ssh $SSH_HOST "
  export PATH=\$HOME/.bun/bin:\$PATH
  cd $DEPLOY_PATH
  set -a && source .env.production && set +a
  echo \"  DB: \$DATABASE_URL\"
  bun scripts/seed-new-content-2026.ts
"

echo "[3/3] Done."
echo ""
echo "To run the full master seed:"
echo "  ssh $SSH_HOST 'cd $DEPLOY_PATH && source .env.production && bash scripts/seed-master.sh'"

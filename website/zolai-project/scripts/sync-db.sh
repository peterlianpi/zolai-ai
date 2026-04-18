#!/usr/bin/env bash
# scripts/sync-db.sh
# Sync content tables between VPS PostgreSQL ↔ Local Neon
# Uses pg_dump --inserts with ON CONFLICT DO NOTHING — safe for Neon (no superuser needed)
# Usage:
#   bash scripts/sync-db.sh              # VPS → Local (default)
#   bash scripts/sync-db.sh local-to-vps # Local → VPS
set -e

VPS_DB="postgresql://zolai:zolai_prod_2026@localhost:5432/zolai_prod"
LOCAL_DB="postgresql://neondb_owner:npg_lyYq04pvzNTn@ep-little-butterfly-a1p8qakt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
SSH_HOST="zolai"
TMP="/tmp/zolai_sync_$$.sql"

# Content tables only — no auth/session/user tables
CONTENT_TABLES="post post_meta post_term site_setting menu menu_item wiki_entry notification_template lesson_plan lesson lesson_unit curriculum_section curriculum_unit curriculum_sub_unit vocab_word"

direction="${1:-vps-to-local}"
cleanup() { rm -f "$TMP"; }
trap cleanup EXIT

dump_flags() {
  local flags="--data-only --no-owner --no-acl --inserts --rows-per-insert=100 --on-conflict-do-nothing"
  for t in $CONTENT_TABLES; do flags="$flags -t $t"; done
  echo "$flags"
}

if [ "$direction" = "vps-to-local" ]; then
  echo "=== Sync: VPS → Local Neon ==="
  echo "[1/3] Dumping from VPS..."
  ssh $SSH_HOST "pg_dump $(dump_flags) '$VPS_DB'" > "$TMP" 2>/dev/null
  echo "  ✓ $(wc -l < "$TMP") lines"

  echo "[2/3] Applying to Local Neon (upsert)..."
  psql "$LOCAL_DB" -q -f "$TMP" 2>&1 | grep -i "error" | head -10 || true
  echo "  ✓ Done"

else
  echo "=== Sync: Local Neon → VPS ==="
  echo "[1/3] Dumping from Local Neon..."
  pg_dump $(dump_flags) "$LOCAL_DB" > "$TMP" 2>/dev/null
  echo "  ✓ $(wc -l < "$TMP") lines"

  echo "[2/3] Applying to VPS (upsert)..."
  ssh $SSH_HOST "psql '$VPS_DB' -q" < "$TMP" 2>&1 | grep -i "error" | head -10 || true
  echo "  ✓ Done"
fi

echo "[3/3] Row counts after sync:"
VPS_POSTS=$(ssh $SSH_HOST "psql '$VPS_DB' -t -c 'SELECT COUNT(*) FROM post;'" 2>/dev/null | tr -d ' \n')
LOCAL_POSTS=$(psql "$LOCAL_DB" -t -c "SELECT COUNT(*) FROM post;" 2>/dev/null | tr -d ' \n')
VPS_WIKI=$(ssh $SSH_HOST "psql '$VPS_DB' -t -c 'SELECT COUNT(*) FROM wiki_entry;'" 2>/dev/null | tr -d ' \n')
LOCAL_WIKI=$(psql "$LOCAL_DB" -t -c "SELECT COUNT(*) FROM wiki_entry;" 2>/dev/null | tr -d ' \n')
VPS_SETTINGS=$(ssh $SSH_HOST "psql '$VPS_DB' -t -c 'SELECT COUNT(*) FROM site_setting;'" 2>/dev/null | tr -d ' \n')
LOCAL_SETTINGS=$(psql "$LOCAL_DB" -t -c "SELECT COUNT(*) FROM site_setting;" 2>/dev/null | tr -d ' \n')

printf "  %-12s VPS: %-6s Local: %s\n" "posts"    "$VPS_POSTS"    "$LOCAL_POSTS"
printf "  %-12s VPS: %-6s Local: %s\n" "wiki"     "$VPS_WIKI"     "$LOCAL_WIKI"
printf "  %-12s VPS: %-6s Local: %s\n" "settings" "$VPS_SETTINGS" "$LOCAL_SETTINGS"
echo ""
echo "=== Done ==="

#!/usr/bin/env bash
# scripts/seed-master.sh
# Master seed: runs all seed scripts in correct order
# Usage: bash scripts/seed-master.sh
set -e

export PATH=$HOME/.bun/bin:$PATH
export DATABASE_URL="${DATABASE_URL:-postgresql://zolai:zolai_prod_2026@localhost:5432/zolai_prod}"
WIKI_ROOT="${WIKI_ROOT:-/home/ubuntu/zolai/wiki}"
DICT_PATH="${DICT_PATH:-/home/ubuntu/zolai/data/dict_enriched_v1.jsonl}"

cd "$(dirname "$0")/.."

ok()   { echo "  ✓ $1"; }
fail() { echo "  ✗ $1 FAILED"; }

echo "=== Zolai Master Seed ==="
echo "DB: $DATABASE_URL"
echo ""

# 1. Site config
echo "[1/8] Site settings..."
bun scripts/seed-site-config.ts 2>/dev/null && ok "site settings" || fail "site settings"

# 2. Menus (public routes only)
echo "[2/8] Menus..."
bun scripts/fix-menus.ts 2>/dev/null && ok "menus" || fail "menus"

# 3. Dictionary
echo "[3/8] Dictionary (24K words)..."
if [ -f "$DICT_PATH" ]; then
  DICT_PATH=$DICT_PATH bun scripts/seed-dictionary.ts 2>/dev/null && ok "dictionary" || fail "dictionary"
else
  echo "  ⚠ $DICT_PATH not found — skipping"
fi

# 4. Lesson plans A1–C2
echo "[4/8] Lesson plans..."
bun scripts/seed-lessons.ts 2>/dev/null && ok "lesson plans" || fail "lesson plans"

# 5. Curriculum (Duolingo-style sections)
echo "[5/8] Curriculum sections..."
bun scripts/seed-curriculum.ts 2>/dev/null && ok "curriculum" || fail "curriculum"

# 6. Wiki entries from markdown
echo "[6/8] Wiki entries..."
if [ -d "$WIKI_ROOT" ]; then
  WIKI_ROOT=$WIKI_ROOT bun scripts/import-wiki.ts 2>/dev/null && ok "wiki" || fail "wiki"
else
  echo "  ⚠ $WIKI_ROOT not found — skipping"
fi

# 7. Public posts & news
echo "[7/9] Public posts & news..."
bun scripts/seed-public-content.ts 2>/dev/null && ok "posts" || fail "posts"

# 8. New content 2026 (training updates, research, roadmap)
echo "[8/9] New content 2026..."
bun scripts/seed-new-content-2026.ts 2>/dev/null && ok "new content 2026" || fail "new content 2026"

# 9. Grammar learning resources (requires AI keys — skip if not available)
echo "[9/9] Grammar resources (AI-generated, skipping)..."
echo "  ⚠ Run manually: bun scripts/seed-curriculum-content.ts"

echo ""
echo "=== Done ==="

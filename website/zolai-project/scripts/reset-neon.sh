#!/bin/bash
set -e

echo "🔄 Resetting Neon database and seeding..."
echo ""

NEON_URL="${DATABASE_URL}"

# Reset schema
echo "[1/5] Resetting schema..."
psql "$NEON_URL" -c "DROP SCHEMA IF EXISTS public CASCADE;"
psql "$NEON_URL" -c "CREATE SCHEMA public;"
psql "$NEON_URL" -c "GRANT ALL ON SCHEMA public TO neondb_owner;"
psql "$NEON_URL" -c "ALTER SCHEMA public OWNER TO neondb_owner;"
echo "✓ Schema reset"
echo ""

# Push schema
echo "[2/5] Pushing schema..."
bunx prisma db push --accept-data-loss
echo "✓ Schema pushed"
echo ""

# Seed data
echo "[3/5] Seeding site config..."
bunx tsx scripts/seed-site-config.ts
echo ""

echo "[4/5] Seeding dictionary (this will take a while)..."
bunx tsx scripts/seed-dictionary.ts
echo ""

echo "[5/5] Seeding curriculum..."
bunx tsx scripts/seed-curriculum.ts
bunx tsx scripts/seed-curriculum-content.ts
echo ""

# Verify
echo "📊 Verifying data..."
psql "$NEON_URL" -c "SELECT COUNT(*) as vocab FROM vocab_word; SELECT COUNT(*) as sections FROM curriculum_section;"
echo ""

echo "✅ Neon database reset and seeded successfully!"

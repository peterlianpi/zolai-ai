#!/bin/bash
set -e

echo "🗄️  Setting up local PostgreSQL database..."
echo ""

# Create database
echo "[1/5] Creating database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS zolai_local;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE zolai_local;"
sudo -u postgres psql -c "CREATE USER zolai_user WITH PASSWORD 'zolai_local_pass';" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE zolai_local TO zolai_user;"
sudo -u postgres psql -d zolai_local -c "GRANT ALL ON SCHEMA public TO zolai_user;"
echo "✓ Database created"
echo ""

# Update .env.local
echo "[2/5] Updating .env.local..."
if grep -q "^DATABASE_URL=" .env.local; then
  sed -i 's|^DATABASE_URL=.*|DATABASE_URL="postgresql://zolai_user:zolai_local_pass@localhost:5432/zolai_local"|' .env.local
else
  echo 'DATABASE_URL="postgresql://zolai_user:zolai_local_pass@localhost:5432/zolai_local"' >> .env.local
fi
echo "✓ .env.local updated"
echo ""

# Run migrations
echo "[3/5] Running migrations..."
bunx prisma migrate deploy
echo "✓ Migrations complete"
echo ""

# Seed data
echo "[4/5] Seeding data..."
echo "  → Site config..."
bunx tsx scripts/seed-site-config.ts
echo "  → Dictionary (this may take a while)..."
bunx tsx scripts/seed-dictionary.ts
echo "  → Curriculum..."
bunx tsx scripts/seed-curriculum.ts
echo "  → Curriculum content..."
bunx tsx scripts/seed-curriculum-content.ts
echo "✓ Data seeded"
echo ""

# Verify
echo "[5/5] Verifying..."
psql "postgresql://zolai_user:zolai_local_pass@localhost:5432/zolai_local" -c "SELECT COUNT(*) as vocab FROM vocab_word; SELECT COUNT(*) as sections FROM curriculum_section;"
echo ""

echo "✅ Local database setup complete!"
echo ""
echo "Database: zolai_local"
echo "User: zolai_user"
echo "Connection: postgresql://zolai_user:zolai_local_pass@localhost:5432/zolai_local"
echo ""
echo "Run 'bun dev' to start the application"

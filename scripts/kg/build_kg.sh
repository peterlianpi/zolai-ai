#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "== KG ingest wiki =="
python "$ROOT_DIR/scripts/kg/ingest_wiki.py"

echo "== KG embed chunks =="
python "$ROOT_DIR/scripts/kg/embed.py"

echo "== Import to Prisma (web app) =="
cd "$ROOT_DIR/website/zolai-project"
bunx tsx scripts/import-kg.ts "$ROOT_DIR/artifacts/kg"

echo "Done."


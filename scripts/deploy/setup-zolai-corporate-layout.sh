#!/usr/bin/env bash
set -euo pipefail

PROJECTS_ROOT="${PROJECTS_ROOT:-/path/to/zolai/Documents/Projects}"
CORP_DATA_ROOT="${CORP_DATA_ROOT:-$PROJECTS_ROOT/data/zolai}"
LEGACY_ZOMI_DATA="$PROJECTS_ROOT/data/zomi-ai"
LEGACY_CRAWLER_DATA="$PROJECTS_ROOT/data/zolai-smart-crawler"

mkdir -p \
  "$CORP_DATA_ROOT/raw" \
  "$CORP_DATA_ROOT/processed" \
  "$CORP_DATA_ROOT/verified" \
  "$CORP_DATA_ROOT/reports" \
  "$CORP_DATA_ROOT/manifests" \
  "$CORP_DATA_ROOT/training" \
  "$CORP_DATA_ROOT/state" \
  "$CORP_DATA_ROOT/legacy"

# Keep non-destructive legacy links for traceability
ln -sfn "$LEGACY_ZOMI_DATA" "$CORP_DATA_ROOT/legacy/zomi-ai"
ln -sfn "$LEGACY_CRAWLER_DATA" "$CORP_DATA_ROOT/legacy/zolai-smart-crawler"

# Best-effort copy from legacy locations into corporate canonical layout
if command -v rsync >/dev/null 2>&1; then
  if [[ -d "$LEGACY_ZOMI_DATA" ]]; then
    rsync -a --ignore-existing "$LEGACY_ZOMI_DATA/" "$CORP_DATA_ROOT/processed/" || true
  fi
  if [[ -d "$LEGACY_CRAWLER_DATA/raw" ]]; then
    rsync -a --ignore-existing "$LEGACY_CRAWLER_DATA/raw/" "$CORP_DATA_ROOT/raw/" || true
  fi
  if [[ -d "$LEGACY_CRAWLER_DATA/cleaned" ]]; then
    rsync -a --ignore-existing "$LEGACY_CRAWLER_DATA/cleaned/" "$CORP_DATA_ROOT/processed/" || true
  fi
fi

# Repoint project data symlinks to shared corporate root
for proj in "$PROJECTS_ROOT/zomi-ai" "$PROJECTS_ROOT/zolai-smart-crawler"; do
  [[ -d "$proj" ]] || continue
  if [[ -L "$proj/data" ]]; then
    ln -sfn "../data/zolai" "$proj/data"
  elif [[ ! -e "$proj/data" ]]; then
    ln -s "../data/zolai" "$proj/data"
  fi
done

printf 'Corporate Zolai layout ready: %s\n' "$CORP_DATA_ROOT"

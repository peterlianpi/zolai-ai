#!/usr/bin/env bash
# update-free-models.sh — Fetch and sync free-model list from upstream.
# Usage: bash scripts/update-free-models.sh [--check] [--output FILE]
#
# Adapted for zolai-ai. Fetches the free LLM model list and
# compares with local config. The script is idempotent and
# never modifies data/ or wiki/ content.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODELS_FILE="$ROOT/config/free_models.txt"
UPSTREAM_URL="${PCORE_FREE_MODELS_URL:-https://raw.githubusercontent.com/P-Core-System/pcore-orchestra/main/data/free-models.txt}"
MODELS_JSON="${ROOT}/config/free_models.json"

check_update() {
  echo "== Checking for free-model updates =="
  echo "Local:  $MODELS_FILE"
  echo "Local:  $MODELS_JSON"
  echo "Upstream: $UPSTREAM_URL"
  echo "---"

  if command -v curl &>/dev/null; then
    local remote_models
    remote_models=$(curl -sf "$UPSTREAM_URL" 2>/dev/null || echo "")
    if [ -z "$remote_models" ]; then
      echo "Could not reach upstream. Using local list."
      return 1
    fi

    local local_models=""
    if [ -f "$MODELS_FILE" ]; then
      local_models=$(cat "$MODELS_FILE" 2>/dev/null || echo "")
    fi

    if [ "$remote_models" != "$local_models" ]; then
      echo "Update available. Run with --output to update."
      echo "Remote has $(echo "$remote_models" | wc -l) models"
      echo "Local has $(echo "$local_models" | wc -l) models"
      return 0
    else
      echo "Models are up to date."
      return 0
    fi
  else
    echo "curl not found. Cannot check upstream."
    return 1
  fi
}

do_update() {
  local output="${1:-$MODELS_FILE}"
  echo "== Updating free models =="

  if command -v curl &>/dev/null; then
    curl -sf "$UPSTREAM_URL" -o "$output" 2>/dev/null || {
      echo "Failed to fetch from upstream. Keeping existing file."
      return 1
    }
    echo "Updated: $output"
  elif command -v wget &>/dev/null; then
    wget -q -O "$output" "$UPSTREAM_URL" 2>/dev/null || {
      echo "Failed to fetch from upstream. Keeping existing file."
      return 1
    }
    echo "Updated: $output"
  else
    echo "Neither curl nor wget available. Cannot fetch upstream."
    return 1
  fi

  # Also update JSON summary if config exists
  if [ -f "$MODELS_JSON" ]; then
    echo "Note: $MODELS_JSON exists; review manually."
  fi
}

do_list() {
  if [ -f "$MODELS_FILE" ]; then
    echo "== Free Models =="
    cat "$MODELS_FILE"
  elif [ -f "$MODELS_JSON" ]; then
    echo "== Free Models (JSON) =="
    cat "$MODELS_JSON"
  else
    echo "No free models file found at $MODELS_FILE or $MODELS_JSON"
  fi
}

case "${1:-check}" in
  check)   check_update ;;
  update)  do_update "${2:-}" ;;
  list)    do_list ;;
  --output) do_update "${2:-}" ;;
  *)       echo "Usage: $0 {check|update|list} [output-file]"
           echo "  --output FILE  write fetched models to FILE"
           exit 1 ;;
esac

#!/usr/bin/env bash
# session-claims.sh — Concurrent session coordination for P-Core orchestra agents.
# Usage:
#   bash scripts/session-claims.sh check "$PWD" <paths-you-will-touch>
#   bash scripts/session-claims.sh claim "$PWD" <paths>
#   bash scripts/session-claims.sh renew <session_id>
#   bash scripts/session-claims.sh release <session_id>
#   bash scripts/session-claims.sh gc
#
# Claims auto-expire after 30 min without heartbeat.
# Set PCORE_SESSION_ID for a stable identity across shells.
# If the script is not present, treat as no-op (visibility only, never blocking).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAIMS_DIR="$ROOT/.pcore-claims"
HEARTBEAT_MINUTES=30

mkdir -p "$CLAIMS_DIR"

session_id() {
  echo "${PCORE_SESSION_ID:-$(hostname)-$$}"
}

is_expired() {
  local claim_file="$1"
  local last_heartbeat
  last_heartbeat=$(stat -c %Y "$claim_file" 2>/dev/null || echo 0)
  local now
  now=$(date +%s)
  local age=$(( (now - last_heartbeat) / 60 ))
  [ "$age" -gt "$HEARTBEAT_MINUTES" ]
}

do_check() {
  local paths="${@:-}"
  echo "== Session claims check =="
  echo "Session: $(session_id)"
  echo "Scanning claims for paths: $paths"
  echo "---"
  local found=0
  for claim in "$CLAIMS_DIR"/*.json; do
    [ -f "$claim" ] || continue
    local sid claimed paths_expired
    sid=$(python3 -c "import json;print(json.load(open('$claim')).get('session_id',''))" 2>/dev/null || echo "")
    claimed=$(python3 -c "import json;print(' '.join(json.load(open('$claim')).get('paths',[])))" 2>/dev/null || echo "")
    if [ -z "$sid" ] || [ "$sid" = "$(session_id)" ]; then
      continue
    fi
    for p in $paths; do
      echo "$claimed" | grep -q "$p" && {
        if is_expired "$claim"; then
          echo "  [EXPIRED] $sid on $p"
        else
          echo "  [ACTIVE]  $sid on $p"
          found=1
        fi
      }
    done
  done
  [ "$found" -eq 0 ] && echo "  No active conflicting claims found."
}

do_claim() {
  local paths="${@:-}"
  local sid
  sid=$(session_id)
  local claim_file="$CLAIMS_DIR/${sid}.json"
  python3 -c "
import json, os
data = {'session_id': '$sid', 'paths': '$paths'.split(), 'timestamp': $(date +%s)}
with open('$claim_file', 'w') as f:
    json.dump(data, f, indent=2)
" 2>/dev/null || cat > "$claim_file" << HEREDOC
{"session_id": "$sid", "paths": "$paths", "timestamp": $(date +%s)}
HEREDOC
  echo "Claimed: $paths (session=$sid)"
}

do_renew() {
  local sid="${1:-$(session_id)}"
  local claim_file="$CLAIMS_DIR/${sid}.json"
  if [ -f "$claim_file" ]; then
    touch "$claim_file"
    echo "Renewed: $sid"
  else
    echo "No claim found for session: $sid"
    exit 1
  fi
}

do_release() {
  local sid="${1:-$(session_id)}"
  local claim_file="$CLAIMS_DIR/${sid}.json"
  if [ -f "$claim_file" ]; then
    rm "$claim_file"
    echo "Released: $sid"
  else
    echo "No claim to release for session: $sid"
  fi
}

do_gc() {
  local removed=0
  for claim in "$CLAIMS_DIR"/*.json; do
    [ -f "$claim" ] || continue
    if is_expired "$claim"; then
      rm "$claim"
      removed=$((removed + 1))
    fi
  done
  echo "GC: removed $removed expired claims"
}

case "${1:-check}" in
  check)   do_check "${@:2}" ;;
  claim)   do_claim "${@:2}" ;;
  renew)   do_renew "${2:-}" ;;
  release) do_release "${2:-}" ;;
  gc)      do_gc ;;
  *)       echo "Usage: $0 {check|claim|renew|release|gc} [args]"; exit 1 ;;
esac

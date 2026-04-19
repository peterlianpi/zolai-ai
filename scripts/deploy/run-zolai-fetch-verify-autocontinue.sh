#!/usr/bin/env bash
set -euo pipefail

WORK_ROOT="${WORK_ROOT:-/path/to/zolai/Documents/Projects/data/zolai}"
REPORT_ROOT="${REPORT_ROOT:-/path/to/zolai/Documents/Projects/data/zolai/reports}"
RUN_LABEL="${RUN_LABEL:-zolai-web-cycle}"
RESUME="${RESUME:-1}"

SEEDS_FILE="${SEEDS_FILE:-/path/to/zolai/.openclaw/skills/web-public-dataset-harvester/references/zolai-source-seeds.txt}"
RAW_OUT="$WORK_ROOT/raw/zolai_web_raw.jsonl"
VERIFIED_OUT="$WORK_ROOT/verified/zolai_web_verified.jsonl"
TRAIN_OUT="$WORK_ROOT/training/zolai_train_candidates.jsonl"
STATE_DIR="/path/to/zolai/.openclaw/state/zolai-web"
STATE_FILE="$STATE_DIR/$RUN_LABEL.state"
REPORT_FILE="$REPORT_ROOT/$RUN_LABEL.md"

mkdir -p "$WORK_ROOT/raw" "$WORK_ROOT/processed" "$WORK_ROOT/verified" "$WORK_ROOT/training" "$WORK_ROOT/manifests" "$REPORT_ROOT" "$STATE_DIR"
touch "$STATE_FILE"

stage_done() { grep -Fxq "$1" "$STATE_FILE"; }
mark_done() { stage_done "$1" || printf '%s\n' "$1" >> "$STATE_FILE"; }

section() {
  local title="$1"
  shift
  {
    printf '## %s\n\n' "$title"
    printf '```text\n'
    "$@" 2>&1 || true
    printf '\n```\n\n'
  } >> "$REPORT_FILE"
}

if [[ "$RESUME" != "1" || ! -s "$REPORT_FILE" ]]; then
  cat > "$REPORT_FILE" <<EOF
# Zolai Web Fetch + Verify Cycle

- Run label: $RUN_LABEL
- Timestamp: $(date -Iseconds)
- Seeds: $SEEDS_FILE

EOF
fi

if [[ "$RESUME" == "1" ]]; then
  if ! stage_done fetch; then
    section "Fetch Public Web Corpus" python3 /path/to/zolai/.openclaw/scripts/fetch-zolai-web-corpus.py "$SEEDS_FILE" "$RAW_OUT"
    mark_done fetch
  fi
else
  section "Fetch Public Web Corpus" python3 /path/to/zolai/.openclaw/scripts/fetch-zolai-web-corpus.py "$SEEDS_FILE" "$RAW_OUT"
fi

if [[ "$RESUME" == "1" ]]; then
  if ! stage_done verify; then
    section "Verify Zolai Relevance (Gemini + Local Heuristic)" python3 /path/to/zolai/.openclaw/scripts/verify-zolai-gemini.py "$RAW_OUT" "$VERIFIED_OUT"
    mark_done verify
  fi
else
  section "Verify Zolai Relevance (Gemini + Local Heuristic)" python3 /path/to/zolai/.openclaw/scripts/verify-zolai-gemini.py "$RAW_OUT" "$VERIFIED_OUT"
fi

if [[ "$RESUME" == "1" ]]; then
  if ! stage_done export_train; then
    section "Export High-Confidence Train Candidates" python3 /path/to/zolai/.openclaw/scripts/export-zolai-train-candidates.py "$VERIFIED_OUT" "$TRAIN_OUT"
    mark_done export_train
  fi
else
  section "Export High-Confidence Train Candidates" python3 /path/to/zolai/.openclaw/scripts/export-zolai-train-candidates.py "$VERIFIED_OUT" "$TRAIN_OUT"
fi

section "Quick Stats" python3 - <<'PY' "$VERIFIED_OUT"
import json,sys
from pathlib import Path
p=Path(sys.argv[1])
total=0
yes=0
for line in p.read_text(errors='ignore').splitlines():
    try:
        o=json.loads(line)
    except Exception:
        continue
    total+=1
    yes+=1 if o.get('is_zolai_relevant') else 0
print('rows_total=',total)
print('rows_relevant=',yes)
PY

section "Train Candidates Stats" python3 - <<'PY' "$TRAIN_OUT"
import json,sys
from pathlib import Path
p=Path(sys.argv[1])
rows=0
for line in p.read_text(errors='ignore').splitlines():
    try:
        json.loads(line)
    except Exception:
        continue
    rows += 1
print('rows_train_candidates=', rows)
print('train_out=', p)
PY

printf 'Wrote report: %s\n' "$REPORT_FILE"

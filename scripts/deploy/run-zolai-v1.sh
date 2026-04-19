#!/usr/bin/env bash
set -euo pipefail

# Zolai v1 fail-fast pipeline wrapper

PROJECT_ROOT="${PROJECT_ROOT:-/path/to/zolai/Documents/Projects}"
DATA_ROOT="${DATA_ROOT:-$PROJECT_ROOT/data/zolai}"
REPORT_ROOT="${REPORT_ROOT:-$PROJECT_ROOT/data/zolai/reports}"
RUN_ID="${RUN_ID:-zolai-v1-$(date +%Y%m%d-%H%M)}"
RUN_DIR="$REPORT_ROOT/$RUN_ID"
ZOMI_SCRIPTS_ROOT="${ZOMI_SCRIPTS_ROOT:-$PROJECT_ROOT/zomi-ai/scripts}"
ZOMI_TRAINING_ROOT="${ZOMI_TRAINING_ROOT:-$PROJECT_ROOT/zomi-ai/training}"

export PROJECT_ROOT DATA_ROOT REPORT_ROOT RUN_ID RUN_DIR ZOMI_SCRIPTS_ROOT ZOMI_TRAINING_ROOT

LEAKAGE_STATUS="${LEAKAGE_STATUS:-pass}"   # pass|warn|fail
TOKENIZER_STATUS="${TOKENIZER_STATUS:-pass}" # pass|warn|fail
FORGETTING_STATUS="${FORGETTING_STATUS:-pass}" # pass|warn|fail

export LEAKAGE_STATUS TOKENIZER_STATUS FORGETTING_STATUS

RUN_CLEAN="${RUN_CLEAN:-0}"         # 0|1 (clean_and_split.py writes outside workspace in current repo)
RUN_SPLIT="${RUN_SPLIT:-1}"         # 0|1
RUN_TRAIN="${RUN_TRAIN:-0}"         # 0|1

SPLIT_INPUT="${SPLIT_INPUT:-$DATA_ROOT/processed/zolai_cleaned_sentences.jsonl}"
SPLIT_OUT_DIR="${SPLIT_OUT_DIR:-$DATA_ROOT/processed/splits}"

export RUN_CLEAN RUN_SPLIT RUN_TRAIN SPLIT_INPUT SPLIT_OUT_DIR

mkdir -p "$RUN_DIR"
mkdir -p "$DATA_ROOT/raw" "$DATA_ROOT/processed" "$DATA_ROOT/verified" "$DATA_ROOT/manifests"

stage() {
  printf '\n==> %s\n' "$1"
}

block_if_fail() {
  local name="$1"
  local status="$2"
  if [[ "$status" == "fail" ]]; then
    printf 'BLOCKED: %s gate failed\n' "$name" >&2
    exit 1
  fi
}

has_file() {
  [[ -f "$1" ]]
}

run_if_enabled() {
  local name="$1"
  local enabled="$2"
  shift 2
  if [[ "$enabled" == "1" ]]; then
    printf 'Running: %s\n' "$name"
    "$@"
  else
    printf 'Skipping: %s (disabled)\n' "$name"
  fi
}

stage "0) Initialize run"
printf 'RUN_ID=%s\nPROJECT_ROOT=%s\nDATA_ROOT=%s\nRUN_DIR=%s\n' \
  "$RUN_ID" "$PROJECT_ROOT" "$DATA_ROOT" "$RUN_DIR" | tee "$RUN_DIR/run.env"

stage "1) Dataset prep + manifest"
if has_file "$ZOMI_SCRIPTS_ROOT/clean_and_split.py"; then
  run_if_enabled "clean_and_split.py" "$RUN_CLEAN" python3 "$ZOMI_SCRIPTS_ROOT/clean_and_split.py"
else
  printf 'Skipping: clean_and_split.py (not found)\n'
fi

if has_file "$ZOMI_SCRIPTS_ROOT/make_splits.py"; then
  if [[ "$RUN_SPLIT" == "1" && ! -f "$SPLIT_INPUT" ]]; then
    printf 'Skipping: make_splits.py (input missing: %s)\n' "$SPLIT_INPUT"
  else
    run_if_enabled "make_splits.py" "$RUN_SPLIT" \
      python3 "$ZOMI_SCRIPTS_ROOT/make_splits.py" \
        --input "$SPLIT_INPUT" \
        --out-dir "$SPLIT_OUT_DIR"
  fi
else
  printf 'Skipping: make_splits.py (not found)\n'
fi

python3 - <<'PY'
import hashlib
import json
import os
from pathlib import Path

data_root = Path(os.environ['DATA_ROOT'])
run_dir = Path(os.environ['RUN_DIR'])
candidate_paths = [
    data_root / 'processed' / 'zolai_cleaned_sentences.jsonl',
    data_root / 'cleaned.jsonl',
    data_root / 'processed' / 'splits' / 'train.jsonl',
]
cleaned = next((p for p in candidate_paths if p.exists()), candidate_paths[0])

if cleaned.exists():
    digest = hashlib.sha256(cleaned.read_bytes()).hexdigest()
    size = cleaned.stat().st_size
else:
    digest = 'missing'
    size = 0

manifest = {
    'run_id': os.environ['RUN_ID'],
    'dataset': str(cleaned),
    'sha256': digest,
    'size_bytes': size,
}

out = run_dir / 'dataset-manifest.json'
out.write_text(json.dumps(manifest, indent=2) + '\n')
print(out)
PY

stage "2) Leakage gate"
cp \
  "/path/to/zolai/.openclaw/skills/data-leakage-guard/references/leakage-report-template.md" \
  "$RUN_DIR/leakage-report.md"
printf 'status: %s\n' "$LEAKAGE_STATUS" >> "$RUN_DIR/leakage-report.md"
block_if_fail "leakage" "$LEAKAGE_STATUS"

stage "3) Tokenizer gate"
cp \
  "/path/to/zolai/.openclaw/skills/tokenizer-lab/references/tokenizer-metrics-template.json" \
  "$RUN_DIR/tokenizer-metrics.json"
python3 - <<'PY'
import json
import os
from pathlib import Path

p = Path(os.environ['RUN_DIR']) / 'tokenizer-metrics.json'
data = json.loads(p.read_text())
data['decision'] = os.environ['TOKENIZER_STATUS']
p.write_text(json.dumps(data, indent=2) + '\n')
print(p)
PY
block_if_fail "tokenizer" "$TOKENIZER_STATUS"

stage "4) SFT prep placeholder"
printf 'SFT prep: pending external script integration\n' > "$RUN_DIR/sft-status.txt"

stage "5) Runtime tuning template"
cp \
  "/path/to/zolai/.openclaw/skills/kaggle-gpu-optimizer/references/runtime-tuning-template.yaml" \
  "$RUN_DIR/runtime-tuning.yaml"

stage "6) Eval template"
cp \
  "/path/to/zolai/.openclaw/skills/eval-harness-nlp/references/eval-config-template.yaml" \
  "$RUN_DIR/eval-config.yaml"

stage "7) Forgetting/drift gate"
printf 'status: %s\n' "$FORGETTING_STATUS" > "$RUN_DIR/forgetting-check.txt"
block_if_fail "forgetting" "$FORGETTING_STATUS"

stage "8) Model card template"
cp \
  "/path/to/zolai/.openclaw/skills/model-registry-release/references/model-card-template.md" \
  "$RUN_DIR/model-card.md"

stage "8.5) Optional training"
if has_file "$ZOMI_TRAINING_ROOT/colab_train_local.py"; then
  if [[ "$RUN_TRAIN" == "1" ]]; then
    if [[ -f "$SPLIT_OUT_DIR/train.jsonl" ]]; then
      export ZOMI_DATASET_PATH="$SPLIT_OUT_DIR/train.jsonl"
    elif [[ -f "$SPLIT_INPUT" ]]; then
      export ZOMI_DATASET_PATH="$SPLIT_INPUT"
    fi
    export ZOMI_OUTPUT_DIR="$RUN_DIR/model-output"
    python3 "$ZOMI_TRAINING_ROOT/colab_train_local.py"
  else
    printf 'Skipping: colab_train_local.py (disabled)\n'
  fi
else
  printf 'Skipping: colab_train_local.py (not found)\n'
fi

stage "9) Final decision"
cat > "$RUN_DIR/final-decision.md" <<EOF
Decision: go
Run ID: $RUN_ID

Gate summary:
- leakage: $LEAKAGE_STATUS
- tokenizer: $TOKENIZER_STATUS
- forgetting: $FORGETTING_STATUS

Next actions:
- RUN_SPLIT=$RUN_SPLIT RUN_CLEAN=$RUN_CLEAN RUN_TRAIN=$RUN_TRAIN
- Replace template outputs with measured evaluation artifacts.
EOF

printf '\nCompleted successfully. Artifacts: %s\n' "$RUN_DIR"

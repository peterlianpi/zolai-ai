#!/usr/bin/env bash
set -euo pipefail

DATA_ROOT="${DATA_ROOT:-/path/to/zolai/Documents/Projects/data/zolai}"
REPORT_ROOT="${REPORT_ROOT:-/path/to/zolai/Documents/Projects/data/zolai/reports}"
RUN_ID="${RUN_ID:-language-data-$(date +%Y%m%d-%H%M%S)}"
RUN_DIR="$REPORT_ROOT/$RUN_ID"

mkdir -p "$RUN_DIR" "$DATA_ROOT/raw" "$DATA_ROOT/processed" "$DATA_ROOT/verified" "$DATA_ROOT/manifests"

MANIFEST="$RUN_DIR/source-manifest.csv"
cp "/path/to/zolai/.openclaw/skills/web-public-dataset-harvester/references/source-manifest-template.csv" "$MANIFEST"

echo "Run ID: $RUN_ID" > "$RUN_DIR/summary.txt"

python3 - <<'PY' "$DATA_ROOT" "$RUN_DIR"
from pathlib import Path
import json, hashlib, datetime, sys

data_root=Path(sys.argv[1])
run_dir=Path(sys.argv[2])

sample=data_root/'processed'/'sample_plain_text.jsonl'
sample.write_text('{"id":"demo-1","language":"zolai","text":"sample text","source":"demo"}\n')

h=hashlib.sha256(sample.read_bytes()).hexdigest()
report={
  "run_id": run_dir.name,
  "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
  "artifacts": [{"path": str(sample), "sha256": h}],
  "next_steps": [
    "fill source manifest with real web sources",
    "run compliance filter before training",
    "score trainset quality and keep only top data"
  ]
}
(run_dir/'pipeline-report.json').write_text(json.dumps(report, indent=2)+"\n")
print(run_dir/'pipeline-report.json')
PY

echo "Pipeline artifacts in: $RUN_DIR"

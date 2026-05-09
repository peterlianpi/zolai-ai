#!/bin/bash
# Prepare Dataset for Training
# Usage: ./run_prepare.sh

cd "$(dirname "$0")" || exit 1

echo "=================================="
echo "Preparing Dataset for Training"
echo "=================================="
echo ""

python3 prepare_for_training.py

echo ""
echo "=================================="
echo "View manifest:"
echo "  cat data/training/training_manifest.json"
echo ""
echo "View samples:"
echo "  head -5 data/training/sample_records.jsonl"
echo "=================================="

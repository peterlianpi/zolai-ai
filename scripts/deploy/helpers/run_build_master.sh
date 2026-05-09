#!/bin/bash
# Build Master Dataset Script - COMPLETE (All Files)
# Usage: ./run_build_master.sh

cd "$(dirname "$0")" || exit 1

echo "=================================="
echo "Building Master Dataset - COMPLETE"
echo "=================================="
echo ""

# Kill any active Python build processes (but not this script)
echo "Killing active Python build processes..."
pkill -f "python3 build_master" 2>/dev/null || true
sleep 1

echo "Including: Training + Dictionary + Parallel + Corpus"
echo "Files: 29 | Size: ~12.6GB | Records: ~22M"
echo ""

python3 build_master_dataset_complete.py

echo ""
echo "=================================="
echo "View log:"
echo "  tail -f data/training/build_master_complete.log"
echo ""
echo "View files:"
echo "  ls -lh data/training/master_*_complete.jsonl"
echo "=================================="

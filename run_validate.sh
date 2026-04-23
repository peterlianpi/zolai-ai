#!/bin/bash
# Validate Master Dataset
# Usage: ./run_validate.sh

cd "$(dirname "$0")" || exit 1

echo "=================================="
echo "Validating Master Dataset"
echo "=================================="
echo ""

python3 validate_master_dataset.py

echo ""
echo "=================================="
echo "View results:"
echo "  cat data/training/validate_master.log"
echo "=================================="

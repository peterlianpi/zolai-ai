#!/bin/bash
# Validate dataset with Gemini API
# Usage: ./run_gemini_validation.sh

cd "$(dirname "$0")" || exit 1

echo "=================================="
echo "Validating with Gemini API"
echo "=================================="
echo ""
echo "This will validate 100 sample records:"
echo "  • Zolai language correctness"
echo "  • Dialect accuracy (Tedim/Zokam)"
echo "  • Language level accuracy (A1-C1)"
echo "  • Confidence scores"
echo "  • Remarks"
echo ""

# Check if API key is set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  GEMINI_API_KEY not set in environment"
    echo "You'll be prompted to enter it when running the script"
    echo ""
fi

python3 validate_with_gemini.py

echo ""
echo "=================================="
echo "View results:"
echo "  cat data/training/gemini_validation_results.jsonl"
echo ""
echo "View log:"
echo "  cat data/training/gemini_validation.log"
echo "=================================="

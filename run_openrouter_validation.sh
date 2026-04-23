#!/bin/bash
# Validate with Best Available Model - Load from .env

# Load .env file
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✓ Loaded .env file"
else
    echo "ERROR: .env file not found"
    exit 1
fi

if [ -z "$OPENROUTER_API_KEY" ]; then
    echo "ERROR: OPENROUTER_API_KEY not found in .env"
    exit 1
fi

echo "=================================="
echo "Zolai Dataset Validation"
echo "=================================="
echo ""
echo "Configuration:"
echo "  • API Keys: Loaded from .env"
echo "  • Providers: OpenRouter, Groq"
echo "  • Auto-select: Best working model"
echo "  • Max tokens: 15000"
echo "  • Samples: 10"
echo ""

python3 validate_best_model.py

echo ""
echo "=================================="
echo "View results:"
echo "  cat data/training/validation_best_model.jsonl"
echo "  cat data/training/validation_best_model.log"
echo "=================================="

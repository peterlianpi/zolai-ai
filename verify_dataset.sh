#!/bin/bash
# Quick verification of dataset completeness

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         ZOLAI MASTER DATASET - VERIFICATION                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "📁 Checking files..."
echo ""

FILES=(
  "data/training/master_train_enriched.jsonl"
  "data/training/master_val_enriched.jsonl"
  "data/training/master_test_enriched.jsonl"
  "data/training/master_unified_all_complete.jsonl"
  "data/training/master_unified_manifest_complete.json"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    size=$(ls -lh "$file" | awk '{print $5}')
    lines=$(wc -l < "$file")
    echo "✓ $file"
    echo "  Size: $size | Records: $(printf '%,d' $lines)"
  else
    echo "✗ MISSING: $file"
  fi
done

echo ""
echo "📊 Sample record from enriched training set:"
echo ""
head -1 data/training/master_train_enriched.jsonl | python3 -m json.tool | head -15

echo ""
echo "✅ VERIFICATION COMPLETE"
echo ""
echo "Ready to train! Use:"
echo "  python train.py --train-file data/training/master_train_enriched.jsonl"

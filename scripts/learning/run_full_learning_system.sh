#!/bin/bash
# Master Learning System Coordinator
# Runs all learning agents and auditing tools in sequence

set -e

PROJECT_ROOT="/home/peter/Documents/Projects/zolai"
SCRIPTS_DIR="$PROJECT_ROOT/scripts"
ARTIFACTS_DIR="$PROJECT_ROOT/artifacts"

echo "=========================================="
echo "ZOLAI MULTI-AGENT LEARNING SYSTEM"
echo "=========================================="
echo "Start time: $(date)"
echo ""

# Create artifacts directory
mkdir -p "$ARTIFACTS_DIR"

# Phase 1: Grammar Pattern Extraction
echo "[Phase 1/5] Grammar Pattern Extraction..."
python3 "$SCRIPTS_DIR/grammar_pattern_extractor.py" 2>&1 | tee -a "$ARTIFACTS_DIR/learning_log.txt"
echo ""

# Phase 2: Bible Corpus Analysis
echo "[Phase 2/5] Bible Corpus Analysis..."
python3 "$SCRIPTS_DIR/bible_corpus_analyzer.py" 2>&1 | tee -a "$ARTIFACTS_DIR/learning_log.txt"
echo ""

# Phase 3: Comprehensive Wiki Audit
echo "[Phase 3/5] Comprehensive Wiki Audit & Fix..."
python3 "$SCRIPTS_DIR/comprehensive_wiki_audit.py" 2>&1 | tee -a "$ARTIFACTS_DIR/learning_log.txt"
echo ""

# Phase 4: Translation Validation
echo "[Phase 4/5] Translation Validation with Gemini Web API..."
python3 "$SCRIPTS_DIR/translation_validator.py" 2>&1 | tee -a "$ARTIFACTS_DIR/learning_log.txt"
echo ""

# Phase 5: Multi-Agent Learning Cycles
echo "[Phase 5/5] Running 100+ Learning Cycles..."
python3 "$SCRIPTS_DIR/learning_orchestrator.py" 2>&1 | tee -a "$ARTIFACTS_DIR/learning_log.txt"
echo ""

echo "=========================================="
echo "LEARNING SYSTEM COMPLETE"
echo "=========================================="
echo "End time: $(date)"
echo ""
echo "Artifacts saved to: $ARTIFACTS_DIR"
echo "Log file: $ARTIFACTS_DIR/learning_log.txt"
echo ""
echo "Generated reports:"
ls -lh "$ARTIFACTS_DIR"/*.json 2>/dev/null || echo "No reports generated"

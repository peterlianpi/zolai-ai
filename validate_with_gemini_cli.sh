#!/bin/bash
# Validate dataset using Gemini CLI (full features)
# Usage: ./validate_with_gemini_cli.sh

INPUT_FILE="data/training/master_train_enriched.jsonl"
OUTPUT_FILE="data/training/gemini_cli_results.jsonl"
LOG_FILE="data/training/gemini_cli_validation.log"
TEMP_DIR="/tmp/gemini_validation"

mkdir -p "$TEMP_DIR"
echo "" > "$LOG_FILE"

echo "Starting Gemini CLI validation..." | tee -a "$LOG_FILE"
echo "" > "$OUTPUT_FILE"

count=0
valid=0
dialect_ok=0
level_ok=0

# Sample 20 records
while IFS= read -r line && [ $count -lt 20 ]; do
    text=$(echo "$line" | jq -r '.text' | head -c 150)
    dialect=$(echo "$line" | jq -r '.dialect')
    level=$(echo "$line" | jq -r '.language_level')
    source=$(echo "$line" | jq -r '.source')
    
    echo "[$((count+1))/20] Validating: $text..." | tee -a "$LOG_FILE"
    
    # Create prompt file for Gemini CLI
    prompt_file="$TEMP_DIR/prompt_$count.txt"
    cat > "$prompt_file" << PROMPT
Analyze this Zolai sentence and validate:

Text: $text
Claimed Dialect: $dialect
Claimed Level: $level
Source: $source

Provide validation in this exact JSON format:
{
  "is_valid_zolai": true/false,
  "dialect_correct": true/false,
  "level_correct": true/false,
  "confidence": 0.0-1.0,
  "remarks": "brief comment"
}

Only respond with the JSON, no other text.
PROMPT

    # Call Gemini CLI
    response=$(gemini "$prompt_file" 2>/dev/null)
    
    if [ -z "$response" ]; then
        response='{"is_valid_zolai": null, "confidence": 0, "remarks": "CLI error"}'
    fi
    
    # Clean response (extract JSON if wrapped in text)
    validation=$(echo "$response" | grep -o '{.*}' | head -1)
    if [ -z "$validation" ]; then
        validation='{"is_valid_zolai": null, "confidence": 0, "remarks": "Parse error"}'
    fi
    
    # Save result
    result="{\"index\": $count, \"text\": \"${text//\"/\\\"}\", \"dialect\": \"$dialect\", \"level\": \"$level\", \"validation\": $validation}"
    echo "$result" >> "$OUTPUT_FILE"
    
    # Extract stats
    is_valid=$(echo "$validation" | jq -r '.is_valid_zolai' 2>/dev/null)
    dialect_ok_val=$(echo "$validation" | jq -r '.dialect_correct' 2>/dev/null)
    level_ok_val=$(echo "$validation" | jq -r '.level_correct' 2>/dev/null)
    confidence=$(echo "$validation" | jq -r '.confidence' 2>/dev/null)
    remarks=$(echo "$validation" | jq -r '.remarks' 2>/dev/null)
    
    [ "$is_valid" = "true" ] && ((valid++))
    [ "$dialect_ok_val" = "true" ] && ((dialect_ok++))
    [ "$level_ok_val" = "true" ] && ((level_ok++))
    
    echo "  Valid: $is_valid | Dialect: $dialect_ok_val | Level: $level_ok_val | Confidence: $confidence" | tee -a "$LOG_FILE"
    echo "  Remarks: $remarks" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    
    ((count++))
    
done < "$INPUT_FILE"

# Summary
echo "" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "GEMINI CLI VALIDATION COMPLETE" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "Total validated: $count" | tee -a "$LOG_FILE"
echo "Valid Zolai: $valid/$count ($(( valid * 100 / count ))%)" | tee -a "$LOG_FILE"
echo "Dialect correct: $dialect_ok/$count ($(( dialect_ok * 100 / count ))%)" | tee -a "$LOG_FILE"
echo "Level correct: $level_ok/$count ($(( level_ok * 100 / count ))%)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Results: $OUTPUT_FILE" | tee -a "$LOG_FILE"
echo "Log: $LOG_FILE" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Validation complete!"

#!/bin/bash
# Validate dataset using Gemini CLI via curl
# Usage: GEMINI_API_KEY="your-key" ./validate_gemini_cli.sh

if [ -z "$GEMINI_API_KEY" ]; then
    echo "Enter your Gemini API key:"
    read -s GEMINI_API_KEY
fi

if [ -z "$GEMINI_API_KEY" ]; then
    echo "ERROR: API key required"
    exit 1
fi

INPUT_FILE="data/training/master_train_enriched.jsonl"
OUTPUT_FILE="data/training/gemini_cli_validation.jsonl"
LOG_FILE="data/training/gemini_cli_validation.log"

echo "" > "$LOG_FILE"
echo "Starting Gemini validation..." | tee -a "$LOG_FILE"
echo "" > "$OUTPUT_FILE"

count=0
valid=0
dialect_ok=0
level_ok=0

while IFS= read -r line && [ $count -lt 10 ]; do
    rec=$(echo "$line" | jq -r '.')
    text=$(echo "$rec" | jq -r '.text' | head -c 100)
    dialect=$(echo "$rec" | jq -r '.dialect')
    level=$(echo "$rec" | jq -r '.language_level')
    
    echo "[$((count+1))/10] Validating: $text..." | tee -a "$LOG_FILE"
    
    # Call Gemini API
    response=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GEMINI_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"contents\": [{
                \"parts\": [{
                    \"text\": \"Validate this Zolai sentence. Text: '$text' Dialect: $dialect Level: $level. Respond in JSON: {is_valid: true/false, dialect_ok: true/false, level_ok: true/false, confidence: 0-1, remark: 'text'}\"
                }]
            }]
        }")
    
    # Extract validation from response
    validation=$(echo "$response" | jq -r '.candidates[0].content.parts[0].text' 2>/dev/null || echo '{"is_valid": null, "confidence": 0, "remark": "API error"}')
    
    # Save result
    result="{\"index\": $count, \"text\": \"$text\", \"dialect\": \"$dialect\", \"level\": \"$level\", \"validation\": $validation}"
    echo "$result" >> "$OUTPUT_FILE"
    
    # Update stats
    is_valid=$(echo "$validation" | jq -r '.is_valid' 2>/dev/null)
    dialect_ok_val=$(echo "$validation" | jq -r '.dialect_ok' 2>/dev/null)
    level_ok_val=$(echo "$validation" | jq -r '.level_ok' 2>/dev/null)
    confidence=$(echo "$validation" | jq -r '.confidence' 2>/dev/null)
    remark=$(echo "$validation" | jq -r '.remark' 2>/dev/null)
    
    [ "$is_valid" = "true" ] && ((valid++))
    [ "$dialect_ok_val" = "true" ] && ((dialect_ok++))
    [ "$level_ok_val" = "true" ] && ((level_ok++))
    
    echo "  Valid: $is_valid | Dialect: $dialect_ok_val | Level: $level_ok_val | Confidence: $confidence" | tee -a "$LOG_FILE"
    echo "  Remark: $remark" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    
    ((count++))
    sleep 1  # Rate limiting
    
done < "$INPUT_FILE"

echo "" | tee -a "$LOG_FILE"
echo "================================" | tee -a "$LOG_FILE"
echo "VALIDATION COMPLETE" | tee -a "$LOG_FILE"
echo "================================" | tee -a "$LOG_FILE"
echo "Total validated: $count" | tee -a "$LOG_FILE"
echo "Valid Zolai: $valid/$count" | tee -a "$LOG_FILE"
echo "Dialect correct: $dialect_ok/$count" | tee -a "$LOG_FILE"
echo "Level correct: $level_ok/$count" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Results: $OUTPUT_FILE" | tee -a "$LOG_FILE"
echo "Log: $LOG_FILE" | tee -a "$LOG_FILE"

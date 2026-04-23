#!/bin/bash
# Validate dataset using Gemini CLI (fixed)

INPUT_FILE="data/training/master_train_enriched.jsonl"
OUTPUT_FILE="data/training/gemini_cli_results.jsonl"
LOG_FILE="data/training/gemini_cli_validation.log"

echo "" > "$LOG_FILE"
echo "Starting Gemini CLI validation..." | tee -a "$LOG_FILE"
echo "" > "$OUTPUT_FILE"

count=0
valid=0
dialect_ok=0
level_ok=0

while IFS= read -r line && [ $count -lt 10 ]; do
    text=$(echo "$line" | jq -r '.text' | head -c 100)
    dialect=$(echo "$line" | jq -r '.dialect')
    level=$(echo "$line" | jq -r '.language_level')
    
    echo "[$((count+1))/10] Validating: $text..." | tee -a "$LOG_FILE"
    
    # Create simple prompt
    prompt="Validate this Zolai: '$text' (Dialect: $dialect, Level: $level). Reply ONLY with JSON: {\"valid\":true/false,\"dialect_ok\":true/false,\"level_ok\":true/false,\"confidence\":0-1,\"remark\":\"text\"}"
    
    # Call Gemini CLI and capture response
    response=$(gemini "$prompt" 2>&1)
    
    # Extract JSON from response
    validation=$(echo "$response" | grep -oP '\{[^}]*\}' | head -1)
    
    if [ -z "$validation" ]; then
        validation='{"valid":null,"confidence":0,"remark":"No response"}'
        echo "  ERROR: No response from Gemini" | tee -a "$LOG_FILE"
    else
        # Parse validation
        is_valid=$(echo "$validation" | jq -r '.valid' 2>/dev/null)
        dialect_ok_val=$(echo "$validation" | jq -r '.dialect_ok' 2>/dev/null)
        level_ok_val=$(echo "$validation" | jq -r '.level_ok' 2>/dev/null)
        confidence=$(echo "$validation" | jq -r '.confidence' 2>/dev/null)
        remark=$(echo "$validation" | jq -r '.remark' 2>/dev/null)
        
        [ "$is_valid" = "true" ] && ((valid++))
        [ "$dialect_ok_val" = "true" ] && ((dialect_ok++))
        [ "$level_ok_val" = "true" ] && ((level_ok++))
        
        echo "  Valid: $is_valid | Dialect: $dialect_ok_val | Level: $level_ok_val | Confidence: $confidence" | tee -a "$LOG_FILE"
        echo "  Remark: $remark" | tee -a "$LOG_FILE"
    fi
    
    # Save result
    result="{\"index\":$count,\"text\":\"${text//\"/\\\"}\",\"dialect\":\"$dialect\",\"level\":\"$level\",\"validation\":$validation}"
    echo "$result" >> "$OUTPUT_FILE"
    
    echo "" | tee -a "$LOG_FILE"
    ((count++))
    
done < "$INPUT_FILE"

# Summary
echo "" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "GEMINI CLI VALIDATION COMPLETE" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "Total validated: $count" | tee -a "$LOG_FILE"
if [ $count -gt 0 ]; then
    echo "Valid Zolai: $valid/$count ($(( valid * 100 / count ))%)" | tee -a "$LOG_FILE"
    echo "Dialect correct: $dialect_ok/$count ($(( dialect_ok * 100 / count ))%)" | tee -a "$LOG_FILE"
    echo "Level correct: $level_ok/$count ($(( level_ok * 100 / count ))%)" | tee -a "$LOG_FILE"
fi
echo "" | tee -a "$LOG_FILE"
echo "Results: $OUTPUT_FILE" | tee -a "$LOG_FILE"
echo "Log: $LOG_FILE" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"

echo ""
echo "✅ Validation complete!"

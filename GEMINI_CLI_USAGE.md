# 🚀 Gemini CLI - Full Usage Guide

## Why Gemini CLI?

Gemini CLI has more features than the API:
- ✓ Direct command-line access
- ✓ File handling
- ✓ Streaming responses
- ✓ Multi-turn conversations
- ✓ Better error handling
- ✓ No rate limiting issues
- ✓ Faster for batch operations

---

## Installation

### 1. Install Gemini CLI

```bash
# Using pip
pip install google-generativeai

# Or using npm (if you prefer Node.js)
npm install -g @google/generative-ai
```

### 2. Authenticate

```bash
# Initialize Gemini CLI
gemini init

# Or set API key
export GEMINI_API_KEY="your-api-key-here"
```

### 3. Verify Installation

```bash
gemini --version
gemini --help
```

---

## Quick Start

### Basic Usage

```bash
# Simple prompt
gemini "What is Zolai language?"

# From file
gemini < prompt.txt

# With options
gemini --model gemini-pro "Your prompt here"
```

### Our Validation Script

```bash
chmod +x validate_with_gemini_cli.sh
./validate_with_gemini_cli.sh
```

---

## How Our Script Works

### 1. Reads Dataset
- Loads enriched training data (20 sample records)
- Extracts: text, dialect, language_level, source

### 2. Creates Prompts
- Generates validation prompt for each sentence
- Saves to temporary files

### 3. Calls Gemini CLI
- Sends prompt to Gemini
- Gets validation response

### 4. Parses Results
- Extracts JSON validation
- Calculates statistics

### 5. Saves Output
- Results: `gemini_cli_results.jsonl`
- Log: `gemini_cli_validation.log`

---

## Output Format

### Results File (JSONL)

```json
{
  "index": 0,
  "text": "A kipat cilin Pasian in vantung leh leitung a piangsak hi.",
  "dialect": "Tedim",
  "level": "A2",
  "validation": {
    "is_valid_zolai": true,
    "dialect_correct": true,
    "level_correct": true,
    "confidence": 0.95,
    "remarks": "Correct Tedim dialect, appropriate A2 level"
  }
}
```

### Log File

```
[1/20] Validating: A kipat cilin Pasian in vantung...
  Valid: true | Dialect: true | Level: true | Confidence: 0.95
  Remarks: Correct Tedim dialect, appropriate A2 level

[2/20] Validating: Leitung in limlemeel neiloin a awngthawlpi...
  Valid: true | Dialect: true | Level: false | Confidence: 0.87
  Remarks: Valid Tedim but level seems B1 not A2

════════════════════════════════════════════════════════════════
GEMINI CLI VALIDATION COMPLETE
════════════════════════════════════════════════════════════════
Total validated: 20
Valid Zolai: 19/20 (95%)
Dialect correct: 18/20 (90%)
Level correct: 17/20 (85%)
```

---

## Advanced Usage

### Validate All Records

Edit script to change sample size:

```bash
# Change this line:
while IFS= read -r line && [ $count -lt 20 ]; do

# To:
while IFS= read -r line && [ $count -lt 5834792 ]; do
```

### Validate Specific Split

```bash
# Validate validation set
INPUT_FILE="data/training/master_val_enriched.jsonl" ./validate_with_gemini_cli.sh

# Validate test set
INPUT_FILE="data/training/master_test_enriched.jsonl" ./validate_with_gemini_cli.sh
```

### Custom Validation Prompt

Edit the prompt in the script:

```bash
cat > "$prompt_file" << PROMPT
Your custom validation prompt here
PROMPT
```

### Batch Processing

```bash
# Validate in chunks
for i in {1..100}; do
  echo "Batch $i..."
  head -n $((i*100)) data/training/master_train_enriched.jsonl | \
  tail -n 100 | \
  while read line; do
    gemini "Validate: $(echo $line | jq -r '.text')"
  done
done
```

---

## Gemini CLI Commands

### Basic

```bash
gemini "prompt"                    # Simple prompt
gemini < file.txt                  # From file
gemini -f file.txt                 # From file (explicit)
```

### Models

```bash
gemini --model gemini-pro "prompt"
gemini --model gemini-pro-vision "prompt"
gemini --list-models               # List available models
```

### Options

```bash
gemini --temperature 0.7 "prompt"  # Control randomness
gemini --max-tokens 1000 "prompt"  # Limit response length
gemini --stream "prompt"           # Stream response
gemini --json "prompt"             # Force JSON output
```

### Multi-turn

```bash
gemini                             # Interactive mode
> What is Zolai?
> Tell me more about dialects
> exit
```

---

## Troubleshooting

### "gemini: command not found"

```bash
# Install Gemini CLI
pip install google-generativeai

# Or check PATH
which gemini
```

### "API key not found"

```bash
# Set API key
export GEMINI_API_KEY="your-key-here"

# Or initialize
gemini init
```

### "Rate limit exceeded"

Gemini CLI handles rate limiting better than API. If still hitting limits:

```bash
# Add delay between requests
sleep 1  # In script

# Or use streaming
gemini --stream "prompt"
```

### "Invalid JSON response"

The script extracts JSON from response. If failing:

```bash
# Check raw response
gemini "Your prompt" > /tmp/response.txt
cat /tmp/response.txt

# Adjust extraction in script
validation=$(echo "$response" | grep -o '{.*}' | head -1)
```

---

## Tips & Tricks

### 1. Use Streaming for Large Responses

```bash
gemini --stream "Analyze this large dataset..."
```

### 2. Save Responses to File

```bash
gemini "prompt" > results.txt
```

### 3. Pipe Between Commands

```bash
cat prompts.txt | while read prompt; do
  gemini "$prompt"
done
```

### 4. Use JSON Output

```bash
gemini --json "Respond in JSON format: {valid: true/false, confidence: 0-1}"
```

### 5. Temperature Control

```bash
# More creative (higher temperature)
gemini --temperature 0.9 "prompt"

# More deterministic (lower temperature)
gemini --temperature 0.1 "prompt"
```

---

## Our Validation Script - Full Workflow

```bash
# 1. Make executable
chmod +x validate_with_gemini_cli.sh

# 2. Set API key (optional, will prompt if not set)
export GEMINI_API_KEY="your-key"

# 3. Run validation
./validate_with_gemini_cli.sh

# 4. View results
cat data/training/gemini_cli_results.jsonl

# 5. Check statistics
cat data/training/gemini_cli_validation.log

# 6. Analyze results
jq '.validation | {valid: .is_valid_zolai, confidence: .confidence}' \
  data/training/gemini_cli_results.jsonl
```

---

## Next Steps

1. **Run validation**: `./validate_with_gemini_cli.sh`
2. **Review results**: `cat data/training/gemini_cli_results.jsonl`
3. **Check stats**: `cat data/training/gemini_cli_validation.log`
4. **Fix issues**: Update records with low confidence
5. **Re-validate**: Run script again
6. **Use for training**: Once validated, use enriched dataset

---

## Resources

- [Gemini CLI Docs](https://ai.google.dev/tutorials/python_quickstart)
- [API Reference](https://ai.google.dev/api)
- [Model Info](https://ai.google.dev/models)

---

**Ready to validate!** 🚀

```bash
./validate_with_gemini_cli.sh
```

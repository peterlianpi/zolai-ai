# Synthesis

Instruction synthesis scripts for generating fine-tuning training data.

## Versions

| Script | Description |
|--------|-------------|
| `synthesize_instructions_v6.py` | **Current** — multi-category instruction synthesis |
| `synthesize_instructions_bulk.py` | Bulk synthesis with API batching |

## Usage

```bash
# Generate instruction-tuning data (requires GEMINI_API_KEY or OPENROUTER_API_KEY)
python scripts/synthesize_instructions_v6.py
```

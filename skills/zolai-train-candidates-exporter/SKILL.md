# Skill: Zolai Train Candidates Exporter
# Triggers: "export zolai train candidates", "build train ready zolai dataset"

## Purpose
Filter verified Zolai text and export training-ready candidates.

## Filters
- `is_zolai_relevant=true`
- Text length: 20-12,000 characters
- SHA256 deduplication
- Min Zolai density: 0.3

## Output Format
```json
{
  "id": "sha256_hash",
  "language": "zolai",
  "text": "...",
  "source": "url or filename",
  "verify_method": "keyword|gemini",
  "keyword_score": 3,
  "sha256": "..."
}
```

## Runner
```bash
python skills/export-train-candidates.py --input data/processed/verified.jsonl --output data/training/candidates.jsonl
```

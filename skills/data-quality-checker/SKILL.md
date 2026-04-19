# Skill: Data Quality Checker

## Trigger
- "check quality"
- "validate data"
- "data quality"

## Description
Checks and validates Zolai dataset quality.

## Quality Checks
```python
import json
import re
from collections import Counter

def check_quality(path):
    """Run all quality checks."""
    results = {
        "encoding": {},
        "length": {},
        "labels": {},
        "duplicates": {},
        "noise": {},
    }
    
    with open(path) as f:
        for line in f:
            data = json.loads(line)
            
            # UTF-8 check
            text = data.get("text", "")
            try:
                text.encode("utf-8")
            except:
                results["encoding"]["errors"] += 1
            
            # Length check
            if len(text) < 5:
                results["length"]["too_short"] += 1
            if len(text) > 5000:
                results["length"]["too_long"] += 1
            
            # Label check
            for field in ["topic", "data_type", "dialect"]:
                if field not in data or not data[field]:
                    results["labels"]["missing"][field] += 1
    
    return results
```

## Validation Rules
```python
RULES = {
    "min_length": 5,
    "max_length": 5000,
    "required_fields": ["text", "topic", "data_type"],
    "valid_topics": ["religion", "education", "conversation", "culture", "grammar", "story"],
    "valid_types": ["monolingual", "parallel", "lexicon"],
}
```

## Checks Performed

### 1. Encoding
- UTF-8 validity
- No replacement characters �
- No truncation

### 2. Structure
- Required fields present
- Valid values

### 3. Content
- Length within bounds
- No HTML tags
- No URLs
- No placeholder text

### 4. Quality
- Minimum unique characters
- No repeated sentences

## Command
```bash
python pipelines/quality_check.py --input dataset/ --output quality_report.json
```

## Quality Report
```json
{
  "total_samples": 10000,
  "encoding_errors": 0,
  "length_issues": 50,
  "missing_labels": 120,
  "duplicates": 340,
  "noise_detected": 15,
  "quality_score": 0.95
}
```

## Related Skills
- data-cleaner - Clean issues
- data-deduplicator - Remove duplicates
- zolai-data-analytics - Full analysis
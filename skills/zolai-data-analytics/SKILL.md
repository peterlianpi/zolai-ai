# Skill: Zolai Data Analytics

## Trigger
- "analyze zolai data"
- "dataset stats"
- "data quality"

## Description
Analyzes Zolai dataset quality and statistics.

## Analytics Script
```python
import json
from pathlib import Path
from collections import Counter

def analyze_dataset(path):
    stats = {
        "total": 0,
        "by_topic": Counter(),
        "by_type": Counter(),
        "by_dialect": Counter(),
        "avg_length": 0,
        "min_length": float("inf"),
        "max_length": 0,
    }
    
    lengths = []
    
    with open(path) as f:
        for line in f:
            data = json.loads(line)
            stats["total"] += 1
            
            # Topic
            topic = data.get("topic", "unknown")
            stats["by_topic"][topic] += 1
            
            # Data type
            dtype = data.get("data_type", "unknown")
            stats["by_type"][dtype] += 1
            
            # Length
            text = data.get("text", "")
            length = len(text)
            lengths.append(length)
            stats["min_length"] = min(stats["min_length"], length)
            stats["max_length"] = max(stats["max_length"], length)
    
    if lengths:
        stats["avg_length"] = sum(lengths) / len(lengths)
    
    return stats
```

## Usage
```bash
python -c "
from skills.zolai_data_analytics import analyze_dataset
stats = analyze_dataset('dataset/jsonl/zolai.jsonl')
print(json.dumps(stats, indent=2))
"

# Or run the script
python pipelines/analyze.py -i dataset/
```

## Metrics

### Dataset Quality
| Metric | Good | Warning | Bad |
|--------|------|---------|-----|
| Total samples | >10k | 1k-10k | <1k |
| Avg length | 20-100 | 10-20 | <10 |
| Missing labels | <1% | 1-10% | >10% |
| Duplicates | <1% | 1-5% | >5% |

### Topic Distribution
- religion: ~20%
- conversation: ~30%
- education: ~20%
- culture: ~15%
- story: ~10%
- grammar: ~5%

## Visualization
```python
import matplotlib.pyplot as plt

# Topic distribution
topics = Counter(data["by_topic"])
plt.bar(topics.keys(), topics.values())
plt.title("Zolai Dataset - Topic Distribution")
plt.save("stats/topic_dist.png")
```

## Output
Save to `stats/`:
- topic_distribution.json
- quality_report.json
- length_distribution.png
- dialect_distribution.json

## Related Skills
- data-cleaner - Clean data issues
- data-deduplicator - Remove duplicates
- model-evaluator - Model evaluation
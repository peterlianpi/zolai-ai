# Master/Versions - Versioned Snapshots

**Size:** 7.5GB | **Format:** JSONL

## Contents

Versioned snapshots of combined datasets:
- `all_sources_combined_v*.jsonl` — Combined sources
- `all_sources_clean_v*.jsonl` — Cleaned sources
- `all_combined.jsonl` — All combined
- `all_dedup.jsonl` — Deduplicated

## Versions
- v1-v6: Early versions
- v7-v11: Latest versions

## Usage

```python
from zolai.utils import stream_jsonl

# Load specific version
for entry in stream_jsonl('all_sources_combined_v11.jsonl'):
    print(entry)
```

---
**Last Updated:** 2026-04-16

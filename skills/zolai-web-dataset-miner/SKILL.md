# Skill: Zolai Web Dataset Miner
# Triggers: "fetch zolai dataset", "mine web for zolai text", "expand zolai corpus"

## Purpose
Fetch and extract Zolai text from web sources.

## Seed Sources
- Tongdot Dictionary: https://www.tongdot.com/search/
- Tongsan.org: https://tongsan.org/wp-json/wp/v2/posts
- Bible.com Tedim Bible
- Zomi community websites

## Output Format
```json
{
  "url": "https://...",
  "fetched_at": "2026-04-04T12:00:00Z",
  "text": "...",
  "sha256": "..."
}
```

## Runner
```bash
python skills/fetch-web-corpus.py --seeds skills/seed-urls.txt --output data/raw/web-corpus.jsonl
```

## Rate Limiting
- 2 second delay between requests
- Max 5 concurrent connections
- Max 500MB target per cycle

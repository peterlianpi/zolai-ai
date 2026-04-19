# Skill: Kaggle Dataset Publisher
# Triggers: "update kaggle metadata", "publish to kaggle", "fix kaggle description"
# Version: 1.0.0

## Purpose
Update Kaggle dataset metadata (title, description, sources, license, tags) using the Kaggle CLI.

## Prerequisites
- `KAGGLE_API_TOKEN` env var set (or `~/.kaggle/kaggle.json`)
- Kaggle CLI installed: `pip install kaggle`

## Steps

1. Download current metadata
2. Edit `dataset-metadata.json`
3. Push updated metadata

## Commands
```bash
# 1. Download metadata
kaggle datasets metadata OWNER/SLUG -p /tmp/kaggle-meta/

# 2. Edit /tmp/kaggle-meta/dataset-metadata.json
# Fields:
#   title: 6–50 chars
#   subtitle: 20–80 chars
#   description: markdown string
#   licenses: [{"name": "CC BY 4.0"}]  — valid: CC BY 4.0, CC0-1.0, GPL-2.0
#   keywords: ["tag1", "tag2"]  — must be existing Kaggle tags
#   expectedUpdateFrequency: "never" | "daily" | "weekly" | "monthly" | "quarterly" | "annually"
#   userSpecifiedSources: ["https://..."]

# 3. Push updated metadata
KAGGLE_API_TOKEN=... kaggle datasets metadata OWNER/SLUG -p /tmp/kaggle-meta/ --update
```

## Notes
- Public → private visibility change requires Kaggle web UI; the API blocks it
- Invalid keywords are silently dropped — verify tags exist on kaggle.com/tags first

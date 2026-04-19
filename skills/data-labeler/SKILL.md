# Skill: Zolai Labeler

## Trigger
- "label zolai data"
- "add metadata"
- "categorize data"

## Description
Adds metadata labels to Zolai data.

## Workflow

### Step 1: Read Schema
Read `schema.md` for labeling rules.

### Step 2: Add Labels
Add required fields:
- `language`: "zolo"
- `dialect`: "tedim|zomi|falam|haka|matu"
- `topic`: religion|education|conversation|culture|grammar|story
- `data_type`: monolingual|parallel|lexicon
- `difficulty`: beginner|intermediate|advanced

### Step 3: Labeling
Run labeling (manual or AI-assisted):
```
{
  "text": "Keimah in an nei.",
  "language": "zolo",
  "dialect": "tedim",
  "topic": "conversation",
  "data_type": "monolingual",
  "difficulty": "beginner"
}
```

## Output
Save labeled data to `clean/` subdirectories

## Related Skills
- data-collector - Collect data
- data-cleaner - Clean data
- data-deduplicator - Remove duplicates
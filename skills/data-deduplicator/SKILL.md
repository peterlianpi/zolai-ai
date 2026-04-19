# Skill: Zolai Data Deduplicator

## Trigger
- "deduplicate zolai"
- "remove duplicates"
- "unique entries"

## Description
Removes duplicate entries using hash-based deduplication.

## Workflow

### Step 1: Read Schema
Read `schema.md` for deduplication rules.

### Step 2: Deduplicate
Run deduplication pipeline:
```bash
python pipelines/deduplicate.py -i clean/ -o clean/
```

### Step 3: Process
1. Normalize text (lowercase, trim)
2. Compute MD5 hash
3. Remove duplicates
4. Preserve first occurrence

### Output
- Unique entries in `clean/`
- Stats in `.stats.json`

## Statistics Tracked
- Total original entries
- Unique entries
- Duplicates removed
- Deduplication rate

## Quality Gates
- Hash-based dedup (MD5)
- Case-insensitive matching
- Preserve original order

## Related Skills
- data-collector - Collect data
- data-cleaner - Clean data
- data-labeler - Label data
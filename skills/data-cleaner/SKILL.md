# Skill: Zolai Data Cleaner

## Trigger
- "clean zolai data"
- "normalize text"
- "fix encoding"

## Description
Cleans raw Zolai text - removes noise, fixes encoding, validates.

## Workflow

### Step 1: Read Schema
First read `schema.md` for cleaning rules.

### Step 2: Clean Data
Run cleaning pipeline:
```bash
python pipelines/clean.py -i raw/ -o clean/
```

### Step 3: Cleaning Steps
1. Remove HTML tags
2. Remove URLs
3. Fix encoding issues (smart quotes, BOM)
4. Normalize whitespace
5. Validate length (5-5000 chars)

### Step 4: Quality Check
- Verify UTF-8 encoding
- Check minimum length
- No HTML残留

## Output
Save cleaned data to `clean/monolingual/` or `clean/bilingual/`

## Quality Gates
- No HTML tags `<...>`
- No URLs `https://...`
- No placeholder `[...]`
- Min 5, max 5000 characters
- Valid UTF-8 encoding

## Related Skills
- data-collector - Collect raw data
- data-deduplicator - Remove duplicates
- data-labeler - Add metadata
# Skill: Zolai Data Collector

## Trigger
- "collect zolai data"
- "fetch zolai text"
- "gather language data"
- "scrape zolai content"

## Description
Collects raw Zolai text data from various sources for the dataset pipeline.

## Workflow

### Step 1: Read Context
First read relevant wiki entries:
- `wiki/vocabulary/` - existing words
- `wiki/patterns/` - sentence patterns
- `schema.md` - data schema rules

### Step 2: Identify Sources
Available sources:
- Bible translations (raw/bible/)
- Dictionary entries (raw/dictionary/)
- Web content (raw/web/)
- PDF documents (raw/pdf/)
- News articles (raw/news/)
- Parallel texts (raw/parallel/)

### Step 3: Collect Data
Run collection pipeline:
```bash
python pipelines/collect.py -i <source> -t <source_type> -T <topic>
```

### Step 4: Validate
- Check minimum sentence length (5 chars)
- Verify UTF-8 encoding
- Remove empty entries

### Output
Save to `raw/<source_type>/` as JSONL

## Quality Gates
- Minimum 5 characters per entry
- Valid UTF-8 encoding
- No HTML tags
- No placeholder text

## Examples

### Collect from Bible
```bash
python pipelines/collect.py -i references/bible/ -t bible -T religion
```

### Collect from Dictionary
```bash
python pipelines/collect.py -i data/dictionary.jsonl -t dictionary -T vocabulary
```

### Collect from Web
```bash
python pipelines/collect.py -i references/web/ -t web -T conversation
```

## Related Skills
- data-cleaner - Clean collected data
- data-deduplicator - Remove duplicates
- data-labeler - Label data types
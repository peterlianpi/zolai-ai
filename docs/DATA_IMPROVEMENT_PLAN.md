# Data Categories: Audit, Improvement & Cleanup Recommendations

## 1. MASTER/SOURCES (11GB) - Raw Training Data

### Current State
- **Files:** 46 JSONL files
- **Size:** 11GB
- **Status:** ⚠️ Needs organization

### Issues Found
- ✗ Mixed Bible versions (TDB77, TBR17, Tedim2010, Judson, Luther, etc.)
- ✗ Progress files (.progress.json) cluttering directory
- ✗ No clear naming convention
- ✗ Duplicate Bible versions (online vs offline)

### Recommendations

#### 1.1 Organize by Source Type
```
master/sources/
├── bible/                  Bible corpus
│   ├── tdb77/             TDB77 version
│   ├── tbr17/             TBR17 version
│   ├── tedim2010/         Tedim2010 version
│   ├── parallel/          Parallel translations
│   └── historical/        Historical versions (Judson, Luther, etc.)
├── dictionaries/          Dictionary sources
│   ├── tongdot/
│   ├── zomidictionary/
│   └── zomime/
├── news/                  News articles
│   ├── rvasia/
│   ├── zomidaily/
│   └── tongsan/
├── corpus/                General corpus
│   ├── zolai_corpus_master.jsonl
│   └── ...
└── other/                 Other sources
```

#### 1.2 Clean Up Progress Files
```bash
# Remove progress files (they're temporary)
find master/sources/ -name "*.progress.json" -delete
find master/sources/ -name "*.pid" -delete
find master/sources/ -name "*.log" -delete
# Saves: ~100KB
```

#### 1.3 Standardize Naming
```
Current:  bible_tb77_online.jsonl
Better:   bible_tdb77_v1.jsonl

Current:  bible_parallel_tdb77.jsonl
Better:   bible_parallel_tdb77_kjv.jsonl
```

#### 1.4 Deduplicate Bible Versions
```bash
# Check for duplicates
python -c "
import json
files = ['bible_tb77.jsonl', 'bible_tb77_online.jsonl']
for f in files:
    with open(f) as fp:
        count = sum(1 for _ in fp)
    print(f'{f}: {count} lines')
"
# Keep only one version of each
```

### Action Items
- [ ] Create subdirectories by source type
- [ ] Move Bible files to bible/ subdirectory
- [ ] Move dictionary files to dictionaries/ subdirectory
- [ ] Move news files to news/ subdirectory
- [ ] Remove progress files
- [ ] Standardize naming convention
- [ ] Document each source

---

## 2. MASTER/COMBINED (664MB) - Merged Datasets

### Current State
- **Files:** 4 main JSONL files
- **Size:** 664MB
- **Status:** ✅ Good, but needs documentation

### Files
- sentences.jsonl (~600MB) - ~2M raw sentences
- parallel.jsonl (40MB) - 68,817 parallel pairs
- dictionary.jsonl (22MB) - Master dictionary
- instructions.jsonl (30MB) - Instruction-tuning data

### Recommendations

#### 2.1 Add Metadata Files
```bash
# Create metadata for each file
cat > sentences.metadata.json << 'EOF'
{
  "name": "sentences.jsonl",
  "description": "Raw Zolai sentences from all sources",
  "lines": 2000000,
  "size_mb": 600,
  "format": "JSONL",
  "fields": ["text", "source", "language"],
  "created": "2026-04-14",
  "last_updated": "2026-04-14"
}
EOF
```

#### 2.2 Add README
```bash
cat > README.md << 'EOF'
# Master Combined Datasets

## Files

### sentences.jsonl
- Raw Zolai sentences from all sources
- ~2M lines
- Fields: text, source, language

### parallel.jsonl
- Parallel sentence pairs (Zolai ↔ English)
- 68,817 pairs
- Fields: zolai, english, source

### dictionary.jsonl
- Master dictionary entries
- Fields: zolai, english, part_of_speech, examples

### instructions.jsonl
- Instruction-tuning data
- Fields: instruction, input, output

## Quality Checks
- All files deduplicated
- All files validated
- All files sorted by source
EOF
```

#### 2.3 Add Validation Script
```bash
# Create validation script
cat > validate.py << 'EOF'
import json
import sys

def validate_jsonl(filename):
    errors = 0
    with open(filename) as f:
        for i, line in enumerate(f, 1):
            try:
                json.loads(line)
            except json.JSONDecodeError as e:
                print(f"Line {i}: {e}")
                errors += 1
    return errors

if __name__ == "__main__":
    for file in sys.argv[1:]:
        errors = validate_jsonl(file)
        print(f"{file}: {errors} errors")
EOF
```

### Action Items
- [ ] Create metadata files for each dataset
- [ ] Create README.md
- [ ] Create validation script
- [ ] Document data schema
- [ ] Add line counts to metadata

---

## 3. MASTER/BIBLE (76MB) - Bible Corpus

### Current State
- **Files:** 6,460 markdown files + JSONL
- **Size:** 76MB
- **Status:** ⚠️ Needs organization

### Issues Found
- ✗ Mixed formats (MD, JSONL, USX)
- ✗ No clear version separation
- ✗ Parallel files scattered

### Recommendations

#### 3.1 Organize by Format
```
master/bible/
├── markdown/              Markdown files
│   ├── tdb77/            TDB77 version
│   ├── tedim2010/        Tedim2010 version
│   └── kjv/              KJV version
├── jsonl/                JSONL format
│   ├── parallel.jsonl
│   ├── tdb77.jsonl
│   └── ...
├── usx/                  USX format (if needed)
└── metadata/
    ├── books.json        Book metadata
    └── versions.json     Version metadata
```

#### 3.2 Create Metadata
```bash
cat > metadata/versions.json << 'EOF'
{
  "versions": [
    {
      "code": "tdb77",
      "name": "TDB77",
      "language": "Tedim Zolai",
      "year": 1977,
      "books": 66
    },
    {
      "code": "tedim2010",
      "name": "Tedim2010",
      "language": "Tedim Zolai",
      "year": 2010,
      "books": 66
    },
    {
      "code": "kjv",
      "name": "King James Version",
      "language": "English",
      "year": 1611,
      "books": 66
    }
  ]
}
EOF
```

#### 3.3 Create Index
```bash
cat > INDEX.md << 'EOF'
# Bible Corpus Index

## Versions
- TDB77 (1977) - Tedim Zolai
- Tedim2010 (2010) - Tedim Zolai
- KJV (1611) - English

## Formats
- Markdown (6,460 files)
- JSONL (parallel pairs)
- USX (if available)

## Statistics
- Total books: 66
- Total verses: ~31,000
- Total words: ~800,000
EOF
```

### Action Items
- [ ] Organize by format (markdown, jsonl, usx)
- [ ] Create metadata files
- [ ] Create version index
- [ ] Add book statistics
- [ ] Validate all verses

---

## 4. PROCESSED/DICTIONARIES (121MB) - Dictionary Files

### Current State
- **Files:** 3 JSONL files
- **Size:** 121MB
- **Status:** ✅ Good, but needs documentation

### Files
- master_dictionary_enriched.jsonl (36MB)
- master_dictionary_en_zo.jsonl (36MB)
- master_dictionary_semantic.jsonl (50MB)

### Recommendations

#### 4.1 Add Schema Documentation
```bash
cat > SCHEMA.md << 'EOF'
# Dictionary Schema

## master_dictionary_enriched.jsonl
```json
{
  "zolai": "string",
  "english": "string",
  "part_of_speech": "string",
  "examples": ["string"],
  "synonyms": ["string"],
  "antonyms": ["string"],
  "frequency": "number",
  "source": "string"
}
```

## master_dictionary_en_zo.jsonl
```json
{
  "english": "string",
  "zolai": "string",
  "confidence": "number",
  "source": "string"
}
```

## master_dictionary_semantic.jsonl
```json
{
  "zolai": "string",
  "english": "string",
  "semantic_field": "string",
  "embeddings": ["number"],
  "similarity": "number"
}
```
EOF
```

#### 4.2 Add Statistics
```bash
cat > STATISTICS.md << 'EOF'
# Dictionary Statistics

| File | Entries | Size | Avg Entry |
|------|---------|------|-----------|
| enriched | 24,891 | 36MB | 1.4KB |
| en_zo | 24,891 | 36MB | 1.4KB |
| semantic | 24,891 | 50MB | 2.0KB |

## Coverage
- Zolai → English: 24,891 entries
- English → Zolai: 24,891 entries
- Semantic fields: 50+ categories
EOF
```

#### 4.3 Create Validation
```bash
cat > validate_dictionaries.py << 'EOF'
import json

def validate_dictionary(filename):
    required_fields = {
        'enriched': ['zolai', 'english'],
        'en_zo': ['english', 'zolai'],
        'semantic': ['zolai', 'english', 'semantic_field']
    }
    
    dict_type = filename.split('_')[2].split('.')[0]
    fields = required_fields.get(dict_type, [])
    
    errors = 0
    with open(filename) as f:
        for i, line in enumerate(f, 1):
            try:
                entry = json.loads(line)
                for field in fields:
                    if field not in entry:
                        print(f"Line {i}: Missing field '{field}'")
                        errors += 1
            except json.JSONDecodeError as e:
                print(f"Line {i}: {e}")
                errors += 1
    
    return errors
EOF
```

### Action Items
- [ ] Create SCHEMA.md
- [ ] Create STATISTICS.md
- [ ] Create validation script
- [ ] Add entry counts
- [ ] Document coverage

---

## 5. PROCESSED/DATASETS (Empty) - Dataset Exports

### Current State
- **Subdirectories:** bilingual/, lexicon/, monolingual/
- **Status:** ⚠️ Empty, needs population

### Recommendations

#### 5.1 Populate Datasets
```bash
# Create dataset files
mkdir -p processed/datasets/{bilingual,lexicon,monolingual}

# Bilingual dataset
python -c "
import json
# Extract bilingual pairs from combined/parallel.jsonl
with open('master/combined/parallel.jsonl') as f:
    with open('processed/datasets/bilingual/parallel.jsonl', 'w') as out:
        for line in f:
            out.write(line)
"

# Lexicon dataset
python -c "
import json
# Extract lexicon from dictionaries
with open('processed/dictionaries/master_dictionary_enriched.jsonl') as f:
    with open('processed/datasets/lexicon/lexicon.jsonl', 'w') as out:
        for line in f:
            out.write(line)
"

# Monolingual dataset
python -c "
import json
# Extract monolingual sentences
with open('master/combined/sentences.jsonl') as f:
    with open('processed/datasets/monolingual/sentences.jsonl', 'w') as out:
        for line in f:
            out.write(line)
"
```

#### 5.2 Create Dataset Metadata
```bash
cat > processed/datasets/MANIFEST.json << 'EOF'
{
  "datasets": [
    {
      "name": "bilingual",
      "description": "Bilingual parallel sentences",
      "files": ["parallel.jsonl"],
      "size_mb": 40,
      "pairs": 68817
    },
    {
      "name": "lexicon",
      "description": "Dictionary entries",
      "files": ["lexicon.jsonl"],
      "size_mb": 36,
      "entries": 24891
    },
    {
      "name": "monolingual",
      "description": "Monolingual Zolai sentences",
      "files": ["sentences.jsonl"],
      "size_mb": 600,
      "sentences": 2000000
    }
  ]
}
EOF
```

### Action Items
- [ ] Populate bilingual/ with parallel data
- [ ] Populate lexicon/ with dictionary data
- [ ] Populate monolingual/ with sentence data
- [ ] Create MANIFEST.json
- [ ] Add statistics

---

## 6. PROCESSED/EXPORTS (Empty) - Export Formats

### Current State
- **Subdirectories:** csv/, jsonl/, huggingface/, kaggle/
- **Status:** ⚠️ Empty, needs population

### Recommendations

#### 6.1 Create Export Scripts
```bash
# CSV export
python -c "
import json
import csv

with open('master/combined/parallel.jsonl') as f:
    with open('processed/exports/csv/parallel.csv', 'w', newline='') as out:
        writer = csv.DictWriter(out, fieldnames=['zolai', 'english', 'source'])
        writer.writeheader()
        for line in f:
            writer.writerow(json.loads(line))
"

# HuggingFace format
python -c "
import json
from datasets import Dataset

data = []
with open('master/combined/parallel.jsonl') as f:
    for line in f:
        data.append(json.loads(line))

ds = Dataset.from_dict({
    'zolai': [d['zolai'] for d in data],
    'english': [d['english'] for d in data]
})
ds.save_to_disk('processed/exports/huggingface/parallel')
"
```

#### 6.2 Create Export Manifest
```bash
cat > processed/exports/MANIFEST.json << 'EOF'
{
  "exports": [
    {
      "format": "csv",
      "files": ["parallel.csv", "dictionary.csv"],
      "description": "CSV format for spreadsheet tools"
    },
    {
      "format": "jsonl",
      "files": ["parallel.jsonl", "dictionary.jsonl"],
      "description": "JSONL format for streaming"
    },
    {
      "format": "huggingface",
      "files": ["parallel/", "dictionary/"],
      "description": "HuggingFace Datasets format"
    },
    {
      "format": "kaggle",
      "files": ["parallel.zip", "dictionary.zip"],
      "description": "Kaggle dataset format"
    }
  ]
}
EOF
```

### Action Items
- [ ] Create CSV exports
- [ ] Create HuggingFace exports
- [ ] Create Kaggle exports
- [ ] Create MANIFEST.json
- [ ] Add export scripts

---

## 7. RAW (25MB) - Raw Scraped Data

### Current State
- **Subdirectories:** wordlists/, dictionaries/, ocr/
- **Status:** ✅ Organized

### Recommendations

#### 7.1 Add README
```bash
cat > raw/README.md << 'EOF'
# Raw Scraped Data

## wordlists/
- wordlist_en_zo.jsonl
- wordlist_zo_en.jsonl
- zo_en_singlewords.jsonl
- zo_en_wordlist.jsonl

## dictionaries/
- zomidictionary_*.jsonl
- zomime_*.jsonl

## ocr/
- ocr-playground-download/
- OCR extracted text files

## Notes
- Raw data, not cleaned
- May contain duplicates
- Use processed/ for cleaned data
EOF
```

#### 7.2 Add Validation
```bash
cat > raw/validate.py << 'EOF'
import json
import sys

def validate_raw_data(directory):
    for file in Path(directory).glob('**/*.jsonl'):
        errors = 0
        with open(file) as f:
            for i, line in enumerate(f, 1):
                try:
                    json.loads(line)
                except json.JSONDecodeError:
                    errors += 1
        print(f"{file}: {errors} errors")
EOF
```

### Action Items
- [ ] Create README.md
- [ ] Create validation script
- [ ] Document sources
- [ ] Add line counts

---

## 8. CLEANUP SUMMARY

### Immediate Actions (Today)
```bash
# Remove progress files
find master/sources/ -name "*.progress.json" -delete
find master/sources/ -name "*.pid" -delete

# Remove temporary files
find . -name "*.tmp" -delete
find . -name "*.cache" -delete
```

### Short-term Actions (This Week)
```bash
# Archive old rebuild versions
tar -czf processed/rebuild_archive_backup.tar.gz processed/rebuild_archive/
rm -rf processed/rebuild_archive/

# Archive old training runs
tar -czf runs_backup.tar.gz runs/
rm -rf runs/
```

### Long-term Actions (This Month)
```bash
# Archive old directories
tar -czf archive_old_backup.tar.gz archive_old/
rm -rf archive_old/
```

### Potential Savings
- Progress files: ~100KB
- Rebuild archive: 600MB
- Training runs: 32MB
- Old directories: 1.6GB
- **Total: ~2.2GB**

---

## 📋 Checklist

### Master/Sources
- [ ] Organize by source type
- [ ] Remove progress files
- [ ] Standardize naming
- [ ] Deduplicate Bible versions
- [ ] Create README

### Master/Combined
- [ ] Create metadata files
- [ ] Create README
- [ ] Create validation script
- [ ] Document schema

### Master/Bible
- [ ] Organize by format
- [ ] Create metadata
- [ ] Create index
- [ ] Validate verses

### Processed/Dictionaries
- [ ] Create SCHEMA.md
- [ ] Create STATISTICS.md
- [ ] Create validation script

### Processed/Datasets
- [ ] Populate bilingual/
- [ ] Populate lexicon/
- [ ] Populate monolingual/
- [ ] Create MANIFEST.json

### Processed/Exports
- [ ] Create CSV exports
- [ ] Create HuggingFace exports
- [ ] Create Kaggle exports
- [ ] Create MANIFEST.json

### Raw
- [ ] Create README
- [ ] Create validation script
- [ ] Document sources

---

**Last Updated:** 2026-04-16
**Status:** ✅ Audit Complete | 🔧 Ready for Implementation

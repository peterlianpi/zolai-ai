# Maintenance

Quality checks, OCR processing, text filters, and corpus maintenance.

**Last Updated:** 2026-04-20

## Scripts

| Script | Purpose |
|--------|---------|
| `quality_checks.py` | Run data quality checks |
| `text_filters.py` | Text filtering utilities |
| `ocr_pipeline.py` | OCR processing (PDF → markdown) |
| `deduplicate_corpus.py` | Deduplicate corpus files |
| `validate_project.py` | Validate project structure and data |
| `analyze_disk_usage.py` | Analyze disk usage across data/ |
| `train_fasttext_lid.py` | Train fastText language ID model |
| `learn_grammar_from_corpus.py` | Learn grammar patterns from corpus |
| `study_bible_chapter.py` | Study/analyze a Bible chapter |

## Key Commands

```bash
# Grammar rule validation
python scripts/test_grammar_rules.py

# Audit sentences against wiki standards
python scripts/audit_sentences_wiki.py

# Deduplicate corpus
python scripts/maintenance/deduplicate_corpus.py

# Validate project
python scripts/maintenance/validate_project.py

# Analyze disk usage
python scripts/maintenance/analyze_disk_usage.py

# OCR pipeline
python scripts/maintenance/ocr_pipeline.py

# Train language ID model
python scripts/maintenance/train_fasttext_lid.py
```

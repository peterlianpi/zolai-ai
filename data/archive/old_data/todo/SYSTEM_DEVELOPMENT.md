# System Development & Auditor Tools

## Zolai Auditor (dev/audit_zolai.py)
- [x] Basic Grammar Rules (2018 Standard)
- [x] Apostrophe Possessive (')
- [x] Ergative Contraction ('n)
- [x] Nasal Context Spelling (ng)
- [x] Stem I vs Stem II (Noun formation)
- [x] Resultative Compound Order
- [x] Register Mismatch detection (Formal vs Colloquial)
- [x] Forbidden Directs (Calque Library)
- [x] Logical Correlatives (Whether/Or)
- [x] Rhetorical Question Logic
- [x] Universal Negation (Longal... Kei)
- [ ] Global Context Auditor (Scan entire directory)
- [ ] Tone Consistency Check (Document-wide)
- [ ] Cross-Reference Engine (Dictionary link)
- [ ] Suggestion Engine: Automated 'Did you mean?' logic
- [ ] Stem II Verification: Use a JSON map of Stem I -> Stem II for all verbs

## Interactive CLI (dev/audit_cli.py)
- [x] Basic Interactive Audit
- [ ] Tone Flagging (Force formal/colloquial)
- [ ] Batch Processing (Multiple files)
- [ ] Suggestion Auto-Fix mode
- [ ] Export Audit Report (JSON/CSV)
- [ ] Bible-specific audit mode: Flag KJV/WEB translation calques
- [ ] Web Interface: Flask/Streamlit UI for non-CLI users

## Data Maintenance & Quality (dev/scripts/)
- [ ] `align_verses.py`: Script to verify parallel alignment in .md files
- [ ] `extract_vocab.py`: Script to extract recurring word-freq from Cleaned_Bible
- [ ] `check_stems.py`: Script to find potential Stem I/II errors in existing data
- [ ] `sync_wiki.py`: Script to auto-generate markdown tables from auditor logic

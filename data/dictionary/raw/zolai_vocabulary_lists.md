# Zolai AI — Dictionary & Vocabulary Suite

All files use the **Zo_Tdm** (Tedim Chin) linguistic standard.

## 🗂 Active Resources

| File | Description | Entries |
|:-----|:------------|:--------|
| **[zo_tdm_ultimate_pro_dictionary.md](zo_tdm_ultimate_pro_dictionary.md)** | Unified multi-source dictionary (TKD, MCPG, DLH, ZomiDict) | 36,665 |
| **[zo_tdm_professional_lexicon_v1.md](zo_tdm_professional_lexicon_v1.md)** | Curated lexicon with cultural & Bible context | 50+ |
| **[zolai_grammar_cheat_sheet.md](zolai_grammar_cheat_sheet.md)** | Grammar rules, particles, and sentence patterns | — |

## 🛠 Single Source of Truth

| File | Format | Purpose |
|:-----|:-------|:--------|
| `data/master_zo_tdm_dictionary.json` | JSON | Full unified dataset — recommended for AI/app loading |
| `data/master_zo_tdm_dictionary.jsonl` | JSONL | Streaming-friendly version |
| `data/data.sqlite` | SQLite | Raw source DB (TKD, MCPG, DLH, Common) |
| `data/ZomiDictionary.db` | SQLite | Raw source DB (ZomiDict) |

## 🏗 Scripts

All scripts are in `scripts/` organized by module:

| Module | Purpose | Key Script |
|:-------|:--------|:-----------|
| `data_pipeline/` | Build master dataset + generate docs | `zolai_data_pipeline.py` |
| `crawlers/` | Web scraping (ZomiDaily, Tongdot, Hymns) | `zomidaily_master.py` |
| `synthesis/` | Generate synthetic training data | `synthesizer_master.py` |
| `maintenance/` | Filters, OCR, grammar checks | `text_filters.py`, `quality_checks.py` |
| `training/` | Export, convert, split for ML training | `export_pipeline.py` |
| `ui/` | Chat interfaces, menus, review tools | `zolai_menu.py` |
| `deploy/` | Shell scripts for deployment | various `.sh` |

## 🔄 Rebuild Everything

```bash
python scripts/data_pipeline/zolai_data_pipeline.py
```

---
*Last Updated: 2026-04-13*

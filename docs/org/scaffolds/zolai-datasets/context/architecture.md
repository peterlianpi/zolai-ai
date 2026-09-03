# Zolai Datasets — Architecture

- Scripts: crawlers, data_pipeline, dictionary, cleaner, bible.
- Storage: HF Hub + Kaggle (canonical), local `data/` gitignored mirror.
- Versioning: timestamped manifest (`data/MANIFEST.json`), HF/Kaggle revision tags.
- Invariants: no large files in git; no secrets; ZVS 2018 compliance.

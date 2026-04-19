# Zolai Notebooks

Kaggle/Jupyter notebooks for data collection, cleaning, training, and evaluation.

## Notebooks

| Notebook | Purpose | Run On |
|----------|---------|--------|
| `zolai-web-crawler-v3.ipynb` | Crawl ZomiDaily, Tongsan, RVAsia news | Kaggle / Local |
| `tongdot_fetcher_batches.ipynb` | Scrape TongDot dictionary in batches | Kaggle / Local |
| `tedim_hymn_scraper.ipynb` | Scrape Tedim hymns corpus (510 hymns) | Local |
| `zolai-cleaner-v2.ipynb` | Clean and deduplicate raw corpus data | Kaggle / Local |
| `zolai-dataset-combiner.ipynb` | Merge all sources into unified training set | Kaggle / Local |
| `zolai-bible-pipeline-v1.ipynb` | Build parallel Bible corpus (TB77 + KJV) | Local |
| `zolai-dataset-gap-audit.ipynb` | Audit dataset coverage and identify gaps | Local |
| `zolai-llm-fine-tuning-on-t4x2.ipynb` | **Primary training** — Qwen2.5-3B chunked weekly sessions, resumes from HF Hub adapter | Kaggle T4x2 |
| `zolai-qwen-training-v2.ipynb` | Full LoRA fine-tune with DDP, packing, eval — for full epoch runs | Kaggle T4x2 |
| `zolai-language-learner-v1.ipynb` | Language learning experiments | Local |

## Recommended Order

1. **Collect** → `zolai-web-crawler-v3`, `tongdot_fetcher_batches`, `tedim_hymn_scraper`
2. **Build Bible** → `zolai-bible-pipeline-v1`
3. **Clean** → `zolai-cleaner-v2`
4. **Combine** → `zolai-dataset-combiner`
5. **Audit** → `zolai-dataset-gap-audit`
6. **Train** → `zolai-qwen-training-v2`

## Setup

```bash
pip install -r requirements.txt
# or on Kaggle — datasets are loaded from HuggingFace / Kaggle datasets
```

## Notes

- Training notebooks require GPU (T4x2 on Kaggle or local CUDA)
- Data files (`.jsonl`, `.db`) are not included — see `data/` directory or HuggingFace Hub

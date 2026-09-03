# Zolai Datasets — Canonical Manifest

> All datasets are gitignored locally. The canonical copy lives on Hugging Face Hub and Kaggle.
> Use `python scripts/data/pull.py <name>` to fetch any dataset on demand.

## Hugging Face Hub — `peterpausianlian`

| Repo | Type | Description | Local target | Notes |
|---|---|---|---|---|
| `peterpausianlian/zolai-tedim-v3` | dataset | ~5.1M deduplicated Zolai sentences (training corpus v3) | `data/training/` | Primary corpus |
| `peterpausianlian/zolai-llm-training-dataset` | dataset | Train/val/test splits prepared for LLM fine-tuning | `data/training/splits/` | Used by `scripts/training/train_kaggle_t4x2.py` |
| `peterpausianlian/zolai-parallel` | dataset | 105k+ parallel ZO-EN translation pairs | `data/parallel/` | Bible + dictionary + curated |
| `peterpausianlian/zolai-dictionary` | dataset | 152k unified ZO-EN dictionary entries | `data/dictionary/` | FTS5 SQLite source |
| `peterpausianlian/zolai-bible` | dataset | TB77, TBR17, Tedim2010 + KJV parallel | `data/bible/` | Verse-aligned |
| `peterpausianlian/zolai-orpo-pairs` | dataset | ORPO/DPO preference pairs for alignment | `data/preference/` | Used after SFT |
| `peterpausianlian/zolai-eval` | dataset | Held-out evaluation benchmarks | `data/eval/` | Bible verses + Zolai Standard rules |

## Kaggle Datasets — `peterpausianlian`

| Slug | Description | Mirror of |
|---|---|---|
| `peterpausianlian/zolai-llm-training-dataset` | Train/val/test splits + training script | HF: `zolai-llm-training-dataset` |
| `peterpausianlian/zolai-adapter-qwen25-3b` | LoRA adapter checkpoints (live, append-only) | HF: `zolai-qwen2.5-3b-lora` |

## Local layout (gitignored)

```
data/
├── README.md              # how to pull
├── training/              # zolai-tedim-v3 + splits
├── parallel/              # zolai-parallel
├── dictionary/            # zolai-dictionary
├── bible/                 # zolai-bible
├── preference/            # zolai-orpo-pairs
├── eval/                  # zolai-eval
└── private/               # ignored, never published
```

## How to refresh this manifest

```bash
python scripts/data/pull.py --list           # show all known datasets
python scripts/data/pull.py zolai-tedim-v3   # fetch one
python scripts/data/pull.py --all            # fetch everything (large!)
```

## Provenance

- `v0-legacy` tag (commit `31bc80f`) is the last commit before the 2026-04 deep cleanup. All historical state is preserved on branch `archive/pre-cleanup-2026-04`.
- Re-publishing data: run the pipeline in `scripts/data_pipeline/` then push via `huggingface-cli upload`.

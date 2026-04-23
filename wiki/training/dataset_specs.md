# Zolai AI Training Dataset Specifications

> Last updated: 2026-04-20
> Language: Tedim Chin (ISO 639-3: ctd, Glottocode: tedi1235)

---

## Summary

| Asset | Count | Location |
|-------|-------|----------|
| Total training sentences | ~5.1M | `llm_train.jsonl` |
| Parallel ZO↔EN pairs | 105,511 | `parallel/zo_en_pairs_combined_v1.jsonl` |
| Dictionary entries | 152,093 | `dict_unified_v1.jsonl` |
| Bible parallel pairs | ~85,000 | 3 versions × KJV |
| ORPO preference pairs | 2,000 | `data/training/orpo_pairs_v1.jsonl` |
| Kaggle dataset | — | `peterpausianlian/zolai-llm-training-dataset` |

---

## Training Splits (v3)

| File | Records | Description |
|------|---------|-------------|
| `llm_train.jsonl` | ~5.1M | Full training set (primary) |
| `llm_val.jsonl` | ~200k | Validation split |
| `llm_test.jsonl` | ~200k | Test split |
| `llm_train_v3.jsonl` | 3,667,728 | Training split v3 (subset) |
| `llm_val_v3.jsonl` | 203,762 | Validation split v3 |
| `llm_test_v3.jsonl` | 203,762 | Test split v3 |

**Kaggle:** `peterpausianlian/zolai-llm-training-dataset`

---

## Parallel Corpus

| File | Pairs | Notes |
|------|-------|-------|
| `zo_en_pairs_combined_v1.jsonl` | 105,511 | All sources combined — primary parallel set |
| `bible_parallel_tedim2010_kjv.jsonl` | ~29,255 | ZVS gold standard — best quality |
| `bible_parallel_tdb77_kjv.jsonl` | ~27,654 | TDB77 1977 version |
| `bible_parallel_tbr17_kjv.jsonl` | ~25,892 | TBR17 version |

**Total Bible parallel:** ~85,000 pairs across 3 Tedim versions × KJV

---

## Dictionary

| File | Entries | Description |
|------|---------|-------------|
| `dict_unified_v1.jsonl` | 152,093 | Raw unified (noisy headwords) |
| `dict_enriched_v1.jsonl` | ~24,891 | Best quality — has real examples, synonyms, antonyms |
| `dict_semantic_v1.jsonl` | ~24,891 | Semantic enriched (21.8% dups — needs dedup) |
| `dict_en_zo_v1.jsonl` | ~24,891 | EN→ZO direction (21.8% dups — needs dedup) |
| `dict_master_v1.jsonl` | 84,448 | Merged master (enriched + bible + unified) |
| `dict_bible_zo_en_v1.jsonl` | 20,561 | Bible corpus ZO→EN |

---

## Instruction Data

| File | Pairs | Description |
|------|-------|-------------|
| `instructions_bible_v1.jsonl` | 50,000 | Bible instruction pairs |
| `orpo_pairs_v1.jsonl` | 2,000 | ORPO preference pairs (ZVS correct vs wrong) |

---

## Evaluation Sets

| File | Count | Description |
|------|-------|-------------|
| `data/eval/zvs_compliance_test_v1.jsonl` | 100 | ZVS dialect compliance test |
| `data/eval/translation_eval_v1.jsonl` | 500 | Held-out translation pairs (Tedim2010 gold) |
| `data/eval/zolai_qa_v1.jsonl` | 500 | QA pairs from dictionary + parallel |

---

## Master Source

**`data/master_source_v1.jsonl`** — 991 MB, ~4.26M records
- Schema: `{zolai, english, source, type, dialect, reference}`
- Monolingual: ~3.9M | Dictionary: ~193k | Parallel: ~110k | Wordlist: ~48k

---

## Dialect Coverage

| Dialect | ISO | Notes |
|---------|-----|-------|
| Tedim ZVS | ctd | Primary — all training targets this dialect |
| Falam (FCL) | cfm | Present in parallel corpus — filtered for CPT |
| Hakha (HCL06) | cnh | Present in parallel corpus — filtered for CPT |

**ZVS standard:** use `pasian/gam/tapa/topa/kumpipa/tua` — never `pasian/ram/fapa/bawipa/siangpahrang/cu`

---

## Quality Notes

| File | Issue | Action |
|------|-------|--------|
| `dict_semantic_v1.jsonl` | 21.8% duplicates | 🔴 Needs dedup |
| `dict_enriched_v1.jsonl` | 21.8% duplicates | 🔴 Needs dedup |
| `dict_en_zo_v1.jsonl` | 21.8% duplicates | 🔴 Needs dedup |
| `llm_train.jsonl` | ~15% `###` noise | 🔴 Clean before CPT |
| `zo_en_pairs_combined_v1.jsonl` | 0.2% dups | ✅ Use as-is |
| `bible_parallel_tedim2010_kjv.jsonl` | 0.5% | ✅ Use as-is |
| `corpus_unified_v1.jsonl` | 0.1% dups | ✅ Clean enough |

### Do Not Use for Training

| File | Reason |
|------|--------|
| `training/final_train.jsonl` (1.2G) | llm_train + val + test merged + untagged old data |
| `training/master_all_versions.jsonl` (1.7G) | All metadata lost, all `source: unknown` |
| `archive/training_versions/*` | Superseded, untagged |

---

## HuggingFace Distribution

```bash
huggingface-cli download peterpausianlian/zolai-tedim-v3 --repo-type dataset
```

All datasets are gitignored locally and distributed via HuggingFace Hub and Kaggle.

# Zolai Project — TODO & Roadmap

> Last updated: 2026-04-20

> **Note:** All training data is hosted on HuggingFace. The `data/` directory is gitignored and not tracked in this repo.

---

## 🔥 Active (This Week)

- [ ] Complete session 3 (50k–75k) — in progress
- [ ] Increase CHUNK_SIZE to 100k from session 4

---

## 📋 Training Pipeline

- [ ] Run 15 sessions to reach 1.5M samples
- [ ] Track val loss per session in `wiki/training/llm_training_roadmap.md`
- [ ] Test generation quality every 5 sessions
- [ ] Merge adapter + export GGUF after quality plateau

---

## 🧪 Evaluation

- [ ] Build eval script against ZVS grammar rules
- [ ] Test on held-out Bible verses (ZO→EN accuracy)
- [ ] Test on parallel pairs (`data/parallel/parallel_combined_v1.jsonl`)
- [ ] Compare dialect: ensure `pasian`, `gam`, `topa` not `pathian`, `ram`, `bawipa`

---

## 🚀 Deployment

- [ ] Merge adapter: `model.merge_and_unload()`
- [ ] Convert to GGUF Q4 with llama.cpp
- [ ] Deploy Gradio demo on HF Spaces
- [ ] Integrate with FastAPI (`zolai/api/`)
- [ ] Connect to Telegram bot
- [ ] Test with Ollama locally

---

## 📦 Data Pipeline

- [ ] Prepare `llm_train.jsonl` splits for 100k chunks
- [ ] Add instruction data to training mix (`data/training/instructions_v1.jsonl`)
- [ ] Add parallel pairs fine-tuning pass (`data/parallel/parallel_combined_v1.jsonl`)
- [ ] Crawl more Zolai news data (ZomiDaily, Tongsan)

---

## 🌐 Website (`website/zolai-project/`)

- [ ] Add dictionary search UI
- [ ] Add translation demo page
- [ ] Connect to trained model API

---

## 🗂️ Data Quality

- [ ] Run `zolai audit-jsonl` on latest training snapshots
- [ ] Deduplicate `data/corpus/sentences_master_v1.jsonl`
- [ ] Review synthetic data quality (`data/corpus/synthetic/`)

---

## 📝 Notes

- Training notebook: `notebooks/zolai-llm-fine-tuning-on-t4x2.ipynb`
- Full training roadmap: `wiki/training/llm_training_roadmap.md`
- HF adapter: `peterpausianlian/zolai-qwen2.5-3b-lora`
- Kaggle adapter: `peterpausianlian/zolai-adapter-qwen25-3b`

# Zolai Second Brain — Open Source Roadmap

> Building a fully capable AI second brain for the Zomi people in Tedim Zolai.

---

## Phase 1 — Foundation (Current)

- [x] Core Python package (`zolai/`) with CLI
- [x] Web crawlers for ZomiDaily, Tongsan, RVAsia, TongDot
- [x] Bible corpus pipeline (TB77, TBR17, Tedim1932, Tedim2010, KJV)
- [x] Unified dictionary (152k entries) with FTS5 SQLite
- [x] Parallel ZO↔EN translation pairs (105k+)
- [x] Instruction synthesis pipeline (v6)
- [x] Training data snapshots (v11 base/cefr/tagged)
- [x] ZVS grammar rules and wiki knowledge base
- [x] Agent definitions (14 specialized agents)
- [x] Next.js dictionary web app

## Phase 2 — Open Source Release

- [ ] Clean public repository (no secrets, no large binaries)
- [ ] Publish datasets to Hugging Face Hub
  - `zolai/tedim-parallel-pairs` — 105k ZO↔EN pairs
  - `zolai/tedim-instructions` — instruction-tuning set
  - `zolai/tedim-dictionary` — unified 152k-entry dictionary
  - `zolai/tedim-bible-corpus` — parallel Bible corpus
- [ ] Publish base fine-tuned model to Hugging Face
- [ ] Contributor guide and `CONTRIBUTING.md`
- [ ] Docker setup for local development
- [ ] CI/CD pipeline (GitHub Actions: lint, test, build)

## Phase 3 — Model & API

- [ ] Fine-tune Qwen2.5-7B on full Tedim dataset (upgrade from current 3B)
- [ ] Evaluate with BLEU/chrF on held-out parallel pairs
- [ ] Public REST API for translation and dictionary lookup
- [ ] Ollama-compatible GGUF model release
- [ ] OpenAI-compatible `/v1/chat/completions` endpoint
- [ ] **AI Tutor Chat** — rebuild chat/tutor UI once model & API are ready
  - Pages: `/chat`, `/tutor`
  - Infrastructure already in `website/zolai-project/lib/ai/`

## Phase 4 — Community & Ecosystem

- [ ] Interactive language learning app (CEFR-tagged lessons)
- [ ] Zolai keyboard / IME support
- [ ] Community contribution portal (crowdsource corrections)
- [ ] Telegram bot (public-facing)
- [ ] Zolai Wikipedia seed corpus
- [ ] OCR pipeline for printed Tedim books

## Phase 5 — Advanced NLP

- [ ] Named entity recognition (NER) for Tedim
- [ ] Part-of-speech tagger trained on ZVS grammar
- [ ] Speech-to-text (ASR) dataset collection
- [ ] Text-to-speech (TTS) voice synthesis
- [ ] Dialect detection (Tedim vs Falam vs Hakha)

---

## Data Release Plan

Large datasets are not stored in this repository. They will be released via:

| Dataset | Target |
|---------|--------|
| Parallel pairs (105k) | Hugging Face Hub |
| Dictionary (152k entries) | Hugging Face Hub + API |
| Training snapshots (v11) | Hugging Face Hub |
| Bible corpus | Hugging Face Hub |
| Fine-tuned model weights | Hugging Face Hub |

See [Hugging Face — zolai](https://huggingface.co/zolai) *(coming soon)*.

---

## Contributing

Contributions welcome — especially:
- Native Tedim speakers for data validation
- Linguists familiar with Tibeto-Burman languages
- ML engineers with low-resource NLP experience

See `CONTRIBUTING.md` *(coming soon)* for guidelines.

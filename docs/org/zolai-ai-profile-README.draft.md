# zolai-ai — Zolai AI Community

> **Draft** org profile README for the future `zolai-ai` GitHub org. Mirror of the
> `P-Core-System` profile style (community map + component links). Not published yet.

Zomi AI — a bilingual (Tedim Zolai ⇄ English) language toolkit for the Zomi
people. We digitize, standardize, and preserve the Zolai language under the
**ZVS 2018 orthography**: high-purity bilingual corpora, fine-tuned open-source
LLMs, a Next.js learner platform, and an offline Tauri desktop app.

## Components

| Repo | What it does |
|------|--------------|
| `core` | Python package + FastAPI (translation, dictionary, chat, RAG) |
| `web` | Next.js + Hono + Prisma learner platform |
| `tauri` | Offline desktop shell (bundled server + local GGUF model) |
| `datasets` | HF/Kaggle datasets, adapters, build scripts |
| `wiki` | Knowledge base: grammar, vocabulary, curriculum, culture |
| `training` | LoRA/QLoRA fine-tuning, adapter merge + GGUF export |

## Connect

```text
web ──REST──▶ core ──HF/Kaggle──▶ datasets
tauri ──REST/GGUF──▶ core        wiki ──RAG──▶ core
training ──▶ datasets + adapters ──▶ core (inference)
```

## Get started

- Install: `pip install -e .`
- Platform: `cd website/zolai-project && bun install && bun run dev`
- Wiki: `wiki/` — the canonical knowledge base (1529 files).

## Contribute

- ZVS 2018 compliance on all language output.
- No secrets in code — tokens from `.env` only.
- Conventional commits; PRs land on `main` (`master` is archived).

Community: join us to build a thriving Zolai AI ecosystem for the Zomi people. 🇿🇲

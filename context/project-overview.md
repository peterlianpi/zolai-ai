# Zolai Second Brain

## Overview

A bilingual (Tedim Zolai ⇄ English) language AI toolkit for the Zomi people. It
digitizes and preserves the Zolai language by harvesting high-purity bilingual
corpora (bible, news, dictionary), fine-tuning small open-source LLMs to
understand and generate fluent Tedim Zolai under the ZVS 2018 orthography, and
exposing a FastAPI backend, a Next.js learner platform, and a Tauri offline
desktop app.

## Goals

1. Build a high-purity bilingual dataset (target 5.1M parallel pairs) served from
   HuggingFace Hub / Kaggle, not git.
2. Fine-tune small Zolai LLMs (0.5B–3B) via LoRA/QLoRA that follow ZVS 2018.
3. Provide a working learner platform (dictionary, curriculum, chat, mind) and an
   offline desktop app.
4. Maintain 100% ZVS 2018 orthography compliance across all outputs and wiki data.

## Core User Flow

1. User installs `zolai` CLI (`pip install -e .`) and sets env keys.
2. CLI/API translate between English and Tedim Zolai.
3. Web learners browse the dictionary, take curriculum lessons, and chat.
4. Desktop users run the bundled server + local model offline.

## Features

### Language Toolkit (CLI/API)

- Crawl, clean, and analyze bilingual corpora
- Dictionary build + semantic search
- Translation and RAG-few-shot requests via FastAPI

### Learner Platform (Web)

- Dictionary UI, curriculum, chat panel, mind map
- Prisma-backed content: dictionary entries, curriculum, contributions

### Training

- LoRA (FP16 r=16) on T4x2 and QLoRA (NF4 r=8) for 3B
- Adapter merge + GGUF export for local/desktop inference

## Scope

### In Scope

- Preserve/digitize Zolai; ZVS 2018 compliance; bilingual datasets + fine-tuned LLMs.
- Python CLI/API + Next.js web + Tauri desktop.
- RAG retrieval over wiki + parallel pairs.

### Out of Scope

- Production multi-tenant SaaS hosting (dev/preview only).
- Non-Zomi languages beyond English pivot translation.

## Success Criteria

1. A user can translate English⇄Tedim Zolai with ZVS 2018 compliance via CLI or API.
2. A web learner can browse the dictionary and complete curriculum lessons.
3. Trainable fine-tuned adapters exist for 0.5B and 3B models and are hosted on HF/Kaggle.
4. The repo has zero hardcoded secrets; all tokens come from `.env`.

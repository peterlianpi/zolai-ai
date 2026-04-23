# Historical Milestones: Zolai and the Zomi People

> **Language:** Tedim Chin (ISO 639-3: ctd) — ZVS Standard Dialect  
> **Last updated: 2026-04-20**

## Pre-Modern Era
*   **Ciimnuai Period:** The legendary "Mother City" and cradle of the Zomi clans.
*   **Oral Preservation:** History was kept in songs (`La`) and oral poetry (`Pasaltit`).

## 1899 - 1910: Arrival of Missionaries
*   **Copepa (J.H. Cope):** Developed the Tedim Romanized script.
*   **Cope's Primers:** The first educational books in Zolai.

## 1932: The Landmark Bible
*   **Tedim 1932 (Lai Siangtho):** This translation standardized many grammar rules and vocabulary that are still in use today. It became the linguistic anchor for the Tedim-speaking Zomi.

## 1948: Independence and Aftermath
*   **Chin State Formation:** Following Myanmar's independence, the Zomi people were categorized as part of the wider Chin ethnic group.
*   **Panglong Agreement:** Zomi leaders participated in the negotiations for the federation.

## 1977: The TB77 Bible
*   **TDB77 / TB77:** A major linguistic update to the Bible, reflecting the language shifts since 1932.

## 2018: The Zokam Standard Version (ZVS)
*   **Zokam Standard Version (ZVS):** Led by LT Tuang and other linguists, this project codified the rules of "Standard Zolai" to reconcile regional differences and archaic forms. It is now the primary reference for this AI Second Brain.
*   **Key ZVS rules:** Use `pasian/gam/tapa/topa/kumpipa/tua`; never `pasian/gam/tapa/topa/kumpipa/tua/tua`. Word order: SOV. Conditional negation: `kei` not `lo`.

## 2026: The AI Second Brain Project
*   **Zolai AI Second Brain** by Peter Pau Sian Lian ([@peterpausianlian](https://huggingface.co/peterpausianlian)): The current endeavor to codify these historical and linguistic layers into a production-ready translation and grammar engine.
*   **Phase 1 complete:** Data pipeline, dictionary (152k entries), Bible corpus (TB77/TBR17/Tedim2010 ↔ KJV), ZVS wiki, 5.1M deduplicated Zolai sentences.
*   **Phase 2 in progress:** Publishing datasets to HuggingFace, CI/CD, open-source release.
*   **Active models:**
    - [`zolai-qwen-0.5b`](https://huggingface.co/peterpausianlian/zolai-qwen-0.5b) — Base: Qwen2.5-0.5B-Instruct, LoRA FP16 (r=16, alpha=32), T4x2, training at chunk 300k–800k of 5.1M sentences.
    - [`zolai-qwen2.5-3b-lora`](https://huggingface.co/peterpausianlian/zolai-qwen2.5-3b-lora) — Base: Qwen2.5-3B-Instruct, QLoRA 4-bit NF4 (r=8, alpha=16), single T4, training at chunk 300k+.
*   **Stack:** Python 3.10+, FastAPI, Next.js 16, Bun, PostgreSQL/Prisma, HuggingFace Hub, Kaggle (T4 GPU).
*   **Roadmap:** Phase 3 (GGUF export, public REST API, Ollama), Phase 4 (language learning app, Telegram bot, OCR), Phase 5 (NER, POS tagger, ASR, TTS, dialect detection).

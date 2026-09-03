# Zolai AI: System Architecture & Data Pipeline

This document defines the high-level architecture and the specific 5-step data pipeline for the Zolai (Tedim Chin) AI system.

## 1. System Flowchart

```mermaid
flowchart TD
    subgraph data_sources["Data Sources"]
        direction LR
        ds1[( "Bible Parallel (31K Pairs)" )]
        ds2[( "Dictionary (21K Entries)" )]
        ds3[( "Tongsan News Articles" )]
    end

    subgraph pipeline["Data Cleaning Pipeline (Step 1-2)"]
        direction LR
        p1["Deduplication (MD5)"] --> p2["Normalization (NFKC/Zolai Standard)"]
        p2 --> p3["Prompt Generation (Rule-based)"]
    end

    subgraph agentic_loop["Agentic AI Workflow (Step 3-4)"]
        direction LR
        a1["LLM Correction (Gemini/OpenRouter)"] --> a2["Mental Back-translation"]
        a2 --> a3{"Semantic Scoring (Cosine Similarity > 0.85)"}
        a3 -->|Low Score| a4["Self-Correction Loop (LangGraph)"]
        a4 --> a1
    end

    subgraph human_review["Human-in-the-Loop (Step 5)"]
        direction LR
        h1["CLI Review Tool"] --> h2{"Approved?"}
        h2 -->|Yes| h3[/"Verified Dataset (JSONL)"/]
        h2 -->|No| h4["Manual Refinement"]
        h4 --> h3
    end

    subgraph knowledge_base["Knowledge Base & Memory"]
        direction LR
        k1[( "Vector DB (ChromaDB/FAISS)" )]
        k2["RAG / Few-Shot Examples"]
    end

    subgraph training_deployment["Training & Deployment"]
        direction LR
        t1["LoRA Adapter (Unsloth)"] --> t2["Local Model (Llama-3/Qwen)"]
        t2 --> d1(["P-Core API / Dashboard"])
    end

    %% External Connections
    ds1 & ds2 & ds3 --> p1
    p3 --> a1
    a3 -->|High Score| h1
    h3 --> k1
    k1 --> k2
    k2 -.-> a1
    h3 --> t1
```

## 2. The 5-Step Pipeline Explained

### Step 1: Deduplication (MD5)
- **Action**: Reads raw seed data (e.g., `tech_seed_data.jsonl`).
- **Logic**: Uses MD5 hashing to ensure every sentence pair is unique.
- **Output**: `tech_seed_data_dedup.jsonl`.

### Step 2: Normalization & Prompt Generation
- **Normalization**: Enforces **Zolai Standard** rules (e.g., `na ding` -> `nading`, `uh hi` -> `uh hi`).
- **Prompting**: Wraps broken data in a structured prompt that forces the LLM to apply **Ergative-Absolutive alignment** and **OSV word order**.

### Step 3: LLM Correction (Agentic Workflow)
- **Execution**: Sends prompts to Gemini, OpenAI, or OpenRouter.
- **Rules**: The LLM must verify SVO hallucinations and apply the `in` ergative marker.

### Step 4: Semantic Scoring & Self-Correction
- **Scoring**: Uses `all-MiniLM-L6-v2` to calculate cosine similarity between the original English intent and the LLM's **Back-Translated English**.
- **Threshold**: Scores below **0.85** are flagged.
- **Agent Loop**: (Planned) Using LangGraph to automatically re-prompt the LLM if the score is low.

### Step 5: Human-in-the-Loop Review
- **Tool**: A CLI menu for native speakers to review, edit, and approve the final JSONL entries.
- **Outcome**: A "Gold Standard" dataset ready for RAG or Fine-tuning.

## 3. Linguistic Mandate (Zolai Standard)
- **Strict Tedim**: No Hakha/Falam vocabulary.
- **Compound Orthography**: Joining words like `nasep`, `leitung`, `nading`.
- **Plurality**: No `uh` marker with first-person inclusive `i` (e.g., `I pai hi` is correct).
- **Apostrophes**: Mandatory placement for contractions (e.g., `na'ng`).

---
*Document generated for Zolai AI Project.*

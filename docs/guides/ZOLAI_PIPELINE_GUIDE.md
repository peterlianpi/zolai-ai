# Zolai AI Data Pipeline & Agentic Workflow Guide

This document outlines the architecture, usage, and future recommendations for the Zolai (Tedim Chin) AI Translation and Data Correction Pipeline. 

The primary goal of this system is to enforce correct Zolai grammar—specifically **Ergative-Absolutive alignment** and **OSV word order**—eliminating the common "literal SVO" hallucinations produced by off-the-shelf LLMs.

---

## 🛠️ System Setup & Requirements

To use the AI correction and semantic scoring tools, ensure your environment has the following packages installed:

```bash
pip install openai google-generativeai sentence-transformers
```

*Note: `sentence-transformers` is used locally (without API costs) to calculate the cosine similarity between English intents and the LLM's Back-Translated English to mathematically prove semantic accuracy.*

---

## 🚀 Running the Pipeline

We have consolidated the entire workflow into a single interactive CLI menu.

**Launch the Menu:**
```bash
python scripts/pipeline_menu.py
```

### The 5-Step Workflow:
1. **Deduplicate Tech Seed Data**: Reads `resources/tech_seed_data.jsonl` and uses MD5 hashing to remove duplicate sentences, outputting to `tech_seed_data_dedup.jsonl`.
2. **Generate Prompts**: Wraps the broken seed data in a highly structured prompt forcing the LLM to check for SVO hallucinations, apply the `in` ergative marker, and perform a mental back-translation.
3. **Run LLM Correction**: Sends the prompts to the LLM of your choice.
   - **Supported Providers**: OpenAI, Gemini, and OpenRouter.
   - **API Keys**: The menu will automatically prompt you to paste your API key if it isn't already exported in your environment.
   - *For OpenRouter*, you can specify exact models (e.g., `anthropic/claude-3-haiku` or `meta-llama/llama-3-70b-instruct`).
4. **Score Back-Translations**: Uses the `all-MiniLM-L6-v2` local embedding model to compare the original English meaning against the LLM's English back-translation. Anything scoring `< 0.85` similarity gets flagged.
5. **Human-in-the-Loop CLI Review**: Opens a simple terminal UI allowing a native speaker to quickly review a random sample of the fixed texts, back-translations, and flags.

---

## 📚 Core AI Resources & Prompts

The system relies on dynamically generated rule-sets compiled into the `resources/` folder:
*   `zolai_system_prompt.txt`: The master prompt fed to the LLMs. It is built automatically from the following:
*   `zolai_ai_instructions.md`: Rules on SVO avoidance, Ergative alignment, and Back-translation loops.
*   `zolai_grammar_cheat_sheet.md`: Syntax and structural rules.
*   `zolai_everyday_vocabulary.md`: Standardized vocabulary mined from Zolai dictionaries and children's books.

*(To rebuild the master prompt after modifying any of the markdown files, run: `python scripts/build_system_prompt.py`)*

---

## 💡 Strategic Recommendations for Scaling

Now that the foundational pipeline is complete, here are the recommended next steps to scale the Zolai AI to production-grade:

### 1. Scale the Dataset Source
Currently, the pipeline targets `tech_seed_data.jsonl`. 
*   **Recommendation**: Once the pipeline proves successful on the tech seed, point it at the much larger `data/tongsan_articles.jsonl` or `data/zolai_core_vocabulary.json`. Modify `scripts/fix_seed_data_pipeline.py` to iterate over these massive files. Use cheap, fast models (like `claude-3-haiku` via OpenRouter) to correct grammar across the entire corpus.

### 2. Implement the Vector Database (Memory)
As detailed in `resources/agentic_system_architecture.md`, the LLM currently translates from scratch using only the system prompt.
*   **Recommendation**: Set up **ChromaDB** or **FAISS**. When you use the "Human-in-the-loop" script (Step 5) to approve a translation, insert that sentence into the Vector DB. Update the LLM call to perform a **RAG (Retrieval-Augmented Generation)** search first, injecting past successful translations into the prompt as "Dynamic Few-Shot Examples." This creates a self-learning agent.

### 3. Fully Autonomous Agent Loop (LangGraph)
Currently, if an LLM fails the Semantic Score (< 0.85), it simply flags it in the JSON.
*   **Recommendation**: Use **LangGraph** or **AutoGen** to build a `while` loop. If the back-translation score is low, the python script should automatically re-prompt the LLM: *"Your back-translation meant X, but I needed Y. Try again, ensuring you apply the OSV rule."* This allows the AI to self-correct before a human ever sees it.

### 4. Fine-Tuning a Local Model (Llama 3 / Mistral)
Once this pipeline has successfully generated 5,000 to 10,000 highly-scored, grammatically perfect (Ergative + OSV) `{"english": "...", "zolai": "..."}` pairs.
*   **Recommendation**: Use **Unsloth** or **HuggingFace PEFT** to train a LoRA adapter on Llama-3-8B. Because the dataset was rigorously scrubbed of SVO hallucinations by this pipeline, the resulting open-source model will inherently "think" in Zolai grammar without needing the massive system prompt anymore.
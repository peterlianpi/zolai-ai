# Zomi AI: The Zolai Second Brain — Project Context

## Project Overview
**Zomi AI** (Zolai Second Brain) is a production-grade NLP toolkit and ecosystem dedicated to the **Tedim Zolai** language (ZVS 2018 Standard). It encompasses a full pipeline for data collection, cleaning, linguistic analysis, instruction synthesis, and LLM fine-tuning.

- **Vision:** Ensure Zolai thrives in the AI era by building a "Zolai AI Second Brain."
- **Mission:** Digitize, standardize, and preserve Zolai through automated pipelines and high-purity datasets.
- **Primary Standard:** **Tedim ZVS** (Zolai Vernacular Standard 2018).

## Tech Stack
| Component | Technology |
|---|---|
| Core Language | Python 3.10+ |
| Backend Framework | FastAPI, Typer (CLI) |
| Frontend | Next.js, Tailwind CSS, Bun |
| Database | PostgreSQL (Prisma), SQLite (FTS5 for Dictionary) |
| ML/LLM | Transformers, PEFT, TRL, Accelerate, Datasets |
| Infrastructure | Kaggle (Training), Hugging Face Hub, Cloudinary |
| Data Processing | Pandas, NumPy, Scikit-learn, BeautifulSoup4 |

## Key Scripts & Commands
### Python Toolkit
- **Installation:** `pip install -e .` or `pip install -e ".[dev,gui]"`
- **CLI Entrypoint:** `zolai` (defined in `zolai/cli/main.py`)
- **Common Tasks:**
    - `zolai standardize-jsonl -i <input> -o <output> --dedupe`
    - `zolai audit-jsonl -i <input>`
    - `python zolai_menu.py` (Interactive menu)
    - `python scripts/search_dictionary.py <word>`

### Data Pipeline & Training
- `python scripts/crawlers/crawl_all_news.py` — Collect news data.
- `python scripts/build_master_dataset.py` — Compile the master training set.
- `python scripts/synthesize_instructions_v6.py` — Generate synthetic instruction data.
- `python train_llm.py` — Fine-tune models (typically on Kaggle).

### Website (Next.js)
- **Location:** `website/zolai-project/`
- **Commands:** `bun install`, `bun dev`, `bunx prisma migrate dev`

## Project Structure
```
zolai/
├── zolai/              # Core Python package (cleaner, trainer, analyzer, cli, api)
├── scripts/            # Functional scripts (crawlers, data_pipeline, training, synthesis)
├── data/               # Unified data store (~22GB: corpus, dictionary, training, master)
├── wiki/               # Knowledge base (grammar, vocabulary, culture)
├── agents/             # YAML/JSON definitions for specialized AI agents
├── docs/               # Guides, audit reports, and logs
├── website/            # Next.js web application
├── artifacts/          # Reports and visualizations
└── config/             # Config files (LoRA, environment, optimization)
```

## Linguistic Mandates (Strict Tedim ZVS)
All generation and validation MUST adhere to the **Tedim Zolai** normative standard. Non-Tedim (Hakha, Falam, Mizo) variants are strictly forbidden.

1.  **Vocabulary:** Use `Pasian` (God), `Gam` (Land), `Tapa` (Son), `Topa` (Lord), `Tua` (That/Then). Avoid `Pathian`, `Ram`, `Fapa`, `Bawipa`, `Cu`.
2.  **Plurality:** Never use `uh` with `i` (we inclusive). Example: `I pai hi` ✅, `I pai uh hi` ❌.
3.  **Orthography:**
    - **Compounds:** Must be joined: `nasep`, `leitung`, `nading`, `hihleh`.
    - **Apostrophe (Pawfi):** Mandatory for contractions (`na'ng`, `n'ong`) and possession (`Pasian' thu`).
    - **Phonetics:** No `ti` (use `te`), no `c` with `a, e, o, aw` (use `k/s`).
4.  **Grammar:**
    - **Stem II:** Use Stem II for nominalization and subordinates (`mu` -> `muhna`).
    - **Negation:** Use `kei` for conditionals (`pai kei leh` ✅, `pai lo leh` ❌).
    - **Word Order:** Strictly **SOV** (Subject-Object-Verb).

## Configuration
- Centralized configuration is managed in `zolai/config.py`.
- Paths and environment variables are overridable via `.env`.
- Key directories are defined in the `Paths` dataclass.

## Development Conventions
- **Naming:** `kebab-case` for files/folders, `PascalCase` for classes, `snake_case` for functions.
- **Linting:** Ruff is used for Python linting (`ruff check .`).
- **Data:** Always validate JSONL integrity with `zolai audit-jsonl` before merging.
- **Standardization:** All Zolai text must pass through the `ZVS` cleaner/standardizer.

---

## Dictionary Verification & Correction Guide

### Your Task
When asked to verify dictionary entries, you must:
1. Check the English translation is accurate for the Zolai word
2. Verify the example sentence follows SOV grammar and is natural Zolai
3. Check the English translation of the example matches the Zolai
4. Flag homonyms and add a `note` field
5. Suggest better synonyms if missing
6. Assign correct CEFR level (A1=basic, B2=advanced)

### Entry Format
```json
{
  "zolai": "Innkuan",
  "english": "Family / Household",
  "pos": "Noun",
  "dialect": "tedim",
  "source": "zolai-dataset",
  "category": "kinship",
  "synonyms": ["Innkuanpih"],
  "cefr": "A1",
  "example_zo": "Ka innkuan uh a lian hi.",
  "example_en": "My family is big.",
  "original_english": "family",
  "note": "optional cultural or usage note"
}
```

### Known Wrong Translations (from raw scrape — watch for similar)
| Word | Was Wrong | Correct |
|---|---|---|
| Van | "article" | "Sky / Heaven" |
| Kha | "bitter" | "Moon" (also bitter — homonym) |
| Guah | "nature" | "Rain" |
| Tui | "lake" | "Water" |
| Sam | "beakon" | "Hair" (also "to call" — homonym) |
| Ha | "blade" | "Tooth / Teeth" |
| Suang | "adit" | "Stone / Rock" |
| Lei | "bridge" | "Soil / Earth" (also "Tongue" — homonym) |
| Khuavak | "twilight" | "Light / Daytime" |
| Singgah | "mast" | "Fruit" |
| Khutme | "napkin" | "Finger" |
| Ngawng | "neek" | "Neck" |
| Piteek | "beldam" | "Old woman / Grandma" |
| Sanggam | "kinsman" | "Kinsman / Brethren (shared lineage or community)" |
| Khanggui | "ancestry" | "Genealogy / Clan record" |
| Phung | "chapter" | "Tribe / Lineage" |
| Ta | "bastard" | "Child / Offspring" |

### Homonyms to Handle Carefully
| Word | Meaning 1 | Meaning 2 |
|---|---|---|
| Sam | Hair (Noun) | To call/summon (Verb) |
| Lei | Soil/Earth (Noun) | Tongue (Noun) |
| Ni | Sun (Noun) | Aunt — father's sister (Noun) |
| Tu | Grandchild (Noun) | Now (Adverb) |
| Mak | Son-in-law (Noun) | To vomit (Verb) |
| Kha | Moon (Noun) | Bitter (Adj) |

### Example Sentence Rules
- SOV order: `Ka nu in an a huan hi.` ✓ (My mother cooks food.)
- Pronouns: `ka` (my/I), `na` (your/you), `a` (his/her/its), `i` (we)
- Statements end with `hi`, questions with `hiam`
- Conditionals: `a leh` not `lo leh`
- Never `i uh` together for plural we

Bad: `Nu in an huan.` ✗
Good: `Ka nu in an a huan hi.` ✓

### Context Sources (Gold Standard = Bible)
- Bible corpus: `data/corpus/bible/` — most reliable verified Zolai
- Parallel pairs: `data/parallel/parallel_combined_v1.jsonl` — 105k ZO↔EN pairs
- Grammar: `wiki/bundle/01_language_guide.md`
- Culture: `wiki/bundle/06_culture_history.md`

### Gemini CLI Commands

**Verify a single entry:**
```bash
gemini -p "$(cat GEMINI.md)" "Verify this Zolai dictionary entry and correct any errors, output fixed JSON: {\"zolai\": \"Guah\", \"english\": \"nature\", \"example_zo\": \"Tuni guah a zu hi.\", \"example_en\": \"It is raining today.\"}"
```

**Verify a random batch of 20:**
```bash
gemini -p "$(cat GEMINI.md)" "$(python3 -c 'import json,random; lines=[json.loads(l) for l in open("data/dictionary/wordlists/zo_en_singlewords_v1.jsonl") if l.strip()]; sample=random.sample([e for e in lines if e.get("category","")=="wordlist"],20); print(json.dumps(sample,ensure_ascii=False,indent=2))')" "Verify all 20 entries. Mark ✓ correct or ✗ wrong. For wrong ones output the corrected JSON."
```

**Check example sentence grammar:**
```bash
gemini -p "$(cat GEMINI.md)" "Is this Zolai sentence grammatically correct Tedim ZVS? Explain: 'Ka nu in anlim a huan hi.'"
```

**Enrich an entry:**
```bash
gemini -p "$(cat GEMINI.md)" "Enrich this entry — add better example, synonyms, cultural note, correct CEFR: {\"zolai\": \"Beh\", \"english\": \"Clan\"}"
```

**Batch correct unverified wordlist entries:**
```bash
python3 -c "
import json
lines = [json.loads(l) for l in open('data/dictionary/wordlists/zo_en_singlewords_v1.jsonl') if l.strip()]
unverified = [e for e in lines if e.get('category') == 'wordlist'][:50]
print(json.dumps(unverified, ensure_ascii=False, indent=2))
" | gemini -p "$(cat GEMINI.md)" "Verify and correct all entries. Output corrected JSONL, one entry per line."
```

### Output Format for Corrections
Always output valid JSONL — one entry per line:
```json
{"zolai": "Word", "english": "Correct translation", "pos": "Noun", "dialect": "tedim", "source": "zolai-dataset", "category": "nature", "synonyms": [], "cefr": "A1", "example_zo": "Correct Zolai sentence.", "example_en": "English translation.", "original_english": "old wrong value", "note": "homonym or cultural note if needed"}
```

### Categories
`kinship` | `nature` | `body` | `food` | `action` | `emotion` | `place` | `time` | `religion` | `culture` | `education` | `wordlist` (= unverified, prioritize these)

## Current Training State (2026-04-20)
- Dataset: llm_train_v3.jsonl (651MB, ~2M samples)
- ORPO pairs: data/training/orpo_pairs_v1.jsonl (1GB)
- Eval: data/eval/ (QA, translation, ZVS compliance benchmarks)
- Adapter: peterpausianlian/zolai-qwen2.5-3b-lora
- Next steps: Complete session training, merge adapter, export GGUF Q4

## Session-Based Training

Each Kaggle session processes 25,000 rows from `llm_train.jsonl`:

```python
# UPDATE EACH SESSION in scripts/training/train_kaggle_t4x2.py:
CHUNK_START    = 0        # 0, 25000, 50000, 75000 ...
RESUME_ADAPTER = None     # None = fresh; "peterpausianlian/zolai-qwen2.5-3b-lora" to resume
```

**Kaggle setup:**
1. Dataset: `peterpausianlian/zolai-llm-training-dataset`
2. Secrets: `HF_TOKEN`, `KAGGLE_KEY`
3. Accelerator: T4 GPU (single)
4. Script: `scripts/training/train_kaggle_t4x2.py`

**Config:** Qwen2.5-3B-Instruct · QLoRA 4-bit NF4 · r=8, alpha=16 · batch 4×8 · paged_adamw_8bit

### Evaluation
```bash
python scripts/evaluate_model.py
```
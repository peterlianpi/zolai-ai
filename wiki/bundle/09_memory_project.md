# Zolai AI — 09_memory_project.md


---
## [long_term.md]

# Zolai Project — Long-Term Memory

> Last updated: 2026-04-18

---

## 🏗️ Architecture Decisions

### LLM Training Stack
- **Model:** Qwen2.5-3B-Instruct
- **Method:** QLoRA (4-bit NF4, r=8, lora_alpha=16)
- **Hardware:** Kaggle T4 x1 (single GPU — DataParallel breaks 4-bit models)
- **Optimizer:** paged_adamw_8bit
- **Strategy:** Chunked weekly training, cumulative adapter, HF Hub persistence

### Why Qwen2.5-3B
| Model | Rejected Reason |
|---|---|
| Gemma-3-4B-IT | QLoRA bugs: token_type_ids + CUDA illegal memory access |
| Gemma-7B-IT | 0.06 it/s on dual T4 |
| Gemma-2-2B-IT | Less multilingual capacity |
| Qwen2.5-3B | ✅ Best multilingual, no bugs, fast on single T4 |

### Three-Stage Training Pipeline
1. **CPT** — raw Zolai text, 80% ZO + 20% EN
2. **SFT** — instruction pairs, 100% ZO
3. **DPO** — ZVS correct (chosen) vs wrong dialect (rejected)

Evidence: Basque pipeline (Corral et al. 2024) — CPT +12pts NLU, SFT+DPO +24pts instruction.

---

## 📚 Data Assets

### Master Source
**`data/master_source_v1.jsonl`** — 991 MB, 4,261,017 records
- Schema: `{zolai, english, source, type, dialect, reference}`
- Monolingual: 3,908,626 | Dictionary: 193,005 | Parallel: 110,233 | Wordlist: 47,572

### Dictionary
| File | Entries | Description |
|---|---|---|
| `dict_master_v1.jsonl` | 81,644 | Merged master (enriched + bible + unified) |
| `dict_bible_zo_en_v1.jsonl` | 20,561 | Bible corpus ZO→EN |
| `dict_bible_learned_v1.jsonl` | 15,403 | Verse-by-verse study vocab |
| `dict_enriched_v1.jsonl` | ~24k | Best quality — has real examples |
| `dict_unified_v1.jsonl` | 152k | Raw unified (noisy headwords) |

### Training Data
| File | Count | Description |
|---|---|---|
| `instructions_bible_v1.jsonl` | 329,676 | 3 Bible versions × 4 templates |
| `llm_train_v3.jsonl` | ~622MB | Main training set |
| `data/dictionary/bible_study/` | 65 files | Per-book verse study |

### Bible Parallel Sources
| File | Pairs | Notes |
|---|---|---|
| `bible_parallel_tedim2010_kjv.jsonl` | 28,873 | ZVS standard — best quality |
| `bible_parallel_tdb77_kjv.jsonl` | 27,654 | TDB77 1977 |
| `bible_parallel_tbr17_kjv.jsonl` | 25,892 | TBR17 |
| `zo_en_pairs_combined_v1.jsonl` | 105,511 | All sources combined |

---

## 🔬 Training Progress

| Session | Chunk | Val Loss | Date |
|---|---|---|---|
| 1 | 0–25k | 2.9856 | 2026-04-17 |
| 2 | 25k–50k | 2.7398 | 2026-04-17 |
| 3 | 50k–75k | ~2.535 | 2026-04-17 |

Target: < 2.0

---

## 🌐 Infrastructure

| Service | Location |
|---|---|
| HF Hub adapter | `peterpausianlian/zolai-qwen2.5-3b-lora` |
| Kaggle dataset | `peterpausianlian/zolai-adapter-qwen25-3b` |
| Training dataset | `peterpausianlian/zolai-llm-training-dataset` |
| Website | `website/zolai-project/` (Next.js + Prisma) |
| API | `zolai/api/` (FastAPI) |

---

## 📝 ZVS Language Rules

### Use (Tedim ZVS)
`pasian`, `gam`, `tapa`, `topa`, `kumpipa`, `tua`, `sanginn`, `kei`

### Never Use (non-ZVS)
| Wrong | Correct | Reason |
|---|---|---|
| pasian | pasian | Hakha/Falam dialect |
| gam | gam | Hakha dialect |
| sanggin | sanginn | Spelling error |
| tua / tua | tua | Hakha demonstrative |
| tapa | tapa | Non-ZVS |
| topa | topa | Non-ZVS |
| kumpipa | pasian | Non-ZVS |

### Negation Rules
| Context | Use | Example |
|---|---|---|
| Conditionals | `kei` ONLY | `Nong pai kei a leh` |
| 1st/2nd person | `kei` preferred | `Ka dam kei hi` |
| 3rd person past/state | `lo` valid | `Amah dam lo hi` |
| Absolute negation | `kei lo` | `Pasian dang kei lo` |
| Not yet | `nai lo` | `A pai nai lo hi` |
| No more | `nawn lo` | `A pai nawn lo hi` |

### Grammar
- Word order: SOV (with `in` marker) / OSV (most natural)
- Plural: never combine `uh` with `i`
- `o` is always /oʊ/

---

## 🔑 Key Research Findings

- **Burmese-Coder-4B**: 974 clean examples + $40 → matched Gemma-3 4B. Quality > quantity.
- **Basque pipeline**: CPT 521M words → +12pts; SFT+DPO → +24pts instruction following
- **CPT ratio**: 80% target language + 20% English prevents catastrophic forgetting
- **DPO**: only works on language-adapted base — applying to generic model made it worse

---

## 💡 Lessons Learned

1. `tuada_visible_devices=0` required for QLoRA — prevents DataParallel issues
2. `report_to="none"` required for loss to show in Kaggle console
3. 100k chunks fit in ~9.5h — perfect for overnight Kaggle sessions
4. Adapter is cumulative — always load previous adapter before next chunk
5. Val loss is the real metric — train loss noisy with small batches
6. 15% of llm_train is `###` instruction noise — filter before CPT
7. `master_all_versions.jsonl` is unusable — all metadata lost
8. Parallel dedup key must include english field
9. `dict_unified_v1.jsonl` has phrase headwords — skip entries with spaces when merging
10. Bible book codes vary: SNG=SON across versions — all 66 books present in all 3 JSONL files
11. Instruction format: `X panin Y ah let in:` — `let` = turn/convert, use for both directions
12. Family terms need explicit blocking: tanu→daughter blocks {son,sons,child,children}
13. High-frequency words (>30% max co-occurrence) are noise in `related` field

---

## 🚀 Pipeline Phases

| Phase | Task | Cost |
|---|---|---|
| 0 | Data cleaning | free |
| 1 | Generate SFT + DPO datasets | free |
| 2 | SFT run (RunPod H100) | ~$10 |
| 3 | DPO run (RunPod H100) | ~$5 |
| 4 | Evaluate | free |
| 5 | Merge + export GGUF | ~$3 |
| 6 | Deploy (HF Spaces, API, Telegram) | free |
| 7 | Continue CPT (Kaggle) | free |

---

## 🔜 Next Actions

1. Add `instructions_bible_v1.jsonl` to training pipeline
2. Build DPO pairs — ZVS correct vs dialect errors
3. Scale instruction synthesis — 329k Bible only, need diverse domains
4. Translate No_Robots (9.5k) to Zolai — ~$50 API cost
5. Run MinHash dedup on `corpus_master_v1.jsonl`
6. Merge `dict_master_v1.jsonl` into website dictionary
7. Submit Zolai corpus to SEACrowd

---

## 2026-04-17 — Bible Dictionary Pipeline

### Data Assets Created
| File | Size | Description |
|---|---|---|
| `dict_master_v1.jsonl` | ~84448 entries | Merged master dictionary |
| `instructions_bible_v1.jsonl` | ~50000 pairs | Bible-derived instruction pairs |
| `data/dictionary/bible_study/` | 65 files | Per-book verse study |

### Key Learnings
- `lo` is valid ZVS negation (3rd person/past) — not Hakha-only
- `kei lo` = compound absolute negation ("none/not any")
- `pasian` = Hakha — always use `pasian` in ZVS
- `sanginn` = correct spelling (not `sanggin`)
- Family terms need explicit blocking to prevent co-occurrence bleeding

### Architecture
- Positional weighting for ZO↔EN alignment
- High-frequency noise filter for `related` field
- CEFR tagging: first_book + frequency → A1–C2
- Antonym inference from negation context patterns

---

## 2026-04-17 — Bible Dictionary Pipeline

### Data Assets Created
| File | Size | Description |
|---|---|---|
| `dict_master_v1.jsonl` | ~73931 entries | Merged master dictionary |
| `instructions_bible_v1.jsonl` | ~50000 pairs | Bible-derived instruction pairs |
| `data/dictionary/bible_study/` | 65 files | Per-book verse study |

### Key Learnings
- `lo` is valid ZVS negation (3rd person/past) — not Hakha-only
- `kei lo` = compound absolute negation ("none/not any")
- `pasian` = Hakha — always use `pasian` in ZVS
- `sanginn` = correct spelling (not `sanggin`)
- Family terms need explicit blocking to prevent co-occurrence bleeding

### Architecture
- Positional weighting for ZO↔EN alignment
- High-frequency noise filter for `related` field
- CEFR tagging: first_book + frequency → A1–C2
- Antonym inference from negation context patterns

---

## 2026-04-17 — Bible Dictionary Pipeline

### Data Assets Created
| File | Size | Description |
|---|---|---|
| `dict_master_v1.jsonl` | ~73936 entries | Merged master dictionary |
| `instructions_bible_v1.jsonl` | ~50000 pairs | Bible-derived instruction pairs |
| `data/dictionary/bible_study/` | 65 files | Per-book verse study |

### Key Learnings
- `lo` is valid ZVS negation (3rd person/past) — not Hakha-only
- `kei lo` = compound absolute negation ("none/not any")
- `pasian` = Hakha — always use `pasian` in ZVS
- `sanginn` = correct spelling (not `sanggin`)
- Family terms need explicit blocking to prevent co-occurrence bleeding

### Architecture
- Positional weighting for ZO↔EN alignment
- High-frequency noise filter for `related` field
- CEFR tagging: first_book + frequency → A1–C2
- Antonym inference from negation context patterns

---
## [short_term.md]

# Zolai Project — Short-Term Memory

> Updated: 2026-04-18 | Tracks what we are actively doing RIGHT NOW.

---

## 🔴 Active Right Now

- **Bible dictionary + instruction pipeline** — complete for this session
- Next: merge instruction data into training pipeline, run NAH study

---

## ✅ Completed This Session (2026-04-17–18)

### ZVS Corrections Learned
- `pasian` = Hakha/Falam — NOT ZVS. Always use `pasian`
- `sanginn` = correct ZVS spelling for "school" — never `sanggin`
- `lo` = valid ZVS negation (3rd person, past/state) — NOT forbidden
- `kei` = preferred 1st/2nd person + ALL conditionals (`kei a leh`)
- `kei lo` = compound absolute negation — "none/not any" (Ten Commandments)
- `dam kik ta hi` = I am well again | `Ka dam kei hi` = I am not well
- `Amah dam lo hi` = He/she is not well

### Scripts Built
| Script | Purpose |
|---|---|
| `scripts/build_bible_dictionary.py` | Corpus-driven ZO↔EN dict, 20,561 entries |
| `scripts/study_bible_books.py` | Verse-by-verse study all 66 books |
| `scripts/data_pipeline/build_master_pipeline.py` | Merge dicts + CEFR + antonyms + family fixes |
| `scripts/data_pipeline/generate_bible_instructions.py` | 329,676 instruction pairs from 3 Bible versions |

### Data Assets Produced
| File | Size | Description |
|---|---|---|
| `dict_bible_zo_en_v1.jsonl` | 35MB | 20,561 ZO→EN entries |
| `dict_bible_en_zo_v1.jsonl` | 3MB | 9,655 EN→ZO reverse index |
| `dict_bible_learned_v1.jsonl` | 3MB | 15,403 vocab with first_book |
| `dict_master_v1.jsonl` | ~81,644 entries | Merged master dictionary |
| `data/dictionary/bible_study/` | 65 files | Per-book study (01_GEN→66_REV) |
| `instructions_bible_v1.jsonl` | ~329,676 pairs | ZO↔EN from 3 Bible versions |

### Instruction Pairs Format
- `Translate from Zolai to English: {zo}` → `{en}`
- `Translate from English to Zolai: {en}` → `{zo}`
- `Zolai panin English ah let in: {zo}` → `{en}`
- `English panin Zolai ah let in: {en}` → `{zo}`
- Sources: Tedim2010 (28,873) + TDB77 (27,654) + TBR17 (25,892) = 82,419 unique pairs × 4 = 329,676
- All 66 books covered (SON=SNG, book codes vary by version)

### Dictionary Quality
- Family terms fixed: tanu=daughter, tapa=son, nu=mother, pa=father
- 471 antonym pairs inferred from negation patterns
- CEFR tags: A1=5,639 / A2=3,541 / B1=3,966 / B2=779 / C1=1,225 / C2=66,494
- ZVS corrections map: pasian→pasian, sanggin→sanginn, gam→gam, tua/tua→tua

### Wiki/Agents Updated
- `wiki/negation/negation_guide.md` — complete kei/lo/kei-lo reference
- `agents/zolai-bible-dictionary-builder/agent.json` — new agent
- `agents/zolai-ggammar-learner/agent.json` — 3 new completed topics

---

## 🔜 Next Actions

1. **Add instructions_bible_v1.jsonl to training pipeline** — merge with existing SFT data
2. **Re-run study_bible_books.py with NAH** — now copied to TDB77 folder
3. **Merge dict_master_v1.jsonl into website dictionary** — seed-dictionary.ts
4. **Build DPO pairs** — ZVS correct (chosen) vs dialect errors (rejected)
5. **Scale instruction synthesis** — currently 329k Bible only, need diverse domains
6. **Run MinHash dedup** on corpus_master_v1.jsonl

---

## 🐛 Known Issues

| Issue | Status |
|---|---|
| tanu still has "begat" in translations | Co-occurrence noise — needs word aligner |
| synonyms/same_meaning has proper noun noise | Filtered apostrophes, still some noise |
| dict_master pasian stored as "theo" | Enriched dict has wrong english field for some entries |
| C2 count very high (66k) | Most words rare/biblical — expected for Bible corpus |

---

## Session: 2026-04-17 (Pipeline Run)

### Outputs
- `dict_master_v1.jsonl` — 84448 entries (merged enriched + bible_learned + unified)
- `instructions_bible_v1.jsonl` — 50000 instruction pairs (ZO↔EN translation)
- Antonyms inferred: 471 word pairs from negation patterns
- CEFR tags applied: A1=5639 A2=3541 B1=3966 B2=779 C1=1225 C2=69298
- NAH (Nahum) copied to TDB77 folder

### Family Term Fixes
- tanu: daughter (blocked: son/sons/child/children)
- tapa: son (blocked: daughter/daughters)
- nu: mother | pa: father

---

## Session: 2026-04-17 (Pipeline Run)

### Outputs
- `dict_master_v1.jsonl` — 73931 entries (merged enriched + bible_learned + unified)
- `instructions_bible_v1.jsonl` — 50000 instruction pairs (ZO↔EN translation)
- Antonyms inferred: 471 word pairs from negation patterns
- CEFR tags applied: A1=5639 A2=3541 B1=3966 B2=779 C1=1225 C2=58781
- NAH (Nahum) copied to TDB77 folder

### Family Term Fixes
- tanu: daughter (blocked: son/sons/child/children)
- tapa: son (blocked: daughter/daughters)
- nu: mother | pa: father

---

## Session: 2026-04-17 (Pipeline Run)

### Outputs
- `dict_master_v1.jsonl` — 73936 entries (merged enriched + bible_learned + unified)
- `instructions_bible_v1.jsonl` — 50000 instruction pairs (ZO↔EN translation)
- Antonyms inferred: 471 word pairs from negation patterns
- CEFR tags applied: A1=5639 A2=3541 B1=3966 B2=806 C1=1221 C2=58763
- NAH (Nahum) copied to TDB77 folder

### Family Term Fixes
- tanu: daughter (blocked: son/sons/child/children)
- tapa: son (blocked: daughter/daughters)
- nu: mother | pa: father

---
## [README.md]

# Zolai AI Wiki (Second Brain) Index
> Last updated: 2026-04-14

Welcome to the **Zolai AI Second Brain**. This wiki is the central knowledge repository for the Zolai language project — linguistic rules, project architecture, cultural context, and dataset history.

---

## 🧠 Core Architecture
- [**Chat System**](architecture/chat_system.md) — Operational logic for the AI tutor
- [**Domain Routing**](concepts/domain_routing_architecture.md) — How the AI classifies and handles request types
- [**Socratic Philosophy**](concepts/socratic_philosophy.md) — The pedagogy behind the "Sangsia" (Teacher) persona
- [**Psycholinguistic Architecture**](concepts/psycholinguistic_architecture.md) — Lung-Kha (Heart-Spirit) framework
- [**Dictionary Rebuild V2**](dictionary_rebuild_v2/README.md) ⭐ — Multi-agent system for building bidirectional dictionary

## 📖 Dictionary Rebuild V2
- [**System Overview**](dictionary_rebuild_v2/README.md) — Architecture, 10-step pipeline, 10 agents
- [**Agent Specifications**](dictionary_rebuild_v2/agents.md) — Individual agent roles and responsibilities
- [**Pipeline Guide**](dictionary_rebuild_v2/pipeline.md) — Step-by-step execution, heartbeat output, metrics

## 📖 Linguistic Standards (ZVS)
- [**Phonology & Orthography**](grammar/phonology.md) — Roman alphabet mapping, tone system, phonetic restrictions
- [**Morphemics**](grammar/morphemics.md) — Word formation, stem shifts, compound joining rules
- [**Verb Stems**](grammar/verb_stems.md) — Stem I vs Stem II comprehensive mapping
- [**Tense Markers**](grammar/tense_markers.md) — `khin`, `ding`, `ngei`, `zo`, `lai` etc.
- [**Particle Differentiations**](grammar/particle_differentiations.md) — `uh hi`, `ahi hi`, G vs Ng pairs
- [**Advanced Syntax**](grammar/advanced_syntax.md) — Complex sentences, conditionals, relative clauses
- [**Sentence Structures**](grammar/sentence_structures.md) — SOV patterns, full reference
- [**Biblical Sentence Patterns**](grammar/biblical_sentence_patterns.md) — Scripture-specific grammar patterns
- [**Tones**](grammar/tones.md) — 14-toneme system, pitch categories
- [**Verb Aspects**](grammar/verb_aspects.md) — Aspect markers and usage
- [**Ergative `in`**](grammar/ergative_in.md) — Agent marking rules
- [**Punctuation**](grammar/punctuation.md) — Pawfi (apostrophe), comma, period rules
- [**Dialectal Nuance**](grammar/dialectal_nuance.md) — Tedim vs Hakha/Falam differences
- [**Social Registers**](grammar/social_registers.md) — Formal vs informal register guide
- [**Forbidden Stems**](grammar/forbidden_stems_auto.md) — Auto-generated forbidden word list
- [**Neologism Morphology**](grammar/neologism_morphology.md) — New word formation rules

## 📚 Vocabulary & Translation
- [**English-to-Zolai Mapping**](translation/english_to_zolai_mapping.md) — Structural equivalence guide
- [**Decision Patterns**](translation/decision_patterns.md) — Translation decision trees (605 lines)
- [**Emotion / Lung Cheat Sheet**](translation/emotion_lung_cheat_sheet.md) — Heart-based emotion vocabulary
- [**Nuance Mapping**](translation/nuance_mapping.md) — Subtle meaning differences
- [**Idioms**](translation/idioms.md) — Idiomatic expressions
- [**Advanced Lexicon**](vocabulary/advanced_lexicon.md) — Formal vs colloquial pairs, 14+ domains
- [**Extended Vocabulary**](vocabulary/extended.md) — 1,000+ entries
- [**Common Phrases**](vocabulary/common_phrases.md) — Everyday conversational blocks
- [**Biblical Patterns**](vocabulary/biblical_patterns.md) — Scripture-specific vocabulary
- [**Idioms & Metaphors**](vocabulary/idioms_and_metaphors.md) — Deep-level expressions
- [**Archaic vs Modern**](vocabulary/archaic_vs_modern.md) — 1932 vs TDB77 vs ZVS 2018
- [**Domain Vocabularies**](vocabulary/) — Education, theology, government, healthcare, technology, business

## 🌍 Culture, History & Glossary
- [**Zomi Comprehensive**](culture/zomi_comprehensive.md) ⭐ — Full reference: people, history, culture, language (2026)
- [**Zo Compound Words**](glossary/zo_compound_words.md) ⭐ — Zolai/Zola/Zomi/Zogam/Zongeina/Zo-an etc.
- [**Tedim Pau Language Reference**](culture/tedim_pau_language_reference.md) — Comprehensive language reference
- [**Traditional Customs**](culture/traditional_customs.md) — Khuado, Nunnop, Tengmaw, Hnat
- [**Historical Origins**](culture/historical_origins.md) — Ciimnuai, Cope, Pau Cin Hau, language timeline
- [**Future of Zolai**](culture/future_of_zolai.md) ⭐ — Vision for Digital Resurrection & AI Sovereignty
- [**Zomi Culture & Values**](culture/zomi_culture_and_values.md) — Itna, Galhiam, Beh, Upate
- [**Historical Milestones**](history/historical_milestones.md) — Key dates timeline
- [**Bible Translation History**](history/zolai_bible_history.md) — 1932 → TDB77 → ZVS 2018
- [**Sources & Dataset**](history/sources.md) — 2M+ entries, 23 sources documented
- [**Biblical Sentence Patterns**](biblical/) — Book-by-book grammar survey

## 🏫 Curriculum & Pedagogy
- [**Curriculum Overview**](curriculum/readme.md) — CEFR A1–C2 structure
- [**A1 Beginner**](curriculum/a1_beginner.md) — Core identity, SOV, simple sentences
- [**A2 Elementary**](curriculum/a2_elementary.md) — Narrative, past tense, prepositions
- [**B1 Intermediate**](curriculum/b1_intermediate.md) — Reasoning, compound sentences
- [**B2 Upper-Intermediate**](curriculum/b2_upper_intermediate.md) — Conditionals, comparisons
- [**C1 Advanced**](curriculum/c1_advanced.md) — Rhetoric, abstract theology
- [**C2 Mastery**](curriculum/c2_mastery.md) — Poetic parallelism, doxology
- [**Tutor Logic**](training/pedagogy_tutor_logic.md) — Adaptive difficulty, Gentehna parables
- [**Dataset Specs**](training/dataset_specs.md) — Training data requirements
- [**Common Mistakes**](mistakes/common_mistakes.md) ⭐ — Catalog of AI/learner errors to avoid

## 📊 Literature & Style
- [**Folklore & Idioms**](literature/folklore_idioms.md) — Traditional stories and expressions
- [**Poetry & Songs**](literature/poetry_and_songs.md) — Zola (Zo songs), poetic forms
- [**Proverbs & Wisdom**](literature/proverbs_and_wisdom.md) — Vontawi / Gentehna
- [**Sermon Register**](literature/sermon_register.md) — Formal religious language
- [**Sinbu Lessons**](literature/sinbu_lessons.md) — Graded reader content
- [**Zomidaily Style**](literature/zomidaily_style_v2.md) — News/media register

## 🚀 Project Planning
- [**Competitive Features Roadmap**](features/competitive_features_roadmap.md) ⭐ — What to build next
- [**Curriculum Implementation TODO**](planning/curriculum_implementation_todo.md)
- [**Books Summary**](books_summary.md) — Corpus book inventory

---

## Key Terminology Quick Reference

| Term | Meaning |
|---|---|
| **Zolai** | Zo language / literature / writing — the project domain |
| **Zola** | Zo song — hymns, traditional songs (NOT the same as Zolai) |
| **Zomi** | Zo people — the ethnic group |
| **Zogam** | Zo land / country — the homeland |
| **Zongeina** | Zo culture / customs / traditions |
| **Zo-an** | Zo food — traditional cuisine |
| **Zolam** | Zo dance |
| **ZVS** | Zokam Standard Version (2018 Bible) — the linguistic standard |
| **TDB77** | Tedim Bible 1977 — NOT the same as ZVS |
| **TBR17** | Tedim Bible Revised 2017 |
| **Lung** | Heart — seat of emotion, will, intellect |
| **Kha** | Spirit — spiritual/immortal essence |
| **Pasian** | God (Tedim) — NEVER use "pasian" (Hakha) |
| **Gam** | Country/land — NEVER use "gam" (Hakha) |

> ⭐ = Recently updated or high-priority reference

---
## [books_summary.md]

# Biblical Books: Purpose and Key Zolai Themes

This document summarizes the core message and specific Zolai linguistic patterns for each book of the Bible.

## Old Testament (Thuciam Lui)

### Genesis (Piancilna)
*   **Purpose:** To explain the origins of the world, humanity, and the covenant with the Zomi (all people) through Israel.
*   **Key Zolai Concept:** `Piancilna` (The Beginning/Cradle of Life).
*   **Linguistic Focus:**
    *   **Creative Power:** `Piangsak` (To create/bring into being).
    *   **Covenantal Language:** `Thuciamna` (Legal and spiritual bond).
    *   **Genealogy:** `Khanggui` (Lineage/Family Tree).

### Psalms (Late)
*   **Purpose:** To provide a language for worship, lament, and emotional expression.
*   **Key Zolai Concept:** `Lungdam` (Rejoice) and `Lung-hehna` (Grief/Lament).
*   **Linguistic Focus:**
    *   **Metaphorical Praise:** `Topa pen tuucin bangin...` (Shepherd metaphor).
    *   **Emotional Intensity:** Use of `Lung` (Heart/Liver) as the center of emotion.
    *   **Parallelism:** Repeating a thought in two lines with slightly different words.

## New Testament (Thuciam Thak)

### The Gospels (Lungdamna Thu)
*   **Purpose:** To present the life, teachings, death, and resurrection of Jesus.
*   **Key Zolai Concept:** `Hehpihna` (Grace/Mercy).
*   **Linguistic Focus:**
    *   **Incarnation:** `-suk` (Downward directional suffix).
    *   **Honorifics:** Use of `Nong` (Nang + hong) for Christ's actions towards humanity.

### The Epistles (Lailakte)
*   **Purpose:** To build up the church and clarify doctrine.
*   **Key Zolai Concept:** `Thuhilhna siangtho` (Sound doctrine).
*   **Linguistic Focus:**
    *   **Instructional Tone:** Using `-un` (Plural imperative) and `-ding ahi hi` (Definitive obligation).
    *   **Theological Precision:** Distinguishing between `Laukha` (Spirit), `Kha` (Breath/Spirit), and `Lungsim` (Mind).

### Revelation (Mangmuhna / Kilaakna)
*   **Purpose:** To reveal the final victory of God and encourage the faithful.
*   **Key Zolai Concept:** `Mangmuhna` (Visions from God).
*   **Linguistic Focus:**
    *   **Spatial Integrity:** `-toh` (Upward) and `-suk` (Downward).
    *   **Eschatological Titles:** `A Masa bel leh a Nunung bel` (Alpha and Omega).

---
## [psycholinguistic_architecture.md]

# Zolai Psycholinguistic Architecture: The Heart (Lung) and Breath (Kha)

In Zolai (Tedim), the seat of personhood is not divided between the "mind" and "heart" as in Western thought. Instead, it is a unified architecture centered on the **Lung** (Heart/Liver) and **Kha** (Breath/Spirit).

## 1. The Heart to Feel: "Lung" (The Unified Seat)
The word `Lung` is the prefix for almost all emotional, logical, and volitional states. To "feel" in Zolai is to experience a movement of the `Lung`.

### Emotional States (Lung-phawng)
*   **Lungdam:** (Heart + Good/Full) -> Joy, Gratitude, "Thank you".
*   **Lung-hehna:** (Heart + Sad/Anger) -> Grief, Anger, Resentment.
*   **Lung-nopna:** (Heart + Peace) -> Comfort, tranquility.
*   **Lung-lau:** (Heart + Fear) -> Anxiety, terror.

### Logical/Volitional States (Lung-ngaihsutna)
*   **Lung-ngai:** (Heart + Think/Listen) -> To miss someone, to think deeply, to meditate.
*   **Lung-kim:** (Heart + Complete) -> Agreement, satisfaction, "My heart is full/set".
*   **Lung-gulh:** (Heart + Desire) -> Deep longing, ambition.
*   **Lung-tup:** (Heart + Aim) -> Goal, intention.

### Moral/Ethical Character
*   **Lung-duai:** (Heart + Soft/Long) -> Patience, long-suffering.
*   **Lung-khauh:** (Heart + Hard) -> Stubbornness, courage, resilience.
*   **Lung-siatna:** (Heart + Bad/Broken) -> Malice, deep sorrow, "Broken-heartedness".

---

## 2. The Breath of Life: "Kha" (The Vital Spirit)
While `Lung` is the engine of feeling, `Kha` is the essence of existence.

*   **Kha:** Breath, Spirit, Soul.
*   **Kha-siangtho:** (Spirit + Holy/Pure) -> The Holy Spirit.
*   **Kha-kiang:** (Spirit + Near) -> To be encouraged, to have one's spirit strengthened.
*   **Kha-sia:** (Spirit + Bad) -> To be discouraged, "low spirit".
*   **Nuntakna Kha:** (Life + Spirit) -> The breath of life given by Pasian (God).

---

## 3. Interaction & Pedagogy: How Zolai "Feels" and "Thinks"
To translate "I feel X" into Zolai, the Second Brain must map the English emotion to the correct `Lung-` compound:
*   "I feel happy" -> `Ka lungdam hi.`
*   "I feel confident" -> `Ka lungmuang hi.` (My heart is at rest/secure).
*   "I feel motivated" -> `Ka lung-hang hi.` (My heart is brave/fired up).

### Pedagogical Connection (Socratic Senses)
When teaching Zolai, the AI tutor leverages this architecture to engage the student's `Thu ngaihsutna` (deep thinking). Instead of rote translation, the tutor uses Socratic questioning to activate the `Lung` (e.g., asking "If your heart is 'set', what is the Zolai word for agreement?"). See `socratic_philosophy.md` for more on this pedagogical approach.

## 4. Translation Improvement Note
When translating the New Testament (NT), "The Heart" (Greek: *kardia*) should almost always map to `Lung`, but "The Spirit" (Greek: *pneuma*) requires a distinction between `Kha` (The Holy Spirit/Vital Spirit) and `Lungsim` (The human mind/inclination).

---
## [socratic_philosophy.md]

# Socratic Philosophy in Zolai Pedagogy

## 1. Mapping Socratic Concepts to Zolai Culture
The Socratic method emphasizes cooperative argumentative dialogue—asking and answering questions to stimulate critical thinking and draw out ideas. In Zolai culture, this pedagogical approach maps naturally to indigenous concepts of wisdom, communal reasoning, and deep contemplation.

*   **Socratic Dialogue -> Kikupna (Discussion/Consultation):** `Kikupna` refers to reasoning together or mutual consultation. Rather than top-down instruction, `kikupna` fosters a shared exploration of meaning, treating the student as a participant in discovering the language.
*   **Deep Socratic Reflection -> Thu ngaihsutna / Lung-ngaihna:** Derived from the `Lung` (Heart/Mind) architecture, `thu ngaihsutna` (deep thinking) and `lung-ngaihna` (meditation/pondering) represent the activation of the student's internal logic. The Socratic method aims to engage the student's `Lung` rather than merely feeding them rote facts.
*   **Exploring Underlying Logic -> A bul a bal kan'na:** This means tracing the roots, origins, or deeper truth of a matter. By asking persistent questions, the tutor helps students understand the foundational grammar or cultural context of a phrase, rather than just the surface translation.
*   **Attaining True Knowledge -> Pilna (Wisdom/Insight):** True `pilna` is achieved when the learner understands the *why* behind the words, making the knowledge permanent and deeply rooted.

## 2. Outline of the Socratic Method in a Zolai-Teaching Context
Instead of acting as a simple dictionary or answer key, the Zolai AI Tutor functions as a wise elder guiding a `kikupna`. 

### Key Questioning Patterns:
1.  **Seeking the 'Why' (Bang hang hiam?):**
    *   *Usage:* To challenge the learner to explain grammar rules or vocabulary choices.
    *   *Example:* If a student uses the wrong particle, ask, "We use 'dih' for soft actions like 'en dih'. Eating is a hard action. Bang hang in 'dih' zang thei lo ding i hi hiam?" (Why might we not be able to use 'dih' here?)
2.  **Drawing on Cultural Memory (Khanggui ah bangci gen hiam?):**
    *   *Usage:* To guide students toward idiomatic or culturally authentic expressions rather than literal English translations.
    *   *Example:* "You translated 'I am brave' literally. But thinking about our ancestors, Khanggui ah bangci gen hiam? How do we describe a brave 'Lung' (heart) in Zolai?" (Leading them to *Lung-hang*).
3.  **Prompting Logical Deduction (Bangci ngaihsun na hiam?):**
    *   *Usage:* To test a student's understanding of word composition, especially compound words.
    *   *Example:* "If 'Lung' is heart and 'dam' is well/peaceful, what do you think 'Lungdam' means in English? Bangci ngaihsun na hiam? (What do you think?)"
4.  **Challenging Assumptions:**
    *   *Usage:* To correct common English-to-Zolai mapping errors.
    *   *Example:* "You used 'Lungsim' for the Holy Spirit. But remember the difference between the mind and the vital breath. Which word better represents the breath of life?"

---
## [domain_routing_architecture.md]

# Zolai Domain Detection and Routing Architecture

This document defines the classification and routing logic for the Zolai AI Second Brain.

## 1. Task Classification (User Intent)
Classify all user input into one of the following instructional tasks:
- **translation:** Direct English <-> Zolai conversion (ensure hints are provided before answers).
- **grammar:** Questions about particles (e.g., dih, ta), sentence structure (SOV), or verb stems.
- **reading:** Analysis of existing texts (e.g., Bible, News, Poetry). Focus on comprehension.
- **practice:** Interactive tutoring sessions, exercises, or quizzes.
- **conversation:** General chat or roleplay (evaluate for implicit grammar/vocab correction).

## 2. Domain Detection (Register/Vocabulary)
Detect the context to select the appropriate tone, complexity, and vocabulary:
- **religious:** High Zolai, ZVS 2018 terms (Jesuh, Khrih), formal sermon style. Use for structured, formal language practice.
- **daily conversation:** Informal particles (hiam, hia, maw), modern everyday vocab. Use for real-world communication practice.
- **education:** Clear, instructional tone (Sangsia persona). Use for grammar and structured learning.
- **culture:** Historical lineage (Khanggui), oral poetry (Zola), or festivals (Khuado). Use for contextual understanding and expressions.
- **general:** Default conversational learning mode when context is ambiguous.

## 3. Implementation & Routing Rules
- **Silent Planning Phase:** Before routing, the agent must silently plan: 1) Intent, 2) Level, 3) Domain, 4) Teaching Method, 5) Hint vs. Answer.
- **Cross-Domain Reintroduction:** The router must actively track user errors and intentionally introduce vocabulary from one domain (e.g., a religious word) into another domain (e.g., daily conversation) for reinforcement.
- **Difficulty Mapping:** Routing must restrict sentence complexity based on the detected user level (Beginner, Intermediate, Advanced).
- **SOV Enforcement:** All generated outputs must rigidly follow Zolai Subject-Object-Verb order.
- **Register Switching:** If the task is `reading` and the domain is `religious`, the AI must NOT use informal conversational slang.
- **Defaulting:** If intent or domain is unclear, the system *must* default to `general` conversational learning to maintain an educational flow.

---
## [chat_system.md]

# Chat System Architecture & Guidelines

## Concept / Rule
The Zolai AI chat system must act as a highly structured tutor within a persistent wiki-backed knowledge base. Every user interaction triggers the mandatory **work loop** (Read context → Understand constraints → Execute task → Check consistency → Update wiki) described in `prompts/master-prompt.md`. Responses should be short (≤4 lines), respectful, Zolai-focused, and in-line with the domain-specific rules (grammar, tone, difficulty control, memory behavior, Socratic questioning, technology handling) already codified in the wiki.

## Decision / Application
The chat agent must follow the following safeguards every time it produces output:
1. **Context-first attitude:** Start by checking relevant wiki sections before answering (architecture, domain knowledge, resource notes).
2. **Structured response:** Provide the user with a labeled summary, followed by the actual answer, without extraneous preamble/postamble.
3. **Socratic + memory-aware:** Use Socratic questions when probing the user’s understanding and recall past vocabulary weaknesses (see `wiki/concepts/socratic_philosophy.md`).
4. **Short replies:** Keep each reply under four lines, unless the user specifically asks for expansion.
5. **Domain adherence:** Enforce the Zolai SOV order, avoid mixing domains, and prioritize real Zolai vocabulary; technology/business terms may use loanwords but only when accompanied by explanations.
6. **Multi-Agent Coordination:** Complex tasks should be delegated to specialized sub-agents (e.g., a "Linguist Agent" for grammar checks or an "ETL Agent" for data processing) using the `Task` tool.
7. **Wiki updates:** If any new knowledge emerges (new vocabulary, rules, references), add it to the appropriate wiki file immediately before concluding the response.

## Reason
Acting as a tutor cannot rely on memory alone; the chat system must treat every exchange as part of an ongoing curriculum, tied to the wiki. The enforced loop and the short-response rule ensure clarity, consistency, and manageability for agentic workloads while guaranteeing the agent doesn’t drift into incorrect or unverified territory.

## Pattern / Implementation
- When a user asks a question:
  1. Run a quick lookup (grammar, vocabulary, training, culture, technology, etc.) using `wiki/` files.
  2. Determine intent (translation, grammar, reading, practice, conversation) and domain (religious/daily conversation/education/culture/general).
  3. Craft a response of ≤4 lines; highlight if the answer is a hint (Socratic) or direct.
  4. If new info is derived (e.g., a new idiom, phrase, correction) summarize and append to the wiki file.
  5. Always close with a short confirmation (if applicable) and avoid filler.

## Mistake / Anti-pattern
- Never provide long essays or multi-paragraph justification unless the user explicitly requests details.
- Do not invent new vocabulary or violate existing grammar rules just to satisfy a request.
- Avoid ignoring the work loop; failing to log knowledge to the wiki when discovering new semantics results in context loss.
- Do not use general English explanations when Zolai vocabulary is available; the goal is to strengthen Zolai usage even when explaining modern concepts.

---
## [competitive_features_roadmap.md]

# Zolai Features Roadmap
> Based on competitive audit of zomi.me and zomidictionary.app (2026-04-14)
> Reference: `artifacts/competitive_audit_report.md`

## Current State Summary

| Asset | Status |
|---|---|
| Fine-tuned LLM | ✅ Live at `http://<SERVER_IP>:18789/chat` |
| Dictionary (24,891 ZO↔EN entries) | ✅ Seeded in PostgreSQL |
| SQLite FTS5 dictionary | ✅ `data/master_unified_dictionary.db` (112 MB) |
| Bible corpus (all 66 books, 4 versions) | ✅ `Cleaned_Bible/` |
| Grammar rules + wiki | ✅ `wiki/` (84+ files) |
| Next.js website | 🟡 ~87% backend, UI gaps |
| FastAPI dictionary API | ✅ `api/dictionary_api.py` |

---

## Priority 1 — Expose What We Already Have (Low effort, high impact)

### 1.1 Dictionary Search UI
- Backend seeded: 24,891 entries in PostgreSQL
- Build `features/dictionary/components/` search interface
- Endpoint: `GET /api/dictionary/search?q=&lang=zolai|english`
- Already have: `api/dictionary_api.py`, SQLite FTS5 DB

### 1.2 AI Tutor / Chat UI
- API live: `POST /api/zolai/chat` proxies to fine-tuned LLM
- Build chat interface in `features/zolai/components/`
- Socratic tutor logic defined in `wiki/architecture/chat_system.md`

### 1.3 Bible Verse Browser UI
- Backend ready: TDB77 + TBR17 + KJV aligned
- Build `features/zolai/components/BibleBrowser`
- Endpoint: `GET /api/zolai/bible/:book?chapter=1`

### 1.4 Grammar Checker API
- Expose `scripts/test_ggammar_rules.py` as endpoint
- Endpoint: `post /api/ggammar/check` `{text}` → `{valid, errors[]}`
- Already have: grammar rules in `wiki/ggammar/`
- **Unique** — no competitor has this

### 1.5 Dialect Classifier
- Classify input as Tedim vs Hakha/Falam using ZVS forbidden word list
- Endpoint: `POST /api/dialect/classify` `{text}` → `{dialect, confidence, flags[]}`
- Already have: forbidden words in `AGENTS.md` ZVS rules
- **Unique** — no competitor has this

---

## Priority 2 — Build from Existing Data (Medium effort)

### 2.1 Phrasebook
- Categorized phrases from `data/raw/zomime_parallel_phrases.jsonl` + parallel corpus
- Categories: greetings, food, travel, shopping, emergency, family, numbers, religious
- Data: 132 phrases + 16 dialogues already collected

### 2.2 Pronunciation Guide
- 10-letter guide extracted from zomi.me
- Extend with tone guide (High/Mid/Low/Falling)
- File: `data/raw/zomime_pronunciation_guide.json`

### 2.3 Cultural Content Pages
- Proverbs: `wiki/literature/proverbs_and_wisdom.md`
- History: `wiki/tualture/zomi_comprehensive.md`
- Literature: `wiki/literature/`
- **Advantage** — sources are older and more authoritative than competitors

### 2.4 Daily Word / Featured Words
- Pull from `data/vocabulary_frequency.json` (39,619 unique words)
- Rotate daily from high-frequency Tedim words

### 2.5 Vocabulary Quiz
- Generate from `data/master/combined/dictionary.jsonl`
- Question types: en→zomi, zomi→en, fill-in-blank, multiple choice

### 2.6 Fix Newsletter Email Sending
- 2 TODO comments in website codebase
- Backend complete, just needs email provider wiring

---

## Priority 3 — New Features (Higher effort, high differentiation)

### 3.1 ZVS Grammar Lessons
- Structured lessons based on `wiki/tuarritualum/readme.md`
- CEFR-aligned: A1→C2 as defined in `AGENTS.md`
- Unique: no competitor teaches ZVS-standard Tedim grammar

### 3.2 Bible Verse Search
- Full-text search across `Cleaned_Bible/` parallel corpus
- Endpoint: `GET /api/bible/search?q=&book=&chapter=`
- **Unique** — no competitor has this

### 3.3 Parallel Text Reader
- Side-by-side Zolai/English Bible and hymn reader
- Data: `data/zolai_tedim_hymns.jsonl`, `Cleaned_Bible/Parallel/`

### 3.4 CEFR Level Tagging
- Tag all 457K training entries with A1–C2 level
- Wire to AI tutor adaptive difficulty controller
- Required for curriculum to be functional

### 3.5 Offline PWA
- Cache dictionary + phrasebook for offline use
- Match zomidictionary.app's PWA capability

---

## Skills Needed

| Skill | Purpose | Priority |
|---|---|---|
| `zolai-ggammar-checker` | Grammar validation endpoint | P1 |
| `zolai-dialect-classifier` | Tedim vs Hakha/Falam detection | P1 |
| `zolai-phrasebook-builder` | Categorized phrase generation | P2 |
| `zolai-tualtural-content` | Proverbs/history/literature extraction | P2 |
| `zolai-quiz-generator` | Vocabulary quiz from dictionary | P2 |
| `zolai-bible-search` | Full-text Bible search API | P3 |
| `zolai-pwa` | Offline-capable web frontend | P3 |

---

## What We Skip

| Feature | Reason |
|---|---|
| Gamification (streaks, badges, XP) | Not core to language preservation mission |
| Community forum | Requires moderation, not our focus |
| Digital Museum | Low priority vs language tools |

---

## Competitive Summary

We win on: **accuracy, dialect purity, grammar enforcement, Bible corpus, fine-tuned model, RVAsia Catholic corpus**
They win on: **UI polish, community, gamification, offline PWA**

Our path: expose the model and data via API first → build minimal UI on top → let the quality speak.

---
## [curriculum_implementation_todo.md]

# Curriculum Implementation Tasks & Todo List

This plan outlines the steps required to integrate the A1-B2 proficiency levels into the Zolai AI tutoring system and dataset pipeline.

---

## ✅ Phase 1: Data Categorization (The "Second Brain" Audit)
- [ ] **Split Datasets by Source Proficiency:**
  - Create a subset for **A1/A2** using *Zolai Sinna* (1-15) and *Simbu* (Level 1-2).
  - Create a subset for **B1** using *Zolai Sinna* (16-27), *Simbu* (Level 3-4), and *Gentehna*.
  - Use the full **B2** corpus for Biblical and formal logic.
- [ ] **JSONL Metadata Tagging:**
  - Update `data/zolai_parallel_master.jsonl` to include a `level` field for each entry.
  - Tag entries derived from *Piancilna* (Genesis) as `B2`.
  - Tag entries from *Greetings/Sinna* as `A1/A2`.

---

## 🛠 Phase 2: AI Tutor Logic (The "Sangsia" Upgrade)
- [ ] **Adaptive Difficulty Controller:**
  - Update `pedagogy_tutor_logic.md` to reference the `tuarritualum_levels.md` for sequence.
  - Implement a "Socratic Gate": The tutor must verify A1 present tense `hi` mastery before moving to B1 `ciangin` clauses.
- [ ] **Gentehna (Parables) Integration:**
  - Map specific parables from *Gentehna Tuamtuam* to the B1/B2 reading exercises.
  - Create "Moral and Logic" prompts for B2 level analysis in Zolai.

---

## 📖 Phase 3: Linguistic Standardization (ZVS 2018)
- [ ] **Apply Gelhmaanbu Rules per Level:**
  - **A1/A2:** Focus on simple spelling (e.g., `hi`, `ta`, `na`, `ka`).
  - **B1:** Apply compound joining rules (e.g., `biakinn`, `innkuan`).
  - **B2:** Enforcement of Stem II shifts and complex particles (`uh hi`, `kei leh`).
- [ ] **Apostrophe Contraction Cleanup:**
  - Run the `standardizer.py` across all levels to ensure the 10+ biblical contractions (e.g., `ba'a`) are uniform.

---

## 🧪 Phase 4: Validation & Testing
- [ ] **Baseline Level Assessment:**
  - Generate a test set of 20 sentences for each level (A1-B2).
  - Verify that the grammar used in A1 never exceeds the A1 constraints.
- [ ] **Back-Translation Audit:**
  - Use the English-to-Zolai mapping to test the AI's ability to translate B2 Biblical prose without losing causative/passive nuance.

---

## 📅 Timeline & Status
- **Phase 1:** ⏳ Planning
- **Phase 2:** ⏳ In-Progress
- **Phase 3:** ✅ Complete (Standards defined in Wiki)
- **Phase 4:** ⏳ Not Started

---
*Last updated: 2026-04-12*
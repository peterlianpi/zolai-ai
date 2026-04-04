# Zolai AI Pipeline - Roadmap & Tracker

## 🎯 Goal
Build a highly accurate, linguistically sound AI pipeline, instruction set, and standardized vocabulary mapping for the Zolai (Tedim Chin) language.

## 🟢 Completed
- **Grammar Foundations**: Established strict rules for Ergative-Absolutive alignment (e.g., *in* marker for subjects of transitive verbs).
- **Syntax Correction**: Eradicated literal SOV hallucinations, enforcing Zolai's natural OSV sentence structure (e.g., *Laibu ka sim hi*, not *Ka laibu sim hi*).
- **Verb Stems**: Documented Verb Stem Alternation (Stem I vs Stem II) usage in indicative vs. dependent/negative clauses.
- **Standards Integration**: Incorporated orthography standards from recognized bodies like ZCLS and ZOLLS.
- **Resource Mining**: Analyzed official Zolai elementary readers (Tan Lang, Tan Khat) and Tongdot dictionary outputs.
- **Core Vocabulary Generation**: Built `resources/zolai_everyday_vocabulary.md` covering Family, Body Parts, Animals, Nature, Food, Colors, House/Objects, Common Verbs, UI & Technology Commands, Time Words, and Pronouns (including ergative mappings).
- **AI Instructions**: Overhauled `zolai_ai_instructions.md` and `zolai_grammar_cheat_sheet.md` with explicit Zolai linguistics guidelines.
- **System Prompt Compilation**: Created `resources/zolai_system_prompt.txt`, a consolidated system prompt/context block that synthesizes grammar rules, formatting instructions, and everyday vocabulary mappings.
- **Dataset Testing**: Ran tests on `tech_seed_data.jsonl`, revealing 75 SOV translation hallucinations and zero explicit ergative markers, proving the necessity of the newly defined instructions.
- **Data Quality Pipeline Prep**: Created `resources/data_quality_recommendations.md` defining Back-Translation, Human-in-the-Loop, and Deduplication standards.
- **Deduplication**: Built and ran `scripts/deduplicate_dataset.py` on the seed data.
- **Seed Data Fix Pipeline**: Wrote `scripts/fix_seed_data_pipeline.py` to generate LLM back-translation & correction prompts for the broken `tech_seed_data.jsonl`.

## 🟡 In Progress
- **Human-in-the-Loop Validation**: Review a random sample of the LLM-corrected texts against the Back-Translation constraints.

## 🔴 To Do (Next Steps)
- **Run the Correction Pipeline**: Execute `python scripts/run_llm_correction.py --provider [openai/gemini]` using your own API keys.
- **Evaluation Loop**: Execute `python scripts/score_similarity.py` to automatically score the generated Back-Translations for semantic accuracy against the original intent.
- **Run Human Review**: Execute `python scripts/human_review_ui.py` to sample and manually verify the LLM's corrections.
- **Advanced Grammar Edge Cases**: Document complex Zolai constructions such as causative verbs (adding `-sak`), reflexive verbs (adding `ki-`), and complex relative clauses.
- **Scale Dictionary**: Integrate the verified common vocabulary list back into the core Zolai dictionary JSON mapping for downstream model training.

## 🟣 Future Vision: Autonomous Agentic System
- **Memory Implementation**: Implement a Vector DB (Chroma/FAISS) to store human-verified translations to act as "Long-Term Memory" for dynamic few-shot prompting.
- **Multi-Agent Reflection Loop**: Convert the static python pipeline into a LangGraph or AutoGen loop where a "Translator Agent" and a "Critic Agent" debate and self-correct (Back-translation + similarity scoring) before outputting the final JSON.
- **Self-Learning Capabilities**: Build logic that saves corrections from the Human-in-the-Loop review directly back into the Agent's semantic memory so it never makes the same mistake twice.
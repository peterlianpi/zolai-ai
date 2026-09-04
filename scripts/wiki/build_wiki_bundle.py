#!/usr/bin/env python3
"""
Bundle wiki into <10 merged files for NotebookLM upload.
Groups by topic, each file <500KB.
"""
import os
from pathlib import Path

OUT_DIR = Path("wiki/bundle")
OUT_DIR.mkdir(exist_ok=True)

BUNDLES = {
    "01_language_guide.md": [
        "wiki/zolai_ai_instructions.md",
        "wiki/zolai_grammar_cheat_sheet.md",
        "wiki/Zolai_Standard_Format.md",
        "wiki/zolai_system_prompt.txt",
    ],
    "02_grammar_complete.md": [
        "wiki/grammar/complete_grammar_reference_corpus.md",
        "wiki/grammar/core_grammar_reference.md",
        "wiki/grammar/sentence_structures.md",
        "wiki/grammar/pronouns_complete.md",
        "wiki/grammar/verbs_corpus.md",
        "wiki/grammar/tense_markers_corpus.md",
        "wiki/grammar/tense_markers.md",
        "wiki/grammar/verb_stems.md",
        "wiki/grammar/particles_corpus.md",
        "wiki/grammar/particles_postpositions_corpus.md",
        "wiki/grammar/directional_particles_corpus.md",
        "wiki/grammar/adjectives_corpus.md",
        "wiki/grammar/numbers_corpus.md",
        "wiki/grammar/body_parts_corpus.md",
        "wiki/grammar/time_expressions_corpus.md",
        "wiki/grammar/questions_corpus.md",
        "wiki/grammar/questions_and_answers.md",
        "wiki/grammar/advanced_syntax.md",
        "wiki/grammar/advanced_patterns_corpus.md",
        "wiki/grammar/agreement_markers_corpus.md",
        "wiki/grammar/subordinate_clauses_corpus.md",
        "wiki/grammar/social_registers.md",
        "wiki/grammar/phonology.md",
        "wiki/grammar/morphemics.md",
        "wiki/grammar/ergative_in.md",
        "wiki/grammar/punctuation.md",
        "wiki/grammar/tones.md",
        "wiki/grammar/verb_aspects.md",
        "wiki/grammar/neologism_morphology.md",
        "wiki/grammar/dialectal_nuance.md",
        "wiki/grammar/grammar_a1_to_c2.md",
        "wiki/grammar/prepositions_corpus.md",
    ],
    "03_negation_particles.md": [
        "wiki/negation/negation_guide.md",
        "wiki/grammar/negation_corpus.md",
        "wiki/particles/particle_index.md",
        "wiki/grammar/particle_differentiations.md",
        "wiki/grammar/biblical_sentence_patterns.md",
        "wiki/grammar/bible_versions_comparison.md",
        "wiki/grammar/education_register_patterns.md",
        "wiki/grammar/news_register_patterns.md",
        "wiki/grammar/writing_rules_and_homographs.md",
        "wiki/grammar/zolai_standard_format_rules.md",
        "wiki/grammar/forbidden_stems_auto.md",
        "wiki/grammar/advanced_syntax_extracted.md",
        "wiki/register/register_guide.md",
        "wiki/pronouns/pronoun_guide.md",
        "wiki/grammar/pronoun_vocabulary_reference.md",
        "wiki/numbers/number_system.md",
    ],
    "04_vocabulary.md": [
        "wiki/vocabulary/zolai_basics.md",
        "wiki/vocabulary/common_phrases.md",
        "wiki/vocabulary/common-words.md",
        "wiki/vocabulary/extended.md",
        "wiki/vocabulary/advanced_lexicon.md",
        "wiki/vocabulary/expressive_words.md",
        "wiki/vocabulary/idioms_and_metaphors.md",
        "wiki/vocabulary/archaic_vs_modern.md",
        "wiki/vocabulary/education_domain_vocab.md",
        "wiki/vocabulary/education_and_academics.md",
        "wiki/vocabulary/modern_technology.md",
        "wiki/vocabulary/healthcare_and_medicine.md",
        "wiki/vocabulary/government_and_law.md",
        "wiki/vocabulary/business_and_marketing.md",
        "wiki/vocabulary/general_knowledge.md",
        "wiki/vocabulary/theology.md",
        "wiki/vocabulary/everyday_nature_anatomy.md",
        "wiki/vocabulary/extended_everyday_words.md",
        "wiki/vocabulary/fables_and_wisdom_vocab.md",
        "wiki/vocabulary/news_domain_vocab.md",
        "wiki/vocabulary/word_of_the_day.md",
        "wiki/vocabulary/dialectal_nuance.md",
        "wiki/vocabulary/biblical_patterns.md",
        "wiki/vocabulary/ai_extraction_corrections.md",
        "wiki/vocab_recommendations.md",
        "wiki/glossary/zo_compound_words.md",
    ],
    "05_translation_mistakes.md": [
        "wiki/translation/decision_patterns.md",
        "wiki/translation/english_to_zolai_mapping.md",
        "wiki/translation/emotion_lung_cheat_sheet.md",
        "wiki/translation/nuance_mapping.md",
        "wiki/translation/idioms.md",
        "wiki/mistakes/common_mistakes.md",
        "wiki/grammar/comparative_book_patterns.md",
    ],
    "06_culture_history.md": [
        "wiki/culture/zomi_comprehensive.md",
        "wiki/culture/traditional_customs.md",
        "wiki/culture/historical_origins.md",
        "wiki/culture/future_of_zolai.md",
        "wiki/culture/khuado.md",
        "wiki/history/zolai_bible_history.md",
        "wiki/history/historical_milestones.md",
        "wiki/history/sources.md",
        "wiki/history/zolai_history_snippets.md",
        "wiki/linguistics/tedim_pau_language_reference.md",
        "wiki/linguistics/zolai_sinna_2010_knowledge.md",
        "wiki/biblical/comparative_orthography.md",
        "wiki/biblical/comparative_book_patterns.md",
    ],
    "07_curriculum_learning.md": [
        "wiki/curriculum/readme.md",
        "wiki/curriculum/content_a1_a2.md",
        "wiki/curriculum/content_b1_b2.md",
        "wiki/curriculum/content_c1_c2.md",
        "wiki/curriculum/a1_beginner.md",
        "wiki/curriculum/a2_elementary.md",
        "wiki/curriculum/b1_intermediate.md",
        "wiki/curriculum/b2_upper_intermediate.md",
        "wiki/curriculum/c1_advanced.md",
        "wiki/curriculum/c2_mastery.md",
        "wiki/training/curriculum_levels.md",
        "wiki/training/pedagogy_tutor_logic.md",
        "wiki/training/dataset_specs.md",
        "wiki/training/llm_training_roadmap.md",
        "wiki/training/ai_second_brain.md",
    ],
    "08_literature_phrases.md": [
        "wiki/literature/folklore_idioms.md",
        "wiki/literature/proverbs_and_wisdom.md",
        "wiki/literature/poetry_and_songs.md",
        "wiki/literature/sinbu_lessons.md",
        "wiki/literature/zomidaily_style.md",
        "wiki/literature/zomidaily_style_v2.md",
        "wiki/literature/sermon_register.md",
        "wiki/vocabulary/khanggui_phrases_part1.md",
        "wiki/vocabulary/khanggui_phrases_part2.md",
        "wiki/vocabulary/khanggui_phrases_part3.md",
        "wiki/vocabulary/gentehna_phrases_part1.md",
        "wiki/vocabulary/gentehna_phrases_part2.md",
        "wiki/vocabulary/gentehna_phrases_part3.md",
        "wiki/vocabulary/standard_format_phrases_part3.md",
        "wiki/vocabulary/standard_format_phrases_part4.md",
        "wiki/vocabulary/standard_format_phrases_part5.md",
    ],
    "09_memory_project.md": [
        "wiki/memory/long_term.md",
        "wiki/memory/short_term.md",
        "wiki/README.md",
        "wiki/books_summary.md",
        "wiki/concepts/psycholinguistic_architecture.md",
        "wiki/concepts/socratic_philosophy.md",
        "wiki/concepts/domain_routing_architecture.md",
        "wiki/architecture/chat_system.md",
        "wiki/features/competitive_features_roadmap.md",
        "wiki/planning/curriculum_implementation_todo.md",
    ],
}

def main():
    os.chdir(Path(__file__).parent.parent)
    total_files = 0

    for bundle_name, sources in BUNDLES.items():
        out = OUT_DIR / bundle_name
        parts = []
        for src in sources:
            p = Path(src)
            if p.exists():
                content = p.read_text(encoding="utf-8").strip()
                parts.append(f"\n\n---\n## [{p.name}]\n\n{content}")
                total_files += 1

        merged = f"# Zolai AI — {bundle_name}\n" + "".join(parts)
        out.write_text(merged, encoding="utf-8")
        size_kb = out.stat().st_size // 1024
        print(f"  {bundle_name}: {len(sources)} files → {size_kb} KB")

    print(f"\nTotal: {len(BUNDLES)} bundle files in wiki/bundle/")
    print(f"Files merged: {total_files}")
    print(f"Upload these {len(BUNDLES)} files to NotebookLM")

if __name__ == "__main__":
    main()

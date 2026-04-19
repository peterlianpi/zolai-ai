#!/usr/bin/env python3
"""
Build a single consolidated Zolai reference file for Gemini NotebookLM.
Merges: language guide, grammar, negation, vocabulary, translation patterns,
ZVS rules, common phrases, culture, and dictionary samples.
Target: ~200KB, under NotebookLM's context limit.
"""
import os
from pathlib import Path

OUT = "wiki/zolai_notebooklm_complete.md"

# Files to include in priority order, with max lines each
SOURCES = [
    # Core language guide
    ("wiki/zolai_ai_instructions.md",                    None),   # full
    ("wiki/Zolai_Standard_Format.md",                    300),
    ("wiki/zolai_grammar_cheat_sheet.md",                None),   # full
    # Grammar corpus-verified
    ("wiki/grammar/complete_grammar_reference_corpus.md",None),
    ("wiki/grammar/negation_corpus.md",                  None),
    ("wiki/negation/negation_guide.md",                  None),
    ("wiki/grammar/pronouns_complete.md",                200),
    ("wiki/grammar/verbs_corpus.md",                     200),
    ("wiki/grammar/tense_markers_corpus.md",             None),
    ("wiki/grammar/particles_corpus.md",                 150),
    ("wiki/grammar/questions_corpus.md",                 None),
    ("wiki/grammar/directional_particles_corpus.md",     150),
    ("wiki/grammar/adjectives_corpus.md",                150),
    ("wiki/grammar/numbers_corpus.md",                   None),
    ("wiki/grammar/body_parts_corpus.md",                150),
    ("wiki/grammar/time_expressions_corpus.md",          None),
    ("wiki/grammar/sentence_structures.md",              200),
    ("wiki/grammar/core_grammar_reference.md",           200),
    ("wiki/grammar/verb_stems.md",                       None),
    ("wiki/grammar/social_registers.md",                 None),
    ("wiki/grammar/advanced_syntax.md",                  150),
    ("wiki/grammar/phonology.md",                        None),
    ("wiki/grammar/morphemics.md",                       150),
    # Translation
    ("wiki/translation/decision_patterns.md",            200),
    ("wiki/translation/english_to_zolai_mapping.md",     None),
    ("wiki/translation/emotion_lung_cheat_sheet.md",     200),
    ("wiki/translation/nuance_mapping.md",               None),
    # Vocabulary
    ("wiki/vocabulary/common_phrases.md",                None),
    ("wiki/vocabulary/zolai_basics.md",                  None),
    ("wiki/vocabulary/advanced_lexicon.md",              200),
    ("wiki/vocabulary/education_domain_vocab.md",        150),
    ("wiki/vocabulary/modern_technology.md",             None),
    ("wiki/vocabulary/healthcare_and_medicine.md",       None),
    ("wiki/vocabulary/government_and_law.md",            None),
    ("wiki/vocabulary/fables_and_wisdom_vocab.md",       150),
    ("wiki/vocabulary/idioms_and_metaphors.md",          None),
    ("wiki/vocabulary/expressive_words.md",              None),
    ("wiki/vocabulary/archaic_vs_modern.md",             None),
    # Culture & history
    ("wiki/culture/zomi_comprehensive.md",               200),
    ("wiki/culture/traditional_customs.md",              150),
    ("wiki/culture/historical_origins.md",               150),
    # Mistakes to avoid
    ("wiki/mistakes/common_mistakes.md",                 None),
    # Curriculum
    ("wiki/grammar/grammar_a1_to_c2.md",                 None),
    ("wiki/curriculum/content_a1_a2.md",                 None),
    ("wiki/curriculum/content_b1_b2.md",                 150),
    # Literature
    ("wiki/literature/folklore_idioms.md",               200),
    ("wiki/literature/proverbs_and_wisdom.md",           None),
    # Linguistics
    ("wiki/linguistics/tedim_pau_language_reference.md", 200),
    ("wiki/linguistics/zolai_sinna_2010_knowledge.md",   None),
]


def main():
    os.chdir(Path(__file__).parent.parent)

    sections = []
    total_lines = 0

    for fpath, max_lines in SOURCES:
        p = Path(fpath)
        if not p.exists():
            print(f"  SKIP (missing): {fpath}")
            continue
        lines = p.read_text(encoding="utf-8").splitlines()
        if max_lines:
            lines = lines[:max_lines]
        content = "\n".join(lines).strip()
        if not content:
            continue
        sections.append(f"\n\n---\n<!-- SOURCE: {fpath} -->\n\n{content}")
        total_lines += len(lines)
        print(f"  +{len(lines):4d} lines  {fpath}")

    header = """# Zolai (Tedim Chin) — Complete Language Reference
## For AI Translation, Learning, and Language Processing

> Compiled from the Zolai AI Second Brain project wiki.
> Language: Tedim Zolai (ZVS v9 standard)
> Dialect: Tedim — NOT Hakha, Falam, or Mizo
> Last updated: 2026-04-18

---

## ⚠️ Critical Rules Before Using This Document

1. **ZVS Standard only** — use `pasian` (not pathian), `gam` (not ram), `tua` (not cu/cun)
2. **Negation**: `kei` for conditionals, `lo` valid for 3rd person past/state
3. **`kei lo`** = compound absolute negation ("none/not any") — Ten Commandments usage
4. **Word order**: OSV most natural, SOV requires `in` marker
5. **`sanginn`** = school (not sanggin)
6. **`lo`** is valid ZVS — not Hakha-only

"""
    full = header + "".join(sections)

    Path(OUT).write_text(full, encoding="utf-8")
    size_kb = Path(OUT).stat().st_size // 1024
    print(f"\nSaved → {OUT}")
    print(f"Size: {size_kb} KB | Lines: {total_lines}")
    print(f"NotebookLM limit: ~500KB — {'✅ OK' if size_kb < 500 else '⚠️ TOO LARGE'}")


if __name__ == "__main__":
    main()

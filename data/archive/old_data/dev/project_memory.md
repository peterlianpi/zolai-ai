# Project Memory: Zolai Tedim AI Second Brain

## Development Focus
The project focuses on building a Zolai (Tedim) AI Second Brain by extracting and standardizing linguistic and cultural knowledge from primary sources (LT Tuang, LT Tuang Standard Format, and Tedim Bible texts).

## Current State
- **Wiki Structure:** Established `wiki/grammar`, `wiki/vocabulary`, `wiki/culture`, and `wiki/history`.
- **Primary Source Analysis:** Processed `Zolai Standard Format (2018)` rules for apostrophes, plural suffixes (`i...uh`), and temporal particles.
- **Tone System:** Mapped the 14 toneme system based on pitch and length.
- **Standardized Lexicon:** Initial common-words vocabulary extracted.

## Key Rules Established
- **Apostrophe Rule:** Contracted possessive (`ii` -> `'`) and agentive (`in` -> `'n`).
- **"uh" Redundancy:** Omit `uh` plural suffix when using prefix `i` (inclusive first person plural).
- **Temporal Particles:** `laitak` (Present), `ta` (Immediate Past), `khin` (Remote Past), `ding` (Future).
- **Word Distinction:** `thuman'na` vs `thumanna`.

## Next Milestones
- **Verb Stem Mapping:** Map "Stem I" (Affirmative) vs "Stem II" (Negative/Dependent) verb forms.
- **Expanded Lexicon:** Process the 2,000+ entries from `ctd-ord-plain.json` and `Zolai_Standard_Format.txt`.
- **Genealogy Extraction:** Analyze `Zolai_Khanggui_AD_1899_AD_2013.pdf` (pending extraction/conversion).
- **Model Auditing:** Script to check for `i...uh` redundancy and ergative `'n` usage in fine-tuning datasets.

# Best Practices for High-Quality Zolai Data Generation

Building high-quality synthetic datasets for low-resource languages like Zolai (Tedim Chin) requires a multi-stage validation pipeline to catch hallucinations, literal English syntax (SOV vs OSV), and morphological errors. 

## 1. Back-Translation Pipeline (Self-Correction)
Always perform a "round-trip" back-translation. Models often hallucinate grammatically fluent but semantically wrong text in the target language.
- **Step A (Forward Translation)**: `English -> Zolai`
- **Step B (Back-Translation)**: `Zolai -> English`
- **Step C (Similarity Scoring)**: Use a lightweight embedding model or LLM judge to compare the original English to the Back-Translated English. If the semantic similarity is below a certain threshold (e.g., `< 0.85`), the Zolai translation is likely flawed.
- **Step D (LLM Self-Correction)**: If flagged, feed the error back: *"You translated X to Y. When Y is translated back, it means Z. Please fix Y to mean X, applying Ergative constraints."*

## 2. Human-in-the-Loop (HITL) Validation
Synthetic data cannot be 100% trusted. Implement an active learning/HITL loop:
- **Sampling**: Randomly sample 5-10% of the dataset, particularly sentences flagged by the back-translation or regex grammar checks.
- **Review UI**: Use tools like Label Studio or Prodigy. Present the English text and the Zolai text to native speakers.
- **Correction**: Allow human annotators to fix the Zolai text.
- **Fine-Tuning**: Periodically add the human-corrected data back into the LLM system prompt / few-shot examples to continuously improve zero-shot accuracy.

## 3. Deduplication & Normalization
Ensure datasets don't overfit on repetitive synthetic phrases.
- **Exact Match Deduplication**: Hash normalized text (lowercased, punctuation removed) and discard identical Zolai outputs.
- **Fuzzy Match Deduplication**: Avoid highly repetitive syntactical templates (e.g., generating 50 sentences that start with "Computer pen..."). Use N-gram overlap or sentence embeddings to keep diversity high.

## 4. Rule-Based Quality Filters (Regex)
Run deterministic tests over the data before pushing to training:
- **Ergative Check**: If a sentence has a transitive verb, ensure `in` (or `ken`, `aman`, etc.) is present.
- **Stem Alternation Check**: If a sentence is negative (ends with `lo hi`), ensure the verb uses Stem II (e.g., `muh` instead of `mu`).
- **Literal Translation Check**: Flag sequences like `Pronoun + Noun + Verb + hi` (e.g., `Kei laibu sim hi`) which indicate an English `SVO` order hallucinated into Zolai, rather than the correct `OSV` (`Laibu ka sim hi`) or `SOV` with ergative (`Ken laibu ka sim hi`).

## 5. Domain-Specific Few-Shot Prompting
When translating specific domains (e.g., Medical, Technology, Legal), include 3-5 high-quality, human-verified examples in the prompt to anchor the LLM's style and terminology before generation.
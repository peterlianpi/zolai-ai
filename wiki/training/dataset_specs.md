# Zolai AI Training Dataset Specifications

This document tracks the statistics and composition of the datasets used for the Zolai AI Second Brain.

## Parallel Corpus Statistics (V1.0)

Synthesized from USX Bible sources for Tedim (ZVS), Falam (FCL), and Hakha (HCL06).

| Dataset | Entries | Format | Dialects/Styles Covered |
|---------|---------|--------|------------------|
| **Master** | 88,555 | JSONL | Tedim, Falam, Hakha |
| **Train V1** | 84,127 | JSONL | Tedim, Falam, Hakha |
| **Validation** | 4,428 | JSONL | Tedim, Falam, Hakha |
| **Full Train V2** | 457,024 | JSONL | V1 + Tonsan News + Sermons |

## Dialectal & Style Distribution

| Dialect/Style | Entries (Approx.) | Instruction Prompt |
|---------|-------------------|--------------------|
| **Tedim Chin** | 31,000+ | "Translate this text from English to Tedim Chin." |
| **Falam (FCL)** | 28,000+ | "Translate this text from English to FCL." |
| **Hakha (HCL06)** | 29,000+ | "Translate this text from English to HCL06." |
| **Tonsan News** | 150+ (Synthetic) | "Write a [Topic] news article in Zolai Tonsan style..." |
| **Sermons (Biakna)** | 4+ (Synthetic) | "Write a Zolai sermon/blessing..." |
| **LCEA Context** | 372,743 | "Continue the text in Zolai (Tedim)." |

## Quality Controls
- **Filtering:** Entries containing `[Backfilled]` or `[Missing Zolai]` are automatically excluded from the training/validation sets.
- **Reference Tracking:** Each entry includes its source verse (e.g., `GEN_Tedim_Chin_Parallel 1:1`) in metadata.

## Global Corpus Integration (Roadmap)
The **Parallel Corpus (88K)** will be merged with the **LCEA Corpus (2M+)** to provide both high-fidelity translation capabilities and broad linguistic coverage.

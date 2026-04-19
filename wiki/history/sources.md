# Zolai Data Sources (The Foundation)

This document provides a comprehensive overview of the datasets and reference materials that constitute the Zolai AI "Second Brain." Our corpus consists of **2,059,401 entries** across 23 primary sources.

## 1. Core Linguistic References (The "3 Sources")

These are the primary sources for rules, orthography, and formal prose:

1. **Zolai Standard Format (LT Tuang)**: The authoritative guide for orthography, joining/splitting rules, and punctuation.
2. **Zolai Sinna**: A series of 27 progressive lessons providing foundational grammar and sentence patterns.
3. **Gentehna Tuamtuam le A Deihnate**: A collection of parables and stories used for training the AI's "Socratic" tutoring style and narrative prose.

---

## 2. Dataset Inventory

### Bible Translations (Parallel Data)
| Source | Entries | Description |
|--------|---------|-------------|
| judson1835 | 26,589 | Judson Burmese Bible 1835 — parallel corpus data only (NOT a Tedim translation) |
| tb77 | 25,404 | TB77 Bible |
| tedim1932 | 24,366 | Tedim Bible 1932 |
| luther1912 | 6,578 | Luther-style translation |
| bible_tdb77 | 88 | TDB77 Bible (fragments) |

### Dictionary & Lexicons
| Source | Entries | Description |
|--------|---------|-------------|
| kaggle_v2 | 27,662 | Tongdot dictionary + hymns |
| zolai-gelhmaan-bu-1 | 1,088 | Basic Zolai (Zoom) vocabulary |

### Educational & Historical (Zolai Simbu)
| Source | Entries | Description |
|--------|---------|-------------|
| zolai-simbu-tan-li-sinna | 1,309 | Reader - Tan 4 |
| zolai-simbu-tan-thum-sinna | 1,127 | Reader - Tan 3 |
| zolai-simbu-tan-nih-sinna | 1,067 | Reader - Tan 2 |
| zolai-simbu-tan-khat-sinna | 317 | Reader - Tan 1 |
| zolai-khanggui-1899-2013 | 485 | Historical milestones and texts |

### Large Unlabeled Corpus
| Source | Entries | Description |
|--------|---------|-------------|
| unknown | 1,928,904 | LCEA corpus (raw, unverified) |

---

## 3. Data Hygiene & Cleaning

To ensure this mixed data remains cohesive, we apply the **ZVS (Zolai Versioning/Standardization)** pipeline:
- **Standardizer (v9):** Automates the joining of rules (e.g., `na ding` -> `nading`).
- **Audit System:** Validates UTF-8 integrity and grammar compliance.
- **Deduplication:** Uses MD5 hashing to ensure unique entries in training sets.

---
*Reference: resources/SOURCES.md, resources/agent_knowledge/sources_index.md*

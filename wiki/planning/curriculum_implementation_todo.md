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

# Curriculum → Training Data Pipeline
> Connects A1–C2 curriculum content to instruction pairs for training  
> **Status: IN PROGRESS** | Target deadline: 2026-05-31  
> **Last updated: 2026-04-20**

---

## The Gap

The curriculum wiki (`wiki/tuarritualum/`) has well-structured A1–C2 content but it's never been converted into training examples. This means the model learns from Bible text and news but not from pedagogically graded language.

---

## Mapping: Curriculum Level → Instruction Type

| CEFR Level | Focus | Instruction Types to Generate |
|---|---|---|
| A1 | Identity, basic SOV, greetings | Fill-in-blank, simple translation, yes/no QA |
| A2 | Narrative, past tense, prepositions | Story completion, tense conversion, short QA |
| B1 | Reasoning, compound sentences | Explain why, cause-effect, paragraph translation |
| B2 | Conditionals, comparisons | Conditional generation, compare/contrast |
| C1 | Rhetoric, abstract theology | Paraphrase, formal register conversion |
| C2 | Poetic parallelism, doxology | Poetry analysis, register transformation |

---

## Generation Template per Level

### A1 Example
```json
{
  "instruction": "Zolai in 'My name is Peter' ci hi eng nge?",
  "output": "Ka min Peter hi.",
  "cefr": "A1",
  "domain": "identity"
}
```

### B1 Example
```json
{
  "instruction": "Eng ahih manin a pai hi? (Why did he go?) — Zolai in ciang in gen.",
  "output": "Amah in sanginn ah pai ding ahih manin a pai hi.",
  "cefr": "B1",
  "domain": "reasoning"
}
```

### C1 Example
```json
{
  "instruction": "Tua thu pen formal register in let in.",
  "input": "Ka pai ding hi.",
  "output": "Ka pai ding ahih hi.",
  "cefr": "C1",
  "domain": "register"
}
```

---

## Target Counts per Level

| Level | Target Pairs | Source |
|---|---|---|
| A1 | 2,000 | Curriculum + common phrases wiki |
| A2 | 2,000 | Curriculum + daily life vocab |
| B1 | 3,000 | Curriculum + news corpus |
| B2 | 3,000 | Curriculum + Bible narrative |
| C1 | 2,000 | Curriculum + sermon register |
| C2 | 1,000 | Curriculum + poetry/hymns |
| **Total** | **13,000** | |

This 13K CEFR-tagged set, combined with the existing 11K synthetic + 329K Bible pairs, gives us a well-rounded training corpus.

> **Current training status (2026-04-20):**
> - `zolai-qwen-0.5b` (0.5B LoRA FP16, T4x2): chunk 300k–800k of 5.1M sentences
> - `zolai-qwen2.5-3b-lora` (3B QLoRA 4-bit, single T4): chunk 300k+
> - Both models hosted on HuggingFace: [peterpausianlian](https://huggingface.co/peterpausianlian)

---

## Script to Build

```python
# scripts/synthesis/build_curriculum_instructions.py
# Reads wiki/curriculum/*.md files
# Generates instruction pairs per CEFR level
# Tags each with {"cefr": "A1", "domain": "identity"}
# Output: data/training/instructions_curriculum_v1.jsonl
```

**Status:** TO BUILD — assign to `zomi-synthesizer` agent.

> **Last updated: 2026-04-20** — Status changed from PLANNED to IN PROGRESS; current model training progress added.

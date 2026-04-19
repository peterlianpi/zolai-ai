# Zolai Evaluation Benchmarks
> Status: IN PROGRESS | Target: 2026-05-15 (ZVS set), 2026-08-31 (FLORES)

---

## Benchmark 1 — ZVS Compliance Test Set (100 sentences)
**Purpose:** Measure whether the model uses correct Tedim ZVS dialect.
**Deadline:** 2026-05-15
**Status:** 🔴 Not started

### Format
```json
{
  "id": "zvs_001",
  "prompt": "Translate: God created the heavens and the earth.",
  "correct": "Pasian in van leh gam a sak hi.",
  "wrong": "Pathian in van leh ram a sak hi.",
  "rule": "use_pasian_not_pathian + use_gam_not_ram",
  "source": "GEN 1:1 Tedim2010"
}
```

### Categories (20 sentences each)
| Category | Count | Rule Tested |
|---|---|---|
| Dialect words (pasian/gam/tapa/topa) | 20 | Core ZVS vocabulary |
| Negation (kei vs lo) | 20 | Conditional negation |
| Plural (uh with i) | 20 | Plural marker rules |
| Pronoun (eite vs kei te) | 20 | 1st person plural |
| Word order (SOV/OSV) | 20 | Sentence structure |

### How to Build
1. Take 100 sentences from `bible_parallel_tedim2010_kjv.jsonl` (gold standard)
2. For each: create a "wrong" version by substituting ZVS violations
3. Have 1 native speaker verify the "correct" version
4. Save to `data/eval/zvs_compliance_test_v1.jsonl`

---

## Benchmark 2 — Zolai-QA (500 pairs)
**Purpose:** Measure question-answering ability in Zolai.
**Deadline:** 2026-07-01
**Status:** 🔴 Not started

### Format
```json
{
  "id": "qa_001",
  "question": "Pasian in gam leh van eng tiang in a sak?",
  "answer": "Pasian in gam leh van ni khat sung in a sak hi.",
  "domain": "bible",
  "difficulty": "A2"
}
```

### Domain Breakdown
| Domain | Count |
|---|---|
| Bible knowledge | 100 |
| Zolai grammar | 100 |
| Daily life | 100 |
| Culture/history | 100 |
| Translation | 100 |

---

## Benchmark 3 — Zolai-FLORES (1012 sentences)
**Purpose:** Standard multilingual MT benchmark, enables comparison with other languages.
**Deadline:** 2026-08-31
**Status:** 🔴 Not started — requires native speakers

### What FLORES Is
FLORES+ is the standard evaluation benchmark for multilingual MT. 1012 sentences covering diverse domains (news, Wikipedia, health, travel). Adding Tedim makes us officially comparable to 200+ other languages.

### How to Build
1. Download FLORES+ English sentences: `huggingface.co/datasets/openlanguagedata/flores_plus`
2. Translate all 1012 sentences to Zolai (use our best model as first draft)
3. Have 2 native speakers verify each sentence independently
4. Resolve disagreements with a 3rd speaker
5. Submit to FLORES+ official dataset

### Estimated Effort
- Machine translation draft: ~2 hours (automated)
- Native speaker review: ~85 hours total (2 reviewers × 1012 sentences × 2.5 min)
- Reconciliation: ~10 hours

---

## Benchmark 4 — Translation Quality (BLEU/chrF)
**Purpose:** Measure ZO↔EN translation quality.
**Status:** 🟡 Partially ready (need reference translations)

### Metrics
- **chrF** (primary) — character-level F-score, better for morphologically rich languages
- **BLEU** (secondary) — standard but misleads for low-resource
- **COMET** (aspirational) — neural metric, most human-aligned

### Reference Set
Use `bible_parallel_tedim2010_kjv.jsonl` held-out 500 pairs as reference.
```bash
sacrebleu reference.txt < hypothesis.txt --metrics chrf bleu
```

---

## Evaluation Script (Minimal)

```python
# scripts/evaluate_model.py
import json
from pathlib import Path

def run_zvs_eval(model, test_file="data/eval/zvs_compliance_test_v1.jsonl"):
    """Run ZVS compliance evaluation."""
    tests = [json.loads(l) for l in Path(test_file).read_text().splitlines()]
    FORBIDDEN = {"pathian", "ram", "fapa", "bawipa", "cu", "cun", "siangpahrang"}
    
    results = []
    for t in tests:
        response = model.generate(t["prompt"])
        words = set(response.lower().split())
        violations = words & FORBIDDEN
        results.append({
            "id": t["id"],
            "pass": len(violations) == 0,
            "violations": list(violations)
        })
    
    compliance_rate = sum(r["pass"] for r in results) / len(results)
    print(f"ZVS Compliance: {compliance_rate:.1%} ({sum(r['pass'] for r in results)}/{len(results)})")
    return results
```

---

## Current Eval Status

| Benchmark | Status | Location | Count |
|---|---|---|---|
| ZVS Compliance test | ✅ **BUILT** | `data/eval/zvs_compliance_test_v1.jsonl` | 100 pairs |
| Translation eval | ✅ **BUILT** | `data/eval/translation_eval_v1.jsonl` | 500 pairs |
| QA eval | ✅ **BUILT** | `data/eval/zolai_qa_v1.jsonl` | 500 pairs |
| ORPO preference pairs | ✅ **BUILT** | `data/training/orpo_pairs_v1.jsonl` | 2,000 pairs |
| Eval runner script | ✅ **BUILT** | `scripts/evaluate_model.py` | — |
| Zolai-FLORES (1012) | 🔴 Not started | Needs native speakers | — |

**Run eval:** `python3 scripts/evaluate_model.py`

## ZVS Test Set — Rule Coverage
| Rule | Pairs |
|---|---|
| use_pasian_not_pathian | 54 |
| use_gam_not_ram | 35 |
| use_tapa_not_fapa | 6 |
| use_kei_not_lo_in_conditionals | 3 |
| use_topa_not_bawipa | 2 |

**Source:** `bible_parallel_tedim2010_kjv.jsonl` (gold ZVS standard)
**Method:** Gold correct sentences + injected ZVS violations as rejected pairs

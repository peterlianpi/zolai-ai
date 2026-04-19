# Zolai Data Cleaning Pipeline
> Last updated: 2026-04-18 | Department: Data

---

## Pipeline Overview

```
RAW DATA
   ↓
1. Encoding Fix (ftfy)
   ↓
2. Language ID Filter (custom Zolai langid)
   ↓
3. Exact Deduplication (MD5)
   ↓
4. Fuzzy Deduplication (MinHash LSH)
   ↓
5. Heuristic Quality Filter
   ↓
6. ZVS Dialect Filter
   ↓
7. Perplexity Filter (KenLM)
   ↓
8. Parallel Alignment Check (for parallel data)
   ↓
CLEAN DATA
```

---

## Step 1: Encoding Fix

```python
import ftfy

def fix_encoding(text: str) -> str:
    return ftfy.fix_text(text)
```

Common issues in Zolai corpus:
- UTF-8 mojibake from old Windows encodings
- Smart quotes converted to ASCII
- Burmese Unicode mixed with Latin

---

## Step 2: Language ID

No off-the-shelf Zolai langid exists. Build one:

```python
# Train custom fastText langid on known-good Zolai text
import fasttext

# Prepare training data: __label__zolai <text>
# Use 5K known-good Zolai sentences as positive examples
# Use English, Burmese, Chin as negative examples

model = fasttext.train_supervised(
    input="langid_train.txt",
    epoch=25,
    wordNgrams=2,
    dim=100,
)
model.save_model("zolai_langid.bin")

def is_zolai(text: str, threshold=0.7) -> bool:
    label, prob = model.predict(text.replace("\n", " "))
    return label[0] == "__label__zolai" and prob[0] >= threshold
```

---

## Step 3: Exact Deduplication

```python
import hashlib

def normalize_for_dedup(text: str) -> str:
    return " ".join(text.lower().split())

def exact_dedup(lines: list[str]) -> list[str]:
    seen = set()
    result = []
    for line in lines:
        h = hashlib.md5(normalize_for_dedup(line).encode()).hexdigest()
        if h not in seen:
            seen.add(h)
            result.append(line)
    return result
```

Expected reduction: 10–20% of corpus (especially Bible corpus with repeated verses).

---

## Step 4: Fuzzy Deduplication

```python
from datasketch import MinHash, MinHashLSH

def get_minhash(text: str, num_perm=128) -> MinHash:
    m = MinHash(num_perm=num_perm)
    for word in text.lower().split():
        m.update(word.encode("utf8"))
    return m

def fuzzy_dedup(texts: list[str], threshold=0.8) -> list[str]:
    lsh = MinHashLSH(threshold=threshold, num_perm=128)
    result = []
    for i, text in enumerate(texts):
        m = get_minhash(text)
        if not lsh.query(m):
            lsh.insert(str(i), m)
            result.append(text)
    return result
```

Expected reduction: additional 5–15% (near-duplicate Bible verses across TB77/TBR17/Tedim2010).

---

## Step 5: Heuristic Quality Filter

```python
import re

def quality_filter(text: str) -> bool:
    # Length checks
    if len(text) < 20 or len(text) > 2000:
        return False
    
    words = text.split()
    if len(words) < 3:
        return False
    
    # Repetition check
    unique_words = set(w.lower() for w in words)
    if len(unique_words) / len(words) < 0.5:
        return False
    
    # Alpha ratio
    alpha_chars = sum(1 for c in text if c.isalpha())
    if alpha_chars / len(text) < 0.5:
        return False
    
    # No HTML
    if re.search(r'<[^>]+>', text):
        return False
    
    # No excessive punctuation
    punct_ratio = sum(1 for c in text if c in '.,!?;:') / len(text)
    if punct_ratio > 0.2:
        return False
    
    return True
```

---

## Step 6: ZVS Dialect Filter

```python
FORBIDDEN = {"pathian", "ram", "fapa", "bawipa", "siangpahrang", "cu", "cun"}

def zvs_dialect_check(text: str) -> tuple[bool, list[str]]:
    """Returns (is_clean, list_of_violations)."""
    words = set(text.lower().split())
    violations = list(words & FORBIDDEN)
    return len(violations) == 0, violations

def apply_zvs_filter(records: list[dict], text_field="text") -> tuple[list, list]:
    """Returns (clean_records, flagged_records)."""
    clean, flagged = [], []
    for rec in records:
        ok, violations = zvs_dialect_check(rec.get(text_field, ""))
        if ok:
            clean.append(rec)
        else:
            rec["_violations"] = violations
            flagged.append(rec)
    return clean, flagged
```

---

## Step 7: Perplexity Filter (KenLM)

Train a KenLM model on clean Zolai text, then filter high-perplexity lines:

```bash
# Build KenLM model
lmplz -o 5 < clean_zolai.txt > zolai_5gram.arpa
build_binary zolai_5gram.arpa zolai_5gram.binary
```

```python
import kenlm

model = kenlm.Model("zolai_5gram.binary")

def get_perplexity(text: str) -> float:
    return model.perplexity(text)

def perplexity_filter(texts: list[str], max_ppl=500) -> list[str]:
    return [t for t in texts if get_perplexity(t) < max_ppl]
```

Tune `max_ppl` on a validation set. Start with 500, adjust based on what gets filtered.

---

## Step 8: Parallel Alignment Check

For parallel ZO↔EN pairs:

```python
from sentence_transformers import SentenceTransformer
import numpy as np

labse = SentenceTransformer("sentence-transformers/LaBSE")

def alignment_score(zo_text: str, en_text: str) -> float:
    embs = labse.encode([zo_text, en_text])
    cos_sim = np.dot(embs[0], embs[1]) / (np.linalg.norm(embs[0]) * np.linalg.norm(embs[1]))
    return float(cos_sim)

def filter_parallel_pairs(pairs: list[dict], min_score=0.6) -> list[dict]:
    """pairs: list of {"zo": ..., "en": ...}"""
    return [p for p in pairs if alignment_score(p["zo"], p["en"]) >= min_score]
```

---

## Quality Metrics to Track

After each cleaning run, report:

| Metric | Target | How to Measure |
|---|---|---|
| Total lines before | — | `wc -l` |
| Total lines after | — | `wc -l` |
| Reduction % | 20–40% | (before-after)/before |
| ZVS violation rate | < 1% | Count flagged / total |
| Avg perplexity | < 300 | KenLM on sample |
| Parallel alignment avg | > 0.7 | LaBSE cosine |
| Unique token count | — | Tokenizer vocab |

---

## Running the Full Pipeline

```bash
# Full cleaning pipeline
python scripts/maintenance/clean_corpus.py \
    --input data/corpus/corpus_master_v1.jsonl \
    --output data/corpus/corpus_master_clean_v1.jsonl \
    --langid models/zolai_langid.bin \
    --kenlm models/zolai_5gram.binary \
    --zvs-filter \
    --dedup-exact \
    --dedup-fuzzy \
    --report data/logs/cleaning_report.json
```

---

## Notes

- Always keep the raw data — never overwrite `corpus_master_v1.jsonl`
- Save cleaning reports to `data/logs/` with timestamps
- The ZVS filter produces a `flagged/` folder — review these manually periodically
- Bible corpus needs special handling: same verse in multiple versions is NOT a duplicate

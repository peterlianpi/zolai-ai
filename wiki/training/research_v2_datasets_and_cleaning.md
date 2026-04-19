# Deep Research v2 — Part 1: Datasets & Data Cleaning
> Last updated: 2026-04-18 | Based on arxiv papers 2024–2025 + community research

---

## 1. The Zolai Data Situation (Honest Assessment)

### What We Have vs What Research Says We Need

| Stage | Minimum Needed | We Have | Status |
|---|---|---|---|
| Continued Pretraining (CPT) | 10M tokens monolingual | ~574MB (~100M tokens) | ✅ Strong |
| SFT — Translation | 10K–50K parallel pairs | 105K pairs | ✅ Excellent |
| SFT — Instructions | 5K–20K instruction pairs | 11K synthetic | ⚠️ Needs expansion |
| DPO Alignment | 1K–5K preference pairs | 0 (not built yet) | ❌ Missing |
| Evaluation | 500–1K verified sentences | 0 (not built yet) | ❌ Missing |

**Key finding from UrduLLaMA paper (arXiv:2502.16961):** They used 128M Urdu tokens for CPT + 41K instructions + 50K translation pairs → strong results. We have comparable or better data.

**Key finding from arXiv:2408.12780 ("Quality or Quantity?"):** For low-resource translation, **diversity of SFT data matters more than raw quantity**. 10K diverse pairs > 100K repetitive pairs.

---

## 2. External Data Sources — Deep List

### 2.1 Bible & Religious Corpora (Highest Priority)

| Source | URL | What to Get |
|---|---|---|
| **eBible Corpus** | ebible.org/Scriptures | 833 language Bibles; cross-align our versions |
| **OPUS Bible** | opus.nlpl.eu/bible-uedin | Parallel Bible in 100 languages |
| **Parallel Bible Corpus** | github.com/christos-c/bible-corpus | 100 languages, sentence-aligned |
| **JW300** | opus.nlpl.eu/JW300 | Jehovah's Witnesses texts, 300 languages |
| **Global Recordings Network** | globalrecordings.net | Audio + transcripts in 6,000+ languages |

**Action for Zolai:** Cross-align our TB77/TBR17/Tedim1932/Tedim2010 with KJV using the OPUS Bible corpus. This gives us 4 Zolai versions × 31K verses = 124K additional alignment pairs.

### 2.2 Multilingual Web Corpora

| Source | URL | Notes |
|---|---|---|
| **FineWeb2** | huggingface.co/HuggingFaceFW | 1000+ languages, 20TB; check if Tedim/Chin is included |
| **HPLT v2** | huggingface.co/HPLT | High-quality multilingual; check for Myanmar/Chin |
| **CC-100** | data.statmt.org/cc-100 | 100 languages from CommonCrawl |
| **mC4** | huggingface.co/datasets/mc4 | 101 languages; no Tedim but useful for Burmese proxy |
| **CulturaX** | huggingface.co/datasets/uonlp/CulturaX | 167 languages, cleaned mC4+OSCAR |
| **MADLAD-400** | huggingface.co/datasets/allenai/MADLAD-400 | 400 languages; may have Chin/Kuki-Chin |

**Action:** Check FineWeb2 and MADLAD-400 for any Tedim/Zomi/Chin content. Even 1K sentences is valuable.

### 2.3 Parallel Corpora Tools

| Tool | Purpose | URL |
|---|---|---|
| **OPUS** | Largest parallel corpus collection | opus.nlpl.eu |
| **LASER3** | Mine parallel sentences from multilingual text | github.com/facebookresearch/LASER |
| **SONAR** | Meta's successor to LASER, 200+ languages | github.com/facebookresearch/SONAR |
| **LaBSE** | Google multilingual sentence embeddings | huggingface.co/sentence-transformers/LaBSE |
| **vecalign** | Fast sentence alignment | github.com/thompsonb/vecalign |
| **hunalign** | Classic sentence aligner | mokk.bme.hu/resources/hunalign |

### 2.4 Community Datasets to Submit To

| Community | What They Want | How to Submit |
|---|---|---|
| **SEACrowd** | SEA language datasets | github.com/SEACrowd/seacrowd-datahub — open PR |
| **FineWeb2-C** | Quality-rated texts in any language | huggingface.co/blog/davanstrien/fineweb2-community |
| **Aya Collection** | Instruction data in any language | huggingface.co/datasets/CohereForAI/aya_collection |
| **FLORES+** | 1012 parallel sentences | github.com/openlanguagedata/flores |
| **AmericasNLP** | Indigenous/minority language data | americasnlp.github.io |

**Priority action:** Submit our parallel corpus to SEACrowd. This gets Zolai on the map and attracts collaborators.

---

## 3. Data Cleaning — Research-Backed Deep Pipeline

### 3.1 The FineWeb/DataTrove Pipeline (Industry Standard)

HuggingFace's FineWeb2 paper (arXiv:2506.20920) defines the current gold standard for multilingual data cleaning. Their pipeline, adapted for Zolai:

**Stage 1: Extraction**
- Extract text from HTML using `trafilatura` (better than BeautifulSoup for web text)
- For PDFs: use `pdfminer.six` or `pymupdf`
- For DOCX/ODT: use `python-docx`

**Stage 2: Language Identification**
- FineWeb2 uses `fastText` lid.176 as primary
- For Zolai: train custom fastText on our corpus (no off-the-shelf model exists)
- Threshold: keep lines with Zolai probability ≥ 0.65

**Stage 3: Quality Filtering (Heuristics)**
FineWeb2's exact heuristics (adapted for Zolai):
```
- Remove lines < 20 chars or > 5000 chars
- Remove lines where alpha_ratio < 0.6
- Remove lines with > 5 consecutive punctuation chars
- Remove lines starting with bullet/list markers (often navigation text)
- Remove lines with > 3 URLs
- Remove lines where word_count < 3
- Remove lines where avg_word_length > 15 (likely OCR garbage)
- Remove lines where digit_ratio > 0.4
```

**Stage 4: Deduplication**
FineWeb2 uses two-stage dedup:
1. URL-level: deduplicate by source URL first
2. MinHash LSH: Jaccard threshold 0.7, 5-gram shingles, 128 hash functions

**Stage 5: Model-Based Quality Filtering**
FineWeb2 trains a quality classifier on curated vs random web text. For Zolai:
- Positive examples: Bible text, ZomiDaily articles, dictionary entries
- Negative examples: OCR garbage, mixed-language text, spam
- Tool: fastText classifier (fast, works on CPU)

### 3.2 The AI4Bharat Blueprint (Best for Low-Resource)

The AI4Bharat paper (arXiv:2403.06350) is the most directly applicable to Zolai — they built datasets for 22 Indian languages with similar challenges:

**Their pipeline:**
1. **Web crawl** → CommonCrawl + targeted crawls of language-specific sites
2. **Dedup** → URL dedup → exact dedup → near-dedup (SimHash)
3. **Language filter** → IndicLID (their custom langid)
4. **Quality filter** → perplexity filter using KenLM trained on clean text
5. **Script filter** → ensure correct script (Latin for Zolai)
6. **Domain tagging** → tag by source (Bible, news, dictionary, synthetic)

**Key lesson from AI4Bharat:** Domain tagging is critical. Mix domains in training but track them separately. Bible text has different statistical properties than news — mixing without tracking causes silent quality issues.

### 3.3 Zolai-Specific Cleaning Rules

Beyond generic cleaning, Zolai needs:

**Dialect enforcement (ZVS standard):**
```python
# These words indicate wrong dialect — flag for review, don't auto-delete
WRONG_DIALECT = {"pathian", "ram", "fapa", "bawipa", "siangpahrang", "cu", "cun"}

# These are correct ZVS markers
CORRECT_DIALECT = {"pasian", "gam", "tapa", "topa", "kumpipa", "tua"}
```

**Script normalization:**
- Zolai uses Latin script — filter out lines with Burmese/Myanmar Unicode
- Normalize: `ʻ` → `'`, `–` → `-`, `"` → `"`, `"` → `"`
- Fix common OCR errors: `0` → `o` in Zolai words, `1` → `l`

**Bible-specific dedup:**
- Same verse across TB77/TBR17/Tedim1932/Tedim2010 is NOT a duplicate — keep all versions
- Deduplicate within each version only
- Tag each record with `source_version` field

**Instruction data validation:**
```python
def validate_instruction(record):
    assert len(record["instruction"]) > 10
    assert len(record["output"]) > 20
    assert record["output"] != record["instruction"]  # Not a copy
    assert any(c.isalpha() for c in record["output"])  # Has text
    # Output should contain Zolai (not pure English response)
    zolai_words = {"a", "in", "om", "na", "ka", "hi", "leh", "uh", "e"}
    output_words = set(record["output"].lower().split())
    assert len(zolai_words & output_words) > 0, "Output may be pure English"
```

### 3.4 Tools Reference (Updated)

| Tool | Install | Purpose |
|---|---|---|
| `trafilatura` | `pip install trafilatura` | Web text extraction (better than BS4) |
| `datatrove` | `pip install datatrove` | HuggingFace's pipeline framework |
| `datasketch` | `pip install datasketch` | MinHash LSH dedup |
| `fasttext` | `pip install fasttext` | Language ID + quality classifier |
| `kenlm` | build from source | Perplexity filtering |
| `ftfy` | `pip install ftfy` | Fix text encoding |
| `lingua-py` | `pip install lingua-language-detector` | Better langid (no Zolai but useful) |
| `sentence-transformers` | `pip install sentence-transformers` | LaBSE for parallel alignment |
| `sacrebleu` | `pip install sacrebleu` | BLEU/chrF evaluation |
| `unbabel-comet` | `pip install unbabel-comet` | Neural MT evaluation |

---

## 4. Data Format Standards

### 4.1 Instruction Format (ChatML — Recommended)

```json
{
  "messages": [
    {"role": "system", "content": "Na Zolai thu gen ding agent hi. ZVS standard in gen uh."},
    {"role": "user", "content": "Zolai in 'good morning' ci hi eng nge?"},
    {"role": "assistant", "content": "Zolai in 'good morning' ci hi 'Zingsang lawm' ci hi."}
  ]
}
```

### 4.2 Translation Pair Format

```json
{
  "zo": "Pasian in gam leh van a sak hi.",
  "en": "God created the heavens and the earth.",
  "source": "TB77",
  "book": "GEN",
  "chapter": 1,
  "verse": 1,
  "quality": "gold"
}
```

### 4.3 DPO Pair Format

```json
{
  "prompt": "Zolai in 'God' ci hi eng nge?",
  "chosen": "Zolai in 'God' ci hi 'Pasian' ci hi. ZVS standard in 'Pasian' hi a dik hi.",
  "rejected": "Zolai in 'God' ci hi 'Pathian' ci hi."
}
```

### 4.4 Metadata Fields (Every Record Should Have)

```json
{
  "text": "...",
  "source": "zomidaily|bible|dictionary|synthetic|hymns|rvasia",
  "dialect": "tedim_zvs|tedim_other|zokam|hcl06|unknown",
  "quality": "gold|silver|bronze",
  "domain": "religious|news|instruction|translation|dictionary|hymn",
  "date_added": "2026-04-18",
  "version": "v1"
}
```

---

## 5. Evaluation Datasets to Build (Priority)

### 5.1 Zolai-FLORES (Most Important)

FLORES format: 1,012 sentences covering diverse domains, translated by humans.

**How to build:**
1. Take FLORES+ English sentences (huggingface.co/datasets/openlanguagedata/flores_plus)
2. Translate to Zolai (use our best model + human review)
3. Have 2 native speakers verify each sentence
4. Submit to FLORES+ as official Tedim addition

**Cost estimate:** 1,012 sentences × 5 min/sentence = ~85 hours of native speaker time

### 5.2 Zolai-QA (Quick Win)

500 question-answer pairs in Zolai, covering:
- Bible knowledge (100 pairs)
- Zolai grammar (100 pairs)
- Daily life (100 pairs)
- Culture/history (100 pairs)
- Translation (100 pairs)

### 5.3 ZVS Compliance Test Set

100 sentences with known ZVS violations + correct versions:
```json
{"wrong": "Pathian in gam a sak hi.", "correct": "Pasian in gam a sak hi.", "rule": "use_pasian_not_pathian"}
```

---

*Sources: arXiv:2502.16961, arXiv:2403.06350, arXiv:2506.20920, arXiv:2408.12780, FineWeb2 paper*

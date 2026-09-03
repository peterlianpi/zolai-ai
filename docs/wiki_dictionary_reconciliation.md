# Wiki ↔ Dictionary Reconciliation

Reproducible audit reconciling `wiki/vocabulary` against the processed dictionary
and generated wordlists. **Read-only** — never edits data.

## Tool

```bash
python scripts/reconcile_wiki_dictionary.py
```

What it reports:
1. Dictionary headword count (`data/dictionary/processed/dict_master_v2.json`).
2. Wiki vocabulary `.md` file count + generated wordlist file count.
3. **ZVS 2018 banned-dialect audit** of dictionary headwords
   (`{pasian, gam, tapa, topa, bawipa, kumpipa}`).
4. Raw wiki-token ↔ dictionary headword coverage (noisy, includes English prose).
5. **Wordlist (TSV) ↔ dictionary reconciliation** — the actionable signal:
   clean single tokens in `wordlists/*.tsv` that are **missing** from the dictionary.

## Current findings (2026-09-03, on `main`)

| Metric | Value |
|--------|-------|
| Dictionary headwords | 36,667 |
| Wiki vocabulary `.md` files | 73 |
| Generated wordlist files | 11 |
| Wordlist host rows scanned | 64,900 |
| Clean single tokens matching dictionary | 30,682 (47.3%) |
| Clean tokens missing from dictionary | 35,258 |
| Banned dialect headwords in dictionary | 0 ✅ |

### Notes on the "missing" set
- Many of the ~35K gaps are **compound/company-derived InZomi lexical items**
  (e.g. `aakbu` hencoop, `aakbuk` fowl shed, `aakgil` chicken roost, `aakgall`
  jungle-cat). These are plausible **dictionary enrichment candidates**, not errors.
- Parenthetical annotations (`(greek)`, `(arch)`, multiword glosses) were stripped;
  apostrophe-prefixed artifacts (`a'n`) remain and are low-priority.
- 47% single-token coverage is the **headword-level** match; multiword phrases and
  inflected forms legitimately fall outside the dictionary key set.

## Suggested follow-up (not executed here)
- Prioritize CEFR A1–B1 wordlist-only tokens first (learner-relevant).
- Cross-check top gaps against `scripts/dictionary/expand_dictionary_v3.py` inputs
  before adding, to avoid duplicating an existing alias/compound there.
- Feed accepted gaps into the dictionary build pipeline (runs as `zolai` CLI, not here).

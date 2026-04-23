# Zolai Standard Format (LT Tuang) — distilled reference

## What this source is

This is the **authoritative orthography/format guide** used to keep Zolai writing consistent across writers and regions.

In this repo, the *code* version of these conventions is implemented in:

- `src/zolai/v9/standardizer.py`

Use this doc as a **human reference** when you need to decide:

- whether something should be joined/split
- how to standardize recurring variants
- how to treat apostrophes, compounds, and common particles

## High-signal sections to consult (from ToC)

The document's table of contents includes (selected items):

- **(14) "A" le "Ki" ii Laimal Gawm Le Hal**
- **(15) "G" le "Ng"**
- **(16) Apostrophe ( ' ) Zatna Mun**
- **(17) ah, uhhi, ahi hi.**
- **(22) Laimal Zatzia (Grammar)**

## How to turn "reference rules" into agent actions

When you (or an agent) finds an issue:

- **Systematic + deterministic** (same fix everywhere):
  - implement a rule in `src/zolai/v9/standardizer.py`
  - re-run `python zolai_cli.py standardize-jsonl ...`
- **Ambiguous or context-dependent**:
  - record it as a "candidate" fix (word/sentence) under `resources/agent_knowledge/`
  - only promote to a code rule if it proves safe

## What we already enforce in code (examples)

The current shared standardizer already includes common normalization patterns used throughout the repo, including:

- joining **`na ding` → `nading`** after a word (with optional apostrophe)
- joining **`a <prep>` → `a<prep>`** for a small preposition list (`tung, nuai, mai, gei, pualam, sung, khuapi`)
- spacing/particle normalization like `uhhi → uh hi`, `ahihi → ahi hi`, and some common fixes
- punctuation spacing and whitespace collapse

If you see additional "Standard Format" rules that are missing, add them *carefully* and keep them deterministic.

---

## Dictionary-Derived Standardization Rules

### Extended Compound Words (from Tongdot Dictionary)

Based on analysis of 12,521 Tedim dictionary entries, these additional compound patterns should be standardized:

#### Common Compounds to Join
```
# Family/People
mi hing → mihing
na u pang → naupang
inn kuan → innkuan

# Religion
thu piak → thupiak
thu pha → thupha
biak inn → biakinn
lai siangtho → Lai Siangtho

# Nature/Places
lei tung → leitung
van gam → vangam
tui dawn → tuidawn
tui pi → tuipi
khuapi → khuapi (already joined)

# Abstract
it na → itna
pil na → pilna
lung dam → lungdam
gup na → gupna
mawh na → mawhna
up na → upna
sep na → sepna
gelh na → gelhna
sim na → simna
sin na → sinna
gen na → genna
thunget na → thungetna
```

#### Prefix Compounds
```
# "Ki" prefix (reciprocal/passive)
ki pawl → kipawl
ki tuak → kituak
ki kit → kikit
ki khop → kikhop
ki gawm → kigawm
ki mat → kimat
ki sim → kisim
ki tel → kitel
ki thei → kithei

# "A" prefix + preposition
a tung → atung
a nuai → anuai
a mai → amai
a gei → agei
a pualam → apualam
a sung → asung
a khuapi → akhuapi
a lam → alam
```

#### Suffix Joining
```
# Nading suffix
word na ding → wordnading
word na dingin → wordnadingin
word na dingun → wordnadingun
hin na dingun → hinnadingun

# Other common suffixes
word na → wordna (noun formation)
word te → wordte (plural)
word teng → wordteng (all)
```

### Apostrophe Contractions (Complete List)

From dictionary analysis and standard format:

```
# Possessive emphasis
ka ong → k'ong
na ong → n'ong
ka hong → k'hong
na hong → n'hong
ka eek → k'eek
na eek → n'eek

# Question contractions
bang a → ba'a
bang hang a → bang ha'a
bang hang → ba'ha

# Preposition contractions
nung a → nu'a
sung ah → su'ah
ding a → di'a
nung2a → nu'a
sung2ah → su'ah
```

### Particle Fixes (Complete List)

```
# Spacing fixes
uhhi → uh hi
ahihi → ahi hi
u hi → uh hi
na sep → nasep
ci'n gen → ci-in gen
ci'n → ci hi
le hang → lehang

# Common typos
pasia → pasien
tope → topa
jes → jesu
holh → hoih
```

### G vs NG Distinction (Critical)

These are **not interchangeable** - they change meaning:

| G Word | Meaning | NG Word | Meaning |
|--------|---------|---------|---------|
| Gai | Marry (female) | Ngai | Marry (male) / Wait |
| Gah | Earn | Ngah | Receive |
| Gam | Country | Ngam | Dare |
| Gap | Strong | Ngap | Start work |
| Gak | Sit (plural) | Ngak | Midwife |
| Gawm | Join | Ngawm | - |
| Gim | Difficult | Ngim | Faithful |
| Gol | - | Ngol | - |

### Punctuation Rules

From standard format and dictionary patterns:

1. **Tawpna (.)** - Full stop: ends sentences, abbreviations
2. **Husanna (,)** - Comma: separates items, NOT before "le" (and)
3. **Ngakna (:)** - Colon: introduces lists, Bible references
4. **Thekna (-)** - Hyphen: compound words, ranges
5. **Tanglak (')** - Apostrophe: contractions, possession
6. **Kual ()** - Brackets: extra information
7. **Git-awn (/)** - Slash: alternatives

### Critical Rules

```
WRONG: Thangpi, Lunsen le Lian Pau
RIGHT: Thangpi, Lunsen, le Lian Pau
(Comma before "le" is NOT used)

WRONG: Pasian' hong itna
RIGHT: Pasian hong itna
(No apostrophe for simple possession)

WRONG: ka pai hi.
RIGHT: Ka pai hi.
(Capitalize first letter of sentence)
```

---

## Processing Pipeline

When standardizing Zolai text, apply rules in this order:

1. **Unicode normalization** (NFKC)
2. **Quote/apostrophe normalization**
3. **Compound word joining**
4. **Prefix compounds** (a+, ki+)
5. **Suffix joining** (na ding, etc.)
6. **Particle fixes** (uhhi, ahihi, etc.)
7. **Apostrophe contractions**
8. **Common typo fixes**
9. **Punctuation spacing**
10. **Whitespace normalization**

---

*Generated from: zolai_gelhmaan_bu_grammar_vol, zolai_standard_format, zolai_sinna, tongdot_dictionary*
*Last updated: 2026-04-01*

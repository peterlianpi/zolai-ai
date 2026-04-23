# Zolai (Tedim Chin) — Complete Language Reference
## For AI Translation, Learning, and Language Processing

> Compiled from the Zolai AI Second Brain project wiki.
> Language: Tedim Zolai (ZVS v9 standard)
> Dialect: Tedim — NOT Hakha, Falam, or Mizo
> Last updated: 2026-04-18

---

## ⚠️ Critical Rules Before Using This Document

1. **ZVS Standard only** — use `pasian` (not pasian), `gam` (not gam), `tua` (not tua/tua)
2. **Negation**: `kei` for conditionals, `lo` valid for 3rd person past/state
3. **`kei lo`** = compound absolute negation ("none/not any") — Ten Commandments usage
4. **Word order**: OSV most natural, SOV requires `in` marker
5. **`sanginn`** = school (not sanggin)
6. **`lo`** is valid ZVS — not Hakha-only



---
<!-- SOURCE: wiki/zolai_ai_instructions.md -->

# Zolai Language AI Instructions
## Complete Guide for Understanding, Processing, and Refining Zolai Text

---

## 1. What is Zolai?

Zolai (also known as Tedim Chin or Zopau) is a Tibeto-Burman language (specifically part of the South-Central Trans-Himalayan or Kuki-Chin branch) spoken by the Zo people (Zomi) primarily in:
- Northwestern Myanmar (Chin State, Sagaing Region, especially Tedim, Tonzang, and Kalay townships)
- Northeastern India (Manipur, Mizoram, Assam)
- Bangladesh (Chittagong Hill Tracts)

**Key characteristics:**
- **Flexible word order**: OSV (most common), SOV (requires agentive markers), and other patterns.
- **Ergative-Absolutive alignment**: Subjects of transitive verbs take the marker `in` (ergative), while objects and subjects of intransitive verbs take no marker (absolutive).
- **Verb Stem Alternation**: Like many Kuki-Chin languages, most verbs have two forms (Stem I / Form I and Stem II / Form II) used depending on the grammatical context (e.g., indicative vs subjunctive/negative).
- Agglutinative morphology (prefixes, suffixes, particles).
- Tonal language (3 contrastive tones with tone sandhi, though tones are rarely written in standard orthography).
- **Vowel Length Distinction**: Standard Zomi/Tedim orthography (promoted by ZCLS, ZOLLS, and ZOLUS) distinguishes between short and long vowels (e.g., `a` vs `aa`, `e` vs `ee`, `i` vs `ii`, `o` vs `oo`, `u` vs `uu`). This distinction can change the meaning of a word.

**Standardization Bodies:**
Orthography and grammar standardization for Zolai are strictly guided by the **Zokam Standard Version (ZVS v9)**. This project adopts ZVS v9 as the normative mandate.

**MANDATORY: Strict Tedim Zolai**
This project is exclusively for the **Tedim** language. All non-Tedim (Hakha, Falam, Mizo, etc.) vocabulary, grammar, and orthography are **STRICTLY FORBIDDEN** in generation. 

---

## 1.5 Register-Aware Generation

Zolai usage varies significantly based on the social context. The AI must be capable of switching between these registers while maintaining ZVS v9 core rules.

| Register | Key Features | Context |
| :--- | :--- | :--- |
| **Formal (Biblical)** | Explicit agentive markers (`in`), full pronouns, archaic/honorific terms. | Sermons, Scripture, Official speeches. |
| **Standard (News/Edu)** | Balanced grammar, modern vocabulary, compound joining strictly enforced. | News articles, Textbooks, Professional mail. |
| **Colloquial (Chat)** | Dropped subject pronouns (when agreement markers make them clear), frequent contractions (`na'ng`, `k'ong`). | Daily conversation, SMS, Social media. |

**Rule for Formal Register:** transative subjects MUST use the `in` marker (e.g., `Amah in laibu sim hi`).
**Rule for Colloquial Register:** preference for contractions (e.g., use `na'ng` instead of `nading`).

---

## 2. Core Understanding Rules

### 2.1 Read Like a Native Speaker

Before processing any Zolai text, understand these fundamentals:

**Word Order: OSV is MOST Common (not SOV!)**

Zolai does NOT have a rigid word order. The most natural and common pattern is **OSV** (Object-Subject-Verb):

```
OSV (Object-Subject-Verb) — MOST COMMON and MOST NATURAL:
  Laibu ka sim hi. (or Lai ka sim hi.)
  (Book I read am.)
  = I read a book.

SOV (Subject-Object-Verb) — Correct ONLY with explicit agent marker "in":
  Ka pa in laibu sim hi.
  (My father book read am.)
  = My father reads a book.
  
  Kei in laibu ka sim hi.
  = I read a book.
  
  Ken laibu ka sim hi.
  = I read a book. (Ken = Kei in)

  **INCORRECT:** Ka laibu sim hi. (This implies "My book reads")

Subject + Verb only (no object):
  Ka sim hi.
  (I read am.)
  = I read.

I = ka, kei, ken, keimah (all valid)
book = laibu, lai
read = sim
```

**Real Bible examples (31,053 verses analyzed):**

```
OSV pattern (most common):
  "Leitung in lim leh meel nei loin a awngthawlpi ahi hi."
  (Earth form and void without was it is.)
  = The earth was without form and void.

  "Khuavak Pasian in a piangsak hi."
  (Light God created is.)
  = God created light.

With explicit subject marker "in":
  "A kipat cil-in Pasian in vantung leh leitung a piangsak hi."
  (Beginning-at God in sky and earth a created is.)
  = In the beginning God created the heaven and the earth.

Simple subject + verb:
  "Ka pai hi." = I go.
  "Ka sim hi." = I read.
  "Hong pai hi." = He/she comes.
```

**Particles matter:** Sentence-ending particles indicate tense, mood, and politeness
- `hi` = present statement
- `ta` = past/completed
- `ding` = future
- `hiam?` = question
- `in/un` = command

**Context is everything:** Many words have multiple meanings based on context
- `hi` = this / is (copula)
- `a` = his/her / the (prefix)
- `ki` = reciprocal/passive prefix

### 2.2 Think in Zolai Logic

When analyzing or correcting text:

1. **Identify the core sentence structure** (flexible: OSV most common, SOV also correct)
2. **Check particle usage** (tense, mood, questions)
3. **Verify possession markers** (Ka/Na/A/I/Amau)
4. **Look for compound words** that should be joined
5. **Check apostrophe contractions** for correctness
6. **Don't "fix" valid word order variations** — OSV is most natural, SOV is also correct

### 2.3 Word Order Flexibility — DO NOT "Correct"

**Common valid patterns found in Bible corpus (31,053 verses):**

| Pattern | Example | Frequency |
|---------|---------|-----------|
| OSV | `Laibu ka sim hi` (or `Lai ka sim hi`) | **MOST COMMON / NATURAL** |
| SOV | `Ka pa in laibu sim hi` / `Ken laibu ka sim hi` | Common with agent marker `in` |
| S+V only | `Ka sim hi` / `Ken laibu sim` | Very common |
| Topic-comment | `Khuavak, Pasian in a piangsak hi` | Common for emphasis |
| With "in" marker | `Pasian in khuavak a piangsak hi` | Common |

**CRITICAL**: `Ka laibu sim hi` is **INCORRECT** and not acceptable. "Ka" directly before "laibu" acts as a possessive marker ("My book").
To say "I read a book", you must use OSV (`Laibu ka sim hi`) OR use an agentive subject (`Kei in laibu ka sim hi` or `Ken laibu ka sim hi` or `Ken laibu sim`).

---

## 3. Complete Pronoun System

### 3.1 Personal Pronouns (All Forms)

Based on analysis of 31,053 Bible parallel verses, Tongdot Dictionary (21,847 entries), and Tongsan news corpus.

#### First Person Singular (I/me/my)

| English | Zolai (Tedim) | Usage | Frequency | Forms |
|---------|---------------|-------|-----------|-------|
| I (subject) | **ka** | Most common, prefix form | 6,090x | ka, kei, ken, keimah |
| I (standalone) | **kei** | Standalone subject | 2,022x | kei, keimah |
| I (emphatic) | **ken** | Agentive subject | 25x | ken |
| I (emphatic) | **keimah** | Emphatic/reflexive | 765x | keimah |
| me (object) | **kei** | Object of verb | 3,135x | kei, keimah, ka |
| my (possessive) | **ka** | Prefix before noun | 6,786x | ka, keima |
| my (emphatic) | **keima** | Emphatic possessive | 495x | keima, keimah |
| myself | **keimah** | Reflexive | — | keimah, kei mah |

**Examples from Bible:**
```
Ka = I (prefix, most common):
  "Ka pai hi." = I go.
  "Ka sim hi." = I read.
  "Laibu ka sim hi." = I read a book. (OSV - correct)
  **INCORRECT**: "Ka laibu sim hi."

Kei = I/me (standalone):
  "Kei Zomi ka hi hi." = I am Zomi.
  "Kei hong paipih in." = Send me.
  "Kei ading hi." = It's for me.

Ken = I (agentive/emphatic subject):
  "Ken ka bawl hi." = I did it.

Keimah = I/myself (emphatic):
  "Keimah in ka bawl hi." = I myself did it.
  "Keimah tawh pai ni." = Let's go together (with me).
  "Keimah mahmah." = Myself.
```

#### Second Person (you/your)

| English | Zolai (Tedim) | Usage | Frequency | Forms |
|---------|---------------|-------|-----------|-------|
| you (singular) | **nang** | Most common | — | nang, nangma |
| you (emphatic) | **nangma** / **nangin** | Emphatic form | 1,091x | nangma, nangin |
| you (plural) | **note** | Plural/respectful | 2,759x | note, kote, nangte |
| you (plural alt) | **kote** | Alternative plural | 959x | kote |
| your (singular) | **na** | Prefix before noun | — | na, nangma |
| your (plural) | **note** | Plural possessive | 1,347x | note, kote |
| yourself | **nangmah** | Reflexive | — | nangmah, nang |

**Examples from Bible:**
```
Nang = you (singular):
  "Na pai hiam?" = Do you go?
  "Laibu na sim hi." = You read a book.
  "Nang hong ngai hi." = I wait for you.

Nangma = you (emphatic):
  "Nangma in na thei hi." = You yourself know it.
  "Nangma ading hi." = It's for you.

Note = you (plural/respectful):
  "Note pai un." = You all go.
  "Note hong kizahtakna." = Your fear (plural).
```

#### Third Person Singular (he/she/it/his/her)

| English | Zolai (Tedim) | Usage | Frequency | Forms |
|---------|---------------|-------|-----------|-------|
| he | **amah** | Most common | 3,340x | amah, a |
| he (prefix) | **a** | Before verb/noun | 12,796x | a |
| she | **amah** | Same as he (no gender distinction) | 399x | amah, a |
| she (context) | **amah (numei)** | Specifying female | — | amah numei |
| it | **amah** | Same as he/she | — | amah, tua, a |
| him | **amah** | Object form | — | amah, a |
| her | **amah** | Object form | 489x | amah, a |
| his | **a** | Prefix before noun | 2,997x | a, ama, amah |
| his (emphatic) | **ama** | Possessive form | 3,172x | ama, amah |
| her (possessive) | **a** | Prefix before noun | 296x | a, ama |
| its | **a** | Prefix before noun | — | a, ama |

**Examples from Bible:**
```
Amah = he/she/him/her (standalone):
  "Amah in a gen hi." = He/she said it.
  "Amah hong pai hi." = He/she comes.
  "Amah ka mu hi." = I see him/her.

A = his/her/its (prefix, most common):
  "A pa." = His/her father.
  "A inn." = His/her house.
  "A laibu." = His/her book.
  "A bawlsate." = His/her creations.

Ama = his/her (possessive form):
  "Ama inn." = His/her house.
  "Ama tapate." = His/her sons.
```

**Important**: Zolai does NOT distinguish gender in third person pronouns. `Amah` can mean he, she, or it depending on context. To specify gender, add `pasal` (male) or `numei` (female):
- `Amah (pasal)` = he
- `Amah (numei)` = she

#### First Person Plural (we/our/us)

| English | Zolai (Tedim) | Usage | Frequency | Forms |
|---------|---------------|-------|-----------|-------|
| we | **eite** | Most common standalone | 890x | eite, ei, i |
| we (inclusive) | **i** | Inclusive (includes listener) | 1,060x | i |
| we (exclusive) | **ei** | Exclusive (excludes listener) | — | ei, eite |
| we (alt) | **ko** | Alternative form | — | ko, komau |
| us | **eite** | Object form | 858x | eite, ei, i |
| our | **i** | Prefix before noun | 754x | i, eite |
| our (emphatic) | **eite** | Emphatic possessive | 318x | eite |
| ourselves | **eimahmah** | Reflexive | — | eimahmah, eite |

**Examples from Bible:**
```
Eite = we/us:
  "Eite i pai hi." = We go.
  "Eite ading hi." = It's for us.
  "Eite hong mang hen." = Let's lead us.

I = we/our (inclusive, prefix):
  "I pa." = Our father.
  "I gam." = Our country.
  "I thupha." = Our blessing.
  "I pai hi." = We go.
```

#### Third Person Plural (they/their/them)

| English | Zolai (Tedim) | Usage | Frequency | Forms |
|---------|---------------|-------|-----------|-------|
| they | **amaute** | Most common | 4,027x | amaute, amau |
| they (alt) | **amau** | Shorter form | 2,159x | amau |
| them | **amaute** | Object form | 3,499x | amaute, amau |
| their | **amau** | Prefix before noun | 1,778x | amau, amaute |
| their (alt) | **amaute** | Possessive form | — | amaute |
| themselves | **amau** | Reflexive | — | amau, amaute |

**Examples from Bible:**
```
Amaute = they/them:
  "Amaute pai uh hi." = They go.
  "Amaute ka mu hi." = I see them.
  "Amaute ading hi." = It's for them.

Amau = their (prefix):
  "Amau inn." = Their house.
  "Amau pa." = Their father.
  "Amau gam." = Their country.
```

### 3.2 Pronoun Summary Table

| Person | Subject | Object | Possessive (prefix) | Possessive (standalone) | Emphatic |
|--------|---------|--------|---------------------|------------------------|----------|
| I | ka, kei | kei, keimah | ka | keima | keimah |
| you (sg) | nang | nang | na | nangma | nangma |
| he/she/it | amah, a | amah | a | ama | amah |
| we | eite, i | eite, i | i | eite | eimahmah |
| you (pl) | note, kote | note | note | note | note |
| they | amaute, amau | amaute | amau | amau | amaute |

### 3.3 Pronoun Usage Patterns

**Prefix vs Standalone:**
```
Prefix (before noun/verb):
  Ka pa = My father
  Na inn = Your house
  A laibu = His/her book
  I gam = Our country
  Amau mite = Their people

Standalone (subject/object):
  Kei ka pai hi = I go
  Nang hong ngai hi = I wait for you
  Amah in a gen hi = He/she said it
  Eite i pai hi = We go
  Amaute pai uh hi = They go
```

**With verb "in" marker (agent marker):**
```
Kei in ka bawl hi = I did it (emphatic)
Nang in na gen hi = You said it (emphatic)
Amah in a gen hi = He/she said it
Eite in i bawl hi = We did it (emphatic)
Amaute in amau bawl uh hi = They did it
```

---

## 4. Orthography & Standardization Rules

### 4.1 Compound Word Joining

**Always join these compounds:**
```
pa sian → pasien
ta pa → tapa
ta nu → tanu (NOT tani — see correction below)
mi hing → mihing
na u pang → naupang
siang tho → siangtho
thu piak → thupiak
lung dam → lungdam
thu pha → thupha
it na → itna
pil na → pilna
lei tung → leitung
van gam → vangam
```

**Suffix joining rules:**
```
word + na ding → wordnading
word + na dingin → wordnadingin
word + na dingun → wordnadingun
hin + na dingun → hinnadingun
```

### 4.2 Prefix Compounds

**"A" + preposition (join):**
```
a tung → atung (on it)
a nuai → anuai (under it)
a mai → amai (before it)
a gei → agei (at it)
a sung → asung (inside it)
a lam → alam (its direction)
```

**"Ki" + verb (join):**
```
ki pawl → kipawl (gather)
ki tuak → kituak (meet)
ki kit → kikit (return)
ki khop → kikhop (help each other)
ki gawm → kigawm (join)
ki sim → kisim (read together)
ki thei → kithei (know each other)
```

### 4.3 Apostrophe Contractions

**Apply these contractions:**
```
ka ong → k'ong (my - emphatic)
na ong → n'ong (your - emphatic)
ka hong → k'hong (my - emphatic)
na hong → n'hong (your - emphatic)
ka eek → k'eek (my)
na eek → n'eek (your)
bang a → ba'a (what?)
bang ha → ba'ha (why?)
nung a → nu'a (after)
sung ah → su'ah (inside)
ding a → di'a (for)
```

### 4.4 Particle Fixes

```
uhhi → uh hi
ahihi → ahi hi
na sep → nasep
ci'n gen → ci-in gen
u hi → uh hi (common typo)
le hang → lehang
```

### 4.5 Common Typo Corrections

```
pasia → pasien
tope → topa
jes → jesu
holh → hoih
tani → tanu (daughter — see correction below)
```

---

## 5. Essential Vocabulary (Must Know Before Training)

### 5.1 Core Words (150 Most Frequent from Bible + Dictionary)

These words appear in nearly every Zolai text. Know them cold:

| Zolai | English | Frequency | Notes |
|-------|---------|-----------|-------|
| Pasian | God | 22,307x | Canonical form |
| Topa | Lord | 31,609x | Very frequent |
| Jesu/Zeisu | Jesus | 1,691x | Zeisu in older Bible |
| hi | is/this | — | Copula + demonstrative |
| a | his/her/the | — | Possessive prefix |
| ka | my/I | 6,090x | First person |
| na | your | — | Second person |
| i | our/we | 1,060x | First person plural |
| amau | their | 2,159x | Third person plural possessive |
| om | be/exist | — | Existential verb |
| pai | go | 3,303x | Movement verb |
| hong | come | 12,678x | Movement verb |
| bawl | make/do | 1,724x | Action verb |
| nei | have | 1,847x | Possession verb |
| gen | say/speak | 2,451x | Communication |
| sim | read | — | Education verb |
| gelh | write | — | Education verb |
| sin | learn | — | Education verb |
| hilh | teach | 594x | Education verb |
| mu/muh | see | 604x | Perception verb |
| thei | know/can | 2,907x | Knowledge/ability |
| tel | understand | — | Knowledge |
| zang | use | — | Action verb |
| duh | want | — | Desire verb |
| pia | give | 2,499x | Action verb |
| ngah | receive | 1,323x | Action verb |
| ne | eat | — | Action verb |
| dawn | drink | — | Action verb |
| sem | work | 547x | Action verb |
| it | love | — | Emotion verb |
| tui | water | 747x | Essential noun |
| mei | fire | — | Essential noun |
| lei | earth/ground | 540x | Essential noun |
| van | sky/heaven | — | Essential noun |
| ni | sun/day | — | Time/nature |
| kha | moon/month | 1,350x | Time/nature |
| zan | night | — | Time word |
| zing | morning | — | Time word |
| nitak | evening | — | Time word |
| kum | year | 961x | Time word |
| tuni | today | — | Time word |
| tomni | tomorrow | — | Time word |
| zani | yesterday | — | Time word |
| inn | house | 1,487x | Place |
| khua | village | 1,607x | Place |
| khuapi | city | 1,317x | Place |
| gam | country/land | 2,743x | Place |
| lam | road/direction | — | Place |
| mun | place/location | 993x | Place |
| pa | father | — | Family |
| nu | mother | — | Family |
| tapa | son | 2,291x | Family |
| **tanu** | **daughter** | — | **CORRECTED from tani** |
| naupang | child | — | People |
| mihing | human | — | People |
| mi | person | — | People |
| mite | people | 6,592x | mi + te (plural) |
| nupi | woman/wife | — | People |
| pasal | man/husband | — | People |
| lawm | friend | — | People |
| innkuan | family | — | Family |
| itna | love | — | Emotion noun |
| hehpihna | mercy | — | Religion |
| upna | faith | — | Religion |
| thupha | blessing | 641x | Religion |
| mawhna | sin | 790x | Religion |
| gupna | salvation | — | Religion |
| siangtho | holy | 1,078x | Religion |
| biakna | worship | 1,641x | Religion |
| biakinn | temple/church | — | Place |
| pawlpi | church | — | Religion |
| lungdam | thanks/happy | — | Emotion |
| hoih | good | 730x | Quality |
| sia | bad | — | Quality |
| lian | big | — | Size |
| neu | small | — | Size |
| thak | new | — | Time |
| hat | strong | — | Quality |
| pha | beautiful | 656x | Quality |
| nop | happy | — | Emotion |
| lua | very | — | Intensifier |
| mahmah | very much | 740x | Intensifier |
| zaw | more | — | Comparative |
| tua | that | — | Demonstrative |
| te | plural marker | — | Grammar |
| teng | all/every | 681x | Grammar |
| pawl | group plural | — | Grammar |
| leh | and | — | Conjunction |
| hangin | because | — | Conjunction |
| ciangin | when/if | — | Conjunction |
| khat | one | — | Number |
| nih | two | — | Number |
| thum | three | — | Number |
| sawm | ten | — | Number |
| thu | word/message | 5,875x | Very common |
| lai | letter/writing | 3,246x | Common |
| min | name | 1,121x | Common |
| hun | time/season | 992x | Common |
| lungsim | mind/heart | 1,145x | Common |
| khut | hand | 1,264x | Body |
| kei | I/me | 2,022x | Pronoun |
| nang | you | — | Pronoun |
| keimah | I/myself | 884x | Pronoun |
| nangma | you/yourself | 1,091x | Pronoun |
| amah | he/she/him/her | 3,340x | Pronoun |
| eite | we/us | 890x | Pronoun |
| note | you (plural) | 2,759x | Pronoun |
| amaute | they/them | 4,027x | Pronoun |
| bangin | how/like what | 4,029x | Question word |
| loin | without/not | 1,567x | Negation |
| takin | truly/really | 1,537x | Adverb |
| nading | for the purpose of | 1,697x | Suffix |
| nadingin | for (plural) | 1,619x | Suffix |
| nadingun | for (future) | 620x | Suffix |
| adingin | for him/her | 1,220x | Suffix |
| khin | already/completed | 1,163x | Particle |
| kik | back/again | 910x | Adverb |
| lakah | among/in | 1,002x | Postposition |
| sunga | inside/in | 720x | Postposition |
| lak | from/among | 718x | Postposition |
| khia | out/from | 550x | Postposition |
| nawn | again/anymore | 760x | Adverb |
| tawntung | eternal/forever | 704x | Time |
| tun | now | 690x | Time |
| tampi | many/much | 678x | Quantity |
| paipih | send/bring | 677x | Verb |
| tapate | sons/children | 659x | Family |
| minam | nation/people | 627x | Society |
| kiang | near/to | 624x | Postposition |
| man | truth/catch | 623x | Noun/Verb |
| thuman | truth | 550x | Religion |
| thuciamna | covenant | 556x | Religion |
| zui | follow | 633x | Verb |
| mipa | man/male | 556x | People |
| numei | woman/female | 841x | People |
| puan | cloth/garment | 568x | Item |
| kibang | same/equal | 563x | Adjective |
| leitung | world/earth | 777x | Place |
| nong | your (emphatic) | 838x | Pronoun |
| thuak | experience/suffer | 821x | Verb |
| zeisu | Jesus (older form) | 1,691x | Religion |
| judah | Judah | 1,222x | Proper noun |
| david | David | 1,099x | Proper noun |
| moses | Moses | 869x | Proper noun |
| jerusalem | Jerusalem | 907x | Proper noun |
| izipt | Egypt | 681x | Proper noun |
| kote | your (plural) | 959x | Pronoun |
| nate | your (plural, alt) | 556x | Pronoun |
| kuamah | anyone/nobody | 604x | Pronoun |
| piak | give (variant) | 846x | Verb |
| sak | make/build | 1,342x | Verb |
| suak | come out/emerge | 718x | Verb |
| koih | put/place | 738x | Verb |
| zui | follow | 633x | Verb |
| sawl | send | 539x | Verb |
| mang | see/look | 531x | Verb |
| nai | near/close | 527x | Adjective |
| gamta | live/dwell | 526x | Verb |
| leitang | land/earth | 537x | Place |
| lamah | toward/to | 574x | Postposition |
| israelte | Israelites | 574x | People |
| khazih | seven (variant) | 659x | Number |
| kham | command/law | 662x | Religion |
| ngei | ever/already | 641x | Particle |
| loin | without | 1,567x | Negation |
| ahih | it is/that is | 6,155x | Copula |

### 5.2 CORRECTION: Daughter = Tanu (NOT Tani)

**Important correction based on Bible corpus analysis:**

The correct Zolai word for "daughter" is **tanu**, NOT tani.

Evidence from 31,053 parallel Bible verses:
- **tanu**: 3,455 occurrences — consistently paired with "tapa" (son) as "tapa leh tanu" = "sons and daughters"
- **tani**: 703 occurrences — appears in some manuscripts but tanu is the dominant, correct form

Bible examples:
```
"Seth a suah khit ciangin Seth kum zagiat leh kum sagih nungta a, tapa leh tanu dang nei lai hi."
= "And Seth lived after he begat Enos eight hundred and seven years, and begat sons and daughters."

"Pasian' tapate in mite' tanute hoih hi, ci-in mu uh hi"
= "That the sons of God saw the daughters of men that they were fair"

"Laban in tanu nih nei hi"
= "And Laban had two daughters"
```

**Always use `tanu` for daughter. Update any instances of `tani` to `tanu`.**

### 5.3 Numbers (1-100)

| Zolai | English |
|-------|---------|
| Khat | 1 |
| Nih | 2 |
| Thum | 3 |
| Li | 4 |
| Nga | 5 |
| Guk | 6 |
| Sagih | 7 |
| Giat | 8 |
| Kua | 9 |
| Sawm | 10 |
| Sawm khat | 11 |
| Sawm nih | 12 |
| Nih sawm | 20 |
| Thum sawm | 30 |
| Zabi | 100 |
| Ngen | 1000 |

### 5.4 Common Phrases

| Zolai | English | Usage |
|-------|---------|-------|
| Na dam hiam? | How are you? | Greeting |
| Ka dam hi | I am fine | Response |
| Lungdam | Thank you | Thanks |
| Hong p'aw | Welcome | Welcome |
| Hoih mahmah | Very good | Compliment |
| Bang hiam? | What is it? | Question |
| Koi hiam? | Where? | Question |
| Bang hang hiam? | Why? | Question |
| Tua hi | That's it | Agreement |
| Ahih kei leh | If not | Conditional |

### 5.5 Nature, Animals, & Anatomy (from Zolai Simbu Lessons)

Extracted from official educational materials (Zolai Simbu Tan Lang to Tan Li):

| Zolai | English | Example Context |
|-------|---------|-----------------|
| mai gah | pumpkin/gourd | Found in elementary readers |
| hakai | crab | Found in elementary readers |
| akno | chick/young chicken | "Akno a khe a bai hi" (The chick limps) |
| ngapi | fish paste | "Ngapi thau ne in" |
| gua | bamboo | "Khua gei ah gua a po hi" (Bamboo grows near village) |
| bualtui | pond/pool | "Bualtui gei khatah a mawl uh hi" |
| uiphuk | frog/toad | "Uiphuk tampi a om hi" (There are many frogs) |
| sumkuang | tortoise/turtle | "Sumkuang le bilpi" (Tortoise and rabbit) |
| bilpi | rabbit | "Bilpi tai a hat mahmah hi" |
| kauphe | butterfly/moth | "Kauphe le miksi tangthu" |
| miksi | ant | Found in stories |
| lungtang | heart | "Lungtang khat tek i nei hi" (We each have one heart) |
| sam | hair | "Ka nu sam a hiatsak hi" (Combed my mother's hair) |
| gil | stomach/womb | "Ka nu in a gil sungah hong paii hi" |

---

## 6. Grammar Patterns to Recognize

### 6.1 Verb Stem Alternation (Stem I and Stem II)

A unique and critical feature of Zolai (and Kuki-Chin languages) is **Verb Stem Alternation**. Most verbs have two forms, depending on the grammatical context. 

- **Stem I (Form I)** is primarily used in main, independent, affirmative, indicative clauses.
- **Stem II (Form II)** is used in dependent clauses, negative clauses, interrogatives, nominalized forms (verbs turning into nouns), and sometimes to topicalize objects.

**Examples of Stem alternation:**
*(Note: Stem II is often formed by changing the final consonant or tone)*
- `pai` (Stem I: go) → `pai` / `pain` (Stem II)
- `bawl` (Stem I: make) → `bawl` (Stem II)
- `pia` (Stem I: give) → `piak` (Stem II: giving)
- `mu` (Stem I: see) → `muh` (Stem II: seeing)
- `thei` (Stem I: know) → `theih` (Stem II: knowing)

*Example Usage:*
- **Stem I (Indicative):** "Amah in hong **pia** hi." (He gives it to me.)
- **Stem II (Nominalized/Subjunctive):** "Amah hong **piak** laibu." (The book he gave me.)

### 6.2 Ergative-Absolutive Alignment (`in` marker)

Zolai relies heavily on the **agentive marker `in`** for subjects of transitive verbs (verbs taking an object).
- If a subject performs an action on an object, the subject MUST be marked with `in` if you use an SOV pattern.
- E.g., `Pasian in leitung a piangsak hi.` (God-agentive earth he-created is).
- Pronouns contract with `in`: `Kei` + `in` = `Ken`. `Amah` + `in` = `Aman`.

### 6.3 Word Order Patterns (Flexible!)

Zolai supports multiple word orders. The choice depends on **emphasis, style, and context** — not rigid grammar rules.

**OSV (Object-Subject-Verb) — MOST COMMON and MOST NATURAL:**
```
Laibu ka sim hi. (or Lai ka sim hi.)
(Book I read am.)
= I read a book.

Khuavak Pasian in a piangsak hi.
(Light God created is.)
= God created light.

An ka ne hi.
(Food I eat am.)
= I eat food.
```

**SOV (Subject-Object-Verb) — Requires explicit agentive marker ("in"):**
```
Ka pa in laibu sim hi.
(My father book read is.)
= My father reads a book.

Kei in laibu ka sim hi.
(I book I read am.)
= I read a book.

Pasian in khuavak a piangsak hi.
(God light created is.)
= God created light.

**CRITICAL RULE:**
"Ka laibu sim hi" is INCORRECT. "Ka" before "laibu" means "My book".
```

**Subject + Verb only (no object):**
```
Ka sim hi.
(I read am.)
= I read.

Ka pai hi.
(I go am.)
= I go.

Hong pai hi.
(Comes is.)
= He/she comes.
```

**Topic-Comment (for emphasis):**
```
Khuavak, Pasian in a piangsak hi.
(Light, God created it.)
= As for light, God created it.
```

**Key insight from Bible corpus (31,053 verses):**
- OSV patterns appear most frequently in natural speech
- SOV patterns are common with explicit subjects using "in" marker
- Both patterns convey the same meaning with different emphasis
- Subject + Verb only is very common when context is clear

### 6.4 Tense Markers

| Tense | Marker | Example | Translation |
|-------|--------|---------|-------------|
| Present | hi | Ka pai hi | I go |
| Past | ta | Ka pai ta | I went |
| Future | ding | Ka pai ding | I will go |
| Perfect | ngei | Ka pai ngei | I have gone |
| Continuous | laitak | Ka pai laitak | I am going |

### 6.5 Question Formation

```
Statement: Na pai hi. (You go.)
Question:  Na pai hiam? (Do you go?)

Statement: Tua hoih hi. (That is good.)
Question:  Tua hoih hiam? (Is that good?)
```

### 6.6 Possession Patterns

```
Ka + noun = my + noun
  Ka pa = My father
  Ka inn = My house
  Ka laibu = My book

Na + noun = your + noun
  Na pa = Your father
  Na inn = Your house

A + noun = his/her + noun
  A pa = His/her father
  A inn = His/her house

I + noun = our + noun
  I pa = Our father

Amau + noun = their + noun
  Amau pa = Their father
```

### 6.7 Plural Formation

```
mi + te = mite (people)
mi + teng = mi teng (all people)
mi + pawl = mi pawl (group of people)
Zomi + note = Zomi note (Zo people - respectful)
```

### 6.8 Noun Formation from Verbs

```
Verb (Stem II) + na = Noun
  pai + na = paina (going)
  it + na = itna (love)
  sem (Stem II: sep) + na = sepna (work/job)
  gen + na = genna (saying)
  gelh + na = gelhna (writing)
  sim + na = simna (reading)
  sin + na = sinna (learning)
  bawl + na = bawlna (making)
```

### 6.9 Comparative & Superlative

```
Comparative: adjective + zaw
  lian zaw = bigger
  hoih zaw = better

Superlative: adjective + pen
  lian pen = biggest
  hoih pen = best

Very: adjective + lua/mahmah
  lian lua = very big
  hoih mahmah = very good
```

---

## 7. Text Cleaning & Refinement Guidelines

### 7.1 When to Clean/Correct Text

Apply corrections when you find:

1. **Split compound words** that should be joined
   - `pa sian` → `pasian`
   - `lung dam` → `lungdam`

2. **Incorrect particle spacing**
   - `uhhi` → `uh hi`
   - `ahihi` → `ahi hi`

3. **Missing apostrophe contractions**
   - `bang a` → `ba'a`
   - `sung ah` → `su'ah`

4. **Common typos**
   - `pasia` → `pasian`
   - `tope` → `topa`
   - `jes` → `jesu`
   - `tani` → `tanu` (daughter)

5. **Inconsistent spelling**
   - Standardize to canonical forms from this guide

### 7.2 When NOT to "Correct"

Do NOT change:

1. **Word order variations** — OSV is most natural (`Laibu ka sim hi`), SOV is only correct with an agentive marker `in` (`Kei in laibu ka sim hi` or `Ken laibu ka sim hi`).
2. **Dialectal variations** between Tedim, Haka, Laizo/Falam, Matu
3. **Intentional stylistic choices** in literature/poetry
4. **Proper nouns** (names, places)
5. **Quoted speech** that preserves original form
6. **Historical texts** where original spelling should be preserved
7. **Zeisu vs Jesu** — both are valid (Zeisu is older Bible form, Jesu is modern)

### 7.3 Quality Assessment Criteria

Rate text quality based on:

- **High**: Correct grammar, proper compounds, standard orthography
- **Medium**: Minor issues (spacing, typos) but understandable
- **Low**: Major grammar issues, non-standard spelling, hard to understand

---

## 8. Dialect Awareness

### 8.1 Major Dialects

| Dialect | Region | Notes |
|---------|--------|-------|
| Tedim/Zolai | Tedim area, Myanmar | Primary Zolai standard |
| Haka/Hakha | Hakha, Chin State | One dialect — NOT official |
| Laizo/Falam | Falam area | Related dialect |
| Matu | Matu area | Related dialect |

**CRITICAL**: There is **no official Chin dialect**. The Chin languages comprise many distinct dialects without a single standardized common language. Haka is NOT the official dialect — it is simply one of many. Each dialect has equal legitimacy.

### 8.2 Key Differences

Some words differ between dialects:
```
Tedim: Jesu     → Haka: Jesuh
Tedim: Zeisu    → (older Bible form)
Tedim: Topa     → Haka: Topa (same)
Tedim: Pasian   → Haka: Pasian (same)
Tedim: tanu     → Haka: tanu (same)

Pronouns by dialect:
I:     Tedim=ka/kei/keimah  Haka=keimah  Laizo=keimah/kei/ka  Matu=kai
You:   Tedim=nang/nangma    Haka=nangmah Laizo=nang/nangmah   Matu=nang
He:    Tedim=amah/a         Haka=amah    Laizo=amah           Matu=a nih
We:    Tedim=eite/i         Haka=kanmah  Laizo=kanmah         Matu=kaimih
They:  Tedim=amaute/amau    Haka=anmah   Laizo=anmah          Matu=a mih
```

When processing text, identify the dialect and apply appropriate standards.

---

## 9. Processing Pipeline

### 9.1 Step-by-Step Text Processing

1. **Normalize Unicode** (NFKC)
2. **Normalize quotes/apostrophes**
3. **Apply compound word joining**
4. **Apply prefix compounds**
5. **Fix particle spacing**
6. **Apply apostrophe contractions**
7. **Fix common typos** (including tani → tanu)
8. **Clean punctuation spacing**
9. **Normalize whitespace**

### 9.2 Code Implementation

Use the standardizer function:
```python
from src.zolai.v9.standardizer import standardize_zolai

cleaned = standardize_zolai(raw_text)
```

---

## 10. Training Data Preparation

### 10.1 What Makes Good Training Data

- **Correct orthography** (follow standardization rules)
- **Natural sentence structure** (flexible word order — OSV most common, SOV also correct)
- **Appropriate particle usage** (tense, mood)
- **Context-appropriate vocabulary**
- **Consistent dialect** within each sample

### 10.2 Data Sources

- `data/zolai_core_vocabulary.json` — 21,847 vocabulary entries
- `data/zolai_complete_vocabulary.json` — 12,521 Tedim words
- `data/bible_zolai_top_words.json` — Top 500 words from 31,053 Bible verses
- `data/tongsan_zolai_words.json` — Vocabulary from Tongsan news
- `data/zolai_bible_dataset/` — Bible texts (121,646 Zolai sentences, 31,053 parallel pairs)
- `references/zolai-sinna-markitdown.md` — Lesson book
- `references/4_zolai_gelhmaan_bu_1_zolai_ggammar_vol.md` — Grammar volume

### 10.3 Quality Checklist

Before adding data to training set:

- [ ] Unicode normalized (NFKC)
- [ ] Compound words joined
- [ ] Particle spacing correct
- [ ] Apostrophe contractions applied
- [ ] Common typos fixed (including tani → tanu)
- [ ] No blacklist content
- [ ] Valid UTF-8 encoding
- [ ] No truncated fragments
- [ ] Word order preserved (don't "fix" valid OSV/SOV variations)

---

## 11. Common Mistakes to Avoid

1. **Don't split joined compounds** — `pasian` is correct, not `pa sian`
2. **Don't add spaces before particles** — `uh hi` not `uhhi`
3. **Don't confuse G/NG** — `gam` (country) vs `ngam` (dare)
4. **Don't mix dialects** — Keep Tedim/Haka/Laizo separate
5. **Don't over-correct** — Preserve intentional variations
6. **Don't ignore context** — `hi` can be "this" or "is"
7. **Don't forget tone marks** — They change meaning
8. **Don't use "Ka laibu sim hi"** — It means "My book reads". Use `Laibu ka sim hi` or `Kei in/Ken laibu ka sim hi`.
9. **Don't use tani for daughter** — Use `tanu`
10. **Don't claim Haka is official** — No Chin dialect has official status
11. **Don't assume SOV is primary without markers** — Without the `in` marker, OSV is the only correct and natural way to order object and verb (e.g., `Laibu ka sim hi`).
12. **Don't confuse pronoun forms** — `ka` (prefix) vs `kei` (standalone) vs `keimah` (emphatic)

---


## 11.5 Quality Assurance & Back-Translation Workflow

When generating Zolai translations, you must follow a self-correction workflow to ensure the output does not suffer from common English-to-Zolai hallucinations (like SVO literal mappings):

1. **Draft Initial Translation**: Generate the Zolai translation applying the Ergative alignment and Stem rules.
2. **Back-Translate**: Mentally (or explicitly) translate the Zolai sentence back to English exactly as written.
3. **Verify Meaning & Syntax**:
   - Does the back-translation match the original intent?
   - Did you accidentally write `Kei + [object] + [verb] hi`? (If yes, SVO hallucination detected).
4. **Self-Correct**: If the syntax is literal SVO, fix it by either:
   - Converting to OSV: `[Object] ka [verb] hi`.
   - Adding Ergativity: `Ken [Object] [verb] hi`.

## 12. Quick Reference Card

### Essential Pronouns
```
I:     ka (prefix), kei (standalone), ken (agentive), keimah (emphatic)
You:   nang (sg), nangma (emphatic), note/kote (pl)
He/She/It: amah (standalone), a (prefix)
We:    eite/i (standalone), i (prefix)
They:  amaute/amau (standalone), amau (prefix)
```

### Essential Particles
```
hi = is/present
ta = past
ding = future
hiam? = question?
in = you (singular command) / agent marker
un = you (plural command)
hen = let's
te = plural
teng = all
leh = and
```

### Essential Prefixes
```
Ka- = my
Na- = your
A- = his/her
I- = our
Amau- = their
Ki- = reciprocal/passive
```

### Essential Suffixes
```
-na = noun formation
-te = plural
-teng = all
-zaw = comparative
-pen = superlative
-lua = very
```

### Key Corrections
```
tani → tanu (daughter)
pasia → pasien
tope → topa
jes → jesu
holh → hoih
uhhi → uh hi
ahihi → ahi hi
```

---

*This instruction file is built from:*
- *Tongdot Dictionary (21,847 entries across Tedim, Haka, Laizo/Falam, Matu)*
- *Bible parallel corpus (31,053 verse pairs, 121,646 Zolai sentences)*
- *Tongsan news articles (2,104 Zolai articles)*
- *Zolai Grammar Cheat Sheet*
- *Zolai Standard Format (LT Tuang)*
- *Zolai Simbu (Zolai Lessons from Kindergarten to Grade 4)*
- *Zolai Sinna (Lesson Book)*
- *Zolai Gelhmaan Bu (Grammar Volume)*
- *Zomi Christian Literature Society (ZCLS) standards*
- *Standardizer code implementation (v9)*

*Last updated: 2026-04-01*

---
<!-- SOURCE: wiki/Zolai_Standard_Format.md -->

Zolai Standard Format
Minambup Zolai gelhzia a kibatkim theih nading

Pa Lian Than Tuang (LT Tuang)
20 December 2018 (Thursday)


Zolai STANDARD Format

ZON OLNA

Thupatna .......................................................................................................................................... 2
(1) Zolai Standard Format ............................................................................................................. 3
(2) Zolai Vowels ........................................................................................................................... 4
(3) Namdanglaite Zatpihna (Adopted Words) .............................................................................. 5
(4) Laimal Gawmna Le Halna In A Khiatna A Kilamdang Sakna ............................................... 6
(5) Awkaih ii Khel Laimalgawm Pawlkhat .................................................................................. 8
(6) Laimal Gawmzia Le Zat Nading Munte ................................................................................. 9
(7) Khat Bek Le A Tamzaw ........................................................................................................ 12
(8) Genna Le Dotna .................................................................................................................... 13
(9) Sawlna Le Kamkhumna ........................................................................................................ 14
(10) Ahipak Suaksak Kammalte ................................................................................................... 14
(11) A Kilanghsak Kammalte ....................................................................................................... 15
(12) Kammal Lomte ...................................................................................................................... 15
(13) Kammal Tomlaakna .............................................................................................................. 15
(14) “A” le “Ki” ii Laimal Gawm Le Hal ..................................................................................... 16
(15) “G” le “Ng” ........................................................................................................................... 16
(16) Apostrophe ( ’ ) Zatna Mun ................................................................................................... 18
(17) ah, uhhi, ahi hi. ...................................................................................................................... 18
(18) Minpi Le Minneu ................................................................................................................... 20
(19) Laimalgawm Khat, Khiatna Tuamtuam A Neite ................................................................... 21
(20) Khiatna Kibang/Kinai, Kammal Kibanglo Le A Kilehbulhpihte .......................................... 21
(21) Deihna A Gen Kammalte ...................................................................................................... 25
(22) Laimal Zatzia (Grammar) ...................................................................................................... 27
(23) Sepna Lak Le Minna Suahna ................................................................................................. 29
(24) Hihna Tellak Le Minna Suahna ............................................................................................. 30
(25) A hun Lakna .......................................................................................................................... 30
(26) Hi Leh Hoihzaw Ding Hi....................................................................................................... 31
(27) Mailam Ah ............................................................................................................................. 31

1

(LTTUANG)


Zolai STANDARD Format

THUPATNA

Zolai pen Latin phonetic siksanin kibawl ahi hi. Tuhun ciang khangthakte in
English phonetic siksanin lai sinzaw uhhi. Tua ahih manin Latin phonetic siksanin
a kigelh Zolai a sim uh ciang Zopau awsuahin suak nawnlo hi. Tua panin Zopau
awsuah ngah nading English phonetic siksan aa hong kigelh leh Zolai gelhzia pen
khat le khat hong kibanglo semsem kha ding hi.
Tua ahih manin Zolai Standard Format khat kician takin a om zawh ding kisampha
mahmah hi. A om zawhkei zenzen leh, mailam ah Zolai gelhzia hong buaihuai
mahmah ding hi. Banghang hiam cih leh tu bekin zongh, India lam Zomi le
Myanmar lam Zomite ii lai gelhzia kibang zo nawnlokhinta hi. US, UK, Canada,
Australia cih bang dan English a kilim zatna gam aa khangthak Zomite ii lai gelhzia
le Myanmar gam lam aa khangthak Zomite ii lai gelhzia zongh damdamin hong
kidan semsem khak ding hoihlo hi. Tua baanah, English phonetic lah a zanglo, Latin
phonetic zongh a zanglo gam tuamtuam aa tung Zomi khangthakte ii Zolai gelhzia
zongh a tuampi khat hong suak kha thei lai ding hi. Tua ahih manin minambup in
lai gelhziate a luanzia khat a kibatkim theih nadingin Zolai ah zongh Standard
Format kician khat a om ding thupi mahmah hi.
Tua bek thamlo, Zomi khangthakte aa kipan namdangte in Zolai a sin nop uh leh
sinzia olin, sinna a nuam ding, kiciantak aa lak theih, hilh theih dingin Standard
Format khat Zolai in a neih zawh ding kisam mahmah hi.

A zon ol na?

Ol (adj)

Ol mah.

Adj pen a nung ah “na” tawh mat lehang
Noun suak hi.

A olna bang hiam?
Ol na le Olna cihte ii a khiatna kibanglo hi.

2

(LTTUANG)


Zolai STANDARD Format

(1) ZOLAI STANDARD FORMAT

Zolai Standard Format ahi Zolai ii paizia, a thu a la zui-in laimalte gawmzia, halzia,
kimatsak, kihalsak dingte i theih naak leh i gelh nop peuhpeuh a thu zui-in kigelh thei hi. Tua ahih
manin, Zolai pen Zopau kammal khat sim ah bangci malgawm ding cih sin gaih tektek a kul hilo hi.
Zolai Standard Format zui tekin lai gelh hilehang, Zolai pen mikim in a i gelhzia hong
kibang thei ding hi. Mikim ii Zolai gelhzia a kibat theih nadingin Format kician khat kisam ahi hi.
“Zolai Standard Format i cihin bang dan hiam?” cih a nuai ah laigual khat tawh gentehna
kimu thei hi.
(1) Ki pawl na ding in ki pawl na ding ni.
(2) Kipawlna ding in kipawlna ding ni.
(3) Kipawlna dingin kipawlna ding ni.
(4) Kipawl nadingin kipawlna ding ni.
Zolai Standard Format ah hih atung aa laigual liteng pan no.4 na pen a dikpen ahi hi.
Kipawl pen Verb hi aa, Kipawlna pen Noun ahi hi.

"na" zatna mun, "na" zat nading
Noun

Infinitive

Verb pan Noun suahna

Verb pen Geelna, Sawmna, Deihna ah zatna

Verb + “na” = Noun

Verb + Infinitive marker = nading (English ah "to")

Pai + na = Paina

Pai + nading = Pai nading
Gtn.
-

3

Ka paina ah nong pai nading kong zawn hi.

(LTTUANG)


Zolai STANDARD Format

Behlap ding:
Amai aa verb tawh +na I behlap ciang, noun suak hi.
Amai aa verb tawh +na behlapin anung noun suak aa, anung ah proper noun khat in a zuih leh,
noun 2 kizom suak aa, amai aa +na tawh kibawl noun pen adjective suak hi.
Gtn. Itna (Noun) pen, anung ah proper noun khat tawh I gawm ciang, Adj suak hi. Itna Pasian,
Itna Innpi.

Adang khat lai:
Noun ii nung ah Verb/Adj in a zuih leh sentence hi-in sepna lakna hi.
Noun ii nung ah Verb/Adj I mat pen noun suahna hi.
Gtn.
Pasian thu gen mah hi. (thu gen = Pasian thu a gen mah hi. = a thu a genna)
Pasian thugen mah hi. (thugen = Amah pen Pasian thu a gen mi mah hi. = a mi a genna)
Pasian thugen khat Pasian thu genin buai mahmah hi.
Mang (noun) Pha (adj) = mangpha, mangsia, manglamdang*
Thu (noun) Pha (adj) = thupha, thuhoih, thusia, thulamdang*
Khin, Khit cihte amai aa tawh I mat leh, a mai aa kammal a laihna hi.

Adang khat lai:
Ahih lam, ahihloh lam, ahih peuhmahloh lam, ahihloh uh, ahih manin, ahih manun cihte limtak
table tawh lak lai ding.
Tua ciang, tua ciangin, ahih ciang, tua ahih ciangin, tua ahih manin, tua ahih manun, tua ahih lam

(2) ZOLAI VOWELS

Zolai ah “a”, “e”, “i”, “o”, “u” le “aw” cih vowel mal 6 om hi. Zolai ah laimal a tamzaw
thamtham pen hih vowels te pan khat teitei kihel hamtang hi. Hih vowels te tung ah lai malgawm ii
awsuah kinga hi. Vowels te a mun diktak ah i zat theihkei aa leh a awsuah zongh hong kidang pah
lian ding hi.
Gtn. Tan – Ten – Tin – Ton – Tawn – Tun

4

(LTTUANG)


Zolai STANDARD Format

A diakdiakin vowels “o” le “aw” pen kikhial kha baih thei hi. Hih vowels nih i zat khialh leh a
khiatna a tuampi suak hi.
Gtn. Toi – Tawi, Khoi – Khawi, Khom – Khawm, Poi – Pawi

(3) NAMDANGLAITE ZATPIHNA (ADOPTED WORDS)

Zopau ahilo namdangte’ lai i zatpihna ah amau malgawm bang teekteek mahin i gawmpih, i zatpih
ding mah hoih penpen hi. Tua ahih manin, namdangpau khatpeuh i zat ciang a nung a mai ah laimal
behlaploh ding thupi hi. Gtn. Computers te ci-in gelh ding hi ding aa, computerte – computerste cih
bangin gelh huailo hi.
Zolai ah a tam i gen ciang “te” kilim zat aa, a mai aa Zolaimal tawh kimatsakding ahi hi.
Gtn. Noteng le naupangte na omkhawm un.
Ahi zongin tua “te/teng” cih pen namdanglai i gelhna ah i mat khakloh ding hoih hi.

5

(LTTUANG)


Zolai STANDARD Format

(4) LAIMAL GAWMNA LE HALNA IN A KHIATNA A KILAMDANG SAKNA

Te/Teng, Lua, Lo, Kei, Zaw, Sem, Pen, Ciang, Khawm
Plural Noun
Te/Teng (Adj/v) pen tang khat bekin i gelh leh khiatna tuam neih hi.
Te/Teng (Plural noun) pen a mai aa Noun tawh i mat leh tua Te/Teng in a mai aa Noun pen Plural
noun (khat sangin a tamzaw) suaksak hi.
Gtn. Tua a te ziahziah kham manphate nei le uh cin, khuapi sung ah noteng na teng zo ding uhhi.
*Plural Noun a suak sak, “te/teng” pen a mai aa Noun tawh mat hamtang ding.
Adverb
Lua (v) pen tang khat bekin i gelh leh khiatna tuam neih hi.
Lua (adv) pen a mai aa Verb/Adj tawh i mat leh tua Lua in a mai aa Verb/Adj pen Adverb suaksak hi.
Gtn. Zu tam dawnluain lua hi.
*Adverb pen a mai aa Verb/Adj tawh mat hamtang ding.
Prefix
Lo (n) pen tang khat bekin i gelh leh khiatna tuam neih hi.
Lo (Prefix) pen a mai aa Verb/Adj tawh i mat leh tua Lo in a mai aa Verb/Adj pen a lehlam suaksak hi.
Gtn. Hih lo hoihlo hi.
*Prefix pen a mai aa Verb/Adj tawh mat hamtang ding.
Prefix
Kei (n) pen tang khat bekin i gelh leh khiatna tuam neih hi.
Kei (adv) pen a mai aa Verb/Adj tawh i mat leh tua Kei in a mai aa Verb/Adj pen a lehlam suaksak hi.
Gtn. Kei bel laukei ing.
*Prefix pen a mai aa Verb/Adj tawh mat hamtang ding.

6

(LTTUANG)


Zolai STANDARD Format

Comparative
Zaw (adj) pen tang khat bekin i gelh leh khiatna tuam neih hi.
Zaw (c.adj) pen a mai aa Verb/Adj tawh i mat leh tua Zaw in a mai aa Verb/Adj pen uangzawsak hi.
Gtn. Hih ciang zawlua in a hoihzaw khat va zong ni. (Gol, Golzaw)
*Comparative Adj pen a mai aa Verb/Adj tawh mat hamtang ding.
Comparative
Sem (v) pen tang khat bekin i gelh leh khiatna tuam neih hi.
Sem (c.adj) pen a mai aa Verb/Adj tawh i mat leh tua Sem in a mai aa Verb/Adj pen uangzawsak hi.
Gtn. Na semkhawm thei ding i hih manin lungdamsem ei. (Neu, Neusem)
*Comparative Adj pen a mai aa Verb/Adj tawh mat hamtang ding.
Comparative
Pen (Adj) pen tang khat bekin i gelh leh khiatna tuam neih hi.
Pen (c.adj) pen a mai aa Verb/Adj tawh i mat leh tua Pen in a mai aa Verb/Adj pen uangzawsak hi.
Gtn. Tua pen hoihpen hi. (Hoih, Hoihzaw, Hoihpen, Hoih penpen) (Hoih, Hoihsem, Hoihpen, Hoih
penpen)
*Comparative Adj pen a mai aa Verb/Adj tawh mat hamtang ding.
Conjunction/Time
Ciang (n) pen tang khat bekin i gelh leh khiatna tuam neih hi.
Ciang (conj) pen a mai aa Verb/Adj tawh i mat leh tua Ciang in a mai aa Verb/Adj pen pau kizom
suaksak hi.
Ciang (time) pen hun i genna ah malkhat in gawm ding hi.
Gtn. Zingciang ciang khat tawh nong pai ciang kimu ni. Tua ciang ken zongh thaiciang ading ciang
khat hong tawi ning. Tuakhit ciangin semkhawm ni.
* Conjunction/Time pen laimal mat khatin mat/gawm hamtang ding.
Verb
Khawm (n) pen tang khat bekin i gelh leh khiatna tuam neih hi.
Khawm (v) pen a mai aa Verb/Adj tawh i mat leh tua Khawm in a mai aa Verb/Adj pen a khiatna
behlap hi.
Gtn. Khawmpi pai dingin Lia Khawm in mi pawlkhat khawmtuah aa paikhawm uhhi.
*Adverb pen a nung/mai aa Verb/Adj tawh mat hamtang ding.

7

(LTTUANG)


Zolai STANDARD Format

Hih teng pen laimal gawmzia lakna hi aa, laimalte pen bang thute ah kimatsakding, bang
thute ah kihalsakding cih, a kimatna thu, a kihalna thu, a hang i telkhit ciangin hih sung ah a
kilaklo laimal khat peuhpeuh zongh dik takin kimalgawm thei ding hi.

(5) AWKAIH II KHEL LAIMALGAWM PAWLKHAT

Lua, Lo, Kei, Zaw, Khawm, Lamdang, Thang, Thupi, Kap, Thei

Luat/Lua = Na khedaptul sangluain a sangluat ciang kilawm nawnlozaw hi.

Loh/Lo = Nong pailoh ciang kei zongh pailo pah hing.

Keh/Kei = Kei ka paikeh, nang zongh na paikei oo.

Zawk/Zaw = Nang kong teelzawk manin mi dangte in zongh nang mah hong teelzaw pah uhhi.

Khop/Khawm = Noteng na paikhop uh ciang kei zongh no tawh paikhawm nuam ing.

Lamdan/Lamdang = Lamdang na cihcih uhhang’ a kilamdanna thei zokei ing.

Than/Thang = Min thanna pen Pasian aa hi aa, a min thang tawntung tahen.

Thupit/Thupi = Na thupitna ka theih semsem ciang thupi ong sa semsem ing.

Kap/Kah = Ka kap leh ka kahna aw ngaihlua.

Thei/Theih = Thu theih nadingin thu theite dong ni.

8

(LTTUANG)


Zolai STANDARD Format

Hihteng pen laimal gawmzia lakna hi aa, laimalte pen bang thute ah kimatsakding, bang thute
ah kihalsakding cih, a kimatna thu, a kihalna thu, a hang i telkhit ciangin hih sung ah a kilaklo
laimal khat peuhpeuh zongh dik takin kimalgawm thei ding hi.
Lai (noun)

---
<!-- SOURCE: wiki/zolai_grammar_cheat_sheet.md -->

# Zolai Grammar Cheat Sheet
## Complete Grammar Reference for Training Data Preparation

**Standardization Sources:**
- **ZCLS** (Zomi Christian Literature Society)
- **ZOLLS** (Zomi Language & Literature Society)
- *Zolai Simbu* (Official Zolai Lesson Readers, Tan Lang - Tan Li)
- *Zolai Standard Format* & *Zolai Gelhmaan Bu*

---

## 1. Basic Sentence Structure

### Ergativity (The 'in' Marker)
Zolai uses an ergative-absolutive alignment. 
- The subject of a **transitive verb** (an action with an object) requires the agentive marker `in`.
- `Kei` (I) + `in` = `Ken` (I did it)
- `Amah` (He/She) + `in` = `Aman` (He/She did it)
- `Pasian` (God) + `in` = `Pasian in` (God did it)

### Word Order: OSV (Object-Subject-Verb) and Flexible Order
```
Object + Subject + Verb + Particle (Highly natural/common)
Subject + Object + Verb + Particle (Also acceptable)
Subject + Verb + Particle (Intransitive or dropped object)

Example 1 (OSV - Preferred/Natural):
Laibu ka sim hi. (or Lai ka sim hi.)
(Book I read is.)
= I read a book.

Example 2 (SOV - Requires explicit subject marker):
Ka pa in laibu sim hi.
(My father book read is.)
= My father reads a book.
*(Note: "Ka laibu sim hi" is INCORRECT and should not be used)*

Example 3 (SV):
Ka sim hi.
= I read.
```

### Simple Sentence Patterns
| Pattern | Example | Translation | Notes |
|---------|---------|-------------|-------|
| S + V | Ka sim hi | I read | "I" = ka |
| O + S + V | Laibu ka sim hi | I read a book | **Highly natural and preferred** |
| S + O + V | Ka pa in laibu sim hi | My father reads a book | Requires explicit subject or agentive marker ("in") |
| S + O + V | Kei in laibu ka sim hi | I read a book | Explicit subject + OSV |
| S + O + V | Ken laibu ka sim hi | I read a book | "Ken" = "Kei in" |
| O + S + V + Adv | Laibu hoih takin ka sim hi | I read a book well | |

---

## 2. Verb Conjugation

### Tense Markers
| Tense | Marker | Example | Translation |
|-------|--------|---------|-------------|
| Present | hi | Ka pai hi | I go |
| Past | ta | Ka pai ta | I went |
| Future | ding | Ka pai ding | I will go |
| Perfect | ngei | Ka pai ngei | I have gone |
| Continuous | laitak | Ka pai laitak | I am going |
| Imperative | (none) | Pai in | Go (you) |
| Imperative Plural | un | Pai un | Go (you all) |
| Let's | hen | Pai hen | Let's go |

### Verb Stem Alternation (Stem I and Stem II) - Examples from Zolai Simbu
| Verb (English) | Stem I | Stem II | Notes |
|----------------|--------|---------|-------|
| see | mu | muh | Basic perception |
| give | pia | piak | Transfer of possession |
| know | thei | theih | Cognitive knowledge |
| read | sim | sim | No change in stem |
| make/do | bawl | bawl | No change in stem |
| exist/be | nei | nei | State of being |
| shake | lumsak | lumsak | Physical action |
| hold/take | kem | kem | Grasping action |
| enter/go in | cing | cing | Movement inward |
| know/understand | zual | zual | Cognitive comprehension |
| fear/be afraid | gilo | gilo | Emotional state |
| return/comeback | mul | mul | Reversive motion |
| be strong | zahhuai | zahhuai | Stative quality |
| taste | zumna | zumna | Sensory perception |
| test | kisiatna | kisiatna | Evaluative action |
| pound/hit | thuak | thuak | Impact action |
| continue/last | tham | tham | Temporal extension |

### Verb Stem Alternation (Stem I and Stem II)
Kuki-Chin languages possess two forms of most verbs.
- **Stem I**: Used in simple, affirmative main clauses (e.g., `Ka mu hi` = I see).
- **Stem II**: Used in dependent clauses, negative clauses, interrogatives, and noun formations (e.g., `A muh ciangin` = When he saw).

| Verb (English) | Stem I | Stem II |
|----------------|--------|---------|
| see | mu | muh |
| give | pia | piak |
| know | thei | theih |
| read | sim | sim |
| make/do | bawl | bawl |

### Verb + na (Noun Formation)
```
Verb (Stem II) + na = Noun

Pai + na = Paina (going/going place)
It + na = Itna (love)
Sem + na = Sepna (work/job)  *(Stem II of sem is sep)*
Gen + na = Genna (saying)
Gelh + na = Gelhna (writing)
Sim + na = Simna (reading)
Sin + na = Sinna (learning)
```

---

## 3. Pronouns & Noun System

### Subject & Object Pronouns
| English | Prefix / Weak Subject | Standalone / Emphatic Subject | Possessive | Plural Subject |
|---------|------------------------|-------------------------------|------------|----------------|
| I / Me | ka | kei, ken, keimah | ka | - |
| You | na | nang, nangmah | na | note |
| He / She / It | a | amah | a | amau (they) |
| We (Inclusive) | i | eite | i | - |
| We (Exclusive) | ko | kote | ko | - |
| They | amau | amau | amau | - |

*(Note: Zolai distinguishes between inclusive "we" (you and I) and exclusive "we" (we but not you).)*

### Possession Markers
| Prefix | Person | Example | Translation |
|--------|--------|---------|-------------|
| Ka | My | Ka pa | My father |
| Na | Your | Na pa | Your father |
| A | His/Her | A pa | His/her father |
| I | Our | I pa | Our father |
| Amau | Their | Amau pa | Their father |

### Plural Markers
| Marker | Usage | Example | Translation |
|--------|-------|---------|-------------|
| te | General plural | Mi te | People |
| teng | All/every | Mi teng | All people |
| pawl | Group | Mi pawl | Group of people |
| note | Respectful plural | Zomi note | Zo people (respectful) |

### Demonstratives
| Zolai | English | Example |
|-------|---------|---------|
| Hi | This | Hi laibu (This book) |
| Tua | That | Tua laibu (That book) |
| Hite | These | Hite laibu (These books) |
| Tuate | Those | Tuate laibu (Those books) |

---

## 4. Prepositions & Postpositions

### Location Markers
| Zolai | English | Example | Translation |
|-------|---------|---------|-------------|
| Tung | On/Above | Mual tung | On the mountain |
| Nuai | Under | Meikuk nuai | Under the table |
| Paam | Beside | Lam paam | Beside the road |
| Gei | At/In | Inn gei | At the house |
| Sung | Inside | Inn sung | Inside the house |
| Pua | Outside | Inn pua | Outside the house |
| Maai | Before | Ka maai | Before me |
| Nung | After | Ka nung | After me |

### Direction Markers
| Zolai | English | Example |
|-------|---------|---------|
| Lam | Direction | Koi lam? (Which direction?) |
| Pan | From | America pan (From America) |
| Dong | Until | Tu dong (Until now) |
| Tang | Through | Lam tang (Through the road) |

---

## 5. Apostrophe Contractions

### Common Contractions
| Full Form | Contracted | Meaning |
|-----------|------------|---------|
| Ka ong | K'ong | My (emphasis) |
| Na ong | N'ong | Your (emphasis) |
| Ka hong | K'hong | My (emphasis) |
| Na hong | N'hong | Your (emphasis) |
| Ka eek | K'eek | My |
| Na eek | N'eek | Your |
| Bang a? | Ba'a? | What? |
| Bang hang a? | Bang ha'h? | Why? |
| Nung a | Nu'a | After |
| Sung ah | Su'ah | In/Inside |
| Ding a | Di'a | For/Purpose |
| Nung2a | Nu'a | Later |
| Sung2ah | Su'ah | Within |

### Apostrophe Rules
1. **After 'a' sounds**: Ka + ong = K'ong
2. **After 'ng' sounds**: Nung + a = Nu'a
3. **Question words**: Bang + a = Ba'a
4. **Prepositions**: Sung + ah = Su'ah
5. **Purpose/Ding**: Verb + ding a = for purpose (observed in Zolai Simbu)

---

## 6. Sentence Endings

### Statement Endings
| Ending | Meaning | Example |
|--------|---------|---------|
| hi | Present statement | Ka pai hi (I go) |
| ta | Past statement | Ka pai ta (I went) |
| ding | Future statement | Ka pai ding (I will go) |
| hi ta | Completed | Ka pai hi ta (I have gone) |

### Question Endings
| Ending | Meaning | Example |
|--------|---------|---------|
| hiam? | Yes/No question | Na pai hiam? (Do you go?) |
| ciang? | When question | Na pai ciang? (When do you go?) |
| bang hiam? | What question | Bang hiam? (What is it?) |
| koi hiam? | Where question | Koi hiam? (Where is it?) |
| bang hang hiam? | Why question | Bang hang hiam? (Why?) |

### Command Endings
| Ending | Meaning | Example |
|--------|---------|---------|
| in | You (singular) | Pai in (You go) |
| un | You (plural) | Pai un (You all go) |
| hen | Let's | Pai hen (Let's go) |
| ni | Let's (inclusive) | Pai ni (Let's go together) |

---

## 7. Conjunctions & Connectors

### Common Conjunctions
| Zolai | English | Example |
|-------|---------|---------|
| leh | And | A leh B (A and B) |
| ahih zongin | But | ... ahih zongin (but...) |
| ahih manin | Therefore | ... ahih manin (therefore) |
| ciangin | When/If | ... ciangin (when/if) |
| hangin | Because | ... hangin (because) |
| teh | Then | ... teh (then) |
| hileh | If | ... hileh (if) |
| napi | Although | ... napi (although) |

### Time Connectors & Story Starters
| Zolai | English | Note |
|-------|---------|------|
| Nidang lai-inah / Nidang in | Once upon a time / In the past | Typical story opener |
| Tua khit ciangin | After that | Temporal sequence |
| Tua ciangin | Then / Next | Narrative progression |
| Tua ahi ciangin | Therefore / So when that happened | Consequential |
| Tua masa pen | First | Sequence |
| Tua nung | After that | Time sequence |
| Tua laitak in | At that moment / Until then | Coinciding event |
| Tua hangin / Ahih manin | Because of that / Therefore | Reason |
| -na ding in / -na dingin | In order to / So that | Purpose clause (e.g., `luang loh nadingin` = so that it won't flow) |

---

## 8. Adjective & Modifier Placement

### Noun + Adjective (Post-nominal)
In Zolai, adjectives generally come **AFTER** the noun they modify, often followed by modifiers like `mahmah` (very) or `pi` (big/great) and numeric counters like `khat` (one).

```
Noun + Adjective + (Modifier) + (Counter)

Inn lian = Big house (House + big)
Bawm gol mahmah khat = One very big box (Box + big + very + one)
Temta zum = Sharp knife (Knife + sharp)
Tawlet neu khat = One small window (Window + small + one)
```
*(Note: Earlier grammatical drafts incorrectly listed adjectives before nouns. Always place the descriptive adjective after the noun.)*

### Comparative & Superlative
| Form | Syntax | Example | Translation |
|------|--------|---------|-------------|
| Comparative | [A] sang in [B] + adj + zaw | Tuipi sang in a niam zaw hi | It is lower than the sea |
| Comparative | adj + zaw | Lian zaw | Bigger |
| Superlative | adj + pen | Lian pen | Biggest |
| Very | adj + lua / mahmah / pi | Lian lua / Lian mahmah / Lian pi | Very big / Huge |

---

## 9. Common Sentence Patterns

### Existence (Om)
```
... om hi = There is/are...

Inn ah mi om hi. = There is a person in the house.
Khua ah inn tampi om hi. = There are many houses in the village.
```

### Identity (Hi)
```
... hi = ... is/are...

Kei Zomi ka hi hi. = I am Zomi.
Tua laibu hoih hi. = That book is good.
```

### Possession (Nei)
```
... nei hi = ... has/have...

Ka pa car nei hi. = My father has a car.
Na lawm tampi nei hiam? = Do you have many friends?
```

### Ability (Thei)
```
... thei hi = can...

Ka Zolai sim thei hi. = I can read Zolai.
Na computer zang thei hiam? = Can you use a computer?
```

### Wanting (Du)
```
... duh hi = want...

Ka tui dawn duh hi. = I want to drink water.
Na pai duh hiam? = Do you want to go?
```

---

## 10. Greetings & Common Phrases

| Zolai | English | Usage |
|-------|---------|-------|
| Na dam hiam? | How are you? | Greeting |
| Ka dam hi | I am fine | Response |
| Lungdam | Thank you | Thanks |
| Hong p'aw | Come (welcome) | Welcome |
| Hoih mahmah | Very good | Compliment |
| Bang hiam? | What is it? | Question |
| Koi hiam? | Where? | Question |
| Tua hi | That's it | Agreement |
| Ahih kei leh | If not | Conditional |

---

## 11. Everyday Nature & Anatomy Vocabulary
*(Extracted from Zolai Simbu educational lessons)*

| Zolai | English | Note |
|-------|---------|------|
| mai gah | pumpkin/gourd | - |
| hakai | crab | - |
| akno | chick/young chicken | - |
| ngapi | fish paste | - |
| gua | bamboo | - |
| bualtui | pond/pool | - |
| uiphuk | frog/toad | - |
| sumkuang | tortoise/turtle | - |
| bilpi | rabbit | - |
| kauphe | butterfly/moth | - |
| miksi | ant | - |
| lungtang | heart | - |
| sam | hair | - |
| gil | stomach/womb | - |

---

## 12. Punctuation Rules

### From Zolai Standard Format
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

CONTEXT-DEPENDENT: Pasian' hong itna vs Pasian hong itna
- Pasian' hong itna  = "God's love" (NOUN PHRASE — genitive `'`, formal/biblical register)
- Pasian hong itna   = "God loves"  (VERB PHRASE — TDB77 register)
- Both are CORRECT. Apostrophe marks genitive, not an error.
- Bible evidence: "Pasian' hong itna" (Tedim2010, Rom 5:8) | "Pasian hong itna ahi zongin" (TDB77, 2Cor 13:14)
```

---

## 13. "A" and "Ki" Prefixes

### "A" Prefix Usage
| Pattern | Meaning | Example |
|---------|---------|---------|
| A + verb | He/she does | A pai hi (He/she goes) |
| A + noun | His/her | A pa (His/her father) |
| A + preposition | The + prep | Atung (On it) |

### "Ki" Prefix Usage
| Pattern | Meaning | Example |
|---------|---------|---------|
| Ki + verb | Reciprocal | Kituak (Meet each other) |
| Ki + verb | Passive | Kibawl (Be made) |
| Ki + noun | Together | Kipawlna (Organization) |

---

## 14. "G" vs "Ng" Distinction

### Critical Differences
| G Word | Meaning | Ng Word | Meaning |
|--------|---------|---------|---------|
| Gai | Marry (female) | Ngai | Marry (male) |
| Gah | Earn | Ngah | Receive |
| Gam | Country | Ngam | Dare |
| Gap | Strong | Ngap | Start work |
| Gak | Sit (plural) | Ngak | Midwife |
| Gawm | Join | Ngawm | - |
| Gim | Difficult | Ngim | Faithful |
| Gol | - | Ngol | - |

---

*Generated from: zolai_gelhmaan_bu_grammar_vol, zolai_standard_format, zolai_sinna, Zolai Simbu (ZCLS/ZOLLS)*
*Last updated: 2026-04-01*

---
<!-- SOURCE: wiki/grammar/complete_grammar_reference_corpus.md -->

# Zolai Complete Grammar Reference — Corpus Verified

> Sources: All 3 Bible versions (TDB77 + TBR17 + Tedim2010) × KJV — 85,124 pairs
> Frequency counts from full corpus. Last updated: 2026-04-17

---

## 1. Sentence-Final Particles (Mood Markers)

| Particle | Meaning | Frequency | Example |
|---|---|---|---|
| `hi` | statement (declarative) | 97,113 | `Pasian in itna ahi hi` = God is love |
| `hiam` | question | 7,423 | `Na pai ding hiam?` = Will you go? |
| `un` | imperative plural (you all, do!) | 4,565 | `Topa la sak un` = Sing to the Lord |
| `in` | imperative singular / ergative marker | 5,243 | `Pai in` = Go! |
| `hen` | optative / let it be | 1,188 | `Khuavak om ta hen` = Let there be light |
| `ni` | hortative / let us | 370 | `Pai ni` = Let us go |
| `tahen` | wish / may it be | 205 | `hong kem tahen` = may he keep you |
| `aw` | vocative / address | 187 | `Ka ta aw` = O my son |

---

## 2. Tense & Aspect Markers

### Future: `ding`
- Pattern: `[verb] ding hi` = will [verb]
- Frequency: 5,955 occurrences
- `pai ding hi` = will go | `si ding hi` = will die | `bawl ding hi` = will do
- Negative future: `[verb] lo ding hi` (1,703) or `[verb] kei ding hi` (2,768)

### Past: `hi` (simple past)
- Pattern: `[verb] hi` = [verb]-ed
- Frequency: 6,351 occurrences
- `pai hi` = went | `si hi` = died | `gen hi` = said

### Completed: `khin`
- Meaning: already done / completed action
- Frequency: 321 occurrences
- `bawl khin` = has done | `pai khin` = has gone | `kham khin` = has prepared
- `[TDB77]` *I have prepared* → **kham talen tul zakhat, ngul leh kham khin hi**

### Finished/Overcome: `zo`
- Meaning: completed / finished / overcome
- Frequency: 165 occurrences
- `zo hi` = finished | `amah in Moab mite zo a` = he overcame Moab
- `a tum zawh loh` = could not enter (zawh = complete)

### Ever/Before: `ngei`
- Meaning: ever / has done before / experiential
- Frequency: 91 occurrences
- `pai ngei` = has ever gone | `mu ngei kei` = has never seen
- `ngei kei` = never (14 occurrences in negation)

### Again: `nawn`
- Meaning: again / repeated action
- Frequency: high
- `pai nawn` = go again | `gen nawn` = say again | `nawn kei` = no more / never again (270)

### Change of state: `ta`
- Meaning: now / change has occurred
- `om ta` = now exists | `khuavak om ta hen` = let there now be light
- `ta hi` = it is now so

### Immediately: `pah`
- Meaning: immediately / suddenly / right away
- `khuavak om pah hi` = light appeared immediately
- `[TDB77]` *And there was light* → **khuavak om pah hi**

### Continuously: `lel`
- Meaning: still / continuously / keeps doing
- `a gamta lel` = keeps doing | `om lel` = still exists

### Ability: `thei`
- Meaning: can / able to
- `pai thei` = can go | `thei kei` = cannot (203 occurrences)
- `lut thei kei` = cannot enter

### Not yet: `nai`
- Meaning: not yet / still (in negative)
- `nai lo` = not yet (70 occurrences)
- `a tum nai lo` = has not yet entered

### Not even: `het`
- Meaning: not even / at all (emphatic negative)
- `het kei` = not even / not at all
- `gamta het kei ding hi` = shall not do it at all

---

## 3. Negation

### `kei` — verb negation (action did not happen)
- Pattern: `[verb] kei` or `[verb] kei hi`
- Frequency: 2,809 occurrences
- `pai kei hi` = did not go | `thei kei` = cannot | `om kei` = does not exist
- `nawn kei` = no more / never again (270)

### `lo` — state/adjective negation (condition not met)
- Pattern: `[state/adj] lo` or `[verb] lo hi`
- Frequency: 1,943 occurrences
- `om lo` = not present (275) | `thei lo` = unable (240) | `hi lo` = is not (214)
- `zo lo` = not finished (117) | `hoih lo` = not good (30)

### Key distinction: `kei` vs `lo`
- `pai kei hi` = did not go (action negated)
- `pai lo hi` = did not go (state/condition — more permanent)
- `thei kei` = cannot (temporary inability)
- `thei lo` = unable (more permanent inability)

### `cikmah` — never (absolute)
- `cikmah hunin` = at no time ever | `cikmah kei` = absolutely never

### Negative conditional: `kei a leh` / `kei leh`
- `Na pai kei a leh` = if you don't go
- NEVER use `kei a leh` for negative conditional

---

## 4. Conjunctions & Connectors

| English | Zolai | Frequency | Notes |
|---|---|---|---|
| and | `leh` | 7,302 | between nouns/phrases |
| and (clause) | `a` | 22,436 | between clauses |
| but | `ahih hangin` | 912 | most common "but" |
| but (mild) | `napi` / `napi-in` | 75/59 | softer contrast |
| because | `ahih manin` | 258 | standard causal |
| because (explanatory) | `bang hang hiam cih leh` | — | "the reason being that" |
| if | `a leh` / `leh` | 933 | conditional |
| when | `ciangin` | 1,740 | most common "when" |
| while | `lai takin` | 40 | during |
| therefore | `tua ahih ciangin` | 504 | most common "therefore" |
| then | `tua ciangin` | 70 | sequence |
| until | `mateng` | 78 | most common "until" |
| until (point) | `ciangdong` | 9 | up to a point |
| although | `napi` / `ahih hangin` | — | concessive |

---

## 5. Question Words

| English | Zolai | Notes |
|---|---|---|
| who | `kua` / `kua in` | `Kua in...hiam?` |
| what | `bang` / `bang ahi hiam` | `Bang ahi hiam?` = What is it? |
| why (direct) | `bang hangin` | 391 occurrences — genuine question |
| why (rhetorical) | `bang hang hiam` | introduces reason clause |
| because | `bang hang` / `ahih manin` | NOT a question — `bang hang` = 2,420 occurrences |
| when | `tua hun` / `bang hun` | time question |
| where | `tua mun` / `tua lai` | location |
| how | `bang ci-in` / `bang bangin` | manner |
| how many | `bang zah` / `a phazah` | quantity |

---

## 6. Directional Particles

| Particle | Direction | Frequency | Example |
|---|---|---|---|
| `hong` | toward speaker | 1,595 | `hong pai` = come, `hong it` = loves (us) |
| `va` | away from speaker | 87 | `va pai` = go away |
| `lut` | enter (deliberate) | 124 | `inn sungah lut` = enter the house |
| `tum` | arrive inside | 82 | `hong tum` = came in |
| `khia` | exit/out | 26 | `kuankhia` = go out |
| `paikhia` | depart/go out | 93 | `paikhia hi` = departed |
| `kik` | return/back | 21 | `ciahkik` = return |
| `san` | upward | 5 | `paisan` = go up |
| `tawn` | downward | — | `paitawn` = go down |
| `suak` | emerge | — | `suakkhia` = come out |

### `lut` vs `tum`
- `lut` = deliberate physical entry: `siampite lut uh` = the priests entered
- `tum` = arrive inside: `hong tum hi` = came in (toward speaker)
- `hong lut` = come in (toward); `va lut` = go in (away)

---

## 7. Common Verb Patterns

| English | Zolai | Pattern |
|---|---|---|
| say/said | `ci hi` / `gen hi` | `amah in...ci hi` = he said |
| go | `pai hi` | `pai hi` = went |
| come | `hong pai hi` | `hong pai hi` = came |
| give | `pia hi` | `ama kiangah pia hi` = gave to him |
| take | `la hi` | `la hi` = took |
| see | `mu hi` | `mu hi` = saw |
| know | `thei hi` | `thei hi` = knew |
| love | `it hi` | `Pasian in eite hong it hi` = God loves us |
| die | `si hi` | `si hi` = died |
| live | `nungta hi` | `nungta hi` = lived |
| pray | `thunget hi` | `Topa tungah thunget hi` = prayed to the Lord |
| worship | `biak hi` | `Topa biak hi` = worshipped the Lord |
| believe | `um hi` | `um hi` = believed |

---

## 8. Pronouns (Summary)

| Person | Subject | Object | Possessive | Reflexive |
|---|---|---|---|---|
| 1sg | `ka` (prefix) / `kei` (emphatic) | `kei` / `keima` | `ka` | `ka pumpi` |
| 2sg | `nang` | `nang` / `nangma` | `na` | `nangmah` |
| 3sg | `amah` (no gender) | `amah` | `ama` / `ama'` | `eimah` |
| 1pl | `i` (prefix) / `eite` (emphatic, 1,087) / `kote` (exclusive, 677) | `eite` / `kote` | `i` / `eite` | `i pumpi` |
| 2pl | `note` | `note` | `na` / `note` | `note pumpi` |
| 3pl | `amaute` | `amaute` | `amau` / `amau'` | `amaute mah` |

**Critical rules:**
- `kei te` is NOT "we" — 0 corpus occurrences as subject
- `i` = subject prefix (we), NEVER add `uh` with `i`
- `amaute pai uh hi` = they went (NOT `amaute i pai hi`)
- `eite` = emphatic/object we/us | `kote` = exclusive we | `i` = subject prefix
- No gender distinction: `amah` = he/she/it

---

## 10. Postpositions (Frequency-Ranked)

| Particle | Freq | Meaning | Example |
|---|---|---|---|
| `ciangin` | 8,366 | when/after | `A tun ciangin` = when arrived |
| `tawh` | 6,265 | with/by | `Topa tawh` = with God |
| `ah` | 5,158 | in/at | `Jerusalem ah` = in Jerusalem |
| `tungah` | 4,536 | to/unto (things) | `Amah tungah pia` = gave to him |
| `kiangah` | 3,356 | to/unto (persons) | `David kiangah` = to David |
| `hangin` | 3,281 | because of/for | `Ama' hangin` = for his sake |
| `bangin` | 3,184 | like/as | `Topa' thu bangin` = as the Lord said |
| `panin` | 3,083 | from/out of | `Gam panin` = from the land |
| `sungah` | 2,806 | inside/within | `Inn sungah` = inside the house |
| `nadingin` | 1,336 | in order to | `Pai nadingin` = in order to go |
| `manin` | 1,280 | because/since | `Ahih manin` = because it is so |
| `ading` | 430 | for/for the sake of | `Eite ading` = for us |
| `mateng` | 161 | until | `Ka hong pai mateng` = until I come |
| `nungah` | 100 | behind/after | `Ka nung hong zui` = follow after me |

> Full reference: `wiki/ggammar/particles_postpositions_corpus.md`

| Wrong (reject) | Correct (ZVS Tedim) |
|---|---|
| `pasian` | `Pasian` |
| `gam` | `gam` |
| `tapa` | `tapa` |
| `topa` | `topa` / `kumpipa` |
| `???` | `kumpipa` |
| `tua` / `tuan` | `tua` |
| `kei a leh` (conditional) | `kei a leh` |
| `I pai uh hi` | `I pai hi` (never uh with i) |
| `kei te` (as "we") | `i` / `eite` |

---
<!-- SOURCE: wiki/grammar/negation_corpus.md -->

# Zolai Negation Reference — Corpus Verified

> Sources: Bible (TDB77+TBR17+Tedim2010) + master_source_v1.jsonl + wiki/grammar/*.md

## not (verb neg)

- `[TDB77]` *Now Sheshan had no sons, but daughters. And Sheshan had a servant, an * → **Tu-in Sheshan in tapa nei loin tanu bek nei hi; ahih hangin Sheshan in**
- `[TDB77]` *And enquired not of the* → **leh Topa tung panin lamlahna a zon’ lohna ah Topa tungah a thuman lo a**
- `[TDB77]` *Of the three, he was more honourable than the two; for he was their ca* → **Amah in mihing sawmthumte sung panin a minthang pen hi a, amaute a ukp**
- `[TDB77]` *Behold, he was honourable among the thirty, but attained not to the fi* → **Mihing sawmthumte lakah amah minthang a, ahih hangin amah in mi thumte**

## never

- `[TDB77]` *Ever learning, and never able to come to the knowledge of the truth.* → **a kihilh niloh hangin cikmah hunin thuman thutak a thei thei lo numei **
- `[TDB77]` *But Peter said, Not so, Lord; for I have never eaten any thing that is* → **Piter in, “Topa aw, hi thei lo ding hi. Bang hang hiam na cih leh, a s**
- `[TDB77]` *The merchants among the people shall hiss at thee; thou shalt be a ter* → **Nang a maimang paisuak na hita a, nangma tuah bang a tuah khak ding uh**
- `[TDB77]` *Ask me never so much dowry and gift, and I will give according as ye s* → **Kei' kiang panin mo-man leh letsong tampi hong ngen un, kei' tunga non**

## neither/nor

- `[TDB77]` *And also unto the Levites; they shall no more carry the tabernacle, no* → **Tua ahih ciangin Levi mite in puanbuk hita leh tua tawh kisai nasep na**
- `[TDB77]` *And David said to Solomon his son, Be strong and of good courage, and * → **Tua ciangin David in a tapa Solomon kiangah, “Thakhauhin hang in la, s**
- `[TDB77]` *I have fed you with milk, and not with meat: for hitherto ye were not * → **Note in an haizan zo nai lo na hih uh ciangin sa tawh kong vaak nai ke**
- `[TDB77]` *So then neither is he that planteth any thing, neither he that wateret* → **Tua ahih ciangin a suanpa in mi phamawh ahi kei hi; tuibuakpa in mi ph**

## do not

- `[TDB77]` *For what have I to do to judge them also that are without? do not ye j* → **Bang hang hiam na cih uh leh, a pualam mite thukhenna tawh bang kikum **
- `[TDB77]` *Doth not even nature itself teach you, that, if a man have long hair, * → **Pasal in sam sau a neih leh, zumhuaina ahi ci-in leitung ngeina thu na**
- `[TDB77]` *Doth not behave itself unseemly, seeketh not her own, is not easily pr* → **a kituak loin a gamta kei hi, ama phat nading a zong kei hi, a heh bai**
- `[TDB77]` *If we say that we have fellowship with him, and walk in darkness, we l* → **“Eite in Pasian tawh i kiho thei hi,” i ci napi-in khuamial lakah i ga**

## shall not

- `[TDB77]` *Behold, I shew you a mystery; We shall not all sleep, but we shall all* → **En un, thuthuk khat kong gen ding hi. Eite khempeuh sicip ding i hi ke**
- `[TDB77]` *For I will not see you now by the way; but I trust to tarry a while wi* → **Bang hang hiam na cih uh leh, lam lai-ah kimuh ding bek ka ut kei hi. **
- `[TDB77]` *And I will dwell among the children of Israel, and will not forsake my* → **Tua ciangin na lam inn sung Israel mite lakah ka teeng ding a, keima m**
- `[TDB77]` *Notwithstanding in thy days I will not do it for David thy father's sa* → **Ahi zongin na pa David’ hangin nangma hun sungin ka hih kei ding a, na**

## cannot

- `[TDB77]` *But if they cannot contain, let them marry: for it is better to marry * → **Ahi zongin a pumpi uh a kikham zawh kei uh leh, kiteeng uh hen. A kat **
- `[TDB77]` *And the eye cannot say unto the hand, I have no need of thee: nor agai* → **Mittang in khut kiangah, “Nang kong deih kei hi,” ci thei lo hi. Tua m**
- `[TDB77]` *And turn ye not aside: for then should ye go after vain things, which * → **meetna hong pia thei lote ahi a, hong hon thei lo a mawkna nate lamah **
- `[TDB77]` *Likewise also the good works of some are manifest beforehand; and they* → **Tua mah bangin a kilang gamtatna hoih a om thei hi, a kilanglo gamtatn**

## without

- `[TDB77]` *And the sons of Nadab; Seled, and Appaim: but Seled died without child* → **Nadab’ tapate in: Seled leh Appaim ahi uh hi; Seled in ta nei loin si **
- `[TDB77]` *And the sons of Jada the brother of Shammai; Jether, and Jonathan: and* → **Tua ciangin Shammai’ sanggampa Jada’ tapate in: Jether leh Jonathan ah**
- `[TDB77]` *For what have I to do to judge them also that are without? do not ye j* → **Bang hang hiam na cih uh leh, a pualam mite thukhenna tawh bang kikum **
- `[TDB77]` *But them that are without God judgeth. Therefore put away from among y* → **A pua lamah a omte Pasian in thu a khen ding hi. Tua a gilopa note lak**

---
<!-- SOURCE: wiki/negation/negation_guide.md -->

# Zolai Negation — Complete Corpus Reference
> Source: Bible Parallel Corpus (TDB77 + Tedim2010 ZVS + KJV), 31,055 verses
> Updated: 2026-04-17

---

## 1. Primary Negation Particles

### `kei` — Standard ZVS negation
- 1st/2nd person: `Ka dam kei hi.` = I am not well.
- Future: `Ka pai kei ding hi.` = I will not go.
- Ability: `Ka sem thei kei hi.` = I cannot do it.
- **Conditionals — ONLY `kei`:** `Nong pai kei a leh...` = If you don't go...
  - ❌ NEVER: `Nong pai kei a leh...`

### `lo` — Valid ZVS negation, common in 3rd person
- Past/state: `Amah dam lo hi.` = He/she is not well.
- Declarative: `A pai lo hi.` = He did not go.
- `A hoih lo hi.` = It is not good.
- **`lo` is NOT Hakha-only** — it is valid Tedim ZVS in non-conditional contexts.

### `kei lo` — Compound absolute negation ("none / not any")
- `Pasian dang kei lo uh hen.` = You shall have no other gods. (Ten Commandments)
- `Kuamah kei lo.` = There is no one / nobody.
- Meaning: stronger than plain `kei` — total absence.

---

## 2. Aspectual Negation

| Form | Meaning | Example |
|---|---|---|
| `nai lo` | not yet | `A pai nai lo hi.` = He has not gone yet. |
| `nawn lo` | no longer / no more | `A pai nawn lo hi.` = He no longer goes. |
| `thei kei` | cannot | `Ka theih thei kei hi.` = I cannot know. |
| `om kei` | does not exist | `Pasian dang om kei hi.` = No other God exists. |

---

## 3. Imperative Negation

| Form | Person | Example |
|---|---|---|
| `kei in` | singular | `Pai kei in.` = Do not go. |
| `kei un` | plural | `Pai kei un.` = Do not go (all of you). |
| `kei hen` | jussive | `Na lungtang patau kei hen.` = Let not your heart be troubled. |

---

## 4. Negation + Tense Combinations

| Pattern | Meaning | Example |
|---|---|---|
| `[v] kei hi` | present/habitual neg | `A thei kei hi.` = He does not know. |
| `[v] lo hi` | past/state neg | `A pai lo hi.` = He did not go. |
| `[v] kei ding hi` | future neg | `Ka pai kei ding hi.` = I will not go. |
| `[v] kei a leh` | conditional neg | `Nong pai kei a leh` = If you don't go |
| `[v] nawn kei` | will not again | `A gen nawn kei hi.` = He will not say again. |
| `[v] nawn lo` | no longer | `A pai nawn lo hi.` = He no longer goes. |

---

## 5. Key Rule Summary

- **Conditionals:** always `kei`, never `lo` → `kei a leh`
- **3rd person past/state:** `lo` is natural and correct
- **1st person:** `kei` is preferred
- **Absolute negation:** `kei lo` compound
- **`lo` alone as negation** is valid ZVS — not a dialect error

---
<!-- SOURCE: wiki/grammar/pronouns_complete.md -->

# Zolai Complete Pronoun Reference

> Sources: Bible (TDB77+TBR17+Tedim2010) + master_source_v1.jsonl + wiki/grammar/*.md

## Pronoun Table

| Person | English | Zolai | Notes |
|---|---|---|---|
| 1st Sing. | I (subj) | `ka (prefix) / kei (emphatic standalone)` | ka = prefix attached to verb/noun; kei = standalone emphatic |
| 1st Sing. | me (obj) | `kei / keima` |  |
| 1st Sing. | my (poss adj) | `ka` |  |
| 1st Sing. | myself (refl) | `ka pumpi` |  |
| 2nd Sing. | thou/you (subj) | `nang` |  |
| 2nd Sing. | thee/you (obj) | `nang / nangma` |  |
| 2nd Sing. | thy/your (poss adj) | `na` |  |
| 2nd Sing. | thyself/yourself (refl) | `nangmah` |  |
| 3rd Sing. M | he (subj) | `amah` | No gender in Zolai — amah = he/she/it |
| 3rd Sing. M | him (obj) | `amah` |  |
| 3rd Sing. M | his (poss) | `ama / ama'` |  |
| 3rd Sing. M | himself (refl) | `eimah / amah mah` |  |
| 3rd Sing. F | she (subj) | `amah (no gender distinction)` | Same as he — amah (Zolai has no grammatical gender) |
| 3rd Sing. F | her (obj) | `amah` |  |
| 3rd Sing. N | it (subj/obj) | `tua / amah` |  |
| 1st Plural | we (subj) | `i (subject prefix) / eite (emphatic/object) / kote (inclusive formal)` | i = subject prefix with verb; eite = emphatic/object; kote = inclusive formal |
| 1st Plural | us (obj) | `eite / kote` |  |
| 1st Plural | our (poss adj) | `i / eite` |  |
| 1st Plural | ourselves (refl) | `i pumpi / eimah mah` |  |
| 2nd Plural | you/ye (subj) | `note` | note = plural you (all); nang = singular you |
| 2nd Plural | your (poss adj) | `na / note` |  |
| 3rd Plural | they (subj) | `amaute` |  |
| 3rd Plural | them (obj) | `amaute` |  |
| 3rd Plural | their (poss adj) | `amau / amau'` |  |
| 3rd Plural | themselves (refl) | `amaute mah` |  |

## Corpus Examples

### I (subj)

- `[TDB77]` *And David was afraid of God that day, saying, How shall I bring t* → **Tua ni-in David in Pasian kihta hi; amah in, “Pasian’ thuciamna s**
- `[TDB77]` *He shall build me an house, and I will stablish his throne for ev* → **Amah in kei adingin inn khat hong lamsak ding a, keimah in ama ku**
- `[TDB77]` *But I will settle him in mine house and in my kingdom for ever: a* → **ka inn sung leh ka kumpi gam sungah amah kipsak paisuakin ama kum**

### me (obj)

- `[TDB77]` *And David longed, and said, Oh that one would give me drink of th* → **Tua ciangin David in, “Kulhkongpi gei-a Bethlehem tuikhuk panin m**
- `[TDB77]` *And David was afraid of God that day, saying, How shall I bring t* → **Tua ni-in David in Pasian kihta hi; amah in, “Pasian’ thuciamna s**
- `[TDB77]` *He shall build me an house, and I will stablish his throne for ev* → **Amah in kei adingin inn khat hong lamsak ding a, keimah in ama ku**

### my (poss adj)

- `[TDB77]` *Saying, Touch not mine anointed, and do my prophets no harm.* → **“Ka sathau nilhte lawng kei un, ka kamsangte tungah siatna hih ke**
- `[TDB77]` *Go and tell David my servant, Thus saith the* → **“Pai in la, ka nasempa David kiangah gen in. ‘Topa in hih bangin **
- `[TDB77]` *Now therefore thus shalt thou say unto my servant David, Thus sai* → **Tua ahih ciangin tu-in ka nasempa David kiangah hih bangin na ci **

### myself (refl)

- `[TDB77]` *For I know nothing by myself; yet am I not hereby justified: but * → **Bang hang hiam na cih uh leh, mawhsak nadingin ka pumpi tungah ba**
- `[TDB77]` *For though I be free from all men, yet have I made myself servant* → **Keimah in kuamah’ sila ka hih loh hangin mi tampi ka ngah nadingi**
- `[TDB77]` *I say again, Let no man think me a fool; if otherwise, yet as a f* → **Khatvei ka genin ah, keimah in mihai hi ci-in kuamah in hong um k**

### thou/you (subj)

- `[TDB77]` *And moreover in time past, even when Saul was king, thou wast he * → **A hun beisa, Saul kumpi ahih sung nangawnin Israel a kuankhiatpih**
- `[TDB77]` *Now therefore thus shalt thou say unto my servant David, Thus sai* → **Tua ahih ciangin tu-in ka nasempa David kiangah hih bangin na ci **
- `[TDB77]` *What can David speak more to thee for the honour of thy servant? * → **Na nasempa nong pahtawina ah David in nang tungah bang gen ding n**

### thee/you (obj)

- `[TDB77]` *Saying, Unto thee will I give the land of Canaan, the lot of your* → **“Nangma tungah Kanaan gam hong pia-in, gamhluah dingin na tanh di**
- `[TDB77]` *Then Nathan said unto David, Do all that is in thine heart; for G* → **Tua ciangin Nathan in David kiangah, “Pasian in nang tawh om ahih**
- `[TDB77]` *What can David speak more to thee for the honour of thy servant? * → **Na nasempa nong pahtawina ah David in nang tungah bang gen ding n**

### thy/your (poss adj)

- `[TDB77]` *What can David speak more to thee for the honour of thy servant? * → **Na nasempa nong pahtawina ah David in nang tungah bang gen ding n**
- `[TDB77]` *For thy people Israel didst thou make thine own people for ever; * → **Na mi Israelte a tawntungin nangma mi ahi dingin na bawl hi; tua **
- `[TDB77]` *Let it even be established, that thy name may be magnified for ev* → **tua ciangin, ‘Israel Pasian, Vanglianpen Topa in Israelte’ Pasian**

### thyself/yourself (refl)

- `[TDB77]` *And the king said unto the man of God, Come home with me, and ref* → **Tua ciangin kumpipa in Pasian’ mipa kiangah, “Kei tawh innah hong**
- `[TDB77]` *And Micaiah said, Behold, thou shalt see in that day, when thou s* → **Tua ciangin Mikaiah in, “En in, nangmah a bu dingin inndei sungnu**
- `[TDB77]` *Because thine heart was tender, and thou hast humbled thyself bef* → **amaute gamkhing leh samsiatna a ngahte a suah nadingin hih mun le**

### he (subj)

- `[TDB77]` *And Cush begat Nimrod: he began to be mighty upon the earth.* → **Kush in Nimrod kici tapa khat nei hi; amah in leitungah a vanglia**
- `[TDB77]` *Beerah his son, whom Tilgath–pilneser king of Assyria carried awa* → **a tapa Be-erah hi a, Assiria kumpipa Tilgath-pilneser in amau’ mi**
- `[TDB77]` *And he begat of Hodesh his wife, Jobab, and Zibia, and Mesha, and* → **Amah in a zikik Hodesh tawh a neih a tapate in: Jobab, Zibia, Mes**

### him (obj)

- `[TDB77]` *And Tamar his daughter in law bare him Pharez and Zerah. All the * → **A tapa’ zi Tamar in zong amah tawh Perez leh Zerah nei hi. Judah **
- `[TDB77]` *The sons also of Hezron, that were born unto him; Jerahmeel, and * → **Ama sung panin a suak Hezron’ tapate in: Jerahme-el, gam, leh Khe**
- `[TDB77]` *And when Azubah was dead, Caleb took unto him Ephrath, which bare* → **Azubah a sih ciangin Kaleb in Efrath ten’pihin, tua nu in amah ta**

### his (poss)

- `[TDB77]` *And when Bela was dead, Jobab the son of Zerah of Bozrah reigned * → **Bela a sih ciangin ama tangin Bozrah khuami Zerah’ tapa Jobab in **
- `[TDB77]` *And when Jobab was dead, Husham of the land of the Temanites reig* → **Jobab a sih ciangin ama tangin Teman mite’ gam mi Husham in uk hi**
- `[TDB77]` *And when Hadad was dead, Samlah of Masrekah reigned in his stead.* → **Hadad a sih ciangin ama tangin Masrekath khuami Samlah in uk hi.**

### himself (refl)

- `[TDB77]` *Neither let the son of the stranger, that hath joined himself to * → **Topa pawlin a beel gamdang mipa in, “Topa in ama mite kiang panin**
- `[TDB77]` *That which dieth of itself, or is torn with beasts, he shall not * → **A mawk sihte hita leh gamsate in a balgawpte hita leh amah in ne-**
- `[TBR17]` *I have seen the wicked in great power, and spreading himself like* → **keimah in ka mu hi.**

### she (subj)

- `[TDB77]` *Jerahmeel had also another wife, whose name was Atarah; she was t* → **Jerahme-el in a zi dang khat zong nei a, a min in Atarah ahi hi; **
- `[TDB77]` *And the name of the wife of Abishur was Abihail, and she bare him* → **Abishur’ zi min in Abihail hi a, tua nu in amah tawh Ahban leh Mo**
- `[TDB77]` *And she said unto him, My lord, thou swarest by the* → **Tua nu in ama kiangah, “Ka topa aw, na nasemnu tungah Topa na Pas**

### her (obj)

- `[TDB77]` *But if a woman have long hair, it is a glory to her: for her hair* → **Ahih hangin numei a sam a sau leh, ama minthan’na ahi hi. Bang ha**
- `[TDB77]` *Doth not behave itself unseemly, seeketh not her own, is not easi* → **a kituak loin a gamta kei hi, ama phat nading a zong kei hi, a he**
- `[TDB77]` *And the damsel was very fair, and cherished the king, and ministe* → **Tua nungak a mel hoih mahmah hi; amah in kumpipa a kemnu suakin a**

### it (subj/obj)

- `[TDB77]` *And David dwelt in the castle; therefore they called it the city * → **Tua ciangin mun muanhuaina sungah David teeng hi; tua ahih ciangi**
- `[TDB77]` *And they set themselves in the midst of that parcel, and delivere* → **Ahih hangin amah in tua leitang laizangah panmun la-in hu a, Fili**
- `[TDB77]` *And David said unto all the congregation of Israel, If it seem go* → **Tua ciangin David in Israel a kikhawm khempeuhte kiangah, “Note i**

### we (subj)

- `[TDB77]` *Then all Israel gathered themselves to David unto Hebron, saying,* → **Tua ciangin Israel mi khempeuh David kiang Hebron ah kikhawm uh a**
- `[TDB77]` *And let us bring again the ark of our God to us: for we enquired * → **Tua ciangin thuciamna singkuang eite kiangah la kik ni; bang hang**
- `[TDB77]` *Now therefore, our God, we thank thee, and praise thy glorious na* → **Tu-in nangma tungah ka nuam uh hi, kote’ Pasian aw, a minthang na**

### us (obj)

- `[TDB77]` *And let us bring again the ark of our God to us: for we enquired * → **Tua ciangin thuciamna singkuang eite kiangah la kik ni; bang hang**
- `[TDB77]` *For the preaching of the cross is to them that perish foolishness* → **Bang hang hiam na cih uh leh, siatna a thuakte’ ading singlamteh **
- `[TDB77]` *But God hath revealed them unto us by his Spirit: for the Spirit * → **Pasian in ama Kha Siangtho tawh tua nate eite hong lak hi. Bang c**

### our (poss adj)

- `[TDB77]` *And let us bring again the ark of our God to us: for we enquired * → **Tua ciangin thuciamna singkuang eite kiangah la kik ni; bang hang**
- `[TDB77]` *Be of good courage, and let us behave ourselves valiantly for our* → **Hang in, i mite ading leh i Pasian’ khuapite’ ading pasal tat ni;**
- `[TDB77]` *Now therefore, our God, we thank thee, and praise thy glorious na* → **Tu-in nangma tungah ka nuam uh hi, kote’ Pasian aw, a minthang na**

### ourselves (refl)

- `[TDB77]` *For if we would judge ourselves, we should not be judged.* → **Eite in i pumpi i teldot leh, thukhenna i thuak kei ding hi.**
- `[TDB77]` *If we say that we have no sin, we deceive ourselves, and the trut* → **Eite in, “Ka mawhna a om kei hi,’ ci leng eimah mah kikheem i hi **
- `[dict_semantic]` *ourselves* → **eimahmah**

### you/ye (subj)

- `[TDB77]` *And David said unto all the congregation of Israel, If it seem go* → **Tua ciangin David in Israel a kikhawm khempeuhte kiangah, “Note i**
- `[TDB77]` *For because ye did it not at the first, the* → **A masa lai-in no Levi mite na om kei uh a, a kisehsa bang danin k**
- `[TDB77]` *Sing unto him, sing psalms unto him, talk ye of all his wondrous * → **Amah la sak un, phatna la amah sak un la, a lamdang ama septe khe**

### your (poss adj)

- `[TDB77]` *Saying, Unto thee will I give the land of Canaan, the lot of your* → **“Nangma tungah Kanaan gam hong pia-in, gamhluah dingin na tanh di**
- `[TDB77]` *Now set your heart and your soul to seek the* → **Tu-in Topa na Pasian uh a zong dingin na ngaihsutna uh leh na lun**
- `[TDB77]` *I thank my God always on your behalf, for the grace of God which * → **Khazih’ thu tecipan’na nomau lakah a kip ahih ciangin**

### they (subj)

- `[TDB77]` *And they dwelt at Beer–sheba, and Moladah, and Hazar–shual,* → **Amaute Beersheba, Moladah, Hazarshual,**
- `[TDB77]` *And they smote the rest of the Amalekites that were escaped, and * → **amaute in Amalek mi a suakta a om laite susia uh a, tu ni dongin **
- `[TDB77]` *And they dwelt in Gilead in Bashan, and in her towns, and in all * → **amaute Gilead gam sung, Bashan gam leh a khuapite sung, leh Sharo**

### them (obj)

- `[TDB77]` *And they gave them Hebron in the land of Judah, and the suburbs t* → **Judah gam sungah Hebron leh a kiim lononate amaute tungah pia uh **
- `[TDB77]` *And Mikloth begat Shimeah. And these also dwelt with their brethr* → **leh Mikloth (amah in Shimeah’ pa) ahi hi. Tu-in amau’ suan leh kh**
- `[TDB77]` *And Phinehas the son of Eleazar was the ruler over them in time p* → **Eleazar’ tapa Finehas in a beisa hun sungah amaute in ukpa ahi hi**

### their (poss adj)

- `[TDB77]` *Then hear thou their prayer and their supplication in heaven thy * → **vantung na ten’na mun panin amau hong thungetna leh hong thuumna **
- `[TDB77]` *And they will salute thee, and give thee two loaves of bread; whi* → **Amaute in nang hong hopihin nangmah in amau tung panin na san’ di**
- `[TDB77]` *And carry these ten cheeses unto the captain of their thousand, a* → **a tul a ukpa kiangah zong hih sathaukhal sawmte puak in. Na ute’ **

### themselves (refl)

- `[TDB77]` *So the priests and the Levites sanctified themselves to bring up * → **Tua ahih ciangin Israel Pasian, Topa’ thuciamna singkuang a paipi**
- `[TDB77]` *And when the Syrians saw that they were smitten before Israel, th* → **Israelte in amaute a zawhna thu Siria mite in a muh uh ciangin am**
- `[TDB77]` *They stoop, they bow down together; they could not deliver the bu* → **Amaute kunin, amaute puksuk khawm uh a, amaute in vangik pengsak **


---

## Addendum: eite vs kote vs i (Corpus-Verified Counts)

| Form | Count | Usage |
|---|---|---|
| `eite` | 1,087 | we/us emphatic/inclusive — most common |
| `kote` | 677 | we/us exclusive (speaker's group — Paul's letters) |
| `i` + verb | 93 | we subject prefix — standard with verbs |

**Rule:** All three are correct. `eite` is most common. `kote` = exclusive "we" (our group specifically). `i` = subject prefix directly with verb.

**They vs We — definitive:**

---
<!-- SOURCE: wiki/grammar/verbs_corpus.md -->

# Zolai Verb Reference — Corpus Verified

> Sources: Bible (TDB77+TBR17+Tedim2010) + master_source_v1.jsonl + wiki/grammar/*.md

## go/went

- `[TDB77]` *And Jehozadak went into captivity, when the* → **Topa in Nebukhadnezzar’ khut tawh Judah leh Jerusalem sal-in a ma**
- `[TDB77]` *And the battle went sore against Saul, and the archers hit him, a* → **Gal kidona in Saul neh mahmah a, thaltawite in amah pha hi; thalt**
- `[TDB77]` *And of Asher, such as went forth to battle, expert in war, forty * → **Asher sung panin galdo dingin a baihsa-in a om hun khempeuhah gal**
- `[TDB77]` *And the fame of David went out into all lands; and the* → **Tua ciangin David minthan’na in gam khempeuh zel a, Topa in minam**

## come/came

- `[TDB77]` *And Pathrusim, and Casluhim, (of whom came the Philistines,) and * → **Pathrus mite, Kasluh mite (Filistia mite’ hong pian’na), leh Kaft**
- `[TDB77]` *And Ephraim their father mourned many days, and his brethren came* → **Tua ciangin a pa Efraim ni tampi sung kap a, amah hehnem dingin a**
- `[TDB77]` *And there came of the children of Benjamin and Judah to the hold * → **Tua ciangin Benjamin mi leh Judah mi pawlkhat David kiang mun mua**
- `[TDB77]` *And the Philistines came and spread themselves in the valley of R* → **Tu-in Filistiate hong pai-in Refaim kuam sung luh uh hi.**

## say/said

- `[TDB77]` *The sons, I say, of Reuben the firstborn of Israel were, Hanoch, * → **Israel’ tacil Reuben’ tapate in: Hanok, Pallu, Hezron, leh Karmi **
- `[TDB77]` *And David said unto all the congregation of Israel, If it seem go* → **Tua ciangin David in Israel a kikhawm khempeuhte kiangah, “Note i**
- `[TDB77]` *Then David said, None ought to carry the ark of God but the Levit* → **Tua ciangin David in, Topa’ thuciamna singkuang a pua ding leh am**
- `[TDB77]` *Let the heavens be glad, and let the earth rejoice: and let men s* → **Vantung kipak hen la, leitung lungdam hen, minamte lakah, “Topa m**

## give/gave

- `[TDB77]` *And Sheshan gave his daughter to Jarha his servant to wife; and s* → **Tua ahih ciangin Sheshan in a sila Jarha tungah a zi dingin a tan**
- `[TDB77]` *And they gave them Hebron in the land of Judah, and the suburbs t* → **Judah gam sungah Hebron leh a kiim lononate amaute tungah pia uh **
- `[TDB77]` *But the fields of the city, and the villages thereof, they gave t* → **ahih hangin khuapi lote leh a khuaneute Jefunneh’ tapa Kaleb tung**
- `[TDB77]` *And the children of Israel gave to the Levites these cities with * → **Tua ahih ciangin Israel mite in hih bangin Levi mite tungah khuap**

## take/took

- `[TDB77]` *And when Azubah was dead, Caleb took unto him Ephrath, which bare* → **Azubah a sih ciangin Kaleb in Efrath ten’pihin, tua nu in amah ta**
- `[TDB77]` *And David took more wives at Jerusalem: and David begat more sons* → **David in Jerusalem ah zi nei thuahin tapate leh tanute nei hi.**
- `[TDB77]` *And Eleazar died, and had no sons, but daughters: and their breth* → **Eleazar in tapa nei loin si a, tanu bek nei hi; amau’ tanau, Kish**
- `[TDB77]` *But David took not the number of them from twenty years old and u* → **Israel mite vantung aksi zahin a tamin a bawl nading Topa in thuc**

## see/saw

- `[TDB77]` *And when his armourbearer saw that Saul was dead, he fell likewis* → **A galvan puapa in Saul a sihna a muh ciangin amah zong ama namsau**
- `[TDB77]` *And David lifted up his eyes, and saw the angel of the* → **Tua ciangin David khuadak to a, leitung leh vantung kikalah Topa’**
- `[TDB77]` *At that time when David saw that the* → **Tua hunin, Jebus mi Ornan’ ancilna phual ah Topa in ama nget a pi**
- `[TDB77]` *And that he was seen of Cephas, then of the twelve:* → **Kefas kiangah a kilat khit ciangin sawm-le-nihte kiangah a kilang**

## know/knew

- `[TDB77]` *And I baptized also the household of Stephanas: besides, I know n* → **Stefanas-te innkuan zong ka baptaiz hi. Midangte ka baptaiz lam k**
- `[TDB77]` *For I determined not to know any thing among you, save Jesus Chri* → **Bang hang hiam na cih uh leh, note lakah ka om lai takin Zeisu Kh**
- `[TDB77]` *For who hath known the mind of the Lord, that he may instruct him* → **Topa a hilh dingin ama lungsim a thei kua ahi hiam? Eite in ahih **
- `[TDB77]` *Know ye not that ye are the temple of God, and that the Spirit of* → **Note in Pasian’ biakna innpi na hi uh a, Pasian’ Kha Siangtho not**

## love/loved

- `[TDB77]` *What will ye? shall I come unto you with a rod, or in love, and i* → **Koici bang deih na hi uh hiam? Ciangduai tawi-in note kiangah hon**
- `[TDB77]` *But if any man love God, the same is known of him.* → **Mikhat in Pasian a it leh, Pasian in tua mi a thei hi.**
- `[TDB77]` *If any man love not the Lord Jesus Christ, let him be Anathema Ma* → **Mi khat peuhmah in Topa a it kei leh, tua mi in hamsiatna thuak t**
- `[TDB77]` *My love be with you all in Christ Jesus. Amen.* → **Ka itna in Khazih Zeisu sunga om note khempeuh tawh omkhawm ta he**

## eat/ate

- `[TDB77]` *And did eat and drink before the* → **tua ciangin amaute in tua ni-in lungdamna lianpi tawh Topa mai-ah**
- `[TDB77]` *Have we not power to eat and to drink?* → **Kote in an neek na’ng, tui dawn na’ng thuneihna nei lo ka hi uh h**
- `[TDB77]` *And did all eat the same spiritual meat;* → **a vekpi-un kha an a nekhawm uh ahi zongin,**
- `[TDB77]` *Behold Israel after the flesh: are not they which eat of the sacr* → **Ci-le-sa lamsangah Israelte na en ta un. Biakna sa a nete in biak**

## drink/drank

- `[TDB77]` *And did eat and drink before the* → **tua ciangin amaute in tua ni-in lungdamna lianpi tawh Topa mai-ah**
- `[TDB77]` *Have we not power to eat and to drink?* → **Kote in an neek na’ng, tui dawn na’ng thuneihna nei lo ka hi uh h**
- `[TDB77]` *Whether therefore ye eat, or drink, or whatsoever ye do, do all t* → **Tua ahih ciangin note in anneek tuidawn akipan na khempeuh na baw**
- `[TDB77]` *For as often as ye eat this bread, and drink this cup, ye do shew* → **Bang hang hiam na cih uh leh, note in hih khomun ne-in, hih hai n**

## hear/heard

- `[TDB77]` *And when all Jabesh–gilead heard all that the Philistines had don* → **Ahih hangin Jabeshgilead mi khempeuh in Saul tungah Filistiate’ h**
- `[TDB77]` *Now when Tou king of Hamath heard how David had smitten all the h* → **David in Zobah kumpipa Hadadezer’ galkap buppi a zawhna thu Hamat**
- `[TDB77]` *And when David heard of it, he sent Joab, and all the host of the* → **David in tua thu a zak ciangin Joab leh mi thahat galkap khempeuh**
- `[TDB77]` *For this is the message that ye heard from the beginning, that we* → **Note in a cil panin na zak uh thu in, Dawimangpa tawh a kipawl a **

## speak/spoke

- `[TDB77]` *According to all these words, and according to all this vision, s* → **Hih kammalte khempeuh tawh kizui, leh hih mangmuhna khempeuh tawh**
- `[TDB77]` *What can David speak more to thee for the honour of thy servant? * → **Na nasempa nong pahtawina ah David in nang tungah bang gen ding n**
- `[TDB77]` *But I speak this by permission, and not of commandment.* → **Ahih hangin thukham hi loin thupiakna bek hangin hi bangin kong g**
- `[TDB77]` *I speak as to wise men; judge ye what I say.* → **Lungpil mi kiangah ka gen mah bangin note kiangah kong gen hi. Ka**

## do/did

- `[TDB77]` *And when all Jabesh–gilead heard all that the Philistines had don* → **Ahih hangin Jabeshgilead mi khempeuh in Saul tungah Filistiate’ h**
- `[TDB77]` *These things did Benaiah the son of Jehoiada, and had the name am* → **Jehoiada’ tapa Benaiah in hih nate sem a, a thahat mi thumte bana**
- `[TDB77]` *For because ye did it not at the first, the* → **A masa lai-in no Levi mite na om kei uh a, a kisehsa bang danin k**
- `[TDB77]` *Remember his marvellous works that he hath done, his wonders, and* → **Ama hihsa a lamdang nasepte phawk un la, ama hih a lamdangte, a g**

## make/made

- `[TDB77]` *And they made war with the Hagarites, with Jetur, and Naphish, an* → **Amaute in Hagri mite, Jetur mite, Nafish mite, leh Nodab mite zo **
- `[TDB77]` *And some of the sons of the priests made the ointment of the spic* → **Siampite’ ta adangte in a namtui nate hel dingin bawl uh a,**
- `[TDB77]` *Even of the covenant which he made with Abraham, and of his oath * → **Abraham tawh a bawl thuciamna, Isaak tungah kiciamin a khapna,**
- `[TDB77]` *For thy people Israel didst thou make thine own people for ever; * → **Na mi Israelte a tawntungin nangma mi ahi dingin na bawl hi; tua **

## send/sent

- `[TDB77]` *And when David heard of it, he sent Joab, and all the host of the* → **David in tua thu a zak ciangin Joab leh mi thahat galkap khempeuh**
- `[TDB77]` *And God sent an angel unto Jerusalem to destroy it: and as he was* → **Tua ciangin Pasian in a susia dingin Jerusalem ah vantungmi sawl **
- `[TDB77]` *And we have seen and do testify that the Father sent the Son to b* → **Pa in a Tapa leitungmite’ Gumpa a suah nadingin hong sawl thu kot**
- `[TDB77]` *And king Solomon sent by the hand of Benaiah the son of Jehoiada;* → **Tua ahih ciangin Kumpi Solomon in Jehoida’ tapa Benaiah sawl hi; **

## bring/brought

- `[TDB77]` *And let us bring again the ark of our God to us: for we enquired * → **Tua ciangin thuciamna singkuang eite kiangah la kik ni; bang hang**
- `[TDB77]` *And David was afraid of God that day, saying, How shall I bring t* → **Tua ni-in David in Pasian kihta hi; amah in, “Pasian’ thuciamna s**
- `[TDB77]` *And David gathered all Israel together to Jerusalem, to bring up * → **Tua ciangin amah in a bawlsa, ama om nading munah Topa’ thuciamna**
- `[TDB77]` *So the priests and the Levites sanctified themselves to bring up * → **Tua ahih ciangin Israel Pasian, Topa’ thuciamna singkuang a paipi**

## return

- `[TDB77]` *And all the people departed every man to his house: and David ret* → **Tua ciangin mi khempeuh in a inn ciat uhah ciah uh a, David zong **
- `[TDB77]` *And Jeroboam said in his heart, Now shall the kingdom return to t* → **Tua ciangin Jeroboam in a lungsim sungah, “Tu-in kumpigam in Davi**
- `[TDB77]` *So he went another way, and returned not by the way that he came * → **Tua ahih ciangin amah lampi dangah pai-in Beth-el ah hong paina l**
- `[TDB77]` *And Micaiah said, If thou return at all in peace, the* → **Tua ciangin Mikaiah in, “Lungnuam takin nong ciahkik leh Topa in **

## die/died

- `[TDB77]` *And when Bela was dead, Jobab the son of Zerah of Bozrah reigned * → **Bela a sih ciangin ama tangin Bozrah khuami Zerah’ tapa Jobab in **
- `[TDB77]` *And when Jobab was dead, Husham of the land of the Temanites reig* → **Jobab a sih ciangin ama tangin Teman mite’ gam mi Husham in uk hi**
- `[TDB77]` *And when Hadad was dead, Samlah of Masrekah reigned in his stead.* → **Hadad a sih ciangin ama tangin Masrekath khuami Samlah in uk hi.**
- `[TDB77]` *And when Samlah was dead, Shaul of Rehoboth by the river reigned * → **Samlah a sih ciangin ama tangin Eufrates gun gei-a om Rehoboth kh**

## live/lived

- `[TDB77]` *Even so hath the Lord ordained that they which preach the gospel * → **Tua mah bangin Lungdamna Thu a hilhte in Lungdamna Thu pan a kiva**
- `[TDB77]` *That they may fear thee all the days that they live in the land w* → **ka pu ka pate uh tungah na piak leitang tungah a nuntak hun sung **
- `[TDB77]` *And thou shalt not only while yet I live shew me the kindness of * → **Kei ka nuntak lai leh ka sih loh nadingin Topa’ thuman itna kei t**
- `[TDB77]` *For now we live, if ye stand fast in the Lord.* → **Bang hang hiam na cih uh leh, note in Topa sungah na kip uh leh, **

## fear/feared

- `[TDB77]` *Fear before him, all the earth: the world also shall be stable, t* → **leitung mi khempeuh aw, ama mai-ah ling un; hi hi, leitung kip a,**
- `[TDB77]` *And I was with you in weakness, and in fear, and in much tremblin* → **Note tawh ka omkhawm lai takin thanemin, lau-in, liingin ka om hi**
- `[TDB77]` *That they may fear thee all the days that they live in the land w* → **ka pu ka pate uh tungah na piak leitang tungah a nuntak hun sung **
- `[TDB77]` *And Ahab called Obadiah, which was the governor of his house. (No* → **Tua ciangin Ahab in kumpi inn sung a ukpa Obadiah sam hi. (Obadia**

## pray/prayed

- `[TDB77]` *Judge in yourselves: is it comely that a woman pray unto God unco* → **Numei in a mai tuam loin Pasian kiangah thungen leh, a kilawm hia**
- `[TDB77]` *Wherefore let him that speaketh in an unknown tongue pray that he* → **Tua ahih ciangin pau namtuam a gen mi in a khiatna zong a gen the**
- `[TDB77]` *For if I pray in an unknown tongue, my spirit prayeth, but my und* → **Pau namtuam tawh thu ka nget leh, ka lungsim in thu a nget hangin**
- `[TDB77]` *And Jehoshaphat said unto the king of Israel, Enquire, I pray the* → **Tua ciangin Jehoshafat in Israel kumpipa kiangah, “Topa thu dong **

## worship

- `[TDB77]` *And this thing became a sin: for the people went to worship befor* → **Hih na in khialhna khat suak hi; bang hang hiam cih leh mite Beth**
- `[TDB77]` *For he served Baal, and worshipped him, and provoked to anger the* → **Amah in Baal’ na semin bia a, a pa mah bangin a hihna khempeuh ah**
- `[TDB77]` *And this man went up out of his city yearly to worship and to sac* → **Hih mipa a kum kumin a khuapi panin, Eli’ tapa nihte Hofni leh Fi**
- `[TDB77]` *And they rose up in the morning early, and worshipped before the* → **Amaute zingsangin tho baihin Topa mai-ah bia uh hi; tua ciangin a**

## believe

- `[TDB77]` *Therefore whether it were I or they, so we preach, and so ye beli* → **Tua ahih ciangin kei ka hi zongin, amau ahi zongin tua bangin ka **
- `[TDB77]` *So that ye were ensamples to all that believe in Macedonia and Ac* → **Tua ahih ciangin Makedonia gam leh Akhaia gamah thu-um mite khemp**
- `[TDB77]` *If we believe not, yet he abideth faithful: he cannot deny himsel* → **Eite i muanhuai loh hangin, Ama muanhuaina a kip den hi. Bang han**
- `[TDB77]` *And all that believed were together, and had all things common;* → **Thu-um mi khempeuh pawlkhat bekin a om uh a, amaute neihsa khempe**

## ask/asked

- `[TDB77]` *And now I ask one petition of thee, deny me not. And she said unt* → **Tu-in nangma tung panin kong nget ding khat om hi; kei hong nial **
- `[TDB77]` *And the speech pleased the Lord, that Solomon had asked this thin* → **Solomon in hih thu a ngetna in Topa lungkimsak hi.**
- `[TDB77]` *And Jonathan answered Saul, David earnestly asked leave of me to * → **Jonathan in Saul dawngin, “Bethlehem ah a pai dingin lim takin ke**
- `[TDB77]` *Then said Samuel, Wherefore then dost thou ask of me, seeing the* → **Tua ciangin Samuel in, “Topa nang kiang panin kihei khia-in na ga**

## answer

- `[TDB77]` *And Joab answered, The* → **Ahih hangin Joab in, “Topa in a mite a zah za khatin behlap ta he**
- `[TDB77]` *Mine answer to them that do examine me is this,* → **Keimah hong teldotte kiangah ka mawh phel nading hih thu-in ka da**
- `[TDB77]` *And Benaiah the son of Jehoiada answered the king, and said, Amen* → **Tua ciangin Jehoiada’ tapa Benaiah in dawngin, “Hi ta hen! Topa, **
- `[TDB77]` *And Jonathan answered and said to Adonijah, Verily our lord king * → **Jonathan in Adonijah dawngin, “Hilo hi, bang hang hiam cih leh i **

---
<!-- SOURCE: wiki/grammar/tense_markers_corpus.md -->

# Zolai Tense Markers Reference — Corpus Verified

> Sources: Bible (TDB77+TBR17+Tedim2010) + master_source_v1.jsonl + wiki/grammar/*.md

## future (will/shall)

- `[TDB77]` *And David was afraid of God that day, saying, How shall I bring the ar* → **Tua ni-in David in Pasian kihta hi; amah in, “Pasian’ thuciamna singku**
- `[TDB77]` *Saying, Unto thee will I give the land of Canaan, the lot of your inhe* → **“Nangma tungah Kanaan gam hong pia-in, gamhluah dingin na tanh dingin **
- `[TDB77]` *Fear before him, all the earth: the world also shall be stable, that i* → **leitung mi khempeuh aw, ama mai-ah ling un; hi hi, leitung kip a, kilo**
- `[TDB77]` *Then shall the trees of the wood sing out at the presence of the* → **Tua ciangin gamlak singte in lungdamin Topa mai-ah la sa ding uh hi, b**

## past (did/was/were)

- `[TDB77]` *And Ophir, and Havilah, and Jobab. All these were the sons of Joktan.* → **Ofir mite, Havilah mite, leh Jobab mite’ pian’napa ahi hi; hihte khemp**
- `[TDB77]` *And the sons of Lotan; Hori, and Homam: and Timna was Lotan's sister.* → **Lotan’ tapate in Hori leh Homan ahi uh hi; tua ciangin Lotan’ sanggamn**
- `[TDB77]` *And when Bela was dead, Jobab the son of Zerah of Bozrah reigned in hi* → **Bela a sih ciangin ama tangin Bozrah khuami Zerah’ tapa Jobab in uk hi**
- `[TDB77]` *And when Jobab was dead, Husham of the land of the Temanites reigned i* → **Jobab a sih ciangin ama tangin Teman mite’ gam mi Husham in uk hi.**

## perfect (has/have had)

- `[TDB77]` *And Segub begat Jair, who had three and twenty cities in the land of G* → **Segub in Jair’ pa hi a, Gilead gam sungah khuapi sawmnih-le-thum nei h**
- `[TDB77]` *Jerahmeel had also another wife, whose name was Atarah; she was the mo* → **Jerahme-el in a zi dang khat zong nei a, a min in Atarah ahi hi; amah **
- `[TDB77]` *Now Sheshan had no sons, but daughters. And Sheshan had a servant, an * → **Tu-in Sheshan in tapa nei loin tanu bek nei hi; ahih hangin Sheshan in**
- `[TDB77]` *And Shobal the father of Kirjath–jearim had sons; Haroeh, and half of * → **Kiriath-jearim khuapi a sat Shobal in tapa nei hi: Haroeh leh Menuhoth**

## already/completed

- `[TDB77]` *Then David said, None ought to carry the ark of God but the Levites: f* → **Tua ciangin David in, Topa’ thuciamna singkuang a pua ding leh ama na **
- `[TDB77]` *Remember his marvellous works that he hath done, his wonders, and the * → **Ama hihsa a lamdang nasepte phawk un la, ama hih a lamdangte, a genkhi**
- `[TDB77]` *And hath confirmed the same to Jacob for a law, and to Israel for an e* → **Jakob tungah thukhamin amah in a kipsak, Israel tungah tawntung thucia**
- `[TDB77]` *But God hath revealed them unto us by his Spirit: for the Spirit searc* → **Pasian in ama Kha Siangtho tawh tua nate eite hong lak hi. Bang ci hia**

## not yet

- `[TDB77]` *Now Samuel did not yet know the* → **Tu-in Samuel in Topa thei nai lo hi; bang hang hiam cih leh Topa in am**
- `[TDB77]` *Ever learning, and never able to come to the knowledge of the truth.* → **a kihilh niloh hangin cikmah hunin thuman thutak a thei thei lo numei **
- `[TDB77]` *But Peter said, Not so, Lord; for I have never eaten any thing that is* → **Piter in, “Topa aw, hi thei lo ding hi. Bang hang hiam na cih leh, a s**
- `[TDB77]` *Yea, better is he than both they, which hath not yet been, who hath no* → **Mihing-a hong piang nai lo, hih leitung gitlohna teng a mu nai lote ha**

## continuous (-ing)

- `[TDB77]` *And the sons of Carmi; Achar, the troubler of Israel, who transgressed* → **Karmi’ tapa in: A ki-ap nate-ah a khial, Israel a nawngkaisak Akhar ah**
- `[TDB77]` *The third, Absalom the son of Maacah the daughter of Talmai king of Ge* → **Geshur kumpipa Talmai’ tanu, a nu Ma-akah a hi a thumna Absalom; a nu **
- `[TDB77]` *These were the potters, and those that dwelt among plants and hedges: * → **Hihte in beelseekte hi a, Netaim khua leh Gederah khua ah a teengte ah**
- `[TDB77]` *Beerah his son, whom Tilgath–pilneser king of Assyria carried away cap* → **a tapa Be-erah hi a, Assiria kumpipa Tilgath-pilneser in amau’ minam m**

---
<!-- SOURCE: wiki/grammar/particles_corpus.md -->

# Zolai Particles & Conjunctions Reference — Corpus Verified

> Sources: Bible (TDB77+TBR17+Tedim2010) + master_source_v1.jsonl + wiki/grammar/*.md

## and

- `[TDB77]` *Noah, Shem, Ham, and Japheth.* → **Lamek’ ta Noah, Noah in tapa thum nei a, tuate in Shem, Ham leh Jafeth**
- `[TDB77]` *The sons of Japheth; Gomer, and Magog, and Madai, and Javan, and Tubal* → **Jafeth’ tapate in: Gomer, Magog, Madai, Javan, Tubal, Meshek, leh Tira**
- `[TDB77]` *And the sons of Gomer; Ashkenaz, and Riphath, and Togarmah.* → **Gomer’ suante in: Ashkenaz mite, Rifath mite, leh Togarmah mite ahi hi**
- `[TDB77]` *And the sons of Javan; Elishah, and Tarshish, Kittim, and Dodanim.* → **Javan’ suante in: Elishah mite, Tarshish mite, Kittim mite leh Rodanim**

## but

- `[TDB77]` *And the sons of Nadab; Seled, and Appaim: but Seled died without child* → **Nadab’ tapate in: Seled leh Appaim ahi uh hi; Seled in ta nei loin si **
- `[TDB77]` *Now Sheshan had no sons, but daughters. And Sheshan had a servant, an * → **Tu-in Sheshan in tapa nei loin tanu bek nei hi; ahih hangin Sheshan in**
- `[TDB77]` *For Judah prevailed above his brethren, and of him came the chief rule* → **Judah in a sanggamte lakah a thahat suakin ama sung panin ulian khat a**
- `[TDB77]` *But the fields of the city, and the villages thereof, they gave to Cal* → **ahih hangin khuapi lote leh a khuaneute Jefunneh’ tapa Kaleb tungah pi**

## because

- `[TDB77]` *And Meonothai begat Ophrah: and Seraiah begat Joab, the father of the * → **Meonothai in Ofraih’ pa ahi hi; Seraiah in Joab’ pa hi a, Joab in Geha**
- `[TDB77]` *These were the potters, and those that dwelt among plants and hedges: * → **Hihte in beelseekte hi a, Netaim khua leh Gederah khua ah a teengte ah**
- `[TDB77]` *And they went to the entrance of Gedor, even unto the east side of the* → **A tuuhonte uh adingin lonona zong dingin kuam nisuahna lam pang, Gedor**
- `[TDB77]` *For Judah prevailed above his brethren, and of him came the chief rule* → **Judah in a sanggamte lakah a thahat suakin ama sung panin ulian khat a**

## therefore

- `[TDB77]` *So they and their children had the oversight of the gates of the house* → **Tua ahih ciangin amaute leh a suan a khakte un Topa’ inn kulhkongpite **
- `[TDB77]` *So Saul died, and his three sons, and all his house died together.* → **Tua bangin Saul si hi; amah leh a tapa thumte leh a innkuan khempeuh s**
- `[TDB77]` *So Saul died for his transgression which he committed against the* → **Tua ahih ciangin a thuman’lohna hangin Saul si hi; amah in Topa’ thupi**
- `[TDB77]` *Therefore came all the elders of Israel to the king to Hebron; and Dav* → **Tua ahih ciangin Israel upate khempeuh kumpipa kiang Hebron ah hong pa**

## if

- `[TDB77]` *And David said unto all the congregation of Israel, If it seem good un* → **Tua ciangin David in Israel a kikhawm khempeuhte kiangah, “Note in kil**
- `[TDB77]` *Then shalt thou prosper, if thou takest heed to fulfil the statutes an* → **Tua ciangin Israelte’ adingin Topa in Moses a piak thukhamte leh biakn**
- `[TDB77]` *Now if any man build upon this foundation gold, silver, precious stone* → **Tua khuam tungah kham, ngun, suangmanpha, sing, lopa, buhkungte a lam **
- `[TDB77]` *If any man's work abide which he hath built thereupon, he shall receiv* → **Tua khuam tungah zomin a lam mi in a nasepna a kip leh, thaman a ngah **

## when

- `[TDB77]` *And when Bela was dead, Jobab the son of Zerah of Bozrah reigned in hi* → **Bela a sih ciangin ama tangin Bozrah khuami Zerah’ tapa Jobab in uk hi**
- `[TDB77]` *And when Jobab was dead, Husham of the land of the Temanites reigned i* → **Jobab a sih ciangin ama tangin Teman mite’ gam mi Husham in uk hi.**
- `[TDB77]` *And when Hadad was dead, Samlah of Masrekah reigned in his stead.* → **Hadad a sih ciangin ama tangin Masrekath khuami Samlah in uk hi.**
- `[TDB77]` *And when Samlah was dead, Shaul of Rehoboth by the river reigned in hi* → **Samlah a sih ciangin ama tangin Eufrates gun gei-a om Rehoboth khuami **

## until

- `[TDB77]` *For there fell down many slain, because the war was of God. And they d* → **Tua gal in Pasian’ gal ahih manin mi tampi tak kithatin puk hi. Tua ci**
- `[TDB77]` *For at that time day by day there came to David to help him, until it * → **Pasian’ galkap hon bangin galkap hon tampi a phak dongin a ni ni-in Da**
- `[TDB77]` *For as often as ye eat this bread, and drink this cup, ye do shew the * → **Bang hang hiam na cih uh leh, note in hih khomun ne-in, hih hai na daw**
- `[TDB77]` *For he must reign, till he hath put all enemies under his feet.* → **Pasian in galte khempeuh ama khe nuai-ah a khiat khit dong matengin Kh**

## although

- `[TDB77]` *Now some are puffed up, as though I would not come to you.* → **Kei hong pai lo ding ci-in mi kimkhat in a kihisak uh hi.**
- `[TDB77]` *But this I say, brethren, the time is short: it remaineth, that both t* → **Ute naute aw, ke’n kong cih-inah, a hun a tom ahih ciangin zi neite in**
- `[TDB77]` *For though there be that are called gods, whether in heaven or in eart* → **pasian a tampi leh topa a tampi a om bangin, vantung leh leitungah pas**
- `[TDB77]` *For though I be free from all men, yet have I made myself servant unto* → **Keimah in kuamah’ sila ka hih loh hangin mi tampi ka ngah nadingin mi **

## then

- `[TDB77]` *These are their generations: The firstborn of Ishmael, Nebaioth; then * → **Hihte in amau’ khangsimna ahi hi: Ishmael’ tacil in Nebaioth ahi hi; t**
- `[TDB77]` *And after that Hezron was dead in Caleb–ephratah, then Abiah Hezron's * → **Hezron a sih khit ciangin Kaleb in a pa Hezron’ zi Efrath luppih a, tu**
- `[TDB77]` *And his firstborn son Abdon, then Zur, and Kish, and Baal, and Ner, an* → **a tapa upa pen in Abdon, tua ciangin Zur, Kish, Baal, Ner, Nadab,**
- `[TDB77]` *Then all Israel gathered themselves to David unto Hebron, saying, Beho* → **Tua ciangin Israel mi khempeuh David kiang Hebron ah kikhawm uh a, “En**

## also/too

- `[TDB77]` *The Jebusite also, and the Amorite, and the Girgashite,* → **leh Jubus mite, Amor mite, Girgash mite,**
- `[TDB77]` *Hadoram also, and Uzal, and Diklah,* → **Hadoram mite, Uzal mite, Diklah mite,**
- `[TDB77]` *Hadad died also. And the dukes of Edom were; duke Timnah, duke Alvah, * → **Tua ciangin Hadad si hi. Edom ukpite in: ukpi Timna, Aliah, Jetheth,**
- `[TDB77]` *The sons also of Hezron, that were born unto him; Jerahmeel, and gam, * → **Ama sung panin a suak Hezron’ tapate in: Jerahme-el, gam, leh Khelubai**

---
<!-- SOURCE: wiki/grammar/questions_corpus.md -->

# Zolai Question Words Reference — Corpus Verified

> Sources: Bible (TDB77+TBR17+Tedim2010) + master_source_v1.jsonl + wiki/grammar/*.md

## who

- `[TDB77]` *And the sons of Carmi; Achar, the troubler of Israel, who transgressed* → **Karmi’ tapa in: A ki-ap nate-ah a khial, Israel a nawngkaisak Akhar ah**
- `[TDB77]` *And Segub begat Jair, who had three and twenty cities in the land of G* → **Segub in Jair’ pa hi a, Gilead gam sungah khuapi sawmnih-le-thum nei h**
- `[TDB77]` *And Bela the son of Azaz, the son of Shema, the son of Joel, who dwelt* → **leh Joel mite beh sung panin Shema tapa Azaz, a tapa Bela ahi hi. Nebo**
- `[TDB77]` *And his brother Asaph, who stood on his right hand, even Asaph the son* → **Asaf in lasa pawl a nihna a makaipa hi a, ama khangsimna a pupi Levi l**

## what

- `[TDB77]` *What can David speak more to thee for the honour of thy servant? for t* → **Na nasempa nong pahtawina ah David in nang tungah bang gen ding nei na**
- `[TDB77]` *What will ye? shall I come unto you with a rod, or in love, and in the* → **Koici bang deih na hi uh hiam? Ciangduai tawi-in note kiangah hong pai**
- `[TDB77]` *For what have I to do to judge them also that are without? do not ye j* → **Bang hang hiam na cih uh leh, a pualam mite thukhenna tawh bang kikum **
- `[TDB77]` *What? know ye not that he which is joined to an harlot is one body? fo* → **Numei gilo tawh kipawlte in numei gilo tawh pumkhat sakhat ahi uh hi c**

## where

- `[TDB77]` *And David and all Israel went to Jerusalem, which is Jebus; where the * → **Tua ciangin Jebus mite a ten’na, Jebus a kici Jerusalem ah David leh I**
- `[TDB77]` *If the whole body were an eye, where were the hearing? If the whole we* → **Pumpi khempeuh in mittang ahih leh, bang ci-a khua za ding hiam? Pumpi**
- `[TDB77]` *And if they were all one member, where were the body?* → **Tuate khempeuh in na khat ahih leh, pumpi koi-a om ding hiam?**
- `[TDB77]` *O death, where is thy sting? O grave, where is thy victory?* → **‘Sihna aw, na zawhna koi lai-ah om hiam? Sihna aw, na gu koi lai-ah a **

## when

- `[TDB77]` *And when Bela was dead, Jobab the son of Zerah of Bozrah reigned in hi* → **Bela a sih ciangin ama tangin Bozrah khuami Zerah’ tapa Jobab in uk hi**
- `[TDB77]` *And when Jobab was dead, Husham of the land of the Temanites reigned i* → **Jobab a sih ciangin ama tangin Teman mite’ gam mi Husham in uk hi.**
- `[TDB77]` *And when Hadad was dead, Samlah of Masrekah reigned in his stead.* → **Hadad a sih ciangin ama tangin Masrekath khuami Samlah in uk hi.**
- `[TDB77]` *And when Samlah was dead, Shaul of Rehoboth by the river reigned in hi* → **Samlah a sih ciangin ama tangin Eufrates gun gei-a om Rehoboth khuami **

## why

- `[TDB77]` *Conscience, I say, not thine own, but of the other: for why is my libe* → **Kitheihna lungsim ka cihna ah, nangma kitheih theihna lungsim ka cihna**
- `[TDB77]` *For if I by grace be a partaker, why am I evil spoken of for that for * → **Lungdamna kohna tawh hehpihna phatin an ka nek leh, bang hangin gensia**
- `[TDB77]` *And why stand we in jeopardy every hour?* → **Kote in zong hong tung ding gimna tawh bang hangin kituak niloh ka hi **
- `[TDB77]` *Why then hast thou not kept the oath of the* → **Tua ahih ciangin bang hangin Topa tungah na kiciamna leh nang hong thu**

## how

- `[TDB77]` *And David was afraid of God that day, saying, How shall I bring the ar* → **Tua ni-in David in Pasian kihta hi; amah in, “Pasian’ thuciamna singku**
- `[TDB77]` *Now when Tou king of Hamath heard how David had smitten all the host o* → **David in Zobah kumpipa Hadadezer’ galkap buppi a zawhna thu Hamath kum**
- `[TDB77]` *Know ye not that we shall judge angels? how much more things that pert* → **Eite in vantungmite thu i khen ding thei lo na hi uh hiam? Tua ahih ci**
- `[TDB77]` *But he that is married careth for the things that are of the world, ho* → **Zi nei mi ahih leh, a zi lungdamsak nadingin leitung thu a ngaihsun hi**

## which

- `[TDB77]` *And when Azubah was dead, Caleb took unto him Ephrath, which bare him * → **Azubah a sih ciangin Kaleb in Efrath ten’pihin, tua nu in amah tawh Hu**
- `[TDB77]` *And Chelub the brother of Shuah begat Mehir, which was the father of E* → **Shuhah’ sanggampa Khelub in Mehir’ pa hi a, Mehir in Eshton’ pa ahi hi**
- `[TDB77]` *And their brethren, which were in their villages, were to come after s* → **tua ciangin amau’ khuaneute sungah a om a behte uh hih mite tawh a om **
- `[TDB77]` *So Saul died for his transgression which he committed against the* → **Tua ahih ciangin a thuman’lohna hangin Saul si hi; amah in Topa’ thupi**

## how many

- `[TDB77]` *Know ye not that we shall judge angels? how much more things that pert* → **Eite in vantungmite thu i khen ding thei lo na hi uh hiam? Tua ahih ci**
- `[TDB77]` *Then Ananias answered, Lord, I have heard by many of this man, how muc* → **Ananias in, “Topa aw, hih pa in Jerusalem khua-ah na misiangtho hi zah**
- `[TDB77]` *How much less in them that dwell in houses of clay, whose foundation i* → **inn umna kawm dingin buan-a kizatna inn sunga teeng mite, a inn bulpi **
- `[TDB77]` *How much less shall I answer him, and choose out my words to reason wi* → **Tua ahih ciangin ke’n amah bangci dawn thei loh zaw kan ding a, amah k**

---
<!-- SOURCE: wiki/grammar/directional_particles_corpus.md -->

# Zolai Directional Particles Reference — Corpus Verified

> Sources: Bible (TDB77+TBR17+Tedim2010) + master_source_v1.jsonl + wiki/grammar/*.md

## come (toward)

- `[TDB77]` *And Pathrusim, and Casluhim, (of whom came the Philistines,) and Capht* → **Pathrus mite, Kasluh mite (Filistia mite’ hong pian’na), leh Kaftor mi**
- `[TDB77]` *For Judah prevailed above his brethren, and of him came the chief rule* → **Judah in a sanggamte lakah a thahat suakin ama sung panin ulian khat a**
- `[TDB77]` *And Ephraim their father mourned many days, and his brethren came to c* → **Tua ciangin a pa Efraim ni tampi sung kap a, amah hehnem dingin a sang**
- `[TDB77]` *And their brethren, which were in their villages, were to come after s* → **tua ciangin amau’ khuaneute sungah a om a behte uh hih mite tawh a om **

## go (away)

- `[TDB77]` *And they went to the entrance of Gedor, even unto the east side of the* → **A tuuhonte uh adingin lonona zong dingin kuam nisuahna lam pang, Gedor**
- `[TDB77]` *And Jehozadak went into captivity, when the* → **Topa in Nebukhadnezzar’ khut tawh Judah leh Jerusalem sal-in a mat cia**
- `[TDB77]` *And the battle went sore against Saul, and the archers hit him, and he* → **Gal kidona in Saul neh mahmah a, thaltawite in amah pha hi; thaltawite**
- `[TDB77]` *And David and all Israel went to Jerusalem, which is Jebus; where the * → **Tua ciangin Jebus mite a ten’na, Jebus a kici Jerusalem ah David leh I**

## bring (toward)

- `[TDB77]` *And certain of them had the charge of the ministering vessels, that th* → **Amaute pawlkhat in biakinn sunga kizang um-le-beelte uk uh hi; bang ha**
- `[TDB77]` *And let us bring again the ark of our God to us: for we enquired not a* → **Tua ciangin thuciamna singkuang eite kiangah la kik ni; bang hang hiam**
- `[TDB77]` *And David was afraid of God that day, saying, How shall I bring the ar* → **Tua ni-in David in Pasian kihta hi; amah in, “Pasian’ thuciamna singku**
- `[TDB77]` *And David gathered all Israel together to Jerusalem, to bring up the a* → **Tua ciangin amah in a bawlsa, ama om nading munah Topa’ thuciamna sing**

## take (away)

- `[TDB77]` *And when Azubah was dead, Caleb took unto him Ephrath, which bare him * → **Azubah a sih ciangin Kaleb in Efrath ten’pihin, tua nu in amah tawh Hu**
- `[TDB77]` *And David took more wives at Jerusalem: and David begat more sons and * → **David in Jerusalem ah zi nei thuahin tapate leh tanute nei hi.**
- `[TDB77]` *And David took the shields of gold that were on the servants of Hadare* → **Tua ciangin David in Hadadezer’ nasemte in a puak kham kibawl lumte la**
- `[TDB77]` *And Eleazar died, and had no sons, but daughters: and their brethren t* → **Eleazar in tapa nei loin si a, tanu bek nei hi; amau’ tanau, Kish’ tap**

## send

- `[TDB77]` *And Shaharaim begat children in the country of Moab, after he had sent* → **Shaharaim in a zite ahi Hushim leh Baara a mak khit ciangin Moab gam s**
- `[TDB77]` *And when David heard of it, he sent Joab, and all the host of the migh* → **David in tua thu a zak ciangin Joab leh mi thahat galkap khempeuh sawl**
- `[TDB77]` *And God sent an angel unto Jerusalem to destroy it: and as he was dest* → **Tua ciangin Pasian in a susia dingin Jerusalem ah vantungmi sawl hi; a**
- `[TDB77]` *And when I come, whomsoever ye shall approve by your letters, them wil* → **Ka hong tun’ ciangin mi na deihte uh laitai sakin na piak uh sumpi Jer**

## return/come back

- `[TDB77]` *And Jeroboam said in his heart, Now shall the kingdom return to the ho* → **Tua ciangin Jeroboam in a lungsim sungah, “Tu-in kumpigam in David inn**
- `[TDB77]` *And Micaiah said, If thou return at all in peace, the* → **Tua ciangin Mikaiah in, “Lungnuam takin nong ciahkik leh Topa in kei t**
- `[TDB77]` *And Samuel spake unto all the house of Israel, saying, If ye do return* → **Tua ciangin Samuel in Israel mite khempeuh kiangah, “Na lungsim khempe**
- `[TDB77]` *And his return was to Ramah; for there was his house; and there he jud* → **Tua ciangin Ramah-ah amah ciahkik zel hi; bang hang hiam cih leh tua l**

## go up

- `[TDB77]` *And David went up at the saying of Gad, which he spake in the name of * → **Tua ahih ciangin Topa’ min tawh a gen Gad’ kammal bangin David paito h**
- `[TDB77]` *If this people go up to do sacrifice in the house of the* → **Jerusalem a, Topa’ innah biakna pia dingin hih mite paito leh, hih mit**
- `[TDB77]` *And Omri went up from Gibbethon, and all Israel with him, and they bes* → **Tua ahih ciangin Omri leh amah tawh a om Israel khempeuh Gibbethon pan**
- `[TDB77]` *And all the prophets prophesied so, saying, Go up to Ramoth–gilead, an* → **Kamsang khempeuh in zong tua mah bangin genin, “Ramoth-gilead ah kuant**

## go down

- `[TDB77]` *Do therefore according to thy wisdom, and let not his hoar head go dow* → **Tua ahih ciangin nangma pilna bangin gamta in la, ahih hangin lungnuam**
- `[TDB77]` *And Saul called all the people together to war, to go down to Keilah, * → **Tua ciangin Saul in galdo ding, Keilah ah a paisuk ding, David leh a m**
- `[TDB77]` *So Jacob went down into Egypt, and died, he, and our fathers,* → **Izipt gamah Jakob paisuk a, amah leh i pate zong tua gamah a si khin u**
- `[TDB77]` *Then Philip went down to the city of Samaria, and preached Christ unto* → **Filip in Samaria khua-ah pai-in Khazih thu a gen hi.**

## go out

- `[TDB77]` *And the fame of David went out into all lands; and the* → **Tua ciangin David minthan’na in gam khempeuh zel a, Topa in minam khem**
- `[TDB77]` *And it came to pass, when the priests were come out of the holy place,* → **Siangtho Mun panin siampite a paikhiat ciangin meii in Topa’ inn tuam **
- `[TDB77]` *If thy people go out to battle against their enemy, whithersoever thou* → **“A galte uh do dingin na mite kuan khia-in, bangbang lamah amaute sawl**
- `[TDB77]` *Then Jeroboam built Shechem in mount Ephraim, and dwelt therein; and w* → **Tua ciangin Jeroboam in Efraim mualtung gam sungah Shekhem khua lamin **

## go in/enter

- `[TDB77]` *And, lo, while she yet talked with the king, Nathan the prophet also c* → **Tua nu kumpipa tawh kiho-in a om lai takin kamsangpa Nathan hong tum h**
- `[TDB77]` *Arise thou therefore, get thee to thine own house: and when thy feet e* → **Tua ahih ciangin ding in la, na innah ciah in. Na khua na tun’ ciangin**
- `[TDB77]` *Then Eli answered and said, Go in peace: and the God of Israel grant t* → **Tua ciangin Eli in dawngin, “Nuam takin pai in, Israelte’ Pasian in am**
- `[TDB77]` *But all Israel and Judah loved David, because he went out and came in * → **Ahih hangin Israelte khempeuh leh Judahte khempeuh in David it uh hi; **

---
<!-- SOURCE: wiki/grammar/adjectives_corpus.md -->

# Zolai Common Adjectives Reference — Corpus Verified

> Sources: Bible (TDB77+TBR17+Tedim2010) + master_source_v1.jsonl + wiki/grammar/*.md

## good

- `[TDB77]` *And David said unto all the congregation of Israel, If it seem good un* → **Tua ciangin David in Israel a kikhawm khempeuhte kiangah, “Note in kil**
- `[TDB77]` *Be of good courage, and let us behave ourselves valiantly for our peop* → **Hang in, i mite ading leh i Pasian’ khuapite’ ading pasal tat ni; Topa**
- `[TDB77]` *And David said to Solomon his son, Be strong and of good courage, and * → **Tua ciangin David in a tapa Solomon kiangah, “Thakhauhin hang in la, s**
- `[TDB77]` *And he died in a good old age, full of days, riches, and honour: and S* → **Tua ciangin a khangham, a ni cing, hauhna leh minphatna tawh si hi; tu**

## great

- `[TDB77]` *For at that time day by day there came to David to help him, until it * → **Pasian’ galkap hon bangin galkap hon tampi a phak dongin a ni ni-in Da**
- `[TDB77]` *For great is the* → **Bang hang hiam cih leh Topa lian a, nakpi takin phat ding ahi hi; pasi**
- `[TDB77]` *And David said unto Gad, I am in a great strait: let me fall now into * → **Tua ciangin David in Gad kiangah, “Keimah in lungkhamna lianpi khat ka**
- `[TDB77]` *And they cast lots, ward against ward, as well the small as the great,* → **Tua ciangin a neu a lian, sia leh a sinte a kibangin, amaute in amau’ **

## holy

- `[TDB77]` *Glory ye in his holy name: let the heart of them rejoice that seek the* → **Ama min siangtho hangin nuamin diang un la, Topa a zong mite lungdam t**
- `[TDB77]` *If any man defile the temple of God, him shall God destroy; for the te* → **Mikhat in Pasian’ biakna innpi a sukgawp leh, Pasian in tua pa a sugaw**
- `[TDB77]` *All the brethren greet you. Greet ye one another with an holy kiss.* → **Ute naute khempeuh in note hong hopih uh hi. Khat leh khat a siangtho **
- `[TDB77]` *But ye have an unction from the Holy One, and ye know all things.* → **Note in Siangtho Pa’ Kha Siangtho sathau nilhsa na hi uh a, na khempeu**

## righteous

- `[TDB77]` *And his brother Asaph, who stood on his right hand, even Asaph the son* → **Asaf in lasa pawl a nihna a makaipa hi a, ama khangsimna a pupi Levi l**
- `[TDB77]` *And all the congregation said that they would do so: for the thing was* → **Tua thu mi khempeuh in hoih sa ahih manin tua bangin hih ding a kikhaw**
- `[TDB77]` *If ye know that he is righteous, ye know that every one that doeth rig* → **Amah in midik ahih note in na theih uh leh, dikna thu a sem mi khempeu**
- `[TDB77]` *Little children, let no man deceive you: he that doeth righteousness i* → **Ka ta neute aw, lam hong khialsak thei dingin kuamah kizolsak kei un. **

## evil

- `[TDB77]` *Now these things were our examples, to the intent we should not lust a* → **Amaute in a hoih lote a deihgawh uh bangin i deihgawh loh nadingin hih**
- `[TDB77]` *For if I by grace be a partaker, why am I evil spoken of for that for * → **Lungdamna kohna tawh hehpihna phatin an ka nek leh, bang hangin gensia**
- `[TDB77]` *Doth not behave itself unseemly, seeketh not her own, is not easily pr* → **a kituak loin a gamta kei hi, ama phat nading a zong kei hi, a heh bai**
- `[TDB77]` *Be not deceived: evil communications corrupt good manners.* → **Na kikheem kei un, ‘Mipha lote tawh kikholhna hangin gamtatna pha kisi**

## strong

- `[TDB77]` *The sons of Shemaiah; Othni, and Rephael, and Obed, Elzabad, whose bre* → **Shemaiah’ tapate in: Othni, Refael, Obed, Elzabad leh a sanggamte siam**
- `[TDB77]` *And Meshelemiah had sons and brethren, strong men, eighteen.* → **Tua ciangin Meshelemiah in siamna a nei tapate leh sanggamte, sawm-le-**
- `[TDB77]` *And David said to Solomon his son, Be strong and of good courage, and * → **Tua ciangin David in a tapa Solomon kiangah, “Thakhauhin hang in la, s**
- `[TDB77]` *Watch ye, stand fast in the faith, quit you like men, be strong.* → **Note in kikemin ngak un. Upna ah na kip un. Pasal tawh kibangin thacin**

## small

- `[TDB77]` *And they cast lots, ward against ward, as well the small as the great,* → **Tua ciangin a neu a lian, sia leh a sinte a kibangin, amaute in amau’ **
- `[TDB77]` *And they cast lots, as well the small as the great, according to the h* → **amaute in a neu a lian a kibangin a pate uh innkuan kuanin amau’ kongp**
- `[TDB77]` *Your glorying is not good. Know ye not that a little leaven leaveneth * → **Na kisaktheihna uh a hoih kei hi. Silngo tawmkha in annel sial lom kha**
- `[TDB77]` *I write unto you, little children, because your sins are forgiven you * → **Ka ta neute aw, ama min hangin na mawhna uh a kimaisak ahih ciangin, n**

## many

- `[TDB77]` *For there fell down many slain, because the war was of God. And they d* → **Tua gal in Pasian’ gal ahih manin mi tampi tak kithatin puk hi. Tua ci**
- `[TDB77]` *And Ephraim their father mourned many days, and his brethren came to c* → **Tua ciangin a pa Efraim ni tampi sung kap a, amah hehnem dingin a sang**
- `[TDB77]` *Also cedar trees in abundance: for the Zidonians and they of Tyre brou* → **taamtaak singte sim zawh hi lo hi; bang hang hiam cih leh Sibon khuami**
- `[TDB77]` *And I was with you in weakness, and in fear, and in much trembling.* → **Note tawh ka omkhawm lai takin thanemin, lau-in, liingin ka om hi.**

## all

- `[TDB77]` *And Ophir, and Havilah, and Jobab. All these were the sons of Joktan.* → **Ofir mite, Havilah mite, leh Jobab mite’ pian’napa ahi hi; hihte khemp**
- `[TDB77]` *And the sons of Midian; Ephah, and Epher, and Hanoch, and Abida, and E* → **Midian’ tapate in: Efah, Efer, Hanok, Abida, leh Elda-ah ahi uh hi. Hi**
- `[TDB77]` *And Tamar his daughter in law bare him Pharez and Zerah. All the sons * → **A tapa’ zi Tamar in zong amah tawh Perez leh Zerah nei hi. Judah in a **
- `[TDB77]` *And the sons of Zerah; Zimri, and Ethan, and Heman, and Calcol, and Da* → **Zeran’ tapate in: Zimri, Ethan, Heman, Kalkol, leh Dara, a vekpi-in ng**

## new

- `[TDB77]` *And they carried the ark of God in a new cart out of the house of Abin* → **Amaute in Abinadab’ inn panin leeng thak khat tungah Pasian’ thuciamna**
- `[TDB77]` *And Ahijah caught the new garment that was on him, and rent it in twel* → **Tua ciangin Ahijah in ama tungah a silh a puanthak lenin seh sawm-le-n**
- `[TDB77]` *Then Jonathan said to David, To morrow is the new moon: and thou shalt* → **Tua ciangin Jonathan in ama kiangah, “Zing ciang in kha det ni ahi hi;**
- `[TDB77]` *So David hid himself in the field: and when the new moon was come, the* → **Tua ahih ciangin David lo sungah bu hi; kha det ni hong tun’ ciangin a**

## old

- `[TDB77]` *So when David was old and full of days, he made Solomon his son king o* → **Tu-in David teekin kum tampi pha a, amah in Israel tungah kumpi-in a t**
- `[TDB77]` *For by the last words of David the Levites were numbered from twenty y* → **Bang hang hiam cih leh David’ thupiakna a nunung pen tawh a kisim hiht**
- `[TDB77]` *But David took not the number of them from twenty years old and under:* → **Israel mite vantung aksi zahin a tamin a bawl nading Topa in thuciam k**
- `[TDB77]` *And he died in a good old age, full of days, riches, and honour: and S* → **Tua ciangin a khangham, a ni cing, hauhna leh minphatna tawh si hi; tu**

## first

- `[TDB77]` *Of the three, he was more honourable than the two; for he was their ca* → **Amah in mihing sawmthumte sung panin a minthang pen hi a, amaute a ukp**
- `[TDB77]` *Behold, he was honourable among the thirty, but attained not to the fi* → **Mihing sawmthumte lakah amah minthang a, ahih hangin amah in mi thumte**
- `[TDB77]` *Ezer the first, Obadiah the second, Eliab the third,* → **A ukpi Ezer, a nihna Obadiah, a thumna Eliab,**
- `[TDB77]` *For because ye did it not at the first, the* → **A masa lai-in no Levi mite na om kei uh a, a kisehsa bang danin kem lo**

## last

- `[TDB77]` *For by the last words of David the Levites were numbered from twenty y* → **Bang hang hiam cih leh David’ thupiakna a nunung pen tawh a kisim hiht**
- `[TDB77]` *And last of all he was seen of me also, as of one born out of due time* → **A nunung belin a hun cing lopi-a suak keima kiangah hong kilang hi.**
- `[TDB77]` *The last enemy that shall be destroyed is death.* → **A khakbel a gal ahi sihna mangpa in lelhna a thuak ding hi.**
- `[TDB77]` *And so it is written, The first man Adam was made a living soul; the l* → **Lai Siangtho sungah a kigelh mah bangin, “A masa bel Adam in a nungta **

---
<!-- SOURCE: wiki/grammar/numbers_corpus.md -->

# Zolai Numbers Reference — Corpus Verified

> Sources: Bible (TDB77+TBR17+Tedim2010) + master_source_v1.jsonl + wiki/grammar/*.md

## one

- `[TDB77]` *And after him was Eleazar the son of Dodo, the Ahohite, who was one of* → **Tua ciangin a thahat mihing thumte lak panin amah a zompa in Ahoah-te **
- `[TDB77]` *And David longed, and said, Oh that one would give me drink of the wat* → **Tua ciangin David in, “Kulhkongpi gei-a Bethlehem tuikhuk panin mi kha**
- `[TDB77]` *Of the three, he was more honourable than the two; for he was their ca* → **Amah in mihing sawmthumte sung panin a minthang pen hi a, amaute a ukp**
- `[TDB77]` *Behold, he was honourable among the thirty, but attained not to the fi* → **Mihing sawmthumte lakah amah minthang a, ahih hangin amah in mi thumte**

## two

- `[TDB77]` *And Jesse begat his firstborn Eliab, and Abinadab the second, and Shim* → **Jessi in a tacil Eliab, a nihna Abinadab, thumna Shimea,**
- `[TDB77]` *And the sons of Josiah were, the firstborn Johanan, the second Jehoiak* → **Josiah’ tapate in: A tacil Johanan, a nihna Jehoiakim, a thumna Zedeki**
- `[TDB77]` *And Ashur the father of Tekoa had two wives, Helah and Naarah.* → **Tekoa khuapi a sat Ashur in zi nih, Helah leh Na-arah nei hi;**
- `[TDB77]` *Now Benjamin begat Bela his firstborn, Ashbel the second, and Aharah t* → **Benjamin in a tacil Bela, a nihna Ashbel, a thumna Aharah,**

## three

- `[TDB77]` *And Jesse begat his firstborn Eliab, and Abinadab the second, and Shim* → **Jessi in a tacil Eliab, a nihna Abinadab, thumna Shimea,**
- `[TDB77]` *Whose sisters were Zeruiah, and Abigail. And the sons of Zeruiah; Abis* → **amau’ sanggamnumeite in Zeru-iah leh Abigail ahi uh hi. Zeru-iah’ tapa**
- `[TDB77]` *And Segub begat Jair, who had three and twenty cities in the land of G* → **Segub in Jair’ pa hi a, Gilead gam sungah khuapi sawmnih-le-thum nei h**
- `[TDB77]` *The third, Absalom the son of Maacah the daughter of Talmai king of Ge* → **Geshur kumpipa Talmai’ tanu, a nu Ma-akah a hi a thumna Absalom; a nu **

## four

- `[TDB77]` *Nethaneel the fourth, Raddai the fifth,* → **a lina Nethanel, a ngana Raddai,**
- `[TDB77]` *The third, Absalom the son of Maacah the daughter of Talmai king of Ge* → **Geshur kumpipa Talmai’ tanu, a nu Ma-akah a hi a thumna Absalom; a nu **
- `[TDB77]` *And the sons of Josiah were, the firstborn Johanan, the second Jehoiak* → **Josiah’ tapate in: A tacil Johanan, a nihna Jehoiakim, a thumna Zedeki**
- `[TDB77]` *Now the sons of Issachar were, Tola, and Puah, Jashub, and Shimron, fo* → **Issakhar’ tapate in: Tola, Puah, Jashub, leh Shimron, li pha uh hi.**

## five

- `[TDB77]` *And Tamar his daughter in law bare him Pharez and Zerah. All the sons * → **A tapa’ zi Tamar in zong amah tawh Perez leh Zerah nei hi. Judah in a **
- `[TDB77]` *And the sons of Zerah; Zimri, and Ethan, and Heman, and Calcol, and Da* → **Zeran’ tapate in: Zimri, Ethan, Heman, Kalkol, leh Dara, a vekpi-in ng**
- `[TDB77]` *Nethaneel the fourth, Raddai the fifth,* → **a lina Nethanel, a ngana Raddai,**
- `[TDB77]` *The fifth, Shephatiah of Abital: the sixth, Ithream by Eglah his wife.* → **Abital tawh a neih a ngana Shefatiah; a zi Eglah tawh a neih a gukna I**

## seven

- `[TDB77]` *Ozem the sixth, David the seventh:* → **a gukna Ozem, a sagihna David’ pa ahi hi;**
- `[TDB77]` *And their brethren, which were in their villages, were to come after s* → **tua ciangin amau’ khuaneute sungah a om a behte uh hih mite tawh a om **
- `[TDB77]` *Attai the sixth, Eliel the seventh,* → **a gukna Attai, a sagihna Eliel,**
- `[TDB77]` *Of the children of Simeon, mighty men of valour for the war, seven tho* → **Simeon mite sung panin galdo dingin a thahat a vanglian mihing tulsagi**

## ten

- `[TDB77]` *Jeremiah the tenth, Machbanai the eleventh.* → **a sawmna Jeremiah, a sawm-le-khatna Makbannai ahi uh hi.**
- `[TDB77]` *The ninth to Jeshua, the tenth to Shecaniah,* → **a kuana Jeshua tung, a sawmna Shekaiah tung,**
- `[TDB77]` *The tenth to Shimei, he, his sons, and his brethren, were twelve:* → **a sawmna Shimei, leh a tapate leh a sanggamte, sawm-le-nih tung tu hi;**
- `[TDB77]` *And Solomon had threescore and ten thousand that bare burdens, and fou* → **Solomon in van pua mi tul sawmsagih leh mual tung gamah suangseek mi t**

## twelve

- `[TDB77]` *Of the sons of Uzziel; Amminadab the chief, and his brethren an hundre* → **Uzziel-te beh sung panin a ukpi Amminadab, a behte za leh sawm-le-nih **
- `[TDB77]` *Now the first lot came forth for Asaph to Joseph: the second to Gedali* → **Asaf behte adingin ai masa Josef tungah tu hi; a nihna Gedaliah, leh a**
- `[TDB77]` *The third to Zaccur, he, his sons, and his brethren, were twelve:* → **a thumna Zakkhur, leh a tapate leh a sanggamte, sawm-le-nih tung tu hi**
- `[TDB77]` *The fourth to Izri, he, his sons, and his brethren, were twelve:* → **a lina Izzri, leh a tapate leh a sanggamte, sawm-le-nih tung tu hi;**

## hundred

- `[TDB77]` *And of the sons of Zerah; Jeuel, and their brethren, six hundred and n* → **Judah’ tapa Zerah’ mite sung panin: Jeuel in a makai ahi hi. Judah min**
- `[TDB77]` *The children of Judah that bare shield and spear were six thousand and* → **Judah mi lum leh tei a pua galkap tulguk leh zagiat ahi hi.**
- `[TDB77]` *Of the children of Simeon, mighty men of valour for the war, seven tho* → **Simeon mite sung panin galdo dingin a thahat a vanglian mihing tulsagi**
- `[TDB77]` *Of the children of Levi four thousand and six hundred.* → **Levi mite sung panin tulli leh zaguk ahi hi.**

## thousand

- `[TDB77]` *The children of Judah that bare shield and spear were six thousand and* → **Judah mi lum leh tei a pua galkap tulguk leh zagiat ahi hi.**
- `[TDB77]` *Of the children of Simeon, mighty men of valour for the war, seven tho* → **Simeon mite sung panin galdo dingin a thahat a vanglian mihing tulsagi**
- `[TDB77]` *Of the children of Levi four thousand and six hundred.* → **Levi mite sung panin tulli leh zaguk ahi hi.**
- `[TDB77]` *And Jehoiada was the leader of the Aaronites, and with him were three * → **Aaron’ suante ulian Jehoiada, leh amah tawh mi tulthum leh zasagih ahi**

---
<!-- SOURCE: wiki/grammar/body_parts_corpus.md -->

# Zolai Body Parts Reference — Corpus Verified

> Sources: Bible (TDB77+TBR17+Tedim2010) + master_source_v1.jsonl + wiki/grammar/*.md

## head

- `[TDB77]` *And they put his armour in the house of their gods, and fastened his h* → **Amaute in amau’ pasian’ biakinn sungah ama galhiam koihin Dagon biakin**
- `[TDB77]` *Every man praying or prophesying, having his head covered, dishonouret* → **Thungen ahi zongin, thuhilh ahi zongin a lu sin pasalte khempeuh in am**
- `[TDB77]` *For this cause ought the woman to have power on her head because of th* → **Tua ahih ciangin vantungmite hangin numei in a lu tungah ukna lim a om**
- `[TDB77]` *And the eye cannot say unto the hand, I have no need of thee: nor agai* → **Mittang in khut kiangah, “Nang kong deih kei hi,” ci thei lo hi. Tua m**

## hand

- `[TDB77]` *And his brother Asaph, who stood on his right hand, even Asaph the son* → **Asaf in lasa pawl a nihna a makaipa hi a, ama khangsimna a pupi Levi l**
- `[TDB77]` *And when they came unto the threshingfloor of Chidon, Uzza put forth h* → **Amaute Khido’ ancilna phual a tun’ uh ciangin bawngtalte muktu ahih ma**
- `[TDB77]` *These were born unto the giant in Gath; and they fell by the hand of D* → **Hihte in Gath a, mithagolte sung pana hong piang ahi uh hi; David leh **
- `[TDB77]` *And David said unto Gad, I am in a great strait: let me fall now into * → **Tua ciangin David in Gad kiangah, “Keimah in lungkhamna lianpi khat ka**

## foot/feet

- `[TDB77]` *If the foot shall say, Because I am not the hand, I am not of the body* → **Khe in, “Kei khut ka hih loh ciangin pum tawh ka kikum kei hi,” a cih **
- `[TDB77]` *And the eye cannot say unto the hand, I have no need of thee: nor agai* → **Mittang in khut kiangah, “Nang kong deih kei hi,” ci thei lo hi. Tua m**
- `[TDB77]` *For he must reign, till he hath put all enemies under his feet.* → **Pasian in galte khempeuh ama khe nuai-ah a khiat khit dong matengin Kh**
- `[TDB77]` *Arise thou therefore, get thee to thine own house: and when thy feet e* → **Tua ahih ciangin ding in la, na innah ciah in. Na khua na tun’ ciangin**

## eye

- `[TDB77]` *And all the congregation said that they would do so: for the thing was* → **Tua thu mi khempeuh in hoih sa ahih manin tua bangin hih ding a kikhaw**
- `[TDB77]` *And David lifted up his eyes, and saw the angel of the* → **Tua ciangin David khuadak to a, leitung leh vantung kikalah Topa’ vant**
- `[TDB77]` *And if the ear shall say, Because I am not the eye, I am not of the bo* → **Bil in zong, “Mittang ka hih loh ciangin pum tawh ka kikum kei hi,” a **
- `[TDB77]` *If the whole body were an eye, where were the hearing? If the whole we* → **Pumpi khempeuh in mittang ahih leh, bang ci-a khua za ding hiam? Pumpi**

## ear

- `[TDB77]` *And if the ear shall say, Because I am not the eye, I am not of the bo* → **Bil in zong, “Mittang ka hih loh ciangin pum tawh ka kikum kei hi,” a **
- `[TDB77]` *And Samuel heard all the words of the people, and he rehearsed them in* → **Samuel in mite thugen khempeuh a zak khit ciangin Topa kiangah tua thu**
- `[TDB77]` *And Samuel said, What meaneth then this bleating of the sheep in mine * → **Tua ciangin Samuel in, “Tua ahih leh ka bil-a tuu hamna leh ka zak baw**
- `[TDB77]` *Now mine eyes shall be open, and mine ears attent unto the prayer that* → **Tu-in ka mitte hakin hih lai munah a kingen thungetna ka bilte in ngai**

## mouth

- `[TDB77]` *Remember his marvellous works that he hath done, his wonders, and the * → **Ama hihsa a lamdang nasepte phawk un la, ama hih a lamdangte, a genkhi**
- `[TDB77]` *Who did no sin, neither was guile found in his mouth:* → **Amah in mawhna ahih kei hi, a kam panin zong thu zuau a kimu kei hi.**
- `[TDB77]` *Talk no more so exceeding proudly; let not arrogancy come out of your * → **Tua bangin kiphatsakna tawh pau nawn kei in la, na kam sung pan kihihs**
- `[TDB77]` *And he said, I will go out, and be a lying spirit in the mouth of all * → **Tua ciangin amah in, ‘Keimah pai khia-in ama kamsangte khempeuh’ kam s**

## heart

- `[TDB77]` *Glory ye in his holy name: let the heart of them rejoice that seek the* → **Ama min siangtho hangin nuamin diang un la, Topa a zong mite lungdam t**
- `[TDB77]` *Then Nathan said unto David, Do all that is in thine heart; for God is* → **Tua ciangin Nathan in David kiangah, “Pasian in nang tawh om ahih mani**
- `[TDB77]` *Now set your heart and your soul to seek the* → **Tu-in Topa na Pasian uh a zong dingin na ngaihsutna uh leh na lungsim **
- `[TDB77]` *Then the people rejoiced, for that they offered willingly, because wit* → **Tua ciangin hih mite in utna lungsim tawh pia uh ahih manin mite lungd**

## face

- `[TDB77]` *And the king answered and said unto the man of God, Entreat now the fa* → **Tua ciangin kumpipa in Pasian’ mipa kiangah, “Tu-in Topa na Pasian’ ma**
- `[TDB77]` *So the prophet departed, and waited for the king by the way, and disgu* → **Tua ciangin kamsangpa kihem khia-in lam gei-ah kumpipa ngak a, a mit t**
- `[TDB77]` *And he hasted, and took the ashes away from his face; and the king of * → **Tua ciangin amah in a mit panin a tuamna phel dingin nawhtat hi; tua c**
- `[TDB77]` *Now therefore, let not my blood fall to the earth before the face of t* → **Tua ahih ciangin tu-in Topa’ omna panin gamdang leitangah kei hong si **

## arm

- `[TDB77]` *With him is an arm of flesh; but with us is the* → **Amah tawh mihing thatang om hi; ahih hangin eite hong huhin i gal hong**
- `[TDB77]` *He teacheth my hands to war; so that a bow of steel is broken by mine * → **Amah in galsiam nadingin kei hong hilh a, ka khut in sumngo thal khauh**
- `[TDB77]` *This image's head was of fine gold, his breast and his arms of silver,* → **Tua milim lutang pen kham hoih mahmah tawh a kibawl hi. A awm leh a ba**
- `[TDB77]` *Though I have bound and strengthened their arms, yet do they imagine m* → **Amaute khoi-in a thahat mite suaksak napi-in, amaute in kei hong lehsa**

## blood

- `[TDB77]` *And there are three that bear witness in earth, the Spirit, and the wa* → **Bang hang hiam na cih uh leh, teci a pang thum ahi Kha Siangtho, tui l**
- `[TDB77]` *But with the precious blood of Christ, as of a lamb without blemish an* → **hoih lohna om lo, a nin baang lo tuuno tawh kibang ahi Khazih’ manpha **
- `[TDB77]` *Now therefore, let not my blood fall to the earth before the face of t* → **Tua ahih ciangin tu-in Topa’ omna panin gamdang leitangah kei hong si **
- `[TDB77]` *And they killed the passover, and the priests sprinkled the blood from* → **Tua ciangin amaute in Paisan tuuno go uh a, Levi mite in savun a hawk **

---
<!-- SOURCE: wiki/grammar/time_expressions_corpus.md -->

# Zolai Time Expressions Reference — Corpus Verified

> Sources: Bible (TDB77+TBR17+Tedim2010) + master_source_v1.jsonl + wiki/grammar/*.md

## day

- `[TDB77]` *And they smote the rest of the Amalekites that were escaped, and dwelt* → **amaute in Amalek mi a suakta a om laite susia uh a, tu ni dongin tua m**
- `[TDB77]` *All these were reckoned by genealogies in the days of Jotham king of J* → **Hihte khempeuh Judah kumpi Jotham’ hun sung, leh Israel kumpi Jeroboam**
- `[TDB77]` *And Ephraim their father mourned many days, and his brethren came to c* → **Tua ciangin a pa Efraim ni tampi sung kap a, amah hehnem dingin a sang**
- `[TDB77]` *And their brethren, which were in their villages, were to come after s* → **tua ciangin amau’ khuaneute sungah a om a behte uh hih mite tawh a om **

## night

- `[TDB77]` *And it came to pass the same night, that the word of God came to Natha* → **Ahih hangin tua zan mahin Nathan’ kiangah Topa’ thu hong tung a,**
- `[TDB77]` *And this woman's child died in the night; because she overlaid it.* → **Amah in delhphah kha ahih manin zanin hih numei’ tapa si hi.**
- `[TDB77]` *They were a wall unto us both by night and day, all the while we were * → **tuute kemin amaute tawh ka om sung khempeuh uh kote adingin sun leh za**
- `[TDB77]` *And she brought it before Saul, and before his servants; and they did * → **Saul leh a nasemte mai-ah lui hi; amaute in ne uh hi. Tua ciangin amau**

## morning

- `[TDB77]` *And to stand every morning to thank and praise the* → **Tua ciangin amaute zingsang simin ding ding uh a, lungdamna koin Topa **
- `[TDB77]` *And they rose up in the morning early, and worshipped before the* → **Amaute zingsangin tho baihin Topa mai-ah bia uh hi; tua ciangin amaute**
- `[TDB77]` *And Samuel lay until the morning, and opened the doors of the house of* → **Samuel zingsang dong lum hi; tua ciangin amah in Topa’ inn kongkhakte **
- `[TDB77]` *And the Philistine drew near morning and evening, and presented himsel* → **Ni sawmli sung zing leh nitakin Filistiapa hong pai-in hong ding hi.**

## evening

- `[TDB77]` *And it came to pass at the time of the offering of the evening sacrifi* → **Biakpiak hun ciangin kamsang Elijah a nai-ah hong pai-in, “Abraham, Is**
- `[TDB77]` *And the Philistine drew near morning and evening, and presented himsel* → **Ni sawmli sung zing leh nitakin Filistiapa hong pai-in hong ding hi.**
- `[TDB77]` *And God called the light Day, and the darkness he called Night. And th* → **Pasian in khuavak pen Sun ci a, khuamial pen Zan ci hi. Nitak hong bei**
- `[TDB77]` *And God called the firmament Heaven. And the evening and the morning w* → **Pasian in van kuumpi pen Vantung ci hi. Nitak hong bei-in, zingsang ho**

## year

- `[TDB77]` *For by the last words of David the Levites were numbered from twenty y* → **Bang hang hiam cih leh David’ thupiakna a nunung pen tawh a kisim hiht**
- `[TDB77]` *But David took not the number of them from twenty years old and under:* → **Israel mite vantung aksi zahin a tamin a bawl nading Topa in thuciam k**
- `[TDB77]` *Now king David was old and stricken in years; and they covered him wit* → **Tu-in Kumpi David teekin kum tam ta hi; amaute in amah puan a silhsak **
- `[TDB77]` *In the fourth year was the foundation of the house of the* → **A kum lina, Ziv kha-in Topa’ inn a bulpi kipan hi.**

## month

- `[TDB77]` *And the ark of God remained with the family of Obed–edom in his house * → **Tua ciangin Pasian’ thuciamna singkuang Obededom’ innkuan tawh kha thu**
- `[TDB77]` *Of the children of Perez was the chief of all the captains of the host* → **Amah in Perez’ suan leh khak hi a, a kha masa sungin galkap a ukte khe**
- `[TDB77]` *The fifth captain for the fifth month was Shamhuth the Izrahite: and i* → **A kha ngana adingin a uk a ngana-pa in Izrah-te beh Shamhuth ahi hi; a**
- `[TDB77]` *(For six months did Joab remain there with all Israel, until he had tua* → **(Bang hang hiam cih leh amah in Edom sunga pasal khempeuh a suksiat kh**

## now

- `[TDB77]` *Now Sheshan had no sons, but daughters. And Sheshan had a servant, an * → **Tu-in Sheshan in tapa nei loin tanu bek nei hi; ahih hangin Sheshan in**
- `[TDB77]` *Now the sons of Issachar were, Tola, and Puah, Jashub, and Shimron, fo* → **Issakhar’ tapate in: Tola, Puah, Jashub, leh Shimron, li pha uh hi.**
- `[TDB77]` *Now Benjamin begat Bela his firstborn, Ashbel the second, and Aharah t* → **Benjamin in a tacil Bela, a nihna Ashbel, a thumna Aharah,**
- `[TDB77]` *Now these are the names of his children which he had in Jerusalem; Sha* → **Jerusalem ah a neih a tate’ min in: Shammua, Shobab, Nathan, Solomon,**

## today

- `[dict_semantic]` *today* → **tuni**
- `[dict_unified]` *today* → **adv.  tuni; tu hun; tulai; tulai hun,**

## tomorrow

- `[dict_semantic]` *tomorrow* → **ziing ciang**
- `[dict_unified]` *tomorrow* → **adv.  ziing ciang;  tuni khita hong om ding ni pen.**

## always

- `[TDB77]` *Be ye mindful always of his covenant; the word which he commanded to a* → **Amah in a thuciamna phawk tawntung hi, khang tulkhat adingin a thupiak**
- `[TDB77]` *I thank my God always on your behalf, for the grace of God which is gi* → **Khazih’ thu tecipan’na nomau lakah a kip ahih ciangin**
- `[TDB77]` *Therefore we are always confident, knowing that, whilst we are at home* → **Tua ahih ciangin pumpi-ah ka om lai tengun Pasian tawh ka kigamla uh h**
- `[TDB77]` *Moreover I will endeavour that ye may be able after my decease to have* → **Ahi hi. Ka sih khit ciangin note in hih thute na phawk tawntung nading**

---
<!-- SOURCE: wiki/grammar/sentence_structures.md -->

# Zolai Sentence Structures — A Complete Reference

This document catalogs every major sentence pattern in the Zolai (Tedim) language, from basic SOV to advanced embedded clauses. All examples are drawn from authentic sources: Bible (ZVS 2018), Zolai Sinna, Gentehna Tuamtuam, and Zolai Khanggui.

## 1. Basic SOV (Subject – Object – Verb)

Zolai is strictly **SOV** (Subject–Object–Verb). The verb always comes last.

| Pattern | Example | Translation | Source |
| :--- | :--- | :--- | :--- |
| S + V | `Pasian om hi.` | God exists. | GEN 1:1 |
| S + O + V | `Ka pa sangah pai hi.` | My father goes to school. | Sinna |
| S + O + V (past) | `Pasian in leitung a piangsak hi.` | God created the earth. | GEN 1:1 |
| S + IO + DO + V | `Pasian in amaute thupha a pia hi.` | God gave them blessings. | GEN 1:28 |

---

## 2. Tense Constructions

### A. Present (hi)
- `Zomi ka hi hi.` — I am a Zomi. *(Sinna 1)*
- `A pai hi.` — He/She goes.

### B. Past (ta / khin / zo)
- `A pai ta hi.` — He went. (Change of state)
- `A pai khin hi.` — He has gone. (Experiential)
- `A pai zo hi.` — He has finished going. (Completive)

### C. Future (ding)
- `A pai ding hi.` — He will go.
- `Ka pai kei ding hi.` — I will not go. (Future negation uses `kei`, NOT `lo`)

### D. Progressive (lai / laitak / den)
- `A pai lai hi.` — He is going (progressive).
- `A pai laitak hi.` — He is going right now (immediate progressive).
- `Nasep den hi.` — He keeps working (habitual).

---

## 3. Negation Patterns

| Pattern | Example | Translation | Note |
| :--- | :--- | :--- | :--- |
| **V + lo** | `Ka ne lo hi.` | I don't eat. | General present negation |
| **V + kei** | `Ka pai kei ding hi.` | I won't go. | Future/intent negation |
| **V + kei + in** | `Pai kei in.` | Don't go. | Imperative negative |
| **V + keng** | `Ka pai keng.` | I won't go. | Contraction: kei + in |
| **V + ngei lo** | `Ka mu ngei lo hi.` | I have never seen. | Experiential negation |
| **longal...kei** | `Kuamah in a muh kei.` | No one saw it. | Universal negation |

---

## 4. Interrogative Constructions

### A. Content Questions (wh-questions)
| Question Word | Example | Translation |
| :--- | :--- | :--- |
| **Bang** (what) | `Bang na duh hiam?` | What do you want? |
| **Koi** (where) | `Koi ah na pai hiam?` | Where are you going? |
| **Kua** (who) | `Kua na hi hiam?` | Who are you? |
| **Bang hang** (why) | `Bang hang hiam?` | Why? |
| **Bang ci** (how) | `Bang ci hiam?` | How is it? |
| **Bang zah** (how much) | `Bang zah hiam?` | How much? |
| **Bang hun** (when) | `Bang hun ah na pai ding?` | When will you go? |

### B. Yes/No Questions (hiam)
- `Na pai ding hiam?` — Will you go?
- `Hoih hiam?` — Is it good?

### C. Rhetorical Questions (Bible)
- `Bang hang hiam cih leh...` — Why? Because... *(GEN 2:3, 2:17)*
- `Kei bang ci hiam?` — What am I?

---

## 5. Conditional Constructions

### A. Simple Conditional (leh)
- `Na pai leh, ka lungdam ding.` — If you go, I'll be happy.
- `Ahih leh, bang ci ding hiam?` — If so, what should we do?

### B. Temporal Conditional (ciangin)
- `A pai ciangin, ka zui ding.` — When he goes, I will follow.
- `Ahih ciangin...` — When it was so... *(narrative connector in Genesis)*

### C. Negative Conditional (kei...leh) ⚠️
> **CRITICAL ZVS RULE:** NEVER use `kei leh` for negative conditionals.
- ✅ `Nong pai kei a leh...` — If you don't come...
- ✅ `Nong pai kei leh...` — If you don't come...
- ❌ `Na pai kei leh...` — **FORBIDDEN**

### D. Concessive (hangin / napi)
- `Hak hangin, hanciam hi.` — Although it's difficult, [he] perseveres.
- `A hatloh napi, hanciam hi.` — Despite being weak, [he] perseveres.

---

## 6. Causal Constructions

| Pattern | Example | Translation |
| :--- | :--- | :--- |
| **ahih manin** | `Pasian in hong it ahih manin...` | Because God loves us... |
| **bang hang hiam cih leh** | `...bang hang hiam cih leh tua ni-in a tawlnga hi.` | ...because on that day He rested. *(GEN 2:3)* |
| **a hihman(in)** | `Mawh a om a hihmanin...` | Because there is sin... |

---

## 7. Imperative Constructions

| Form | Pattern | Example | Translation |
| :--- | :--- | :--- | :--- |
| **Polite (hen)** | V + hen | `Khuavak om hen.` | Let there be light. *(GEN 1:3)* |
| **Direct (un/in)** | V + un | `Ci pha-in tampi pha un.` | Be fruitful and multiply. *(GEN 1:28)* |
| **Soft request (dih)** | V + dih | `Hong pai pak dih.` | Please come. |
| **Hortative (ni)** | V + ni | `Mihing bawl ni.` | Let us make man. *(GEN 1:26)* |
| **Prohibitive** | V + kei + in | `Ne kei ding hi.` | You shall not eat. *(GEN 2:17)* |

---

## 8. Comparative & Superlative

| Pattern | Example | Translation |
| :--- | :--- | :--- |
| **A sangin B + zaw** | `Khuavak lianzaw pen sun a uk ding.` | The greater light rules the day. *(GEN 1:16)* |
| **-pen (superlative)** | `A lianzaw pen` | The greater one |
| **-sa (intensifier)** | `Hoih sa mahmah hi.` | It was very good. *(GEN 1:31)* |

---

## 9. Relative Clauses

Zolai relative clauses precede the noun they modify, using the structure `V + [noun]`:

- `Topa in a piangsak ganhingte` — The creatures that the Lord created.
- `Nong gen thu` — The word that you spoke.
- `A kipat cilin Pasian in a piangsak vantung leh leitung` — In the beginning, the heaven and earth that God created. *(GEN 1:1)*

---

## 10. Direct & Indirect Speech

### A. Direct Speech (ci / ci hi)
The quotative particle `ci` introduces or closes direct speech:
- `Pasian in, "Khuavak om hen," ci hi.` — God said, "Let there be light." *(GEN 1:3)*

### B. Indirect Speech (ci-in)
- `Pasian in tua khuavak hoih hi, ci-in a mu hi.` — God saw the light, saying it was good. *(GEN 1:4)*

### C. Reported Identity (kici)
- `Tua mi pen "Laipianpa" na kici hi.` — That person was called "Laipianpa." *(Sinna)*

---

## 11. Sequential & Connective Patterns

| Connector | Usage | Example |
| :--- | :--- | :--- |
| **tua ciangin** | Then / At that time | `Tua ciangin Pasian in...` *(GEN 1:26)* |
| **tua ahih ciangin** | When that was so | `Tua ahih ciangin Pasian in...` *(GEN 1:27)* |
| **tua mah bangin** | Just like that / In that manner | `Tua mah bangin a piang pah hi.` *(GEN 1:7)* |
| **tua panin** | From there / After that | Used in narrative progression |
| **tua bek thamlo** | Not only that but also | Used in Gentehna parables |
| **a baan ah** | In addition | Additive connector |

---

## 12. Existential & Identifying Constructions

| Pattern | Example | Translation |
| :--- | :--- | :--- |
| **X om hi** | `Pasian om hi.` | God exists. |
| **X ahi hi** | `Kei Zomi ka hi hi.` | I am a Zomi. *(Sinna 1)* |
| **X pen Y ahi hi** | `Amah pen ka Pa ahi hi.` | He is my Father. |
| **X kici** | `Topa kici.` | [It] is called Lord. |

---

## 13. Purpose & Result Clauses

| Pattern | Example | Translation |
| :--- | :--- | :--- |
| **V + nading** | `An nek nading` | In order to eat food |
| **V + ding + in** | `A uk dingin bawl hi.` | He made [it] in order to rule. *(GEN 1:16)* |
| **V + theih + nading** | `A theihna dingin mipa kiangah paipih hi.` | Brought to the man so he could know. *(GEN 2:19)* |

---

## 14. Passive Voice (ki- prefix)

Zolai forms passives using the reflexive/reciprocal prefix `ki-`:
- `Kibawl` — Be made (from `bawl` = make)
- `Kikhensak` — Be separated (from `khen` = divide)
- `Kikoih` — Be placed (from `koih` = put)
- `Kiza` — Be known/heard (from `za` = hear)
- Example: `Thupha lapha kiza hi.` — Blessings are heard. *(Sinna 1)*

---

## 15. Poetic & Literary Structures (from Psalms, Gentehna)

---
<!-- SOURCE: wiki/grammar/core_grammar_reference.md -->

# Tedim Zolai — Core Grammar Terms, Pronouns & Phonology
> Deep reference for all grammatical particles, pronouns, phonology, and usage patterns.
> Sources: Zolai Khanggui (lines 456–481), ZVS corpus (2.8M), Zolai Sinna Bu, Gelhmaanbu
> Last updated: 2026-04-14

---

## 1. Personal Pronouns — Full System

### Subject Pronouns

| Person | Pronoun | Agreement Marker | Example | Translation |
|---|---|---|---|---|
| 1st singular | `kei` | `ka` | `Ka pai hi.` | I go. |
| 2nd singular | `na'ng` | `na` | `Na pai hi.` | You go. |
| 3rd singular | `amah` | `a` | `A pai hi.` | He/she/it goes. |
| 1st plural inclusive | `keimahte` / `eite` | `i` | `I pai hi.` | We (all) go. |
| 1st plural exclusive | `keite` / `koite` | `ko` | `Ko pai hi.` | We (not you) go. |
| 2nd plural | `nangmite` | `na...uh` | `Na pai uh hi.` | You (all) go. |
| 3rd plural | `amahte` | `a...uh` | `A pai uh hi.` | They go. |

### Pronoun Drop Rule
In informal speech, subject pronouns are dropped when the agreement marker makes person clear:
- Informal: `An ka ne hi.` (I ate food — `kei` dropped)
- Formal: `Kei in an ka ne hi.` (I ate food — explicit)

### Emphatic Pronouns
- `Kei mah` = I myself / me alone
- `na'ng mah` = you yourself
- `Amah mah` = he/she himself/herself
- `KEIMAH ka hi hi` = I AM (emphatic identity — used in "I Am" statements, C1+ level)

### Reflexive/Reciprocal
- `ki-` prefix on verb = reflexive/reciprocal
- `A ki mu hi.` = He saw himself.
- `A nih ki mu hi.` = They two saw each other.

---

## 2. Agreement Markers — Detailed Usage

### `ka` (1st person singular)
```
Ka pai hi.          I go.
Ka pa              My father (possession)
Ka inn             My house
Ka it mahmah hi.   I love very much.
```

### `na` (2nd person singular)
```
Na pai hi.          You go.
Na pa              Your father
Na min kua na ze?  What is your name?
```

### `a` (3rd person singular — multi-function)
```
A pai hi.           He/she goes.        [subject]
A pa               His/her father       [possession]
A hoih hi.         It is good.          [predicate]
Atung              On top / above       [position prefix]
Asang              High / tall          [adjective prefix]
```

### `i` (1st person inclusive plural)
```
I pai hi.           We (all) go.
I ne ding.          We will eat.
⚠️ NEVER: I pai uh hi. — WRONG (uh + i = forbidden)
```

### `uh` (3rd person plural marker)
```
A pai uh hi.        They go.
A ne uh hi.         They eat.
⚠️ Only for 3rd person — NEVER with i/ei
```

---

## 3. Sentence-Final Particles (SFP) — Complete Reference

Tedim has a rich system of sentence-final particles that encode mood, evidentiality, and pragmatic meaning.

### Interrogative Particles

| Particle | Function | Example | Translation |
|---|---|---|---|
| `hiam` | Yes/no question (neutral) | `A pai hiam?` | Does he go? |
| `diam` | Soft yes/no question | `Na pai ding diam?` | Will you go? (gentle) |
| `maw` | Confirmation/tag question | `Hoih maw?` | It's good, right? |
| `hia` | Informal question (colloquial) | `Na dam hia?` | Are you well? (casual) |
| `ze` | Content question marker | `Bang ci na ze?` | What is it? |
| `na ze` | Polite content question | `An min kua na ze?` | What is your name? |

### Declarative/Modal Particles

| Particle | Function | Example | Translation |
|---|---|---|---|
| `hi` | Basic declarative | `A pai hi.` | He goes. |
| `hi hi` | Emphatic declarative | `Ka hi hi.` | I am (emphatic). |
| `ahi hi` | Copula declarative | `Amah topa ahi hi.` | He is the Lord. |
| `ing` | 1st person exclusive future | `Ka pai ing.` | I will go (I alone). |
| `hang` | Emphatic/exclamatory | `Hoih mahmah hang!` | How very good! |
| `aw` | Vocative/appeal | `Huih ve aw.` | Please help me. |
| `vo` | Mild prohibition | `Mawk ciakciak kei vo.` | Don't just chatter. |
| `dih` | Polite prohibition | `Mawk ciakciak kei dih.` | Please don't chatter. |
| `hen` | Jussive (let there be) | `Khuavak om ta hen.` | Let there be light. |
| `in` | Imperative | `Pai in.` | Go! |
| `un` | Plural imperative | `Pai un.` | Go! (to group) |

### Evidential/Reportative Particles

| Particle | Function | Example | Translation |
|---|---|---|---|
| `kiza hi` | Hearsay/reported | `A pai kiza hi.` | It is heard that he went. |
| `ci hi` | Quotative (said) | `"Ka pai" ci hi.` | He said "I will go." |
| `ci-in` | Quotative (saying/having said) | `"Lungdam" ci-in a gen hi.` | Saying "thank you," he spoke. |
| `kici` | Passive naming | `Tedim kici hi.` | It is called Tedim. |
| `kiummawh hi` | Suspected/believed | `Hiding in kiummawh hi.` | It is suspected to be so. |

---

## 4. Aspect Markers — Complete System

Zolai encodes aspect through post-verbal particles. The verb stem itself does NOT change for tense.

### Core Aspect Particles

| Particle | Aspect | Meaning | Example | Translation |
|---|---|---|---|---|
| `hi` | Neutral/habitual | General fact | `A pai hi.` | He goes. / He went. |
| `ta` | Inceptive | New state/just happened | `A hoih ta hi.` | It has become good. |
| `laitak` | Immediate progressive | Right now | `Ka pai laitak hi.` | I am going right now. |
| `lai` | Progressive | Ongoing | `A ne lai hi.` | He is eating. |
| `khin` | Experiential | Has done before | `Ka mu khin hi.` | I have seen (before). |
| `khinzo` | Present perfect | Already completed | `A pai khinzo hi.` | He has already gone. |
| `khinsa` | Past perfect | Completed before reference | `A pai khinsa hi.` | He had already gone. |
| `zo` | Completive | Fully finished | `A ne zo hi.` | He has finished eating. |
| `ding` | Future | Will do | `Ka pai ding hi.` | I will go. |
| `khinzo ding` | Future perfect | Will have done | `A pai khinzo ding hi.` | He will have gone. |
| `ngei` | Experiential past | Has experienced | `Ka pai ngei hi.` | I have been there before. |
| `ngei lo` | Experiential negative | Has never | `Ka mu ngei lo hi.` | I have never seen. |
| `den` | Habitual | Keeps doing | `Nasem den hi.` | He keeps working. |
| `kik` | Resumptive | Do again | `A pai kik hi.` | He went again. |
| `pah` | Immediate | Do right away | `A pai pah hi.` | He went immediately. |
| `sawm` | Attemptive | Try to do | `A pai sawm hi.` | He tried to go. |
| `mahmah` | Intensive | Very much | `A hoih mahmah hi.` | It is very good. |

### Compound Aspect Combinations
```
A pai khin zo hi.     He has already finished going. (experiential + completive)
Ka ne lai khin hi.    I have been eating (for a while). (progressive + experiential)
A pai ding khin hi.   He was going to go (but didn't). (future + experiential)
```

---

## 5. Negation — Full System

| Pattern | Usage | Example | Translation |
|---|---|---|---|
| `V + lo` | General negation | `Ka ne lo hi.` | I don't eat. |
| `V + kei` | Future/intentional negation | `Ka pai kei ding hi.` | I won't go. |
| `V + kei in` | Negative imperative | `Pai kei in.` | Don't go! |
| `V + keng` | Contracted (kei+in) | `Ka pai keng.` | I won't go. |
| `V + ngei lo` | Experiential never | `Ka mu ngei lo hi.` | I have never seen. |
| `V + thei lo` | Inability | `Ka gen thei lo hi.` | I cannot say. |
| `V + nuam lo` | Unwillingness | `Ka pai nuam lo hi.` | I don't want to go. |
| `kuamah...lo` | Universal negation | `Kuamah a theilo hi.` | Nobody knows. |
| `nong...kei a leh` | Negative conditional | `Nong pai kei a leh...` | If you don't go... |

**⚠️ Critical:** Negative conditionals use `kei`, NEVER `kei leh`:
- ✓ `Nong pai kei a leh` — If you don't go
- ✗ `Nong pai kei a leh` — WRONG

---

## 6. Interrogative Words

| Zolai | English | Example | Translation |
|---|---|---|---|
| `bang` | what | `Hi bang hi hiam?` | What is this? |
| `bang ci` | what kind / how | `Bang ci na ze?` | What is it? / How is it? |
| `banghang` | why | `Banghang na pai?` | Why do you go? |
| `bangzat` | how many / how much | `Bangzat a man?` | How much does it cost? |
| `koi` | where | `Koi ah om?` | Where is it? |
| `koi ah` | where (locative) | `Inn koi ah om?` | Where is the house? |
| `kuama` | who | `Kuama hi na ze?` | Who is it? |
| `bang hang hiam cih leh` | because / why-because | `Bang hang hiam cih leh...` | Because... (causal connector) |
| `tu` | when (now/present) | `Tu-in` | Now / at this point |
| `nidang` | when (future) | `Nidang ka hong ki mu kik ding.` | We will meet again someday. |

---

## 7. Connectors & Discourse Markers

### Coordinating Connectors
| Zolai | English | Usage |

---
<!-- SOURCE: wiki/grammar/verb_stems.md -->

# Verb Stem Mapping (Stem I vs Stem II)

Zolai (Tedim) verbs often change their form depending on the syntactic environment (e.g., affirmative vs. negative, independent vs. subordinate clauses).

## Stem I (Independent/Affirmative)
Used in simple affirmative sentences and independent clauses.
- **Example:** `pai` (to go/walk)
- **Sentence:** `Amah pai hi.` (He goes.)

## Stem II (Dependent/Negative/Subordinate)
Used in negative sentences, with certain particles, or in subordinate clauses.
- **Example:** `piah` (Stem II of `pai`) - *Note: Based on traditional linguistics; needs further verification in 2018 Standard.*
- **Pattern Found in Sources:**
    - `pai` (Go) vs `pailo` (Not go) - *Note: The source often uses the same stem for 'lo' negation, but some contexts change.*
    - `gen` (Speak) vs `gent` (Stem II)
    - `mu` (See) vs `muh` (Stem II)
    - `ciah` (Return) vs `ciahk` (Stem II)

## Common Suffixes and Stems
- **Infinitive/Noun:** Verb + `na` (e.g., `paina` - departure).
- **Infinitive Purpose:** Verb + `nading` (single word) (e.g., `painading` - to go / for going).
- **Causative:** Verb + `sak` (e.g., `paisak` - to make someone go).

## Verbs Identified in Standard Format
| Stem I (Primary) | Meaning | Stem II (Secondary) | Trigger / Transformation |
| :--- | :--- | :--- | :--- |
| `si` | Die | `sih` | Vowel -> `-h` (Noun: `sihna`) |
| `la` | Take | `laak` | Vowel -> `-k` (Noun: `laakna`) |
| `sa` | Hot | `sat` | Vowel -> `-t` (Noun: `satna`) |
| `nei` | Have | `neih` | `-i` -> `-ih` (Noun: `neihna`) |
| `sal` | Shout | `salh` | `-l` -> `-lh` (Noun: `salhna`) |
| `hau` | Rich | `hauh` | `-u` -> `-uh` (Noun: `hauhna`) |
| `hak` | Hard | `hah` | `-k` -> `-h` (Noun: `hahna`) |
| `kap` | Cry | `kah` | `-p` -> `-h` (Noun: `kahna`) |
| `that` | Kill | `thah` | `-t` -> `-h` (Noun: `thahna`) |
| `sam` | Call/Name | `sap` | `-m` -> `-p` (Noun: `sapna`) |
| `kipan` | Start | `kipat` | `-n` -> `-t` (Noun: `kipatna`) |
| `thang` | Famous | `than'` | `-ng` -> `-n'` (Noun: `than'na`) |
| `taang` | Transfer | `tat` | `-ng` -> `-t` (Noun: `tatna`) |
| `pai` | Go / Walk | `piah / paih` | Irregular / Neg: `pailoh` |
| `gen` | Say / Speak | `gent` | Subordinate/Negation: `gent` |
| `mu` | See | `muh` | Subordinate/Negation: `muh` |
| `ciah` | Return home | `ciahk` | Subordinate/Negation: `ciahk` |
| `lua` | Too much | `luat` | Comparative/Adverb: `sangluat` |
| `lo` | Negation | `loh` | Subordinate/Noun: `pailoh` |
| `kei` | Not | `keh` | First person/Imperative neg |
| `zaw` | More | `zawk` | Comparative: `teelzawk` |
| `khawm` | Together | `khop` | Adverbial: `paikhop` |
| `lamdang` | Strange | `lamdan` | Noun/Adj: `kilamdanna` |
| `thupi` | Important | `thupit` | Noun/Adj: `thupitna` |
| `thei` | Can / Know | `theih` | Noun/Possibility: `theihna` |
| `guk` | Six / Steal | `guuk` | Contextual: `kiguuksak` |

## Advanced Stem Morphologies

### 1. Stem II for Conditionals (`leh`)
When creating a conditional "if" statement, the verb leading into `leh` must take its Stem II form.
- **Example:** `Pai` -> `Na paih leh...` (If you go...). This marks the action as contingent rather than realized.

### 2. Transitive vs. Intransitive Stem Shifts
Verbs often shift form when moving from a state of being (intransitive) to an action done upon an object (transitive).
- **Intransitive (Stem I):** `Si` (To die). E.g., `Amah a si hi.`
- **Transitive/Causative:** `Siat` / `Sut` (To kill/destroy). E.g., `Sut in.`

### 3. Stem I / II in Imperative Contexts
Commands generally preserve Stem I because they are direct, unrealized actions demanded of the subject.
- **Rule:** Use Stem I for direct commands (`Pai in`, `Nungta in`).
- **Exception in Negation:** Negative commands trigger Stem II before the negative imperative particle `kei` or `peh` (`Paih kei in`).

### 4. Causative Shifts (`Verb + sak`)
Appending `sak` (to cause/make happen) to a verb generally preserves the Stem I of the primary verb, as `sak` itself takes the conjugated load.
- **Example:** `Dam` (Heal) -> `Damsak` (To cause to heal / to treat).

### 5. Reciprocal Shifts (`Ki + Verb`)
The `Ki-` prefix indicates reciprocal or reflexive action. It relies on the Stem I of the verb but often forces a Stem II noun if nominalized with `-na`.
- **Action:** `Kigen` (Speak to each other).
- **Nominalized:** `Kigennna` / `Kikupna` (A discussion / conferring).

---
<!-- SOURCE: wiki/grammar/social_registers.md -->

# Social Registers in Tedim Zolai
> How formality, context, and relationship shape language choice
> Sources: ZVS 2018, Zolai Khanggui, Zolai Sinna Bu, corpus analysis
> Last updated: 2026-04-14

---

## Overview

Tedim Zolai has five distinct social registers. Choosing the wrong register is a common error — using church language in casual conversation sounds stiff; using casual speech in prayer is disrespectful.

| Register | Zolai name | Context | Key markers |
|---|---|---|---|
| **Formal/Biblical** | Laisiangtho pau | Church, prayer, scripture | Full pronouns, `hi hi`, archaic vocab |
| **Written/Literary** | Zolai gelh | News, books, official | ZVS standard, full morphology |
| **Semi-formal** | Thugen dan | School, meetings, speeches | Standard grammar, no contractions |
| **Conversational** | Pau dan | Daily life, family, friends | Pronoun drop, contractions |
| **Intimate/Poetic** | Lapau / Zola | Songs, poetry, close relationships | Archaic forms, metaphor, reduplication |

---

## 1. Formal/Biblical Register (Laisiangtho Pau)

Used in: church services, prayer, scripture reading, sermons, funerals, weddings

### Key Features
- **Full subject pronouns always stated:** `Kei in...` never dropped
- **Emphatic declarative `hi hi`:** `A hoih hi hi.` (It is truly good.)
- **Copula `ahi hi`:** `Amah Topa ahi hi.` (He is the Lord.)
- **Ergative `in` always explicit:** `Pasian in leitung a piangsak hi.`
- **Jussive `hen`:** `Om ta hen.` (Let there be.)
- **Archaic vocabulary:** `Topa` (Lord), `Pasian` (God), `Khrih` (Christ)
- **Narrative connectors:** `Tua ciangin`, `Tua ahih ciangin`, `A kipat cilin`

### Example
```
Pasian in leitung mite hong it mahmah ahih manin,
amah a Tapa a um mi khempeuh kisia loin
nuntak tawntungna a ngahna dingun
khat bek a neih a Tapa a pia hi.
— John 3:16 (Parallel Corpus)
```

---

## 2. Written/Literary Register (Zolai Gelh)

Used in: newspapers (Zomidaily), books, official letters, wiki, formal documents

### Key Features
- ZVS 2018 orthography strictly followed
- `noun khat word khat` rule (one concept = one word, no spaces)
- Full verb morphology, no contractions
- `ci hi` / `ci-in` for quotation
- No pronoun dropping
- Dates: `2026' kum April kha 14 ni`

### Example
```
Zomi mite in amau' pau leh ngeina tawntung theihna dingin
nasem tampi a bawl uh hi.
— Zomidaily style
```

---

## 3. Semi-formal Register

Used in: school, community meetings, public speeches, formal greetings

### Key Features
- Standard grammar but slightly relaxed
- Subject pronouns usually stated
- `hi` (not `hi hi`) for declarative
- Honorific titles used: `Pu`, `Pi`, `U`
- Direct address: `Pu Thang aw,` (Respected Thang,)

### Example
```
Pu Thang aw, tu ni-in i kikhawm ahih manin lungdam mahmah hi.
(Respected Thang, I am very glad we gathered today.)
```

---

## 4. Conversational Register (Pau Dan)

Used in: family, friends, markets, casual daily life

### Key Features
- **Subject pronoun drop** when agreement marker is clear:
  - `An ka ne hi.` (I ate — `kei` dropped)
  - `Dam na hi hiam?` (Are you well? — `na'ng` dropped)
- **Contracted forms:**
  - `na'ng` = `na'ng` (you)
  - `nading` = `nading` (for you/your purpose)
- **`maw` tag question:** `Hoih maw?` (Good, right?)
- **`hia` soft question:** `Na dam hia?` (You okay?)
- **`diam` gentle question:** `Na pai ding diam?` (Will you go?)
- Shorter sentences, less explicit marking

### Example
```
A: Dam na hi hiam?
B: Dam ka hi. Na zong dam hia?
A: Ka dam. An na ne zo hiam?
B: Ne zo khin hi. Lungdam.
```

---

## 5. Intimate/Poetic Register (Lapau / Zola)

Used in: traditional songs (Zola), poetry (Pasaltit), lullabies, proverbs

### Key Features
- Archaic vocabulary preserved
- Reduplication for rhythm: `ciakciak`, `vingveng`, `mahmah`
- Parallelism: two lines with same structure, different words
- Metaphor: `lung` (heart) compounds used freely
- Vocative `aw`: `Zomi aw!`, `Pasian aw!`
- Shortened forms for meter

### Example
```
Khapi aw hong kia, hong kia
Na koi lai na tat, na tat
(Come little bird, come
Wherever you go, go)
— Zolai Sinna Bu (children's song)
```

---

## Register Comparison Table

| Feature | Biblical | Written | Semi-formal | Conversational | Poetic |
|---|---|---|---|---|---|
| Subject pronoun | Always | Always | Usually | Often dropped | Flexible |
| Verb ending | `hi hi` | `hi` | `hi` | `hi` / dropped | Flexible |
| Ergative `in` | Always | Always | Usually | Sometimes | Flexible |
| Honorifics | `Topa`, `Pasian` | `Pu/Pi` | `Pu/Pi` | Name only | `aw` vocative |
| Contractions | None | None | Rare | Common | For meter |
| Quotative | `ci hi`, `ci-in` | `ci hi` | `ci hi` | `ci` | Embedded |

---

## Common Register Mistakes

| Mistake | Wrong | Correct |
|---|---|---|
| Church language in casual speech | `Kei in an ka ne hi hi.` | `An ka ne hi.` |
| Casual speech in prayer | `Pasian, dam ka hi maw?` | `Pasian aw, ka dam hi.` |
| Wrong honorific | `Thang, pai in.` (to elder) | `Pu Thang aw, pai ding na hi hiam?` |
| Dropping `in` in formal writing | `Pasian leitung piangsak hi.` | `Pasian in leitung a piangsak hi.` |

---

## Sources
- `wiki/ggammar/particle_differentiations.md`
- `wiki/ggammar/sentence_structures.md`
- `wiki/tualture/zomi_comprehensive.md`
- ZVS 2018 corpus, Zolai Sinna Bu, Zomidaily corpus

---
<!-- SOURCE: wiki/grammar/advanced_syntax.md -->

# Advanced Syntax: Relative Clauses and Complex Conditionals

Linguistic rules for complex sentence structures in Zolai (Tedim), based on the 2018 Zokam Standard Format and analyzed parallel corpora.

## 1. Relative Clauses (Who, Which, That)

Zolai relative clauses are typically formed using the particle `a` before the verb, followed by the head noun, or by using specific relative markers.

### Subjective Relative Clauses (The man who...)
The particle `a` functions as a linker between the description and the subject.
- **English:** The man who goes.
- **Zolai:** A pai mi. / A pai mipa.
- **Pattern:** `A` + [Verb] + [Noun]

### Objective Relative Clauses (The book that I read...)
- **English:** The book that I read.
- **Zolai:** Ka sim laibu.
- **Pattern:** [Pronoun/Subject] + [Verb] + [Noun]

### Complex Relative Phrases
When the relative clause is more descriptive, the verb often stays in its primary form, but subordination rules (Stem II) may apply if specific subordinate markers follow.
- **Standard Format Note:** "A + verb = A pai laitak hi." (He is going right now).
- **Relatival use:** "A hoih Pasian" (The God who is good).

---

## 2. Complex Conditionals (If, Unless, Provided that)

### The "If" Clause (`Leh` / `Lehang`)
- **If (Singular):** Verb + `leh`
    - *Example:* `Nong pai leh...` (If you come...)
- **If (Plural):** Verb + `lehang`
    - *Example:* `Pai lehang...` (If we go...)

### The "Unless" Clause (Ahihleh / Ahihkei leh)
"Unless" is handled by "If not" using specific negation markers based on the subject. 

**CRITICAL RULE:** For 2nd person subjects (`Nong`), use `kei` instead of `lo`. 
- **Correct (2nd Person):** `Nong pai kei a leh...` or `Nong pai kei leh...` (If you don't come / Unless you come).
- **Wrong:** `Nong pai kei a leh...`

**Third Person / General Negation:**
- **Possible:** `Hong pai lo hi leh...` (If he/she does not come).
- **Alternative (Otherwise/Or else):** `Ahihleh...`, `Ahihloh leh...`, or `Ahihkei leh...`.

**Biblical Evidence:**
The ZVS and TDB77 Bibles consistently follow this subject-dependent negation:
- `Thupha nong piak kei leh...` (If you don't give me a blessing) — *Gen 32:26*
- `Nong pia ding uh hi; tua hi kei leh...` (You shall give it; otherwise...) — *1 Sam 2:16*
- *See [Biblical Sentence Patterns](grammar/biblical_sentence_patterns.md) for more.*

### The "Provided that / As long as" (Ciang)
The temporal/conditional marker `ciang` can function as "when" or "provided that".
- **Example:** `Nong pai ciangin...` (When you come / Provided that you come...)

---

## 3. Subordinate Conjunctions (Because, Although)

### "Because / Since" (Ahih manin)
- **Structure:** [Clause] + `ahih manin`
- **Example:** `Giklua ahih manin...` (Because it is too heavy...)

### "Although / Even if" (Ahih hang / Ahi zongin)
- **Structure:** [Clause] + `ahih hangin`
- **Example:** `A thupit hangin...` (Although it is important...)
- **Even if:** `Ahi phial zongin...`

---

## 4. Syntactic Stem Shifts in Complex Sentences
In complex sentences, specific conjunctions trigger a shift to Stem II (Subordinate form):
- **Trigger:** `na`, `manin`, `ciang`
- **Examples:**
    - `mu` (Stem I) -> `muhna` (The seeing / Noun)
    - `kap` (Stem I) -> `kahna` (The crying / Subordinate)
    - `thei` (Stem I) -> `theih nading` (In order to know)

---

## 5. Base Sentence Patterns

These recursive patterns form the foundation of Zolai communication as documented in *Zolai Sinna Bu*.

### A. Identification & State (Defining)
- **Pattern:** `[Subject] [Noun/State] [hi/ka hi/na hi] hi.`
- **Examples:**
  - `Zomi ka hi hi.` (I am a Zomi.)
  - `Nipi ni ahi hi.` (It is Sunday.)
  - `Jesu migi mahmah hi.` (Jesus is very kind.)

### B. Action with Direct Object
- **Pattern:** `[Subject] [Object] [ka/na/a] [Verb] hi.`
- **Examples:**
  - `Sakhi sa ka ne hi.` (I eat barking-deer meat.)
  - `A u aw a za hi.` (He hears his elder brother's voice.)
  - `Tu tawh lo a kho hi.` (He hoes the field with a hoe.)

### C. Identifying Possession
- **Pattern:** `[Subject]' [Noun] [ahi hi].`
- **Examples:**
  - `Ka pu' mawtaw ahi hi.` (It is my grandfather's car.)
  - `Na tapa migi ka sa hi.` (I think your son is kind.)

---

## 6. Logic Filters (Standard Check)

To ensure "Correct Zolai" over "Beautiful Zolai" (as emphasized in *Zolai Gelhmaan*), observe these filters:

| Category | Incorrect (Wrong) | Correct (ZVS Standard) | Reason |
| :--- | :--- | :--- | :--- |
| **First Person Plural** | `I pai uh hi` | `I pai hi` | `I` (we) already implies the group; `uh` is redundant. |
| **Word Ordering** | `A u a huh buh tuh` | `A u buh tuh a huh hi` | Object `buh tuh` (planting) must precede the verb `huh` (help). |
| **Negation Stems** | `Pai lo` | `Paih lo` (secondary) | In formal subordinates or specific markers, Stem II is required. |
| **Space Usage** | `Nathapa` | `Na tapa` | Consistent spacing between possessive particle and noun is critical. |

---
*Reference: Zolai Sinna Bu (Lessons 1-15), Zolai Gelhmaan Bu (Intro, Sec. 1-10).*

---
<!-- SOURCE: wiki/grammar/phonology.md -->

# Zolai Phonology & Orthography

This document covers the complete linguistic structure of the Zolai (Tedim) sound system, encompassing the full phonemic inventory, orthographic conventions, phonetic restrictions, and apostrophe logic. Sourced from *Zolai Sinna Bu*, *Zolai Gelhmaan Bu*, and *Zolai Khanggui (AD 1899–2013)*.

## 1. Phonemic Inventory

### A. Vowels (Awphei) — 6 Monophthongs
| Letter | IPA | Realization | Note |
| :--- | :--- | :--- | :--- |
| **a** | /a/ | Open central | Standard |
| **e** | /e/ | Mid front | Standard |
| **i** | /i/ | Close front | Standard |
| **o** | /oʊ/ | Mid back → diphthong | `*o pen ou bang in awsuak hi` — always realized as /oʊ/ |
| **u** | /u/ | Close back | Standard |
| **aw** | /ɔː/ | Open-mid back rounded | Long vowel, distinct from `o` |

### B. Diphthongs (Awpheikop) — 10
| Diphthong | Example Word | Meaning |
| :--- | :--- | :--- |
| **ai** | `pai` | go |
| **ei** | `bei` | finish |
| **oi** | `hoih` | good |
| **ui** | `tui` | water |
| **awi** | `bawi` | slave |
| **au** | `hau` | rich |
| **eu** | `keu` | scrape |
| **iu** | `kiu` | curl |
| **ou** | `thou` | (rare, limited usage—`ou zatna tawm mahmah hi`) |
| **ia** | `bia` | worship |

### C. Triphthongs (Awphei-thumthuap) — 4
| Triphthong | Example |
| :--- | :--- |
| **uau** | `buau` |
| **iai** | `kiai` |
| **uai** | `buai` (busy/confused) |
| **iau** | `kiau` |

### D. Initial Consonants (Laimung) — 14 Singles + 4 Clusters
**Single Consonants:** `b, c, d, g, h, k, l, m, n, p, s, t, v, z`

**Consonant Clusters (Nihkop Laimung):**

| Cluster | Example | Meaning |
| :--- | :--- | :--- |
| **kh** | `khua` | village/weather |
| **ph** | `pha` | good/arrive |
| **ng** | `ngah` | receive |
| **th** | `thu` | word/matter |

**Letters absent in native Zolai:** `F, J, R, X, Q, Y` — These appear only in borrowed foreign proper nouns.

### E. Final Consonants (Laimung Dawn) — 8
| Final | Example | Meaning |
| :--- | :--- | :--- |
| **-k** | `hak` | hard |
| **-l** | `sal` | shout |
| **-m** | `gam` | country |
| **-n** | `man` | price |
| **-ng** | `thang` | fame |
| **-p** | `kap` | cry |
| **-t** | `that` | kill |
| **-h** | `sih` | die (glottal stop) |

---

## 2. Phonetic Restrictions (Forbidden Combinations)

Based on *Zolai Sinna Bu* (lines 1074–1076), three strict phonotactic rules are enforced:

1. **[t] + [i] never combine:** The letter `t` and `i` are never joined in native Zolai words. When an `i` sound follows `t` in related dialects, Tedim uses a different vowel or consonant.
2. **[c] + [a, e, o, aw] never combine:** The initial consonant `c` is restricted to pairing only with `i` and `u` (e.g., `ci`, `cih`, `ciang`). It never appears before `a`, `e`, `o`, or `aw`.
3. **[uh] never with first-person [i]:** The plural marker `uh` is never used with the first-person inclusive pronoun `i` (we).
   - ✅ `I pai hi` (We go)
   - ❌ `I pai uh hi`

---

## 3. Apostrophe (Pawfi) Logic

The apostrophe is a "super-character" performing three critical grammatical roles:

### A. Omission (Contraction)
Used when a letter is dropped for fluency.
| Full Form | Contraction | Context |
| :--- | :--- | :--- |
| `ka ong` | `k'ong` | 1st person agent |
| `na ong` | `n'ong` | 2nd person agent |
| `ka hong` | `k'hong` | 1st person directional |
| `bang a` | `ba'a` | Conjunction reduction |
| `bang hang a` | `bang ha'a` | Causal reduction |
| `nading` | `na'ng` | Purpose contraction |
| `nung a` | `nu'a` | Positional contraction |
| `sung ah` | `su'ah` | Locative contraction |

### B. Possession (Genitive)
Marks ownership of the preceding noun — contracted from the possessive particle `ii`.
- `Amah ii ta` → `Ama' ta` (His child)
- `Pasian ii thu` → `Pasian' thu` (God's word)
- `Nang ii thu` → `na'ng' thu` (Your matter)

### C. Date Marking
- `1974` → `'74`

---

## 4. Orthographic Conventions from Khanggui

### A. `noun khat word khat` Rule (One Concept = One Word)
When two morphemes combine to form a single concept (noun), they are written as a single word:
- `vantung` → `vantung` (heaven — lit. sky-above)
- `sing at` → `singat` (firewood — lit. tree-chop)
- `ak tui` → `aktui` (egg — lit. bird-liquid/egg)
- `ak si` → `aksi` (star — lit. bird-star/point)

### B. Distinguished Minimal Pairs (Zopau Homonyms)
Words that look/sound alike but differ in meaning — context determines spelling:
| Word A | Meaning | Word B | Meaning |
| :--- | :--- | :--- | :--- |
| `te` | diminutive pl. | `teh` | cut/weigh |
| `be` | goat | `beh` | clan/tribe |
| `le` | and | `leh` | if/then |
| `ne` | eat | `neh` | wrestle |
| `me` | palm of hand | `meh` | food prep |
| `de` | type of basket | `deh` | hit with whip |
| `ngawi` | quiet (drunk) | `ngoi` | roast meat |
| `khawi` | pluck (chicken) | `khoi` | strain (liquid) |

### C. Nasal `h` Distinction (zangh vs zang)
The presence or absence of final `h` changes meaning entirely:
- `zang` (use) vs `zangh` (bad quality)
- `lang` (appear) vs `langh` (reveal openly)
- `cing` (precise/skilled) vs `cingh` (very precise)
- `zong` (also/search) vs `zongh` (also — emphatic)
- `dong` (request) vs `dongh` (arrive/block)

---

## 5. Punctuation Rules (Laimal Zatzia)

1. **Tawpna (.)**: Ends sentences and abbreviations.
2. **Husanna (,)**: Separates items. **CRITICAL:** Do NOT use a comma before `le` (and).
   - ✅ `Thangpi, Lunsen le Lian Pau`
   - ❌ `Thangpi, Lunsen, le Lian Pau`
3. **Ngakna (:)**: Introduces lists, Bible references, or direct speech.
4. **Thekna (-)**: Used for compound words or ranges.
5. **Tanglak (')**: Apostrophe — contractions and possession (see §3).
6. **Kual ()**: Brackets for supplementary info.
7. **Git-awn (/)**: Slash for alternatives.

---

## 6. Tone System (Basic Overview)

*Zolai Gelhmaan Bu* identifies a complex tonal system. While not always marked in standard orthography:
- **Tone I (Flat/Level):** `Phei2pai`
- **Tone II (Falling):** `Nuaikiat`
- Double vowels can indicate long tones: `vaan` (sky) vs `van` (goods)

*For detailed tone rules, see [tones.md](grammar/tones.md).*

---
*Reference: Zolai Sinna Bu (Lessons 1–6), Zolai Gelhmaan Bu (Vol I), Zolai Khanggui (AD 1899–2013, pp. 12–17), ZVS Standard Format.*

---
<!-- SOURCE: wiki/grammar/morphemics.md -->

# Word Formation (Morphemics)

Zolai word formation involves complex stem shifts, suffixation, reduplication, and compound joining. This document codifies the rules found in *Zolai Gelhmaan Bu* (2010), *Zolai Sinna Bu*, and *Zolai Khanggui* (2013).

## 1. Noun Formation (`[Verb/Adjective] + na`)

Abstract nouns are created by appending the suffix `-na`. This often triggers a morphological shift in the base word's final consonant or tone (the "Stem II" shift).

### A. The "Stem II" Shift (Consonant Transformation)

| Final Sound | Shift | Verb/Adj (Stem I) | Noun (Stem II + na) |
| :--- | :--- | :--- | :--- |
| **Vowel** | → **-h** | `si` (die) | `sihna` (death) |
| **Vowel** | → **-k** | `la` (take) | `laakna` (taking) |
| **Vowel** | → **-t** | `sa` (hot) | `satna` (heat) |
| **-i** | → **-ih** | `nei` (have) | `neihna` (possession) |
| **-i** | → **-ih** | `thei` (know) | `theihna` (knowledge) |
| **-l** | → **-lh** | `sal` (shout) | `salhna` (calling) |
| **-u** | → **-uh** | `hau` (rich) | `hauhna` (wealth) |
| **-k** | → **-h** | `hak` (hard) | `hahna` (hardness) |
| **-k** | → **-h** | `bawlk→bawl` | `bawlna` (creation) |
| **-p** | → **-h** | `kap` (cry) | `kahna` (crying) |
| **-t** | → **-h** | `that` (kill) | `thahna` (killing) |
| **-m** | → **-p** | `sam` (call) | `sapna` (calling) |
| **-m** | → **-p** | `dam` (well) | `dapna` (wellness) |
| **-n** | → **-t** | `kipan` (start) | `kipatna` (origin) |
| **-n** | → **-t** | `man` (catch) | `matna` (capture) |
| **-ng** | → **-n'** | `thang` (famous) | `than'na` (fame) |
| **-ng** | → **-t** | `taang` (transfer) | `tatna` (redemption) |

### B. Tone-Only Shifts (No Spelling Change)
Some words do not change spelling but undergo a tonal shift when nominalized:
- `kum` (descend) → `kumna`
- `om` (exist) → `omna` (existence/dwelling)
- `lau` (fear) → `launa` (fear)
- `pawl` (associate) → `pawlna` (association)
- `it` (love) → `itna` (love)
- `up` (believe) → `upna` (faith)
- `gup` (save) → `gupna` (salvation)

---

## 2. Compound Word Formation (Kammal Kikop)

From *Zolai Khanggui* (lines 483–500), compound words are formed by joining morphemes that create new unified concepts.

### A. Simple Joining (`noun khat word khat`)
When two morphemes form a single concept, they are written as one word:

| Components | Compound | Meaning | Note |
| :--- | :--- | :--- | :--- |
| `van + tung` | `vantung` | heaven | sky + above |
| `lei + tung` | `leitung` | earth | ground + above |
| `tui + pi` | `tuipi` | sea | water + big |
| `ak + tui` | `aktui` | egg | bird + liquid/water/seed |
| `ak + si` | `aksi` | star | bird + star/point |
| `lai + tak` | `laitak` | middle | space + exact |
| `tawn + tung` | `tawntung` | forever | always + above |
| `ton + khawm` | `tonkhawm` | meeting | gather + together |
| `lung + dam` | `lungdam` | happy | heart + well |
| `siang + tho` | `siangtho` | holy | pure + clean |
| `puan + ten` | `puanten` | cloth/clothes | fabric + spread |
| `mual + dawn` | `mualdawn` | mountain pass | hill + cross |
| `lui + tui` | `luitui` | River water | stream + water |
| `pulepa` | `pulepa` | Ancestors | |
| `Hausapa` | `Hausapa` | Village Chief | |
| `Siavuanpa` | `Siavuanpa` | Doctor | |
| `lokhote` | `lokhote` | Farmers | |
| `anhuante` | `anhuante` | Cooks | |

### B. Prefix Compounds

**`ki-` (Reciprocal/Passive/Reflexive):**
| Form | Meaning | Example |
| :--- | :--- | :--- |
| `kipawl` | Associate | from `pawl` (group) |
| `kituak` | Meet each other | from `tuak` (encounter) |
| `kibawl` | Be made/created | from `bawl` (make) |
| `kigawm` | Combine | from `gawm` (join) |
| `kikhop` | Gather | from `khop` (enough) |
| `kipia` | Be given / offered | from `pia` (give) |
| `kisia` | Be bad / wronged | from `sia` (bad) |
| `kisilh` | Wash oneself | from `silh` (wear) |
| `kipuah` | Cover oneself | from `puah` (cover) |
| `kitawng` | Speak to each other | from `tawng` (speak) |
| `kilem` | Be tested | from `lem` (test) |
| `kipelh` | Avoid each other | from `pelh` (avoid) |

**`a-` + Position:**
`atung` (above), `anuai` (below), `amai` (front), `agei` (beside), `asung` (inside), `alai` (middle)

### C. Nominalization from `ki-` verbs:
`ki-` + verb + `-na` → abstract noun:
- `kipawlna` (organization), `kisiatna` (evil/wrongdoing), `kisilna` (bathing)
- `kipuahna` (covering), `kitotna` (competition), `kitenna` (settling)
- `kilamdanna` (difference), `kilemna` (trial), `kipelhna` (avoidance)
- `kipatna` (origin), `kipiakna` (offering)

---

## 3. Reduplication Patterns

### A. Identical Reduplication (Intensifier/Adverb)
The base word is repeated exactly, creating intensity or adverbial force:
- `mahmah` — very (from `mah`)
- `pahpah` — quickly (from `pah`)
- `guapguap` — greedily
- `damdam` — slowly/gently (from `dam`)
- `dendeuhin` — continuously (from `den`)

### B. Vowel-Alternating Reduplication
From *Khanggui* (lines 496–499), Zolai has a productive reduplication pattern where vowels alternate:

| Pattern | Examples |
| :--- | :--- |
| **e-o** alternation | `pepeuh` (each), `sitset` (exactly), `melmul` (appearance) |
| **e-a** alternation | `deidai` (messy), `seisai` (scattered), `lelaw` (various) |
| **e-i** alternation | `pheiphoi` (scattered), `beiboi` (various) |
| **e-o-a** triple | `belbol/belbal` (various), `lemlom/lemlam` (glimpse) |
| **i-u** alternation | `fifu/fiafua` (whistle), `kilkul` (roll), `kelkal` (stumble) |
| **i-a** alternation | `khinkhian` (certainly), `deidoi` (untidy) |

### C. Expressives (Sound Symbolism)
- `kiuhkeuh` — writhing, twisting
- `liuhleuh` — swaying, dangling
- `phiuhpheuh` — fluttering
- `siuhseuh` — dripping/leaking
- `ziuhzeuh` — giggling
- `khiuhkheuh` — creaky/rattling

---

## 4. Adverb Formation

### A. By Reduplication
- `pahpah` (quickly), `mahmah` (very), `damdam` (gently/slowly)

### B. By Suffix `-in` / `-takin`
- `hoih + takin` → `hoihtakin` (well/nicely)
- `manlang + takin` → `manlangtakin` (swiftly)
- `limpha + in` → `limpha-in` (nobly)
- `den + deuhin` → `dendeuhin` (continuously)

### C. By Position Particle
- `nekpi-in` (greatly), `nakpi-in` (intensely)

---

## 5. Directional & Aspectual Modifiers (Agglutination)

---
<!-- SOURCE: wiki/translation/decision_patterns.md -->

# Decision Patterns & Task Logic

This document codifies the internal "Second Brain" logic for Zolai translation and auditing. It tracks how decisions are made when resolving linguistic ambiguity, taking into account the new Language Tutor routing logic.

## 1. The "Zolai First" Decision Matrix
When encountering an English concept or tutoring a student, the system follows this priority:
-   **Pedagogical Goal:** Is the user learning? If yes, provide hints over direct answers. Ensure the translation matches the user's detected difficulty level.
-   **Standard Consistency:** Does it match `Zolai_Standard_Format.txt`?
-   **Pure Tedim Dialect Filter:** Strictly **exclude** non-Tedim (Hakha/Falam) styles. Prioritize Tedim-specific terms over generic or neighboring dialect terms.
-   **Idiomatic Naturalness:** Would a native speaker say this? (e.g., `Cidam hi` > `Hoih hi`).
-   **Register/Domain Alignment:** Does the vocabulary match the selected domain (e.g., religious vs. daily conversation)?
-   **Stem Accuracy:** Is the correct Stem (I or II) used for the syntactic slot?

## 2. Pedagogical Pattern Logic (Sinna/Sinbu)
Decision logic for a language tutor following the standard curriculum.

| Pattern | Logic / Reasoning | Example |
| :--- | :--- | :--- |
| **Simplicity First** | Use A1-level core words before complex synonyms. | `Pai` (Go) vs `Kalsuan` (March/Move). |
| **Soft Suffix Trigger** | If an exercise focuses on `-h`, prioritize `cinah`, `cimawh`, etc. | `Na cina na?` (Are you sick?). |
| **Comparative Chain** | Use `...sangin ... -zaw` for all comparison drills. | `Lian sangin tei zaw hi.` |
| **Negative Volition** | Distinguish between `keng` (I won't) and `lo` (I don't). | `Ka pai keng.` (I refuse). |

## 3. Register & Social Decision Matrix
Logic for choosing the correct phrase based on social proximity.

| Input / Context | Decision | Reason |
| :--- | :--- | :--- |
| **Formal / Elder** | Use `na'ng` (singular) or `Note` (plural as honorific). | ZVS/Khanggui respect markers. |
| **Informal / Peer** | Use `Dam maw?` | Everyday Sinbu greeting. |
| **General Greeting** | Use `An na ne na?` | Cultural standard from Sinna. |
| **Religious Intro** | Use `Topa' Thupha...` | Standard ZVS evangelical register. |

## 4. Dialect Filter: Avoid vs. Prefer
To maintain pure Zolai Tedim literacy, the system MUST filter out the following non-Tedim styles common in neighboring languages (Hakha-Lai, Falam).

| Avoid (Non-Tedim) | Prefer (Pure Tedim) | Grammatical Category |
| :--- | :--- | :--- |
| **tua / tua** | **tua** | That / Then (Demonstrative) |
| **pasian** | **pasian** | God (Proper Noun) |
| **topa** | **topa** | Lord / Master |
| **tapa** | **tapa** | Son |
| **gam** | **gam** | Country / Land |
| **siangpahrang** | **kumpipa** | King / Ruler |
| **bia** | **thu** | Word / Message |
| **ka hmu** | **ka mu** | See (Verb) |

## 5. Translation Patterns (Recurrent Structures)

### A. The "Nong... Hi" Pattern (Relative Clauses)
English often uses "The [Noun] that [Subject] [Verb]".
- **Pattern:** `[Subject]' [Verb] [Noun] pen...`
- **Example:** "The book you gave me" -> `Nong piak laibu pen...` (Note: `Nong` = `na'ng` + `hong`).

### B. The "Passive-to-Active" Shift
Zolai avoids the passive voice where possible.
- **English:** "It is said that..."
- **Direct (Avoid):** `Kici hi...`
- **Natural (Prefer):** `Mi te'n gen uh hi...` (People say...) or `Kizakna ah...` (In what is heard...).

### C. The "Resultative Stack" (Action Logic)
Zolai describes the *process* and the *result* in a single stack.
- **Pattern:** `[Verb] + [Completion: khin] + [Mastery: zo] + [Finality: lian]`
- **Logic:** You cannot be "lian" (final) without being "khin" (complete).

### D. The "Pen... Hi" Identifying Structure
When identifying a subject as a specific noun or defining it.
- **Pattern:** `[Subject] pen [Definition] ahi hi.` (Formal) or `[Subject] pen [Definition] hi.` (Standard).
- **Example:** "The Word was God" -> `Tua Thu pen Pasian ahi hi.` (JHN 1:1)

### E. Exclusive Negation (Tello-in)
Expressing "without" or "except for".
- **Pattern:** `[Noun] tello-in [Action] kei.`
- **Example:** "Without him was not anything made" -> `Amah tello-in bangmah a piang kei hi.` (JHN 1:3)

### F. The "Hi Cih" Complementizer Pattern
When stating a fact or a reported belief as the object of a verb (e.g., "to know that...", "to see that...").
- **Pattern:** `[Fact] hi cih [Verb].`
- **Example:** "Know that I am with you" -> `Note tawh ka omkhawm hi cih na thei un.`
- **Note:** `cih` acts as the complementizer "that".

### G. Directional Suffixes (Tuksuk / Tohpiah)
Zolai uses specific verb suffixes to indicate vertical or relational direction.
- **-suk:** Downward (e.g., `tuksuk` - come down/descend).
- **-toh:** Upward (e.g., `kahtoh` - go up/ascend).
- **-piah:** Beyond/Away (e.g., `kitohpiah` - taken up/away).

### H. The "Bang Hang Hiam... I Cih Leh" Explanatory Pattern
Zolai uses a unique "Question-Answer" structure for logical explanations (equivalent to English "Because..." or "For...").
- **Pattern:** `Bang hang hiam i cih leh, [Explanation] ahi hi.`
- **Literal:** "If we say 'Why is that?', [Explanation] it is."
- **Example:** "For all have sinned" -> `Bang hang hiam i cih leh, mi khempeuh a mawh hi.` (ROM 3:23)

### I. Conditional Correlatives (Ahih Leh / Ahih Ciangin)
Differentiating between "If" (hypothetical) and "Since/When" (consequential).
- **Ahih Leh:** Hypothetical "If" (e.g., `Na up leh...` - If you believe...).
- **Ahih Ciangin:** Consequential "Since/Because" (e.g., `Na up khit ahih ciangin...` - Since you have believed...).

### J. The "Longal... Kei/Lo" (Except/Only) Pattern
English "Only [X]..." or "None except [X]..." is expressed with `longal` and a negative verb.
- **Pattern:** `[Exception] longal [Subject] [Verb-Negative].`
- **Example:** "No one knows except the Spirit" -> `Kha Siangtho longal kuamah in a thei kei hi.` (1CO 2:11)

### K. The "Lest" / "So that... not" Pattern
Using the `loh nadingin` structure to express purpose of avoidance.
- **Pattern:** `[Condition/Reason] ... [Verb-Stem II] loh nadingin...`
- **Example:** "Lest the cross be made of none effect" -> `Singlamteh a mawkna ahih loh nadingin...` (1CO 1:17)
- **Note:** Requires Stem II of the verb before `loh`.

### M. The Rhetorical "Where/How" (Koi-ah / Bangci)
In logical argumentation (Epistles), rhetorical questions are used to challenge status or location.
- **Pattern:** `[Subject] koi-ah a om hiam?`
- **Example:** "Where is the wise?" -> `Lungpil mi koi-ah a om hiam?` (1CO 1:20)

### N. The "In/Through" (Hangah vs Hangin)
Distinguishing between "because of/through" (cause) and "in/by" (sphere/means).
- **Hangin:** Cause/Motivation (e.g., `Pasian' deihna hangin` - by the will of God).
- **Hangah:** Sphere/Position (e.g., `Note in amah hangah...` - You in him...).
- **Note:** Often interchangeable in modern speech but distinct in formal Standard ZVS.

### P. The Comparative "Sangin... -Zaw"
Zolai uses a post-positional "than" marker combined with a verb suffix.
- **Pattern:** `[A] [B] sangin [Verb]-zaw [hi].`
- **Example:** "God's foolishness is wiser than men" -> `Pasian' haina in mite' pilna sangin a pilzaw hi.` (1CO 1:25)

### Q. Emphatic Inclusion (Nangawn)
Equivalent to English "even" or "also in an extreme sense".
- **Pattern:** `[Noun] nangawn [Action].`
- **Example:** "Even those that are not" -> `A om lote nangawn...` (1CO 1:28)

### R. The "Ahih Manin" vs "Tua Ahih Ciangin" (Therefore)
Refining the causal link in logic.
- **Ahih Manin:** Direct causality (Because of that).
- **Tua Ahih Ciangin:** Consequential transition (In light of that / Therefore).
- **Example:** "Therefore let no man glory" -> `Tua ahih ciangin kuamah... kisathei kei hen.` (1CO 3:21)

### S. Exclusive "Longal" with "Kuamah" (Universal Exception)
- **Pattern:** `[Exception] longal kuamah [Verb-Negative].`
- **Example:** "No one knows except the Spirit" -> `Kha Siangtho longal kuamah in a thei kei hi.` (1CO 2:11)
- **Note:** `Longal` is the critical trigger for the negative verb ending.

### U. The "Nget-ngut" and "Zei-zai" Reduplicatives
Zolai uses rhythmic reduplication to indicate intensity, persistence, or descriptive texture.
- **Pattern:** `[Verb/Adj] + [Reduplicative Pair]`
- **Example:** `Thum nget-ngut` (Persistent prayer), `Te-zeizai` (Brightly/Clearly).
- **Nuance:** These are often idiomatic and vary by dialect, but ZVS standardizes several from the 1932/2018 versions.

### V. Formal Request/Exhortation: "Kong thuum hi"
Used to translate "I beseech you" or "I entreat you" in a formal, high-register context.
- **Pattern:** `[Subject] [Object] [Action] nadingun kong thuum hi.`
- **Example:** "I beseech you... confirm your love" -> `ama it takpi uh na kilatsak nadingun kong thuum hi.` (2CO 2:8)

### W. The "Maleep" (Seal/Earnest/Guarantee)
Specialized theological term for a down-payment or guarantee, specifically used for the Holy Spirit.
- **Pattern:** `Kiciamna maleep` (The guarantee of the promise).
- **Ref:** 2CO 1:22, 5:5.

### X. Metaphorical Containers: "Sum leibeel"
Translating "earthen vessels" or "clay jars" to represent human fragility vs. divine treasure.
- **Term:** `Sum leibeel` (Earthen/clay pot).
- **Ref:** 2CO 4:7.

### Y. Universal Law Logic (Absolutes)
In translating strict theological or legal absolute statements from the Epistles, careful distinction must be made between "all" scopes.
- **`Khempeuh` (Universal Total):** "Whosoever" or "all without boundary" (e.g., `Simlei mi khempeuh` - All people in the world).
- **`Teng` (Specific Group Total):** "All of these" (e.g., `Hih thu teng` - All of these things). Used when the scope of "all" is a closed loop.

### AA. The "Ci-le-sa" (Flesh/Nature)
Distinguishing between the physical body (`pumpi`) and the sinful nature or human effort (`ci-le-sa`).
- **Context:** Used heavily in Galatians to contrast with the Spirit (`Kha Siangtho`).
- **Pattern:** `Ci-le-sa ngeina` (After the manner of the flesh).

### AB. Curse and Blessing: "Hamsiatna" vs "Thupha"
- **Hamsiatna:** Curse. Often used with `thuak` (to suffer/endure).
- **Thupha:** Blessing. Often used with `ngah` (to receive) or `piak` (to give).
- **Ref:** Galatians 3:13.

### AC. Redundant Identification: "Ahi keimah Paul"
Used when a speaker identifies themselves emphatically at the start of a letter or declaration.
- **Pattern:** `[Identity/Title] ahi keimah [Name]...`
- **Example:** "I Paul, an apostle" -> `sawltak ahi keimah Paul...` (GAL 1:1)

### AE. Body and Head: "Pumpi" and "Lutang"
Structural metaphor for the Church and Christ.
- **Lutang:** Head / Leader.
- **Pumpi:** Body / Community.
- **Ref:** Ephesians 1:22-23, 4:15-16.

### AF. The "Nidang lai... Tu-in" Contrast
Common rhetorical device in Ephesians to show transformation from the old self to the new.
- **Nidang lai-in:** In the past / formerly.
- **Tu-in:** Now / at present.
- **Pattern:** `Nidang lai-in [Old State] i hi a, ahih hangin tu-in [New State] i hi hi.`

### AG. Calling and Vocation: "Sapna"
Translating the concept of being "called" by God.
- **Sapna:** Calling / invitation.
- **Pattern:** `Hong sapna tawh kituakin...` (Worthy of the calling...).

### AH. Armor and Warfare: "Galvan"

---
<!-- SOURCE: wiki/translation/english_to_zolai_mapping.md -->

# English-to-Zolai Grammar Mapping

This document provides a systematic mapping of English grammatical structures to Zolai (Tedim). It is designed to help translates and AI models convert English intent into natural, standard Zolai (ZVS).

---

## 1. Basic Sentence Structure

| English Structure (SVO) | Zolai Equivalent (SOV / OSV) | Example (English) | Example (Zolai) |
| :--- | :--- | :--- | :--- |
| **I read a book.** | **Laibu ka sim hi.** (OSV) | I read a book. | Laibu ka sim hi. |
| **My father reads.** | **Ka pa in sim hi.** (S-in V) | My father reads. | Ka pa in sim hi. |
| **I am a teacher.** | **Sia ka hi hi.** (S identity) | I am a teacher. | Sia ka hi hi. |

- **Pro-drop:** Zolai often drops the subject pronoun if the verb prefix (`ka`, `na`, `a`) makes it clear.
- **Natural Order:** OSV is often more natural for simple sentences: `Tui ka dawn nuam hi` (Water I drink want).

---

## 2. Tenses & Aspects

| English Tense | Zolai Primary Marker | Example (Zolai) |
| :--- | :--- | :--- |
| **Present Simple** | `... hi` | A pai hi. |
| **Present Continuous** | `... laitak hi` | A pai laitak hi. |
| **Past Simple** | `... ta / khin / khinzo` | A pai ta. / A pai khinzo hi. |
| **Past Continuous** | `... laitak hi` (Context dependent) | Tua hunin a pai laitak hi. |
| **Past Perfect** | `... khinsa hi` | A pai khinsa hi. |
| **Future Simple** | `... ding hi` | A pai ding hi. |
| **Future Perfect** | `... khinzo ding hi` | A pai khinzo ding hi. |
| **Habitual** | `... den hi` | A ne den hi. |

---

## 3. Negation (Subject-Dependent)

| English "Not" | Subject | Zolai Marker | Example |
| :--- | :--- | :--- | :--- |
| **I do not...** | 1st Person | `... lo / keng` | Ka pai lo hi. / Ka pai keng. |
| **You do not...** | 2nd Person | `... kei` | Na pai kei hi. |
| **He does not...** | 3rd Person | `... lo` | A pai lo hi. |
| **Don't!** | Imperative | `... kei in` | Pai kei in. |

---

## 4. Question Forms

| English Question | Zolai Ending/Word | Example |
| :--- | :--- | :--- |
| **Do you...?** | `... hiam? / ... maw?` | Na pai hiam? |
| **What?** | `Bang ... hiam?` | Bang na sem hiam? |
| **Who?** | `Kua ... hiam?` | Kua na hi hiam? |
| **Where?** | `Koi ah ... hiam?` | Koi ah na om hiam? |
| **Why?** | `Banghang ... hiam?` | Banghang na pai hiam? |
| **When?** | `Banhun ... hiam? / ... ciang?` | Banhun na pai ding hiam? |
| **How?** | `Bangci ... hiam?` | Bangci na hih hiam? |

---

## 5. Modal Verbs

| English Modal | Zolai Equivalent | Example (Zolai) |
| :--- | :--- | :--- |
| **Can / Able to** | `thei` | Ka pai thei hi. |
| **Must / Have to** | `ding / kul` | Ka pai ding hi. / Ka pai a kul hi. |
| **Should** | `... leh hoih ding` | Na pai leh hoih ding hi. |
| **May / Might** | `kha / khaam` | A pai kha ding hi. |
| **Want to** | `nuam / duh` | Ka pai nuam hi. |

---

## 6. Complex Clauses (Subordination)

| English "If/Because" | Zolai Marker | Example |
| :--- | :--- | :--- |
| **If...** | `... leh` | Na pai leh... |
| **Unless...** | `... kei leh` (2nd Person focus) | Nong pai kei leh... |
| **Because...** | `... ahih manin / hangin` | A pai manin... |
| **When...** | `... ciangin / teh` | A pai ciangin... |
| **Although...** | `... ahih hangin / napi` | A pai hangin... |
| **Before...** | `... ma-in` | A pai ma-in... |
| **After...** | `... khit ciangin` | A pai khit ciangin... |

---

## 7. Comparison & Degree

| English Form | Zolai Structure | Example |
| :--- | :--- | :--- |
| **Taller than...** | `A sang in B ... sang zaw` | Kei sangin amah a sang zaw hi. |
| **Tallest** | `... pen` | A sang pen hi. |
| **Very tall** | `... mahmah / lua` | A sang mahmah hi. / A sang lua hi. |

---

## 8. Advanced Biblical Structure Mappings

The Bible (ZVS 2018, and TDB77 for historical register) provides authoritative templates for complex English-to-Zolai equivalence.

### A. Causatives ("To make/cause someone to do")
English "make" or "cause" is mapped to the Zolai suffix **`-sak`**.
- **English:** He caused it to rain.
- **Zolai:** Guah zu**sak** hi.
- **English:** Let it divide the waters.
- **Zolai:** Tui leh tui kikhen**sak** hen.

### B. Passives and States ("To be done")
Marked by the prefix **`ki-`** or specific state verbs.
- **English:** They were created.
- **Zolai:** **Ki**piansak hi.
- **English:** The river was parted.
- **Zolai:** Gun hong **ki**khen hi.
- **English:** Be gathered together.
- **Zolai:** **Ki**khawm hen.

### C. Purposive Clauses ("In order to / So that")
Mapped to **`-nading`** or **`dingin`**.
- **English:** To give light upon the earth.
- **Zolai:** Leitung khua a vaksak **dingin**...
- **English:** For signs and for seasons.
- **Zolai:** Pawi hun leh khua hun khen **nading** limte...

### D. Resultative / Completed Participle ("Which was made")
Mapped to the suffix **`-sa`**.
- **English:** The work which he had made.
- **Zolai:** Ama' hih**sa** nasep.
- **English:** The man whom he had formed.
- **Zolai:** Ama' bawl**sa** mipa.

### E. Precative / Exhortatory ("Let us...")
Mapped to the ending **`-ni`** (inclusive) or **`-hen`** (let it be).
- **English:** Let us make man.
- **Zolai:** Mihing bawl **ni**.
- **English:** Let there be light.
- **Zolai:** Khuavak om **ta hen**.

### F. Narrative Transitions ("And it happened...")
Used to maintain the flow of Biblical prose.
- **English:** And it came to pass.
- **Zolai:** Tua ahih ciangin...
- **English:** Now the serpent was...
- **Zolai:** Tu-in gulpi pen...
- **English:** After these things.
- **Zolai:** Hihte khit ciangin...

---

## 10. Phonetic & Orthographic Constraints
When mapping sounds, the following Sinna-defined rules must be followed:
1. **[t] + [i] Mapping:** Never map English "ti" or "ty" sounds directly to `ti`. Use `te` or alternate mappings.
2. **[c] + [a/e/o/aw] Mapping:** Never map `c` before these vowels. `c` only maps before `i` and `u`.
3. **[o] Realization:** English /ou/ maps to `o`. English /o/ (as in "got") marks closer to `aw`.

---
*Reference: Zolai Grammar Cheat Sheet, Biblical Sentence Patterns, ZVS 2018, Zolai Sinna Bu.*

---
<!-- SOURCE: wiki/translation/emotion_lung_cheat_sheet.md -->

# Lung- Emotional Compounds — Complete Cheat Sheet

The `lung-` prefix is Zolai's core psycho-emotional morpheme. It literally means "heart/mind" and generates the entire emotional vocabulary of the language. This is the **single most important morphological pattern** for understanding Zolai emotional expression.

> Extracted empirically from the full 2.5M+ word corpus (ZVS + TDB77 + Tedim 1932 + all raw sources).

## Core Emotions (Top 20 by Frequency)

| Rank | Compound | Literal | English | Corpus Count |
| :--- | :--- | :--- | :--- | ---: |
| 1 | **lungsim** | lung + sim (think) | heart/mind/soul/conscience | 22,754 |
| 2 | **lungdam** | lung + dam (well) | happy/joyful/thankful | 14,757 |
| 3 | **lunglut** | lung + lut (enter) | devoted/dedicated/zealous | 5,376 |
| 4 | **lungkim** | lung + kim (complete) | content/satisfied/at peace | 5,293 |
| 5 | **lunggulh** | lung + gulh (desire) | covetous/greedy/desiring intensely | 5,021 |
| 6 | **lungdamna** | lung + dam + na | joy/happiness (noun) | 4,423 |
| 7 | **lungkham** | lung + kham (block) | worried/anxious | 3,312 |
| 8 | **lungnuam** | lung + nuam (pleasant) | pleasant/comfortable/at ease | 2,940 |
| 9 | **lungtang** | lung + tang (hard surface) | heart-stone/emotions scar | 2,894 |
| 10 | **lungkia** | lung + kia (fall) | sad/downcast/disappointed | 2,344 |
| 11 | **lunglutna** | lung + lut + na | devotion/zeal (noun) | 1,641 |
| 12 | **lungkhamna** | lung + kham + na | worry/anxiety (noun) | 1,291 |
| 13 | **lungngai** | lung + ngai (long for) | nostalgic/missing/longing | 1,183 |
| 14 | **lungduai** | lung + duai (shake) | disturbed/troubled/agitated | 1,061 |
| 15 | **lungnop** | lung + nop (enjoy) | delighted/pleased | 968 |
| 16 | **lunggulhna** | lung + gulh + na | covetousness/greed (noun) | 950 |
| 17 | **lungmuang** | lung + muang (trust) | trusting/assured/confident | 863 |
| 18 | **lungnopna** | lung + nop + na | delight/pleasure (noun) | 807 |
| 19 | **lungleng** | lung + leng (wander) | unsettled/restless heart | 594 |
| 20 | **lungbuai** | lung + buai (confused) | confused/troubled/perplexed | 577 |

---

## Extended Emotional Vocabulary

### Positive Emotions
| Compound | English | Usage |
| :--- | :--- | :--- |
| **lungdam** | Happy, thankful | `Ka lungdam mahmah hi.` — I am very happy. |
| **lungdamsak** | Make happy | `Topa in ka lungsim lungdamsak hi.` — The Lord makes my heart happy. |
| **lungdamhuai** | Worthy of joy | `Lungdamhuai thu khat om hi.` — There is joyful news. |
| **lungdampih** | Congratulate | `Nong gualzawhna ka lungdampih hi.` — I congratulate your success. |
| **lungdambawl** | Celebrate joyfully | `Pasian tungah lungdambawl ni.` — Celebrate joyfully before God. |
| **lungdamkohna** | Congratulations | `Lungdamkohna ka piak hi.` — I give congratulations. |
| **lungkim** | Content, satisfied | `Ka lungkim hi.` — I am satisfied. |
| **lungkimsak** | Satisfy | `Topa in hong lungkimsak hi.` — The Lord satisfies us. |
| **lungkimhuai** | Satisfying | `Lungkimhuai nasepna ahi hi.` — It is a satisfying work. |
| **lungnuam** | Pleasant, comfortable | `Lungnuam takin om hi.` — Living comfortably. |
| **lungnuamsak** | Make comfortable | `Khuavak in lung hong nuamsak hi.` — The light comforts the heart. |
| **lungnop** | Delighted | `Ka lungnop mahmah hi.` — I am greatly delighted. |
| **lungmuang** | Trusting, confident | `Topa ka lungmuang hi.` — I trust in the Lord. |
| **lungmuanna** | Trust/confidence (n) | `Lungmuanna tawh om ding.` — Living with confidence. |
| **lungawi** | Willing, consenting | `Lungawi takin piak hi.` — Giving willingly. |
| **lungnem** | Tender-hearted, gentle | `Lungnem takin gen hi.` — Speaking gently. |

### Negative Emotions
| Compound | English | Usage |
| :--- | :--- | :--- |
| **lungkia** | Sad, downcast | `Ka lungkia mahmah hi.` — I am very sad. |
| **lungkiat** | Discouraged | `Lungkiat kei in.` — Don't be discouraged. |
| **lungkiatna** | Discouragement (n) | `Lungkiatna pen Pasian kiangpan hitkei.` — Discouragement is not from God. |
| **lungkham** | Worried, anxious | `Bangmah hangin lungkham kei in.` — Don't worry about anything. |
| **lungkhamna** | Worry (n) | `Lungkhamna teng Pasian kiang ah koih in.` — Cast all your worries on God. |
| **lunggulh** | Covetous, greedy | `Lunggulh ding hilo hi.` — One should not be greedy. |
| **lungbuai** | Confused | `Ka lungbuai mahmah hi.` — I am very confused. |
| **lungduai** | Disturbed, troubled | `A lungduai mahmah hi.` — He is greatly troubled. |
| **lungduaina** | Disturbance (n) | `Lungduaina hong suak hi.` — Disturbance has come. |
| **lunghimawh** | Anxious, uneasy | `Ka lunghimawh mahmah hi.` — I am very uneasy. |
| **lunghihmawh** | Dreadful, fearful | `Lunghihmawh bawl mahmah hi.` — It is very dreadful. |
| **lunghihmawhna** | Dread/fear (n) | `Lunghihmawhna hong tungsak hi.` — Dread comes upon [us]. |
| **lungno** | Sorrowful, aggrieved | `Ka lungno mahmah hi.` — I am deeply sorrowful. |
| **lungneu** | Disheartened | `Lungneu kei in.` — Don't be disheartened. |
| **lungmang** | Restless, troubled | `A lungmang mahmah hi.` — He is very restless. |
| **lungphona** | Offense (n) | `Lungphona la kei in.` — Don't take offense. |

### Spiritual/Deep Emotions
| Compound | English | Usage |
| :--- | :--- | :--- |
| **lungsim** | Heart-mind, conscience | `Na lungsim vekpi-in Pasian it in.` — Love God with all your heart-mind. |
| **lunglut** | Zealous, devoted | `Lunglut takin nasep hi.` — Working devotedly. |
| **lunglutna** | Devotion, zeal (n) | `Na inn adingin lunglutna in ka ki-it hi.` — Zeal for your house consumes me. *(Psalm 69:9)* |
| **lungtang** | Heart-scar, emotional mark | `A lungtang tung ah a ma na om lai veve hi.` — The scar remains on his heart. *(Gentehna: Hehna le Siktukilh)* |
| **lungngai** | Nostalgic, longing | `Ka gamsung ka lungngai hi.` — I am nostalgic for my homeland. |
| **lungngaih** | Love deeply, long for | `Na lung ka ngaih hi.` — I long for you deeply. |
| **lungngaihna** | Deep love/longing (n) | `Lungngaihna tawh kipia hi.` — Given with deep love. |
| **lungleng** | Restless, wandering heart | `A lungleng mahmah hi.` — His heart wanders restlessly. |
| **lunglenna** | Restlessness (n) | `Lunglenna hong bei ta hen.` — May restlessness end. |
| **lungphawng** | Convicted, pierced | `Lungphawng takin a hehna botkhia hi.` — Convicted, he released his anger. |
| **lungto** | Patient, enduring | `Lungto takin ngak in.` — Wait patiently. |
| **lungthin** | Innermost feelings | `Ka lungthin sungah om hi.` — It is in my innermost feelings. |
| **lungpi** | Big-hearted, generous | `Lungpi takin piak hi.` — Giving generously. |

---

## Morphological Notes

1. **Base form:** `lung-` + verb/adjective = emotional state
2. **Noun form:** `lung-` + verb + `-na` = emotional noun (e.g., `lungdamna`, `lungkhamna`)
3. **Causative:** `lung-` + verb + `-sak` = cause that emotion (e.g., `lungdamsak`, `lungkimsak`)
4. **Evaluative:** `lung-` + verb + `-huai` = worthy of that emotion (e.g., `lungdamhuai`, `lungkimhuai`)
5. **Reciprocal:** `lung-` + verb + `-pih` = share that emotion with someone (e.g., `lungdampih`)
6. **Negative state:** `lung-` + verb + `-lo` = absence of that emotion (e.g., `lungkimlo`, `lungnuamlo`)

---

## Usage in Literary Registers

### Biblical Register (formal)
- `Topa in na lungkhamna khempeuh in hong suaktat sak ding hi.` — The Lord will deliver you from all your anxieties.

### Conversational Register (daily)
- `Bang hang lungnuamlo na hi hiam?` — Why are you uncomfortable?

### Literary Register (Gentehna)
- `A lungtang tung ah a ma na om lai veve hi.` — The scar remains on his heart forever. *(from "Hehna le Siktukilh")*

---
*Reference: Empirical extraction from ZVS Master Corpus (88k verses), TDB77 (25k), Tedim 1932 (24k), raw sources (2M+ lines). Cross-referenced with Zolai Gelhmaan Bu and Gentehna Tuamtuam.*

---
<!-- SOURCE: wiki/translation/nuance_mapping.md -->

# Nuanced Translation: Contextual and Idiomatic Zolai

To move beyond direct word-for-word translation, Zolai employs specific syntactic and lexical shifts based on the **tone** (Formal/Informal) and **domain** (Theology/Science/Law).

## 1. Respectful vs. Neutral Forms (Honorifics)

Zolai marks respect through specific verbal endings and pronouns, even when English uses the same word.

| English | Informal / Neutral | Formal / Respectful | Contextual Rule |
| :--- | :--- | :--- | :--- |
| You | na'ng | Note / Nangmah | Use `Note` (plural form) as a singular honorific in formal letters. |
| Tell / Say | Gen | Zaksak / Pulak | Use `Zaksak` (informal) or `Pulak` (formal/proclaim). |
| Give | Pia | Ap / Piakna | Use `Ap` (offering/handing over to higher authority). |
| Come | Pai | Hong tung / Hong hawh | `Hawh` is used for visiting; `Tung` for arriving. |

---

## 2. Transitioning from Direct to Advanced Syntax

Direct translation often misses the "Internal Logic" of Zolai sentences.

### A. The "Topic-Comment" Structure
English is Subject-Verb-Object (SVO). Zolai often benefits from a **Topic-Comment** structure for emphasis.
- **English:** "I have read the book you gave me."
- **Direct:** `Nong piak laibu ka sim khin zo hi.`
- **Advanced:** `Nong piak laibu pen, ka sim khin zo lian hi.` (Uses `pen` to mark the topic and `khin zo lian` for absolute completion without needing `mahmah`).

### C. Resultative Verb Compounds (Multi-layered Completion)
Advanced Zolai uses strings of aspect markers to show precise levels of completion, emphasis, and finality.
- **Direct:** `Ka sim hi.` (I read it.)
- **Advanced:** `Ka sim khin zo lian hi.`
  - `khin`: Completion of the task.
  - `zo`: Ability/Full mastery of the result.
  - `lian`: Absolute finality or magnitude of the action.
- **Other Examples:**
  - `mu khin lian zo`: Completely and finally saw/found.
  - `thei khin lian zo`: Fully and masterfully understood.

### D. Adverbial Stacking (Lian, Mahmah, Tham, Pek)
- **Lian:** Finality/Precision (e.g., `Pai lian` - Left exactly then).
- **Mahmah:** Greatly/Very (e.g., `Hoih mahmah`).
- **Tham / Thamtham:** Quite/Considerably (e.g., `Sawm tham` - Quite a few).
- **Pek / Pekpek:** Long ago/Extremely (e.g., `Khua sawt pek` - A very long time ago).

---

## 3. Idiomatic Mapping (Conceptual Equivalents)

| English Idiom | Zolai Advanced Equivalent | Literal Meaning |
| :--- | :--- | :--- |
| At your own risk | Na thu thu hi | It is your own word/decision. |
| Take it for granted | Simmawh baang | To treat as unimportant/cheap. |
| In conclusion | A vekpi in gen lehang | If we speak of the whole. |
| Provided that | ...naak leh | If only (exclusive condition). |

---

## 4. Contextual Negation
Advanced negation is not just `lo`.
- **Prohibition (Do not):** `...ken` (e.g., `Pai ken`).
- **Inability (Cannot):** `...zokei` (e.g., `Pai zokei`).
- **Discontinuance (No longer):** `...nawnlo` (e.g., `Pai nawnlo`).
- **Refusal (Will not):** `...keng` (e.g., `Pai keng`).

---
<!-- SOURCE: wiki/vocabulary/common_phrases.md -->

# Common Tedim Phrases & Conversational Patterns

Standard phrases for greetings, small talk, and daily interaction in Tedim (Zolai). These are categorized by context to help learners navigate real-world situations.

## 1. Greetings & Well-being
Greetings in Zolai often center on health and "eating rice."

| Tedim | Meaning | Context |
| :--- | :--- | :--- |
| **Na dam na?** | How are you? | Formal/Standard |
| **Dam maw?** | How are you? | Informal |
| **Ka dam hi.** | I am well. | Standard response |
| **Dam mah.** | [I'm] fine. | Informal response |
| **Zingsang pha.** | Good morning. | Modern borrowing |
| **Nitak pha.** | Good evening. | Modern borrowing |
| **An na ne na?** | Have you eaten? | Common greeting |
| **E, ka ne khin hi.** | Yes, I have eaten. | Standard response |
| **An ne nailo hing.** | I haven't eaten yet. | Negative response |

## 2. Politeness & Interaction
| Tedim | Meaning | Context |
| :--- | :--- | :--- |
| **Lungdam.** | Thank you. | General |
| **Lungdam mahmah.** | Thank you very much. | Emphatic |
| **Hehpihhuai.** | Please / Mercifully. | Requesting |
| **Dawntuah.** | Welcome. | Welcoming a guest |
| **Maisak in.** | Forgive [me] / Excuse me. | Apology |
| **Phamawh kei.** | It doesn't matter / No problem. | Response to apology |
| **Pai tapeuh ve maw.** | Please go / Do go. | Polite command (Natural) |
| **Pai o.** | Go. | Simple command |
| **Hong pai o.** | Please come. | Polite request |

## 3. Agreement & Disagreement
| Tedim | Meaning | Note |
| :--- | :--- | :--- |
| **Aw / E** | Yes | `Aw` is more formal |
| **Ai / Kei** | No | `Kei` often ends a sentence |
| **Tua hi.** | That's it / That's right. | Agreement |
| **Man ei / Dik ei.** | Correct / True. | Validation |
| **Ahi mah hiam?** | Is that so? | Checking |
| **Tua pen hi lo.** | Not that one. | Disagreement |
| **Tua hi lo.** | It's not that. | Disagreement |

## 4. Sinna Sentence Patterns (Beginner)
Extracted from *Zolai Sinna Bu* Lessons 1–6.

- **Zola a sa thei kei hi.** — He cannot sing Zolai songs.
- **Nai ka nei nai kei hi.** — I don't have a watch yet.
- **Lui-ah tui ka tawi hi.** — I fetch water from the river.
- **Jesu thu a thei hi.** — He knows about Jesus.
- **Dai kikai nai lo hi.** — The dew hasn't fallen yet.
- **Ka nu nawitui ka ne hi.** — I drink my mother's milk.
- **Maimeh a duh kei hi.** — He doesn't like pumpkin curry.

## 5. Parting Phrases
| Tedim | Meaning | context |
| :--- | :--- | :--- |
| **Ciah ta ning.** | I will go home now. | Taking leave |
| **Pai ta ning.** | I will go now. | Taking leave |
| **Kalsuan hoih.** | Safe travels. | To someone leaving |
| **Zingciang kimu kik ni.** | Let's meet again tomorrow. | See you later |
| **Ihmu nuam o.** | Sleep well. | Goodnight |

---
*Reference: Zolai Sinna Bu, Zolai Simbu Tan 1, ZVS Bible.*

---
<!-- SOURCE: wiki/vocabulary/zolai_basics.md -->

# Zolai Tedim Basics

Pure Tedim (Zolai) foundational vocabulary for daily conversation and reading.

## 1. High-Frequency Functional Words (Top 100)
These words form the core of every Zolai sentence.

| Tedim | Function | Translation |
| :--- | :--- | :--- |
| **a** | 3rd person / Article | the / he / she / it / his / her |
| **in** | Agentive particle | (marks the doer) |
| **an** | Noun | food / rice |
| **hi** | Copula / Declarative | is / are / am (ends sentence) |
| **ka** | 1st person | I / my |
| **ding** | Future marker | will / shall |
| **i** | 1st person inclusive | we (all) |
| **na** | 2nd person / Noun suffix | you / your / (abstract marker) |
| **ah** | Locative | in / at / to |
| **uh** | Plural marker | (marks 3rd person plural) |
| **le / leh** | Conjunction / If | and / if |
| **lo** | Negation | not |
| **mi** | Noun | person / man |
| **kha** | Noun | spirit / month |
| **nih** | Number | two |
| **pawl** | Noun / Verb | group / associate |
| **hong** | Directional | toward speaker |
| **tua** | Demonstrative | that |
| **amah** | Pronoun | he / she |
| **thu** | Noun | word / matter / law |
| **khat** | Number | one |
| **thei** | Verb | know / able to |
| **topa** | Noun | Lord / master |
| **khua** | Noun | village / town / weather |
| **ni** | Noun | day / sun |
| **zong** | Particle | also / search |
| **hiam** | Question particle | (marks a question) |
| **khempeuh** | Adjective | all / every |
| **pa / nu** | Noun | father (male) / mother (female) |
| **hih** | Demonstrative | this |
| **pen** | Particle | (focus marker) |
| **om** | Verb | exist / dwell / be present |
| **un / in** | Imperative | (marks a command) |
| **pasian** | Noun | God |

## 2. Greetings & Salutations
| Tedim | Meaning | Register |
| :--- | :--- | :--- |
| **Na dam na?** | How are you? | Standard |
| **Dam maw?** | How are you? | Informal |
| **Ka dam hi.** | I am well. | Response |
| **Dam mah.** | [I'm] fine. | Response |
| **Lungdam.** | Thank you. | General |
| **Lungdam mahmah.** | Thank you very much. | Emphatic |
| **Dawntuah.** | Welcome. | Greeting a guest |

## 3. Core Verbs & Actions
| Tedim | Meaning | Tedim | Meaning |
| :--- | :--- | :--- | :--- |
| **pai** | go | **ne** | eat |
| **hong** | come | **dawn** | drink |
| **mu** | see | **gen** | speak / say |
| **za** | hear | **sem** | work |
| **up** | believe | **it** | love |
| **bia** | worship | **hat** | strong / fast |
| **lau** | fear | **dam** | healthy / slow |

## 4. Time Markers (Sinna)
- **Zingsang:** Morning
- **Sun:** Daytime
- **Nitak:** Evening
- **Zan:** Night
- **Tu-in:** Now
- **Zingciang:** Tomorrow
- **Zan-i:** Yesterday

## 5. Simple Examples
- **Na dam na? - Dam mah.** (How are you? - I'm fine.)
- **An na ne na? - E, ka ne khin hi.** (Have you eaten? - Yes, I have eaten.)
- **Ka pai ding hi.** (I will go.)
- **Ka pai kei ding hi.** (I will not go.)
- **Tui ka dawn nuam hi.** (I want to drink water.)
- **Hih bang hiam? - Hua inn hi.** (What is this? - That is a house.)

---
*Reference: Top 100 Frequency Data (ZVS), Zolai Sinna Bu.*

---
<!-- SOURCE: wiki/vocabulary/advanced_lexicon.md -->

# Advanced Lexicon: Formal and Domain-Specific Word Pairs

This mapping differentiates between colloquial and formal Zolai words to provide contextually accurate translations.

## 1. Domain: Administrative & Legal (Zokam Standard)

| English Term | Neutral / Basic | Advanced / Formal | Contextual Usage |
| :--- | :--- | :--- | :--- |
| Law | Thukham | Thuseh / Thukhun | `Thuseh` for legislation; `Thukhun` for constitution. |
| Authority | Vangliatna | Thuneihna | `Thuneihna` is specifically administrative power. |
| Representative | Taangmi | Taangzapa / Taangzanu | `Taangmi` is generic; `Taangzapa` for formal delegations. |
| Announcement | Zaksakna | Taangkona / Pulakna | `Pulakna` is used for proclamations. |
| Result | A gah | A khetna / A khetkhiatna | `A gah` is literal "fruit"; `A khetkhiatna` is the impact or conclusion. |

---

## 2. Domain: Academic & Science

| English Term | Neutral / Basic | Advanced / Formal | Contextual Usage |
| :--- | :--- | :--- | :--- |
| Education | Pilna | Laipilna / Sinna | `Laipilna` is specifically academic education. |
| Research | Kan / Kantel | Kanphitna / Kantelkhiatna | `Kantelkhiatna` is systematic investigation. |
| Purpose | A hang | Ngimna / Tupna | `Ngimna` is the specific goal or target. |
| Strategy | Vaihawmna | Gelhkholhna / Sialsiamna | `Gelhkholhna` is the systematic planning. |
| Evidence | Teci | A kician mualsuahna | `Teci` is witness; `Mualsuahna` is concrete proof. |

---

## 3. Advanced Verb Modifiers (Ahipak Suaksak)

Modifiers that change the *intent* and *subtlety* of the verb (from Standard Format Sec. 10).

- **Dih:** Softens a request (e.g., `Hong pai dih` - "Please come for a moment").
- **Pak:** Adds a temporary or immediate aspect (e.g., `Hong paipak` - "Just come quickly/temporarily").
- **Zal / Zalzal:** Suggests continuous or casual action (e.g., `Hong paizal dih` - "Just come along casually").
- **Zial / Zual:** Used for politeness in service requests (e.g., `Sep sakzial oo` - "Kindly do this for me").

---

## 4. Nuanced Logical Connectors

| English | Basic | Advanced | Nuance |
| :--- | :--- | :--- | :--- |
| Therefore | Tua ahih manin | Tua a hih ciangin | `Tua a hih ciangin` shows a temporal/logical flow of events. |
| Furthermore | Tua baanah | Tua zomah / Tua bek thamlo | `Tua bek thamlo` emphasizes the addition ("not only that"). |
| However | Ahi zongin | Ahih hangin / Ahi sam hang | `Ahi sam hang` adds a dismissive/yet-still nuance. |

---

## 5. Domain: Medical & Health

| English Term | Neutral / Basic | Advanced / Formal | Contextual Usage |
| :--- | :--- | :--- | :--- |
| Disease / Illness | Natna | Cidamlohna / Lungno natna | `Cidamlohna` is more formal for "health condition". |
| Treatment | Damsakna | Puahphatna / Kemcianna | `Kemcianna` for long-term care; `Puahphatna` for restoration. |
| Medicine | Sii | Lungno sii / Damtui | `Damtui` is often used for liquid medicine or "healing water". |
| Symptom | Natzia | Kilatna / Citawntungna | `Kilatna` refers to the outward manifestation of illness. |
| Prevention | Kidawmna | Venbitna / Dalkholhna | `Dalkholhna` for stopping something before it starts. |

---

## 6. Domain: Technology & Digital

| English Term | Neutral / Basic | Advanced / Formal | Contextual Usage |
| :--- | :--- | :--- | :--- |
| Computer | Computer | Computer (No change) | Retain original spelling per 2018 Standard. |
| Data / Information | Thu le la | Thukizakna / Ciamtehna | `Ciamtehna` for recorded data/records. |
| Connection | Kizopna | Kizopna / Kihualna | `Kihualna` implies a deeper, more stable connection. |
| System | Paizia | Vaihawmna / Thukhun | `Vaihawmna` for organizational systems. |
| Security | Bitna | Venbitna / Kidalna | `Venbitna` for formal protection/safety systems. |

---

## 7. Dictionary-Verified Cultural & Social Terms

| English Term | Basic Translation | Advanced/Nuanced Translation | Contextual Usage |
| :--- | :--- | :--- | :--- |
| Adulthood | Picin hun | - | Literally "person completion" - marks transition to full social responsibility |
| Anniversary | - | A phaat-hun, apianna hun tunkikna | Specifically references February 20 Zomi observance (Suahtakna) |
| Beneficiary | - | Aphattuampihmi, Azaalzomi, Noptuam lawhmi | Compound terms: helper people, blessed people, those who receive help |
| Victim/Recipient of help | - | Noptuam lawhmi | Those who are helped/receive assistance |
| Victor/Conqueror | - | Aggualzomi, Azopa | Compound: victorious people; winner/champion |
| Patronymic Naming System | - | Min pana pianna phung leh baal kitheithei | Refers to clan-based naming: mother's clan, father's clan, etc. |
| Continuous Action | - | Akizomzomin | Reduplicated form indicating ongoing/repeated action |
| Sequential/Consecutive | - | Akizomin, Azom azomin, Khak khitkhat | Adjective forms for things that follow in order |
| Grown-up/Mature Person | - | Picingsa, Khang thei nawn lo, Khan khinsa | Multiple descriptors: respectable, not easily discouraged, steadfast |
| Incumbent/Obliged Person | - | Amunluah, Siampi nasem, Nasepna taang luahmi | Complex term with religious sub-categories: faithful, religiously devoted, duty-bound |
| Monogamous Marriage | - | Zomite ngeibanga numei khat in pasal khat | Culturally specific: Zomi people who have one spouse in marriage contract |
| Orphan/Fatherless Child | - | Tagah, Nu leh pa neilo | Literal description: fatherless, mother without husband |
| To Overrule/Override | - | Nawlkhiin; A kicisa, A kigeensa thu khat pen khiatna nei lo banga nawlkhiin | Verb form: to not yield, to be firm in opinion/decision |
| Peal/Sound of Bells | - | Kizomin gingdeu deu; Nakpi in ging | Both noun (sound) and verb (to ring) forms |

## 8. Domain: Religious & Theology (Bible Context)

| English Term | Neutral / Basic | Advanced / Formal | Contextual Usage |
| :--- | :--- | :--- | :--- |
| Sin / Fault | Mawhna | Khialhna / Mawhsia | `Khialhna` is specifically error/mistake; `Mawhsia` for original sin/nature. |
| Mercy / Grace | Hehpihna | Thangvan hehpihna / Lungdamna | `Thangvan hehpihna` for divine grace from heaven. |
| Gospel / Good News | Lungdamna Thu | Vantung Gam Lungdamna Thu | Full formal title used in Mark/Luke. |
| Commandment | Thu piakna | Thuseh / Thukhun | `Thuseh` for specific biblical laws. |
| Repentance | Kisikna | Mawhna kisik kikna | Explicit focus on turning back from sin. |
| Faith / Belief | Upna | Upna lianpi / Lungtang upna | `Lungtang upna` for heartfelt/sincere faith. |
| Blessing | Thupha | Thangvan thupha / Vantung thupha | Emphasizes the source of the blessing. |

---

## 9. Domain: Cultural Heritage (Zomi / Tedim)

| English Term | Basic Translation | Advanced/Cultural Term | Nuance |
| :--- | :--- | :--- | :--- |
| Clan / Lineage | Beh leh phung | Suan le khang | `Suan le khang` covers generations and genealogy. |
| Tradition | Ngeina | Pi leh pu ngeina | Specifically "customs of grandfathers/ancestors". |
| Freedom | Suahtakna | Zomi Suahtakna | Historically tied to the Feb 20th Zomi National Day. |
| Community | Kipawlna | Namlempu / Namkipawlna | `Namlempu` for the whole ethnic body. |
| Respect / Honor | Pahtawina | Zahtakna / Cibai bukna | `Cibai bukna` is the formal act of greeting/paying respect. |

---

## Usage Notes for Dictionary Terms

1. **Cultural Specificity:** Many terms embed Zomi cultural concepts (e.g., anniversary tied to Suahtakna observance)
2. **Compound Structure:** Frequent use of descriptive compounds (e.g., aphattuampihmi = helper-people)
3. **Reduplication for Aspect:** Akizomzomin shows continuous/repeated action through reduplication
4. **Multiple Equivalents:** Single English concepts often have 2-3 Zolai options with different nuances
5. **Formality Levels:** Some terms are inherently more formal/ceremonial (e.g., thunkikhiatna for investigation)

These terms have been verified against the Tongdot Dictionary intermediate scraped data and represent authentic contemporary Zolai usage.

---

## 10. Dictionary-Derived Standardization Patterns

Based on the analysis of 12,500+ dictionary entries and the core "3 sources", these morphological patterns determine standard Zolai:

### A. The `-na` Suffix (Noun Formation)
Always join `-na` to the Stem II form of the verb.
- `it` (love) -> `itna`
- `pil` (wise) -> `pilna`
- `sep` (work) -> `sepna`

### B. Logical/Temporal Suffixes
- **`nading` (for/to):** Join `na` and `ding` always. *Example:* `hinnading` (for living/life).
- **`teng` (all):** Join to the preceding word. *Example:* `moupiteng` (all the guests).

### C. Religious & Formal Compounds
Common religious terms are treated as single semantic units:
- `biakinn` (church)
- `laisiangtho` (holy book/Bible)
- `thungetna` (prayer)

---

---

## 10. Domain: Legal & Covenant Terms (OT Focus)

| English Term | Basic Translation | Advanced/Formal Translation | Contextual Usage |
| :--- | :--- | :--- | :--- |
| Covenant | Thuciam | Kiciamna / Thukiciamna | Used extensively for contracts or Divine covenants explicitly linking two parties. |
| Inheritance | Luah ding | Gouluah / Luahding gou | `Gouluah` emphasizes the generational right and wealth transferred. |
| Testify/Witness | En mi | Teci tehp / Teci panna | `Teci panna` actively means to stand as a witness in a court/covenant setting. |
| Debt/Guilt | Lei | Leiba | Refers to unpaid physical debts or moral restitution required implicitly. |

---

## 11. Domain: Administrative & Political Terms (Acts Focus)

| English Term | Basic Translation | Advanced/Formal Translation | Contextual Usage |
| :--- | :--- | :--- | :--- |
| Governor/Ruler | Ukpa | Ukpi / Gam-ukpa | `Ukpi` operates at the level of a systemic governor or Roman centurion/official. |
| Council/Assembly | Mi kikhawm | Mipi kikhawm / Thukhente | `Thukhente` specifies an assembly with judging authority (like the Sanhedrin). |
| Decree/Order | Thu | Thupiakna / Kamsangthu | `Thupiakna` acts as a formal written or authoritative decree. |
| Citizen | Gam mi | Gam mite | Used to determine rights of residence within formal bounds. |

---

## 12. Domain: Natural & Agricultural Terms (Parables Focus)

| English Term | Basic Translation | Advanced/Formal Translation | Contextual Usage |
| :--- | :--- | :--- | :--- |
| Harvest | An la | Anlawh / Anlak hun | `Anlawh` encapsulates the entire gathering and reaping process. |
| Vineyard/Field | Lo | Sengawlo / Grep-kuan | `Grep-kuan` specifically delineates a vineyard as uniquely tied to grape agriculture. |
| Sower | Tuicih mi | Khasiang / Tuiciihpa | Standardizing the one scattering seed. |
| Root | Bul | Zung / Apial | `Zung` is the physical root extending into the ground. |

---

## 13. Domain: Military & Warfare Terms (Ephesians 6, OT Focus)

| English Term | Basic Translation | Advanced/Formal Translation | Contextual Usage |
| :--- | :--- | :--- | :--- |
| Armor | Galthuam | Galdo puan | `Galthuam` specifically refers to armament designed for defensive combat. |
| Sword | Namsa | Namsau | `Namsau` highlights the long, devastating edge of typical ancient combat blades. |
| Shield | Dalna | Phaw / Dal-phaw | `Phaw` explicitly means the defensive shield structure. |
| Enemy | Mi | Gal / Galte | Defines hostile physical or spiritual combatants. |

---

## 14. Domain: Anatomy & Health Terms (Luke's Gospel, Leviticus Focus)

---
<!-- SOURCE: wiki/vocabulary/education_domain_vocab.md -->

# Course 15: Kimawl-bulphuh Laisinna (Play-based Learning) — Knowledge Extraction
# Source: Myanmar Teacher Platform, Zolai version
# URL: https://mmteacherplatform.net/en/e-learning/courses/kimawl-bulphuh-laisinna-course-15-zolai-the-language-of-zomi
# Full text: resources/course15_play_based_learning_zolai.md
# Domain: Education / Teacher Training

---

## New Vocabulary — Education Domain

| Zolai | English | Notes |
|---|---|---|
| kimawl-bulphuh laisinna | play-based learning | kimawl=play, bulphuh=foundation/base, laisinna=learning |
| kimawl | play | core word |
| laisinna | learning | lai=read/learn, sinna=lesson |
| laihilh | teaching | lai=read, hilh=teach |
| sangnaupang | student, school child | sang=school, naupang=child |
| sanginndei | classroom | sang=school, inn=house, dei=place |
| syanu/pa | teacher (female/male) | sya=teacher, nu=female, pa=male |
| syate | teachers (plural) | sya+te |
| pilsinna | education | pil=knowledge, sinna=lesson |
| pilna | knowledge, education | pil=know/learn |
| thutheihnopna | curiosity, desire to know | thu=matter, theih=know, nop=want, na=NOM |
| khiatna nei | having curiosity / initiative | khiatna=curiosity, nei=have |
| lungnophuai | enjoyable, fun | lung=heart/mind, nop=happy, huai=worthy |
| lawptak kihelna | joyful participation | lawptak=joyful, kihel=participate, na=NOM |
| kilaih in khang | learning through interaction | kilaih=interact, khang=grow/develop |
| lawmlegual tawh kikholhna | collaboration with peers | lawmlegual=peer/friend, ki-kholh=connect |
| gualtatna | creativity | gual=creative, tat=do, na=NOM |
| lungphawnna | emotion, feeling | lung=heart, phawn=move/stir, na=NOM |
| lungpuakzia | emotional expression | lung=heart, puak=express, zia=manner |
| lunghihmawh | discomfort, unease | lung=heart, hih=this, mawh=wrong/bad |
| lungnopna | happiness, joy | lung=heart, nop=happy, na=NOM |
| khuak zatna | self-regulation | khuak=self, zat=use/control, na=NOM |
| suahtakna | independence, autonomy | suahtak=independent, na=NOM |
| vanlena | creativity, imagination | van=sky/creative, lena=ability |
| taksep kankhiatna | skill development | taksep=physical skill, kan=develop, khiat=bring out |
| pumpi taksalam | physical development | pumpi=body, tak=real, salam=health |
| kiho kizopna | collaboration, working together | ki-ho=mutual, ki-zop=join together |
| sepkhopna | cooperation | sep=work, khop=together |
| belpawl | group | bel=group, pawl=team |
| beelpawl | group (variant spelling) | same as belpawl |
| kitualkupna | circle time / group discussion | ki-tual=gather, kup=together, na=NOM |
| vai sehcian-bulphuh laisinna | project-based learning | vai=task, sehcian=plan, bulphuh=foundation |
| khangual kikal kipattah kimakaih | peer tutoring | khangual=peer, kikal=between, kipattah=help each other |
| pankop laisin kilamzia | cooperative learning methods | pan=together, kop=join, laisin=learn |
| laisinna mun | learning environment | laisinna=learning, mun=place |
| a hoihlam thapiakna | positive reinforcement | hoih=good, lam=direction, thapia=give/provide |
| pangkhawm in kimawl | play together | pangkhawm=together, kimawl=play |
| nasep seppihte | collaborative tasks | nasep=work, sep=do, pih=together |
| mahlemawh kiteeltawm | self-directed learning | mah=self, lemawh=free, ki-teel=guide, tawm=little |
| vai-maban bulphuh | task-centered foundation | vai=task, maban=center, bulphuh=foundation |
| nuntak khuasakzia siamna | life skills | nuntak=life, khuasak=live, zia=manner, siam=skilled |
| khinkhai ngaihsutna | critical thinking | khinkhai=deep, ngaihsut=think, na=NOM |
| ngimna nei | having hope/motivation | ngimna=hope, nei=have |
| khiatna nei | having curiosity | khiatna=curiosity, nei=have |
| sunmang lungngaihna | imagination, dreaming | sunmang=dream, lung=heart, ngaih=feel |
| phuangkhia | expression, sharing out | phuang=spread/share, khia=out |
| lunghiangnate | challenges | lung=heart, hiang=difficult, te=plural |
| lawpsuahna | achievement | lawp=joy, suah=emerge, na=NOM |
| thuzawh | understanding | thu=matter, zawh=complete/understand |
| thutak | truth | thu=matter, tak=real |
| khangkhia | development, growth | khang=grow, khia=out |
| thahatnate | strengths | thahatsak=strengthen, te=plural |
| kilamzia | methods, ways | ki=reflexive, lam=way, zia=manner |
| gawmkhawm | collaboration, combining | gawm=combine, khawm=together |
| hun khual in kikupnate | time-based gatherings | hun=time, khual=period, ki-kup=gather |
| vaisehcian-bulphuh laisinna | project-based learning | vai=task, sehcian=plan |
| khangualpih kihilh kimakaihna | peer-assisted instruction | khangual=peer, pih=help, kihilh=teach |

## Key Pedagogical Terms

| Zolai | English |
|---|---|
| Montessori ii Zialedan | Montessori Method |
| Reggio Emilia ii Vaiheelzia | Reggio Emilia Approach |
| Waldorf Pilsinna | Waldorf Education |
| Huang Sang Vaiheelzia | High/Scope Approach |
| Khuak ading Vante | Tools of the Mind |
| Tan Lang | Kindergarten |
| phungpi sang | Primary school |
| dawlsawn sang | Secondary school |
| kiginkholhna sang | Pre-school |
| naupang pattahna sang | Nursery school |

## Grammar Patterns Found

### Compound noun with `ii` (possessive/of)
```
kimawl-bulphuh laisinna ii mellema dingpite
= the key elements of play-based learning
```
- `ii` = of/belonging to (formal/written register)
- More formal than `a` (3rd person agreement)

### `-zia` suffix (manner/method)
```
laihilh zia = teaching method
gamtat zia = way of doing
khuasak zia = way of living
```

### `-dan` suffix (way/manner — similar to -zia)
```
bangci dan = in what way
koici dan = in which way
```

### `bangci` / `koici` (how / which way)
```
Bangci bangin panpih thei ding cih = how can [we] help
Koici thuakkha ding = what to do about it
```

### `cih` as nominalizer/quotative
```
"lungnopna" cih kammal = the word "lungnopna"
kimawl pen laisinna vai-maban sunga kihelpih a mungpi khat bangin a masak cih = 
  that play is considered one of the most important elements within the learning process
```

### `ahih manin` (because/therefore)
```
kimawlna ii panlakna thupi ahihlam ciamteh hi
= it confirms that play's role is important
```

### `a...uh` (3rd person plural)
```
sangnaupangte in amau' kimlepam ah kihelin khiatna a sehna uh tawh pilsin uh hi
= students learn through engaging their curiosity in their own environment
```

### Hyphenated compound verbs
```
ki-ho ki-zop = collaborate (mutual-meet mutual-join)
ki-tual-kup = gather in circle
ki-pawl-khop = group together
ki-kup-khop = cooperate
```

## Cultural/Educational Context

- This is a **Myanmar Teacher Platform (MTP)** course translated into Zolai
- Designed for **Tan Lang (kindergarten)** and **phungpi sang (primary school)** teachers
- Part of Myanmar Ministry of Education Teacher Competency Standards Framework (TCSF) 2020
- Available at: https://mmteacherplatform.net/en/e-learning/courses/kimawl-bulphuh-laisinna-course-15-zolai-the-language-of-zomi

## Sentence Examples (from text)

---
<!-- SOURCE: wiki/vocabulary/modern_technology.md -->

# Modern Technology & Software

## Concept / Rule
Zolai is rapidly encountering the need for modern technological terminology (Internet, Software, AI, Data). As an oral-to-written language transitioning into the digital age, it relies heavily on **Loanwords (Phonetic Adaptation)** for primary usage, while using **Compound Descriptive Nouns** primarily for explanation and tutoring.

### Core Tech Vocabulary Strategies
*   **Computer/Device:** `Kompita` (Loanword) -> Explained as: `Sik Set` (Iron Machine) or `Tuatna Set` (Calculating Machine).
*   **Internet/Network:** `Internet` (Loanword) -> Explained as: `Leitungbup Kizopna` (Worldwide connection).
*   **Artificial Intelligence (AI):** `AI` (Loanword) -> Explained as: `A kibawltawm Pilna` (Made/Artificial Wisdom).
*   **Data/Information:** `Data` (Loanword) -> Explained as: `Thu ciamtehna` (Record of information).
*   **Software/App:** `App` or `Software` (Loanword) -> Explained as: `Set sung om pilna` (Wisdom inside the machine).
*   **Smartphone:** `Smartphone` (Loanword) -> Explained as: `Khut Tawi Phone Pil` (Hand-held smart phone).
*   **Water Pump:** `Tui hup set` (Water drawing/sucking machine).

## Decision / Application
The AI Tutor must prioritize using **Loanwords** as the primary term to match natural modern speech. Descriptive Zolai compound nouns (like `Tui hup set` or `A kibawltawm Pilna`) should **only be used to explain the concept to a learner in Zolai** if they do not understand the loanword or function.

## Reason
While descriptive nouns preserve the linguistic integrity and logic of Zolai, forcing native speakers to use them instead of globally recognized terms like "AI" or "Internet" sounds unnatural and archaic. The loanword is the actual vocabulary; the descriptive phrase is merely the definition used for teaching.

## Pattern / Code Snippet
When translating or tutoring tech terms, the AI should use the loanword first, and use the descriptive Zolai compound only if explaining the concept:
```zolai
Tuni in AI thu i kikum ding hi. (Today we will discuss AI.)
AI i cih in a kibawltawm pilna (Artificial Wisdom) cihna ahi hi. 
(What we call AI means artificial wisdom.)

Water pump i cih in tui hup set cihna ahi hi.
(What we call a water pump means a water sucking machine.)
```

## Mistake / Anti-pattern
Do not force a literal Zolai translation to replace a perfectly good loanword in standard conversation. Do not translate "Cloud Computing" literally as `Mei-iik Set-tuatna`. Use the loanword "Cloud" and explain it contextually if asked. Do not use `Tui-lup-set` for water pump; the correct functional descriptor is `Tui hup set`.

---
<!-- SOURCE: wiki/vocabulary/healthcare_and_medicine.md -->

# Healthcare & Medicine (Cidamna le Zato thu)

## Concept / Rule
Zolai vocabulary for health and medicine combines traditional terms for wellness and bodily states with modern administrative terms for medical infrastructure. Health (`Cidamna`) is literally "body-well/healthy."

### Core Healthcare Vocabulary
- **Cidamna:** Health / Wellness (Ci = Body, Dam = Well/Healed).
- **Cina / Cidam lo:** Sick / Unwell.
- **Zato:** Hospital / Clinic.
- **Siavuandok:** Doctor (often borrowed/adapted from Burmese `Saya-wun` + `doctor`).
- **Zato Sia:** Nurse / Medical practitioner (Hospital Teacher/Expert).
- **Damdawi / Guik:** Medicine / Pill.
- **Na / Ninna:** Pain / Ache (e.g., *Lu na* = Headache, *Gil na* = Stomachache).
- **Khuasik / Cisa:** Fever (literally: weather-cold / body-hot).
- **Sianthona:** Hygiene / Cleanliness.

## Decision / Application
The AI Tutor should use these terms when creating situational dialogues about visiting the doctor, explaining symptoms, or discussing public health. 

## Reason
Providing users with accurate healthcare vocabulary is critical for practical communication. Understanding that "pain" in Zolai is often expressed by appending `na` to the specific body part (e.g., `Lu` [Head] + `na` [pain]) helps learners logically construct their own symptoms.

## Pattern / Vocabulary Usage
When expressing sickness, the pattern is usually `[Body Part] + na` or `Ka [Body Part] a na hi`:
```zolai
Ka lu na mahmah hi. (My head aches very much / I have a bad headache.)
Amah zato ah a paiding kisam hi. (He needs to go to the hospital.)
Damdawi na ne ta hiam? (Have you taken your medicine?)
```

## Mistake / Anti-pattern
Do not use `Hoih lo` (Bad) to describe feeling physically sick. While `Ka ci a hoih kei` is understandable, `Ka cidam kei` or `Cina ka hi` is the proper and natural way to express illness.

---
<!-- SOURCE: wiki/vocabulary/government_and_law.md -->

# Government, Law & Administration (Kumpi, Thukham le Vaihawmna)

## Concept / Rule
Zolai vocabulary for governance and law reflects a combination of traditional tribal authority, biblical terms for kingship, and modern state administration. The word `Kumpi` historically meant "King" but is now universally used for the "Government" or "State."

### Core Administrative Vocabulary
- **Kumpi:** Government / King.
- **Thukham:** Great Law / Divine Commandment (High register).
- **Thukhun:** Law / Regulation / Official Rule (Standard register).
- **Upadi:** Law / Regulation (Burmese loanword, widely used in modern legal contexts).
- **Thukhen:** Judge (Thu = Word/Case, Khen = Divide/Decide).
- **Thonginn:** Prison / Jail.
- **Thukhen Zum:** Court / Courthouse (Zum = Office/Bureau).
- **Palik:** Police.
- **Uliante:** Officials / Leaders / Elite (Big ones).
- **Gam le Gua:** Country and Nation / Territorial borders.
- **Kitelna:** Election / Voting (Choosing each other).
- **Suahtakna / Suakta:** Freedom / Liberation / Being set free.
- **Tualsuak Mite:** Indigenous people / Citizens (Born on the soil).

## Decision / Application
The AI Tutor uses these terms when discussing news, politics, citizenship, the history of the Zomi people, or legal scenarios. It must distinguish between the formal/divine `Thukham` and the administrative `Thukhun`.

## Reason
Providing a robust legal and administrative vocabulary bridges the gap between conversational Zolai and formal, journalistic Zolai (like the language used in *Zomi Daily*). Differentiating registers (Thukham vs. Thukhun) ensures the AI sounds natural and context-appropriate.

## Pattern / Vocabulary Usage
When creating sentences about government or laws:
```zolai
Kumpi thukhun i zuih ding a kisam hi.
Mi khempeuh in suahtakna a deih uh hi.
Thukhente in thuman thutak zang in vaihawm uh hi.
```

## Mistake / Anti-pattern
- Do not use `Zalenna` for freedom; the pure Tedim (Zolai) term is `Suahtakna` / `Suakta`.
- Do not use `galkapte` (soldiers) for police; use `Palik`.
- Do not use `Thukham` for everyday regulations; use `Thukhun`.
- `Kumpi` means Government/State. For a literal King, use `Kumpi ukpa`.

---
<!-- SOURCE: wiki/vocabulary/fables_and_wisdom_vocab.md -->

# Expanded Knowledge — Gentehna Tuamtuam & Zolai Khanggui
# Sources:
#   resources/Gentehna_Tuamtuam_le_A_Deihnate.md (LT Tuang, 2019) — Fables & Morals
#   resources/Zolai_Khanggui_AD_1899_AD_2013.md (LT Tuang, 2013) — Zolai History
# Date extracted: 2026-04-15

---

## 1. Fable Vocabulary (Gentehna Tuamtuam)

| Zolai | English | Notes |
|---|---|---|
| gentehna | fable, parable, example story | gen=tell, tehna=example |
| a thugil | moral/theme | thugil=lesson/point |
| a deihna | meaning, lesson | deih=want/mean, na=NOM |
| hanciamna | perseverance, effort | hanciam=persist, na=NOM |
| lungkiatlohna | fearlessness | lung=heart, kiat=fear, loh=without |
| upmawh | laziness | up=sleep, mawh=wrong/bad |
| thadahna | boastfulness | thadah=boast |
| ciktakna | steadiness, consistency | ciktak=steady |
| ngaihsutna | thinking, reflection | ngaihsut=think, na=NOM |
| kivakna | pride, arrogance | kivak=be proud |
| siamna | skill, ability | siam=skilled, na=NOM |
| zaliatna | freedom | zaliat=free |
| tuantualna | endurance | tuantual=endure |
| zongsatna | contentment, satisfaction | zongsak=satisfy |
| kingaihsutna | self-reflection | ki=self, ngaihsut=think |
| kithuahpihna | mutual support | ki-thuah=mutual, pih=help |
| masak huaite | priorities | masak=first, huai=worthy |
| hun manphatna | time management | hun=time, manphat=use well |
| lungsim limlangh | emotional expression | lungsim=heart/mind, limlangh=show |
| kuhkalna | persistence | kuhkal=persist |

## 2. Fable Sentence Patterns

### Moral conclusion pattern: `A Deihna:`
Every fable ends with `A Deihna:` (Its meaning:) followed by the moral.
```
A Deihna:
Hanciamna cih pen a mawkna suak tuanlo hi.
= Perseverance never becomes a mistake.
```

### Comparison pattern: `[X] sangin [Y] [adj]zaw hi`
```
Lui sangin gun ah ngasa tamzaw a hihman in...
= Because there are more fish in the river than in the lake...
```
- `sangin` = than (comparative marker)
- `-zaw` = more (comparative suffix)

### Cause pattern: `a hihman in` / `ahih manin`
Both forms valid:
- `a hihman in` = because it is so (slightly more formal)
- `ahih manin` = because (standard)

### Conditional: `a...leh`
```
Tua sai pen kitomlo aa, tua a kikoihna mun ah ut ta leh ut takei leh omom kha hi.
= If that elephant stays without being tied, it can stay whether it wants to or not.
```

### Negative ability: `[verb] zo nawnlo hi`
```
lengkhia zo nawnlo in sih lawh ahi hi
= unable to escape, it died
```
- `zo` = able to complete
- `nawnlo` = no longer
- Combined: `zo nawnlo` = no longer able to

## 3. Zolai Writing Rules (from Zolai Khanggui)

### Capitalization of foreign/loanwords
```
Note: namdang lai zatsaknate ah, Zolai tawh mat vetloh ding ahi hi.
Amau lai bangbang lianin gelhsak ding kisam ahi hi.
```
= Foreign words used in Zolai should be written in their original capitalization.
Example: `Project`, `Computer`, `Windows` — keep original case.

### Homographs (same spelling, different meaning)
```
fly = Tho (Noun) / leng (Verb)
zawng = search (verb) / zawng = type/kind (noun)
```
Key pairs to distinguish:
- `zang` vs `zangh` — different meanings
- `lang` vs `langh`
- `cing` vs `cingh`
- `zong` vs `zongh`
- `dong` vs `dongh` vs `dawng`
- `zum` vs `zumh`
- `sum` vs `sumh`
- `le` vs `leh`
- `te` vs `teh`
- `be` vs `beh`
- `de` vs `deh`
- `me` vs `meh`
- `ne` vs `neh`
- `aw` vs `awm` vs `om`
- `ngawi` vs `ngoi`
- `khawi` vs `khoi`

### `ii` vs `i` vs `a` (possessive)
```
i pa = our father (1st person plural inclusive)
ii = formal/written possessive (of)
a = 3rd person possessive
```
- `i` = our (1st plural inclusive agreement marker)
- `ii` = formal "of" (written register)
- `a` = his/her/its (3rd person)

### `aa` vs `a` (clause connector)
```
aa = and then / having done (sequential connector in written register)
a = 3rd person agreement marker
```
- `aa` is a written-register sequential connector (≈ `a...in` in speech)

### `ae` (question particle — archaic/literary)
```
I pa ii a lawmpa' hong gen, a masa aa nong gen pen bang hi ae?
= What did our father's friend say first?
```
- `ae` = question particle (literary/older register)
- Modern equivalent: `hiam`

## 4. Zolai Historical Timeline (from Zolai Khanggui)

| Year | Event |
|---|---|
| 1888–1902 | Pu Pau Cin Hau creates pre-Christian Zolai script (Laipianpa) |
| 1908 | Rev. Dr. J.H. Cope arrives Khalkha (Dec 21) |
| 1910 | Cope arrives Tedim (Nov 1), creates Roman alphabet Zolai |
| 1913 | First Zolai textbook: "Tual Lai-sintawmna Bu" |
| 1914 | First Tedim hymnal: "Tedim Labu" |
| 1919 | "Tedim Thukizakna Lai" newspaper begins |
| 1932 | New Testament in Tedim completed |
| 1938 | Cope dies at Khalkha (June 11) |
| Post-WWII | Zolai literacy expands through church schools |
| 2013 | Zolai Khanggui published (100+ year history) |

## 5. Key Zolai Institutions

| Abbreviation | Full Name | Role |
|---|---|---|
| ZCLS | Zomi Christian Literature Society | Standardization of Zolai |
| ZOLLS | Zomi Language & Literature Society | Language development |

---
<!-- SOURCE: wiki/vocabulary/idioms_and_metaphors.md -->

# Gentehna: Idioms and Metaphors

Zolai relies heavily on idioms (`Gentehna`) and metaphorical narratives to convey complex moral, philosophical, and social lessons. These are rooted in nature, domestic life, and spiritual journeys.

## 1. Core Idiomatic Themes (Sinna & Gentehna)

| Theme | Metaphor / Lesson |
| :--- | :--- |
| **Uiphuk le Tuisa** | Danger of gradual complacency; failing to recognize slow threats. |
| **Gunkuang Holhpa** | Practical skill/survival awareness is more valuable than abstract status. |
| **Bilpi le Sumkuang** | Persistence (*citak*) beats innate talent/speed (*hat*). |
| **Keivom le Tuuno** | The inherently strong/oppressive will always find excuses to blame the weak. |
| **Va-ak Utong** | The danger of trying to be something you are not; losing one's own identity. |
| **Kau le A Bu** | Struggle and resistance are necessary for strength and flight. |

## 2. Emotional Metaphors (The "Lung" System)
Emotions in Zolai are almost exclusively expressed as compound results involving the "heart/mind" (*lung*).

- **Lungdam (Heart-well):** Joy / Thankfulness.
- **Lungtang (Heart-hard/scar):** Deep emotional scars or the physical/emotional core.
  - *Example:* "A lungtang tung ah a ma na om lai veve hi." (The mark remains on his heart forever.)
- **Lungkim (Heart-complete):** Satisfaction / Contentment.
- **Lungkham (Heart-blocked):** Anxiety / Worry.
- **Lungngai (Heart-longing):** Nostalgia / Deep love.
- **Lungphawng (Heart-pierced):** Conviction / Sudden realization.

## 3. Biblical & Agrarian Metaphors
Extracted from the ZVS Bible parallel corpus.

### A. The Sower (Khaici vawhpa)
- **Metaphor:** The word of God as a seed (*khaici*) and the heart of man as various types of soil (*lo*).
- **Usage:** Illustrates receptivity, distractions (thorns), and growth.

### B. The Shepherd (Zatawi / Tuucing)
- **Metaphor:** Protection, guidance, and intimacy.
- **Usage:** "Topa pen ka honpa ahi hi." (The Lord is my shepherd.)

### C. Agrarian Life
- **Lenggui suan (Planting vines):** Legacy, investment, and fruitfulness.
- **Lo khawhlawh (Working the field):** Daily struggle and the reward of labor.
- **Anlak hun (Harvest time):** Fulfillment of promises / The culmination of history.

## 4. Literary Expressives
Zolai uses "expressive" reduplication to create metaphorical moods.
- **Kiu keu:** The sound/feeling of an empty stomach (hunger).
- **Ziuh zeuh:** Playful, lighthearted giggling.
- **Siuh seuh:** The feeling of a steady, persistent drip (rain or tears).

---
*Reference: Gentehna Tuamtuam le A Deihnate, Zolai Sinna Bu, ZVS Bible.*

---
<!-- SOURCE: wiki/vocabulary/expressive_words.md -->

# Zolai Expressive Words (Kilanghsak Kammalte)
# Source: resources/Zolai_Standard_Format.md (LT Tuang, 2018)
# These are reduplicative/expressive words — real Zolai, not auto-generated

## Expressive/Onomatopoeia Pairs

| Word | Type |
|---|---|
| dangdang, dengdang, dialdual, dualdual | movement/sound |
| genggang, geigai, geelgaal, gega | visual/manner |
| heihai, heihoi, hemham, heha | exclamation/manner |
| kelkol, kelkai, kiahkuah, keikai, keukau | movement |
| kilkel, kekkok, kiakua, kengkang, kekaa | sound/manner |
| lemlam, lemlum, lela, liakluak | movement/manner |
| lillel, lellul, lenglong, lenglangh, liangluang | flowing/movement |
| melmul, melmal, mema, memmam, meumau, milmel | manner |
| pheiphai, pheiphoi, phelphal | fluttering |
| veivai, veivoi, viavua, velval, vievei | waving/manner |
| zialzual, zipzup, zekzawk, zekzak | manner/sound |

## Fused Compound Words (Kammal Lomte)
These are written as ONE word (no space):
- `Innlelo` = home/household matters
- `Nulepa` = parents (nu=mother, le=and, pa=father)
- `Ulenau` = siblings (ul=older, e=and, nau=younger)
- `Khualetui` = village and water (place reference)
- `Kiimlepam` = environment/surroundings
- `Zileta` = always/forever
- `Itlengaih` = love and longing
- `Zawdeuh` = better (hoihzawdeuh = even better)

## Exclamations / Interjections
| Zolai | Meaning |
|---|---|
| Ala! | Wow! / Oh! |
| Alai, Kala, Kalai | variants of surprise |
| Aaa, Aaa Zen, Aaa guai | hesitation/thinking |
| Immm, Hmmm, Innn, Hnnn | thinking/hesitation |
| Ai ze, Aici ze, Bangci ae | "what is this?" / surprise |

---
<!-- SOURCE: wiki/vocabulary/archaic_vs_modern.md -->

# Archaic vs. Modern Zolai (Tedim) Vocabulary

The Zolai language has evolved significantly over the past century through three major translation eras: **Tedim 1932**, **TDB77 (1977)**, and the **ZVS 2018 (Zokam Standard Version)**.

## 1. Evolution of the Standard
Spelling and usage have shifted from phonetic/Burmese-influenced transliteration to a more consistent Roman-standardized Zokam format. While modern standards (ZVS 2018) prioritize clarity, the core vocabulary remains strictly Tedim.

| Traditional / 1932 | Modern / ZVS 2018 | Meaning | Note |
| :--- | :--- | :--- | :--- |
| **Jesuh** | **Jesu / Jesuh** | Jesus | ZVS often leans toward `Jesu`. |
| **Izipt** | **Egypt** | Egypt | Modern normalization of place names. |
| **Iakob** | **Jakob** | Jacob | Transliteration shift. |
| **nadingin** | **na'ng / nadingin** | for the purpose of | ZVS uses more frequent contractions. |
| **inla / unla** | **in / un** | (Imperative) | Standardized removal of the suffix `-la`. |

## 2. Orthographic Standardization
The current standard (Zokam) focuses on consistency in vowel combinations and suffix usage, ensuring that "Tedim Style" is preserved across all formal writing.

### Avoid Non-Tedim Styles
It is critical to avoid phrases and words from neighboring dialects (Hakha-Lai, Falam) that may appear in mixed datasets.
- **Avoid:** `tua/tuan` (that), `pasian` (God), `tapa` (son), `gam` (country), `???` (king), `topa` (Lord).
- **Prefer:** `tua`, `pasian`, `tapa`, `gam`, `kumpipa`, `topa`.

---

## 3. High-Frequency Rank Shifts
Some words were extremely common in earlier translations but shifted in usage frequency in the 2018 standard due to stylistic normalization.

- **`takin` (Adverb marker):** Usage has dropped significantly in favor of simpler `-in` suffixes.
- **`theih` (Able):** Frequency rank has shifted as more specific modal verbs (e.g., `zo`) are used in nuanced contexts.
- **`taka` (Truly/Very):** Often replaced by `mahmah` or `-in` in modern prose.

## 4. Semantic Evolution
- **Lungdam (Joy):** Traditionally meant "at peace" or "thankful." In modern contexts, it has a broader "spiritual joy" connotation.
- **Hehpihna (Grace):** Older texts focused on "mercy/pity." Modern ZVS emphasizes "unmerited favor" (grace).
- **Thuciam (Covenant):** Remained stable for 100 years as the core identifying word for biblical "Promise."
- **Lungtang (Heart):** In older texts, `lungsim` was generic. Modern ZVS uses `lungtang` more specifically for the emotional/physical "heart" in poetic contexts.

---
*Reference: Empirical comparative audit of ZVS 2018, TDB77, and Tedim 1932 datasets (2026).*

---
<!-- SOURCE: wiki/culture/zomi_comprehensive.md -->

# Zomi People — History, Identity & Culture
> Compiled from: Wikipedia (Zomi people, Zo people, Zo nationalism), zogam.org, Zolai_Khanggui_AD_1899_AD_2013.md, Gentehna_Tuamtuam_le_A_Deihnate.md, wiki/culture/
> Last updated: 2026-04-14

---

## 1. Who Are the Zomi?

**Zomi** (Zo + mi = "Zo people") are a Tibeto-Burman ethnic group whose ancestor is **Zo**. They primarily inhabit:
- **Chin State, Myanmar** (their historical heartland — Zogam)
- **Manipur and Mizoram, India** (northeast India)
- **Southeastern Bangladesh**
- **Diaspora**: Tulsa, Oklahoma, USA (12,000–15,000 — the largest Zomi diaspora community, known as "Zomi Town")

They reject the colonial labels "Kuki" and "Chin" imposed during the British Raj, using **Zomi** as their self-designation since time immemorial.

Related names across dialects: Zo, Zou, Zhou, Chou, Shou, Yo, Jo, Yaw, Shu, Mizo, Laizo — all variants of the same root **Zo**.

---

## 2. Origins & Migration

### Tibeto-Burman Roots
The Zomi trace their ancestry to the **Tibeto-Burman** language family, migrating from the Mekong River basin thousands of years ago. They settled in the mountainous regions of Southeast Asia and developed distinct linguistic and cultural identities.

### Ciimnuai — The Mother City
**Ciimnuai** is the legendary ancestral homeland — the "Mother City" and cradle of the Zomi clans. Pre-literate history was preserved through:
- **La** (songs) — oral history in song form
- **Pasaltit** — oral poetry of warriors and heroes
- **Khanggui** (genealogy) — clan lineage records

### Historical References
- **862 AD**: Fan-Cho (Tang dynasty diplomat) mentioned a kingdom in the Chindwin Valley whose princes were called *Shou (Zo)*
- **Yuan Dynasty Connections**: Historical research suggests the Zomi ancestors may have had connections to the regions controlled or influenced by the Yuan Dynasty during their southward migration.
- **1783**: Father Vincentius Sangermano described them as "a petty nation called JO (JAW)"
- **1835**: Captain Pemberton mentioned Zo or Jo in his *Reports on the Eastern Frontiers of British India*
- **1871–72**: Col. T. H. Lewin (first white man in Lushai Hills) recorded the generic name as *Dzo*

### British Colonial Period
Until British colonial rule, the Zomi were independent — never under Manipuri Rajas or Burmese Kings. The British imposed the names "Chin" and "Kuki" as administrative labels, which the Zomi reject.

---

## 3. Zogam — The Zo Homeland

**Zogam** (Zo + gam = "Zo land") refers to the ancestral Zo homeland — a contiguous territory spanning:
- Chin State, Myanmar (core)
- Manipur hill districts, India
- Parts of Mizoram, India
- Chittagong Hill Tracts, Bangladesh

Zo activists use **Zogam** or **Zoram** ("Zo realm") to describe the concept of a unified homeland. The Zomi Reunification Organisation (ZRO), formed in 1993, works toward this goal.

---

## 4. Zomi Identity Timeline

| Year | Event |
|---|---|
| Pre-history | Zomi live in Chindwin Valley plains, call themselves Zo |
| 862 AD | Tang dynasty records Zo kingdom in Chindwin Valley |
| 1800s | British colonization; "Chin" and "Kuki" labels imposed |
| 1946 | Lushai Hills people adopt "Mizo" (Zo people) identity |
| 1948 | **20 February** — Chins adopt democratic administration; later becomes Zomi National Day |
| 1953 | Baptist Associations of Tedim, Falam, Hakha adopt "Zomi" as national name |
| 1961 | T. Gougin forms United Zomi Organisation in Manipur |
| 1972 | Zomi National Congress formed in Manipur |
| 1993 | **Zomi Reunification Organisation (ZRO)** formed at Phapian, Kachin State |
| 1995 | Seven Kuki-Zo tribes join ZRO: Hmar, Zou, Vaiphei, Gangte, Simte, Sukte (Tedim), Paite |

### Zomi Nam Ni — Zomi National Day
**20 February** is observed as Zomi National Day (Zomi Nam Ni). It marks the day in 1948 when the Chin people adopted a democratic system, dispensing with traditional chieftaincies. Originally "Chin National Day," renamed "Zomi National Day" in 1950.

---

## 5. Clan System (Beh)

Every Zomi belongs to a **Beh** (clan). Clan names derive from the clan founder's name. Major clans include:

| Clan | Notes |
|---|---|
| Guite | Major Tedim clan |
| Singsit | Major Tedim clan |
| Hualngo | Major clan |
| Zahao | Major clan |
| Sailo | Major Mizo clan |
| Sukte | Tedim Chin clan |
| Paite | Manipur-based clan |
| Gangte | Manipur-based clan |
| Simte | Manipur-based clan |
| Vaiphei | Manipur-based clan |

**Khanggui** (genealogy) is the study and preservation of clan lineage — a sacred cultural practice. The *Zo Khang Simna Laibu* and *Zo Suan Khang Simna Laibu* are the primary genealogical texts.

---

## 6. Traditional Political System

| Role | Zolai Term | Function |
|---|---|---|
| Chief | **Hausa** | Village/clan leader, hereditary |
| Elders | **Upate** | Council of elders, decision-making |
| Village | **Khua** | Basic social unit |
| Clan | **Beh** | Lineage-based identity group |

Respect for elders (**Upate**) is a non-negotiable cultural norm. The Hausa system was replaced by democratic administration in 1948.

---

## 7. Zongeina — Zomi Culture & Customs

### Core Values
| Value | Zolai | Meaning |
|---|---|---|
| Love / Unity | **Itna** | Communal love; expressed through Pumkhatna (unity) |
| Bravery | **Galhiam** | Warrior bravery; Galhang = brave/heroic status |
| Mercy / Grace | **Hehpihna** | Kindness to those in need (reinforced by Christianity) |
| Harmony | **Kituakna** | Communal harmony; direct confrontation avoided |
| Arrogance (taboo) | **Liansap** | Showing off is culturally discouraged |

### The Lung-Kha Architecture
Unlike many Western languages, Zolai conceptualizes the human experience through the "Lung" (Heart) and "Kha" (Spirit) duality. This "Lung-Kha" architecture is foundational to Zolai thought:
- **Heart (Lung)**: The seat of emotions, will, and intellect (e.g., `lungdam` - thankful, `lungkhual` - thoughtful).
- **Spirit (Kha)**: The spiritual essence, breath, and immortal part of the being.

### Khuado — The Harvest Festival
**Khuado Pawi** is the most significant traditional festival, marking the end of harvest and beginning of a new year. It involves:
- **Pawi** — celebration/festival
- **Late** — traditional songs performed at Khuado
- **Lamin** — traditional dances
- Community feasting and thanksgiving

### Traditional Arts
| Domain | Zolai Term | Description |
|---|---|---|
| Song | **Zola** | Traditional and sacred songs; La = song |
| Dance | **Zolam** | Traditional dances performed at festivals |
| Oral poetry | **Pasaltit** | Warrior poetry; oral historical record |
| Proverbs | **Vontawi / Gentehna** | Wisdom sayings; collected in *Gentehna Tuamtuam le A Deihnate* |
| Weaving | **Puan** | Traditional cloth/shawl; identity marker |

### Traditional House
**Inn** — the traditional Zomi house, built on stilts, central to family and community life.

---

## 8. Zo-an — Traditional Zomi Food

**Zo-an** (Zo + an = "Zo food") refers to traditional Zomi cuisine. Key characteristics:
- Rice-based diet (**Ann** = food/rice)
- Fermented foods prominent (fermented fish, bamboo shoots)
- **Tui** (water/rice beer) — traditional beverage
- Communal eating culture — food sharing is an expression of **Itna** (love/unity)
- Hunting and foraging traditions from highland life

*Note: Zo-an content is sparse in current resources — this domain needs further research and documentation.*

---

## 9. Christianity & Its Impact

Christianity arrived among the Zomi in the late 19th century through British and American Baptist missionaries. Its impact on Zolai culture has been profound:

- **Literacy**: The Bible translation drove mass literacy in Zolai
- **Church (Pawlpi)**: Now the central hub for both spiritual and social life
- **Biakna** (worship): Modern Zomi culture is inextricably linked with Christianity
- **Hehpihna** (mercy/grace): Christian values reinforced traditional communal values

### Bible Translation History
| Year | Version | Notes |
|---|---|---|
| 1899 | First written Zolai | Earliest documented Zolai writing |
| 1932 | First complete Bible | Foundational literacy text |
| 1977 | Revised Bible (TDB77) | Updated translation; widely used in churches |
| 2018 | ZVS (Zokam Standard Version) | Current standard; basis for Zolai AI project |

---

## 10. Zolai — The Language

**Zolai** (Zo + lai = "Zo language/literature/writing") is the Tedim dialect of the Zo language family, spoken primarily in Tedim, Chin State, Myanmar.

- **ISO 639-3**: ctd (Tedim Chin)
- **Script**: Latin alphabet (introduced with Bible translation)
- **Speakers**: ~500,000+ (Tedim dialect specifically)
- **Standard**: ZVS (Zokam Standard Version) — the basis for this project

### Sinna (Education) Tradition
- **Zolai sinna** = Zolai language education
- **Simbu** = graded reader (Tan 1–4)
- **Zolai sinna Computer Software (ZCS)** — first Zolai language software, released 2012
- **Gelhmann bu** = writing/composition book

---

## 11. Diaspora

As of 2025, Zomi form the second-largest ethnic group in the Burmese diaspora in the United States. The largest concentration is in **Tulsa, Oklahoma** (12,000–15,000 people), known as "Zomi Town." The Zomi are largely Christian and faced persecution under Myanmar's military dictatorship, driving significant refugee resettlement.

---

---
<!-- SOURCE: wiki/culture/traditional_customs.md -->

# Traditional Zomi Customs (Zongeina)
> Tengmaw, Minvoina, Hnat, Puan, Inn, Zo-an and more
> Sources: Zolai Khanggui (AD 1899–2013), Gentehna Tuamtuam, zogam.org, wiki/culture/zomi_comprehensive.md
> Last updated: 2026-04-14

---

## 1. Tengmaw — Marriage Custom

**Tengmaw** (lit. "bride price" / marriage arrangement) is the traditional Zomi marriage system.

### Process
1. **Nau-in** — the young man's family sends a representative (often an uncle) to the girl's family to express interest
2. **Tengmaw bawl** — negotiation of bride price (`tengmaw`) between families; typically includes:
   - Cattle (`sa`)
   - Traditional cloth (`puan`)
   - Rice beer (`zu`)
   - Money (modern addition)
3. **Khua-in** — the wedding feast held at the bride's village
4. **Inn-lut** — the bride enters the groom's house; she becomes part of his `innkuan` (family)

### Key vocabulary
| Zolai | English |
|---|---|
| `tengmaw` | bride price / marriage arrangement |
| `zi` | wife |
| `pasal` | husband |
| `zi lei` | to take a wife (lit. "buy wife") |
| `khua-in` | wedding feast |
| `inn-lut` | bride entering groom's house |
| `nau-in` | matchmaking visit |
| `innkuan` | family unit |

### Cultural note
Marriage in Zomi culture is not just between two individuals — it is a covenant between two `beh` (clans). The `tengmaw` is not a "purchase" but a formal recognition of the woman's value and a bond between families.

---

## 2. Minvoina — Naming Ceremony

**Minvoina** (lit. "name-giving") is the ceremony where a newborn receives their name, typically 3–7 days after birth.

### Process
1. Family and community gather at the `inn` (house)
2. An elder (`Pu`) announces the chosen name
3. The name is often chosen based on:
   - Ancestor names (clan tradition)
   - Circumstances of birth (time, season, event)
   - Spiritual significance
4. `Zu` (rice beer) and food shared with guests
5. The child's name is recorded in the `khanggui` (genealogy)

### Key vocabulary
| Zolai | English |
|---|---|
| `min` | name |
| `minvoina` | naming ceremony |
| `min piak` | to give a name |
| `min kici` | is named / is called |
| `khanggui` | genealogy / clan record |
| `naupang` | child / infant |
| `Pu` | elder / grandfather (honorific) |

### Cultural note
A person's name carries their identity and clan lineage. Changing one's name is rare and significant. The `khanggui` (genealogy book) records all names across generations — the Zolai Khanggui (AD 1899–2013) is the most comprehensive published example.

---

## 3. Hnat — Labor Exchange

**Hnat** is the traditional communal labor system where community members help each other with large tasks (farming, house-building) without payment — reciprocal labor exchange.

### How it works
- A family needing help (e.g., harvesting, building a house) calls a `hnat`
- Neighbors and clan members come to help for the day
- The host family provides food and `zu` (rice beer)
- The helpers expect the same help in return when they need it

### Key vocabulary
| Zolai | English |
|---|---|
| `hnat` | communal labor exchange |
| `hnat bawl` | to organize a hnat |
| `hnat pai` | to go help at a hnat |
| `nasem` | work / labor |
| `kikhawm` | gather together |
| `kizopna` | cooperation / alliance |

### Cultural note
Hnat embodies the Zomi value of `kizopna` (cooperation) and `innkuan` solidarity. It is still practiced in Zomi villages today, especially during rice harvest (`an khawm`) and house construction (`inn bawl`).

---

## 4. Puan — Traditional Cloth

**Puan** is the traditional handwoven cloth of the Zomi people, woven by women on backstrap looms.

### Types
| Puan type | Description | Occasion |
|---|---|---|
| `Puan tualpi` | Ceremonial shawl (striped, colorful) | Festivals, weddings, funerals |
| `Puan bansau` | Long cloth wrap | Daily wear (traditional) |
| `Puan siangtho` | White/pure cloth | Mourning, burial |
| `Puan hoih` | Fine/beautiful cloth | Gifts, bride price |

### Key vocabulary
| Zolai | English |
|---|---|
| `puan` | cloth / fabric |
| `puan gel` | to weave cloth |
| `puan gelpa/nu` | weaver (male/female) |
| `puan silh` | to wear cloth / dress |
| `puan piak` | to give cloth (as gift) |
| `tualpi` | ceremonial shawl |

### Cultural note
Weaving skill (`puan gel`) was a mark of a woman's worth and readiness for marriage. The patterns (`puan dan`) encode clan identity — different `beh` (clans) have distinct patterns. Puan is still worn at `Khuado` (harvest festival) and major ceremonies.

---

## 5. Inn — Traditional House

The traditional Zomi house (`inn`) is built on stilts (`inn kang`) with a central hearth (`mei bawl`).

### Structure
| Part | Zolai | Function |
|---|---|---|
| Main house | `inn` | Living, sleeping, cooking |
| Stilts/posts | `inn kang` | Elevates house off ground |
| Hearth | `mei bawl` | Cooking, warmth, social center |
| Granary | `an inn` | Rice/grain storage |
| Veranda | `inn kham` | Receiving guests, working |
| Door | `inn kong` | Entrance |
| Roof | `inn tung` | Thatched (traditional) |

### Key vocabulary
| Zolai | English |
|---|---|
| `inn bawl` | to build a house |
| `inn lut` | to enter a house |
| `inn suak` | to leave a house |
| `inn kuan` | household / family |
| `inn sung` | inside the house |
| `inn pualzang` | outside the house |
| `inn kong` | door / gate |

### Cultural note
The hearth (`mei bawl`) is the spiritual center of the Zomi home. Guests are welcomed to sit by the fire. The `inn` is not just a building — it represents the `innkuan` (family unit) and by extension the `beh` (clan). `Inn bawl` (house-building) is a community event, often done through `hnat` (labor exchange).

---

---
<!-- SOURCE: wiki/culture/historical_origins.md -->

# Historical Origins of the Zomi People & Zolai Language

This document traces the origins, migration history, and linguistic development of the Zomi people and their written language, compiled from *Zolai Khanggui (AD 1899–2013)*, *Zolai Sinna Bu*, and oral historical traditions.

## 1. Pre-Literate Origins: Ciimnuai to Tedim

### Ciimnuai (c. AD 1420)
According to *Zolai Khanggui* (lines 622–680), around **AD 1420**, the ancestors of the Zomi settled at a place called **Ciimnuai** in the upper highlands (khamtung). Before this, oral tradition traces the Zomi back to **Khampat**, which some historians link to migration from the Tibet/China border region.

> `Ciimnuai tate, Ciimnuai mi, Ciimnuai vontawi ci-in, tua khua kisat aa kipan la in ki-awi aa, kilolo cih ding ahi hi.` — The people of Ciimnuai were called Ciimnuai mi (Ciimnuai people). *(Khanggui)*

The Ciimnuai settlement served as a cultural hub. From there, subgroups migrated in different directions:
- **India (Manipur state)**
- **India (Mizoram state, extending to Assam)**
- **Myanmar (Chin State)**
- **Bangladesh (Chittagong area)**

### Tedim (c. AD 1550–1810)
**Pu Gui Mang** is credited with founding Tedim around **AD 1550**. However, the town was more formally established by a coalition of ten leaders around **AD 1810**, including Pu Mang Gin, Pu Khoi Lam, Pu Pau Vum, and others. Key historical details from *Khanggui*:

- The town grew to 300 houses under Pu's chieftainship (hausapi)
- In **1848**, the `thukhun` (law code) was formalized
- Tedim became the center of governance, justice, and military coordination
- The town had distinct neighborhoods: **Bonuai veng, Botung veng, Vaiphei veng, Sekzang veng, Khuangzang veng**

### Identity Note
> `Ciimnuai mi kicite leh Tedim mi kicite pen, a kibang sitset, zungkhat guikhat phungkhat vive ahi hi.`
> — Those called "Ciimnuai people" and those called "Tedim people" are exactly the same — one root, one bloodline, one clan system. *(Khanggui)*

---

## 2. Birth of Written Zolai

### Pu Pau Cin Hau — Laipianpa (The Father of Writing)
**Pu Pau Cin Hau** (1859–1948) is recognized as the **first creator of a Zomi script**. Key facts from *Sinna* and *Khanggui*:
- Between **1888–1902**, during periods of illness, he received divine visions that inspired **1,050** religious symbols/characters
- He was given the title **"Laipianpa"** (Father of Writing)
- His script spawned a religion: **"Laipian Pau Cin Hau Biakna"**
- The Zomi community actively used his script well into the 1910s
- In **2010**, researcher **Anshuman Pandey** submitted Pau Cin Hau's script to the **Unicode Consortium** for digital encoding
- **France Gam Pai (1917):** During WWI, 1,000 Zomite (France Gam Pai) formally used Pau Cin Hau's script for communication while deployed in Europe.

### Rev. Dr. Joseph Herbert Cope — Roman Alphabet Pioneer
**Rev. Dr. J.H. Cope** and his wife **Elizabeth** arrived in Zogam on **November 1, 1910**. Their contributions:

| **1882 Nov 21** | J.H. Cope born in Germantown, Philadelphia, USA |
| **1908 Dec 21** | Cope arrives at Khalkha, Chin State |
| **1910 Nov 1** | Cope arrives at Tedim (Mission phual thak satna) |
| **1912 Feb 12** | Bible translation begins in Khuasak village |
| **1913** | Published `Tual Lai-sintawmna Bu` — the **first Zolai book** |
| **1914** | Published the first `Tedim Labu` (Tedim Hymn Book) |
| **1919** | Launched `Tedim Thukizakna Lai` — first Zolai newspaper |
| **1932** | Published `Thuciam Thak` (New Testament) in Tedim Zolai |

> `J.H. Cope hong tun ciangin Zolai a kinei pan ahi hi.` — When J.H. Cope arrived, that's when Zolai came to exist [as a written language]. *(Pau, Gin Sian, 2008)*

---

## 3. Zolai Language Development Timeline

| Year | Event | Source |
| :--- | :--- | :--- |
| c. 1888 | Pu Pau Cin Hau begins receiving script visions | Khanggui |
| 1910 | Cope arrives at Tedim, begins Roman alphabet Zolai | Sinna |
| 1913 | `Tual Lai-sintawmna Bu` — first Zolai book published | Sinna, Khanggui |
| 1914 | First `Tedim Labu` (hymn book) published | Sinna |
| 1917 | Piantit paite adopt Pau Cin Hau script | Sinna |
| 1919 | `Tedim Thukizakna Lai` — first newspaper | Sinna |
| 1932 | **Tedim 1932 Bible** published (Tedim dialect) | Dataset |
| 1957 | **ZCLS** (Zomi Christian Literature Society) founded | Khanggui |
| 1977 | **TDB77** — Tedim Bible published | Dataset |
| 2008 | Cope 98th Anniversary Celebration, Tedim | Sinna |
| 2009 | **ZAUS** (Zomi Association of USA) founded, Portland, Oregon | Sinna |
| 2010 | **Zolai Sinna** published online (Zolai learning book) | Sinna |
| 2010 | Pau Cin Hau script submitted to Unicode Consortium | Sinna |
| 2010 | Zolai Centennial Celebration (100 years of written Zolai) | Khanggui |
| 2013 | **Zolai Khanggui** published by Zomi Youth Network (ZYN) | Khanggui |
| 2018 | **ZVS** (Zokam Standard Version) Bible published | Dataset |

---

## 4. Zomi Diaspora & Language Preservation

### The Crisis
From *Sinna* (lines 272–282):
> `1980 pawl a kipanin Zomite sak leh khang sim leh malah kikhen thangin gam tuamtuamah kileng keek hi.` — From the 1980s, Zomi people scattered to many foreign countries.

The core threat: `Gamdanga piang Zomi naupangte in ei pau siam nawn loin, zang thei nawn lo mawk uh hi.` — Zomi children born abroad can no longer speak or use the language.

### Preservation Efforts
- **ZAUS** (Zomi Association of USA, 2009) — Created the online Zolai Sinna
- **ZYN** (Zomi Youth Network, 2013) — Published the Zolai Khanggui
- **Digital dictionaries** — Zomi Electronic Dictionary (ZED), Tongdot App
- **Bible translations** — ZVS 2018 standardized modern Zolai
- **Australian government schools** now teach Zolai
- **British Museum Library** holds copies of Zolai texts

---

## 5. Subdialects & Regional Variation

*Zolai Khanggui* (lines 507–618) documents the linguistic diversity within the broader Zomi family:

### Northern Chin State (Saklam/Leilulam)
1. **Tedim/Tonzang/Cikha zone** — 4 recognized dialect variations (Zo, Sizang, Teizang, Tedim accents), plus Hualngo; collectively called **"Zopau"**; used in Tedim, Tonzang, Cikha, Kalay, Tamu, and diaspora communities
2. **Falam zone** — 9-10 dialect variations (Ngawn, Bualkhua, Zangiat, Khualsim, Tlaisun, Pawi, Lente, Hualngo, Lunghawh); called **"Laizo tong"**
3. **Hakha/Thantlang zone** — 8-9 variations (Zotung, Zophei, Lai, Senthang, Mi-e, Thor, Mara, Lautu); called **"Lai holh"**

### Southern Chin State (Khanglam/Leitawlam)
4. **Matupi** — 4 groups (Matu/Ngala, Mara/Lakher, Zotung, Dai)
5. **Mindat/Kanpetlet** — 5 groups (Dai, Miging, Mon, Cho, Taungha)
6. **Paletwa** — 5 groups (Khumi, M'ro, Khuangtso, Ahnu, Hualngo)

### Outside Chin State
7. **Thayet/Minbu** — 2 groups (Asho, Siktui)
8. **Arakan (Rakhine) State** — 2 groups (Asho, M'ro)

---
## 6. Significant Historical Events

### France Gam Pai (Piantit Pai) — WWI (1917–1919)
One of the most defining moments for Zomi global awareness was the **Labor Corps** mission during World War I.
- **Departure:** May 27, 1917 (Departed from Tedim via Gunkhawm and Zangkung).
- **Arrival:** August 15, 1917 (Marseilles, France).
- **Scope:** 1,000 Zomite (out of 3,000 from the region) were deployed as the 61st and 62nd India Companies.
- **Royal Visit:** In March 1918, a delegation of Zomi leaders (including Mang Pum and Thawng Za Kai) was invited by **King George V** to Buckingham Palace, London.
- **Impact:** This event brought global exposure, the concept of a "salary" (khasum), and accelerated the spread of Christianity when the veterans returned.

---
*Reference: Zolai Sinna Bu (Lesson 34, "Piantit Pai" and "Rev. Dr. Cope"), Zolai Khanggui (AD 1899–2013, pp. 22–100), ZVS Standard Format.*

---
<!-- SOURCE: wiki/mistakes/common_mistakes.md -->

# Common AI Mistakes (Zolai Tedim)

Avoid these common mistakes when generating Zolai Tedim.

## 1. Mixing Dialects
- **Mistake:** Using "pasian" (Hakha) for God.
- **Correct:** Always use "Pasian".
- **Also avoid:** `gam` (use `gam`), `tapa` (use `tapa`), `topa` (use `topa`), `???` (use `kumpipa`), `tua`/`tuan` (use `tua`), `nunnak` (use `nuntakna`), `zalenna` (use `suahtakna`)

## 2. Incorrect Greeting Responses
- **Mistake:** Replying "Man ei" when asked "Na dam na?" (How are you?).
- **Correct:** Reply "Dam mah" or "Ka dam hi".

## 3. Invented Phrases
- **Mistake:** "Ka dammah, lungdamna thu" (mixing "I am fine" with "Gospel").
- **Correct:** If asked "Na dam na?", reply "Dam mah". For thanks, say "lungdam".

## 4. Incorrect Verb Stems
- **Mistake:** Using "Nunnak" (Hakha/Falam).
- **Correct:** Always use "Nuntakna".

## 5. "Man" vs "Dik"
- Both are correct for "True/Correct" in Tedim.
- "Man ei" and "Dik ei" are both acceptable for "That's correct/OK".

## 6. Incorrect "freedom"
- **Mistake:** Using "Zalenna".
- **Correct:** Use "Suahtakna".

## 7. Plurality violation `i` + `uh`
- **Mistake:** `I kiphawk mahmah uh ahihman in...`
- **Correct:** `I kiphawk mahmah ahihman in...` — drop `uh` when using `i`.
- **Rule:** NEVER combine `uh` with `i`. (Khanggui lines 474–481)

## 8. Negative conditional `kei a leh`
- **Mistake:** `Nong pai kei leh...`
- **Correct:** `Nong pai kei a leh...`
- **Rule:** Negative conditionals use `kei`, NEVER `kei leh`.

## 9. Bad stem nominalizations (corpus-verified)
- `than'na` → `than'na` | `kahna` → `kahna` | `neina` → `neihna`
- `sina` → `sihna` | `hauna` → `hauhna` | `hakna` → `hahna`
- `thatna` → `thahna` | `samna` → `sapna`

## 10. Sentence-final particles (learned from 2.8M corpus)
- `maw` — soft question/confirmation: `Hoih maw?`
- `uhi`/`uh hi` — 3rd person plural declarative: `A pai uh hi.`
- `ing` — 1st person exclusive future: `Ka pai ing.`
- `ahihi` — contracted `ahi hi`
- `diam` — soft question: `Na pai ding diam?`
- `cihi` — contracted `ci hi` (quotative)
- `hia` — informal question variant of `hiam`
- `hang` — emphatic/exclamatory: `Hoih mahmah hang!`

## 11. `ciak` — multiple valid meanings (NOT just eating)

`ciak` has several distinct uses in Tedim Zolai:

**1. Eating/consuming (food):**
- `An a ciak hi.` — He eats food.

**2. Chattering/talking noisily (idle/excessive talk):**
- `A nih vua mawk ciakciak uh.` — Those two are just chattering away.
- `Mawk ciakciak kei vo.` — Don't just chatter/babble.
- Pattern: `mawk ciakciak` = idle chatter, babbling

**3. Making noise / sizzling / rattling sound:**
- `Na an huan a ciak hi.` — Your food in the pot is sizzling.
- `Na phone ciakciak ei.` — Your phone is buzzing/ringing repeatedly.
- `Hih van ciakciak veh aw.` — This thing is making noise/rattling.

**Rule for reading:** Use `sim` not `ciak`:
- ✓ `Laisiangtho a sim hi.` — He reads the Bible.
- ✗ `Laisiangtho a ciak hi.` — Wrong (implies eating the Bible)

## 12. `van` — thing/object/goods AND sky/heaven

**1. Thing / object / goods (most common):**
- `Hih van ciakciak veh aw.` — This thing is making noise.
- `Tua van bang hi hiam?` — What is that thing?
- Commerce roots: `van lei` (buy) | `van zuak` (sell) | `van man` (price) | `van guang` (freight)

**2. Sky / heaven:**
- `vantung` = heaven (van + tung = sky + above)
- `van awng thawl` = outer space
- `van dum mel` = sky-blue/azure

## 13. `kikhawm` vs `ki mu khawm`
- `kikhawm` = gather/assemble (general)
- `ki mu khawm` = meet together (people coming to meet each other specifically)
- For diplomatic meetings: use `ki mu khawm`
- Example: `US leh Iran te in Pakistan ah ki mu khawm uh hi.`

## 14. `thu a kigen` vs `thu a kikum`
- `thu a kigen uh` = they spoke/said words (general speech)
- `thu a kikum uh` = they deliberated/discussed (weighing matters together)
- For negotiations/consultations: use `thu a kikum`

## 15. `duh lo` vs `deih lo`
- **Correct:** `deih lo` = did not want / refused
- `deih` is the ZVS standard form for "want/desire"
- Example: `A deih lo hi.` (He did not want to.)

## 16. Failed negotiations phrasing
- `thu a kituah lo` = the matter did not happen (too vague)
- `a thu uh a kituak kei hi` = their matter did not come together/agree
- `thukim na a ngah kei uh hi` = they did not obtain agreement (most precise)

## 17. Degrees of leaving/departing
- `a ciah hi` = he left (neutral)
- `a ciah pah hi` = he left immediately/right away
- `a ciah vingveng hi` = he left abruptly/suddenly
- `a ciah kik hi` = he went back/returned

## 18. TDB77 ≠ ZVS
- **TDB77** = Tedim Bible 1977 (traditional, widely used in churches)
- **ZVS** = Zokam Standard Version 2018 (current gold standard for this project)
- These are DIFFERENT versions. Never label TDB77 as ZVS.

## 19. `o` phonetic realization
- The letter `o` in Zolai is always realized as /oʊ/ (like English "go")
- Never pronounce as /ɒ/ (British "hot") or /oː/ (pure long o)
- Example: `Hoi` = /hoʊɪ/ not /hɔɪ/

## 18. `siahuai` vs `lauhuai`
- `lauhuai` = dangerous / scary / fearful (from `lau` = fear)
- `siahuai` = fierce / bad / wicked / evil
- For something dangerous to release/handle: use `lauhuai`
- Example: `A lauhuai lua ahih manin pulaakkhia nuam lo uh hi.` (Too dangerous to release.)

## 19. `release` (product/model) = `pulaakkhia`
- `pulaakkhia` = release/publish/put out for public
- `suakta sak` = cause to come out (also valid)
- Example: `Model thak pulaakkhia uh hi.` (They released a new model.)

## 20. `hong ki beh lap hi` for product launches
- For many things being released/launched: `hong ki beh lap hi`
- Example: `April 2026 sung in AI lam ah model thak tampi hong ki beh lap hi.`
- More natural than `a suah hi` for product release context

## 21. `na sia mahmah hi` for fierce competition
- `na sia mahmah hi` = very fierce/intense
- Example: `Leitung AI lam kidona pen tu-in na sia mahmah hi.`
- More natural than `a that mahmah hi` for competition context

## 22. Ordinal day numbers — two valid forms (from Genesis)

**TDB77 (1977) form** — uses `-na` suffix:
- `ni khatna` (1st day), `ni nihna` (2nd), `ni thumna` (3rd), `ni lina` (4th), `ni nga-na` (5th), `ni gukna` (6th)

**Tedim Bible 2011 (TDB) form** — repeats the number:
- `ni khat ni` (1st day), `ni nih ni` (2nd), `ni thum ni` (3rd), `ni li ni` (4th), `a ni nga ni` (5th), `a ni guk ni` (6th)

Both are correct. TDB77 = 1977 traditional register. Tedim = Tedim Bible 2011 (TDB).

## 23. 3rd person `a` marker — Tedim is more consistent

Tedim Bible 2011 (TDB) adds `a` before verbs more consistently than TDB77:
- TDB77: `piang pah hi` | Tedim: `a piang pah hi`
- TDB77: `khen hi` | Tedim: `a khen hi`
- Rule: In Tedim Bible 2011 (TDB), 3rd person singular verb should have `a` prefix.

## 24. `om ta hen` vs `om hen` (benedictive)

- TDB77: `Khuavak om ta hen` (Let there be light — with `ta` change-of-state marker)
- Tedim: `Khuavak om hen` (Let there be light — without `ta`)
- Both valid. `ta` emphasizes the new state coming into existence.

## 25. Compound words — Tedim ZVS prefers compounds

- TDB77: `lim leh meel nei loin` → Tedim: `limlemeel neiloin`
- TDB77: `khua mial na` → Tedim: `khua mial bikbek` (more descriptive: pitch dark)
- TDB77: `tuisung` → Tedim: `tui sung` (separate)
- Tedim Bible 2011 (TDB) tends to compound related words more than TDB77.

## 26. Three Tedim Bible versions (bible.com)

| ID | Abbrev | Full Name | Year | Status |
|---|---|---|---|---|
| 368 | TDB | Tedim (Chin) Bible | 2011 | ✓ In dataset |
| 3561 | TB77 | Tedim Bible | 1977 | ✓ In dataset |
| 4189 | TBR17 | Tedim Bible Revision 2017 | 2017 | ✗ Not yet in dataset |

TBR17 (2017) is a revision of TDB (2011) — likely the most current standard.
Key differences seen in TBR17 vs TDB:
- Uses `le` instead of `leh` in some places (GEN 1:1: `vantung le leitung`)
- Uses `ʼ` (Unicode apostrophe) instead of `'`
- `khen khia` (separate) vs `khenkhia` (compound)
- `a bok vakte` (separate) vs `a bokvakte` (compound)

## 27. "Tedim 2010" is NOT a Bible version

**Wrong:** Listing "Tedim 2010" as a Bible translation alongside 1932, TDB77, and ZVS 2018.

**Correct:** There is no "Tedim 2010" Bible. The year 2010 was the **Cope Centennial Jubilee** — 100 years of written Zolai (1910–2010). No new Bible translation was published that year.

The three Tedim Bible versions are:
1. **Tedim 1932** — First complete Bible
2. **TDB77 (1977)** — Major revision
3. **ZVS 2018** — Current gold standard (also: TDB 2011 and TBR17 2017 on bible.com)

## 28. Judson 1835 is NOT a Tedim translation

**Wrong:** Listing "Judson (1835)" as an early Tedim Bible translation.

**Correct:** Adoniram Judson translated the **Burmese Bible** in 1835. It has no direct connection to Tedim/Zolai. In this project, the Judson 1835 corpus (`judson1835`, 26,589 entries) is used as **parallel Burmese data** for cross-linguistic training only — it is not a Zolai source.

## 29. Missing Pronominal Agreement Markers
- **Mistake:** `Nang hong pai hi.` (You come — missing agreement marker)
- **Correct:** `Nang na pai hi.` or `Nang hong pai na hi.`
- **Mistake:** `Amah an ne hi.` (He eats rice — missing `a` marker)
- **Correct:** `Amah in an a ne hi.`
- **Rule:** 2nd person (Nang) requires `na`, 3rd person (Amah/Mite) requires `a` marker before the verb.

## 30. Proper Noun Capitalization (ZVS Standard)
- **Mistake:** `pasian`, `topa`, `laisiangtho`, `zolai`
- **Correct:** `Pasian` (God), `Topa` (Lord), `Laisiangtho` (Bible), `Zolai` (the language)
- **Rule:** Always capitalize religious, linguistic, and ethnic proper nouns.

## 31. Negation of `thei` (Ability)
- **Mistake:** `Ka pai thei lo hi.` (I cannot go — uses `lo` which is more for 'not' than 'cannot')
- **Correct:** `Ka pai thei kei hi.` (Standard negation for ability/future)
- **Mistake:** `A thei lo hi.` (He does not know)
- **Correct:** `A thei kei hi.` (ZVS standard)

## 32. `mahkho` vs `mahkua` (Future/Front)
- **Mistake:** Using `mahkho` (Hakha influence).
- **Correct:** `mahkua` (Front/Future).
- Example: `Ih mailam mahkua...` (Our future/front...)

---
<!-- SOURCE: wiki/grammar/grammar_a1_to_c2.md -->

# Zolai Grammar: A1 to C2 — Complete Leveled Reference

> Corpus-verified from TDB77 + TBR17 + Tedim2010 × KJV
> Last updated: 2026-04-17

---

## A1 — Beginner

### Basic Sentence: SOV (Subject-Object-Verb)
```
Ka pa in laibu a sim hi.     = My father reads a book.
Kei in an ka ne hi.          = I eat rice.
Pasian in leitung a piangsak hi. = God created the earth.
```

### Identity: `[Subject] ahi hi` / `[Subject] hi`
```
Amah in Pasian' mipa ahi hi. = He is a man of God.
Ka dam hi.                   = I am fine.
Hih bang ahi hiam?           = What is this?
```

### Simple negation: `kei hi` / `lo hi`
```
Ka pai kei hi.   = I did not go.
Ka thei kei hi.  = I do not know.
Om lo hi.        = It does not exist.
```

### Basic question: `[verb] hiam?`
```
Na dam hiam?     = Are you well?
Na pai hiam?     = Did you go?
Bang ahi hiam?   = What is it?
```

---

## A2 — Elementary

### Past completed: `khin`
```
Ka pai khin hi.          = I have already gone.
Na pai khin hiam?        = Have you (already) gone?
A kiman khin hi.         = It is finished.
```

### Future: `ding hi`
```
Ka pai ding hi.          = I will go.
Hong pai ding hiam?      = Will (he) come?
Si ding hi.              = (He) will die.
```

### Ability: `thei`
```
Ka pai thei hi.          = I can go.
Ka thei kei hi.          = I cannot / I don't know.
Lut thei kei uh hi.      = They could not enter.
```

### Directional particles
```
hong pai  = come (toward speaker)
va pai    = go (away from speaker)
hong lut  = come in
va lut    = go in (away)
paikhia   = go out / depart
ciahkik   = return
```

---

## B1 — Intermediate

### Conditional: `a leh` / `leh`
```
Na pai kei a leh...      = If you don't go...
Na hoih gamta leh...     = If you do good...
A kip leh, thaman a ngah ding hi. = If it stands, he will receive reward.
```
**Rule:** NEVER `kei a leh` for negative conditional — always `kei a leh`

### Cause/Because: `ahih manin` / `bang hang`
```
Topa' minthan'na in Topa' inn dim ahih manin siampite lut thei kei uh hi.
= The priests could not enter because the glory of the Lord filled the temple.

Bang hang hiam cih leh Pasian in leitung mite a it mahmah hi.
= For God so loved the world...
```

### When/After: `ciangin` / `khit ciangin`
```
A nek khit ciangin...    = After eating...
A tun ciangin...         = When (he) arrived...
Ni tampi khit ciangin... = After many days...
```

### While: `lai takin`
```
Kumpipa tawh kiho-in a om lai takin Nathan hong tum hi.
= While she was talking with the king, Nathan came in.
```

### Purpose: `nadingin`
```
Lungdamna Thu ka ngah khawm nadingin...
= In order to share in the gospel...
Galsiam nadingin kei hong hilh a...
= He taught me in order to make war...
```

### Quotative: `ci hi` / `ci-in`
```
Amah in, "Pai in," ci hi.     = He said, "Go."
"Ka dam hi," ci-in gen hi.    = He said, "I am fine."
```

---

## B2 — Upper Intermediate

### Concessive: `napi` / `napi-in` (although/even though)
```
Ta taktak ahi napi-in gimna tawlna a thuakna tawh thuman'na a sin hi.
= Although he was a Son, he learned obedience through suffering.

Topa lian napi-in amah in a neute don hi.
= Although the Lord is great, he cares for the humble.
```

### Comparative: `sangin` + `zaw`
```
Amah sangin hatzaw i hi hiam?
= Are we stronger than he?

Note khempeuh sangin keimah in pautuam dang gen thei ka hih ciangin...
= Since I speak in tongues more than all of you...

I lungsim sangin Pasian lian zaw hi.
= God is greater than our heart.
```

### Superlative: `pen` / `Sang Pen`
```
A masa pen = the first / the foremost
Sang Pen Pasian = the Most High God
A tung masa pen = the very first fruits
```

### Emphatic: `mah` (self / even / also)
```
Kei in Khazih bangin ka gamtat mah bangin note zong kei gamtat bangin gamta un.
= Follow me as I follow Christ.

Adam sungah mi khempeuh a sih mah bangin Khazih sungah mi khempeuh a nungtasak ding hi.
= As in Adam all die, even so in Christ all shall be made alive.
```

### Causative: `sak` (make/cause someone to do)
```
Kei hong itte ka hausak a...  = He enriched those who love me...
Amah in kei hong suaksak a... = He caused me to...
Amaute thahat mite suaksak napi-in... = Even though he strengthened their arms...
```

### Ever/Before: `ngei`
```
Na mu ngei hiam?             = Have you ever seen it?
Ka pai ngei kei hi.          = I have never gone.
Cikmah hunin mu ngei kei hi. = Never seen at any time.
```

---

## C1 — Advanced

### Emphatic Identity: `KEIMAH ka hi hi`
The absolute self-declaration pattern (Exodus 3:14):
```
KEIMAH ka hi hi.             = I AM THAT I AM.
```
Double `hi hi` = eternal, absolute identity — not just current state.

### Stacked embedded clauses (Pauline syntax)
Multiple conditions before the main verb — verb always last:
```
Sihna panin Jesuh a thokiksak Pasian' Kha Siangtho note sungah hong om leh,
sihna panin Khrih a hingkik sakpa mah in,
note sungah a om ama Kha Siangtho mah tawh,
a sithei pumpi a hong nungtasak ding hi.
```
= If the Spirit of God who raised Jesus from the dead dwells in you, he who raised Christ Jesus from the dead will also give life to your mortal bodies through his Spirit who dwells in you. (Romans 8:11)

### Exclusivity: `longal ... kei`
```
Kha Siangtho longal kuamah in a thei kei hi.
= No one knows except the Holy Spirit.
```

### Prohibitive jussive: `kei hen`
```
Na lungtang uh patau kei hen.  = Let not your heart be troubled. (John 14:1)
```

### Rhetorical question: `koi-ah om hiam?`
```
Lungpil mi koi-ah a om hiam?  = Where is the wise man? (1 Cor 1:20)
Na upna uh koi-ah om hiam?    = Where is your faith?
```

### Foundational reason: `bang hang hiam cih leh`
```
Bang hang hiam cih leh, Pasian in leitung mite a it mahmah hi.
= For God so loved the world... (John 3:16)
```

---

## C2 — Mastery

### Visionary frame: `ka khuadak leh ... ka mu hi`
```
Ka khuadak leh vantungah kong a kihongsa-in a om ka mu hi.
= I looked, and behold, a door standing open in heaven I saw. (Rev 4:1)
```
Pattern: `ka khuadak leh` [vision description] `ka mu hi`

### Worthiness doxology: `kilawm hi`
```
Nangmah in minthan'na, pahtawina, leh vangliatna na ngah tawntung dingin a kilawm hi.
= You are worthy to receive glory, honor, and power forever. (Rev 4:11)
```

### Poetic parallelism (A = B structure)
```
Line A: Ka Lungkhamna in tuipi bang lian a...
Line B: Ka Dahna in mual lianpi bangin hong neencip hi.
= (A) My sorrow is as vast as the ocean... (B) My grief crushes me like a great mountain.
```

### Metaphorical identity: `pen ... hi`
```
Kei pen nuntakna an ka hi hi.         = I am the bread of life. (John 6:35)
Note pen leitung mite-a' dingin khuavak tawh na kibang uh hi.
= You are the light of the world. (Matt 5:14)
```

### Eternal/forever: `tawntung`
```
Tawntung dingin a kilawm hi.  = Worthy forever.
Tawntung omna.                = Eternal dwelling.
```

---

## Quick Reference: Tense/Aspect Summary

| Marker | Meaning | Example |
|---|---|---|
| `ding hi` | future | `pai ding hi` = will go |
| `hi` | past/present statement | `pai hi` = went |
| `khin` | completed/already | `pai khin hi` = has gone |
| `zo` | finished/overcome | `a zo hi` = finished it |
| `ngei` | ever/before | `mu ngei kei` = never seen |
| `nawn` | again | `pai nawn` = go again |
| `nawn kei` | no more | `pai nawn kei` = go no more |
| `ta` | change of state | `om ta hi` = now exists |
| `pah` | immediately | `om pah hi` = appeared at once |
| `lel` | continuously | `a gamta lel` = keeps doing |
| `thei` | can/able | `pai thei` = can go |
| `het kei` | not even/at all | `gamta het kei` = not do at all |
| `nai lo` | not yet | `tun nai lo` = not yet arrived |

---
<!-- SOURCE: wiki/curriculum/content_a1_a2.md -->

# Zolai Curriculum Content — A1 & A2

> Used by: scripts/seed-curriculum-content.ts
> Last updated: 2026-04-17

---

## A1 — Section 1: Foundations

### Unit 1: Greetings & Identity
**Grammar:** SOV order, identity `ahi hi`, `ka hi hi`
**Vocabulary:**
| Zolai | English |
|---|---|
| Na dam na? | How are you? |
| Ka dam hi. | I am fine. |
| Kei [name] ka hi hi. | I am [name]. |
| Nang kua na hi hiam? | Who are you? |
| Nuam takin om un. | Peace be with you. |
| Lawmthu ka nei hi. | Thank you. |

**Grammar note:** Subject + Object + Verb. `ka` = my/I (prefix). `hi` = statement marker.

### Unit 2: Numbers 1–10
| Zolai | English |
|---|---|
| khat | one |
| nih | two |
| thum | three |
| li | four |
| nga | five |
| guk | six |
| sagih | seven |
| giet | eight |
| kua | nine |
| sawm | ten |

**Pattern:** `[number] pha uh hi` = there are [number] of them

### Unit 3: Family
| Zolai | English |
|---|---|
| ka pa | my father |
| ka nu | my mother |
| ka tapa | my son |
| ka tanu | my daughter |
| ka sanggampa | my brother |
| ka sanggamnu | my sister |
| ka zi | my wife |
| ka pasal | my husband |
| ka naupang | my child |

**Pattern:** `Ka pa in laibu a sim hi.` = My father reads a book.

### Unit 4: Basic Verbs
| Zolai | English |
|---|---|
| pai | go |
| hong pai | come |
| ne | eat |
| dawn | drink |
| sim | read |
| gen | say/speak |
| mu | see |
| thei | know/can |
| om | exist/be |
| nei | have |

**Pattern:** `Kei in an ka ne hi.` = I eat rice.

### Unit 5: A1 Review
- SOV: `Ka pa in laibu a sim hi.`
- Question: `Na dam hiam?` → `Ka dam hi.`
- Negation: `Ka pai kei hi.` = I did not go.
- Identity: `Amah Pasian' mipa ahi hi.` = He is a man of God.

---

## A1 — Section 2: Daily Life

### Unit 1: Food & Drink
| Zolai | English |
|---|---|
| an | rice/food |
| tui | water |
| sa | meat |
| an ne | eat food |
| tui dawn | drink water |
| ka hei hi | I am thirsty |
| ka ngah hi | I am hungry |

### Unit 2: Home & Body
| Zolai | English |
|---|---|
| inn | house |
| innkuan | household/family |
| mun | place |
| pumpi | body |
| muk | eye |
| na | ear |
| bil | mouth |
| khut | hand |
| ke | foot |
| lungsim | heart/mind |

### Unit 3: Colors & Descriptions
| Zolai | English |
|---|---|
| bai | white |
| dum | black |
| siang | red/bright |
| lam | green/blue |
| hoih | good/beautiful |
| sia | bad/damaged |
| lian | big/great |
| tawm | small/little |
| sau | long/tall |
| tawi | short |

### Unit 4: Time Basics
| Zolai | English |
|---|---|
| ni | day/sun |
| zan | night |
| zingin | morning |
| nitak | evening |
| tu ni | today |
| nitak ni | yesterday |
| tuni nung | tomorrow |
| kum | year |
| hun | time/season |

### Unit 5: A1 Section 2 Review
- `Ka inn ah ka om hi.` = I am at home.
- `Zingin an ka ne hi.` = I eat in the morning.
- `Ka lungsim hoih hi.` = My heart is good. / I am happy.

---

## A2 — Section 1: Expanding World

### Unit 1: Village Life
| Zolai | English |
|---|---|
| khua | village/town |
| gam | country/land |
| lui | river |
| mual | hill/mountain |
| lo | field/farm |
| lo sem | farm work |
| khua mi | villager |
| khua uk | village leader |

**Grammar:** Past tense `khin` — `Ka pai khin hi.` = I have gone.

### Unit 2: Occupations
| Zolai | English |
|---|---|
| nasem | work |
| nasempa | worker/servant |
| syanu | teacher (male) |
| syanupa | teacher (female) |
| siampi | priest |
| galkap | soldier |
| kamsang | prophet/preacher |
| kumpi | king/ruler |

### Unit 3: Directions
| Zolai | English |
|---|---|
| zingsang lam | east |
| nitang lam | west |
| vaang lam | north |
| vaang lam nung | south |
| tungah | above/up |
| nuai ah | below/down |
| nungah | behind/after |
| maimai ah | in front |
| kiimah | around |

### Unit 4: Future Plans
**Grammar:** Future `ding hi`
- `Ka pai ding hi.` = I will go.
- `Hong pai ding hiam?` = Will (he) come?
- `Bang bawl ding na hi hiam?` = What will you do?

### Unit 5: A2 Section 1 Review
- Past: `Na pai khin hiam?` = Have you gone?
- Future: `Ka pai ding hi.` = I will go.
- Direction: `Zingsang lam ah pai in.` = Go east.

---

## A2 — Section 2: Telling Stories

### Unit 1: Past Events
**Grammar:** `khin` (completed), `ngei` (ever/before)
- `Ka mu ngei kei hi.` = I have never seen it.
- `A kiman khin hi.` = It is finished.
- `Ni tampi khit ciangin...` = After many days...

### Unit 2: Comparisons
**Grammar:** `sangin` (than) + `zaw` (more)
- `Amah sangin ka lian zaw hi.` = I am bigger than him.
- `Pasian in eite sangin lian zaw hi.` = God is greater than us.
- `A masa pen` = the first / the best

### Unit 3: Quantities
| Zolai | English |
|---|---|
| tampi | many/much |
| tawm | few/little |
| khempeuh | all/every |
| khat bek | only one |
| bangzah | how many |
| a phazah | how much |
| za | hundred |
| sing | thousand |

### Unit 4: Celebrations
| Zolai | English |
|---|---|
| pawi | feast/celebration |
| lungdam | glad/thankful |
| pahtawi | praise |
| lawm | friend |
| lawmna | friendship/joy |
| thupha | blessing |
| thupha pia | bless |

### Unit 5: A2 Section 2 Review
- `Pawi khat bawl ni.` = Let us have a feast.
- `Ka lungdam hi.` = I am glad/thankful.
- `Amah sangin hoih zaw hi.` = It is better than him.

---

## A2 — Section 3: Social Language

### Unit 1: Requests & Offers
| Zolai | English |
|---|---|
| hong pia in | please give (to me) |
| ka ngen hi | I ask/request |
| deih | want |
| nuam | willing/pleasant |
| hong huh in | please help |
| lawmthu | thank you |
| kilawm | fitting/worthy |

**Pattern:** `[thing] hong pia in.` = Please give me [thing].

### Unit 2: Apologies
| Zolai | English |
|---|---|
| ka mawhna | my fault/sin |
| mawhsak | forgive |
| lungkham | sorry/sad |
| kigen hi | I apologize |
| nuam takin | peacefully/kindly |

### Unit 3: Health & Body
| Zolai | English |
|---|---|
| dam | well/healthy |
| na | sick/pain |
| cina | illness |
| damsak | heal |
| natna | sickness |
| ka na hi | I am sick |
| ka dam nawn hi | I am well again |

### Unit 4: Giving Opinions
**Grammar:** `ka ngaihsut hi` = I think
- `Ka ngaihsut in, hoih hi.` = I think it is good.
- `Ka deih hi.` = I want it.
- `Ka deih kei hi.` = I don't want it.
- `Bangci ngaihsut na hi hiam?` = What do you think?

### Unit 5: A2 Section 3 Review
- `Na dam hiam?` → `Ka dam hi, lawmthu.`
- `Ka na hi.` = I am sick.
- `Ka mawhna hong lak in.` = Forgive my sin.

---

## A2 — Section 4: Community

### Unit 1: Church & Faith
| Zolai | English |
|---|---|
| Pasian | God |
| biakna | worship/prayer |
| biakinn | church/temple |
| thunget | pray |
| Lai Siangtho | Holy Bible |
| Kha Siangtho | Holy Spirit |
| Zeisu | Jesus |
| Khazih | Christ |
| upna | faith/belief |
| um | believe |

### Unit 2: Simple Proverbs
From corpus:
- `Eite khat leh khat ki-it ni.` = Let us love one another.
- `Pasian in eite hong it hi.` = God loves us.
- `Nuam takin pai in.` = Go in peace.
- `Thakhauhin hang in.` = Be strong and courageous.

### Unit 3: Nature
| Zolai | English |
|---|---|
| vantung | heaven/sky |
| leitung | earth/world |
| khuavak | light |
| khuamial | darkness |
| tui | water |
| mei | fire |
| sing | tree/wood |
| lo | field |
| ganhing | animal |
| vasa | bird |

### Unit 4: A2 Review
Full review of A2 patterns:
- Past/future tense
- Comparatives
- Questions with `hiam`
- Social phrases
- Faith vocabulary

---
<!-- SOURCE: wiki/curriculum/content_b1_b2.md -->

# Zolai Curriculum Content — B1 & B2

> Used by: scripts/seed-curriculum-content.ts
> Last updated: 2026-04-17

---

## B1 — Section 1: Cause & Effect

### Unit 1: Cause-Effect Connectors
| Zolai | English | Usage |
|---|---|---|
| `ahih manin` | because | most common causal |
| `bang hang` | because/for | mid-sentence reason |
| `bang hang hiam cih leh` | for the reason that | formal/explanatory |
| `tua ahih ciangin` | therefore/so | consequence |
| `tua ciangin` | then/so | sequence |
| `tua ahih leh` | if that is so | conditional consequence |

**Examples:**
- `Topa' minthan'na in inn dim ahih manin siampite lut thei kei uh hi.` = Because the glory filled the temple, the priests could not enter.
- `Bang hang hiam cih leh Pasian in leitung mite a it mahmah hi.` = For God so loved the world.
- `Tua ahih ciangin ka itte aw, khat leh khat ki-it ni.` = Therefore, beloved, let us love one another.

### Unit 2: Conditional Sentences
**Grammar:** `a leh` / `leh` = if
- `Na hoih gamta leh, thupha na ngah ding hi.` = If you do good, you will receive blessing.
- `Na pai kei a leh, ka pai ding hi.` = If you don't go, I will go.
- **NEVER:** `kei a leh` for negative conditional — always `kei a leh`

**Types:**
| Type | Pattern | Example |
|---|---|---|
| Real conditional | `[condition] leh, [result] ding hi` | If X, then Y will happen |
| Negative conditional | `[verb] kei a leh` | If (you) don't [verb] |
| Past conditional | `[verb] khin leh` | If (it) has happened |

### Unit 3: Reported Speech
**Grammar:** `ci hi` / `ci-in` = said/saying
- Direct: `Amah in, "Pai in," ci hi.` = He said, "Go."
- Indirect: `Amah in pai ding ci hi.` = He said he would go.
- Question reported: `Bang ahi hiam ci-in a dot hi.` = He asked what it was.

### Unit 4: Interrogatives (Advanced)
| Question | Zolai | Answer pattern |
|---|---|---|
| Why? | `Bang hangin...hiam?` | `...ahih manin...` |
| How? | `Bangci...hiam?` | `[method] tawh...` |
| How many? | `Bangzah...hiam?` | `[number] pha uh hi` |
| Which? | `Tua bang...hiam?` | `[item] ahi hi` |
| When? | `Bang hun...hiam?` | `[time] ciangin...` |

### Unit 5: Narrative Tense
**Aspect markers in narrative:**
- `khin` = completed: `A kiman khin hi.`
- `zo` = finished/overcome: `A zo hi.`
- `pah` = immediately: `Khuavak om pah hi.`
- `ta` = change of state: `Om ta hi.`
- `khit ciangin` = after: `A nek khit ciangin...`
- `lai takin` = while: `A om lai takin...`
- `ciangin` = when: `A tun ciangin...`

---

## B1 — Section 2: Zomi Culture

### Unit 1: Cultural Practices
| Zolai | English |
|---|---|
| Zongeina | Zomi culture/customs |
| Gentehna | proverbs/wisdom sayings |
| Khanggui | genealogy/clan history |
| pawi | feast/celebration |
| Zola | Zomi songs |
| Zolam | Zomi dance |
| Zo-an | Zomi food |
| innkuan | household/family unit |
| u | elder brother |
| nau | younger sibling |

### Unit 2: Traditional Stories (Gentehna)
Key proverbs from corpus:
- `Sai le a khihna` = The tiger and its stripes (you can't change your nature)
- `Uiphuk le tuisa` = The frog and the water (know your place)
- `Sum le hun` = Money and time (both are precious)
- `Singphuukpa le hei hiam` = The woodcutter and thirst (irony of abundance)

### Unit 3: Bible Corpus I
Key patterns from TDB77:
- `A kipat cilin Pasian in vantung leh leitung a piangsak hi.` = In the beginning God created heaven and earth.
- `Pasian in, "Khuavak om hen," ci hi; tua ciangin khuavak om pah hi.` = God said, "Let there be light"; and immediately there was light.
- `Eite khat leh khat ki-it ni.` = Let us love one another.

### Unit 4: Proverbs & Wisdom
**Structure of Zolai proverbs:**
- Parallel structure: A line + B line (same meaning, different words)
- `Lungpil mi koi-ah a om hiam?` = Where is the wise man? (rhetorical)
- `Pilna a nei na kisa mah uh hi.` = You think you have wisdom.

### Unit 5: Zomi History
Key vocabulary:
| Zolai | English |
|---|---|
| tangthu | history/story |
| khangsimna | genealogy/generation |
| minam | people/nation |
| gam | land/country |
| khua | village |
| ukna | leadership/rule |
| kumpipa | king/ruler |
| galkapna | warfare |

---

## B1 — Section 3: Argument & Opinion

### Unit 1: Agreeing & Disagreeing
| Zolai | English |
|---|---|
| `Ahi hi.` | Yes / I agree. |
| `Hilo hi.` | No / I disagree. |
| `Ka ngaihsut in, ahi hi.` | I think so. |
| `Ka ngaihsut in, hilo hi.` | I don't think so. |
| `Nang thu na gen uh hoih hi.` | What you said is good. |
| `Ahih hangin...` | But... / However... |
| `Tua tham loin...` | Not only that... |

### Unit 2: Giving Reasons
**Pattern:** `[statement] ahih manin [reason]`
- `Ka pai kei hi, na cina ahih manin.` = I didn't go because you were sick.
- `Hoih hi, bang hang hiam cih leh Pasian in a bawl hi.` = It is good, for God made it.

### Unit 3: Formal Register
**Formal vs informal:**
| Informal | Formal | Meaning |
|---|---|---|
| `Na dam na?` | `Na dam hiam?` | How are you? |
| `Pai in.` | `Nuam takin pai in.` | Go. / Go in peace. |
| `Ka thei kei.` | `Ka thei kei hi.` | I don't know. |
| `Ahi hi.` | `Tua ahi hi.` | Yes, that is so. |

---

## B1 — Section 4: Complex Sentences

### Unit 1: Embedded Clauses
**Pattern:** Multiple clauses before main verb (SOV maintained throughout)
- `Pasian in a bawlsa thuciamna tungsak khin hi.` = God has fulfilled the covenant he made.
- `Amah in a nasep a kip leh, thaman a ngah ding hi.` = If his work stands, he will receive reward.

---
<!-- SOURCE: wiki/literature/folklore_idioms.md -->

# Zolai Folklore Idioms & Parables

Extracted from *Gentehna Tuamtuam le A Deihnate* by Pa Lian Than Tuang.

## Leitung Bei Ding le Beiloh Ding
**Theme:** Gamtatna

Sih khitciangin vaangam tung ding cih tawh man pah theilo hi. Gupna ngah in kisi pah leh phamawhlo hi. Gupna ngah khitciang kisih pah tuanlo a hihman in, mawh mai zo, gupkhiatna ngah zo cih tawh man sak ziaulo aa sihma hun sungin nek le dawn ding, nuntakzia ding, mite mai ah limpha suah ding, ci le khuavak dan bat ding kisam lai hi.

## Gunkuang Holhpa le Ulian, Mipil, Sumhaute
**Theme:** Kivakna, Siamna

Pilna, hauhna, zaliatna, siamna cihte pen amau mun tek bek ah kimanna nei hi aa, a neuzaw a lianzaw a thupizaw a kimangzaw cih bang tuan omlo hi. Amau mun ciatciat ah a kisam, a thupi vive ahi hi. A neupen siamna nengno khat na ngawn vallo hi.

## Sakol
**Theme:** Nasep neu/thupilo cih omlo

Na khatpeuhpeuh neulua thupilo cih sanloin i sep nop pen lian i sep khak masiah a kisem thei bangbang, i sep khak bangbang sep nop ding, sep siam ding kisam hi.

## Ngabeng Nih
**Theme:** A Zai Muhna, Ngaihsutna, Sepna

Tawmno cik tawh kilungkim kha thei aa, a baan a zom ding kihanciam nuam nawnlo thei hi. Ngimna tupna zongh a neu a niam sangin a lian a sang mah tumhzaw aa a zai theithei muh zawh ding, ngaihsut theihna kisam hi.

## Nupi Khat le A Tano
**Theme:** Thupaizia tawh kalsuan theihna

Ei le ei mah kipanpih ding, kigum, kihuai ding cih sam hang, a thu a la, a paizia khat zui-in kigup ding, kipanpih theih ding kisam hi. Ei le ei sung bek tawh vai kihawm thei khinlo ahih manin midangte tawh kizopna, nasepna ah hoih nading ei le ei sung ah kihilhna, kimakaih siamna kisam hi.

## Uiphuk le Tuisa
**Theme:** Tuantualna, Thadahna

Zongsatna, nopsakna khatpeuh pan suakta zo ding kisa thei aa, sawtveipi i kidiah leh kisuakta zo nawnlo thei hi. Tua bek thamlo, sep ding a kilawm khat kipat pahkei aa leh a hun tunteh kisem zo nawnlo thei hi.

## Sai le A Khihna
**Theme:** Zongsatna, Kingaihsutna

Hanciam ngamlohna, Lungkiat baihna, Upmawh tawh nuntakna, Na khat pen a kibang suaksuak/a hi suaksuak ding sakna, a hoihlo zongsatna cihte in i gualzawh, i suaktat nading pan hong khaktan thei hi.

## Muvanlai le Akno
**Theme:** Kithuahpih, Kingaihsutna

I kithuahpihte, i kiim i paam, i hihna i kitheihlohna cihte hangin i sep theih ding zah kisem zolo thei hi. Kithuahpih, omna cihte teelsiam in i hihna kitel ding thupi hi.

## Kau le A Bu
**Theme:** Hanciamna

I phul khak i haksatnate in sangpi i tun nadingin thakhauhna, hangsanna, hatna hong guanzaw thei ahi hi.

## Sumkuang le Bilpi
**Theme:** Ciktakna, Hanciamna ii thupitna le thadahna ii hoihlohna

Mi dangte a hatloh hang etneu huailo hi, zawhthawh huailo hi, simmawh huailo hi. Ei hat, hau i kisak, hat i kisak hang kiphatsak huailo hi. Thadah huailo hi. I hatloh hang i hih zawh tantan tawh hanciam ding ahi hi. Note: Bilpi danin hat aa manlang takin gamta zoin sumkuang danin citak kulhkal sa aa hanciam lehang hoihsemsem lai ding hi.

## Seng Tawh Tui Tawi
**Theme:** Hanciamna, Kuhkalna, Lungkiatlohna

Hanciamna cih pen a mawkna suak tuanlo hi. Lai Siangtho zongh sim in i telzawhloh hang sim teitei lehang, i lungsim, i ngaihsutnate hong siangtho sak tuam ding hi.

## Kha an, Lai Siangtho
**Theme:** Kha an le taksa an

A nungta mihing khatciat in nisim aa i khamkhop ding an, i tha om nading an, i pumpi hoih nading an i kisap mah bangin i nungta i kha ading zongh kha an kisam den hi. A sisate bek kisamlo hi.

## Singphuukpa le Hei Hiamlo
**Theme:** Kiginna

A tung lamin i lawm i gual leh midangte tawh kidanna a om kholloh hang' hun ong sawtsawt ciang, a na hanciamzaw, a na kigingzawte mah tha liau in mazangzaw uh hi.

## Singphuukpa le Hei Hiam
**Theme:** Masak huaite masak theihna

Masak huaite masakna in ma hong zang sak hi. Hong gualzo sak hi. A thupi, a kisamlopi tawh hun beiloin a kulte a thupite hun piak masak, kin masak, buaipih masak ding hoih hi.

## Suangtang Vom le Kang
**Theme:** Ngaihsut Siamna

Haksatna khatpeuh deihlo in i pelh sawm hang kituak khakik thei lai veve ding ahih manin tua haksatna mah ngaihsut hoih tawh phul tentan lehang hamphatna omzaw thei hi.

## Zawhngeu le Zusa
**Theme:** A thu a la

Zusa mat nading zawhngeu pen a vom hi aa, a kang ahi zongin phamawhlo hi. A thupi ah zusa a mat ding hi. Deih le sap, ngimna le tupnate ngah nadingin lampi khat bek citeeltaallo aa a tangtun nading lampi tuamtuam zon theih ding kisam hi.

## Sum le Hun
**Theme:** Hun Manphatna

Tua mah bangin thu nengno khat tawh i lungsim nopmawhna hangin i neih lai hun tampite nawngkai sak, mawk bei sak, suplawh khakloh ding thupi hi.

## Tukpeng Kimawlna le Tai Kidemna
**Theme:** Hun Manphatna

Hun cih pen second khat na ngawn a gualzo ta dingin manpha aa, hauh ding, minthan ding zongh second khat in thukhen thei hi.

## Tuuno le Keivom
**Theme:** Lungsim Limlangh

Hong daisak nuam, mawh ong zongte in, bangbang ihi zongin paulap tuamtuam nei nuam teitei uh hi. I mawhna hong muhkei leh i u i nau khatpeuh ii mawhna tawh zongh hong ko nuam, hong gensia nuam, hong mawhsak nuam lai veve ding uh hi.

## Sakol Nei Nupa Khat
**Theme:** Lungsim limlangh

Hong gensia dingte in bangbang i sem i bawl zong, hong gensia veve ding uh hi. Mawhna hong zong nuamte in bangbang ihi zong, hong mawhsak nuam teitei ding uh hi. Mite ii gensiatna hangin i ngaihsutna, i gamtatzia na khelkhel leh ei mah kigim in kisuplawhzaw ding hi.

## Tangvalpa le A Ngaihsutna
**Theme:** Kingaihsutna

Mite bangbang a pau zongin a hoih lamin la theipeuh lehang ei adingin thahatna, lawpna piang thei veve hi. Khatveivei ciang mite' thugen zakei lehang a hoih zawk hun om hi.

## Hehna le Siktukilh
**Theme:** Lungsim Kikepna

Heh laitak, lungkimloh, sinso, lungkham laitak aa paukhiat khak thu khat pen, dokkik aa i thuumkik, i kisikkik phial zongin a thuak khate ii lungtang tung ah a ma na om lai veve hi. Tua ahih manin, hehsuak laitak zongh mite tung ah pau khakloh ding kidop zawh huai mahmah hi.

## Dahpa
**Theme:** Kizahtakna, Kithupit Simna

Mun sang ah i tung phial zong mi khatpeuh pen neu tah, bangmah hikei tah, a niampen ah om tah ci aa simmawh diloin thupit bawl theih ding, lungkim sak zawh ding kisam hi.

## Humpi le Zusa
**Theme:** A kicing kuamah omlo, a hatlo a neilo a siamlote in zongh kimanna nei

I gualzawh laitak mi dangte simmawh pah ding hilo hi. A thanemte in zongh amau mun ciat ah kimanna na kinei kim tek uh hi.

## U Hoih
**Theme:** Piakkhiatna

Van hoih, na manpha a nei khempeuh ki-eng khin tuanlo aa, a piakhia zote hampha kisazaw hi.

## Thangho le Liando
**Theme:** Itna

Neih val, lamh val hilo, itna omna ah hop ding, huh ding, piak ding om veve hi.

## Vaphual
**Theme:** Itna, Cihtakna

Vaphual (ganhing) nangawn in itna, thumaanna le cihtakna thupi sak thei hi.

## Nihvei Thuak
**Theme:** Cihtaklohna, Kaingawi Lungim

Sa lah salo, vot lah votloin kaingawi lungsim pen a thuak vanglak ciang lim thuak mahmah thei hi. Dinmun kician, letkip thugil neih ding hong mu sak hi.

## Mittawnu le Tangvalpa
**Theme:** Lungsim Limlangh

Mihing tampite ii lungsim pen nop sak hun ciang kikhel thei hi.

## Nupa Kiho
**Theme:** Lungsim Limlangh

Khatveivei ciang ei ii kisapna pen mi dangte kimawh thei, kihawmthawh thei hi. Pasian a omlo, i thungetna a zalo, i thungetna hong dawnlo kisa kha thei aa, ama hong dawnna en a zalo zongh na hizaw thei hi.

## Tuikia Khat
**Theme:** Thungetna

Pasian in pen lampi tuamtuam pan hong hopih, i thungetnate hong dawng hi. Thungen thei bek hiloin Pasian ii aw a za thei, hong hopihna, hong dawnnate a phawk thei i hih ding zongh kisam hi.

## Sa le Be
**Theme:** Cihtakna

Mihing tampite pen amau hoihlohna kiphawklo in mite tung heh thei uh hi. I hihna bangin kithuakkik thei hi.

## Pawisiimte le Zu
**Theme:** Cihtakna

Pawisim mi khat ciat in kei ii tui thawl khat leltak tawh beelpi khat sung aa zu, peng zo tuam samken teh cih ngaihsun tek uh a hihman hi. Na khatpeuh sep ding, bawl ding geelna ah a dangte hong kiging lel unteh, amau hong thei, hong sem lel unteh cih lungsim pen a tung aa tui puate tawh kibang hi. Tua dang lungsim pua, ngaihsutna nei vive kipawl kha, na semkhawm kha lai leh bangmah suaklo ding cihna hi.

## Zawhngeu Long
**Theme:** Sepkhiatna

Na hoih sep ding kithei tek aa, thu hoih kigeel thei tek sam napi, a sem taktak ding, a sem nuam taktak ding, a sem ngam taktak ding, a sem thei taktak ding mi haksa hi.

## Humpi le Bawng
**Theme:** Lungsim Limlangh

Humpi in a duh a ngah nadingin a duhlohte tah/pia hi. Deih khat a kingah nading a dang khat tah thei hi. Hong kipia khat hangin a tamzaw kisuplawhzaw thei hi. Hong kikhek, hong kitah na khatpeuh zongh amau deihlo man na hi thei hi.

## Sahang le Kumpipa
**Theme:** Lungsim Limlangh

I deih khat hong kitah in (ahk) hong kiphatphat in i hatna, i sep theihna, i neihsate hong kidokdok sak aa suplawhna piangzaw thei hi. A beisa hun sungin bangbang ihiphial zong, sep zawhna, hih theihna bangmah a om nawnloh ciang hong kithudon nawn tuanlo thei hi.

## Sumhaupa le Ngabengte Nupa
**Theme:** Hun, Lungkimna, Nopsakna

Lungnopna, lungkimna, nopsakna tampite pen sumhauh tektek kullo hi. Sumhauh ding lunggulhna tawh hun nuam, hun manpha tampi kiphawk khaloin kisuplawh thei hi.

## Vatawt le Aneipa
**Theme:** Huaiham, duhhopna ii hoihlohna

Huaihamluatna in khialhna piang sak hi. Thu theihlohna in hai gamtatna piang sak hi. Hehpih theihlohna in supna piang sak hi.

## Pitek le Putek Nupa Khat
**Theme:** Hun, Lungkimna, Nopsakna

A tung aa nopsak theihna a tuamtuamte zat theihloh, nek zawhloh, kimawl zawh nawnloh hun ciang khualzit panpan sangin nopsak theih hun lai-in zinzawk, vakzawk, nekzawk, nopsak hun laakzawk ding hi. Nop sak theih hun lai-in nopsakna pen sum tawh kileikik theilo hi. Na khempeuh sum bekbek na hikhin tuanlo aa thahat laitak, sum tawh a kilei theilo khangno hun sung ah a nuam theithei in om ding hi.

## Numei Unau Nih

---
<!-- SOURCE: wiki/literature/proverbs_and_wisdom.md -->

# Proverbs, Wisdom & Moral Sayings

A collection of proverbial wisdom (Kammalhoih) and moral maxims extracted from *Zolai Khanggui*, *Gentehna Tuamtuam*, Biblical Proverbs, and Zomi oral tradition.

## 1. Kammalhoih from Khanggui (Beautiful/Wise Words)

These maxims are collected in the *Zolai Khanggui* (AD 1899–2013) as `Kammalhoih pawlkhat` and `Ngaihsutna zatui` (Seeds of Thought):

### On Character
- `A neupen siamna nengno khat na ngawn vallo hi.` — Even the smallest skill is not worthless.
- `Thadah huailo hi. I hatloh hang i hih zawh tantan tawh hanciam ding ahi hi.` — Don't be lazy. Despite weakness, persevere with what you can do.
- `Hanciamna cih pen a mawkna suak tuanlo hi.` — Perseverance is never wasted.
- `Citak kulhkal sa aa hanciam lehang hoihsemsem lai ding hi.` — If one is disciplined and perseveres, it will keep getting better.

### On Relationships
- `Lawm le gual lung kihual.` — Friends share hearts. *(ABC Laimal)*
- `Neih val, lamh val hilo, itna omna ah hop ding, huh ding, piak ding om veve hi.` — Love isn't about wealth — it's about helping, supporting, and giving.
- `Bangbang ihi zongin hong gensia veve ding uh hi.` — No matter what you do, critics will always criticize.
- `Mite bangbang a pau zongin a hoih lamin la theipeuh lehang ei adingin thahatna, lawpna piang thei veve hi.` — If we take the good from whatever people say, strength and joy can always arise.

### On Wisdom
- `Pilna sin limtak sin.` — Study knowledge beautifully. *(ABC Laimal P)*
- `Laipilna in khantohna hi.` — Education is progress.
- `Laipilna loin minam khantoh theilo hi.` — Without literacy, a people cannot develop. *(Sinna, Rev. Dr. J.M. Ngul Khan Pau)*
- `Minam khantohna bulpi in khangthakte laipilna hi.` — The foundation of national development is the youth's education. *(Diderot, quoted in Sinna)*

### On Identity
- `Tedim pau ei ma pau.` — The Tedim language is our own language. *(ABC Laimal T)*
- `Zomite hanlung ciam khangto diam.` — May Zomi hearts grow forever. *(ABC Laimal Z)*
- `Topa in Zomi a hong piansak manin angtang ni.` — Be proud that God created us as Zomi. *(Sinna)*
- `Zomi khat adingin laipilna bang zah in i nei zongin Zolai thei kei leng, laipil lo mah i hi veve ding hi.` — No matter how much education a Zomi has, if they don't know Zolai, they are still uneducated. *(Sinna)*

---

## 2. Morals from Gentehna (A Deihnate)

Each of the 51 parables in *Gentehna Tuamtuam* concludes with a moral lesson. Here are the key universal truths:

### On Perseverance
- `I phul khak i haksatnate in sangpi i tun nadingin thakhauhna, hangsanna, hatna hong guanzaw thei ahi hi.` — The difficulties we struggle through build stamina, endurance, and strength for reaching the summit. *(Kau le A Bu)*
- `Thanuamte in thadahte a zo tawtung uh hi.` — The diligent always overcome the lazy. *(Sumkuang le Bilpi)*

### On Self-Awareness
- `I pianzia bangbangin lungkimlo a midangte pianzia banga I kibawl leh eima pianzia ngeina zong kitaanlawh thei hi.` — If we're not content with who we are and try to be like others, we may lose our own nature entirely. *(Va-ak Utong)*
- `Hanciam ngamlohna, Lungkiat baihna, Upmawh tawh nuntakna cihte in i gualzawh, i suaktat nading pan hong khaktan thei hi.` — Cowardice, defeatism, and doubt can block us from success and freedom. *(Sai le A Khihna)*

### On Humility
- `Mun sang ah i tung phial zong mi khatpeuh pen neu tah, bangmah hikei tah ci aa simmawh diloin thupit bawl theih ding, lungkim sak zawh ding kisam hi.` — Even at the top, never look down on anyone — everyone deserves respect. *(Dahpa)*
- `I gualzawh laitak mi dangte simmawh pah ding hilo hi. A thanemte in zongh amau mun ciat ah kimanna na kinei kim tek uh hi.` — When succeeding, don't despise others. Even the weak have their own strengths. *(Humpi le Zusa)*

### On Deception
- `Hong daisak nuam, mawh ong zongte in bangbang ihi zongin paulap tuamtuam nei nuam teitei uh hi.` — Those who want to oppress will always find excuses, no matter what. *(Keivom le Tuuno)*
- `Humpi in a duh a ngah nadingin a duhlohte tah/pia hi.` — The tiger gives away what it doesn't want to get what it desires. *(Humpi le Bawng)*

### On Time & Contentment
- `Hun cih pen second khat na ngawn a gualzo ta dingin manpha hi.` — Time is so valuable that even one second can determine victory. *(Tukpeng Kimawlna)*
- `Nop sak theih hun lai-in nopsakna pen sum tawh kileikik theilo hi.` — The joy of youth cannot be bought back with money. *(Pitek le Putek)*

---

## 3. Biblical Proverbs (Paunak)

Key proverbial patterns from the ZVS translation of Proverbs:

### Structural Pattern
Most Zolai proverbs follow the **antithetic parallelism** pattern:
```
[Positive statement] + aa/ahi zongin + [contrasting negative]
```

### Selected Proverbs
- `Paunakte le thugentehna hoihtakin thei aa mipilte kampau le a thugente uh a theih nading ahi hi.` — Understanding proverbs, parables, the words of the wise and their riddles. *(Proverbs 1:6)*
- `Pilna, hauhna, zaliatna, siamna cihte pen amau mun tek bek ah kimanna nei hi.` — Knowledge, wealth, authority, and skill each have value only in their proper place. *(Gentehna #2)*

---

## 4. Ciamnuih (Humorous Wisdom)

The *Zolai Khanggui* includes a `Ciamnuih` (humor) section titled `Cimphawng Zolai sin kawm` (line 304) containing playful quips and jokes in Zolai, demonstrating the language's capacity for wit and wordplay.

---
*Reference: Zolai Khanggui (AD 1899–2013, Kammalhoih section pp. 185–192), Gentehna Tuamtuam le A Deihnate (Pa Lian Than Tuang, 2019), Zolai Sinna Bu (Thu Masa pp. 1–5), ZVS Paunak (Proverbs).*

---
<!-- SOURCE: wiki/linguistics/tedim_pau_language_reference.md -->

# Tedim Pau (Zolai) — Language Reference
> Comprehensive linguistic reference for Tedim Zolai (Zopau)
> Sources: Wikipedia (Tedim language), Zolai_Khanggui, Zolai Sinna Bu, ZVS 2018, corpus analysis
> Last updated: 2026-04-14

---

## 1. Language Identity

| Property | Value |
|---|---|
| Name | Tedim / Zopau / Zolai / Zomi |
| ISO 639-3 | `ctd` |
| Glottolog | `tedi1235` |
| Family | Sino-Tibetan → Tibeto-Burman → Kuki-Chin → Northeastern Chin |
| Script | Latin (primary); Pau Cin Hau script (historical) |
| Word order | **SOV** (Subject-Object-Verb) |
| Negation | Follows the verb |
| Mutual intelligibility | Paite language (high), Sizang, Zo |
| Origin | Standardized from **Sukte** and **Kamhau** dialects |

---

## 2. Who Speaks Tedim Pau

### Primary Speakers (Tedim/Zopau zone)
The Tedim dialect zone covers 4 recognized sub-accents, collectively called **Zopau**:

| Sub-dialect | Area |
|---|---|
| Tedim accent | Tedim town, Chin State, Myanmar |
| Sizang accent | Sizang area, Chin State |
| Teizang accent | Teizang area |
| Zo accent | Zo/Zou areas |
| Hualngo | Hualngo clan areas |

### Geographic Distribution
- **Chin State, Myanmar** — Tedim, Tonzang, Cikha townships (heartland)
- **Sagaing Division, Myanmar** — Kalay, Tamu areas
- **Manipur, India** — Churachandpur district and surrounding areas
- **Mizoram, India** — diaspora communities
- **USA** — Tulsa, Oklahoma ("Zomi Town"); Indianapolis; Fort Wayne; other cities
- **Australia, UK, Canada** — diaspora communities

### Speaker Count
- ~340,000 cited (1990 Ethnologue) — likely 500,000+ today including diaspora
- Second-largest ethnic group in the Burmese diaspora in the USA (as of 2025)

### Related Languages (Northeastern Kuki-Chin group)
Tedim is mutually intelligible or closely related to:
- **Paite** — high mutual intelligibility
- **Sizang** — very close
- **Gangte, Simte, Vaiphei, Zou** — moderate intelligibility
- **Thadou** — more distant

---

## 3. Phonology

### Syllable Structure
`(C)V(V)(C)T` — consonant optional, vowel required, second vowel optional, final consonant optional, tone required

### Consonants

| Type | Sounds |
|---|---|
| Voiceless stops | p, t, tɕ (ch), k, ʔ (glottal) |
| Aspirated stops | pʰ, tʰ, tɕʰ, (kʰ) |
| Voiced stops | b, d, g |
| Voiceless fricatives | f, s, x (kh), h |
| Voiced fricatives | v, z |
| Nasals | m, n, ŋ (ng) |
| Approximant | l, lˀ (glottalized l) |

**Notes:**
- `/x/` (written `kh`) can be heard as aspirated `[kʰ]` in free variation
- `[j, w]` are allophones of vowels `/i̯, u̯/` within diphthongs

### Vowels

**Monophthongs (6):**
| Symbol | IPA | Example |
|---|---|---|
| a | /a/ | `ann` (food) |
| e | /ɛ/ | `mei` (fire) |
| i | /i/ | `ni` (sun/day) |
| o | /ɔ/ → realized as /oʊ/ | `hoi` (good) |
| u | /u/ | `tui` (water) |
| Long vowels | doubled: aa, ee, ii, oo, uu | `vaan` (sky) |

**Diphthongs (10):** iu, ia, ui, uia, ei, eu, ou, oi, ai, au
**Triphthongs (4):** eːi, eːu, ɔːi, aːi, aːu

**Critical rule:** `o` is always realized as `/oʊ/` (diphthong, like English "go") — NEVER as `/ɒ/` or `/oː/`

### Tone System
Tedim is a **tonal language**. The ZVS standard recognizes a 14-toneme practical system based on pitch + length:

| Category | Tones |
|---|---|
| Pitch levels | P1 (High), P2 (Mid-High), P3 (Mid-Low), P4 (Low) |
| Length | Short (S), Long (L) — long marked by double vowels |
| Tonemes | P1S, P1L, P2S, P2L, P3S, P3L, P4S, P4L + 6 contour tones |

**Minimal pair example:**
- `van` (P3S) = thing/goods
- `vaan` (P3L) = sky/heaven

**Practical tone categories (simplified):**
- High tone: voice rises (like a question) — `An kidah?`
- Mid tone: normal pitch — `Maw ka`
- Low tone: voice drops — `Lungdam`
- Falling tone: starts high, ends low — `Innkuan`

### Phonetic Restrictions (ZVS Rules)
- **No `ti` clusters** — forbidden combination
- **No `c` + {a, e, o, aw}** — `ca`, `ce`, `co`, `caw` are forbidden
- `o` is always /oʊ/ — never a pure /o/

---

## 4. Pronouns

### Personal Pronouns

| Person | Singular | Plural |
|---|---|---|
| 1st exclusive (I/we, not you) | `kei` (formal), `ka` (agreement marker) | `keite` / `eite` |
| 1st inclusive (we including you) | — | `i` (we together) |
| 2nd (you) | `nang` (formal), `na` (agreement marker) | `nangmite` |
| 3rd (he/she/it) | `amah` | `amahte` |

**Agreement markers (verb prefixes):**
- `ka` = 1st person singular/exclusive
- `na` = 2nd person singular
- `a` = 3rd person singular
- `i` = 1st person inclusive plural
- `in` = ergative agent marker (not a pronoun)

**Register note:** In informal speech, subject pronouns are commonly dropped when the agreement marker makes the person clear:
- Informal: `An ka ne hi.` (I ate food — `kei` dropped)
- Formal: `Kei in an ka ne hi.` (I ate food — explicit)

### Honorific Address
Tedim uses title prefixes rather than pronoun changes for respect:

| Title | Usage |
|---|---|
| **Pu** | Respectful address for older men / elders |
| **Pi** | Respectful address for older women / elders |
| **Pa** | Father / older male (kinship) |
| **Nu** | Mother / older female (kinship) |
| **U** | Elder sibling (gender-neutral) |
| **Nau** | Younger sibling |

**Usage pattern:** `Pu Thang` (Respected Thang), `Pi Niang` (Respected Niang)

---

## 5. Kinship Terms

| Zolai | English | Notes |
|---|---|---|
| **Pa** | Father | `Ka pa` = my father |
| **Nu** | Mother | `Ka nu` = my mother |
| **U pa** | Uncle (father's elder brother) | `u` = elder |
| **U nu** | Aunt (father's elder sister) | |
| **Nau pa** | Uncle (father's younger brother) | `nau` = younger |
| **Nau nu** | Aunt (father's younger sister) | |
| **U** | Elder sibling | gender-neutral |
| **Nau** | Younger sibling | gender-neutral |
| **Ta** | Child | `Ka ta` = my child |
| **Tapa** | Son | `ta` + `pa` (male) |
| **Tanu** | Daughter | `ta` + `nu` (female) |
| **Zi** | Wife | `Ka zi` = my wife |
| **Pasal** | Husband | |
| **Innkuan** | Family (household) | `inn` = house + `kuan` = group |
| **Beh** | Clan | extended lineage group |
| **Khanggui** | Genealogy | clan lineage record |
| **Nungzuite** | Descendants / posterity | |

---

## 6. Core Grammar Patterns

### SOV Word Order
```
Subject + Object + Verb
Ka    + tui   + dot  = I want water
(I)     (water) (want)

An    + ann   + ne   = You eat food
(you)   (food)  (eat)
```

### Tense Markers
| Marker | Tense/Aspect | Example |
|---|---|---|
| (none) | Present/habitual | `Ka pai hi.` (I go.) |
| `khin` | Past completed | `Ka pai khin hi.` (I went/have gone.) |

---
<!-- SOURCE: wiki/linguistics/zolai_sinna_2010_knowledge.md -->

# Zolai Sinna (2010) — Wiki Knowledge Entries

## Source
Zolai Sinna, ZAUS 2010. Full text: resources/zolai_sinna_2010.md

---

## Concept: Phonological Restrictions (ZVS)
**Rule:** `ti` cluster does not exist in Zolai.
**Source:** Sinna 1 — *"t le i kigawm ngeilo hi"*
**Pattern:** Any word with `ti` is a violation. Use `thi` or restructure.

## Concept: `c` Restrictions
**Rule:** `c` cannot combine with `a`, `e`, `o`, `aw`.
**Source:** Sinna 1 — *"C le a,e,o,aw te kigawm ngeilo hi"*
**Valid:** ci, tua, cih, cim, cin, cing, ciang
**Invalid:** ca, ce, co, caw, cam, cen, com, cawn

## Concept: `o` Pronunciation
**Rule:** `o` is always pronounced as `/oʊ/` (diphthong), never pure `/o/`.
**Source:** Sinna 1 — *"o pen ou bang in awsuak hi"*

## Concept: Syllable Writing (Sinna 22)
**Rule:** Compound words are written as one unit, not separated.
**Examples:** sa+khi=Sakhi, to+pa=Topa, pa+sian=Pasian, lei+tung=Leitung
**Decision:** Never write `Sa Khi` or `To Pa` — always merge syllables.

## Concept: Apostrophe (Tanglak) Usage
**Rule:** Apostrophe marks contraction only, NOT possession.
**Contraction:** `Ka nu'n hong it hi.` (nu + in → nu'n)
**NOT for possession:** `ka pu'` is a glottal stop marker, not possessive apostrophe
**Source:** Sinna 33

## Concept: Comma after `le`
**Rule:** Do NOT place comma after `le` (and).
**Wrong:** `Thangpi, Lunsen, le, Lian Pau pilpen uh hi.`
**Correct:** `Thangpi, Lunsen le Lian Pau pilpen uh hi.`
**Source:** Sinna 33, rule 2.4

## Concept: Prefix `ki-` (Reflexive/Reciprocal)
**Rule:** `ki-` prefix marks reflexive or reciprocal action. Written with hyphen when ambiguous.
**Examples:** ki-deih (love each other), ki-it (love one another), ki-mawl (play together)
**Source:** Sinna 25

## Concept: Suffix `-sak` (Causative)
**Rule:** `-sak` makes a verb causative.
**Examples:** deih-sak (cause to love/make lovable), pha-sak (make good), sam-sak (cause to call)
**Source:** Sinna 26

## Concept: Suffix `-khia` (Away/Out)
**Rule:** `-khia` indicates movement away or outward completion.
**Examples:** gen-khia (speak out), hon-khia (bring out), hawl-khia (drive out)
**Source:** Sinna 26

## Concept: Word Pairs (Kamkop)
**Pattern:** Zolai uses paired words extensively for completeness/balance.
**`le` pairs:** beh le phung, khua le tui, dam le nat, gal le sa, it le ngaih
**`a` pairs:** a neu a lian, a sia a pha, a zu a ham
**`na` pairs:** dah-na kah-na, sih-na man-na, nek-na dawn-na
**Source:** Sinna 29

## Concept: Zomi National Day
**Fact:** February 20 = Zomi National Day (Zomi Namni)
**Source:** ABC Poem — *"F - FEBRUARY 20 NI ZOMI NAMNI"*

## Concept: Cope Centennial & Zolai Origins
**History:**
- Rev. Dr. J.H. Cope arrived Tedim: November 1, 1910
- Created Roman Alphabet Zolai: 1910
- First textbook: 1913
- First hymnal: 1914
- Newspaper "Tedim Thukizakna Lai": 1919–1938
- New Testament in Tedim: 1932
**Significance:** All modern Zolai literacy derives from Cope's Roman alphabet system.
**Source:** Sinna foreword + Cope biography section

## Concept: Pu Pau Cin Hau Script
**History:** Pre-Christian Zolai script created 1888–1902 from divine visions.
**Name:** "Laipianpa" = Father of Writing
**Status:** Unicode proposal submitted 2010; used by Piantit religious followers.
**Note:** Distinct from Roman-alphabet ZVS standard used in this project.

## Pattern: Proverbs (Paunak) Structure
**Pattern:** Short, parallel structure. Often animal-based metaphors.
1. `Buipi leikei zong khua ngai` — Even the big rat misses home (loyalty to homeland)
2. `Deklam tuktum zong galsuak` — Even the slow tortoise reaches the battlefield (persistence)
3. `Hakai pahtak lung heeng` — A forgiving heart heals quickly (forgiveness)
4. `Khaikha a gui ah gah` — Fruit falls in the tree's shadow (influence of origins)
5. `Sialtat nung a sialdai kai` — Young bull follows old bull (respect for elders)

## Pattern: Similes (Tehpih Kam) Structure
**Pattern:** `X bang` = "like X". Always ends with `bang`.
- `Vot si dawn bang` — like a leech that won't release
- `Baakvat bang` — like a bat (ambiguous identity)
- `Pasan sialnek bang` — like a tiger eating a deer (predatory)

## Pattern: Song Word Inversions (Lakam)
**Pattern:** Poetic Zolai inverts syllable order or adds prefix for song register.
- sakhi → khisa (fish → khisa in song)
- vakhu → khuva
- nu → tun (mother → tun in song)
- inn → saumang (house → saumang in song)
**Use:** Only in formal song/poetry (Zola), not in everyday speech.
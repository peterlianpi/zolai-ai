# Zolai AI — 01_language_guide.md


---
## [zolai_ai_instructions.md]

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
  "Amaute pai-te hi." = They go.
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
  Amaute pai-te hi = They go
```

**With verb "in" marker (agent marker):**
```
Kei in ka bawl hi = I did it (emphatic)
Nang in na gen hi = You said it (emphatic)
Amah in a gen hi = He/she said it
Eite in i bawl hi = We did it (emphatic)
Amaute in amau bawl-te hi = They did it
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

"Pasian' tapate in mite' tanute hoih hi, ci-in mu-te hi"
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
| bualtui | pond/pool | "Bualtui gei khatah a mawl-te hi" |
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
## [zolai_grammar_cheat_sheet.md]

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

WRONG: Pasian' hong itna
RIGHT: Pasian hong itna
(No apostrophe for simple possession)
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
## [Zolai_Standard_Format.md]

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
a kigelh Zolai a sim-te ciang Zopau awsuahin suak nawnlo hi. Tua panin Zopau
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
Tua bek thamlo, Zomi khangthakte aa kipan namdangte in Zolai a sin nop-te leh
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
Gtn. Tua a te ziahziah kham manphate nei le-te cin, khuapi sung ah noteng na teng zo ding uhhi.
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

Khop/Khawm = Noteng na paikhop-te ciang kei zongh no tawh paikhawm nuam ing.

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

Lai malgawm = noun + verb, Laimal gawm = noun + verb

Laimal (noun)

Laimal tampi malgawm theilo hi ing.

Laimalgawm (noun)

Laimalgawm tampi ka malgawm theihloh om hi.

Malgawm (verb)

Lai tampi sim lehang a malgawm zongh kisiam tuam hi.

Gawm (verb)

Laimal gawm dan zongh thei khang ae.

(6) LAIMAL GAWMZIA LE ZAT NADING MUNTE

Lua

Mahmah

Giklua ahih manin kipua zokei ei.

Gik mahmah ahih manin ka deih dan lian hi.

Lua = A tamzaw ah negative deihlohna lam ah
kizangzaw hi.

Mahmah = A tamzaw ah positive deihna,
hoihsakna lam ah kizangzaw hi.

Hong

Ong

Nang hong paizaw ve.

Kei ong paizaw ning.

Hong = Thugen pen in mi dangte a bulphuhna ah
zangh hi.

Ong = Thugen pen in a mah le a mah a
kibulphuhna ah zangh hi.

Hing

Ing

Ong pai ding hing.

Ong pai ing.

Hing = Ahi ding, ahi nailote ah kizangh hi.

Ing = Ahita, ahi laitakte ah kizangh hi.

Hih pen a taktakin “hi ing”, “Pasal hi ing” ci aa
kigenna pan “hing” cih a tomin kilo hi aa picing
takin lai i gelhnate ah “hi ing” mah ci-in gelh
ciatciat lehang thupit suah semsem ding hi.

9

(LTTUANG)

Zolai STANDARD Format

Leng

Lehang

Ong pai leng aive.

Pai lehang aive.

Leng =Khat kia genna ah kizangh hi.

Lehang = Khat sangin a tamzaw genna ah kizangh
hi.

Leh

Le

Nong pai leh kimu ni ei.

Nulepa tawh nang le kei i paikhop leh mawtaw
zangh ni.

Leh = Ahi thei, ahilo theite ah kizangh hi.
(English ah “if”)

Le = khat le khat kikal gennate ah kizangh hi.

“Hong pai leh aive” cihnate ah “if” lian bel hilo
hi.

(English ah “and”)

I/Ei

Uh

Eiteng i mawtaw tawh i paikhawm dia?

Ka mawtaw tawh a paikhawm nuam-te dia? Kong
zawn uhhi. i kizawn hi.

I/Ei = Ei le ei i kigenna ah khat sangin i tamzawk
leh kizangh hi.
Note: “i”, “ei” cihte i zat naak leh khat sangin
tamzaw cih theihsa hi khin pah aa, “uh” cih
kammal tawh zatkhop kul nawnlo hi.

Uh = Mi dangte ahi zong, ei le ei ahi zong i genna
ah khat sangin a tamzawk leh kizangh hi.
Note: “I” i zat naak leh khat sangin a tamzaw
cihna hi khin pah aa “uh” cih zatbeh kul nawnlo
hi.

In

Un

Hong pai in. Amah in an a nek laitakin ka tung
uhhi.

Hong pai un. Amaute in an a nek laitakun ka tung
hi.

In = Khat bek tung ah genna

Un = Khat sangin a tamzaw tung ah genna

An a ne pen khat bek hi aa, tua laitakin a tung pen
khat sangin a tamzaw cihna hi.

An a ne pen khat sangin tamzaw aa, tua laitakin a
tung pen khat bek cihna hi.

Noun/Verb + In

In

Naupangte in an ne nuamta uhhi, an na pia in.

Tuang in an a nek laitakin puan na sawp in.

In = A sem a bawl /a hih ding khatpeuh in a gen
hun ciang “in” pen kituam gelh hi.

In = Kammal kizomin zatnate ah a mai aa laimal
tawh kimat hi.

10

(LTTUANG)

Zolai STANDARD Format

Se

Sia

Puan se phop na siam na?

Puan sia phop na siam na?

Se = Kampau ciang “se” cih bangin kiza kha thei
aa, tua bangin i gelh leh paulai hi-in, laimal dik
taktak hilo hi.

Sia = Lai-in i gelh ciang “sia” mah ci in kigelh
tektek hi. Laipau in i pau ciang zongh cih takpina
le official tawh kibangin thupit suahzaw hi.

Khaw

Khua

A 79 veina Khawdo pawipi

Na khua vuah a 80 veina Khuado pawipi lai,
khuadam mahmah hi.

Khaw = Kampau ciang “khaw” cih bangin kiza
kha thei aa, tua bangin i gelh leh paulai hi-in,
laimal dik taktak hilo hi.

Khua = Lai-in i gelh ciang “khua” mah ci in
kigelh tektek hi. Laipau in i pau ciang zongh cih
takpina le official tawh kibangin thupit suahzaw
hi.

Hia

Hiam

Na gim hia?

Na gim hiam?

Hia = Kampau ciang kilim zatzaw diak aa, tua
bangin i gelh leh paulai hi-in, laimal dik taktak
hilo hi.

Hiam = Lai-in i gelh ciang “hiam” mah ci-in gelh
tangtang huai hi. Laipau in i pau ciang zongh cih
takpina le official tawh kibangin thupit suahzaw
hi.

Dia

Diam

Nong pai dia?

Nong pai diam?

Dia = Kampau ciang kilim zatzaw diak aa, tua
bangin i gelh leh paulai hi-in, laimal dik taktak
hilo hi.

Diam = Lai-in i gelh ciang “diam” mah ci-in gelh
tangtang huai hi. Laipau in i pau ciang zongh cih
takpina le official tawh kibangin thupit suahzaw
hi.

A

Aa

A mawtaw tawh a zin aa gamlapi pai hi.

A inn aa mawtaw pen a ma aa ahih cianga a ma
thuthu hi.

A = Noun ii mai ah ahih leh laimal halin “a” mal
khat bek zat ding ahi hi.

Aa = Noun ii nung ah ahih leh laimal halin “aa”
mal nih zat ding ahi hi. Tua baan ah, neihsa genna
ah zongh zat ding ahi hi. Tua baan ah laigual
kizopna (half sentence) ii a nung ah zongh zat
ding hi.
Gtn. Amah tawh kong pai lai aa a mawtaw kisa hi.

11

(LTTUANG)

Zolai STANDARD Format

I

ii

I mawtaw hoih hi.

I mawtaw ii a mei tanglua hi. i vengte ii mawtaw
mei tawh kibang.

I = “I” mal khat bek pen Noun ii mai ah kilim zat
diak hi.

ii = “ii” mal nih pen Noun ii nung ah kilim zat
diak hi.

Hihteng pen laimal gawmzia lakna hi aa, laimalte pen bang thute ah kimatsakding, bang
thute ah kihalsakding cih, a kimatna thu, a kihalna thu, a hang i telkhit ciangin hih sung ah a
kilaklo laimal khat peuhpeuh zongh dik takin kimalgawm thei ding hi.

(7) KHAT BEK LE A TAMZAW

Khat bek

Khat sang’ a tamzaw

-

Uh

A pai *hi.

A pai uhhi.

In

Un

Hong pai in.

Hong pai un.

(Mi dang khat tung genna.)

(Mi dangte tung genna.)

Ing

Ung

Ong pai ing.

Ong pai ung.

(Amah le amah a kigenna)

(Amau le amau a kigenna)

Ka

I

Ka pai hi.

I pai hi.
Note: “I” i zat naak leh khat sangin a tamzaw
cihna hi khin pah aa “uh” cih zatbeh kul nawnlo
hi.

12

(LTTUANG)

Zolai STANDARD Format

Leng/Le ing

Lehang/Le ung

Pai leng hoih ding hi.

Pai lehang hoih ding hi.

A pai hi le ing maw, hoih mah diven.

A pai hi le ung maw, hoih mah diven.

Ning

Ni

Pai ning.

Pai ni.

(Amah le amah a kigenna)

(Amau le amau a kigenna)

Oo/Ve

Vo/Vua

Pai oo. Pai ve.

Pai vo. Pai vua, pai un. Pai ve vua.

(8) GENNA LE DOTNA

Genna

Dotna?

Ding/Di

Dia?

Na sem ding hi.

Na sem dia?

Hi

Hiam?

Na sem hi.

Na sem hiam?

In

Na?

Na sem in.

Na sem na?

13

(LTTUANG)

Zolai STANDARD Format

(9) SAWLNA LE KAMKHUMNA

Sawlna

Kamkhum suahzawk diakna

In

Ve

Na gen in.

Na gen ve.

Oo

Sak Oo, Sak ve, Sak vevua

Na gen oo.

Na gensak oo. Na gensak ve. Na gensak vevua.

Vo

Vua

Na gen vo.

Na gen vevua.

(10) AHIPAK SUAKSAK KAMMALTE

Dih

Pak

Hong pai dih.

Hong paipak. Hong paipak oo. Hong paipak dih.

Sai/Saisai

Zal

Hong paisai dih. Hong pai saisai dih. Hong
paipaksai dih. Hong pai pak saisai dih.

Hong paizal dih. Hong paipakzal dih. Hong
paizalzal dih.

Zial

Zual

Na sep sakzial oo. Na sep sakzialpak oo.

Na sep sakzual oo. Na sep sakzualpak dih.

14

(LTTUANG)

Zolai STANDARD Format

(11) A KILANGHSAK KAMMALTE

Dangdang, Dengdang,
Dialdual, Dualdual

Genggang, Geigai, Geelgaal,
Gega

Heihai, Heihoi, Hemham, Heha

Kelkol, Kelkai, Kiahkuah,
Keikai, Keukau, Kilkel,
Kekkok, Kiakua, Kengkang,
Kekaa

Lemlam, Lemlum, Lela,
Liakluak, Lillel, Lellul,
Lenglong, Lenglangh,
Liangluang

Melmul, Melmal, Mema,
Memmam, Meumau, Milmel

Pheiphai, Pheiphoi, Phelphal

Veivai, Veivoi, Viavua,
Velval, Vievei

Zialzual, Zipzup, Zekzawk, Zekzak

Hih bang dan a dang a kilanghsakkammal tampi om lai hi.

(12) KAMMAL LOMTE

Zopau ah kammal pawlkhat pen a lomlomin kigenkhawm tangtang se hi. Tuate pen laimal mat gaih
ding mah hoih hi.
Gtn. Innlelo, Nulepa, Ulenau, khualetui, Kiimlepaam, Zileta, Itlengaih, zawdeuh (hoihzawdeuh), cbd…

(13) KAMMAL TOMLAAKNA

Gtn. (gtn.) = Gentehna
Adt. (adt.) = Adangte
Cbd. (cbd.) = Cihbangdan
Ahk. (ahk.) = Ahihkeh
Akl. (akl.) =Aihkei leh/ Ahihkei leh
Tg. = Taang (Hih pen min mai aa kizangh ahih manin Laimal Gol zat hamtang ding hi.)
Las. = Lasa, La siam, Lasak siam (Hih pen min mai aa kizangh ahih manin Laimal Gol zat hamtang
ding hi.)
Tom laakna ah “.” dot khat koih hamtang ding kilawm hi.
“Tg.” ah dot kikoih in “Lia” ciang tomlaakna hilo ahih manin koih kullo hi.

-

15

(LTTUANG)

Zolai STANDARD Format

(14) “A” LE “KI” II LAIMAL GAWM LE HAL

A

Hal/lo Ki

Hal/lo

A + verb = A pai laitak hi.

Hal

Ki + verb = Mawtaw kineisak aa kipai
hi.

Hallo

A + noun = A mawtaw hoih mahmah hi.

Hal

Ki + noun = Ki mawtaw neisak.

Hal

(Mawtaw kineisak)
A + to be noun = A ni, A hun, A mun, A
min

Hallo

Ki + to be noun = Kipawlna, Kinialna

Hallo

A + pronoun

Hallo

Ki + pronoun = kihici, kihuaci, kihiaci

Hallo

Hallo

Ki + /preposition/ = Kisang tungsak,
Kigamla, Kinai, Kihal, Kiniamkhiat

Hallo

= Amah le amau

A + preposition = Atung, Anuai, Amai,
Agei

(15) “G” LE “NG”

G

Ng

Gai

= Nupi khat gai hi.

Ngai
uhhi.

= Nungak khat ka ngai aa tun ka kingai

Gah
= Hanciamna thaman a gah kingah hi.
Singgah tampi ne den in.

Ngah = Kong laikhak na ngah ciang hong
zasakkik oo.

Gam
aw.

= Ka gam-te hong cidam sak in, Topa

Ngam
uhhi.

Gap

= A tha hoihin a tha gap hi.

Ngap
= Ngap pha melkei ing, nasep kuan
ngapkeng.

= A sem ngam peuhpeuh nasep kipan

Gak
= Inn sung ah mi tamluain kigak hi. Na
khau hoihtak gak in.

Ngak

Gawng = Na gawng semsem cin hoih semsem
cei.

Ngawng = Na ngawng aa khi hoihlua ei.

Gawm = Gawm/gawng lawh liangin lai kasin
leh laimal gawm le numbers gawm ka siamta hi.

Ngawm =

16

= Na ngak lai pak oo.

-

(LTTUANG)

Zolai STANDARD Format

Gel/ Geel = Ei gel bel i geelnate tangtung leh
nuamlua ding hi.

Ngeel

=

-

Gep

= Na ci geplua kisil zel oo.

Ngep

=

-

Giak

= Pute’n zan ka giak hi.

Ngiak

=

-

Gial

= Puan gial silh aa ka vak ni, gial kia hi.

Ngial

=

-

Gim
= Meh gimnam lakah gim takin na
kasem hi.

Ngim
= Thau kappa in hoih takin ngim tite aa a
khatna a ngah ding a ngim a tup ahi hi.

Gol

Ngol

=

Golh = Golhguk nek hoihlo hi. Ka ci ka sa a
golh hi.

Ngolh

= Thu manglote an kingolh hi.

Gu
= Gutate guza kipia hen. Khemna pen a
gu khauh mahmah hi.

Ngu

=

-

Guh

Nguh

=

-

Nguk

=

-

= Inn gol khat ka nei hi.

= Ka guh ka taangteng nalua hi.

Guk/Guuk
guk sat hi.

= Ka van hong kiguuksak laitak nai

-

Gum

= Eite hong gum pen Topa Zeisu hi.

Ngum

= Nungak ngumngekte ka ngai hi.

Gun

= Gun ah kimu ni ei.

Ngun

= Ngun le kham ka nei hi.

Gup

= Gup hauluate kimudah hi.

Ngup

=

-

Hihte pen Zopau Tedim awsuah siksanin lakna bek hi aa “Ng” aw a zangte aa zongh
Zopau/Zolai mah bel hiveve hi.
Pawlkhatte in Tedim awsuah ngah nuamlua liangin “Ng” awsuahna khempeuh ah “G” aw
vive suaksak-te ahih manin, a khiatna tuampi khat ahihlam i phawkkhak ding deihna ahi hi.
“G” aw a suak naak leh Tedim awsuah dikpen cihna hi pahlo aa, “Ng” aw a suak khempeuh
zongh Tedim awsuah diklo cih bang hituanlo hi. Tedim awsuah ah “G” awsuah, “Ng” awsuah
a nihin kihelh hi.

17

(LTTUANG)

Zolai STANDARD Format

(16) APOSTROPHE ( ’ ) ZATNA MUN

( ’ ) pen laimal tomlaakna ah kilim zat mahmah hi. Paulai tawh i gelh ciang, pau awsuah bangin i gelh
ciang kilim zat diak hi. Laigil, lai thupite ah ahih leh laimal tomlaakna-in zatloh mah hoihzaw hi.

Gtn.
-

Kote in Sangpi ii mawtaw ka laploh manun noteng in nong nusia uhhi.
Kote’n Sangpi’ mawtaw ka laploh manun note’n nong nusia uhhi.

Neihna lakna ah zongh “ii” cih mun tangin ( ’ ) kizangh thei hi. Sangpi ii mawtaw (Sangpi’ mawtaw)
Sepna lakna ah zongh “in” cih mun tangin ( ’ ) kizangh thei hi. Kote in (Kote’n), Noteng in (Note’n)
Phonetic tuamtuam zat ding pen hoih khinlozaw hi. Banghang hiam cih leh Zolai pen theih
baih, sin baih, ciapteh baih ahih ding kisam hi. Tualoin Zolai a lunglut le a sin nuam kitawm
semsem kha ding hi. Phonetic tuamtuam a zangh minamdang tampi a om sam hang’ zangh
hetlo aa a khangto veve, a lai-te a tangzai veve minam tampi mah na om kawikawi hi.

(17) AH, UHHI, AHI HI.

= “ah” cih laimal pen tang gelh ding mah hoihzaw hi. Inntung ah, Zogam ah, Nang kiang

ah
ah

Banghang hiam cih leh “a le h” kihel laimal kigawm tampitak Zolai ah om ahih manin “ah” tawh
laimal matna in laisimna haksasak tuam thei hi.
uhhi. = A pai uhhi. Ahi uhhi. (Hih pen “h” nih kizom ci-in matloh ding hoih asa kiom thei aa,
mat lehang sim dan nopzawin laisim hong manlangzawsak tuam hi.)
ahi hi. = Amah ahi hi.

“ahi hi” ah hal ding pen hoihzaw hi. Banghang hiam cih leh, hih pen format khat hong
suak hi.

18

(LTTUANG)

Zolai STANDARD Format

Khat
kia/tung
ah

Khat sang’

Laimal behlapzia

a tamzaw tung
ah genna

genna
ahi hi.

ahi uhhi.

ahi zongin

ahih manin,

ahikei zongin

ahihloh
manin

ahi mah zongin
ahi phial mah zongin
ahi tateu zongin
ahi hiam?

ahi uhhiam?

ahi zong

ahih ciangin,

ahikei zong

ahihloh
ciangin

ahi phial zong
ahi sawmvei zong
ahi sawmvei mah zong
ahi phial sawmvei mah zong
ahi diam?

ahi uhdiam?

ahi phial diam

ahih hangin,

ahi taktak diam

ahihloh
hangin

ahi taktak mah diam
ahi takpi diam
ahi takpi mah diam
ahi dia?

ahi uhdia?

ahikei-te dia

ahih hang,
ahihloh hang

ahi na?

ahi uhna?

ahi mah hi.
ahi mah uhhi.

ahih sam
hang,
ahihloh sam
hang

ahi tam?

ahi uhtam?

ahi mawk mah tam?

ahikei tam
ahikei mawk
tam

Na hi hi.

Na hi uhhi.

ahilo, ahilopi, ahilote,
ahiloteng

ahihloh aa
na hihloh aa

Na hilo mawk hi. Na hikei
hi.
19

(LTTUANG)

Zolai STANDARD Format

Ka hi hi.

Ka hi uhhi.

Ka hikei hi. Ka hikei uhhi.

ka hihloh aa

I hi hi.

“I hi uhhi” cih
kul nawnlo hi.
“i” in khat sang’
a tamzaw ahihna
lakkhin ahih
manin “uh”
kisamthuah
nawnlo hi.

I hikei hi. I hi peuhmahkei
hi. I hi vetkei hi.

I hihloh aa,

hi uhhen.

hita hen, hita uhhen.

hi henla,

Hi mah hen, himah uhhen.

hita henla,

Note:

Hi sam hen, hi sam uhhen.

hi sam henla

“hi” mun ah

Hi beek hen, hi beek uhhen.

hi beek henla

hi hen.

I hihlohpi aa,

hi sambeek
henla

verb (sepna)
khatpeuh
kizangh thei
hi.
hi in.

I hihloh
mawkin,

hi un.

hita in, hita un.

hi inla,

hi mah in, hi mah un.

hi unla

hi sam in. hi sam un.

hi mah inla,
hi mah unla

hi beek in. hi beek un.

hi sam inla,
hi sam unla
hi beek inla,
hi beek unla
Note: “i” zatna ah, “uh” cih tawh zatkhop kullo hi. “ihi hi”, “i kizasak hi” hileh
khat sangin a tamzaw ahih lam kilangkhin hi. “ihi uhhi”, “i kizasak uhhi” cih bang
kulthuah nawnlo hi.
Tua baan ah, “i” pen “noun” tawh matloh ding hi.
Gtn. I khua ah i mawtaw tawh a pai ihi hi.

(18) MINPI LE MINNEU

Minpi pen Lawh khat ta ah hal ding hoih hi.

20

Gtn. Thang Suan Piang, Mang Za Cin Khai, Dim
Ngaih Huai

(LTTUANG)

Zolai STANDARD Format

Minneu pen minpi sung aa teng lian bek pan a
kilawh leh lawh khat ta ah hal ding hoih hi.

Gtn. Suan Piang, Cin Khai, Dim Ngaih

Minneu pen minpi sung bek pan thamlo a meizom Gtn. Piangpi, Khaitawng, Dimboih, Huaikhek
behlap a om leh a minpi sung aa tawh mat ding
hoih hi.

(19) LAIMALGAWM KHAT, KHIATNA TUAMTUAM A NEITE

Hai = Meihai, Tuihai, Haigah, Mihai
Mei = Meitang, Vaanmei, Uimei
Zang = Zahmawhvan, mazang, kizangh thei

Hih bang dan khiatna hau laimalgawm kibangte pen “double words” tawh khenluat ding
hoihlozaw hi. Banghang hiam cih leh “double words” zatna ah zongh khiatna khat sangin a
tamzaw om veve theilai hi. Tua ahih manin hih bang dan laimalte pen a laigual/a thu zui-in
kikhen thei lai veve ahih manin khenloh mah hoihzaw hi. English lai leh namdang tampite ii
laite ah zongh hih bang dan mahin laimal kibang khiatna kibanglo, laimal kibanglo khiatna
kibang cih dan tampi mah na om kawikawi hi.
Gtn. Fly (Hih mun ah laimal lian /capital tawh a kigelh leh noun ci-in na khen uhhi.)
Zolai ah tua bang lianin khen theih hi khinlo hi.

(20) KHIATNA KIBANG/KINAI, KAMMAL KIBANGLO LE A KILEHBULHPIHTE

Ahih hang

Ala!

Synonyms

Synonyms

Ahi zongin, Ahih sam hang, Ahi phial zong

Alai, Kala, Kalai, Aaa, Aaa Zen, Aaa guai

Antonyms

Antonyms

Tua ahih manin, Tua ahih man aa, Tua ahih
ciangin, Tua ahih cianga, Tua hangin, Tua hang aa

Immm, Hmmm, Innn, Hnnn

21

(LTTUANG)

Zolai STANDARD Format

Bang ae

Ciah

Synonyms

Synonyms

Ai ze, Aici ze, Bangci ae

Kal, Cia
Antonyms
Pai, Pei

Citak

Denciang

Synonyms

Synonyms

Kuhkal, Hanciam, Hahkat
Antonyms

Zoteh, Zociang, Danciang, Anciang, Denteh,
Dentakteh

Zulh, Zulhtat, Thadah

Antonyms
Tun, Tulaitak, Tumahmah

Dik

Gen

Synonyms

Synonyms

Thudik, Thunem, Thunuam, Thukhual, Lungduai,
Lungsau, Picing, Cingh, Gi (Migi)

Soi, Ngen, Son

Antonyms

Dai, Paulo, Hamlo, Genlo, Ngenlo, Sonlo, Soilo

Antonyms

Gilo (Diklo), Sintom, Lungtom, Ngongtat,
Lauhuai, Gamhtat
Hehpihna

Hivak

Synonyms

Synonyms

Hehsuahna, Hehsuakna

Hi-inteh, Hivaa, Hitaw, Himahvak, Himavaa,
Himataw, Himahinteh

Laigelh

Mahmah

Synonyms

Synonyms

Lai-at, laikui, laisuai, laikhen

Mamah, Cip, Lua, Lei, naak

(A hunzui-in kammal zat kikhel aa a mun leh a
thuzui-in kizangh kawikawi hi.)
Gtn. Computer khen, laigelh, lai-atpipa, cbd.

22

(LTTUANG)

Zolai STANDARD Format

Mangpha

Mate

Synonyms

Synonyms

Mangfa

Mataw, I zaw, Nacina, Nacihia

Antonyms
Mangsia

Mehthuk

Mengmeng

Synonyms

Synonyms

Methua, Fazan, Piadi, Bokboon

Memeng, Vaseuh, Kinawh, Manlang, Saisai, Kin

Antonyms

Antonyms

Mehkha

Ziakai, Damdam, Duakduak, Daldal

Hih bang dan a dang tampi om lai kha ding hi. Kammalte a kibatlohhang avekin Zopau/Zolai vive
mah ahi hi.

23

(LTTUANG)

Zolai STANDARD Format

Ngai

Siang

Synonyms

Synonyms

It, Hoihsa, Deih, Paakta, Zahtak, Ngaihbangsa

Sieng, Thiang

Antonyms

Antonyms

Hua, Siasa (Hoihsalo), Mudah, Deihlo, Paaktaklo,
Zahtaklo, Ngailo, Ngaihbangsalo, Ensan

Nin

Tu

Tua

Synonyms

Synonyms

Khung, To

Tu, Zia

Antonym

Antonyms

Ding

Hih

Tua bek thamlo

Tua ahih manin

Synonyms

Synonyms

Tua baanah, Tua zomah

Tua ahih man aa, Tua ahih ciangin, Tua ahih
cianga, Tua hangin, Tua hang aa
Antonyms
Ahih hang, Ahi zongin, Ahih sam hang, Ahi phial
zong

Uiphuk

Vau

Synonyms

Synonyms

Ukeng (Kivalaak), Ulol

Taw'ng, Phin, Do, Hehssak, Galbawl, Dembawl,
Sinso sak, Langpan, El, Elbawl
Antonyms
Pawlbawl, Kilem, Kipawl, Zawn, Kithutuak,
Kithukim

Zasan

Zopau

Synonyms

Synonyms

Kawlsing, Maza, Malta

Zoham, Zokam

Antonyms

(Ham suo, Kamtam kei oo, Pau kei oo)

Cikhum

24

(LTTUANG)

Zolai STANDARD Format

(21) DEIHNA A GEN KAMMALTE

ading

Pasian ading nong kihel nading kong zawn uhhi.
Pasian ading nong kikel nadingin kong zawn uhhi. (Mi khat tung ah
zotna)
Pasian adingin nong kikel nading kong zawn uhhi. (Hih mun ah “in”
2 a kizop dandan sangin “adingin” le “nadingin” pan khat zawzaw
pan “in” laakkhiat ding hoih hi.)

adingin

Pasian adingin nong kihel nadingun kong zawh uhhi. (Mi tam tung ah
zotna)
Pasian adingin nong kikel nading kong zawn uhhi. (Hih mun ah “in”
2 a kizop dandan sangin “adingin” le “nadingin” pan khat zawzaw
pan “in” laakkhiat ding hoih hi.)

tading, tadingin

Khuapihte ading kong gensak hi.
Khuapih tading kong gensak hi.
Khuapihte adingin kong gensak hi.
Khuapih tadingin kong gensak hi.
“tading” cih kammal pen khat sang’ a tamzawte ah kizangh hi.
“ading” cih kammal pen khat bekah kizangh hi. Ahi zongin amai ah
“te” “amau” cih bang dan khat sang’ a tamzaw kammal tawh kizom
thei hi.
Amau ading kong gensak hi.

nading

Kipawl nading kipawlna phuan zel ding maw?

nadingin

Tua ahih cianga, nong pai nadingin kong zawn phapha hi.
Tua ahih ciangin, nong pai nadingin kong zawn phapha hi. (Hih mun
ah “in” 2 a kizop dandan sangin “cianga” zat ding kilawmzaw hi.)

25

(LTTUANG)

Zolai STANDARD Format

nadingun

Tua ahih cianga, nong pai nadingun kong zawn phapha hi.

(khat sang’ a tamzaw genna)
Tua ahih ciangin, nong pai nadingun kong zawn phapha hi.
cianga

Tua ahih cianga, nong pai nading kong zawn phapha hi.

ciangin

Tua ahih ciangin, nong pai nading kong zawn phapha hi.

ciangun

Tua ahih cianga, nong pai ciangun hong zasak in.

(khat sang’ a tamzaw genna)
Tua ahih ciangin, nong pai ciangun hong zasak in.
inla

Pai inla va gen in.
“inla” pen khat ii tung ah genna hi. Laimal mat ding hi.
Thu ngai khat ii tung ah direct in genna ah kizangh hi.

unla

Pai unla va gen un.
“unla” pen khat sang’ a tamzawte tung ah genna hi. Laimal mat
ding hi.
Thu ngaite tung ah direct in genna ah kizangh hi.

Henla, uhhenla

Pai henla va gen hen.
Pa uhhenla va gen uhhen.
“henla” pen mi khat tung ah mi dang khat ii hih ding, mi dang
khat ii thu genna ah kizangh hi. Laimal mat ding hi.
“uhhenla” pen khat sang’ a tamzawte ah kizangh hi.

26

(LTTUANG)

Zolai STANDARD Format

(22) LAIMAL ZATZIA (GRAMMAR)

Kammal khenna

Gentehna

Kammal pawlkhat

(Verb) Sepna lak

Tuang in an ne hi.

Pai, Sem, Gen, Kap, cbd.

(Adverb) Sepna tellak

Tuang in an ne saisai hi.

Lua, duakduak, zialzial, cbd.

(Helping Verb) Hihna lak

Tuang pen pasal hi.

Hi, hita, ahi hi, cbd.

(Adjective) Hihna tellak

Tuang pen pasal hoih hi.

Gina, hangsan, thau, tom, cbd.

(Noun) Minna

Tuang in laibu sim hi.

Thawnpi, Mawtaw, Singkung,
cbd.

(Pronoun) Minna tang

Tuang in laibu sim hi. Tua
ama sim pen hoih mahmah
hi.

Amah, amau, ei, kei, ko, nang,
cbd.

(Plural Noun) Minnate

Laibuteng le a simte koi lam
tung-te ahia?

te, teng

( - ) Tamna lak

Laibuteng le a simte koi lam
tung-te ahia?

Ei, en, un, uh, i, ung, cbd.

Minna cih ciangin min
khatpeuh zongh hi thei, na
khatpeuh zongh hi thei cihna
hi.

I mawtaw tawh na pai un.
Eiteng in bang i hih tam?
(Conjunction) Kammal zom

Tuang in laibu sim hi. Tua
aa leh, cianga, aa, in, la, ahih
ahih manin lai thei hi. Tuang hang, ahi zong, cbd.
in laibu sim ahih manin lai
thei hi.

(Preposition) Mun lak

Mualdawn aa biakinn ah pai
ni.

tung, nuai, paam, gei, cbd.

(Time) Hun lak

Tua kipan ut nawn khang.

Tua kipan, aa kipan, nawn, ciang,
laitak, lai, lai-in, cbd.

27

(LTTUANG)

Zolai STANDARD Format

28

(LTTUANG)

Zolai STANDARD Format

(Negative) Alehlam

Umlopi genkenla, paikei ni.

lo, loh, kei, ken, keng, cbd.

(Interjection) Phawnna lak

Haa! thadah ta ei.

Oh!, Aaa!, Kalai!, Alai!,
Kamawk!, Amawk!, Azen!, Azen
aw!, Aguai!

Aguai, Tuang in sang ah lai a hanciam mahmah aa leh tua laitak amah a mute in hih pa pen
sangnaupang kician khatin ngaihsun uhhi. Ahih hang’ ken ka umkei hi.
Aguai = Phawnna lak

Tuang = Minna

sang = Minna

ah = Mun lak

lai = Minna

hanciam = Sepna lak

mahmah = Sepna tellak

aa leh = Kammal
zom

laitak = A hun lak

amah = Minna tang

mu = Sepna lak

te = Minnate

hih = Minna tang

pen = Hihna lak

sangnaupang = Minna

kician = Hihna tellak

ngaihsun = Sepna lak-te = Tamna lak

Ahih hang = Kammal
zom

ken = Minna tang

um = Sepna lak

kei = Alehlam

(23) SEPNA LAK LE MINNA SUAHNA

Sepna lakna (v)

Sepna lakna (v) pan Minna (n) suahna

Gen

Genna

Tai

Taina

29

(LTTUANG)

Zolai STANDARD Format

(24) HIHNA TELLAK LE MINNA SUAHNA

Hihna tellak (adj)
Sang

Sangzaw

Sangzawlai

Sangpen

Sang penpen

Siam

Siamzaw

Siamzawlai

Siampen

Siam penpen

Hihna tellak (adj) pan Minna (n) suahna
Sangna

Sangzawkna

Sangzawklaina

Sangpenna

Sang penpenna

Siamna

Siamzawkna

Siamzawklaina

Siampenna

Siam penpenna

(25) A HUN LAKNA

A hunma

Samlo.

Sam nailo.

Pailo.

Pai nailo.

Sam ding. Sam mah
ding.
Pai ding. Pai mah ding.

A hun
sung

Samta.
Samsamta.

Sam laitak.

Paita. Paipaita.

Pai laitak. Paipai
laitak.

Samsam laitak.

A hunkhit Samkhin lian.

Samkhin.

Samkhin tham.

Paikhin lian.

Paikhin.

Samkhin pek.

Samkhin
thamtham.

Paikhin tham.

Samkhin pekpek.

Paikhin pek.

Paikhin thamtham.
Paikhin pekpek.

30

(LTTUANG)

Zolai STANDARD Format

(26) HI LEH HOIHZAW DING HI

1. Hi thei leh van/na (noun) khat peuhpeuh pen mal khat (malgawm khat) ta in mat gai aa gelh huai
hi. Tua hi leh laimal gawm ding le hal ding cihte ngaihsutna ciaptehna nuamtuam mahmah ding
hi.
2. Lai pen standard a om nading, a luanzia, a kigelhziate format kician takin a om ding kisam hi.
3. Lai pen theih baih ding, tel baih ding, ciapteh baih ding hi leh tangzai baihzaw ding hi.
4. Lai pen minambup in a malgawm kibangkim takin zatkhop ding thupi hi.
5. Pau/kammal om khempeuh kibaan sin gaih zolo ding ahih manin, laimal gawmzia khat theih
naak aa leh pau/kammal khat peuhpeuh dik takin malgawm pah theih nading Standard Format
khat kisam ahi hi.

(27) MAILAM AH

1. Grades/Levels zui-in Zolai sinna kician takin neih zawh huai hi.
2. Zolai tawh grammar bu, poem bu, history bu, geography bu, biography bu, articles bu cih bang
dan a tuamtuam grades/levels zui in bawl zawh huai hi.
3. Thupatna ah a kigensa om mah bangin Zolai Standard Format kician takin a omkei leh
minambup ii supna lianpi khat suak kha thei hi. Minambup in a zatkhop theih nadingin zumvai
(kumpi, biakna, private) nasemte aa kipan Media te le laibu bawlte in zatkhop masak huai
mahmah hi. Laimal gawmzia hong kibat nading hih panmunteng mah a thupipen ahi hi.

Zolai in minam picing khat i hihna hong kipsak aa
namdangte in hong deep nading-te pan hong hu hi.

LUNGDAM MAHMAH HI
Pa Lian Than Tuang (LT Tuang)

31

(LTTUANG)

---
## [zolai_system_prompt.txt]

You are an expert in the Zolai (Tedim Chin) language. Your task is to perform translations and answer queries while strictly adhering to the grammar, syntax, orthography, and vocabulary constraints provided below.

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
Orthography and grammar standardization for Zolai are largely guided by key organizations:
- **ZCLS (Zomi Christian Literature Society)**: Established in 1980, it plays a massive role in standardizing Zolai literature, translating the Bible, and holding editors' conferences to refine grammar and orthography nuances.
- **ZOLLS (Zomi Language & Literature Society)**: Promotes standard grammar and parts of speech classifications.
- **ZOLUS (Zomi Literature Uplift Society)**: Further standardizes and organizes literary efforts.

**Important note on dialects**: There is **no single official Chin dialect or common language yet**. The Chin languages include multiple distinct dialects (Tedim/Zolai, Haka/Hakha, Laizo/Falam, Matu, and many more). **Haka (Hakha) is NOT the official Chin dialect** — it is one of many dialects without official status over others. Each dialect has its own legitimacy.

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
  "Amaute i pai-te hi." = They go.
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
  Amaute i pai-te hi = They go
```

**With verb "in" marker (agent marker):**
```
Kei in ka bawl hi = I did it (emphatic)
Nang in na gen hi = You said it (emphatic)
Amah in a gen hi = He/she said it
Eite in i bawl hi = We did it (emphatic)
Amaute in amau bawl-te hi = They did it
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

"Pasian' tapate in mite' tanute hoih hi, ci-in mu-te hi"
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
| bualtui | pond/pool | "Bualtui gei khatah a mawl-te hi" |
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


==================================================

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

WRONG: Pasian' hong itna
RIGHT: Pasian hong itna
(No apostrophe for simple possession)
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


==================================================

# Zolai Everyday Vocabulary
## Categorized Common Words (English to Zolai)

Extracted from dictionary resources (Tongdot), educational materials (Zolai Simbu), and Bible translation frequency.

### Family
| English | Zolai | Literal English (Back-translation) |
|---------|-------|------------------------------------|
| family | innkuan | household / family |
| father | pa | father |
| mother | nu | mother |
| son | tapa | male child / son |
| daughter | tanu | female child / daughter |
| brother | sanggampa / u (older) / nau (younger) | sibling / older / younger |
| sister | sanggamnu / u (older) / nau (younger) | female sibling / older / younger |
| uncle | pa / pu | father / grandfather |
| aunt | ni / pi | aunt / grandmother |
| grandfather | pu | grandfather |
| grandmother | pi | grandmother |
| child | naupang | child |
| children | naupangte | children |
| baby | naungek | infant / newborn |
| husband | pasal / papi | man / old man |
| wife | zi / nupi | wife / older woman |

### Body Parts
| English | Zolai | Literal English (Back-translation) |
|---------|-------|------------------------------------|
| head | lu | head |
| hair | sam | hair |
| eye | mit | eye |
| ear | bil | ear |
| nose | nak | nose |
| mouth | kam | mouth |
| tooth | ha | tooth |
| tongue | lei | tongue |
| face | mai / mual | face / front |
| neck | ngawng | neck |
| shoulder | liang | shoulder |
| arm/hand | khut | hand / arm |
| finger | khutme | finger |
| chest | awm | chest |
| heart | lungtang | heart |
| stomach | gil | stomach / belly |
| leg/foot | khe | leg / foot |
| bone | guh | bone |
| blood | si / sii | blood |
| skin | vun | skin |

### Animals
| English | Zolai | Literal English (Back-translation) |
|---------|-------|------------------------------------|
| animal | gamsa | wild animal |
| dog | ui | dog |
| cat | zawhngeu / ngau | cat |
| cow | bawng | cow |
| pig | vok | pig |
| horse | sakhi / sakol | deer / horse |
| goat | kel | goat |
| sheep | tuu | sheep |
| chicken | ak | chicken |
| bird | vasa | bird |
| fish | ngasa | fish |
| snake | gul | snake |
| mouse/rat | zusa | rat / mouse |
| tiger | keng / saham / sahang | leopard / big animal / tiger |
| bear | keivom | black bear |
| elephant | sai | elephant |
| monkey | zawng | monkey |
| deer | sazuk | deer |
| frog | uiphuk | frog |
| ant | miksi | ant |
| spider | mampi | spider |
| fly | tho | fly |
| mosquito | thokang / kauphe / sikha | mosquito / butterfly / insect |
| bee | khuai | bee |
| butterfly | pangpalek / kauphe | butterfly |

### Nature & Environment
| English | Zolai | Literal English (Back-translation) |
|---------|-------|------------------------------------|
| sun | ni | sun / day |
| moon | kha | moon / month |
| star | aksi | star |
| sky | vantung | above the sky |
| cloud | meii | cloud |
| rain | guah | rain |
| wind | huih | wind |
| snow | vuk | snow / ice |
| water | tui | water |
| river | lui / gun | river / big river |
| sea/ocean | tuipi | big water / ocean |
| lake | li / tuili | lake / deep water |
| tree | singkung | tree plant |
| leaf | singteh | tree leaf |
| flower | pak | flower |
| fruit | gah | fruit |
| grass | lopa | grass / weed |
| mountain | mual | mountain |
| hill | mualpang | hillside |
| valley | khua / kuam | village / valley |
| stone/rock | suang | stone |
| sand | sehnel | sand |
| dirt/soil | lei | earth / soil |
| fire | mei | fire |
| light | khuavak | bright weather / light |
| dark | khuamial | dark weather / dark |
| day | sun / ni | day / sun |
| night | zan | night |

### Food & Drink
| English | Zolai | Literal English (Back-translation) |
|---------|-------|------------------------------------|
| food | an | food / rice |
| rice | buh / an | rice plant / food |
| bread | bongmoh / khamuk | bread |
| meat | sa | meat / animal |
| fish | ngasa | fish |
| egg | aktui | chicken water / egg |
| milk | nawitui | breast water / milk |
| water | tui | water |
| tea | niangtui / letpet | tea water / tea |
| salt | ci | salt |
| sugar | cikhum | sweet salt / sugar |
| oil | sithau | oil / fat |
| fruit | gah / theigah | fruit |
| vegetable | anteh / mehteh | edible leaf |
| apple | epel | apple |
| banana | nahtang / banla | banana |
| corn | vaimim / kawlbuh | corn |
| bean | dal | lentil / bean |
| potato | alu | potato |
| onion | lothangsan | red onion |
| garlic | sahtun kang | white garlic |
| chili | malta | chili |
| honey | khuaizu | bee juice / honey |
| lime | theitung / theisik | lime |
| taste | a limna / a lim | its tastiness / tasty |

### Colors
| English | Zolai | Literal English (Back-translation) |
|---------|-------|------------------------------------|
| color | rawng / rong | color |
| black | vom | black |
| white | kang | white |
| red | san | red |
| green | hing | green / alive |
| blue | ngum | blue |
| yellow | eng | yellow |
| brown | dum | brown / dark |
| gray | vut rong | ash color |

### House & Objects
| English | Zolai | Literal English (Back-translation) |
|---------|-------|------------------------------------|
| house/home | inn | house |
| door | kongkhak | door / entrance |
| window | tuka | window |
| roof | inn tung | top of house |
| wall | kawm / bang | wall |
| floor | sual / tual | floor / ground |
| room | khan | room |
| bed | lupna | sleeping place |
| chair | tutphah / tutna | sitting place |
| table | sabuai / sabawi | table |
| knife | tem | knife |
| spoon | sikkeu / kuang | spoon / bowl |
| pot | bel | pot |
| cup | hai | cup |
| plate | kuang | plate / bowl |
| clothes | puan | cloth / clothes |
| shirt | shirt puan / angki | shirt cloth / shirt |
| pants | bombi / tualpi | trousers / pants |
| shoe | khedap | footwear |
| hat | lukhu | head cover |
| money | sum | money |

### Common Verbs
| English | Zolai | Literal English (Back-translation) |
|---------|-------|------------------------------------|
| go | pai | go |
| come | hong pai | come toward here |
| eat | ne / an ne | eat / eat food |
| drink | dawn / tui dawn | drink / drink water |
| sleep | lum / ihmu | lie down / sleep |
| wake up | tho | get up |
| see | mu | see |
| hear | za | hear |
| say/speak | gen / pau | say / speak |
| read | sim | read / count |
| write | gelh | write |
| do/make | bawl / sem | do / work |
| buy | lei | buy |
| sell | zuak | sell |
| give | pia | give |
| take | la | take |
| walk | lam pai | go by foot / walk |
| run | tai | run |
| work | na sem | do work |
| want | deih | want |
| like | deih / kibang / uk / ngaina | want / same / like / love |
| know | thei | know |
| think | ngaihsun | think |
| cut | tan | cut |
| exist/be | om | be / exist |
| shake | lawk / ling | shake |
| hold/guard | kem | keep / guard |
| enter/go in | lut | enter |
| understand | tel | understand |
| fear/be afraid | lau | fear |
| return/comeback | ciah / kik | return / go back |
| be strong | hat / thahat | strong / strong |
| taste | al / thuk / khum | salty / deep / sweet |
| test | ze-et / sit | test / check |
| pound/hit | vuak / deng | hit / throw |
| continue/last | zom / sawt | join / take long time |

### UI & Technology (Commands)
| English | Zolai | Literal English (Back-translation) |
|---------|-------|------------------------------------|
| Save | Kem / Khol | Keep / Store |
| Cancel | Phiatkik / Beisak | Erase back / Make it nothing |
| Open | Hong | Open |
| Close | Khak | Close |
| Edit | Puah / Laih | Repair / Change |
| Delete | Phiat / Hiat | Erase / Delete |
| Search | Zong | Search |
| Settings | Settings / Khensatnate / Puahna | Settings / Decisions / Repairs |
| Yes | Yes / He / Hi / Ahi hi | Yes / It is |
| No | Hilo | It is not |
| OK | Aw | Okay |
| Submit / Send | Khak | Send / Post |
| Download | Download / lasuk / Suksuk | Download / take down |
| Upload | Upload / lawnto | Upload / send up |

### Time Words
| English | Zolai | Literal English (Back-translation) |
|---------|-------|------------------------------------|
| time | hun | time |
| today | tuni | this day |
| tomorrow | zingciang | tomorrow |
| yesterday | zani | yesterday |
| morning | zinglam / zingsanglam | morning time |
| evening | nitaklam | evening time |
| hour | nai | hour / time |
| minute | minit | minute |
| week | kal | week / space between |
| month | kha | month / moon |
| year | kum | year |
| now | tu-in | at this time |
| later | later / naciang | later |
| always | tawntung | forever / always |

### Pronouns
| English | Zolai | Literal English (Back-translation) |
|---------|-------|------------------------------------|
| I / me | kei | I / me |
| I (ergative) | ken | I (doing action) |
| you | nang | you |
| you (ergative) | nang' / nang in | you (doing action) |
| he / she / it | amah | he / she / it |
| he / she (ergative) | aman | he / she (doing action) |
| we | ei / eite (inclusive) / ko / kote (exclusive) | we |
| we (ergative) | eiten / koten | we (doing action) |
| they | amau / amaute | they |
| they (ergative) | amauten | they (doing action) |
| my / mine | ka | my |
| your / yours | na | your |
| his / her / its | a | his / her / its |

### Question Words
| English | Zolai | Literal English (Back-translation) |
|---------|-------|------------------------------------|
| who | kua | who |
| what | bang | what |
| where | koi-ah | where / at where |
| when | cik hun in / bang hun in | at what time |
| why | bang hang in | for what reason |
| how | bang ci / koi ci | how / like what |
| how much / how many | bang zah | how much / how many |
| which | koi pen | which one |

### Prepositions & Locations
| English | Zolai | Literal English (Back-translation) |
|---------|-------|------------------------------------|
| in / inside | sung ah | at the inside |
| on / above | tung ah | at the top |
| under / below | nuai ah | at the bottom |
| behind | nung ah | at the back |
| in front of | mai ah | at the front |
| near | kiang ah / nai ah | beside / near |
| far | gam la | far distance |
| at / to | ah | at |
| from | pan / panin | from |
| with | tawh | with |
| between | kikal ah | at the middle/between |
| about/concerning | hang hang | concerning |
| for/purpose | ding a | for |

### Conjunctions & Connectors
| English | Zolai | Literal English (Back-translation) |
|---------|-------|------------------------------------|
| and | leh | and |
| but | ahi zongin | even if it is |
| or | ahi lo leh | or else |
| because | bang hang hiam cih leh / a hang in | the reason is / because of |
| if | leh | if / and |
| so / therefore | tua ahih manin | because of that |
| although / even though | phial zongin | even though |
| while | laitak in | at the time of |
| before | ma in | before |
| after | khit ciang in / khit nung in | after finishing |

### Common Adjectives
| English | Zolai | Literal English (Back-translation) |
|---------|-------|------------------------------------|
| good | hoih | good |
| bad | sia | bad / spoiled |
| big | lian | big |
| small | neu | small |
| long | sau | long |
| short | tom | short |
| hot | sa | hot |
| cold | vot | cold |
| new | thak | new |
| old | lui | old |
| beautiful | kilawm / hoih | beautiful / good |
| happy | lungdam | happy / thankful |
| sad | dah / lungkham | sad / worried |
| fast / quick | manlang / hat | fast / strong |
| slow | nuam | slow / comfortable |
| hard / difficult | haksa | difficult |
| easy | nuam / baih | comfortable / easy |
| true / real | maan | true |
| false / fake | zuau | false / lie |

==================================================
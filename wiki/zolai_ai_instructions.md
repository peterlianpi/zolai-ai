# Zolai Language AI Instructions
## Complete Guide for Understanding, Processing, and Refining Zolai Text

---

## 1. What is Zolai?

Zolai (also known as Tedim Chin or Zopau) is a Tibeto-Burman language (specifically part of the Kuki-Chin branch, Northeastern Chin group) spoken by the Zo people (Zomi) primarily in:
- Northwestern Myanmar (Chin State, Sagaing Region, especially Tedim, Tonzang, and Kalay townships)
- Northeastern India (Manipur, Mizoram)

**Key characteristics:**
- **Word order: SOV** (Subject-Object-Verb) — ZVS standard. Object-fronting (topic prominence) is also natural in conversation, but the canonical ZVS order is SOV.
- **Ergative-Absolutive alignment**: Subjects of transitive verbs take the marker `in` (ergative), while objects and subjects of intransitive verbs take no marker (absolutive).
- **Verb Stem Alternation**: Like many Kuki-Chin languages, most verbs have two forms (Stem I / Form I and Stem II / Form II) used depending on the grammatical context (e.g., indicative vs subjunctive/negative).
- Agglutinative morphology (prefixes, suffixes, particles).
- Tonal language (14-toneme practical system per ZVS; tones are rarely written in standard orthography).
- **Vowel Length Distinction**: Standard Zomi/Tedim orthography (promoted by ZCLS, ZOLLS, and ZOLUS) distinguishes between short and long vowels (e.g., `a` vs `aa`, `e` vs `ee`, `i` vs `ii`, `o` vs `oo`, `u` vs `uu`). This distinction can change the meaning of a word.
- **`o` is always /oʊ/** — never pure /o/ or /ɒ/. (Sinna 1: *"o pen ou bang in awsuak hi"*)

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

**Word Order: SOV is the ZVS Standard**

Zolai follows **SOV** (Subject–Object–Verb) word order per the ZVS standard. Object-fronting (topic prominence) is also natural in conversation, but SOV is the canonical form.

```
SOV (Subject-Object-Verb) — ZVS STANDARD:
  Ka pa in laibu sim hi.
  (My father book read is.)
  = My father reads a book.

  Kei in laibu ka sim hi.
  = I read a book. (explicit subject + agentive in)

  Ken laibu ka sim hi.
  = I read a book. (Ken = Kei in)

Object-fronted (topic prominence — natural in conversation):
  Laibu ka sim hi.
  (Book I read is.)
  = I read a book. [object fronted for topic/emphasis]

Subject + Verb only (no object):
  Ka sim hi.
  (I read am.)
  = I read.

**CRITICAL**: `Ka laibu sim hi` is INCORRECT — `Ka` before `laibu` acts as a possessive ("My book reads"). To say "I read a book", use `Laibu ka sim hi` (object-fronted) or `Kei in laibu ka sim hi` / `Ken laibu ka sim hi` (explicit agentive subject).
```

**Real Bible examples (31,053 verses analyzed):**

```
SOV with explicit subject (most formal/clear):
  "A kipat cil-in Pasian in vantung leh leitung a piangsak hi."
  (Beginning-at God in sky and earth a created is.)
  = In the beginning God created the heaven and the earth.

Object-fronted (topic prominence):
  "Leitung in lim leh meel nei loin a awngthawlpi ahi hi."
  (Earth form and void without was it is.)
  = The earth was without form and void.

  "Khuavak Pasian in a piangsak hi."
  (Light God created is.)
  = God created light.

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

1. **Identify the core sentence structure** (SOV is ZVS standard; object-fronting is natural in conversation)
2. **Check particle usage** (tense, mood, questions)
3. **Verify possession markers** (Ka/Na/A/I/Amau)
4. **Look for compound words** that should be joined
5. **Check apostrophe contractions** for correctness
6. **Don't "fix" valid object-fronted sentences** — `Laibu ka sim hi` is correct (object-fronted for topic prominence)

### 2.3 Word Order — SOV Standard with Object-Fronting

**Valid patterns:**

| Pattern | Example | Notes |
|---------|---------|-------|
| SOV (ZVS standard) | `Ka pa in laibu sim hi` | Requires agentive `in` on subject |
| SOV with explicit I | `Kei in laibu ka sim hi` / `Ken laibu ka sim hi` | Both correct |
| Object-fronted | `Laibu ka sim hi` | Natural in conversation; object topicalized |
| S+V only | `Ka sim hi` | Very common when context is clear |
| Topic-comment | `Khuavak, Pasian in a piangsak hi` | For emphasis |

**CRITICAL**: `Ka laibu sim hi` is **INCORRECT** and not acceptable. "Ka" directly before "laibu" acts as a possessive marker ("My book").
To say "I read a book", use object-fronted (`Laibu ka sim hi`) OR use an agentive subject (`Kei in laibu ka sim hi` or `Ken laibu ka sim hi`).

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
  "Laibu ka sim hi." = I read a book. (object-fronted — correct)
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

### 6.3 Word Order Patterns (SOV Standard)

Zolai follows **SOV** (Subject–Object–Verb) per ZVS standard. Object-fronting (topic prominence) is also natural.

**SOV (ZVS standard — requires agentive `in` on transitive subject):**
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
```

**Object-fronted (topic prominence — natural in conversation):**
```
Laibu ka sim hi.
(Book I read is.)
= I read a book. [object fronted]

Khuavak Pasian in a piangsak hi.
(Light God created is.)
= God created light. [light topicalized]

An ka ne hi.
(Food I eat am.)
= I eat food. [food topicalized]
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

**CRITICAL RULE:**
"Ka laibu sim hi" is **INCORRECT** — it means "My book reads". Use `Laibu ka sim hi` (object-fronted) or `Kei in laibu ka sim hi` / `Ken laibu ka sim hi` (explicit agentive).

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

1. **Word order variations** — Object-fronting (`Laibu ka sim hi`) is natural in conversation; SOV with agentive `in` (`Kei in laibu ka sim hi`) is the ZVS standard. Both are correct. Do not "fix" either.
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
- **Natural sentence structure** (SOV is ZVS standard; object-fronting is natural in conversation — both are valid)
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
- [ ] Word order preserved (don't "fix" valid object-fronted or SOV variations)

---

## 11. Common Mistakes to Avoid

1. **Don't split joined compounds** — `pasian` is correct, not `pa sian`
2. **Don't add spaces before particles** — `uh hi` not `uhhi`
3. **Don't confuse G/NG** — `gam` (country) vs `ngam` (dare)
4. **Don't mix dialects** — Keep Tedim/Haka/Laizo separate
5. **Don't over-correct** — Preserve intentional variations
6. **Don't ignore context** — `hi` can be "this" or "is"
7. **Don't forget tone marks** — They change meaning
8. **Don't use "Ka laibu sim hi"** — It means "My book reads". Use `Laibu ka sim hi` (object-fronted) or `Kei in/Ken laibu ka sim hi` (explicit agentive).
9. **Don't use tani for daughter** — Use `tanu`
10. **Don't claim Haka is official** — No Chin dialect has official status
11. **Don't treat object-fronting as SOV** — `Laibu ka sim hi` is object-fronted (topic prominence), not a violation of SOV. SOV requires agentive `in` on the subject.
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
   - Object-fronting: `[Object] ka [verb] hi`.
   - Adding Ergativity (SOV): `Ken [Object] [verb] hi`.

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

*Last updated: 2026-04-20*


---

## APPENDIX: AI Training Research Knowledge (2026-04-18)

### What Every Zolai AI Agent Must Know About Training

**Our data position:** ~100M Zolai tokens + 105K parallel pairs + 329K Bible instruction pairs. This is strong for a low-resource language — better than 95% of similar projects.

**Training pipeline (CPT → SFT → ORPO):**
1. CPT on raw Zolai corpus (80% ZO + 20% EN)
2. SFT on diverse instruction pairs (translation + QA + grammar + generation)
3. ORPO alignment (ZVS-correct chosen vs ZVS-wrong rejected) — one pass, no separate DPO needed

**Model:** Qwen2.5-7B-Instruct (primary), Qwen2.5-3B-Instruct (fast iteration)

**Platform:** Kaggle (30h/week free, 2x T4)

**Framework:** Unsloth (2x faster, 70% less VRAM than standard HuggingFace)

**Key research findings every agent must apply:**
- Diversity of training data > raw quantity (arXiv:2408.12780)
- CPT before SFT gives +8–15 BLEU (arXiv:2410.14815)
- BLEU misleads for low-resource — use chrF + human evaluation
- ZVS dialect enforcement must happen at data level, not just model level
- 10K clean diverse pairs > 100K noisy repetitive pairs

**Data cleaning pipeline:**
1. Encoding fix (ftfy)
2. Language ID (custom fastText Zolai model)
3. Exact dedup (MD5)
4. Fuzzy dedup (MinHash LSH, threshold 0.8)
5. Heuristic filter (length, alpha ratio, repetition)
6. ZVS dialect filter (flag forbidden words)
7. Perplexity filter (KenLM trained on clean Zolai)
8. Parallel alignment check (LaBSE cosine > 0.6)

**Full research wiki:** `wiki/training/research_v2_datasets_and_cleaning.md` and `wiki/training/research_v2_models_and_platforms.md`

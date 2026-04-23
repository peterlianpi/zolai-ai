# Zolai AI — 03_negation_particles.md


---
## [negation_guide.md]

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
- `Pasian dang kei lo-te hen.` = You shall have no other gods. (Ten Commandments)
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
## [negation_corpus.md]

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
- `[TDB77]` *I have fed you with milk, and not with meat: for hitherto ye were not * → **Note in an haizan zo nai lo na hih-te ciangin sa tawh kong vaak nai ke**
- `[TDB77]` *So then neither is he that planteth any thing, neither he that wateret* → **Tua ahih ciangin a suanpa in mi phamawh ahi kei hi; tuibuakpa in mi ph**

## do not

- `[TDB77]` *For what have I to do to judge them also that are without? do not ye j* → **Bang hang hiam na cih-te leh, a pualam mite thukhenna tawh bang kikum **
- `[TDB77]` *Doth not even nature itself teach you, that, if a man have long hair, * → **Pasal in sam sau a neih leh, zumhuaina ahi ci-in leitung ngeina thu na**
- `[TDB77]` *Doth not behave itself unseemly, seeketh not her own, is not easily pr* → **a kituak loin a gamta kei hi, ama phat nading a zong kei hi, a heh bai**
- `[TDB77]` *If we say that we have fellowship with him, and walk in darkness, we l* → **“Eite in Pasian tawh i kiho thei hi,” i ci napi-in khuamial lakah i ga**

## shall not

- `[TDB77]` *Behold, I shew you a mystery; We shall not all sleep, but we shall all* → **En un, thuthuk khat kong gen ding hi. Eite khempeuh sicip ding i hi ke**
- `[TDB77]` *For I will not see you now by the way; but I trust to tarry a while wi* → **Bang hang hiam na cih-te leh, lam lai-ah kimuh ding bek ka ut kei hi. **
- `[TDB77]` *And I will dwell among the children of Israel, and will not forsake my* → **Tua ciangin na lam inn sung Israel mite lakah ka teeng ding a, keima m**
- `[TDB77]` *Notwithstanding in thy days I will not do it for David thy father's sa* → **Ahi zongin na pa David’ hangin nangma hun sungin ka hih kei ding a, na**

## cannot

- `[TDB77]` *But if they cannot contain, let them marry: for it is better to marry * → **Ahi zongin a pumpi-te a kikham zawh kei-te leh, kiteeng-te hen. A kat **
- `[TDB77]` *And the eye cannot say unto the hand, I have no need of thee: nor agai* → **Mittang in khut kiangah, “Nang kong deih kei hi,” ci thei lo hi. Tua m**
- `[TDB77]` *And turn ye not aside: for then should ye go after vain things, which * → **meetna hong pia thei lote ahi a, hong hon thei lo a mawkna nate lamah **
- `[TDB77]` *Likewise also the good works of some are manifest beforehand; and they* → **Tua mah bangin a kilang gamtatna hoih a om thei hi, a kilanglo gamtatn**

## without

- `[TDB77]` *And the sons of Nadab; Seled, and Appaim: but Seled died without child* → **Nadab’ tapate in: Seled leh Appaim ahi-te hi; Seled in ta nei loin si **
- `[TDB77]` *And the sons of Jada the brother of Shammai; Jether, and Jonathan: and* → **Tua ciangin Shammai’ sanggampa Jada’ tapate in: Jether leh Jonathan ah**
- `[TDB77]` *For what have I to do to judge them also that are without? do not ye j* → **Bang hang hiam na cih-te leh, a pualam mite thukhenna tawh bang kikum **
- `[TDB77]` *But them that are without God judgeth. Therefore put away from among y* → **A pua lamah a omte Pasian in thu a khen ding hi. Tua a gilopa note lak**

---
## [particle_index.md]

# Zolai Particle Index (Unified Reference)

Zolai (Tedim) is a particle-heavy language. Most grammatical relationships (plurality, tense, focus, direction, result) are handled by particles added after the verb or noun.

---

## 1. Sentence-Ending Markers (Mood/Type)

| Particle | Function | Example | Translation |
| :--- | :--- | :--- | :--- |
| **hi** | Declarative (Statement) | `Ka pai hi.` | I go. |
| **hiam?** | Question (Information) | `Bang hiam?` | What is it? |
| **diam?** | Soft/Future Question | `Na pai ding diam?` | Will you go? |
| **ve** | Informal/Soft Statement | `Pai ve.` | [He] is going. |
| **hang!** | Exclamation / Strong Emphasis| `Hoih hang!` | [It] is very good! |
| **hen** | Jussive ("Let it be") | `Om hen.` | Let it be. |

---

## 2. Noun-Linking Particles (Cases/Role)

| Particle | Case | Function | Example |
| :--- | :--- | :--- | :--- |
| **in** | Ergative (Subject) | Marks doer of transitive action | `Pasian in...` |
| **ah** | Locative/Allative | In, at, to | `Inn ah...` |
| **pen** | Focus / Equivalence | This is... / The one... | `Hih pen...` |
| **te** | Plural | Noun pluralizer | `Mite` (People) |
| **leh** | Conjunction (Conditional) | If | `Na pai leh...` |
| **le** | Conjunction (Linker) | And | `Nu le Pa` |

---

## 3. Verbal Modifiers (Tense/Aspect/Manner)

| Particle | Aspect | Function | Example |
| :--- | :--- | :--- | :--- |
| **ding** | Future | Will / Going to | `Pai ding hi.` |
| **khin** | Completed | Already done | `Pai khin hi.` |
| **ngei** | Experiential | Ever / Used to | `Pai ngei hi.` |
| **nuam** | Desiderative | Want to | `Pai nuam hi.` |
| **zo** | Resultative | Completed / Finished | `Pai zo hi.` |
| **mahmah** | Emphatic | Very / Truly | `Pai mahmah hi.` |
| **lua** | Excessive | Too much | `Pai lua! (Too much going!)` |

---

## 4. Directional Particles

| Particle | Direction | Function | Example |
| :--- | :--- | :--- | :--- |
| **hong** | Towards Speaker | Come / To me | `Hong pai in.` (Come here.) |
| **khia** | Outward (causative) | Take/bring out | `hong khia` = bring out toward speaker (NOT "come out") |
| **to** | Upward | Towards the top | `Kahto` (Go up) |
| **suk** | Downward | Towards the bottom | `Paisuk` (Go down) |

### Compound Movement Chains (corpus-verified)
| Chain | Meaning | Count in Bible |
|---|---|---|
| `hong pai` | come (toward speaker) | very common |
| `hong lut` | come in | common |
| `hong paikhia` | come out ✅ | 108x |
| `hong pusuak` | come out / emerge | 17x |
| `hong khia` | bring/take out toward speaker (causative) | 32x |
| `hong ciah kik` | come back home | common |
| `va pai` | go away (from speaker) | common |
| `va lut` | go in (away from speaker) | common |

> ⚠️ **Common mistake:** `hong khia` ≠ "come out". Use `hong paikhia` or `hong pusuak` for "come out".

---

## 5. Critical Compound Spacing Rules
From v11 corpus verification (ZVS Standard):
- ✅ `uh hi` (plural marker separated from copula)
- ✅ `ahi hi` (contracted `ahihi` allowed in informal but ZVS prefers separate)
- ✅ `ci hi` (quotative)
- ✅ `tua ciangin` (narrative connector)

---
*Reference: Particle Differentiations, Zolai Gelhmaan Bu, ZVS Bible 2018.*

---
## [particle_differentiations.md]

# Particle Differentiations & Verb Alternations

This document codifies the critical grammatical particles, prefixes, and alternation rules that distinguish meaning in Zolai. Sourced from *Zolai Gelhmaan Bu*, *Zolai Khanggui* (kammal zatzia section, lines 456–481), and the ZVS Bible corpus.

## 1. Personal Prefixes

### Subject Markers
| Prefix | Person | Example | Translation |
| :--- | :--- | :--- | :--- |
| **ka** | 1st singular (I) | `Ka pai hi.` | I go. |
| **na** | 2nd singular (you) | `Na pai hi.` | You go. |
| **a** | 3rd singular (he/she/it) | `A pai hi.` | He/she goes. |
| **i** | 1st plural inclusive (we all) | `I pai hi.` | We go. |
| **ko** | 1st plural exclusive (we, not you) | `Ko pai hi.` | We (excl.) go. |

### "A" Prefix Multi-Function
1. **A + verb:** 3rd person subject — `A pai hi.` (He goes.)
2. **A + noun:** 3rd person possession — `A pa` (His father.)
3. **A + preposition:** Article/position — `Atung` (On top / above.)

---

## 2. Plurality Logic (`uh` vs `i`)

From *Khanggui* (lines 458–481), the plurality system is strict:

### Rule: `uh` = 3rd person plural; `i` / `ei` = 1st person inclusive plural

| Context | Marker | Example | Translation | Note |
| :--- | :--- | :--- | :--- | :--- |
| 3rd person pl. | **uh** | `A pai-te hi.` | They go. | `uh` marks "them" (2+ people) |
| 1st person incl. | **i** | `I pai hi.` | We (all) go. | NO `uh` needed! |
| 1st person excl. | **ko** | `Ko pai hi.` | We (not you) go. | |
| Mixed reference | context | `Amaute sang ah pai-te hi.` | They went to school. | `uh` for 3rd person pl. |

### ⚠️ Critical Rule
> **NEVER combine `uh` with `i` (1st person inclusive).**
> - ✅ `I pai hi.` — We go.
> - ❌ `I pai-te hi.` — **WRONG**

### Khanggui Explanation (lines 474–481)
> `"i", "ei" I zatna mun ah, "uh" cih zat kul nawnlo hi.`
> — When using `i` or `ei`, the word `uh` is no longer needed.

> `"i" leh "ei" ciang pen, ei leh ei kigenna hi phadiak.`
> — `i` and `ei` specifically refer to "us talking to/about us."

> `"uh" ahih leh eilo midangte genna hi phadiak.`
> — `uh` specifically refers to "them" (people other than us).

---

## 3. Ergative Particle `in`

The particle `in` marks the **agent** (doer) of a transitive verb:

| Pattern | Example | Translation |
| :--- | :--- | :--- |
| Agent + **in** + Object + Verb | `Pasian in leitung a piangsak hi.` | God created the earth. |
| Pronoun + **in** | `Kei in kong gen hi.` | I (agent) say it. |
| Noun + **in** | `Topa in hong pia hi.` | The Lord gave [it]. |

### Contracted Forms
- `Amah in` → `Ama'n` (He/she + agent)
- `Kote in` → `Kote'n` (We + agent)
- `Nang in` → `Na'n` (You + agent)

---

## 4. Locative Particle `ah`

The particle `ah` marks **location, direction, or time**:

| Usage | Example | Translation |
| :--- | :--- | :--- |
| Location | `Khua ah om hi.` | [He] is in the village. |
| Direction | `Sang ah pai hi.` | [He] goes to school. |
| Time | `Tua hun ah...` | At that time... |
| Purpose | `Nek ding ah...` | For eating... |

---

## 5. Connectors: `le` vs `leh`

| Word | Meaning | Usage | Example |
| :--- | :--- | :--- | :--- |
| **le** | and (joining nouns) | Connects items in a list | `Nu le Pa` (Mother and Father) |
| **leh** | if/then/when | Conditional conjunction | `Na pai leh...` (If you go...) |
| **le** | and (continuation) | `Vantung le leitung` (Heaven and earth) |

> ⚠️ These are NOT interchangeable. `le` joins nouns; `leh` introduces conditions.

---

## 6. Quotative Particles

| Particle | Function | Example |
| :--- | :--- | :--- |
| **ci** | Say/said (direct quote closer) | `"Khuavak om hen," ci hi.` — [He] said, "Let there be light." |
| **ci-in** | Having said / saying (connective) | `Hoih hi, ci-in a mu hi.` — Seeing it, He said it was good. |
| **kici** | Be called / named | `Laipianpa na kici hi.` — He was called Laipianpa. |
| **ci aa** | Said and then... | `Tua bang ci aa paikhia hi.` — Having said so, he left. |

---

## 7. "G" vs "Ng" Distinction

A critical phonological and semantic distinction. Confusing these completely changes meaning:

| G Word | Meaning | NG Word | Meaning |
| :--- | :--- | :--- | :--- |
| **gai** | marry (female marries) | **ngai** | love/wait/long for |
| **gah** | fruit/earn | **ngah** | receive/get |
| **gam** | country/land | **ngam** | dare/brave |
| **gap** | strong/firm | **ngap** | start work |
| **gak** | sit (plural) | **ngak** | wait/midwife |
| **gawm** | join/combine | **ngawm** | (less common) |
| **gim** | tired/difficult | **ngim** | aim/faithful |
| **gol** | big/mature | **ngol** | (less common) |
| **gen** | say/speak | **ngen** | pray/request |
| **gel** | write/mark | **ngel** | certainly/surely |

---

## 8. Verb Stem Alternation (Stem I vs Stem II)

| Environment | Stem Used | Example |
| :--- | :--- | :--- |
| Affirmative main clause | **Stem I** | `Ka mu hi.` — I see. |
| Dependent/subordinate clause | **Stem II** | `A muh ciangin...` — When [he] saw... |
| Negative clause | **Stem II** | `Ka muh lo hi.` — I don't see. |
| Interrogative | **Stem II** | `Na muh hiam?` — Do you see? |
| Nominalization (+na) | **Stem II** | `Muhna` — Vision/seeing. |

---

## 9. Authoritative Spacing Fixes

| Wrong | Correct | Note |
| :--- | :--- | :--- |
| `uh hi` | `uh hi` | Plural marker + copula must be separated |
| `ahihi` | `ahi hi` | |
| `u hi` | `uh hi` | Missing 'h' |
| `nasep` | `nasep` | "Work" is a compound |
| `ci'n` | `ci hi` or `ci-in` | Context-dependent |
| `le hang` | `lehang` | "if we" is compound |

---

## 10. Demonstratives & Spatial Deictics

| Word | Meaning | Usage |
| :--- | :--- | :--- |
| **hih** | this (near speaker) | `Hih laibu` — This book |
| **tua** | that (near listener) | `Tua mipa` — That man |
| **a** | the (generic) | `A mipa` — The man |
| **koi** | which/where | `Koi ah?` — Where? |

---
*Reference: Zolai Gelhmaan Bu (Vol I), Zolai Khanggui (kammal zatzia pp. 456–481), Zolai Sinna Bu, ZVS Bible (2018), ZCLS Standards.*

---
## [biblical_sentence_patterns.md]

# Biblical Sentence Patterns — Extracted from ZVS Corpus

Patterns extracted from Genesis, Exodus, and the full ZVS 2018 parallel corpus.
These are real, attested examples — not constructed examples.

---

## 1. Creation / Existence Patterns (Genesis 1–2)

### Pattern: Pasian in [Object] [Verb] hi
God performs a transitive action. Agent + `in` + Object + Verb + `hi`.

| Zolai | English | Reference |
| :--- | :--- | :--- |
| `A kipat cil-in Pasian in vantung leh leitung a piangsak hi.` | In the beginning God created the heaven and the earth. | GEN 1:1 |
| `Pasian in khuavak hoih hi ci-in mu hi.` | God saw the light, that it was good. | GEN 1:4 |
| `Pasian in khuamial panin khuavak khenkhia hi.` | God divided the light from the darkness. | GEN 1:4 |
| `Pasian in khuavak pen Sun ci a, khuamial pen Zan ci hi.` | God called the light Day, and the darkness Night. | GEN 1:5 |
| `Pasian in van kuumpi bawl a, ...tuite khen hi.` | God made the firmament and divided the waters. | GEN 1:7 |
| `Pasian in amaute thupha pia a, ...ci hi.` | God blessed them, saying... | GEN 1:22 |
| `Pasian in ama' lim bangin mihing piangsakin...` | God created man in his own image. | GEN 1:27 |

**Key pattern notes:**
- `a piangsak hi` = created (3rd person `a` + verb `piangsak` + `hi`)
- `ci-in mu hi` = saw, saying it was (quotative `ci-in` + perception verb)
- `thupha pia` = gave blessing (compound object + verb)

---

## 2. Speech / Quotative Patterns

### Pattern: [Subject] in, "[Quote]," ci hi
Direct speech always closes with `ci hi` (said/it is said).

| Zolai | English | Reference |
| :--- | :--- | :--- |
| `Pasian in, "Khuavak om ta hen," ci hi.` | God said, "Let there be light." | GEN 1:3 |
| `Topa Pasian in mipa thu pia a, "Na ut utin...na nethei ding hi," ci hi.` | The LORD God commanded the man, saying... | GEN 2:16 |
| `Amah in, "Hiah om ing," ci hi.` | He said, "Here am I." | EXO 3:4 |
| `Moses in, "Bang hangin sawlpang kangtum lo hiam...ka va en ding," ci hi.` | Moses said, "I will turn aside and see..." | EXO 3:3 |
| `Pasian in Moses' kiangah, "KEIMAH ka hi hi," ci hi.` | God said to Moses, "I AM THAT I AM." | EXO 3:14 |

**Key pattern notes:**
- `ci hi` = said (quotative closer, always sentence-final)
- `ci-in` = saying/having said (connective, mid-sentence)
- `ci aa` = said and then (narrative connector)
- `kici` = is called/named (passive naming)

---

## 3. Temporal Sequence Patterns (Narrative)

These connectors drive narrative flow throughout Genesis and Exodus.

| Connector | Meaning | Example |
| :--- | :--- | :--- |
| `Tua ciangin` | Then / At that time | `Tua ciangin Pasian in, "Eima' lim...mihing bawl ni," ci hi.` *(GEN 1:26)* |
| `Tua ahih ciangin` | So when that was / Therefore | `Tua ahih ciangin Pasian in ama' lim bangin mihing piangsakin...` *(GEN 1:27)* |
| `Tua mah bangin` | Just like that / In that manner | `Tua mah bangin piang pah hi.` *(GEN 1:7, 1:9, 1:11)* |
| `Nitak hong bei-in, zingsang hong tung a` | Evening came and morning came | `Nitak hong bei-in, zingsang hong tung a, ni khat ni ahi hi.` *(GEN 1:5)* |
| `A kipat cil-in` | In the beginning | `A kipat cil-in Pasian in vantung leh leitung a piangsak hi.` *(GEN 1:1)* |
| `Tu-in` | Now / At this time | `Tu-in gulpi pen...ngiansiam zaw hi.` *(GEN 3:1)* |
| `Tua hun sungin` | In that time / In those days | `Tua hun sungin Kain in lei pan-a piang gah piakna Topa tungah paipih a,` *(GEN 4:3)* |
| `A zing ciangin` | In the morning / When morning came | `A zing ciangin amah a paikhiat ciangin...` *(EXO 2:13)* |

---

## 4. Causal / Reason Patterns

| Pattern | Meaning | Example |
| :--- | :--- | :--- |
| `Bang hang hiam cih leh` | Because / For the reason that | `Bang hang hiam cih leh pian'sak nasepna...tua ni-in Pasian tawlnga hi.` *(GEN 2:3)* |
| `ahih manin` | Because / Therefore | `Naudomte in Pasian zahtak ahih manin amah in amaute' tungah suan-le-khak a pia hi.` *(EXO 1:21)* |
| `a hihman(in)` | Because of that | `Tua mipa tawh a om khop ding Moses lungkim a...` *(EXO 2:21)* |
| `bang hang hiam na cih leh` | If you ask why | `Bang hang hiam na cih leh tua singgah na nek ni-in na si taktak ding hi.` *(GEN 2:17)* |

---

## 5. Conditional Patterns

| Pattern | Meaning | Example |
| :--- | :--- | :--- |
| `[Verb] leh` | If [action] | `Lim takin hih lecin, na'ng hong kisang lo ding ahi hiam?` *(GEN 4:7)* |
| `[Verb] kei leh` | If [action] not | `Amaute in hih lim nihte nangawn um loin na thu hong thudon kei leh...` *(EXO 4:9)* |
| `[Verb] ciangun` | When [action] happens | `A nek khit phetun amaute gel in khua phawk-te a...` *(GEN 3:7)* |
| `[Verb] khit ciangin` | After [action] is done | `Moses a khan' khit ciangin, ama' mipihte' kiangah pai-in...` *(EXO 2:11)* |

---

## 6. Prohibition / Negative Command Patterns

| Pattern | Example | Translation |
| :--- | :--- | :--- |
| `V + kei ding hi` | `Na ne kei ding hi.` | You shall not eat. *(GEN 2:17)* |
| `V + kei in` | `Pai kei in.` | Don't go. |
| `V + lo ding` | (Avoid — non-standard) | — |
| `V + kei a leh` | `Nong pai kei a leh...` | If you don't come... |

---

## 7. Identity / Naming Patterns

| Pattern | Example | Translation |
| :--- | :--- | :--- |
| `X pen Y ci hi` | `Pasian in khuavak pen Sun ci a, khuamial pen Zan ci hi.` | God called the light Day, the darkness Night. *(GEN 1:5)* |
| `X kici` | `Laipianpa na kici hi.` | He was called Laipianpa. |
| `X min in Y hi` | `A masa pen gun a min in Pishon hi a...` | The name of the first is Pison. *(GEN 2:11)* |
| `X min Y phuak hi` | `Adam in a zi' min pen Evua ci hi.` | Adam called his wife's name Eve. *(GEN 3:20)* |
| `KEIMAH ka hi hi` | `Pasian in Moses' kiangah, "KEIMAH ka hi hi," ci hi.` | God said, "I AM THAT I AM." *(EXO 3:14)* |

---

## 8. Blessing / Curse Patterns

| Pattern | Example | Translation |
| :--- | :--- | :--- |
| `thupha pia` | `Pasian in amaute thupha pia a...` | God blessed them. *(GEN 1:22, 1:28)* |
| `thupha pia-in siangthosak` | `Pasian in ni sagih ni thupha pia-in siangthosak hi.` | God blessed and sanctified the seventh day. *(GEN 2:3)* |
| `ciamsiatna ngah` | `...ciamsiatna na ngah zaw hi` | You are more cursed. *(GEN 3:14)* |
| `kisamsiat` | `...leitang tung panin tu-in na'ng hong kisamsiat hi.` | You are cursed from the earth. *(GEN 4:11)* |

---

## 9. Movement / Directional Patterns

| Particle | Direction | Example | Translation |
| :--- | :--- | :--- | :--- |
| `hong pai` | Come (toward speaker) | `Amah hong pai hi.` | He comes. |
| `va pai` | Go (away from speaker) | `Va pai in.` | Go (away). |
| `paikhia` | Go out | `Kain in Topa' omna panin paikhia hi.` | Cain went out from the presence of the LORD. *(GEN 4:16)* |
| `paikik` | Go back / Return | `Izipt-ah paikik in.` | Return to Egypt. *(EXO 4:19)* |
| `paipih` | Send / Bring | `Topa Pasian in mipa' kiangah tuate paipih hi.` | God brought them to the man. *(GEN 2:19)* |
| `paisuk` | Go down | `...amaute paipih dingin kong paisuk hi.` | I have come down to bring them. *(EXO 3:8)* |
| `lut` | Enter | `Inn sungah a lut hi.` | He entered the house. |
| `khia` | Come out / Exit | `Leitang panin meiilum kaaito-in...` | A mist went up from the earth. *(GEN 2:6)* |

---

## 10. Possession / Relationship Patterns

| Pattern | Example | Translation |
| :--- | :--- | :--- |
| `X' Y` (apostrophe possession) | `Topa' vantungmi` | The LORD's angel |
| `X ii Y` | `Mipa ii nung ah` | After the man |
| `X' kiangah` | `Moses' kiangah` | To Moses / Toward Moses |
| `X tawh` | `Amah tawh a om khop ding` | To dwell with him |
| `X adingin` | `Kei adingin` | For me |
| `X' tungah` | `Amaute' tungah` | To/upon them |

---

## 11. Reflexive / Reciprocal Patterns (`ki-` prefix)

| Pattern | Example | Translation |
| :--- | :--- | :--- |
| `ki + verb` | `Khuavak kikhensak` | Light was separated |
| `ki + verb + na` | `Kipawlna` | Organization / gathering |
| `ki + verb + sak` | `Siangthosak` | Made holy / sanctified |
| `ki + verb + khawm` | `Kikhawm` | Gathered together |
| `ki + verb + kik` | `Ciahkik` | Returned |

---

## 12. Intensifier / Emphasis Patterns

| Pattern | Example | Translation |
| :--- | :--- | :--- |
| `hoih mahmah` | `Pasian in a bawlsate khempeuh mu hi, en un, hoih mahmah hi.` | God saw everything, behold, it was very good. *(GEN 1:31)* |
| `nakpi takin` | `...nakpi takin khang-te hi` | They multiplied exceedingly. *(EXO 1:7)* |
| `tampi pha` | `Ci pha-in tampi pha un.` | Be fruitful and multiply. *(GEN 1:22)* |
| `tawntung` | `...tawntung a, tua ahih manin keimah in khang tawntunga phawk ding ka hi hi.` | ...forever, this is my memorial to all generations. *(EXO 3:15)* |
| `takin` | `Lim takin hih lecin...` | If you do well... *(GEN 4:7)* |
| `mah` | `Tua mah bangin piang pah hi.` | Just like that it happened. *(GEN 1:7)* |

---

*Source: ZVS 2018 Bible Parallel Corpus — Genesis chapters 1–4, Exodus chapters 1–4.*
*Extracted and verified: 2026-04-13*

---
## [bible_versions_comparison.md]

# Zolai Bible Versions — Systematic Differences

> Source: TDB77 vs Tedim2010 (ZVS Standard) — 28,756 parallel verses
> Last updated: 2026-04-17

---

## Overview

| Version | Year | Status | Notes |
|---|---|---|---|
| TDB77 | 1977 | Historical standard | Older orthography, `Zeisu`, `adingin` |
| TBR17 | ~2017 | Revision | Intermediate form |
| Tedim2010 | 2010 | **ZVS Standard** | Current standard, `Jesuh`, `dingin` |

The ZVS (Zolai Verbal Standard) is based on Tedim2010. When in doubt, use Tedim2010 forms.

---

## Systematic Word Substitutions (50+ occurrences)

| TDB77 (old) | Tedim2010 ZVS | Count | Notes |
|---|---|---|---|
| `Zeisu` | `Jesuh` | 1,309 | Jesus — ZVS uses Jesuh |
| `Khazih` | `Khrih` | — | Christ — ZVS uses Khrih |
| `adingin` | `dingin` | 1,010 | purpose marker — ZVS shortens |
| `nadingin` | `dingin` | 1,147 | purpose marker — ZVS shortens |
| `nading` | `ding` | 326 | same simplification |
| `Izipt` | `Egypt` | 268 | Egypt — ZVS uses English spelling |
| `theih` | `theihna` | 198 | nominalization more consistent in ZVS |
| `lai` | `laitakin` | 174 | "while" — ZVS more explicit |
| `cih` | `leh` | 351 | conjunction — ZVS prefers `leh` |
| `hiam` | `cih` | 226 | question/quotative shift |
| `Israelte` | `Israel-te` | 170 | hyphenation in ZVS |

---

## Key Orthographic Differences

### Punctuation
- TDB77: uses `;` between clauses → Tedim2010: uses `.`
- TDB77: `hi;` → Tedim2010: `hi.` (1,318 occurrences)

### Jesus/Christ
- TDB77: `Zeisu Khazih` → Tedim2010: `Jesuh Khrih`
- Both are correct in their respective versions
- **ZVS standard uses `Jesuh Khrih`**

### Purpose marker
- TDB77: `nadingin` / `adingin` → Tedim2010: `dingin`
- Both mean "in order to / for the purpose of"
- **ZVS standard uses `dingin`**

### "While"
- TDB77: `lai` → Tedim2010: `laitakin`
- **ZVS standard uses `laitakin`** (more explicit)

---

## What Stays the Same (Core Grammar)

These forms are identical across all 3 versions:
- `Pasian` = God (all versions — never `pasian`)
- `gam` = land/country (all versions — never `gam`)
- `topa` = Lord (all versions — never `topa`)
- `tua` = that/then (all versions — never `tua/tuan`)
- SOV word order
- `hi` = declarative marker
- `hiam` = question marker
- `kei` = negation
- `uh` = plural marker
- `ding` = future marker
- `khin` = completed aspect
- `ciangin` = when/after

---

## Practical Rule

When writing Zolai:
1. Use **Tedim2010 (ZVS)** forms: `Jesuh`, `Khrih`, `dingin`, `laitakin`
2. Both TDB77 and Tedim2010 are valid for reading/recognition
3. Never use: `pasian`, `gam`, `tapa`, `topa`, `tua/tuan` (these are other dialects, not version differences)

---
## [education_register_patterns.md]

# Education Register Patterns — Learned from Course 15 (Play-based Learning)
# Source: resources/course15_play_based_learning_zolai.md

## New Grammar Patterns

### 1. `ii` — Formal Possessive/Of (written register)
```
kimawl-bulphuh laisinna ii mellema dingpite = key elements OF play-based learning
Montessori ii Zialedan = Montessori's Method
```
- `ii` is the formal/written equivalent of `a` (3rd person possessive)
- Use `ii` in academic, formal, or written texts
- Use `a` in everyday speech

### 2. `-zia` suffix — Manner/Method
```
laihilhzia = teaching method
gamtatzia = way of doing
khuasakzia = way of living
kilamzia = methods, approaches
```

### 3. `-dan` suffix — Way/Manner (interchangeable with -zia in some contexts)
```
bangci dan = in what way (how)
koici dan = in which way
```

### 4. `bangci` / `koici` — How / Which Way
```
Bangci bangin panpih thei ding cih = how [we] can help
Koici thuakkha ding = what to do / how to handle it
Koici hih ding hiam = how should [we] do it
```

### 5. Hyphenated Reciprocal Compounds
Pattern: `ki-[verb1] ki-[verb2]` = mutual action pair
```
ki-ho ki-zop = collaborate (mutual-meet + mutual-join)
ki-tual-kup = circle time (gather + together)
ki-pawl-khop = group together
ki-kup-khop = cooperate
ki-laih in khang = learn through interaction
```

### 6. `a...uh` — 3rd Person Plural Agreement
```
sangnaupangte in amau' kimlepam ah kihelin khiatna a sehna-te tawh pilsin-te hi
= students learn through engaging their curiosity in their own environment
```
- Subject: `sangnaupangte in` (students + ergative)
- Agreement: `a...uh` wraps the verb phrase
- `uh` marks plural 3rd person

### 7. `cih` as Nominalizer / Quotative Marker
```
"lungnopna" cih kammal = the word "lungnopna"
kimawl pen thupi cih = that play is important
```
- `cih` after a clause = "that [clause]" (nominalizer)
- `cih` after a quote = quotative marker (said/called)

### 8. `-nate` Plural Suffix for Abstract Nouns
```
lunghiangnate = challenges (lung-hiang + te)
thahatnate = strengths
kilamziate = methods
```
- `-te` pluralizes nouns including abstract ones

### 9. `a muibun mahmah` — Most effective/important
```
a muibun mahmah laihilh zialedan khat = one of the most effective teaching approaches
```
- `muibun` = effective, beneficial
- `mahmah` = very/most (superlative intensifier)

### 10. `ahi hi` vs `a hi hi` — Copula
```
kimawl-bulphuh laisinna pen pilsin vaiheelzia khat hi a = play-based learning is one teaching approach
tua pen kimawl-bulphuh hilhtelziate ii bulpi gentehnate hi = those are the key frameworks
```
- `ahi hi` = it is (formal assertion)
- `a hi hi` = it is (standard)
- `hi` alone at end = copula in simple sentences

## New Compound Word Patterns

### `vai-maban` = task-centered / process-centered
- vai = task/work
- maban = center

### `bulphuh` = foundation, base
- Used in: kimawl-bulphuh (play-foundation), vai-maban bulphuh

### `khantoh` = develop, advance, grow
- khantohna = development
- khantoh nading = for development

### `panpih` = support, assist
- panpih hi = supports
- panpihna = support (noun)

### `thapiak` = provide, give (formal)
- thapia hi = provides
- More formal than `pia hi`

---
## [news_register_patterns.md]

# News Register Patterns — Learned from Translation Practice
# Date: 2026-04-15
# Source: zolai_news_20260415.md

## Key Patterns Confirmed

### 1. Quotative Reporting (`ci hi` pattern)
```
[Speaker] in: "[direct quote]," a ci hi.
```
- `a ci hi` = he/she said (3rd person)
- `ka ci hi` = I said
- `ci-in` = saying/having said (connective)

### 2. Nominalizer `-na`
Converts verb → noun:
- ngim (hope) → ngimna (hope as noun)
- gim (hurt) → gimna (danger/harm)
- bawl (make) → bawlna (ability to make / making)
- kimuhkhop (meet together) → kimuhkhopna (meeting)

### 3. Intensifiers — `semsem` vs `zawzaw` (CORRECTED)
- `semsem` = more and more (progressive increase)
  - `A lian semsem hi.` = It is becoming greater and greater.
  - `A siam semsem hi.` = It is getting more and more skilled.
- `zawzaw` = even more / comparatively bigger/more (comparative degree)
  - `A gol zawzaw hi.` = It is even bigger.
  - `Nang sangin kei hat zawzaw hi.` = I am stronger than you.
- **Do NOT use `zawzaw` for "more and more" — use `semsem`.**

### 4. Direction Compounds
Pattern: `[place/direction] lam` = toward/side of
- vaang lam = north side
- nisatna lam = south side
- zingsang lam = east side
- nitang lam = west side

### 5. Number + Noun order (SOV-consistent)
Zolai: number comes BEFORE noun
- `thaupi sawmthum` = 30 rockets (rockets thirty)
- `kilomita sawmnih` = 20 kilometers
- `mi za le sawmli` = 140 people (from Sinna text)

### 6. `nawn ding` = will again (future + repetition)
```
Kimuhkhopna nawn ding hi. = There will be talks again.
A pai nawn ding hi. = He will come again.
```

### 7. Passive-like construction with `a...hi`
Zolai has no true passive. Uses 3rd person agreement:
```
Inn tungpuan a siat hi. = The roof was damaged. (lit: it damaged the roof)
Mawtaw khat a that hi. = A vehicle was destroyed.
```

### 8. Shelter/refuge idiom
```
A buuk sungah a kikhum-te hi. = They took shelter inside.
(buuk = nest/shelter, ki-khum = gather/hide together)
```

## Corrections to Previous Translations

### `thaupi` scope
- `thaupi` = any large weapon (gun, rocket, bomb, cannon)
- `thaupi lian` = nuclear weapon (contextual — lian = great/powerful)
- NOT a fixed compound — context determines meaning

### Direction words
- `vaang` alone = north (standalone)
- `vaang lam` = northward/north side (with direction marker)
- Both forms valid; `lam` adds directional nuance

### `a dawt hi` vs `a dawt sak hi`
- `a dawt hi` = he/it threatened (intransitive feel)
- `a dawt sak hi` = caused to be threatened / made a threat (causative)
- For news: `a dawt hi` is correct for "threatened"

## Corrections Log (2026-04-15)

| `a siat hi` (damaged) | `a sia hi` | siat = total destruction; sia = damaged/broken (partial) |
| Wrong | Correct | Rule |
|---|---|---|
| `inn tungpuan` (roof) | `innkhum` / `sikkang` | inn tungpuan = cloth on top of house, not roof structure |
| `zawzaw` (more and more) | `semsem` | zawzaw = comparatively more (a gol zawzaw = even bigger); semsem = progressively more |
| `nisatna lam` (south) | `vaang lam nung` | nisatna lam not standard ZVS |
| `zingsang` = morning (in direction context) | `zingsang lam` = east | zingsang alone = morning; with lam = east direction |
| `nitang` = evening (in direction context) | `nitang lam` = west | nitang alone = evening; with lam = west direction |

---
## [writing_rules_and_homographs.md]

# Zolai Writing Rules — From Zolai Khanggui (LT Tuang, 2013)
# Source: resources/Zolai_Khanggui_AD_1899_AD_2013.md

## Critical Homograph Pairs (same spelling ≠ same meaning)

These pairs MUST be distinguished carefully in writing:

| Pair | Word 1 | Word 2 |
|---|---|---|
| zang / zangh | zang = use | zangh = appear/show |
| lang / langh | lang = appear | langh = (different meaning) |
| cing / cingh | cing = enter/tame | cingh = (different meaning) |
| zong / zongh | zong = also/follow | zongh = also (emphatic) |
| dong / dongh / dawng | dong = ask | dongh = ask (emphatic) / dawng = answer |
| zum / zumh | zum = believe/trust | zumh = rinse/wash |
| sum / sumh | sum = money | sumh = rinse |
| le / leh | le = and (simple) | leh = and/if (conditional) |
| te / teh | te = plural marker | teh = then/so |
| be / beh | be = clan/group | beh = clan (variant) |
| de / deh | de = (particle) | deh = push/collide |
| me / meh | me = (particle) | meh = animal feed/fodder |
| ne / neh | ne = eat | neh = eat (variant/context) |
| aw / awm / om | aw = oh/hey | awm = stay/exist | om = exist |
| ngawi / ngoi | ngawi = drunk | ngoi = leftover meat |
| khawi / khoi | khawi = turn | khoi = hold/keep |

## Register Distinctions

### `ii` vs `a` vs `i` (possessive)
| Form | Person | Register | Example |
|---|---|---|---|
| `a` | 3rd person | everyday | a pa = his father |
| `i` | 1st plural inclusive | everyday | i pa = our father |
| `ii` | formal "of" | written/formal | laisinna ii mellema = elements OF learning |
| `aa` | sequential connector | written | ...hi aa, ... = ...and then... |

### `aa` — Written Sequential Connector
```
A pai hi aa, a tun hi.
= He went, and then he arrived.
```
- `aa` in written register = `a...in` or `ciangin` in speech
- Do NOT use `aa` in casual speech — use `ciangin` or `khit ciangin`

### `ae` — Archaic Question Particle
```
Bang hi ae? = What is it? (literary/old)
Modern: Bang hi hiam? = What is it?
```

## Loanword Rules
- Foreign/loanword capitalization preserved: `Project`, `Computer`, `Windows`
- Do NOT apply Zolai capitalization rules to foreign words
- Write them as they appear in the source language

## Comparative Grammar

### `sangin` = than (comparative)
```
Lui sangin gun ah ngasa tamzaw hi.
= There are more fish in the lake than in the river.
```
Pattern: `[A] sangin [B] [adj]-zaw hi`

### `-zaw` = more (comparative suffix)
```
tamzaw = more (tam=much + zaw=more)
lianzaw = greater
neuzaw = smaller
thupizaw = more important
```

### `zo nawnlo` = no longer able to
```
lengkhia zo nawnlo hi = no longer able to escape
```
- `zo` = able to complete action
- `nawnlo` = no longer
- Combined: inability that has become permanent

### `a hihman in` vs `ahih manin`
Both mean "because" — both valid:
- `a hihman in` = slightly more formal/literary
- `ahih manin` = standard everyday use

## Fable Structure Pattern

Every fable in Gentehna Tuamtuam follows:
```
[Title]
A Thugil: [Theme keyword]
[Story text]
A Deihna:
[Moral lesson]
```
- `A Thugil:` = The theme/topic
- `A Deihna:` = The meaning/moral

This structure is useful for generating training data in the fable/wisdom domain.

---
## [zolai_standard_format_rules.md]

# Zolai Standard Format — Critical Rules
# Source: resources/Zolai_Standard_Format.md (LT Tuang, 2018)
# These are AUTHORITATIVE rules — use over any auto-generated assumptions

---

## 1. Particle Distinctions (CRITICAL)

### `lua` vs `mahmah`
- `lua` = too much (negative connotation): `Gik lua` = too heavy
- `mahmah` = very (positive/neutral): `Gik mahmah` = very heavy (acceptable)
- Note: `gik` = heavy (weight) — NOT painful

### `hong` vs `ong`
- `hong` = speaker refers to someone else's action toward others: `Nang hong paizaw ve`
- `ong` = speaker refers to their own action: `Kei ong paizaw ning`

### `hing` vs `ing`
- `hing` = uncertain/not yet happened: `Ong pai ding hing` (might go)
- `ing` = already true/happening: `Ong pai ing` (I am going)

### `leng` vs `lehang`
- `leng` = single condition: `Ong pai leng aive` (if [one thing] goes)
- `lehang` = multiple/general condition: `Pai lehang aive` (even if [many things] go)

### `leh` vs `le`
- `leh` = if/and (conditional): `Nong pai leh kimu ni` (if you go, we'll meet)
- `le` = and (simple connector): `Nu le pa` (mother and father)

### `i/ei` vs `uh`
- `i/ei` = we (1st person plural inclusive) — NEVER combine with `uh`
- `uh` = they/you-all (3rd or 2nd plural) — only for others
- **RULE: `I pai hi` ✅ — `I pai uhhi` ❌**

### `in` vs `un`
- `in` = singular command/statement: `Hong pai in` (you [one] come)
- `un` = plural command/statement: `Hong pai un` (you [all] come)

### `se` vs `sia`
- `se` = spoken form only (informal speech)
- `sia` = correct written form: `Puan sia phop` ✅ not `Puan se phop`

### `khaw` vs `khua`
- `khaw` = spoken form only
- `khua` = correct written form: `Na khua` ✅ not `Na khaw`

### `hia` vs `hiam`
- `hia` = spoken form only
- `hiam` = correct written form: `Na gim hiam?` ✅ not `Na gim hia?`

### `dia` vs `diam`
- `dia` = spoken form only
- `diam` = correct written form: `Nong pai diam?` ✅ not `Nong pai dia?`

### `a` vs `aa`
- `a` = before noun (possessive/agreement): `A mawtaw hoih hi`
- `aa` = after noun (sequential connector): `A mawtaw tawh a zin aa gamlapi pai hi`

### `i` vs `ii`
- `i` = before noun (our/we): `I mawtaw hoih hi`
- `ii` = after noun (of/belonging to): `I mawtaw ii a mei tanglua hi`

---

## 2. Comparative Degrees

| Degree | Suffix | Example |
|---|---|---|
| positive | (none) | hoih = good |
| comparative | `-zaw` | hoihzaw = better |
| superlative | `-pen` | hoihpen = best |
| emphatic superlative | `-penpen` | hoihpenpen = absolutely best |
| alternative comparative | `-sem` | hoihsem = better (variant) |

---

## 3. Verb Intensifiers

| Word | Meaning | Example |
|---|---|---|
| `dih` | immediately/right now | Hong pai dih = Come right now |
| `pak` | quickly/suddenly | Hong paipak = Come quickly |
| `sai/saisai` | repeatedly | Hong paisai = Keep coming |
| `zal/zalzal` | continuously | Hong paizal = Come continuously |
| `zial` | thoroughly | Na sep sakzial = Do it thoroughly |
| `zual` | completely | Na sep sakzual = Do it completely |

---

## 4. `na` — Nominalizer vs Infinitive Marker

### `+na` = Noun (nominalizer)
```
Pai + na = Paina (going/departure — noun)
Kipawl + na = Kipawlna (gathering — noun)
```

### `+nading` = Infinitive (to + verb)
```
Pai + nading = Pai nading (in order to go / to go)
```

### Key distinction:
```
Ka paina ah nong pai nading kong zawn hi.
= In my going, I am looking for you to go.
(paina = noun; pai nading = infinitive)
```

---

## 5. `lo` vs `kei` (Negation)

Both negate but differ:
- `lo` = noun/adjective negation (prefix): `Hoihlo` = not good
- `kei` = verb negation (prefix): `Paikei` = did not go

```
Hih lo hoihlo hi. = This is not good (lo as prefix on noun)
Kei bel laukei ing. = I myself am not afraid (kei as verb negator)
```

---

## 6. Abbreviations (Standard)

| Abbrev | Full form |
|---|---|
| Gtn. | Gentehna (example) |
| Adt. | Adangte (others) |
| Cbd. | Cihbangdan (etc.) |
| Ahk. | Ahihkeh (or) |
| Akl. | Ahihkei leh (or else) |
| Tg. | Taang (Mr. — before name) |
| Las. | Lasa (singer) |

---

## 7. Apostrophe Rules

Apostrophe `'` replaces:
- `in` (ergative): `Kote in` → `Kote'n`
- `ii` (possessive): `Sangpi ii mawtaw` → `Sangpi' mawtaw`

**Rule:** Only use in informal/spoken writing. Formal texts should use full forms.

---

## 8. `G` vs `Ng` Minimal Pairs (CRITICAL)

| G word | Meaning | Ng word | Meaning |
|---|---|---|---|
| gai | (verb) | ngai | miss/love |
| gah | receive/get | ngah | receive (variant) |
| gam | land/country | ngam | dare/brave |
| gap | breathe | ngap | wait quietly |
| gak | lock/guard | ngak | wait |
| gawng | neck | ngawng | yawn |
| gim | painful | ngim | aim/target |
| gol | house (round) | ngol | hold back |
| gum | embrace | ngum | yearn/miss |
| gun | lake | ngun | silver |
| gup | save/rescue | ngup | — |

**Rule:** `G` and `Ng` are both valid Tedim sounds. Do NOT replace all `Ng` with `G`.

---

## 9. Synonyms Reference (from Standard Format)

| Word | Synonyms |
|---|---|
| `ahih hang` | ahi zongin, ahih sam hang, ahi phial zong |
| `tua ahih manin` | tua ahih man aa, tua ahih ciangin, tua hangin |
| `dik` | thudik, thunem, thunuam, picing, cingh |
| `ngai` | it, hoihsa, deih, paakta, zahtak |
| `gen` | soi, ngen, son |
| `citak` | kuhkal, hanciam, hahkat |
| `mahmah` | mamah, cip, lua, lei, naak |
| `siang` | sieng, thiang |
| `vau` | taw'ng, phin, do, hehsak, galbawl |
| `zopau` | zoham, zokam |
| `uiphuk` | ukeng, ulol |

---
## [forbidden_stems_auto.md]

# Auto-Generated: Forbidden Stem I Nominalizations

This table is automatically synced from the `check_stems.py` auditor.

| Incorrect (Stem I + na) | Correct (Stem II + na) | Note |
| :--- | :--- | :--- |
| `sina` | `sihna` | *Auto-synced* |
| `neina` | `neihna` | *Auto-synced* |
| `hauna` | `hauhna` | *Auto-synced* |
| `hakna` | `hahna` | *Auto-synced* |
| `kahna` | `kahna` | *Auto-synced* |
| `thatna` | `thahna` | *Auto-synced* |
| `samna` | `sapna` | *Auto-synced* |
| `kipanna` | `kipatna` | *Auto-synced* |
| `than'na` | `than'na` | *Auto-synced* |
| `piangna` | `pian'na` | *Auto-synced* |
| `bawlna` | `bawlna` | *Auto-synced* |

---
## [advanced_syntax_extracted.md]

--- Zolai Grammar Analysis (Top 10) ---
Conditionals (leh):
- cih leh (14803)
- kei leh (8253)
- ahih leh (5687)
- uh leh (5147)
- Tom leh (4734)
- ding leh (4245)
- Zomi leh (4157)
- hi leh (2865)
- khat leh (2399)
- te leh (2130)

Negations (loh):
- theih loh (1087)
- zawh loh (538)
- nawn loh (535)
- hih loh (516)
- om loh (436)
- neih loh (433)
- ahih loh (380)
- bawl loh (294)
- khak loh (279)
- gen loh (209)

--- Zolai Grammar Analysis (Top 10) ---
Conditionals (leh):
- cih leh (14803)
- kei leh (8253)
- ahih leh (5687)
- uh leh (5147)
- Tom leh (4734)
- ding leh (4245)
- Zomi leh (4157)
- hi leh (2865)
- khat leh (2399)
- te leh (2130)

Negations (loh):
- theih loh (1087)
- zawh loh (538)
- nawn loh (535)
- hih loh (516)
- om loh (436)
- neih loh (433)
- ahih loh (380)
- bawl loh (294)
- khak loh (279)
- gen loh (209)

---
## [register_guide.md]

# Zolai Register Guide: Formal vs. Informal

Zolai (Tedim) distinguishes between formal (biblical, academic, public speech) and informal (daily conversation, colloquial) registers. Using the correct register is crucial for native-level fluency.

---

## 1. The Declarative Marker (`hi` vs `ve`)

| Register | Pattern | Example |
| :--- | :--- | :--- |
| **Formal** | `[Verb] + hi.` | `Ka pai hi.` (I go.) |
| **Informal** | `[Verb] + ve.` | `Ka pai ve.` (I'm going / I'm off.) |
| **Mixed** | `[Verb] + hi ve.` | `Ka pai hi ve.` (Softening the fact.) |

- **Rule:** Use `hi` for all formal writing, teaching, and preaching. Use `ve` in casual conversation or when softening a direct statement.

---

## 2. Plural Markers (`uh` vs `ote`)

| Register | Pattern | Example |
| :--- | :--- | :--- |
| **Formal** | `uh hi` (3rd person) | `A pai-te hi.` (They go.) |
| **Informal** | `uh ve` | `A pai-te ve.` (They're going.) |
| **Slang** | `ote` / `ote hi` | `Keite' ote...` (Us guys...) |

---

## 3. Question Markers (`hiam` vs `hia`)

| Register | Pattern | Example |
| :--- | :--- | :--- |
| **Formal** | `hiam?` | `Bang na sem hiam?` (What are you doing?) |
| **Informal** | `hia?` | `Bang na sem hia?` |
| **Soft/Future**| `diam?` | `Na pai ding diam?` (Will you go?) |

---

## 4. Personal Agreement (Kei vs Ka)

In daily conversation, pronouns like `Kei`, `Nang`, and `Amah` are frequently dropped if the agreement marker (`ka`, `na`, `a`) is present.

| Register | Full Form | Natural/Informal Form |
| :--- | :--- | :--- |
| **Formal** | `Kei ka pai hi.` | `Ka pai hi.` |
| **Informal** | `Kei ka pai ve.` | `Pai ing.` (Future/Departure) |

---

## 5. Biblical vs. Modern Secular Terms

Many terms in the TDB77/ZVS Bible have slightly different modern secular equivalents.

| Concept | Biblical/Formal (ZVS) | Modern/Daily |
| :--- | :--- | :--- |
| **Therefore** | `Tua ahih ciangin` | `Tua ahih manin` |
| **Because** | `Bang hang hiam cih leh` | `Ahih manin` |
| **God** | `Pasian` | `Pasian` (Universal) |
| **Lord** | `Topa` | `Uliante` (Officials/Bosses) |

---

## 6. Suffixes & Emphasis

| Suffix | Use Case | Register |
| :--- | :--- | :--- |
| `mahmah` | Very / Truly | Both (Formal/Informal) |
| `lua` | Too much / Excessive | Informal |
| `dih` | Just / Briefly | Informal |
| `pak` | Momentarily | Informal |

**Example:**
- Formal: `A hoih mahmah hi.` (It is very good.)
- Informal: `A hoih lua! / A hoih ve.` (It's too good! / It's good.)

---

## 7. AI Tutor Implementation
- **Beginner (A1/A2):** Teach `hi` and `hiam` exclusively to build a solid foundation.
- **Intermediate (B1/B2):** Introduce `ve` and `hia` for conversational naturalness.
- **Advanced (C1/C2):** Challenge the learner to switch between registers (e.g., "Tell this story as a formal speech" vs "Tell it to a friend").

---
## [pronoun_guide.md]

# Zolai Pronoun Guide: Personal, Possessive, and Agreement

Zolai (Tedim) uses a system of free pronouns and mandatory pronominal agreement markers (prefixes).

---

## 1. Personal Pronouns (Free Forms)

These are used for emphasis or as the subject/object of a sentence.

| Person | Singular | Plural (Exclusive) | Plural (Inclusive) |
| :--- | :--- | :--- | :--- |
| **1st (I/We)** | `Kei` | `Kote` | `Ei` / `I` |
| **2nd (You)** | `Nang` | `Noteng` | — |
| **3rd (He/She/It/They)** | `Amah` | `Amaute` | — |

---

## 2. Pronominal Agreement Markers (Prefixes)

In Zolai, every verb must be preceded by an agreement marker that matches the subject. These are **mandatory**.

| Person | Prefix | Example | Translation |
| :--- | :--- | :--- | :--- |
| **1st Sing.** | `ka` | `Ka pai hi.` | I go. |
| **2nd Sing.** | `na` | `Na pai hi.` | You go. |
| **3rd Sing.** | `a` | `A pai hi.` | He/she/it goes. |
| **1st Pl. Incl.**| `i` | `I pai hi.` | We (all) go. |
| **1st Pl. Excl.**| `ko` | `Ko pai hi.` | We (excl.) go. |

---

## 3. Possession (Genitive)

Possession is formed by adding the agreement marker before the noun, or using the free pronoun with an apostrophe.

### 3.1 Prefix Possession
- `ka pa` — my father
- `na nu` — your mother
- `a inn` — his/her house

### 3.2 Emphatic Possession (`'`)
- `Kei' pa` — MY father (emphatic)
- `Pasian' thu` — God's word
- `Amah' nasep` — His work

---

## 4. Agentive/Ergative Contractions (`'n`)

When a pronoun is the subject of a transitive verb (doing an action to an object), it often contracts with the agentive marker `in`.

- `Keimah in` → `Keima'n`
- `Amah in` → `Ama'n`
- `Kote in` → `Kote'n`
- `Noteng in` → `Noteng'n`

---

## 5. Summary Table (A1-B1 Mastery)

| Subject | Agreement | Transitive (Agent) | Possessive |
| :--- | :--- | :--- | :--- |
| **Kei** (I) | `ka` | `Keima'n` | `ka` / `Kei'` |
| **Nang** (You) | `na` | `Nang'n` | `na` / `Nang'` |
| **Amah** (He/She) | `a` | `Ama'n` | `a` / `Amah'` |
| **Ei / I** (We) | `i` | `Ei'n` | `i` / `Ei'` |

---

## 6. Critical Rules for AI
1. **Never skip the agreement marker.** `Amah pai hi` is wrong; it must be `Amah a pai hi.`
2. **Inclusive "We" Rule:** `i` never takes the plural suffix `uh`.
   - ✅ `I pai hi.`
   - ❌ `I pai-te hi.`
3. **Third Person "A":** Use `a` for both "he/she" and "it". Zolai does not distinguish gender in pronouns.

---
## [pronoun_vocabulary_reference.md]

# Pronoun & Key Vocabulary Reference — Corpus Verified

> Source: All 3 Bible versions (TDB77, TBR17, Tedim2010) × KJV parallel corpus
> Last updated: 2026-04-17

---

## First Person Plural — "We / Us"

| Pronoun | Function | Correct Use | Wrong |
|---|---|---|---|
| `i` | Subject prefix "we" | `I pai hi` (We went) | `I pai-te hi` ❌ |
| `eite` | Emphatic / object "us/we" | `Pasian in eite hong it` (God loves us) | `kei te hong it` ❌ |
| `kei te` | NOT "we" — emphatic singular only | `kei teek ka hi` (it is only me) | `kei te pai hi` for "we went" ❌ |

**Corpus evidence (TDB77):**
- `Pasian in eite hong it a, eite mawhna hong lak ding Tapa hong khal hi` — God loves us (1Jn 4:10)
- `Ka itte aw, tu-in Pasian' tate i hi hi` — now are we the sons of God (1Jn 3:2)
- `eite khat leh khat ki-it ni` — let us love one another (1Jn 4:7)
- `I pai hi` — We went (Acts 16:13, multiple versions)

---

## Key Vocabulary — Corpus Verified

| English | Correct Zolai | Wrong | Notes |
|---|---|---|---|
| love (verb) | `it` | `lungdam` ❌ | `Pasian in eite hong it` (1Jn 4:10) |
| love (noun) | `itna` | `lungdamna` ❌ | `Pasian' itna` (love of God) |
| glad / thankful | `lungdam` | — | NOT love |
| God | `Pasian` | `pasian` ❌ | ZVS standard |
| us (object) | `eite` | `kei te` ❌ | 1Jn 4:10 TDB77 |
| we (subject) | `i` (prefix) or `eite` (emphatic) | `kei te` ❌ | 1Jn 3:2 TDB77 |
| go (away) | `va pai` | — | directional away from speaker |
| come (toward) | `hong pai` | — | directional toward speaker |

---

## Directional Particles

- `hong` = toward speaker — `Pasian in eite hong it` (God's love comes toward us)
- `va` = away from speaker — `va pai` (go away)
- `Na` = you (going away) — `Na pai kei a leh` (if you don't go)
- `Nong` = you (coming toward) — `Nong pai kei a leh` (if you don't come)

---

## Negative Conditional

- ✅ `Na pai kei a leh` — if you don't go (away from speaker)
- ✅ `Nong pai kei a leh` — if you don't come (toward speaker)
- ❌ NEVER `kei a leh` for negative conditional

---
## [number_system.md]

# Zolai Number System

Zolai (Tedim) uses a base-10 number system. Numbers follow a consistent pattern for tens, hundreds, and thousands.

---

## 1. Cardinal Numbers (0-10)

| Value | Zolai |
| :--- | :--- |
| **0** | `beem` |
| **1** | `khat` |
| **2** | `nih` |
| **3** | `thum` |
| **4** | `li` |
| **5** | `nga` |
| **6** | `guk` |
| **7** | `sagi` |
| **8** | `giat` |
| **9** | `kua` (or `kuo`) |
| **10** | `sawm` |

---

## 2. Tens (11-99)

Tens are formed by using `sawm` followed by the unit.

| Value | Zolai | Pattern |
| :--- | :--- | :--- |
| **11** | `sawm le khat` | sawm + le + unit |
| **12** | `sawm le nih` | sawm + le + unit |
| **20** | `sawm nih` | sawm + unit |
| **21** | `sawm nih le khat` | sawm + unit + le + unit |
| **30** | `sawm thum` | sawm + unit |
| **90** | `sawm kua` | sawm + unit |

---

## 3. Large Numbers

| Value | Zolai |
| :--- | :--- |
| **100** | `za khat` |
| **200** | `za nih` |
| **1,000** | `tuul khat` |
| **10,000** | `tuul sawm` |
| **100,000** | `sing khat` |
| **1,000,000** | `awn khat` |
| **1,000,000,000** | `mak za khat` |

---

## 4. Ordinal Numbers (First, Second...)

There are two primary ways to form ordinal numbers, especially in biblical contexts.

### 4.1 Suffix `-na` (TDB77 / Traditional)
- `ni khatna` — first day
- `ni nihna` — second day

### 4.2 Repeating the number (ZVS / Modern)
- `ni khat ni` — first day
- `ni nih ni` — second day

---

## 5. Currency & Counting

When counting objects, the number usually follows the noun.
- `mi thum` — three people
- `inn nih` — two houses
- `sum thum` — three (units of) money

---
*Reference: Zolai Gelhmaan Bu, ZVS 2018.*
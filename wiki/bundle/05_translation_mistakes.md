# Zolai AI — 05_translation_mistakes.md


---
## [decision_patterns.md]

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
| **cu / cun** | **tua** | That / Then (Demonstrative) |
| **pathian** | **pasian** | God (Proper Noun) |
| **bawipa** | **topa** | Lord / Master |
| **fapa** | **tapa** | Son |
| **ram** | **gam** | Country / Land |
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
Refers to the spiritual armor of God.
- **Galvan:** Weapons / Armor / Military equipment.
- **Ref:** Ephesians 6:11-17.
- **Key Terms:** `Lum` (Shield), `Khum` (Helmet), `Siam` (Sword), `Kheh` (Belt).

### U. Quotative Particles (Reported Speech Framework)
Zolai traditionally eschews strict quotation marks, instead relying on quotative verbs to bracket direct or indirect speech.
- **Pattern:** `[Speaker] in, [Quote/Statement], a ci hi.`
- **Particles:**
  - `ci` / `a ci hi` (says / he said) — Used to close the quote.
  - `ci-in` (saying) — Used commonly as a bridge when introducing actions alongside the quote.
  - `kici` (it is said / called) — Used for passive reporting or naming conventions.
- **Example:** "Therefore he says" -> `Tua ahih manin amah in, [Quote], a ci hi.` (Ephesians)

### V. Adverbial Stacking (Temporal & Causal Chains)
Zolai relies on trailing conjunctions to stack sequenced events structurally, forcing a strict chronological representation.
- **Rules:**
  - **Khit ciangin (After doing):** Refers strictly to temporal sequence (Action A finishes before Action B starts). e.g., `A gelh khit ciangin...` (After he had written...).
  - **Tua banah (In addition to that):** Stacks additive information that isn't necessarily temporal.
  - **Tua ahih manin (Because of that):** Provides a direct causal hinge connecting the preceding premise to the subsequent conclusion.

### W. Imperative Nuances (Command Logic)
Specific particles dictate exactly who is being commanded and under what authority.
- **`in` (Singular Direct):** "Do this" (e.g., `Pai in` - Go). Addressed to a single individual.
- **`un` (Plural Direct):** "You all do this" (e.g., `Pai un` - You all go). Addressed to a congregation/group.
- **`hen` (3rd Person Jussive):** "Let him/it do it" (e.g., `Om hen` - Let it be / Let it exist). Used for blessings or indirect authority.
- **`ni` (Inclusive Hortative):** "Let us" (e.g., `Pai ni` - Let us go). Includes the speaker.
- **`le-u` (Conditioned Imperative):** Softened request or plural condition (e.g., if you all would...).

### X. Universal Law Logic (Absolutes)
In translating strict theological or legal absolute statements from the Epistles, careful distinction must be made between "all" scopes.
- **`Khempeuh` (Universal Total):** "Whosoever" or "all without boundary" (e.g., `Simlei mi khempeuh` - All people in the world).
- **`Teng` (Specific Group Total):** "All of these" (e.g., `Hih thu teng` - All of these things). Used when the scope of "all" is a closed loop.

### Y. Metaphorical Poetics (Psalms Structure)
When translating poetic Hebrew parallelisms, Zolai prefers maintaining the symmetry by matching pairs over literal word-for-word translating.
- **Rule:** If Line A uses a noun-adjective pair, Line B should mirror the cadence, even if the English translation obscures it, leaning heavily on traditional Zolai figurative binaries (e.g., `Mual le guam` - Mountains and valleys, symbolizing all terrain).

## 3. Auditor Task Logic (Regex & Heuristics)

| Task | Logic / Pattern | Reason |
| :--- | :--- | :--- |
| **Ergative Check** | `\b(Amah|Kote|Noteng)\s+in\b` | Standard 2018 prefers contraction to `'n`. |
| **Nasal Spelling** | `\b(tun|sin|lun|din|man|sun|kon|zon|hon)g\b` | Ensures 'ng' is used for nasal endings, not just 'g'. |
| **Honorific Shift** | If `tone == 'formal'`, flag `na'ng` | Suggest `Note` (plural as singular honorific). |
| **Stem II before 'na'** | `\b(mu|thei|kap)\s+na\b` | Noun formation requires Stem II (`muh`, `theih`, `kah`). |

## 4. Forbidden Directs (Calque Library)

| English | Calque (Flag) | Zolai Natural (Correct) |
| :--- | :--- | :--- |
| I am fine | `Ka hoih hi` | `Ka cidam hi` |
| I don't know | `Ka thei lo` | `Ka thei zokei` (if inability) |
| Thank you | `Lungdam` | `Lungdam mahmah` (standard courtesy) |
| Please | `Khawng` | `Dih` / `Zial` (suffixes, not standalone words) |

### AJ. Transitive Imperative: "Na [Verb] un"
Commanding a group to perform an action on an object or each other.
- **Pattern:** `[Object] na [Verb] un.`
- **Example:** "Love one another" -> `khat leh khat na ki-it un.` (EPH 5:2)
- **Nuance:** The `na` prefix here is second-person plural marker, not the location marker.

### AK. Prohibitive Imperative: "Pusuak kei hen" / "Sak kei un"
Expressing "Let not" (3rd person) or "Do not" (2nd person plural).
- **Pattern (3rd):** `[Subject] [Verb] kei hen.`
- **Pattern (2nd Pl):** `[Verb] sak kei un.`
- **Example:** "Let no corrupt communication proceed" -> `kam hoih lo khat beek pusuak kei hen.` (EPH 4:29)

### AL. The "Tan' ding a kilawm" (Beseeming/Worthy)
Translating the concept of what is appropriate or "becoming" for a certain status.
- **Pattern:** `[Status] in tan' ding a kilawm...`
- **Example:** "As becometh saints" -> `misiangthote in tan' ding a kilawm...` (EPH 5:3)

### AM. Contrastive Conjunction: "Tham loin" (Not only... but also)
- **Pattern:** `[Clause A] tham loin, [Clause B] zaw hi.`
- **Example:** "Not only for us, but for all" -> `eite ading bek tham loin, mi khempeuh ading zaw hi.`

### AN. Reduplicative Joy: "Nuam un la, Lungdam khawm un"
Philippians frequently pairs "joy" (`nuam`) and "rejoicing" (`lungdam`) to express spiritual exuberance.
- **Pattern:** `[Subject] [nuam] un la, [lungdam] khawm un.`
- **Example:** "Joy, and rejoice with you all" -> `ka nuam hi; note khempeuh tawh ka lungdam khawm hi.` (PHP 2:17)
- **Nuance:** `Nuam` often refers to the internal state, while `lungdam` refers to the expressed gratitude/rejoicing.

### AO. The "Lam pan ci leeng" (As touching / Concerning)
Used to introduce a specific category or attribute in a list of qualifications.
- **Pattern:** `[Category] lam pan ci leeng [Attribute]...`
- **Example:** "As touching the law, a Pharisee" -> `Thukham lam pan ci leeng Farisai mi ka hi hi.` (PHP 3:5)

### AP. Goal-Oriented Action: "Kung dongin hahkatin ka tai hi"
Idiomatic expression for "pressing toward the mark" or "striving for the finish line".
- **Pattern:** `[Goal] ngah nadingin, [kung] dongin hahkatin ka [tai/delh] hi.`
- **Ref:** PHP 3:14.

### AQ. Sufficiency and Learning: "Ka kisin zo hi"
Translating "I have learned... to be content".
- **Pattern:** `[Condition] ah ka lungkim nadingin ka kisin zo hi.`
- **Ref:** PHP 4:11.

### AR. Creation Priority: "Ta Upa" (Firstborn)
In Colossians, this refers to Christ's rank/preeminence over creation, not literal birth order.
- **Pattern:** `[Category] khempeuhte mai-ah zong [Ta Upa] ahi hi.`
- **Example:** "The firstborn of every creature" -> `a om khempeuhte mai-ah zong ta Upa ahi hi.` (COL 1:15)

### AS. Constructive Metaphor: "Ci al bangin a al" (Seasoned with Salt)
Translating the quality of speech that is graceful and purposeful.
- **Pattern:** `[Subject] kam in [ci al] bangin a al [limna] tawh dimin...`
- **Ref:** COL 4:6.

### AT. The "Ut thu biakna" (Will Worship / Self-imposed religion)
Specific terminology for legalistic or human-originated religious practices.
- **Term:** `Ut thu biakna` (Worship according to one's own will/desire).
- **Ref:** COL 2:23.

### AU. Relational Duty Markers: "Itna lungsim tawh hih ta un"
Formal instruction for performing duties (household codes).
- **Pattern:** `[Duty/Task] khempeuhah [itna lungsim] tawh hih ta un.`
- **Nuance:** `Hih ta un` (Do it now/already) adds a sense of immediate and established obligation.

### AV. Eschatological Timing: "Topa’ Ni" (Day of the Lord)
Used to describe the sudden, final arrival of Christ.
- **Pattern:** `[Metaphor: guta/ta suah gimna] bangin [Topa’ Ni] hong tung ding hi.`
- **Ref:** 1TH 5:2.

### AW. The "Sun tawh zan tawh" (Night and Day)
Standard Zolai idiom for "ceaselessly" or "tirelessly" in labor or prayer.
- **Pattern:** `[Subject] [sun tawh, zan tawh] semin/thungenin...`
- **Example:** "Labouring night and day" -> `sun tawh, zan tawh nasemin...` (1TH 2:9)

### AX. Collective Greeting: "A siangtho kinapna" (Holy Kiss)
Specific cultural-religious translation for the "holy kiss" greeting.
- **Term:** `A siangtho kinapna` (Holy greeting/kissing).
- **Ref:** 1TH 5:26.

### AY. Prohibitive Exhortation: "Tang un" / "Mitsak kei un"
- **Tang un:** Abstain/Avoid (e.g., `khialhna nam kim na tang un` - 1TH 5:22).
- **Mitsak kei un:** Quench not (strictly used for the Spirit).

### AZ. Pastoral/Elder Qualifications: "Khuaval lo" (Sober/Vigilant)
1 Timothy uses `khuaval lo` (not having eyes open/blurred) specifically for the sobriety and vigilance required of leaders.
- **Pattern:** `[Title] in [khuaval lo] mi ahi ding hi.`
- **Ref:** 1TI 3:2, 3:11.

### BA. Trust Commitment: "Hong kepsak" (Committed to trust)
Translating the "deposit" or "trust" given to a minister.
- **Pattern:** `[Subject] [Lungdamna Thu] hong kepsak/kem in.`
- **Ref:** 1TI 1:11, 6:20.

### BB. The "Thuman thutak" vs "Zuau" (True vs False)
A central theme in the Pastoral Epistles.
- **Thuman thutak:** Faithful/True saying.
- **Zuau:** Falsehood/Vain jangling.
- **Example:** "This is a faithful saying" -> `thuman thutak hi a...` (1TI 1:15).

### BC. Household Order: "Inn pha takpi-in uk"
Requirement for leaders to manage their homes well.
- **Pattern:** `[Subject] ama inn [pha takpi-in] [uk] zo ahi ding hi.`
- **Ref:** 1TI 3:4.

### BD. Social Responsibility: "Gamtatna pha lim" (Pattern of good works)
Titus emphasizes being a model or pattern for others to follow.
- **Pattern:** `[Subject] [gamtatna pha lim] na pumpi-in na lak in.`
- **Ref:** TIT 2:7.

### BE. Spiritual Regeneration: "Nihvei suahna" (Regeneration/New Birth)
The theological term for being "born again" or regenerated.
- **Term:** `Nihvei suahna` (Second birth/Regeneration).
- **Ref:** TIT 3:5.

### BF. Avoidance of Vain Discussion: "Thu kidong hainate" (Foolish questions)
Instruction to avoid unprofitable debates.
- **Pattern:** `[Subject] [thu kidong hainate] tang un.`
- **Ref:** TIT 3:9.

### BG. The "Thuhilhna siangtho" (Sound doctrine)
Consistently used for healthy, biblical teaching.
- **Term:** `Thuhilhna siangtho` (Holy/Clean/Sound teaching).

### BH. Divine Imagery: "Vangliatna meel leh pianlim" (Brightness of glory)
High-register terminology used for Christ's nature in Hebrews.
- **Pattern:** `[Subject] [vangliatna meel] leh [pianlim] ahi hi.`
- **Ref:** HEB 1:3.

### BI. The "Ziat lamah tu" (Sitting at the right hand)
Standard phrase for Christ's exaltation.
- **Pattern:** `[Subject] [ziat lamah] [tu-in] a om hi.`
- **Ref:** HEB 1:3, 1:13.

### BJ. Warning against Drifting: "Kinkhia lo, paikhiat loh"
Idiomatic caution against losing faith.
- **Pattern:** `[Subject] i [zaksa thute] panin [kinkhia lo, paikhiat loh] nading...`
- **Ref:** HEB 2:1.

### BK. High Priestly Office: "Siampi Lian" (High Priest)
Central term in Hebrews for Christ's role.
- **Term:** `Siampi Lian` (Great Priest/High Priest).

### BL. Practical Wisdom: "Khuazak nading manlang hen"
James emphasizes quick listening and slow speaking.
- **Pattern:** `[Subject] [khuazak nading] manlang hen, [kampau nading] manlang kei hen.`
- **Ref:** JAS 1:19.

### BM. The "Limlang" Metaphor (Mirror)
Translating the concept of self-deception by hearing but not doing.
- **Pattern:** `[Subject] pen [limlang] ah ama maitang a en mi tawh kibang hi.`
- **Ref:** JAS 1:23.

### BN. Faith and Works: "Gamtatna hoih om lo upna" (Faith without works)
The central argument of James.
- **Pattern:** `[Gamtatna hoih] om lo [upna] in a si hi.`
- **Ref:** JAS 2:17, 2:26.

### BQ. Identity and Exile: "Khualzinte, mi peemte" (Strangers and Pilgrims)
Describing the identity of believers in the world.
- **Term:** `Khualzinte, mi peemte` (Travelers and refugees/sojourners).
- **Ref:** 1PE 2:11.

### BR. Christ's Model: "Ama khekhap na zuih nading" (Follow his steps)
- **Pattern:** `[Subject] ama [khekhap] na [zuih] nadingun...`
- **Ref:** 1PE 2:21.

### BS. The Roaring Lion: "Humpinelkai bangin"
Metaphor for the devil's activity.
- **Pattern:** `[Dawimangpa] in a [hawk thei humpinelkai] bangin...`
- **Ref:** 1PE 5:8.

### BT. The "Hidden Man": "Lungsim sung kizepna"
Contrast between outward and inward beauty.
- **Pattern:** `[Subject] [lungsim sung] [kizepna] hi ta hen.`
- **Ref:** 1PE 3:4.

### BU. Divine Nature: "Pasian’ nuntakna tawh kizom"
Translating "partakers of the divine nature".
- **Pattern:** `[Subject] [Pasian’ nuntakna] tawh [kizom] mi na suah nading uh...`
- **Ref:** 2PE 1:4.

### BV. The "Add to your faith" Chain (Staircase Parallelism)
Peter's sequence of virtues uses the "tungah" (upon/added to) structure.
- **Pattern:** `[Virtue A] tungah [Virtue B], [Virtue B] tungah [Virtue C]...`
- **Example:** "Add to your faith virtue; and to virtue knowledge" -> `upna tungah hoihna, hoihna tungah lungpilna...` (2PE 1:5).

### BW. Reminders and Remembrance: "Phawksak kik / Phawk tawntung"
Key theme in 2 Peter regarding the preservation of truth.
- **Pattern:** `[Subject] [thute] [phawksak kik / phawk tawntung] nading...`
- **Ref:** 2PE 1:12, 1:15, 3:1.

### BX. False Teachers: "Zuau hilh siate"
Specific term for "false teachers" (as opposed to false prophets `kamsang zuau`).
- **Term:** `Zuau hilh siate` (Teachers who teach lies).
- **Ref:** 2PE 2:1.

### BY. The "Dog and Sow" Proverb: "Ui in ama luak a ne kik hi"
Standard translation for the proverb of returning to sin.
- **Ref:** 2PE 2:22.
- **Imagery:** `Ui` (Dog) + `luak` (vomit), `Vokpi` (Sow) + `buan` (mire/mud).

### BZ. The Scofers' Question: "Topa hong paikik ding cih... koi-ah om hiam?"
Rhetorical challenge from scoffers.
- **Pattern:** `[Subject/Promise] [cih thuciamna] [koi-ah a om hiam]?`
- **Ref:** 2PE 3:4.

### CA. Thief in the Night: "Guta bangin"
Standard metaphor for the suddenness of the Day of the Lord.
- **Pattern:** `[Guta] bangin [Topa’ Ni] hong tung ding hi.`
- **Ref:** 2PE 3:10.

### CB. Manifestation of Life: "Nuntakna hong kilang"
Translating "the life was manifested".
- **Pattern:** `[Subject] [nuntakna] hong [kilang] zo a...`
- **Ref:** 1JN 1:2.

### CC. Fellowship and Communion: "Kihothei / Kiho"
In 1 John, "fellowship" is often translated using the root `kiho` (to speak with/commune).
- **Pattern:** `[Subject] [Object] tawh i [kiho/kihopih] thei hi.`
- **Ref:** 1JN 1:3, 1:6.

### CD. Propitiation: "Mawhna maisak nading"
Functional translation of the theological concept of propitiation/atonement.
- **Term:** `Mawhna maisak nading` (For the forgiveness of sins) or `Mawhna hong tat nading`.
- **Ref:** 1JN 2:2, 4:10.

### CE. Antichrist: "Anti Khazih"
Standard transliteration for the opponent of Christ.
- **Ref:** 1JN 2:18, 2:22.

### CF. Sinlessness and Abiding: "Mawhna ah a zongsang kei"
Translating "sinneth not" in the context of abiding in Christ (habitual vs occasional sin).
- **Pattern:** `[Subject] [mawhna] ah a [zongsang] kei hi.` (Does not make a habit of sin).
- **Ref:** 1JN 3:6.

### CG. The "Seed" of God: "Pasian’ khaici"
Metaphor for the divine nature remaining in the believer.
- **Term:** `Pasian’ khaici` (God's seed).
- **Ref:** 1JN 3:9.

### CH. Love in Deed: "Sepna bawlna tawh"
Translating "love in deed and in truth" as opposed to just words.
- **Pattern:** `[Subject] [kampau bek] tawh hi loin, [sepna bawlna] tawh a mantak ki-it ni.`
- **Ref:** 1JN 3:18.

### CI. Trying the Spirits: "Kha... dongtelin, en un"
Instruction to test or verify spiritual claims.
- **Pattern:** `[Subject] [khate] [dongtelin, en un].`
- **Ref:** 1JN 4:1.

### CJ. "He that is in you": "Note sungah a om mi"
The comparison between the indwelling God and the spirit of the world.
- **Pattern:** `[Note sungah a om mi] in [leitungmite sungah a om mi] sangin a [lianzaw] hi.`
- **Ref:** 1JN 4:4.

### CK. Perfect Love and Fear: "Itna in launa tawh kigawm thei lo"
The theological relationship between love and fear.
- **Pattern:** `[Itna] in [launa] tawh [kigawm] thei lo hi... a kicing itna in launa a [hawlkhia] hi.`
- **Ref:** 1JN 4:18.

### CL. Revelation / Apocalypse: "Mangmuhna lai"
Standard Zolai title for the Book of Revelation.
- **Term:** `Mangmuhna lai` (The book of visions/revelations).
- **Ref:** REV 1:1.

### CM. The "Alpha and Omega" equivalent: "A masa bel leh a nunung bel"
Zolai uses "the very first and the very last" for the Alpha/Omega title.
- **Pattern:** `[Keimah] in [a masa bel] leh [a nunung bel] mi ka hi hi.`
- **Ref:** REV 1:17, 22:13.

### CN. The Throne of God: "Pasian’ tokhom"
- **Term:** `Tokhom` (Throne/Seat of authority).
- **Ref:** REV 4:2, 7:15.

### CO. Worship and Prostration: "Bokin biakna"
Describing the act of falling down in worship.
- **Pattern:** `[Subject] [Object] mai-ah [bokin] a [bia] uh hi.`
- **Ref:** REV 4:10, 5:14.

### CP. The Lamb: "Tuuno"
Central title for Christ in Revelation.
- **Term:** `Tuuno` (Lamb/Little sheep).
- **Ref:** REV 5:6.

### CQ. "Worthy is the Lamb": "Tuuno... na kilawm hi"
Translating the "Worthy" acclamation.
- **Pattern:** `[Subject] [Action] dingin [na kilawm hi].`
- **Ref:** REV 4:11, 5:9.

### CR. Seal and Scroll: "Ciamtehna leh Laibu"
- **Ciamtehna:** Seal / Sign / Mark.
- **Laibu:** Book / Scroll.
- **Ref:** REV 5:1.

### CS. The Four Horsemen: "Sakol tuang mite"
- **Pattern:** `Sakol [Color] khat ka mu hi! Tua sakol tung tuang mi in...`
- **Colors:** `kang` (white), `san` (red), `vom` (black), `puang` (pale/yellowish).
- **Ref:** REV 6:1-8.

### CT. The Great Tribulation: "Gimna lianpi"
- **Term:** `Gimna lianpi` (Great suffering/tribulation).
- **Ref:** REV 7:14.

### CU. The New Creation: "Van thak leh Lei thak"
- **Term:** `Van thak leh lei thak` (New heaven and new earth).
- **Ref:** REV 21:1.

---

## Old Testament Patterns (CV-DZ)

### CV. Covenant: "Thuciamna"
The concept of a binding legal and spiritual agreement.
- **Term:** `Thuciamna` (Covenant / Promise).
- **Everlasting Covenant:** `Tawntung thuciamna`.
- **Ref:** GEN 17:7, 17:13.

### CW. Almighty God: "Vanglian Pasian"
The specific title for God's omnipotence in the Pentateuch.
- **Pattern:** `Kei, Vanglian Pasian ka hi hi.` (I am the Almighty God).
- **Structure:** `[Name], [Title] [ka hi hi].` (Essential identification).
- **Ref:** GEN 17:1.

### CX. The Host of Them: "A sunga omte khempeuh"
Translating "host" (celestial bodies or inhabitants) of heaven and earth.
- **Term:** `a sunga omte khempeuh` (all that are inside them).
- **Ref:** GEN 2:1.

### CY. Circumcision: "Vun ki-at"
Ritual legal requirement.
- **Term:** `Vun ki-at` (Skin cut/circumcised).
- **Ref:** GEN 17:10.

### CZ. Blessedness (Psalmic): "Mi nuamsa"
The "Beatitude" pattern in Psalms.
- **Pattern:** `Mi nuamsa i cihte pen...` (The ones we call happy people are...).
- **English Parallel:** "Blessed is the man..."
- **Ref:** PSA 1:1.

### DA. Shepherd Imagery: "Tuucin bangin hong cing"
- **Pattern:** `Topa pen tuucin bangin hong cing hi` (The Lord like a shepherd protects/tends me).
- **Ref:** PSA 23:1.

### DB. Self-Exhortation (Praise): "Topa ka phat ding"
The "Bless the Lord, O my soul" pattern.
- **Pattern:** `Topa ka phat ding a, ka lungsim khempeuh tawh...` (I will praise the Lord, and with my whole heart...).
- **Ref:** PSA 103:1.

---
*This wiki is updated as new patterns are discovered in parallel corpora and dictionaries.*

---
## [english_to_zolai_mapping.md]

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
## [emotion_lung_cheat_sheet.md]

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
## [nuance_mapping.md]

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
## [idioms.md]

# Parallel Idioms & Metonymy

This document tracks Zolai idiomatic expressions and their English equivalents, focusing on "deep linguistics" and cultural logic.

## 1. Physical Organ Metaphors (Lung - Mind/Heart)

In Zolai, the "Heart" (`Lung`) is the seat of intellect and emotion, similar to the Greek "nous" or English "mind".

| Zolai Idiom | Literal Meaning | English Equivalent |
| :--- | :--- | :--- |
| `Lung nopna` | Good heart/Mind-joy | Peace / Satisfaction |
| `Lungdam` | Heart-joy | Happy / Thankful |
| `Lung hiam` | Sharp heart | Clever / Acute |
| `Lung tawn` | Persistent heart | Patient / Enduring |
| `Lung kia` | Falling heart | Discouraged / Despair |
| `Lung gim` | Tired heart | Worried / Anxious |

## 2. Agricultural & Natural Metaphors

| Zolai Idiom | Literal Meaning | English Equivalent |
| :--- | :--- | :--- |
| `Gah suahtakna` | Fruit of coming out | Outcome / Result |
| `A zung a bul` | The root and the source | Bottom line / Foundation |
| `Tawh lo kho` | Hoeing the field | To work hard / Manual labor |
| `Singgah a min` | Ripe tree-fruit | Mature / Ready |

## 3. Social & Relational Idioms

| Zolai Idiom | Literal Meaning | English Equivalent |
| :--- | :--- | :--- |
| `Beh leh phung` | Clan and lineage | Relatives / Extended family |
| `Khuasungkipawlna` | Village association | Community / Local government |
| `Pi leh pu ngeina` | Grandfather/mother customs | Tradition / Heritage |

## 4. Formal Metonymy (Zokam Standard)

| Concept | Zolai Metonym | Meaning |
| :--- | :--- | :--- |
| **Authority** | `Vangliatna` | Power (lit. "greatness/glory") |
| **Expertise** | `Siamna` | Skill (lit. "wisdom/ability") |
| **History** | `Khang thuhilhna` | Tradition (lit. "generation teaching") |

---
*Reference: Zolai Sinna Bu (Expressions), Zolai Gelhmaan Bu (Section: Metaphorical Registers).*

---
## [common_mistakes.md]

# Common AI Mistakes (Zolai Tedim)

Avoid these common mistakes when generating Zolai Tedim.

## 1. Mixing Dialects
- **Mistake:** Using "Pathian" (Hakha) for God.
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
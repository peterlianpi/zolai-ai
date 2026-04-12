# Decision Patterns & Task Logic

This document codifies the internal "Second Brain" logic for Zolai translation and auditing. It tracks how decisions are made when resolving linguistic ambiguity, taking into account the new Language Tutor routing logic.

## 1. The "Zolai First" Decision Matrix
When encountering an English concept or tutoring a student, the system follows this priority:
1.  **Pedagogical Goal:** Is the user learning? If yes, provide hints over direct answers. Ensure the translation matches the user's detected difficulty level.
2.  **Standard Consistency:** Does it match `Zolai_Standard_Format.txt`?
3.  **Idiomatic Naturalness:** Would a native speaker say this? (e.g., `Cidam hi` > `Hoih hi`).
4.  **Register/Domain Alignment:** Does the vocabulary match the selected domain (e.g., religious vs. daily conversation)?
5.  **Stem Accuracy:** Is the correct Stem (I or II) used for the syntactic slot?

## 2. Translation Patterns (Recurrent Structures)

### A. The "Nong... Hi" Pattern (Relative Clauses)
English often uses "The [Noun] that [Subject] [Verb]".
- **Pattern:** `[Subject]' [Verb] [Noun] pen...`
- **Example:** "The book you gave me" -> `Nong piak laibu pen...` (Note: `Nong` = `Nang` + `hong`).

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
- **Example:** "For all have sinned" -> `Bang hang hiam i cih leh, mi khempeuh a mawh uh hi.` (ROM 3:23)

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
| **Honorific Shift** | If `tone == 'formal'`, flag `Nang` | Suggest `Note` (plural as singular honorific). |
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


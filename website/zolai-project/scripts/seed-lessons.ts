/**
 * scripts/seed-lessons.ts
 * Seeds LessonPlan, LessonUnit, and Lesson tables with A1–B1 Zolai content.
 * Run: bunx tsx scripts/seed-lessons.ts
 */
import "dotenv/config";
import prisma from "../lib/prisma";

const PLANS = [
  {
    slug: "a1-beginner",
    title: "A1 — Beginner",
    description: "Core identity, greetings, numbers, and simple SOV sentences.",
    level: "A1",
    order: 1,
    units: [
      {
        title: "Greetings & Identity",
        description: "Say hello, introduce yourself, ask how someone is.",
        order: 1,
        xpReward: 20,
        lessons: [
          {
            title: "Basic Greetings",
            type: "GRAMMAR",
            order: 1,
            xpReward: 5,
            content: {
              type: "GRAMMAR",
              intro: "In Zolai (Tedim Chin), greetings focus on wellbeing. The word 'dam' means 'well/healthy' and is central to most greetings.",
              sentences: [
                {
                  zo: "Na dam na?",
                  en: "How are you? (Are you well?)",
                  breakdown: [
                    { word: "Na", meaning: "you (singular)", pos: "pronoun" },
                    { word: "dam", meaning: "well / healthy", pos: "adjective" },
                    { word: "na", meaning: "question marker", pos: "particle", note: "Placed at end to form a yes/no question" },
                  ],
                  note: "Literally: 'You well?' — SOV structure, question marker at end.",
                },
                {
                  zo: "Dam mah.",
                  en: "I am fine. (I am well.)",
                  breakdown: [
                    { word: "Dam", meaning: "well / healthy", pos: "adjective" },
                    { word: "mah", meaning: "indeed / affirmative", pos: "particle", note: "Adds emphasis — 'indeed fine'" },
                  ],
                },
                {
                  zo: "Lungdam.",
                  en: "Thank you.",
                  breakdown: [
                    { word: "Lung", meaning: "heart / mind", pos: "noun", note: "Lung is the seat of emotion in Zolai culture" },
                    { word: "dam", meaning: "well / at peace", pos: "adjective" },
                  ],
                  note: "Literally 'heart is well' — expressing gratitude through inner peace.",
                },
                {
                  zo: "Ka min pen Peter.",
                  en: "My name is Peter.",
                  breakdown: [
                    { word: "Ka", meaning: "my / I (agreement marker)", pos: "pronoun" },
                    { word: "min", meaning: "name", pos: "noun" },
                    { word: "pen", meaning: "is (topic marker)", pos: "particle", note: "'pen' marks the topic of the sentence" },
                    { word: "Peter", meaning: "Peter (proper noun)", pos: "noun" },
                  ],
                  note: "Pattern: Ka [noun] pen [value]. Use this for identity statements.",
                },
              ],
              vocabulary: [
                { zo: "dam", en: "well / healthy", example_zo: "Na dam na?", example_en: "Are you well?" },
                { zo: "Lung", en: "heart / mind / seat of emotion", example_zo: "Lungdam.", example_en: "Thank you." },
                { zo: "min", en: "name", example_zo: "Ka min pen ___.", example_en: "My name is ___." },
                { zo: "Na", en: "you (singular)", example_zo: "Na pai hi.", example_en: "You go." },
                { zo: "Ka", en: "my / I (agreement marker)", example_zo: "Ka ne hi.", example_en: "I eat." },
              ],
            },
          },
          {
            title: "Greetings Practice",
            type: "VOCABULARY",
            order: 2,
            xpReward: 10,
            content: {
              type: "VOCABULARY",
              pairs: [
                { zolai: "Na dam na?", english: "How are you?", hint: "Literally: Are you well?" },
                { zolai: "Dam mah.", english: "I am fine.", hint: "mah = affirmative particle" },
                { zolai: "Lungdam.", english: "Thank you.", hint: "Lung = heart, dam = well" },
                { zolai: "Ka min pen ___.", english: "My name is ___.", hint: "min = name, pen = topic marker" },
                { zolai: "Zolai gen thei na?", english: "Can you speak Zolai?", hint: "gen = speak, thei = able to" },
              ],
            },
          },
          {
            title: "Greetings Quiz",
            type: "MULTIPLE_CHOICE",
            order: 3,
            xpReward: 10,
            content: {
              type: "MULTIPLE_CHOICE",
              questions: [
                { question: "How do you say 'Thank you' in Zolai?", options: ["Dam mah", "Lungdam", "Na dam na?", "Ka min pen"], correct: 1, explanation: "Lungdam = Lung (heart) + dam (well) — 'heart is at peace'" },
                { question: "What does 'Na dam na?' mean?", options: ["My name is...", "I am fine", "How are you?", "Can you speak?"], correct: 2 },
                { question: "Which word means 'name' in Zolai?", options: ["Lung", "min", "dam", "pen"], correct: 1, explanation: "min = name. Ka min pen ___ = My name is ___." },
              ],
            },
          },
        ],
      },
      {
        title: "Numbers & Time",
        description: "Count from 1–10, say days of the week.",
        order: 2,
        xpReward: 20,
        lessons: [
          {
            title: "Numbers 1–10",
            type: "VOCABULARY",
            order: 1,
            xpReward: 10,
            content: {
              type: "VOCABULARY",
              pairs: [
                { zolai: "khat", english: "one" },
                { zolai: "nih", english: "two" },
                { zolai: "thum", english: "three" },
                { zolai: "li", english: "four" },
                { zolai: "nga", english: "five" },
                { zolai: "guk", english: "six" },
                { zolai: "sagih", english: "seven" },
                { zolai: "giat", english: "eight" },
                { zolai: "kua", english: "nine" },
                { zolai: "sawm", english: "ten" },
              ],
            },
          },
          {
            title: "Days of the Week",
            type: "MULTIPLE_CHOICE",
            order: 2,
            xpReward: 10,
            content: {
              type: "MULTIPLE_CHOICE",
              questions: [
                { question: "What is 'Sunday' in Zolai?", options: ["Nipini", "Zanini", "Thaini", "Ningani"], correct: 0, explanation: "Nipini = Ni (day/sun) + pini (holy/rest)" },
                { question: "What does 'ni sagih' mean?", options: ["Seven days", "Day seven / Saturday", "One week", "Sunday"], correct: 1 },
                { question: "How do you say 'today'?", options: ["Zanini", "Tuni", "Nikhat", "Ninih"], correct: 1, explanation: "Tuni = tu (this) + ni (day)" },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    slug: "a2-elementary",
    title: "A2 — Elementary",
    description: "Past tense, plurals, prepositions, and narrative sequence.",
    level: "A2",
    order: 2,
    units: [
      {
        title: "People & Plurals",
        description: "Talk about people using mi/mite. Learn plural markers.",
        order: 1,
        xpReward: 20,
        lessons: [
          {
            title: "People — Read & Learn",
            type: "GRAMMAR",
            order: 1,
            xpReward: 5,
            content: {
              type: "GRAMMAR",
              intro: "In Zolai, 'mi' is the generic word for person/people. 'Mipa' means specifically a male person, and 'numei' a female person. Never use 'mipa' to mean people in general.",
              sentences: [
                {
                  zo: "Mi khat hong pai hi.",
                  en: "A person came.",
                  breakdown: [
                    { word: "Mi", meaning: "person (generic)", pos: "noun", note: "Use mi for any person regardless of gender" },
                    { word: "khat", meaning: "one / a", pos: "number" },
                    { word: "hong", meaning: "toward speaker (directional)", pos: "particle" },
                    { word: "pai", meaning: "go / come", pos: "verb" },
                    { word: "hi", meaning: "is/am/are (copula)", pos: "particle" },
                  ],
                },
                {
                  zo: "Mite hong pai uh hi.",
                  en: "The people came.",
                  breakdown: [
                    { word: "Mite", meaning: "people (plural of mi)", pos: "noun", note: "te = plural suffix" },
                    { word: "hong", meaning: "toward speaker", pos: "particle" },
                    { word: "pai", meaning: "go / come", pos: "verb" },
                    { word: "uh", meaning: "3rd person plural marker", pos: "particle", note: "Required for 3rd person plural. NEVER use with 'i' (we)" },
                    { word: "hi", meaning: "copula", pos: "particle" },
                  ],
                  note: "3rd person plural: verb must be followed by 'uh'. Compare: I pai hi (we go — NO uh).",
                },
                {
                  zo: "Mipa khat leh numei khat om hi.",
                  en: "One man and one woman are present.",
                  breakdown: [
                    { word: "Mipa", meaning: "male person / man", pos: "noun", note: "mipa = mi (person) + pa (male)" },
                    { word: "leh", meaning: "and / with", pos: "conjunction" },
                    { word: "numei", meaning: "female person / woman", pos: "noun" },
                    { word: "om", meaning: "exist / be present", pos: "verb" },
                  ],
                },
                {
                  zo: "Mikhempeuh Pasian lungkim uh hi.",
                  en: "Everyone is pleased with God.",
                  breakdown: [
                    { word: "Mikhempeuh", meaning: "everyone / all people", pos: "noun", note: "mi + khempeuh (all/every)" },
                    { word: "Pasian", meaning: "God (Tedim ZVS)", pos: "noun", note: "NEVER use 'Pathian' (Hakha dialect)" },
                    { word: "lungkim", meaning: "pleased / satisfied", pos: "adjective", note: "Lung (heart) + kim (full/satisfied)" },
                  ],
                },
              ],
              vocabulary: [
                { zo: "mi", en: "person / people (generic)", example_zo: "Mi khat hong pai hi.", example_en: "A person came." },
                { zo: "mite", en: "people (plural)", example_zo: "Mite hong pai uh hi.", example_en: "The people came." },
                { zo: "mipa", en: "man (male person)", example_zo: "Mipa khat om hi.", example_en: "A man is present." },
                { zo: "numei", en: "woman (female person)", example_zo: "Numei khat om hi.", example_en: "A woman is present." },
                { zo: "mikhempeuh", en: "everyone / all people", example_zo: "Mikhempeuh pai uh hi.", example_en: "Everyone went." },
              ],
            },
          },
          {
            title: "People vocabulary",
            type: "VOCABULARY",
            order: 2,
            xpReward: 10,
            content: {
              type: "VOCABULARY",
              pairs: [
                { zolai: "mi", english: "person / people (generic)", hint: "mi = person. mite = people (plural)" },
                { zolai: "mipa", english: "man (male person)", hint: "mipa = mi (person) + pa (male)" },
                { zolai: "numei", english: "woman (female person)", hint: "numei = nu (female) + mei" },
                { zolai: "mite", english: "people (plural)", hint: "mi + te (plural suffix)" },
                { zolai: "mikhempeuh", english: "everyone / all people", hint: "mi + khempeuh (all/every)" },
                { zolai: "naupang", english: "child", hint: "nau = young, pang = person" },
              ],
            },
          },
          {
            title: "Plural Grammar",
            type: "GRAMMAR",
            order: 2,
            xpReward: 15,
            content: {
              type: "GRAMMAR",
              rule: "Add 'te' to make nouns plural. For 3rd person plural verbs, add 'uh' after the verb. NEVER use 'uh' with 'i' (we inclusive).",
              examples: [
                { correct: "Mite hong pai uh hi.", incorrect: "Mipate hong pai hi.", explanation: "mite = people (generic plural). 'uh' required for 3rd person plural." },
                { correct: "I pai hi.", incorrect: "I pai uh hi.", explanation: "'i' (we inclusive) NEVER takes 'uh'." },
                { correct: "Nong pai uh hi.", incorrect: "Nong pai hi.", explanation: "'nong' (you plural) requires 'uh'." },
              ],
              questions: [
                { question: "Which is correct?", options: ["I ne uh hi.", "I ne hi.", "I ne ding uh hi.", "I uh ne hi."], correct: 1 },
                { question: "How do you say 'The people came'?", options: ["Mi hong pai hi.", "Mite hong pai uh hi.", "Mipate hong pai hi.", "Mi uh hong pai hi."], correct: 1 },
              ],
            },
          },
        ],
      },
      {
        title: "Past & Future Tense",
        description: "Use khin (past), ding (future), ngei (experiential).",
        order: 2,
        xpReward: 25,
        lessons: [
          {
            title: "Tense Markers",
            type: "VOCABULARY",
            order: 1,
            xpReward: 10,
            content: {
              type: "VOCABULARY",
              pairs: [
                { zolai: "khin", english: "already / completed (past)", hint: "Ka ne khin hi = I have eaten" },
                { zolai: "ding", english: "will / future marker", hint: "Ka pai ding hi = I will go" },
                { zolai: "ngei", english: "have ever / experiential", hint: "Ka pai ngei hi = I have been there before" },
                { zolai: "lai", english: "still / ongoing", hint: "Ka ne lai hi = I am still eating" },
                { zolai: "zo", english: "finished / completed action", hint: "Ka ne zo hi = I finished eating" },
              ],
            },
          },
          {
            title: "Tense Translation",
            type: "TRANSLATION",
            order: 2,
            xpReward: 15,
            content: {
              type: "TRANSLATION",
              sentences: [
                { source: "I will go tomorrow.", sourceLang: "en", answer: "Nicin ka pai ding hi.", hint: "nicin = tomorrow, pai = go, ding = future" },
                { source: "Ka ne khin hi.", sourceLang: "zo", answer: "I have already eaten.", hint: "ne = eat, khin = already" },
                { source: "She has been to Tedim before.", sourceLang: "en", answer: "Amah Tedim ah pai ngei hi.", hint: "ngei = experiential past" },
                { source: "Ka laibu sim lai hi.", sourceLang: "zo", answer: "I am still reading the book.", hint: "laibu = book, sim = read, lai = still/ongoing" },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    slug: "b1-intermediate",
    title: "B1 — Intermediate",
    description: "Cause/effect, conditionals, quotative patterns, directional particles.",
    level: "B1",
    order: 3,
    units: [
      {
        title: "Conditionals & Negation",
        description: "If/then sentences. Correct use of kei vs lo.",
        order: 1,
        xpReward: 30,
        lessons: [
          {
            title: "Conditionals — Read & Learn",
            type: "GRAMMAR",
            order: 1,
            xpReward: 5,
            content: {
              type: "GRAMMAR",
              intro: "Zolai conditionals use 'leh' (if/when). For NEGATIVE conditionals, always use 'kei a leh' — NEVER 'lo leh'. This is one of the most common errors.",
              sentences: [
                { zo: "Nong pai leh, ka lungkim ding hi.", en: "If you come, I will be happy.", breakdown: [{ word: "leh", meaning: "if / when (conditional)", pos: "particle" }, { word: "ding", meaning: "will (future marker)", pos: "particle" }], note: "Positive conditional: verb + leh." },
                { zo: "Nong hong pai kei a leh, ka om ding hi.", en: "If you do not come, I will stay.", breakdown: [{ word: "kei", meaning: "not (negative conditional)", pos: "particle", note: "NEVER use 'lo' for negative conditionals" }, { word: "a leh", meaning: "if (negative conditional linker)", pos: "particle" }], note: "Negative conditional: verb + kei + a + leh." },
                { zo: "Ka dam kei ahih manin, ka pai kei hi.", en: "Because I was not well, I did not go.", breakdown: [{ word: "ahih manin", meaning: "because / due to", pos: "particle" }], note: "'ahih manin' = because (cause-effect connector)." },
              ],
              vocabulary: [
                { zo: "leh", en: "if / when (conditional)", example_zo: "Nong pai leh...", example_en: "If you come..." },
                { zo: "kei a leh", en: "if not (negative conditional)", example_zo: "Nong pai kei a leh...", example_en: "If you don't come..." },
                { zo: "ahih manin", en: "because / due to", example_zo: "Ka dam kei ahih manin...", example_en: "Because I was not well..." },
                { zo: "ding", en: "will (future marker)", example_zo: "Ka pai ding hi.", example_en: "I will go." },
              ],
            },
          },
          {
            title: "Conditional Grammar",
            type: "GRAMMAR",
            order: 2,
            xpReward: 20,
            content: {
              type: "GRAMMAR",
              rule: "Negative conditionals use 'nong pai kei a leh' (if [subject] does not go). NEVER use 'lo leh'. Positive: 'nong pai leh' (if you go).",
              examples: [
                { correct: "Nong pai kei a leh, ka om ding hi.", incorrect: "Nong pai lo leh, ka om ding hi.", explanation: "'kei' is the correct negative conditional marker." },
              ],
              questions: [
                { question: "How do you say 'If you don't come'?", options: ["Nong hong pai lo leh", "Nong hong pai kei a leh", "Nong hong pai kei leh", "Nong hong pai ding kei leh"], correct: 1 },
                { question: "Which is the correct positive conditional?", options: ["Na ne kei leh", "Na ne leh", "Na ne lo leh", "Na ne ding leh"], correct: 1 },
              ],
            },
          },
          {
            title: "Cause & Effect",
            type: "TRANSLATION",
            order: 3,
            xpReward: 15,
            content: {
              type: "TRANSLATION",
              sentences: [
                { source: "Ka dam kei ahih manin, ka pai kei hi.", sourceLang: "zo", answer: "Because I was not well, I did not go.", hint: "ahih manin = because" },
                { source: "Because he studied, he passed.", sourceLang: "en", answer: "Amah sim ahih manin, a lam hi.", hint: "sim = study, lam = pass" },
              ],
            },
          },
        ],
      },
      {
        title: "Directional Particles",
        description: "hong (toward speaker), pai (away), lam (direction) — essential for natural Zolai.",
        order: 2,
        xpReward: 30,
        lessons: [
          {
            title: "Directional Particles",
            type: "VOCABULARY",
            order: 1,
            xpReward: 10,
            content: {
              type: "VOCABULARY",
              words: [
                { zo: "hong", en: "toward speaker (come here)", example_zo: "Hong pai in.", example_en: "Come here." },
                { zo: "pai", en: "away from speaker (go there)", example_zo: "Pai in.", example_en: "Go (away)." },
                { zo: "lam", en: "direction / toward", example_zo: "Khua lam pai hi.", example_en: "He went toward the village." },
                { zo: "pua", en: "carry / bring (toward)", example_zo: "Laibu pua hong pai in.", example_en: "Bring the book here." },
              ],
            },
          },
          {
            title: "Directional Quiz",
            type: "MULTIPLE_CHOICE",
            order: 2,
            xpReward: 15,
            content: {
              type: "MULTIPLE_CHOICE",
              questions: [
                { question: "Which particle means 'toward the speaker'?", options: ["pai", "hong", "lam", "pua"], correct: 1, explanation: "'hong' indicates movement toward the speaker." },
                { question: "Translate: 'Come here'", options: ["Pai in", "Hong pai in", "Lam pai in", "Om in"], correct: 1, explanation: "'Hong pai in' = come here (hong = toward speaker, pai = go/come, in = imperative)." },
              ],
            },
          },
        ],
      },
    ],
  },
];

const B2_C2_PLANS = [
  {
    slug: "b2-upper-int",
    title: "B2 — Upper Intermediate",
    description: "Complex sentences, formal register, discourse markers, and extended narratives.",
    level: "B2",
    order: 4,
    units: [
      {
        title: "Formal Register & Discourse",
        description: "Formal speech patterns and discourse connectors.",
        order: 1,
        xpReward: 40,
        lessons: [
          {
            title: "Formal vs Informal Speech",
            type: "GRAMMAR",
            order: 1,
            xpReward: 10,
            content: {
              type: "GRAMMAR",
              intro: "Zolai has distinct formal and informal registers. Formal speech uses full verb forms and respectful pronouns.",
              sentences: [
                { zo: "Nong hong pai ding hi a?", en: "Will you come? (formal)", breakdown: [{ word: "Nong", meaning: "you (formal/plural)", pos: "pronoun" }, { word: "ding", meaning: "will (future)", pos: "particle" }], note: "Formal question uses full pronoun 'nong'." },
                { zo: "Ka lungkim taktak hi.", en: "I am very happy.", breakdown: [{ word: "taktak", meaning: "very / truly (intensifier)", pos: "adverb" }], note: "'taktak' intensifies adjectives." },
              ],
              vocabulary: [
                { zo: "taktak", en: "very / truly", example_zo: "Ka lungkim taktak hi.", example_en: "I am truly happy." },
                { zo: "hi a", en: "question marker (formal)", example_zo: "Nong dam hi a?", example_en: "Are you well?" },
              ],
            },
          },
          {
            title: "Discourse Connectors",
            type: "VOCABULARY",
            order: 2,
            xpReward: 15,
            content: {
              type: "VOCABULARY",
              words: [
                { zo: "Tua ahih ciangin", en: "After that / Then", example_zo: "Tua ahih ciangin, amah pai hi.", example_en: "After that, he went." },
                { zo: "ahih manin", en: "Because / Therefore", example_zo: "A tha ahih manin, ka lungkim hi.", example_en: "Because it is good, I am happy." },
                { zo: "himahin", en: "However / But", example_zo: "Ka pai ding hi, himahin ka dam kei hi.", example_en: "I will go, however I am not well." },
                { zo: "tua bangin", en: "Like that / In that way", example_zo: "Tua bangin bawl in.", example_en: "Do it like that." },
              ],
            },
          },
          {
            title: "Discourse Translation",
            type: "TRANSLATION",
            order: 3,
            xpReward: 20,
            content: {
              type: "TRANSLATION",
              sentences: [
                { source: "Ka pai ding hi, himahin ka dam kei hi.", sourceLang: "zo", answer: "I will go, however I am not well.", hint: "himahin = however/but" },
                { source: "Because it is good, I am happy.", sourceLang: "en", answer: "A tha ahih manin, ka lungkim hi.", hint: "ahih manin = because" },
              ],
            },
          },
        ],
      },
      {
        title: "Narrative & Storytelling",
        description: "Tell stories in Zolai using past tense, sequence markers, and quotatives.",
        order: 2,
        xpReward: 40,
        lessons: [
          {
            title: "Quotative Patterns",
            type: "GRAMMAR",
            order: 1,
            xpReward: 15,
            content: {
              type: "GRAMMAR",
              intro: "Zolai uses 'ci-in' (saying/thinking) to report speech and thoughts. It follows the quoted content.",
              sentences: [
                { zo: "Amah in, 'Ka pai ding hi,' ci-in a gen hi.", en: "He said, 'I will go.'", breakdown: [{ word: "ci-in", meaning: "saying / thinking (quotative)", pos: "particle" }, { word: "gen", meaning: "say / speak", pos: "verb" }], note: "ci-in follows the quoted speech." },
                { zo: "Ka pai ding hi ci-in ka ngaih hi.", en: "I thought I would go.", breakdown: [{ word: "ngaih", meaning: "think / consider", pos: "verb" }], note: "ci-in also marks reported thought." },
              ],
              vocabulary: [
                { zo: "ci-in", en: "saying / thinking (quotative)", example_zo: "'Ka dam hi,' ci-in a gen hi.", example_en: "He said, 'I am well.'" },
                { zo: "gen", en: "say / speak", example_zo: "Amah in a gen hi.", example_en: "He said it." },
                { zo: "ngaih", en: "think / consider", example_zo: "Ka ngaih hi.", example_en: "I thought." },
              ],
            },
          },
          {
            title: "Story Vocabulary",
            type: "VOCABULARY",
            order: 2,
            xpReward: 15,
            content: {
              type: "VOCABULARY",
              words: [
                { zo: "a kipat cil-in", en: "in the beginning / at first", example_zo: "A kipat cil-in, Pasian in vantung leh lei a piangsak hi.", example_en: "In the beginning, God created heaven and earth." },
                { zo: "tua ciangin", en: "then / after that", example_zo: "Tua ciangin amah pai hi.", example_en: "Then he went." },
                { zo: "a bei ciangin", en: "when it was finished / at the end", example_zo: "A bei ciangin, amah hong pai hi.", example_en: "When it was finished, he came back." },
                { zo: "a nungta in", en: "while alive / during life", example_zo: "A nungta in a bawl hi.", example_en: "He did it while alive." },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    slug: "c1-advanced",
    title: "C1 — Advanced",
    description: "Advanced grammar, idiomatic expressions, complex clause structures.",
    level: "C1",
    order: 5,
    units: [
      {
        title: "Complex Clauses",
        description: "Relative clauses, embedded sentences, and advanced particles.",
        order: 1,
        xpReward: 50,
        lessons: [
          {
            title: "Relative Clauses",
            type: "GRAMMAR",
            order: 1,
            xpReward: 15,
            content: {
              type: "GRAMMAR",
              intro: "Zolai relative clauses precede the noun they modify (SOV structure). The relativizer 'a' links the clause to the head noun.",
              sentences: [
                { zo: "Amah a pai mi hi.", en: "He is the one who went.", breakdown: [{ word: "a", meaning: "relativizer particle", pos: "particle" }, { word: "pai", meaning: "go", pos: "verb" }, { word: "mi", meaning: "person / one who", pos: "noun" }], note: "Relative clause: [clause + a] + head noun. The clause precedes the noun." },
                { zo: "Ka it mi pen amah hi.", en: "The one I love is him.", breakdown: [{ word: "it", meaning: "love", pos: "verb" }, { word: "pen", meaning: "topic marker / the (definite)", pos: "particle" }], note: "'pen' marks the topic/subject of the main clause." },
              ],
              vocabulary: [
                { zo: "mi", en: "person / one who", example_zo: "A pai mi", example_en: "the one who went" },
                { zo: "pen", en: "topic/definite marker", example_zo: "Ka it mi pen", example_en: "the one I love" },
              ],
            },
          },
          {
            title: "Advanced Particles Quiz",
            type: "MULTIPLE_CHOICE",
            order: 2,
            xpReward: 20,
            content: {
              type: "MULTIPLE_CHOICE",
              questions: [
                { question: "What does 'pen' mark in a sentence?", options: ["Future tense", "Topic/definite noun", "Negative", "Question"], correct: 1, explanation: "'pen' is a topic/definite marker, similar to 'the' in English." },
                { question: "In 'A pai mi hi', what is 'a'?", options: ["Subject pronoun", "Relativizer particle", "Verb", "Copula"], correct: 1, explanation: "'a' links the relative clause to the head noun 'mi'." },
                { question: "How do you say 'the person who came'?", options: ["A hong pai mi", "Hong pai a mi", "Mi a hong pai", "A mi hong pai"], correct: 0, explanation: "Relative clause precedes noun: [a + verb] + noun." },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    slug: "c2-mastery",
    title: "C2 — Mastery",
    description: "Native-level fluency: proverbs, poetry, rhetorical structures, and cultural expression.",
    level: "C2",
    order: 6,
    units: [
      {
        title: "Proverbs & Idioms",
        description: "Traditional Zomi proverbs and idiomatic expressions.",
        order: 1,
        xpReward: 60,
        lessons: [
          {
            title: "Zomi Proverbs",
            type: "VOCABULARY",
            order: 1,
            xpReward: 20,
            content: {
              type: "VOCABULARY",
              words: [
                { zo: "Lungkimna pen gam in om hi.", en: "Happiness lives in the land (home).", example_zo: "Lungkimna pen gam in om hi.", example_en: "True happiness is found at home." },
                { zo: "Zangkhat in zang tampi a lam.", en: "One mountain leads to many mountains.", example_zo: "Zangkhat in zang tampi a lam.", example_en: "One step leads to many achievements." },
                { zo: "Tapa tha in nu le pa a lungkim.", en: "A good child makes parents happy.", example_zo: "Tapa tha in nu le pa a lungkim.", example_en: "Good children bring joy to parents." },
              ],
            },
          },
          {
            title: "Proverb Translation",
            type: "TRANSLATION",
            order: 2,
            xpReward: 25,
            content: {
              type: "TRANSLATION",
              sentences: [
                { source: "Lungkimna pen gam in om hi.", sourceLang: "zo", answer: "Happiness lives in the land (home).", hint: "lungkimna = happiness, gam = land/home, om = exist/live" },
                { source: "A good child makes parents happy.", sourceLang: "en", answer: "Tapa tha in nu le pa a lungkim.", hint: "tapa = child, tha = good, nu le pa = parents" },
                { source: "Zangkhat in zang tampi a lam.", sourceLang: "zo", answer: "One mountain leads to many mountains.", hint: "zang = mountain, khat = one, tampi = many, lam = lead/pass" },
              ],
            },
          },
        ],
      },
    ],
  },
];

async function main() {
  console.log("Seeding lesson plans...");

  const allPlans = [...PLANS, ...B2_C2_PLANS];

  for (const planData of allPlans) {
    const { units, ...planFields } = planData;
    const plan = await prisma.lessonPlan.upsert({
      where: { slug: planFields.slug },
      create: planFields,
      update: planFields,
    });
    console.log(`  Plan: ${plan.title}`);

    // Delete existing units for this plan to avoid duplicates on re-run
    await prisma.lesson.deleteMany({ where: { unit: { planId: plan.id } } });
    await prisma.lessonUnit.deleteMany({ where: { planId: plan.id } });

    for (const unitData of units) {
      const { lessons, ...unitFields } = unitData;
      const unit = await prisma.lessonUnit.create({
        data: { ...unitFields, planId: plan.id },
      });

      for (const lessonData of lessons) {
        await prisma.lesson.create({
          data: { ...lessonData, unitId: unit.id, type: lessonData.type as import("@/lib/generated/prisma").LessonType, content: lessonData.content as never },
        });
      }
      console.log(`    Unit: ${unit.title} (${lessons.length} lessons)`);
    }
  }

  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());

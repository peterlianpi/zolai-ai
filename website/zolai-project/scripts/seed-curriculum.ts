/**
 * scripts/seed-curriculum.ts
 * Seeds CurriculumSection, CurriculumUnit, CurriculumSubUnit for all 6 CEFR levels.
 * Also seeds PhonicsUnit and PhonicsSubUnit for the full Zolai phonics track.
 * Run: bunx tsx scripts/seed-curriculum.ts
 */
import 'dotenv/config';
import prisma from '../lib/prisma';

// ── Helpers ───────────────────────────────────────────────────────────────────

const SUB_UNIT_TYPES = [
  'INTRODUCTION', 'VOCABULARY', 'GRAMMAR', 'LISTENING',
  'SPEAKING', 'READING', 'REVIEW', 'CHALLENGE',
] as const;

const SUB_UNIT_TITLES = [
  'Introduction', 'Word Bank', 'Grammar Drill', 'Listen & Understand',
  'Speak Up', 'Read & Respond', 'Review', 'Challenge',
];

const SUB_UNIT_XP = [5, 10, 10, 10, 10, 10, 10, 20];

function makeSubUnits(unitId: string, topic: string) {
  return SUB_UNIT_TYPES.map((type, i) => ({
    unitId,
    number: i + 1,
    title: `${SUB_UNIT_TITLES[i]}: ${topic}`,
    type,
    xpReward: SUB_UNIT_XP[i],
    order: i + 1,
    content: [],
  }));
}

// ── Level definitions ─────────────────────────────────────────────────────────

const LEVELS: {
  code: string;
  base: number;
  sections: { name: string; vocabMin: number; vocabMax: number; units: string[] }[];
}[] = [
  {
    code: 'A1', base: 60,
    sections: [
      { name: 'First Steps', vocabMin: 60, vocabMax: 79, units: ['Greetings & Identity', 'Numbers 1–10', 'Colors', 'Family Members', 'Body Parts'] },
      { name: 'Daily Life', vocabMin: 80, vocabMax: 99, units: ['Food & Drink', 'Animals', 'Daily Routines', 'Weather', 'Home & Rooms'] },
      { name: 'Simple Actions', vocabMin: 100, vocabMax: 114, units: ['Verbs of Motion', 'Time Expressions', 'Simple Questions', 'Negation Basics', 'Classroom Objects'] },
      { name: 'Simple Stories', vocabMin: 115, vocabMax: 129, units: ['Emotions', 'Clothing', 'Market & Shopping', 'Simple Narratives', 'A1 Review'] },
    ],
  },
  {
    code: 'A2', base: 130,
    sections: [
      { name: 'Expanding World', vocabMin: 130, vocabMax: 149, units: ['Village Life', 'Occupations', 'Transport', 'Directions', 'Seasons'] },
      { name: 'Telling Stories', vocabMin: 150, vocabMax: 169, units: ['Past Events', 'Future Plans', 'Comparisons', 'Quantities', 'Celebrations'] },
      { name: 'Social Language', vocabMin: 170, vocabMax: 184, units: ['Requests & Offers', 'Invitations', 'Apologies', 'Giving Opinions', 'Health & Body'] },
      { name: 'Community', vocabMin: 185, vocabMax: 249, units: ['Church & Faith', 'Community Events', 'Nature & Environment', 'Simple Proverbs', 'A2 Review'] },
    ],
  },
  {
    code: 'B1', base: 250,
    sections: [
      { name: 'Cause & Effect', vocabMin: 250, vocabMax: 299, units: ['Cause-Effect Connectors', 'Conditional Sentences', 'Reported Speech', 'Interrogatives', 'Narrative Tense'] },
      { name: 'Zomi Culture', vocabMin: 300, vocabMax: 349, units: ['Cultural Practices', 'Traditional Stories', 'Bible Corpus I', 'Proverbs & Wisdom', 'Zomi History'] },
      { name: 'Argument & Opinion', vocabMin: 350, vocabMax: 399, units: ['Agreeing & Disagreeing', 'Giving Reasons', 'Describing Problems', 'Suggesting Solutions', 'Formal Register'] },
      { name: 'Complex Sentences', vocabMin: 400, vocabMax: 499, units: ['Embedded Clauses', 'Relative Clauses', 'Discourse Markers', 'Extended Narratives', 'B1 Review'] },
    ],
  },
  {
    code: 'B2', base: 500,
    sections: [
      { name: 'Logic & Conditions', vocabMin: 500, vocabMax: 624, units: ['Complex Conditionals', 'Disjunctive Conjunctions', 'Hypotheticals', 'Concession', 'Emphasis Structures'] },
      { name: 'Abstract Thought', vocabMin: 625, vocabMax: 749, units: ['Abstract Nouns', 'Philosophical Concepts', 'Bible Corpus II', 'Theological Vocabulary', 'Metaphor Basics'] },
      { name: 'Formal Writing', vocabMin: 750, vocabMax: 874, units: ['Formal Letters', 'Persuasive Text', 'Academic Register', 'Summarising', 'Paraphrasing'] },
      { name: 'Fluency', vocabMin: 875, vocabMax: 999, units: ['Extended Discourse', 'Idiomatic Expressions', 'Register Switching', 'Error Correction', 'B2 Review'] },
    ],
  },
  {
    code: 'C1', base: 1000,
    sections: [
      { name: 'Metaphor & Style', vocabMin: 1000, vocabMax: 1249, units: ['Metaphorical Language', 'Stylistic Variation', 'Literary Devices', 'Embedded Clauses II', 'Poetic Forms'] },
      { name: 'Advanced Grammar', vocabMin: 1250, vocabMax: 1499, units: ['Complex Morphology', 'Aspect & Aktionsart', 'Evidentiality', 'Mirativity', 'Discourse Cohesion'] },
      { name: 'Bible & Literature', vocabMin: 1500, vocabMax: 1749, units: ['Bible Corpus III', 'Hymn Corpus', 'Narrative Literature', 'Epistolary Style', 'Prophetic Register'] },
      { name: 'Near-Native', vocabMin: 1750, vocabMax: 1999, units: ['Spontaneous Production', 'Nuanced Opinion', 'Cultural Depth', 'Sociolinguistic Variation', 'C1 Review'] },
    ],
  },
  {
    code: 'C2', base: 2000,
    sections: [
      { name: 'Mastery I', vocabMin: 2000, vocabMax: 2499, units: ['Doxology & Praise', 'Visionary Language', 'Poetic Parallelism', 'Archaic Forms', 'Dialectal Mastery'] },
      { name: 'Mastery II', vocabMin: 2500, vocabMax: 2999, units: ['Oratory & Rhetoric', 'Extended Narrative', 'Bible Corpus IV', 'Hymn Composition', 'Translation Mastery'] },
      { name: 'Mastery III', vocabMin: 3000, vocabMax: 3999, units: ['Academic Zolai', 'Technical Vocabulary', 'Neologisms', 'Language Preservation', 'Research Writing'] },
      { name: 'Mastery IV', vocabMin: 4000, vocabMax: 4999, units: ['Full Fluency Drills', 'Spontaneous Composition', 'Peer Teaching', 'Cultural Ambassador', 'C2 Review'] },
    ],
  },
];

// ── Phonics track ─────────────────────────────────────────────────────────────

const PHONICS_UNITS: { category: string; number: number; title: string; description: string; ipaSymbol?: string }[] = [
  // Vowels
  { category: 'VOWELS', number: 1, title: 'Short Vowels: a, e, i, u', description: 'The four basic short vowels of Zolai.', ipaSymbol: '/a ɛ i u/' },
  { category: 'VOWELS', number: 2, title: 'The o = /oʊ/ Rule', description: 'In Zolai, o is always pronounced /oʊ/ — never pure /o/.', ipaSymbol: '/oʊ/' },
  { category: 'VOWELS', number: 3, title: 'Long Vowel: aw', description: 'The long open-back vowel aw = /ɔː/.', ipaSymbol: '/ɔː/' },
  { category: 'VOWELS', number: 4, title: 'Diphthongs: ia, ua, oi', description: 'Three diphthongs used in Zolai.', ipaSymbol: '/ia ua oi/' },
  // Consonants
  { category: 'CONSONANTS', number: 1, title: 'Stops: b, d, g, k, p, t', description: 'Basic stop consonants.', ipaSymbol: '/b d g k p t/' },
  { category: 'CONSONANTS', number: 2, title: 'Fricatives & Approximants: h, l, s, z', description: 'Fricatives and lateral approximant.', ipaSymbol: '/h l s z/' },
  { category: 'CONSONANTS', number: 3, title: 'Nasals: m, n, ng', description: 'Nasal consonants including word-initial ng.', ipaSymbol: '/m n ŋ/' },
  // Clusters
  { category: 'CLUSTERS', number: 1, title: 'Aspirated Stops: kh, th, ph', description: 'Aspirated stop clusters.', ipaSymbol: '/kʰ tʰ pʰ/' },
  { category: 'CLUSTERS', number: 2, title: 'Lateral Cluster: lh', description: 'Aspirated lateral lh = /lʰ/.', ipaSymbol: '/lʰ/' },
  { category: 'CLUSTERS', number: 3, title: 'Onset Clusters: kl, pl, bl', description: 'Two-consonant onset clusters.', ipaSymbol: '/kl pl bl/' },
  // Tones
  { category: 'TONES', number: 1, title: 'Level Tone (unmarked)', description: 'The default mid-level tone in Zolai.' },
  { category: 'TONES', number: 2, title: 'Rising Tone (´)', description: 'The rising tone — marked with acute accent.' },
  { category: 'TONES', number: 3, title: 'Falling Tone (`)', description: 'The falling tone — marked with grave accent.' },
  { category: 'TONES', number: 4, title: 'Three-Way Tone Contrast', description: 'Distinguishing all three tones in minimal pairs.' },
  // Minimal pairs
  { category: 'MINIMAL_PAIRS', number: 1, title: 'pai vs bai', description: 'go vs white — voiced/voiceless bilabial contrast.' },
  { category: 'MINIMAL_PAIRS', number: 2, title: 'tui vs dui', description: 'water vs push — voiced/voiceless alveolar contrast.' },
  { category: 'MINIMAL_PAIRS', number: 3, title: 'kum vs gum', description: 'year vs hold — voiced/voiceless velar contrast.' },
  { category: 'MINIMAL_PAIRS', number: 4, title: 'lam vs lham', description: 'road vs step — plain vs aspirated lateral.' },
];

// ── Seed functions ────────────────────────────────────────────────────────────

async function seedCurriculum() {
  console.log('Seeding curriculum sections, units, and sub-units...');

  for (const level of LEVELS) {
    // 4 content sections
    for (let si = 0; si < level.sections.length; si++) {
      const s = level.sections[si];
      const section = await prisma.curriculumSection.upsert({
        where: { levelCode_number: { levelCode: level.code, number: si + 1 } },
        update: { name: s.name, vocabMin: s.vocabMin, vocabMax: s.vocabMax },
        create: { levelCode: level.code, number: si + 1, name: s.name, isDailyRefresh: false, vocabMin: s.vocabMin, vocabMax: s.vocabMax, order: si + 1 },
      });

      for (let ui = 0; ui < s.units.length; ui++) {
        const topic = s.units[ui];
        const unit = await prisma.curriculumUnit.upsert({
          where: { sectionId_number: { sectionId: section.id, number: ui + 1 } },
          update: { topic },
          create: { sectionId: section.id, number: ui + 1, topic, xpReward: 50, order: ui + 1 },
        });

        // 8 sub-units per unit
        for (let subi = 0; subi < 8; subi++) {
          await prisma.curriculumSubUnit.upsert({
            where: { unitId_number: { unitId: unit.id, number: subi + 1 } },
            update: { title: `${SUB_UNIT_TITLES[subi]}: ${topic}` },
            create: {
              unitId: unit.id,
              number: subi + 1,
              title: `${SUB_UNIT_TITLES[subi]}: ${topic}`,
              type: SUB_UNIT_TYPES[subi],
              xpReward: SUB_UNIT_XP[subi],
              order: subi + 1,
              content: [],
            },
          });
        }
      }
    }

    // Section 5: Daily Refresh
    const refreshSection = await prisma.curriculumSection.upsert({
      where: { levelCode_number: { levelCode: level.code, number: 5 } },
      update: {},
      create: { levelCode: level.code, number: 5, name: 'Daily Refresh', isDailyRefresh: true, vocabMin: level.base, vocabMax: level.base + 69, order: 5 },
    });

    // Daily refresh has 1 unit with 8 sub-units (spaced repetition)
    const refreshUnit = await prisma.curriculumUnit.upsert({
      where: { sectionId_number: { sectionId: refreshSection.id, number: 1 } },
      update: {},
      create: { sectionId: refreshSection.id, number: 1, topic: 'Spaced Repetition Practice', xpReward: 25, order: 1 },
    });

    for (let subi = 0; subi < 8; subi++) {
      await prisma.curriculumSubUnit.upsert({
        where: { unitId_number: { unitId: refreshUnit.id, number: subi + 1 } },
        update: {},
        create: {
          unitId: refreshUnit.id,
          number: subi + 1,
          title: `${SUB_UNIT_TITLES[subi]}: Daily Refresh`,
          type: SUB_UNIT_TYPES[subi],
          xpReward: 5,
          order: subi + 1,
          content: [],
        },
      });
    }

    console.log(`  ✓ ${level.code}: ${level.sections.length * 5 + 5} units seeded`);
  }
}

async function seedPhonics() {
  console.log('Seeding phonics units and sub-units...');

  const PHONICS_SUB_TYPES = [
    'listen_identify', 'listen_repeat', 'match_sound', 'minimal_pair',
    'spell_from_audio', 'read_aloud', 'tone_drill', 'challenge',
  ];
  const PHONICS_SUB_TITLES = [
    'Listen & Identify', 'Listen & Repeat', 'Match the Sound', 'Minimal Pair Drill',
    'Spell from Audio', 'Read Aloud', 'Tone Drill', 'Challenge',
  ];

  for (const pu of PHONICS_UNITS) {
    const unit = await prisma.phonicsUnit.upsert({
      where: { category_number: { category: pu.category as never, number: pu.number } },
      update: { title: pu.title, description: pu.description },
      create: { category: pu.category as never, number: pu.number, title: pu.title, description: pu.description, ipaSymbol: pu.ipaSymbol, order: pu.number },
    });

    for (let i = 0; i < 8; i++) {
      await prisma.phonicsSubUnit.upsert({
        where: { unitId_number: { unitId: unit.id, number: i + 1 } },
        update: {},
        create: {
          unitId: unit.id,
          number: i + 1,
          title: `${PHONICS_SUB_TITLES[i]}: ${pu.title}`,
          type: PHONICS_SUB_TYPES[i],
          content: [],
          order: i + 1,
        },
      });
    }
  }

  console.log(`  ✓ ${PHONICS_UNITS.length} phonics units seeded`);
}

async function main() {
  await seedCurriculum();
  await seedPhonics();
  console.log('Done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

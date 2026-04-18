import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ok, notFound, internalError } from '@/lib/api/response';
import prisma from '@/lib/prisma';
import { progressRouter } from './progress';
import { streakRouter } from './streak';
import { achievementsRouter } from './achievements';

// ── Schemas ───────────────────────────────────────────────────────────────────

const SectionSchema = z.object({
  levelCode: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  number: z.number().min(1).max(5),
  name: z.string(),
  isDailyRefresh: z.boolean().default(false),
  vocabMin: z.number(),
  vocabMax: z.number(),
});

const UnitSchema = z.object({
  sectionId: z.string(),
  number: z.number().min(1),
  topic: z.string(),
  description: z.string().optional(),
  xpReward: z.number().default(50),
});

const SubUnitSchema = z.object({
  unitId: z.string(),
  number: z.number().min(1).max(8),
  title: z.string(),
  type: z.enum(['INTRODUCTION','VOCABULARY','GRAMMAR','LISTENING','SPEAKING','READING','REVIEW','CHALLENGE']),
  xpReward: z.number().default(10),
  content: z.array(z.object({
    prompt: z.string(),
    targetZolai: z.string().optional(),
    targetEnglish: z.string().optional(),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string(),
    explanation: z.string(),
    hint: z.string().optional(),
  })),
});

const PhonicsUnitSchema = z.object({
  category: z.enum(['VOWELS','CONSONANTS','CLUSTERS','TONES','MINIMAL_PAIRS']),
  number: z.number().min(1),
  title: z.string(),
  description: z.string().optional(),
  ipaSymbol: z.string().optional(),
  audioUrl: z.string().optional(),
});

const PhonicsSubUnitSchema = z.object({
  unitId: z.string(),
  number: z.number().min(1).max(8),
  title: z.string(),
  type: z.string(),
  content: z.array(z.object({
    soundFocus: z.string(),
    exampleWords: z.array(z.string()),
    audioUrl: z.string().optional(),
    correctAnswer: z.string(),
    explanation: z.string(),
  })),
  audioUrl: z.string().optional(),
});

const LevelQuerySchema = z.object({ levelCode: z.string().optional() });
const UnitQuerySchema  = z.object({ sectionId: z.string().optional() });
const SubUnitQuerySchema = z.object({ unitId: z.string().optional() });
const PhonicsQuerySchema = z.object({ category: z.string().optional() });

// ── Router ────────────────────────────────────────────────────────────────────

const app = new Hono()

  // Levels (static — driven by CEFR spec)
  .get('/levels', async (c) => {
    const levels = [
      { code: 'A1', name: 'Beginner',           vocabMin: 60,  vocabMax: 129 },
      { code: 'A2', name: 'Elementary',          vocabMin: 130, vocabMax: 249 },
      { code: 'B1', name: 'Intermediate',        vocabMin: 250, vocabMax: 499 },
      { code: 'B2', name: 'Upper Intermediate',  vocabMin: 500, vocabMax: 999 },
      { code: 'C1', name: 'Advanced',            vocabMin: 1000, vocabMax: 1999 },
      { code: 'C2', name: 'Mastery',             vocabMin: 2000, vocabMax: 4999 },
    ];
    return ok(c, levels);
  })

  // Sections
  .get('/sections', zValidator('query', LevelQuerySchema), async (c) => {
    const { levelCode } = c.req.valid('query');
    try {
      const sections = await prisma.curriculumSection.findMany({
        where: levelCode ? { levelCode } : undefined,
        orderBy: [{ levelCode: 'asc' }, { number: 'asc' }],
        select: { id: true, levelCode: true, number: true, name: true, isDailyRefresh: true, vocabMin: true, vocabMax: true },
      });
      return ok(c, sections);
    } catch { return internalError(c); }
  })
  .post('/sections', zValidator('json', SectionSchema), async (c) => {
    const data = c.req.valid('json');
    try {
      const section = await prisma.curriculumSection.create({ data: { ...data, order: data.number } });
      return ok(c, section);
    } catch { return internalError(c); }
  })
  .get('/sections/:id', async (c) => {
    const section = await prisma.curriculumSection.findUnique({
      where: { id: c.req.param('id') },
      select: { units: { orderBy: { number: "asc" }, select: { id: true, number: true, topic: true, xpReward: true } } },
    });
    if (!section) return notFound(c);
    return ok(c, section);
  })

  // Units
  .get('/units', zValidator('query', UnitQuerySchema), async (c) => {
    const { sectionId } = c.req.valid('query');
    try {
      const units = await prisma.curriculumUnit.findMany({
        where: sectionId ? { sectionId } : undefined,
        orderBy: { number: 'asc' },
        select: { id: true, sectionId: true, number: true, topic: true, description: true, xpReward: true },
      });
      return ok(c, units);
    } catch { return internalError(c); }
  })
  .post('/units', zValidator('json', UnitSchema), async (c) => {
    const data = c.req.valid('json');
    try {
      const unit = await prisma.curriculumUnit.create({ data: { ...data, order: data.number } });
      return ok(c, unit);
    } catch { return internalError(c); }
  })
  .get('/units/:id', async (c) => {
    const unit = await prisma.curriculumUnit.findUnique({
      where: { id: c.req.param('id') },
      select: { subUnits: { orderBy: { number: "asc" }, select: { id: true, number: true, title: true, type: true, xpReward: true } } },
    });
    if (!unit) return notFound(c);
    return ok(c, unit);
  })

  // Sub-units
  .get('/sub-units', zValidator('query', SubUnitQuerySchema), async (c) => {
    const { unitId } = c.req.valid('query');
    try {
      const subUnits = await prisma.curriculumSubUnit.findMany({
        where: unitId ? { unitId } : undefined,
        orderBy: { number: 'asc' },
        select: { id: true, unitId: true, number: true, title: true, type: true, xpReward: true },
      });
      return ok(c, subUnits);
    } catch { return internalError(c); }
  })
  .post('/sub-units', zValidator('json', SubUnitSchema), async (c) => {
    const data = c.req.valid('json');
    try {
      const subUnit = await prisma.curriculumSubUnit.create({ data: { ...data, order: data.number } });
      return ok(c, subUnit);
    } catch { return internalError(c); }
  })
  .get('/sub-units/:id', async (c) => {
    const subUnit = await prisma.curriculumSubUnit.findUnique({
      where: { id: c.req.param('id') },
      select: { id: true, unitId: true, number: true, title: true, type: true, xpReward: true, content: true },
    });
    if (!subUnit) return notFound(c);
    return ok(c, subUnit);
  })

  // Phonics units
  .get('/phonics', zValidator('query', PhonicsQuerySchema), async (c) => {
    const { category } = c.req.valid('query');
    try {
      const units = await prisma.phonicsUnit.findMany({
        where: category ? { category: category as never } : undefined,
        orderBy: [{ category: 'asc' }, { number: 'asc' }],
        select: { id: true, category: true, number: true, title: true, description: true, ipaSymbol: true, audioUrl: true },
      });
      return ok(c, units);
    } catch { return internalError(c); }
  })
  .post('/phonics', zValidator('json', PhonicsUnitSchema), async (c) => {
    const data = c.req.valid('json');
    try {
      const unit = await prisma.phonicsUnit.create({ data: { ...data, order: data.number } });
      return ok(c, unit);
    } catch { return internalError(c); }
  })
  .get('/phonics/:id', async (c) => {
    const unit = await prisma.phonicsUnit.findUnique({
      where: { id: c.req.param('id') },
      select: { subUnits: { orderBy: { number: "asc" }, select: { id: true, number: true, title: true, type: true } } },
    });
    if (!unit) return notFound(c);
    return ok(c, unit);
  })

  // Phonics sub-units
  .post('/phonics-sub-units', zValidator('json', PhonicsSubUnitSchema), async (c) => {
    const data = c.req.valid('json');
    try {
      const subUnit = await prisma.phonicsSubUnit.create({ data: { ...data, order: data.number } });
      return ok(c, subUnit);
    } catch { return internalError(c); }
  })
  .get('/phonics-sub-units/:id', async (c) => {
    const subUnit = await prisma.phonicsSubUnit.findUnique({
      where: { id: c.req.param('id') },
      select: { id: true, unitId: true, number: true, title: true, type: true, content: true, audioUrl: true },
    });
    if (!subUnit) return notFound(c);
    return ok(c, subUnit);
  })

  // Workflow status
  .get('/workflow/status', async (c) => {
    try {
      const [sections, units, subUnits, phonicsUnits] = await Promise.all([
        prisma.curriculumSection.count(),
        prisma.curriculumUnit.count(),
        prisma.curriculumSubUnit.count(),
        prisma.phonicsUnit.count(),
      ]);
      return ok(c, { sections, units, subUnits, phonicsUnits, phase: 1, week: 1 });
    } catch { return internalError(c); }
  })

  // Progress routes
  .route('/progress', progressRouter)

  // Streak routes
  .route('/streak', streakRouter)

  // Achievements routes
  .route('/achievements', achievementsRouter);

export type CurriculumAPI = typeof app;
export default app;

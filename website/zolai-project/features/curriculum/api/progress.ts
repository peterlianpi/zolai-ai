import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ok, internalError, unauthorized } from '@/lib/api/response';
import { getSessionFromContext } from '@/lib/auth/server-guards';
import prisma from '@/lib/prisma';

const ProgressSchema = z.object({
  subUnitId: z.string(),
  completed: z.boolean().default(false),
  score: z.number().min(0).max(100).optional(),
  attempts: z.number().min(1).default(1),
});

const PhonicsProgressSchema = z.object({
  phonicsSubUnitId: z.string(),
  completed: z.boolean().default(false),
  score: z.number().min(0).max(100).optional(),
  attempts: z.number().min(1).default(1),
});

export const progressRouter = new Hono()
  .get('/curriculum/:subUnitId', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user?.id) return unauthorized(c, 'Authentication required');

    try {
      const subUnitId = c.req.param('subUnitId');
      const progress = await prisma.userSubUnitProgress.findUnique({
        where: { userId_subUnitId: { userId: session.user.id, subUnitId } },
      });
      return ok(c, progress || { subUnitId, completed: false, score: 0, attempts: 0 });
    } catch {
      return internalError(c, 'Failed to fetch progress');
    }
  })

  .post('/curriculum/:subUnitId', zValidator('json', ProgressSchema), async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user?.id) return unauthorized(c, 'Authentication required');

    try {
      const subUnitId = c.req.param('subUnitId');
      const data = c.req.valid('json');

      const progress = await prisma.userSubUnitProgress.upsert({
        where: { userId_subUnitId: { userId: session.user.id, subUnitId } },
        create: { userId: session.user.id, subUnitId, ...data },
        update: {
          completed: data.completed,
          score: data.score,
          attempts: data.attempts,
          completedAt: data.completed ? new Date() : undefined,
        },
      });

      // Award XP if completed
      if (data.completed && !progress.completed) {
        const subUnit = await prisma.curriculumSubUnit.findUnique({
          where: { id: subUnitId },
          select: { xpReward: true },
        });
        if (subUnit) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: { xp: { increment: subUnit.xpReward } },
          });
        }
      }

      return ok(c, progress);
    } catch {
      return internalError(c, 'Failed to update progress');
    }
  })

  .get('/phonics/:phonicsSubUnitId', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user?.id) return unauthorized(c, 'Authentication required');

    try {
      const phonicsSubUnitId = c.req.param('phonicsSubUnitId');
      const progress = await prisma.userPhonicsProgress.findUnique({
        where: { userId_phonicsSubUnitId: { userId: session.user.id, phonicsSubUnitId } },
      });
      return ok(c, progress || { phonicsSubUnitId, completed: false, score: 0, attempts: 0 });
    } catch {
      return internalError(c, 'Failed to fetch phonics progress');
    }
  })

  .post('/phonics/:phonicsSubUnitId', zValidator('json', PhonicsProgressSchema), async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user?.id) return unauthorized(c, 'Authentication required');

    try {
      const phonicsSubUnitId = c.req.param('phonicsSubUnitId');
      const data = c.req.valid('json');

      const progress = await prisma.userPhonicsProgress.upsert({
        where: { userId_phonicsSubUnitId: { userId: session.user.id, phonicsSubUnitId } },
        create: { userId: session.user.id, phonicsSubUnitId, ...data },
        update: {
          completed: data.completed,
          score: data.score,
          attempts: data.attempts,
          completedAt: data.completed ? new Date() : undefined,
        },
      });

      return ok(c, progress);
    } catch {
      return internalError(c, 'Failed to update phonics progress');
    }
  })

  .get('/stats', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user?.id) return unauthorized(c, 'Authentication required');

    try {
      const [completed, total, avgScore, xp] = await Promise.all([
        prisma.userSubUnitProgress.count({
          where: { userId: session.user.id, completed: true },
        }),
        prisma.userSubUnitProgress.count({
          where: { userId: session.user.id },
        }),
        prisma.userSubUnitProgress.aggregate({
          where: { userId: session.user.id, score: { not: null } },
          _avg: { score: true },
        }),
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: { xp: true },
        }),
      ]);

      return ok(c, {
        completed,
        total,
        avgScore: avgScore._avg.score || 0,
        xp: xp?.xp || 0,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    } catch {
      return internalError(c, 'Failed to fetch stats');
    }
  });

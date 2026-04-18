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
      return ok(c, progress || { subUnitId, status: 'NOT_STARTED', score: 0, attempts: 0 });
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
      const status = data.completed ? 'COMPLETE' : 'IN_PROGRESS';

      const existing = await prisma.userSubUnitProgress.findUnique({
        where: { userId_subUnitId: { userId: session.user.id, subUnitId } },
      });

      const subUnit = data.completed
        ? await prisma.curriculumSubUnit.findUnique({ where: { id: subUnitId }, select: { xpReward: true } })
        : null;
      const xpEarned = (data.completed && !existing?.completedAt) ? (subUnit?.xpReward ?? 0) : (existing?.xpEarned ?? 0);

      const progress = await prisma.userSubUnitProgress.upsert({
        where: { userId_subUnitId: { userId: session.user.id, subUnitId } },
        create: { userId: session.user.id, subUnitId, status, score: data.score ?? 0, attempts: data.attempts, xpEarned, completedAt: data.completed ? new Date() : null },
        update: { status, score: data.score ?? existing?.score ?? 0, attempts: data.attempts, xpEarned, completedAt: data.completed ? (existing?.completedAt ?? new Date()) : null },
      });

      return ok(c, progress);
    } catch {
      return internalError(c, 'Failed to update progress');
    }
  })

  .get('/phonics/:phonicsSubUnitId', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user?.id) return unauthorized(c, 'Authentication required');

    try {
      const subUnitId = c.req.param('phonicsSubUnitId');
      const progress = await prisma.userPhonicsProgress.findUnique({
        where: { userId_subUnitId: { userId: session.user.id, subUnitId } },
      });
      return ok(c, progress || { subUnitId, status: 'NOT_STARTED', score: 0 });
    } catch {
      return internalError(c, 'Failed to fetch phonics progress');
    }
  })

  .post('/phonics/:phonicsSubUnitId', zValidator('json', PhonicsProgressSchema), async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user?.id) return unauthorized(c, 'Authentication required');

    try {
      const subUnitId = c.req.param('phonicsSubUnitId');
      const data = c.req.valid('json');
      const status = data.completed ? 'COMPLETE' : 'IN_PROGRESS';

      const progress = await prisma.userPhonicsProgress.upsert({
        where: { userId_subUnitId: { userId: session.user.id, subUnitId } },
        create: { userId: session.user.id, subUnitId, status, score: data.score ?? 0, completedAt: data.completed ? new Date() : null },
        update: { status, score: data.score ?? 0, completedAt: data.completed ? new Date() : null },
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
      const [completed, total, avgScore, totalXp] = await Promise.all([
        prisma.userSubUnitProgress.count({ where: { userId: session.user.id, status: 'COMPLETE' } }),
        prisma.userSubUnitProgress.count({ where: { userId: session.user.id } }),
        prisma.userSubUnitProgress.aggregate({
          where: { userId: session.user.id, score: { not: 0 } },
          _avg: { score: true },
        }),
        prisma.userSubUnitProgress.aggregate({
          where: { userId: session.user.id },
          _sum: { xpEarned: true },
        }),
      ]);

      return ok(c, {
        completed,
        total,
        avgScore: avgScore._avg?.score ?? 0,
        xp: totalXp._sum?.xpEarned ?? 0,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    } catch {
      return internalError(c, 'Failed to fetch stats');
    }
  });

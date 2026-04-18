import { Hono } from 'hono';
import { ok, internalError, unauthorized } from '@/lib/api/response';
import { getSessionFromContext } from '@/lib/auth/server-guards';
import prisma from '@/lib/prisma';

export const streakRouter = new Hono()
  .get('/current', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user?.id) return unauthorized(c, 'Authentication required');

    try {
      const streak = await prisma.userStreak.findUnique({ where: { userId: session.user.id } });
      return ok(c, streak || { currentStreak: 0, longestStreak: 0, lastActivityAt: null });
    } catch {
      return internalError(c, 'Failed to fetch streak');
    }
  })

  .post('/check-in', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user?.id) return unauthorized(c, 'Authentication required');

    try {
      const streak = await prisma.userStreak.findUnique({ where: { userId: session.user.id } });

      const now = new Date();
      const lastActivity = streak?.lastActivityAt ? new Date(streak.lastActivityAt) : null;
      const daysSince = lastActivity
        ? Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      let newStreak = streak?.currentStreak || 0;
      let newLongest = streak?.longestStreak || 0;

      if (daysSince === null || daysSince === 0) {
        newStreak = streak?.currentStreak || 1;
      } else if (daysSince === 1) {
        newStreak = (streak?.currentStreak || 0) + 1;
      } else {
        newStreak = 1;
      }

      if (newStreak > (streak?.longestStreak || 0)) newLongest = newStreak;

      const updated = await prisma.userStreak.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id, currentStreak: newStreak, longestStreak: newLongest, lastActivityAt: now },
        update: { currentStreak: newStreak, longestStreak: newLongest, lastActivityAt: now },
      });

      return ok(c, {
        ...updated,
        streakContinued: daysSince === null || daysSince <= 1,
        bonus: newStreak % 7 === 0 ? 50 : 0,
      });
    } catch {
      return internalError(c, 'Failed to check in');
    }
  })

  .get('/daily-refresh', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user?.id) return unauthorized(c, 'Authentication required');

    try {
      const levelCode = c.req.query('level') || 'A1';
      const section = await prisma.curriculumSection.findFirst({
        where: { levelCode, isDailyRefresh: true },
        include: {
          units: {
            take: 1,
            select: {
              id: true,
              topic: true,
              subUnits: { select: { id: true, type: true, title: true, content: true } },
            },
          },
        },
      });

      if (!section?.units[0]) return ok(c, { message: 'No daily refresh available' });

      return ok(c, {
        section: { id: section.id, name: section.name },
        unit: section.units[0],
      });
    } catch {
      return internalError(c, 'Failed to fetch daily refresh');
    }
  });

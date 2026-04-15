import { Hono } from 'hono';
import { ok, internalError, unauthorized } from '@/lib/api/response';
import { getSessionFromContext } from '@/lib/auth/server-guards';
import prisma from '@/lib/prisma';

export const streakRouter = new Hono()
  .get('/current', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user?.id) return unauthorized(c, 'Authentication required');

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { currentStreak: true, longestStreak: true, lastActivityAt: true },
      });
      return ok(c, user || { currentStreak: 0, longestStreak: 0, lastActivityAt: null });
    } catch {
      return internalError(c, 'Failed to fetch streak');
    }
  })

  .post('/check-in', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user?.id) return unauthorized(c, 'Authentication required');

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { currentStreak: true, longestStreak: true, lastActivityAt: true },
      });

      const now = new Date();
      const lastActivity = user?.lastActivityAt ? new Date(user.lastActivityAt) : null;
      const daysSinceLastActivity = lastActivity
        ? Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      let newStreak = user?.currentStreak || 0;
      let newLongest = user?.longestStreak || 0;

      // Check if streak continues (activity within last 24 hours) or resets
      if (daysSinceLastActivity === null || daysSinceLastActivity === 0) {
        // Already checked in today
        newStreak = user?.currentStreak || 1;
      } else if (daysSinceLastActivity === 1) {
        // Streak continues
        newStreak = (user?.currentStreak || 0) + 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }

      // Update longest streak
      if (newStreak > (user?.longestStreak || 0)) {
        newLongest = newStreak;
      }

      const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActivityAt: now,
        },
        select: { currentStreak: true, longestStreak: true, lastActivityAt: true },
      });

      return ok(c, {
        ...updated,
        streakContinued: daysSinceLastActivity === null || daysSinceLastActivity <= 1,
        bonus: newStreak % 7 === 0 ? 50 : 0, // 50 XP bonus every 7 days
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
              subUnits: {
                select: { id: true, type: true, title: true, content: true },
              },
            },
          },
        },
      });

      if (!section?.units[0]) {
        return ok(c, { message: 'No daily refresh available' });
      }

      return ok(c, {
        section: { id: section.id, name: section.name },
        unit: section.units[0],
      });
    } catch {
      return internalError(c, 'Failed to fetch daily refresh');
    }
  });

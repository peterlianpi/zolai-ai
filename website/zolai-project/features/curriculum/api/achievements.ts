import { Hono } from 'hono';
import { ok, internalError, unauthorized } from '@/lib/api/response';
import { getSessionFromContext } from '@/lib/auth/server-guards';
import prisma from '@/lib/prisma';

const ACHIEVEMENTS = {
  FIRST_LESSON:       { id: 'first_lesson',    name: 'First Steps',        description: 'Complete your first lesson',              xp: 10  },
  PERFECT_SCORE:      { id: 'perfect_score',   name: 'Perfect',            description: 'Score 100% on a lesson',                  xp: 50  },
  STREAK_7:           { id: 'streak_7',        name: 'Week Warrior',       description: 'Maintain a 7-day streak',                 xp: 75  },
  STREAK_30:          { id: 'streak_30',       name: 'Month Master',       description: 'Maintain a 30-day streak',                xp: 200 },
  PHONICS_MASTER:     { id: 'phonics_master',  name: 'Sound Expert',       description: 'Complete all phonics categories',         xp: 150 },
};

export const achievementsRouter = new Hono()
  .get('/list', async (c) => {
    return ok(c, Object.values(ACHIEVEMENTS));
  })

  .post('/check', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user?.id) return unauthorized(c, 'Authentication required');

    try {
      const [subUnitProgress, phonicsProgress, streak] = await Promise.all([
        prisma.userSubUnitProgress.findMany({
          where: { userId: session.user.id, status: 'COMPLETE' },
          select: { id: true, score: true },
        }),
        prisma.userPhonicsProgress.count({ where: { userId: session.user.id, status: 'COMPLETE' } }),
        prisma.userStreak.findUnique({ where: { userId: session.user.id } }),
      ]);

      const newAchievements: string[] = [];

      if (subUnitProgress.length === 1) newAchievements.push('first_lesson');
      if (subUnitProgress.some(p => p.score === 100)) newAchievements.push('perfect_score');
      if ((streak?.currentStreak ?? 0) >= 7) newAchievements.push('streak_7');
      if ((streak?.currentStreak ?? 0) >= 30) newAchievements.push('streak_30');
      if (phonicsProgress >= 40) newAchievements.push('phonics_master');

      const totalXp = newAchievements.reduce((sum, id) => {
        const a = ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS];
        return sum + (a?.xp ?? 0);
      }, 0);

      return ok(c, { newAchievements, totalXp });
    } catch {
      return internalError(c, 'Failed to check achievements');
    }
  });

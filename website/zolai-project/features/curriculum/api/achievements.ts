import { Hono } from 'hono';
import { ok, internalError, unauthorized } from '@/lib/api/response';
import { getSessionFromContext } from '@/lib/auth/server-guards';
import prisma from '@/lib/prisma';

const ACHIEVEMENTS = {
  FIRST_LESSON: { id: 'first_lesson', name: 'First Steps', description: 'Complete your first lesson', xp: 10 },
  LEVEL_COMPLETE: { id: 'level_complete', name: 'Level Master', description: 'Complete all units in a level', xp: 100 },
  PERFECT_SCORE: { id: 'perfect_score', name: 'Perfect', description: 'Score 100% on a lesson', xp: 50 },
  STREAK_7: { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', xp: 75 },
  STREAK_30: { id: 'streak_30', name: 'Month Master', description: 'Maintain a 30-day streak', xp: 200 },
  PHONICS_MASTER: { id: 'phonics_master', name: 'Sound Expert', description: 'Complete all phonics categories', xp: 150 },
  VOCABULARY_EXPERT: { id: 'vocab_expert', name: 'Vocabulary Expert', description: 'Learn 500+ words', xp: 100 },
  GRAMMAR_GURU: { id: 'grammar_guru', name: 'Grammar Guru', description: 'Complete all grammar lessons', xp: 100 },
};

export const achievementsRouter = new Hono()
  .get('/list', async (c) => {
    return ok(c, Object.values(ACHIEVEMENTS));
  })

  .get('/user', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user?.id) return unauthorized(c, 'Authentication required');

    try {
      const achievements = await prisma.userAchievement.findMany({
        where: { userId: session.user.id },
        orderBy: { unlockedAt: 'desc' },
      });
      return ok(c, achievements);
    } catch {
      return internalError(c, 'Failed to fetch achievements');
    }
  })

  .post('/check', async (c) => {
    const session = await getSessionFromContext(c);
    if (!session?.user?.id) return unauthorized(c, 'Authentication required');

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          xp: true,
          currentStreak: true,
          longestStreak: true,
          userAchievements: { select: { achievementId: true } },
          subUnitProgress: { where: { completed: true }, select: { id: true, score: true } },
          phonicsProgress: { where: { completed: true }, select: { id: true } },
        },
      });

      if (!user) return internalError(c, 'User not found');

      const unlockedIds = new Set(user.userAchievements.map(a => a.achievementId));
      const newAchievements: string[] = [];

      // Check achievements
      if (user.subUnitProgress.length === 1 && !unlockedIds.has('first_lesson')) {
        newAchievements.push('first_lesson');
      }

      if (user.subUnitProgress.some(p => p.score === 100) && !unlockedIds.has('perfect_score')) {
        newAchievements.push('perfect_score');
      }

      if (user.currentStreak >= 7 && !unlockedIds.has('streak_7')) {
        newAchievements.push('streak_7');
      }

      if (user.currentStreak >= 30 && !unlockedIds.has('streak_30')) {
        newAchievements.push('streak_30');
      }

      if (user.phonicsProgress.length >= 40 && !unlockedIds.has('phonics_master')) {
        newAchievements.push('phonics_master');
      }

      // Award XP for new achievements
      let totalXp = 0;
      for (const id of newAchievements) {
        const achievement = ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS];
        if (achievement) {
          totalXp += achievement.xp;
          await prisma.userAchievement.create({
            data: { userId: session.user.id, achievementId: id, unlockedAt: new Date() },
          });
        }
      }

      if (totalXp > 0) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { xp: { increment: totalXp } },
        });
      }

      return ok(c, { newAchievements, totalXp });
    } catch {
      return internalError(c, 'Failed to check achievements');
    }
  });

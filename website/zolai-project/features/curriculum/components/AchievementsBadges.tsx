'use client';

import { useAchievements } from '../hooks/useAchievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Lock } from 'lucide-react';

const ICON_MAP: Record<string, string> = {
  first_lesson: '🎯',
  level_complete: '🏆',
  perfect_score: '⭐',
  streak_7: '🔥',
  streak_30: '🌟',
  phonics_master: '🎵',
  vocab_expert: '📚',
  grammar_guru: '📖',
};

export function AchievementsBadges() {
  const { achievements, userAchievements, loading, isUnlocked } = useAchievements();

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements ({unlockedCount}/{totalCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {achievements.map(achievement => {
            const unlocked = isUnlocked(achievement.id);
            const icon = ICON_MAP[achievement.id] || '🏅';

            return (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border-2 transition-all ${
                  unlocked
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="text-2xl mb-1">{icon}</div>
                <p className="font-semibold text-sm">{achievement.name}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant={unlocked ? 'default' : 'secondary'} className="text-xs">
                    +{achievement.xp} XP
                  </Badge>
                  {!unlocked && <Lock className="h-3 w-3 text-gray-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

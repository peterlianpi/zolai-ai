'use client';

import { useStreak } from '../hooks/useStreak';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Trophy } from 'lucide-react';

export function StreakBadge() {
  const { streak, checkIn } = useStreak();

  if (!streak) return null;

  const handleCheckIn = async () => {
    const result = await checkIn();
    if (result?.bonus) {
      // Show bonus toast
      console.log(`🎉 +${result.bonus} XP bonus!`);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">{streak.currentStreak}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Longest Streak</p>
                <p className="text-2xl font-bold text-yellow-600">{streak.longestStreak}</p>
              </div>
            </div>
          </div>

          <Button onClick={handleCheckIn} variant="default" size="sm">
            Daily Check-in
          </Button>
        </div>

        {streak.currentStreak % 7 === 0 && streak.currentStreak > 0 && (
          <p className="text-sm text-green-600 mt-2">🎁 Milestone! +50 XP bonus</p>
        )}
      </CardContent>
    </Card>
  );
}

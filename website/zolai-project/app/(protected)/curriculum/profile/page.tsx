'use client';

import { ProgressDashboard } from '@/features/curriculum/components/ProgressDashboard';
import { StreakBadge } from '@/features/curriculum/components/StreakBadge';
import { AchievementsBadges } from '@/features/curriculum/components/AchievementsBadges';

export default function ProfilePage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Your Progress</h1>
        <p className="text-muted-foreground">Track your learning journey</p>
      </div>

      <StreakBadge />
      <ProgressDashboard />
      <AchievementsBadges />
    </div>
  );
}

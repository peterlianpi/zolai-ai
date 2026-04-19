'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/api/client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  xp: number;
}

interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: string;
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [listRes, userRes] = await Promise.all([
          client.api.curriculum.achievements.list.$get(),
          client.api.curriculum.achievements.user.$get(),
        ]);
        const [listData, userData] = await Promise.all([listRes.json(), userRes.json()]);
        setAchievements(listData.data);
        setUserAchievements(userData.data);
      } catch (err) {
        console.error('Failed to fetch achievements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const checkAchievements = async () => {
    try {
      const res = await client.api.curriculum.achievements.check.$post();
      const data = await res.json();
      
      // Refresh user achievements
      const userRes = await client.api.curriculum.achievements.user.$get();
      const userData = await userRes.json();
      setUserAchievements(userData.data);
      
      return data.data;
    } catch (err) {
      console.error('Failed to check achievements:', err);
      return null;
    }
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(a => a.achievementId === achievementId);
  };

  return { achievements, userAchievements, loading, checkAchievements, isUnlocked };
}

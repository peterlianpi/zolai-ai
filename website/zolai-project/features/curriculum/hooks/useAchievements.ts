'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/api/client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  xp: number;
}

type ApiResponse<T> = { success: boolean; data: T };

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await client.api.curriculum.achievements.list.$get();
        const json = await res.json() as unknown as ApiResponse<Achievement[]>;
        setAchievements(json.data);
      } catch (_err) {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const checkAchievements = async () => {
    try {
      const res = await client.api.curriculum.achievements.check.$post();
      const json = await res.json() as unknown as ApiResponse<{ newAchievements: string[]; totalXp: number }>;
      if (json.data?.newAchievements) {
        setUserAchievements(prev => [...new Set([...prev, ...json.data.newAchievements])]);
      }
      return json.data;
    } catch (_err) {
      return null;
    }
  };

  const isUnlocked = (id: string) => userAchievements.includes(id);

  return { achievements, userAchievements, loading, checkAchievements, isUnlocked };
}

'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/api/client';

interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: string | null;
}

interface CheckInResult extends Streak {
  streakContinued: boolean;
  bonus: number;
}

interface DailyRefresh {
  section: { id: string; name: string };
  unit: {
    id: string;
    topic: string;
    subUnits: Array<{
      id: string;
      type: string;
      title: string;
      content: unknown;
    }>;
  };
}

export function useStreak() {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await client.api.curriculum.streak.current.$get();
        const data = await res.json();
        setStreak(data.data);
      } catch (err) {
        console.error('Failed to fetch streak:', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const checkIn = async (): Promise<CheckInResult | null> => {
    try {
      const res = await client.api.curriculum.streak['check-in'].$post();
      const data = await res.json();
      setStreak(data.data);
      return data.data;
    } catch (err) {
      console.error('Failed to check in:', err);
      return null;
    }
  };

  return { streak, loading, checkIn };
}

export function useDailyRefresh(levelCode: string = 'A1') {
  const [daily, setDaily] = useState<DailyRefresh | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await client.api.curriculum.streak['daily-refresh'].$get({
          query: { level: levelCode },
        });
        const data = await res.json();
        setDaily(data.data);
      } catch (err) {
        console.error('Failed to fetch daily refresh:', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [levelCode]);

  return { daily, loading };
}

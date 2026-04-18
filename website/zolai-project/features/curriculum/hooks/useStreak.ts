'use client';

import { useState } from 'react';
import { client } from '@/lib/api/client';
import { checkInStreak as _serverCheckInStreak } from '@/features/curriculum/server/actions';

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
  unit: { id: string; topic: string; subUnits: Array<{ id: string; type: string; title: string; content: unknown }> };
}

type ApiResponse<T> = { success: boolean; data: T };

export function useStreak() {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStreak = async () => {
    try {
      const res = await client.api.curriculum.streak.current.$get();
      const json = await res.json() as unknown as ApiResponse<Streak>;
      setStreak(json.data);
    } catch (_err) {
    } finally {
      setLoading(false);
    }
  };

  const checkIn = async (): Promise<CheckInResult | null> => {
    try {
      const res = await client.api.curriculum.streak['check-in'].$post();
      const json = await res.json() as unknown as ApiResponse<CheckInResult>;
      setStreak(json.data);
      return json.data;
    } catch (_err) {
      return null;
    }
  };

  return { streak, loading, checkIn, fetchStreak };
}

export function useDailyRefresh(levelCode: string = 'A1') {
  const [daily, setDaily] = useState<DailyRefresh | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDailyRefresh = async () => {
    try {
      const res = await client.api.curriculum.streak['daily-refresh'].$get({ query: { level: levelCode } });
      const json = await res.json() as unknown as ApiResponse<DailyRefresh>;
      setDaily(json.data);
    } catch (_err) {
    } finally {
      setLoading(false);
    }
  };

  return { daily, loading, fetchDailyRefresh };
}

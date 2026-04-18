'use client';

import { useState } from 'react';
import { client } from '@/lib/api/client';
import { updateProgress as _serverUpdateProgress, checkInStreak as _serverCheckInStreak, updatePhonicsProgress as _serverUpdatePhonicsProgress } from '@/features/curriculum/server/actions';

interface Progress {
  subUnitId?: string;
  status?: string;
  completed?: boolean;
  score: number;
  attempts?: number;
  completedAt?: string | null;
}

interface Stats {
  completed: number;
  total: number;
  avgScore: number;
  xp: number;
  completionRate: number;
}

type ApiResponse<T> = { success: boolean; data: T };

export function useProgress(subUnitId: string | null) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProgress = async () => {
    if (!subUnitId) return;
    setLoading(true);
    try {
      const res = await client.api.curriculum.progress.curriculum[':subUnitId'].$get({ param: { subUnitId } });
      const json = await res.json() as unknown as ApiResponse<Progress>;
      setProgress(json.data);
    } catch (_err) {
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<Progress>) => {
    if (!subUnitId) return;
    setLoading(true);
    try {
      const res = await client.api.curriculum.progress.curriculum[':subUnitId'].$post({
        param: { subUnitId },
        json: { subUnitId, completed: updates.completed ?? false, score: updates.score, attempts: updates.attempts ?? 1 },
      });
      const json = await res.json() as unknown as ApiResponse<Progress>;
      setProgress(json.data);
      return json.data;
    } catch (_err) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { progress, loading, updateProgress, fetchProgress };
}

export function usePhonicsProgress(phonicsSubUnitId: string | null) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProgress = async () => {
    if (!phonicsSubUnitId) return;
    setLoading(true);
    try {
      const res = await client.api.curriculum.progress.phonics[':phonicsSubUnitId'].$get({ param: { phonicsSubUnitId } });
      const json = await res.json() as unknown as ApiResponse<Progress>;
      setProgress(json.data);
    } catch (_err) {
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<Progress>) => {
    if (!phonicsSubUnitId) return;
    setLoading(true);
    try {
      const res = await client.api.curriculum.progress.phonics[':phonicsSubUnitId'].$post({
        param: { phonicsSubUnitId },
        json: { phonicsSubUnitId, completed: updates.completed ?? false, score: updates.score, attempts: updates.attempts ?? 1 },
      });
      const json = await res.json() as unknown as ApiResponse<Progress>;
      setProgress(json.data);
      return json.data;
    } catch (_err) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { progress, loading, updateProgress, fetchProgress };
}

export function useProgressStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await client.api.curriculum.progress.stats.$get();
      const json = await res.json() as unknown as ApiResponse<Stats>;
      setStats(json.data);
    } catch (_err) {
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, fetchStats };
}

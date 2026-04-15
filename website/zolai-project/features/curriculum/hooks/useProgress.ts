'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/api/client';

interface Progress {
  subUnitId?: string;
  phonicsSubUnitId?: string;
  completed: boolean;
  score: number;
  attempts: number;
  completedAt?: string;
}

interface Stats {
  completed: number;
  total: number;
  avgScore: number;
  xp: number;
  completionRate: number;
}

export function useProgress(subUnitId: string | null) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subUnitId) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const res = await client.api.curriculum.progress.curriculum[':subUnitId'].$get({
          param: { subUnitId },
        });
        const data = await res.json();
        setProgress(data.data);
      } catch (err) {
        console.error('Failed to fetch progress:', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [subUnitId]);

  const updateProgress = async (updates: Partial<Progress>) => {
    if (!subUnitId) return;
    try {
      const res = await client.api.curriculum.progress.curriculum[':subUnitId'].$post({
        param: { subUnitId },
        json: { ...progress, ...updates },
      });
      const data = await res.json();
      setProgress(data.data);
      return data.data;
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  return { progress, loading, updateProgress };
}

export function usePhonicsProgress(phonicsSubUnitId: string | null) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!phonicsSubUnitId) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const res = await client.api.curriculum.progress.phonics[':phonicsSubUnitId'].$get({
          param: { phonicsSubUnitId },
        });
        const data = await res.json();
        setProgress(data.data);
      } catch (err) {
        console.error('Failed to fetch phonics progress:', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [phonicsSubUnitId]);

  const updateProgress = async (updates: Partial<Progress>) => {
    if (!phonicsSubUnitId) return;
    try {
      const res = await client.api.curriculum.progress.phonics[':phonicsSubUnitId'].$post({
        param: { phonicsSubUnitId },
        json: { ...progress, ...updates },
      });
      const data = await res.json();
      setProgress(data.data);
      return data.data;
    } catch (err) {
      console.error('Failed to update phonics progress:', err);
    }
  };

  return { progress, loading, updateProgress };
}

export function useProgressStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await client.api.curriculum.progress.stats.$get();
        const data = await res.json();
        setStats(data.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { stats, loading };
}

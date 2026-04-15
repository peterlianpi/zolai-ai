'use client';

import { useProgressStats } from '../hooks/useProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function ProgressDashboard() {
  const { stats, loading } = useProgressStats();

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!stats) {
    return <div className="text-center py-12 text-muted-foreground">No progress data</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completed}</div>
          <p className="text-xs text-muted-foreground">of {stats.total} sub-units</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completionRate}%</div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(stats.avgScore)}%</div>
          <p className="text-xs text-muted-foreground">across all exercises</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">XP Earned</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.xp}</div>
          <p className="text-xs text-muted-foreground">total experience points</p>
        </CardContent>
      </Card>
    </div>
  );
}

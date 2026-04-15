'use client';

import { useDailyRefresh } from '../hooks/useStreak';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';
import Link from 'next/link';

export function DailyRefresh({ levelCode = 'A1' }: { levelCode?: string }) {
  const { daily, loading } = useDailyRefresh(levelCode);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (!daily) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Daily Refresh
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Today&apos;s lesson</p>
          <p className="text-lg font-semibold">{daily.unit.topic}</p>
        </div>

        <div className="space-y-2">
          {daily.unit.subUnits.map(su => (
            <div key={su.id} className="text-sm p-2 bg-white rounded border">
              <span className="font-medium">{su.type}</span>
              <span className="text-muted-foreground ml-2">{su.title}</span>
            </div>
          ))}
        </div>

        <Link href={`/curriculum/unit/${daily.unit.id}`}>
          <Button className="w-full">Start Daily Lesson</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

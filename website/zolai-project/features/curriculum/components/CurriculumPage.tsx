'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { StreakBadge } from './StreakBadge';
import { DailyRefresh } from './DailyRefresh';

type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

interface Section { id: string; title: string; description: string; sectionNumber: number }
interface Unit { id: string; topic: string }

function SectionCard({ section }: { section: Section }) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [expanded, setExpanded] = useState(false);

  const handleExpand = async () => {
    if (!expanded && units.length === 0) {
      const res = await client.api.curriculum.units.$get({ query: { sectionId: section.id } });
      const json = await res.json() as unknown as { data: Unit[] };
      setUnits(json.data || []);
    }
    setExpanded(!expanded);
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleExpand}>
      <CardHeader>
        <CardTitle className="text-lg">{section.title}</CardTitle>
        <CardDescription>{section.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="inline-block px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded">
          {section.sectionNumber} of 5
        </div>
        {expanded && (
          <div className="mt-4 space-y-2">
            {units.map(unit => (
              <div key={unit.id} className="text-sm p-2 bg-muted rounded">
                <a href={`/curriculum/unit/${unit.id}`} className="font-medium hover:underline">{unit.topic}</a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CurriculumPage() {
  const [selectedLevel, setSelectedLevel] = useState<Level>('A1');
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const r = await client.api.curriculum.sections.$get({ query: { levelCode: selectedLevel } });
        const json = await r.json() as { data: Section[] };
        if (!cancelled) setSections(json.data || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [selectedLevel]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Curriculum</h1>
        <p className="text-muted-foreground">Learn Zolai from A1 (Beginner) to C2 (Mastery)</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><StreakBadge /></div>
        <DailyRefresh levelCode={selectedLevel} />
      </div>
      <div className="flex gap-2 flex-wrap">
        {LEVELS.map(level => (
          <Button key={level} variant={selectedLevel === level ? 'default' : 'outline'} onClick={() => setSelectedLevel(level)}>{level}</Button>
        ))}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map(section => <SectionCard key={section.id} section={section} />)}
        </div>
      )}
    </div>
  );
}

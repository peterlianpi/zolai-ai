'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { StreakBadge } from '@/features/curriculum/components/StreakBadge';
import { DailyRefresh } from '@/features/curriculum/components/DailyRefresh';

type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

interface Section {
  id: string;
  title: string;
  description: string;
  sectionNumber: number;
}

interface Unit {
  id: string;
  topic: string;
}

export default function CurriculumPage() {
  const [selectedLevel, setSelectedLevel] = useState<Level>('A1');
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      try {
        const res = await client.api.curriculum.sections.$get({ query: { levelCode: selectedLevel } });
        const data = await res.json();
        setSections(data.data || []);
      } catch (err) {
        console.error('Failed to fetch sections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, [selectedLevel]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Curriculum</h1>
        <p className="text-muted-foreground">Learn Zolai from A1 (Beginner) to C2 (Mastery)</p>
      </div>

      {/* Streak & Daily Refresh */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StreakBadge />
        </div>
        <DailyRefresh levelCode={selectedLevel} />
      </div>

      {/* Level selector */}
      <div className="flex gap-2 flex-wrap">
        {LEVELS.map(level => (
          <Button
            key={level}
            variant={selectedLevel === level ? 'default' : 'outline'}
            onClick={() => setSelectedLevel(level)}
          >
            {level}
          </Button>
        ))}
      </div>

      {/* Sections grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map(section => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionCard({ section }: { section: Section }) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [expanded, setExpanded] = useState(false);

  const handleExpand = async () => {
    if (!expanded && units.length === 0) {
      try {
        const res = await client.api.curriculum.units.$get({ query: { sectionId: section.id } });
        const data = await res.json();
        setUnits((data.data as Unit[]) || []);
      } catch (err) {
        console.error('Failed to fetch units:', err);
      }
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
                <a href={`/curriculum/unit/${unit.id}`} className="font-medium hover:underline">
                  {unit.topic}
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

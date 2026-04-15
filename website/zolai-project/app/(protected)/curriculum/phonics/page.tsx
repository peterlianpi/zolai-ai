'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Volume2 } from 'lucide-react';

const CATEGORIES = ['VOWELS', 'CONSONANTS', 'CLUSTERS', 'TONES', 'MINIMAL_PAIRS'];

interface PhonicsExercise {
  soundFocus: string;
  exampleWords: string[];
  explanation: string;
}

interface PhonicsUnit {
  id: string;
  title: string;
  content: PhonicsExercise[];
}

export default function PhonicsPage() {
  const [selectedCategory, setSelectedCategory] = useState('VOWELS');
  const [units, setUnits] = useState<PhonicsUnit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await client.api.curriculum['phonics-sub-units'].$get({
          query: { category: selectedCategory },
        });
        const data = await res.json();
        setUnits((data.data as PhonicsUnit[]) || []);
      } catch (err) {
        console.error('Failed to fetch phonics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedCategory]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Phonics</h1>
        <p className="text-muted-foreground">Master Zolai sounds and pronunciation</p>
      </div>

      {/* Category selector */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Units grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {units.map(unit => (
            <PhonicsCard key={unit.id} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
}

function PhonicsCard({ unit }: { unit: PhonicsUnit }) {
  const [expanded, setExpanded] = useState(false);
  const [currentEx, setCurrentEx] = useState(0);

  const exercises = unit.content || [];
  const ex = exercises[currentEx];

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-lg">{unit.title}</CardTitle>
        <div className="inline-block px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded">
          {exercises.length} exercises
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4">
          {ex && (
            <>
              <div className="p-4 bg-muted rounded">
                <p className="font-medium">{ex.soundFocus}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {ex.exampleWords?.map((w: string, i: number) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        console.log('Play audio for:', w);
                      }}
                    >
                      <Volume2 className="h-4 w-4" />
                      {w}
                    </Button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{ex.explanation}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentEx(Math.max(0, currentEx - 1))}
                  disabled={currentEx === 0}
                >
                  Prev
                </Button>
                <span className="text-sm py-2">
                  {currentEx + 1} / {exercises.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentEx(Math.min(exercises.length - 1, currentEx + 1))}
                  disabled={currentEx === exercises.length - 1}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

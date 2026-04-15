'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { client } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Circle } from 'lucide-react';

interface Unit {
  topic: string;
}

interface SubUnit {
  id: string;
  type: string;
  unit: Unit;
  content: Exercise[];
}

interface Exercise {
  prompt: string;
  targetZolai?: string;
  targetEnglish?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

export default function UnitPage() {
  const params = useParams();
  const unitId = params.id as string;
  const [unit, setUnit] = useState<Unit | null>(null);
  const [subUnits, setSubUnits] = useState<SubUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubUnit, setSelectedSubUnit] = useState<SubUnit | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await client.api.curriculum['sub-units'].$get({ query: { unitId } });
        const data = await res.json();
        const subs = (data.data as SubUnit[]) || [];
        setSubUnits(subs);
        if (subs[0]) {
          setUnit(subs[0].unit);
          setSelectedSubUnit(subs[0]);
        }
      } catch (err) {
        console.error('Failed to fetch unit:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [unitId]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-3">
      {/* Sub-unit list */}
      <div className="lg:col-span-1 space-y-2">
        <h2 className="font-bold text-lg">{unit?.topic}</h2>
        {subUnits.map(su => (
          <button
            key={su.id}
            onClick={() => setSelectedSubUnit(su)}
            className={`w-full text-left p-3 rounded border transition-colors ${
              selectedSubUnit?.id === su.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
          >
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4" />
              <span className="text-sm font-medium">{su.type}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Exercise display */}
      <div className="lg:col-span-2">
        {selectedSubUnit && (
          <SubUnitExercise subUnit={selectedSubUnit} />
        )}
      </div>
    </div>
  );
}

function SubUnitExercise({ subUnit }: { subUnit: SubUnit }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const exercises = subUnit.content || [];
  const current = exercises[currentIdx];

  if (!current) return <div className="text-center py-12">No exercises available</div>;

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === current.correctAnswer;
    setCorrect(isCorrect);
    setAnswered(true);
    if (isCorrect) setScore(score + 1);
  };

  const handleNext = async () => {
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setAnswered(false);
      setCorrect(false);
    } else {
      // Completed all exercises
      const finalScore = Math.round(((score + (correct ? 1 : 0)) / exercises.length) * 100);
      try {
        await client.api.curriculum.progress.curriculum[':subUnitId'].$post({
          param: { subUnitId: subUnit.id },
          json: { completed: true, score: finalScore, attempts: 1 },
        });
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{subUnit.type}</CardTitle>
        <div className="text-sm text-muted-foreground">
          Exercise {currentIdx + 1} of {exercises.length}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prompt */}
        <div>
          <p className="text-lg font-medium">{current.prompt}</p>
          {current.targetZolai && (
            <p className="text-sm text-muted-foreground mt-2">Zolai: {current.targetZolai}</p>
          )}
        </div>

        {/* Options or input */}
        {current.options ? (
          <div className="space-y-2">
            {current.options.map((opt: string, i: number) => (
              <Button
                key={i}
                variant={answered ? (opt === current.correctAnswer ? 'default' : 'outline') : 'outline'}
                className="w-full justify-start"
                onClick={() => !answered && handleAnswer(opt)}
                disabled={answered}
              >
                {opt}
              </Button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            placeholder="Type your answer..."
            className="w-full p-2 border rounded"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !answered) {
                handleAnswer((e.target as HTMLInputElement).value);
              }
            }}
            disabled={answered}
          />
        )}

        {/* Feedback */}
        {answered && (
          <div className={`p-4 rounded ${correct ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="font-medium">{correct ? '✓ Correct!' : '✗ Incorrect'}</p>
            <p className="text-sm mt-1">{current.explanation}</p>
            {current.hint && <p className="text-xs text-muted-foreground mt-2">Hint: {current.hint}</p>}
          </div>
        )}

        {/* Navigation */}
        <Button onClick={handleNext} disabled={!answered} className="w-full">
          {currentIdx === exercises.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </CardContent>
    </Card>
  );
}

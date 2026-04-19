"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, Zap, RotateCcw } from "lucide-react";

interface Props {
  score: number;
  xpEarned: number;
  planSlug: string;
  nextLessonId?: string;
  onRetry: () => void;
}

export function LessonResult({ score, xpEarned, planSlug, nextLessonId, onRetry }: Props) {
  const mastered = score === 100;
  const passed = score >= 80;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center ${mastered ? "bg-yellow-100" : passed ? "bg-green-100" : "bg-red-100"}`}>
        {mastered ? <Star className="w-10 h-10 text-yellow-500 fill-yellow-400" /> :
         passed   ? <CheckCircle2 className="w-10 h-10 text-green-500" /> :
                    <RotateCcw className="w-10 h-10 text-red-500" />}
      </div>

      <div>
        <h2 className="text-2xl font-bold">{mastered ? "Mastered!" : passed ? "Lesson Complete!" : "Keep Practicing"}</h2>
        <p className="text-muted-foreground mt-1">Score: {score}%</p>
      </div>

      <div className="flex items-center gap-2 text-yellow-600 font-semibold text-lg">
        <Zap className="w-5 h-5" />
        +{xpEarned} XP
      </div>

      <div className="flex gap-3">
        {!passed && <Button variant="outline" onClick={onRetry}><RotateCcw className="w-4 h-4 mr-1" />Retry</Button>}
        {nextLessonId && passed && (
          <Link href={`/learn/${planSlug}/${nextLessonId}`}>
            <Button>Next Lesson →</Button>
          </Link>
        )}
        <Link href={`/learn/${planSlug}`}>
          <Button variant={passed && !nextLessonId ? "default" : "outline"}>Back to Plan</Button>
        </Link>
      </div>
    </div>
  );
}

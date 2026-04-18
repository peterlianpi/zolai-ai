"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useLesson, useSubmitProgress, useLessonPlan } from "@/features/lessons/hooks";
import { ExerciseEngine } from "@/features/lessons/components/exercise-engine";
import { LessonResult } from "@/features/lessons/components/lesson-result";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Zap, ChevronRight } from "lucide-react";
import type { LessonExercise } from "@/features/lessons/types";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  READING:         { label: "📖 Read & Learn",      color: "bg-blue-100 text-blue-800" },
  VOCABULARY:      { label: "🔤 Vocabulary",         color: "bg-green-100 text-green-800" },
  TRANSLATION:     { label: "🔄 Translation",        color: "bg-purple-100 text-purple-800" },
  FILL_BLANK:      { label: "✏️ Fill in the Blank",  color: "bg-orange-100 text-orange-800" },
  MULTIPLE_CHOICE: { label: "☑️ Multiple Choice",    color: "bg-teal-100 text-teal-800" },
  GRAMMAR:         { label: "📐 Grammar",            color: "bg-rose-100 text-rose-800" },
};

export function LessonDetailPage({ planSlug, lessonId }: { planSlug: string; lessonId: string }) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const { data: lesson, isLoading } = useLesson(lessonId);
  const { data: plan } = useLessonPlan(planSlug);
  const submit = useSubmitProgress();

  const [phase, setPhase] = useState<"exercise" | "result">("exercise");
  const [finalScore, setFinalScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  // Build flat lesson list for progress indicator
  const allLessons = plan?.units.flatMap(u => u.lessons) ?? [];
  const currentIdx = allLessons.findIndex(l => l.id === lessonId);
  const nextLesson = allLessons[currentIdx + 1];

  // Find which chapter this lesson belongs to
  const chapter = plan?.units.find(u => u.lessons.some(l => l.id === lessonId));
  const chapterIdx = plan?.units.findIndex(u => u.id === chapter?.id) ?? 0;

  async function handleComplete(score: number) {
    setFinalScore(score);
    try {
      if (userId && lesson) {
        const res = await submit.mutateAsync({ lessonId, score, userId });
        setXpEarned(res?.data?.xpEarned ?? lesson.xpReward);
      }
    } catch {
      // Progress save failed — still show result
    }
    setPhase("result");
  }

  if (isLoading) return (
    <div className="max-w-2xl mx-auto py-8 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );

  if (!lesson) return <p className="text-center py-12 text-muted-foreground">Lesson not found.</p>;

  const typeMeta = TYPE_LABELS[lesson.type] ?? { label: lesson.type, color: "bg-muted text-muted-foreground" };
  const lessonPct = allLessons.length > 0 ? Math.round(((currentIdx + 1) / allLessons.length) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
        <Link href="/learn" className="hover:text-foreground transition-colors flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />Books
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/learn/${planSlug}`} className="hover:text-foreground transition-colors">{plan?.title ?? planSlug}</Link>
        {chapter && <><ChevronRight className="w-3 h-3" /><span>Ch.{chapterIdx + 1} — {chapter.title}</span></>}
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{lesson.title}</span>
      </div>

      {/* Progress bar across all lessons in book */}
      {allLessons.length > 1 && (
        <div className="space-y-1">
          <Progress value={lessonPct} className="h-1.5" />
          <p className="text-xs text-muted-foreground text-right">Lesson {currentIdx + 1} of {allLessons.length}</p>
        </div>
      )}

      {phase === "exercise" && (
        <div className="rounded-2xl border bg-card overflow-hidden">
          {/* Lesson header */}
          <div className="px-5 pt-5 pb-3 border-b bg-muted/20 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeMeta.color}`}>{typeMeta.label}</span>
              <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
                <Zap className="w-3.5 h-3.5" />+{lesson.xpReward} XP
              </span>
            </div>
            <h2 className="font-bold text-xl">{lesson.title}</h2>
          </div>

          {/* Exercise */}
          <div className="p-5">
            <ExerciseEngine exercise={lesson.content as LessonExercise} onComplete={handleComplete} />
          </div>
        </div>
      )}

      {phase === "result" && (
        <LessonResult
          score={finalScore}
          xpEarned={xpEarned}
          planSlug={planSlug}
          nextLessonId={nextLesson?.id}
          onRetry={() => setPhase("exercise")}
        />
      )}

      {/* Back button */}
      {phase === "exercise" && (
        <Link href={`/learn/${planSlug}`}>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" />Back to book
          </Button>
        </Link>
      )}
    </div>
  );
}

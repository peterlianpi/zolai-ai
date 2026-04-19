"use client";
import { useSession } from "@/lib/auth-client";
import { useLessonPlans, useUserProgress } from "@/features/lessons/hooks";
import { BookCard } from "@/features/lessons/components/book-card";
import { StreakBar } from "@/features/lessons/components/streak-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CefrLevel } from "@/features/lessons/types";
import { useState } from "react";

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function LearnPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const [filter, setFilter] = useState<CefrLevel | "all">("all");

  const { data: plans, isLoading } = useLessonPlans(filter === "all" ? undefined : filter);
  const { data: userProgress } = useUserProgress(userId);

  const progressMap = Object.fromEntries((userProgress?.progress ?? []).map(p => [p.lessonId, p]));
  const allLessons = (plans ?? []).flatMap(p => p.units.flatMap(u => u.lessons));
  const completedLessons = allLessons.filter(l => ["COMPLETE","MASTERED"].includes(progressMap[l.id]?.status ?? "")).length;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📚 Zolai Learning Books</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Each book covers one CEFR level. Open a chapter, read the bilingual explanation, then practice.
        </p>
      </div>

      {userId && (
        <StreakBar streak={userProgress?.streak ?? null} totalLessons={allLessons.length} completedLessons={completedLessons} />
      )}

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All Books</Button>
        {LEVELS.map(l => (
          <Button key={l} size="sm" variant={filter === l ? "default" : "outline"} onClick={() => setFilter(l)}>{l}</Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : (plans ?? []).length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-16">No books available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(plans ?? []).map((plan, i) => {
            const prevPlan = plans![i - 1];
            const prevDone = i === 0 || prevPlan.units.flatMap(u => u.lessons)
              .every(l => ["COMPLETE","MASTERED"].includes(progressMap[l.id]?.status ?? ""));
            return (
              <BookCard key={plan.id} plan={plan} progressMap={progressMap} locked={!prevDone} />
            );
          })}
        </div>
      )}
    </div>
  );
}

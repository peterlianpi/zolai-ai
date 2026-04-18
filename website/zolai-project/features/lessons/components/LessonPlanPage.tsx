"use client";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useLessonPlan, useUserProgress } from "@/features/lessons/hooks";
import { BookCard } from "@/features/lessons/components/book-card";
import { StreakBar } from "@/features/lessons/components/streak-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";

export function LessonPlanPage({ planSlug }: { planSlug: string }) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const { data: plan, isLoading } = useLessonPlan(planSlug);
  const { data: userProgress } = useUserProgress(userId);

  const progressMap = Object.fromEntries(
    (userProgress?.progress ?? []).map(p => [p.lessonId, p])
  );

  if (isLoading) return (
    <div className="max-w-2xl mx-auto py-8 space-y-4">
      {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
    </div>
  );
  if (!plan) return <p className="text-center py-12 text-muted-foreground">Book not found.</p>;

  const allLessons = plan.units.flatMap(u => u.lessons);
  const completedLessons = allLessons.filter(l =>
    ["COMPLETE", "MASTERED"].includes(progressMap[l.id]?.status ?? "")
  ).length;

  // Find the next incomplete lesson for the Continue button
  const nextLesson = allLessons.find(l =>
    !["COMPLETE", "MASTERED"].includes(progressMap[l.id]?.status ?? "")
  );

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/learn">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />All Books</Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{plan.title}</h1>
          <p className="text-xs text-muted-foreground">{plan.level} · {completedLessons}/{allLessons.length} lessons complete</p>
        </div>
      </div>

      {userId && (
        <StreakBar streak={userProgress?.streak ?? null} totalLessons={allLessons.length} completedLessons={completedLessons} />
      )}

      {/* Quick-start button */}
      {nextLesson && (
        <Link href={`/learn/${planSlug}/${nextLesson.id}`}>
          <Button className="w-full gap-2">
            <BookOpen className="w-4 h-4" />
            {completedLessons === 0 ? "Start First Lesson" : "Continue Where You Left Off"}
          </Button>
        </Link>
      )}

      <BookCard plan={plan} progressMap={progressMap} />
    </div>
  );
}

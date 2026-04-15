"use client";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Lock, Star } from "lucide-react";
import type { LessonPlan, UserProgress, ProgressStatus } from "../types";

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-green-100 text-green-800 border-green-200",
  A2: "bg-emerald-100 text-emerald-800 border-emerald-200",
  B1: "bg-blue-100 text-blue-800 border-blue-200",
  B2: "bg-indigo-100 text-indigo-800 border-indigo-200",
  C1: "bg-purple-100 text-purple-800 border-purple-200",
  C2: "bg-rose-100 text-rose-800 border-rose-200",
};

function statusIcon(status: ProgressStatus | undefined) {
  if (status === "MASTERED") return <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />;
  if (status === "COMPLETE") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (status === "IN_PROGRESS") return <Circle className="w-4 h-4 text-blue-400" />;
  return <Circle className="w-4 h-4 text-muted-foreground/40" />;
}

interface Props {
  plan: LessonPlan;
  progressMap: Record<string, UserProgress>;
  locked?: boolean;
}

export function PlanCard({ plan, progressMap, locked = false }: Props) {
  const allLessons = plan.units.flatMap(u => u.lessons);
  const done = allLessons.filter(l => {
    const s = progressMap[l.id]?.status;
    return s === "COMPLETE" || s === "MASTERED";
  }).length;
  const pct = allLessons.length > 0 ? Math.round((done / allLessons.length) * 100) : 0;

  return (
    <div className={`rounded-2xl border p-5 space-y-4 transition-all ${locked ? "opacity-50 pointer-events-none" : "hover:shadow-md"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[plan.level]}`}>{plan.level}</span>
            {locked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>
          <h3 className="font-semibold text-base">{plan.title}</h3>
          {plan.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{plan.description}</p>}
        </div>
        <div className="text-right text-xs text-muted-foreground shrink-0">
          <div className="font-medium text-sm">{done}/{allLessons.length}</div>
          <div>lessons</div>
        </div>
      </div>

      <Progress value={pct} className="h-1.5" />

      <div className="space-y-2">
        {plan.units.map(unit => (
          <div key={unit.id} className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{unit.title}</p>
            <div className="flex flex-wrap gap-1.5">
              {unit.lessons.map(lesson => (
                <Link
                  key={lesson.id}
                  href={`/learn/${plan.slug}/${lesson.id}`}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  {statusIcon(progressMap[lesson.id]?.status)}
                  <span className="max-w-[120px] truncate">{lesson.title}</span>
                  <span className="text-muted-foreground">+{lesson.xpReward}xp</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Link
        href={`/learn/${plan.slug}`}
        className="block text-center text-sm font-medium py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {pct === 0 ? "Start" : pct === 100 ? "Review" : "Continue"}
      </Link>
    </div>
  );
}

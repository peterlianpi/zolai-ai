"use client";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Lock, Star, BookOpen, Zap } from "lucide-react";
import type { LessonPlan, UserProgress, ProgressStatus } from "../types";

const LEVEL_META: Record<string, { color: string; label: string; emoji: string }> = {
  A1: { color: "bg-green-500",  label: "Beginner",          emoji: "🌱" },
  A2: { color: "bg-teal-500",   label: "Elementary",        emoji: "🌿" },
  B1: { color: "bg-blue-500",   label: "Intermediate",      emoji: "📖" },
  B2: { color: "bg-indigo-500", label: "Upper-Intermediate", emoji: "📚" },
  C1: { color: "bg-purple-500", label: "Advanced",          emoji: "🎓" },
  C2: { color: "bg-rose-500",   label: "Mastery",           emoji: "🏆" },
};

function dot(status: ProgressStatus | undefined) {
  if (status === "MASTERED")    return <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400 shrink-0" />;
  if (status === "COMPLETE")    return <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />;
  if (status === "IN_PROGRESS") return <Circle className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
  return <Circle className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />;
}

interface Props {
  plan: LessonPlan;
  progressMap: Record<string, UserProgress>;
  locked?: boolean;
}

export function BookCard({ plan, progressMap, locked = false }: Props) {
  const meta = LEVEL_META[plan.level];
  const allLessons = plan.units.flatMap(u => u.lessons);
  const done = allLessons.filter(l => ["COMPLETE","MASTERED"].includes(progressMap[l.id]?.status ?? "")).length;
  const pct = allLessons.length > 0 ? Math.round((done / allLessons.length) * 100) : 0;
  const totalXp = allLessons.reduce((s, l) => s + l.xpReward, 0);
  const ctaLabel = pct === 0 ? "Start Book" : pct === 100 ? "Review" : "Continue";

  return (
    <div className={`group rounded-2xl border bg-card overflow-hidden transition-all ${locked ? "opacity-40 pointer-events-none" : "hover:shadow-lg hover:-translate-y-0.5"}`}>
      {/* Book spine colour strip */}
      <div className={`h-2 w-full ${meta.color}`} />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`w-12 h-16 rounded-lg ${meta.color} flex items-center justify-center text-2xl shadow-sm shrink-0`}>
            {meta.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">{plan.level} · {meta.label}</Badge>
              {locked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
            <h3 className="font-bold text-base mt-1 leading-tight">{plan.title}</h3>
            {plan.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{plan.description}</p>}
          </div>
          <div className="text-right text-xs text-muted-foreground shrink-0">
            <div className="font-semibold text-sm text-foreground">{done}/{allLessons.length}</div>
            <div>lessons</div>
            <div className="flex items-center gap-0.5 justify-end mt-1 text-yellow-600">
              <Zap className="w-3 h-3" />{totalXp}xp
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <Progress value={pct} className="h-1.5" />
          <p className="text-xs text-muted-foreground text-right">{pct}% complete</p>
        </div>

        {/* Chapters */}
        <div className="space-y-2">
          {plan.units.map((unit, ci) => {
            const unitDone = unit.lessons.filter(l => ["COMPLETE","MASTERED"].includes(progressMap[l.id]?.status ?? "")).length;
            return (
              <details key={unit.id} className="group/ch">
                <summary className="flex items-center gap-2 cursor-pointer list-none py-1.5 px-2 rounded-lg hover:bg-muted/60 transition-colors">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium flex-1">Ch.{ci + 1} — {unit.title}</span>
                  <span className="text-xs text-muted-foreground">{unitDone}/{unit.lessons.length}</span>
                </summary>
                <div className="mt-1 ml-5 space-y-0.5">
                  {unit.lessons.map(lesson => (
                    <Link
                      key={lesson.id}
                      href={`/learn/${plan.slug}/${lesson.id}`}
                      className="flex items-center gap-2 text-xs py-1 px-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      {dot(progressMap[lesson.id]?.status)}
                      <span className="flex-1 truncate">{lesson.title}</span>
                      <span className="text-muted-foreground shrink-0">+{lesson.xpReward}xp</span>
                    </Link>
                  ))}
                </div>
              </details>
            );
          })}
        </div>

        {/* CTA */}
        <Link
          href={`/learn/${plan.slug}`}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${meta.color} text-white hover:opacity-90`}
        >
          <BookOpen className="w-4 h-4" />
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

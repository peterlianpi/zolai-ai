"use client";
import { Progress } from "@/components/ui/progress";
import { Flame, Zap, Trophy } from "lucide-react";
import type { UserStreak } from "../types";

const XP_PER_LEVEL = 500;

interface Props {
  streak: UserStreak | null;
  totalLessons: number;
  completedLessons: number;
}

export function StreakBar({ streak, totalLessons, completedLessons }: Props) {
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const totalXp = streak?.totalXp ?? 0;
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXp % XP_PER_LEVEL;
  const xpPct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);

  return (
    <div className="rounded-xl bg-muted/50 border p-3 space-y-2">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-orange-500 font-bold">
          <Flame className="w-5 h-5" />
          <span>{streak?.currentStreak ?? 0}</span>
          <span className="text-xs text-muted-foreground font-normal">day streak</span>
          {(streak?.longestStreak ?? 0) > 0 && (
            <span className="text-xs text-muted-foreground font-normal">(best: {streak!.longestStreak})</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-yellow-500 font-bold">
          <Zap className="w-5 h-5" />
          <span>{totalXp.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground font-normal">XP</span>
        </div>
        <div className="flex items-center gap-1.5 text-purple-500 font-bold">
          <Trophy className="w-4 h-4" />
          <span>Lv.{level}</span>
          <span className="text-xs text-muted-foreground font-normal">{XP_PER_LEVEL - xpInLevel} XP to next</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Lessons</span><span>{completedLessons}/{totalLessons}</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Level {level}</span><span>{xpPct}%</span>
          </div>
          <Progress value={xpPct} className="h-1.5 [&>div]:bg-purple-500" />
        </div>
      </div>
    </div>
  );
}

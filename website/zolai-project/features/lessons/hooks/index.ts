"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import type { LessonPlan, LessonContent, UserProgress, UserStreak } from "../types";

export const lessonKeys = {
  plans:    (level?: string) => ["lessons", "plans", level ?? "all"] as const,
  plan:     (slug: string)   => ["lessons", "plan", slug] as const,
  lesson:   (id: string)     => ["lessons", "lesson", id] as const,
  progress: (userId: string) => ["lessons", "progress", userId] as const,
  next:     (userId: string) => ["lessons", "next", userId] as const,
};

export function useLessonPlans(level?: string) {
  return useQuery<LessonPlan[]>({
    queryKey: lessonKeys.plans(level),
    queryFn: async () => {
      const res = await client.api.lessons.plans.$get({ query: level ? { level } : {} });
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      return (json as { data: LessonPlan[] }).data;
    },
  });
}

export function useLessonPlan(slug: string) {
  return useQuery<LessonPlan>({
    queryKey: lessonKeys.plan(slug),
    queryFn: async () => {
      const res = await client.api.lessons.plans[":slug"].$get({ param: { slug } });
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      return (json as { data: LessonPlan }).data;
    },
    enabled: !!slug,
  });
}

export function useLesson(id: string) {
  return useQuery<LessonContent>({
    queryKey: lessonKeys.lesson(id),
    queryFn: async () => {
      const res = await client.api.lessons.lesson[":id"].$get({ param: { id } });
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      return (json as { data: LessonContent }).data;
    },
    enabled: !!id,
  });
}

export function useUserProgress(userId: string) {
  return useQuery<{ progress: UserProgress[]; streak: UserStreak | null }>({
    queryKey: lessonKeys.progress(userId),
    queryFn: async () => {
      const res = await client.api.lessons.user[":userId"].progress.$get({ param: { userId } });
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      return (json as { data: { progress: UserProgress[]; streak: UserStreak | null } }).data;
    },
    enabled: !!userId,
  });
}

export function useNextLesson(userId: string) {
  return useQuery({
    queryKey: lessonKeys.next(userId),
    queryFn: async () => {
      const res = await client.api.lessons.user[":userId"].next.$get({ param: { userId } });
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      return (json as { data: unknown }).data;
    },
    enabled: !!userId,
  });
}

export function useSubmitProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { lessonId: string; score: number; userId: string }) => {
      const res = await client.api.lessons.progress.$post({ json: vars });
      if (!res.ok) throw new Error("Submit failed");
      return res.json();
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["lessons", "progress", vars.userId] });
      qc.invalidateQueries({ queryKey: ["lessons", "next", vars.userId] });
    },
  });
}

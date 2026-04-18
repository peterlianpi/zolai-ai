export interface LessonPlan {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  level: string;
  order: number;
  isActive: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  type: string;
  xpReward: number;
  order: number;
}

export interface LessonProgress {
  id: string;
  lessonId: string;
  status: string;
  score: number;
  xpEarned: number;
  attempts: number;
  completedAt?: string | null;
}

export interface GrammarLesson {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  resourceType: string;
  difficultyLevel: string;
  viewCount: number;
  completionCount: number;
  rating?: number | null;
  durationMinutes?: number | null;
  isFeatured: boolean;
  createdAt: string;
}

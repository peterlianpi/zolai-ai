export interface ForumPost {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  category?: string | null;
  tags: string[];
  viewCount: number;
  answerCount: number;
  createdAt: string;
  author: { id: string; name: string; image?: string | null };
}

export interface ForumCategory {
  category: string | null;
  count: number;
}

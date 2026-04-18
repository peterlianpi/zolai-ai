// Type definitions for home feature API responses
export interface HomePost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  type: "BLOG" | "NEWS" | "PAGE";
  status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "TRASH";
  locale: string;
  publishedAt: string | null;
  isFeatured: boolean;
  isPopular: boolean;
  isLatest?: boolean;
  createdAt: string;
  featuredMedia: { id: string; url: string; altText: string | null; thumbnailUrl?: string | null } | null;
  author: { id: string; name: string } | null;
  terms: Array<{ term: { id: string; name: string; slug: string; taxonomy: { id?: string; slug: string; name?: string } } }>;
}

export interface HomePostsResponse {
  success: boolean;
  data: { posts: HomePost[]; meta: { total: number; page: number; limit: number; totalPages: number } };
}

export interface HomeTermsResponse {
  success: boolean;
  data: { terms: Array<{ id: string; name: string; slug: string; count: number }> };
}

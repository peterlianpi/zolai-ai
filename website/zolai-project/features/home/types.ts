export interface HomePost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  type: string;
  status: string;
  locale: string;
  publishedAt?: string | null;
  isFeatured: boolean;
  isPopular: boolean;
  createdAt: string;
  featuredMedia?: { id: string; url: string; altText?: string | null } | null;
  author?: { id: string; name: string } | null;
}

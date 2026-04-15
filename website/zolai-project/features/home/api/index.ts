import { client } from "@/lib/api/client";

export interface HomePost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  type: "BLOG" | "NEWS" | "PAGE"; // Updated to match Prisma enum types
  status: "DRAFT" | "PUBLISHED" | "PRIVATE" | "TRASH"; // Updated to match Prisma enum types  
  locale: string;
  publishedAt: string | null;
  isFeatured: boolean;
  isPopular: boolean;
  isLatest?: boolean;
  createdAt: string;
  featuredMedia: {
    id: string;
    url: string;
    altText: string | null; // Changed from 'alt' to match API response
    thumbnailUrl?: string | null; // Added optional field from API
  } | null;
  author: {
    id: string;
    name: string;
  } | null;
  terms: Array<{
    term: {
      id: string;
      name: string;
      slug: string;
      taxonomy: {
        id?: string; // Added optional field from API response
        slug: string;
        name?: string; // Added optional field from API response
      };
    };
  }>;
}

export interface HomePostsResponse {
  success: boolean;
  data: {
    posts: HomePost[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface HomeTermsResponse {
  success: boolean;
  data: {
    terms: Array<{
      id: string;
      name: string;
      slug: string;
      count: number;
    }>;
  };
}

export async function getLatestPosts(): Promise<HomePost[]> {
  const response = await client.api.content.posts.$get({
    query: {
      limit: "5",
      status: "PUBLISHED",
      orderBy: "publishedAt",
      orderDir: "desc",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch latest posts");
  }

  const result = await response.json() as { 
    success: boolean; 
    data: HomePost[];  // API returns posts directly, not wrapped in { posts: [] }
    meta?: { total: number; page: number; limit: number; totalPages: number };
  };
  return result.data;
}

export async function getFeaturedPosts(): Promise<HomePost[]> {
  const response = await client.api.content.posts.$get({
    query: {
      limit: "4",
      isFeatured: "true",
      status: "PUBLISHED",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch featured posts");
  }

  const result = await response.json() as { 
    success: boolean; 
    data: HomePost[];  // API returns posts directly, not wrapped in { posts: [] }
    meta?: { total: number; page: number; limit: number; totalPages: number };
  };
  return result.data;
}

export async function getPopularPosts(): Promise<HomePost[]> {
  const response = await client.api.content.posts.$get({
    query: {
      limit: "3",
      isPopular: "true",
      status: "PUBLISHED",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch popular posts");
  }

  const result = await response.json() as { 
    success: boolean; 
    data: HomePost[];  // API returns posts directly, not wrapped in { posts: [] }
    meta?: { total: number; page: number; limit: number; totalPages: number };
  };
  return result.data;
}

export async function getTrendingPosts(): Promise<HomePost[]> {
  const response = await client.api.content.posts.$get({
    query: {
      limit: "6",
      status: "PUBLISHED",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch trending posts");
  }

  const result = await response.json() as { 
    success: boolean; 
    data: HomePost[];  // API returns posts directly, not wrapped in { posts: [] }
    meta?: { total: number; page: number; limit: number; totalPages: number };
  };
  return result.data;
}

export async function getCategories(): Promise<HomeTermsResponse["data"]["terms"]> {
  const response = await client.api.content.terms.$get({
    query: {
      limit: "50",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const result = (await response.json()) as HomeTermsResponse;
  return result.data.terms;
}

export async function getTags(): Promise<HomeTermsResponse["data"]["terms"]> {
  const response = await client.api.content.terms.$get({
    query: {
      limit: "50",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tags");
  }

  const result = (await response.json()) as HomeTermsResponse;
  return result.data.terms;
}

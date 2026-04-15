import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { safeDbQuery } from "@/lib/server/safe-db";

export interface HomePostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  type: string;
  locale: string;
  publishedAt: Date | null;
  createdAt: Date;
  featuredMedia: {
    id: string;
    url: string;
    altText: string | null;
  } | null;
  author?: {
    id: string;
    name: string | null;
  } | null;
  terms?: Array<{
    term: {
      id: string;
      name: string;
      slug: string;
      taxonomy: {
        slug: string;
      };
    };
  }>;
}

export interface HomeTermSummary {
  id: string;
  name: string;
  slug: string;
  count?: number;
  taxonomy?: {
    id: string;
    slug: string;
    name: string;
  } | null;
}

export interface HomePageData {
  latestPosts: HomePostSummary[];
  featuredPosts: HomePostSummary[];
  popularPosts: HomePostSummary[];
  trendingPosts: HomePostSummary[];
  categories: HomeTermSummary[];
  tags: HomeTermSummary[];
}

const getCachedHomePageData = unstable_cache(
  async (): Promise<HomePageData> => {
    let latestPosts: HomePostSummary[] = [];
    let featuredPosts: HomePostSummary[] = [];
    let popularPosts: HomePostSummary[] = [];
    let trendingPosts: HomePostSummary[] = [];
    let terms: Array<{
      id: string;
      name: string;
      slug: string;
      _count: { posts: number };
      taxonomy: { id: string; slug: string; name: string } | null;
    }> = [];

    [latestPosts, featuredPosts, popularPosts, trendingPosts, terms] = await safeDbQuery({
      key: "home-page-data",
      query: () =>
        Promise.all([
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        take: 5,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          type: true,
          locale: true,
          publishedAt: true,
          createdAt: true,
          featuredMedia: { select: { id: true, url: true, altText: true } },
          author: { select: { id: true, name: true } },
        },
      }),
      prisma.post.findMany({
        where: { status: "PUBLISHED", isFeatured: true },
        take: 4,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          type: true,
          locale: true,
          publishedAt: true,
          createdAt: true,
          featuredMedia: { select: { id: true, url: true, altText: true } },
          author: { select: { id: true, name: true } },
          terms: {
            select: {
              term: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  taxonomy: { select: { id: true, slug: true } },
                },
              },
            },
          },
        },
      }),
      prisma.post.findMany({
        where: { status: "PUBLISHED", isPopular: true },
        take: 6,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          type: true,
          locale: true,
          publishedAt: true,
          createdAt: true,
          featuredMedia: { select: { id: true, url: true, altText: true } },
          author: { select: { id: true, name: true } },
        },
      }),
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        take: 6,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          type: true,
          locale: true,
          publishedAt: true,
          createdAt: true,
          featuredMedia: { select: { id: true, url: true, altText: true } },
        },
      }),
      prisma.term.findMany({
        take: 50,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { posts: true } },
          taxonomy: { select: { id: true, slug: true, name: true } },
        },
      }),
        ]),
      fallback: [[], [], [], [], []],
      timeoutMs: 4000,
      failureThreshold: 2,
      openMs: 30000,
      logLabel: "HomePage",
    });

    const mappedTerms = terms.map((term) => ({
      id: term.id,
      name: term.name,
      slug: term.slug,
      count: term._count.posts,
      taxonomy: term.taxonomy,
    }));

    return {
      latestPosts,
      featuredPosts,
      popularPosts,
      trendingPosts,
      categories: mappedTerms.filter((term) => term.taxonomy?.slug === "category").slice(0, 20),
      tags: mappedTerms.filter((term) => term.taxonomy?.slug === "post_tag").slice(0, 20),
    };
  },
  ["home-page-data"],
  {
    revalidate: 60,
    tags: ["home-page-data", "content"],
  },
);

export async function getHomePageData(): Promise<HomePageData> {
  return getCachedHomePageData();
}

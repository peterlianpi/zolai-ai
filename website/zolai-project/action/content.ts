"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { PostListItem, PostWithFullRelations } from "@/lib/types/content";

export type PostListParams = {
  page?: number;
  limit?: number;
  type?: "POST" | "PAGE" | "NEWS";
  status?: "DRAFT" | "PENDING" | "PUBLISHED" | "TRASH";
  categorySlug?: string;
  tagSlug?: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  search?: string;
  orderBy?: "createdAt" | "publishedAt" | "title" | "modifiedAt";
  orderDir?: "asc" | "desc";
};

export type PostListResult = {
  posts: PostListItem[];
  total: number;
  totalPages: number;
};

const NON_PUBLIC_STATUSES = new Set(["DRAFT", "PENDING", "TRASH"]);

export async function getPostList(params: PostListParams = {}): Promise<PostListResult> {
  const {
    page = 1,
    limit = 10,
    type,
    status = "PUBLISHED",
    categorySlug,
    tagSlug,
    isFeatured,
    isPopular,
    search,
    orderBy = "publishedAt",
    orderDir = "desc",
  } = params;

  const skip = (page - 1) * limit;

  if (NON_PUBLIC_STATUSES.has(status)) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { posts: [], total: 0, totalPages: 0 };
  }

  let termIds: string[] = [];
  if (categorySlug || tagSlug) {
    const taxonomySlug = categorySlug
      ? type === "NEWS" ? "news_category" : "category"
      : type === "NEWS" ? "news_tag" : "post_tag";

    const terms = await prisma.term.findMany({
      where: {
        slug: categorySlug || tagSlug,
        taxonomy: { slug: taxonomySlug },
      },
      select: { id: true },
    });
    termIds = terms.map((t) => t.id);
  }

  const where: {
    type?: "POST" | "PAGE" | "NEWS";
    status?: "DRAFT" | "PENDING" | "PUBLISHED" | "TRASH";
    terms?: { some: { termId: { in: string[] } } };
    isFeatured?: boolean;
    isPopular?: boolean;
    OR?: Array<{ title?: { contains: string; mode: "insensitive" } } | { contentHtml?: { contains: string; mode: "insensitive" } }>;
  } = {
    type,
    status,
  };

  if (termIds.length > 0) {
    where.terms = { some: { termId: { in: termIds } } };
  }

  if (isFeatured !== undefined) {
    where.isFeatured = isFeatured;
  }

  if (isPopular !== undefined) {
    where.isPopular = isPopular;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { contentHtml: { contains: search, mode: "insensitive" } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isFeatured: "desc" }, { isPopular: "desc" }, { [orderBy]: orderDir }],
      include: {
        author: { select: { id: true, name: true, email: true } },
        featuredMedia: true,
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts: posts.map((post) => ({
      ...post,
      author: post.author as PostListItem["author"],
    })),
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export type PostDetailParams = {
  slug: string;
  type?: "POST" | "PAGE" | "NEWS";
  status?: "DRAFT" | "PENDING" | "PUBLISHED" | "TRASH";
};

export async function getPostDetail(params: PostDetailParams): Promise<PostWithFullRelations | null> {
  const { slug, type, status = "PUBLISHED" } = params;

  if (NON_PUBLIC_STATUSES.has(status)) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;
  }

  const post = await prisma.post.findFirst({
    where: {
      slug,
      type,
      status,
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      featuredMedia: true,
      terms: {
        include: {
          term: {
            include: {
              taxonomy: { select: { id: true, slug: true, name: true } },
            },
          },
        },
      },
      meta: true,
    },
  });

  if (!post) return null;

  return post as PostWithFullRelations;
}

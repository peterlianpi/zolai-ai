import type { Prisma } from "@/lib/generated/prisma";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { checkIsAdmin, getSessionUserId, getIpAndUa } from "@/lib/auth/server-guards";
import { toAuditJson, adminMiddleware } from "@/lib/audit";
import { revalidatePath, revalidateTag } from "next/cache";
import { ok, created, list, notFound, conflict } from "@/lib/api/response";
import { safeDbQuery } from "@/lib/server/safe-db";
import { dispatchNotification } from "@/lib/notifications/dispatcher";
import { getSiteSetting } from "@/lib/site-config";
import {
  postQuerySchema,
  createPostSchema,
  updatePostSchema,
  termListQuerySchema,
  createTermSchema,
  updateTermSchema,
} from "@/features/content/schemas";

function getTagTaxonomySlug(type: "POST" | "PAGE" | "NEWS"): "post_tag" | "news_tag" | null {
  if (type === "POST") return "post_tag";
  if (type === "NEWS") return "news_tag";
  return null;
}

function stripHtml(input: string): string {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHashtagTokens(input: string): string[] {
  const matches = input.match(/(^|\s)#([^\s#]+)/gu) ?? [];
  const deduped = new Set<string>();

  for (const match of matches) {
    const raw = match.trim().replace(/^#/, "");
    const cleaned = raw.replace(/[.,!?;:()\[\]{}"'`]+$/g, "").trim().toLowerCase();
    if (cleaned) {
      deduped.add(cleaned);
    }
  }

  return Array.from(deduped);
}

async function ensureHashtagTerms(params: {
  postType: "POST" | "PAGE" | "NEWS";
  contentHtml: string;
}): Promise<string[]> {
  const taxonomySlug = getTagTaxonomySlug(params.postType);
  if (!taxonomySlug) return [];

  const text = stripHtml(params.contentHtml);
  const hashtags = extractHashtagTokens(text);
  if (hashtags.length === 0) return [];

  const taxonomy = await prisma.taxonomy.findUnique({
    where: { slug: taxonomySlug },
    select: { id: true },
  });

  if (!taxonomy) return [];

  // Batch upsert: insert missing terms, then fetch all in two queries (no N+1)
  await prisma.term.createMany({
    data: hashtags.map((slug) => ({ taxonomyId: taxonomy.id, slug, name: slug })),
    skipDuplicates: true,
  });

  const terms = await prisma.term.findMany({
    where: { taxonomyId: taxonomy.id, slug: { in: hashtags } },
    select: { id: true },
  });

  return terms.map((t) => t.id);
}

function mergeUniqueIds(primary: string[] = [], secondary: string[] = []): string[] {
  return Array.from(new Set([...primary, ...secondary]));
}

async function resolveTemplateSlug(templateId: string | null | undefined, fallback: string): Promise<string> {
  if (!templateId) {
    return fallback;
  }

  const template = await prisma.pageTemplate.findUnique({
    where: { id: templateId },
    select: { slug: true },
  });

  return template?.slug ?? fallback;
}

// ============================================
// CONTENT ROUTER
// ============================================

const content = new Hono()

  // GET /api/content/posts - List posts (OPTIMIZED WITH CACHING)
  .get("/posts", zValidator("query", postQuerySchema), async (c) => {
    const { page, type, status, locale, search, isFeatured, isPopular, translationGroup, termId, authorId, orderBy, orderDir } = c.req.valid("query");
    // Use posts_per_page site setting as default limit
    const defaultLimit = parseInt(await getSiteSetting("posts_per_page", "10"));
    const limit = c.req.valid("query").limit ?? defaultLimit;
    const skip = (page - 1) * limit;
    const isAdmin = await checkIsAdmin(c);

    const where: Prisma.PostWhereInput = {};
    if (!isAdmin) {
      where.status = "PUBLISHED";
    } else if (status) {
      where.status = status;
    }
    if (type) where.type = type;
    if (locale) where.locale = locale;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isPopular !== undefined) where.isPopular = isPopular;
    if (translationGroup) where.translationGroup = translationGroup;
    if (authorId) where.authorId = authorId;
    if (termId) {
      where.terms = { some: { termId } };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    // OPTIMIZATION: Use optimized select to reduce data transfer
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: {
          id: true,
          type: true,
          status: true,
          slug: true,
          title: true,
          excerpt: true,
          locale: true,
          publishedAt: true,
          isFeatured: true,
          isPopular: true,
          createdAt: true,
          author: { select: { id: true, name: true } },
          featuredMedia: { 
            select: { 
              id: true, 
              url: true, 
              altText: true,
              thumbnailUrl: true 
            } 
          },
          // OPTIMIZATION: Optimized terms loading to prevent N+1
          terms: { 
            select: {
              term: { 
                select: { 
                  id: true,
                  name: true,
                  slug: true,
                  taxonomy: { 
                    select: { 
                      id: true,
                      slug: true,
                      name: true 
                    } 
                  } 
                } 
              } 
            }
          },
        },
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDir },
      }),
      prisma.post.count({ where }),
    ]);

    const response = list(c, posts, { total, page, limit, totalPages: Math.ceil(total / limit) });

    // Add cache headers for public content (1 minute cache, 5 minute stale-while-revalidate)
    if (!isAdmin && !search) {
      c.header("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=300");
    }

    return response;
  })

  // GET /api/content/posts/:id - Get single post
  .get("/posts/:id", async (c) => {
    const id = c.req.param("id");
    const isAdmin = await checkIsAdmin(c);

    const where: Prisma.PostWhereInput = { id };
    if (!isAdmin) where.status = "PUBLISHED";

    const post = await safeDbQuery({
      key: "content-post-by-id",
      query: () =>
        prisma.post.findFirst({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        contentHtml: true,
        excerpt: true,
        status: true,
        type: true,
        locale: true,
        password: true,
        commentStatus: true,
        pingStatus: true,
        isFeatured: true,
        isPopular: true,
        template: true,
        templateId: true,
        publishedAt: true,
        createdAt: true,
        modifiedAt: true,
        featuredMedia: { select: { id: true, url: true, altText: true, caption: true } },
        author: { select: { id: true, name: true, email: true } },
        terms: {
          select: {
            term: {
              select: {
                id: true,
                name: true,
                slug: true,
                taxonomy: { select: { id: true, slug: true, name: true } },
              },
            },
          },
        },
        meta: { select: { key: true, value: true } },
      },
        }),
      fallback: null,
      timeoutMs: 5500,
      failureThreshold: 3,
      openMs: 10000,
      logLabel: "ContentPost",
    });

    if (!post) {
      return notFound(c, "Post not found");
    }

    return ok(c, post);
  })

  // POST /api/content/posts - Create post
  .post("/posts", adminMiddleware, zValidator("json", createPostSchema), async (c) => {
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);
    const { terms: termIds, meta, ...postData } = body;

    const autoTagTermIds = await ensureHashtagTerms({
      postType: postData.type,
      contentHtml: postData.contentHtml,
    });
    const mergedTermIds = mergeUniqueIds(termIds, autoTagTermIds);

    const resolvedTemplateSlug = await resolveTemplateSlug(
      postData.templateId,
      postData.template ?? "default",
    );

    let post;
    try {
       post = await prisma.post.create({
         data: {
            ...postData,
            template: resolvedTemplateSlug,
            authorId: userId ?? "",
             terms: mergedTermIds.length
              ? { create: mergedTermIds.map((termId: string) => ({ termId })) }
              : undefined,
           meta: meta?.length
             ? {
                 createMany: {
                   data: meta.map((item) => ({ key: item.key, value: item.value })),
                 },
               }
             : undefined,
         },
         select: {
           id: true,
           author: { select: { id: true, name: true } },
         },
       });
     } catch (err: unknown) {
       const error = err as { code?: string; meta?: { modelName?: string } };
       if (error.code === "P2002") {
         return conflict(c, `A ${postData.type.toLowerCase()} with slug "${postData.slug}" already exists in locale "${postData.locale}"`);
       }
       throw err;
     }

      await prisma.auditLog.create({
       data: {
         action: "CREATE",
         entityType: "Post",
         entityId: post.id,
         newValues: toAuditJson(postData),
         ipAddress,
         userAgent,
         createdById: userId,
       },
     });

      // Revalidate relevant paths for ISR
      revalidatePath("/posts");
      revalidatePath("/news");
      revalidatePath("/pages");
      revalidateTag("content", "max");
      revalidateTag("home-page-data", "max");

      if (post.author?.id) {
        await dispatchNotification({
          recipients: [{ userId: post.author.id }],
          title: "Post created",
          description: "Your post has been created successfully.",
          type: "content",
          action: "post.created",
          actorUserId: userId ?? undefined,
          actorName: post.author.name,
          entityType: "post",
          entityId: post.id,
          link: `/posts/${postData.slug}`,
          metadata: { postType: postData.type, locale: postData.locale },
          excludeActor: false,
        });
      }
      
     return created(c, post);
  })

  // PATCH /api/content/posts/:id - Update post
  .patch("/posts/:id", adminMiddleware, zValidator("json", updatePostSchema), async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, "Post not found");
    }

     const { terms: termIds, meta, ...postData } = body;

    let mergedTermIds = termIds;
    const effectivePostType = postData.type ?? existing.type;
    const hasContentUpdate = typeof postData.contentHtml === "string";

    if (hasContentUpdate) {
      const autoTagTermIds = await ensureHashtagTerms({
        postType: effectivePostType,
        contentHtml: postData.contentHtml as string,
      });

      const baseTermIds = termIds
        ? termIds
        : (
            await prisma.postTerm.findMany({
              where: { postId: id },
              select: { termId: true },
            })
          ).map((item) => item.termId);

      mergedTermIds = mergeUniqueIds(baseTermIds, autoTagTermIds);
    }

    const resolvedTemplateSlug = await resolveTemplateSlug(
      postData.templateId,
      postData.template ?? existing.template ?? "default",
    );

    let post;
    try {
      post = await prisma.post.update({
        where: { id },
        data: {
          ...postData,
          template: resolvedTemplateSlug,
          terms: mergedTermIds
            ? {
                deleteMany: {},
                create: mergedTermIds.map((termId: string) => ({ termId })),
              }
            : undefined,
          meta: meta
            ? {
                deleteMany: {},
                createMany: {
                  data: meta.map((item) => ({ key: item.key, value: item.value })),
                },
              }
            : undefined,
         },
         select: {
           id: true,
           author: { select: { id: true, name: true } },
         },
       });
     } catch (err: unknown) {
       const error = err as { code?: string };
       if (error.code === "P2002") {
         return conflict(c, `A ${postData.type?.toLowerCase() ?? "resource"} with slug "${postData.slug}" already exists in locale "${postData.locale}"`);
       }
       throw err;
     }

     await prisma.auditLog.create({
       data: {
         action: "UPDATE",
         entityType: "Post",
         entityId: post.id,
         oldValues: toAuditJson(existing),
         newValues: toAuditJson(postData),
         ipAddress,
         userAgent,
         createdById: userId,
       },
     });

     // Revalidate relevant paths for ISR
     revalidatePath("/posts");
     revalidatePath("/news");
     revalidatePath("/pages");
     revalidateTag("content", "max");
     revalidateTag("home-page-data", "max");
      
     return ok(c, post);
  })

  // DELETE /api/content/posts/:id - Soft delete post
  .delete("/posts/:id", adminMiddleware, async (c) => {
    const id = c.req.param("id");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, "Post not found");
    }

    const post = await prisma.post.update({
      where: { id },
      data: { status: "TRASH" },
    });

     await prisma.auditLog.create({
       data: {
         action: "DELETE",
         entityType: "Post",
         entityId: post.id,
         oldValues: toAuditJson(existing),
         ipAddress,
         userAgent,
         createdById: userId,
       },
     });

     // Revalidate relevant paths for ISR
     revalidatePath("/posts");
     revalidatePath("/news");
     revalidatePath("/pages");
     revalidateTag("content", "max");
     revalidateTag("home-page-data", "max");
      
     return c.json({ success: true, data: { id: post.id, status: post.status } });
  })

  // GET /api/content/terms - List terms (OPTIMIZED WITH CACHING)
  .get("/terms", zValidator("query", termListQuerySchema), async (c) => {
    const { taxonomyId, page, limit } = c.req.valid("query");
    const skip = (page - 1) * limit;

    const where: Prisma.TermWhereInput = {};
    if (taxonomyId) {
      where.taxonomyId = taxonomyId;
    }

    // OPTIMIZATION: Use optimized query with proper select
    const [terms, total] = await Promise.all([
      prisma.term.findMany({
        where,
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          count: true,
          taxonomy: { select: { id: true, slug: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { name: "asc" }, // More predictable ordering
      }),
      prisma.term.count({ where }),
    ]);

    const formattedTerms = terms.map(t => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      description: t.description,
      count: t.count ?? 0,
      taxonomy: t.taxonomy,
    }));

    const response = {
      success: true,
      data: {
        terms: formattedTerms,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    };

    // Add cache headers for terms (5 minutes cache, terms don't change frequently)
    c.header("Cache-Control", "public, max-age=300, s-maxage=600, stale-while-revalidate=600");

    return c.json(response);
  })

  // POST /api/content/terms - Create term
  .post("/terms", adminMiddleware, zValidator("json", createTermSchema), async (c) => {
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    const taxonomy = await prisma.taxonomy.findUnique({
      where: { id: body.taxonomyId },
    });
    if (!taxonomy) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND", message: "Taxonomy not found" } },
        404,
      );
    }

    let term;
    try {
      term = await prisma.term.create({
        data: body,
        select: { id: true, name: true, slug: true, taxonomy: { select: { id: true, slug: true, name: true } } },
      });
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === "P2002") {
        return c.json(
          { success: false, error: { code: "CONFLICT", message: "Term slug already exists." } },
          409,
        );
      }
      throw err;
    }

     await prisma.auditLog.create({
       data: {
         action: "CREATE",
         entityType: "Term",
         entityId: term.id,
         newValues: toAuditJson(body),
         ipAddress,
         userAgent,
         createdById: userId,
       },
     });

     // Revalidate relevant paths for ISR
     revalidatePath("/posts");
     revalidatePath("/news");
     revalidatePath("/pages");
     revalidateTag("content", "max");
     revalidateTag("home-page-data", "max");
      
     return c.json({ success: true, data: term }, 201);
  })

  // PATCH /api/content/terms/:id - Update term
  .patch("/terms/:id", adminMiddleware, zValidator("json", updateTermSchema), async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    const existing = await prisma.term.findUnique({ where: { id } });
    if (!existing) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND", message: "Term not found" } },
        404,
      );
    }

    let term;
    try {
      term = await prisma.term.update({
        where: { id },
        data: body,
        select: { id: true, name: true, slug: true, taxonomy: { select: { id: true, slug: true, name: true } } },
      });
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === "P2002") {
        return c.json(
          { success: false, error: { code: "CONFLICT", message: "Term slug already exists." } },
          409,
        );
      }
      throw err;
    }

     await prisma.auditLog.create({
       data: {
         action: "UPDATE",
         entityType: "Term",
         entityId: term.id,
         oldValues: toAuditJson(existing),
         newValues: toAuditJson(body),
         ipAddress,
         userAgent,
         createdById: userId,
       },
     });

     // Revalidate relevant paths for ISR
     revalidatePath("/posts");
     revalidatePath("/news");
     revalidatePath("/pages");
     revalidateTag("content", "max");
     revalidateTag("home-page-data", "max");
      
     return c.json({ success: true, data: term });
  })

  // DELETE /api/content/terms/:id - Delete term
  .delete("/terms/:id", adminMiddleware, async (c) => {
    const id = c.req.param("id");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    const existing = await prisma.term.findUnique({ where: { id } });
    if (!existing) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND", message: "Term not found" } },
        404,
      );
    }

    await prisma.term.delete({ where: { id } });

     await prisma.auditLog.create({
       data: {
         action: "DELETE",
         entityType: "Term",
         entityId: id ?? "",
         oldValues: toAuditJson(existing),
         ipAddress: ipAddress ?? undefined,
         userAgent: userAgent ?? undefined,
         createdById: userId ?? undefined,
       },
     });

     // Revalidate relevant paths for ISR
     revalidatePath("/posts");
     revalidatePath("/news");
     revalidatePath("/pages");
     revalidateTag("content", "max");
     revalidateTag("home-page-data", "max");
      
     return c.json({ success: true, data: { id } });
  })

  // GET /api/content/taxonomies - List all taxonomies
  .get("/taxonomies", async (c) => {
     const taxonomies = await prisma.taxonomy.findMany({
       select: {
         id: true,
         slug: true,
         name: true,
         _count: { select: { terms: true } },
       },
       orderBy: { name: "asc" },
     });

    return c.json({ success: true, data: taxonomies });
  });

export default content;

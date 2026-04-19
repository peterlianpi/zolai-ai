import { z } from "zod";

export const postTypeSchema = z.enum(["POST", "PAGE", "NEWS"]);
export const postStatusSchema = z.enum(["DRAFT", "PENDING", "PUBLISHED", "TRASH"]);
export const postTemplateSchema = z.enum(["default", "full-width", "sidebar", "centered", "blank"]);

export const createPostSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(500),
  contentHtml: z.string().default(""),
  excerpt: z.string().max(1000).optional().nullable(),
  type: postTypeSchema,
  status: postStatusSchema.default("DRAFT"),
  locale: z.string().default("en"),
  translationGroup: z.string().optional().nullable(),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
  seoKeywords: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  meta: z
    .array(
      z.object({
        key: z.string().min(1).max(200),
        value: z.string().max(5000),
      }),
    )
    .default([]),
  isFeatured: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  publishedAt: z.coerce.date().optional().nullable(),
  parentId: z.string().min(1).optional().nullable(),
  featuredMediaId: z.string().min(1).optional().nullable(),
  template: postTemplateSchema.default("default"),
  templateId: z.string().min(1).optional().nullable(),
  terms: z.array(z.string().min(1)).default([]),
});

export const updatePostSchema = createPostSchema.partial();

export const postQuerySchema = z.object({
  type: postTypeSchema.optional(),
  status: postStatusSchema.optional(),
  locale: z.string().optional(),
  search: z.string().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isPopular: z.coerce.boolean().optional(),
  translationGroup: z.string().optional(),
  termId: z.string().min(1).optional(),
  authorId: z.string().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  orderBy: z.enum(["createdAt", "publishedAt", "title", "modifiedAt"]).default("createdAt"),
  orderDir: z.enum(["asc", "desc"]).default("desc"),
});

export type PostType = z.infer<typeof postTypeSchema>;
export type PostStatus = z.infer<typeof postStatusSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostQuery = z.infer<typeof postQuerySchema>;

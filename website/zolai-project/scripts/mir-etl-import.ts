import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import prisma from "../lib/prisma";

/**
 * Convert Myanmar text to an English-friendly slug.
 * Falls back to a hash-based slug if transliteration fails.
 */
function toEnglishSlug(text: string, fallbackPrefix: string = "post"): string {
  // Remove Myanmar characters and replace with transliterated approximation
  const myanmarMap: Record<string, string> = {
    'က': 'k', 'ခ': 'kh', 'ဂ': 'g', 'ဃ': 'gh', 'င': 'ng',
    'စ': 's', 'ဆ': 'h', 'ဇ': 'z', 'ဈ': 'zh', 'ည': 'ny',
    'ဋ': 't', 'ဌ': 'ht', 'ဍ': 'd', 'ဎ': 'dh', 'ဏ': 'n',
    'တ': 't', 'ထ': 'ht', 'ဒ': 'd', 'ဓ': 'dh', 'န': 'n',
    'ပ': 'p', 'ဖ': 'hp', 'ဗ': 'b', 'ဘ': 'bh', 'မ': 'm',
    'ယ': 'y', 'ရ': 'r', 'လ': 'l', 'ဝ': 'w', 'သ': 'th',
    'ဟ': 'h', 'ဠ': 'l', 'အ': 'a',
    'ာ': 'a', 'ိ': 'i', 'ီ': 'i', 'ု': 'u', 'ူ': 'u',
    'ေ': 'e', 'ဲ': 'e', 'ံ': 'n', '့': '',
    '်': '', '္': '', 'ႈ': '', '႔': '', '႕': '',
    '၊': '', '။': '', '၀': '0', '၁': '1', '၂': '2', '၃': '3',
    '၄': '4', '၅': '5', '၆': '6', '၇': '7', '၈': '8', '၉': '9',
    ' ': '-', '—': '-', '–': '-',
  };

  let result = '';
  for (const char of text) {
    if (myanmarMap[char] !== undefined) {
      result += myanmarMap[char];
    } else if (/[a-zA-Z0-9\-]/.test(char)) {
      result += char;
    } else {
      result += '-';
    }
  }

  // Clean up: remove consecutive dashes, trim dashes from ends
  result = result
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  // If result is too short or empty, use hash-based fallback
  if (result.length < 3) {
    const hash = Buffer.from(text).toString('base64url').substring(0, 8);
    result = `${fallbackPrefix}-${hash}`;
  }

  return result;
}

/**
 * Generate a consistent English slug for a translation group.
 * Uses the English version's slug if available, otherwise transliterates.
 */
function resolveSlug(
  post: { slug: string; title: string; type: string; locale: string },
  englishSlug: string | null,
): string {
  if (englishSlug) return englishSlug;
  if (post.locale === "en" && post.slug && !/[\u1000-\u109F]/.test(post.slug)) {
    return post.slug;
  }
  return toEnglishSlug(post.title, post.type.toLowerCase());
}

const dumpSchema = z.object({
  version: z.number(),
  generatedAt: z.string(),
  limit: z.number(),
  mysql: z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    database: z.string(),
  }),
  taxonomiesTerms: z.array(
    z.object({
      termTaxonomyId: z.number(),
      wpTermId: z.number(),
      taxonomySlug: z.string(),
      description: z.string().nullable(),
      parent: z.number(),
      name: z.string(),
      slug: z.string(),
    }),
  ),
  posts: z.array(
    z.object({
      wpId: z.number(),
      type: z.enum(["POST", "PAGE", "NEWS"]),
      status: z.enum(["PUBLISHED", "DRAFT", "PENDING", "TRASH"]),
      slug: z.string(),
      title: z.string(),
      excerpt: z.string().nullable(),
      contentHtml: z.string(),
      menuOrder: z.number(),
      publishedAt: z.string().nullable(),
      publishedAtGmt: z.string().nullable(),
      modifiedAt: z.string(),
      commentStatus: z.string(),
      locale: z.enum(["my", "en"]),
      translationGroup: z.string().nullable(),
      wpParentId: z.number(),
    }),
  ),
  postMeta: z.array(
    z.object({
      wpPostId: z.number(),
      metaKey: z.string(),
      metaValue: z.string(),
    }),
  ),
  termTaxonomies: z.array(
    z.object({
      termTaxonomyId: z.number(),
      wpTermId: z.number(),
      taxonomySlug: z.string(),
    }),
  ),
  termRelationships: z.array(
    z.object({
      wpPostId: z.number(),
      termTaxonomyId: z.number(),
    }),
  ),
  media: z.array(
    z.object({
      wpId: z.number(),
      url: z.string(),
      mimeType: z.string(),
      altText: z.string().nullable(),
    }),
  ),
  redirects: z.array(
    z.object({
      source: z.string(),
      destination: z.string(),
      statusCode: z.number(),
      enabled: z.boolean(),
    }),
  ),
});

const argv = process.argv.slice(2);

function getFlagValue(flag: string): string | undefined {
  const eq = argv.find((a) => a.startsWith(`${flag}=`));
  if (eq) return eq.split("=").slice(1).join("=");
  const idx = argv.indexOf(flag);
  if (idx >= 0) return argv[idx + 1];
  return undefined;
}

export async function importMirEtlDump(
  dumpPath: string,
  options?: { authorId?: string | null },
) {
  const raw = await fs.readFile(dumpPath, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  const dump = dumpSchema.parse(parsed);

  console.log(`[MIR ETL] Importing dump (${dump.generatedAt}) from: ${dumpPath}`);

  // Resolve authorId (admin user)
  const authorId =
    options?.authorId ??
    (await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    }))?.id ??
    (await prisma.user.findFirst({ select: { id: true } }))?.id;

  if (!authorId) {
    throw new Error(
      "No author/admin user found in Prisma. Seed users first (prisma/seed.ts).",
    );
  }

  // 1) Taxonomies + Terms
  const taxonomySlugs = Array.from(
    new Set(dump.taxonomiesTerms.map((t) => t.taxonomySlug)),
  );

  for (const slug of taxonomySlugs) {
    await prisma.taxonomy.upsert({
      where: { slug },
      update: {},
      create: { slug, name: slug },
    });
  }

  const taxonomyRecords = await prisma.taxonomy.findMany({
    where: { slug: { in: taxonomySlugs } },
    select: { id: true, slug: true },
  });
  const taxonomyIdBySlug = new Map<string, string>(
    taxonomyRecords.map((t) => [t.slug, t.id]),
  );

  for (const row of dump.taxonomiesTerms) {
    const taxonomyId = taxonomyIdBySlug.get(row.taxonomySlug);
    if (!taxonomyId) continue;

    await prisma.term.upsert({
      where: {
        taxonomyId_slug: { taxonomyId, slug: row.slug },
      },
      update: {
        name: row.name,
        description: row.description ?? null,
      },
      create: {
        wpTermId: row.wpTermId,
        taxonomyId,
        slug: row.slug,
        name: row.name,
        description: row.description ?? null,
        parentTermId: null,
      },
    });
  }

  console.log(`[MIR ETL] Terms imported: ${dump.taxonomiesTerms.length}`);

  // 2) Media / attachments (required for featuredMediaId mapping)
  for (const m of dump.media) {
    await prisma.media.upsert({
      where: { wpId: m.wpId },
      update: {
        url: m.url,
        mimeType: m.mimeType,
        altText: m.altText ?? null,
      },
      create: {
        wpId: m.wpId,
        url: m.url,
        mimeType: m.mimeType,
        altText: m.altText ?? null,
      },
    });
  }

  console.log(`[MIR ETL] Media imported: ${dump.media.length}`);

  // 3) Posts — first pass: resolve English slugs per translation group
  const englishSlugByGroup = new Map<string, string>();
  for (const p of dump.posts) {
    if (p.locale === "en" && p.slug && !/[\u1000-\u109F]/.test(p.slug)) {
      englishSlugByGroup.set(p.translationGroup || p.wpId.toString(), p.slug);
    }
  }

  // Track used slugs to avoid duplicates
  const usedSlugs = new Set<string>();
  function makeUniqueSlug(slug: string, wpId: number): string {
    let candidate = slug;
    let counter = 1;
    while (usedSlugs.has(candidate)) {
      candidate = `${slug}-${counter}`;
      counter++;
    }
    usedSlugs.add(candidate);
    return candidate;
  }

  // Build resolved slugs for all posts
  const resolvedSlugs = new Map<number, string>();
  for (const p of dump.posts) {
    const groupKey = p.translationGroup || p.wpId.toString();
    const enSlug = englishSlugByGroup.get(groupKey) || null;
    let slug = resolveSlug(p, enSlug);
    slug = makeUniqueSlug(slug, p.wpId);
    resolvedSlugs.set(p.wpId, slug);
  }

  // Second pass: import posts with resolved slugs
  for (const p of dump.posts) {
    const publishedAt = p.publishedAt ? new Date(p.publishedAt) : null;
    const publishedAtGmt = p.publishedAtGmt ? new Date(p.publishedAtGmt) : null;
    const modifiedAt = p.modifiedAt ? new Date(p.modifiedAt) : null;

    if (!modifiedAt) {
      const fallback = publishedAt ?? new Date();
      console.warn(
        `[MIR ETL] Missing modifiedAt for wpPostId=${p.wpId}; using fallback=${fallback.toISOString()}`,
      );
    }

    const slug = resolvedSlugs.get(p.wpId) || p.slug;

    await prisma.post.upsert({
      where: {
        type_slug_locale: { type: p.type, slug, locale: p.locale },
      },
      update: {
        title: p.title,
        excerpt: p.excerpt,
        contentHtml: p.contentHtml,
        menuOrder: p.menuOrder || 0,
        publishedAt: publishedAt,
        publishedAtGmt: publishedAtGmt,
        modifiedAt: modifiedAt ?? (publishedAt ?? new Date()),
        commentStatus: p.commentStatus || "open",
        translationGroup: p.translationGroup,
      },
      create: {
        wpId: p.wpId,
        type: p.type,
        status: p.status,
        slug,
        title: p.title,
        excerpt: p.excerpt,
        contentHtml: p.contentHtml,
        menuOrder: p.menuOrder || 0,
        publishedAt,
        publishedAtGmt,
        modifiedAt: modifiedAt ?? (publishedAt ?? new Date()),
        commentStatus: p.commentStatus || "open",
        locale: p.locale,
        translationGroup: p.translationGroup,
        authorId,
        parentId: null,
      },
    });
  }

  console.log(`[MIR ETL] Posts imported: ${dump.posts.length} (slugs converted to English)`);

  // Map wpId -> prisma postId
  const postWpIds = dump.posts.map((p) => p.wpId);
  const postRecords = await prisma.post.findMany({
    where: { wpId: { in: postWpIds } },
    select: { id: true, wpId: true },
  });
  const postIdByWpId = new Map<number, string>(
    postRecords.map((r) => [r.wpId as number, r.id]),
  );

  // 4) Post meta + featuredMediaId updates + PostMeta rows
  const specialSeoTitleByWpId = new Map<number, string>();
  const specialSeoDescriptionByWpId = new Map<number, string>();
  const specialSeoKeywordsByWpId = new Map<number, string>();
  const specialIsFeaturedByWpId = new Map<number, boolean>();
  const specialIsPopularByWpId = new Map<number, boolean>();
  const specialFeaturedMediaWpIdByWpId = new Map<number, number>();

  // Fetch existing PostMeta IDs for fast updates
  const postIdsForMeta = Array.from(postIdByWpId.values());
  const existingMeta = await prisma.postMeta.findMany({
    where: { postId: { in: postIdsForMeta } },
    select: { id: true, postId: true, key: true },
  });
  const existingMetaIdByPostIdAndKey = new Map<string, string>(
    existingMeta.map((m) => [`${m.postId}:${m.key}`, m.id]),
  );

  // Also cache Media IDs (for featuredMediaId mapping)
  const featuredMediaWpIds = new Set<number>();
  for (const pm of dump.postMeta) {
    if (pm.metaKey === "_thumbnail_id") {
      const n = Number(pm.metaValue);
      if (Number.isFinite(n)) featuredMediaWpIds.add(n);
    }
  }
  const mediaRecords = await prisma.media.findMany({
    where: featuredMediaWpIds.size
      ? { wpId: { in: Array.from(featuredMediaWpIds) } }
      : undefined,
    select: { id: true, wpId: true },
  });
  const mediaIdByWpId = new Map<number, string>(
    mediaRecords.map((m) => [m.wpId as number, m.id]),
  );

  // Normal meta keys -> PostMeta rows; special keys -> stored for later Post update.
  const postMetaCreates: { postId: string; key: string; value: string }[] = [];
  const postMetaUpdates: { id: string; value: string }[] = [];

  for (const pm of dump.postMeta) {
    const postId = postIdByWpId.get(pm.wpPostId);
    if (!postId) continue;

    switch (pm.metaKey) {
      case "_yoast_wpseo_title":
        specialSeoTitleByWpId.set(pm.wpPostId, pm.metaValue);
        break;
      case "_yoast_wpseo_metadesc":
        specialSeoDescriptionByWpId.set(pm.wpPostId, pm.metaValue);
        break;
      case "_yoast_wpseo_focuskw":
        specialSeoKeywordsByWpId.set(pm.wpPostId, pm.metaValue);
        break;
      case "is_featured":
        specialIsFeaturedByWpId.set(
          pm.wpPostId,
          pm.metaValue === "1" || pm.metaValue === "true",
        );
        break;
      case "is_popular":
        specialIsPopularByWpId.set(
          pm.wpPostId,
          pm.metaValue === "1" || pm.metaValue === "true",
        );
        break;
      case "_thumbnail_id": {
        const n = Number(pm.metaValue);
        if (Number.isFinite(n)) specialFeaturedMediaWpIdByWpId.set(pm.wpPostId, n);
        break;
      }
      default: {
        const key = pm.metaKey;
        const mapKey = `${postId}:${key}`;
        const existingId = existingMetaIdByPostIdAndKey.get(mapKey);

        if (existingId) {
          postMetaUpdates.push({ id: existingId, value: pm.metaValue });
        } else {
          postMetaCreates.push({ postId, key, value: pm.metaValue });
        }
      }
    }
  }

  // Batch create and update
  console.log(`[MIR ETL] Batch creating ${postMetaCreates.length} PostMeta rows...`);
  for (let i = 0; i < postMetaCreates.length; i += 500) {
    const batch = postMetaCreates.slice(i, i + 500);
    await prisma.postMeta.createMany({ data: batch, skipDuplicates: true });
  }

  console.log(`[MIR ETL] Batch updating ${postMetaUpdates.length} PostMeta rows...`);
  for (let i = 0; i < postMetaUpdates.length; i += 100) {
    const batch = postMetaUpdates.slice(i, i + 100);
    await Promise.all(
      batch.map((update) =>
        prisma.postMeta.update({ where: { id: update.id }, data: { value: update.value } })
      )
    );
  }

  console.log(`[MIR ETL] PostMeta imported: ${dump.postMeta.length}`);

  // Update Posts with special columns (batch)
  const postUpdates: { id: string; data: Parameters<typeof prisma.post.update>[0]["data"] }[] = [];

  for (const [wpPostId, postId] of postIdByWpId.entries()) {
    const updateData: Parameters<typeof prisma.post.update>[0]["data"] = {};

    const seoTitle = specialSeoTitleByWpId.get(wpPostId);
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;

    const seoDescription = specialSeoDescriptionByWpId.get(wpPostId);
    if (seoDescription !== undefined)
      updateData.seoDescription = seoDescription;

    const seoKeywords = specialSeoKeywordsByWpId.get(wpPostId);
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords;

    const isFeatured = specialIsFeaturedByWpId.get(wpPostId);
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    const isPopular = specialIsPopularByWpId.get(wpPostId);
    if (isPopular !== undefined) updateData.isPopular = isPopular;

    const featuredMediaWpId = specialFeaturedMediaWpIdByWpId.get(wpPostId);
    if (featuredMediaWpId !== undefined) {
      const featuredMediaId = mediaIdByWpId.get(featuredMediaWpId);
      if (featuredMediaId) updateData.featuredMediaId = featuredMediaId;
    }

    if (Object.keys(updateData).length) {
      postUpdates.push({ id: postId, data: updateData });
    }
  }

  console.log(`[MIR ETL] Updating ${postUpdates.length} posts with meta data...`);
  for (let i = 0; i < postUpdates.length; i += 50) {
    const batch = postUpdates.slice(i, i + 50);
    await Promise.all(
      batch.map((update) =>
        prisma.post.update({ where: { id: update.id }, data: update.data })
      )
    );
  }

  console.log(`[MIR ETL] PostMeta imported: ${dump.postMeta.length}`);

  // 5) Term relationships -> PostTerm links (batch)
  const termTaxonomyById = new Map<
    number,
    { wpTermId: number; taxonomySlug: string }
  >(
    dump.termTaxonomies.map((t) => [
      t.termTaxonomyId,
      { wpTermId: t.wpTermId, taxonomySlug: t.taxonomySlug },
    ]),
  );

  // Fetch term records for the wpTermIds we need
  const neededTaxonomySlugs = Array.from(
    new Set(
      dump.termTaxonomies
        .map((t) => t.taxonomySlug)
        .filter(Boolean),
    ),
  );
  const neededTaxonomyIds = await prisma.taxonomy.findMany({
    where: { slug: { in: neededTaxonomySlugs } },
    select: { id: true, slug: true },
  });
  const termTaxonomyIdBySlug = new Map(
    neededTaxonomyIds.map((t) => [t.slug, t.id]),
  );

  const neededWpTermIds = Array.from(
    new Set(dump.termTaxonomies.map((t) => t.wpTermId)),
  );
  const termRecords = await prisma.term.findMany({
    where: {
      wpTermId: { in: neededWpTermIds },
      taxonomyId: { in: Array.from(termTaxonomyIdBySlug.values()) },
    },
    select: { id: true, wpTermId: true, taxonomyId: true },
  });
  const termIdByTaxonomyIdAndWpTermId = new Map<string, string>(
    termRecords.map((t) => [`${t.taxonomyId}:${t.wpTermId}`, t.id]),
  );

  // Build batch of post-term relationships
  const postTermCreates: { postId: string; termId: string }[] = [];
  for (const rel of dump.termRelationships) {
    const postId = postIdByWpId.get(rel.wpPostId);
    if (!postId) continue;

    const tt = termTaxonomyById.get(rel.termTaxonomyId);
    if (!tt) continue;

    const taxonomyId = termTaxonomyIdBySlug.get(tt.taxonomySlug);
    if (!taxonomyId) continue;

    const termId = termIdByTaxonomyIdAndWpTermId.get(
      `${taxonomyId}:${tt.wpTermId}`,
    );
    if (!termId) continue;

    postTermCreates.push({ postId, termId });
  }

  console.log(`[MIR ETL] Batch creating ${postTermCreates.length} post-term relationships...`);
  for (let i = 0; i < postTermCreates.length; i += 500) {
    const batch = postTermCreates.slice(i, i + 500);
    await prisma.postTerm.createMany({ data: batch, skipDuplicates: true });
  }

  console.log(
    `[MIR ETL] PostTerm links imported: ${dump.termRelationships.length}`,
  );

  // 6) Redirects (batch)
  console.log(`[MIR ETL] Importing ${dump.redirects.length} redirects...`);
  for (let i = 0; i < dump.redirects.length; i += 500) {
    const batch = dump.redirects.slice(i, i + 500);
    await prisma.redirect.createMany({ data: batch, skipDuplicates: true });
  }

  console.log(`[MIR ETL] Redirects imported: ${dump.redirects.length}`);
}

async function runFromCli() {
  const dumpPath =
    getFlagValue("--dump") ||
    getFlagValue("--input") ||
    path.join(process.cwd(), "docs", "migration-samples", "mir-etl-dump.json");

  const authorId = getFlagValue("--authorId") || null;

  await importMirEtlDump(dumpPath, { authorId });
}

// Run when executed directly (not when imported)
if (require.main === module) {
  void runFromCli().catch((e) => {
    console.error("[MIR ETL] Import failed:", e);
    process.exit(1);
  });
}


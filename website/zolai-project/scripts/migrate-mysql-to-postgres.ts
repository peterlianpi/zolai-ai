import mysql from "mysql2/promise";
import prisma from "../lib/prisma";
import type { PostType, PostStatus } from "../lib/generated/prisma/enums";

const MYSQL_CONFIG = {
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "root",
  database: "mir",
  charset: "utf8mb4",
};

let mysqlConn: mysql.Connection | null = null;

function log(stage: string, count: number, detail?: string) {
  console.log(`[MIGRATE] ${stage}: ${count}${detail ? ` (${detail})` : ""}`);
}

async function getMySqlConn() {
  if (!mysqlConn) {
    mysqlConn = await mysql.createConnection(MYSQL_CONFIG);
    await mysqlConn.execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
  }
  return mysqlConn;
}

async function migrateTaxonomies() {
  const conn = await getMySqlConn();
  const [rows] = await conn.execute(`
    SELECT tt.term_taxonomy_id, tt.term_id, tt.taxonomy, tt.description, tt.parent,
           t.name, t.slug
    FROM mir_term_taxonomy tt
    JOIN mir_terms t ON tt.term_id = t.term_id
    WHERE tt.taxonomy IN ('category', 'post_tag', 'new_categories', 'new_tags')
  `) as [any[], any];

  const taxonomies = new Map<string, string>();
  for (const row of rows) {
    if (!taxonomies.has(row.taxonomy)) {
      await prisma.taxonomy.upsert({
        where: { slug: row.taxonomy },
        create: { slug: row.taxonomy, name: row.taxonomy },
        update: {},
      });
      taxonomies.set(row.taxonomy, row.taxonomy);
    }
  }

  for (const row of rows) {
    await prisma.term.upsert({
      where: {
        taxonomyId_slug: { taxonomyId: row.taxonomy, slug: row.slug },
      },
      create: {
        wpTermId: row.term_id,
        taxonomyId: row.taxonomy,
        slug: row.slug,
        name: row.name,
        description: row.description || null,
        parentTermId: row.parent > 0 ? undefined : null,
      },
      update: {
        name: row.name,
        description: row.description || null,
      },
    });
  }

  log("Taxonomies", rows.length, `${taxonomies.size} taxonomy types`);
  return rows;
}

async function migratePosts(taxonomyRows: any[]) {
  const conn = await getMySqlConn();

  const [defaultUser] = await prisma.user.findMany({ take: 1 });
  const authorId = defaultUser?.id || "system";

  const [posts] = await conn.execute(`
    SELECT ID, post_author, post_date, post_date_gmt, post_content, post_title,
           post_excerpt, post_status, post_name, post_modified, post_modified_gmt,
           post_type, post_parent, menu_order, comment_status
    FROM mir_posts
    WHERE post_type IN ('post', 'page', 'news')
      AND post_status = 'publish'
    ORDER BY post_date ASC
    LIMIT 200
  `) as [any[], any];

  const [polylangRows] = await conn.execute(`
    SELECT object_id, taxonomy, term_taxonomy_id
    FROM mir_term_relationships tr
    JOIN mir_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
    WHERE tt.taxonomy IN ('language', 'post_translations')
      AND tr.object_id IN (${posts.map((p: any) => p.ID).join(",")})
  `) as [any[], any];

  const postLangMap = new Map<number, string>();
  const postTranslationGroupMap = new Map<number, string>();

  for (const row of polylangRows) {
    if (row.taxonomy === "language") {
      const [termRows] = await conn.execute(
        "SELECT slug FROM mir_terms t JOIN mir_term_taxonomy tt ON t.term_id = tt.term_id WHERE tt.term_taxonomy_id = ?",
        [row.term_taxonomy_id]
      ) as [any[], any];
      if (termRows.length > 0) {
        postLangMap.set(row.object_id, termRows[0].slug);
      }
    } else if (row.taxonomy === "post_translations") {
      postTranslationGroupMap.set(row.object_id, `wp-tr-${row.term_taxonomy_id}`);
    }
  }

  const typeMap: Record<string, "POST" | "PAGE" | "NEWS"> = {
    post: "POST",
    page: "PAGE",
    news: "NEWS",
  };

  const statusMap: Record<string, "PUBLISHED" | "DRAFT" | "PENDING" | "TRASH"> = {
    publish: "PUBLISHED",
    draft: "DRAFT",
    pending: "PENDING",
    trash: "TRASH",
  };

  for (const post of posts) {
    const locale = postLangMap.get(post.ID) === "my" ? "my" : "en";
    const translationGroup = postTranslationGroupMap.get(post.ID) || null;

    await prisma.post.upsert({
      where: {
        type_slug_locale: {
          type: typeMap[post.post_type] || "POST",
          slug: post.post_name,
          locale,
        },
      },
      create: {
        wpId: post.ID,
        type: typeMap[post.post_type] || "POST",
        status: statusMap[post.post_status] || "PUBLISHED",
        slug: post.post_name,
        title: post.post_title,
        excerpt: post.post_excerpt || null,
        contentHtml: post.post_content,
        menuOrder: post.menu_order || 0,
        publishedAt: post.post_date ? new Date(post.post_date) : null,
        publishedAtGmt: post.post_date_gmt ? new Date(post.post_date_gmt) : null,
        modifiedAt: new Date(post.post_modified || post.post_date),
        commentStatus: post.comment_status || "open",
        locale,
        translationGroup,
        authorId,
        parentId: post.post_parent > 0 ? undefined : null,
      },
      update: {
        title: post.post_title,
        excerpt: post.post_excerpt || null,
        contentHtml: post.post_content,
        menuOrder: post.menu_order || 0,
        publishedAt: post.post_date ? new Date(post.post_date) : null,
        publishedAtGmt: post.post_date_gmt ? new Date(post.post_date_gmt) : null,
        modifiedAt: new Date(post.post_modified || post.post_date),
        commentStatus: post.comment_status || "open",
        locale,
        translationGroup,
      },
    });
  }

  log("Posts", posts.length);

  const postIds = posts.map((p: any) => p.ID);
  return { posts, postIds, authorId };
}

async function migratePostMeta(postIds: number[]) {
  if (postIds.length === 0) return;

  const conn = await getMySqlConn();
  const [metaRows] = await conn.execute(`
    SELECT post_id, meta_key, meta_value
    FROM mir_postmeta
    WHERE post_id IN (${postIds.join(",")})
      AND meta_key NOT LIKE '_edit%'
      AND meta_key NOT LIKE '_wp_lock%'
  `) as [any[], any];

  const seoMeta = new Map<number, { seoTitle?: string; seoDescription?: string; seoKeywords?: string }>();
  const customMeta = new Map<number, { isFeatured?: boolean; isPopular?: boolean }>();
  const featuredImages = new Map<number, number>();
  const altTexts = new Map<number, string>();

  for (const meta of metaRows) {
    const postId = meta.post_id;

    if (meta.meta_key === "_yoast_wpseo_title") {
      seoMeta.set(postId, { ...(seoMeta.get(postId) || {}), seoTitle: meta.meta_value });
    } else if (meta.meta_key === "_yoast_wpseo_metadesc") {
      seoMeta.set(postId, { ...(seoMeta.get(postId) || {}), seoDescription: meta.meta_value });
    } else if (meta.meta_key === "_yoast_wpseo_focuskw") {
      seoMeta.set(postId, { ...(seoMeta.get(postId) || {}), seoKeywords: meta.meta_value });
    } else if (meta.meta_key === "is_featured") {
      customMeta.set(postId, { ...(customMeta.get(postId) || {}), isFeatured: meta.meta_value === "1" || meta.meta_value === "true" });
    } else if (meta.meta_key === "is_popular") {
      customMeta.set(postId, { ...(customMeta.get(postId) || {}), isPopular: meta.meta_value === "1" || meta.meta_value === "true" });
    } else if (meta.meta_key === "_thumbnail_id") {
      featuredImages.set(postId, parseInt(meta.meta_value));
    } else if (meta.meta_key === "_wp_attachment_image_alt") {
      altTexts.set(postId, meta.meta_value);
    } else {
      const wpPost = await prisma.post.findUnique({ where: { wpId: postId } });
      if (wpPost) {
        const existing = await prisma.postMeta.findFirst({
          where: { postId: wpPost.id, key: meta.meta_key },
        });
        if (existing) {
          await prisma.postMeta.update({
            where: { id: existing.id },
            data: { value: meta.meta_value },
          });
        } else {
          await prisma.postMeta.create({
            data: {
              postId: wpPost.id,
              key: meta.meta_key,
              value: meta.meta_value,
            },
          });
        }
      }
    }
  }

  const posts = await prisma.post.findMany({
    where: { wpId: { in: postIds } },
    select: { id: true, wpId: true },
  });

  for (const post of posts) {
    const wpId = post.wpId!;
    const seo = seoMeta.get(wpId);
    const custom = customMeta.get(wpId);
    const featuredMediaId = featuredImages.get(wpId);

    const updateData: any = {};
    if (seo) {
      if (seo.seoTitle) updateData.seoTitle = seo.seoTitle;
      if (seo.seoDescription) updateData.seoDescription = seo.seoDescription;
      if (seo.seoKeywords) updateData.seoKeywords = seo.seoKeywords;
    }
    if (custom) {
      if (custom.isFeatured !== undefined) updateData.isFeatured = custom.isFeatured;
      if (custom.isPopular !== undefined) updateData.isPopular = custom.isPopular;
    }

    if (featuredMediaId) {
      const media = await prisma.media.findUnique({ where: { wpId: featuredMediaId } });
      if (media) updateData.featuredMediaId = media.id;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.post.update({
        where: { id: post.id },
        data: updateData,
      });
    }
  }

  log("PostMeta", metaRows.length, `${seoMeta.size} SEO, ${customMeta.size} custom fields`);
}

async function migrateTermRelationships(postIds: number[]) {
  if (postIds.length === 0) return;

  const conn = await getMySqlConn();
  const [rels] = await conn.execute(`
    SELECT object_id, term_taxonomy_id
    FROM mir_term_relationships
    WHERE object_id IN (${postIds.join(",")})
  `) as [any[], any];

  const [ttRows] = await conn.execute(`
    SELECT term_taxonomy_id, term_id, taxonomy
    FROM mir_term_taxonomy
    WHERE term_taxonomy_id IN (${rels.map((r: any) => r.term_taxonomy_id).join(",")})
  `) as [any[], any];

  const ttMap = new Map<number, { term_id: number; taxonomy: string }>();
  for (const tt of ttRows) {
    ttMap.set(tt.term_taxonomy_id, { term_id: tt.term_id, taxonomy: tt.taxonomy });
  }

  const posts = await prisma.post.findMany({
    where: { wpId: { in: postIds } },
    select: { id: true, wpId: true },
  });

  const postWpIdMap = new Map<number, string>();
  for (const p of posts) {
    if (p.wpId) postWpIdMap.set(p.wpId, p.id);
  }

  for (const rel of rels) {
    const ttInfo = ttMap.get(rel.term_taxonomy_id);
    if (!ttInfo) continue;

    const postId = postWpIdMap.get(rel.object_id);
    if (!postId) continue;

    const term = await prisma.term.findFirst({
      where: {
        wpTermId: ttInfo.term_id,
        taxonomyId: ttInfo.taxonomy,
      },
    });

    if (term) {
      await prisma.postTerm.upsert({
        where: {
          postId_termId: { postId, termId: term.id },
        },
        create: { postId, termId: term.id },
        update: {},
      });
    }
  }

  log("TermRelationships", rels.length);
}

async function migrateMedia() {
  const conn = await getMySqlConn();
  const [attachments] = await conn.execute(`
    SELECT ID, guid, post_mime_type, post_parent
    FROM mir_posts
    WHERE post_type = 'attachment'
  `) as [any[], any];

  for (const att of attachments) {
    const [altRows] = await conn.execute(
      "SELECT meta_value FROM mir_postmeta WHERE post_id = ? AND meta_key = '_wp_attachment_image_alt'",
      [att.ID]
    ) as [any[], any];

    const altText = altRows.length > 0 ? altRows[0].meta_value : null;

    await prisma.media.upsert({
      where: { wpId: att.ID },
      create: {
        wpId: att.ID,
        url: att.guid,
        mimeType: att.post_mime_type || "application/octet-stream",
        altText,
      },
      update: {
        url: att.guid,
        mimeType: att.post_mime_type || "application/octet-stream",
        altText: altText || undefined,
      },
    });
  }

  log("Media", attachments.length);
}

async function migrateRedirects(postIds: number[]) {
  const conn = await getMySqlConn();
  const [posts] = await conn.execute(`
    SELECT ID, post_name, post_type
    FROM mir_posts
    WHERE ID IN (${postIds.join(",")})
  `) as [any[], any];

  for (const post of posts) {
    const oldUrl = `/?p=${post.ID}`;
    const newUrl = `/${post.post_type === "page" ? "pages" : post.post_type === "news" ? "news" : "posts"}/${post.post_name}`;

    await prisma.redirect.upsert({
      where: { source: oldUrl },
      create: {
        source: oldUrl,
        destination: newUrl,
        statusCode: 301,
        enabled: true,
      },
      update: {
        destination: newUrl,
      },
    });
  }

  log("Redirects", posts.length);
}

async function main() {
  console.log("[MIGRATE] Starting MySQL → PostgreSQL migration");

  try {
    const taxonomyRows = await migrateTaxonomies();
    const { postIds } = await migratePosts(taxonomyRows);
    await migratePostMeta(postIds);
    await migrateTermRelationships(postIds);
    await migrateMedia();
    await migrateRedirects(postIds);

    console.log("[MIGRATE] Migration completed successfully");
  } catch (error) {
    console.error("[MIGRATE] Migration failed:", error);
    process.exit(1);
  } finally {
    if (mysqlConn) {
      await mysqlConn.end();
    }
    await prisma.$disconnect();
  }
}

main();

import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { z } from "zod";

// Dump a snapshot of legacy MIR MySQL tables (`mir_*`) into a JSON contract.
// The importer script (`scripts/mir-etl-import.ts`) is the only supported consumer.

const argv = process.argv.slice(2);

function getFlagValue(flag: string): string | undefined {
  // Supports: --flag=value and --flag value
  const eq = argv.find((a) => a.startsWith(`${flag}=`));
  if (eq) return eq.split("=").slice(1).join("=");

  const idx = argv.indexOf(flag);
  if (idx >= 0) return argv[idx + 1];
  return undefined;
}

function getFlagNumber(flag: string, fallback: number): number {
  const v = getFlagValue(flag);
  if (!v) return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return n;
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

type Dump = z.infer<typeof dumpSchema>;

const MYSQL_CONFIG = {
  host: process.env.MIR_MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MIR_MYSQL_PORT || 3306),
  user: process.env.MIR_MYSQL_USER || "root",
  password: process.env.MIR_MYSQL_PASS || "root",
  database: process.env.MIR_MYSQL_DB || "mir",
};

async function getMySqlConn() {
  const conn = await mysql.createConnection({
    ...MYSQL_CONFIG,
    charset: "utf8mb4",
  });
  await conn.execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
  return conn;
}

async function main() {
  const output =
    getFlagValue("--output") ||
    path.join(
      process.cwd(),
      "docs",
      "migration-samples",
      `mir-etl-dump-${Date.now()}.json`,
    );

  const limit = getFlagNumber("--limit", 200);

  const conn = await getMySqlConn();

  // 1) Taxonomies/terms inventory (categories/tags/new_* taxonomies)
  const [taxonomyRows] = await conn.execute(
    `
      SELECT tt.term_taxonomy_id, tt.term_id, tt.taxonomy, tt.description, tt.parent,
             t.name, t.slug
      FROM mir_term_taxonomy tt
      JOIN mir_terms t ON tt.term_id = t.term_id
      WHERE tt.taxonomy IN ('category', 'post_tag', 'new_categories', 'new_tags')
    `,
  );

  type TaxRow = {
    term_taxonomy_id: number;
    term_id: number;
    taxonomy: string;
    description: string | null;
    parent: number;
    name: string;
    slug: string;
  };

  const taxonomiesTerms: Dump["taxonomiesTerms"] = (taxonomyRows as TaxRow[]).map(
    (r) => ({
      termTaxonomyId: r.term_taxonomy_id,
      wpTermId: r.term_id,
      taxonomySlug: r.taxonomy,
      description: r.description,
      parent: r.parent,
      name: r.name,
      slug: r.slug,
    }),
  );

  // 2) Posts sample (post/page/news + publish)
  const [postsRows] = await conn.query(
    `
      SELECT ID, post_author, post_date, post_date_gmt, post_content, post_title,
             post_excerpt, post_status, post_name, post_modified, post_modified_gmt,
             post_type, post_parent, menu_order, comment_status
      FROM mir_posts
      WHERE post_type IN ('post', 'page', 'news')
        AND post_status = 'publish'
      ORDER BY post_date ASC
      LIMIT ?
    `,
    [limit],
  );

  type PostRow = {
    ID: number;
    post_author: number;
    post_date: string | null;
    post_date_gmt: string | null;
    post_content: string;
    post_title: string;
    post_excerpt: string | null;
    post_status: string;
    post_name: string;
    post_modified: string;
    post_modified_gmt: string | null;
    post_type: string;
    post_parent: number;
    menu_order: number;
    comment_status: string | null;
  };

  const posts = postsRows as PostRow[];
  const wpPostIds = posts.map((p) => p.ID);

  // 2.1) Polylang mapping for those posts
  const inClause = wpPostIds.length ? wpPostIds.join(",") : "NULL";

  const [polylangRows] = await conn.query(
    `
      SELECT tr.object_id, tt.taxonomy, tr.term_taxonomy_id
      FROM mir_term_relationships tr
      JOIN mir_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
      WHERE tt.taxonomy IN ('language', 'post_translations')
        AND tr.object_id IN (${inClause})
    `,
  );

  type PolylangRow = {
    object_id: number;
    taxonomy: "language" | "post_translations";
    term_taxonomy_id: number;
  };

  const postLangMap = new Map<number, string>();
  const postTranslationGroupMap = new Map<number, string | null>();

  const polylang = (polylangRows as PolylangRow[]).filter(
    (r) => r.object_id && r.term_taxonomy_id,
  );

  // Language slug lookup (language taxonomy terms are in mir_terms)
  for (const row of polylang) {
    if (row.taxonomy === "language") {
      const [termRows] = await conn.execute(
        `
          SELECT slug
          FROM mir_terms t
          JOIN mir_term_taxonomy tt ON t.term_id = tt.term_id
          WHERE tt.term_taxonomy_id = ?
        `,
        [row.term_taxonomy_id],
      );
      type SlugRow = { slug: string };
      const slug = (termRows as SlugRow[])[0]?.slug;
      if (slug) postLangMap.set(row.object_id, slug);
    } else if (row.taxonomy === "post_translations") {
      postTranslationGroupMap.set(row.object_id, `wp-tr-${row.term_taxonomy_id}`);
    }
  }

  const typeMap: Record<string, Dump["posts"][number]["type"]> = {
    post: "POST",
    page: "PAGE",
    news: "NEWS",
  };

  const statusMap: Record<string, Dump["posts"][number]["status"]> = {
    publish: "PUBLISHED",
    draft: "DRAFT",
    pending: "PENDING",
    trash: "TRASH",
  };

  // 2.2) Compute final post dump rows (locale + translationGroup)
  const postsDump: Dump["posts"] = posts.map((p) => {
    const locale: Dump["posts"][number]["locale"] =
      postLangMap.get(p.ID) === "my" ? "my" : "en";

    const translationGroup = postTranslationGroupMap.get(p.ID) ?? null;

    return {
      wpId: p.ID,
      type: typeMap[p.post_type] ?? "POST",
      status: statusMap[p.post_status] ?? "PUBLISHED",
      slug: p.post_name,
      title: p.post_title,
      excerpt: p.post_excerpt,
      contentHtml: p.post_content,
      menuOrder: p.menu_order || 0,
      publishedAt: p.post_date ? String(p.post_date) : null,
      publishedAtGmt: p.post_date_gmt ? String(p.post_date_gmt) : null,
      modifiedAt: p.post_modified ? String(p.post_modified) : String(p.post_date),
      commentStatus: p.comment_status || "open",
      locale,
      translationGroup,
      wpParentId: p.post_parent || 0,
    };
  });

  // 3) Post meta for those posts (excluding internal meta keys)
  const [metaRows] = await conn.execute(
    `
      SELECT post_id, meta_key, meta_value
      FROM mir_postmeta
      WHERE post_id IN (${wpPostIds.join(",")})
        AND meta_key NOT LIKE '_edit%'
        AND meta_key NOT LIKE '_wp_lock%'
    `,
  );

  type MetaRow = { post_id: number; meta_key: string; meta_value: string };
  const postMeta: Dump["postMeta"] = (metaRows as MetaRow[]).map((m) => ({
    wpPostId: m.post_id,
    metaKey: m.meta_key,
    metaValue: String(m.meta_value),
  }));

  // 4) Term relationships for those posts
  const [rels] = await conn.execute(
    `
      SELECT object_id, term_taxonomy_id
      FROM mir_term_relationships
      WHERE object_id IN (${wpPostIds.join(",")})
    `,
  );

  type RelRow = { object_id: number; term_taxonomy_id: number };
  const termRelationships: Dump["termRelationships"] = (rels as RelRow[]).map(
    (r) => ({
      wpPostId: r.object_id,
      termTaxonomyId: r.term_taxonomy_id,
    }),
  );

  const termTaxonomyIds = Array.from(
    new Set(termRelationships.map((r) => r.termTaxonomyId)),
  );

  const ttInClause = termTaxonomyIds.length
    ? termTaxonomyIds.join(",")
    : "NULL";

  const [ttRows] = await conn.execute(
    `
      SELECT term_taxonomy_id, term_id, taxonomy
      FROM mir_term_taxonomy
      WHERE term_taxonomy_id IN (${ttInClause})
    `,
  );

  type TTRow = {
    term_taxonomy_id: number;
    term_id: number;
    taxonomy: string;
  };

  const termTaxonomies: Dump["termTaxonomies"] = (ttRows as TTRow[]).map(
    (tt) => ({
      termTaxonomyId: tt.term_taxonomy_id,
      wpTermId: tt.term_id,
      taxonomySlug: tt.taxonomy,
    }),
  );

  // 5) Media attachments (and their alt text)
  const [attachments] = await conn.execute(
    `
      SELECT ID, guid, post_mime_type
      FROM mir_posts
      WHERE post_type = 'attachment'
    `,
  );

  type AttachmentRow = {
    ID: number;
    guid: string;
    post_mime_type: string | null;
  };

  const attachmentsRows = attachments as AttachmentRow[];
  const attachmentIds = attachmentsRows.map((a) => a.ID);

  const altTextMap = new Map<number, string | null>();
  if (attachmentIds.length) {
    const [altRows] = await conn.execute(
      `
        SELECT post_id, meta_value
        FROM mir_postmeta
        WHERE post_id IN (${attachmentIds.join(",")})
          AND meta_key = '_wp_attachment_image_alt'
      `,
    );

    type AltRow = { post_id: number; meta_value: string | null };
    for (const alt of altRows as AltRow[]) {
      altTextMap.set(alt.post_id, alt.meta_value);
    }
  }

  const media: Dump["media"] = attachmentsRows.map((att) => ({
    wpId: att.ID,
    url: att.guid,
    mimeType: att.post_mime_type || "application/octet-stream",
    altText: altTextMap.get(att.ID) ?? null,
  }));

  // 6) Redirects derived from the post sample
  const redirects = posts.map((p) => {
    const newUrl = `/${
      p.post_type === "page" ? "pages" : p.post_type === "news" ? "news" : "posts"
    }/${p.post_name}`;

    return {
      source: `/?p=${p.ID}`,
      destination: newUrl,
      statusCode: 301,
      enabled: true,
    };
  });

  const dump: Dump = {
    version: 1,
    generatedAt: new Date().toISOString(),
    limit,
    mysql: {
      host: MYSQL_CONFIG.host,
      port: MYSQL_CONFIG.port,
      user: MYSQL_CONFIG.user,
      database: MYSQL_CONFIG.database,
    },
    taxonomiesTerms,
    posts: postsDump,
    postMeta,
    termTaxonomies,
    termRelationships,
    media,
    redirects,
  };

  dumpSchema.parse(dump);

  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, JSON.stringify(dump, null, 2), "utf-8");

  console.log(
    `[MIR ETL] Dump written to: ${output}\n` +
      `  taxonomiesTerms=${taxonomiesTerms.length}\n` +
      `  posts=${postsDump.length}\n` +
      `  postMeta=${postMeta.length}\n` +
      `  termRelationships=${termRelationships.length}\n` +
      `  termTaxonomies=${termTaxonomies.length}\n` +
      `  media=${media.length}\n` +
      `  redirects=${redirects.length}`,
  );

  await conn.end();
}

main().catch((e) => {
  console.error("[MIR ETL] Dump failed:", e);
  process.exit(1);
});


import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { adminMiddleware } from "@/lib/audit";
import { ok } from "@/lib/api/response";

const seo = new Hono()

  .get("/settings", async (c) => {
    const settings = await prisma.seoSetting.findMany({
      orderBy: { key: "asc" },
    });

    const settingsMap: Record<string, string> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return ok(c, settingsMap);
  })

  .put("/settings", adminMiddleware, zValidator("json", z.object({
    settings: z.record(z.string(), z.string()),
  })), async (c) => {
    const { settings } = c.req.valid("json");

    const promises = Object.entries(settings).map(([key, value]) =>
      prisma.seoSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );

    await Promise.all(promises);

    return ok(c, settings);
  })

  .get("/sitemap.xml", async (c) => {
    const [posts, pages, news] = await Promise.all([
      prisma.post.findMany({
        where: { type: "POST", status: "PUBLISHED" },
        select: { slug: true, modifiedAt: true },
        orderBy: { modifiedAt: "desc" },
      }),
      prisma.post.findMany({
        where: { type: "PAGE", status: "PUBLISHED" },
        select: { slug: true, modifiedAt: true },
        orderBy: { modifiedAt: "desc" },
      }),
      prisma.post.findMany({
        where: { type: "NEWS", status: "PUBLISHED" },
        select: { slug: true, modifiedAt: true },
        orderBy: { modifiedAt: "desc" },
      }),
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const addUrl = (loc: string, lastmod: Date, changefreq = "weekly", priority = "0.7") => {
      xml += `  <url>\n`;
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <lastmod>${lastmod.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += `  </url>\n`;
    };

    addUrl(baseUrl, new Date(), "daily", "1.0");

    for (const post of posts) {
      addUrl(`${baseUrl}/posts/${post.slug}`, post.modifiedAt, "weekly", "0.8");
    }
    for (const page of pages) {
      addUrl(`${baseUrl}/pages/${page.slug}`, page.modifiedAt, "monthly", "0.6");
    }
    for (const item of news) {
      addUrl(`${baseUrl}/news/${item.slug}`, item.modifiedAt, "weekly", "0.8");
    }

    xml += `</urlset>`;

    return c.text(xml, 200, { "Content-Type": "application/xml" });
  })

  .get("/robots.txt", async (c) => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let robots = `User-agent: *\n`;
    robots += `Allow: /\n\n`;
    robots += `Disallow: /api/\n`;
    robots += `Disallow: /admin/\n`;
    robots += `Disallow: /login/\n`;
    robots += `Disallow: /signup/\n`;
    robots += `Disallow: /forgot-password/\n`;
    robots += `Disallow: /reset-password/\n`;
    robots += `Disallow: /verify-email/\n\n`;
    robots += `Sitemap: ${baseUrl}/sitemap.xml\n`;

    return c.text(robots, 200, { "Content-Type": "text/plain" });
  })

  .get("/rss", async (c) => {
    const posts = await prisma.post.findMany({
      where: { type: "POST", status: "PUBLISHED" },
      select: { title: true, slug: true, excerpt: true, contentHtml: true, publishedAt: true, author: { select: { name: true } } },
      orderBy: { publishedAt: "desc" },
      take: 20,
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    rss += `<rss version="2.0">\n`;
    rss += `  <channel>\n`;
    rss += `    <title>Zolai AI</title>\n`;
    rss += `    <link>${baseUrl}</link>\n`;
    rss += `    <description>Zolai AI — preserving and teaching the Tedim Zolai language through AI</description>\n`;
    rss += `    <language>en</language>\n`;

    for (const post of posts) {
      rss += `    <item>\n`;
      rss += `      <title>${escapeXml(post.title)}</title>\n`;
      rss += `      <link>${baseUrl}/posts/${post.slug}</link>\n`;
      rss += `      <description>${escapeXml(post.excerpt || "")}</description>\n`;
      rss += `      <author>${post.author.name}</author>\n`;
      if (post.publishedAt) {
        rss += `      <pubDate>${post.publishedAt.toUTCString()}</pubDate>\n`;
      }
      rss += `      <guid>${baseUrl}/posts/${post.slug}</guid>\n`;
      rss += `    </item>\n`;
    }

    rss += `  </channel>\n`;
    rss += `</rss>`;

    return c.text(rss, 200, { "Content-Type": "application/rss+xml" });
  })

  .get("/news-rss", async (c) => {
    const news = await prisma.post.findMany({
      where: { type: "NEWS", status: "PUBLISHED" },
      select: { title: true, slug: true, excerpt: true, publishedAt: true, author: { select: { name: true } } },
      orderBy: { publishedAt: "desc" },
      take: 20,
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    rss += `<rss version="2.0">\n`;
    rss += `  <channel>\n`;
    rss += `    <title>Zolai AI News</title>\n`;
    rss += `    <link>${baseUrl}/news</link>\n`;
    rss += `    <description>Zolai AI — Latest News</description>\n`;
    rss += `    <language>en</language>\n`;

    for (const item of news) {
      rss += `    <item>\n`;
      rss += `      <title>${escapeXml(item.title)}</title>\n`;
      rss += `      <link>${baseUrl}/news/${item.slug}</link>\n`;
      rss += `      <description>${escapeXml(item.excerpt || "")}</description>\n`;
      rss += `      <author>${item.author.name}</author>\n`;
      if (item.publishedAt) {
        rss += `      <pubDate>${item.publishedAt.toUTCString()}</pubDate>\n`;
      }
      rss += `      <guid>${baseUrl}/news/${item.slug}</guid>\n`;
      rss += `    </item>\n`;
    }

    rss += `  </channel>\n`;
    rss += `</rss>`;

    return c.text(rss, 200, { "Content-Type": "application/rss+xml" });
  });

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default seo;

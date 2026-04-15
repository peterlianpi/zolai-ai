import { MetadataRoute } from "next";
import { site } from "@/lib/site";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const LOCALES = ["en", "my"] as const;

let cachedSitemap: { data: MetadataRoute.Sitemap; timestamp: number } | null = null;
const SITEMAP_CACHE_TTL = 3600 * 1000; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = Date.now();
  if (cachedSitemap && now - cachedSitemap.timestamp < SITEMAP_CACHE_TTL) {
    return cachedSitemap.data;
  }

  const baseUrl = site.url.replace(/\/$/, "");

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/news", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/posts", priority: 0.8, changeFrequency: "daily" as const },
  ];

  const staticSitemap: MetadataRoute.Sitemap = staticPages.flatMap(({ path, priority, changeFrequency }) =>
    LOCALES.map((locale) => {
      const localePath = locale === "en" ? path : `/${locale}${path || ""}`;
      const alternates: { languages: Record<string, string> } = {
        languages: {
          en: `${baseUrl}${path || ""}`,
          my: `${baseUrl}/my${path || ""}`,
        },
      };
      return {
        url: `${baseUrl}${localePath}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates,
      };
    })
  );

  const publishedContent = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      type: true,
      slug: true,
      locale: true,
      modifiedAt: true,
      translationGroup: true,
    },
  });

  const contentSitemap: MetadataRoute.Sitemap = publishedContent.flatMap((post: { id: string; type: string; slug: string; locale: string; modifiedAt: Date; translationGroup: string | null }) => {
    const basePath =
      post.type === "NEWS"
        ? "/news"
        : post.type === "PAGE"
          ? "/pages"
          : "/posts";

    const alternates: { languages: Record<string, string> } = {
      languages: {},
    };

    if (post.translationGroup) {
      const siblings = publishedContent.filter(
        (p: { id: string; type: string; slug: string; locale: string; modifiedAt: Date; translationGroup: string | null }) => p.translationGroup === post.translationGroup
      );
      for (const sibling of siblings) {
        const siblingPrefix = sibling.locale === "my" ? "/my" : "";
        alternates.languages[sibling.locale] = `${baseUrl}${siblingPrefix}${basePath}/${sibling.slug}`;
      }
    } else {
      alternates.languages.en = `${baseUrl}${basePath}/${post.slug}`;
      alternates.languages.my = `${baseUrl}/my${basePath}/${post.slug}`;
    }

    const localePrefix = post.locale === "my" ? "/my" : "";

    return {
      url: `${baseUrl}${localePrefix}${basePath}/${post.slug}`,
      lastModified: post.modifiedAt,
      changeFrequency: post.type === "NEWS" ? "daily" : "weekly",
      priority: post.type === "NEWS" ? 0.9 : 0.7,
      alternates,
    };
  });

  const result = [...staticSitemap, ...contentSitemap];
  cachedSitemap = { data: result, timestamp: now };
  return result;
}

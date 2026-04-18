export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import prisma from "@/lib/prisma";
import { sanitizeContentHtml } from "@/lib/sanitize";
import { PageTitle, RelatedPosts, PageTemplateClass, ContentClass, SidebarClass, resolveTemplateKey } from "@/features/home/components";
import { publicPostPath } from "@/lib/content-paths";
import { localeFromSearchParams, localePrefix, type LocaleCode } from "@/lib/i18n/locales";
import { safeDbQuery } from "@/lib/server/safe-db";
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  JsonLdScript,
} from "@/lib/seo";
import { CommentsSection } from "@/features/comments";

function getTagSlugsForType(type: "POST" | "NEWS"): string[] {
  return type === "POST" ? ["post_tag", "tag"] : ["news_tag", "tag"];
}

interface NewsArticlePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getNewsBySlug(slug: string, locale: LocaleCode) {
  return safeDbQuery({
    key: "public-news-by-slug",
    query: () =>
      prisma.post.findFirst({
        where: {
          type: "NEWS",
          slug,
          status: "PUBLISHED",
          locale,
        },
        include: {
          author: { select: { name: true, image: true } },
          featuredMedia: true,
          pageTemplate: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
          terms: {
            include: {
              term: {
                include: {
                  taxonomy: true,
                },
              },
            },
          },
        },
      }),
    fallback: null,
    timeoutMs: 4500,
    failureThreshold: 3,
    openMs: 10000,
    logLabel: "PublicNews",
  });
}

async function getRelatedPosts(currentId: string, categoryIds: string[], locale: LocaleCode) {
  if (categoryIds.length === 0) {
    return safeDbQuery({
      key: "public-news-related-fallback",
      query: () =>
        prisma.post.findMany({
          where: {
            type: "NEWS",
            status: "PUBLISHED",
            locale,
            id: { not: currentId },
          },
          take: 3,
          orderBy: { publishedAt: "desc" },
          include: { featuredMedia: true },
        }),
      fallback: [],
      timeoutMs: 3500,
      failureThreshold: 3,
      openMs: 10000,
      logLabel: "PublicNews",
    });
  }

  return safeDbQuery({
    key: "public-news-related",
    query: () =>
      prisma.post.findMany({
        where: {
          type: "NEWS",
          status: "PUBLISHED",
          locale,
          id: { not: currentId },
          terms: {
            some: {
              termId: { in: categoryIds },
            },
          },
        },
        take: 3,
        orderBy: { publishedAt: "desc" },
        include: { featuredMedia: true },
      }),
    fallback: [],
    timeoutMs: 3500,
    failureThreshold: 3,
    openMs: 10000,
    logLabel: "PublicNews",
  });
}

export async function generateMetadata({
  params,
  searchParams,
}: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const locale = localeFromSearchParams(sp);
  const post = await getNewsBySlug(slug, locale);
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);

  if (!post) {
    return {
      title: "News Not Found",
    };
  }

  const canonicalUrl = post.canonicalUrl || `${siteConfig.url}${localePrefix(post.locale as LocaleCode)}/news/${post.slug}`;

  const tagSlugs = getTagSlugsForType("NEWS");

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    keywords: post.terms
      .filter((t) => tagSlugs.includes(t.term.taxonomy.slug))
      .map((t) => t.term.name),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${siteConfig.url}/news/${post.slug}`,
        my: `${siteConfig.url}/my/news/${post.slug}`,
      },
    },
    openGraph: {
      ...base.openGraph,
      type: "article",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || siteConfig.description,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.modifiedAt?.toISOString(),
      authors: post.author?.name ? [post.author.name] : undefined,
      tags: post.terms
        .filter((t) => tagSlugs.includes(t.term.taxonomy.slug))
        .map((t) => t.term.name),
      images: post.featuredMedia
        ? [{ url: post.featuredMedia.url, alt: post.featuredMedia.altText || post.title, width: 800, height: 450 }]
        : base.openGraph?.images,
    },
    twitter: {
      ...base.twitter,
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || siteConfig.description,
    },
  };
}

export default async function NewsArticlePage({ params, searchParams }: NewsArticlePageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const locale = localeFromSearchParams(sp);
  const post = await getNewsBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const template = resolveTemplateKey(post.pageTemplate?.slug ?? post.template);
  const contentClass = ContentClass(template);
  const sidebarClass = SidebarClass(template);
  const showSidebar = template === "default" || template === "sidebar";

  const categoryIds = post.terms
    .filter((t) => t.term.taxonomy.slug === "category")
    .map((t) => t.termId);

  const relatedPosts = await getRelatedPosts(post.id, categoryIds, locale);

  const categories = post.terms
    .filter((t) => t.term.taxonomy.slug === "category")
    .map((t) => t.term);

  const siteConfig = await getSiteConfig();
  const canonicalUrl = post.canonicalUrl || `${siteConfig.url}${localePrefix(post.locale as LocaleCode)}/news/${post.slug}`;
  const articleJsonLd = generateArticleJsonLd({
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || "",
    image: post.featuredMedia?.url || `${siteConfig.url}/og.png`,
    datePublished: post.publishedAt?.toISOString() || new Date().toISOString(),
    dateModified: post.modifiedAt?.toISOString() || new Date().toISOString(),
    authorName: post.author?.name || siteConfig.name,
    url: canonicalUrl,
    type: "NewsArticle",
    section: categories[0]?.name,
    keywords: post.terms
      .filter((t) => t.term.taxonomy.slug === "tag")
      .map((t) => t.term.name)
      .join(", "),
    inLanguage: post.locale === "my" ? "my" : "en",
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: siteConfig.url },
    { name: "News", url: `${siteConfig.url}/news` },
    { name: post.title, url: canonicalUrl },
  ]);

  const wordCount = post.contentHtml.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  const tagSlugs = getTagSlugsForType("NEWS");

  const pageContent = (
    <>
      <Link
        href="/news"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to News
      </Link>

      <h1 className="article-title text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{post.title}</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
        {post.author && (
          <div className="flex items-center gap-2">
            {post.author.image && (
              <Image
                src={post.author.image}
                alt={post.author.name || "Author"}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
            )}
            <span className="font-medium text-foreground">{post.author.name}</span>
          </div>
        )}
        {post.publishedAt && (
          <time dateTime={post.publishedAt.toISOString()}>
            {format(post.publishedAt, "MMMM d, yyyy")}
          </time>
        )}
        <span>/</span>
        <span>News</span>
        <span>/</span>
        <span>{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/news?category=${cat.slug}`}
              className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary/20"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {post.featuredMedia && template !== "blank" && (
        <div className="mb-8">
          <Image
            src={post.featuredMedia.url}
            alt={post.featuredMedia.altText || post.title}
            width={800}
            height={450}
            className="w-full rounded-lg"
            priority
          />
        </div>
      )}

      <div
        className="article-content prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(post.contentHtml) }}
      />

      {post.terms.filter((t) => tagSlugs.includes(t.term.taxonomy.slug)).length > 0 && (
        <div className="mt-8 pt-8 border-t">
          <h4 className="text-sm font-medium mb-3">Tags:</h4>
          <div className="flex flex-wrap gap-2">
            {post.terms
              .filter((t) => tagSlugs.includes(t.term.taxonomy.slug))
              .map((t) => (
                <Link
                  key={t.term.id}
                  href={`/news?tag=${t.term.slug}`}
                  className="text-xs px-3 py-1 bg-muted rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {t.term.name}
                </Link>
              ))}
          </div>
        </div>
      )}

      <RelatedPosts posts={relatedPosts} title="Related News" />

      <div className="mt-8 pt-6 border-t">
        <h4 className="text-sm font-medium mb-3">Share this article</h4>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            Facebook
          </Link>
          <Link
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(post.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100"
          >
            X
          </Link>
          <Link
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          >
            LinkedIn
          </Link>
        </div>
      </div>

      <CommentsSection postId={post.id} commentsEnabled={siteConfig.commentsEnabled} />
    </>
  );

  const sidebarContent = (
    <>
      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Categories</h3>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/news?category=${cat.slug}`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <RecentNews type="NEWS" locale={post.locale} />
    </>
  );

  if (template === "blank" || template === "full-width" || template === "centered") {
    return (
      <>
        <JsonLdScript data={articleJsonLd} />
        <JsonLdScript data={breadcrumbJsonLd} />
        <PageTitle title={post.title} />
        <article className="container mx-auto px-4 py-8">
          <div className={PageTemplateClass(template)}>
            <div className={contentClass}>
              {pageContent}
            </div>
          </div>
        </article>
      </>
    );
  }

  return (
    <>
      <JsonLdScript data={articleJsonLd} />
      <JsonLdScript data={breadcrumbJsonLd} />
      <PageTitle title={post.title} />

      <article className="container mx-auto px-4 py-8">
        <div className={PageTemplateClass(template)}>
          <div className={contentClass}>
            {pageContent}
          </div>
          {showSidebar && (
            <aside className={sidebarClass}>
              {sidebarContent}
            </aside>
          )}
        </div>
      </article>
    </>
  );
}

async function RecentNews({ type, locale }: { type: "NEWS" | "POST"; locale: string }) {
  const posts = await prisma.post.findMany({
    where: {
      type,
      status: "PUBLISHED",
      locale,
    },
    take: 5,
    orderBy: { publishedAt: "desc" },
    include: { featuredMedia: true },
  });

  if (posts.length === 0) return null;

  return (
    <div className="bg-muted/30 rounded-lg p-6">
      <h3 className="font-semibold mb-4">Recent News</h3>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={publicPostPath(type, post.slug, post.locale)}
            className="flex gap-3 group"
          >
            <div className="relative w-16 h-12 rounded overflow-hidden shrink-0">
              <Image
                src={post.featuredMedia?.url || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                unoptimized={Boolean(post.featuredMedia?.url?.startsWith("http"))}
              />
            </div>
            <div>
              <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                {post.title}
              </h4>
              {post.publishedAt && (
                <span className="text-xs text-muted-foreground">
                  {format(post.publishedAt, "MMM d, yyyy")}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

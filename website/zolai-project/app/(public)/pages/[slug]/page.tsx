export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import prisma from "@/lib/prisma";
import { sanitizeContentHtml } from "@/lib/sanitize";
import { PageTitle, PageTemplateClass, ContentClass, SidebarClass, resolveTemplateKey } from "@/features/home/components";
import { publicPostPath } from "@/lib/content-paths";
import { localeFromSearchParams, localePrefix, type LocaleCode } from "@/lib/i18n/locales";
import { safeDbQuery } from "@/lib/server/safe-db";
import {
  generateWebPageJsonLd,
  generateBreadcrumbJsonLd,
  JsonLdScript,
} from "@/lib/seo";

interface PageDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getPageBySlug(slug: string, locale: LocaleCode) {
  return safeDbQuery({
    key: "public-page-by-slug",
    query: () =>
      prisma.post.findFirst({
        where: {
          type: "PAGE",
          slug,
          status: "PUBLISHED",
          locale,
        },
        include: {
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
    logLabel: "PublicPage",
  });
}

async function getRecentPages(locale: LocaleCode) {
  return safeDbQuery({
    key: "public-recent-pages",
    query: () =>
      prisma.post.findMany({
        where: {
          type: "PAGE",
          status: "PUBLISHED",
          locale,
        },
        take: 5,
        orderBy: { menuOrder: "asc" },
      }),
    fallback: [],
    timeoutMs: 3500,
    failureThreshold: 3,
    openMs: 10000,
    logLabel: "PublicPage",
  });
}

export async function generateMetadata({
  params,
  searchParams,
}: PageDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const locale = localeFromSearchParams(sp);
  const page = await getPageBySlug(slug, locale);
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  const canonicalUrl = page.canonicalUrl || `${siteConfig.url}${localePrefix(page.locale as LocaleCode)}/pages/${page.slug}`;

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.excerpt || undefined,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${siteConfig.url}/pages/${page.slug}`,
        my: `${siteConfig.url}/my/pages/${page.slug}`,
      },
    },
    openGraph: {
      ...base.openGraph,
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.excerpt || siteConfig.description,
      images: page.featuredMedia
        ? [{ url: page.featuredMedia.url, alt: page.featuredMedia.altText || page.title, width: 800, height: 450 }]
        : base.openGraph?.images,
    },
    twitter: {
      ...base.twitter,
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.excerpt || siteConfig.description,
    },
  };
}

export default async function PageDetailPage({ params, searchParams }: PageDetailPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const locale = localeFromSearchParams(sp);
  const page = await getPageBySlug(slug, locale);
  const recentPages = await getRecentPages(locale);

  if (!page) {
    notFound();
  }

  const template = resolveTemplateKey(page.pageTemplate?.slug ?? page.template);
  const contentClass = ContentClass(template);
  const sidebarClass = SidebarClass(template);
  const showSidebar = template === "default" || template === "sidebar";
  const showBackButton = template !== "blank";

  const siteConfig = await getSiteConfig();
  const canonicalUrl = page.canonicalUrl || `${siteConfig.url}${localePrefix(page.locale as LocaleCode)}/pages/${page.slug}`;
  const pageJsonLd = generateWebPageJsonLd({
    name: page.seoTitle || page.title,
    description: page.seoDescription || page.excerpt || "",
    url: canonicalUrl,
    datePublished: page.publishedAt?.toISOString(),
    dateModified: page.modifiedAt?.toISOString(),
    inLanguage: page.locale === "my" ? "my" : "en",
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: siteConfig.url },
    { name: "Pages", url: `${siteConfig.url}/pages` },
    { name: page.title, url: canonicalUrl },
  ]);

  const wordCount = page.contentHtml.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;

  const sidebarContent = (
    <div className="bg-muted/30 rounded-lg p-6">
      <h3 className="font-semibold mb-4">Pages</h3>
      <ul className="space-y-2">
        {recentPages.map((p) => (
          <li key={p.id}>
            <Link
              href={publicPostPath("PAGE", p.slug, p.locale)}
              className={`text-sm hover:text-primary transition-colors ${
                p.slug === slug ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  const pageContent = (
    <>
      {showBackButton && (
        <Link
          href="/pages"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Pages
        </Link>
      )}

      <h1 className="article-title text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{page.title}</h1>

      {page.publishedAt && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <time dateTime={page.publishedAt.toISOString()}>
            {format(page.publishedAt, "MMMM d, yyyy")}
          </time>
          <span>/</span>
          <span>{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
        </div>
      )}

      {page.featuredMedia && template !== "blank" && (
        <div className="mb-8">
          <Image
            src={page.featuredMedia.url}
            alt={page.featuredMedia.altText || page.title}
            width={800}
            height={450}
            className="w-full rounded-lg"
            priority
          />
        </div>
      )}

      <div
        className="article-content prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(page.contentHtml) }}
      />
    </>
  );

  if (template === "blank") {
    return (
      <>
        <JsonLdScript data={pageJsonLd} />
        <JsonLdScript data={breadcrumbJsonLd} />
        <PageTitle title={page.title} />
        <article className="container mx-auto px-4 py-8">
          {pageContent}
        </article>
      </>
    );
  }

  return (
    <>
      <JsonLdScript data={pageJsonLd} />
      <JsonLdScript data={breadcrumbJsonLd} />
      <PageTitle title={page.title} />

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

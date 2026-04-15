import { site } from "@/lib/site";

export type JsonLdType =
  | "WebSite"
  | "WebPage"
  | "Article"
  | "NewsArticle"
  | "BlogPosting"
  | "Organization"
  | "BreadcrumbList"
  | "FAQPage"
  | "SiteLinksSearchBox"
  | "SpeakableSpecification";

export interface BaseJsonLd {
  "@context": "https://schema.org";
  "@type": JsonLdType;
}

export interface ArticleJsonLd extends BaseJsonLd {
  "@type": "Article" | "NewsArticle" | "BlogPosting";
  headline: string;
  description: string;
  image: string | string[];
  datePublished: string;
  dateModified: string;
  author: {
    "@type": "Person" | "Organization";
    name: string;
    url?: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    logo?: {
      "@type": "ImageObject";
      url: string;
    };
  };
  mainEntityOfPage: string;
  wordCount?: number;
  articleSection?: string;
  keywords?: string;
  inLanguage?: string;
}

export interface WebPageJsonLd extends BaseJsonLd {
  "@type": "WebPage";
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  inLanguage?: string;
}

export interface OrganizationJsonLd extends BaseJsonLd {
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  description?: string;
  contactPoint?: {
    "@type": "ContactPoint";
    contactType: string;
    email?: string;
    url?: string;
  }[];
}

export interface BreadcrumbListJsonLd extends BaseJsonLd {
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
}

export interface FAQPageJsonLd extends BaseJsonLd {
  "@type": "FAQPage";
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }[];
}

export interface SiteLinksSearchBoxJsonLd extends BaseJsonLd {
  "@type": "WebSite";
  name: string;
  url: string;
  potentialAction: {
    "@type": "SearchAction";
    target: string;
    "query-input": "required name=search_term_string";
  }[];
}

export interface SpeakableJsonLd extends BaseJsonLd {
  "@type": "SpeakableSpecification";
  cssSelector: string[];
}

export function generateArticleJsonLd(params: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  authorUrl?: string;
  url: string;
  type?: "Article" | "NewsArticle" | "BlogPosting";
  wordCount?: number;
  section?: string;
  keywords?: string;
  inLanguage?: string;
}): ArticleJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": params.type || "Article",
    headline: params.headline,
    description: params.description,
    image: params.image,
    datePublished: params.datePublished,
    dateModified: params.dateModified,
    author: {
      "@type": "Person",
      name: params.authorName,
      url: params.authorUrl,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
    },
    mainEntityOfPage: params.url,
    wordCount: params.wordCount,
    articleSection: params.section,
    keywords: params.keywords,
    inLanguage: params.inLanguage || "en",
  };
}

export function generateWebPageJsonLd(params: {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  inLanguage?: string;
}): WebPageJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: params.name,
    description: params.description,
    url: params.url,
    datePublished: params.datePublished,
    dateModified: params.dateModified,
    inLanguage: params.inLanguage || "en",
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
): BreadcrumbListJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQJsonLd(
  questions: { question: string; answer: string }[]
): FAQPageJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

export function generateOrganizationJsonLd(params: {
  sameAs?: string[];
  contactEmail?: string;
  contactUrl?: string;
  logo?: string;
}): OrganizationJsonLd {
  const contactPoint = [];
  if (params.contactEmail || params.contactUrl) {
    contactPoint.push({
      "@type": "ContactPoint" as const,
      contactType: "customer service",
      ...(params.contactEmail ? { email: params.contactEmail } : {}),
      ...(params.contactUrl ? { url: params.contactUrl } : {}),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    ...(params.logo ? { logo: params.logo } : {}),
    description: site.description,
    sameAs: params.sameAs || [],
    ...(contactPoint.length > 0 ? { contactPoint } : {}),
  };
}

export function generateSiteLinksSearchBoxJsonLd(): SiteLinksSearchBoxJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    potentialAction: [
      {
        "@type": "SearchAction",
        target: `${site.url}/posts?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    ],
  };
}

export function generateSpeakableJsonLd(): SpeakableJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SpeakableSpecification",
    cssSelector: [".article-title", ".article-content", ".article-excerpt"],
  };
}

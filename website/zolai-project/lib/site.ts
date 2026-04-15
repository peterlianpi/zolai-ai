import type { Metadata } from "next";
import { LOCALES, DEFAULT_LOCALE, type LocaleCode } from "./i18n-server";
import {
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_URL,
  DEFAULT_SITE_SHORT_NAME,
  DEFAULT_SITE_CREATOR,
  DEFAULT_SITE_PUBLISHER,
  DEFAULT_TWITTER_HANDLE,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_FAVICON,
  DEFAULT_APPLE_ICON,
  DEFAULT_SEO_KEYWORDS,
  DEFAULT_GEO_REGION,
  DEFAULT_GEO_PLACENAME,
  DEFAULT_GEO_POSITION,
} from "./constants/site";

const locales = Object.values(LOCALES).map((locale) => ({
  code: locale.code as LocaleCode,
  name: locale.name,
  direction: locale.direction,
}));

/**
 * Default static site configuration
 * 
 * IMPORTANT: For dynamic site settings that can be changed at runtime,
 * use getSiteConfig() from lib/site-config.ts instead.
 * 
 * This export contains hardcoded defaults used as fallbacks when:
 * - Database is unavailable
 * - Running in build time (static generation)
 * - Environment variables are not set
 * 
 * All constants are imported from lib/constants/site.ts to ensure
 * a single source of truth across the application.
 */
export const site = {
  name: DEFAULT_SITE_NAME,
  shortName: DEFAULT_SITE_SHORT_NAME,
  description: DEFAULT_SITE_DESCRIPTION,
  url: DEFAULT_SITE_URL,
  lang: "en" as const,
  creator: DEFAULT_SITE_CREATOR,
  publisher: DEFAULT_SITE_PUBLISHER,
  ogImage: DEFAULT_OG_IMAGE,
  ogImageType: DEFAULT_OG_IMAGE_TYPE,
  ogImageWidth: DEFAULT_OG_IMAGE_WIDTH,
  ogImageHeight: DEFAULT_OG_IMAGE_HEIGHT,
  twitterHandle: DEFAULT_TWITTER_HANDLE,
  icon: DEFAULT_FAVICON,
  appleIcon: DEFAULT_APPLE_ICON,
  keywords: DEFAULT_SEO_KEYWORDS,
  locales,
  defaultLocale: DEFAULT_LOCALE,
} as const;

export type SiteConfig = typeof site;

export const siteUrl = site.url;

/**
 * Default metadata configuration
 * 
 * For dynamic metadata based on site settings, use buildMetadata() from site-config.ts
 */
export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.shortName,
  authors: [{ name: site.creator }],
  generator: "Next.js",
  keywords: [...site.keywords],
  creator: site.creator,
  publisher: site.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(site.url),
  alternates: {
    canonical: site.url,
    languages: {
      "en": "/en",
      "my": "/my",
    },
  },
  openGraph: {
    type: "website",
    locale: site.lang,
    url: site.url,
    title: site.name,
    description: site.description,
    siteName: site.name,
    images: [
      {
        url: site.ogImage,
        width: site.ogImageWidth,
        height: site.ogImageHeight,
        alt: site.name,
        type: site.ogImageType,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    creator: site.twitterHandle,
    images: [site.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: site.icon },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: site.appleIcon,
  },
  manifest: "/site.webmanifest",
  other: {
    "geo.region": DEFAULT_GEO_REGION,
    "geo.placename": DEFAULT_GEO_PLACENAME,
    "geo.position": DEFAULT_GEO_POSITION,
    "ICBM": DEFAULT_GEO_POSITION.replace(";", ", "),
  }
};

export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  description: site.description,
  url: site.url,
  publisher: {
    "@type": "Organization",
    name: site.publisher,
  },
};


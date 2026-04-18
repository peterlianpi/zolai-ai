/**
 * SINGLE SOURCE OF TRUTH for all site configuration constants
 * 
 * This file defines all hardcoded and environment-based defaults.
 * All other files should import from here to avoid duplication.
 * 
 * Priority order for values:
 * 1. Environment variables (NEXT_PUBLIC_* or custom env vars)
 * 2. Database (SiteSetting table) - loaded at runtime
 * 3. Values defined in this file (fallbacks)
 */

/**
 * Default site name used across the application
 * Fallback chain: ENV -> Database -> This constant
 */
export const DEFAULT_SITE_NAME =
  process.env.NEXT_PUBLIC_APP_NAME || "Zolai AI";

/**
 * Default site description
 */
export const DEFAULT_SITE_DESCRIPTION =
  "The Zolai AI Second Brain — preserving and teaching the Tedim Zolai language through AI, datasets, and interactive tools.";

/**
 * Site URL - used for links, canonical URLs, metadata
 * Fallback chain: ENV -> Database -> This constant
 */
export const DEFAULT_SITE_URL =
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Short name / acronym
 */
export const DEFAULT_SITE_SHORT_NAME = "Zolai";

/**
 * Creator/author organization name
 */
export const DEFAULT_SITE_CREATOR =
  process.env.NEXT_PUBLIC_SITE_CREATOR || DEFAULT_SITE_NAME;

/**
 * Publisher organization name
 */
export const DEFAULT_SITE_PUBLISHER = DEFAULT_SITE_NAME;

/**
 * Twitter handle for social sharing
 */
export const DEFAULT_TWITTER_HANDLE = "@zolai_ai";

/**
 * Timezone for the site
 */
export const DEFAULT_TIMEZONE = "Asia/Rangoon";

/**
 * OG Image settings
 */
export const DEFAULT_OG_IMAGE = "/og.png";
export const DEFAULT_OG_IMAGE_TYPE = "image/png";
export const DEFAULT_OG_IMAGE_WIDTH = parseInt(
  process.env.NEXT_PUBLIC_OG_IMAGE_WIDTH || "1200",
  10,
);
export const DEFAULT_OG_IMAGE_HEIGHT = parseInt(
  process.env.NEXT_PUBLIC_OG_IMAGE_HEIGHT || "630",
  10,
);

/**
 * Icon/favicon paths
 */
export const DEFAULT_FAVICON = "/favicon.ico";
export const DEFAULT_APPLE_ICON = "/apple-icon.png";

/**
 * SEO defaults
 */
export const DEFAULT_SEO_KEYWORDS = [
  "Zolai language",
  "Tedim Chin",
  "Tedim Zolai",
  "language preservation",
  "AI language model",
  "Zomi people",
  "Tedim Bible",
  "language learning",
  "low resource NLP",
  "Kuki-Chin language",
  "Myanmar language AI",
  "Zolai dictionary",
];

/**
 * Project statistics — update when milestones change
 */
export const PROJECT_STATS = {
  corpusTokens: "100M+",
  parallelPairs: "105,511",
  dictionaryEntries: "64,923",
  trainingRecords: "5,604,960",
  bibleVersions: 5,
  hymns: 510,
  lastUpdated: "2026-04-18",
};

export const DEFAULT_SEO_ROBOTS = "index,follow";

/**
 * Geographic information for structured data
 */
export const DEFAULT_GEO_REGION = "MM";
export const DEFAULT_GEO_PLACENAME = "Chin State, Myanmar";
export const DEFAULT_GEO_POSITION = "23.5;93.5";

/**
 * Contact emails
 */
export const DEFAULT_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || `hello@${new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").hostname}`;

export const DEFAULT_SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || `support@${new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").hostname}`;

export const DEFAULT_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || `admin@${new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").hostname}`;

/**
 * Team name used in email signatures
 */
export const DEFAULT_TEAM_NAME = `The ${DEFAULT_SITE_NAME} Team`;
export const DEFAULT_COMMENTS_ENABLED = true;
export const DEFAULT_UNDER_DEVELOPMENT = false;
export const DEFAULT_UNDER_DEVELOPMENT_MESSAGE =
  "We are improving the site. Some features may be unavailable.";

/**
 * Hero section settings
 */
export const DEFAULT_HERO_STYLE = "simple"; // simple, background, subtitle, fullscreen, minimal
export const DEFAULT_HERO_BACKGROUND = ""; // URL or color
export const DEFAULT_HERO_SHOW_BREADCRUMBS = "true";
export const DEFAULT_HERO_BACKGROUND_OVERLAY = "0.3"; // Opacity 0-1
export const DEFAULT_HERO_ALIGNMENT = "left"; // left, center, right

/**
 * Header settings
 */
export const DEFAULT_HEADER_STYLE = "default"; // default, minimal, centered
export const DEFAULT_HEADER_STICKY = "true";
export const DEFAULT_HEADER_TRANSPARENT_SCROLL = "true";
export const DEFAULT_HEADER_LOGO_SIZE = "medium"; // small, medium, large
export const DEFAULT_HEADER_SHOW_SEARCH = "true";

/**
 * Footer settings
 */
export const DEFAULT_FOOTER_STYLE = "standard"; // standard, minimal, compact
export const DEFAULT_FOOTER_SHOW_NEWSLETTER = "true";
export const DEFAULT_FOOTER_SHOW_SOCIAL = "true";
export const DEFAULT_FOOTER_COPYRIGHT_TEXT = `© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_APP_NAME || "Zolai AI"}`;
export const DEFAULT_FOOTER_COLUMNS = "3"; // 2-4 columns

/**
 * Constants object for easy importing
 * Usage: import { SITE_CONSTANTS } from '@/lib/constants/site'
 */
export const SITE_CONSTANTS = {
  name: DEFAULT_SITE_NAME,
  shortName: DEFAULT_SITE_SHORT_NAME,
  description: DEFAULT_SITE_DESCRIPTION,
  url: DEFAULT_SITE_URL,
  creator: DEFAULT_SITE_CREATOR,
  publisher: DEFAULT_SITE_PUBLISHER,
  twitterHandle: DEFAULT_TWITTER_HANDLE,
  timezone: DEFAULT_TIMEZONE,
  ogImage: DEFAULT_OG_IMAGE,
  ogImageType: DEFAULT_OG_IMAGE_TYPE,
  ogImageWidth: DEFAULT_OG_IMAGE_WIDTH,
  ogImageHeight: DEFAULT_OG_IMAGE_HEIGHT,
  favicon: DEFAULT_FAVICON,
  appleIcon: DEFAULT_APPLE_ICON,
  keywords: DEFAULT_SEO_KEYWORDS,
  seoRobots: DEFAULT_SEO_ROBOTS,
  geo: {
    region: DEFAULT_GEO_REGION,
    placename: DEFAULT_GEO_PLACENAME,
    position: DEFAULT_GEO_POSITION,
  },
  features: {
    commentsEnabled: DEFAULT_COMMENTS_ENABLED,
    underDevelopment: DEFAULT_UNDER_DEVELOPMENT,
    underDevelopmentMessage: DEFAULT_UNDER_DEVELOPMENT_MESSAGE,
  },
  hero: {
    defaultStyle: DEFAULT_HERO_STYLE,
    defaultBackground: DEFAULT_HERO_BACKGROUND,
    showBreadcrumbs: DEFAULT_HERO_SHOW_BREADCRUMBS,
    backgroundOverlay: DEFAULT_HERO_BACKGROUND_OVERLAY,
    alignment: DEFAULT_HERO_ALIGNMENT,
  },
  header: {
    style: DEFAULT_HEADER_STYLE,
    sticky: DEFAULT_HEADER_STICKY,
    transparentScroll: DEFAULT_HEADER_TRANSPARENT_SCROLL,
    logoSize: DEFAULT_HEADER_LOGO_SIZE,
    showSearch: DEFAULT_HEADER_SHOW_SEARCH,
  },
  footer: {
    style: DEFAULT_FOOTER_STYLE,
    showNewsletter: DEFAULT_FOOTER_SHOW_NEWSLETTER,
    showSocial: DEFAULT_FOOTER_SHOW_SOCIAL,
    copyrightText: DEFAULT_FOOTER_COPYRIGHT_TEXT,
    columns: DEFAULT_FOOTER_COLUMNS,
  },
} as const;

/**
 * Dynamic Site Configuration System
 * 
 * Loads site settings from database with multi-level fallbacks:
 * 1. Database (SiteSetting table)
 * 2. Environment variables (.env)
 * 3. Constants from lib/constants/site.ts (single source of truth)
 * 
 * Includes caching for performance and comprehensive type safety.
 */

import type { Metadata } from "next";
import { cache } from "react";
import prisma from "@/lib/prisma";
import { runWithCircuitBreaker } from "@/lib/server/circuit-breaker";
import { metadata as defaultMetadata } from "@/lib/site";
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
  DEFAULT_TIMEZONE,
  DEFAULT_GEO_REGION,
  DEFAULT_GEO_PLACENAME,
  DEFAULT_GEO_POSITION,
} from "@/lib/constants/site";

/**
 * Site configuration keys used in database
 */
export const SITE_CONFIG_KEYS = {
  // Core site info
  SITE_NAME: "site_name",
  SITE_SHORT_NAME: "site_short_name",
  SITE_DESCRIPTION: "site_description",
  SITE_URL: "site_url",
  SITE_CREATOR: "site_creator",
  SITE_PUBLISHER: "site_publisher",
  SITE_TIMEZONE: "site_timezone",

  // Social & Contact
  TWITTER_HANDLE: "twitter_handle",
  SOCIAL_FACEBOOK: "social_facebook",
  SOCIAL_YOUTUBE: "social_youtube",
  SOCIAL_INSTAGRAM: "social_instagram",
  SOCIAL_TIKTOK: "social_tiktok",

  // SEO
  SEO_DEFAULT_TITLE: "seo_default_title",
  SEO_DEFAULT_DESCRIPTION: "seo_default_description",
  SEO_KEYWORDS: "seo_keywords",
  SEO_ROBOTS: "seo_robots",
  CANONICAL_URL: "canonical_url",

  // OG Images
  OG_IMAGE: "og_image",
  OG_IMAGE_TYPE: "og_image_type",
  OG_IMAGE_WIDTH: "og_image_width",
  OG_IMAGE_HEIGHT: "og_image_height",

  // Icons
  FAVICON: "favicon",
  APPLE_ICON: "apple_icon",

  // Geo
  GEO_REGION: "geo_region",
  GEO_PLACENAME: "geo_placename",
  GEO_POSITION: "geo_position",

  // Features
  UNDER_DEVELOPMENT: "under_development",
  UNDER_DEVELOPMENT_MESSAGE: "under_development_message",
  COMMENTS_ENABLED: "comments_enabled",

  // Analytics
  ANALYTICS_GOOGLE_ID: "analytics_google_id",
  ANALYTICS_FACEBOOK_PIXEL: "analytics_facebook_pixel",
} as const;

let siteSettingsFallbackCache: Record<string, string> = {};
let siteSettingsFailureUntil = 0;
let siteSettingsLastErrorAt = 0;
const SITE_SETTINGS_FAILURE_BACKOFF_MS = 60_000;
const SITE_SETTINGS_ERROR_LOG_INTERVAL_MS = 10_000;

/**
 * Type-safe site configuration object
 */
export interface SiteConfigData {
  // Core
  name: string;
  shortName: string;
  description: string;
  url: string;
  creator: string;
  publisher: string;
  timezone: string;
  lang: string;

  // Social
  twitterHandle: string;
  social: {
    facebook: string;
    twitter: string;
    youtube: string;
    instagram: string;
    tiktok: string;
  };

  // SEO
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
    robots: string;
    canonicalUrl: string;
  };

  // OG
  ogImage: string;
  ogImageType: "image/png" | "image/jpeg" | "image/gif" | "image/webp";
  ogImageWidth: number;
  ogImageHeight: number;

  // Icons
  favicon: string;
  appleIcon: string;

  // Geo
  geo: {
    region: string;
    placename: string;
    position: string;
  };

  // Features
  underDevelopment: boolean;
  underDevelopmentMessage: string;
  commentsEnabled: boolean;

  // Analytics
  analytics: {
    googleId: string;
    facebookPixel: string;
  };
}

/**
 * Default site configuration values
 */
const DEFAULT_CONFIG: SiteConfigData = {
  name: DEFAULT_SITE_NAME,
  shortName: DEFAULT_SITE_SHORT_NAME,
  description: DEFAULT_SITE_DESCRIPTION,
  url: DEFAULT_SITE_URL,
  creator: DEFAULT_SITE_CREATOR,
  publisher: DEFAULT_SITE_PUBLISHER,
  timezone: DEFAULT_TIMEZONE,
  lang: "en",

  twitterHandle: DEFAULT_TWITTER_HANDLE,
  social: {
    facebook: "",
    twitter: DEFAULT_TWITTER_HANDLE,
    youtube: "",
    instagram: "",
    tiktok: "",
  },

  seo: {
    defaultTitle: DEFAULT_SITE_NAME,
    defaultDescription: DEFAULT_SITE_DESCRIPTION,
    keywords: DEFAULT_SEO_KEYWORDS,
    robots: "index,follow",
    canonicalUrl: "",
  },

  ogImage: DEFAULT_OG_IMAGE,
  ogImageType: DEFAULT_OG_IMAGE_TYPE as "image/png" | "image/jpeg" | "image/gif" | "image/webp",
  ogImageWidth: DEFAULT_OG_IMAGE_WIDTH,
  ogImageHeight: DEFAULT_OG_IMAGE_HEIGHT,

  favicon: DEFAULT_FAVICON,
  appleIcon: DEFAULT_APPLE_ICON,

  geo: {
    region: DEFAULT_GEO_REGION,
    placename: DEFAULT_GEO_PLACENAME,
    position: DEFAULT_GEO_POSITION,
  },

  underDevelopment: false,
  underDevelopmentMessage: "We are improving the site. Some features may be unavailable.",
  commentsEnabled: true,

  analytics: {
    googleId: "",
    facebookPixel: "",
  },
};

/**
 * Parse environment variable overrides
 * Format: NEXT_PUBLIC_SITE_CONFIG_<KEY>=value
 */
function getEnvOverrides(): Record<string, unknown> {
  const overrides: Record<string, unknown> = {};

  if (process.env.NEXT_PUBLIC_APP_NAME) {
    overrides.name = process.env.NEXT_PUBLIC_APP_NAME;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    overrides.url = process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Parse numeric OG dimensions
  if (process.env.NEXT_PUBLIC_OG_IMAGE_WIDTH) {
    overrides.ogImageWidth = parseInt(process.env.NEXT_PUBLIC_OG_IMAGE_WIDTH, 10);
  }

  if (process.env.NEXT_PUBLIC_OG_IMAGE_HEIGHT) {
    overrides.ogImageHeight = parseInt(process.env.NEXT_PUBLIC_OG_IMAGE_HEIGHT, 10);
  }

  return overrides;
}

/**
 * Get all site settings from database with caching
 * Uses React cache() for request-level memoization
 */
export const getSiteSettings = cache(async (): Promise<Record<string, string>> => {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return siteSettingsFallbackCache;
  }

  const now = Date.now();

  if (siteSettingsFailureUntil > now) {
    return siteSettingsFallbackCache;
  }

  try {
    const settings = await runWithCircuitBreaker(
      "site-settings",
      () => prisma.siteSetting.findMany(),
      {
        timeoutMs: 2500,
        failureThreshold: 2,
        openMs: 30000,
      },
    );
    const map: Record<string, string> = {};

    for (const setting of settings) {
      map[setting.key] = setting.value;
    }

    siteSettingsFallbackCache = map;
    siteSettingsFailureUntil = 0;

    return map;
  } catch (error) {
    siteSettingsFailureUntil = now + SITE_SETTINGS_FAILURE_BACKOFF_MS;

    if (now - siteSettingsLastErrorAt > SITE_SETTINGS_ERROR_LOG_INTERVAL_MS) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[Site Config] Falling back to cached/default settings: ${message}`);
      siteSettingsLastErrorAt = now;
    }

    return siteSettingsFallbackCache;
  }
});

/**
 * Get a single site setting value with comprehensive fallback chain
 * 
 * Priority: Database → Environment Variables → Hardcoded Defaults
 */
export async function getSiteSetting(
  key: string,
  defaultValue: string = "",
): Promise<string> {
  try {
    const settings = await getSiteSettings();
    return settings[key] || defaultValue;
  } catch (error) {
    console.error(`[Site Config] Error getting setting for key ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Build complete site configuration with all fallbacks
 */
export async function getSiteConfig(): Promise<SiteConfigData> {
  try {
    const dbSettings = await getSiteSettings();
    const envOverrides = getEnvOverrides();

    // Helper to parse string values safely
    const getStringValue = (
      key: string,
      fallback: string,
    ): string => {
      const dbValue = dbSettings[key];
      if (dbValue) return dbValue;

      const envValue = envOverrides[key];
      if (typeof envValue === "string") return envValue;

      return fallback;
    };

    const getBoolValue = (key: string, fallback: boolean): boolean => {
      const val = dbSettings[key];
      if (val === undefined) return fallback;
      return val.toLowerCase() === "true";
    };

    const getNumberValue = (key: string, fallback: number): number => {
      const val = dbSettings[key];
      if (!val) return fallback;
      const parsed = parseInt(val, 10);
      return Number.isNaN(parsed) ? fallback : parsed;
    };

    const getArrayValue = (key: string, fallback: string[]): string[] => {
      const val = dbSettings[key];
      if (!val) return fallback;
      try {
        return JSON.parse(val);
      } catch {
        return val.split(",").map((v) => v.trim());
      }
    };

    const config: SiteConfigData = {
      // Core info
      name: getStringValue(SITE_CONFIG_KEYS.SITE_NAME, DEFAULT_CONFIG.name),
      shortName: getStringValue(
        SITE_CONFIG_KEYS.SITE_SHORT_NAME,
        DEFAULT_CONFIG.shortName,
      ),
      description: getStringValue(
        SITE_CONFIG_KEYS.SITE_DESCRIPTION,
        DEFAULT_CONFIG.description,
      ),
      url: getStringValue(SITE_CONFIG_KEYS.SITE_URL, DEFAULT_CONFIG.url),
      creator: getStringValue(SITE_CONFIG_KEYS.SITE_CREATOR, DEFAULT_CONFIG.creator),
      publisher: getStringValue(
        SITE_CONFIG_KEYS.SITE_PUBLISHER,
        DEFAULT_CONFIG.publisher,
      ),
      timezone: getStringValue(SITE_CONFIG_KEYS.SITE_TIMEZONE, DEFAULT_CONFIG.timezone),
      lang: "en",

      // Social
      twitterHandle: getStringValue(
        SITE_CONFIG_KEYS.TWITTER_HANDLE,
        DEFAULT_CONFIG.twitterHandle,
      ),
      social: {
        facebook: getStringValue(SITE_CONFIG_KEYS.SOCIAL_FACEBOOK, ""),
        twitter: getStringValue(SITE_CONFIG_KEYS.TWITTER_HANDLE, DEFAULT_TWITTER_HANDLE),
        youtube: getStringValue(SITE_CONFIG_KEYS.SOCIAL_YOUTUBE, ""),
        instagram: getStringValue(SITE_CONFIG_KEYS.SOCIAL_INSTAGRAM, ""),
        tiktok: getStringValue(SITE_CONFIG_KEYS.SOCIAL_TIKTOK, ""),
      },

      // SEO
      seo: {
        defaultTitle: getStringValue(
          SITE_CONFIG_KEYS.SEO_DEFAULT_TITLE,
          DEFAULT_CONFIG.seo.defaultTitle,
        ),
        defaultDescription: getStringValue(
          SITE_CONFIG_KEYS.SEO_DEFAULT_DESCRIPTION,
          DEFAULT_CONFIG.seo.defaultDescription,
        ),
        keywords: getArrayValue(SITE_CONFIG_KEYS.SEO_KEYWORDS, DEFAULT_CONFIG.seo.keywords),
        robots: getStringValue(SITE_CONFIG_KEYS.SEO_ROBOTS, DEFAULT_CONFIG.seo.robots),
        canonicalUrl: getStringValue(SITE_CONFIG_KEYS.CANONICAL_URL, ""),
      },

      // OG
      ogImage: getStringValue(SITE_CONFIG_KEYS.OG_IMAGE, DEFAULT_CONFIG.ogImage),
      ogImageType: (getStringValue(
        SITE_CONFIG_KEYS.OG_IMAGE_TYPE,
        DEFAULT_CONFIG.ogImageType,
      ) as "image/png" | "image/jpeg" | "image/gif" | "image/webp"),
      ogImageWidth: getNumberValue(
        SITE_CONFIG_KEYS.OG_IMAGE_WIDTH,
        DEFAULT_CONFIG.ogImageWidth,
      ),
      ogImageHeight: getNumberValue(
        SITE_CONFIG_KEYS.OG_IMAGE_HEIGHT,
        DEFAULT_CONFIG.ogImageHeight,
      ),

      // Icons
      favicon: getStringValue(SITE_CONFIG_KEYS.FAVICON, DEFAULT_CONFIG.favicon),
      appleIcon: getStringValue(SITE_CONFIG_KEYS.APPLE_ICON, DEFAULT_CONFIG.appleIcon),

      // Geo
      geo: {
        region: getStringValue(SITE_CONFIG_KEYS.GEO_REGION, DEFAULT_CONFIG.geo.region),
        placename: getStringValue(
          SITE_CONFIG_KEYS.GEO_PLACENAME,
          DEFAULT_CONFIG.geo.placename,
        ),
        position: getStringValue(
          SITE_CONFIG_KEYS.GEO_POSITION,
          DEFAULT_CONFIG.geo.position,
        ),
      },

      // Features
      underDevelopment: getBoolValue(SITE_CONFIG_KEYS.UNDER_DEVELOPMENT, false),
      underDevelopmentMessage: getStringValue(
        SITE_CONFIG_KEYS.UNDER_DEVELOPMENT_MESSAGE,
        DEFAULT_CONFIG.underDevelopmentMessage,
      ),
      commentsEnabled: getBoolValue(SITE_CONFIG_KEYS.COMMENTS_ENABLED, true),

      // Analytics
      analytics: {
        googleId: getStringValue(SITE_CONFIG_KEYS.ANALYTICS_GOOGLE_ID, ""),
        facebookPixel: getStringValue(SITE_CONFIG_KEYS.ANALYTICS_FACEBOOK_PIXEL, ""),
      },
    };

    return config;
  } catch (error) {
    console.error("[Site Config] Error building configuration:", error);
    // Return config with env overrides applied to defaults
    return {
      ...DEFAULT_CONFIG,
      ...getEnvOverrides(),
    };
  }
}

/**
 * Build Next.js Metadata object from site config
 */
export function buildMetadata(config: SiteConfigData): Metadata {
  const metadataBase = new URL(config.url);

  return {
    ...defaultMetadata,
    title: {
      default: config.seo.defaultTitle || config.name,
      template: config.seo.defaultTitle
        ? `%s | ${config.seo.defaultTitle}`
        : `%s | ${config.name}`,
    },
    description: config.seo.defaultDescription || config.description,
    applicationName: config.shortName,
    authors: [{ name: config.creator }],
    creator: config.creator,
    publisher: config.publisher,
    keywords: [...config.seo.keywords],
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase,
    alternates: {
      ...defaultMetadata.alternates,
      canonical: config.seo.canonicalUrl || config.url,
    },
    robots: {
      index: config.seo.robots.includes("index"),
      follow: config.seo.robots.includes("follow"),
      googleBot: {
        index: config.seo.robots.includes("index"),
        follow: config.seo.robots.includes("follow"),
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      type: "website",
      locale: "en",
      url: config.url,
      title: config.name,
      description: config.description,
      siteName: config.name,
      images: [
        {
          url: config.ogImage,
          width: config.ogImageWidth,
          height: config.ogImageHeight,
          alt: config.name,
          type: config.ogImageType,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.name,
      description: config.description,
      creator: config.twitterHandle,
      images: [config.ogImage],
    },
    icons: {
      icon: [
        { url: config.favicon },
        { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: config.appleIcon,
    },
    manifest: "/site.webmanifest",
    other: {
      "geo.region": config.geo.region,
      "geo.placename": config.geo.placename,
      "geo.position": config.geo.position,
      ICBM: config.geo.position.replace(";", ", "),
    },
  };
}

/**
 * Build JSON-LD structured data from site config
 */
export function buildJsonLd(config: SiteConfigData) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.name,
    description: config.description,
    url: config.url,
    publisher: {
      "@type": "Organization",
      name: config.publisher,
    },
  };
}

/**
 * Backwards compatibility aliases
 */
export const buildSiteMetadata = buildMetadata;
export const buildSiteJsonLd = buildJsonLd;

/**
 * Update a site setting in the database
 * 
 * @param key - Setting key
 * @param value - Setting value
 * @returns Updated setting or null if failed
 */
export async function updateSiteSetting(key: string, value: string) {
  try {
    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return setting;
  } catch (error) {
    console.error(`[Site Config] Failed to update setting ${key}:`, error);
    return null;
  }
}

/**
 * Get the default configuration
 */
export function getDefaultConfig(): SiteConfigData {
  return { ...DEFAULT_CONFIG };
}

/**
 * Get default site name from multiple sources
 * Used by auth system when site config is not yet loaded
 */
export function getDefaultSiteName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME || DEFAULT_CONFIG.name;
}

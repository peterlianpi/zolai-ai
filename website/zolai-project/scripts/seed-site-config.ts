#!/usr/bin/env node

/**
 * Seed Site Configuration Script
 * 
 * This script populates the SiteSetting table with all default configuration values
 * from lib/constants/site.ts. It can be run independently or as part of the main seed.
 * 
 * Usage:
 *   bun run scripts/seed-site-config.ts
 *   npm run seed:config
 *   yarn seed:config
 * 
 * This ensures all dynamic site configuration is synchronized with the source code.
 */

import prisma from "../lib/prisma";
import {
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_URL,
  DEFAULT_SITE_SHORT_NAME,
  DEFAULT_SITE_CREATOR,
  DEFAULT_SITE_PUBLISHER,
  DEFAULT_TWITTER_HANDLE,
  DEFAULT_TIMEZONE,
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
  DEFAULT_COMMENTS_ENABLED,
  DEFAULT_UNDER_DEVELOPMENT,
  DEFAULT_UNDER_DEVELOPMENT_MESSAGE,
} from "../lib/constants/site";

interface SiteSettingRecord {
  key: string;
  value: string;
}

/**
 * Generate all default site configuration records
 */
function generateDefaultSiteSettings(): SiteSettingRecord[] {
  return [
    // Core site information
    { key: "site_name", value: DEFAULT_SITE_NAME },
    { key: "site_short_name", value: DEFAULT_SITE_SHORT_NAME },
    { key: "site_description", value: DEFAULT_SITE_DESCRIPTION },
    { key: "site_url", value: DEFAULT_SITE_URL },
    { key: "site_creator", value: DEFAULT_SITE_CREATOR },
    { key: "site_publisher", value: DEFAULT_SITE_PUBLISHER },
    { key: "site_timezone", value: DEFAULT_TIMEZONE },

    // Social & Contact
    { key: "twitter_handle", value: DEFAULT_TWITTER_HANDLE },
    { key: "social_facebook", value: "" },
    { key: "social_youtube", value: "" },
    { key: "social_instagram", value: "" },
    { key: "social_tiktok", value: "" },

    // SEO
    { key: "seo_default_title", value: DEFAULT_SITE_NAME },
    { key: "seo_default_description", value: DEFAULT_SITE_DESCRIPTION },
    { key: "seo_keywords", value: JSON.stringify(DEFAULT_SEO_KEYWORDS) },
    { key: "seo_robots", value: "index,follow" },
    { key: "canonical_url", value: "" },

    // OG Images
    { key: "og_image", value: DEFAULT_OG_IMAGE },
    { key: "og_image_type", value: DEFAULT_OG_IMAGE_TYPE },
    { key: "og_image_width", value: DEFAULT_OG_IMAGE_WIDTH.toString() },
    { key: "og_image_height", value: DEFAULT_OG_IMAGE_HEIGHT.toString() },

    // Icons
    { key: "favicon", value: DEFAULT_FAVICON },
    { key: "apple_icon", value: DEFAULT_APPLE_ICON },

    // Geographic Information
    { key: "geo_region", value: DEFAULT_GEO_REGION },
    { key: "geo_placename", value: DEFAULT_GEO_PLACENAME },
    { key: "geo_position", value: DEFAULT_GEO_POSITION },

    // Features
    { key: "under_development", value: DEFAULT_UNDER_DEVELOPMENT.toString() },
    { key: "under_development_message", value: DEFAULT_UNDER_DEVELOPMENT_MESSAGE },
    { key: "comments_enabled", value: DEFAULT_COMMENTS_ENABLED.toString() },

    // Analytics (empty by default)
    { key: "analytics_google_id", value: "" },
    { key: "analytics_facebook_pixel", value: "" },

    // Legacy settings for backward compatibility
    { key: "timezone", value: DEFAULT_TIMEZONE },
    { key: "date_format", value: "F j, Y" },
    { key: "time_format", value: "g:i a" },
    { key: "posts_per_page", value: "10" },
    { key: "moderation_enabled", value: "true" },
  ];
}

async function main() {
  console.log("🌱 Seeding site configuration...\n");

  const settings = generateDefaultSiteSettings();
  let created = 0;
  let updated = 0;

  for (const setting of settings) {
    try {
      const result = await prisma.siteSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting,
      });

      // Check if it was created or updated
      const existing = await prisma.siteSetting.findUnique({
        where: { key: setting.key },
      });

      if (existing?.value === setting.value) {
        // It was either created or updated to match
        console.log(`  ✅ ${setting.key}`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to upsert ${setting.key}:`, error);
      throw error;
    }
  }

  const totalSettings = await prisma.siteSetting.count();

  console.log("\n" + "=".repeat(60));
  console.log("✨ Site configuration seeded successfully!");
  console.log("=".repeat(60));
  console.log(`\nTotal settings in database: ${totalSettings}`);
  console.log(`Settings configured: ${settings.length}`);
  console.log(
    "\n📝 All values synced from lib/constants/site.ts"
  );
  console.log("🔧 To update values, edit lib/constants/site.ts and run this script again");
  console.log("📚 Or use admin API endpoints to modify settings at runtime\n");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

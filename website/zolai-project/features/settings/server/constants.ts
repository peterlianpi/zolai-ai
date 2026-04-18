export const PUBLIC_SITE_SETTING_KEYS = [
  "site_name",
  "site_url",
  "site_description",
  "site_timezone",
  "under_development",
  "under_development_message",
  "recaptcha_site_key",
] as const;

export const PUBLIC_LAYOUT_SETTING_KEYS = [
  "site_name",
  "site_description",
  "social_facebook",
  "social_twitter",
  "social_youtube",
  "social_instagram",
  "social_tiktok",
  "under_development",
  "under_development_message",
] as const;

export const SITE_SETTINGS_CACHE_TAG = "site-settings";
export const PUBLIC_LAYOUT_CACHE_TAG = "public-layout-data";

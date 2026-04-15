/**
 * Slug generation utility
 * Converts text to URL-friendly slugs
 */

export function generateSlug(text: string): string {
  if (!text) return '';

  // Convert to lowercase and trim
  let slug = text.toLowerCase().trim();

  // Replace spaces and special characters with hyphens
  // Keep periods to handle version numbers like "2.0" -> "2-0"
  slug = slug.replace(/[^\w\s.\-]/g, ''); // Remove non-word, non-space, non-period, non-hyphen characters
  slug = slug.replace(/[\s_.-]+/g, '-'); // Replace spaces, underscores, periods, and multiple hyphens with single hyphen
  slug = slug.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  return slug || '';
}
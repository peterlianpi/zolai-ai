import type { PostType } from "@/features/content/schemas";
import { DEFAULT_LOCALE, isLocale, type LocaleCode } from "@/lib/i18n/locales";

/**
 * Canonical public URL path for a post by content type (blog posts, news, pages).
 * Myanmar (`my`) uses the `/my/...` prefix; English (`en`) has no prefix (matches proxy + sitemap).
 */
export function publicPostPath(
  type: PostType | string,
  slug: string,
  locale: string = DEFAULT_LOCALE,
): string {
  const segment =
    type === "NEWS" ? "news" : type === "PAGE" ? "pages" : "posts";
  const path = `/${segment}/${slug}`;
  const loc: LocaleCode = locale && isLocale(locale) ? locale : DEFAULT_LOCALE;
  if (loc === "my") return `/my${path}`;
  return path;
}

export function adminResourcesPath(
  type: PostType | string,
  locale: string = DEFAULT_LOCALE,
): string {
  const query = new URLSearchParams();

  if (type === "POST" || type === "PAGE" || type === "NEWS") {
    query.set("type", type);
  }

  const loc: LocaleCode = locale && isLocale(locale) ? locale : DEFAULT_LOCALE;
  if (loc === "my") {
    query.set("locale", "my");
  }

  const qs = query.toString();
  return qs ? `/admin/content/resources?${qs}` : "/admin/content/resources";
}

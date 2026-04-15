export const LOCALES = {
  en: {
    name: "English",
    code: "en",
    direction: "ltr" as const,
  },
  my: {
    name: "Myanmar",
    code: "my",
    direction: "ltr" as const,
  },
} as const;

export type LocaleCode = keyof typeof LOCALES;

export function getLocale(code: string): (typeof LOCALES)[LocaleCode] {
  return (LOCALES as Record<string, typeof LOCALES[LocaleCode]>)[code] ?? LOCALES.en;
}

export function getLocaleName(code: string): string {
  return getLocale(code).name;
}

export const DEFAULT_LOCALE: LocaleCode = "en";

export function isLocale(code: string): code is LocaleCode {
  return code in LOCALES;
}

/** Extract locale from URL pathname (e.g. /my/posts/slug → "my"). */
export function localeFromPathname(pathname: string): LocaleCode {
  const match = pathname.match(/^\/(en|my)(\/|$)/);
  if (match && isLocale(match[1])) return match[1];
  return DEFAULT_LOCALE;
}

/** Resolve locale from Next.js searchParams (backward compatible). */
export function localeFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): LocaleCode {
  const raw = searchParams.locale;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value && isLocale(value)) return value;
  return DEFAULT_LOCALE;
}

/** Resolve locale from pathname first, then searchParams fallback. */
export function resolveLocale(
  pathname: string,
  searchParams: Record<string, string | string[] | undefined>,
): LocaleCode {
  const fromPath = localeFromPathname(pathname);
  if (fromPath !== DEFAULT_LOCALE) return fromPath;
  return localeFromSearchParams(searchParams);
}

/** Resolve locale from headers (set by proxy for /my/... URLs). */
export function localeFromHeaders(headers: Headers): LocaleCode {
  const header = headers.get("x-locale");
  if (header && isLocale(header)) return header;
  return DEFAULT_LOCALE;
}

/** Strip locale prefix from pathname for route matching. */
export function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/(en|my)(\/.*)$/);
  return match ? match[2] : pathname;
}

/** Get the locale prefix for a given locale (empty string for default). */
export function localePrefix(locale: LocaleCode = DEFAULT_LOCALE): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

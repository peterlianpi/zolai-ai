import { NextRequest, NextResponse } from "next/server";
import { lookupRedirect, recordRedirectHit } from "@/features/redirects/server/lookup";
import { hasValidSession } from "@/lib/auth/validate";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/settings"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Resolve a redirect destination, replacing placeholders.
 * Supports $1, $2... for regex capture groups and * for wildcard prefix.
 */
function resolveRedirectDestination(
  source: string,
  destination: string,
  pathname: string,
): string {
  // Wildcard prefix: /old/* -> /new/*
  if (source.endsWith("/*") && destination.endsWith("/*")) {
    const prefix = source.slice(0, -2);
    const destPrefix = destination.slice(0, -2);
    const remainder = pathname.slice(prefix.length);
    return destPrefix + remainder;
  }

  // Regex capture groups: ^/old/(.*)$ -> /new/$1
  if (source.startsWith("/") && source.endsWith("/")) {
    try {
      const pattern = source.slice(1, -1);
      const regex = new RegExp(`^${pattern}$`);
      const match = pathname.match(regex);
      if (match) {
        return destination.replace(/\$(\d+)/g, (_, num) => match[parseInt(num, 10)] || "");
      }
    } catch {
      // Fall through to exact match
    }
  }

  return destination;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for API routes, static files, and public assets
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/hybridaction/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/next/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/site.webmanifest"
  ) {
    return NextResponse.next();
  }

  // Check redirects directly with cached redirect rules.
  try {
    const redirect = await Promise.race([
      lookupRedirect(pathname),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 600);
      }),
    ]);
    if (redirect) {
      recordRedirectHit(redirect.id);
      const dest = resolveRedirectDestination(redirect.source, redirect.destination, pathname);
      const destUrl = dest.startsWith("http") ? dest : new URL(dest, request.url).toString();
      return NextResponse.redirect(destUrl, redirect.statusCode || 301);
    }
  } catch {
    // If lookup fails, continue without redirect
  }

  // Rewrite /my/... to /...?locale=my internally
  // Browser URL stays as /my/... but Next.js handles it as /...?locale=my
  const myMatch = pathname.match(/^\/my(\/.*)$/);
  if (myMatch) {
    const cleanPath = myMatch[1] || "/";
    const url = new URL(cleanPath, request.url);
    url.searchParams.set("locale", "my");
    return NextResponse.rewrite(url);
  }

  // Redirect /en/... to clean URL (English is default, no prefix needed)
  const enMatch = pathname.match(/^\/en(\/.*)$/);
  if (enMatch) {
    const cleanPath = enMatch[1] || "/";
    return NextResponse.redirect(new URL(cleanPath, request.url));
  }

  const response = NextResponse.next();
  const isDevelopment = process.env.NODE_ENV !== "production";

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");

  // Keep CSP strict in production; allow dev inline/eval for Next.js local scripts/HMR.
  const scriptSrc = isDevelopment
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live";
  const connectSrc = isDevelopment
    ? "connect-src 'self' ws: wss: http: https:"
    : "connect-src 'self' https:";

  response.headers.set(
    "Content-Security-Policy",
    `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; ${connectSrc}; frame-ancestors 'self'; object-src 'none'; base-uri 'self';`
  );

  // Secure session validation against database
  // We use hasValidSession which performs a DB lookup
  if (isProtectedRoute(pathname)) {
    const isValid = await hasValidSession(request.cookies);
    
    if (!isValid) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackURL", pathname);
      return NextResponse.redirect(url);
    }
  }

  // NOTE: Do not redirect auth pages from middleware based only on cookie presence.
  // A stale/invalid cookie can cause /login <-> /dashboard redirect loops.
  // Page-level `requireNoAuth` does a real session check and handles this safely.

  // All other routes (/, /posts, /news, /pages, /about, /contact): allow everyone
  return response;
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files (svg, png, jpg, jpeg, gif, webp, woff, woff2)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)",
  ],
};

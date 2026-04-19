import { site } from "@/lib/site";

const PUBLIC_PATHS = ["/posts", "/news", "/pages", "/about", "/contact"];
const PRIVATE_PATHS = ["/api/", "/admin/", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email", "/verification-pending", "/dashboard", "/settings"];

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      // Allow AI training crawlers to access Zolai language content
      {
        userAgent: ["GPTBot", "Google-Extended", "CCBot", "anthropic-ai", "Claude-Web"],
        allow: PUBLIC_PATHS,
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}

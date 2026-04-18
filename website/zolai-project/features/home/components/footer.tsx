import Link from "next/link";
import { Brain } from "lucide-react";
import { type SVGProps } from "react";
import { DEFAULT_SITE_NAME, DEFAULT_SITE_DESCRIPTION, DEFAULT_FOOTER_COPYRIGHT_TEXT } from "@/lib/constants/site";
import type { Menu } from "@/features/menus/types";
import type { SiteSetting } from "@/features/settings/api";
import { SubscribeWidget } from "@/features/newsletter/components/SubscribeWidget";

function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.3L6.6 22H3.5l7.3-8.4L1.5 2h6.2l4.3 5.7zm-1.1 18h1.7L6.8 3.9H5.1z" />
    </svg>
  );
}

function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
    </svg>
  );
}

const LEARN_LINKS = [
  { href: "/search", label: "Dictionary" },
  { href: "/posts/zolai-grammar-basics", label: "Grammar Guide" },
  { href: "/getting-started", label: "Get Started" },
  { href: "/resources", label: "Resources" },
  { href: "/signup", label: "Full Platform →" },
];

const ABOUT_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/help", label: "Help" },
  { href: "/community", label: "Community" },
];

interface FooterProps {
  menus?: Menu[];
  siteSettings?: SiteSetting[];
}

export function Footer({ siteSettings = [] }: FooterProps) {
  const get = (key: string, fallback: string) =>
    siteSettings.find((s) => s.key === key)?.value ?? fallback;

  const siteName = get("site_name", DEFAULT_SITE_NAME);
  const siteDescription = get("site_description", DEFAULT_SITE_DESCRIPTION);
  const copyrightText = get("footer_copyright_text", DEFAULT_FOOTER_COPYRIGHT_TEXT);
  const twitterUrl = get("social_twitter", "");
  const githubUrl = get("social_github", "");

  return (
    <footer className="border-t bg-muted/20" role="contentinfo">
      <div className="h-0.5 bg-gradient-to-r from-primary via-amber-400 to-green-500" aria-hidden="true" />
      <div className="container mx-auto px-4 py-5">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 w-fit group" aria-label={`${siteName} home`}>
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
                <Brain className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="font-bold text-base">{siteName}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">{siteDescription}</p>
            <div className="flex items-center gap-3 pt-1">
              {twitterUrl && (
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter / X">
                  <TwitterIcon className="h-4 w-4" />
                </a>
              )}
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
                  <GitHubIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Learn</h3>
            <nav className="flex flex-col gap-2 text-sm" aria-label="Learn links">
              {LEARN_LINKS.map(({ href, label }) => (
                <Link key={label} href={href} className="text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">About</h3>
            <nav className="flex flex-col gap-2 text-sm" aria-label="About links">
              {ABOUT_LINKS.map(({ href, label }) => (
                <Link key={label} href={href} className="text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <SubscribeWidget
              title="Stay Updated"
              description="Get Zolai AI project updates."
              source="footer"
              className="border-0 shadow-none p-0 bg-transparent"
            />
          </div>
        </div>

        <div className="border-t mt-5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{copyrightText}</span>
          <div className="flex items-center gap-1.5" aria-label="Tedim Zolai ZVS">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
            <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
            <span className="ml-1">Tedim Zolai (ZVS)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

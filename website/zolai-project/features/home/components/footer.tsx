import Link from "next/link";
import { Brain } from "lucide-react";
import { type SVGProps } from "react";
import { DEFAULT_SITE_NAME, DEFAULT_SITE_DESCRIPTION, DEFAULT_FOOTER_COPYRIGHT_TEXT } from "@/lib/constants/site";
import type { Menu } from "@/features/menus/types";
import type { SiteSetting } from "@/features/settings/api";

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
  { href: "/dictionary", label: "Dictionary" },
  { href: "/grammar", label: "Grammar" },
  { href: "/wiki", label: "Wiki" },
  { href: "/bible", label: "Bible" },
  { href: "/tutor", label: "Tutor" },
];

interface FooterProps {
  menus?: Menu[];
  siteSettings?: SiteSetting[];
}

export function Footer({ siteSettings = [] }: FooterProps) {
  const getSetting = (key: string, fallback: string) =>
    siteSettings.find((s) => s.key === key)?.value ?? fallback;

  const siteName = getSetting("site_name", DEFAULT_SITE_NAME);
  const siteDescription = getSetting("site_description", DEFAULT_SITE_DESCRIPTION);
  const copyrightText = getSetting("footer_copyright_text", DEFAULT_FOOTER_COPYRIGHT_TEXT);
  const twitterUrl = getSetting("social_twitter", "");
  const githubUrl = getSetting("social_github", "");

  return (
    <footer className="border-t bg-muted/30 mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-bold text-base">{siteName}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">{siteDescription}</p>
          </div>

          {/* Col 2: Learn */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Learn</h3>
            <nav className="flex flex-col gap-2 text-sm">
              {LEARN_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="text-muted-foreground hover:text-foreground transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3: Connect */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Connect</h3>
            <div className="flex flex-col gap-2 text-sm">
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <TwitterIcon className="h-4 w-4" />
                  Twitter / X
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <GitHubIcon className="h-4 w-4" />
                  GitHub
                </a>
              )}
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          {copyrightText}
        </div>
      </div>
    </footer>
  );
}

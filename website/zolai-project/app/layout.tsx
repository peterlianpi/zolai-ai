import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { buildSiteJsonLd, buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import {
  generateOrganizationJsonLd,
  generateSiteLinksSearchBoxJsonLd,
  generateSpeakableJsonLd,
} from "@/lib/seo";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/constants/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  return buildSiteMetadata(siteConfig);
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a0808" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteConfig = await getSiteConfig();
  const jsonLd = buildSiteJsonLd(siteConfig);
  const organizationJsonLd = generateOrganizationJsonLd({
    sameAs: [
      siteConfig.social?.facebook,
      siteConfig.social?.twitter,
      siteConfig.social?.youtube,
      siteConfig.social?.instagram,
      siteConfig.social?.tiktok,
    ].filter(Boolean),
    contactEmail: DEFAULT_CONTACT_EMAIL,
  });

  const searchBoxJsonLd = generateSiteLinksSearchBoxJsonLd();
  const speakableJsonLd = generateSpeakableJsonLd();

  const gaId = siteConfig.analytics?.googleId;
  const fbPixel = siteConfig.analytics?.facebookPixel;

  return (
    <html lang={siteConfig.lang} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(searchBoxJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }}
        />
        {gaId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
        {fbPixel && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${fbPixel}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
        <link rel="alternate" type="application/rss+xml" title="RSS Feed - Posts" href="/api/seo/rss" />
        <link rel="alternate" type="application/rss+xml" title="RSS Feed - News" href="/api/seo/news-rss" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={siteConfig.url} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

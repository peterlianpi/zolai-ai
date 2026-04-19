export const revalidate = 3600;
import type { Metadata } from "next";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { PageLayout } from "@/features/templates/components";
import { AboutPage } from "@/features/home/components";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  const description = `About ${siteConfig.name}`;
  return {
    ...base,
    title: "About",
    description,
    openGraph: {
      ...base.openGraph,
      title: "About",
      description,
    },
    twitter: {
      ...base.twitter,
      title: "About",
      description,
    },
  };
}

export default function About() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      layout={{ maxWidth: "xl", padding: "lg" }}
    >
      <AboutPage />
    </PageLayout>
  );
}

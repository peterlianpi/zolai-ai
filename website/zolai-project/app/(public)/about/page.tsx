export const revalidate = 3600;
import type { Metadata } from "next";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { Hero, AboutPage } from "@/features/home/components";

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
    <>
      <Hero title="About" breadcrumb={["Home", "About"]} />
      <AboutPage />
    </>
  );
}

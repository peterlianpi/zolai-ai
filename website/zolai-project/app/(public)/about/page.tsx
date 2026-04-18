export const revalidate = 3600;
import type { Metadata } from "next";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { AboutPage } from "@/features/home/components";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  return { ...base, title: "About", description: `About ${siteConfig.name} — preserving the Tedim Zolai language through AI` };
}

export default function About() {
  return <AboutPage />;
}

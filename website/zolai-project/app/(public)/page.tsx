import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/site-config";
import { SITE_CONSTANTS } from "@/lib/constants/site";
import { HomePage } from "@/features/home/components";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  return {
    title: `${siteConfig.name} — Zomi Language Second Brain`,
    description: siteConfig.description || SITE_CONSTANTS.description,
  };
}

export default function Page() {
  return <HomePage />;
}

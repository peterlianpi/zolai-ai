export const revalidate = 3600;
import type { Metadata } from "next";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { Hero } from "@/features/home/components";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/constants/site";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  const description = `Contact ${siteConfig.name}`;
  return {
    ...base,
    title: "Contact",
    description,
    openGraph: { ...base.openGraph, title: "Contact", description },
    twitter: { ...base.twitter, title: "Contact", description },
  };
}

export default function ContactPage() {
  return (
    <>
      <Hero title="Contact Us" breadcrumb={["Home", "Contact"]} />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <div className="mb-8">
                <h6 className="font-normal mb-4">HOW CAN WE HELP YOU?</h6>
                <p className="text-sm text-muted-foreground">
                  Have a question about the dataset, the language tutor, or contributing to the project?
                  Fill in the form or reach out by email and we&apos;ll get back to you.
                </p>
              </div>
              <div className="mb-8">
                <h6 className="font-normal mb-2">Email:</h6>
                <p className="text-sm">{DEFAULT_CONTACT_EMAIL}</p>
              </div>
            </div>
            <div className="md:col-span-8">
              <div className="rounded-lg border bg-muted/50 p-6 text-sm">
                <p className="font-medium mb-2">Response Time</p>
                <p className="text-muted-foreground">
                  We aim to respond to all inquiries within 2-3 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

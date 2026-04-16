export const revalidate = 3600;
import type { Metadata } from "next";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { Hero } from "@/features/home/components";
import { DEFAULT_CONTACT_EMAIL, DEFAULT_SUPPORT_EMAIL } from "@/lib/constants/site";
import { SupportForm } from "@/features/support/components/support-form";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Clock } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  const description = `Contact ${siteConfig.name} — get help, report bugs, or ask questions`;
  return {
    ...base,
    title: "Contact & Support",
    description,
    openGraph: { ...base.openGraph, title: "Contact & Support", description },
    twitter: { ...base.twitter, title: "Contact & Support", description },
  };
}

export default function ContactPage() {
  return (
    <>
      <Hero title="Contact & Support" breadcrumb={["Home", "Contact"]} />

      <section className="py-8 lg:py-16">
        <div className="container mx-auto px-4">
          
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">How can we help you?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get support for the Zolai language platform, report issues, or ask questions about Tedim linguistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">

            {/* Contact Info Group */}
            <div className="space-y-3 h-full flex flex-col justify-between">
              
              {/* Quick Contact Cards */}
              <div className="space-y-3">
                <div className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">General Inquiries</h3>
                      <p className="text-sm text-muted-foreground">Questions & feedback</p>
                    </div>
                  </div>
                  <a href={`mailto:${DEFAULT_CONTACT_EMAIL}`} className="text-primary hover:underline font-medium">
                    {DEFAULT_CONTACT_EMAIL}
                  </a>
                </div>

                <div className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Technical Support</h3>
                      <p className="text-sm text-muted-foreground">Bugs & issues</p>
                    </div>
                  </div>
                  <a href={`mailto:${DEFAULT_SUPPORT_EMAIL}`} className="text-primary hover:underline font-medium">
                    {DEFAULT_SUPPORT_EMAIL}
                  </a>
                </div>
              </div>

              {/* Response Info */}
              <div className="rounded-xl border bg-muted/30 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Response Time</h3>
                </div>
                <p className="text-muted-foreground mb-3">
                  We typically respond within <strong>2–3 business days</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  For urgent technical issues, please include detailed steps to reproduce the problem.
                </p>
              </div>

              {/* FAQ Link */}
              <div className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold mb-2">Before you contact us</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check our documentation for common questions about Zolai grammar, dictionary usage, and platform features.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/wiki">Browse Documentation</a>
                </Button>
              </div>
            </div>

            {/* Contact Form Group */}
            <div className="">
              <div className="rounded-xl border bg-card p-6 lg:p-8 shadow-sm">
                <div className="mb-8">
                  <h2 className="text-xl lg:text-2xl font-bold mb-2">Send us a message</h2>
                  <p className="text-muted-foreground">
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </p>
                </div>
                <SupportForm />
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

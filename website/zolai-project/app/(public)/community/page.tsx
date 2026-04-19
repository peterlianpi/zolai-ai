export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { PageLayout } from "@/features/templates/components";
import { Users, Globe, Heart, Code } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  const description = `Join the Zolai community and help preserve the Tedim Zolai language`;
  return {
    ...base,
    title: "Community",
    description,
    openGraph: {
      ...base.openGraph,
      title: "Community",
      description,
    },
    twitter: {
      ...base.twitter,
      title: "Community",
      description,
    },
  };
}

const COMMUNITY_WAYS = [
  {
    title: "Contribute to the Wiki",
    description: "Help expand our linguistics wiki with grammar rules, phonology, and cultural notes.",
    icon: Globe,
    href: "/wiki",
    action: "Browse Wiki",
  },
  {
    title: "Join Discussions",
    description: "Connect with other Zolai learners and speakers in our community forum.",
    icon: Users,
    href: "/forum",
    action: "Join Forum",
  },
  {
    title: "Support the Project",
    description: "Help us grow by sharing Zolai with others who might benefit from it.",
    icon: Heart,
    href: "/about",
    action: "Learn More",
  },
  {
    title: "Contribute Code",
    description: "All our code is open source. Developers can contribute on GitHub.",
    icon: Code,
    href: "https://github.com/zolai-ai",
    action: "View GitHub",
  },
];

const GUIDELINES = [
  {
    title: "Be Respectful",
    description: "Treat all community members with respect and kindness, regardless of their language proficiency level.",
  },
  {
    title: "Share Knowledge",
    description: "Help others learn by sharing your knowledge of Zolai language, culture, and traditions.",
  },
  {
    title: "Quality Contributions",
    description: "When contributing to the wiki or datasets, ensure accuracy and follow our style guidelines.",
  },
  {
    title: "Stay On Topic",
    description: "Keep discussions focused on Zolai language learning, linguistics, and related cultural topics.",
  },
];

export default function CommunityPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Community" }]}
      pageHeader={{
        title: "Community",
        description: "Join our mission to preserve and promote the Tedim Zolai language for future generations",
      }}
      layout={{ maxWidth: "xl", padding: "lg" }}
    >
      <div className="space-y-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {COMMUNITY_WAYS.map(({ title, description, icon: Icon, href, action }) => (
            <Link
              key={title}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group rounded-xl border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{description}</p>
              <span className="text-sm font-medium text-primary">
                {action} →
              </span>
            </Link>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6">Community Guidelines</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {GUIDELINES.map(({ title, description }) => (
              <div key={title} className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to contribute?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Every contribution, no matter how small, helps preserve and promote the Zolai language. Join us today!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Join Community
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2.5 text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

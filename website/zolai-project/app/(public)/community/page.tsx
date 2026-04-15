export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { Hero } from "@/features/home/components";
import { Users, Globe, Heart, Code } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  const description = `Join the Zolai AI community and help preserve the Tedim Zolai language`;
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
    description: "Help us grow by sharing Zolai AI with others who might benefit from it.",
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

export default function CommunityPage() {
  return (
    <>
      <Hero title="Community" breadcrumb={["Home", "Community"]} />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Join Our Mission</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Zolai AI is built by the community, for the community. Help us preserve and promote the Tedim Zolai language for future generations.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {COMMUNITY_WAYS.map(({ title, description, icon: Icon, href, action }) => (
              <Link
                key={title}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group rounded-xl border bg-card p-6 hover:border-red-400 hover:shadow-md transition-all"
              >
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 w-fit">
                  <Icon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{description}</p>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {action} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Community Guidelines</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-2">Be Respectful</h3>
              <p className="text-sm text-muted-foreground">
                Treat all community members with respect and kindness, regardless of their language proficiency level.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-2">Share Knowledge</h3>
              <p className="text-sm text-muted-foreground">
                Help others learn by sharing your knowledge of Zolai language, culture, and traditions.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-2">Quality Contributions</h3>
              <p className="text-sm text-muted-foreground">
                When contributing to the wiki or datasets, ensure accuracy and follow our style guidelines.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-2">Stay On Topic</h3>
              <p className="text-sm text-muted-foreground">
                Keep discussions focused on Zolai language learning, linguistics, and related cultural topics.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-br from-red-950 via-red-900 to-rose-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to contribute?</h2>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            Every contribution, no matter how small, helps preserve and promote the Zolai language. Join us today!
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-white text-red-950 px-6 py-2.5 text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              Join Community
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md border border-red-200 text-red-50 px-6 py-2.5 text-sm font-semibold hover:bg-red-800/50 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

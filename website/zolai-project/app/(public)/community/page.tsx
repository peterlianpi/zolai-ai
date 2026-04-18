export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { PageTitle } from "@/features/home/components";
import { Button } from "@/components/ui/button";
import { Users, Globe, Heart, Code } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  return { ...base, title: "Community", description: `Join the ${siteConfig.name} community and help preserve the Tedim Zolai language` };
}

const COMMUNITY_WAYS = [
  { title: "Contribute to the Wiki", description: "Help expand our linguistics wiki with grammar rules, phonology, and cultural notes.", icon: Globe, href: "/wiki", action: "Browse Wiki" },
  { title: "Join Discussions", description: "Connect with other Zolai learners and speakers in our community forum.", icon: Users, href: "/forum", action: "Join Forum" },
  { title: "Support the Project", description: "Help us grow by sharing Zolai AI with others who might benefit from it.", icon: Heart, href: "/about", action: "Learn More" },
  { title: "Contribute Code", description: "All our code is open source. Developers can contribute on GitHub.", icon: Code, href: "https://github.com/zolai-ai", action: "View GitHub", external: true },
];

const GUIDELINES = [
  { title: "Be Respectful", body: "Treat all community members with respect and kindness, regardless of their language proficiency level." },
  { title: "Share Knowledge", body: "Help others learn by sharing your knowledge of Zolai language, culture, and traditions." },
  { title: "Quality Contributions", body: "When contributing to the wiki or datasets, ensure accuracy and follow our style guidelines." },
  { title: "Stay On Topic", body: "Keep discussions focused on Zolai language learning, linguistics, and related cultural topics." },
];

export default function CommunityPage() {
  return (
    <>
      <PageTitle title="Community" className="max-w-4xl" />

      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-4">Join Our Mission</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Zolai AI is built by the community, for the community. Help us preserve and promote the Tedim Zolai language for future generations.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {COMMUNITY_WAYS.map(({ title, description, icon: Icon, href, action, external }) => (
              <Link key={title} href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group rounded-xl border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{description}</p>
                <span className="text-sm font-medium text-primary">{action} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Community Guidelines</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {GUIDELINES.map(({ title, body }) => (
              <div key={title} className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-gradient-to-br from-red-950 via-red-900 to-rose-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to contribute?</h2>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            Every contribution, no matter how small, helps preserve and promote the Zolai language. Join us today!
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild className="bg-white text-red-950 hover:bg-red-50 font-semibold">
              <Link href="/signup">Join Community</Link>
            </Button>
            <Button asChild variant="outline" className="border-red-200 text-red-50 hover:bg-red-800/50 hover:text-white">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

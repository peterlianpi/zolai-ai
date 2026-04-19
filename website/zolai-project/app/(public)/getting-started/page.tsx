export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { PageLayout } from "@/features/templates/components";
import { BookOpen, Users, Target, Lightbulb } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  const description = `Getting started with Zolai - your guide to learning Tedim Zolai`;
  return {
    ...base,
    title: "Getting Started",
    description,
    openGraph: {
      ...base.openGraph,
      title: "Getting Started",
      description,
    },
    twitter: {
      ...base.twitter,
      title: "Getting Started",
      description,
    },
  };
}

const STEPS = [
  {
    title: "Create Your Account",
    description: "Sign up for free to access lessons and track your progress.",
    icon: Users,
    href: "/signup",
  },
  {
    title: "Start with the Dictionary",
    description: "Explore over 24,000 Zolai words with definitions and examples.",
    icon: BookOpen,
    href: "/dictionary",
  },
  {
    title: "Take Structured Lessons",
    description: "Practice with CEFR-aligned lessons that adapt to your level.",
    icon: Target,
    href: "/learn",
  },
  {
    title: "Explore Resources",
    description: "Access the Bible corpus, linguistics wiki, and grammar references.",
    icon: Lightbulb,
    href: "/resources",
  },
];

const TIPS = [
  {
    title: "Start with Basics",
    description: "Begin with common words and phrases using the dictionary.",
  },
  {
    title: "Practice Daily",
    description: "Spend 15-30 minutes daily with lessons for consistency.",
  },
  {
    title: "Use the Bible Corpus",
    description: "Read familiar passages to understand sentence structure.",
  },
  {
    title: "Join the Community",
    description: "Contribute to the linguistics wiki and help improve datasets.",
  },
];

export default function GettingStartedPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Getting Started" }]}
      pageHeader={{
        title: "Getting Started",
        description: "Your journey to learning Zolai begins here",
      }}
      layout={{ maxWidth: "xl", padding: "lg" }}
    >
      <div className="space-y-12">
        <div className="grid gap-8 sm:grid-cols-2">
          {STEPS.map(({ title, description, icon: Icon, href }, index) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{description}</p>
                <Link href={href} className="text-sm font-medium text-primary hover:underline">
                  Get Started →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6">Learning Tips</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {TIPS.map(({ title, description }) => (
              <div key={title} className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { Hero } from "@/features/home/components";
import { BookOpen, Users, Target, Lightbulb } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  const description = `Getting started with Zolai AI - your guide to learning Tedim Zolai`;
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
    description: "Sign up for free to access the AI tutor and track your progress.",
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
    title: "Try the AI Tutor",
    description: "Practice with our Socratic tutor that adapts to your level.",
    icon: Target,
    href: "/tutor",
  },
  {
    title: "Explore Resources",
    description: "Access the Bible corpus, linguistics wiki, and grammar references.",
    icon: Lightbulb,
    href: "/resources",
  },
];

export default function GettingStartedPage() {
  return (
    <>
      <Hero title="Getting Started" breadcrumb={["Home", "Getting Started"]} />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Your Journey to Learning Zolai</h2>
            <p className="text-muted-foreground">Follow these steps to start your language learning journey.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {STEPS.map(({ title, description, icon: Icon, href }, index) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <h3 className="font-semibold">{title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{description}</p>
                  <Link href={href} className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                    Get Started →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Learning Tips</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-2">Start with Basics</h3>
              <p className="text-sm text-muted-foreground">Begin with common words and phrases using the dictionary.</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-2">Practice Daily</h3>
              <p className="text-sm text-muted-foreground">Spend 15-30 minutes daily with the AI tutor for consistency.</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-2">Use the Bible Corpus</h3>
              <p className="text-sm text-muted-foreground">Read familiar passages to understand sentence structure.</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-2">Join the Community</h3>
              <p className="text-sm text-muted-foreground">Contribute to the linguistics wiki and help improve datasets.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

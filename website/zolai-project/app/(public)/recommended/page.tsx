export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { PageLayout } from "@/features/templates/components";
import { BookOpen, FileText, GraduationCap, Library, Brain, Cpu } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  const description = `Recommended tools and resources for learning and working with Tedim Zolai`;
  return {
    ...base,
    title: "Recommended",
    description,
    openGraph: {
      ...base.openGraph,
      title: "Recommended",
      description,
    },
    twitter: {
      ...base.twitter,
      title: "Recommended",
      description,
    },
  };
}

const RECOMMENDED_TOOLS = [
  {
    title: "Dictionary",
    description: "The most comprehensive Zolai↔English dictionary with over 24,000 entries and semantic relationships.",
    icon: BookOpen,
    href: "/dictionary",
    category: "Reference",
  },
  {
    title: "Structured Lessons",
    description: "CEFR-aligned lesson books with vocabulary, translation, and grammar exercises.",
    icon: GraduationCap,
    href: "/learn",
    category: "Learning",
  },
  {
    title: "Bible Corpus",
    description: "Parallel Bible in Tedim Zolai with multiple translations for comparison and learning.",
    icon: FileText,
    href: "/bible",
    category: "Reference",
  },
  {
    title: "Linguistics Wiki",
    description: "Community-maintained reference for Zolai grammar, phonology, and morphology.",
    icon: Library,
    href: "/wiki",
    category: "Reference",
  },
  {
    title: "Training Dashboard",
    description: "Track AI model training progress, dataset versions, and model checkpoints.",
    icon: Cpu,
    href: "/training",
    category: "Developer",
  },
  {
    title: "Translation Tool",
    description: "Fast dictionary-based translation with autocomplete and fuzzy matching for Zolai↔English.",
    icon: Brain,
    href: "/translate",
    category: "Tools",
  },
];

const EXTERNAL_RESOURCES = [
  {
    title: "GitHub Repository",
    description: "All datasets, training scripts, and tooling are open source. Contributions welcome!",
    href: "https://github.com/zolai-ai",
    category: "Open Source",
  },
  {
    title: "Zomi Language Resources",
    description: "External links to Zomi language learning materials and community resources.",
    href: "https://github.com/zolai-ai/resources",
    category: "Community",
  },
];

export default function RecommendedPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Recommended" }]}
      pageHeader={{
        title: "Recommended Resources",
        description: "Our curated collection of tools and resources for learning Tedim Zolai",
      }}
      layout={{ maxWidth: "xl", padding: "lg" }}
    >
      <div className="space-y-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RECOMMENDED_TOOLS.map(({ title, description, icon: Icon, href, category }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-xl border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{category}</span>
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </Link>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">External Resources</h2>
          <p className="text-muted-foreground mb-6">
            Additional resources from the Zomi community and open-source projects.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {EXTERNAL_RESOURCES.map(({ title, description, href, category }) => (
              <Link
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground">{category}</span>
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Have a resource to recommend?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We&apos;re always looking to expand our collection of tools and resources for Tedim Zolai.
            If you know of a valuable resource that should be included, please let us know.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}

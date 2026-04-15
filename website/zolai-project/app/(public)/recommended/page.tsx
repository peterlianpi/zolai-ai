export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { Hero } from "@/features/home/components";
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
    title: "Zolai AI Tutor",
    description: "Our AI-powered Socratic tutor that adapts to your learning level and provides personalized guidance.",
    icon: Brain,
    href: "/tutor",
    category: "AI Tools",
    recommended: true,
  },
  {
    title: "Zolai Dictionary",
    description: "The most comprehensive Zolai↔English dictionary with over 24,000 entries and semantic relationships.",
    icon: BookOpen,
    href: "/dictionary",
    category: "Reference",
    recommended: true,
  },
  {
    title: "Bible Corpus",
    description: "Parallel Bible in Tedim Zolai with multiple translations for comparison and learning.",
    icon: FileText,
    href: "/bible",
    category: "Reference",
    recommended: true,
  },
  {
    title: "Linguistics Wiki",
    description: "Community-maintained reference for Zolai grammar, phonology, and morphology.",
    icon: Library,
    href: "/wiki",
    category: "Reference",
    recommended: true,
  },
  {
    title: "Training Dashboard",
    description: "Track our AI model training progress, dataset versions, and model checkpoints.",
    icon: Cpu,
    href: "/training",
    category: "Developer",
    recommended: true,
  },
  {
    title: "Translation Tool",
    description: "Fast dictionary-based translation with autocomplete and fuzzy matching for Zolai↔English.",
    icon: GraduationCap,
    href: "/translate",
    category: "Tools",
    recommended: true,
  },
];

const EXTERNAL_RESOURCES = [
  {
    title: "GitHub Repository",
    description: "All datasets, training scripts, and tooling are open source. Contributions welcome!",
    icon: "GitHub",
    href: "https://github.com/zolai-ai",
    category: "Open Source",
  },
  {
    title: "Zomi Language Resources",
    description: "External links to Zomi language learning materials and community resources.",
    icon: "🌐",
    href: "https://github.com/zolai-ai/resources",
    category: "Community",
  },
];

export default function RecommendedPage() {
  return (
    <>
      <Hero title="Recommended" breadcrumb={["Home", "Recommended"]} />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Featured Tools</h2>
            <p className="text-muted-foreground mb-6">
              Our recommended tools and resources for learning and working with Tedim Zolai.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {RECOMMENDED_TOOLS.map(({ title, description, icon: Icon, href, category, recommended }) => (
                <Link
                  key={title}
                  href={href}
                  className="group rounded-xl border bg-card p-6 hover:border-red-400 hover:shadow-md transition-all"
                >
                  {recommended && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
                      Recommended
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
                      {typeof Icon === "string" ? (
                        <span className="text-lg">{Icon}</span>
                      ) : (
                        <Icon className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{category}</span>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">External Resources</h2>
            <p className="text-muted-foreground mb-6">
              Additional resources from the Zomi community and open-source projects.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {EXTERNAL_RESOURCES.map(({ title, description, icon, href, category }) => (
                <Link
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg border bg-card p-6 hover:border-red-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{icon}</span>
                    <span className="text-xs font-medium text-muted-foreground">{category}</span>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-br from-red-950 via-red-900 to-rose-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Have a resource to recommend?</h2>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            We&apos;re always looking to expand our collection of tools and resources for Tedim Zolai.
            If you know of a valuable resource that should be included, please let us know.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-white text-red-950 px-6 py-2.5 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}

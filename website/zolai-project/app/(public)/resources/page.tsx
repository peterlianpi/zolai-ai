export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { PageLayout } from "@/features/templates/components";
import { BookOpen, FileText, GraduationCap, Library } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  const description = `Learning resources for Tedim Zolai language`;
  return {
    ...base,
    title: "Resources",
    description,
    openGraph: {
      ...base.openGraph,
      title: "Resources",
      description,
    },
    twitter: {
      ...base.twitter,
      title: "Resources",
      description,
    },
  };
}

const RESOURCES = [
  {
    title: "Dictionary",
    description: "Searchable Zolai↔English vocabulary with definitions, examples, and related words.",
    icon: BookOpen,
    href: "/dictionary",
  },
  {
    title: "Structured Lessons",
    description: "CEFR A1–C2 lesson books with vocabulary, translation, and grammar exercises.",
    icon: GraduationCap,
    href: "/learn",
  },
  {
    title: "Bible Corpus",
    description: "Full Tedim Zolai Bible (TDB77 + Tedim2010) aligned verse-by-verse with KJV.",
    icon: FileText,
    href: "/bible",
  },
  {
    title: "Linguistics Wiki",
    description: "Structured grammar rules, phonology, morphology, and dialect notes for Tedim Zolai.",
    icon: Library,
    href: "/wiki",
  },
];

const ADDITIONAL = [
  {
    title: "Grammar Reference",
    description: "Browse phonology, morphology, syntax, and semantics rules for Tedim Zolai.",
    href: "/grammar",
  },
  {
    title: "Translation Tool",
    description: "Dictionary-based Zolai↔English translation with autocomplete and fuzzy matching.",
    href: "/translate",
  },
  {
    title: "Audio Pronunciation",
    description: "Listen to native Zolai word pronunciations and practice your speaking.",
    href: "/audio",
  },
  {
    title: "Community Forum",
    description: "Connect with other learners, ask questions, and share your progress.",
    href: "/forum",
  },
];

export default function ResourcesPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Resources" }]}
      pageHeader={{
        title: "Learning Resources",
        description: "Everything you need to learn and master the Tedim Zolai language",
      }}
      layout={{ maxWidth: "xl", padding: "lg" }}
    >
      <div className="space-y-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {RESOURCES.map(({ title, description, icon: Icon, href }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-xl border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </Link>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Additional Tools</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {ADDITIONAL.map(({ title, description, href }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-lg border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

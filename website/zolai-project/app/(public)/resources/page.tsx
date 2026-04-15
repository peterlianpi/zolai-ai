export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { Hero } from "@/features/home/components";
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
    title: "Zolai Dictionary",
    description: "Searchable Zolai↔English vocabulary with definitions, examples, and related words.",
    icon: BookOpen,
    href: "/dictionary",
    color: "text-red-600",
  },
  {
    title: "Language Tutor",
    description: "AI-powered Socratic tutor adapting to your CEFR level — from A1 basics to C2 mastery.",
    icon: GraduationCap,
    href: "/tutor",
    color: "text-blue-600",
  },
  {
    title: "Bible Corpus",
    description: "Full Tedim Zolai Bible (TDB77 + Tedim2010) aligned verse-by-verse with KJV.",
    icon: FileText,
    href: "/bible",
    color: "text-green-600",
  },
  {
    title: "Linguistics Wiki",
    description: "Structured grammar rules, phonology, morphology, and dialect notes for Tedim Zolai.",
    icon: Library,
    href: "/wiki",
    color: "text-purple-600",
  },
];

export default function ResourcesPage() {
  return (
    <>
      <Hero title="Resources" breadcrumb={["Home", "Resources"]} />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {RESOURCES.map(({ title, description, icon: Icon, href, color }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-xl border bg-card p-6 hover:border-red-400 hover:shadow-md transition-all"
              >
                <div className={`mb-4 p-3 rounded-lg bg-muted/50 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/grammar"
              className="group rounded-lg border bg-card p-6 hover:border-red-400 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold mb-2 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                Grammar Reference
              </h3>
              <p className="text-sm text-muted-foreground">
                Browse phonology, morphology, syntax, and semantics rules for Tedim Zolai.
              </p>
            </Link>
            <Link
              href="/learn"
              className="group rounded-lg border bg-card p-6 hover:border-red-400 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold mb-2 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                Structured Lessons
              </h3>
              <p className="text-sm text-muted-foreground">
                CEFR A1–C2 lesson books with vocabulary, translation, fill-in-the-blank, and grammar exercises.
              </p>
            </Link>
            <Link
              href="/translate"
              className="group rounded-lg border bg-card p-6 hover:border-red-400 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold mb-2 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                Translation Tool
              </h3>
              <p className="text-sm text-muted-foreground">
                Dictionary-based Zolai↔English translation with autocomplete and fuzzy matching.
              </p>
            </Link>
            <Link
              href="/audio"
              className="group rounded-lg border bg-card p-6 hover:border-red-400 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold mb-2 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                Audio Pronunciation
              </h3>
              <p className="text-sm text-muted-foreground">
                Listen to native Zolai word pronunciations and practice your speaking.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

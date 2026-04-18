export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { PageTitle } from "@/features/home/components";
import { BookOpen, FileText, GraduationCap, Library, Search, Music, Globe, Cpu } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  return { ...base, title: "Resources", description: "Learning resources for Tedim Zolai language — dictionary, Bible corpus, grammar, AI tutor, and more." };
}

const PUBLIC_RESOURCES = [
  {
    icon: Search,
    title: "Zolai Dictionary",
    description: "Search 24,000+ Zolai↔English words with definitions, part-of-speech tags, example sentences, synonyms, and antonyms. No account required.",
    href: "/search",
    badge: "Free",
  },
  {
    icon: FileText,
    title: "Posts & Articles",
    description: "In-depth articles about the Zomi people, Zolai language history, grammar basics, and cultural traditions.",
    href: "/posts",
    badge: "Free",
  },
  {
    icon: Globe,
    title: "News",
    description: "Latest updates on the Zolai AI project — dataset milestones, new features, and language preservation news.",
    href: "/news",
    badge: "Free",
  },
  {
    icon: Music,
    title: "Community",
    description: "Connect with Zomi language learners, linguists, and contributors. Share resources and collaborate on preservation.",
    href: "/community",
    badge: "Free",
  },
];

const MEMBER_RESOURCES = [
  {
    icon: GraduationCap,
    title: "AI Language Tutor",
    description: "Socratic AI tutor adapting to your CEFR level (A1–C2). Practice conversation, translation, grammar, and reading in Tedim Zolai.",
    href: "/signup",
  },
  {
    icon: FileText,
    title: "Bible Corpus",
    description: "Full Tedim Zolai Bible — 5 versions (TB77, TBR17, Tedim1932, Tedim2010, KJV) aligned verse-by-verse. 31,102 verses for study and research.",
    href: "/signup",
  },
  {
    icon: Library,
    title: "Linguistics Wiki",
    description: "Structured grammar rules, phonology, morphology, SOV syntax, pronoun system, negation patterns, and dialect notes for Tedim Zolai.",
    href: "/signup",
  },
  {
    icon: BookOpen,
    title: "Structured Lessons",
    description: "CEFR A1–C2 lesson books with vocabulary, translation exercises, fill-in-the-blank, and grammar drills. Track your progress.",
    href: "/signup",
  },
  {
    icon: Cpu,
    title: "AI Chat",
    description: "Chat with Zolai AI in Tedim Zolai or English. Ask questions, get translations, practice conversation with multiple AI providers.",
    href: "/signup",
  },
];

export default function ResourcesPage() {
  return (
    <>
      <PageTitle title="Resources" className="max-w-5xl" />

      <section className="py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-2">Free Resources</h2>
            <p className="text-muted-foreground">Available to everyone — no account required.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-16">
            {PUBLIC_RESOURCES.map(({ icon: Icon, title, description, href, badge }) => (
              <Link key={title} href={href} className="group rounded-xl border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">{badge}</span>
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </Link>
            ))}
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-2">Member Resources</h2>
            <p className="text-muted-foreground">Sign up free to access the full platform.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MEMBER_RESOURCES.map(({ icon: Icon, title, description, href }) => (
              <Link key={title} href={href} className="group rounded-xl border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all">
                <Icon className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                <span className="text-xs text-primary font-medium mt-2 inline-block">Sign up free →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-3">About the Dataset</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            The Zolai AI project has assembled the largest digital corpus of Tedim Zolai ever created — 8.8 GB of text, 2 million sentences, 105,000+ parallel translation pairs, and 510 digitized hymns. All data is used to train AI models that understand and generate fluent Tedim Zolai.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/news/zolai-ai-dataset-milestone" className="text-sm font-medium text-primary hover:underline">Read: Dataset Milestone →</Link>
            <Link href="/news/zolai-dictionary-launch" className="text-sm font-medium text-primary hover:underline">Read: Dictionary Launch →</Link>
            <Link href="/about" className="text-sm font-medium text-primary hover:underline">About the Project →</Link>
          </div>
        </div>
      </section>
    </>
  );
}

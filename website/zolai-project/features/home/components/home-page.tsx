import Link from "next/link";
import {
  BookOpen, Brain, Search, BookMarked, Library, Languages,
  Volume2, GraduationCap, Cpu, ArrowRight, Users, Database, Globe, Zap,
} from "lucide-react";
import { SITE_CONSTANTS } from "@/lib/constants/site";
import { getHomeStats } from "@/features/home/server/stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { title: "Bible Parallel Corpus", description: "Full Tedim Zolai Bible (TDB77 + Tedim2010) aligned verse-by-verse with KJV for translation training.", href: "/signup", icon: BookOpen },
  { title: "AI Language Tutor", description: "Socratic AI tutor adapting to your CEFR level — from A1 basics to C2 mastery in Tedim Zolai.", href: "/signup", icon: Brain },
  { title: "Dictionary", description: "Searchable Zolai↔English vocabulary with part-of-speech, definitions, synonyms, and examples.", href: "/search", icon: Search },
  { title: "Linguistics Wiki", description: "Structured grammar rules, phonology, morphology, and dialect notes for Tedim Zolai.", href: "/signup", icon: Library },
  { title: "Grammar Reference", description: "Browse phonology, morphology, syntax, and semantics rules for Tedim Zolai.", href: "/posts/zolai-grammar-basics", icon: BookMarked },
  { title: "AI Training Dashboard", description: "Track fine-tuning runs, dataset versions, and model checkpoints in one place.", href: "/signup", icon: Cpu },
  { title: "Structured Lessons", description: "CEFR A1–C2 lesson books with vocabulary, translation, fill-in-the-blank, and grammar exercises.", href: "/signup", icon: GraduationCap },
  { title: "Translation Tool", description: "Dictionary-based Zolai↔English translation with autocomplete and fuzzy matching.", href: "/signup", icon: Languages },
  { title: "Audio Pronunciation", description: "Listen to native Zolai word pronunciations and practice your speaking.", href: "/signup", icon: Volume2 },
];

export async function HomePage() {
  const { stats, wikiCount, bibleCount, vocabCount } = await getHomeStats();
  const datasetSize = stats.find((s) => s.label === "dataset_size")?.value ?? "—";

  const statCards = [
    { label: "Dataset Records", value: typeof datasetSize === "number" ? datasetSize.toLocaleString() : datasetSize, icon: Database },
    { label: "Bible Verses", value: bibleCount.toLocaleString(), icon: BookOpen },
    { label: "Wiki Entries", value: wikiCount.toLocaleString(), icon: Globe },
    { label: "Vocab Words", value: vocabCount.toLocaleString(), icon: Search },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-rose-900 py-24 px-4">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-amber-400 to-green-500" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <Badge variant="outline" className="border-red-400/50 text-red-100 bg-red-900/40 gap-1.5 px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
            Open-source language preservation
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            {SITE_CONSTANTS.name}
          </h1>
          <p className="text-lg sm:text-xl text-red-100/90 max-w-2xl leading-relaxed">
            The Zomi people&apos;s AI Second Brain — preserving, digitizing, and teaching the{" "}
            <span className="text-amber-300 font-medium">Tedim Zolai</span> language through
            open-source LLMs and community-built datasets.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <Button asChild size="lg" className="bg-white text-red-950 hover:bg-white/90 font-semibold shadow-lg">
              <Link href="/signup">Get Started <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
            </Button>
            <Button asChild size="lg" className="bg-transparent border border-white/70 text-white hover:bg-white/10 hover:border-white shadow-none">
              <Link href="/signup">Try the Tutor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-muted/30 border-b" aria-label="Platform statistics">
        <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border bg-card p-5 text-center shadow-sm">
              <Icon className="h-5 w-5 mx-auto mb-2 text-primary" aria-hidden="true" />
              <div className="text-2xl sm:text-3xl font-bold text-primary">{value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need to learn Zolai</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            From AI-powered tutoring to a full linguistic corpus — all in one platform.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-xl border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-4">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-red-950 via-red-900 to-rose-900">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-5">
          <Users className="h-10 w-10 text-white/80" aria-hidden="true" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Join the mission</h2>
          <p className="text-red-100/90 leading-relaxed">
            Help ensure the Zolai language thrives in the AI era. Sign up to access the tutor,
            contribute to the dataset, and track model training.
          </p>
          <Button asChild size="lg" className="bg-white text-red-950 hover:bg-red-50 font-semibold shadow-lg">
            <Link href="/signup">Create an account <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
          </Button>
        </div>
      </section>

      {/* Mission strip */}
      <section className="py-6 px-4 border-t bg-muted/20">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          {[
            { icon: Zap, text: "Open-source & community-driven" },
            { icon: Globe, text: "Tedim Zolai dialect (ZVS)" },
            { icon: Database, text: "100M+ corpus tokens" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

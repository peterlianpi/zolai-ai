import type { Metadata } from "next";
import Link from "next/link";
import { getSiteConfig } from "@/lib/site-config";
import { SITE_CONSTANTS } from "@/lib/constants/site";
import { getHomeStats } from "@/features/home/server/stats";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  return {
    title: `${siteConfig.name} — Zomi Language Second Brain`,
    description: siteConfig.description || SITE_CONSTANTS.description,
  };
}

export default async function HomePage() {
  const { stats, wikiCount, bibleCount, vocabCount } = await getHomeStats();
  const datasetSize = stats.find((s) => s.label === "dataset_size")?.value ?? "—";

  return (
    <div className="flex flex-col gap-20 py-16 px-4 max-w-5xl mx-auto">
      {/* Hero */}
      <section className="text-center flex flex-col items-center gap-6 py-20 px-4 bg-gradient-to-br from-red-950 via-red-900 to-rose-900 rounded-2xl">
        <div className="inline-flex items-center gap-2 bg-red-900/50 border border-red-700 rounded-full px-4 py-1.5 text-red-100 text-sm">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          Open-source language preservation
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-white">{SITE_CONSTANTS.name}</h1>
        <p className="text-xl text-red-100 max-w-2xl">
          The Zomi people&apos;s AI Second Brain — preserving, digitizing, and teaching the Zolai language
          through open-source LLMs and community-built datasets.
        </p>
        <div className="flex gap-4 mt-2">
          <Link
            href="/signup"
            className="rounded-md bg-white text-red-950 px-6 py-2.5 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/tutor"
            className="rounded-md border border-red-400 text-white px-6 py-2.5 text-sm font-semibold hover:bg-red-900/50 transition-colors"
          >
            Try the Tutor
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
        {[
          { label: "Dataset Records", value: typeof datasetSize === "number" ? datasetSize.toLocaleString() : datasetSize, color: "text-red-700 dark:text-red-400" },
          { label: "Bible Verses", value: bibleCount.toLocaleString(), color: "text-yellow-600 dark:text-yellow-400" },
          { label: "Wiki Entries", value: wikiCount.toLocaleString(), color: "text-green-700 dark:text-green-400" },
          { label: "Vocab Words", value: vocabCount.toLocaleString(), color: "text-red-600 dark:text-red-300" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border bg-card p-6">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-sm text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-center">Everything you need to learn Zolai</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Bible Parallel Corpus", description: "Full Tedim Zolai Bible (TDB77 + Tedim2010) aligned verse-by-verse with KJV for translation training.", href: "/bible", icon: "📖" },
            { title: "Language Tutor", description: "AI-powered Socratic tutor adapting to your CEFR level — from A1 basics to C2 mastery.", href: "/tutor", icon: "🎓" },
            { title: "Dictionary", description: "Searchable Zolai↔English vocabulary with part-of-speech, definitions, and examples.", href: "/dictionary", icon: "📚" },
            { title: "Linguistics Wiki", description: "Structured grammar rules, phonology, morphology, and dialect notes for Tedim Zolai.", href: "/wiki", icon: "🔬" },
            { title: "Grammar Reference", description: "Browse phonology, morphology, syntax, and semantics rules for Tedim Zolai.", href: "/grammar", icon: "📝" },
            { title: "AI Training Dashboard", description: "Track fine-tuning runs, dataset versions, and model checkpoints in one place.", href: "/training", icon: "🤖" },
            { title: "Structured Lessons", description: "CEFR A1–C2 lesson books with vocabulary, translation, fill-in-the-blank, and grammar exercises.", href: "/learn", icon: "📗" },
            { title: "Translation Tool", description: "Dictionary-based Zolai↔English translation with autocomplete and fuzzy matching.", href: "/translate", icon: "🔄" },
            { title: "Audio Pronunciation", description: "Listen to native Zolai word pronunciations and practice your speaking.", href: "/audio", icon: "🔊" },
          ].map(({ title, description, href, icon }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-xl border bg-card p-6 hover:border-red-400 hover:shadow-md hover:shadow-red-100 dark:hover:shadow-red-950 transition-all"
            >
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-semibold text-base mb-2 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center rounded-2xl bg-gradient-to-br from-red-950 via-red-900 to-rose-900 p-12 flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Join the mission</h2>
        <p className="text-red-100 max-w-lg">
          Help ensure the Zolai language thrives in the AI era. Sign up to access the tutor,
          contribute to the dataset, and track model training.
        </p>
        <Link
          href="/signup"
          className="rounded-md bg-white text-red-950 px-8 py-3 text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          Create an account
        </Link>
      </section>
    </div>
  );
}

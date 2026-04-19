import Link from "next/link";
import { SITE_CONSTANTS } from "@/lib/constants/site";
import { getHomeStats } from "@/features/home/server/stats";
import { Hero } from "@/features/templates/components";

export async function HomePage() {
  const { stats, wikiCount, bibleCount, vocabCount } = await getHomeStats();
  const datasetSize = stats.find((s) => s.label === "dataset_size")?.value ?? "—";

  return (
    <>
      <Hero
        variant="simple"
        title={SITE_CONSTANTS.name}
        subtitle="The Zomi people's AI Second Brain — preserving, digitizing, and teaching the Zolai language through open-source LLMs and community-built datasets."
        ctaText="Get Started"
        ctaLink="/signup"
      />

      <div className="container mx-auto px-4 py-16 max-w-6xl space-y-20">
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

        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">Everything you need to learn Zolai</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Bible Parallel Corpus", description: "Full Tedim Zolai Bible (TDB77 + Tedim2010) aligned verse-by-verse with KJV for translation training.", href: "/bible", icon: "📖" },
              { title: "Structured Lessons", description: "CEFR A1–C2 lesson books with vocabulary, translation, fill-in-the-blank, and grammar exercises.", href: "/learn", icon: "🎓" },
              { title: "Dictionary", description: "Searchable Zolai↔English vocabulary with part-of-speech, definitions, and examples.", href: "/dictionary", icon: "📚" },
              { title: "Linguistics Wiki", description: "Structured grammar rules, phonology, morphology, and dialect notes for Tedim Zolai.", href: "/wiki", icon: "🔬" },
              { title: "Grammar Reference", description: "Browse phonology, morphology, syntax, and semantics rules for Tedim Zolai.", href: "/grammar", icon: "📝" },
              { title: "AI Training Dashboard", description: "Track fine-tuning runs, dataset versions, and model checkpoints in one place.", href: "/training", icon: "🤖" },
              { title: "Translation Tool", description: "Dictionary-based Zolai↔English translation with autocomplete and fuzzy matching.", href: "/translate", icon: "🔄" },
              { title: "Audio Pronunciation", description: "Listen to native Zolai word pronunciations and practice your speaking.", href: "/audio", icon: "🔊" },
              { title: "Community Forum", description: "Connect with other learners, ask questions, and share your progress.", href: "/forum", icon: "💬" },
            ].map(({ title, description, href, icon }) => (
              <Link key={title} href={href} className="group rounded-xl border bg-card p-6 hover:border-primary hover:shadow-md transition-all">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="text-center rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-12 flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold">Join the mission</h2>
          <p className="text-muted-foreground max-w-lg">
            Help ensure the Zolai language thrives in the AI era. Sign up to access lessons,
            contribute to the dataset, and track model training.
          </p>
          <Link href="/signup" className="rounded-md bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors">
            Create an account
          </Link>
        </section>
      </div>
    </>
  );
}

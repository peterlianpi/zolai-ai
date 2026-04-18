import Link from "next/link";
import { BookOpen, GraduationCap, Library, Cpu, Database, Globe, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: BookOpen, title: "Bible Corpus", description: "5 Tedim Zolai Bible versions (TB77, TBR17, Tedim1932, Tedim2010, KJV) — 31,102 verses aligned in parallel. The largest single source of standardized written Zolai." },
  { icon: GraduationCap, title: "AI Language Tutor", description: "An AI-powered tutor teaching Tedim Zolai using CEFR A1–C2 levels, Socratic questioning, and real-world conversational practice. Sign in to access." },
  { icon: Library, title: "Linguistics Wiki", description: "A living reference for Zolai grammar rules, phonology, morphology, SOV word order, pronoun system, and dialect notes — built collaboratively." },
  { icon: Database, title: "24,000-Word Dictionary", description: "Searchable Zolai↔English dictionary with definitions, part-of-speech tags, example sentences, synonyms, antonyms, and audio pronunciations." },
  { icon: Cpu, title: "AI Training Pipeline", description: "Automated pipelines to harvest, clean, and standardize Zolai text data — 2 million sentences, 8.8 GB corpus — then fine-tune open-source LLMs." },
  { icon: Globe, title: "Parallel Translation Pairs", description: "105,000+ parallel Zolai↔English translation pairs from the Bible, news, and synthetic data — used to train bilingual AI models." },
];

const STATS = [
  { value: "24,000+", label: "Dictionary words" },
  { value: "2M+", label: "Zolai sentences" },
  { value: "105K+", label: "Translation pairs" },
  { value: "510", label: "Tedim hymns" },
  { value: "5", label: "Bible versions" },
  { value: "8.8 GB", label: "Text corpus" },
];

export function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">About Zolai AI</h1>
        {/* Stats */}
        <section className="mb-10" aria-label="Project statistics">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label} className="rounded-xl border bg-card p-3 sm:p-4">
                <div className="text-base sm:text-2xl font-bold text-primary leading-tight break-words">{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We are building a fully capable <strong>Zolai AI Second Brain</strong> — digitizing, standardizing, and preserving the Tedim Zolai language through automated data-harvesting pipelines, high-purity bilingual datasets, and fine-tuned large language models. Our goal: every Zomi person can learn, work, and interact with cutting-edge AI entirely in their native tongue.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Tedim Zolai (ISO 639-3: <code className="text-xs bg-muted px-1 py-0.5 rounded">ctd</code>) is a Kuki-Chin language of the Tibeto-Burman family, spoken by approximately 300,000–500,000 people across Myanmar, northeast India, and the global diaspora. It uses SOV word order and a Latin script standardized through the ZVS (Zolai Vocabulary Standard).
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Every script, dataset, and model we build is designed to be open, reproducible, and community-driven — so that language preservation is not a one-time project but a living, growing effort.
          </p>
        </section>

        {/* The Zomi People */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">The Zomi People</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            <strong>Zomi</strong> (Zo + mi = &ldquo;Zo people&rdquo;) are a Tibeto-Burman ethnic group whose ancestor is Zo. They primarily inhabit Chin State, Myanmar, Manipur and Mizoram in northeast India, and southeastern Bangladesh. A large diaspora of 12,000–15,000 lives in Tulsa, Oklahoma, USA — known as &ldquo;Zomi Town.&rdquo;
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The legendary ancestral homeland is <strong>Ciimnuai</strong> — the &ldquo;Mother City&rdquo; of the Zomi clans, settled around AD 1420. Around AD 1550, Pu Gui Mang founded Tedim, which became the cultural and linguistic center of the Zomi world. Pre-literate history was preserved through <em>La</em> (songs), <em>Pasaltit</em> (warrior poetry), and <em>Khanggui</em> (genealogy records).
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button asChild variant="outline" size="sm">
              <Link href="/posts/who-are-the-zomi-people">Read: Who Are the Zomi? →</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/posts/zolai-language-history">Read: Language History →</Link>
            </Button>
          </div>
        </section>

        {/* Feature cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">What We&apos;re Building</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-gradient-to-br from-red-950 via-red-900 to-rose-900 p-8 text-center">
          <Users className="h-8 w-8 text-red-200 mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-lg font-semibold mb-2 text-white">Join the Mission</h2>
          <p className="text-sm text-red-100 mb-6 max-w-lg mx-auto">
            All datasets, training scripts, and tooling are open source. Contributions from linguists, developers, and Zolai speakers are welcome.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild size="sm" className="bg-white text-red-900 hover:bg-red-50">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-red-200 text-red-50 hover:bg-red-800/50 hover:text-white">
              <Link href="/community">Join Community</Link>
            </Button>
          </div>
        </section>
    </main>
  );
}

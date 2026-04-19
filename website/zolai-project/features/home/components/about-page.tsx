import Link from "next/link";
import { Brain, BookOpen, GraduationCap, Library, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Bible Corpus",
    description:
      "A high-quality Tedim Zolai Bible dataset — the largest single source of standardized written Zolai — cleaned and structured for AI training.",
  },
  {
    icon: GraduationCap,
    title: "Structured Lessons",
    description:
      "CEFR-aligned lesson books with vocabulary, translation, fill-in-the-blank, and grammar exercises for systematic language learning.",
  },
  {
    icon: Library,
    title: "Linguistics Wiki",
    description:
      "A living reference for Zolai grammar rules, phonology, morphology, and dialect notes — built collaboratively and version-controlled.",
  },
  {
    icon: Cpu,
    title: "AI Training",
    description:
      "Automated pipelines to harvest, clean, and standardize Zolai text data, then fine-tune open-source LLMs to understand and generate fluent Zolai.",
  },
];

export function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-6xl">
      {/* Hero */}
      <div className="text-center mb-16 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 py-16 px-8">
        <div className="flex justify-center mb-4">
          <Brain className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Preserving the Zolai Language</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          The Zomi people of Myanmar and the Chin Hills speak Tedim Zolai — a rich, living language at risk of being
          left behind in the AI era. Zolai AI exists to change that.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We are building a fully capable <strong>Zolai AI Second Brain</strong> — digitizing, standardizing, and
          preserving the Tedim Chin language through automated data-harvesting pipelines, high-purity bilingual
          datasets, and fine-tuned large language models. Our goal is for the Zomi people to learn, work, and
          interact with cutting-edge AI entirely in their native tongue.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Every script, dataset, and model we build is designed to be open, reproducible, and community-driven —
          so that language preservation is not a one-time project but a living, growing effort.
        </p>
      </section>

      {/* Feature cards */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">What We&apos;re Building</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5 text-primary shrink-0" />
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

      {/* Open source note */}
      <section className="rounded-2xl bg-gradient-to-br from-red-950 via-red-900 to-rose-900 p-8 text-center">
        <h2 className="text-lg font-semibold mb-2 text-white">Open Source</h2>
        <p className="text-sm text-red-100 mb-4">
          All datasets, training scripts, and tooling are open source. Contributions from linguists, developers,
          and Zolai speakers are welcome.
        </p>
        <Button asChild variant="outline" className="border-red-200 text-red-50 hover:bg-red-800/50 hover:text-white hover:border-red-100">
          <Link href="https://github.com/zolai-ai" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </Link>
        </Button>
      </section>
    </main>
  );
}

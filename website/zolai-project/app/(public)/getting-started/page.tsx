export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { PageTitle } from "@/features/home/components";
import { BookOpen, Users, Target, Lightbulb, Search, FileText } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  return { ...base, title: "Getting Started", description: `Start learning Tedim Zolai — your guide to the ${siteConfig.name} platform.` };
}

const STEPS = [
  { title: "Search the Dictionary", description: "Start with the free dictionary — search 24,000+ Zolai words with definitions, examples, and related words. No account needed.", icon: Search, href: "/search", cta: "Search Dictionary →" },
  { title: "Read About the Language", description: "Learn the history of Tedim Zolai, who the Zomi people are, and the basics of Zolai grammar — SOV word order, pronouns, and negation.", icon: FileText, href: "/posts", cta: "Read Articles →" },
  { title: "Create Your Account", description: "Sign up free to access the AI tutor, structured lessons (A1–C2), Bible corpus, linguistics wiki, and AI chat.", icon: Users, href: "/signup", cta: "Sign Up Free →" },
  { title: "Start Learning", description: "Use the AI tutor for Socratic practice, work through CEFR-aligned lesson books, or chat with Zolai AI in your native tongue.", icon: Target, href: "/signup", cta: "Get Started →" },
];

const TIPS = [
  { title: "Learn SOV Word Order", body: "Zolai is Subject-Object-Verb: Ka an ne hi = I food eat (I eat food). This is the most important structural difference from English." },
  { title: "Master the Pronouns", body: "kei (I/ka), na'ng (you/na), amah (he/she/a), keimahte (we/i). The agreement marker before the verb is key to fluency." },
  { title: "Use the Bible Corpus", body: "Read familiar Bible passages in Zolai to understand sentence structure. The parallel KJV alignment makes it easy to follow." },
  { title: "Practice Negation", body: "Negation uses kei after the verb: Ka pai kei hi = I do not go. For conditionals: nong pai kei a leh = if you don't go." },
  { title: "Learn the ZVS Standard", body: "Use pasian (God), gam (land), topa (Lord), tapa (son) — the Tedim ZVS dialect forms. These are the correct standard spellings." },
  { title: "Practice Daily", body: "Spend 15–30 minutes daily with the AI tutor. Consistency matters more than session length for language acquisition." },
];

export default function GettingStartedPage() {
  return (
    <>
      <PageTitle title="Getting Started" className="max-w-4xl" />

      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3">Your Journey to Learning Zolai</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Tedim Zolai is a Tibeto-Burman language spoken by the Zomi people of Myanmar, India, and the diaspora. Follow these steps to begin.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            {STEPS.map(({ title, description, icon: Icon, href, cta }, index) => (
              <div key={title} className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="font-semibold">{title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{description}</p>
                  <Link href={href} className="text-sm font-medium text-primary hover:underline">{cta}</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold mb-2">Zolai Language Tips</h2>
          <p className="text-muted-foreground mb-6">Key facts and patterns to accelerate your learning.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TIPS.map(({ title, body }) => (
              <div key={title} className="rounded-lg border bg-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <h3 className="font-semibold text-sm">{title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <BookOpen className="h-10 w-10 text-primary mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-bold mb-3">Ready to dive deeper?</h2>
          <p className="text-muted-foreground mb-6">Read our articles on Zolai grammar, the history of the Zomi people, and the Zolai AI project.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/posts/zolai-grammar-basics" className="text-sm font-medium text-primary hover:underline">Grammar Basics →</Link>
            <Link href="/posts/who-are-the-zomi-people" className="text-sm font-medium text-primary hover:underline">Who Are the Zomi? →</Link>
            <Link href="/posts/zolai-language-history" className="text-sm font-medium text-primary hover:underline">Language History →</Link>
          </div>
        </div>
      </section>
    </>
  );
}

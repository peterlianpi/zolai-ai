export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { PageTitle } from "@/features/home/components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, GraduationCap, Library, Brain, Cpu } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  return { ...base, title: "Recommended", description: "Recommended tools and resources for learning and working with Tedim Zolai" };
}

const RECOMMENDED_TOOLS = [
  { title: "Zolai AI Tutor", description: "Our AI-powered Socratic tutor that adapts to your learning level and provides personalized guidance.", icon: Brain, href: "/tutor", category: "AI Tools" },
  { title: "Zolai Dictionary", description: "The most comprehensive Zolai↔English dictionary with over 152,000 entries and semantic relationships.", icon: BookOpen, href: "/dictionary", category: "Reference" },
  { title: "Bible Corpus", description: "Parallel Bible in Tedim Zolai with multiple translations for comparison and learning.", icon: FileText, href: "/bible", category: "Reference" },
  { title: "Linguistics Wiki", description: "Community-maintained reference for Zolai grammar, phonology, and morphology.", icon: Library, href: "/wiki", category: "Reference" },
  { title: "Training Dashboard", description: "Track our Qwen2.5-3B-Instruct QLoRA fine-tuning progress — 75k+ samples trained, val loss 2.74 and improving.", icon: Cpu, href: "/training", category: "Developer" },
  { title: "Translation Tool", description: "Fast dictionary-based translation with autocomplete and fuzzy matching for Zolai↔English.", icon: GraduationCap, href: "/translate", category: "Tools" },
];

const EXTERNAL_RESOURCES = [
  { title: "Zolai LoRA Adapter (HF Hub)", description: "Our fine-tuned Qwen2.5-3B LoRA adapter trained on 75k+ Zolai samples. Download and use with PEFT.", icon: "🤗", href: "https://huggingface.co/peterpausianlian/zolai-qwen2.5-3b-lora", category: "AI Model" },
  { title: "Zolai Training Dataset (Kaggle)", description: "5.1M Zolai sentences used for LLM fine-tuning. Includes train/val splits.", icon: "📊", href: "https://www.kaggle.com/datasets/peterpausianlian/zolai-llm-training-dataset", category: "Dataset" },
  { title: "GitHub Repository", description: "All datasets, training scripts, and tooling are open source. Contributions welcome!", icon: "⚙️", href: "https://github.com/zolai-ai", category: "Open Source" },
  { title: "Zomi Language Resources", description: "External links to Zomi language learning materials and community resources.", icon: "🌐", href: "https://github.com/zolai-ai/resources", category: "Community" },
];

export default function RecommendedPage() {
  return (
    <>
      <PageTitle title="Recommended" className="max-w-5xl" />

      <section className="py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-2">Featured Tools</h2>
            <p className="text-muted-foreground mb-6">Our recommended tools and resources for learning and working with Tedim Zolai.</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {RECOMMENDED_TOOLS.map(({ title, description, icon: Icon, href, category }) => (
                <Link key={title} href={href}
                  className="group rounded-xl border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <Badge variant="secondary" className="text-xs">{category}</Badge>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">External Resources</h2>
            <p className="text-muted-foreground mb-6">Additional resources from the Zomi community and open-source projects.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {EXTERNAL_RESOURCES.map(({ title, description, icon, href, category }) => (
                <Link key={title} href={href} target="_blank" rel="noopener noreferrer"
                  className="group rounded-lg border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg" aria-hidden="true">{icon}</span>
                    <Badge variant="secondary" className="text-xs">{category}</Badge>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-gradient-to-br from-red-950 via-red-900 to-rose-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Have a resource to recommend?</h2>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            We&apos;re always looking to expand our collection of tools and resources for Tedim Zolai.
          </p>
          <Button asChild className="bg-white text-red-950 hover:bg-red-50 font-semibold">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

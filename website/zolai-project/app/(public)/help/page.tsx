export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { PageTitle } from "@/features/home/components";
import { HelpCircle, MessageCircle, Mail, ExternalLink } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  return { ...base, title: "Help & Support", description: `Get help and support for using ${siteConfig.name}` };
}

const FAQ_ITEMS = [
  { question: "What is Zolai AI?", answer: "Zolai AI is a comprehensive platform for learning and preserving the Tedim Zolai language through AI-powered tools, including a dictionary, tutor, Bible corpus, and linguistics wiki." },
  { question: "Is Zolai AI free to use?", answer: "Yes, Zolai AI is completely free and open-source. All our datasets, training scripts, and tools are available for everyone to use and contribute to." },
  { question: "How accurate is the AI tutor?", answer: "Our AI tutor is trained on high-quality Zolai datasets and follows strict linguistic rules for Tedim dialect. It adapts to CEFR levels A1–C2 and uses Socratic questioning methods." },
  { question: "Can I contribute to the project?", answer: "Absolutely! You can contribute by adding to the linguistics wiki, reporting errors, suggesting improvements, or contributing code on our GitHub repository." },
];

const SUPPORT_CARDS = [
  { href: "/contact", icon: Mail, title: "Contact Us", description: "Send us a message with your questions" },
  { href: "https://github.com/zolai-ai", icon: ExternalLink, title: "GitHub Issues", description: "Report bugs or request features", external: true },
  { href: "/forum", icon: MessageCircle, title: "Community Forum", description: "Join discussions with other learners" },
];

export default function HelpPage() {
  return (
    <>
      <PageTitle title="Help & Support" className="max-w-4xl" />
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-3 mb-12">
            {SUPPORT_CARDS.map(({ href, icon: Icon, title, description, external }) => (
              <Link key={title} href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group rounded-lg border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Icon className="h-6 w-6 text-primary mb-3" aria-hidden="true" />
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map(({ question, answer }) => (
              <div key={question} className="rounded-lg border bg-card p-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold mb-2">{question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

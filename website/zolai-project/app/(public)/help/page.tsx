export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { PageLayout } from "@/features/templates/components";
import { HelpCircle, MessageCircle, Mail, ExternalLink } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  const description = `Get help and support for using Zolai`;
  return {
    ...base,
    title: "Help & Support",
    description,
    openGraph: {
      ...base.openGraph,
      title: "Help & Support",
      description,
    },
    twitter: {
      ...base.twitter,
      title: "Help & Support",
      description,
    },
  };
}

const FAQ_ITEMS = [
  {
    question: "What is Zolai?",
    answer: "Zolai is a comprehensive platform for learning and preserving the Tedim Zolai language through AI-powered tools, including a dictionary, lessons, Bible corpus, and linguistics wiki.",
  },
  {
    question: "Is Zolai free to use?",
    answer: "Yes, Zolai is completely free and open-source. All our datasets, training scripts, and tools are available for everyone to use and contribute to.",
  },
  {
    question: "How do I get started?",
    answer: "Create a free account, explore the dictionary, take structured lessons, and use the Bible corpus and wiki for reference. Check our Getting Started guide for more details.",
  },
  {
    question: "Can I contribute to the project?",
    answer: "Absolutely! You can contribute by adding to the linguistics wiki, reporting errors, suggesting improvements, or contributing code on our GitHub repository.",
  },
];

export default function HelpPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Help" }]}
      pageHeader={{
        title: "Help & Support",
        description: "Find answers to common questions and get support",
      }}
      layout={{ maxWidth: "xl", padding: "lg" }}
    >
      <div className="space-y-12">
        <div className="grid gap-6 sm:grid-cols-3">
          <Link href="/contact" className="group rounded-lg border bg-card p-6 hover:border-primary hover:shadow-md transition-all">
            <Mail className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">Contact Us</h3>
            <p className="text-sm text-muted-foreground">Send us a message with your questions</p>
          </Link>
          <Link href="https://github.com/zolai-ai" target="_blank" className="group rounded-lg border bg-card p-6 hover:border-primary hover:shadow-md transition-all">
            <ExternalLink className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">GitHub Issues</h3>
            <p className="text-sm text-muted-foreground">Report bugs or request features</p>
          </Link>
          <Link href="/forum" className="group rounded-lg border bg-card p-6 hover:border-primary hover:shadow-md transition-all">
            <MessageCircle className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">Community Forum</h3>
            <p className="text-sm text-muted-foreground">Join discussions with other learners</p>
          </Link>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map(({ question, answer }) => (
              <div key={question} className="rounded-lg border bg-card p-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">{question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

// import { notFound } from "next/navigation";
import Link from "next/link";
import { getGrammarEntryBySlug } from "@/features/grammar/server/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function GrammarEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await getGrammarEntryBySlug(slug);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/grammar?sub=${entry.category}`}><ArrowLeft className="w-4 h-4 mr-1" />Back to {entry.category}</Link>
      </Button>

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="capitalize">{entry.category}</Badge>
          {entry.tags.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
        </div>
        <h1 className="text-3xl font-bold">{entry.title}</h1>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
        {entry.content}
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default async function WikiEntryPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;

  const [entry, related] = await Promise.all([
    prisma.wikiEntry.findUnique({ where: { slug } }),
    prisma.wikiEntry.findMany({
      where: { category, slug: { not: slug }, status: "published" },
      select: { slug: true, title: true, tags: true },
      take: 6,
      orderBy: { title: "asc" },
    }),
  ]);

  if (!entry || entry.category !== category) notFound();

  // Build simple TOC from lines starting with # or ##
  const toc = entry.content
    .split("\n")
    .filter(l => /^#{1,2}\s/.test(l))
    .map(l => ({ text: l.replace(/^#+\s/, ""), level: l.startsWith("##") ? 2 : 1 }));

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/wiki/${category}`}><ArrowLeft className="w-4 h-4 mr-1" />Back to {category}</Link>
          </Button>

          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="capitalize">{entry.category}</Badge>
              {entry.tags.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
              <span className="text-xs text-muted-foreground ml-auto">Updated {format(entry.updatedAt, "MMM d, yyyy")}</span>
            </div>
            <h1 className="text-3xl font-bold">{entry.title}</h1>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed border rounded-xl p-6 bg-card">
            {entry.content}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-56 shrink-0 space-y-4 hidden lg:block">
          {toc.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Contents</CardTitle></CardHeader>
              <CardContent className="space-y-1 pt-0">
                {toc.map((h, i) => (
                  <p key={i} className={`text-xs truncate ${h.level === 2 ? "pl-3 text-muted-foreground" : "font-medium"}`}>{h.text}</p>
                ))}
              </CardContent>
            </Card>
          )}

          {related.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Related</CardTitle></CardHeader>
              <CardContent className="space-y-1 pt-0">
                {related.map(r => (
                  <Link key={r.slug} href={`/wiki/${category}/${r.slug}`}
                    className="flex items-center gap-1 text-xs hover:text-primary transition-colors py-0.5">
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <span className="truncate">{r.title}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

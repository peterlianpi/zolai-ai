import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getGrammarEntries, getGrammarCategoryCounts, GRAMMAR_CATEGORIES } from "@/features/grammar/server/queries";

export default async function GrammarPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string }>;
}) {
  const { sub } = await searchParams;

  const [entries, counts] = await Promise.all([
    getGrammarEntries(sub),
    getGrammarCategoryCounts(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Grammar Reference</h1>
        <span className="text-sm text-muted-foreground">{entries.length} entries</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link href="/grammar" className={`text-xs px-3 py-1.5 rounded-md border ${!sub ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>All</Link>
        {GRAMMAR_CATEGORIES.map((cat) => {
          const count = counts.find((c) => c.category === cat)?._count.id ?? 0;
          return (
            <Link key={cat} href={`/grammar?sub=${cat}`}
              className={`text-xs px-3 py-1.5 rounded-md border capitalize ${sub === cat ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
              {cat} {count > 0 && `(${count})`}
            </Link>
          );
        })}
      </div>

      {entries.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">No grammar entries yet.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <Link key={e.id} href={`/grammar/${e.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{e.title}</CardTitle>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="secondary" className="capitalize text-xs">{e.category}</Badge>
                      {e.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{e.content}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

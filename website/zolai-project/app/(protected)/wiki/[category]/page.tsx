import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { notFound } from "next/navigation";
import Link from "next/link";
import { getWikiEntriesByCategory } from "@/features/zolai/server/queries";

export default async function WikiCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const entries = await getWikiEntriesByCategory(category);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold capitalize">{category}</h1>
      <div className="space-y-3">
        {entries.map((e) => (
          <Link key={e.id} href={`/wiki/${category}/${e.slug}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{e.title}</CardTitle>
                  <div className="flex gap-1 flex-wrap">
                    {e.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{e.content}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

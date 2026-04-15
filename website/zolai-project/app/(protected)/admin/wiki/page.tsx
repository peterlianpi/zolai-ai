import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function AdminWikiPage() {
  const entries = await prisma.wikiEntry.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, category: true, status: true, tags: true, updatedAt: true },
  });

  const byCategory = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wiki Entries</h1>
        <span className="text-sm text-muted-foreground">{entries.length} total</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(byCategory).map(([cat, count]) => (
          <Badge key={cat} variant="secondary" className="capitalize">{cat}: {count}</Badge>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>All Entries</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{e.category} · {new Date(e.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={e.status === "published" ? "default" : "secondary"}>{e.status}</Badge>
                  {e.tags.slice(0, 2).map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                  <Link href={`/admin/wiki/${e.id}/edit`} className="text-xs text-primary hover:underline ml-2">Edit</Link>
                </div>
              </div>
            ))}
            {entries.length === 0 && <p className="text-sm text-muted-foreground">No wiki entries yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

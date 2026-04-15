import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getWikiCategories } from "@/features/zolai/server/queries";

export default async function WikiPage() {
  const entries = await getWikiCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Zolai Wiki</h1>
        <span className="text-sm text-muted-foreground">{entries.reduce((a, e) => a + e._count.id, 0)} entries</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((e) => (
          <Link key={e.category} href={`/wiki/${e.category}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-base capitalize">{e.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{e._count.id} entries</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

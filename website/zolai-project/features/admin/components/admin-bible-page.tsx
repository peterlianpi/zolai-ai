import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";

interface Props {
  book?: string;
  q?: string;
}

export async function AdminBiblePage({ book, q }: Props) {
  const [bookStats, sample] = await Promise.all([
    prisma.bibleVerse.groupBy({
      by: ["book", "testament"],
      _count: { id: true },
      orderBy: { book: "asc" },
    }),
    prisma.bibleVerse.findMany({
      where: {
        ...(book && { book }),
        ...(q && {
          OR: [
            { tdb77: { contains: q, mode: "insensitive" } },
            { tedim2010: { contains: q, mode: "insensitive" } },
            { kjv: { contains: q, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: [{ book: "asc" }, { chapter: "asc" }, { verse: "asc" }],
      take: 50,
    }),
  ]);

  const total = bookStats.reduce((s, b) => s + b._count.id, 0);
  const ot = bookStats.filter(b => b.testament === "OT");
  const nt = bookStats.filter(b => b.testament === "NT");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bible Corpus</h1>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>{total.toLocaleString()} verses</span>
          <span>·</span>
          <span>{bookStats.length} books</span>
        </div>
      </div>

      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search verse text…" className="flex-1 rounded-md border px-3 py-2 text-sm bg-background" />
        <select name="book" defaultValue={book ?? ""} className="rounded-md border px-3 py-2 text-sm bg-background">
          <option value="">All books</option>
          {bookStats.map(b => <option key={b.book} value={b.book}>{b.book}</option>)}
        </select>
        <button type="submit" className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm">Search</button>
      </form>

      {!q && !book && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[{ label: "Old Testament", books: ot }, { label: "New Testament", books: nt }].map(({ label, books }) => (
            <Card key={label}>
              <CardHeader><CardTitle className="text-base">{label} — {books.reduce((s, b) => s + b._count.id, 0).toLocaleString()} verses</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {books.map(b => (
                    <a key={b.book} href={`/admin/bible?book=${b.book}`} className="text-xs px-2 py-1 rounded border hover:bg-muted">
                      {b.book} <span className="text-muted-foreground">{b._count.id}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(q || book) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{sample.length} results {book && `in ${book}`} {q && `for "${q}"`}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sample.map(v => (
                <div key={v.id} className="border-b pb-3 last:border-0 text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{v.book} {v.chapter}:{v.verse}</Badge>
                    <Badge variant="secondary" className="text-xs">{v.testament}</Badge>
                  </div>
                  {v.tdb77 && <p><span className="text-xs text-muted-foreground font-medium">TDB77: </span>{v.tdb77}</p>}
                  {v.tedim2010 && <p><span className="text-xs text-muted-foreground font-medium">T2010: </span>{v.tedim2010}</p>}
                  {v.tbr17 && <p><span className="text-xs text-muted-foreground font-medium">TBR17: </span>{v.tbr17}</p>}
                  {v.kjv && <p className="text-muted-foreground italic text-xs">{v.kjv}</p>}
                </div>
              ))}
              {sample.length === 0 && <p className="text-sm text-muted-foreground">No results.</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

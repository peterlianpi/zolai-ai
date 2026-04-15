import Link from "next/link";
import { getBibleBooks } from "@/features/zolai/server/queries";
import { OT_BOOKS, NT_BOOKS } from "@/features/bible/types";
import { BookOpen } from "lucide-react";

function BookGrid({ list, label, bookMap }: { list: string[]; label: string; bookMap: Record<string, number> }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wide mb-3">{label}</h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {list.map(book => {
          const count = bookMap[book];
          const display = book.replace(/(\d)([A-Z])/g, "$1 $2");
          return (
            <Link
              key={book}
              href={`/bible/${book}`}
              className={`rounded-xl border p-2.5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all ${!count ? "opacity-30 pointer-events-none" : ""}`}
            >
              <p className="text-xs font-semibold leading-tight">{display}</p>
              {count && <p className="text-[10px] text-muted-foreground mt-0.5">{count.toLocaleString()}v</p>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default async function BiblePage() {
  const books = await getBibleBooks();

  const bookMap = Object.fromEntries(books.map(b => [b.book, b._count.id]));
  const totalVerses = books.reduce((s, b) => s + b._count.id, 0);

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6" />Zolai Bible Corpus
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {books.length} books · {totalVerses.toLocaleString()} verses · TDB77 + TBR17 + Tedim 2010 + KJV parallel
        </p>
        <p className="text-xs text-muted-foreground mt-2 border rounded-lg px-3 py-2 bg-muted/40 max-w-xl">
          ⚠️ This corpus is used for linguistic research and language preservation. Full chapter access requires a registered account. Reproduction or redistribution of copyrighted translations (TDB77, TBR17) is not permitted. KJV is public domain.
        </p>
      </div>
      <BookGrid list={OT_BOOKS} label="Old Testament" bookMap={bookMap} />
      <BookGrid list={NT_BOOKS} label="New Testament" bookMap={bookMap} />
    </div>
  );
}

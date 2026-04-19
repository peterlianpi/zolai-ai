"use client";
import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BibleReader } from "@/features/bible/components/bible-reader";

export default function BookPage({ params }: { params: Promise<{ book: string }> }) {
  const { book } = use(params);
  const displayName = book.replace(/(\d)([A-Z])/g, "$1 $2"); // "1Samuel" → "1 Samuel"

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/bible">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />All Books</Button>
        </Link>
        <h1 className="text-xl font-bold">{displayName}</h1>
      </div>
      <BibleReader book={book} />
    </div>
  );
}

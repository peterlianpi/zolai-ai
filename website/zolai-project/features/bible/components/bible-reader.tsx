"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useBibleChapters, useBibleVerses } from "../hooks";
import { useSession } from "@/lib/auth-client";
import type { BibleVersion } from "../types";
import { VERSION_LABELS } from "../types";

const VERSIONS: BibleVersion[] = ["tdb77", "tbr17", "tedim2010", "kjv"];
const PREVIEW_LIMIT = 5;

interface Props { book: string }

export function BibleReader({ book }: Props) {
  const [chapter, setChapter] = useState(1);
  const [versions, setVersions] = useState<BibleVersion[]>(["tdb77", "kjv"]);
  const { data: session } = useSession();
  const isAuth = !!session?.user;

  const { data: chapters, isLoading: chapLoading } = useBibleChapters(book);
  const { data: verses = [], isLoading } = useBibleVerses(book, chapter);
  const maxChapter = chapters?.length ? Math.max(...chapters) : 1;

  function toggleVersion(v: BibleVersion) {
    setVersions(prev =>
      prev.includes(v) ? prev.length > 1 ? prev.filter(x => x !== v) : prev : [...prev, v]
    );
  }

  const visibleVerses = isAuth ? verses : verses.slice(0, PREVIEW_LIMIT);
  const hasMore = !isAuth && verses.length >= PREVIEW_LIMIT;

  return (
    <div className="space-y-4">
      {/* Version toggles */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground font-medium">Show:</span>
        {VERSIONS.map(v => (
          <button key={v} onClick={() => toggleVersion(v)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${versions.includes(v) ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted border-border"}`}>
            {VERSION_LABELS[v]}
          </button>
        ))}
      </div>

      {/* Chapter navigation */}
      {chapLoading ? <Skeleton className="h-10 w-full rounded-xl" /> : (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={chapter <= 1} onClick={() => setChapter(c => c - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {(chapters ?? []).map(ch => (
                <button key={ch} onClick={() => setChapter(ch)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors shrink-0 ${ch === chapter ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  {ch}
                </button>
              ))}
            </div>
          </div>
          <Button variant="outline" size="sm" disabled={chapter >= maxChapter} onClick={() => setChapter(c => c + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Verses */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : verses.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground">No verses found for {book} {chapter}.</p>
      ) : (
        <div className="space-y-2">
          {visibleVerses.map(v => (
            <div key={v.id} className="rounded-xl border overflow-hidden">
              <div className="px-3 py-1.5 bg-muted/40 border-b flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{v.book} {v.chapter}:{v.verse}</Badge>
              </div>
              <div className="grid divide-y sm:divide-y-0 sm:divide-x" style={{ gridTemplateColumns: `repeat(${versions.length}, 1fr)` }}>
                {versions.map(ver => (
                  <div key={ver} className="p-3 space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{VERSION_LABELS[ver]}</p>
                    <p className={`text-sm leading-relaxed ${!v[ver] ? "text-muted-foreground italic" : ""}`}>{v[ver] ?? "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Login gate */}
          {hasMore && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10 pointer-events-none" />
              <div className="rounded-xl border p-8 text-center space-y-3 bg-muted/30">
                <Lock className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="font-semibold">Sign in to read the full chapter</p>
                <p className="text-sm text-muted-foreground">
                  The Tedim Zolai Bible corpus is available to registered users for study and research purposes.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button asChild><Link href="/login">Sign in</Link></Button>
                  <Button variant="outline" asChild><Link href="/signup">Create account</Link></Button>
                </div>
              </div>
            </div>
          )}

          {/* Copyright notice */}
          <p className="text-xs text-muted-foreground text-center pt-2">
            Tedim Bible corpus for study and research. All rights reserved by respective publishers.
          </p>
        </div>
      )}
    </div>
  );
}

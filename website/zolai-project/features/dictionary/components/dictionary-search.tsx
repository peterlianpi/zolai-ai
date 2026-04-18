"use client";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WordCard } from "./word-card";
import { useDictSearch } from "../hooks";
import { ArrowLeft, ArrowRight, Search, ArrowLeftRight } from "lucide-react";
import type { SearchLang, DictWord } from "../types";

const LANG_CYCLE: SearchLang[] = ["both", "zolai", "english"];
const LANG_LABEL: Record<SearchLang, string> = { both: "ZO + EN", zolai: "ZO → EN", english: "EN → ZO" };

export function DictionarySearch() {
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");   // debounced query
  const [lang, setLang] = useState<SearchLang>("both");
  const [page, setPage] = useState(1);
  const timer = useRef<ReturnType<typeof setTimeout>>(null!);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setDq(q); setPage(1); }, 300);
    return () => clearTimeout(timer.current);
  }, [q]);

  const { data, isLoading, isFetching } = useDictSearch(dq, lang, page);
  const words = data?.data ?? [];
  const meta  = data?.meta;

  function cycleLang() {
    setLang(l => LANG_CYCLE[(LANG_CYCLE.indexOf(l) + 1) % 3]);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={lang === "english" ? "Search in English…" : lang === "zolai" ? "Search in Zolai…" : "Search Zolai or English…"}
            className="pl-9"
            autoFocus
          />
        </div>
        <Button variant="outline" onClick={cycleLang} className="gap-1.5 shrink-0 min-w-[90px]">
          <ArrowLeftRight className="w-3.5 h-3.5" />{LANG_LABEL[lang]}
        </Button>
      </div>

      {!dq ? (
        <p className="text-center py-10 text-muted-foreground text-sm">Type to search 24,891 Zolai words</p>
      ) : isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : words.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground">No results for &ldquo;{dq}&rdquo;</p>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{meta?.total.toLocaleString()} results</span>
            {isFetching && <span className="animate-pulse">Searching…</span>}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {words.map((w: DictWord) => <WordCard key={w.id} word={w} />)}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {meta.page} of {meta.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

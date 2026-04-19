"use client";

import { useState } from "react";
import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePublicDictionarySearch } from "@/features/dictionary/hooks/use-public-dictionary-search";
import Link from "next/link";

interface Example { en?: string; zo?: string; }

interface Entry {
  id: string;
  zolai: string;
  english: string;
  pos?: string;
  definition?: string;
  synonyms?: string[];
  antonyms?: string[];
  related?: string[];
  examples?: Example[];
}

function groupByHeadword(entries: Entry[]): Map<string, Entry[]> {
  const map = new Map<string, Entry[]>();
  for (const e of entries) {
    const key = e.zolai.toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return map;
}

const POS_COLORS: Record<string, string> = {
  n:   "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  v:   "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  adj: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  adv: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

const SKIP_DEF = ["Use '", "Noun —", "Verb —", "Adjective —", "Adverb —"];

type Lang = "zolai" | "english";

export function PublicDictionarySearch() {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<Lang>("zolai");
  const { results, loading, searched, search } = usePublicDictionarySearch();

  const handleSearch = () => search(query, lang);
  const groups = groupByHeadword(results);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <BookOpen className="h-5 w-5" />
        <span className="text-sm">Zolai ↔ English Dictionary</span>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => { setLang(l => l === "zolai" ? "english" : "zolai"); }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs text-muted-foreground hover:border-foreground transition-colors"
        >
          <span>{lang === "zolai" ? "ZO → EN" : "EN → ZO"}</span>
          <span>⇄</span>
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={lang === "english" ? "Search English..." : "Search Zolai..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {searched && (
        <div className="space-y-4">
          {results.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground">{groups.size} headword{groups.size !== 1 ? "s" : ""} · {results.length} sense{results.length !== 1 ? "s" : ""}</p>
              <div className="space-y-4">
                {[...groups.entries()].map(([, senses]) => {
                  const headword = senses[0].zolai;
                  const synonyms = [...new Set(senses.flatMap(s => s.synonyms ?? []))];
                  const antonyms = [...new Set(senses.flatMap(s => s.antonyms ?? []))];
                  const related  = [...new Set(senses.flatMap(s => s.related  ?? []))];
                  const examples = [...new Set(senses.flatMap(s => s.examples ?? []))];
                  return (
                    <div key={headword} className="rounded-xl border bg-card p-4 space-y-3">
                      <h3 className="text-xl font-bold">{headword}</h3>
                      <ol className="space-y-2">
                        {senses.map((s, i) => (
                          <li key={s.id} className="flex gap-2 items-start">
                            <span className="text-xs text-muted-foreground mt-1 w-4 shrink-0">{i + 1}.</span>
                            <div className="space-y-0.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {s.pos && <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${POS_COLORS[s.pos] ?? "bg-muted text-muted-foreground"}`}>{s.pos}</span>}
                                <span className="font-medium">{s.english}</span>
                              </div>
                              {s.definition && !SKIP_DEF.some(p => s.definition!.startsWith(p)) && (
                                <p className="text-sm text-muted-foreground">{s.definition}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                      {examples.length > 0 && (
                        <div className="text-sm text-muted-foreground italic border-l-2 border-muted pl-3">
                          {examples.slice(0, 1).map((ex, i) => (
                            <div key={i}>
                              {ex.zo && <p className="line-clamp-2">{ex.zo}</p>}
                              {ex.en && <p className="text-xs line-clamp-1 not-italic">{ex.en}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                      {(synonyms.length > 0 || antonyms.length > 0 || related.length > 0) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs pt-1 border-t">
                          {synonyms.length > 0 && <span className="text-muted-foreground"><span className="font-medium text-foreground">≈ </span>{synonyms.join(", ")}</span>}
                          {antonyms.length > 0 && <span className="text-muted-foreground"><span className="font-medium text-foreground">↔ </span>{antonyms.join(", ")}</span>}
                          {related.length > 0 && <span className="text-muted-foreground"><span className="font-medium text-foreground">→ </span>{related.join(", ")}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No results found for &quot;{query}&quot;</p>
              <p className="text-sm mt-1">Try a different spelling or search term.</p>
            </div>
          )}
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground border-t pt-4">
        For full access, <Link href="/login" className="text-primary hover:underline">sign in</Link>.
      </div>
    </div>
  );
}

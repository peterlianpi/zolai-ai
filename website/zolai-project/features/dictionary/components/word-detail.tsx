"use client";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Volume2, BookOpen, ArrowLeftRight } from "lucide-react";
import { useDictWord } from "../hooks";
import type { DictWord } from "../types";

const POS_COLORS: Record<string, string> = {
  verb: "bg-blue-100 text-blue-800", noun: "bg-green-100 text-green-800",
  adjective: "bg-purple-100 text-purple-800", adverb: "bg-orange-100 text-orange-800",
  particle: "bg-rose-100 text-rose-800",
};

function Chip({ label, href, color }: { label: string; href?: string; color: string }) {
  const cls = `inline-flex items-center text-xs px-2 py-1 rounded-lg border font-medium ${color}`;
  return href
    ? <Link href={`/dictionary?q=${encodeURIComponent(label)}`} className={cls + " hover:opacity-80"}>{label}</Link>
    : <span className={cls}>{label}</span>;
}

interface Props { id: string }

export function WordDetail({ id }: Props) {
  const { data, isLoading } = useDictWord(id);
  const w: DictWord | undefined = data?.data?.word;

  if (isLoading) return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
    </div>
  );
  if (!w) return <p className="text-center py-12 text-muted-foreground">Word not found.</p>;

  const posColor = POS_COLORS[w.category ?? ""] ?? "bg-muted text-muted-foreground";
  const examples = (w.examples as Array<{ zo: string; en: string; reference: string }> | null) ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold">{w.zolai}</h1>
              {w.accuracy === "confirmed" && <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />}
              {w.audioUrl && (
                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <p className="text-xl text-muted-foreground mt-1">{w.english}</p>
          </div>
          {w.category && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${posColor}`}>{w.category}</span>
          )}
        </div>

        {w.pos && w.pos !== w.category && (
          <p className="text-xs text-muted-foreground">Part of speech: <span className="font-medium">{w.pos}</span></p>
        )}

        {w.definition && (
          <div className="pt-1 border-t">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Definition</p>
            <p className="text-sm">{w.definition}</p>
          </div>
        )}
      </div>

      {/* Bilingual explanation */}
      {w.explanation && (
        <div className="rounded-2xl border bg-blue-50/50 p-5 space-y-2">
          <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide flex items-center gap-1.5">
            <ArrowLeftRight className="w-3.5 h-3.5" />ZO ↔ EN Explanation
          </p>
          <p className="text-sm text-blue-900 leading-relaxed">{w.explanation}</p>
        </div>
      )}

      {/* Example sentences */}
      {(w.example || examples.length > 0) && (
        <div className="rounded-2xl border p-5 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />Example Sentences
          </p>
          {w.example && (
            <div className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3">
              &ldquo;{w.example}&rdquo;
            </div>
          )}
          {examples.map((ex, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm border rounded-xl overflow-hidden">
              <div className="p-3 bg-muted/30">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Zolai</p>
                <p className="font-medium">{ex.zo}</p>
              </div>
              <div className="p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">English</p>
                <p>{ex.en}</p>
              </div>
              {ex.reference && (
                <p className="col-span-2 text-[10px] text-muted-foreground px-3 pb-2">— {ex.reference}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Synonyms / Antonyms / Related */}
      {(w.synonyms.length > 0 || w.antonyms.length > 0 || w.related.length > 0 || w.variants.length > 0) && (
        <div className="rounded-2xl border p-5 space-y-3">
          {w.synonyms.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Synonyms</p>
              <div className="flex flex-wrap gap-1.5">
                {w.synonyms.map(s => <Chip key={s} label={s} href={`/dictionary?q=${s}`} color="bg-green-50 text-green-800 border-green-200" />)}
              </div>
            </div>
          )}
          {w.antonyms.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Antonyms</p>
              <div className="flex flex-wrap gap-1.5">
                {w.antonyms.map(a => <Chip key={a} label={a} href={`/dictionary?q=${a}`} color="bg-red-50 text-red-800 border-red-200" />)}
              </div>
            </div>
          )}
          {w.related.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Related Words</p>
              <div className="flex flex-wrap gap-1.5">
                {w.related.map(r => <Chip key={r} label={r} href={`/dictionary?q=${r}`} color="bg-muted text-muted-foreground border-border" />)}
              </div>
            </div>
          )}
          {w.variants.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Variants</p>
              <div className="flex flex-wrap gap-1.5">
                {w.variants.map(v => <Chip key={v} label={v} color="bg-muted text-muted-foreground border-border" />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";
import Link from "next/link";
import { Volume2, Star } from "lucide-react";
import type { DictWord } from "../types";

const POS_COLORS: Record<string, string> = {
  verb:        "bg-blue-100 text-blue-800",
  noun:        "bg-green-100 text-green-800",
  adjective:   "bg-purple-100 text-purple-800",
  adverb:      "bg-orange-100 text-orange-800",
  particle:    "bg-rose-100 text-rose-800",
  preposition: "bg-teal-100 text-teal-800",
};

interface Props {
  word: DictWord;
  compact?: boolean;
}

export function WordCard({ word, compact = false }: Props) {
  const posColor = POS_COLORS[word.category ?? ""] ?? "bg-muted text-muted-foreground";

  return (
    <Link
      href={`/dictionary/${word.id}`}
      className="block rounded-xl border bg-card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all space-y-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-lg leading-tight">{word.zolai}</span>
            {word.accuracy === "confirmed" && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400 shrink-0" />}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{word.english}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {word.category && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${posColor}`}>
              {word.category}
            </span>
          )}
          {word.audioUrl && <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </div>

      {!compact && word.definition && (
        <p className="text-xs text-muted-foreground line-clamp-2">{word.definition}</p>
      )}

      {!compact && word.example && (
        <p className="text-xs italic text-muted-foreground line-clamp-1">&ldquo;{word.example}&rdquo;</p>
      )}

      {!compact && (word.synonyms.length > 0 || word.antonyms.length > 0) && (
        <div className="flex flex-wrap gap-1 pt-1">
          {word.synonyms.slice(0, 3).map(s => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-100">≈ {s}</span>
          ))}
          {word.antonyms.slice(0, 2).map(a => (
            <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-100">≠ {a}</span>
          ))}
        </div>
      )}
    </Link>
  );
}

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, BookOpen, ArrowRight } from "lucide-react";
import type { ReadingExercise, BilingualSentence } from "../types";

function WordChip({ word, meaning, pos, note }: { word: string; meaning: string; pos?: string; note?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="px-1.5 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm transition-colors cursor-pointer"
      >
        {word}
      </button>
      {open && (
        <span className="absolute bottom-full left-0 mb-1 z-10 min-w-[140px] bg-popover border rounded-lg shadow-lg p-2 text-xs space-y-0.5">
          <span className="block font-semibold text-foreground">{meaning}</span>
          {pos && <span className="block text-muted-foreground italic">{pos}</span>}
          {note && <span className="block text-amber-700 text-[10px]">⚠ {note}</span>}
        </span>
      )}
    </span>
  );
}

function SentenceRow({ s, idx: _idx }: { s: BilingualSentence; idx: number }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Render Zolai sentence with clickable word chips if breakdown exists
  function renderZolai() {
    if (!s.breakdown?.length) return <span className="font-medium text-lg">{s.zo}</span>;
    // Match words in order — simple split on spaces
    const words = s.zo.split(/\s+/);
    return (
      <span className="text-lg leading-relaxed">
        {words.map((w, i) => {
          const clean = w.replace(/[.,!?']/g, "");
          const bd = s.breakdown!.find(b => b.word === clean || b.word === w);
          const suffix = w.slice(clean.length);
          return bd
            ? <span key={i}><WordChip word={clean} meaning={bd.meaning} pos={bd.pos} note={bd.note} />{suffix} </span>
            : <span key={i}>{w} </span>;
        })}
      </span>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      {/* Sentence pair */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
        <div className="p-3 bg-muted/30">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Zolai</p>
          <p className="leading-relaxed">{renderZolai()}</p>
        </div>
        <div className="p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">English</p>
          <p className="text-base leading-relaxed">{s.en}</p>
        </div>
      </div>

      {/* Note + breakdown toggle */}
      {(s.note || s.breakdown?.length) && (
        <div className="border-t px-3 py-2 bg-amber-50/50 space-y-1">
          {s.note && <p className="text-xs text-amber-800">📝 {s.note}</p>}
          {s.breakdown?.length && (
            <button
              onClick={() => setShowBreakdown(o => !o)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Word breakdown
            </button>
          )}
          {showBreakdown && s.breakdown && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {s.breakdown.map((b, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-white border rounded-lg px-2 py-1">
                  <span className="font-semibold text-primary">{b.word}</span>
                  <span className="text-muted-foreground">= {b.meaning}</span>
                  {b.pos && <Badge variant="outline" className="text-[9px] px-1 py-0">{b.pos}</Badge>}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  data: ReadingExercise;
  onComplete: (score: number) => void;
}

export function ReadingLesson({ data, onComplete }: Props) {
  const [showVocab, setShowVocab] = useState(false);

  return (
    <div className="space-y-4">
      {data.intro && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-900">
          {data.intro}
        </div>
      )}

      <div className="space-y-3">
        {data.sentences.map((s, i) => <SentenceRow key={i} s={s} idx={i} />)}
      </div>

      {data.vocabulary.length > 0 && (
        <div className="border rounded-xl overflow-hidden">
          <button
            onClick={() => setShowVocab(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-sm font-medium"
          >
            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" />Key Vocabulary ({data.vocabulary.length} words)</span>
            {showVocab ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showVocab && (
            <div className="divide-y">
              {data.vocabulary.map((v, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 px-4 py-2.5 text-sm hover:bg-muted/20">
                  <div>
                    <span className="font-semibold text-primary">{v.zo}</span>
                    {v.example_zo && <p className="text-xs text-muted-foreground mt-0.5 italic">{v.example_zo}</p>}
                  </div>
                  <div>
                    <span>{v.en}</span>
                    {v.example_en && <p className="text-xs text-muted-foreground mt-0.5 italic">{v.example_en}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Button className="w-full gap-2" onClick={() => onComplete(100)}>
        I understand — Continue <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

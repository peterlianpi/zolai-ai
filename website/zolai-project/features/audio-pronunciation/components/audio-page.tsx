"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Volume2, VolumeX, Search, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { client } from "@/lib/api/client";

interface Word { id: string; zolai: string; english: string; pos?: string; audioUrl?: string }

const PAGE_SIZE = 24;

export function AudioPage() {
  const [query, setQuery] = useState("");
  const [dq, setDq] = useState("");
  const [hasAudio, setHasAudio] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(null!);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setDq(query); setPage(1); }, 300);
    return () => clearTimeout(timer.current);
  }, [query]);

  const { data, isFetching } = useQuery({
    queryKey: ["audio-words", dq, hasAudio, page],
    queryFn: async () => {
      const res = await client.api.audio.words.$get({
        query: { limit: String(PAGE_SIZE), page: String(page), ...(dq && { query: dq }), ...(hasAudio !== undefined && { hasAudio: String(hasAudio) }) },
      });
      return res.json();
    },
  });

  const words: Word[] = (data as { data?: Word[] })?.data ?? [];
  const total: number = (data as { meta?: { total: number } })?.meta?.total ?? 0;

  function play(word: Word) {
    if (!word.audioUrl) return;
    audioRef.current?.pause();
    const audio = new Audio(word.audioUrl);
    audioRef.current = audio;
    setPlaying(word.id);
    audio.play();
    audio.onended = () => setPlaying(null);
    audio.onerror = () => setPlaying(null);
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audio Pronunciation</h1>
        <p className="text-sm text-muted-foreground">{total.toLocaleString()} words · click to hear pronunciation</p>
        <div className="mt-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 px-3 py-2 text-xs text-yellow-800 dark:text-yellow-300">
          🎵 Audio recordings are being collected. Words with audio will show a play button. Browse all words below.
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search words…" className="pl-9" />
        </div>
        <div className="flex gap-1">
          {([undefined, true, false] as const).map((v, i) => (
            <Button key={i} size="sm" variant={hasAudio === v ? "default" : "outline"} onClick={() => { setHasAudio(v); setPage(1); }}>
              {v === undefined ? "All" : v ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          ))}
        </div>
      </div>

      {isFetching ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : words.length === 0 ? (
        <p className="text-center py-16 text-muted-foreground">No words found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {words.map(w => (
            <Card key={w.id} className={`cursor-pointer transition-all hover:shadow-md ${w.audioUrl ? "hover:-translate-y-0.5" : "opacity-60"}`} onClick={() => play(w)}>
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-base truncate">{w.zolai}</span>
                  {w.audioUrl
                    ? <Play className={`w-4 h-4 shrink-0 ${playing === w.id ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                    : <VolumeX className="w-4 h-4 shrink-0 text-muted-foreground/40" />
                  }
                </div>
                <p className="text-xs text-muted-foreground truncate">{w.english}</p>
                {w.pos && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{w.pos}</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground self-center">Page {page} of {Math.ceil(total / PAGE_SIZE)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / PAGE_SIZE)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

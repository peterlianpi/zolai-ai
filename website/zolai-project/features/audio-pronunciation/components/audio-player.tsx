"use client";
import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AudioPlayer({ url, label }: { url: string; label?: string }) {
  const [playing, setPlaying] = useState(false);

  function play() {
    if (playing) return;
    setPlaying(true);
    const audio = new Audio(url);
    audio.play().catch(() => {});
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
  }

  return (
    <Button variant="outline" size="sm" onClick={play} disabled={playing} className="gap-1.5">
      {playing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
      {label ? `Play "${label}"` : "Play"}
    </Button>
  );
}

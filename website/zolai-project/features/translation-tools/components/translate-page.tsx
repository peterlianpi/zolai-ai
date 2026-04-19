"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeftRight, Copy, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { client } from "@/lib/api/client";

type Lang = "zolai" | "english";
interface Result { translatedText: string; found: boolean; fuzzy?: boolean; suggestions?: string[] }

const LANG_LABEL: Record<Lang, string> = { english: "English", zolai: "Zolai (Tedim)" };

export function TranslatePage() {
  const [from, setFrom] = useState<Lang>("english");
  const [to, setTo] = useState<Lang>("zolai");
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ zolai: string; english: string }[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(null!);

  function swap() { setFrom(to); setTo(from); setResult(null); }

  useEffect(() => {
    clearTimeout(timer.current);
    if (text.length < 2) { setSuggestions([]); return; }
    timer.current = setTimeout(async () => {
      const res = await client.api.translation.suggest.$get({ query: { text, lang: from, limit: "5" } });
      const json = await res.json();
      setSuggestions((json as { data?: { suggestions: { zolai: string; english: string }[] } }).data?.suggestions ?? []);
    }, 250);
    return () => clearTimeout(timer.current);
  }, [text, from]);

  async function translate() {
    if (!text.trim()) return;
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await client.api.translation.translate.$get({ query: { text, from, to } });
      const json = await res.json();
      setResult((json as { data: Result }).data);
    } catch { toast.error("Translation failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Translation Tool</h1>
        <p className="text-sm text-muted-foreground">Dictionary-based ZO ↔ EN translation</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 text-center text-sm font-medium py-2 rounded-lg bg-muted">{LANG_LABEL[from]}</div>
        <Button variant="outline" size="icon" onClick={swap}><ArrowLeftRight className="w-4 h-4" /></Button>
        <div className="flex-1 text-center text-sm font-medium py-2 rounded-lg bg-muted">{LANG_LABEL[to]}</div>
      </div>

      <div className="relative space-y-2">
        <Textarea
          value={text}
          onChange={e => { setText(e.target.value); setResult(null); }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); translate(); } }}
          placeholder={`Type ${LANG_LABEL[from]} word or phrase…`}
          className="min-h-[100px] resize-none"
        />
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-popover border rounded-lg shadow-md overflow-hidden">
            {suggestions.map((s, i) => (
              <button key={i} className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex justify-between"
                onClick={() => { setText(from === "english" ? s.english : s.zolai); setSuggestions([]); }}>
                <span className="font-medium">{from === "english" ? s.english : s.zolai}</span>
                <span className="text-muted-foreground">{from === "english" ? s.zolai : s.english}</span>
              </button>
            ))}
          </div>
        )}
        <Button onClick={translate} disabled={loading || !text.trim()} className="w-full gap-2">
          <Search className="w-4 h-4" />{loading ? "Translating…" : "Translate"}
        </Button>
      </div>

      {result && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">{LANG_LABEL[to]}</p>
              {result.found
                ? <p className="text-xl font-semibold">{result.translatedText}</p>
                : <p className="text-muted-foreground italic">No translation found</p>
              }
            </div>
            {result.found && (
              <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(result.translatedText); toast.success("Copied!"); }}>
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {result.found && <Badge>Found</Badge>}
            {result.fuzzy && <Badge variant="secondary">Fuzzy match</Badge>}
            {!result.found && result.suggestions?.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
          </div>
        </div>
      )}
    </div>
  );
}

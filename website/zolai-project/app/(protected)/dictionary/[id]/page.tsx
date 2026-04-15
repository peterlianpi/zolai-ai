// import { notFound } from "next/navigation";
import Link from "next/link";
import { getWordById } from "@/features/dictionary/server/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AudioPlayer } from "@/features/audio-pronunciation/components/audio-player";

export default async function WordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const word = await getWordById(id);

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dictionary"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
      </Button>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{word.zolai}</h1>
        <p className="text-xl text-muted-foreground">{word.english}</p>
        <div className="flex gap-2 flex-wrap pt-1 items-center">
          {word.pos && <Badge variant="secondary">{word.pos}</Badge>}
          {word.category && <Badge variant="outline">{word.category}</Badge>}
          {word.accuracy && <Badge variant={word.accuracy === "confirmed" ? "default" : "secondary"}>{word.accuracy}</Badge>}
          {word.audioUrl && <AudioPlayer url={word.audioUrl} label={word.zolai} />}
        </div>
      </div>

      {word.definition && (
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Definition</CardTitle></CardHeader>
          <CardContent><p>{word.definition}</p></CardContent>
        </Card>
      )}

      {word.example && (
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Example</CardTitle></CardHeader>
          <CardContent><p className="italic">{word.example}</p></CardContent>
        </Card>
      )}

      {word.explanation && (
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Explanation</CardTitle></CardHeader>
          <CardContent><p>{word.explanation}</p></CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {word.synonyms.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Synonyms</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-1">
              {word.synonyms.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
            </CardContent>
          </Card>
        )}
        {word.antonyms.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Antonyms</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-1">
              {word.antonyms.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
            </CardContent>
          </Card>
        )}
        {word.related.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Related</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-1">
              {word.related.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
            </CardContent>
          </Card>
        )}
      </div>

      {word.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {word.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">#{t}</Badge>)}
        </div>
      )}
    </div>
  );
}

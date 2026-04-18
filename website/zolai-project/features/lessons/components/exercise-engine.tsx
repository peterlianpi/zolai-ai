"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { ReadingLesson } from "./reading-lesson";
import type {
  LessonExercise, VocabExercise, TranslationExercise,
  FillBlankExercise, MultipleChoiceExercise, GrammarExercise, ExerciseResult,
} from "../types";

// ── Normalise answer for comparison ──────────────────────────────────────────
function norm(s: string) { return s.trim().toLowerCase().replace(/[.,!?]/g, ""); }
function fuzzyMatch(a: string, b: string) {
  a = norm(a); b = norm(b);
  if (a === b) return true;
  // Allow 1 char difference for typos
  if (Math.abs(a.length - b.length) > 2) return false;
  let diff = 0;
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) diff++;
  return diff <= 1;
}

// ── Feedback banner ───────────────────────────────────────────────────────────
function Feedback({ result, correct, explanation }: { result: ExerciseResult; correct: string; explanation?: string }) {
  return (
    <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${result.correct ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
      {result.correct ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
      <div>
        {result.correct ? "Correct!" : <><span className="font-medium">Correct answer: </span>{correct}</>}
        {explanation && <p className="mt-1 text-xs opacity-80">{explanation}</p>}
      </div>
    </div>
  );
}

// ── Vocabulary (flashcard) ────────────────────────────────────────────────────
function VocabExerciseView({ data, onComplete }: { data: VocabExercise; onComplete: (score: number) => void }) {
  // Normalise: seed may use 'words' array with {zo, en} instead of 'pairs' with {zolai, english}
  const rawData = data as unknown as Record<string, unknown>;
  const pairs: Array<{ zolai: string; english: string; hint?: string }> =
    data.pairs ??
    ((rawData.words as Array<{ zo: string; en: string; example_zo?: string }> | undefined)?.map(w => ({
      zolai: w.zo,
      english: w.en,
      hint: w.example_zo,
    })) ?? []);

  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [correct, setCorrect] = useState(0);
  const pair = pairs[idx];

  function check() {
    const ok = fuzzyMatch(answer, pair.english);
    setResult({ correct: ok, score: ok ? 100 : 0 });
    if (ok) setCorrect(c => c + 1);
  }

  function next() {
    setAnswer(""); setResult(null);
    if (idx + 1 >= pairs.length) onComplete(Math.round((correct + (result?.correct ? 1 : 0)) / pairs.length * 100));
    else setIdx(i => i + 1);
  }

  return (
    <div className="space-y-4">
      <div className="text-center py-8 rounded-2xl bg-muted/50 border">
        <p className="text-xs text-muted-foreground mb-2">What does this mean in English?</p>
        <p className="text-3xl font-bold tracking-wide">{pair.zolai}</p>
        {pair.hint && <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1"><Lightbulb className="w-3 h-3" />{pair.hint}</p>}
      </div>
      <Input value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === "Enter" && !result && check()} placeholder="Type the English meaning…" disabled={!!result} autoFocus />
      {result && <Feedback result={result} correct={pair.english} />}
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{idx + 1} / {pairs.length}</span>
        {!result ? <Button onClick={check} disabled={!answer.trim()}>Check</Button> : <Button onClick={next}>{idx + 1 >= pairs.length ? "Finish" : "Next →"}</Button>}
      </div>
    </div>
  );
}

// ── Translation ───────────────────────────────────────────────────────────────
function TranslationExerciseView({ data, onComplete }: { data: TranslationExercise; onComplete: (score: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const s = data.sentences[idx];

  function check() {
    const ok = fuzzyMatch(answer, s.answer);
    const score = ok ? 100 : 40; // partial credit for attempt
    setResult({ correct: ok, score, feedback: ok ? undefined : `Expected: ${s.answer}` });
    setScores(prev => [...prev, score]);
  }

  function next() {
    setAnswer(""); setResult(null);
    if (idx + 1 >= data.sentences.length) {
      const avg = [...scores, result?.score ?? 0].reduce((a, b) => a + b, 0) / data.sentences.length;
      onComplete(Math.round(avg));
    } else setIdx(i => i + 1);
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-muted/50 border text-center">
        <p className="text-xs text-muted-foreground mb-1">Translate to {s.sourceLang === "zo" ? "English" : "Zolai"}</p>
        <p className="text-xl font-medium">{s.source}</p>
        {s.hint && <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1"><Lightbulb className="w-3 h-3" />{s.hint}</p>}
      </div>
      <Input value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === "Enter" && !result && check()} placeholder="Your translation…" disabled={!!result} autoFocus />
      {result && <Feedback result={result} correct={s.answer} />}
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{idx + 1} / {data.sentences.length}</span>
        {!result ? <Button onClick={check} disabled={!answer.trim()}>Check</Button> : <Button onClick={next}>{idx + 1 >= data.sentences.length ? "Finish" : "Next →"}</Button>}
      </div>
    </div>
  );
}

// ── Fill in the blank ─────────────────────────────────────────────────────────
function FillBlankView({ data, onComplete }: { data: FillBlankExercise; onComplete: (score: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [correct, setCorrect] = useState(0);
  const s = data.sentences[idx];
  const [before, after] = s.template.split("___");

  function check() {
    const ok = fuzzyMatch(answer, s.answer);
    setResult({ correct: ok, score: ok ? 100 : 0 });
    if (ok) setCorrect(c => c + 1);
  }

  function next() {
    setAnswer(""); setResult(null);
    if (idx + 1 >= data.sentences.length) onComplete(Math.round((correct + (result?.correct ? 1 : 0)) / data.sentences.length * 100));
    else setIdx(i => i + 1);
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-muted/50 border text-center text-lg font-medium">
        {before}
        <span className="inline-block border-b-2 border-primary min-w-[80px] mx-1 px-2 text-primary">
          {result ? s.answer : answer || "___"}
        </span>
        {after}
      </div>
      <Input value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === "Enter" && !result && check()} placeholder="Fill in the blank…" disabled={!!result} autoFocus />
      {result && <Feedback result={result} correct={s.answer} />}
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{idx + 1} / {data.sentences.length}</span>
        {!result ? <Button onClick={check} disabled={!answer.trim()}>Check</Button> : <Button onClick={next}>{idx + 1 >= data.sentences.length ? "Finish" : "Next →"}</Button>}
      </div>
    </div>
  );
}

// ── Multiple choice ───────────────────────────────────────────────────────────
function MultipleChoiceView({ data, onComplete }: { data: MultipleChoiceExercise; onComplete: (score: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const q = data.questions[idx];

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correct) setCorrect(c => c + 1);
  }

  function next() {
    setSelected(null);
    if (idx + 1 >= data.questions.length) onComplete(Math.round((correct + (selected === q.correct ? 1 : 0)) / data.questions.length * 100));
    else setIdx(i => i + 1);
  }

  return (
    <div className="space-y-4">
      <p className="text-base font-medium p-4 rounded-xl bg-muted/50 border">{q.question}</p>
      <div className="grid grid-cols-1 gap-2">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correct;
          const isSelected = i === selected;
          let cls = "p-3 rounded-xl border text-sm text-left transition-all ";
          if (selected === null) cls += "hover:bg-muted cursor-pointer";
          else if (isCorrect) cls += "bg-green-50 border-green-400 text-green-800 font-medium";
          else if (isSelected) cls += "bg-red-50 border-red-400 text-red-800";
          else cls += "opacity-50";
          return <button key={i} className={cls} onClick={() => pick(i)}>{opt}</button>;
        })}
      </div>
      {selected !== null && (
        <div className="space-y-2">
          {q.explanation && <p className="text-xs text-muted-foreground p-2 rounded-lg bg-muted">{q.explanation}</p>}
          <Button className="w-full" onClick={next}>{idx + 1 >= data.questions.length ? "Finish" : "Next →"}</Button>
        </div>
      )}
      <p className="text-xs text-muted-foreground text-right">{idx + 1} / {data.questions.length}</p>
    </div>
  );
}

// ── Grammar ───────────────────────────────────────────────────────────────────
function GrammarView({ data, onComplete }: { data: GrammarExercise; onComplete: (score: number) => void }) {
  const [phase, setPhase] = useState<"rule" | "practice">("rule");
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  // Some GRAMMAR lessons use reading-style content (intro/sentences/vocabulary)
  if (!data.rule && !data.questions?.length) {
    return <ReadingLesson data={data as unknown as import("../types").ReadingExercise} onComplete={onComplete} />;
  }

  if (phase === "rule") {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-900">
          <p className="font-semibold mb-2">Grammar Rule</p>
          <p>{data.rule}</p>
        </div>
        <div className="space-y-2">
          {data.examples.map((ex, i) => (
            <div key={i} className="text-sm space-y-0.5">
              <p className="text-green-700">✓ {ex.correct}</p>
              <p className="text-red-600 line-through opacity-70">✗ {ex.incorrect}</p>
              <p className="text-xs text-muted-foreground">{ex.explanation}</p>
            </div>
          ))}
        </div>
        <Button className="w-full" onClick={() => setPhase("practice")}>Practice →</Button>
      </div>
    );
  }

  const q = data.questions[idx];
  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correct) setCorrect(c => c + 1);
  }
  function next() {
    setSelected(null);
    if (idx + 1 >= data.questions.length) onComplete(Math.round((correct + (selected === q.correct ? 1 : 0)) / data.questions.length * 100));
    else setIdx(i => i + 1);
  }

  return (
    <div className="space-y-4">
      <p className="text-base font-medium p-4 rounded-xl bg-muted/50 border">{q.question}</p>
      <div className="grid grid-cols-1 gap-2">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correct;
          const isSelected = i === selected;
          let cls = "p-3 rounded-xl border text-sm text-left transition-all ";
          if (selected === null) cls += "hover:bg-muted cursor-pointer";
          else if (isCorrect) cls += "bg-green-50 border-green-400 text-green-800 font-medium";
          else if (isSelected) cls += "bg-red-50 border-red-400 text-red-800";
          else cls += "opacity-50";
          return <button key={i} className={cls} onClick={() => pick(i)}>{opt}</button>;
        })}
      </div>
      {selected !== null && <Button className="w-full" onClick={next}>{idx + 1 >= data.questions.length ? "Finish" : "Next →"}</Button>}
      <p className="text-xs text-muted-foreground text-right">{idx + 1} / {data.questions.length}</p>
    </div>
  );
}

// ── Main exercise dispatcher ──────────────────────────────────────────────────
interface ExerciseEngineProps {
  exercise: LessonExercise;
  onComplete: (score: number) => void;
}

export function ExerciseEngine({ exercise, onComplete }: ExerciseEngineProps) {
  switch (exercise.type) {
    case "READING":         return <ReadingLesson data={exercise} onComplete={onComplete} />;
    case "VOCABULARY":      return <VocabExerciseView data={exercise} onComplete={onComplete} />;
    case "TRANSLATION":     return <TranslationExerciseView data={exercise} onComplete={onComplete} />;
    case "FILL_BLANK":      return <FillBlankView data={exercise} onComplete={onComplete} />;
    case "MULTIPLE_CHOICE": return <MultipleChoiceView data={exercise} onComplete={onComplete} />;
    case "GRAMMAR":         return <GrammarView data={exercise} onComplete={onComplete} />;
    default:                return <p className="text-muted-foreground text-sm">Exercise type not yet supported.</p>;
  }
}

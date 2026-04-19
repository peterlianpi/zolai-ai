// Lesson domain types

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type LessonType = "READING" | "VOCABULARY" | "TRANSLATION" | "FILL_BLANK" | "MULTIPLE_CHOICE" | "GRAMMAR";
export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | "MASTERED";

export interface LessonSummary {
  id: string;
  title: string;
  type: LessonType;
  xpReward: number;
  order: number;
}

export interface LessonUnit {   // = Chapter
  id: string;
  title: string;
  description?: string;
  order: number;
  xpReward: number;
  lessons: LessonSummary[];
}

export interface LessonPlan {   // = Book
  id: string;
  slug: string;
  title: string;
  description?: string;
  level: CefrLevel;
  order: number;
  units: LessonUnit[];
}

export interface LessonContent {
  id: string;
  title: string;
  type: LessonType;
  xpReward: number;
  content: LessonExercise;
}

// ── Exercise content shapes ───────────────────────────────────────────────────

export type LessonExercise =
  | ReadingExercise
  | VocabExercise
  | TranslationExercise
  | FillBlankExercise
  | MultipleChoiceExercise
  | GrammarExercise;

/** Reading lesson — bilingual explanation page with word breakdown */
export interface ReadingExercise {
  type: "READING";
  intro?: string;                          // short English intro paragraph
  sentences: BilingualSentence[];
  vocabulary: VocabEntry[];                // key words used in the passage
}

export interface BilingualSentence {
  zo: string;                              // Zolai sentence
  en: string;                              // English translation
  breakdown?: WordBreakdown[];             // word-by-word analysis
  note?: string;                           // grammar/cultural note
}

export interface WordBreakdown {
  word: string;                            // Zolai word
  meaning: string;                         // English meaning
  pos?: string;                            // part of speech
  note?: string;                           // e.g. "never use pathian"
}

export interface VocabEntry {
  zo: string;
  en: string;
  example_zo?: string;
  example_en?: string;
}

export interface VocabExercise {
  type: "VOCABULARY";
  pairs: Array<{ zolai: string; english: string; hint?: string }>;
}

export interface TranslationExercise {
  type: "TRANSLATION";
  sentences: Array<{ source: string; sourceLang: "zo" | "en"; answer: string; hint?: string }>;
}

export interface FillBlankExercise {
  type: "FILL_BLANK";
  sentences: Array<{ template: string; answer: string; hint?: string }>;
}

export interface MultipleChoiceExercise {
  type: "MULTIPLE_CHOICE";
  questions: Array<{ question: string; options: string[]; correct: number; explanation?: string }>;
}

export interface GrammarExercise {
  type: "GRAMMAR";
  rule: string;
  examples: Array<{ correct: string; incorrect: string; explanation: string }>;
  questions: Array<{ question: string; options: string[]; correct: number; explanation?: string }>;
}

// ── Progress ──────────────────────────────────────────────────────────────────

export interface UserProgress {
  lessonId: string;
  status: ProgressStatus;
  score: number;
  xpEarned: number;
  attempts: number;
  completedAt?: string;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  lastActivityAt?: string;
}

export interface ExerciseResult {
  correct: boolean;
  score: number;
  feedback?: string;
}

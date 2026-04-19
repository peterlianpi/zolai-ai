// Curriculum System Types — Zolai Platform

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// ── Departments ───────────────────────────────────────────────────────────────
export type Department =
  | 'linguistics'   // phonology, grammar, vocabulary, dialectology
  | 'tutor'         // instruction, assessment, engagement, adaptation
  | 'phonics'       // vowels, consonants, clusters, tones, minimal-pairs
  | 'curriculum';   // design, sequencing, quality, localization

export type LinguisticsSubdept = 'phonology' | 'grammar' | 'vocabulary' | 'dialectology';
export type TutorSubdept       = 'instruction' | 'assessment' | 'engagement' | 'adaptation';
export type PhonicsSubdept     = 'vowels' | 'consonants' | 'clusters' | 'tones' | 'minimal-pairs';
export type CurriculumSubdept  = 'design' | 'sequencing' | 'quality' | 'localization';

export type Subdepartment =
  | LinguisticsSubdept
  | TutorSubdept
  | PhonicsSubdept
  | CurriculumSubdept;

// ── Curriculum Hierarchy ──────────────────────────────────────────────────────
// Level → Section (1–4 content + 1 daily-refresh) → Unit (topic) → SubUnit (8 per unit) → Lesson

export interface Level {
  code: CEFRLevel;
  name: string;
  description: string;
  vocabMin: number;   // total vocab range for this level
  vocabMax: number;
  sections: Section[];
}

/**
 * Section vocab ranges (per level, each section covers a slice):
 *   Section 1: vocabMin .. vocabMin+19   (e.g. A1: 60–79)
 *   Section 2: vocabMin+20 .. vocabMin+39 (e.g. A1: 80–99)
 *   Section 3: vocabMin+40 .. vocabMin+54 (e.g. A1: 100–114)
 *   Section 4: vocabMin+55 .. vocabMax    (e.g. A1: 115–129)
 *   Section 5: Daily Refresh (no new vocab)
 */
export interface Section {
  id: string;
  levelCode: CEFRLevel;
  number: number;           // 1–4 = content, 5 = daily refresh
  name: string;
  isDailyRefresh: boolean;
  vocabMin: number;
  vocabMax: number;
  units: Unit[];
}

export interface Unit {
  id: string;
  sectionId: string;
  number: number;
  topic: string;            // e.g. "Greetings & Introductions"
  description: string;
  xpReward: number;
  subUnits: SubUnit[];      // always 8
}

export interface SubUnit {
  id: string;
  unitId: string;
  number: number;           // 1–8
  title: string;
  type: SubUnitType;
  xpReward: number;
  lessons: Lesson[];
}

export type SubUnitType =
  | 'introduction'    // 1 — new concept intro
  | 'vocabulary'      // 2 — word bank
  | 'grammar'         // 3 — pattern drill
  | 'listening'       // 4 — audio comprehension
  | 'speaking'        // 5 — production
  | 'reading'         // 6 — passage + questions
  | 'review'          // 7 — mixed recall
  | 'challenge';      // 8 — harder, earns bonus XP

export interface Lesson {
  id: string;
  subUnitId: string;
  order: number;
  type: LessonType;
  content: LessonContent;
  xpReward: number;
  durationMinutes: number;
}

export type LessonType =
  | 'translate'
  | 'fill_blank'
  | 'multiple_choice'
  | 'match_pairs'
  | 'tap_correct'
  | 'arrange_words'
  | 'dictation'
  | 'speak_sentence'
  | 'error_correction';

export interface LessonContent {
  prompt: string;
  targetZolai?: string;
  targetEnglish?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

// ── Phonics Track (separate from CEFR) ───────────────────────────────────────
export type PhonicsCategory =
  | 'vowels'          // a, e, i, o, u + long forms
  | 'consonants'      // b, d, g, h, k, l, m, n, ng, p, s, t, z ...
  | 'clusters'        // kh, th, ph, ng, lh ...
  | 'tones'           // Tedim has 3 tones: level, rising, falling
  | 'minimal_pairs';  // pai/bai, tui/dui etc.

export interface PhonicsUnit {
  id: string;
  category: PhonicsCategory;
  number: number;
  title: string;
  description: string;
  ipaSymbol?: string;
  audioUrl?: string;
  subUnits: PhonicsSubUnit[];
}

export interface PhonicsSubUnit {
  id: string;
  phonicsUnitId: string;
  number: number;           // 1–8
  title: string;
  type: PhonicsLessonType;
  lessons: PhonicsLesson[];
}

export type PhonicsLessonType =
  | 'listen_identify'   // hear sound, pick letter
  | 'listen_repeat'     // hear word, repeat
  | 'match_sound'       // match IPA to Zolai spelling
  | 'minimal_pair'      // distinguish similar sounds
  | 'spell_from_audio'  // hear word, type it
  | 'read_aloud'        // see word, speak it
  | 'tone_drill'        // identify tone pattern
  | 'challenge';

export interface PhonicsLesson {
  id: string;
  subUnitId: string;
  order: number;
  type: PhonicsLessonType;
  soundFocus: string;       // e.g. "o = /oʊ/"
  exampleWords: string[];   // Zolai words featuring this sound
  audioUrl?: string;
  correctAnswer: string;
  explanation: string;
}

// ── Lesson Plan (admin-level planning doc) ────────────────────────────────────
export interface LessonPlan {
  id: string;
  levelCode: CEFRLevel;
  sectionNumber: number;
  unitNumber: number;
  topic: string;
  objectives: string[];       // learning outcomes
  vocabTargets: string[];     // VocabWord IDs or zolai strings
  grammarFocus: string;       // e.g. "SOV sentence structure"
  phonicsFocus?: string;      // e.g. "o = /oʊ/ in context"
  culturalNote?: string;
  subUnits: SubUnitPlan[];
  department: Department;
  assignedTeam: string;
  status: PlanStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type PlanStatus = 'draft' | 'review' | 'approved' | 'published';

export interface SubUnitPlan {
  number: number;
  type: SubUnitType;
  title: string;
  exerciseTypes: LessonType[];
  estimatedMinutes: number;
}

// ── Department / Team structures ──────────────────────────────────────────────
export interface DepartmentTeam {
  id: Department;
  name: string;
  mission: string;
  lead: AgentRole;
  subdepartments: SubdepartmentTeam[];
}

export interface SubdepartmentTeam {
  id: Subdepartment;
  name: string;
  department: Department;
  lead: AgentRole;
  agents: AgentRole[];
  responsibilities: string[];
}

export interface AgentRole {
  id: string;
  name: string;
  agentFile: string;        // e.g. ".cursor/agents/phonics-agent.md"
  skills: string[];         // skill file names
  responsibilities: string[];
}

// ── Workflow ──────────────────────────────────────────────────────────────────
export interface WorkflowStage {
  id: string;
  name: string;
  department: Department;
  subdepartment?: Subdepartment;
  status: StageStatus;
  startDate: Date;
  endDate?: Date;
  dependencies: string[];
  output?: string;
}

export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface Handoff {
  id: string;
  fromDepartment: Department;
  toDepartment: Department;
  fromSubdept?: Subdepartment;
  toSubdept?: Subdepartment;
  artifact: string;         // what is being handed off
  status: 'pending' | 'in_progress' | 'completed';
  date: Date;
}

export interface Task {
  id: string;
  subdepartment: Subdepartment;
  name: string;
  assignee: string;
  dueDate: Date;
  status: StageStatus;
  createdAt: Date;
}

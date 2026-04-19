import { Hono } from 'hono';
import { ok, notFound } from '@/lib/api/response';
import type { DepartmentTeam } from '../types';

// ── Static department registry ────────────────────────────────────────────────

const DEPARTMENTS: DepartmentTeam[] = [
  {
    id: 'linguistics',
    name: 'Linguistics Department',
    mission: 'Define and validate all Tedim ZVS language rules, vocabulary, and phonology.',
    lead: { id: 'ling-lead', name: 'Linguistics Lead', agentFile: '.cursor/agents/linguistics-agent.md', skills: ['tedim-dialect-rules', 'hono-rpc-patterns'], responsibilities: ['Approve all language content', 'Resolve dialect disputes'] },
    subdepartments: [
      { id: 'phonology',    name: 'Phonology',    department: 'linguistics', lead: { id: 'phon-lead', name: 'Phonologist',    agentFile: '.cursor/agents/phonics-agent.md',      skills: ['tedim-dialect-rules', 'linguistics-tedim'], responsibilities: ['Phonics curriculum', 'IPA mapping', 'Audio scripts'] }, agents: [], responsibilities: ['Vowel/consonant/tone rules', 'Phonics units', 'Minimal pair drills'] },
      { id: 'grammar',      name: 'Grammar',      department: 'linguistics', lead: { id: 'gram-lead', name: 'Grammarian',      agentFile: '.cursor/agents/grammar-agent.md',      skills: ['tedim-dialect-rules', 'lesson-curriculum'],  responsibilities: ['SOV rules', 'Negation patterns', 'Morphology'] }, agents: [], responsibilities: ['Grammar sub-units', 'Error correction exercises', 'Pattern drills'] },
      { id: 'vocabulary',   name: 'Vocabulary',   department: 'linguistics', lead: { id: 'vocab-lead', name: 'Lexicographer',  agentFile: '.cursor/agents/vocab-agent.md',        skills: ['tedim-dialect-rules', 'prisma-patterns'],    responsibilities: ['VocabWord curation', 'Semantic fields', 'CEFR word lists'] }, agents: [], responsibilities: ['Vocab sub-units', 'Word-bank exercises', 'Synonym/antonym pairs'] },
      { id: 'dialectology', name: 'Dialectology', department: 'linguistics', lead: { id: 'dial-lead', name: 'Dialectologist', agentFile: '.cursor/agents/dialect-agent.md',      skills: ['tedim-dialect-rules'],                       responsibilities: ['Dialect enforcement', 'Cultural notes', 'Register variation'] }, agents: [], responsibilities: ['Dialect error detection', 'Cultural context notes'] },
    ],
  },
  {
    id: 'tutor',
    name: 'Tutor Department',
    mission: 'Deliver adaptive Socratic instruction across all CEFR levels.',
    lead: { id: 'tutor-lead', name: 'Tutor Lead', agentFile: '.cursor/agents/tutor-agent.md', skills: ['lesson-curriculum', 'ai-llm-integration'], responsibilities: ['Tutor system prompt', 'CEFR adaptation', 'Feedback loops'] },
    subdepartments: [
      { id: 'instruction', name: 'Instruction', department: 'tutor', lead: { id: 'inst-lead', name: 'Socratic Tutor',    agentFile: '.cursor/agents/tutor-agent.md',      skills: ['lesson-curriculum', 'ai-llm-integration'], responsibilities: ['Lesson delivery', 'Socratic prompts'] }, agents: [], responsibilities: ['Sub-unit lesson flow', 'Hint system', 'Explanation quality'] },
      { id: 'assessment',  name: 'Assessment',  department: 'tutor', lead: { id: 'asmt-lead', name: 'Assessment Agent', agentFile: '.cursor/agents/assessment-agent.md',  skills: ['lesson-curriculum', 'testing-patterns'],   responsibilities: ['Exercise scoring', 'CEFR placement', 'Progress gates'] }, agents: [], responsibilities: ['Score calculation', 'XP awards', 'Mastery thresholds'] },
      { id: 'engagement',  name: 'Engagement',  department: 'tutor', lead: { id: 'eng-lead',  name: 'Engagement Agent', agentFile: '.cursor/agents/engagement-agent.md',  skills: ['react-query-hooks', 'ui-component-patterns'], responsibilities: ['Streak system', 'XP gamification', 'Daily refresh'] }, agents: [], responsibilities: ['Streak tracking', 'Daily refresh section', 'Motivational prompts'] },
      { id: 'adaptation',  name: 'Adaptation',  department: 'tutor', lead: { id: 'adpt-lead', name: 'Adaptive Agent',   agentFile: '.cursor/agents/adaptive-agent.md',    skills: ['ai-llm-integration', 'lesson-curriculum'],  responsibilities: ['Difficulty scaling', 'Weak-area detection', 'Personalised practice'] }, agents: [], responsibilities: ['Adaptive difficulty', 'Personalised practice queue'] },
    ],
  },
  {
    id: 'phonics',
    name: 'Phonics Department',
    mission: 'Build the standalone Zolai phonics track covering all sounds, tones, and clusters.',
    lead: { id: 'phon-dept-lead', name: 'Phonics Lead', agentFile: '.cursor/agents/phonics-agent.md', skills: ['tedim-dialect-rules', 'linguistics-tedim', 'lesson-curriculum'], responsibilities: ['Phonics track design', 'Audio production', 'IPA reference'] },
    subdepartments: [
      { id: 'vowels',        name: 'Vowels',        department: 'phonics', lead: { id: 'vow-lead',  name: 'Vowel Specialist',       agentFile: '.cursor/agents/phonics-agent.md', skills: ['tedim-dialect-rules'], responsibilities: ['a e i o u + long forms', 'o=/oʊ/ enforcement'] }, agents: [], responsibilities: ['Vowel units 1–8', 'Listen-identify exercises'] },
      { id: 'consonants',    name: 'Consonants',    department: 'phonics', lead: { id: 'con-lead',  name: 'Consonant Specialist',   agentFile: '.cursor/agents/phonics-agent.md', skills: ['tedim-dialect-rules'], responsibilities: ['b d g h k l m n p s t z', 'No ti-cluster rule'] }, agents: [], responsibilities: ['Consonant units 1–8', 'Spell-from-audio exercises'] },
      { id: 'clusters',      name: 'Clusters',      department: 'phonics', lead: { id: 'clu-lead',  name: 'Cluster Specialist',     agentFile: '.cursor/agents/phonics-agent.md', skills: ['tedim-dialect-rules'], responsibilities: ['kh th ph ng lh', 'Cluster drills'] }, agents: [], responsibilities: ['Cluster units 1–8', 'Match-sound exercises'] },
      { id: 'tones',         name: 'Tones',         department: 'phonics', lead: { id: 'ton-lead',  name: 'Tone Specialist',        agentFile: '.cursor/agents/phonics-agent.md', skills: ['tedim-dialect-rules', 'linguistics-tedim'], responsibilities: ['Level/rising/falling tones', 'Tone-drill exercises'] }, agents: [], responsibilities: ['Tone units 1–8', 'Tone-drill exercises'] },
      { id: 'minimal-pairs', name: 'Minimal Pairs', department: 'phonics', lead: { id: 'mp-lead',   name: 'Minimal Pair Specialist', agentFile: '.cursor/agents/phonics-agent.md', skills: ['tedim-dialect-rules'], responsibilities: ['pai/bai tui/dui contrasts', 'Discrimination drills'] }, agents: [], responsibilities: ['Minimal pair units 1–8', 'Listen-distinguish exercises'] },
    ],
  },
  {
    id: 'curriculum',
    name: 'Curriculum Design Department',
    mission: 'Design, sequence, and quality-assure all lesson plans across all levels.',
    lead: { id: 'curr-lead', name: 'Curriculum Lead', agentFile: '.cursor/agents/curriculum-agent.md', skills: ['lesson-curriculum', 'feature-structure', 'prisma-patterns'], responsibilities: ['Lesson plan approval', 'Section/unit sequencing', 'XP balance'] },
    subdepartments: [
      { id: 'design',       name: 'Design',       department: 'curriculum', lead: { id: 'des-lead',  name: 'Lesson Designer',    agentFile: '.cursor/agents/curriculum-agent.md', skills: ['lesson-curriculum', 'ui-component-patterns'], responsibilities: ['Sub-unit templates', 'Exercise variety', 'Duolingo-style flow'] }, agents: [], responsibilities: ['8 sub-unit templates per unit', 'Exercise type mix'] },
      { id: 'sequencing',   name: 'Sequencing',   department: 'curriculum', lead: { id: 'seq-lead',  name: 'Sequencing Agent',   agentFile: '.cursor/agents/curriculum-agent.md', skills: ['lesson-curriculum'],                           responsibilities: ['Vocab progression', 'Section vocab ranges', 'Dependency ordering'] }, agents: [], responsibilities: ['Section 1–4 vocab ranges', 'Unit ordering', 'Daily refresh queue'] },
      { id: 'quality',      name: 'Quality',      department: 'curriculum', lead: { id: 'qa-lead',   name: 'QA Lead',            agentFile: '.cursor/agents/curriculum-agent.md', skills: ['testing-patterns', 'tedim-dialect-rules'],     responsibilities: ['Dialect compliance', 'Exercise accuracy', 'Audio sync'] }, agents: [], responsibilities: ['Dialect error checks', 'Exercise answer validation'] },
      { id: 'localization', name: 'Localization', department: 'curriculum', lead: { id: 'loc-lead',  name: 'Localization Agent', agentFile: '.cursor/agents/curriculum-agent.md', skills: ['i18n-patterns', 'tedim-dialect-rules'],         responsibilities: ['EN↔ZO translations', 'Cultural notes', 'Bible corpus integration'] }, agents: [], responsibilities: ['Translation accuracy', 'Cultural context', 'Bible verse examples'] },
    ],
  },
];

// ── Router (fully chained) ────────────────────────────────────────────────────

const departmentsRouter = new Hono()
  .get('/departments', async (c) => {
    return ok(c, DEPARTMENTS.map(d => ({
      id: d.id, name: d.name, mission: d.mission,
      subdepartmentCount: d.subdepartments.length,
      lead: d.lead.name,
    })));
  })
  .get('/departments/:id', async (c) => {
    const dept = DEPARTMENTS.find(d => d.id === c.req.param('id'));
    if (!dept) return notFound(c);
    return ok(c, dept);
  })
  .get('/departments/:id/subdepartments', async (c) => {
    const dept = DEPARTMENTS.find(d => d.id === c.req.param('id'));
    if (!dept) return notFound(c);
    return ok(c, dept.subdepartments);
  })
  .get('/subdepartments/:id', async (c) => {
    const id = c.req.param('id');
    for (const dept of DEPARTMENTS) {
      const sub = dept.subdepartments.find(s => s.id === id);
      if (sub) return ok(c, sub);
    }
    return notFound(c);
  })
  .get('/workflow/status', async (c) => {
    return ok(c, {
      phase: 'Phase 1: Foundation',
      week: 1,
      departments: DEPARTMENTS.map(d => ({ id: d.id, status: 'in_progress', subdepartments: d.subdepartments.length })),
    });
  });

export default departmentsRouter;

# Lesson Tutor Skill

## Purpose
Deliver Duolingo-style adaptive Zolai language lessons with memory, self-improvement, and XP tracking.

## Workflow

### 1. Session Start
1. Call `GET /api/agent-memory/:userId/zolai-lesson-tutor` — load user memory
2. Call `GET /api/lessons/user/:userId/next` — get next lesson
3. Personalize lesson based on memory (`weak_vocab`, `recent_errors`, `cefr_level`)

### 2. Lesson Delivery by Type

| Type | Behavior |
|---|---|
| `VOCABULARY` | Show Zolai word → user types English (or reverse). Check exact + fuzzy match. |
| `TRANSLATION` | Show English sentence → user writes Zolai. Call `/api/chat` with tutor=true to evaluate. |
| `FILL_BLANK` | Show sentence with `___` → user fills in. Check against `content.answer`. |
| `MULTIPLE_CHOICE` | Show 4 options from `content.options`. Track which distractors fool the user. |
| `GRAMMAR` | Present rule from `content.rule`, ask user to apply it. |

### 3. Scoring
- Score 0–100 per exercise
- XP = `lesson.xpReward` if score ≥ 80, else `floor(xpReward * score / 100)`
- Call `POST /api/lessons/progress` with `{ lessonId, userId, score }`

### 4. Memory Update (after each lesson)
Save to agent memory:
- `last_lesson_id` — for resumability
- `weak_vocab` — words scored < 60, append to list (max 20)
- `recent_errors` — last 5 error patterns
- `cefr_level` — update if user consistently scores > 90 at current level

### 5. Self-Improvement (after each session)
Call `POST /api/agent-memory/learn`:
```json
{
  "agentId": "zolai-lesson-tutor",
  "taskType": "lesson",
  "input": { "lessonId": "...", "userId": "..." },
  "output": { "score": 85, "errors": [...] },
  "lesson": "User confuses 'pai' (go) with 'hong pai' (come). Reinforce directional particles next session."
}
```

### 6. Streak Update
Automatically handled by `POST /api/lessons/progress` — updates `UserStreak.totalXp` and `lastActivityAt`.

## ZVS Rules (always enforce)
- Never use: `pathian`, `ram`, `fapa`, `cu/cun`
- Always use: `pasian`, `gam`, `tapa`, `tua`
- `mi` = person (generic), not `mipa`
- No `uh` plural with `i` (we)
- Negative conditional: `nong pai kei a leh` — never `lo leh`

## Known Word Corrections (from learning log)
- `sia` = damaged/partial — `siat` = completely destroyed (do NOT confuse)
- `semsem` = more and more (progressive) — `zawzaw` = comparatively more (`a gol zawzaw`)
- `innkhum` / `sikkang` = roof — NEVER `inn tungpuan`
- `zingsang lam` = east, `nitang lam` = west (direction only — not morning/evening)
- `vaang lam` = north, `vaang lam nung` = south

## Sentence Validation (MANDATORY before delivery)
Every Zolai sentence generated for a lesson MUST pass:
1. SOV order check — `wiki/grammar/sentence_structures.md`
2. Phonology check — no `ti`, no `c+a/e/o/aw` — `wiki/grammar/phonology.md`
3. Dictionary lookup — `GET /api/dictionary/search`
4. Corrections check — `wiki/grammar/news_register_patterns.md`
5. Sinna rules — `wiki/linguistics/zolai_sinna_2010_knowledge.md`
6. ZVS rule check — `POST /api/grammar/validate`
7. Gemini API fluency + context check (model: gemini-2.0-flash)

If Gemini returns issues → revise → re-run all steps. Never skip.

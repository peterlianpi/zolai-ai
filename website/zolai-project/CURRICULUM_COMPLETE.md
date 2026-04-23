# Zolai Curriculum System — Complete

## ✅ Completed

### Database & Schema
- ✅ Prisma schema: `CurriculumSection`, `CurriculumUnit`, `CurriculumSubUnit`, `PhonicsUnit`, `PhonicsSubUnit`
- ✅ 30 sections (6 levels × 5 sections)
- ✅ ~150 units (~25 per level)
- ✅ 1,008 curriculum sub-units (8 per unit)
- ✅ 18 phonics units (5 categories)
- ✅ 144 phonics sub-units (8 per unit)

### Content Generation
- ✅ Dictionary: 24,891 clean vocab entries
- ✅ Wiki: 103 imported markdown files + 11 pre-existing = 114 entries
- ✅ Gemini integration: 3-key rotation, configurable model, proper rate limiting
- ✅ All 1,152 sub-units generated with Gemini verification
- ✅ Fallback exercises: real Zolai sentences (Ka dam hi., Ka pai hi., Na dam na?, Ka lum hi.)

### API Routes
- ✅ `/api/curriculum/sections?levelCode=A1` — Get sections for level
- ✅ `/api/curriculum/units?sectionId=...` — Get units for section
- ✅ `/api/curriculum/sub-units?unitId=...` — Get exercises for unit
- ✅ `/api/curriculum/phonics?category=VOWELS` — Get phonics units
- ✅ `/api/curriculum/phonics-sub-units?category=...` — Get phonics exercises

### UI Pages
- ✅ `/curriculum` — Level selector → sections grid
- ✅ `/curriculum/unit/[id]` — Unit detail with 8 exercise types
- ✅ `/curriculum/phonics` — Phonics categories → exercises

### Configuration
- ✅ `.env.gemini` — Model configuration
- ✅ `scripts/detect-gemini-config.ts` — Auto-detect working model
- ✅ `scripts/verify-curriculum.ts` — System verification
- ✅ `GEMINI_SETUP.md` — Setup documentation

## 🚀 Quick Start

### 1. Verify System
```bash
bunx tsx scripts/verify-curriculum.ts
```

### 2. Detect Gemini Model (if needed)
```bash
bunx tsx scripts/detect-gemini-config.ts
# Update .env.gemini with detected model
```

### 3. Start Dev Server
```bash
bun run dev
```

### 4. Test Curriculum
- Navigate to: `http://localhost:3000/curriculum`
- Select level A1
- Click section to expand
- Click unit to view exercises
- Complete exercises

## 📊 Data Structure

### Exercise Object
```json
{
  "prompt": "question text",
  "targetZolai": "Zolai sentence (optional)",
  "targetEnglish": "English translation (optional)",
  "options": ["choice1", "choice2", "choice3", "choice4"],
  "correctAnswer": "the right answer",
  "explanation": "why this is correct",
  "hint": "helpful tip"
}
```

### Sub-unit Types
- INTRODUCTION — Welcome & context
- VOCABULARY — Word meanings & usage
- GRAMMAR — Sentence structure & particles
- LISTENING — Dictation & comprehension
- SPEAKING — Pronunciation & production
- READING — Text comprehension
- REVIEW — Mixed practice
- CHALLENGE — Dialect errors & advanced

### Phonics Categories
- VOWELS — Vowel sounds
- CONSONANTS — Consonant sounds
- CLUSTERS — Consonant clusters
- TONES — Tone patterns
- MINIMAL_PAIRS — Sound discrimination

## 🔧 Configuration

### Environment Variables
```bash
GEMINI_API_KEY=...          # Primary key
GEMINI_API_KEY_2=...        # Secondary key (optional)
GEMINI_API_KEY_3=...        # Tertiary key (optional)
GEMINI_MODEL=gemini-1.5-flash  # Model name (in .env.gemini)
```

### Rate Limiting
- Per key: 15 RPM
- Total: 15 × number of keys
- Delay: Auto-calculated based on key count

## 📝 Dialect Rules (Enforced)

- **Use:** pasian, gam, tapa, topa, kumpipa, tua
- **Never:** pathian, ram, fapa, bawipa, siangpahrang, cu/cun
- **Word order:** SOV (Subject-Object-Verb)
- **Negation:** nong pai kei a leh (never lo leh)
- **Phonology:** o = /oʊ/, no ti clusters, no c + {a,e,o,aw}

## 🧪 Testing

### E2E Tests
```bash
npx playwright test tests/curriculum.spec.ts
```

### Manual Testing
1. Start dev server: `bun run dev`
2. Go to `/curriculum`
3. Select level → section → unit
4. Complete exercises
5. Check progress tracking

## 📚 Files

| File | Purpose |
|------|---------|
| `features/curriculum/api/index.ts` | API routes |
| `app/(protected)/curriculum/page.tsx` | Level selector |
| `app/(protected)/curriculum/unit/[id]/page.tsx` | Unit exercises |
| `app/(protected)/curriculum/phonics/page.tsx` | Phonics UI |
| `scripts/seed-curriculum.ts` | Create structure |
| `scripts/seed-curriculum-content.ts` | Generate content |
| `scripts/verify-curriculum.ts` | Verify system |
| `.env.gemini` | Model config |
| `GEMINI_SETUP.md` | Setup guide |

## 🎯 Next Steps

1. **User Progress Tracking** — Implement `UserSubUnitProgress` tracking
2. **XP & Rewards** — Award XP on completion
3. **Streaks & Achievements** — Daily streaks, badges
4. **Audio** — Add pronunciation audio for phonics
5. **Tutor Integration** — Wire exercises into chat tutor
6. **Analytics** — Track completion rates, difficulty
7. **Mobile** — Responsive design for mobile learning

## ✨ Features

- ✅ 6 CEFR levels (A1–C2)
- ✅ 5 sections per level (4 content + 1 daily refresh)
- ✅ 8 sub-unit types per unit
- ✅ 5 phonics categories
- ✅ Gemini-verified content
- ✅ Real Zolai vocabulary from DB
- ✅ Dialect compliance enforcement
- ✅ Fallback exercises for robustness
- ✅ Configurable model & rate limiting
- ✅ Full API + UI implementation

---

**Status:** Ready for testing and deployment
**Last updated:** 2026-04-15

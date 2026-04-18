# Zolai AI — Lesson Architecture & Curriculum Design

**Status**: Production Ready  
**Last Updated**: 2026-04-15  
**Based on**: Duolingo structure + Phonics best practices

---

## 📐 Hierarchy Overview

```
LEVEL (CEFR: A1, A2, B1, B2, C1, C2)
├── SECTION (4 sections + 1 daily refresh)
│   ├── UNIT (varies by section)
│   │   ├── TOPIC (8 sub-units per unit)
│   │   │   ├── LESSON (5-6 exercises)
│   │   │   └── REVIEW (spaced repetition)
│   │   └── PHONICS (vowels, consonants, tones)
│   └── DAILY REFRESH (5-10 min review)
└── PROGRESSION (unlock next section at 80% mastery)
```

---

## 🎯 Level Structure

### CEFR Levels (A1 → C2)

| Level | Vocab Range | Section 1 | Section 2 | Section 3 | Section 4 | Daily Refresh |
|-------|-------------|----------|----------|----------|----------|---------------|
| **A1** | 60-129 | 60-79 | 80-99 | 100-114 | 115-129 | 5-10 min |
| **A2** | 130-299 | 130-149 | 150-169 | 170-189 | 190-299 | 5-10 min |
| **B1** | 300-599 | 300-349 | 350-399 | 400-449 | 450-599 | 5-10 min |
| **B2** | 600-999 | 600-649 | 650-699 | 700-749 | 750-999 | 5-10 min |
| **C1** | 1000-1499 | 1000-1099 | 1100-1199 | 1200-1299 | 1300-1499 | 5-10 min |
| **C2** | 1500+ | 1500-1599 | 1600-1699 | 1700-1799 | 1800+ | 5-10 min |

---

## 📚 Section Design (Duolingo-Inspired)

### Section 1: Foundation (60-79 vocab)
- **Units**: 4-6 units
- **Topics per unit**: 8 sub-units
- **Focus**: Basic greetings, pronouns, present tense
- **Phonics**: Vowels (a, e, i, o, u) + basic consonants

### Section 2: Expansion (80-99 vocab)
- **Units**: 5-7 units
- **Topics per unit**: 8 sub-units
- **Focus**: Common verbs, adjectives, simple sentences
- **Phonics**: Consonant clusters, tone marks

### Section 3: Consolidation (100-114 vocab)
- **Units**: 6-8 units
- **Topics per unit**: 8 sub-units
- **Focus**: Past/future tense, complex sentences
- **Phonics**: Diphthongs, stress patterns

### Section 4: Mastery (115-129 vocab)
- **Units**: 7-9 units
- **Topics per unit**: 8 sub-units
- **Focus**: Idiomatic expressions, cultural context
- **Phonics**: Advanced phonology, regional variations

### Daily Refresh
- **Duration**: 5-10 minutes
- **Content**: Spaced repetition of previous sections
- **Frequency**: Daily streak bonus
- **Topics**: Mix of all 4 sections

---

## 🔤 Phonics Curriculum (Separate Track)

### Vowels (5 lessons)
1. **Lesson 1**: Single vowels (a, e, i, o, u)
   - Pronunciation guide
   - Audio examples
   - Practice words (5-10 per vowel)

2. **Lesson 2**: Vowel combinations
   - Diphthongs (ai, ei, oi, etc.)
   - Long vs short vowels
   - Tone marks

3. **Lesson 3**: Vowel stress patterns
   - Primary stress
   - Secondary stress
   - Unstressed vowels

4. **Lesson 4**: Regional vowel variations
   - Tedim dialect variations
   - Pronunciation differences
   - Listening comprehension

5. **Lesson 5**: Vowel review & mastery
   - Mixed exercises
   - Dictation
   - Pronunciation assessment

### Consonants (6 lessons)
1. **Lesson 1**: Single consonants (p, t, k, m, n, etc.)
   - Articulation point
   - Voicing (voiced/unvoiced)
   - Practice words

2. **Lesson 2**: Consonant clusters
   - Initial clusters (pr, tr, kr, etc.)
   - Final clusters
   - Pronunciation rules

3. **Lesson 3**: Fricatives & affricates
   - Fricatives (s, z, sh, etc.)
   - Affricates (ch, j, etc.)
   - Minimal pairs

4. **Lesson 4**: Nasals & liquids
   - Nasals (m, n, ng)
   - Liquids (l, r)
   - Syllabic consonants

5. **Lesson 5**: Consonant assimilation
   - Voicing assimilation
   - Place assimilation
   - Connected speech

6. **Lesson 6**: Consonant mastery
   - Mixed exercises
   - Tongue twisters
   - Pronunciation assessment

### Tones (3 lessons)
1. **Lesson 1**: Tone basics
   - High tone
   - Mid tone
   - Low tone
   - Tone marks

2. **Lesson 2**: Tone combinations
   - Rising tone
   - Falling tone
   - Contour tones

3. **Lesson 3**: Tone mastery
   - Minimal pairs (tone only)
   - Sentence-level tones
   - Listening comprehension

---

## 👥 Departments & Agents

### Linguistics Department
**Responsibility**: Language structure, phonology, grammar rules

**Agents**:
- **Phonologist**: Manages phonics curriculum, pronunciation guides
- **Grammarian**: Designs grammar lessons, syntax rules
- **Lexicographer**: Curates vocabulary, semantic fields
- **Dialectologist**: Handles regional variations, cultural context

**Skills**:
- Phonetic transcription
- Grammar rule formulation
- Vocabulary curation
- Dialect documentation

### Tutor Department
**Responsibility**: Lesson delivery, student engagement, assessment

**Agents**:
- **Socratic Tutor**: Guides learning through questions
- **Assessment Agent**: Evaluates mastery, tracks progress
- **Engagement Agent**: Gamification, streaks, rewards
- **Adaptive Agent**: Adjusts difficulty based on performance

**Skills**:
- Adaptive questioning
- Performance tracking
- Motivation strategies
- Personalized feedback

### Content Department
**Responsibility**: Lesson creation, exercise design, multimedia

**Agents**:
- **Lesson Designer**: Creates lesson structure, flow
- **Exercise Generator**: Designs practice exercises
- **Media Producer**: Audio, images, video
- **Quality Assurance**: Reviews all content

**Skills**:
- Instructional design
- Exercise creation
- Media production
- Quality control

### Analytics Department
**Responsibility**: Learning metrics, progress tracking, optimization

**Agents**:
- **Progress Tracker**: Monitors student advancement
- **Performance Analyst**: Identifies learning patterns
- **Optimization Agent**: Recommends curriculum improvements
- **Reporting Agent**: Generates insights & reports

**Skills**:
- Data analysis
- Pattern recognition
- Recommendation algorithms
- Report generation

---

## 📊 Unit Structure (Per Section)

### Unit Template
```
UNIT: "Greetings & Introductions" (Section 1, Unit 1)

TOPICS (8 sub-units):
1. Hello & goodbye
2. Names & introductions
3. Polite forms
4. Question formation
5. Response patterns
6. Formal vs informal
7. Cultural context
8. Review & practice

LESSONS (per topic):
- Lesson 1: Introduction (2-3 min)
- Lesson 2: Vocabulary (3-5 min)
- Lesson 3: Grammar (3-5 min)
- Lesson 4: Listening (2-3 min)
- Lesson 5: Speaking (3-5 min)
- Lesson 6: Review (2-3 min)

EXERCISES (per lesson):
- Multiple choice (2-3)
- Fill-in-the-blank (2-3)
- Matching (2-3)
- Listening comprehension (2-3)
- Speaking practice (1-2)
- Writing practice (1-2)

PHONICS INTEGRATION:
- Vowel focus: /a/, /e/ (in greetings)
- Consonant focus: /p/, /t/, /k/ (initial sounds)
- Tone focus: Greeting tones (high, mid)

MASTERY CRITERIA:
- 80% accuracy on exercises
- Correct pronunciation (audio assessment)
- Fluent response time (< 3 seconds)
```

---

## 🎮 Exercise Types (Duolingo-Inspired)

### 1. Multiple Choice
- 4 options (1 correct, 3 distractors)
- Vocabulary or grammar focus
- Immediate feedback

### 2. Fill-in-the-Blank
- Sentence completion
- Word bank provided
- Spelling validation

### 3. Matching
- Vocabulary pairs
- Sentence matching
- Image-text matching

### 4. Listening Comprehension
- Audio clip (1-2 sentences)
- Multiple choice or transcription
- Pronunciation assessment

### 5. Speaking Practice
- Prompt-based response
- Audio recording
- Pronunciation scoring

### 6. Writing Practice
- Sentence construction
- Paragraph writing
- Grammar validation

### 7. Dictation
- Audio → text transcription
- Spelling & grammar check
- Phonics reinforcement

### 8. Drag & Drop
- Sentence reordering
- Grammar pattern recognition
- Visual learning

---

## 📈 Progression & Mastery

### Unlock Criteria
- **Next section**: 80% mastery of current section
- **Next unit**: 75% mastery of current unit
- **Next topic**: 70% mastery of current topic

### Mastery Levels
| Level | Accuracy | Fluency | Criteria |
|-------|----------|---------|----------|
| **Beginner** | 50-69% | Slow | Learning phase |
| **Intermediate** | 70-79% | Moderate | Consolidation |
| **Advanced** | 80-89% | Fast | Proficiency |
| **Mastery** | 90%+ | Fluent | Expert level |

### Spaced Repetition
- **Day 1**: Initial learning
- **Day 3**: First review
- **Day 7**: Second review
- **Day 14**: Third review
- **Day 30**: Final review

---

## 🏆 Gamification Elements

### Streaks
- Daily streak (consecutive days)
- Streak freeze (skip 1 day/week)
- Streak milestones (7, 30, 100 days)

### Rewards
- XP per exercise (10-50 XP)
- Bonus XP for streaks (2x multiplier)
- Achievements (badges)
- Leaderboards (weekly, monthly)

### Levels
- User level (1-100+)
- Section level (1-5 crowns)
- Skill level (1-5 crowns)

---

## 📱 Daily Refresh Design

### 5-Minute Session
1. **Warm-up** (1 min): 2-3 easy exercises
2. **Review** (2 min): 4-5 spaced repetition items
3. **Challenge** (1 min): 1-2 harder exercises
4. **Reward** (1 min): Streak bonus, XP display

### 10-Minute Session
1. **Warm-up** (1 min): 3-4 easy exercises
2. **Review** (3 min): 6-8 spaced repetition items
3. **Challenge** (3 min): 3-4 harder exercises
4. **Speaking** (2 min): 1-2 pronunciation exercises
5. **Reward** (1 min): Streak bonus, XP display

---

## 🔄 Recommended Improvements Over Duolingo

### 1. **Phonics-First Approach**
- Separate phonics track (not embedded)
- Explicit pronunciation guidance
- Audio assessment for all speaking

### 2. **Adaptive Difficulty**
- Real-time difficulty adjustment
- Personalized exercise selection
- Learning style adaptation

### 3. **Cultural Context**
- Zomi cultural lessons
- Dialect variations
- Regional usage patterns

### 4. **Offline Support**
- Download lessons for offline use
- Sync when reconnected
- No internet required

### 5. **Teacher Dashboard**
- Class management
- Student progress tracking
- Custom lesson creation
- Assignment management

### 6. **Community Features**
- Peer review of translations
- Discussion forums
- Language exchange matching
- User-generated content

### 7. **Advanced Analytics**
- Learning style detection
- Weakness identification
- Personalized recommendations
- Predictive performance modeling

### 8. **Pronunciation Feedback**
- Real-time audio assessment
- Spectral analysis
- Comparison to native speaker
- Detailed correction guidance

---

## 📋 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Create lesson templates
- [ ] Design phonics curriculum
- [ ] Build exercise generator
- [ ] Setup database schema

### Phase 2: Content Creation (Weeks 5-12)
- [ ] Create A1 level lessons (all 4 sections)
- [ ] Create phonics lessons (vowels, consonants, tones)
- [ ] Generate 500+ exercises
- [ ] Record audio for all lessons

### Phase 3: Integration (Weeks 13-16)
- [ ] Integrate with tutor system
- [ ] Setup spaced repetition
- [ ] Implement gamification
- [ ] Create daily refresh system

### Phase 4: Testing & Optimization (Weeks 17-20)
- [ ] User testing (A/B tests)
- [ ] Performance optimization
- [ ] Analytics setup
- [ ] Teacher dashboard

### Phase 5: Expansion (Weeks 21+)
- [ ] A2 level lessons
- [ ] B1 level lessons
- [ ] Advanced features
- [ ] Community features

---

## 🗂️ File Structure

```
features/curriculum/
├── api/
│   ├── lessons.ts          # Lesson CRUD
│   ├── units.ts            # Unit management
│   ├── exercises.ts        # Exercise generation
│   ├── phonics.ts          # Phonics curriculum
│   └── progress.ts         # Student progress
├── components/
│   ├── LessonPlayer.tsx    # Lesson UI
│   ├── ExerciseRenderer.tsx # Exercise display
│   ├── PhonicsLesson.tsx   # Phonics UI
│   └── DailyRefresh.tsx    # Daily refresh UI
├── hooks/
│   ├── useLesson.ts        # Lesson state
│   ├── useProgress.ts      # Progress tracking
│   └── usePhonics.ts       # Phonics state
├── types.ts                # Curriculum types
└── constants.ts            # Levels, sections, etc.
```

---

## 📊 Database Schema

```sql
-- Levels (A1, A2, B1, B2, C1, C2)
CREATE TABLE Level (
  id SERIAL PRIMARY KEY,
  code VARCHAR(3) UNIQUE,  -- A1, A2, B1, etc.
  name VARCHAR(50),
  vocabMin INT,
  vocabMax INT
);

-- Sections (1-4 + daily refresh)
CREATE TABLE Section (
  id SERIAL PRIMARY KEY,
  levelId INT REFERENCES Level(id),
  number INT,  -- 1, 2, 3, 4, or 5 (daily refresh)
  name VARCHAR(100),
  vocabMin INT,
  vocabMax INT,
  description TEXT
);

-- Units (grouped by section)
CREATE TABLE Unit (
  id SERIAL PRIMARY KEY,
  sectionId INT REFERENCES Section(id),
  number INT,
  name VARCHAR(100),
  description TEXT,
  topicCount INT  -- 8 topics per unit
);

-- Topics (8 per unit)
CREATE TABLE Topic (
  id SERIAL PRIMARY KEY,
  unitId INT REFERENCES Unit(id),
  number INT,  -- 1-8
  name VARCHAR(100),
  description TEXT,
  focusArea VARCHAR(50)  -- grammar, vocabulary, etc.
);

-- Lessons (5-6 per topic)
CREATE TABLE Lesson (
  id SERIAL PRIMARY KEY,
  topicId INT REFERENCES Topic(id),
  number INT,  -- 1-6
  type VARCHAR(50),  -- introduction, vocabulary, grammar, etc.
  content TEXT,
  duration INT  -- minutes
);

-- Exercises (per lesson)
CREATE TABLE Exercise (
  id SERIAL PRIMARY KEY,
  lessonId INT REFERENCES Lesson(id),
  type VARCHAR(50),  -- multiple_choice, fill_blank, etc.
  question TEXT,
  options JSONB,
  correctAnswer VARCHAR(255),
  explanation TEXT,
  difficulty INT  -- 1-5
);

-- Phonics Curriculum
CREATE TABLE PhonicsLesson (
  id SERIAL PRIMARY KEY,
  levelId INT REFERENCES Level(id),
  category VARCHAR(50),  -- vowels, consonants, tones
  number INT,
  name VARCHAR(100),
  description TEXT,
  audioUrl VARCHAR(255)
);

-- Student Progress
CREATE TABLE StudentProgress (
  id SERIAL PRIMARY KEY,
  userId INT REFERENCES User(id),
  lessonId INT REFERENCES Lesson(id),
  topicId INT REFERENCES Topic(id),
  accuracy DECIMAL(5,2),
  completedAt TIMESTAMP,
  timeSpent INT  -- seconds
);

-- Spaced Repetition Queue
CREATE TABLE SpacedRepetition (
  id SERIAL PRIMARY KEY,
  userId INT REFERENCES User(id),
  exerciseId INT REFERENCES Exercise(id),
  nextReviewDate DATE,
  interval INT,  -- days
  easeFactor DECIMAL(3,2),
  repetitions INT
);
```

---

## 🎯 Success Metrics

### Learning Outcomes
- 80%+ completion rate per section
- 90%+ accuracy on mastery exercises
- Average 15-20 min daily engagement
- 70%+ retention after 30 days

### User Engagement
- 60%+ daily active users
- 30+ day retention rate > 50%
- Average streak > 7 days
- 4+ lessons per week per user

### Content Quality
- 95%+ exercise accuracy
- < 2% error rate in audio
- 4.5+ star rating
- < 5% user-reported issues

---

## 📞 Support & Resources

- **Linguistics Team**: Grammar rules, phonology
- **Tutor Team**: Lesson delivery, assessment
- **Content Team**: Exercise creation, media
- **Analytics Team**: Progress tracking, optimization

---

**Next Steps**: 
1. Review this architecture
2. Create lesson templates
3. Design phonics curriculum
4. Build exercise generator
5. Start A1 level content creation

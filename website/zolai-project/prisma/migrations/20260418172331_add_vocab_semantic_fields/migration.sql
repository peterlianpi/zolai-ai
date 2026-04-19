/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `wiki_entry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `wiki_entry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('VOCABULARY', 'TRANSLATION', 'FILL_BLANK', 'MULTIPLE_CHOICE', 'LISTENING', 'SPEAKING', 'GRAMMAR');

-- CreateEnum
CREATE TYPE "SubUnitType" AS ENUM ('INTRODUCTION', 'VOCABULARY', 'GRAMMAR', 'LISTENING', 'SPEAKING', 'READING', 'REVIEW', 'CHALLENGE');

-- CreateEnum
CREATE TYPE "PhonicsCategory" AS ENUM ('VOWELS', 'CONSONANTS', 'CLUSTERS', 'TONES', 'MINIMAL_PAIRS');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE', 'MASTERED');

-- DropIndex
DROP INDEX "vocab_word_english_gin_idx";

-- DropIndex
DROP INDEX "vocab_word_zolai_gin_idx";

-- AlterTable
ALTER TABLE "bible_verse" ADD COLUMN     "tbr17" TEXT;

-- AlterTable
ALTER TABLE "learning_resource" ADD COLUMN     "answerCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "category" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "accountLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lockoutExpires" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_preferences" ADD COLUMN     "aiModel" TEXT,
ADD COLUMN     "aiProvider" TEXT,
ADD COLUMN     "telegramChatId" TEXT,
ADD COLUMN     "telegramEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "vocab_word" ADD COLUMN     "accuracy" TEXT DEFAULT 'unverified',
ADD COLUMN     "antonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "audioUrl" TEXT DEFAULT '',
ADD COLUMN     "category" TEXT,
ADD COLUMN     "examples" JSONB,
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "related" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "synonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "variants" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "wiki_entry" ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'published';

-- CreateTable
CREATE TABLE "lesson_plan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_section" (
    "id" TEXT NOT NULL,
    "levelCode" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isDailyRefresh" BOOLEAN NOT NULL DEFAULT false,
    "vocabMin" INTEGER NOT NULL,
    "vocabMax" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curriculum_section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_unit" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curriculum_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_sub_unit" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" "SubUnitType" NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 10,
    "order" INTEGER NOT NULL DEFAULT 0,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curriculum_sub_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sub_unit_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subUnitId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "score" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sub_unit_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phonics_unit" (
    "id" TEXT NOT NULL,
    "category" "PhonicsCategory" NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "ipaSymbol" TEXT,
    "audioUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phonics_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phonics_sub_unit" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "audioUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phonics_sub_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_phonics_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subUnitId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "score" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_phonics_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_unit" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "xpReward" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "lesson_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "LessonType" NOT NULL,
    "content" JSONB NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 5,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_lesson_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "score" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_streak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),

    CONSTRAINT "user_streak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_memory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_learn_log" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "feedback" TEXT,
    "lesson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_learn_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbound_email" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "fromName" TEXT,
    "subject" TEXT NOT NULL,
    "text" TEXT,
    "html" TEXT,
    "replyTo" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isReplied" BOOLEAN NOT NULL DEFAULT false,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inbound_email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lesson_plan_slug_key" ON "lesson_plan"("slug");

-- CreateIndex
CREATE INDEX "lesson_plan_level_isActive_idx" ON "lesson_plan"("level", "isActive");

-- CreateIndex
CREATE INDEX "curriculum_section_levelCode_idx" ON "curriculum_section"("levelCode");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_section_levelCode_number_key" ON "curriculum_section"("levelCode", "number");

-- CreateIndex
CREATE INDEX "curriculum_unit_sectionId_idx" ON "curriculum_unit"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_unit_sectionId_number_key" ON "curriculum_unit"("sectionId", "number");

-- CreateIndex
CREATE INDEX "curriculum_sub_unit_unitId_idx" ON "curriculum_sub_unit"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_sub_unit_unitId_number_key" ON "curriculum_sub_unit"("unitId", "number");

-- CreateIndex
CREATE INDEX "user_sub_unit_progress_userId_status_idx" ON "user_sub_unit_progress"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_sub_unit_progress_userId_subUnitId_key" ON "user_sub_unit_progress"("userId", "subUnitId");

-- CreateIndex
CREATE INDEX "phonics_unit_category_idx" ON "phonics_unit"("category");

-- CreateIndex
CREATE UNIQUE INDEX "phonics_unit_category_number_key" ON "phonics_unit"("category", "number");

-- CreateIndex
CREATE INDEX "phonics_sub_unit_unitId_idx" ON "phonics_sub_unit"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "phonics_sub_unit_unitId_number_key" ON "phonics_sub_unit"("unitId", "number");

-- CreateIndex
CREATE INDEX "user_phonics_progress_userId_idx" ON "user_phonics_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_phonics_progress_userId_subUnitId_key" ON "user_phonics_progress"("userId", "subUnitId");

-- CreateIndex
CREATE INDEX "lesson_unit_planId_order_idx" ON "lesson_unit"("planId", "order");

-- CreateIndex
CREATE INDEX "lesson_unitId_order_idx" ON "lesson"("unitId", "order");

-- CreateIndex
CREATE INDEX "user_lesson_progress_userId_status_idx" ON "user_lesson_progress"("userId", "status");

-- CreateIndex
CREATE INDEX "user_lesson_progress_userId_completedAt_idx" ON "user_lesson_progress"("userId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_lesson_progress_userId_lessonId_key" ON "user_lesson_progress"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "user_streak_userId_key" ON "user_streak"("userId");

-- CreateIndex
CREATE INDEX "agent_memory_userId_agentId_idx" ON "agent_memory"("userId", "agentId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_memory_userId_agentId_key_key" ON "agent_memory"("userId", "agentId", "key");

-- CreateIndex
CREATE INDEX "agent_learn_log_agentId_taskType_idx" ON "agent_learn_log"("agentId", "taskType");

-- CreateIndex
CREATE INDEX "agent_learn_log_createdAt_idx" ON "agent_learn_log"("createdAt");

-- CreateIndex
CREATE INDEX "inbound_email_to_createdAt_idx" ON "inbound_email"("to", "createdAt");

-- CreateIndex
CREATE INDEX "inbound_email_isRead_idx" ON "inbound_email"("isRead");

-- CreateIndex
CREATE INDEX "bible_verse_testament_idx" ON "bible_verse"("testament");

-- CreateIndex
CREATE INDEX "learning_resource_category_idx" ON "learning_resource"("category");

-- CreateIndex
CREATE INDEX "vocab_word_english_idx" ON "vocab_word"("english");

-- CreateIndex
CREATE INDEX "vocab_word_category_idx" ON "vocab_word"("category");

-- CreateIndex
CREATE INDEX "vocab_word_pos_idx" ON "vocab_word"("pos");

-- CreateIndex
CREATE INDEX "vocab_word_accuracy_idx" ON "vocab_word"("accuracy");

-- CreateIndex
CREATE UNIQUE INDEX "wiki_entry_slug_key" ON "wiki_entry"("slug");

-- CreateIndex
CREATE INDEX "wiki_entry_slug_idx" ON "wiki_entry"("slug");

-- AddForeignKey
ALTER TABLE "curriculum_unit" ADD CONSTRAINT "curriculum_unit_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "curriculum_section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_sub_unit" ADD CONSTRAINT "curriculum_sub_unit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "curriculum_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sub_unit_progress" ADD CONSTRAINT "user_sub_unit_progress_subUnitId_fkey" FOREIGN KEY ("subUnitId") REFERENCES "curriculum_sub_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sub_unit_progress" ADD CONSTRAINT "user_sub_unit_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phonics_sub_unit" ADD CONSTRAINT "phonics_sub_unit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "phonics_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_phonics_progress" ADD CONSTRAINT "user_phonics_progress_subUnitId_fkey" FOREIGN KEY ("subUnitId") REFERENCES "phonics_sub_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_phonics_progress" ADD CONSTRAINT "user_phonics_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_unit" ADD CONSTRAINT "lesson_unit_planId_fkey" FOREIGN KEY ("planId") REFERENCES "lesson_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "lesson_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_streak" ADD CONSTRAINT "user_streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_memory" ADD CONSTRAINT "agent_memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

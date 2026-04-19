-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('LESSON', 'VOCABULARY', 'GRAMMAR', 'EXERCISE', 'ARTICLE', 'STORY', 'AUDIO', 'VIDEO', 'QUIZ', 'REFERENCE');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED', 'MASTERY');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "learning_resource" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "difficultyLevel" "DifficultyLevel" NOT NULL DEFAULT 'BEGINNER',
    "status" "ResourceStatus" NOT NULL DEFAULT 'DRAFT',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "zolaiLocale" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "featuredMediaId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "completionCount" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "durationMinutes" INTEGER,
    "prerequisites" TEXT[],

    CONSTRAINT "learning_resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wiki_entry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wiki_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bible_verse" (
    "id" TEXT NOT NULL,
    "book" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "testament" TEXT NOT NULL,
    "tdb77" TEXT,
    "tedim2010" TEXT,
    "kjv" TEXT,

    CONSTRAINT "bible_verse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dataset_stat" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "target" INTEGER,
    "unit" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dataset_stat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_run" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "steps" INTEGER NOT NULL DEFAULT 0,
    "maxSteps" INTEGER,
    "lossJson" TEXT,
    "config" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "training_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocab_word" (
    "id" TEXT NOT NULL,
    "zolai" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "pos" TEXT,
    "definition" TEXT,
    "example" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vocab_word_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learning_resource_resourceType_status_idx" ON "learning_resource"("resourceType", "status");

-- CreateIndex
CREATE INDEX "learning_resource_difficultyLevel_status_idx" ON "learning_resource"("difficultyLevel", "status");

-- CreateIndex
CREATE INDEX "learning_resource_authorId_idx" ON "learning_resource"("authorId");

-- CreateIndex
CREATE INDEX "learning_resource_tags_idx" ON "learning_resource"("tags");

-- CreateIndex
CREATE INDEX "learning_resource_zolaiLocale_idx" ON "learning_resource"("zolaiLocale");

-- CreateIndex
CREATE UNIQUE INDEX "learning_resource_slug_locale_key" ON "learning_resource"("slug", "locale");

-- CreateIndex
CREATE INDEX "wiki_entry_category_idx" ON "wiki_entry"("category");

-- CreateIndex
CREATE INDEX "bible_verse_book_chapter_idx" ON "bible_verse"("book", "chapter");

-- CreateIndex
CREATE UNIQUE INDEX "bible_verse_book_chapter_verse_key" ON "bible_verse"("book", "chapter", "verse");

-- CreateIndex
CREATE UNIQUE INDEX "dataset_stat_label_key" ON "dataset_stat"("label");

-- CreateIndex
CREATE INDEX "training_run_status_idx" ON "training_run"("status");

-- CreateIndex
CREATE INDEX "vocab_word_zolai_idx" ON "vocab_word"("zolai");

-- AddForeignKey
ALTER TABLE "learning_resource" ADD CONSTRAINT "learning_resource_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_resource" ADD CONSTRAINT "learning_resource_featuredMediaId_fkey" FOREIGN KEY ("featuredMediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

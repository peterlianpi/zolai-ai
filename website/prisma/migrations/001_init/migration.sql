-- CreateTable entries
CREATE TABLE "entries" (
    "id" TEXT NOT NULL,
    "en" VARCHAR(500) NOT NULL,
    "zo" VARCHAR(500) NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "dictCount" INTEGER NOT NULL DEFAULT 1,
    "frequency" INTEGER NOT NULL DEFAULT 0,
    "learningCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable grammar_rules
CREATE TABLE "grammar_rules" (
    "id" TEXT NOT NULL,
    "ruleName" VARCHAR(255) NOT NULL,
    "pattern" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "examples" TEXT NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "sourceFile" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grammar_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable wiki_concepts
CREATE TABLE "wiki_concepts" (
    "id" TEXT NOT NULL,
    "concept" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "definition" TEXT NOT NULL,
    "examples" TEXT NOT NULL,
    "relatedConcepts" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "sourceFile" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wiki_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable project_learnings
CREATE TABLE "project_learnings" (
    "id" TEXT NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "topic" VARCHAR(255) NOT NULL,
    "learning" TEXT NOT NULL,
    "source" VARCHAR(255) NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.89,
    "visionAlignment" TEXT NOT NULL,
    "improvementArea" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_learnings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "entries_en_idx" ON "entries"("en");
CREATE INDEX "entries_zo_idx" ON "entries"("zo");
CREATE INDEX "entries_confidence_idx" ON "entries"("confidence");

-- CreateIndex
CREATE INDEX "grammar_rules_category_idx" ON "grammar_rules"("category");
CREATE INDEX "grammar_rules_ruleName_idx" ON "grammar_rules"("ruleName");

-- CreateIndex
CREATE INDEX "wiki_concepts_category_idx" ON "wiki_concepts"("category");
CREATE INDEX "wiki_concepts_concept_idx" ON "wiki_concepts"("concept");

-- CreateIndex
CREATE INDEX "project_learnings_category_idx" ON "project_learnings"("category");
CREATE INDEX "project_learnings_topic_idx" ON "project_learnings"("topic");

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "page_template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "htmlTemplate" TEXT NOT NULL,
    "cssTemplate" TEXT,
    "slots" JSONB NOT NULL DEFAULT '[]',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_template_name_key" ON "page_template"("name");

-- CreateIndex
CREATE UNIQUE INDEX "page_template_slug_key" ON "page_template"("slug");

-- CreateIndex
CREATE INDEX "page_template_slug_idx" ON "page_template"("slug");

-- CreateIndex
CREATE INDEX "page_template_featured_idx" ON "page_template"("featured");

-- CreateIndex
CREATE INDEX "post_templateId_idx" ON "post"("templateId");

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "page_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

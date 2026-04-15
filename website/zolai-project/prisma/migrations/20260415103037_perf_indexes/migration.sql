-- Enable pg_trgm extension for GIN trigram full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram indexes on VocabWord for fast ILIKE full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS "vocab_word_zolai_gin_idx"
  ON "vocab_word" USING GIN ("zolai" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "vocab_word_english_gin_idx"
  ON "vocab_word" USING GIN ("english" gin_trgm_ops);

-- Composite indexes on Post for featured/popular feed queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "post_status_isFeatured_publishedAt_idx"
  ON "post" ("status", "isFeatured", "publishedAt");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "post_status_isPopular_publishedAt_idx"
  ON "post" ("status", "isPopular", "publishedAt");

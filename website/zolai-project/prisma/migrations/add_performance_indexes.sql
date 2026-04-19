-- Performance Optimization Migration: Add Critical Indexes
-- This migration adds database indexes to optimize common query patterns

-- Index for content listing with filters (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "post_listing_optimized" 
  ON "post" ("status", "type", "publishedAt" DESC, "locale") 
  WHERE "status" = 'PUBLISHED';

-- Index for featured and popular content queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "post_featured_popular" 
  ON "post" ("isFeatured", "isPopular", "publishedAt" DESC) 
  WHERE "status" = 'PUBLISHED';

-- Index for full-text search on title and excerpt
CREATE INDEX CONCURRENTLY IF NOT EXISTS "post_search_gin" 
  ON "post" USING gin(to_tsvector('english', title || ' ' || COALESCE(excerpt, '')));

-- Optimize audit log queries (admin dashboard)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "audit_log_entity_action" 
  ON "audit_log" ("entityType", "action", "createdAt" DESC);

-- Optimize user activity queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "user_activity_optimized" 
  ON "user" ("deletedAt", "updatedAt" DESC, "createdAt" DESC);

-- Optimize comment queries by post and status
CREATE INDEX CONCURRENTLY IF NOT EXISTS "comment_post_status_optimized" 
  ON "comment" ("postId", "status", "createdAt" DESC);

-- Optimize menu items hierarchical queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "menu_item_hierarchy" 
  ON "menu_item" ("menuId", "parentId", "order" ASC);

-- Optimize redirect lookups (high frequency)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "redirect_source_enabled" 
  ON "redirect" ("source", "enabled") 
  WHERE "enabled" = true;

-- Optimize media queries by type and date
CREATE INDEX CONCURRENTLY IF NOT EXISTS "media_type_date" 
  ON "media" ("mimeType", "createdAt" DESC);

-- Optimize notification queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "notification_user_status" 
  ON "notification" ("userId", "read", "createdAt" DESC);

-- Optimize session cleanup queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "session_cleanup" 
  ON "session" ("expiresAt") 
  WHERE "expiresAt" < NOW();

-- Statistics for PostgreSQL query planner
ANALYZE "post";
ANALYZE "user";
ANALYZE "comment";
ANALYZE "term";
ANALYZE "audit_log";
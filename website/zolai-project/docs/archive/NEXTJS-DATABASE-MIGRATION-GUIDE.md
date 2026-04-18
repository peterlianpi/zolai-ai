# Next.js Starter Project - Database Migration & Schema Guide

**Version:** 1.0.0  
**Created:** 2026-04-09  
**ORM:** Prisma 7  
**Database:** PostgreSQL 14+

---

## Table of Contents

1. [Complete Prisma Schema](#complete-prisma-schema)
2. [Database Relationships](#database-relationships)
3. [Creating Migrations](#creating-migrations)
4. [Running Migrations](#running-migrations)
5. [Database Seeding](#database-seeding)
6. [Schema Best Practices](#schema-best-practices)
7. [Indexes & Performance](#indexes--performance)
8. [Data Validation](#data-validation)
9. [Backup & Restore](#backup--restore)
10. [Troubleshooting](#troubleshooting)

---

## Complete Prisma Schema

**File:** `prisma/schema.prisma`

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// AUTHENTICATION & USERS
// ============================================================================

/// User model stores all user accounts
model User {
  id                    String      @id @default(cuid())
  email                 String      @unique
  emailVerified         DateTime?
  password              String?     // Optional for OAuth users
  name                  String?
  avatar                String?     // URL to avatar image
  bio                   String?
  phone                 String?
  phoneVerified         DateTime?
  role                  UserRole    @default(USER)
  status                UserStatus  @default(ACTIVE)
  twoFactorEnabled      Boolean     @default(false)
  twoFactorSecret       String?     @db.Text
  
  // Relations
  organizations         OrgMember[]
  teams                 TeamMember[]
  posts                 Post[]
  comments              Comment[]
  sessions              Session[]
  accounts              Account[]
  preferences           UserPreference?
  auditLogs             AuditLog[]
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  lastLoginAt           DateTime?

  @@index([email])
  @@index([role])
  @@index([status])
  @@index([createdAt])
}

/// User roles for global permissions
enum UserRole {
  USER    // Regular user
  ADMIN   // Platform administrator
}

/// User account status
enum UserStatus {
  ACTIVE
  INACTIVE
  BANNED
  PENDING_VERIFICATION
}

/// User preferences and settings
model UserPreference {
  id                    String      @id @default(cuid())
  userId                String      @unique
  user                  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  theme                 Theme       @default(SYSTEM)
  language              String      @default("en")
  notificationsEmail    Boolean     @default(true)
  notificationsPush     Boolean     @default(true)
  newsletter            Boolean     @default(true)
  tablePagination       TablePagination @default(INFINITE)
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([userId])
}

enum Theme {
  LIGHT
  DARK
  SYSTEM
}

enum TablePagination {
  INFINITE
  NORMAL
}

/// Email/password authentication (Better Auth compatible)
model Account {
  id                    String      @id @default(cuid())
  userId                String
  user                  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type                  String      // e.g., "oauth", "email"
  provider              String      // e.g., "google", "github"
  providerAccountId     String
  
  refreshToken          String?     @db.Text
  accessToken           String?     @db.Text
  expiresAt             Int?
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@unique([provider, providerAccountId])
  @@index([userId])
}

/// Session management (Better Auth compatible)
model Session {
  id                    String      @id @default(cuid())
  userId                String
  user                  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  expiresAt             DateTime
  ipAddress             String?
  userAgent             String?
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([userId])
  @@index([expiresAt])
}

// ============================================================================
// ORGANIZATIONS
// ============================================================================

/// Organization (workspace/company)
model Organization {
  id                    String      @id @default(cuid())
  ownerId               String
  owner                 User        @relation(fields: [ownerId], references: [id], onDelete: Restrict)
  
  name                  String
  slug                  String      @unique
  description           String?     @db.Text
  logo                  String?     // URL to logo
  website               String?
  
  // Relations
  members               OrgMember[]
  teams                 Team[]
  settings              OrgSetting?
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([ownerId])
  @@index([slug])
  @@index([createdAt])
}

/// Organization membership with roles
model OrgMember {
  id                    String      @id @default(cuid())
  orgId                 String
  organization          Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  
  userId                String
  user                  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  role                  OrgRole     @default(MEMBER)
  
  joinedAt              DateTime    @default(now())
  invitedAt             DateTime?
  invitedBy             String?

  @@unique([orgId, userId])
  @@index([orgId])
  @@index([userId])
  @@index([role])
}

/// Organization roles with hierarchies
enum OrgRole {
  OWNER      // Full access, can delete org
  ADMIN      // Manage members, settings, content
  MEMBER     // Create/edit own content
  VIEWER     // Read-only access
}

/// Organization settings
model OrgSetting {
  id                    String      @id @default(cuid())
  orgId                 String      @unique
  organization          Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  
  billingEmail          String?
  plan                  BillingPlan @default(FREE)
  billingCycleStart     DateTime?
  billingCycleEnd       DateTime?
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([orgId])
}

enum BillingPlan {
  FREE
  STARTER
  PRO
  ENTERPRISE
}

// ============================================================================
// TEAMS
// ============================================================================

/// Team (group within organization)
model Team {
  id                    String      @id @default(cuid())
  orgId                 String
  organization          Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  
  ownerId               String
  owner                 User        @relation(fields: [ownerId], references: [id], onDelete: Restrict)
  
  name                  String
  description           String?     @db.Text
  private               Boolean     @default(false)
  
  // Relations
  members               TeamMember[]
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([orgId])
  @@index([ownerId])
  @@index([createdAt])
}

/// Team membership with roles
model TeamMember {
  id                    String      @id @default(cuid())
  teamId                String
  team                  Team        @relation(fields: [teamId], references: [id], onDelete: Cascade)
  
  userId                String
  user                  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  role                  TeamRole    @default(MEMBER)
  
  joinedAt              DateTime    @default(now())

  @@unique([teamId, userId])
  @@index([teamId])
  @@index([userId])
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

// ============================================================================
// BLOG / CONTENT MANAGEMENT
// ============================================================================

/// Blog post
model Post {
  id                    String      @id @default(cuid())
  authorId              String
  author                User        @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  title                 String
  slug                  String      @unique
  content               String      @db.Text
  excerpt               String?
  featuredImage         String?     // URL to image
  
  status                PostStatus  @default(DRAFT)
  featured              Boolean     @default(false)
  
  // SEO
  metaTitle             String?
  metaDescription       String?
  
  // Relations
  categories            PostCategory[]
  tags                  PostTag[]
  comments              Comment[]
  
  viewCount             Int         @default(0)
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  publishedAt           DateTime?

  @@index([authorId])
  @@index([slug])
  @@index([status])
  @@index([publishedAt])
  @@index([createdAt])
  @@fulltext([title, content, excerpt])  // For full-text search
}

/// Post publication status
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  SCHEDULED
}

/// Post to category relationship (many-to-many)
model PostCategory {
  id                    String      @id @default(cuid())
  postId                String
  post                  Post        @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  categoryId            String
  category              Category    @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  @@unique([postId, categoryId])
  @@index([postId])
  @@index([categoryId])
}

/// Post category
model Category {
  id                    String      @id @default(cuid())
  name                  String      @unique
  slug                  String      @unique
  description           String?     @db.Text
  icon                  String?     // Emoji or icon URL
  
  posts                 PostCategory[]
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([slug])
}

/// Post to tag relationship (many-to-many)
model PostTag {
  id                    String      @id @default(cuid())
  postId                String
  post                  Post        @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  tagId                 String
  tag                   Tag         @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@unique([postId, tagId])
  @@index([postId])
  @@index([tagId])
}

/// Tag
model Tag {
  id                    String      @id @default(cuid())
  name                  String      @unique
  slug                  String      @unique
  
  posts                 PostTag[]
  
  createdAt             DateTime    @default(now())

  @@index([slug])
}

// ============================================================================
// COMMENTS & MODERATION
// ============================================================================

/// Comment on a post
model Comment {
  id                    String      @id @default(cuid())
  postId                String
  post                  Post        @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  authorId              String
  author                User        @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  content               String      @db.Text
  
  // Moderation
  status                CommentStatus @default(PENDING)
  spamScore             Float       @default(0.0)  // 0-1 scale
  
  // Replies
  parentId              String?
  parent                Comment?    @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies               Comment[]   @relation("CommentReplies")
  
  likes                 Int         @default(0)
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([postId])
  @@index([authorId])
  @@index([status])
  @@index([spamScore])
  @@index([createdAt])
}

enum CommentStatus {
  PENDING        // Awaiting moderation
  APPROVED       // Visible to public
  SPAM           // Marked as spam
  REJECTED       // Rejected by moderator
}

// ============================================================================
// SETTINGS
// ============================================================================

/// Site-wide settings (admin only)
model SiteSetting {
  id                    String      @id @default(cuid())
  key                   String      @unique
  value                 String      @db.Text
  type                  SettingType
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
}

enum SettingType {
  STRING
  BOOLEAN
  NUMBER
  JSON
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

/// Audit log for compliance and debugging
model AuditLog {
  id                    String      @id @default(cuid())
  userId                String?
  user                  User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  action                String      // e.g., "CREATE_POST", "DELETE_USER"
  resourceType          String      // e.g., "Post", "User"
  resourceId            String?     // ID of affected resource
  
  changes               Json?       // Diff of what changed
  ipAddress             String?
  userAgent             String?
  
  createdAt             DateTime    @default(now())

  @@index([userId])
  @@index([action])
  @@index([resourceType])
  @@index([createdAt])
}

// ============================================================================
// EMAIL QUEUE
// ============================================================================

/// Email queue for async sending
model EmailQueue {
  id                    String      @id @default(cuid())
  to                    String
  subject               String
  template              String      // e.g., "verification", "password-reset"
  data                  Json?       // Template data
  
  status                EmailStatus @default(PENDING)
  attempts              Int         @default(0)
  lastError             String?
  sentAt                DateTime?
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([status])
  @@index([to])
  @@index([createdAt])
}

enum EmailStatus {
  PENDING
  SENT
  FAILED
}
```

---

## Database Relationships

### Entity-Relationship Diagram (ERD)

```
┌─────────────┐
│    User     │
│  (12 total) │
└─────────────┘
      │
      ├── has many ──→ OrgMember
      ├── has many ──→ TeamMember
      ├── has many ──→ Post
      ├── has many ──→ Comment
      ├── has many ──→ Session
      ├── has one ──→ UserPreference
      └── has many ──→ Account

┌──────────────────┐
│  Organization    │
│   (4 models)     │
└──────────────────┘
      │
      ├── has many ──→ OrgMember
      ├── has many ──→ Team
      └── has one ──→ OrgSetting

┌────────────┐
│   Team     │
│ (2 models) │
└────────────┘
      │
      └── has many ──→ TeamMember

┌──────────────────────┐
│   Post / Blog        │
│   (7 models)         │
└──────────────────────┘
      │
      ├── has many ──→ PostCategory
      ├── has many ──→ PostTag
      ├── has many ──→ Comment
      └── has one ──→ Category
      └── has one ──→ Tag
```

### Key Relationships

| Parent | Child | Cardinality | Cascade |
|--------|-------|-------------|---------|
| User → Post | 1 → Many | 1:N | DELETE CASCADE |
| User → Comment | 1 → Many | 1:N | DELETE CASCADE |
| Organization → Team | 1 → Many | 1:N | DELETE CASCADE |
| Post → Comment | 1 → Many | 1:N | DELETE CASCADE |
| Comment → Comment | 1 → Many | 1:N | DELETE CASCADE (replies) |

---

## Creating Migrations

### Step 1: Modify Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
// Add new model
model Newsletter {
  id        String   @id @default(cuid())
  email     String   @unique
  status    String   @default("SUBSCRIBED")
  
  createdAt DateTime @default(now())
  
  @@index([status])
}
```

### Step 2: Create Migration

```bash
# Create migration
bunx prisma migrate dev --name add_newsletter_model

# Prompts:
# ✔ Enter a name for the new migration: add_newsletter_model
# ✔ Your database is now in sync with your schema. Prisma has created the following migration:
#   Created prisma/migrations/20260409_add_newsletter_model/migration.sql
```

### Step 3: Review Migration SQL

**File:** `prisma/migrations/20260409_add_newsletter_model/migration.sql`

```sql
-- CreateTable "Newsletter"
CREATE TABLE "Newsletter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBSCRIBED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Newsletter_email_key" ON "Newsletter"("email");

-- CreateIndex
CREATE INDEX "Newsletter_status_idx" ON "Newsletter"("status");
```

### Step 4: Commit to Git

```bash
git add prisma/
git commit -m "feat(db): add newsletter subscription model"
```

---

## Running Migrations

### Development

```bash
# Apply pending migrations to dev database
bunx prisma migrate dev

# View migration status
bunx prisma migrate status

# Reset entire database (DESTRUCTIVE - dev only!)
bunx prisma migrate reset
```

### Staging

```bash
# Pull environment from Vercel
vercel env pull .env.staging

# Apply migrations
DATABASE_URL=$DATABASE_URL_STAGING bunx prisma migrate deploy
```

### Production

```bash
# First: Backup database
pg_dump $DATABASE_URL > backup-2026-04-09.sql

# Apply migrations
bunx prisma migrate deploy

# Verify success
bunx prisma db execute "SELECT version();"
```

---

## Database Seeding

### Seed Script

**File:** `prisma/seed.ts`

```typescript
import { PrismaClient, UserRole, OrgRole, PostStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data (dev only!)
  await prisma.$executeRaw`TRUNCATE TABLE "User", "Organization", "Post" CASCADE`;

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log("✓ Admin user created:", admin.email);

  // Create test user
  const testPassword = await bcrypt.hash("test123", 10);
  const testUser = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      password: testPassword,
      emailVerified: new Date(),
    },
  });
  console.log("✓ Test user created:", testUser.email);

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: "Acme Corp",
      slug: "acme-corp",
      description: "Leading innovators",
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: OrgRole.OWNER },
          { userId: testUser.id, role: OrgRole.MEMBER },
        ],
      },
      settings: {
        create: {
          billingEmail: "billing@acme.com",
        },
      },
    },
    include: { members: true },
  });
  console.log("✓ Organization created:", org.name);

  // Create sample posts
  const categories = await prisma.category.createMany({
    data: [
      { name: "Technology", slug: "technology" },
      { name: "Business", slug: "business" },
      { name: "Lifestyle", slug: "lifestyle" },
    ],
  });
  console.log("✓ Categories created:", categories.count);

  const tags = await prisma.tag.createMany({
    data: [
      { name: "Next.js", slug: "nextjs" },
      { name: "React", slug: "react" },
      { name: "TypeScript", slug: "typescript" },
    ],
  });
  console.log("✓ Tags created:", tags.count);

  const post1 = await prisma.post.create({
    data: {
      title: "Getting Started with Next.js",
      slug: "getting-started-nextjs",
      content: "# Next.js Starter Guide\n\nNext.js is a React framework...",
      excerpt: "Learn the basics of Next.js",
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: admin.id,
      featured: true,
      metaTitle: "Next.js Guide",
      metaDescription: "Complete guide to Next.js",
    },
  });
  console.log("✓ Sample post created:", post1.title);

  // Create comments
  const comment = await prisma.comment.create({
    data: {
      content: "Great tutorial!",
      postId: post1.id,
      authorId: testUser.id,
      status: "APPROVED",
    },
  });
  console.log("✓ Sample comment created");

  console.log("✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Run Seed

```bash
# Seed development database
bunx prisma db seed

# Or with TypeScript
tsx prisma/seed.ts

# View seeded data
bunx prisma studio
```

---

## Schema Best Practices

### 1. Always Use `@id` for Primary Keys

```prisma
// ✅ Good
model Post {
  id String @id @default(cuid())
}

// ❌ Bad - No primary key
model Post {
  title String
}
```

### 2. Use Appropriate Data Types

```prisma
// ✅ Good
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  bio       String?  @db.Text      // For long content
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ❌ Bad
model User {
  id     Int          // Should be String
  email  Varchar(255) // Use String, not Varchar
  bio    String       // Should be @db.Text for long content
}
```

### 3. Add Indexes for Foreign Keys

```prisma
// ✅ Good
model Post {
  id       String @id @default(cuid())
  authorId String
  author   User   @relation(fields: [authorId], references: [id])

  @@index([authorId])  // Index on foreign key
}

// ❌ Bad - Missing index
model Post {
  id       String @id @default(cuid())
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}
```

### 4. Set Proper Cascade Rules

```prisma
// ✅ Good - Posts deleted when user deleted
model Post {
  id       String @id @default(cuid())
  authorId String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
}

// ❌ Bad - Orphaned posts if user deleted
model Post {
  id       String @id @default(cuid())
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}
```

### 5. Use Enums for Fixed Values

```prisma
// ✅ Good
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Post {
  status PostStatus @default(DRAFT)
}

// ❌ Bad
model Post {
  status String @default("DRAFT") // No validation
}
```

### 6. Add Timestamps to Trackable Models

```prisma
// ✅ Good
model Post {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ❌ Bad - Can't track changes
model Post {
  id    String @id @default(cuid())
}
```

---

## Indexes & Performance

### Add Indexes for Queries

```prisma
model Post {
  id        String   @id @default(cuid())
  slug      String   @unique        // Unique index
  status    PostStatus
  createdAt DateTime @default(now())
  authorId  String
  author    User @relation(fields: [authorId], references: [id])

  // ✅ Indexes for common queries
  @@index([authorId])        // Faster: posts by author
  @@index([status])          // Faster: filter by status
  @@index([createdAt])       // Faster: sort by date
  @@index([status, createdAt]) // Compound index: filter + sort
}
```

### Common Index Patterns

```prisma
// 1. Foreign key indexes
@@index([userId])

// 2. Unique indexes
@@unique([email])
@@unique([slug])

// 3. Compound indexes (for WHERE + ORDER BY)
@@index([status, createdAt])

// 4. Full-text search (PostgreSQL only)
@@fulltext([title, content])

// 5. Partial indexes (PostgreSQL)
// CREATE INDEX idx_active_users ON "User"(id) WHERE status = 'ACTIVE';
```

### Performance Query Tips

```typescript
// ✅ Good - Uses indexes efficiently
const posts = await prisma.post.findMany({
  where: {
    status: "PUBLISHED",
    authorId: userId,
  },
  orderBy: { createdAt: "desc" },
  take: 10,
  select: {
    id: true,
    title: true,
    slug: true,
    createdAt: true,
  },
});

// ❌ Bad - Fetches all fields, might cause N+1
const posts = await prisma.post.findMany({
  where: {
    status: "PUBLISHED",
    author: { id: userId },
  },
  include: {
    author: true,
    comments: true,
  },
});
```

---

## Data Validation

### Prisma Validation

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique  // Ensures unique
  name  String          // Required
  bio   String?         // Optional
}
```

### Application Validation (Zod)

```typescript
// lib/schemas/user.ts
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name required").max(100),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

---

## Backup & Restore

### Automated Backups

```bash
# Daily backup (add to crontab)
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/db-$(date +\%Y-\%m-\%d).sql.gz
```

### Manual Backup

```bash
# Backup entire database
pg_dump $DATABASE_URL > backup.sql

# Backup specific table
pg_dump $DATABASE_URL -t "Post" > posts-backup.sql

# Backup with compression
pg_dump $DATABASE_URL | gzip > backup.sql.gz
```

### Restore from Backup

```bash
# Restore from SQL file
psql $DATABASE_URL < backup.sql

# Restore from compressed backup
gunzip -c backup.sql.gz | psql $DATABASE_URL

# Restore specific table
psql $DATABASE_URL < posts-backup.sql
```

---

## Troubleshooting

### Migration Conflicts

```bash
# Check migration status
bunx prisma migrate status

# If stuck, reset (dev only!)
bunx prisma migrate reset

# Resolve conflict manually
bunx prisma migrate resolve --rolled-back "migration_name"
```

### Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection string format
# postgresql://user:password@host:5432/dbname
```

### Performance Issues

```bash
# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM "Post" WHERE status = 'PUBLISHED';

# View indexes
\di  # in psql

# View table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Disk Space Issues

```bash
# Find large tables
SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::regclass)) 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(tablename::regclass) DESC;

# Archive old data
DELETE FROM "Comment" WHERE "createdAt" < NOW() - INTERVAL '2 years';
VACUUM ANALYZE;
```

---

## Summary

This guide provides:
- ✅ Complete Prisma schema for 8-feature starter
- ✅ Database relationships and ERD
- ✅ Step-by-step migration creation
- ✅ Seeding strategy with sample data
- ✅ Best practices and performance tips
- ✅ Backup/restore procedures
- ✅ Troubleshooting solutions

**Use this as your reference for all database operations.**

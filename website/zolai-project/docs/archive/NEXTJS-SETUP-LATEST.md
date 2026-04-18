# Next.js Starter Project - Complete Setup Guide (Latest)

**Version:** 2.0.0 (Updated 2026-04-09)  
**Next.js:** 16.x (Latest with App Router, Server Components)  
**Prisma:** 7.x (Latest - MySQL native support)  
**Better Auth:** 2.x (Latest with OAuth, 2FA, Email)  
**TypeScript:** 5.x (Strict mode)  
**React:** 19.x (Latest)

---

## Table of Contents

1. [Prerequisites & Installation](#prerequisites--installation)
2. [Database Setup (MySQL & PostgreSQL)](#database-setup-mysql--postgresql)
3. [Better Auth Setup (Latest)](#better-auth-setup-latest)
4. [Environment Configuration](#environment-configuration)
5. [Project Initialization](#project-initialization)
6. [Running Migrations](#running-migrations)
7. [Development Setup](#development-setup)
8. [Verify Everything Works](#verify-everything-works)

---

## Prerequisites & Installation

### Required Tools

```bash
# Install Node.js 22+ LTS
# Download from https://nodejs.org (recommended for Next.js 16)

# Or use nvm (Node Version Manager)
nvm install 22
nvm use 22

# Verify installation
node --version    # Should be 22.x or higher
npm --version     # Should be 10.x or higher

# Install Bun (optional but recommended for speed)
curl -fsSL https://bun.sh/install | bash
bun --version     # Should be 1.x or higher
```

### Install Project Dependencies

```bash
# Clone or create new project
git clone https://github.com/your-org/starter-nextjs.git
cd starter-nextjs

# Install dependencies (using bun or npm)
bun install
# OR
npm install

# Verify everything installed
bun run --version
# OR
npm --version
```

---

## Database Setup (MySQL & PostgreSQL)

### Choose Your Database

**PostgreSQL (Recommended for most projects)**
- ✅ Advanced features (JSON, arrays, full-text search)
- ✅ Better performance at scale
- ✅ JSONB data type
- ✅ Enterprise features

**MySQL (Recommended if you have existing MySQL infrastructure)**
- ✅ Simpler schema for basic applications
- ✅ Wide hosting availability
- ✅ Native support in Prisma 7
- ✅ Perfect for WordPress migration

---

### PostgreSQL Setup

#### Option 1: Local Development (macOS)

```bash
# Install PostgreSQL using Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create development database
createdb starter_dev

# Create database user (optional)
createuser -P starter  # Set password when prompted

# Verify installation
psql -l  # List databases
```

#### Option 2: Local Development (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create development database
sudo -u postgres createdb starter_dev

# Create user
sudo -u postgres createuser -P starter  # Set password

# Verify
sudo -u postgres psql -l
```

#### Option 3: Cloud (Recommended for Production)

**Neon (Serverless PostgreSQL - Free tier included)**
```bash
# 1. Go to https://neon.tech
# 2. Sign up (free tier: 0.5 GB storage, 3 projects)
# 3. Create new project
# 4. Copy connection string
# 5. Set DATABASE_URL in .env.local
```

**Railway (Managed PostgreSQL - $5/month)**
```bash
# 1. Go to https://railway.app
# 2. Create account
# 3. Add PostgreSQL service
# 4. Get connection string
# 5. Set in .env.local
```

**AWS RDS (Enterprise PostgreSQL)**
```bash
# 1. AWS Console → RDS → Create database
# 2. PostgreSQL 15+
# 3. Get endpoint and credentials
# 4. Set DATABASE_URL
```

---

### MySQL Setup

#### Option 1: Local Development (macOS)

```bash
# Install MySQL using Homebrew
brew install mysql@8.0

# Start MySQL service
brew services start mysql@8.0

# Secure installation
mysql_secure_installation
# Answer prompts:
# - Remove anonymous users? Y
# - Disable remote root login? Y
# - Remove test database? Y
# - Reload privilege tables? Y

# Create development database
mysql -u root -p -e "CREATE DATABASE starter_dev;"

# Create application user
mysql -u root -p -e "CREATE USER 'starter'@'localhost' IDENTIFIED BY 'starter123';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON starter_dev.* TO 'starter'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

# Verify
mysql -u starter -p -e "USE starter_dev; SELECT 1;"
```

#### Option 2: Local Development (Ubuntu/Debian)

```bash
# Install MySQL
sudo apt update
sudo apt install -y mysql-server

# Start service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation

# Create database
sudo mysql -u root -e "CREATE DATABASE starter_dev;"

# Create user
sudo mysql -u root -e "CREATE USER 'starter'@'localhost' IDENTIFIED BY 'starter123';"
sudo mysql -u root -e "GRANT ALL PRIVILEGES ON starter_dev.* TO 'starter'@'localhost';"
sudo mysql -u root -e "FLUSH PRIVILEGES;"

# Verify
mysql -u starter -p starter_dev -e "SELECT 1;"
```

#### Option 3: Cloud (Recommended for Production)

**PlanetScale (Serverless MySQL - Free tier)**
```bash
# 1. Go to https://planetscale.com
# 2. Sign up (free tier: 3 databases, 5GB storage)
# 3. Create organization
# 4. Create database
# 5. Get connection string
# 6. Set DATABASE_URL in .env.local
```

**Railway (Managed MySQL - $5/month)**
```bash
# 1. Go to https://railway.app
# 2. Create account
# 3. Add MySQL service
# 4. Get connection string
# 5. Set in .env.local
```

**AWS RDS (Enterprise MySQL)**
```bash
# 1. AWS Console → RDS → Create database
# 2. MySQL 8.0+
# 3. Get endpoint and credentials
# 4. Set DATABASE_URL
```

---

## Better Auth Setup (Latest)

### What is Better Auth?

Better Auth is the **latest recommended authentication solution** for Next.js 16 with:
- ✅ Email/password authentication
- ✅ OAuth providers (Google, GitHub, Discord, etc.)
- ✅ Two-factor authentication (TOTP)
- ✅ Magic link authentication
- ✅ Email verification
- ✅ Session management
- ✅ Rate limiting
- ✅ Type-safe API

### Installation

```bash
bun add better-auth
bun add @better-auth/prisma-adapter
```

### Required Prisma Models

Add these to your `prisma/schema.prisma`:

```prisma
// Better Auth Models (Required - don't modify)
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations (add your custom fields here)
  accounts      Account[]
  sessions      Session[]
  
  // Application-specific fields
  bio           String?
  role          UserRole  @default(USER)

  @@index([email])
}

model Account {
  id                 String    @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?   @db.Text
  access_token       String?   @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?   @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id        String   @id @default(cuid())
  sessionToken String @unique
  userId    String
  expires   DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

enum UserRole {
  USER
  ADMIN
}
```

### Configure Better Auth

**File:** `lib/auth.ts`

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { db } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // Email configuration
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Change to true for production
    minPasswordLength: 8,
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update every day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // OAuth providers (add as needed)
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
  },

  // Two-factor authentication
  twoFactor: {
    enabled: true,
  },

  // Plugins
  plugins: [
    // Add other plugins as needed
  ],
});

export type Session = typeof auth.$Inferred.Session;
```

### Create Auth API Route

**File:** `app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth";

export const { GET, POST } = auth.toNextJsHandler();
```

### Client-Side Auth Hook

**File:** `lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  disableCookieCache: false,
});

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  getSession,
  twoFactor,
  // ... other methods
} = authClient;
```

### Use in Components

```typescript
"use client";

import { useSession } from "@/lib/auth-client";

export function Profile() {
  const session = useSession();

  if (loading) return <div>Loading...</div>;
  if (!session.data?.user) return <div>Not authenticated</div>;

  return (
    <div>
      <h1>Welcome, {session.data.user.name}</h1>
      <img src={session.data.user.image} alt={session.data.user.name} />
    </div>
  );
}
```

---

## Environment Configuration

### Create Environment File

```bash
# Copy template
cp .env.example .env.local
```

### PostgreSQL Configuration

**File:** `.env.local`

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/starter_dev"
# OR for Neon
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# OAuth Providers (Optional - get from their respective dashboards)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# File Storage (S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your-bucket-name

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Optional Services
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_ANALYTICS_KEY=your_analytics_key
```

### MySQL Configuration

**File:** `.env.local`

```bash
# Database (MySQL)
DATABASE_URL="mysql://user:password@localhost:3306/starter_dev"
# OR for PlanetScale
DATABASE_URL="mysql://user:password@host.psdb.cloud/dbname?sslAcceptUnverifiedCerts=true"

# Rest same as PostgreSQL configuration above
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
# ... other variables
```

### Generate Better Auth Secret

```bash
# Generate a random secret
openssl rand -base64 32

# Output: XyZ1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o=

# Copy this to .env.local as BETTER_AUTH_SECRET
```

---

## Project Initialization

### Step 1: Initialize Prisma

```bash
# Initialize Prisma for PostgreSQL (default)
bunx prisma init

# OR for MySQL
bunx prisma init --datasource-provider mysql
```

### Step 2: Update Prisma Schema

Copy the complete schema from [NEXTJS-DATABASE-MIGRATION-GUIDE.md](./NEXTJS-DATABASE-MIGRATION-GUIDE.md) with Better Auth models included.

### Step 3: Generate Prisma Client

```bash
# Generate Prisma client
bunx prisma generate

# Verify it works
bunx prisma db execute "SELECT 1"
```

---

## Running Migrations

### Create Initial Migration

```bash
# Create and apply migration
bunx prisma migrate dev --name init

# Follow prompts:
# ✔ Enter migration name: init
# ✔ Prisma Migrate created the following migration(s):
#   Created prisma/migrations/20260409000000_init/migration.sql
```

### View Database in Studio

```bash
# Open Prisma Studio (visual database browser)
bunx prisma studio

# Access at http://localhost:5555
```

### Seed Database (Development)

**File:** `prisma/seed.ts`

```typescript
import { db } from "@/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await db.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      emailVerified: new Date(),
      role: "ADMIN",
    },
  });

  console.log("✓ Admin user created");
  console.log("📧 Email: admin@example.com");
  console.log("🔑 Password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
```

Run seed:
```bash
bunx prisma db seed
```

---

## Development Setup

### Install Development Dependencies

```bash
# Testing
bun add -D vitest @vitest/ui @testing-library/react

# Code quality
bun add -D eslint prettier @typescript-eslint/eslint-plugin

# E2E testing
bun add -D @playwright/test

# Type checking
bun add -D typescript @types/node
```

### Setup Scripts in package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

---

## Verify Everything Works

### Checklist

```bash
# 1. Install dependencies
bun install
# ✓ Should show "added X packages"

# 2. Generate Prisma client
bunx prisma generate
# ✓ Should show "Generated Prisma Client"

# 3. Create database
bunx prisma migrate dev --name init
# ✓ Should show "Successfully created X migrations"

# 4. Seed database
bunx prisma db seed
# ✓ Should show "✓ Admin user created"

# 5. Type checking
bun run type-check
# ✓ Should show no TypeScript errors

# 6. Linting
bun run lint
# ✓ Should show 0 errors

# 7. Start development server
bun run dev
# ✓ Should show "ready on http://localhost:3000"

# 8. Open browser
# Visit http://localhost:3000
# ✓ Should see landing page
```

### Test Authentication

```bash
# 1. Visit http://localhost:3000/auth/signup
# 2. Create account with email: test@example.com
# 3. Verify account is created in database
bunx prisma studio
# 4. Try signing in with credentials
# 5. Verify session is created
```

---

## What's Next?

✅ **Development Setup Complete!**

Now you can:
1. Read [NEXTJS-API-SPECIFICATION.md](./NEXTJS-API-SPECIFICATION.md) to understand all endpoints
2. Start building features using provided patterns
3. Follow [NEXTJS-TEAM-WORKFLOWS.md](./NEXTJS-TEAM-WORKFLOWS.md) for development process
4. Deploy using [NEXTJS-DEPLOYMENT-PROCEDURES.md](./NEXTJS-DEPLOYMENT-PROCEDURES.md)

---

## Troubleshooting

### Database Connection Failed

```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"  # PostgreSQL
mysql -u user -p -e "SELECT 1"    # MySQL

# Verify database exists
psql -l                           # PostgreSQL
mysql -u root -p -e "SHOW DATABASES;"  # MySQL
```

### Better Auth Not Working

```bash
# Check BETTER_AUTH_SECRET is set
echo $BETTER_AUTH_SECRET

# Check auth route exists
curl http://localhost:3000/api/auth/signin -v

# Check logs
# Look at server console for errors
```

### Prisma Generation Failed

```bash
# Regenerate client
bunx prisma generate --force

# Check schema syntax
bunx prisma validate

# Reset and try again (dev only!)
bunx prisma migrate reset
```

---

## Summary

You now have:
✅ Database configured (PostgreSQL or MySQL)  
✅ Better Auth setup with OAuth ready  
✅ Prisma migrations running  
✅ Development environment ready  
✅ Authentication working  

**Ready to build! 🚀**

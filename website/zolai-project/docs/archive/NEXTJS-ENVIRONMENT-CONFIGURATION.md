# Next.js Starter Project - Environment & Configuration Guide (Latest)

**Version:** 2.0.0 (Updated 2026-04-09)  
**Next.js:** 16.x (Latest)  
**Prisma:** 7.x (Latest)  
**Better Auth:** 2.x (Latest)

---

## Table of Contents

1. [Environment Variables Overview](#environment-variables-overview)
2. [Required Variables](#required-variables)
3. [Optional Variables](#optional-variables)
4. [Secret Management](#secret-management)
5. [Environment-Specific Configs](#environment-specific-configs)
6. [Feature Flags](#feature-flags)
7. [Runtime Configuration](#runtime-configuration)
8. [Verifying Configuration](#verifying-configuration)

---

## Environment Variables Overview

### Purpose

Environment variables allow your application to:
- ✅ Connect to databases
- ✅ Configure authentication
- ✅ Manage secrets securely
- ✅ Control features (feature flags)
- ✅ Set up external services
- ✅ Run different config per environment (dev/staging/prod)

### Three Types of Variables

| Type | Prefix | Usage | Example |
|------|--------|-------|---------|
| **Server-Only** | None | Server-side only | `DATABASE_URL` |
| **Public (Client)** | `NEXT_PUBLIC_` | Client & server | `NEXT_PUBLIC_API_URL` |
| **Build-Time** | None | Used during build | `DATABASE_URL` |

---

## Required Variables

### Database (Required - Choose One)

#### PostgreSQL
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
# Neon: postgresql://user:password@host.neon.tech/dbname?sslmode=require
# AWS RDS: postgresql://user:password@host.rds.amazonaws.com:5432/dbname
```

#### MySQL
```bash
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
# PlanetScale: mysql://user:password@host.psdb.cloud/dbname?sslAcceptUnverifiedCerts=true
# AWS RDS: mysql://user:password@host.rds.amazonaws.com:3306/dbname
```

### Better Auth (Required)

```bash
# Secret key for signing tokens and sessions
# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET="your-super-secret-key-here"

# Public URL for OAuth redirect URIs
BETTER_AUTH_URL="http://localhost:3000"
# Production: https://yourdomain.com
```

### Application (Required)

```bash
# Current Node environment
NODE_ENV="development"  # development, staging, production

# Log level
LOG_LEVEL="debug"  # debug, info, warn, error
```

---

## Optional Variables

### OAuth Providers (Recommended)

Configure which you'll use:

#### Google OAuth

```bash
# Get from: https://console.cloud.google.com
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

#### GitHub OAuth

```bash
# Get from: https://github.com/settings/developers
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

#### Discord OAuth

```bash
# Get from: https://discord.com/developers/applications
DISCORD_CLIENT_ID="your-discord-id"
DISCORD_CLIENT_SECRET="your-discord-secret"
```

#### Microsoft OAuth

```bash
# Get from: https://portal.azure.com
MICROSOFT_CLIENT_ID="your-microsoft-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-secret"
```

### Email Service (Recommended for Production)

#### Gmail

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
# Generate app password: https://myaccount.google.com/apppasswords
SMTP_PASSWORD="app-password-here"
SMTP_FROM="noreply@example.com"
```

#### SendGrid

```bash
SENDGRID_API_KEY="SG.xxx"
SMTP_FROM="noreply@example.com"
```

#### Mailgun

```bash
MAILGUN_API_KEY="key-xxx"
MAILGUN_DOMAIN="mail.example.com"
SMTP_FROM="noreply@example.com"
```

### AWS S3 (For File Uploads)

```bash
# Get from AWS IAM console
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
AWS_S3_BUCKET="your-bucket-name"

# Optional: CloudFront CDN
AWS_CLOUDFRONT_URL="https://d123456.cloudfront.net"
```

### Error Tracking (Sentry)

```bash
# Get from: https://sentry.io
SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
SENTRY_ENVIRONMENT="production"
SENTRY_TRACE_SAMPLE_RATE="0.1"  # 10% of transactions
```

### Analytics

```bash
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_xxx"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Vercel Analytics (auto-enabled on Vercel)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="xxx"
```

### API & Public URLs

```bash
# Public URLs for API calls from browser
NEXT_PUBLIC_API_URL="http://localhost:3000/api"  # Dev
NEXT_PUBLIC_API_URL="https://api.example.com"    # Prod

# Next.js public app URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="https://example.com"  # Prod
```

### File Upload Limits

```bash
# Maximum file size in bytes
NEXT_PUBLIC_MAX_FILE_SIZE="5242880"  # 5MB

# Allowed file types (comma-separated MIME types)
NEXT_PUBLIC_ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp"
```

---

## Secret Management

### Never Commit Secrets

❌ **Bad:** Commit `.env.local` to git
```bash
git add .env.local  # NEVER DO THIS
git commit -m "Add secrets"
```

✅ **Good:** Commit `.env.example` with placeholders
```bash
# .env.example
DATABASE_URL="postgresql://user:password@localhost/dbname"
BETTER_AUTH_SECRET="generated-secret-key"
```

### Using .gitignore

**File:** `.gitignore`
```
# Environment variables
.env
.env.local
.env.*.local
.env.production.local

# Ignore all env files except example
!.env.example
```

### Vercel Secret Management

```bash
# Set secrets in Vercel Dashboard:
# 1. Project Settings → Environment Variables
# 2. Add each secret
# 3. Select environments (Development, Preview, Production)

# Or use CLI:
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_SECRET
# Enter value when prompted
```

### AWS Secrets Manager (Enterprise)

```typescript
// lib/secrets.ts
import { SecretsManager } from "@aws-sdk/client-secrets-manager";

const secretsClient = new SecretsManager({
  region: process.env.AWS_REGION,
});

export async function getSecret(secretName: string) {
  const response = await secretsClient.getSecretValue({
    SecretId: secretName,
  });

  return response.SecretString;
}
```

### HashiCorp Vault (Enterprise)

```typescript
// lib/vault.ts
import axios from "axios";

const vaultClient = axios.create({
  baseURL: process.env.VAULT_ADDR,
  headers: {
    "X-Vault-Token": process.env.VAULT_TOKEN,
  },
});

export async function getSecret(path: string) {
  const response = await vaultClient.get(`v1/secret/data/${path}`);
  return response.data.data.data;
}
```

---

## Environment-Specific Configs

### Development Environment

**File:** `.env.local`

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/starter_dev"

# Auth
BETTER_AUTH_SECRET="dev-secret-key-change-me"
BETTER_AUTH_URL="http://localhost:3000"
NODE_ENV="development"

# APIs
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Logging
LOG_LEVEL="debug"

# File Upload
NEXT_PUBLIC_MAX_FILE_SIZE="5242880"

# Optional (can skip in dev)
# SENTRY_DSN="disabled"
# GOOGLE_CLIENT_ID="not-needed"
```

### Staging Environment

**File:** `.env.staging`

```bash
# Database (Staging DB)
DATABASE_URL="postgresql://user:password@staging-db.example.com:5432/starter"

# Auth
BETTER_AUTH_SECRET="staging-secret-key-from-vault"
BETTER_AUTH_URL="https://staging.example.com"
NODE_ENV="staging"

# APIs
NEXT_PUBLIC_API_URL="https://staging.example.com/api"
NEXT_PUBLIC_APP_URL="https://staging.example.com"

# Logging
LOG_LEVEL="info"

# Services
SENTRY_DSN="https://xxxxx@sentry.io/123456"
SENTRY_ENVIRONMENT="staging"

# OAuth (staging apps)
GOOGLE_CLIENT_ID="staging-client-id"
GOOGLE_CLIENT_SECRET="staging-secret"
```

### Production Environment

**File:** Set in Vercel/hosting dashboard

```bash
# Database (Production DB - separate credentials)
DATABASE_URL="postgresql://produser:prodpassword@prod-db.example.com:5432/starter_prod"

# Auth
BETTER_AUTH_SECRET="prod-secret-key-very-long-and-secure"
BETTER_AUTH_URL="https://example.com"
NODE_ENV="production"

# APIs
NEXT_PUBLIC_API_URL="https://example.com/api"
NEXT_PUBLIC_APP_URL="https://example.com"

# Logging
LOG_LEVEL="warn"

# Services
SENTRY_DSN="https://xxxxx@sentry.io/123456"
SENTRY_ENVIRONMENT="production"
SENTRY_TRACE_SAMPLE_RATE="0.1"

# File Storage
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="prod-bucket"
AWS_CLOUDFRONT_URL="https://cdn.example.com"

# OAuth (production apps)
GOOGLE_CLIENT_ID="prod-client-id"
GOOGLE_CLIENT_SECRET="prod-secret"
GITHUB_CLIENT_ID="prod-github-id"
GITHUB_CLIENT_SECRET="prod-github-secret"

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.xxx"
SMTP_FROM="noreply@example.com"

# Analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_xxx"
```

---

## Feature Flags

### Using Environment Variables

```typescript
// lib/features.ts
export const features = {
  // Blog feature
  BLOG_ENABLED: process.env.NEXT_PUBLIC_FEATURE_BLOG === "true",
  
  // Comments feature
  COMMENTS_ENABLED: process.env.NEXT_PUBLIC_FEATURE_COMMENTS === "true",
  
  // Team management
  TEAMS_ENABLED: process.env.NEXT_PUBLIC_FEATURE_TEAMS === "true",
  
  // OAuth providers
  GOOGLE_AUTH_ENABLED: !!process.env.GOOGLE_CLIENT_ID,
  GITHUB_AUTH_ENABLED: !!process.env.GITHUB_CLIENT_ID,
  
  // Admin features
  ADMIN_DASHBOARD_ENABLED: process.env.NEXT_PUBLIC_FEATURE_ADMIN_DASHBOARD === "true",
} as const;
```

### Using in Components

```typescript
"use client";

import { features } from "@/lib/features";

export function BlogLink() {
  if (!features.BLOG_ENABLED) {
    return null;
  }

  return <Link href="/blog">Blog</Link>;
}
```

### Using in Server Code

```typescript
// app/page.tsx
import { features } from "@/lib/features";

export default function HomePage() {
  return (
    <div>
      {features.BLOG_ENABLED && <BlogSection />}
      {features.TEAMS_ENABLED && <TeamsSection />}
    </div>
  );
}
```

### Environment Variables for Flags

```bash
# .env.local (Development - all enabled)
NEXT_PUBLIC_FEATURE_BLOG="true"
NEXT_PUBLIC_FEATURE_COMMENTS="true"
NEXT_PUBLIC_FEATURE_TEAMS="true"
NEXT_PUBLIC_FEATURE_ADMIN_DASHBOARD="true"

# .env.staging (Staging - test features)
NEXT_PUBLIC_FEATURE_BLOG="true"
NEXT_PUBLIC_FEATURE_COMMENTS="false"  # Testing this
NEXT_PUBLIC_FEATURE_TEAMS="true"

# .env.production (Prod - only stable)
NEXT_PUBLIC_FEATURE_BLOG="true"
NEXT_PUBLIC_FEATURE_COMMENTS="true"
NEXT_PUBLIC_FEATURE_TEAMS="false"  # Not ready yet
NEXT_PUBLIC_FEATURE_ADMIN_DASHBOARD="true"
```

---

## Runtime Configuration

### Next.js Configuration

**File:** `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode (catch errors in dev)
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d123456.cloudfront.net", // CloudFront
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com", // S3
      },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_VERSION: "1.0.0",
  },

  // Middleware configuration
  experimental: {
    instrumentationHook: true,
  },

  // Build optimization
  swcMinify: true,
  compress: true,

  // Headers for security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Redirect configuration
  async redirects() {
    return [
      {
        source: "/api/old/:path*",
        destination: "/api/v2/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

### TypeScript Configuration

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Prisma Configuration

**File:** `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./generated/client"
}

datasource db {
  provider = "postgresql"  # or "mysql"
  url      = env("DATABASE_URL")
}
```

---

## Verifying Configuration

### Check All Variables Are Set

```bash
# Create verification script
cat > verify-env.sh << 'EOF'
#!/bin/bash

REQUIRED=(
  "DATABASE_URL"
  "BETTER_AUTH_SECRET"
  "BETTER_AUTH_URL"
  "NODE_ENV"
)

MISSING=()

for var in "${REQUIRED[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING+=("$var")
  fi
done

if [ ${#MISSING[@]} -ne 0 ]; then
  echo "❌ Missing required variables:"
  for var in "${MISSING[@]}"; do
    echo "   - $var"
  done
  exit 1
else
  echo "✅ All required variables are set"
fi
EOF

chmod +x verify-env.sh
./verify-env.sh
```

### Test Database Connection

```typescript
// lib/test-connection.ts
import { db } from "@/lib/prisma";

export async function testDatabaseConnection() {
  try {
    await db.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}
```

### Test Better Auth

```bash
# Test auth endpoint
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Should return session token
```

---

## Summary

This guide provides:
- ✅ All required environment variables
- ✅ Optional variables for features
- ✅ Secret management best practices
- ✅ Environment-specific configs (dev/staging/prod)
- ✅ Feature flags for gradual rollout
- ✅ Configuration files (Next.js, TypeScript, Prisma)
- ✅ Verification procedures

**You're ready to configure any environment! 🚀**

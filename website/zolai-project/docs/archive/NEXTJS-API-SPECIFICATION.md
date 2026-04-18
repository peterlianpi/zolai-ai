# Next.js Starter Project - API Specification

**Version:** 1.0.0  
**Last Updated:** 2026-04-09  
**Framework:** Next.js 16 (App Router)  
**API Layer:** Hono  
**Database:** Prisma + PostgreSQL  
**Auth:** Better Auth

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Conventions](#api-conventions)
4. [Feature 1: Authentication](#feature-1-authentication)
5. [Feature 2: User Management](#feature-2-user-management)
6. [Feature 3: Organization Management](#feature-3-organization-management)
7. [Feature 4: Team Management](#feature-4-team-management)
8. [Feature 5: Blog/CMS](#feature-5-blogcms)
9. [Feature 6: Settings](#feature-6-settings)
10. [Feature 7: Admin Dashboard](#feature-7-admin-dashboard)
11. [OpenAPI 3.0 Specification](#openapi-30-specification)

---

## Overview

This API powers the 8-feature Next.js starter project:
- ✅ Authentication & Authorization (email/password, OAuth, 2FA)
- ✅ User Management (profiles, preferences, security)
- ✅ Organization Management (workspaces, members, roles)
- ✅ Team Management (teams within orgs)
- ✅ Blog/CMS System (posts, categories, tags, comments, moderation)
- ✅ Settings (account, security, notifications, org, team)
- ✅ Admin Dashboard (users, content, analytics, audit logs)
- ✅ Landing Page (SEO, testimonials, pricing)

**Base URL:** `/api`  
**Response Format:** JSON  
**Status Codes:** Standard HTTP (200, 201, 204, 400, 401, 403, 404, 409, 422, 500)

---

## Authentication

All endpoints (except auth & landing) require **Bearer token** in Authorization header:

```
Authorization: Bearer <access_token>
```

Tokens are issued by `/api/auth/*` endpoints and stored in HTTP-only cookies (for security).

### Token Claims
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "roles": ["USER"],
  "org_id": "org_123",
  "team_id": "team_456"
}
```

### Refresh Token Flow
```
POST /api/auth/refresh
→ Returns new access_token
```

---

## API Conventions

### Request/Response Format

**Success Response (200/201):**
```json
{
  "success": true,
  "data": { /* response payload */ }
}
```

**Error Response (4xx/5xx):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### Pagination

List endpoints support pagination:

```
GET /api/posts?page=1&limit=10&sort=created_at:desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [ /* array of items */ ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  }
}
```

### Filtering & Sorting

**Filters:** `?status=published&category=tech`  
**Sort:** `?sort=created_at:desc` or `?sort=title:asc`  
**Search:** `?search=keyword` (searches across text fields)

### Rate Limiting

- **Public endpoints:** 100 requests/hour per IP
- **Authenticated endpoints:** 1000 requests/hour per user
- **Admin endpoints:** 5000 requests/hour per user

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1712694000
```

### Validation

All inputs validated with Zod schemas. Validation errors return 422 with details:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "password", "message": "Must be at least 8 characters" }
    ]
  }
}
```

---

## Feature 1: Authentication

### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "email_verified": false,
      "created_at": "2026-04-09T10:30:00Z"
    },
    "session": {
      "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh_token": "ref_xxx",
      "expires_at": "2026-04-10T10:30:00Z"
    }
  }
}
```

**Validation:**
- Email: Required, valid email format, unique
- Password: 8-128 chars, must include uppercase, lowercase, number, special char
- Name: Required, 2-100 chars

**Errors:**
- `409 Conflict`: Email already registered
- `422 Unprocessable Entity`: Validation failed

---

### Sign In
```
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "email_verified": true
    },
    "session": {
      "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh_token": "ref_xxx",
      "expires_at": "2026-04-10T10:30:00Z"
    }
  }
}
```

**Errors:**
- `401 Unauthorized`: Invalid email/password
- `422 Unprocessable Entity`: Validation failed

---

### Sign Out
```
POST /api/auth/signout
Authorization: Bearer <token>
```

**Response (204):** No content

---

### Verify Email
```
POST /api/auth/verify-email
Content-Type: application/json

{
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "verified": true
  }
}
```

---

### Send Verification Email
```
POST /api/auth/send-verification-email
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sent": true
  }
}
```

---

### Reset Password Request
```
POST /api/auth/reset-password-request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password reset email sent"
  }
}
```

---

### Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

---

### Enable 2FA
```
POST /api/auth/2fa/enable
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEBLW64TMMQ...",
    "qr_code_url": "data:image/png;base64,iVBORw0KGgoA...",
    "backup_codes": [
      "1234-5678",
      "2345-6789",
      ...
    ]
  }
}
```

---

### Verify 2FA
```
POST /api/auth/2fa/verify
Content-Type: application/json

{
  "token": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "verified": true
  }
}
```

---

### Disable 2FA
```
POST /api/auth/2fa/disable
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "disabled": true
  }
}
```

---

## Feature 2: User Management

### Get Current User
```
GET /api/users/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://cdn.example.com/avatars/user_123.jpg",
    "bio": "Software engineer",
    "email_verified": true,
    "phone": "+1234567890",
    "phone_verified": false,
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-04-09T15:45:00Z"
  }
}
```

---

### Update Profile
```
PATCH /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "avatar": "https://cdn.example.com/avatars/new.jpg",
  "bio": "Full-stack engineer",
  "phone": "+1234567890"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Smith",
    "avatar": "https://cdn.example.com/avatars/new.jpg",
    "bio": "Full-stack engineer",
    "phone": "+1234567890"
  }
}
```

---

### Get User Preferences
```
GET /api/users/me/preferences
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "theme": "dark",
    "language": "en",
    "notifications_email": true,
    "notifications_push": false,
    "newsletter": true,
    "table_pagination": "infinite"
  }
}
```

---

### Update User Preferences
```
PATCH /api/users/me/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "theme": "light",
  "notifications_email": false,
  "table_pagination": "normal"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "theme": "light",
    "language": "en",
    "notifications_email": false,
    "notifications_push": false,
    "newsletter": true,
    "table_pagination": "normal"
  }
}
```

---

### Get Security Settings
```
GET /api/users/me/security
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "two_fa_enabled": true,
    "password_last_changed": "2026-03-15T10:30:00Z",
    "sessions": [
      {
        "id": "session_123",
        "device": "Chrome on Windows",
        "ip": "192.168.1.1",
        "last_active": "2026-04-09T15:45:00Z",
        "is_current": true
      }
    ]
  }
}
```

---

### Revoke Session
```
DELETE /api/users/me/sessions/:sessionId
Authorization: Bearer <token>
```

**Response (204):** No content

---

### List Users (Admin)
```
GET /api/users?page=1&limit=10&sort=created_at:desc&search=john
Authorization: Bearer <token>
X-Admin-Role: true
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "user_123",
        "email": "john@example.com",
        "name": "John Doe",
        "created_at": "2026-01-15T10:30:00Z",
        "role": "USER"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  }
}
```

---

## Feature 3: Organization Management

### Create Organization
```
POST /api/organizations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "description": "Leading innovators in tech",
  "website": "https://acme.example.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "org_123",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "description": "Leading innovators in tech",
    "website": "https://acme.example.com",
    "owner_id": "user_123",
    "created_at": "2026-04-09T10:30:00Z"
  }
}
```

**Validation:**
- Name: Required, 2-100 chars
- Slug: Required, unique, lowercase alphanumeric + hyphens
- Website: Valid URL (optional)

**Errors:**
- `409 Conflict`: Slug already exists
- `422 Unprocessable Entity`: Validation failed

---

### Get Organization
```
GET /api/organizations/:orgId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "org_123",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "description": "Leading innovators in tech",
    "website": "https://acme.example.com",
    "owner_id": "user_123",
    "member_count": 15,
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

---

### Update Organization
```
PATCH /api/organizations/:orgId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corporation",
  "description": "Updated description",
  "website": "https://acmecorp.example.com"
}
```

**Response (200):** Updated org object

**Authorization:** Must be org owner or admin

---

### Delete Organization
```
DELETE /api/organizations/:orgId
Authorization: Bearer <token>
```

**Response (204):** No content

**Authorization:** Must be org owner  
**Side Effects:** Deletes all teams, members, content, settings for this org

---

### List Org Members
```
GET /api/organizations/:orgId/members?page=1&limit=20
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "member_123",
        "user": {
          "id": "user_456",
          "email": "member@example.com",
          "name": "Jane Smith"
        },
        "role": "OWNER",
        "permissions": ["users:read", "users:write", "orgs:manage"],
        "joined_at": "2026-01-15T10:30:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

### Invite Member to Organization
```
POST /api/organizations/:orgId/invitations
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newmember@example.com",
  "role": "MEMBER"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "invite_123",
    "email": "newmember@example.com",
    "role": "MEMBER",
    "token": "inv_xxx",
    "expires_at": "2026-04-16T10:30:00Z"
  }
}
```

---

### Accept Invitation
```
POST /api/organizations/:orgId/invitations/:inviteId/accept
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "inv_xxx"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "organization": { /* org object */ },
    "member": { /* member object */ }
  }
}
```

---

### Update Member Role
```
PATCH /api/organizations/:orgId/members/:memberId
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "ADMIN"
}
```

**Response (200):** Updated member object

**Roles:** `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`  
**Authorization:** Must be org owner or admin

---

### Remove Member from Organization
```
DELETE /api/organizations/:orgId/members/:memberId
Authorization: Bearer <token>
```

**Response (204):** No content

**Authorization:** Must be org owner or admin

---

## Feature 4: Team Management

### Create Team
```
POST /api/organizations/:orgId/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Engineering",
  "description": "Backend & frontend developers",
  "private": false
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "team_123",
    "org_id": "org_123",
    "name": "Engineering",
    "description": "Backend & frontend developers",
    "private": false,
    "owner_id": "user_123",
    "member_count": 1,
    "created_at": "2026-04-09T10:30:00Z"
  }
}
```

---

### Get Team
```
GET /api/teams/:teamId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "team_123",
    "org_id": "org_123",
    "name": "Engineering",
    "description": "Backend & frontend developers",
    "private": false,
    "owner_id": "user_123",
    "member_count": 5,
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

---

### Update Team
```
PATCH /api/teams/:teamId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Engineering & Design",
  "description": "Updated description"
}
```

**Response (200):** Updated team object

---

### Delete Team
```
DELETE /api/teams/:teamId
Authorization: Bearer <token>
```

**Response (204):** No content

**Authorization:** Must be team owner  
**Side Effects:** Removes all members, associated content

---

### List Team Members
```
GET /api/teams/:teamId/members?page=1&limit=20
Authorization: Bearer <token>
```

**Response (200):** Same as org members structure

---

### Add Member to Team
```
POST /api/teams/:teamId/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": "user_456",
  "role": "MEMBER"
}
```

**Response (201):** Member object

---

### Update Team Member Role
```
PATCH /api/teams/:teamId/members/:memberId
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "ADMIN"
}
```

**Response (200):** Updated member object

---

### Remove Member from Team
```
DELETE /api/teams/:teamId/members/:memberId
Authorization: Bearer <token>
```

**Response (204):** No content

---

## Feature 5: Blog/CMS

### Create Post
```
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Getting Started with Next.js",
  "slug": "getting-started-nextjs",
  "content": "## Introduction\n\nNext.js is a React framework...",
  "excerpt": "Learn the basics of Next.js",
  "featured_image": "https://cdn.example.com/images/nextjs.jpg",
  "status": "DRAFT",
  "categories": ["web-development", "nextjs"],
  "tags": ["react", "framework", "tutorial"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "post_123",
    "title": "Getting Started with Next.js",
    "slug": "getting-started-nextjs",
    "content": "## Introduction\n\nNext.js is a React framework...",
    "excerpt": "Learn the basics of Next.js",
    "featured_image": "https://cdn.example.com/images/nextjs.jpg",
    "status": "DRAFT",
    "author": {
      "id": "user_123",
      "name": "John Doe",
      "avatar": "https://cdn.example.com/avatars/user_123.jpg"
    },
    "categories": [
      { "id": "cat_1", "name": "web-development", "slug": "web-development" }
    ],
    "tags": [
      { "id": "tag_1", "name": "react", "slug": "react" }
    ],
    "comment_count": 0,
    "created_at": "2026-04-09T10:30:00Z",
    "updated_at": "2026-04-09T10:30:00Z",
    "published_at": null
  }
}
```

**Validation:**
- Title: Required, 3-500 chars
- Slug: Required, unique, lowercase + hyphens
- Content: Required, minimum 100 chars
- Status: `DRAFT`, `PUBLISHED`, `ARCHIVED`

---

### Publish Post
```
PATCH /api/posts/:postId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "PUBLISHED"
}
```

**Response (200):** Updated post with `published_at` timestamp

---

### Get Post
```
GET /api/posts/:postSlug
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "post_123",
    "title": "Getting Started with Next.js",
    "slug": "getting-started-nextjs",
    "content": "## Introduction\n\nNext.js is a React framework...",
    "excerpt": "Learn the basics of Next.js",
    "featured_image": "https://cdn.example.com/images/nextjs.jpg",
    "status": "PUBLISHED",
    "author": { /* ... */ },
    "categories": [ /* ... */ ],
    "tags": [ /* ... */ ],
    "comment_count": 5,
    "comments": [ /* see comments section */ ],
    "created_at": "2026-04-09T10:30:00Z",
    "published_at": "2026-04-09T10:31:00Z"
  }
}
```

---

### List Posts
```
GET /api/posts?page=1&limit=10&status=PUBLISHED&category=nextjs&sort=published_at:desc
```

**Query Params:**
- `status`: `DRAFT`, `PUBLISHED`, `ARCHIVED`
- `category`: Filter by category slug
- `tag`: Filter by tag slug
- `author_id`: Filter by author
- `search`: Search title/content/excerpt
- `sort`: `published_at:desc`, `created_at:desc`, `title:asc`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [ /* array of posts */ ],
    "pagination": { /* ... */ }
  }
}
```

---

### Update Post
```
PATCH /api/posts/:postId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "status": "PUBLISHED"
}
```

**Response (200):** Updated post object

**Authorization:** Must be post author, org admin, or site admin

---

### Delete Post
```
DELETE /api/posts/:postId
Authorization: Bearer <token>
```

**Response (204):** No content

---

### Create Comment
```
POST /api/posts/:postId/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great tutorial, thanks!",
  "parent_id": null
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "comment_123",
    "post_id": "post_123",
    "author": {
      "id": "user_456",
      "name": "Jane Smith",
      "avatar": "https://cdn.example.com/avatars/user_456.jpg"
    },
    "content": "Great tutorial, thanks!",
    "status": "APPROVED",
    "spam_score": 0.0,
    "likes": 0,
    "created_at": "2026-04-09T10:30:00Z"
  }
}
```

**Moderation:**
- Comments checked for spam (score 0-1)
- Threshold > 0.8 marked as `SPAM` and hidden
- Manual moderation available in admin

---

### List Comments for Post
```
GET /api/posts/:postId/comments?page=1&limit=20&sort=created_at:desc
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [ /* array of comments */ ],
    "pagination": { /* ... */ }
  }
}
```

---

### Update Comment
```
PATCH /api/comments/:commentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated comment"
}
```

**Response (200):** Updated comment object

---

### Delete Comment
```
DELETE /api/comments/:commentId
Authorization: Bearer <token>
```

**Response (204):** No content

---

### Moderate Comment (Admin)
```
PATCH /api/comments/:commentId/moderate
Authorization: Bearer <token>
X-Admin-Role: true
Content-Type: application/json

{
  "status": "APPROVED",
  "spam_score": 0.1
}
```

**Response (200):** Updated comment object

**Statuses:** `PENDING`, `APPROVED`, `SPAM`, `REJECTED`

---

### Create Category
```
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Web Development",
  "slug": "web-development",
  "description": "Web dev tutorials"
}
```

**Response (201):** Category object

---

### List Categories
```
GET /api/categories
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_1",
      "name": "Web Development",
      "slug": "web-development",
      "description": "Web dev tutorials",
      "post_count": 12
    }
  ]
}
```

---

### Create Tag
```
POST /api/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "React",
  "slug": "react"
}
```

**Response (201):** Tag object

---

### List Tags
```
GET /api/tags?sort=post_count:desc
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "tag_1",
      "name": "React",
      "slug": "react",
      "post_count": 25
    }
  ]
}
```

---

## Feature 6: Settings

### Get Settings
```
GET /api/settings
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "account": {
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://cdn.example.com/avatars/user_123.jpg"
    },
    "security": {
      "two_fa_enabled": true,
      "password_last_changed": "2026-03-15T10:30:00Z"
    },
    "notifications": {
      "email_marketing": true,
      "email_updates": true,
      "push_enabled": false
    },
    "organization": {
      "name": "Acme Corp",
      "billing_email": "billing@acme.example.com",
      "plan": "PRO"
    }
  }
}
```

---

### Update Account Settings
```
PATCH /api/settings/account
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "avatar": "https://cdn.example.com/avatars/new.jpg"
}
```

**Response (200):** Updated account object

---

### Update Security Settings
```
PATCH /api/settings/security
Authorization: Bearer <token>
Content-Type: application/json

{
  "change_password": {
    "current_password": "OldPass123!",
    "new_password": "NewPass456!"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully"
  }
}
```

---

### Update Notification Settings
```
PATCH /api/settings/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "email_marketing": false,
  "email_updates": true,
  "push_enabled": true
}
```

**Response (200):** Updated notifications object

---

### Update Organization Settings
```
PATCH /api/organizations/:orgId/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corporation",
  "billing_email": "newbilling@acme.example.com"
}
```

**Response (200):** Updated org settings object

**Authorization:** Must be org owner or admin

---

## Feature 7: Admin Dashboard

### Get Dashboard Stats
```
GET /api/admin/dashboard/stats
Authorization: Bearer <token>
X-Admin-Role: true
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "active_last_30_days": 890,
      "new_this_month": 120,
      "growth_rate": 10.5
    },
    "organizations": {
      "total": 180,
      "active": 165,
      "new_this_month": 25
    },
    "posts": {
      "total": 450,
      "published": 420,
      "drafted": 30
    },
    "comments": {
      "total": 3200,
      "pending_moderation": 45,
      "spam": 120
    },
    "revenue": {
      "total_mrr": 45000,
      "new_subscriptions": 8,
      "churn_rate": 2.5
    }
  }
}
```

---

### List Users (Admin)
```
GET /api/admin/users?page=1&limit=20&sort=created_at:desc&search=john&role=USER
Authorization: Bearer <token>
X-Admin-Role: true
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "user_123",
        "email": "john@example.com",
        "name": "John Doe",
        "role": "USER",
        "status": "ACTIVE",
        "organizations": 3,
        "created_at": "2026-01-15T10:30:00Z",
        "last_login": "2026-04-09T15:45:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

### Get User Details (Admin)
```
GET /api/admin/users/:userId
Authorization: Bearer <token>
X-Admin-Role: true
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "john@example.com",
    "name": "John Doe",
    "avatar": "https://cdn.example.com/avatars/user_123.jpg",
    "role": "USER",
    "status": "ACTIVE",
    "email_verified": true,
    "two_fa_enabled": true,
    "organizations": [
      {
        "id": "org_123",
        "name": "Acme Corp",
        "role": "OWNER"
      }
    ],
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-04-09T15:45:00Z",
    "last_login": "2026-04-09T15:45:00Z"
  }
}
```

---

### Update User (Admin)
```
PATCH /api/admin/users/:userId
Authorization: Bearer <token>
X-Admin-Role: true
Content-Type: application/json

{
  "role": "ADMIN",
  "status": "ACTIVE"
}
```

**Response (200):** Updated user object

---

### List Posts (Admin)
```
GET /api/admin/posts?page=1&limit=20&status=PUBLISHED&sort=created_at:desc
Authorization: Bearer <token>
X-Admin-Role: true
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "post_123",
        "title": "Getting Started with Next.js",
        "status": "PUBLISHED",
        "author": { /* ... */ },
        "comment_count": 5,
        "created_at": "2026-04-09T10:30:00Z",
        "published_at": "2026-04-09T10:31:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

### List Comments Pending Moderation (Admin)
```
GET /api/admin/comments?page=1&limit=20&status=PENDING
Authorization: Bearer <token>
X-Admin-Role: true
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "comment_123",
        "post": {
          "id": "post_456",
          "title": "Post Title",
          "slug": "post-title"
        },
        "author": { /* ... */ },
        "content": "Comment text",
        "spam_score": 0.15,
        "status": "PENDING",
        "created_at": "2026-04-09T10:30:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

### Bulk Moderate Comments (Admin)
```
POST /api/admin/comments/bulk-moderate
Authorization: Bearer <token>
X-Admin-Role: true
Content-Type: application/json

{
  "comment_ids": ["comment_123", "comment_456"],
  "status": "APPROVED"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "updated": 2,
    "message": "2 comments approved"
  }
}
```

---

### Get Audit Logs (Admin)
```
GET /api/admin/audit-logs?page=1&limit=50&action=DELETE_POST&sort=created_at:desc
Authorization: Bearer <token>
X-Admin-Role: true
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "log_123",
        "user": {
          "id": "user_123",
          "email": "admin@example.com",
          "name": "Admin User"
        },
        "action": "DELETE_POST",
        "resource_type": "POST",
        "resource_id": "post_456",
        "changes": {
          "title": "Old Title",
          "status": "PUBLISHED"
        },
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2026-04-09T10:30:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

**Actions:** `CREATE_POST`, `UPDATE_POST`, `DELETE_POST`, `CREATE_COMMENT`, `DELETE_COMMENT`, `UPDATE_USER`, `DELETE_USER`, etc.

---

## OpenAPI 3.0 Specification

```yaml
openapi: 3.0.0
info:
  title: Next.js Starter Project API
  version: 1.0.0
  description: Complete API for 8-feature SaaS starter project
  contact:
    name: Support
    url: https://support.example.com
servers:
  - url: https://api.example.com
    description: Production
  - url: http://localhost:3000/api
    description: Development
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    Error:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
              example: VALIDATION_ERROR
            message:
              type: string
              example: Validation failed
            details:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                  message:
                    type: string
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
        name:
          type: string
        avatar:
          type: string
          nullable: true
        email_verified:
          type: boolean
        created_at:
          type: string
          format: date-time
    Post:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        slug:
          type: string
        content:
          type: string
        status:
          type: string
          enum: [DRAFT, PUBLISHED, ARCHIVED]
        author:
          $ref: '#/components/schemas/User'
        created_at:
          type: string
          format: date-time
paths:
  /auth/signup:
    post:
      summary: Sign up a new user
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
                name:
                  type: string
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      user:
                        $ref: '#/components/schemas/User'
        '409':
          description: Email already exists
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
  /posts:
    get:
      summary: List all posts
      tags: [Blog]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
          description: Page number
        - name: limit
          in: query
          schema:
            type: integer
          description: Items per page
        - name: status
          in: query
          schema:
            type: string
            enum: [DRAFT, PUBLISHED, ARCHIVED]
      responses:
        '200':
          description: List of posts
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      items:
                        type: array
                        items:
                          $ref: '#/components/schemas/Post'
    post:
      summary: Create a new post
      tags: [Blog]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                slug:
                  type: string
                content:
                  type: string
                status:
                  type: string
      responses:
        '201':
          description: Post created
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/Post'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
security:
  - bearerAuth: []
```

---

## Summary

This API specification covers all 8 features with:
- ✅ 50+ endpoints
- ✅ Complete request/response examples
- ✅ Error handling & status codes
- ✅ Validation rules
- ✅ Authorization rules
- ✅ Rate limiting
- ✅ OpenAPI 3.0 spec
- ✅ RBAC system (global + org + team)

**Next Steps:**
1. Generate client code using OpenAPI generators
2. Implement in Next.js Hono API routes
3. Add comprehensive testing
4. Deploy to production

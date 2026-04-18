# Starter Project Architecture: Complete Feature-Based System

This document outlines the complete architecture for a reusable starter project with comprehensive features, suitable for any framework and platform.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Features](#core-features)
3. [Architecture Patterns](#architecture-patterns)
4. [Module Structure](#module-structure)
5. [Data Models](#data-models)
6. [Authentication & Authorization](#authentication--authorization)
7. [Admin Dashboard](#admin-dashboard)
8. [Page Structure](#page-structure)

---

## Project Overview

### Vision

A complete, production-ready starter project that includes:
- Full-featured blog system with content management
- User management with profiles and preferences
- Organization/workspace management
- Team collaboration features
- Role-based access control (RBAC)
- Complete admin dashboard
- Professional landing page
- Authentication & authorization
- Settings management

### Reusability

This starter is:
- **Framework-agnostic** → Works with Next.js, FastAPI, Rails, Django, etc.
- **Feature-complete** → 80% of typical SaaS boilerplate
- **Pattern-based** → MVC, MVVC, modular architectures
- **Customizable** → Remove/add features as needed
- **Documented** → Every pattern explained

---

## Core Features

### 1. Authentication & Authorization

**Features:**
- Email/password authentication
- Social login (Google, GitHub, etc.) — optional
- 2FA (Two-Factor Authentication) — optional
- Session management
- Token-based API auth
- Role-based access control (RBAC)
- Permission management

**Pages/Routes:**
```
/auth/login                 # Login page
/auth/signup                # Registration page
/auth/forgot-password       # Password reset
/auth/reset-password        # Password recovery link
/auth/verify-email          # Email verification
/auth/2fa-setup             # 2FA setup
/auth/2fa-verify            # 2FA verification
```

### 2. User Management System

**Features:**
- User profiles (name, bio, avatar, email)
- User preferences (theme, language, notifications)
- Password management
- Account deletion
- Activity logs
- Profile customization
- Badge/achievements system (optional)

**Database Models:**
```
User
├── id, email, password_hash
├── name, bio, avatar_url
├── role (user, admin)
├── created_at, updated_at
└── is_active, is_verified

UserProfile
├── user_id
├── bio, avatar_url, theme, language
└── notification_preferences

UserActivity
├── user_id
├── action, resource, timestamp
└── ip_address, user_agent

UserSession
├── user_id, token, expires_at
└── device_info, last_activity
```

### 3. Organization Management

**Features:**
- Create and manage organizations/workspaces
- Organization settings (name, logo, branding)
- Organization members management
- Subscription/billing info
- Organization activity logs

**Database Models:**
```
Organization
├── id, name, slug
├── logo_url, branding_color
├── owner_id (User)
├── subscription_tier
└── created_at, updated_at

OrganizationMember
├── id, organization_id, user_id
├── role (owner, admin, member, viewer)
├── joined_at
└── is_active

OrganizationInvite
├── id, organization_id
├── email, role, token
├── expires_at, accepted_at
└── invited_by (User)
```

### 4. Team Management

**Features:**
- Create teams within organizations
- Team members with different roles
- Team settings and management
- Team activity tracking
- Nested team structure (optional)

**Database Models:**
```
Team
├── id, organization_id
├── name, description
├── owner_id (User)
└── created_at, updated_at

TeamMember
├── id, team_id, user_id
├── role (owner, admin, member, viewer)
├── joined_at
└── is_active

TeamRole
├── id, team_id, name
├── permissions (JSON array)
└── created_at, updated_at
```

### 5. Blog/Content Management System

**Features:**
- Create, edit, publish blog posts
- Draft/published/archived states
- Rich text editor (markdown, HTML)
- Categories and tags
- Featured images
- Author information
- Comments and moderation (optional)
- View tracking
- SEO metadata

**Database Models:**
```
Post
├── id, author_id (User)
├── title, slug, content
├── status (draft, published, archived)
├── featured_image_url
├── category_id
├── published_at, updated_at
├── view_count
└── is_featured

PostTag
├── id, post_id, tag_id
└── created_at

Tag
├── id, name, slug
├── description
└── post_count

Category
├── id, name, slug
├── description, parent_id
└── post_count

PostComment
├── id, post_id, user_id
├── content, status (approved, pending, spam)
├── parent_id (for nested comments)
├── created_at, updated_at
└── is_deleted
```

### 6. Settings Management

**Features:**
- User settings (profile, notifications, security)
- Organization settings (general, billing, members)
- Team settings (general, members)
- Permission/capability management
- Audit logs

**Settings Pages:**
```
/settings/account              # Profile, email, password
/settings/notifications        # Email preferences, notification channels
/settings/security             # 2FA, sessions, login history
/settings/preferences          # Theme, language, timezone
/settings/org                  # Organization info
/settings/org/members          # Manage organization members
/settings/org/billing          # Subscription, payment methods
/settings/org/audit            # Activity logs
/settings/org/api-keys         # API key management (optional)
/settings/team                 # Team info
/settings/team/members         # Manage team members
/settings/integrations         # Connected services (optional)
```

### 7. Admin Dashboard

**Features:**
- User management (view, deactivate, delete)
- Organization management
- Team management
- Post moderation
- System analytics
- Settings management
- Audit logs

**Admin Pages:**
```
/admin                          # Dashboard home
/admin/users                    # User list and management
/admin/users/[id]              # User detail page
/admin/organizations           # Organization list
/admin/organizations/[id]      # Organization details
/admin/teams                   # Team list
/admin/posts                   # Post moderation
/admin/comments                # Comment moderation
/admin/analytics               # System analytics
/admin/settings                # System settings
/admin/audit-logs             # System audit logs
/admin/roles                   # Role and permission management
```

### 8. Landing Page

**Features:**
- Hero section
- Features showcase
- Pricing (if applicable)
- Call-to-action
- Newsletter signup
- Footer with links

---

## Architecture Patterns

### Pattern Options

The starter supports multiple architectural patterns:

#### 1. MVC (Model-View-Controller)

**Best for:** Rails, Laravel, Django, traditional frameworks

```
app/
├── models/
│   ├── user.rb
│   ├── organization.rb
│   └── post.rb
├── views/
│   ├── posts/
│   │   ├── index.html.erb
│   │   └── show.html.erb
│   └── users/
│       └── profile.html.erb
└── controllers/
    ├── posts_controller.rb
    ├── users_controller.rb
    └── organizations_controller.rb
```

#### 2. MVVC (Model-View-ViewModel-Controller)

**Best for:** WPF, XAML-based frameworks

```
app/
├── models/
│   └── [data models]
├── views/
│   ├── Posts/
│   │   ├── PostsList.xaml
│   │   └── PostDetail.xaml
│   └── Users/
│       └── UserProfile.xaml
├── viewmodels/
│   ├── PostListViewModel.cs
│   ├── PostDetailViewModel.cs
│   └── UserProfileViewModel.cs
└── controllers/
    └── [API/command handlers]
```

#### 3. Modular/Feature-Sliced

**Best for:** Next.js, React, modern frameworks

```
features/
├── auth/
│   ├── components/
│   ├── hooks/
│   ├── api/
│   ├── server/
│   └── types.ts
├── blog/
│   ├── components/
│   ├── hooks/
│   ├── api/
│   └── types.ts
├── users/
│   ├── components/
│   ├── hooks/
│   ├── api/
│   └── types.ts
├── organizations/
│   └── [feature structure]
└── admin/
    └── [feature structure]
```

#### 4. Layered/N-Tier

**Best for:** .NET, Enterprise applications

```
Presentation/
├── Controllers/
├── Views/
└── ViewModels/

Application/
├── UseCases/
├── Services/
└── DTOs/

Domain/
├── Models/
├── Entities/
└── ValueObjects/

Infrastructure/
├── Repositories/
├── Database/
└── ExternalServices/
```

#### 5. Clean Architecture

**Best for:** Large-scale applications

```
entities/              # Business rules, most stable
use_cases/            # Application business rules
interface_adapters/   # Controllers, gateways, presenters
frameworks/           # Web, DB, UI, external frameworks
```

#### 6. Domain-Driven Design (DDD)

**Best for:** Complex domains

```
bounded_contexts/
├── user_management/
│   ├── domain/
│   │   ├── user.py
│   │   └── user_repository.py
│   ├── application/
│   │   ├── register_user.py
│   │   └── user_service.py
│   └── infrastructure/
│       └── user_repository_impl.py
├── blog/
│   └── [bounded context structure]
└── organizations/
    └── [bounded context structure]
```

---

## Module Structure

### Recommended Feature-Based Organization

```
project/
├── public/
│   ├── landing/                 # Landing page assets
│   └── images/
│
├── features/                    # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── 2FASetup.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useLogin.ts
│   │   ├── api/
│   │   │   ├── login.ts
│   │   │   ├── signup.ts
│   │   │   └── verify-otp.ts
│   │   ├── server/
│   │   │   ├── auth-service.ts
│   │   │   └── session-manager.ts
│   │   ├── types.ts
│   │   └── README.md
│   │
│   ├── users/
│   │   ├── components/
│   │   │   ├── UserProfile.tsx
│   │   │   ├── EditProfile.tsx
│   │   │   └── UserSettings.tsx
│   │   ├── hooks/
│   │   │   ├── useUser.ts
│   │   │   └── useUserProfile.ts
│   │   ├── api/
│   │   │   ├── get-profile.ts
│   │   │   ├── update-profile.ts
│   │   │   └── change-password.ts
│   │   ├── server/
│   │   │   └── user-service.ts
│   │   └── types.ts
│   │
│   ├── organizations/
│   │   ├── components/
│   │   │   ├── OrgList.tsx
│   │   │   ├── OrgCreate.tsx
│   │   │   ├── OrgSettings.tsx
│   │   │   └── MemberManagement.tsx
│   │   ├── hooks/
│   │   │   ├── useOrganization.ts
│   │   │   └── useOrgMembers.ts
│   │   ├── api/
│   │   │   ├── create-org.ts
│   │   │   ├── list-orgs.ts
│   │   │   └── manage-members.ts
│   │   ├── server/
│   │   │   └── org-service.ts
│   │   └── types.ts
│   │
│   ├── teams/
│   │   ├── components/
│   │   │   ├── TeamList.tsx
│   │   │   ├── TeamCreate.tsx
│   │   │   └── MemberManagement.tsx
│   │   ├── hooks/
│   │   │   └── useTeam.ts
│   │   ├── api/
│   │   │   ├── create-team.ts
│   │   │   └── manage-team.ts
│   │   └── types.ts
│   │
│   ├── blog/
│   │   ├── components/
│   │   │   ├── PostEditor.tsx
│   │   │   ├── PostList.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   └── CommentSection.tsx
│   │   ├── hooks/
│   │   │   ├── usePost.ts
│   │   │   └── usePosts.ts
│   │   ├── api/
│   │   │   ├── create-post.ts
│   │   │   ├── list-posts.ts
│   │   │   ├── get-post.ts
│   │   │   └── delete-post.ts
│   │   ├── server/
│   │   │   └── blog-service.ts
│   │   └── types.ts
│   │
│   ├── settings/
│   │   ├── components/
│   │   │   ├── AccountSettings.tsx
│   │   │   ├── SecuritySettings.tsx
│   │   │   ├── NotificationSettings.tsx
│   │   │   ├── OrgSettings.tsx
│   │   │   └── BillingSettings.tsx
│   │   ├── hooks/
│   │   │   └── useSettings.ts
│   │   ├── api/
│   │   │   ├── update-settings.ts
│   │   │   └── get-settings.ts
│   │   └── types.ts
│   │
│   ├── admin/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── PostModeration.tsx
│   │   │   ├── OrgManagement.tsx
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   └── AuditLogs.tsx
│   │   ├── hooks/
│   │   │   ├── useAdminData.ts
│   │   │   └── useAnalytics.ts
│   │   ├── api/
│   │   │   ├── list-users.ts
│   │   │   ├── deactivate-user.ts
│   │   │   ├── get-analytics.ts
│   │   │   └── get-audit-logs.ts
│   │   ├── server/
│   │   │   └── admin-service.ts
│   │   └── types.ts
│   │
│   └── landing/
│       ├── components/
│       │   ├── Hero.tsx
│       │   ├── Features.tsx
│       │   ├── Pricing.tsx
│       │   ├── CTA.tsx
│       │   ├── Footer.tsx
│       │   └── Newsletter.tsx
│       └── types.ts
│
├── lib/
│   ├── auth/
│   │   ├── auth-config.ts
│   │   ├── session-manager.ts
│   │   └── permissions.ts
│   ├── db/
│   │   ├── prisma.ts
│   │   └── migrations/
│   ├── api/
│   │   ├── hono-client.ts
│   │   └── response.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── common.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── helpers.ts
│   └── hooks/
│       ├── useQuery.ts
│       └── useMutation.ts
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   └── Form.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Layout.tsx
│   │   └── AdminLayout.tsx
│   └── common/
│       ├── Loading.tsx
│       ├── Error.tsx
│       └── NotFound.tsx
│
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx
│   │   └── blog/
│   │       ├── page.tsx          # Blog list
│   │       └── [slug]/
│   │           └── page.tsx      # Blog post detail
│   │
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── verify-email/page.tsx
│   │
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx    # User dashboard
│   │   ├── profile/page.tsx
│   │   ├── organizations/page.tsx
│   │   ├── teams/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx          # My posts
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   └── settings/
│   │       ├── page.tsx          # Account settings
│   │       ├── security/page.tsx
│   │       ├── notifications/page.tsx
│   │       └── preferences/page.tsx
│   │
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── users/page.tsx
│   │   ├── users/[id]/page.tsx
│   │   ├── organizations/page.tsx
│   │   ├── teams/page.tsx
│   │   ├── posts/page.tsx
│   │   ├── comments/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── audit-logs/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── api/
│   │   ├── [[...route]]/route.ts # Catch-all API
│   │   └── auth/
│   │       ├── [...auth]/route.ts
│   │       └── callback/route.ts
│   │
│   └── error.tsx, not-found.tsx
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── FEATURES.md
│   └── SETUP.md
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── AGENTS.md
├── README.md
├── package.json
└── .env.example
```

---

## Data Models

### Core Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  bio TEXT,
  avatar_url VARCHAR,
  role ENUM('user', 'admin') DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  logo_url VARCHAR,
  branding_color VARCHAR,
  owner_id UUID NOT NULL REFERENCES users(id),
  subscription_tier ENUM('free', 'pro', 'enterprise') DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organization Members
CREATE TABLE organization_members (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role ENUM('owner', 'admin', 'member', 'viewer') NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(organization_id, user_id)
);

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Team Members
CREATE TABLE team_members (
  id UUID PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role ENUM('owner', 'admin', 'member', 'viewer') NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(team_id, user_id)
);

-- Posts (Blog)
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  title VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR,
  featured_image_url VARCHAR,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  category_id UUID REFERENCES categories(id),
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(slug)
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  description TEXT,
  post_count INTEGER DEFAULT 0
);

-- Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  description TEXT,
  post_count INTEGER DEFAULT 0
);

-- Post Tags
CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id),
  tag_id UUID NOT NULL REFERENCES tags(id),
  PRIMARY KEY(post_id, tag_id)
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  status ENUM('approved', 'pending', 'spam') DEFAULT 'pending',
  parent_id UUID REFERENCES comments(id),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Roles & Permissions
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  context ENUM('global', 'organization', 'team') DEFAULT 'global',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  resource VARCHAR,
  action VARCHAR,
  UNIQUE(resource, action)
);

CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id),
  permission_id UUID NOT NULL REFERENCES permissions(id),
  PRIMARY KEY(role_id, permission_id)
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  action VARCHAR NOT NULL,
  resource VARCHAR NOT NULL,
  resource_id VARCHAR,
  changes JSONB,
  ip_address VARCHAR,
  user_agent VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Authentication & Authorization

### Role Hierarchy

```
Global Roles:
├── Admin
│   └── Can: Manage all users, organizations, content
├── User
│   └── Can: Create organizations, write posts, manage profile
└── Guest
    └── Can: Read public content

Organization Roles:
├── Owner
│   └── Can: Manage all org settings, members, billing
├── Admin
│   └── Can: Manage members, content, settings
├── Member
│   └── Can: Create content, manage own resources
└── Viewer
    └── Can: Read org content

Team Roles:
├── Owner
│   └── Can: Manage team, members, settings
├── Admin
│   └── Can: Manage members, content
├── Member
│   └── Can: Create and edit content
└── Viewer
    └── Can: Read content
```

### Permission System

```
Permissions By Resource:

Users:
- users:read          # View user list
- users:write         # Create/edit users
- users:delete        # Delete users
- users:manage-roles  # Assign roles

Organizations:
- org:read
- org:write
- org:delete
- org:manage-members
- org:manage-billing

Teams:
- team:read
- team:write
- team:delete
- team:manage-members

Posts:
- posts:read
- posts:write
- posts:delete
- posts:publish
- posts:moderate

Comments:
- comments:read
- comments:write
- comments:delete
- comments:moderate

Settings:
- settings:read
- settings:write
- settings:manage-system
```

### Implementation Pattern

**Express/Node.js:**
```typescript
// Middleware-based
router.post('/posts', 
  requireAuth,
  requirePermission('posts:write'),
  createPost
);
```

**Next.js:**
```typescript
// Server Action + Middleware
'use server'

export async function createPost(data: PostData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const hasPermission = await checkPermission(user, 'posts:write');
  if (!hasPermission) throw new Error('Forbidden');
  
  // Create post...
}
```

**Django/Python:**
```python
# Decorator-based
@login_required
@permission_required('posts.add_post')
def create_post(request):
    # Create post...
    pass
```

**Rails:**
```ruby
# Controller action
def create
  authorize_user!
  authorize_action(:create, Post)
  # Create post...
end
```

---

## Admin Dashboard

### Dashboard Structure

```
/admin
├── Overview (Statistics, Recent Activity)
├── Users
│   ├── List with filters (active, role, created date)
│   ├── User detail page
│   └── Actions (deactivate, reset password, delete)
├── Organizations
│   ├── List with subscription tier
│   ├── Org detail page
│   └── Actions (manage, suspend)
├── Teams
│   ├── List by organization
│   └── Team detail
├── Posts
│   ├── Moderation queue
│   ├── Published posts
│   ├── Draft posts
│   └── Actions (approve, reject, delete)
├── Comments
│   ├── Moderation queue
│   └── Actions (approve, reject, delete)
├── Analytics
│   ├── User metrics (growth, active users)
│   ├── Content metrics (posts, engagement)
│   ├── Organization metrics
│   └── Export data
├── Audit Logs
│   ├── Filter by user, action, resource
│   ├── View changes
│   └── Export logs
├── Roles & Permissions
│   ├── Create/edit roles
│   ├── Assign permissions
│   └── View role assignments
└── Settings
    ├── System configuration
    ├── Email settings
    ├── Feature flags
    └── Integrations
```

### Admin Features

**User Management:**
- List all users with filters
- View user details and activity
- Deactivate/delete users
- Reset passwords
- View login history
- Manage user roles

**Organization Management:**
- List organizations
- View org details and members
- Manage subscriptions
- View org activity
- Suspend/delete organizations

**Content Moderation:**
- Review and approve posts
- Review and moderate comments
- Flag spam
- View content analytics

**Analytics:**
- User growth charts
- Post/engagement metrics
- Organization stats
- System health dashboard

**Audit Logs:**
- View all system actions
- Filter by user, action, date range
- View what changed
- Export logs for compliance

---

## Page Structure

### Public Pages

```
/                              # Landing page
├── Hero section
├── Features showcase
├── Pricing (optional)
├── Social proof/testimonials
├── CTA section
└── Footer

/blog                          # Blog listing
├── Featured posts
├── Post list with pagination
├── Category filter
├── Search
└── Sidebar (recent, popular)

/blog/[slug]                   # Blog post detail
├── Post content
├── Author info
├── Comments section
├── Related posts
└── Share buttons
```

### Authentication Pages

```
/auth/login                    # Login form
/auth/signup                   # Registration form
/auth/forgot-password          # Password reset request
/auth/reset-password?token=x   # Password reset form
/auth/verify-email?token=x     # Email verification
/auth/2fa-setup                # 2FA setup
/auth/2fa-verify               # 2FA code entry
```

### Protected Pages

```
/dashboard                     # User dashboard
├── Overview stats
├── Recent activity
├── Quick actions
└── Organization selector

/profile                       # User profile
├── Edit name, bio, avatar
├── View profile
└── Public profile link

/organizations                 # Organization list
├── My organizations
├── Create org button
└── Switch org context

/organizations/[id]            # Organization dashboard
├── Org info
├── Quick stats
├── Recent activity
└── Navigation to org-specific pages

/organizations/[id]/members    # Manage members
├── Member list
├── Invite members
├── Edit roles
└── Remove members

/teams                         # Team list
├── Teams in current org
├── Create team button
└── Team selector

/teams/[id]                    # Team dashboard
├── Team info
├── Members
├── Activity

/blog/my-posts                 # My blog posts
├── List of authored posts
├── Status indicators
├── Edit/delete buttons
└── View analytics

/blog/create                   # Create new post
├── Title input
├── Rich editor
├── Category/tags
├── Featured image
├── Publish options

/blog/[id]/edit                # Edit post
├── Same as create
├── Pre-filled data
└── Version history (optional)

/settings                      # Account settings
├── Profile info
├── Email management
├── Password change
├── Connected accounts
└── Account deletion

/settings/security             # Security settings
├── Password manager
├── 2FA management
├── Active sessions
├── Login history
└── Trusted devices

/settings/notifications        # Notification preferences
├── Email notifications
├── In-app notifications
├── Notification channels
└── Frequency

/settings/preferences          # User preferences
├── Theme (light/dark)
├── Language
├── Timezone
├── Default org/team

/settings/organization         # Organization settings
├── General info
├── Branding
├── Settings (requires org admin)
└── Billing (requires org owner)

/settings/organization/members # Org member management
├── Member list
├── Invite members
├── Edit roles
└── Remove members

/settings/organization/billing # Billing & subscription
├── Current plan
├── Payment methods
├── Billing history
└── Upgrade/downgrade
```

### Admin Pages

```
/admin                         # Admin dashboard
├── Statistics
├── Recent activity
├── System health
└── Quick actions

/admin/users                   # User management
├── User list with filters
├── Create user (optional)
├── Bulk actions
└── Export

/admin/users/[id]              # User detail
├── User info
├── Activity log
├── Roles and permissions
├── Actions (deactivate, reset password)

/admin/organizations           # Organization management
├── List of all organizations
├── Subscription info
├── Owner info
└── Actions (manage, suspend)

/admin/organizations/[id]      # Org detail
├── Organization info
├── Members
├── Subscription details
├── Activity log

/admin/teams                   # Team management
├── List of all teams
├── Organization
├── Owner info
└── Actions

/admin/posts                   # Post moderation
├── All posts with status
├── Draft posts
├── Published posts
├── Moderation queue
├── Search and filters

/admin/posts/[id]              # Post detail
├── Post content
├── Author info
├── Comments
├── Actions (approve, reject, delete)

/admin/comments                # Comment moderation
├── All comments with status
├── Pending comments
├── Spam queue
├── Approved comments

/admin/comments/[id]           # Comment detail
├── Comment content
├── Author info
├── Parent post
├── Actions (approve, reject, delete)

/admin/analytics               # Analytics dashboard
├── User metrics
│   ├── New users (weekly/monthly)
│   ├── Active users
│   ├── User retention
│   └── Churn rate
├── Content metrics
│   ├── Posts created
│   ├── Engagement rate
│   ├── Top posts
│   └── Comments per post
├── Organization metrics
│   ├── Org growth
│   ├── Subscription breakdown
│   └── Revenue (if applicable)
└── System metrics
    ├── API response times
    ├── Error rates
    └── Database performance

/admin/audit-logs              # Audit logging
├── All system actions
├── Filters (user, action, date)
├── Search
└── Export logs

/admin/roles                   # Role management
├── List of roles
├── Edit roles
├── Manage permissions
└── View role assignments

/admin/settings                # System settings
├── General settings
├── Email configuration
├── Feature flags
├── API keys
├── Integrations
└── Maintenance mode
```

---

## Development Workflow

### Adding a New Feature

1. **Create feature folder** in `features/`
2. **Define data models** in database schema
3. **Create API endpoints** in `features/[name]/api/`
4. **Build server logic** in `features/[name]/server/`
5. **Create React components** in `features/[name]/components/`
6. **Add hooks** in `features/[name]/hooks/`
7. **Create pages** in `app/` directory
8. **Add tests** in `tests/`
9. **Document** in `features/[name]/README.md`

### Recommended Tech Stack By Framework

**Next.js:**
- Framework: Next.js 16+
- Database: Prisma + PostgreSQL
- Auth: NextAuth.js or Better Auth
- UI: shadcn/ui + TailwindCSS
- Forms: React Hook Form + Zod
- State: TanStack Query
- API: Hono routes or Next.js API routes

**FastAPI:**
- Framework: FastAPI
- Database: SQLAlchemy + PostgreSQL
- Auth: FastAPI-Users
- UI: React/Vue frontend
- Forms: Pydantic
- State: Pinia/Zustand
- API: OpenAPI/FastAPI

**Rails:**
- Framework: Rails 7+
- Database: ActiveRecord + PostgreSQL
- Auth: Devise or Clearance
- UI: React (if SPA) or Rails views
- Forms: FormBuilder/Stimulus
- State: ViewComponent/Turbo
- API: Rails API

**Django:**
- Framework: Django 4.2+
- Database: Django ORM + PostgreSQL
- Auth: Django User Auth
- UI: React frontend
- Forms: Django Forms + Serializers
- State: Frontend framework
- API: Django REST Framework

---

## Summary

This starter project architecture provides:

✅ **Complete features** (users, orgs, teams, blog, admin, auth)
✅ **Multiple patterns** (MVC, MVVC, feature-sliced, DDD, clean arch)
✅ **Full RBAC** (roles, permissions, role hierarchy)
✅ **Modern UX** (landing page, admin dashboard, settings)
✅ **Framework-agnostic** (adapt for any framework)
✅ **Production-ready** (audit logs, security, scalability)
✅ **Fully documented** (every component explained)
✅ **Reusable** (extract patterns for new projects)

Use this as a complete starting point for SaaS applications, content platforms, or community applications.


# Starter Project: Framework Implementation Guides

Complete setup guides for implementing the starter project with different frameworks.

## Table of Contents

1. [Next.js + TypeScript](#nextjs--typescript)
2. [FastAPI + Python](#fastapi--python)
3. [Ruby on Rails](#ruby-on-rails)
4. [Django + Python](#django--python)
5. [Express.js + Node.js](#expressjs--nodejs)
6. [Laravel + PHP](#laravel--php)

---

## Next.js + TypeScript

### Stack

```
Frontend:      Next.js 16 App Router, React 19
API:           Hono with Zod validation
Database:      Prisma + PostgreSQL
Auth:          Better Auth or NextAuth.js
UI:            shadcn/ui + TailwindCSS
Forms:         React Hook Form + Zod
State:         TanStack Query (React Query)
Testing:       Playwright, Vitest
```

### Quick Setup

```bash
# 1. Create project
bunx create-next-app@latest starter --typescript --tailwind

# 2. Install dependencies
bun add better-auth prisma @prisma/client hono zod react-hook-form

# 3. Setup Prisma
bunx prisma init

# 4. Configure .env
cp .env.example .env.local

# 5. Run migrations
bunx prisma migrate dev --name init

# 6. Start development
bun run dev
```

### Key Commands

```bash
bunx prisma migrate dev --name [migration-name]   # Create migration
bunx prisma generate                               # Regenerate types
bun run lint                                       # Lint code
npx playwright test                                # E2E tests
bun run build                                      # Production build
```

---

## FastAPI + Python

### Stack

```
Backend:       FastAPI 0.104+
Database:      SQLAlchemy + PostgreSQL
Auth:          FastAPI-Users
API Docs:      OpenAPI/Swagger
Validation:    Pydantic
Testing:       pytest, Playwright
```

### Quick Setup

```bash
# 1. Create project
mkdir starter && cd starter
python -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic-settings

# 3. Create structure
mkdir -p app/{api/v1,models,schemas,services,crud,auth,utils}

# 4. Setup .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5432/starter
SECRET_KEY=your-secret-key
EOF

# 5. Run server
uvicorn app.main:app --reload
```

### Key Endpoints

```
POST   /api/v1/auth/signup              # Register
POST   /api/v1/auth/login               # Login
GET    /api/v1/users/me                 # Current user
GET    /api/v1/posts                    # List posts
POST   /api/v1/posts                    # Create post
GET    /api/v1/organizations            # List orgs
POST   /api/v1/organizations            # Create org
GET    /api/v1/organizations/{id}/members  # List members
```

---

## Ruby on Rails

### Stack

```
Framework:     Rails 7+
Database:      PostgreSQL
Auth:          Devise or Clearance
Frontend:      React with Shakapacker
Testing:       RSpec
```

### Quick Setup

```bash
# 1. Create project
rails new starter --database=postgresql --skip-javascript

cd starter

# 2. Add gems
bundle add devise pundit react-rails

# 3. Install devise
rails generate devise:install
rails generate devise User

# 4. Generate models
rails generate model Organization name:string owner:references
rails generate model Post title:string content:text author:references
rails generate model Comment content:text post:references user:references

# 5. Migrate
rails db:create
rails db:migrate

# 6. Run server
bin/dev
```

### Key Generators

```bash
rails generate controller api/v1/posts --api     # Generate API controller
rails generate model Post --migration              # Generate model
rails generate migration AddFieldToUsers          # Create migration
```

---

## Django + Python

### Stack

```
Framework:     Django 4.2+
Database:      PostgreSQL
Auth:          Django auth + dj-rest-auth
API:           Django REST Framework
Testing:       pytest-django
```

### Quick Setup

```bash
# 1. Create project
django-admin startproject starter_project
cd starter_project

# 2. Create apps
python manage.py startapp auth
python manage.py startapp organizations
python manage.py startapp blog
python manage.py startapp teams

# 3. Install dependencies
pip install djangorestframework dj-rest-auth psycopg2-binary

# 4. Configure settings.py
# Add apps to INSTALLED_APPS

# 5. Migrate
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Run server
python manage.py runserver
```

### Key Commands

```bash
python manage.py makemigrations              # Create migrations
python manage.py migrate                     # Apply migrations
python manage.py createsuperuser             # Create admin user
python manage.py shell                       # Python shell
python manage.py runserver                   # Start dev server
```

---

## Express.js + Node.js

### Stack

```
Framework:     Express.js
Database:      Prisma + PostgreSQL
Auth:          Passport.js
Validation:    Zod
Testing:       Jest, Supertest
```

### Quick Setup

```bash
# 1. Create project
mkdir starter && cd starter
npm init -y

# 2. Install dependencies
npm install express prisma zod cors helmet
npm install -D typescript @types/express ts-node

# 3. Setup TypeScript
npx tsc --init

# 4. Setup Prisma
npx prisma init

# 5. Create structure
mkdir -p src/{routes,controllers,services,middleware,config}

# 6. Create start script in package.json
"dev": "ts-node src/index.ts"

# 7. Start development
npm run dev
```

### Key Routes

```
POST   /api/auth/signup             # Register
POST   /api/auth/login              # Login
GET    /api/users/me                # Current user
GET    /api/posts                   # List posts
POST   /api/posts                   # Create post
GET    /api/organizations           # List orgs
POST   /api/organizations           # Create org
PATCH  /api/posts/:id               # Update post
DELETE /api/posts/:id               # Delete post
```

---

## Laravel + PHP

### Stack

```
Framework:     Laravel 11
Database:      PostgreSQL
Auth:          Laravel Sanctum
Frontend:      Inertia.js + Vue/React
Testing:       Pest or PHPUnit
```

### Quick Setup

```bash
# 1. Create project
laravel new starter

cd starter

# 2. Install dependencies
composer require laravel/sanctum inertiajs/inertia-laravel

# 3. Publish config
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# 4. Create models
php artisan make:model Organization -m
php artisan make:model Post -m
php artisan make:model Comment -m

# 5. Run migrations
php artisan migrate

# 6. Start development
php artisan serve
```

### Key Artisan Commands

```bash
php artisan make:model ModelName -m              # Create model + migration
php artisan make:controller ControllerName       # Create controller
php artisan make:request StorePostRequest        # Create form request
php artisan migrate                              # Run migrations
php artisan db:seed                              # Run seeders
php artisan tinker                               # Interactive shell
```

---

## Recommended Starter for Each Scenario

**Best Overall (Recommended):**
→ Next.js + TypeScript (most modern, best DX)

**Best for Python Teams:**
→ FastAPI (fastest, modern, scalable)

**Best for Rails Teams:**
→ Ruby on Rails (convention over config, rapid)

**Best for Django Teams:**
→ Django (mature, batteries included)

**Best for JavaScript/Node Teams:**
→ Express.js (lightweight, flexible)

**Best for PHP Teams:**
→ Laravel (most popular, great ecosystem)

---

## Common Feature Setup Across All Frameworks

### Authentication Flow

1. User signs up → Create user, hash password, send verification email
2. User verifies email → Mark user as verified
3. User logs in → Validate credentials, create session/token
4. User stays logged in → Check token on protected routes
5. User logs out → Clear session/invalidate token

### Organization Setup

1. Create organization → Set owner (current user)
2. Add members → Generate invite link or direct add
3. Set roles → owner, admin, member, viewer
4. Manage permissions → Based on role

### Blog Post Workflow

1. Create draft post → Save with status=draft
2. Edit post → Update content while draft
3. Publish post → Set status=published, set published_at
4. View analytics → Track views and engagement
5. Archive post → Set status=archived

### Admin Features

1. User management → List, deactivate, reset password
2. Content moderation → Approve/reject posts and comments
3. Organization management → View, suspend, manage
4. Analytics → User growth, engagement metrics
5. Audit logs → Track all system actions

---

## File Structure Comparison

All frameworks should follow this general structure:

```
project/
├── .agents/skills/
│   ├── git-workflow/
│   ├── cursor-workflows/
│   ├── [framework]-development/      ← Framework-specific
│   └── [api-framework]-api/           ← API-specific
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── SETUP.md
├── tests/
├── Database config & migrations
├── Source code
├── AGENTS.md                          ← Project conventions
└── Configuration files
```

---

## Database Schema Common Across Frameworks

All starter projects should have these tables:

- `users` - Authentication and user profiles
- `organizations` - Workspaces/organizations
- `organization_members` - Org membership with roles
- `teams` - Teams within organizations
- `team_members` - Team membership with roles
- `posts` - Blog posts/content
- `categories` - Post categories
- `tags` - Post tags
- `comments` - Post comments
- `audit_logs` - System action logging
- `roles` - Role definitions
- `permissions` - Permission definitions

---

## API Response Format

All frameworks should use this standard response:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "..."
  },
  "error": null
}
```

Or on error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field validation failed"
  }
}
```

---

## Next Steps

1. Choose your framework from the list above
2. Follow the "Quick Setup" section
3. Read the framework-specific AGENTS.md
4. Implement features following the architecture
5. Test locally, deploy to production
6. Document your customizations

All frameworks will have the same core features and API contracts, just implemented differently!


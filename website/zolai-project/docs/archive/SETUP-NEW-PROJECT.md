# Agent Workspace Setup Guide for New Projects

This guide walks you through setting up a reusable agent workspace for a new project, based on the Zolai AI template.

## Quick Start (5 minutes)

```bash
# 1. Clone or use the template
git clone <template-repo> my-new-project
cd my-new-project

# 2. Remove starter-specific content
rm -rf .agents/skills/mir-*
rm -rf features/  # Keep if using Next.js
rm -rf prisma/    # Keep if using Prisma
rm docs/_AGENTS_TEMPLATE.md

# 3. Edit AGENTS.md
# - Change project title
# - Update Commands section
# - Replace Framework/API/DB sections with yours

# 4. Customize skills
mkdir .agents/skills/my-framework
# Edit: .agents/skills/my-framework/SKILL.md

# 5. Mirror to Cursor
ln -s ../.agents/skills/* .cursor/skills/
# Or: cp -r .agents/skills/* .cursor/skills/

# Done!
```

## Full Setup (15 minutes)

### Step 1: Structure Your Project

```
my-new-project/
├── .agents/
│   ├── skills/
│   │   ├── git-workflow/              ← Copy from template
│   │   ├── cursor-workflows/          ← Copy from template
│   │   ├── my-framework/              ← Create: framework patterns
│   │   ├── my-api/                    ← Create: API patterns
│   │   └── security-audit/            ← Copy: optional
│   └── lessons-learned/
│       └── README.md                  ← Keep as-is
├── .cursor/
│   ├── skills/                        ← Mirror of .agents/skills/
│   └── README.md                      ← Update with your skills
├── docs/
│   ├── WORKSPACE-REUSABILITY-GUIDE.md ← Reference (this file)
│   ├── references/
│   │   ├── git.md
│   │   ├── typescript.md
│   │   ├── my-framework.md            ← Create: your framework docs
│   │   └── my-api.md                  ← Create: your API docs
│   └── STACK.md                       ← Create: why you chose these tools
├── AGENTS.md                          ← Customize!
└── README.md                          ← Project overview
```

### Step 2: Create AGENTS.md for Your Project

Copy this template and fill in the brackets:

```markdown
# AGENTS.md — [PROJECT NAME]

## 🛠 Commands
\`\`\`bash
[YOUR_PACKAGE_MANAGER] run dev          # Start dev server
[YOUR_PACKAGE_MANAGER] run build        # Production build
[YOUR_PACKAGE_MANAGER] run lint         # Lint codebase
[YOUR_PACKAGE_MANAGER] run test         # Run tests
\`\`\`

## 📐 Code Style & Architecture

### Imports & Structure
- [Your import conventions]
- Grouping: [Your import groups]

### Formatting & Types
- Language: [TypeScript/Python/Go/etc]
- Type safety: [Your standards]
- Validation: [Your validation library]
- API responses: [Your response format]

### [Framework Name] Patterns
- [Key pattern 1]
- [Key pattern 2]
- [Key pattern 3]

### Naming Conventions
- Components/Classes: [Your convention]
- Functions: [Your convention]
- Files: [Your convention]

### Error Handling
- Synchronous: [Your pattern]
- Asynchronous: [Your pattern]
- API Routes: [Your pattern]

## 💾 Database & State

### ORM/Database
- ORM: [Prisma/SQLAlchemy/etc]
- Database: [PostgreSQL/MySQL/etc]
- Connection: [Your connection pattern]
- Queries: [Your query patterns]

### Authentication
- Auth system: [Better Auth/Passport/etc]
- Session management: [Your pattern]
- Protected routes: [Your pattern]

### API & [API Framework]
- Framework: [Express/Hono/FastAPI/etc]
- Response format: [{ success, data, error }]
- Error handling: [Your pattern]
- Validation: [Zod/Pydantic/etc]

### Server Operations
- Server actions: [Yes/No and patterns]
- Background tasks: [Job queue/etc]
- Caching: [Your strategy]

## 🧠 Development Methodologies

### Spec-Driven Development
1. Write schema/spec first
2. Generate types from spec
3. Implement to spec
4. Validate compliance

### Test-Driven Development
1. Write failing test
2. Implement feature
3. Refactor

### Code Quality
- Linter: [Your linter]
- Formatter: [Prettier/Black/etc]
- Type checking: [Strict mode]
- Test coverage: [Target %]

### Security Practices
- OWASP compliance: [Your checklist]
- Dependency scanning: [Snyk/Dependabot]
- Secrets management: [Your approach]

## 🏗️ Branching Strategy

- **develop** — Main integration branch
- **master** — Production releases
- **feature/[name]** — New features
- **fix/[name]** — Bug fixes
- **perf/[name]** — Performance improvements

### Workflow
1. Branch from develop
2. Make changes, test locally
3. Create PR for review
4. Merge to develop
5. Periodically release from develop → master

## 🤖 Agent Workflow

1. **Explore** — Search codebase for similar patterns
2. **Plan** — Break task into steps, use TodoWrite
3. **Execute** — Implement following conventions
4. **Validate** — Lint, type-check, test
5. **Document** — Update AGENTS.md with learnings

## 🤖 Agent Skills & Memory

### Project Skills
- **git-workflow** — Branching and commit conventions
- **cursor-workflows** — Cursor IDE workflows
- **my-framework** — [Framework] development patterns
- **my-api** — [API Framework] patterns

### Global Skills (from ~/.claude/skills/)
- **code-review-skill** — Review code changes
- **security-audit-skill** — Security assessment
- **self-improve-skill** — Learning and reflection
- **vulnerability-fix-skill** — Fix vulnerabilities

### Learning & Memory
- Lessons stored in `.agents/lessons-learned/`
- Update AGENTS.md after learnings
- Share via git history
\`\`\`

### Step 3: Create Framework Skills

Create `.agents/skills/my-framework/SKILL.md`:

```markdown
# Skill: [Framework Name] Development

## Purpose
Guidance for developing with [Framework] on this project.

## When to Use
- "[Framework]"
- "[Framework command]"
- "[Framework concept]"

## Key Patterns
- [Pattern 1]
- [Pattern 2]
- [Pattern 3]

## Best Practices
- [Practice 1]
- [Practice 2]

## Common Commands
\`\`\`bash
[Your most common commands]
\`\`\`

## File Structure
\`\`\`
src/
├── routes/           # Or controllers, handlers, etc.
├── services/         # Business logic
├── models/           # Data models
├── middleware/       # Custom middleware
└── utils/            # Utilities
\`\`\`

## Error Handling
[Your framework's error patterns]

## Testing
[Your framework's testing patterns]
\`\`\`

Do the same for `.agents/skills/my-api/SKILL.md`.

### Step 4: Update Cursor Configuration

Edit `.cursor/README.md`:

```markdown
# Cursor — project agent context

This folder holds **project-scoped** Agent Skills for [PROJECT NAME].

## Skills index

| Skill | Purpose |
|-------|---------|
| [git-workflow](skills/git-workflow/SKILL.md) | Git branching and commits |
| [cursor-workflows](skills/cursor-workflows/SKILL.md) | Cursor IDE workflows |
| [my-framework](skills/my-framework/SKILL.md) | [Framework] development |
| [my-api](skills/my-api/SKILL.md) | [API Framework] patterns |

## Documentation

- [AGENTS.md](../AGENTS.md) — Full coding standards
- [docs/](../docs/) — Architecture and references

## Setup

1. Install Cursor from https://cursor.com
2. Open this project
3. Cursor will auto-load skills from `.cursor/skills/`
4. Agent features available via cmd+K (or Ctrl+K)
\`\`\`

### Step 5: Document Your Tech Stack

Create `docs/STACK.md`:

```markdown
# [Project Name] Tech Stack

## Architecture
- **Frontend**: [Your framework] 
- **Backend**: [Your framework/API]
- **Database**: [PostgreSQL/MySQL/etc]
- **Authentication**: [Your auth system]

## Why These Choices

### Frontend: [Framework]
- [Reason 1]
- [Reason 2]
- [Trade-offs]

### Backend: [API Framework]
- [Reason 1]
- [Reason 2]

### Database: [PostgreSQL/MySQL/etc]
- [Reason 1]
- [Reason 2]

### Auth: [System]
- [Reason 1]
- [Reason 2]

## Key Libraries

| Library | Purpose | Docs |
|---------|---------|------|
| [lib] | [purpose] | [link] |

## Performance Targets

- Core Web Vitals: [your targets]
- API latency: [target ms]
- Database queries: [target ms]

## Development Environment

### Prerequisites
- Node.js 18+ (or your version)
- [Your package manager]
- [Other tools]

### Getting Started
\`\`\`bash
# Clone and install
git clone [repo]
cd [project]
[package-manager] install

# Run dev server
[package-manager] run dev

# Run tests
[package-manager] run test
\`\`\`
\`\`\`

### Step 6: Set Up Version Control

```bash
# Initialize git (if new project)
git init
git add .
git commit -m "initial: setup agent workspace"

# Create develop branch
git checkout -b develop
git push -u origin develop

# Protect main/master
# (via GitHub/GitLab settings)
```

### Step 7: Share and Synchronize

```bash
# Push template to organization
git push origin develop main

# Others can now clone and build on it
git clone [repo]
cd [project]
[package-manager] install
[package-manager] run dev
```

---

## Customization Checklist

- [ ] Update project title in AGENTS.md
- [ ] Replace Commands section with your commands
- [ ] Replace Code Style section with your standards
- [ ] Create my-framework/SKILL.md
- [ ] Create my-api/SKILL.md
- [ ] Update .cursor/README.md with skill names
- [ ] Create docs/STACK.md
- [ ] Create docs/references/my-framework.md
- [ ] Update README.md with project overview
- [ ] Set up git repository and branches
- [ ] Remove starter-specific code and docs
- [ ] Test agent setup: open in Cursor, run cmd+K

---

## Framework-Specific Examples

### Node.js + Express + PostgreSQL + Passport

**AGENTS.md sections:**
```markdown
## 🛠 Commands
bun run dev          # Start with nodemon
bun run build        # Compile TypeScript
bun run lint         # ESLint
npm test             # Jest tests
```

**my-framework/SKILL.md:**
```markdown
# Skill: Express.js Development

## Key Patterns
- Middleware for auth, validation, logging
- Controllers for route handlers
- Services for business logic
- Repositories for database access

## Common Mistakes
- Don't put DB logic in controllers
- Always validate input with express-validator
- Use middleware for cross-cutting concerns
```

### Python + FastAPI + PostgreSQL + FastAPI-Users

**AGENTS.md sections:**
```markdown
## 🛠 Commands
poetry run dev          # Start with uvicorn
poetry build            # Build package
poetry lint             # Ruff linting
poetry test             # Pytest
```

**my-framework/SKILL.md:**
```markdown
# Skill: FastAPI Development

## Key Patterns
- Routers for route grouping
- Dependencies for DI and validation
- Pydantic models for validation
- SQLAlchemy for database access

## Async Patterns
- All endpoints are async
- Use await for DB operations
- Background tasks with BackgroundTasks
```

### Ruby on Rails + PostgreSQL + Devise

**AGENTS.md sections:**
```markdown
## 🛠 Commands
bin/dev              # Start with Procfile
bundle exec rails    # Rails commands
bundle exec rspec    # Run RSpec tests
```

**my-framework/SKILL.md:**
```markdown
# Skill: Rails Development

## Convention Over Configuration
- Models in app/models/
- Controllers in app/controllers/
- Views in app/views/
- Routes in config/routes.rb

## Rails Conventions
- Use built-in helpers (form_with, link_to)
- Scopes in models for queries
- Callbacks for model logic
```

---

## File Templates

### Template: SKILL.md

```markdown
# Skill: [Name]

## Purpose
[1-2 sentences describing what this skill helps with]

## When to Use
Use this skill when user says:
- "[Keyword 1]"
- "[Keyword 2]"
- "[Keyword 3]"

## Key Concepts

### [Concept 1]
[Explanation]

### [Concept 2]
[Explanation]

## Best Practices

- [Practice 1]
- [Practice 2]
- [Practice 3]

## Common Patterns

\`\`\`[language]
[Code example 1]
\`\`\`

\`\`\`[language]
[Code example 2]
\`\`\`

## Related Skills
- [Skill 1](../skill-1/SKILL.md)
- [Skill 2](../skill-2/SKILL.md)
\`\`\`

### Template: Reference Doc

```markdown
# [Technology] Reference

## Overview
[What is it, why you use it]

## Installation
[How to install in your project]

## Basic Usage

### [Topic 1]
[Explanation]

\`\`\`[language]
[Code example]
\`\`\`

### [Topic 2]
[Explanation]

## Best Practices
- [Practice 1]
- [Practice 2]

## Common Patterns
[Your patterns for this tech]

## Troubleshooting

### [Problem 1]
[Solution]

### [Problem 2]
[Solution]

## Resources
- [Official Docs](link)
- [Tutorial](link)
\`\`\`

---

## Validating Your Setup

### 1. Check Structure

```bash
# Should see these files
ls -la .agents/skills/
ls -la .cursor/skills/
ls AGENTS.md
ls docs/STACK.md
```

### 2. Test Cursor Integration

```bash
# Open in Cursor
cursor .

# Try agent:
# - Cmd+K (or Ctrl+K)
# - Type a coding question
# - Should see skills context loaded
```

### 3. Verify Documentation

```bash
# All these should exist and be customized
cat AGENTS.md          # Has your project name
cat .cursor/README.md  # Lists your skills
cat docs/STACK.md      # Explains your choices
cat docs/references/*.md  # Specific to your stack
```

### 4. Test Git Workflow

```bash
# Verify branches work
git branch -a
git checkout develop
git checkout -b test-feature
git status
```

---

## Next Steps

1. **Develop normally** — Use git workflow from AGENTS.md
2. **Capture learnings** — Update `.agents/lessons-learned/` after complex tasks
3. **Share patterns** — Update AGENTS.md with new conventions
4. **Update skills** — As framework knowledge deepens, enrich skills
5. **Contribute back** — Share generic improvements to template repo

---

## Getting Help

### Read These First
- [AGENTS.md](../AGENTS.md) — Your project conventions
- [WORKSPACE-REUSABILITY-GUIDE.md](../docs/WORKSPACE-REUSABILITY-GUIDE.md) — How this system works
- [CURSOR-AGENTS.md](../docs/CURSOR-AGENTS.md) — Cursor IDE details

### Using Agent Skills
- Type in Cursor: `cmd+K` or `Ctrl+K`
- View available skills: Check `.cursor/README.md`
- Customize skills: Edit `.agents/skills/*/SKILL.md`

### Troubleshooting
- **Skills not loading**: Check `.cursor/README.md` syntax
- **Can't find pattern**: Search `.agents/skills/` SKILL.md files
- **Need a new skill**: Create `.agents/skills/new-skill/SKILL.md`


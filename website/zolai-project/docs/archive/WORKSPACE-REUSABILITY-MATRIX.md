# Workspace Components: Reusability Matrix

This document provides a detailed breakdown of every file and component in the Zolai AI workspace, categorizing what's reusable, what needs adaptation, and how to handle each.

## Quick Reference Matrix

| Component | Type | Reusable? | Action | Location |
|-----------|------|-----------|--------|----------|
| **AGENTS.md** | Framework | ⚠️ Adapt | Use as template, customize heavily | `./ AGENTS.md` |
| **git-workflow** | Skill | ✅ Yes | Copy as-is | `.agents/skills/git-workflow/` |
| **cursor-workflows** | Skill | ✅ Yes | Copy as-is | `.agents/skills/cursor-workflows/` |
| **mir-development** | Skill | ⚠️ Adapt | Use pattern for your framework | `.agents/skills/mir-development/` |
| **mir-hono-api** | Skill | ⚠️ Adapt | Use pattern for your API | `.agents/skills/mir-hono-api/` |
| **mir-project** | Skill | ❌ No | Zolai-specific, delete | `.agents/skills/zolai-project/` |
| **Global Skills** | Skill | ✅ Yes | Copy from `~/.claude/skills/` | `~/.claude/skills/` |
| **lessons-learned** | System | ✅ Yes | Copy structure, update content | `.agents/lessons-learned/` |
| **CURSOR-AGENTS.md** | Docs | ✅ Yes | Copy as reference | `./docs/CURSOR-AGENTS.md` |
| **Branching strategy** | Docs | ✅ Yes | Copy, minor customization | `./docs/BRANCHING_STRATEGY.md` |
| **opencode.json** | Config | ⚠️ Adapt | Use structure, change tools | `./opencode.json` |
| **Feature structure** | Code | ❌ No | Zolai-specific features | `./features/` |
| **Prisma schema** | Code | ❌ No | Zolai data models | `./prisma/schema.prisma` |

---

## Global Skills (100% Reusable)

These live in `~/.claude/skills/` and work across all projects:

### ✅ code-review-skill/
**Purpose**: Review code changes and PRs
**Reusability**: ✅ 100% — Works with any codebase
**Action**: Copy to `~/.claude/skills/` (one-time, machine-wide)

### ✅ security-audit-skill/
**Purpose**: Security assessment and vulnerability scanning
**Reusability**: ✅ 100% — Framework-agnostic
**Action**: Copy to `~/.claude/skills/` (one-time)

### ✅ master-security-skill/
**Purpose**: Comprehensive security review (combines other security skills)
**Reusability**: ✅ 100% — Meta-skill, language-agnostic
**Action**: Copy to `~/.claude/skills/` (one-time)

### ✅ vulnerability-fix-skill/
**Purpose**: Fix security vulnerabilities after audit
**Reusability**: ✅ 100% — Framework-agnostic
**Action**: Copy to `~/.claude/skills/` (one-time)

### ✅ domain-recon-skill/
**Purpose**: Domain/infrastructure reconnaissance and security assessment
**Reusability**: ✅ 100% — Infrastructure-agnostic
**Action**: Copy to `~/.claude/skills/` (one-time)

### ✅ cve-check-skill/
**Purpose**: Check for known CVEs in dependencies
**Reusability**: ✅ 100% — Works with any language/package manager
**Action**: Copy to `~/.claude/skills/` (one-time)

### ✅ self-improve-skill/
**Purpose**: Capture learnings and improve agent performance
**Reusability**: ✅ 100% — Meta-skill for learning
**Action**: Copy to `~/.claude/skills/` (one-time)

---

## Project Skills (Reusable with Adaptation)

These live in `.agents/skills/` and need customization per project:

### ✅ git-workflow/SKILL.md
**Content**: Git branching strategy, commit conventions, PR workflow
**Reusability**: ✅ 100% — Branching is language/framework-agnostic
**Action**: Copy as-is to any project

**Checklist**:
```bash
# Should contain:
grep "develop\|feature/\|hotfix/" .agents/skills/git-workflow/SKILL.md
# Should NOT contain:
grep -i "next\|hono\|prisma" .agents/skills/git-workflow/SKILL.md
```

### ✅ cursor-workflows/SKILL.md
**Content**: Cursor IDE workflows (best-of-n, read-branch, review, babysit)
**Reusability**: ✅ 100% — IDE workflows are framework-agnostic
**Action**: Copy as-is to any project using Cursor

**Checklist**:
```bash
# Should contain:
grep "Cursor\|cmd+K\|read-branch\|best-of-n" .agents/skills/cursor-workflows/SKILL.md
# Should NOT mention framework specifics
```

### ⚠️ mir-development/SKILL.md
**Content**: Next.js 16, React patterns, proxy.ts, RSC, server actions
**Reusability**: ⚠️ Use as pattern, not as-is
**For Projects Using**:
- **Next.js**: Copy and customize framework section
- **Rails**: Use as reference, create `rails-development/SKILL.md`
- **FastAPI**: Use as reference, create `fastapi-development/SKILL.md`
- **Django**: Use as reference, create `django-development/SKILL.md`

**How to Adapt**:
```bash
# Instead of copying, create for your framework:
cat > .agents/skills/my-framework-development/SKILL.md << 'EOF'
# Skill: [My Framework] Development

## Purpose
[Framework] patterns and best practices

## When to Use
- "[Framework name]"
- "[Framework command]"

## Key Patterns
- [Pattern 1 from your framework]
- [Pattern 2 from your framework]
- [Pattern 3 from your framework]

## Architecture
[Your project structure]

## Error Handling
[Your framework's approach]

## Testing
[Your framework's testing approach]
EOF
```

### ⚠️ mir-hono-api/SKILL.md
**Content**: Hono API framework, RPC types, Zod validation, sub-routers
**Reusability**: ⚠️ Use as pattern for your API framework
**For Projects Using**:
- **Hono**: Copy and customize for your API routes
- **Express**: Create `express-api/SKILL.md` 
- **FastAPI**: Create `fastapi-api/SKILL.md`
- **Rails**: Create `rails-api/SKILL.md`

**How to Adapt**:
```bash
cat > .agents/skills/my-api/SKILL.md << 'EOF'
# Skill: [API Framework] API Design

## Purpose
[API Framework] patterns and conventions

## When to Use
- "api route"
- "endpoint"
- "api design"

## Key Patterns
- [Pattern 1 for your API framework]
- [Pattern 2]
- [Pattern 3]

## Validation
[How you validate request bodies]

## Error Handling
[How you return errors]

## Response Format
[Your standard response structure]
EOF
```

### ❌ zolai-project/SKILL.md
**Content**: Zolai-specific roadmap, WordPress migration, content models
**Reusability**: ❌ No — Entirely project-specific
**Action**: Delete, don't include in template
**If You Need Similar**:
```bash
# Create a project roadmap skill
cat > .agents/skills/project-roadmap/SKILL.md << 'EOF'
# Skill: [Project Name] Roadmap

## Purpose
[Project] phases, architecture, and strategic direction

## When to Use
- "roadmap"
- "[project name]"
- "architecture"

## Phases
[Your project phases]

## Architecture Narrative
[Your architecture story]
EOF
```

---

## Documentation Files (Reusability Matrix)

### ✅ CURSOR-AGENTS.md
**Purpose**: How skills relate to agent workflow
**Content**: Reusable, framework-agnostic discussion of agent architecture
**Reusability**: ✅ 100%
**Action**: Copy as-is

**Contains**:
- How AGENTS.md relates to skills
- How to structure agent workflows
- How agent roles work
- How to integrate with Cursor IDE

### ⚠️ AGENTS.md
**Purpose**: Project conventions, commands, standards, patterns
**Structure Breakdown**:

| Section | Reusable? | Action |
|---------|-----------|--------|
| Commands | ❌ No | Replace with your project commands |
| Imports & Structure | ⚠️ Partially | Keep principles, replace examples |
| Formatting & Types | ✅ Mostly | Keep TypeScript principles; adapt for your language |
| Framework Patterns | ❌ No | Replace with your framework (Next.js → FastAPI, etc.) |
| Naming Conventions | ❌ No | Replace with your conventions |
| Error Handling | ⚠️ Partially | Keep principles; adapt syntax to your framework |
| Database & State | ❌ No | Replace Prisma with your ORM |
| API & Hono | ❌ No | Replace Hono with your API framework |
| Development Methodologies | ✅ 100% | Copy as-is (Spec-Driven, TDD, OODA, etc.) |
| Testing Strategy | ✅ 100% | Copy as-is |
| Branching Strategy | ✅ 100% | Copy as-is |
| Agent Workflow | ✅ 100% | Copy as-is |
| Agent Skills & Memory | ⚠️ Partially | Copy structure; update skill names |
| Security Practices | ✅ 95% | Copy as-is; skip Zolai-specific (WordPress) parts |

**How to Customize**:
```bash
# Use as template
cp docs/_AGENTS_TEMPLATE.md AGENTS.md

# Edit these sections (REQUIRED):
# 1. Line 1: Update project name
# 2. "🛠 Commands" — Replace with your commands
# 3. "Code Style & Architecture" — Framework section
# 4. "Database & State" — Prisma → Your ORM
# 5. "API & Hono" — Hono → Your API framework
# 6. "Agent Skills & Memory" — Update skill names

# Keep these sections (UNCHANGED):
# 1. Development Methodologies
# 2. Testing Strategy
# 3. Branching Strategy
# 4. Agent Workflow
# 5. Code Quality
# 6. Security Practices
```

### ✅ BRANCHING_STRATEGY.md
**Purpose**: Detailed git branching strategy
**Reusability**: ✅ 100%
**Action**: Copy as-is, minor customization if needed

**Sections**:
- Trunk-based development
- Branch naming conventions
- Feature flags
- Protected main branch
- Release process

### ✅ Methodology Docs (Testing, Performance, Security)
**Reusability**: ✅ 100% for concepts, ⚠️ adapt code examples
**Action**: Copy, update code examples for your language

Examples:
- `Testing Strategy`
- `Performance & Observability`
- `Security Practices`
- `Architecture Patterns`

### ❌ Feature-Specific Docs
**Reusability**: ❌ No — Zolai-specific features
**Examples**:
- `docs/features/` — All Zolai features
- `docs/references/shadcn.md` — UI components
- `docs/references/better-auth.md` — Zolai auth choice
- `BETTER_AUTH*.md` — Zolai-specific migration docs

**Action**: Delete or use as reference only

### ⚠️ Technology References (docs/references/)
**Reusability**: ⚠️ Use as template pattern

| File | Reusable | Action |
|------|----------|--------|
| `git.md` | ✅ Yes | Copy as-is |
| `typescript.md` | ✅ Mostly | Copy; remove TypeScript if not using |
| `testing.md` | ✅ Mostly | Copy; adapt test framework examples |
| `prisma.md` | ❌ No | Delete, replace with your ORM doc |
| `nextjs.md` | ❌ No | Delete, replace with your framework |
| `hono.md` | ❌ No | Delete, replace with your API framework |
| `react.md` | ❌ No | Delete if not using React |
| `better-auth.md` | ❌ No | Delete, replace with your auth |

**Template for new references**:
```bash
cat > docs/references/my-framework.md << 'EOF'
# [Framework] Reference

## Overview
[What is it and why we use it]

## Installation
[How to set up in this project]

## Key Concepts
[Framework principles]

## Common Patterns
[How we use it in this project]

## Best Practices
[Do's and Don'ts]

## Resources
[Links to official docs]
EOF
```

---

## Configuration Files (Reusability Matrix)

### opencode.json
**Purpose**: Configure MCP servers for OpenCode CLI
**Reusability**: ⚠️ Use structure, change servers

**What to Keep**:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    // Keep this structure
  }
}
```

**What to Change**:
```json
{
  "mcp": {
    "shadcn": {              // ❌ Zolai-specific, delete
      "type": "local",
      "command": ["npx", "shadcn@latest", "mcp"]
    },
    "neon": {                // ❌ Zolai-specific, delete
      "type": "remote",
      "url": "https://mcp.neon.tech/mcp"
    },
    // ADD YOUR TOOLS HERE
    "my-framework": {        // ✅ Add for your framework
      "type": "local",
      "command": ["npx", "my-framework@latest", "mcp"]
    }
  }
}
```

**For Each Framework**:
- Next.js: `"shadcn"` for UI components
- Python/FastAPI: `"poetry"`, `"pytest"`, etc.
- Ruby/Rails: `"bundler"`, `"rails"`, etc.
- Go: `"go"`, `"golangci-lint"`, etc.

### .cursor/README.md
**Purpose**: Cursor IDE configuration and skills index
**Reusability**: ⚠️ Copy structure, update skill list

**What to Keep**:
```markdown
# Cursor — project agent context

This folder holds **project-scoped** Agent Skills for [PROJECT NAME].

## Skills index
| Skill | Purpose |
|-------|---------|
```

**What to Change**:
- Project name
- Skill list (should match your `.agents/skills/`)
- References to project docs

**Template**:
```bash
cat > .cursor/README.md << 'EOF'
# Cursor — project agent context

This folder holds **project-scoped** Agent Skills for [PROJECT NAME].

## Skills index

| Skill | Purpose |
|-------|---------|
| git-workflow | Git branching strategy |
| cursor-workflows | Cursor IDE workflows |
| my-framework | [Framework] development patterns |
| my-api | [API Framework] patterns |
| security-audit | Security assessment checklist |

## Documentation
- [AGENTS.md](../AGENTS.md) — Full coding standards
- [docs/](../docs/) — Architecture and references

## Setup

Skills in this folder are automatically loaded by Cursor.
EOF
```

### .cursor/rules/ (Optional)
**Purpose**: File-scoped hints for Cursor
**Reusability**: ⚠️ Use pattern, create for your frameworks
**Action**: Create per-framework rules

**Examples**:
```bash
# React components
cat > .cursor/rules/**/*.tsx.md << 'EOF'
# React Component Rules

- Use `use client` only for interactive components
- Props should be typed with interfaces
- Keep components under 200 lines
EOF

# API routes
cat > .cursor/rules/api/**.ts.md << 'EOF'
# API Route Rules

- Validate all input with Zod
- Return standard response format
- Handle errors gracefully
EOF
```

---

## Code Directories (Mostly Not Reusable)

### features/ (❌ Not Reusable)
**Content**: Zolai-specific features (auth, posts, comments, etc.)
**Reusability**: ❌ 0% — All feature-specific to Zolai
**Action**: Delete when creating new project

**Why**: Each project has unique features

### prisma/ (❌ Not Reusable)
**Content**: Prisma schema with Zolai data models
**Reusability**: ❌ 0% — All Zolai-specific
**Action**: Delete and create your own schema

**If Using Prisma in New Project**:
```bash
# Create new schema
bunx prisma init

# Then add your models
cat > prisma/schema.prisma << 'EOF'
datasource db {
  provider = "postgresql"  // or mysql
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  // Add your models
}
EOF
```

### app/ (❌ Not Reusable)
**Content**: Zolai-specific Next.js pages and layouts
**Reusability**: ❌ 0% — All feature-specific
**Action**: Delete for non-Next.js projects

**If Using Next.js**:
- Structure is reusable pattern
- Specific pages are not
- Adapt layouts and design

### lib/ (⚠️ Partially Reusable)
**Content**: Utilities, helpers, types
**Reusability**: ⚠️ Varies by file

**Reusable Utilities**:
- Type definitions
- Helper functions
- Constants
- Validation schemas

**Not Reusable**:
- Zolai-specific integrations
- Project-specific configuration

---

## lessons-learned/ (✅ Fully Reusable)

**Structure**:
```
.agents/lessons-learned/
├── README.md
├── WORKFLOW.md
└── entries/
    ├── 001-first-lesson.md
    └── 002-second-lesson.md
```

**Reusability**: ✅ 100% — Keep the structure
**Content**: ❌ 0% — Project-specific learnings

**Action**: Copy directory structure, replace content with your learnings

**How to Use**:
```bash
# After learning something important:
cat > .agents/lessons-learned/entries/001-your-lesson.md << 'EOF'
# [Lesson Title]

## What We Learned
[Description of learning]

## Why It Matters
[Impact on this project]

## Action Items
- [Item 1]
- [Item 2]

## Update AGENTS.md?
Yes/No, and what to add
EOF

# Then update AGENTS.md with the pattern
```

---

## Complete Reusability Reference Card

### Copy These Exactly (✅ 100%)
```bash
.agents/skills/git-workflow/          # Git branching
.agents/skills/cursor-workflows/      # Cursor workflows
.agents/lessons-learned/              # Lessons system structure
docs/CURSOR-AGENTS.md                 # Agent architecture
~/.claude/skills/*/                   # Global skills
```

### Adapt These (⚠️ Customize)
```bash
AGENTS.md                             # Replace framework sections
.agents/skills/mir-development/       # Use as pattern for your framework
.agents/skills/mir-hono-api/         # Use as pattern for your API
.cursor/README.md                     # Update skill list
opencode.json                         # Update MCP servers
docs/references/*.md                  # Replace with your tech stack
```

### Delete These (❌ Zolai-Specific)
```bash
.agents/skills/zolai-project/           # Zolai roadmap
.agents/skills/data-analytics/        # Zolai-specific
.agents/skills/ui-design/             # Zolai-specific
docs/features/                        # Zolai features
features/                             # Zolai features
prisma/                               # Zolai schema
app/                                  # Zolai pages (if not Next.js)
docs/BETTER_AUTH*.md                  # Zolai auth choice
docs/references/shadcn.md             # Zolai UI components
docs/references/better-auth.md        # Zolai auth
docs/references/prisma.md             # Replace with your ORM
docs/references/nextjs.md             # Replace with your framework
docs/references/hono.md               # Replace with your API
```

---

## Recommended New Project Setup

### 1. Start with Template
```bash
mkdir my-new-project && cd my-new-project
git init

# Copy structure
mkdir -p .agents/skills .agents/lessons-learned
mkdir -p .cursor/skills
mkdir -p docs/references
```

### 2. Copy Reusable Files
```bash
cp ~/mir/.agents/skills/git-workflow/ .agents/skills/
cp ~/mir/.agents/skills/cursor-workflows/ .agents/skills/
cp ~/mir/.agents/lessons-learned/README.md .agents/lessons-learned/
cp ~/mir/docs/CURSOR-AGENTS.md docs/
```

### 3. Create AGENTS.md
```bash
cp ~/mir/docs/_AGENTS_TEMPLATE.md AGENTS.md
# Edit AGENTS.md for your project
```

### 4. Create Framework Skills
```bash
# For your framework (example: FastAPI)
cat > .agents/skills/fastapi-development/SKILL.md << 'EOF'
# Skill: FastAPI Development
[Your content]
EOF

cat > .agents/skills/fastapi-api/SKILL.md << 'EOF'
# Skill: FastAPI API
[Your content]
EOF
```

### 5. Mirror to Cursor
```bash
ln -s ../.agents/skills/* .cursor/skills/
```

### 6. Document Stack
```bash
cat > docs/STACK.md << 'EOF'
# [Project] Stack
[Your tech choices]
EOF
```

### 7. Commit
```bash
git add .
git commit -m "initial: setup reusable agent workspace"
```

Done! ✅

---

## Version Control

When you improve a reusable component:

### For Global Skills
```bash
# If you improve a global skill, update it in ~/.claude/skills/
# Then regenerate in projects:
cd ~/project
cp ~/.claude/skills/skill-name/ .claude/skills/
# Or sync via git submodule if centralized
```

### For Project Skills
```bash
# If you create a better framework skill
# Share it with others:
git push origin feature/improve-framework-skill

# Others can cherry-pick:
git cherry-pick <commit-hash>
```

### For Central Template
```bash
# If you improve the template:
cd ~/agent-workspace-template
git add .
git commit -m "improve: [component] reusability"
git push origin main

# New projects use the improved template
```

---

## Summary Tables

### By Reusability Level

**✅ 100% Reusable** (Copy as-is to every project):
- Global skills (code-review, security-audit, etc.)
- git-workflow skill
- cursor-workflows skill
- lessons-learned structure
- Development methodologies docs
- Testing strategy
- Branching strategy
- CURSOR-AGENTS.md

**⚠️ Partially Reusable** (Adapt for your project):
- AGENTS.md (update heavily)
- mir-development (use as pattern)
- mir-hono-api (use as pattern)
- .cursor/README.md (update skill list)
- opencode.json (update tools)
- Technology references (adapt examples)

**❌ Not Reusable** (Reference only or delete):
- Feature code
- Database schema
- Application code
- Project-specific skills
- Zolai-specific docs

### By Directory

| Directory | Reuse Strategy |
|-----------|----------------|
| `.agents/skills/` | Copy reusable + create new |
| `.cursor/skills/` | Mirror of .agents/skills/ |
| `.agents/lessons-learned/` | Copy structure, replace content |
| `docs/references/` | Replace with your stack |
| `docs/` | Copy generic + create stack-specific |
| `features/` | Delete (project-specific) |
| `app/` | Delete or heavily adapt |
| `lib/` | Pick and choose utilities |
| `prisma/` | Delete (project-specific) |


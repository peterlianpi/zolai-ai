# Workspace Reusability Guide: Making Zolai AI Structures Cross-Platform

This document explains how to extract and adapt the Zolai AI workspace structure, agents, skills, and conventions for use in other projects.

## Table of Contents

1. [Overview](#overview)
2. [Reusable Components](#reusable-components)
3. [Project-Specific vs. Generic](#project-specific-vs-generic)
4. [Implementation Strategy](#implementation-strategy)
5. [Setup for New Projects](#setup-for-new-projects)
6. [Extension Points](#extension-points)

---

## Overview

The Zolai workspace combines three key layers of agent configuration:

1. **Global Skills** (`.claude/skills/`) — Framework-agnostic, reusable across all projects
2. **Project Skills** (`.agents/skills/`) — Project-specific, can be adapted
3. **IDE Config** (`.cursor/`) — Cursor IDE specific, portable with modifications

```
Your Machine
├── ~/.claude/skills/                  # Global (ALL projects)
│   ├── master-security-skill/
│   ├── code-review-skill/
│   ├── vulnerability-fix-skill/
│   └── ... (cross-project generic skills)
│
Your Project
├── .agents/skills/                    # Project-specific
│   ├── mir-development/               # Next.js + Hono + Prisma
│   ├── mir-hono-api/                 # API patterns
│   └── git-workflow/                  # Can be generic/reused
│
├── .cursor/skills/                    # Mirror of .agents/skills/
├── AGENTS.md                          # Project conventions (THIS IS KEY)
└── docs/                              # Architecture & reference docs
```

---

## Reusable Components

### ✅ Fully Reusable (Copy as-is)

These can be copied to any project without modification:

| Component | Location | Reusable? | Notes |
|-----------|----------|-----------|-------|
| **Code Review Skill** | `~/.claude/skills/code-review-skill/` | ✅ Yes | Works with any codebase |
| **Git Workflow Skill** | `.agents/skills/git-workflow/` | ✅ Yes | Universal branching strategy |
| **Security Audit Skill** | `~/.claude/skills/security-audit-skill/` | ✅ Yes | OWASP-based checklist |
| **Self-Improve Skill** | `~/.claude/skills/self-improve-skill/` | ✅ Yes | Workflow reflection |
| **CVE Check Skill** | `~/.claude/skills/cve-check-skill/` | ✅ Yes | Dependency scanning |
| **Domain Recon Skill** | `~/.claude/skills/domain-recon-skill/` | ✅ Yes | Infrastructure audit |
| **Master Security Skill** | `~/.claude/skills/master-security-skill/` | ✅ Yes | Comprehensive security |
| **Cursor Workflows** | `.agents/skills/cursor-workflows/` | ✅ Yes | IDE workflows |

### ⚠️ Partially Reusable (Adapt)

These need modifications for new projects:

| Component | Location | Adapt For | Strategy |
|-----------|----------|-----------|----------|
| **mir-development** | `.agents/skills/mir-development/` | New Project | Template → parameterize |
| **mir-hono-api** | `.agents/skills/mir-hono-api/` | New API | Replace with your framework |
| **mir-project** | `.agents/skills/zolai-project/` | Roadmap | Reference docs/PROJECT.md |
| **AGENTS.md** | Root | Conventions | Template in /templates/ |

### ❌ Project-Specific (Reference Only)

These are unique to Zolai and should be referenced as examples:

| Component | Reason | Use Case |
|-----------|--------|----------|
| Feature-specific docs | Myanmar context, CMS features | Pattern reference |
| Prisma schema | Zolai data models | Adapt for your schema |
| Next.js app/ structure | Zolai features layout | Adapt for your features |

---

## Project-Specific vs. Generic

### AGENTS.md Structure

**Zolai AGENTS.md** is structured in layers:

```markdown
# AGENTS.md — [PROJECT NAME]

## 🛠 Commands
- Project-specific commands (bun, npm, custom scripts)

## 📐 Code Style & Architecture
- General principles (TypeScript, imports, error handling) ← REUSABLE
- Framework-specific (Next.js 16, proxy.ts, RSC) ← ADAPT
- Feature patterns (Prisma, Hono, Better Auth) ← ADAPT

## 💾 Database & State
- General best practices ← REUSABLE
- Prisma-specific ← ADAPT TO YOUR ORM
- Auth patterns ← ADAPT TO YOUR AUTH FRAMEWORK

## 🧠 Development Methodologies
- Spec-Driven Development ← REUSABLE
- OODA Loop ← REUSABLE
- TDD ← REUSABLE
- CI/CD Best Practices ← REUSABLE
- WordPress Migration ← REMOVE (Zolai-specific)

## 🏗️ Branching Strategy
- Trunk-Based Development ← REUSABLE
- Feature flags ← REUSABLE

## 🤖 Agent Workflow
- Exploration → Planning → Execution ← REUSABLE

## 🤖 Agent Skills & Memory
- Lessons learned system ← REUSABLE
- Self-improve workflow ← REUSABLE
```

### Separating Generic from Specific

**Generic Sections** (use everywhere):
- Development methodologies
- Code quality standards
- Error handling principles
- Testing strategy
- Security practices
- Branching strategy
- Agent workflows

**Framework-Specific** (customize per project):
- Commands section
- Architecture patterns
- Naming conventions (project-dependent)
- Database patterns (ORM, connection, etc.)
- API patterns
- Auth system

---

## Implementation Strategy

### Phase 1: Extract Generic Core

Create a **base template** repository:

```
agent-workspace-template/
├── .agents/
│   ├── skills/
│   │   ├── git-workflow/SKILL.md          # Generic
│   │   ├── cursor-workflows/SKILL.md      # Generic
│   │   ├── _template-development/         # Template to fill
│   │   └── _template-api/                 # Template to fill
│   └── lessons-learned/
│       └── README.md
├── docs/
│   ├── WORKSPACE-REUSABILITY.md           # This file
│   ├── CURSOR-AGENTS.md                   # Generic
│   ├── _AGENTS_TEMPLATE.md                # Base AGENTS.md template
│   └── references/
│       ├── git.md                         # Generic
│       ├── typescript.md                  # Generic
│       └── YOUR-FRAMEWORK-HERE.md         # Template
├── .cursor/
│   └── README.md                          # Cursor-specific config
└── SETUP-NEW-PROJECT.md                   # Step-by-step guide
```

### Phase 2: Document Adaptation Points

For each framework/stack, create adaptation docs:

```
docs/stacks/
├── nextjs-hono-prisma.md        # Zolai template
├── fastapi-python.md             # Python template
├── rails-ruby.md                 # Ruby on Rails template
└── go-echo.md                    # Go template
```

Each should define:
- Required skills and their customizations
- AGENTS.md sections to modify
- Project structure layout
- Common commands
- Database patterns
- API patterns
- Auth system

### Phase 3: Establish Copy Locations

```bash
# Copy global skills from OpenCode/Claude
~/.claude/skills/

# Copy project skills to each new project
./.agents/skills/

# Mirror project skills to Cursor IDE
./.cursor/skills/

# Customize AGENTS.md from template
./AGENTS.md
```

---

## Setup for New Projects

### Quick Start: Using the Template

```bash
# 1. Clone template (or copy existing Zolai as base)
git clone <template-repo> my-new-project
cd my-new-project

# 2. Remove Zolai-specific content
rm -rf features/*/docs  # Zolai feature docs
# Remove Zolai-specific skills:
rm .agents/skills/mir-{project,development,hono-api}

# 3. Create your project skills
mkdir -p .agents/skills/{your-framework,your-api}

# 4. Edit AGENTS.md
# - Update project name
# - Replace Commands section
# - Replace Code Style & Architecture (Framework section)
# - Replace Database & State (your ORM/auth)
# - Keep: Methodologies, Branching, Agent Workflow

# 5. Create project-specific skills
# .agents/skills/{your-framework}/SKILL.md

# 6. Update .cursor/README.md to reference new skills

# 7. Copy global skills (one-time)
# ./.claude/skills/ or link them
```

### Detailed Checklist

#### Step 1: Global Skills Setup (One-time)

```bash
# These live in ~/.claude/skills/ and are shared across all projects
# They should already exist if you've used OpenCode/Claude

ls ~/.claude/skills/
# Expected:
# - code-review-skill/
# - security-audit-skill/
# - master-security-skill/
# - vulnerability-fix-skill/
# - domain-recon-skill/
# - cve-check-skill/
# - self-improve-skill/
# (and others from your global setup)
```

#### Step 2: Project Skills (Per-Project)

```bash
cd my-new-project

# 1. Copy reusable project skills from template
cp -r ~/agent-workspace-template/.agents/skills/git-workflow ./agents/skills/
cp -r ~/agent-workspace-template/.agents/skills/cursor-workflows ./agents/skills/

# 2. Create YOUR framework skill
cat > .agents/skills/my-framework/SKILL.md << 'EOF'
# Skill: My Framework Development

## Purpose
[Framework-specific guidance]

## When to Use
- "framework command"
- etc.

## Key Patterns
[Your framework patterns]
EOF

# 3. Create YOUR API skill
cat > .agents/skills/my-api/SKILL.md << 'EOF'
# Skill: My API Framework

## Purpose
[API framework guidance]

## When to Use
- "api"
- "endpoint"

## Key Patterns
[API patterns]
EOF
```

#### Step 3: AGENTS.md Customization

```bash
# Start with template
cp ~/agent-workspace-template/docs/_AGENTS_TEMPLATE.md ./AGENTS.md

# Edit these sections:
# 1. Title
# 2. Commands (your project commands)
# 3. Code Style & Architecture → Framework subsection
# 4. Database & State → Your ORM/Auth subsection
# 5. Agent Skills & Memory → Your skill names

# Keep unchanged:
# - Development Methodologies
# - OODA Loop
# - Test-Driven Development
# - Other Recommended Practices
# - Branching Strategy
# - Agent Workflow
# - Code Quality
# - Security Practices
```

#### Step 4: Cursor IDE Configuration

```bash
# Mirror skills
mkdir -p .cursor/skills
ln -s ../.agents/skills/* .cursor/skills/

# Or copy if you prefer separation
cp -r .agents/skills/* .cursor/skills/

# Update .cursor/README.md
cat > .cursor/README.md << 'EOF'
# Cursor — project agent context

This folder holds **project-scoped** Agent Skills for [PROJECT NAME].

## Skills index

| Skill | Purpose |
|-------|---------|
| cursor-workflows | Cursor IDE workflows |
| my-framework | [Framework] development |
| my-api | [API] patterns |

## Documentation
- [AGENTS.md](../AGENTS.md) — Full coding standards
- [docs/](../docs/) — Architecture and references
EOF
```

#### Step 5: Documentation Structure

```bash
# Create docs for your stack
mkdir -p docs/references docs/features

# Document your framework
cat > docs/references/my-framework.md << 'EOF'
# [Framework] Reference

[Framework-specific docs, patterns, best practices]
EOF

# Document your API layer
cat > docs/references/my-api.md << 'EOF'
# [API Framework] Reference

[API patterns, endpoints, responses]
EOF
```

---

## Extension Points

### Adding New Reusable Skills

When creating a new skill, ask: **Is this framework-specific or universal?**

**Universal skills go in global location:**
```
~/.claude/skills/{my-skill}/
├── SKILL.md
└── references/     # Optional supporting docs
```

**Project-specific skills go in project location:**
```
./.agents/skills/{my-skill}/
├── SKILL.md
└── references/
```

Then **mirror to Cursor**:
```bash
cp -r .agents/skills/{my-skill} .cursor/skills/
```

### Documenting Skills

Each skill should have:

```markdown
# Skill: [Name]

## Purpose
[1-2 sentences on what this skill helps with]

## When to Use
- "Keyword 1"
- "Keyword 2"
[Keywords that trigger this skill]

## Key Concepts
[Core patterns and principles]

## Best Practices
[Do's and Don'ts]

## Examples
[Real examples from this project]
```

### Creating Stack-Specific Templates

For a new framework (e.g., FastAPI):

1. **Create template skills**
   ```
   .agents/skills/
   ├── fastapi-development/SKILL.md
   └── fastapi-api/SKILL.md
   ```

2. **Document in AGENTS.md**
   - Commands: `poetry run`, `pytest`, etc.
   - Architecture: Routers, dependencies, async
   - Database: SQLAlchemy or ORM of choice
   - Testing: pytest patterns

3. **Save as template**
   ```bash
   # In central templates repo
   git push origin stacks/fastapi
   ```

4. **Make it discoverable**
   ```markdown
   # In docs/WORKSPACE-REUSABILITY.md

   ## Stack Templates

   - [Next.js + Hono + Prisma](stacks/nextjs-hono-prisma.md) ← Zolai
   - [FastAPI + SQLAlchemy](stacks/fastapi-sqlalchemy.md)
   - [Rails + PostgreSQL](stacks/rails-postgres.md)
   ```

---

## Directory Layout Reference

### Before (Zolai Project)
```
zolai-project/
├── .agents/skills/
│   ├── zolai-project/           # Zolai-specific
│   ├── mir-development/       # Next.js-specific
│   ├── mir-hono-api/         # Hono-specific
│   ├── git-workflow/          # ✅ Reusable
│   ├── cursor-workflows/      # ✅ Reusable
│   ├── security-audit/        # ✅ Reusable
│   ├── data-analytics/        # Zolai-specific
│   └── ui-design/             # Zolai-specific
├── .cursor/
│   └── skills/               # Mirrors .agents/
├── AGENTS.md                 # Zolai conventions
├── docs/
│   ├── CURSOR-AGENTS.md      # ✅ Generic concept
│   └── references/
├── prisma/
│   └── schema.prisma         # ❌ Zolai data models
└── features/                 # ❌ Zolai features
```

### After (Generic Template)
```
agent-workspace-template/
├── .agents/
│   ├── skills/
│   │   ├── git-workflow/SKILL.md
│   │   ├── cursor-workflows/SKILL.md
│   │   ├── _template-framework/SKILL.md.tpl
│   │   └── _template-api/SKILL.md.tpl
│   └── lessons-learned/README.md
├── .cursor/
│   └── README.md
├── docs/
│   ├── WORKSPACE-REUSABILITY-GUIDE.md    # ← This file
│   ├── CURSOR-AGENTS.md
│   ├── _AGENTS_TEMPLATE.md               # Base template
│   ├── stacks/
│   │   ├── nextjs-hono-prisma.md
│   │   ├── fastapi-sqlalchemy.md
│   │   └── rails-postgres.md
│   ├── references/
│   │   ├── git.md
│   │   ├── typescript.md
│   │   ├── testing.md
│   │   └── security.md
│   └── methodology.md
├── SETUP-NEW-PROJECT.md
└── README.md
```

---

## Configuration Files Reference

### opencode.json (Framework-Specific)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "generic-tool-1": {
      "type": "local",
      "command": ["npx", "tool@latest", "mcp"]
    },
    "generic-tool-2": {
      "type": "remote",
      "url": "https://example.com/mcp"
    }
  }
}
```

- **Keep**: MCP server registry concept
- **Change**: Specific tool versions and endpoints
- **Add**: Framework-specific MCP tools (e.g., `fastapi-mcp`, `django-mcp`)

### .cursor/rules/ (Optional)

Create file-scoped hints for framework-specific tools:

```
.cursor/rules/
├── **/*.tsx.md        # React component patterns
├── api/**.ts.md       # API route patterns
└── **/*.prisma.md     # Prisma schema patterns
```

Keep them **short** (< 100 lines) and **focused** on syntax/structure.

---

## Recommended Workflow for New Projects

### 1. Project Initialization

```bash
# Clone or create new project
mkdir my-new-project && cd my-new-project
git init

# Copy base structure from template
cp -r ~/agent-workspace-template/.agents .
cp -r ~/agent-workspace-template/.cursor .
cp ~/agent-workspace-template/docs .
```

### 2. Customize AGENTS.md

```bash
# Start with template
cp docs/_AGENTS_TEMPLATE.md AGENTS.md

# Edit for your stack:
# - Title
# - Commands
# - Framework section
# - ORM/Database
# - Auth system
# - API patterns
```

### 3. Create Framework Skills

```bash
# Scaffold skills for your framework
mkdir .agents/skills/my-framework
mkdir .agents/skills/my-api

# Fill in SKILL.md files with:
# - When to use (keywords)
# - Key patterns
# - Best practices
```

### 4. Mirror to Cursor

```bash
# Symlink or copy project skills
ln -s ../.agents/skills/* .cursor/skills/
```

### 5. Document Your Stack

```bash
# Reference docs for your framework
touch docs/references/my-framework.md
touch docs/references/my-api.md
touch docs/references/my-orm.md

# Stack overview
cat > docs/STACK.md << 'EOF'
# [Project] Stack Overview

## Technology Choices
- Framework: [X]
- API: [Y]
- Database: [Z]
- Auth: [W]

## Why These Choices
[Justification for each choice]

## Key Resources
- [Framework] Docs
- [ORM] Docs
- etc.
EOF
```

### 6. Commit and Share

```bash
# Commit template to version control
git add .
git commit -m "initial: setup agent workspace from template"

# Now ready to develop!
```

---

## Lessons Learned System

The `.agents/lessons-learned/` directory is **fully reusable**:

```
.agents/lessons-learned/
├── README.md          # Project learnings
├── WORKFLOW.md        # How to use this system
└── entries/
    ├── 001-git-workflow-improvements.md
    ├── 002-testing-best-practices.md
    └── etc.
```

**How to use:**

1. After completing complex tasks, document what you learned
2. Update AGENTS.md with new patterns
3. Create `.agents/lessons-learned/entries/{number}-{topic}.md`
4. Share with team via git history

**Copy this structure to new projects as-is.**

---

## Cross-Project Synchronization

### Strategy: Central Repository

```bash
# Create central agent workspace repo
git clone <central-repo> ~/agent-workspace
cd ~/agent-workspace

# Sync structure
git pull origin main

# Copy to each project
cp -r skills/* ~/my-project-1/.agents/skills/
cp -r skills/* ~/my-project-2/.agents/skills/

# Or use git submodules (advanced)
cd ~/my-project-1
git submodule add <central-repo> .agents/skills/shared
```

### Strategy: NPM/Package Distribution

```bash
# Publish as npm package
npm publish agent-workspace-base@1.0.0

# Install in projects
npm install --save-dev agent-workspace-base

# Copy structure post-install
postinstall: "cp -r node_modules/agent-workspace-base/* ."
```

### Strategy: GitHub Template

Make the template a public GitHub template:

```bash
# GitHub Settings → Template Repository (checkbox)
# Now others can: Use this template → Create new repo from template
```

---

## Summary: What to Copy Where

### For Every New Project

| From | To | Copy? | Notes |
|------|----|----|-------|
| `~/.claude/skills/` | (already global) | Skip | Already installed |
| `git-workflow/SKILL.md` | `.agents/skills/` | ✅ Yes | As-is |
| `cursor-workflows/SKILL.md` | `.agents/skills/` | ✅ Yes | As-is |
| `AGENTS.md` (template) | `./AGENTS.md` | ✅ Yes | **Customize heavily** |
| `docs/_AGENTS_TEMPLATE.md` | Delete | ❌ No | Use as reference only |
| `docs/CURSOR-AGENTS.md` | `./docs/` | ✅ Yes | Generic concept |
| `docs/methodology.md` | `./docs/` | ✅ Yes | Universal practices |
| `.cursor/README.md` | `.cursor/` | ✅ Yes | **Update skill names** |

### Framework-Specific (Adapt)

| From | To | Copy? | Notes |
|------|----|----|-------|
| `mir-development/SKILL.md` | Your framework skill | ⚠️ Adapt | Use as pattern |
| `mir-hono-api/SKILL.md` | Your API skill | ⚠️ Adapt | Use as pattern |
| Features / schema | Reference only | ❌ No | Zolai-specific patterns |

---

## Glossary

| Term | Definition |
|------|-----------|
| **Skill** | Agent configuration file defining when to use specialized knowledge |
| **AGENTS.md** | Project conventions, commands, and standards |
| **Global Skills** | Reusable across all projects (code review, security audit, etc.) |
| **Project Skills** | Specific to one project (framework, API patterns, etc.) |
| **Template** | Base structure for new projects |
| **Stack** | Technology choices (framework + API + DB + Auth) |
| **Cursor IDE** | Code editor with agent integration |
| **OpenCode** | Agent interface for code tasks |

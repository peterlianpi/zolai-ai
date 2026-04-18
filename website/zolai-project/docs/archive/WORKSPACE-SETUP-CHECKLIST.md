# Agent Workspace Setup Checklist

Use this checklist to verify your workspace is properly configured for reusability and cross-platform use.

## Pre-Setup

- [ ] You have OpenCode/Claude installed
- [ ] You have Cursor IDE installed (optional but recommended)
- [ ] You have git available
- [ ] You understand your project's tech stack

## Global Skills Setup (One-time, per machine)

### Check Global Skills Location

```bash
ls ~/.claude/skills/
```

You should see these (or a subset):
- [ ] `code-review-skill/`
- [ ] `security-audit-skill/`
- [ ] `master-security-skill/`
- [ ] `vulnerability-fix-skill/`
- [ ] `domain-recon-skill/`
- [ ] `cve-check-skill/`
- [ ] `self-improve-skill/`

**Action**: If missing, install or copy from `/home/peter/.claude/skills/`

## Project Structure Setup

### Core Directories

- [ ] `.agents/` exists
- [ ] `.agents/skills/` exists
- [ ] `.agents/lessons-learned/` exists
- [ ] `.cursor/` exists (if using Cursor)
- [ ] `.cursor/skills/` exists (if using Cursor)
- [ ] `docs/` exists
- [ ] `docs/references/` exists

**Action**:
```bash
mkdir -p .agents/skills
mkdir -p .agents/lessons-learned
mkdir -p .cursor/skills
mkdir -p docs/references
```

## Reusable Skills Configuration

### Generic Skills (Copy from Template)

- [ ] `git-workflow/SKILL.md` in `.agents/skills/`
- [ ] `cursor-workflows/SKILL.md` in `.agents/skills/` (if using Cursor)

**Check content**:
```bash
head -20 .agents/skills/git-workflow/SKILL.md
# Should define: branch naming, commit messages, PR workflow
```

### Framework-Specific Skills (Create)

For your framework, you need:

- [ ] `.agents/skills/[my-framework]/SKILL.md` created
- [ ] `.agents/skills/[my-api]/SKILL.md` created (if applicable)

**Checklist for each SKILL.md**:
- [ ] Has `# Skill: [Name]` heading
- [ ] Has `## Purpose` section (1-2 sentences)
- [ ] Has `## When to Use` section with keywords
- [ ] Has `## Key Concepts` section with 3+ patterns
- [ ] Has `## Best Practices` section
- [ ] Has code examples for your framework

### Security Audit Skill (Optional but Recommended)

- [ ] `security-audit/SKILL.md` exists in `.agents/skills/`

Or link from global:
```bash
ln -s ~/.claude/skills/security-audit-skill/SKILL.md \
      .agents/skills/security-audit/SKILL.md
```

## Documentation Setup

### AGENTS.md (Critical - Foundation)

- [ ] `AGENTS.md` exists in project root
- [ ] Has `# AGENTS.md — [PROJECT NAME]` header
- [ ] Has `## 🛠 Commands` section with your commands
- [ ] Has `## 📐 Code Style & Architecture` customized
- [ ] Has `## 💾 Database & State` customized for your ORM/DB
- [ ] Has `## 🧠 Development Methodologies` (mostly copy from template)
- [ ] Has `## 🏗️ Branching Strategy` (mostly copy from template)
- [ ] Has `## 🤖 Agent Workflow` (mostly copy from template)
- [ ] Has `## 🤖 Agent Skills & Memory` with your skill names

**Validation**:
```bash
# Should NOT contain
grep -i "next\.js\|hono\|prisma\|better auth" AGENTS.md
# If your project doesn't use these, they shouldn't appear
```

### Stack Documentation

- [ ] `docs/STACK.md` created
- [ ] Documents your framework choice
- [ ] Documents your database choice
- [ ] Documents your API framework
- [ ] Documents your auth system
- [ ] Has "Why these choices" justification

**Template content**:
```markdown
# [Project] Stack

## Architecture
- Framework: [Your framework]
- API: [Your API framework]
- Database: [Your database]
- Auth: [Your auth system]

## Why These Choices
[Your justification]
```

### Reference Documentation

For each major technology in your stack:

- [ ] `docs/references/my-framework.md` created
- [ ] `docs/references/my-api.md` created (if applicable)
- [ ] `docs/references/my-database.md` created (if applicable)

**Each should include**:
- [ ] Overview of the technology
- [ ] Installation/setup instructions
- [ ] Basic usage examples
- [ ] Common patterns for this project
- [ ] Links to official documentation

### Methodology Documentation (Can Copy)

- [ ] `docs/CURSOR-AGENTS.md` exists (copy from template)
- [ ] `docs/methodology.md` exists (copy from template, or link)
- [ ] `docs/references/git.md` exists
- [ ] `docs/references/testing.md` exists
- [ ] `docs/references/typescript.md` exists (if using TypeScript)

## Cursor IDE Configuration

### Mirror Skills to Cursor

- [ ] `.cursor/skills/` contains all your `.agents/skills/`

**Method 1 (Symlink)**:
```bash
cd .cursor/skills/
ln -s ../../.agents/skills/* .
ls -la
# Should show symlinks to all .agents/skills/
```

**Method 2 (Copy)**:
```bash
cp -r .agents/skills/* .cursor/skills/
```

**Method 3 (Verify)**:
```bash
# Count should match
find .agents/skills -name SKILL.md | wc -l
find .cursor/skills -name SKILL.md | wc -l
# Should be equal
```

### Update Cursor README

- [ ] `.cursor/README.md` exists
- [ ] Has `# Cursor — project agent context` heading
- [ ] Has `## Skills index` table
- [ ] Lists all your skills with descriptions
- [ ] Links to AGENTS.md
- [ ] Links to docs/

**Template**:
```markdown
# Cursor — project agent context

This folder holds **project-scoped** Agent Skills for [PROJECT NAME].

## Skills index

| Skill | Purpose |
|-------|---------|
| git-workflow | Git branching and commits |
| my-framework | [Framework] patterns |
| my-api | [API] patterns |

## Documentation
- [AGENTS.md](../AGENTS.md) — Full standards
- [docs/](../docs/) — Reference materials
```

## Lessons Learned System

- [ ] `.agents/lessons-learned/README.md` exists
- [ ] Contains instructions for documenting learnings
- [ ] `.agents/lessons-learned/entries/` directory created

**Optional structure**:
```
.agents/lessons-learned/
├── README.md
├── WORKFLOW.md          # How to use this system
└── entries/
    ├── 001-first-learning.md
    └── 002-second-learning.md
```

## Git Configuration

### Repository Setup

- [ ] `.git/` exists (initialized repo)
- [ ] `.gitignore` includes `.env`, `node_modules/`, etc.

**Verify**:
```bash
git status
# Should show clean working tree or tracked changes
```

### Branching

- [ ] `main` or `master` branch exists
- [ ] `develop` branch created
- [ ] All development happens on `develop`
- [ ] Releases merge to `main/master`

**Verify**:
```bash
git branch -a
# Should show: develop, main/master
```

### Commit Configuration

Check your git config:
```bash
git config user.name
git config user.email
```

- [ ] Your name is correct
- [ ] Your email is correct
- [ ] Commits are signed (optional)

## Configuration Files

### opencode.json (for OpenCode CLI)

- [ ] `opencode.json` exists in project root
- [ ] Contains MCP server configurations for your tools
- [ ] Format is valid JSON

**Basic template**:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {}
}
```

### .cursor/rules/ (Optional)

If you want file-scoped hints:

- [ ] `.cursor/rules/` directory created (optional)
- [ ] Pattern-based rule files created (e.g., `**/*.ts.md`)
- [ ] Rules are brief (< 100 lines) and focused

**Example**:
```bash
.cursor/rules/
├── **/*.tsx.md         # React component rules
├── api/**.ts.md        # API rules
└── db/**.ts.md         # Database rules
```

## Validation & Testing

### Syntax Validation

```bash
# Check JSON files
jq . opencode.json

# Check YAML if used
# yaml-lint .cursor/*.yml

# Check markdown
# mdl AGENTS.md docs/*.md
```

- [ ] `opencode.json` is valid JSON
- [ ] All SKILL.md files have proper markdown syntax

### Content Validation

```bash
# Verify AGENTS.md doesn't contain old project references
grep -i "test_project\|deprecated" AGENTS.md
# Should return empty

# Verify skills are linked in .cursor/README.md
grep "skill" .cursor/README.md
# Should match your actual skills

# Verify all skills have required sections
for file in .agents/skills/*/SKILL.md; do
  echo "=== $(dirname $file) ==="
  grep "^## Purpose\|^## When to Use\|^## Key" "$file"
done
```

- [ ] No references to other projects in AGENTS.md
- [ ] All skills listed in `.cursor/README.md`
- [ ] All skills have Purpose, When to Use, Key sections
- [ ] No broken file links in documentation

### Cursor IDE Testing

If using Cursor:

```bash
# 1. Open project in Cursor
cursor .

# 2. Press Cmd+K (Mac) or Ctrl+K (Linux/Windows)
# 3. Try a simple coding question
# 4. Verify it shows context about your framework
```

- [ ] Can open project in Cursor
- [ ] Agent interface works (Cmd+K or Ctrl+K)
- [ ] Agent shows your framework context
- [ ] Skills are recognized (check in skill dropdown)

### OpenCode CLI Testing

If using OpenCode CLI:

```bash
# Test that OpenCode loads your config
opencode --version
opencode --help

# Run a simple code task
opencode "check my setup"
```

- [ ] OpenCode recognizes the project
- [ ] Config loads without errors
- [ ] Can run basic tasks

## Documentation Review

### Self-Review Checklist

Read through each of these as if you were a new team member:

- [ ] Can I understand the project from README.md?
- [ ] Can I find all the commands I need in AGENTS.md?
- [ ] Can I understand the code style from AGENTS.md?
- [ ] Can I understand the tech stack from docs/STACK.md?
- [ ] Can I find framework-specific docs in docs/references/?
- [ ] Can I understand how to use the agent system?

**Action**: Fix any gaps or unclear sections.

### For Team Members

Share these documents:
- [ ] README.md — Project overview
- [ ] AGENTS.md — Coding standards
- [ ] docs/STACK.md — Tech decisions
- [ ] .cursor/README.md — Agent setup
- [ ] docs/WORKSPACE-REUSABILITY-GUIDE.md — Understanding the system

## Cleanup & Final Steps

### Remove Unnecessary Files

```bash
# If copying from starter template, remove:
rm docs/_AGENTS_TEMPLATE.md           # Template (not needed)
rm -rf features/                      # If not using these
rm -rf prisma/                        # If not using Prisma
rm CLAUDE.md                          # If outdated
rm docs/BETTER_AUTH*.md               # If not using Better Auth
```

- [ ] Removed template files
- [ ] Removed example code not relevant to your project
- [ ] Removed project-specific docs from other projects

### Commit Initial Setup

```bash
git add .
git commit -m "initial: setup agent workspace"

# If you want to preserve template history:
git checkout develop
git merge main
# (adjust branch names as needed)
```

- [ ] Committed all setup files
- [ ] Branches pushed to remote
- [ ] .gitignore prevents committing secrets

## Reusability Verification

### Can Another Developer Clone This?

```bash
# Simulate a fresh clone
cd /tmp
git clone <your-repo> test-clone
cd test-clone

# Verify structure
ls -la .agents/skills/
ls -la .cursor/skills/
ls AGENTS.md docs/STACK.md

# Verify they can read docs
cat AGENTS.md
cat .cursor/README.md
```

- [ ] Repo clones without errors
- [ ] All structure is present
- [ ] Documentation is complete
- [ ] Can understand project immediately

### Can Another Project Reuse Your Skills?

```bash
# Are skills framework-agnostic?
grep -l "next\|hono\|prisma" .agents/skills/*/SKILL.md
# Should be empty (if git-workflow, etc are generic)

# Is AGENTS.md a good template?
# (Should be mostly customizable, not hardcoded to your project)
```

- [ ] Generic skills have no framework references
- [ ] AGENTS.md uses placeholders, not hardcoded project names
- [ ] Someone could copy git-workflow and use it elsewhere

## Post-Setup

### Documentation Updates

After development starts:
- [ ] Update AGENTS.md with new patterns discovered
- [ ] Add entries to `.agents/lessons-learned/`
- [ ] Enrich docs/references/ with real examples
- [ ] Keep docs/STACK.md updated with decisions

### Skill Maintenance

- [ ] Review skills quarterly
- [ ] Add new patterns as discovered
- [ ] Remove outdated patterns
- [ ] Share improvements with template repo

### Periodic Audits

Every sprint or month:
- [ ] Run `bun run lint` (or your linter)
- [ ] Run `bun run test` (or your test suite)
- [ ] Review AGENTS.md for outdated info
- [ ] Check for new dependencies/tools to document

---

## Troubleshooting

### Skills Not Loading in Cursor

**Problem**: Skills appear in `.cursor/skills/` but Cursor doesn't recognize them

**Solutions**:
1. Check `.cursor/README.md` is well-formed
2. Restart Cursor
3. Ensure symlinks work: `ls -la .cursor/skills/`
4. Try copying instead of symlinking: `cp -r .agents/skills/* .cursor/skills/`

### Agent Doesn't Show Framework Context

**Problem**: When using agent, it doesn't mention your framework

**Solutions**:
1. Check AGENTS.md has your framework name
2. Check `.agents/skills/my-framework/SKILL.md` exists
3. Ensure skill has good "When to Use" keywords
4. Try restarting Cursor/OpenCode

### Documentation Links Broken

**Problem**: Links in .cursor/README.md or docs point to missing files

**Solutions**:
```bash
# Find broken links
find . -name "*.md" -exec grep -l "\]\(" {} \; | while read f; do
  grep -o '\]\([^)]*\)' "$f" | grep -v "http" | sed 's/.*(\(.*\))/\1/' | sort -u
done
# Verify each file exists
```

### Git Conflicts on AGENTS.md

**Prevention**: Make AGENTS.md sections clear, don't overlap edits

**Solution**: Merge carefully
```bash
git merge --no-ff feature/branch -m "merge with conflict resolution"
# Edit AGENTS.md to combine both sets of changes
git add AGENTS.md
git commit --no-edit
```

---

## Sign-Off

When all items are checked:

```bash
git add -A
git commit -m "chore: complete agent workspace setup

- ✅ Global skills configured
- ✅ Project skills created
- ✅ AGENTS.md customized
- ✅ Documentation complete
- ✅ Cursor IDE configured
- ✅ Git workflow ready
- ✅ Ready for team/reuse"

git push origin develop
```

**Celebrate!** 🎉 Your workspace is now reusable across projects.


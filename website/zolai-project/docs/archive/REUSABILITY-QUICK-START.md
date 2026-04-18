# Workspace Reusability: Quick Reference Card

Print this page and keep it handy when setting up new projects.

## What's Reusable?

### ✅ Always Copy (100% Ready)
```
~/.claude/skills/                      # Global skills (any project)
.agents/skills/git-workflow/           # Git conventions
.agents/skills/cursor-workflows/       # Cursor IDE
.agents/lessons-learned/               # Learning system
docs/CURSOR-AGENTS.md                  # Agent architecture
```

### ⚠️ Adapt for Your Stack
```
AGENTS.md                              # Edit: commands, frameworks, DB, API
.agents/skills/mir-development/        # Pattern for YOUR framework skill
.agents/skills/mir-hono-api/           # Pattern for YOUR API skill
.cursor/README.md                      # Update skill names list
docs/references/*.md                   # Replace with your tech stack
opencode.json                          # Replace MCP servers
```

### ❌ Delete (Starter-Only)
```
.agents/skills/mir-project/            # project roadmap
.agents/skills/data-analytics/         # starter feature
.agents/skills/ui-design/              # starter feature
features/                              # starter features
prisma/                                # data schema
app/                                   # pages
docs/features/                         # docs
docs/BETTER_AUTH*.md                   # auth choice
docs/references/{shadcn,nextjs,hono,prisma,better-auth}.md
```

---

## Setup Flow: 5 Minutes

```bash
# 1. Start fresh
mkdir my-project && cd my-project
git init

# 2. Create structure
mkdir -p .agents/skills .cursor/skills docs/references
mkdir -p .agents/lessons-learned

# 3. Copy reusable
cp -r ~/mir/.agents/skills/git-workflow .agents/skills/
cp -r ~/mir/.agents/skills/cursor-workflows .agents/skills/
cp ~/mir/.agents/lessons-learned/README.md .agents/lessons-learned/
cp ~/mir/docs/CURSOR-AGENTS.md docs/

# 4. Create your AGENTS.md
cat > AGENTS.md << 'AGENTS'
# AGENTS.md — [YOUR PROJECT]

## 🛠 Commands
[YOUR commands]

## 📐 Code Style & Architecture
[YOUR framework patterns]

## 💾 Database & State
[YOUR ORM/database]

## 🧠 Development Methodologies
[Copy from mir/AGENTS.md — unchanged]

## 🏗️ Branching Strategy
[Copy from mir/AGENTS.md — unchanged]

## 🤖 Agent Workflow
[Copy from mir/AGENTS.md — unchanged]

## 🤖 Agent Skills & Memory
- git-workflow
- cursor-workflows
- [YOUR-framework]
- [YOUR-api]
AGENTS

# 5. Create framework skills
mkdir -p .agents/skills/my-framework
cat > .agents/skills/my-framework/SKILL.md << 'SKILL'
# Skill: [Framework] Development

## Purpose
[Your framework patterns]

## When to Use
- "[framework]"
- "[command]"

## Key Patterns
- [Pattern 1]
- [Pattern 2]
SKILL

# 6. Mirror to Cursor
cp -r .agents/skills/* .cursor/skills/

# 7. Document stack
cat > docs/STACK.md << 'STACK'
# Tech Stack

## Choices
- Framework: [X]
- API: [Y]
- Database: [Z]
- Auth: [W]

## Why
[Your reasoning]
STACK

# 8. Done!
git add .
git commit -m "initial: setup reusable workspace"
```

---

## Key Concepts

### Global Skills (Installed Once)
Live in `~/.claude/skills/`
Shared across ALL projects
- code-review-skill
- security-audit-skill
- master-security-skill
- vulnerability-fix-skill
- domain-recon-skill
- cve-check-skill
- self-improve-skill

### Project Skills (Per Project)
Live in `.agents/skills/`
Mirrored to `.cursor/skills/`
- `git-workflow/` ← Copy as-is
- `cursor-workflows/` ← Copy as-is
- `[your-framework]/` ← Create new
- `[your-api]/` ← Create new

### AGENTS.md (The Control File)
ONE file that controls everything
- Project conventions
- Code style
- Commands
- Framework patterns
- Database patterns
- Agent skill references

Customize the "Framework" sections
Keep the "Methodologies" sections

---

## Decision Tree

```
New Project?
│
├─ Using Next.js?
│  └─ Copy mir-development → Customize
│
├─ Using FastAPI/Flask?
│  └─ Create fastapi-development/ from scratch
│
├─ Using Rails?
│  └─ Create rails-development/ from scratch
│
├─ Using Express?
│  └─ Create express-development/ from scratch
│
└─ Something else?
   └─ Use mir-development as pattern
```

Same for API framework:
```
What API?
├─ Hono → Copy mir-hono-api, customize
├─ Express → Create express-api/
├─ FastAPI → Create fastapi-api/
├─ Rails → Create rails-api/
└─ Other → Use mir-hono-api as pattern
```

---

## File Checklist

For every new project, you need:

- [ ] `AGENTS.md` (customized)
- [ ] `.agents/skills/git-workflow/` (copy)
- [ ] `.agents/skills/cursor-workflows/` (copy)
- [ ] `.agents/skills/[your-framework]/` (create)
- [ ] `.agents/skills/[your-api]/` (create)
- [ ] `.agents/lessons-learned/` (copy structure)
- [ ] `.cursor/skills/` (mirror from .agents/skills/)
- [ ] `.cursor/README.md` (create)
- [ ] `docs/STACK.md` (create)
- [ ] `docs/references/[your-framework].md` (create)
- [ ] `docs/references/[your-api].md` (create)
- [ ] `opencode.json` (update)

That's it! 12 items.

---

## Customization Checklist

When creating AGENTS.md:

**REQUIRED (Change These)**:
- [ ] Title → Your project name
- [ ] Commands → Your commands
- [ ] Framework section → Your framework
- [ ] Database section → Your ORM
- [ ] API section → Your API framework
- [ ] Auth section → Your auth system
- [ ] Skills list → Your actual skills

**KEEP (Don't Change)**:
- [ ] Development Methodologies
- [ ] Testing Strategy
- [ ] Branching Strategy
- [ ] Agent Workflow
- [ ] Code Quality
- [ ] Security Practices

---

## Common Patterns

### Skills Template

```markdown
# Skill: [Name]

## Purpose
[1-2 sentences]

## When to Use
- "[keyword1]"
- "[keyword2]"

## Key Patterns
- [Pattern 1]
- [Pattern 2]
- [Pattern 3]

## Best Practices
- [Practice 1]
- [Practice 2]
```

### AGENTS.md Commands Section

```markdown
## 🛠 Commands
```bash
[your-package-manager] run dev      # Start dev server
[your-package-manager] run build    # Build
[your-package-manager] run lint     # Lint
[your-package-manager] run test     # Test
```
```

### AGENTS.md Framework Section

```markdown
### [Framework Name] Patterns
- [Pattern 1]
- [Pattern 2]
- [Pattern 3]

### Error Handling
[Your framework's approach]

### Testing
[Your testing framework]
```

---

## Why This System Works

### For New Projects
- Copy proven patterns
- No wheel reinvention
- Consistent across team

### For Teams
- Shared conventions
- Shared skills
- Shared learning

### For Individuals
- Less time setting up
- More time coding
- Better documentation

---

## Further Reading

- **WORKSPACE-REUSABILITY-GUIDE.md** — Deep dive (everything)
- **SETUP-NEW-PROJECT.md** — Step-by-step walkthrough
- **WORKSPACE-SETUP-CHECKLIST.md** — Verification checklist
- **WORKSPACE-REUSABILITY-MATRIX.md** — Detailed breakdown

---

## Quick Troubleshooting

**"Skills not loading in Cursor?"**
→ Check `.cursor/README.md` syntax
→ Restart Cursor
→ Verify symlinks: `ls -la .cursor/skills/`

**"AGENTS.md still references Zolai?"**
→ Search: `grep -i "next\|hono\|prisma\|myanmar" AGENTS.md`
→ Replace all matches with your framework

**"Not sure what to keep in AGENTS.md?"**
→ If it's about methodology (testing, branching, workflow) → KEEP
→ If it's about your stack → CHANGE

**"Creating a framework skill from scratch?"**
→ Use mir-development/SKILL.md as pattern
→ Include: Purpose, When to Use, Key Patterns, Best Practices
→ Add code examples for your framework

---

## Print This Card

Keep on desk while setting up:
```
✅ Copy           ⚠️ Adapt          ❌ Delete
git-workflow      AGENTS.md         features/
cursor-workflows  mir-dev pattern   prisma/
Global skills     opencode.json     app/
lessons-learned   .cursor/README.md docs/features/
CURSOR-AGENTS.md  docs/references/  mir-project skill
```

**3 Steps**:
1. Copy reusable files
2. Customize AGENTS.md
3. Create framework skills

**Done in 5 minutes.**


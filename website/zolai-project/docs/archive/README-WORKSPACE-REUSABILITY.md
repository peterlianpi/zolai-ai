# Workspace Reusability Documentation

This section contains everything you need to make your Zolai AI workspace reusable across different projects and platforms.

## 📚 Documentation Index

### Start Here
- **[REUSABILITY-QUICK-START.md](REUSABILITY-QUICK-START.md)** ⭐ **START HERE**
  - 1-page quick reference card
  - Copy/Adapt/Delete checklist
  - 5-minute setup flow
  - Decision trees for your framework
  - Print and keep on desk

### For New Projects
- **[SETUP-NEW-PROJECT.md](SETUP-NEW-PROJECT.md)**
  - Step-by-step setup (5 min quick start, 15 min full setup)
  - Customization checklist
  - Framework-specific examples (Node.js, Python, Ruby)
  - File templates
  - Validation instructions

### For Understanding the System
- **[WORKSPACE-REUSABILITY-GUIDE.md](WORKSPACE-REUSABILITY-GUIDE.md)**
  - Complete architecture overview
  - Why this system works
  - 3-phase implementation strategy
  - Cross-project synchronization
  - Extension points for new skills
  - 5000+ lines of detail

### For Detailed Reference
- **[WORKSPACE-REUSABILITY-MATRIX.md](WORKSPACE-REUSABILITY-MATRIX.md)**
  - Every file/component in Zolai AI
  - Reusability status (✅/⚠️/❌)
  - Specific actions for each
  - Global skills reference
  - Documentation breakdown
  - Configuration file guide

### For Setup Verification
- **[WORKSPACE-SETUP-CHECKLIST.md](WORKSPACE-SETUP-CHECKLIST.md)**
  - Pre-setup validation
  - Global skills verification
  - Project structure checklist
  - Cursor IDE configuration
  - Documentation review
  - Testing & troubleshooting
  - Sign-off checklist

---

## Quick Decision: Which Document?

### "I need to set up a new project RIGHT NOW"
→ **REUSABILITY-QUICK-START.md** (5 min)

### "I want step-by-step guidance"
→ **SETUP-NEW-PROJECT.md** (15 min)

### "I want to understand how this system works"
→ **WORKSPACE-REUSABILITY-GUIDE.md** (30 min read)

### "I need to verify everything is correct"
→ **WORKSPACE-SETUP-CHECKLIST.md** (15 min)

### "I need detailed info about component X"
→ **WORKSPACE-REUSABILITY-MATRIX.md** (reference)

---

## Key Concepts

### Three Layers of Configuration

```
Layer 1: Global Skills (Machine-Wide)
~/.claude/skills/
├── code-review-skill/
├── security-audit-skill/
├── master-security-skill/
├── vulnerability-fix-skill/
├── domain-recon-skill/
├── cve-check-skill/
└── self-improve-skill/
↓ Shared across ALL projects
```

```
Layer 2: Project Skills (Per-Project)
.agents/skills/
├── git-workflow/              ✅ Copy as-is
├── cursor-workflows/          ✅ Copy as-is
├── my-framework/              ✨ Create new
└── my-api/                    ✨ Create new
↓ Customized for your stack
```

```
Layer 3: IDE Config (Per-IDE)
.cursor/skills/                ↔️ Mirror of .agents/skills/
.cursor/README.md              ⚠️ Update skill list
↓ IDE-specific shortcuts
```

### Central Control: AGENTS.md

Everything is defined in one file:
- Project name & purpose
- Your commands
- Code style for YOUR framework
- Database for YOUR ORM
- API patterns for YOUR framework
- Skills you're using
- Development methodologies
- Branching strategy
- Agent workflow

**Key insight**: AGENTS.md is the SOURCE OF TRUTH. Everything else references it.

---

## Reusability by the Numbers

### What's Reusable?

| Category | Count | Status |
|----------|-------|--------|
| Global Skills | 7 | ✅ 100% Reusable |
| Reusable Project Skills | 2 | ✅ Copy as-is |
| Adaptable Skills | 2 | ⚠️ Use as pattern |
| AGENTS.md Sections | 10 | ✅ 7 Keep, ⚠️ 3 Customize |
| Documentation Files | 20+ | ⚠️ Pick and choose |
| Config Files | 3 | ⚠️ Adapt |
| Code Directories | 5 | ❌ Delete (project-specific) |

### Bottom Line
- **✅ Copy these exactly**: 10+ items
- **⚠️ Adapt these**: 12+ items
- **❌ Delete these**: 15+ items

---

## Setup Checklist (Quick)

For a new project, you need:

1. **Copy** (10 minutes)
   - [ ] `~/.claude/skills/*` → already installed
   - [ ] `.agents/skills/git-workflow/` copy
   - [ ] `.agents/skills/cursor-workflows/` copy
   - [ ] `.agents/lessons-learned/` copy structure

2. **Create** (5 minutes)
   - [ ] `AGENTS.md` customize
   - [ ] `.agents/skills/my-framework/` create
   - [ ] `.agents/skills/my-api/` create
   - [ ] `docs/STACK.md` create

3. **Mirror** (2 minutes)
   - [ ] `.cursor/skills/` ← symlink to `.agents/skills/`
   - [ ] `.cursor/README.md` update

**Total time: 15-20 minutes**

---

## By Framework

If you're using a specific framework, here's where to look:

### Next.js
- Copy: `mir-development/SKILL.md` 
- Adapt: AGENTS.md (Hono → Your API)
- Keep: All Next.js patterns
- Reference: `docs/references/nextjs.md`

### FastAPI/Python
- Create: `fastapi-development/SKILL.md`
- Create: `fastapi-api/SKILL.md`
- Use: `mir-development/SKILL.md` as pattern
- Reference: Create `docs/references/fastapi.md`

### Rails
- Create: `rails-development/SKILL.md`
- Create: `rails-api/SKILL.md`
- Use: `mir-hono-api/SKILL.md` as pattern (APIs are similar)
- Reference: Create `docs/references/rails.md`

### Express/Node.js
- Create: `express-development/SKILL.md`
- Create: `express-api/SKILL.md`
- Use: `mir-hono-api/SKILL.md` as pattern
- Reference: Create `docs/references/express.md`

---

## Common Questions

### "Can I reuse AGENTS.md as-is?"
No, customize it heavily. The framework sections are Zolai AI-specific. But the methodology sections (Spec-Driven Development, TDD, Branching Strategy) are universal.

### "How do I create a framework skill?"
Use `mir-development/SKILL.md` as a template. Replace Next.js patterns with your framework's patterns. Include: Purpose, When to Use, Key Patterns, Best Practices, Code Examples.

### "What about global skills?"
Those are installed in `~/.claude/skills/` once, on your machine. All projects use them automatically. No need to copy them to each project.

### "When do I delete vs. adapt?"
- **Delete**: Feature code, data schema, project-specific docs
- **Adapt**: AGENTS.md, configuration, reference docs
- **Copy**: Methodology docs, branching strategy, lessons-learned structure

### "How do I know what's working?"
Use the WORKSPACE-SETUP-CHECKLIST.md to verify everything is correct. Test in Cursor IDE (Cmd+K or Ctrl+K).

---

## Workflow Summary

### Phase 1: Understand (5 min)
Read REUSABILITY-QUICK-START.md

### Phase 2: Plan (5 min)
Decide your tech stack (framework, API, database)

### Phase 3: Setup (15 min)
Follow SETUP-NEW-PROJECT.md step-by-step

### Phase 4: Verify (10 min)
Use WORKSPACE-SETUP-CHECKLIST.md

### Phase 5: Develop
Start coding with confidence!

### Phase 6: Learn & Improve (Ongoing)
- Update `.agents/lessons-learned/` with learnings
- Improve AGENTS.md with new patterns
- Contribute improvements back to template

---

## Distribution

### To Share This Workspace

Option 1: GitHub Template Repository
```bash
# In GitHub settings: "Template Repository" ✓
# Others can: Use this template → Create new repo
```

Option 2: NPM Package
```bash
npm publish agent-workspace-base
# Others: npm install && npm run setup
```

Option 3: Direct Copy
```bash
git clone <repo>
# Copy .agents/, .cursor/, docs/ to new project
```

Option 4: Git Submodule (Advanced)
```bash
git submodule add <repo> .agents/shared
# Others: git submodule update --init
```

---

## Folder Structure Reference

```
Your New Project
├── .agents/
│   ├── skills/
│   │   ├── git-workflow/          ✅ Copy
│   │   ├── cursor-workflows/      ✅ Copy
│   │   ├── my-framework/          ✨ Create
│   │   └── my-api/                ✨ Create
│   └── lessons-learned/
│       └── README.md              ✅ Copy structure
│
├── .cursor/
│   ├── skills/                    ↔️ Mirror from .agents/skills/
│   └── README.md                  ✨ Create
│
├── docs/
│   ├── CURSOR-AGENTS.md           ✅ Copy
│   ├── STACK.md                   ✨ Create
│   ├── references/
│   │   ├── git.md                 ✅ Copy
│   │   ├── my-framework.md        ✨ Create
│   │   └── my-api.md              ✨ Create
│   └── WORKSPACE-*.md             ✅ Copy for reference
│
├── AGENTS.md                      ⚠️ Customize heavily
├── opencode.json                  ⚠️ Update servers
├── README.md                      ✨ Create
└── .gitignore                     ✨ Create
```

---

## Success Criteria

Your workspace is set up correctly when:

- [ ] All files from checklist are in place
- [ ] AGENTS.md has no references to old project names
- [ ] AGENTS.md mentions YOUR framework, not Next.js
- [ ] `.agents/skills/` has framework + API skills
- [ ] `.cursor/skills/` has all the same skills
- [ ] `.cursor/README.md` lists all your skills
- [ ] `docs/STACK.md` explains your choices
- [ ] `opencode.json` has YOUR tools, not shadcn/neon
- [ ] Everything is committed to git
- [ ] Cursor IDE recognizes the skills (Cmd+K test)
- [ ] Team can clone and understand immediately

---

## Next Steps

1. **Pick a document based on your need** (see "Quick Decision" above)
2. **Follow the steps** in that document
3. **Verify with checklist** (WORKSPACE-SETUP-CHECKLIST.md)
4. **Share with team** via git
5. **Develop with confidence** using proven patterns
6. **Learn and improve** using lessons-learned system
7. **Contribute back** with improvements

---

## Glossary

| Term | Definition |
|------|-----------|
| **Skill** | Agent configuration file for specialized knowledge |
| **Global Skill** | Installed in ~/.claude/skills/, shared everywhere |
| **Project Skill** | In .agents/skills/, specific to this project |
| **AGENTS.md** | Source of truth for project conventions |
| **Reusable** | Copy to new projects as-is |
| **Adaptable** | Use as pattern, customize for your stack |
| **Project-Specific** | Unique to Zolai AI, delete for new projects |

---

## Support

### Can't find what you need?
1. Check WORKSPACE-REUSABILITY-MATRIX.md (detailed breakdown)
2. Check SETUP-NEW-PROJECT.md (step-by-step)
3. Check WORKSPACE-SETUP-CHECKLIST.md (verification)

### Something isn't working?
See "Troubleshooting" section in WORKSPACE-SETUP-CHECKLIST.md

### Want to improve this system?
See "Extension Points" in WORKSPACE-REUSABILITY-GUIDE.md

---

## Version Info

- **Created**: 2024
- **For**: Zolai (Zolai AI)
- **Framework**: Next.js 16 + Hono + Prisma
- **Reusable Version**: 1.0
- **Status**: Stable

This system is framework-agnostic and can be adapted for any project.

---

## Credits

System designed for cross-project reusability using:
- OpenCode agent framework
- Cursor IDE integration
- Best practices from industry standards
- Lessons learned from production use

---

## License

Reuse freely for any project. Customize as needed.
Share improvements back to benefit the community.


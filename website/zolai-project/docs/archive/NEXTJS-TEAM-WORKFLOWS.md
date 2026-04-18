# Next.js Starter Project - Team Workflows Guide

**Version:** 1.0.0  
**Created:** 2026-04-09  
**Purpose:** Establish roles, responsibilities, code review standards, and collaboration workflows

---

## Table of Contents

1. [Team Structure](#team-structure)
2. [Role Definitions](#role-definitions)
3. [Development Workflow](#development-workflow)
4. [Code Review Standards](#code-review-standards)
5. [Pull Request Template](#pull-request-template)
6. [Branching Strategy](#branching-strategy)
7. [Commit Message Standards](#commit-message-standards)
8. [Communication Protocols](#communication-protocols)
9. [Escalation Paths](#escalation-paths)
10. [Tools & Setup](#tools--setup)

---

## Team Structure

### Minimal Team (1-3 developers)

```
Project Lead (Product + Tech)
├── Full-Stack Developer 1
└── Full-Stack Developer 2 (optional)
```

**Decision:** Everyone reviews everyone's code  
**Daily Sync:** 15-min standup (9:00 AM)  
**Process:** Simplified code review (1 approval required)

---

### Growth Team (4-6 developers)

```
Product Manager
├── Engineering Lead (Tech decisions)
│   ├── Backend Engineer 1
│   ├── Backend Engineer 2
│   └── DevOps Engineer
└── Frontend Lead (UI/UX)
    ├── Frontend Engineer 1
    └── Frontend Engineer 2
```

**Decision:** Feature lead makes final call after team review  
**Daily Sync:** 15-min standup + separate frontend/backend syncs  
**Process:** Peer review + tech lead approval

---

### Enterprise Team (7+ developers)

```
VP Engineering
├── Backend Platform Lead
│   ├── Backend Engineers (4+)
│   └── DevOps Engineer
├── Frontend/UX Lead
│   ├── Frontend Engineers (3+)
│   └── UI/UX Designer
├── QA Lead
│   └── QA Engineers (2+)
└── Product Manager
    ├── Product Designers
    └── Product Analysts
```

**Decision:** Committees for architecture, individual leads for features  
**Daily Sync:** 15-min standup + department syncs + architecture reviews  
**Process:** Mandatory 2 approvals + QA sign-off before merge

---

## Role Definitions

### Backend Engineer

**Responsibilities:**
- Design and implement API endpoints following OpenAPI spec
- Manage database schema and migrations
- Implement business logic and validations
- Write tests (unit + integration)
- Monitor API performance and errors
- Respond to code review feedback within 24 hours

**Required Skills:**
- TypeScript, Node.js, Next.js Hono
- SQL & Prisma ORM
- REST API design
- Testing frameworks (Jest, Vitest)
- Git workflows

**Daily Tasks:**
- Review data requirements from frontend
- Implement features according to spec
- Write tests before merging code
- Monitor API metrics (response time, error rates)
- Help frontend with integration issues

**Weekly Tasks:**
- Performance review (database query times)
- Code quality check (test coverage)
- Security review (OWASP compliance)
- Documentation updates

---

### Frontend Engineer

**Responsibilities:**
- Implement UI components from Figma designs
- Consume API endpoints from backend
- Manage client-side state (TanStack Query)
- Implement responsive design
- Write component tests (React Testing Library)
- Ensure accessibility (WCAG 2.1 AA)

**Required Skills:**
- TypeScript, React, Next.js
- TailwindCSS, shadcn/ui
- TanStack Query (data fetching)
- Testing (React Testing Library, Playwright)
- Figma/Design tools

**Daily Tasks:**
- Implement UI components
- Connect components to APIs
- Test responsive design (mobile/tablet/desktop)
- Write unit tests for components
- Communicate with design on discrepancies

**Weekly Tasks:**
- Lighthouse performance audit
- Accessibility audit (axe DevTools)
- Browser compatibility check
- Component library maintenance

---

### DevOps / Infrastructure Engineer

**Responsibilities:**
- Set up and maintain infrastructure (VPS/AWS/Vercel)
- Configure CI/CD pipelines
- Manage databases and backups
- Monitor system performance and uptime
- Handle security and compliance
- Manage secrets and environment variables

**Required Skills:**
- Docker, Kubernetes (if applicable)
- Vercel/AWS/VPS administration
- CI/CD tools (GitHub Actions, etc.)
- Database administration
- Security best practices

**Daily Tasks:**
- Monitor deployments and logs
- Respond to alerts
- Fix failed CI/CD builds
- Manage infrastructure resources

**Weekly Tasks:**
- Review security logs
- Backup verification
- Performance optimization
- Dependency updates

---

### QA / Test Engineer

**Responsibilities:**
- Write and maintain E2E test suites
- Test features manually (edge cases)
- Report bugs and regressions
- Verify fixes before production
- Maintain test coverage metrics

**Required Skills:**
- Playwright, Cypress, or similar
- Manual testing best practices
- Bug reporting and documentation
- Understanding of web technologies

**Daily Tasks:**
- Run automated tests
- Manual testing of features
- Report bugs to developers
- Verify bug fixes

---

### Product Manager

**Responsibilities:**
- Define feature requirements and specs
- Prioritize features and fixes
- Communicate with stakeholders
- Review releases and plan updates
- Gather user feedback

**Required Skills:**
- Product strategy
- User research
- Technical literacy
- Stakeholder management

**Daily Tasks:**
- Communicate requirements to team
- Answer questions about features
- Prioritize bug reports

---

## Development Workflow

### Standard Feature Development (5-day cycle)

**Day 1: Planning**
- Product Manager defines requirements
- Engineering Lead creates technical spec (API design + DB schema)
- Backend + Frontend Engineers estimate effort
- Tickets created with clear acceptance criteria

**Days 2-3: Development**
- Backend: Implements API endpoints + tests
- Frontend: Implements UI components + tests
- Daily async sync on integration points

**Day 4: Code Review**
- Backend Engineer submits PR with test evidence
- Frontend Engineer submits PR with screenshots
- Peer reviews + tech lead approval
- CI/CD tests must pass

**Day 5: Testing + Merge**
- QA tests feature end-to-end
- Product Manager verifies requirements met
- Approved PRs merged to `develop`
- Feature ready for next release cycle

### Critical Bug Fix (1-2 day cycle)

**Day 1: Diagnosis**
- Developer reproduces bug
- Root cause identified
- Fix implemented with tests
- PR created with fix + regression test

**Day 2: Review & Deploy**
- Expedited code review (required 1 approval)
- Merged to `develop` and `main`
- Deployed to production
- Monitoring confirmed fix

---

## Code Review Standards

### Checklist for Reviewers

Before approving, verify:

#### Code Quality (10 points)
- [ ] No `any` types used
- [ ] All functions have JSDoc comments
- [ ] Variable/function names are clear
- [ ] Code follows project conventions
- [ ] Dead code removed

#### Testing (10 points)
- [ ] New code has tests (>80% coverage)
- [ ] Tests test the right thing (behavior, not implementation)
- [ ] Tests pass locally and in CI
- [ ] Edge cases covered

#### Performance (8 points)
- [ ] No N+1 database queries
- [ ] No unnecessary re-renders (React)
- [ ] API response time acceptable
- [ ] Bundle size impact minimal

#### Security (7 points)
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Authorization checks in place
- [ ] No SQL injection vulnerabilities

#### Documentation (5 points)
- [ ] API documentation updated
- [ ] README updated (if applicable)
- [ ] Complex logic explained
- [ ] Deployment notes included

**Total: 40 points**

### Review Turnaround Time

| Priority | Response Time | Resolution Time |
|----------|---------------|-----------------|
| Blocker | 1 hour | 4 hours |
| High | 4 hours | 1 day |
| Medium | 1 day | 2 days |
| Low | 2 days | 1 week |

### Approval Requirements

**Small fixes/docs:** 1 approval (any engineer)  
**Features:** 2 approvals (peer + tech lead)  
**Database schema:** 2 approvals + DevOps sign-off  
**Infrastructure:** DevOps + Tech Lead  
**Security:** Security specialist + Tech Lead  

---

## Pull Request Template

**File:** `.github/pull_request_template.md`

```markdown
## Description
Briefly describe what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change fixing issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Related Issue
Closes #123

## How Has This Been Tested?
Describe your testing approach:
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] E2E tests added
- [ ] Manual testing completed

## Testing Instructions
```bash
# Steps to reproduce / test
1. ...
2. ...
3. Verify ... works
```

## Database Changes
- [ ] No database changes
- [ ] Migration created: `migrate_name`
- [ ] Backwards compatible: Yes / No

## API Changes
- [ ] No API changes
- [ ] New endpoints: ...
- [ ] Changed endpoints: ...
- [ ] OpenAPI spec updated: Yes / No

## Performance Impact
- [ ] No performance impact
- [ ] Improvements: ...
- [ ] Potential regressions: ...

## Screenshots (if UI changes)
Attach before/after screenshots for UI changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests pass locally (`bun run test`)
- [ ] Build passes (`bun run build`)
- [ ] No new warnings generated
- [ ] Dependent changes merged/published

## Reviewer Notes
Any special notes for reviewers?
```

---

## Branching Strategy

### Branch Naming Convention

```
main               # Production releases only
develop            # Integration branch (stable, tested)
feature/*          # New features (from develop)
bugfix/*           # Bug fixes (from develop)
hotfix/*           # Critical production fixes (from main)
docs/*             # Documentation updates
refactor/*         # Code refactoring
perf/*             # Performance improvements
chore/*            # Dependencies, config changes
```

### Examples

```bash
feature/user-authentication
feature/blog-comments
bugfix/email-verification
hotfix/payment-processing
docs/api-specification
refactor/database-queries
perf/image-optimization
chore/update-dependencies
```

### Workflow

```bash
# Start new feature from develop
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Make changes, commit, push
git add .
git commit -m "feat: add user authentication"
git push origin feature/my-feature

# Create Pull Request on GitHub
# → Assign reviewer
# → Automated tests run
# → Code review
# → Approve & merge

# Verify deletion on GitHub
git checkout develop
git pull origin develop
```

---

## Commit Message Standards

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no logic change)
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Test changes
- `chore`: Dependencies, build, config
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(auth): implement 2FA with TOTP"

# Bug fix
git commit -m "fix(posts): prevent N+1 queries in list endpoint"

# Documentation
git commit -m "docs(api): update authentication section"

# Breaking change
git commit -m "feat(api)!: change POST /posts response structure

BREAKING CHANGE: /api/posts now returns { success, data } format"
```

### Commit Message Guidelines

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at end
- Limit subject to 50 characters
- Separate subject from body with blank line
- Wrap body at 72 characters
- Explain WHAT and WHY, not HOW

---

## Communication Protocols

### Daily Standup (15 minutes)

**When:** 9:00 AM (or team consensus)  
**Format:** Asynchronous (Slack) or synchronous (Zoom)

**Structure:**
1. **Yesterday:** What did I complete?
2. **Today:** What will I complete?
3. **Blockers:** Am I blocked on anything?

**Example:**
```
@backend-team:
Yesterday:
- Implemented user authentication API
- Added password reset flow
- 95% test coverage

Today:
- Implement organization management API
- Code review for @frontend-dev

Blockers:
None, but waiting on DB schema approval for teams feature
```

### Code Review Comments

**Be constructive and kind:**

❌ **Bad:**
```
This is wrong. You should use Prisma's select instead of include.
```

✅ **Good:**
```
I notice this uses `include` which might cause N+1 queries. 
Consider using `select` to fetch only needed fields. 
See example: docs/BEST-PRACTICES.md#n-plus-1
```

### Escalation Communication

**Minor disagreement:**
Discuss in PR comments, resolve as team  

**Significant disagreement:**
Schedule 30-min sync to discuss and decide  

**Architectural decision:**
Create RFC (Request for Comments) in GitHub issues

---

## Escalation Paths

### Priority: Bug Fix

```
Developer → Tech Lead → Manager (if time-sensitive)
Timeline: Resolve within 24 hours
```

### Priority: Feature Delay

```
Developer → Engineering Lead → Product Manager
Timeline: Discuss by end of day
```

### Priority: Security Issue

```
Developer → Tech Lead → CTO (if critical)
Timeline: Immediate review
```

### Priority: Infrastructure Down

```
DevOps → Engineering Lead → On-call engineer
Timeline: Immediate action
```

---

## Tools & Setup

### Required Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| Git | Version control | `brew install git` |
| Node.js 22+ | Runtime | `brew install node` |
| Bun | Package manager | `curl -fsSL https://bun.sh/install` |
| VS Code | Editor | Download from [code.visualstudio.com](https://code.visualstudio.com) |
| Figma | Design tool | Browser-based |

### VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-playwright.playwright",
    "wakatime.vscode-wakatime"
  ]
}
```

Install recommended extensions:
```
CMD + Shift + X → Search "Recommended"
```

### Git Configuration

```bash
# Set name and email
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Enable auto-crlf for cross-platform compatibility
git config --global core.autocrlf input

# Set default branch name
git config --global init.defaultBranch main

# Enable fast-forward merges only
git config --global pull.ff only
```

### GitHub Setup

1. **Create account:** https://github.com/signup
2. **Add SSH key:**
   ```bash
   ssh-keygen -t ed25519 -C "your@email.com"
   cat ~/.ssh/id_ed25519.pub  # Copy to GitHub Settings → SSH Keys
   ```
3. **Clone repository:**
   ```bash
   git clone git@github.com:your-org/starter-nextjs.git
   ```

### Local Development Setup

```bash
# Clone repository
git clone git@github.com:your-org/starter-nextjs.git
cd starter-nextjs

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env.local

# Start development server
bun run dev

# Open in browser
open http://localhost:3000
```

---

## Weekly Rituals

### Monday (Planning)
- 10:00 AM: Team sync - Sprint planning
- Assign features for the week
- Discuss blockers from previous week

### Tuesday-Thursday (Execution)
- 9:00 AM: Daily standup
- Focus on development
- Code reviews and feedback

### Friday (Review)
- 9:00 AM: Daily standup
- 2:00 PM: Sprint review
  - Demo features completed
  - Review metrics (test coverage, performance)
  - Discuss improvements
- 3:00 PM: Retrospective
  - What went well?
  - What could be better?
  - Action items for next sprint

---

## Metrics to Track

### Code Quality
- [ ] Test coverage: Target >80%
- [ ] Build time: Target <3 minutes
- [ ] Linting errors: Target 0
- [ ] Type errors: Target 0

### Performance
- [ ] Lighthouse score: Target >90
- [ ] API response time: Target <200ms p95
- [ ] Page load time: Target <2s
- [ ] Database query time: Target <100ms

### Team Velocity
- [ ] Features completed per sprint
- [ ] Bug fix turnaround time
- [ ] Code review turnaround time
- [ ] Deployment frequency

### Production Health
- [ ] Uptime: Target 99.9%
- [ ] Error rate: Target <0.1%
- [ ] Critical bug response time: Target <1 hour
- [ ] Monthly active users

---

## Summary

This guide establishes:
- ✅ Clear role definitions and responsibilities
- ✅ Standardized code review process
- ✅ Branching and commit standards
- ✅ Communication protocols
- ✅ Tools and setup instructions
- ✅ Weekly rituals and metrics

**Use this as your team's playbook for consistent, high-quality delivery.**

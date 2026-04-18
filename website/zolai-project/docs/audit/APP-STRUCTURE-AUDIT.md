# App Structure Audit — 2026-04-14

Rule: `app/*` is thin — all domain logic lives in `features/*`

---

## 🔴 Critical: Full UI/Logic in app/page.tsx (no feature component)

These pages contain 100–474 lines of UI + state + business logic directly in `app/`. They need to be extracted into `features/`.

| Page | Lines | Issue |
|---|---|---|
| `app/(public)/posts/[slug]/page.tsx` | 474 | Direct Prisma queries + full render logic |
| `app/(public)/news/[slug]/page.tsx` | 467 | Same as above |
| `app/(protected)/chat/page.tsx` | 390 | Full chat UI + session management + raw `fetch()` calls |
| `app/(protected)/tutor/page.tsx` | 335 | Full tutor UI + state — no `features/zolai/` component |
| `app/(public)/pages/[slug]/page.tsx` | 265 | Direct Prisma + full render |
| `app/(protected)/settings/change-password/page.tsx` | 214 | Full form logic inline |
| `app/(protected)/dashboard/notifications/page.tsx` | 206 | Full UI inline |
| `app/(protected)/tutor-new/page.tsx` | 203 | Duplicate tutor — should be removed or merged |
| `app/(protected)/security/settings/page.tsx` | 197 | Full form logic inline |
| `app/(protected)/dashboard/page.tsx` | 170 | Direct Prisma queries inline |
| `app/(protected)/admin/system/page.tsx` | 169 | Direct Prisma queries inline |
| `app/(protected)/forum/page.tsx` | 142 | Full forum UI inline |
| `app/(protected)/submit/page.tsx` | 132 | Full submission form inline |
| `app/(protected)/translate/page.tsx` | 131 | Full translation UI inline |
| `app/(protected)/audio/page.tsx` | 109 | Full audio UI inline |
| `app/(protected)/admin/bible/page.tsx` | 116 | Direct Prisma queries inline |

**Fix pattern:** Extract to `features/<feature>/components/<FeaturePage>.tsx`, page becomes:
```tsx
import { ChatPage } from "@/features/zolai/components/chat-page";
export default function Page() { return <ChatPage />; }
```

---

## 🔴 Critical: API Logic in `app/api/[[...route]]/` (not in features)

These files contain full Hono router logic directly in `app/`. They should live in `features/<feature>/api/index.ts` and be imported by `route.ts`.

| File | Lines | Should move to |
|---|---|---|
| `security.ts` | 492 | `features/security/api/index.ts` |
| `newsletter.ts` | 446 | `features/newsletter/api/index.ts` |
| `notifications.ts` | 438 | `features/notifications/api/index.ts` (feature has no api/) |
| `forms.ts` | 394 | `features/form/api/index.ts` |
| `templates.ts` | 301 | `features/templates/api/index.ts` |
| `role-management.ts` | 270 | `features/admin/api/index.ts` or `features/users/api/` |
| `landing.ts` | 263 | `features/home/api/index.ts` (merge) |
| `upload.ts` | 249 | `features/media/api/` (merge) |
| `revisions.ts` | 200 | `features/content/api/` (merge) |
| `seo.ts` | 191 | `features/content/api/` (merge) |
| `organizations.ts` | 162 | `features/organization/api/index.ts` (api/ is empty) |
| `preferences.ts` | 75 | `features/settings/api/` (merge) |
| `profile.ts` | 58 | `features/users/api/` |
| `cookie-consent.ts` | 59 | `features/security/api/` (merge) |
| `check-role.ts` | 16 | `features/auth/api/` |
| `check-verification.ts` | 31 | `features/auth/api/` |

**Empty feature api/ folders that need populating:**
- `features/security/api/` — empty, but `security.ts` has 492 lines
- `features/newsletter/api/` — empty, but `newsletter.ts` has 446 lines
- `features/organization/api/` — empty, but `organizations.ts` has 162 lines

---

## 🟡 Missing Feature Folders

These `app/` pages have no corresponding `features/` folder at all:

| App route | Should create |
|---|---|
| `app/(protected)/chat/` | `features/zolai/components/chat-page.tsx` (under existing `features/zolai/`) |
| `app/(protected)/tutor/` | `features/zolai/components/tutor-page.tsx` |
| `app/(protected)/translate/` | `features/translation-tools/components/translate-page.tsx` |
| `app/(protected)/submit/` | `features/content-submission/components/submit-page.tsx` |

---

## 🟡 Duplicate / Dead Code

| File | Issue |
|---|---|
| `app/(protected)/tutor-new/page.tsx` | 203-line duplicate of tutor — remove or replace `tutor/page.tsx` |
| `app/(protected)/dashboard/structure/page.tsx` | 160 lines — unclear purpose, likely dev artifact |

---

## ✅ Correctly Structured (thin pages)

These pages properly delegate to feature components:

- `app/(protected)/admin/users/page.tsx` (4 lines)
- `app/(protected)/admin/media/page.tsx` (3 lines)
- `app/(protected)/admin/notifications/page.tsx` (3 lines)
- `app/(protected)/admin/vocab/page.tsx` (2 lines)
- `app/(protected)/admin/site-settings/page.tsx` (5 lines)
- Most admin sub-pages (5 lines each)

---

## Priority Order

1. **chat/page.tsx** — has raw `fetch()` calls (compliance violation) + 390 lines
2. **API files in app/** — security, newsletter, notifications (492/446/438 lines)
3. **tutor/page.tsx** — 335 lines, no feature component
4. **posts/[slug] + news/[slug]** — 474/467 lines with direct Prisma
5. **dashboard/page.tsx** — direct Prisma queries
6. **forum, translate, submit** — full UI inline

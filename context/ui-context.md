# UI Context (Web — website/zolai-project/)

> Applies to the Next.js learner platform. The site owns its own rules in
> `website/zolai-project/AGENTS.md`; this file summarizes the shared conventions.

## Tech

- Next.js (App Router) + Turbopack; Hono for API routes; Prisma for data.
- TypeScript strict mode; shadcn/ui component system (`components.json`).
- Tailwind CSS via PostCSS; CSS-token theme (no hardcoded hex).

## Component System

- shadcn/ui-style components in `components/` (button, card, dialog, table, etc.).
- Feature-specific components under `features/` (e.g. `chat/ChatPanel.tsx`,
  `dashboard/components/analytics-dashboard.tsx`, `MindMap3D.tsx`).
- Follow `website/zolai-project/components.json` for shadcn aliasing.

## Layout & Routes

- Server components by default; `"use client"` only for browser interactivity.
- Protected routes under `app/(protected)/`: dashboard/analytics, chat, contribute,
  mind, admin/contributions, admin/n8n.
- Route handlers focus on one responsibility; chained Hono methods only.

## Rules (from website/zolai-project/AGENTS.md)

- No raw `fetch("/api/...")` in client code.
- No loose `new Hono()` calls (must chain).
- No local `hc<AppType>` (use `@/lib/api/client`).
- Run the four compliance checks after every edit; all must return zero output.

## Styling

- Use CSS tokens / shadcn theme; avoid hardcoded hex values.
- Responsive across mobile/tablet/desktop.

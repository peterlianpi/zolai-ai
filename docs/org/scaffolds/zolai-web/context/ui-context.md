# Zolai Web — UI Context

- shadcn/ui component system (`components.json`); Tailwind; CSS tokens (no hex).
- Server components by default; `"use client"` only for interactivity.
- Protected routes: dashboard/analytics, chat, contribute, mind, admin/*
- Code compliance (from original AGENTS.md): no raw fetch("/api/...") in client,
  no loose Hono calls, no local hc<AppType>.

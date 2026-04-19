# Website

Next.js web application for the Zolai platform.

See `zolai-project/README.md` for full setup and development guide.

## Quick Start

```bash
cd website/zolai-project
bun install
cp .env.example .env   # fill in your keys
bunx prisma migrate dev
bun dev
```

## Stack

- Next.js 15 (App Router)
- Hono RPC
- Prisma + PostgreSQL (Neon)
- Better Auth
- Tailwind + shadcn/ui
- Bun

# Zolai Web — Architecture

- Next.js App Router + Turbopack; Hono chained handlers; Prisma ORM.
- FTS5 SQLite (dev) / Neon Postgres (prod) for dictionary + curriculum.
- Service-to-service: calls Zolai Core REST API for translation/chat/RAG.
- Deployment: Vercel.

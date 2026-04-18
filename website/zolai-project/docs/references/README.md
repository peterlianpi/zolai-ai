# Framework & Library References

Local documentation for all frameworks, libraries, and tools used in this project. All versions are current as of the project's `package.json`.

## Core Stack

| Reference | Version | Purpose |
|-----------|---------|---------|
| [Next.js 16](nextjs.md) | 16.2.2 | Full-stack React framework with App Router, Turbopack, proxy.ts |
| [React 19](react.md) | 19.2.3 | UI library with Server Components, Actions, useEffectEvent |
| [TypeScript](https://www.typescriptlang.org/docs/) | 5.9.3 | Type-safe JavaScript |

## Database & ORM

| Reference | Version | Purpose |
|-----------|---------|---------|
| [Prisma 7](prisma.md) | 7.6.0 | Type-safe database client with generated types |
| PostgreSQL | - | Relational database |

## Authentication

| Reference | Version | Purpose |
|-----------|---------|---------|
| [Better Auth](better-auth.md) | 1.5.6 | Auth with admin plugin, emailOTP, session management |

## API & Validation

| Reference | Version | Purpose |
|-----------|---------|---------|
| [Hono](hono.md) | 4.12.10 | Lightweight API framework with Zod validator |
| [Zod 4](zod.md) | 4.3.6 | Schema validation for all inputs |

## Frontend

| Reference | Version | Purpose |
|-----------|---------|---------|
| [Tailwind CSS 4](tailwind.md) | 4.2.2 | Utility-first CSS with @theme config |
| [shadcn/ui](shadcn.md) | 4.1.2 | Accessible UI components (58 components in project) |
| [TanStack Query](tanstack-query.md) | 5.96.1 | Server state management |
| [TanStack Table](https://tanstack.com/table/latest) | 8.21.3 | Headless table library |
| [React Hook Form](react-hook-form.md) | 7.72.0 | Form management with Zod integration |

## Utilities

| Reference | Version | Purpose |
|-----------|---------|---------|
| [AWS S3/R2 Upload](s3-r2-upload.md) | 3.1023.0 | File storage with S3 and Cloudflare R2 |
| [Recharts](https://recharts.org/) | 2.15.4 | Data visualization |
| [Resend](https://resend.com/docs) | 6.10.0 | Email delivery |
| [Nodemailer](https://nodemailer.com/) | 8.0.0 | Email sending |
| [Lucide React](https://lucide.dev/) | 0.563.0 | Icon library |
| [date-fns](https://date-fns.org/) | 4.1.0 | Date utilities |
| [react-day-picker](https://daypicker.dev/) | 9.14.0 | Calendar component |
| [Embla Carousel](https://www.embla-carousel.com/) | 8.6.0 | Carousel/slider |
| [Sonner](https://sonner.emilkowal.ski/) | 2.0.7 | Toast notifications |
| [sanitize-html](https://github.com/apostrophecms/sanitize-html) | 2.17.2 | HTML sanitization (XSS prevention) |
| [cmdk](https://cmdk.paco.me/) | 1.1.1 | Command palette |
| [vaul](https://vaul.emilkowal.ski/) | 1.1.2 | Drawer component |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4.6 | Theme switching |
| [class-variance-authority](https://cva.style/) | 0.7.1 | Component variants |
| [clsx](https://github.com/lukeed/clsx) | 2.1.1 | Conditional className |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | 3.5.0 | Merge Tailwind classes |

## Dev Tools

| Reference | Version | Purpose |
|-----------|---------|---------|
| [ESLint](https://eslint.org/docs/latest/) | 9.39.4 | Code linting |
| [Playwright](https://playwright.dev/) | 1.59.1 | E2E testing |
| [tsx](https://github.com/privatenumber/tsx) | 4.21.0 | TypeScript execution |

## Architecture

| Reference | Description |
|-----------|-------------|
| [Architecture & Design System](architecture.md) | Project patterns, design tokens, best practices |

## Quick Commands

```bash
bun run dev                    # Start dev server (Turbopack)
bun run build                  # Production build
bun run start                  # Start production server
bun run lint                   # Lint with ESLint
bunx prisma migrate dev --name <name>  # Create + apply migration
bunx prisma generate           # Regenerate Prisma client
bunx prisma db seed            # Run seed script
bunx shadcn@latest add <component>     # Add shadcn component
```

## Key Patterns

1. **Server Components by default** — `"use client"` only when needed
2. **Feature-based organization** — `features/<feature>/` structure
3. **Hono catch-all API** — `app/api/[[...route]]/route.ts`
4. **Zod validation** — on all API inputs and forms
5. **TanStack Query** — for client-side server state
6. **Prisma singleton** — use `lib/prisma.ts`, never instantiate directly
7. **Better Auth** — for authentication, don't roll your own
8. **shadcn/ui** — accessible components, don't modify `components/ui/`
9. **Tailwind @theme** — design tokens in CSS, not config file
10. **Consistent responses** — `{ success: boolean, data?, error? }`

# Zolai AI Feature Development Workflow

This document outlines the standard workflow for adding new features to the Zolai AI project. Adhering to these steps ensures consistency, type safety, and optimal performance.

## 1. Schema & Database
- Update `prisma/schema.prisma` with new models or fields.
- Run `bun run db:push` for local development.
- For production-bound changes, use `bunx prisma migrate dev --name <description>`.
- Update `prisma/seed.ts` if default data is required.

## 2. API Layer (Hono RPC)
- Create or update the Hono router in `app/api/[[...route]]/<feature>.ts`.
- Ensure it is chained in `app/api/[[...route]]/route.ts` using `.route("/<feature>", featureRouter)`.
- Use **Standardized Response Helpers** from `@/lib/api/response.ts`:
  - `ok(c, data)`: HTTP 200
  - `created(c, data)`: HTTP 201
  - `list(c, data, meta)`: HTTP 200 for paginated lists
  - `error(c, message, code, status)`: Generic error
  - `notFound(c, message)`: HTTP 404
- Mandatory `zValidator` for all input (json, query, param).

## 3. Server Action Layer
- For data-modifying operations (POST, PATCH, DELETE), prefer **Server Actions** over raw API calls in the UI.
- Place feature-specific actions in `features/<feature>/actions.ts`.
- Use `revalidatePath` to ensure stale data is updated.
- Use `useTransition` in the component to manage pending states.

## 4. Client Hooks (React Query)
- Wrap typed Hono client calls in React Query hooks within `features/<feature>/hooks/`.
- Use the typed client from `@/lib/api/hono-client.ts`: `const { client } = useHonoClient();`.
- Standardize query keys in `features/<feature>/keys.ts`.

## 5. UI Components
- **RSC First**: Fetch initial page data in Server Components via Direct Prisma calls or Server Actions.
- Use `"use client"` only for components requiring hooks (React Query, form state, interactivity).
- Follow the feature-sliced architecture: all domain-specific logic resides in `features/<feature>/`.

## 6. Typing & Interfaces
- **Base Types**: Always import `*Model` types from `@/lib/generated/prisma/models`.
- **Extensions**: Use `&` or `Pick/Omit` to create UI-specific types.
- **Global Types**: Place shared cross-domain interfaces in `lib/types/`.

## 7. Audit & Validation
- Run `bun run lint` to ensure no linting regressions.
- Run `bun run build` to verify production readiness and type safety.
- Test critical paths using Playwright.

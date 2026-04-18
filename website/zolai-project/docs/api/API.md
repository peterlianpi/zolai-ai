# Zolai API Reference

All routes mount via `app/api/[[...route]]/route.ts` using Hono RPC chain.

---

## Dictionary (`/api/dictionary`)

| Method | Endpoint | Query | Description |
|---|---|---|---|
| GET | `/api/dictionary/search` | `?q=<term>&lang=zolai\|english` | Full-text search |
| GET | `/api/dictionary/random` | `?pos=verb\|noun\|...` | Random word by part of speech |
| GET | `/api/dictionary/stats` | — | Total entry count, coverage stats |
| GET | `/api/dictionary/:id` | — | Single word detail |

---

## Zolai AI (`/api/zolai`)

### Chat / Tutor
| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/zolai/chat` | `{ messages, level?, mode?, tutor? }` | Proxy to fine-tuned LLM at `ZOLAI_API_URL` |

### Content
| Method | Endpoint | Query | Description |
|---|---|---|---|
| GET | `/api/zolai/wiki` | — | List all wiki entries |
| GET | `/api/zolai/wiki/:slug` | — | Single wiki entry |
| GET | `/api/zolai/bible/:book` | `?chapter=1` | Bible verses by book/chapter |
| GET | `/api/zolai/vocab` | `?q=<term>&category=verb` | Vocabulary lookup |
| GET | `/api/zolai/grammar` | `?sub=phonology` | Grammar rules by sub-topic |

### Training Dashboard
| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/api/zolai/training` | — | List training runs |
| POST | `/api/zolai/training` | `{ ... }` | Create training run (admin) |
| PATCH | `/api/zolai/training/:id` | `{ ... }` | Update run via webhook |
| GET | `/api/zolai/stats` | — | Dataset stats |

---

## Grammar (`/api/grammar`)

Feature: `features/grammar/api/`

---

## Translation (`/api/translation`)

Feature: `features/translation-tools/api/`

---

## Auth (`/api/auth`)

Handled by Better Auth. See `docs/auth/` for full reference.

Key endpoints:
- `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-out`
- `GET  /api/auth/session`
- `POST /api/auth/send-verification-email`
- `POST /api/auth/verify-email`

---

## Response Format

All API responses follow:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "NOT_FOUND", "message": "..." } }
```

Helpers: `lib/api/response.ts` — `ok`, `error`, `notFound`, `internalError`

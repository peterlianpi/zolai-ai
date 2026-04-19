# Zolai AI — Gemini CLI Project Context

You are working on the Zolai AI platform — a language preservation and learning platform for the Tedim Zolai language spoken by the Zomi people of Myanmar/India.

## Language Rules (STRICT — never violate)

**Dialect:** Tedim ZVS only
- USE: pasian, gam, tapa, topa, kumpipa, tua
- NEVER: pathian, ram, fapa, bawipa, siangpahrang, cu/cun
- Word order: SOV (Subject-Object-Verb)
- Negation: `kei` for conditionals, `lo` for simple negative
- `o` = /oʊ/ always. No `ti` clusters. No `c` + {a,e,o,aw}
- Plural: never combine `uh` with `i` (we)

## Project Stack

- Next.js 15, Hono RPC, Prisma + PostgreSQL (Neon), Better Auth, Bun, TypeScript strict
- API responses: `{ success: boolean, data?: T, error?: { message, code } }`
- All helpers: `ok(c,data)`, `created(c,data)`, `notFound(c)`, `conflict(c)`, `internalError(c)`
- Auth guards: `requireAdmin(c)`, `requireAuth(c)`, `requirePermission(c, PERMISSIONS.X)` from `lib/auth/server-guards`
- Prisma: always `select`, never `include`. Import from `@/lib/generated/prisma`
- No raw `fetch('/api/...')` — use `client` from `@/lib/api/client`

## Key Data Files

- `data/processed/master_dictionary_semantic.jsonl` — 24,891 ZO↔EN entries
- `data/processed/parallel.jsonl` — 68,817 Bible + conversational pairs
- `data/generated/zolai-synthetic.jsonl` — AI-generated training data
- `.kiro/resources/zolai-sinna.md` — Official Zolai literacy primer (orthography, grammar, proverbs)

## Training Data Format

JSONL, one JSON object per line:
```json
{"task": "translation_en_to_zo", "english": "...", "zolai": "..."}
{"task": "conversation", "context": "...", "turns": [...]}
{"task": "grammar_qa", "question": "...", "answer": "..."}
```

## When generating Zolai content

1. Always verify dialect rules above
2. Use vocabulary from the dictionary when possible
3. Match CEFR level if specified (A1=basic, C2=literary/poetic)
4. SOV word order in every sentence
5. Flag any uncertain forms rather than guessing

# Zolai AI — Integration & Development Standards

## 1. Native TypeScript Logic (Next.js/Hono)
- **Database Driver:** Use `better-sqlite3` for high-speed, synchronous access to the `zvs_master_dictionary.db`.
- **Linguistic Rules:** Enforce ZVS 2018 standards (pronoun grids, joined compounds, culinary context) natively via `lib/zolai/translate.ts`.
- **Culinary Context (Meaning Matrix):**
    - `lim` (tasty), `thak` (spicy), `kan/kang` (fry/fried), `sathau` (oil/fat).
    - Use `hel` for mixing base ingredients, `khah` for seasoning.
- **Inclusive/Exclusive Pronouns:** 
    - `i` + [verb] + `hi` (We inclusive/general).
    - `Kei leh [Group] in ka [verb] uh hi` (We exclusive).
    - `Amau in a [verb] uh hi` (They).

## 2. Biblical Alignment Patterns
- **Narrative Structure:** [Time/Place] + [Subject] + [Verb] + [Aspect/Marker].
- **Authority:** Always use `in` (Ergative) for active subjects/authoritative commands.
- **Conditionals:** `leng` (formal/literary, single condition), `le'ng` (idiomatic "if we"). For **negative conditionals**, always use `kei a leh` — NEVER `kei a leh`.

## 3. Deployment Flow (VPS)
1. **DB Path:** Always target `/data/dictionary/db/zvs_master_dictionary.db`.
2. **Build:** Use `bun` for builds (`bun run build`).
3. **Integration:** Direct SQLite native calls within API routes.

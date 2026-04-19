# Biblical Context Disambiguation Report

This document audits the usage of select Zolai words across the Bible corpus (Tedim 2010), defining semantic rules for disambiguation in AI-driven generation.

## 1. thak
- **Sense 1: New** - `leeng thak khat tungah` (on a new cart)
- **Sense 2: Tidings/News** - `hih thuthak a ko dingin` (to carry these tidings/news)
- **Semantic Rule:** Use as an adjective for 'new' (`x thak`). Use as part of a compound noun for 'news/tidings' (`thuthak`).

## 2. lim
- **Sense 1: Image/Idol/Shadow** - `milim` (idol), `nilim` (shadow)
- **Sense 2: Pattern/Model** - `innlim` (model of the house)
- **Semantic Rule:** If denoting a physical or metaphorical representation (often religious or light-related), treat as `lim`. If denoting a design or blueprint, it is part of a compound `x-lim`.

## 3. tui
- **Sense 1: Water** - ` Bethlehem tuikhuk` (Bethlehem well/water-hole)
- **Sense 2: Liquid/Juice/Scented (Compound component)** - `paknamtui` (incense/perfume), `leenggahzu` (implied liquid; often compounded).
- **Semantic Rule:** Represents literal water when used as a noun. Compounded when denoting processed liquids (oils, spirits, perfumes).

## 4. sathau
- **Sense 1: Oil/Fat** - `sathau a nilh uh hi` (they anointed him with oil)
- **Semantic Rule:** Denotes animal fat or vegetable oil. Used as a standalone noun.

## 5. ci
- **Sense 1: Salt (implied by homonymy/frequent context)** - Note: in the corpus sample, `ci` often functions as a verb root or particle (e.g., `ci-in` - saying).
- **Sense 2: Particle/Verb Root (Say/Said)** - `a ci hi` (he said)
- **Semantic Rule:** `ci` (the verb "to say") is extremely high frequency. Contextual parsing must distinguish it from the noun `ci` (salt). The verb `ci` is almost always followed by `-in` or at the end of a clause.

## 6. hong
- **Sense 1: Directional (Towards speaker)** - `hong pai` (came here / towards speaker)
- **Sense 2: Origin/Coming into existence** - `hong pian'na` (origin/birth of)
- **Semantic Rule:** A crucial directional particle. Always indicates movement towards the speaker's perspective or origin of an event.

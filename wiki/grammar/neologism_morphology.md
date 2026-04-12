# Neologism Morphology: Forming New Words

## Concept / Rule
Zolai is highly agglutinative, heavily relying on suffixes and compounding to form new nouns, verbs, and abstract concepts out of simpler roots. The language adapts to modern concepts by building "descriptive" neologisms (new words) using specific structural patterns.

### Core Morphological Rules
1. **The `na` Suffix (Instrumental/Locative Noun Formation):**
   - **Rule:** `Verb (Stem II) + na = Noun`
   - **Function:** This turns an action into a tool (the thing used to do it), a place (where it is done), or an abstract noun (the concept of doing it).
   - **Examples:** 
     - `Sim` (to read) → `Simna` (a reading place/tool/reading itself)
     - `Khawl` (to rest) → `Khawlna` (a resting place/holiday)
     - `Zang` (to use, Stem II: zat) → `Zatna` (usage/application)
2. **The `thu` Suffix/Prefix (Abstract Concepts/Information):**
   - **Rule:** `Thu + [Noun/Verb]` or `[Noun/Verb] + thu`
   - **Function:** Denotes the abstract information, story, or "matter" concerning a subject.
   - **Examples:**
     - `Kham` (Gold) + `thu` = `Khamthu` (Financial/Wealth matters)
     - `Pasian` (God) + `thu` = `Pasian thu` (Theology/Religion)
     - `Pilna` (Wisdom) + `thu` = `Pilna thu` (Science/Philosophy)
3. **The `Set` Modifier (Machines/Technology):**
   - **Rule:** `[Action/Object] + Set`
   - **Function:** Denotes a mechanical or automated version of a task.
   - **Examples:**
     - `Tui` (Water) + `Lup` (Pump) + `Set` = `Tui-lup-set` (Water pump machine)
     - `Sik` (Iron) + `Set` = `Sik-set` (Heavy machinery/Robot)
4. **The `Siangtho` Modifier (Holy/Sanctified/Pure):**
   - **Rule:** `[Noun] + Siangtho`
   - **Function:** Elevates a common noun to a sacred or formal theological register.
   - **Examples:**
     - `Lai` (Book/Letter) + `Siangtho` = `Laisiangtho` (The Bible)
     - `Kha` (Spirit/Breath) + `Siangtho` = `Kha Siangtho` (The Holy Spirit)

## Decision / Application
The parser must be capable of deconstructing compound words to understand their root meanings. The AI Tutor must explain new or complex vocabulary (like `Pilna thu`) by breaking it down into its constituent morphological parts (`Pilna` [Wisdom] + `thu` [matter]) for the learner.

## Reason
This morphological structure is the engine of the Zolai language. By understanding and applying these rules, the AI can consistently generate accurate translations for English concepts that have no direct single-word equivalent in Zolai, ensuring the language remains vibrant and modern.

## Pattern / Code Snippet
When encountering a novel English noun like "Calculator," the AI should apply the rules:
- Verb: Calculate (`Tuat`)
- Suffix: Tool (`na`)
- Modifier: Machine (`Set`)
- Result: `Tuatna Set` (Calculating machine).

## Mistake / Anti-pattern
Do not combine incompatible roots, and do not forget that the `na` suffix requires the verb to be in **Stem II**. For example, the tool for writing (`gelh`) is `Gelhna`, not `Gelh na`. The tool for seeing (`mu`) is `Muhna` (Stem II: muh), not `Muna`.
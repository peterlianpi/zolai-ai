# Zolai AI — Master Generation Prompts for Google Gemini
> Paste these directly into Gemini (with Zolai Ai notebook loaded).
> Each prompt generates structured output ready to copy/export.

---

## PROMPT 1 — Generate Full Dictionary Entry for One Word

```
Na Zolai thumal kisinna laibu panin, hih thumal ading complete dictionary entry khat bawl in:

Thumal: [WORD]

Format (JSON):
{
  "zolai": "[word]",
  "english": "[primary meaning]",
  "translations": ["meaning1", "meaning2", "meaning3"],
  "pos": "[noun/verb/adj/adv/particle]",
  "synonyms": ["zolai_synonym1", "zolai_synonym2"],
  "antonyms": ["zolai_antonym1"],
  "related": ["related_word1", "related_word2", "related_word3"],
  "examples": [
    {"zo": "[short zolai sentence 5-10 words]", "en": "[english translation]"},
    {"zo": "[another example]", "en": "[translation]"}
  ],
  "usage_notes": "[when and how to use this word]",
  "cefr": "[A1/A2/B1/B2/C1/C2]",
  "multi_meaning": [
    {"context": "[context1]", "meaning": "[meaning in this context]", "example": "[zo sentence]"},
    {"context": "[context2]", "meaning": "[meaning in this context]", "example": "[zo sentence]"}
  ]
}
```

---

## PROMPT 2 — Generate 20 Words by Topic (Table Format)

```
Zolai thumal kisinna laibu panin, "[TOPIC]" tawh kisai Zolai thumal 20 gen in.

Table format:
| Zolai | English | POS | Example (ZO) | Example (EN) | Synonyms | CEFR |
|-------|---------|-----|--------------|--------------|----------|------|

Topics to use:
- innkuan (family)
- an leh dawn (food and drink)  
- leitung leh van (nature)
- pumpi (body parts)
- hun leh ni (time and days)
- lung thupha (emotions)
- nasep (work)
- sanginn (school/education)
- biakinn (church/religion)
- gam leh khua (country and village)
```

---

## PROMPT 3 — Generate Multi-Meaning Words (Disambiguation)

```
Zolai thumal kisinna laibu panin, hih thumal te' deihna tuamtuam gen in.
Thumal khat in context dang-dangin deihna dang nei thei hi.

Thumalte: [WORD1], [WORD2], [WORD3]

Khat khat ading:
1. Primary meaning
2. Secondary meanings (with context)
3. Example sentence for EACH meaning
4. How to tell which meaning is intended

Example format:
**dam**
- Context 1 (health): "Ka dam hi" = I am well/healthy
- Context 2 (hand/palm): "A dam ah a zang hi" = He held it in his palm  
- Context 3 (healed): "A dam ta hi" = He is healed/recovered
```

---

## PROMPT 4 — Generate 50 Words Missing Examples

```
Zolai thumal kisinna laibu panin, hih thumalte ading example sentence khat khat bawl in.
Sentence 5-10 thumal om ding. ZVS standard zang in.

Format:
| Zolai | English | Example (ZO) | Example (EN) |
|-------|---------|--------------|--------------|

Thumalte:
[paste list of words without examples from dict_master_export.csv]
```

---

## PROMPT 5 — Generate Antonym Pairs

```
Zolai thumal kisinna laibu panin, hih thumalte ading antonym (opposite) gen in.

Format:
| Word | Meaning | Antonym | Antonym Meaning | Example pair |
|------|---------|---------|-----------------|--------------|

Thumalte: hoih, khuavak, tung, pai, nungta, dam, lian, nuam, om, tapa
```

---

## PROMPT 6 — Generate Synonym Groups

```
Zolai thumal kisinna laibu panin, hih English meaning te ading Zolai synonym group gen in.

Format:
**[English meaning]**
- [zolai_word1] — [nuance/register]
- [zolai_word2] — [nuance/register]  
- [zolai_word3] — [nuance/register]

Meanings: say/speak, go, see, good, love, know, give, come, big, small
```

---

## PROMPT 7 — Generate CEFR Word Lists

```
Zolai thumal kisinna laibu panin, CEFR level [A1/A2/B1] ading thumal list gen in.

A1 = Most essential words every beginner must know
A2 = Elementary — common everyday words
B1 = Intermediate — less frequent but important

Format:
## [LEVEL] — [TOPIC]
| # | Zolai | English | Example |
|---|-------|---------|---------|

Topics: greetings, numbers 1-100, family, food, body, time, verbs, adjectives
```

---

## PROMPT 8 — Bulk Translation + Validation

```
Hih English sentence 20 te Zolai ah let in. ZVS standard zang in.
Tua khit ciangin ZVS check zong bawl in (pathian→pasian, sanggin→sanginn, lo in conditionals).

Sentences:
1. I am going to school tomorrow.
2. She is not well today.
3. If you don't come, I will go alone.
4. God created heaven and earth.
5. My daughter went to school.
6. Do not steal others' things.
7. Rejoice always.
8. He did not go to church.
9. I am well again.
10. What is your name?
[add more...]

Format:
| # | English | Zolai (ZVS) | Notes |
|---|---------|-------------|-------|
```

---

## PROMPT 9 — Generate Training Instruction Pairs

```
Zolai thumal kisinna laibu panin, fine-tuning ading instruction pairs 20 gen in.
Topic: [TOPIC]

Format (JSONL):
{"instruction": "Zolai panin English ah let in: [zo sentence]", "output": "[en translation]"}
{"instruction": "English panin Zolai ah let in: [en sentence]", "output": "[zo translation]"}
{"instruction": "[zo word] cih thumal bang hiam?", "output": "[definition in zolai]"}

Topics: daily life, greetings, family, church, nature, emotions, commands, questions
```

---

## PROMPT 10 — Generate Google Sheets Formula Pack

```
Ka Zolai dictionary CSV (64,921 rows, columns: zolai, english, pos, cefr, translations, 
synonyms, antonyms, related, example_zo, example_en, usage_notes, sources, book_count, first_book)
Google Sheets ah import khin hi.

Hih thute ading formula gen in:
1. Show only A1 words
2. Show words with examples
3. Count words by CEFR level
4. Search for a word
5. Show all synonyms for a word
6. Filter by POS (noun only)
7. Show words from Genesis (first_book=GEN)
8. Sort by book_count (most attested first)
9. Find words missing antonyms
10. Export filtered results
```

---

## QUICK COPY — Most Useful Single Prompt

```
Na Zolai thumal kisinna laibu panin:

Thumal "[WORD]" ading:
- Deihna tampi (multi-meanings with context)
- Example sentence 3 (short, natural Zolai)
- Synonym 3
- Antonym 2  
- Related words 3
- CEFR level
- Usage note

ZVS standard zang in. Zolai tawh gen in.
```

---

## DICTIONARY FIX & VERIFICATION PROMPTS

> Run these with Gemini CLI: `gemini -p "$(cat GEMINI.md)" "PROMPT"`
> Or paste into Gemini with the GEMINI.md context loaded.

---

## PROMPT 11 — Verify & Fix a Single Entry

```
You are a Zolai (Tedim ZVS) dictionary editor. Check this entry:

[PASTE JSON ENTRY]

Verify:
1. Is the English translation correct for this Zolai word?
2. Is the example sentence grammatically correct Zolai (SOV order)?
3. Does the English example accurately translate the Zolai?
4. Is the CEFR level appropriate?
5. Is this a homonym? If so, add a note.

Output the corrected entry as JSON. If correct, output as-is with "status": "verified".
```

---

## PROMPT 12 — Batch Verify 20 Entries

```
You are a Zolai (Tedim ZVS) dictionary editor. Verify these 20 entries:

[PASTE 20 JSON ENTRIES]

For each entry:
- Mark ✓ if correct
- Mark ✗ if wrong, then output the corrected JSON

Focus on: wrong English meaning, bad example sentences, wrong POS, missing homonym notes.

Output format:
1. [word] ✓/✗
[corrected JSON if ✗]
```

---

## PROMPT 13 — Fix Wrong Translation Based on Context

```
You are a Zolai (Tedim ZVS) dictionary editor.

The word "[WORD]" is currently translated as "[WRONG ENGLISH]" in our dictionary.
Here are real example sentences from our Bible corpus showing how it is actually used:

[PASTE 3-5 EXAMPLE SENTENCES FROM CORPUS]

Based on these examples:
1. What is the correct English translation?
2. Write 2 natural example sentences
3. Is this a homonym? List all meanings with context
4. What CEFR level is appropriate?

Output corrected JSON entry.
```

---

## PROMPT 14 — Generate Missing Example Sentences

```
You are a Zolai (Tedim ZVS) language expert.

These dictionary entries are missing example sentences. For each word, write one short, natural Zolai sentence (5-10 words) and its English translation.

Rules:
- SOV word order: Subject → Object → Verb
- Use ka (my/I), na (your/you), a (his/her)
- Statements end with "hi", questions with "hiam"
- Use Tedim ZVS vocabulary only (pasian not pathian, gam not ram)

Words:
[PASTE LIST]

Output format:
| Zolai | Example (ZO) | Example (EN) |
```

---

## PROMPT 15 — Detect & Fix Homonyms

```
You are a Zolai (Tedim ZVS) dictionary editor.

These words may have multiple meanings. For each, list ALL known meanings with:
- Context where each meaning is used
- One example sentence per meaning
- How to tell which meaning is intended

Words: sam, lei, ni, tu, mak, kha, dam, pai, om, nau

Output format:
**[word]**
- Meaning 1 ([context]): [english] — "[zo example]" = "[en translation]"
- Meaning 2 ([context]): [english] — "[zo example]" = "[en translation]"
```

---

## PROMPT 16 — Verify Example Sentence Grammar

```
You are a Zolai (Tedim ZVS) grammar expert.

Check each sentence for:
1. Correct SOV word order
2. Correct use of ka/na/a pronouns
3. Correct verb endings (hi/hiam/in/uh)
4. Correct negation (kei not lo in conditionals)
5. No non-Tedim vocabulary

Sentences:
[PASTE SENTENCES]

Output:
✓ [sentence] — correct
✗ [sentence] — [error] → corrected: [fixed sentence]
```

---

## PROMPT 17 — Enrich Entry with Cultural Context

```
You are a Zolai (Tedim ZVS) language and culture expert.

Enrich this dictionary entry with:
1. A cultural note (1-2 sentences) about how this word/concept is used in Zomi culture
2. A second example sentence showing a different usage context
3. Any related proverbs or phrases using this word
4. Synonyms with nuance differences

Entry: [PASTE JSON]

Output enriched JSON with added fields: note, example_zo_2, example_en_2, proverb (if any).
```

---

## PROMPT 18 — Full Dictionary Batch Fix (CLI)

Paste this directly into terminal:

```bash
# Step 1: Export 50 unverified entries
python3 -c "
import json, random
lines = [json.loads(l) for l in open('data/dictionary/wordlists/zo_en_singlewords_v1.jsonl') if l.strip()]
batch = [e for e in lines if e.get('category') == 'wordlist'][:50]
print(json.dumps(batch, ensure_ascii=False, indent=2))
" > /tmp/batch_to_verify.json

# Step 2: Send to Gemini for correction
gemini -p "$(cat GEMINI.md)" "$(cat /tmp/batch_to_verify.json)
Verify and correct all entries. Output corrected JSONL only — one JSON object per line, no extra text." > /tmp/corrected_batch.jsonl

# Step 3: Review output
cat /tmp/corrected_batch.jsonl | python3 -m json.tool | head -60
```

---

## QUICK COPY — Start Full Dictionary Fix Now

```bash
gemini -p "$(cat GEMINI.md)" "$(python3 -c "
import json, random
lines = [json.loads(l) for l in open('data/dictionary/wordlists/zo_en_singlewords_v1.jsonl') if l.strip()]
batch = random.sample([e for e in lines if e.get('category')=='wordlist'], 20)
print(json.dumps(batch, ensure_ascii=False, indent=2))
")" "Verify all 20 entries. Mark correct or wrong. Output corrected JSONL for wrong ones."
```

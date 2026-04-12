# Particle Differentiations & Verb Alternations

## Concept / Rule
Zolai utilizes distinct prefixes to indicate possession, action, or state. Additionally, Kuki-Chin languages possess two forms of most verbs (Stem I and Stem II), depending on their syntactic environment.

### "A" Prefix Usage
1. **A + verb:** Denotes a 3rd person singular subject ("He/she does").
   - *A pai hi* (He/she goes).
2. **A + noun:** Denotes 3rd person singular possession ("His/her").
   - *A pa* (His/her father).
3. **A + preposition:** Acts as an article for position ("The + prep").
   - *Atung* (On it).

### "Ki" Prefix Usage
1. **Ki + verb (Reciprocal):** Actions done to each other.
   - *Kituak* (Meet each other).
2. **Ki + verb (Passive):** Actions done to a subject.
   - *Kibawl* (Be made).
3. **Ki + noun:** Represents a collective or organization.
   - *Kipawlna* (Organization).

### "G" vs "Ng" Distinction
A critical phonological and semantic distinction in Zolai. Misusing 'g' for 'ng' completely changes the meaning of the word.
- **Gai** (Marry - female) vs **Ngai** (Marry - male / Love)
- **Gah** (Earn/Fruit) vs **Ngah** (Receive)
- **Gam** (Country/Land) vs **Ngam** (Dare)
- **Gap** (Strong/Firm) vs **Ngap** (Start work / Be able to)

### Verb Stem Alternation (Stem I and Stem II)
- **Stem I:** Used in simple, affirmative main clauses (e.g., `mu` - see).
- **Stem II:** Used in dependent clauses, negative clauses, interrogatives, and noun formations (e.g., `muh` - seeing).
- **Noun Formation Rule:** Verb (Stem II) + `na` = Noun (e.g., `It` + `na` = `Itna` [Love]).

## Decision / Application
The parser must strictly flag any instances where "Ki" is used non-reciprocally or non-passively outside of established nouns, and it must validate the presence of Stem II verbs preceding the `na` suffix for nominalization. The tutoring agent must explicitly correct users confusing 'G' and 'Ng' sounds due to their high semantic weight.

## Reason
This standardization aligns with the Zomi Christian Literature Society (ZCLS) and the *Zolai Gelhmaan Bu* (Zolai Grammar Book), ensuring the AI's output reflects formal, educated Zolai rather than colloquial phonetic spelling errors.

## Pattern / Regex Snippet
```regex
# Ensure 'ng' is used for nasal endings and not just 'g'
\b(tun|sin|lun|din|man|sun|kon|zon|hon)g\b

# Noun formation requires Stem II
\b(mu|thei|kap)\s+na\b  # Flag to suggest muhna, theihna, kahna
```

## Mistake / Anti-pattern
Do not accept `mu na` (see + noun suffix) as valid; it must always be the Stem II form `muh na`. Do not allow `gam` (country) to be translated as "dare" due to phonetic similarity with `ngam`.
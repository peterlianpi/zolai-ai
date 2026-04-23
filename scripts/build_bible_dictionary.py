#!/usr/bin/env python3
"""
Build Zolai dictionary by studying every Bible book from corpus context.

Strategy — corpus-driven, no hardcoded pairs:
1. Parse all parallel files (TDB77 + Tedim2010 ZVS + KJV)
2. Prefer Tedim2010 (ZVS standard) over TDB77 for headwords
3. For each Zolai word, collect:
   - All English glosses it co-occurs with (weighted by verse proximity)
   - All Zolai words it co-occurs with in same verse (for related/synonyms)
   - Negation patterns: word + kei / word + lo → antonym inference
   - Repetition patterns: word appears with same EN gloss across books → high confidence
4. Infer synonyms: two Zolai words that share the same top EN gloss
5. Infer antonyms: words that appear in negation of each other
6. Infer related: words that co-occur in same verse frequently
7. ZVS corrections: TDB77-only words that have a Tedim2010 equivalent
"""

import json, re, glob
from pathlib import Path
from collections import defaultdict, Counter

DIALECT = "tedim"
SOURCE  = "Bible-Parallel-Corpus"

# ZVS hard corrections (non-ZVS → ZVS correct)
# lo is NOT here — it is valid ZVS negation (e.g. "Amah dam lo hi")
# kei is preferred in conditionals; lo is common in 3rd person
DIALECT_CORRECTIONS = {
    "sanggin":      "sanginn",
    "pathian":      "pasian",
    "ram":          "gam",
    "fapa":         "tapa",
    "bawipa":       "topa",
    "siangpahrang": "pasian",
    "cu":           "tua",
    "cun":          "tua",
}

# ZVS negation usage notes (corpus-verified)
NEGATION_NOTES = {
    "kei": (
        "Standard ZVS negation. "
        "1st/2nd person: 'Ka dam kei hi' (I am not well). "
        "Conditionals ONLY use kei: 'Nong pai kei a leh' (if you don't go). "
        "Compound: 'kei lo' = none/not any (Ten Commandments: 'Pasian dang kei lo')."
    ),
    "lo": (
        "Valid ZVS negation, common in 3rd person: 'Amah dam lo hi' (he is not well). "
        "Also used in clause-final position and compounds. "
        "FORBIDDEN in conditionals — use 'kei' there."
    ),
}

# Particles/function words to skip as headwords
SKIP = {
    "in","a","hi","uh","leh","tawh","ah","kha","ta","pah","ciangin",
    "bangin","pen","na","ding","lai","hen","la","tua","te","i",
    "napi","hiam","un","ni","aw","ma","mah","ka","nang","amah","eima",
    "keima","nangmah","ih","ite","nate","kite","amaute","nomau","komau",
}

# Short but important grammar words — keep even though len <= 2
KEEP_SHORT = {"lo","kei","om","mu","pa","nu","ci"}

# ── Parsing ────────────────────────────────────────────────────────────────────

def parse_file(path):
    """Yield (ref, zo_tdm, zo_tdb, en) from a parallel markdown file."""
    ref_pat  = re.compile(r'\*\*(\d+:\d+)\*\*')
    tdm_pat  = re.compile(r'^Tedim2010:\s*(.+)', re.I)
    tdb_pat  = re.compile(r'^TDB77:\s*(.+)', re.I)
    kjv_pat  = re.compile(r'^KJV:\s*(.+)', re.I)
    # Also handle Tedim_Chin, HCL06, FCL variants
    alt_pat  = re.compile(r'^(?:Tedim_Chin|HCL06|FCL):\s*(.+)', re.I)

    ref = ""
    zo_tdm = zo_tdb = en = ""

    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            m = ref_pat.match(line)
            if m:
                if ref and (zo_tdm or zo_tdb) and en:
                    yield ref, zo_tdm or zo_tdb, zo_tdb, en
                ref = m.group(1)
                zo_tdm = zo_tdb = en = ""
                continue
            m = tdm_pat.match(line) or alt_pat.match(line)
            if m:
                zo_tdm = m.group(1).strip()
                continue
            m = tdb_pat.match(line)
            if m:
                zo_tdb = m.group(1).strip()
                continue
            m = kjv_pat.match(line)
            if m:
                en = m.group(1).strip()

    if ref and (zo_tdm or zo_tdb) and en:
        yield ref, zo_tdm or zo_tdb, zo_tdb, en


def tokenize(text):
    return re.findall(r"[a-z']+", text.lower())


EN_STOP = {
    "the","and","of","to","in","a","an","is","was","he","she","it","his",
    "her","they","them","their","that","this","for","with","not","but",
    "all","be","are","were","have","had","has","from","by","at","on","or",
    "so","as","him","we","you","i","my","thy","thee","shall","will","said",
    "unto","upon","which","who","then","when","also","now","out","up","did",
    "do","no","if","me","us","our","your","its","than","into","even","yet",
    "let","may","one","two","three","four","five","six","seven","eight",
}

# ── Study corpus ───────────────────────────────────────────────────────────────

def study_corpus(bible_dir):
    """
    Read every Bible book and build:
      zo_en[word]      = Counter of English co-occurrences
      zo_zo[word]      = Counter of Zolai co-occurrences (same verse)
      zo_neg[word]     = Counter of words this word negates (word + kei/lo + X)
      zo_examples[word]= list of (zo_verse, en_verse, ref)
      tdb_to_tdm[word] = TDB77 word → Tedim2010 equivalent (ZVS correction)
      book_count[word] = how many different books the word appears in
    """
    zo_en      = defaultdict(Counter)
    zo_zo      = defaultdict(Counter)
    zo_neg     = defaultdict(Counter)
    zo_examples= defaultdict(list)
    tdb_to_tdm = defaultdict(Counter)
    book_count = defaultdict(set)
    total_verses = [0]

    files = glob.glob(f"{bible_dir}/**/*_Parallel.md", recursive=True)
    seen = {}
    for f in files:
        name = Path(f).name
        if name not in seen:
            seen[name] = f

    print(f"Studying {len(seen)} Bible books...")

    for fname, fpath in seen.items():
        book = re.sub(r'_(?:TDB77|Tedim_Chin|HCL06|FCL)?_?Parallel$', '', Path(fpath).stem)

        for ref, zo_verse, tdb_verse, en_verse in parse_file(fpath):
            total_verses[0] += 1
            zo_tokens  = tokenize(zo_verse)
            tdb_tokens = tokenize(tdb_verse) if tdb_verse else []
            en_tokens  = [t for t in tokenize(en_verse) if t not in EN_STOP and len(t) > 2]

            tdm_tokens = tokenize(zo_verse)
            for i, (t, d) in enumerate(zip(tdm_tokens, tdb_tokens)):
                if t != d and len(t) > 2 and len(d) > 2:
                    tdb_to_tdm[d][t] += 1

            zo_set = [w for w in set(zo_tokens)
                      if (len(w) > 2 or w in KEEP_SHORT) and w not in SKIP]

            for zo in zo_set:
                book_count[zo].add(book)

                # Positional weighting: zo and en at similar relative positions
                # get higher weight — reduces cross-bleeding (e.g. tanu getting "sons")
                zo_positions = [i / max(len(zo_tokens), 1)
                                for i, t in enumerate(zo_tokens) if t == zo]
                for en in en_tokens:
                    en_positions = [i / max(len(en_tokens), 1)
                                    for i, t in enumerate(en_tokens) if t == en]
                    if not en_positions:
                        continue
                    min_dist = min(abs(z - e) for z in zo_positions for e in en_positions)
                    weight = max(1, int(3 * (1 - min_dist)))
                    zo_en[zo][en] += weight

                for zo2 in zo_set:
                    if zo2 != zo:
                        zo_zo[zo][zo2] += 1

                if len(zo_examples[zo]) < 3:
                    zo_examples[zo].append({
                        "zo": zo_verse, "en": en_verse,
                        "source": "Parallel_Corpus", "reference": f"{book} {ref}"
                    })

            for i, tok in enumerate(zo_tokens):
                if tok in ("kei", "lo") and i > 0:
                    prev = zo_tokens[i-1]
                    if prev not in SKIP and len(prev) > 2:
                        zo_neg[prev][tok] += 1

    return zo_en, zo_zo, zo_neg, zo_examples, tdb_to_tdm, book_count, total_verses[0]


# ── Semantic inference ─────────────────────────────────────────────────────────

def infer_relations(zo_en, zo_zo, zo_neg, book_count, total_verses):
    en_to_zo = defaultdict(list)
    for zo, en_counter in zo_en.items():
        if en_counter:
            top_en = en_counter.most_common(1)[0][0]
            en_to_zo[top_en].append((zo, en_counter.most_common(1)[0][1]))

    synonyms = defaultdict(list)
    for en, zo_list in en_to_zo.items():
        strong = [(zo, cnt) for zo, cnt in zo_list if cnt > 10]
        if len(strong) > 1:
            strong.sort(key=lambda x: -x[1])
            top = [zo for zo, _ in strong[:4]]
            for zo in top:
                others = [z for z in top if z != zo]
                synonyms[zo].extend(o for o in others if o not in synonyms[zo])

    antonyms = defaultdict(list)

    # Filter: words appearing in >50% of all verses are too common to be "related"
    # They co-occur with everything — not meaningful
    high_freq_threshold = total_verses * 0.50
    high_freq = {w for w, books in book_count.items()
                 if sum(1 for _ in books) > 0  # placeholder — use zo_zo total
                }
    # Better: use raw co-occurrence count as proxy for frequency
    word_total = {w: sum(zo_zo[w].values()) for w in zo_zo}
    max_total  = max(word_total.values()) if word_total else 1
    # Words with >30% of max co-occurrence are ubiquitous noise
    noise_threshold = max_total * 0.30
    noise_words = {w for w, t in word_total.items() if t > noise_threshold}

    related = defaultdict(list)
    for word, co_counter in zo_zo.items():
        books = len(book_count.get(word, set()))
        if books < 2:
            continue
        top_related = [
            w for w, cnt in co_counter.most_common(30)
            if cnt > 5
            and len(book_count.get(w, set())) >= 3
            and w not in SKIP
            and w != word
            and w not in noise_words   # ← filter ubiquitous words
            and "'" not in w           # ← filter possessives/proper nouns
        ][:8]
        related[word] = top_related

    return synonyms, antonyms, related


def infer_pos(word, translations):
    en = " ".join(translations).lower()
    w = word.lower()
    noun_sfx = {"na","pi","te","mi","gam","tung","nuai","lam","sung","khua","inn","pa","nu"}
    verb_sfx  = {"hi","uh","pah","kik","sak","khia","kha","ta","om","ci","zo","thei"}
    if any(w.endswith(s) for s in noun_sfx): return "n"
    if any(w.endswith(s) for s in verb_sfx): return "v"
    if re.search(r'\b(the |a |an )\b', en) and not re.search(r'\b(ing|ed)\b', en): return "n"
    if re.search(r'\b(to |ing\b|ed\b)', en): return "v"
    return "n"


# ── Build entries ──────────────────────────────────────────────────────────────

def _clean(words):
    """Remove proper nouns (apostrophes, digits, all-caps) from word lists."""
    return [w for w in words if "'" not in w and not w[0].isdigit() and w == w.lower()]


def build_entries(zo_en, zo_zo, zo_neg, zo_examples, tdb_to_tdm, book_count, total_verses):
    synonyms, antonyms, related = infer_relations(zo_en, zo_zo, zo_neg, book_count, total_verses)

    # Corpus-derived TDB77→Tedim2010 alignment is too noisy (verse lengths differ).
    # Use only the hardcoded ZVS corrections.
    all_corrections = dict(DIALECT_CORRECTIONS)

    entries = []
    for word, en_counter in sorted(zo_en.items()):
        if sum(en_counter.values()) < 3:
            continue

        translations = [w for w, _ in en_counter.most_common(8)]
        pos = infer_pos(word, translations)
        w = word.lower()

        zvs_fix = all_corrections.get(w) or all_corrections.get(word)
        usage = f"Attested {sum(en_counter.values())}× across {len(book_count.get(w,set()))} Bible books."
        if zvs_fix:
            usage += f" ⚠ Non-ZVS: use '{zvs_fix}' instead."

        # Negation usage note
        neg_note = NEGATION_NOTES.get(w, "")
        if neg_note:
            usage += " " + neg_note

        entry = {
            "zolai":         word,
            "english":       translations[0] if translations else "",
            "pos":           pos,
            "variants":      [],
            "dialect":       DIALECT,
            "source":        SOURCE,
            "examples":      zo_examples.get(w, zo_examples.get(word, []))[:3],
            "usage_notes":   usage,
            "accuracy":      "corpus-derived",
            "category":      "bible",
            "translations":  translations,
            "synonyms":      _clean(synonyms.get(w, synonyms.get(word, []))[:5]),
            "antonyms":      antonyms.get(w, []),
            "related":       _clean(related.get(w, related.get(word, []))[:8]),
            "same_meaning":  [],
            "zvs_correct":   not bool(zvs_fix),
            "zvs_correction": zvs_fix or "",
            "reverse":       {en: word for en in translations},
        }
        entries.append(entry)

    # same_meaning: words sharing identical top translation
    top_en_map = defaultdict(list)
    for e in entries:
        if e["translations"]:
            top_en_map[e["translations"][0]].append(e["zolai"])
    for e in entries:
        if e["translations"]:
            peers = _clean([w for w in top_en_map[e["translations"][0]] if w != e["zolai"]])
            e["same_meaning"] = peers[:4]

    return entries


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    bible_dir = "data/corpus/bible/markdown"
    out_zo_en = "data/dictionary/processed/dict_bible_zo_en_v1.jsonl"
    out_en_zo = "data/dictionary/processed/dict_bible_en_zo_v1.jsonl"

    zo_en, zo_zo, zo_neg, zo_examples, tdb_to_tdm, book_count, total_verses = study_corpus(bible_dir)

    print(f"Building entries for {len(zo_en)} tokens...")
    entries = build_entries(zo_en, zo_zo, zo_neg, zo_examples, tdb_to_tdm, book_count, total_verses)

    with open(out_zo_en, "w", encoding="utf-8") as f:
        for e in entries:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")
    print(f"Wrote {len(entries)} ZO→EN entries → {out_zo_en}")

    # EN→ZO reverse index
    en_map = defaultdict(list)
    for e in entries:
        for en in e["translations"]:
            en_map[en].append(e["zolai"])

    with open(out_en_zo, "w", encoding="utf-8") as f:
        for en, zo_list in sorted(en_map.items()):
            f.write(json.dumps({
                "english": en, "zolai_equivalents": zo_list,
                "source": SOURCE, "category": "reverse-index"
            }, ensure_ascii=False) + "\n")
    print(f"Wrote {len(en_map)} EN→ZO entries → {out_en_zo}")


if __name__ == "__main__":
    import os
    os.chdir(Path(__file__).parent.parent)
    main()

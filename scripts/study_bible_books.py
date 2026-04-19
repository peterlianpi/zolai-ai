#!/usr/bin/env python3
"""
Deep verse-by-verse study of each Bible book.
Processes books in canonical order (1–66), chapter by chapter, verse by verse.
Outputs a structured learning record per verse with:
  - Zolai tokens + their best English gloss (positional alignment)
  - Grammar patterns detected (negation, tense markers, particles)
  - New vocabulary discovered (not seen in previous books)
  - Running dictionary updated after each book
"""

import json, re, glob
from pathlib import Path
from collections import defaultdict, Counter

# Canonical Bible book order (66 books)
BOOK_ORDER = [
    "GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT",
    "1SA","2SA","1KI","2KI","1CH","2CH","EZR","NEH","EST",
    "JOB","PSA","PRO","ECC","SNG","ISA","JER","LAM","EZK",
    "DAN","HOS","JOL","AMO","OBA","JON","MIC","NAM","HAB",
    "ZEP","HAG","ZEC","MAL",
    "MAT","MRK","LUK","JHN","ACT","ROM",
    "1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH",
    "1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE",
    "1JN","2JN","3JN","JUD","REV",
]

BIBLE_DIR = "data/corpus/bible/markdown/Parallel_Corpus/TDB77"
OUT_DIR   = Path("data/dictionary/bible_study")
OUT_DICT  = Path("data/dictionary/processed/dict_bible_learned_v1.jsonl")

SKIP = {
    "in","a","hi","uh","leh","tawh","ah","kha","ta","pah","ciangin",
    "bangin","pen","na","ding","lai","hen","la","tua","te","i",
    "napi","hiam","un","ni","aw","ma","mah","ka","nang","amah",
    "eima","keima","nangmah","ih","ite","nate","kite","amaute",
}
KEEP_SHORT = {"lo","kei","om","mu","pa","nu","ci"}

EN_STOP = {
    "the","and","of","to","in","a","an","is","was","he","she","it",
    "his","her","they","them","their","that","this","for","with","not",
    "but","all","be","are","were","have","had","has","from","by","at",
    "on","or","so","as","him","we","you","i","my","thy","thee","shall",
    "will","said","unto","upon","which","who","then","when","also","now",
    "out","up","did","do","no","if","me","us","our","its","than","into",
    "even","yet","let","may","one","two","three","four","five","six",
    "seven","eight","nine","ten",
}

# Grammar markers to detect
TENSE_MARKERS    = {"ding","zo","khin","nawn","pah","lel","ta","ngei"}
NEGATION_MARKERS = {"kei","lo","kei lo"}
ASPECT_MARKERS   = {"thei","kik","sak","khia"}


def tokenize(text):
    return re.findall(r"[a-z']+", text.lower())


def parse_book(path):
    """Yield (chapter, verse, zo_verse, en_verse) from a parallel markdown."""
    ref_pat = re.compile(r'\*\*(\d+):(\d+)\*\*')
    zo_pat  = re.compile(r'^(?:TDB77|Tedim2010|Tedim_Chin):\s*(.+)', re.I)
    en_pat  = re.compile(r'^KJV:\s*(.+)', re.I)

    ch = vs = ""
    zo = en = ""
    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            m = ref_pat.match(line)
            if m:
                if ch and zo and en:
                    yield ch, vs, zo, en
                ch, vs = m.group(1), m.group(2)
                zo = en = ""
                continue
            m = zo_pat.match(line)
            if m and not zo:
                zo = m.group(1).strip()
                continue
            m = en_pat.match(line)
            if m:
                en = m.group(1).strip()
    if ch and zo and en:
        yield ch, vs, zo, en


def align_verse(zo_tokens, en_tokens):
    """
    Positional alignment: pair each zo token with its closest en token.
    Returns dict: zo_word → best_en_gloss
    """
    content_en = [t for t in en_tokens if t not in EN_STOP and len(t) > 2]
    if not content_en:
        return {}
    pairs = {}
    for i, zo in enumerate(zo_tokens):
        if (len(zo) < 3 and zo not in KEEP_SHORT) or zo in SKIP:
            continue
        zo_norm = i / max(len(zo_tokens), 1)
        best_en, best_dist = "", 1.0
        for j, en in enumerate(content_en):
            en_norm = j / max(len(content_en), 1)
            dist = abs(zo_norm - en_norm)
            if dist < best_dist:
                best_dist, best_en = dist, en
        if best_en and best_dist < 0.4:  # only confident alignments
            pairs[zo] = best_en
    return pairs


def detect_grammar(zo_tokens):
    """Detect grammar patterns in a verse."""
    patterns = []
    toks = zo_tokens
    for i, t in enumerate(toks):
        if t in TENSE_MARKERS:
            ctx = toks[max(0,i-2):i+2]
            patterns.append({"type": "tense", "marker": t, "context": ctx})
        if t in NEGATION_MARKERS:
            ctx = toks[max(0,i-2):i+2]
            patterns.append({"type": "negation", "marker": t, "context": ctx})
        if t in ASPECT_MARKERS:
            ctx = toks[max(0,i-2):i+2]
            patterns.append({"type": "aspect", "marker": t, "context": ctx})
        # Detect "X kei lo" compound negation
        if t == "lo" and i > 0 and toks[i-1] == "kei":
            prev2 = toks[i-2] if i > 1 else ""
            patterns.append({"type": "compound_neg", "marker": "kei lo",
                              "subject": prev2, "context": toks[max(0,i-3):i+2]})
    return patterns


def study_book(book_code, path, known_vocab):
    """
    Study one book verse by verse.
    Returns: book_record, new_vocab learned, updated known_vocab
    """
    book_record = {
        "book": book_code,
        "chapters": defaultdict(lambda: {"verses": []}),
        "new_vocab": [],
        "grammar_patterns": [],
        "word_freq": Counter(),
    }

    word_en_map = defaultdict(Counter)  # zo → Counter(en glosses)

    for ch, vs, zo_verse, en_verse in parse_book(path):
        zo_tokens = tokenize(zo_verse)
        en_tokens = tokenize(en_verse)

        aligned   = align_verse(zo_tokens, en_tokens)
        grammar   = detect_grammar(zo_tokens)

        # Track frequency
        for t in zo_tokens:
            if (len(t) > 2 or t in KEEP_SHORT) and t not in SKIP:
                book_record["word_freq"][t] += 1

        # Accumulate EN glosses
        for zo, en in aligned.items():
            word_en_map[zo][en] += 1

        # Record verse
        book_record["chapters"][ch]["verses"].append({
            "ref":     f"{book_code} {ch}:{vs}",
            "zo":      zo_verse,
            "en":      en_verse,
            "aligned": aligned,
            "grammar": grammar,
        })

        if grammar:
            book_record["grammar_patterns"].extend(grammar)

    # Identify new vocabulary (not seen in previous books)
    for word, en_counter in word_en_map.items():
        if word not in known_vocab:
            top_en = en_counter.most_common(1)[0][0] if en_counter else ""
            book_record["new_vocab"].append({
                "word":        word,
                "gloss":       top_en,
                "freq":        book_record["word_freq"][word],
                "first_book":  book_code,
            })
            known_vocab[word] = {
                "gloss":      top_en,
                "first_book": book_code,
                "all_books":  [book_code],
                "en_counter": dict(en_counter),
            }
        else:
            # Update gloss with more evidence
            for en, cnt in en_counter.items():
                known_vocab[word].setdefault("en_counter", {})[en] = \
                    known_vocab[word]["en_counter"].get(en, 0) + cnt
            # Track all books this word appears in
            if book_code not in known_vocab[word].get("all_books", []):
                known_vocab[word].setdefault("all_books", []).append(book_code)

    return book_record, known_vocab


def save_book_study(book_code, book_record, book_num):
    """Save per-book study to wiki/vocabulary/bible_context."""
    out = OUT_DIR / f"{book_num:02d}_{book_code}_study.jsonl"
    out.parent.mkdir(parents=True, exist_ok=True)

    # Summary line
    n_verses  = sum(len(c["verses"]) for c in book_record["chapters"].values())
    n_new     = len(book_record["new_vocab"])
    n_grammar = len(book_record["grammar_patterns"])

    with open(out, "w", encoding="utf-8") as f:
        # Header
        f.write(json.dumps({
            "type": "book_summary",
            "book": book_code,
            "book_num": book_num,
            "verses": n_verses,
            "new_vocab": n_new,
            "grammar_patterns": n_grammar,
            "top_words": book_record["word_freq"].most_common(20),
        }, ensure_ascii=False) + "\n")

        # New vocab
        for v in sorted(book_record["new_vocab"], key=lambda x: -x["freq"]):
            f.write(json.dumps({"type": "vocab", **v}, ensure_ascii=False) + "\n")

        # Grammar patterns (deduplicated by marker+context)
        seen_pat = set()
        for p in book_record["grammar_patterns"]:
            key = (p["type"], p["marker"], tuple(p["context"]))
            if key not in seen_pat:
                seen_pat.add(key)
                f.write(json.dumps({"type": "grammar", **p}, ensure_ascii=False) + "\n")

    print(f"  Book {book_num:02d} {book_code}: {n_verses} verses, "
          f"{n_new} new words, {n_grammar} grammar patterns → {out.name}")
    return n_verses, n_new


def build_final_dict(known_vocab):
    entries = []
    for word, data in sorted(known_vocab.items()):
        en_counter = Counter(data.get("en_counter", {}))
        translations = [w for w, _ in en_counter.most_common(8)
                        if w not in EN_STOP and len(w) > 2]
        if not translations:
            translations = [data["gloss"]] if data["gloss"] else []
        all_books = data.get("all_books", [data.get("first_book","")])
        entries.append({
            "zolai":        word,
            "english":      translations[0] if translations else "",
            "translations": translations,
            "first_book":   data["first_book"],
            "all_books":    all_books,
            "book_count":   len(all_books),
            "dialect":      "tedim",
            "source":       "Bible-Verse-Study",
            "category":     "bible",
            "accuracy":     "corpus-derived",
        })
    return entries


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    known_vocab = {}
    total_verses = total_new = 0

    # Find available files
    available = {}
    for f in glob.glob(f"{BIBLE_DIR}/*_Parallel.md"):
        code = Path(f).stem.replace("_TDB77_Parallel","").replace("_Parallel","")
        available[code] = f

    print(f"Starting verse-by-verse study of {len(BOOK_ORDER)} books...\n")

    for book_num, book_code in enumerate(BOOK_ORDER, 1):
        path = available.get(book_code)
        if not path:
            print(f"  Book {book_num:02d} {book_code}: NOT FOUND — skipping")
            continue

        book_record, known_vocab = study_book(book_code, path, known_vocab)
        v, n = save_book_study(book_code, book_record, book_num)
        total_verses += v
        total_new    += n

    print(f"\nTotal: {total_verses} verses studied, {total_new} vocabulary entries learned")
    print(f"Total unique vocab: {len(known_vocab)}")

    # Save final dictionary
    entries = build_final_dict(known_vocab)
    with open(OUT_DICT, "w", encoding="utf-8") as f:
        for e in entries:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")
    print(f"Dictionary saved → {OUT_DICT} ({len(entries)} entries)")


if __name__ == "__main__":
    import os
    os.chdir(Path(__file__).parent.parent)
    main()

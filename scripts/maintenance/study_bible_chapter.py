#!/usr/bin/env python3
"""
study_bible_chapter.py
Learn grammar from any Bible book/chapter verse by verse.

Usage:
  python scripts/maintenance/study_bible_chapter.py --book GEN --chapter 1
  python scripts/maintenance/study_bible_chapter.py --book GEN --all
  python scripts/maintenance/study_bible_chapter.py --book JHN --chapter 3
  python scripts/maintenance/study_bible_chapter.py --list
"""

import json, re, argparse
from pathlib import Path
from collections import defaultdict, Counter

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data/parallel"
WIKI = ROOT / "wiki/vocabulary/bible_context"
WIKI.mkdir(parents=True, exist_ok=True)

BIBLE_FILES = [
    (DATA / "bible_parallel_tdb77_kjv.jsonl",     "TDB77"),
    (DATA / "bible_parallel_tbr17_kjv.jsonl",     "TBR17"),
    (DATA / "bible_parallel_tedim2010_kjv.jsonl", "Tedim2010"),
]

BOOK_ORDER = [
    'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA',
    '1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO',
    'ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO',
    'OBA','JON','MIC','NAH','HAB','ZEP','HAG','ZEC','MAL',
    'MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH',
    'PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS',
    '1PE','2PE','1JN','2JN','3JN','JUD','REV'
]

BOOK_NAMES = {
    'GEN':'Genesis','EXO':'Exodus','LEV':'Leviticus','NUM':'Numbers','DEU':'Deuteronomy',
    'JOS':'Joshua','JDG':'Judges','RUT':'Ruth','1SA':'1 Samuel','2SA':'2 Samuel',
    '1KI':'1 Kings','2KI':'2 Kings','1CH':'1 Chronicles','2CH':'2 Chronicles',
    'EZR':'Ezra','NEH':'Nehemiah','EST':'Esther','JOB':'Job','PSA':'Psalms',
    'PRO':'Proverbs','ECC':'Ecclesiastes','SNG':'Song of Songs','ISA':'Isaiah',
    'JER':'Jeremiah','LAM':'Lamentations','EZK':'Ezekiel','DAN':'Daniel',
    'HOS':'Hosea','JOL':'Joel','AMO':'Amos','OBA':'Obadiah','JON':'Jonah',
    'MIC':'Micah','NAH':'Nahum','HAB':'Habakkuk','ZEP':'Zephaniah','HAG':'Haggai',
    'ZEC':'Zechariah','MAL':'Malachi','MAT':'Matthew','MRK':'Mark','LUK':'Luke',
    'JHN':'John','ACT':'Acts','ROM':'Romans','1CO':'1 Corinthians','2CO':'2 Corinthians',
    'GAL':'Galatians','EPH':'Ephesians','PHP':'Philippians','COL':'Colossians',
    '1TH':'1 Thessalonians','2TH':'2 Thessalonians','1TI':'1 Timothy','2TI':'2 Timothy',
    'TIT':'Titus','PHM':'Philemon','HEB':'Hebrews','JAS':'James','1PE':'1 Peter',
    '2PE':'2 Peter','1JN':'1 John','2JN':'2 John','3JN':'3 John','JUD':'Jude','REV':'Revelation'
}

# Grammar pattern detectors
GRAMMAR_DETECTORS = {
    'optative_hen':      (r'\bom hen\b|\bom ta hen\b|\bpiang hen\b|\bhi uh hen\b', 'optative: let there be / let it be'),
    'punctual_pah':      (r'\bpah hi\b|\bpah uh hi\b', 'punctual: immediately/suddenly'),
    'causative_sak':     (r'\bpiangsak\b|\bdamsak\b|\bnungtasak\b|\bthahsak\b|\bvaksak\b', 'causative: -sak suffix'),
    'quotative_ci_hi':   (r'\bci hi\b|\bci-in\b|\bci uh hi\b', 'quotative: said/saying'),
    'sequence_tua':      (r'\btua ciangin\b|\btua ahih ciangin\b', 'sequence: then/therefore'),
    'adj_hoih':          (r'\bhoih hi\b|\bhoih mahmah\b', 'adjective: hoih (good)'),
    'intensifier_mahmah':(r'\bmahmah\b', 'intensifier: very/greatly'),
    'hortative_ni':      (r'\bbawl ni\b|\bpai ni\b|\bki-it ni\b|\bom ni\b', 'hortative: let us'),
    'serial_verb_in':    (r'\b\w+-in\b', 'serial verb: -in (and then)'),
    'purpose_dingin':    (r'\bdingin\b|\bnadingin\b|\badingin\b', 'purpose: in order to'),
    'completed_khin':    (r'\bkhin hi\b|\bkhin ta\b|\bkhin uh\b', 'completed: already done'),
    'future_ding':       (r'\bding hi\b|\bding uh hi\b', 'future: will'),
    'negation_kei':      (r'\bkei hi\b|\bkei uh hi\b|\bkei ding\b', 'negation: kei'),
    'negation_lo':       (r'\blo hi\b|\blo uh hi\b|\bnei lo\b|\bom lo\b', 'negation: lo'),
    'conditional_leh':   (r'\ba leh\b|\bleh,\b', 'conditional: if/when'),
    'because_manin':     (r'\bahih manin\b|\bmanin\b', 'causal: because'),
    'reciprocal_ki':     (r'\bki\w+\b', 'reciprocal: ki- prefix'),
    'plural_uh':         (r'\buh hi\b|\buh a\b|\bding uh\b', 'plural: uh marker'),
}


def load_book(book_code):
    """Load all verses for a book from all 3 versions."""
    verses = defaultdict(dict)
    for fpath, ver in BIBLE_FILES:
        if not fpath.exists():
            continue
        with open(fpath) as f:
            for line in f:
                d = json.loads(line)
                meta = d.get('metadata', {})
                ref = meta.get('reference', '') if isinstance(meta, dict) else ''
                if ref and ref.startswith(book_code + '.'):
                    verses[ref][ver] = d.get('output', '').strip()
                    verses[ref]['EN'] = d.get('input', '').strip()
    return verses


def sort_ref(ref):
    parts = ref.split('.')
    p2 = parts[1].split(':')
    try:
        return (int(p2[0]), int(p2[1]) if len(p2) > 1 else 0)
    except:
        return (0, 0)


def analyze_verse(ref, data):
    """Extract grammar patterns from a verse."""
    zo = data.get('TDB77', data.get('Tedim2010', ''))
    en = data.get('EN', '')
    patterns = []
    for label, (pat, desc) in GRAMMAR_DETECTORS.items():
        if re.search(pat, zo.lower()):
            patterns.append(desc)
    return en, zo, data.get('Tedim2010', ''), patterns


def study_chapter(book, chapter, verses):
    """Generate grammar study for one chapter."""
    ch_refs = sorted(
        [r for r in verses if sort_ref(r)[0] == chapter],
        key=sort_ref
    )
    if not ch_refs:
        return None

    book_name = BOOK_NAMES.get(book, book)
    lines = [
        f"# {book_name} Chapter {chapter} — Grammar Study\n\n",
        f"> Sources: TDB77 + Tedim2010 (ZVS) × KJV | {len(ch_refs)} verses\n\n",
        "---\n\n",
    ]

    # Pattern summary
    all_patterns = Counter()
    vocab = Counter()
    for ref in ch_refs:
        en, tdb, zvs, patterns = analyze_verse(ref, verses[ref])
        for p in patterns:
            all_patterns[p] += 1
        for w in re.findall(r'\b[a-z]{3,}\b', tdb.lower()):
            if w not in ('the','and','of','in','to','a','is','was','that','he','his',
                         'for','with','unto','them','their','they','have','not','be',
                         'all','this','shall','which','from','are','were','but','it'):
                vocab[w] += 1

    if all_patterns:
        lines.append("## Grammar Patterns\n\n")
        lines.append("| Pattern | Count |\n|---|---|\n")
        for p, c in all_patterns.most_common():
            lines.append(f"| {p} | {c} |\n")
        lines.append("\n---\n\n")

    # Verse by verse
    lines.append("## Verses\n\n")
    for ref in ch_refs:
        en, tdb, zvs, patterns = analyze_verse(ref, verses[ref])
        if not tdb:
            continue
        v_num = ref.split(':')[1] if ':' in ref else ref.split('.')[-1]
        lines.append(f"### v{v_num}\n")
        lines.append(f"**EN:** {en}\n\n")
        lines.append(f"**TDB77:** {tdb}\n\n")
        if zvs and zvs != tdb:
            lines.append(f"**ZVS:** {zvs}\n\n")
        if patterns:
            lines.append("**Grammar:** " + " | ".join(patterns) + "\n\n")

    # Vocabulary
    if vocab:
        lines.append("---\n\n## Key Vocabulary\n\n")
        lines.append("| Zolai | Count |\n|---|---|\n")
        for w, c in vocab.most_common(20):
            lines.append(f"| `{w}` | {c} |\n")
        lines.append("\n")

    return "".join(lines)


def list_books(verses_by_book):
    for i, book in enumerate(BOOK_ORDER, 1):
        if book in verses_by_book:
            print(f"  {i:2d}. {book} ({BOOK_NAMES.get(book,book)}): {len(verses_by_book[book])} verses")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--book", default="GEN", help="Book code (GEN, EXO, etc.)")
    parser.add_argument("--chapter", type=int, default=1, help="Chapter number")
    parser.add_argument("--all", action="store_true", help="All chapters of the book")
    parser.add_argument("--list", action="store_true", help="List available books")
    args = parser.parse_args()

    if args.list:
        print("Loading all books...")
        vbb = {}
        for book in BOOK_ORDER:
            v = load_book(book)
            if v:
                vbb[book] = v
        list_books(vbb)
    else:
        book = args.book.upper()
        print(f"Loading {book}...")
        verses = load_book(book)
        if not verses:
            print(f"No verses found for {book}")
            exit(1)

        chapters = sorted(set(sort_ref(r)[0] for r in verses))
        print(f"  {len(verses)} verses, {len(chapters)} chapters")

        to_study = chapters if args.all else [args.chapter]

        for ch in to_study:
            content = study_chapter(book, ch, verses)
            if content:
                out = WIKI / f"{book}_ch{ch:03d}_grammar_study.md"
                out.write_text(content)
                ch_refs = [r for r in verses if sort_ref(r)[0] == ch]
                print(f"  Written: {out.name} ({len(ch_refs)} verses)")

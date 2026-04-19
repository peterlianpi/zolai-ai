#!/usr/bin/env python3
"""
build_corpus_dictionary.py
Build a complete enriched Zolai dictionary from:
  1. Existing dict_semantic (synonyms, antonyms, related, examples)
  2. Bible parallel corpus (context sentences, frequency)
  3. master_source_v1.jsonl (all dictionary/wordlist sources)
  4. Grammar particle translations (manually verified)

Output schema per entry:
{
  "zolai": str,           # headword
  "english": str,         # primary translation
  "english_alt": [str],   # alternative translations
  "pos": str,             # part of speech
  "frequency": int,       # corpus frequency (Bible)
  "synonyms": [str],      # Zolai synonyms
  "antonyms": [str],      # Zolai antonyms
  "related": [str],       # related Zolai words
  "variants": [str],      # spelling/form variants
  "examples": [{"zo":str,"en":str}],  # corpus examples
  "reverse": str,         # English -> Zolai (for reverse lookup)
  "source": str,          # data source
  "dialect": str,         # Tedim / ZVS
  "category": str,        # grammar/noun/verb/etc
}
"""

import json, re
from pathlib import Path
from collections import Counter, defaultdict

DATA = Path(str(Path(__file__).resolve().parents[2]) + "/data")
OUT  = DATA / "dictionary/processed/dict_corpus_v1.jsonl"

# ── Grammar particles (manually verified from corpus) ─────────────────────────
GRAMMAR = {
    'hi':      ('declarative statement marker', 'particle', [], [], ['hiam','ahi']),
    'hiam':    ('question marker', 'particle', [], [], ['hi','ci']),
    'in':      ('ergative/subject marker (transitive)', 'particle', [], [], ['tawh']),
    'uh':      ('plural agreement marker (2nd/3rd person)', 'particle', [], [], ['te']),
    'ding':    ('future marker / purpose marker', 'particle', [], [], ['nadingin','dingin']),
    'kei':     ('negation of verbs (did not / cannot)', 'particle', ['lo'], [], ['lo','het kei','nawn kei']),
    'lo':      ('negation of states/adjectives (not / without)', 'particle', ['kei'], [], ['kei','om lo','nei lo']),
    'leh':     ('and (between nouns/phrases)', 'conj', [], [], ['le','tawh','a']),
    'le':      ('and (TBR17 variant of leh)', 'conj', [], [], ['leh']),
    'tua':     ('that / then / so (demonstrative/discourse)', 'dem', [], [], ['hih','tua ciangin','tua ahih ciangin']),
    'hih':     ('this (proximal demonstrative)', 'dem', [], [], ['tua']),
    'ka':      ('1st person singular prefix (my/I)', 'pron', [], [], ['na','a','i']),
    'na':      ('2nd person singular prefix (your/you)', 'pron', [], [], ['ka','a','note']),
    'a':       ('3rd person prefix (his/her/its)', 'pron', [], [], ['ka','na','amah']),
    'i':       ('1st person plural subject prefix (we)', 'pron', [], [], ['eite','kote']),
    'ah':      ('locative postposition (in/at/into)', 'postp', [], [], ['sungah','tungah','kiangah']),
    'ci':      ('say/said (quotative verb)', 'v', [], [], ['gen','thu gen','ci hi']),
    'om':      ('exist / be / there is', 'v', ['om lo'], [], ['nei','teeng','om hi']),
    'la':      ('take / and then (sequential particle)', 'v/particle', [], [], ['lak','la-in']),
    'ta':      ('change of state / now (inchoative)', 'particle', [], [], ['khin','pah','om ta']),
    'mi':      ('person / people', 'n', [], [], ['mipa','numei','mihing','mite']),
    'te':      ('plural suffix', 'particle', [], [], ['uh','khempeuh','mite']),
    'an':      ('food / rice / grain', 'n', [], [], ['sa','tui','an ne']),
    'un':      ('imperative plural marker (you all, do!)', 'particle', [], [], ['in','hen','ni']),
    'aw':      ('vocative particle (O! / hey! / address)', 'particle', [], [], []),
    'ni':      ('day / hortative let us / ordinal marker', 'n/particle', [], [], ['zan','hun','ni khat']),
    'tu':      ('now / this (temporal/demonstrative)', 'adv/dem', [], [], ['hih','tua','tu ni']),
    'pa':      ('father', 'n', ['nu'], [], ['nu','tapa','innkuan','ka pa']),
    'nu':      ('mother', 'n', ['pa'], [], ['pa','tanu','innkuan','ka nu']),
    'mu':      ('see / look / observe', 'v', [], [], ['en','theih','mu hi']),
    'si':      ('die / death', 'v/n', ['nungta'], [], ['sihna','thah','nungta','si hi']),
    'zo':      ('finish / overcome / complete / accomplished', 'v', [], [], ['kiman','zawh','kip','a zo hi']),
    'uk':      ('rule / govern / lead / reign', 'v', [], [], ['ukna','kumpipa','ulian','uk hi']),
    'sa':      ('meat / flesh / body / animal', 'n', [], [], ['pumpi','an','tui','ganhing']),
    'ne':      ('eat', 'v', [], [], ['dawn','an ne','ne hi']),
    'zi':      ('wife', 'n', ['pasal'], [], ['pasal','innkuan','tenu','ka zi']),
    'va':      ('directional away from speaker', 'particle', ['hong'], [], ['hong','khia','va pai']),
    'en':      ('look / behold / see (imperative)', 'v', [], [], ['mu','en un','en in']),
    'za':      ('hundred', 'num', [], [], ['sing','sawm','khat','za khat']),
    'keima':   ('I / me (emphatic 1st singular)', 'pron', [], [], ['kei','ka','keimah']),
    'nangma':  ('you / yourself (emphatic 2nd singular)', 'pron', [], [], ['nang','na','nangmah']),
    'mipa':    ('man / male person', 'n', ['numei'], [], ['numei','mihing','pasal']),
    'sunga':   ('inside / within (locative)', 'postp', [], [], ['sungah','laizangah','ah']),
    'bangmah': ('anything / nothing (in negation)', 'pron', [], [], ['bang','kuamah','bangmah nei het lo']),
    'sangin':  ('than (comparative marker)', 'postp', [], [], ['zaw','lian zaw','sangin...zaw']),
    'tuate':   ('those / they (demonstrative plural)', 'pron', [], [], ['amaute','hihte','tua']),
    'tapate':  ('sons / children (plural of tapa)', 'n', [], [], ['tapa','tanu','naupang']),
    'la':      ('take / and (sequential)', 'v/particle', [], [], ['lak','la-in','pai un la']),
    'dingun':  ('in order that / so that (purpose)', 'conj', [], [], ['nadingin','dingin','ading']),
    'gamah':   ('in the land / country (locative form)', 'postp', [], [], ['gam','ah','gam sungah']),
}

# ── Load sources ──────────────────────────────────────────────────────────────

print("Loading existing dict_semantic...")
semantic = {}
with open(DATA / "dictionary/processed/dict_semantic_v1.jsonl") as f:
    for line in f:
        d = json.loads(line)
        zo = d.get('zolai','').strip().lower()
        if zo:
            semantic[zo] = d

print(f"  {len(semantic):,} semantic entries")

print("Loading master_source translations...")
translations = {}
with open(DATA / "master_source_v1.jsonl") as f:
    for line in f:
        d = json.loads(line)
        if d.get('type') not in ('dictionary','wordlist'): continue
        zo = d.get('zolai','').strip().lower()
        en = d.get('english','').strip()
        if zo and en and zo not in translations:
            translations[zo] = en

print(f"  {len(translations):,} translations")

print("Loading Bible corpus for frequency + examples...")
word_freq = Counter()
word_contexts = defaultdict(list)

for fpath in [
    DATA / "parallel/bible_parallel_tdb77_kjv.jsonl",
    DATA / "parallel/bible_parallel_tedim2010_kjv.jsonl",
]:
    with open(fpath) as f:
        for line in f:
            d = json.loads(line)
            en = d.get('input','').strip()
            zo = d.get('output','').strip()
            if not en or not zo: continue
            words = re.findall(r'\b[a-z]{2,}\b', zo.lower())
            for w in set(words):
                word_freq[w] += 1
                if len(word_contexts[w]) < 4 and len(zo) < 100 and len(en) < 100:
                    word_contexts[w].append({'zo': zo, 'en': en})

print(f"  {len(word_freq):,} unique words, {sum(word_freq.values()):,} tokens")

# ── Build entries ─────────────────────────────────────────────────────────────

print("Building dictionary entries...")
entries = {}  # zolai -> entry

def make_entry(zo, en, pos='', synonyms=None, antonyms=None, related=None,
               variants=None, examples=None, source='corpus', category=''):
    freq = word_freq.get(zo.lower(), 0)
    ctxs = word_contexts.get(zo.lower(), [])
    all_examples = list(examples or []) + [c for c in ctxs if c not in (examples or [])]
    return {
        "zolai":       zo,
        "english":     en,
        "english_alt": [],
        "pos":         pos,
        "frequency":   freq,
        "synonyms":    synonyms or [],
        "antonyms":    antonyms or [],
        "related":     related or [],
        "variants":    variants or [],
        "examples":    all_examples[:4],
        "reverse":     en,
        "source":      source,
        "dialect":     "Tedim",
        "category":    category or pos,
    }

# 1. Grammar particles
for zo, (en, pos, ant, syn, rel) in GRAMMAR.items():
    entries[zo] = make_entry(zo, en, pos, syn, ant, rel, source='grammar_verified', category='grammar')

# 2. Existing semantic entries (richest — has synonyms/antonyms/related/examples)
for zo, d in semantic.items():
    if zo in entries: continue  # grammar takes priority
    en = d.get('english','').strip()
    if not en: continue
    freq = word_freq.get(zo, 0)
    ctxs = word_contexts.get(zo, [])
    existing_examples = d.get('examples', [])
    # Normalize examples
    norm_examples = []
    for ex in existing_examples:
        if isinstance(ex, dict) and ex.get('zo'):
            norm_examples.append({'zo': ex['zo'], 'en': ex.get('en','')})
    all_examples = norm_examples + [c for c in ctxs if c not in norm_examples]
    
    entries[zo] = {
        "zolai":       zo,
        "english":     en,
        "english_alt": [],
        "pos":         d.get('pos',''),
        "frequency":   freq,
        "synonyms":    [s for s in d.get('synonyms',[]) if s],
        "antonyms":    [a for a in d.get('antonyms',[]) if a],
        "related":     [r for r in d.get('related',[]) if r][:8],
        "variants":    [v for v in d.get('variants',[]) if v][:5],
        "examples":    all_examples[:4],
        "reverse":     en,
        "source":      "dict_semantic",
        "dialect":     d.get('dialect','Tedim'),
        "category":    d.get('category',''),
    }

# 3. All other translations from master_source
for zo, en in translations.items():
    if zo in entries: continue
    entries[zo] = make_entry(zo, en, source='master_source')

# 4. High-frequency words without translation — add from corpus context
# (words appearing 50+ times with no translation yet)
for w, freq in word_freq.most_common():
    if freq < 10: break
    if w in entries: continue
    # Try to infer from context (skip proper nouns and particles)
    if len(w) <= 1: continue
    entries[w] = make_entry(w, f"[untranslated — freq:{freq}]", source='corpus_only')

print(f"Total entries: {len(entries):,}")

# ── Write output ──────────────────────────────────────────────────────────────
print(f"Writing to {OUT}...")
written = 0
with open(OUT, 'w') as f:
    # Sort by frequency (most common first)
    for zo, entry in sorted(entries.items(), key=lambda x: -x[1]['frequency']):
        f.write(json.dumps(entry, ensure_ascii=False) + '\n')
        written += 1

print(f"Written: {written:,} entries")

# ── Stats ─────────────────────────────────────────────────────────────────────
has_synonyms = sum(1 for e in entries.values() if e['synonyms'])
has_antonyms = sum(1 for e in entries.values() if e['antonyms'])
has_examples = sum(1 for e in entries.values() if e['examples'])
has_related  = sum(1 for e in entries.values() if e['related'])
has_translation = sum(1 for e in entries.values() if not e['english'].startswith('[untranslated'))

print(f"\nCoverage:")
print(f"  With translation:  {has_translation:,} ({has_translation/written*100:.1f}%)")
print(f"  With synonyms:     {has_synonyms:,}")
print(f"  With antonyms:     {has_antonyms:,}")
print(f"  With examples:     {has_examples:,}")
print(f"  With related:      {has_related:,}")

import subprocess
sz = subprocess.check_output(['du','-sh', str(OUT)]).decode().split()[0]
print(f"  File size: {sz}")

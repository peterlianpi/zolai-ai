#!/usr/bin/env python3
"""
Full DB seeder for Zolai Next.js project.
Seeds: bible_verse, vocab_word, wiki_entry, lesson_plan/unit/lesson,
       post, menu/menu_item, taxonomy/term

Usage: python3.12 scripts/seed-all.py [--dry-run] [--only TABLE]
"""
from __future__ import annotations
import argparse, json, os, re, sys
from pathlib import Path
from datetime import datetime, timezone
import hashlib

def cuid(s: str) -> str:
    """Deterministic cuid-like id from string."""
    return "c" + hashlib.md5(s.encode()).hexdigest()[:24]

ROOT_PROJ = Path(__file__).parent.parent          # website/zolai-project
ROOT_DATA = ROOT_PROJ.parent.parent               # zolai root
WIKI_DIR  = ROOT_DATA / "wiki"

DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_lyYq04pvzNTn@ep-little-butterfly-a1p8qakt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
)

NOW = datetime.now(timezone.utc)
OT  = {"GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA","1KI","2KI",
       "1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO","ECC","SNG","ISA","JER",
       "LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON","MIC","NAH","HAB","ZEP",
       "HAG","ZEC","MAL"}


def bulk_insert(cur, table: str, cols: list[str], rows: list[list], conflict: str = "DO NOTHING") -> int:
    if not rows:
        return 0
    batch = 500
    total = 0
    col_str = ",".join(f'"{c}"' for c in cols)
    for i in range(0, len(rows), batch):
        chunk = rows[i:i+batch]
        placeholders = ",".join(f"({','.join(['%s']*len(cols))})" for _ in chunk)
        flat = [v for row in chunk for v in row]
        cur.execute(f'INSERT INTO {table} ({col_str}) VALUES {placeholders}', flat)
        total += len(chunk)
        sys.stdout.write(f"\r  {table}: {min(i+batch, len(rows)):,}/{len(rows):,}"); sys.stdout.flush()
    print()
    return total


# ── Bible ─────────────────────────────────────────────────────────────────────
def seed_bible(cur) -> int:
    sources = {
        "tdb77":     ROOT_DATA / "data/master/sources/bible_tb77_online.jsonl",
        "tbr17":     ROOT_DATA / "data/master/sources/bible_tbr17.jsonl",
        "tedim2010": ROOT_DATA / "data/master/sources/bible_tedim2010.jsonl",
    }
    kjv: dict[str, str] = {}
    with (ROOT_DATA / "data/master/combined/parallel.jsonl").open() as f:
        for line in f:
            obj = json.loads(line)
            ref, en = obj.get("reference",""), obj.get("english","")
            if ref and en and ref not in kjv:
                kjv[ref] = en

    verses: dict[str, list] = {}
    for col, path in sources.items():
        if not path.exists(): continue
        with path.open() as f:
            for line in f:
                obj = json.loads(line)
                ref, text = obj.get("reference",""), obj.get("text","").strip()
                if not ref or not text: continue
                if ref not in verses:
                    try:
                        book, cv = ref.split(".", 1); ch, v = cv.split(":")
                        verses[ref] = [ref.replace(".","_").replace(":","_"), book,
                                       int(ch), int(v), "OT" if book in OT else "NT",
                                       None, None, None, None]
                    except Exception: continue
                idx = {"tdb77":5,"tbr17":6,"tedim2010":7}[col]
                verses[ref][idx] = text

    for ref, row in verses.items():
        row[8] = kjv.get(ref)

    cur.execute("DELETE FROM bible_verse")
    cols = ["id","book","chapter","verse","testament","tdb77","tbr17","tedim2010","kjv"]
    return bulk_insert(cur, "bible_verse", cols, list(verses.values()), "(id) DO NOTHING")


# ── Vocab ─────────────────────────────────────────────────────────────────────
def seed_vocab(cur) -> int:
    path = ROOT_DATA / "data/processed/master_dictionary_semantic.jsonl"
    rows = []
    with path.open() as f:
        for i, line in enumerate(f):
            obj = json.loads(line)
            zo, en = (obj.get("zolai") or "").strip(), (obj.get("english") or "").strip()
            if not zo or not en: continue
            rows.append([
                f"v_{i}", zo, en,
                obj.get("pos",""), obj.get("category",""),
                obj.get("explanation",""), "", obj.get("usage_notes",""),
                obj.get("synonyms",[]), obj.get("antonyms",[]),
                obj.get("related",[]), obj.get("variants",[]),
                json.dumps(obj.get("examples",[])),
                obj.get("accuracy","unverified"), [],
            ])
    cur.execute("DELETE FROM vocab_word")
    cols = ["id","zolai","english","pos","category","definition","example","explanation",
            "synonyms","antonyms","related","variants","examples","accuracy","tags"]
    return bulk_insert(cur, "vocab_word", cols, rows, "(id) DO NOTHING")


# ── Wiki ──────────────────────────────────────────────────────────────────────
def seed_wiki(cur) -> int:
    rows = []
    seen_slugs: set[str] = set()
    for md_file in sorted(WIKI_DIR.rglob("*.md")):
        category = md_file.parent.name if md_file.parent != WIKI_DIR else "general"
        content  = md_file.read_text(encoding="utf-8").strip()
        if not content or len(content) < 50: continue
        # Extract title from first # heading or filename
        m = re.search(r'^#\s+(.+)', content, re.M)
        title = m.group(1).strip() if m else md_file.stem.replace("_"," ").title()
        slug_base = re.sub(r'[^a-z0-9]+', '-', (category + "-" + md_file.stem).lower()).strip("-")
        slug = slug_base
        n = 1
        while slug in seen_slugs:
            slug = f"{slug_base}-{n}"; n += 1
        seen_slugs.add(slug)
        tags = re.findall(r'^#{1,3}\s+(.+)', content, re.M)[:5]
        rows.append([cuid(slug), slug, title, category, content, "published", tags, NOW, NOW])

    cur.execute("DELETE FROM wiki_entry")
    cols = ["id","slug","title","category","content","status","tags","createdAt","updatedAt"]
    return bulk_insert(cur, "wiki_entry", cols, rows, "(slug) DO NOTHING")


# ── Lessons ───────────────────────────────────────────────────────────────────
def seed_lessons(cur) -> int:
    plans = [
        ("a1-beginner",      "A1 — Beginner",           "Core identity, greetings, numbers, simple SOV sentences.", "A1", 1),
        ("a2-elementary",    "A2 — Elementary",          "Past/future tense, narrative sequence, day-counting.", "A2", 2),
        ("b1-intermediate",  "B1 — Intermediate",        "Cause/effect, interrogatives, quotatives, directional particles.", "B1", 3),
        ("b2-upper-int",     "B2 — Upper Intermediate",  "Conditionals, comparatives, embedded clauses, formal register.", "B2", 4),
        ("c1-advanced",      "C1 — Advanced",            "I Am metaphors, rhetorical questions, complex connectors.", "C1", 5),
        ("c2-mastery",       "C2 — Mastery",             "Poetic parallelism, archaic forms, full discourse analysis.", "C2", 6),
    ]
    units_data = {
        "a1-beginner": [
            ("Greetings & Identity", "Say hello, introduce yourself.", 1, 20,
             [("Basic Greetings","VOCABULARY",1,5,'{"intro":"Na dam na? means Are you well?","sentences":[{"zo":"Na dam na?","en":"How are you?"},{"zo":"Ka dam hi","en":"I am well"}]}'),
              ("Numbers 1-10","VOCABULARY",2,5,'{"intro":"Zolai numbers 1-10","sentences":[{"zo":"khat","en":"one"},{"zo":"nii","en":"two"},{"zo":"thum","en":"three"}]}')]),
            ("Simple Sentences", "Build basic SOV sentences.", 2, 20,
             [("SOV Structure","GRAMMAR",1,5,'{"intro":"Zolai uses Subject-Object-Verb order","sentences":[{"zo":"Ka an ka ne hi","en":"I eat food"},{"zo":"Amah in laibu a sim hi","en":"He reads a book"}]}')]),
        ],
        "b1-intermediate": [
            ("Cause & Effect", "Use ahih manin and connectors.", 1, 30,
             [("Ahih manin","GRAMMAR",1,10,'{"intro":"ahih manin = because/therefore","sentences":[{"zo":"A dam kei ahih manin inn ah a om hi","en":"Because he is not well, he stays home"}]}')]),
        ],
    }

    cur.execute("DELETE FROM lesson"); cur.execute("DELETE FROM lesson_unit"); cur.execute("DELETE FROM lesson_plan")

    plan_rows = [[f"plan_{s}", s, t, d, l, o, True, NOW, NOW] for s,t,d,l,o in plans]
    bulk_insert(cur, "lesson_plan",
                ["id","slug","title","description","level","order","isActive","createdAt","updatedAt"],
                plan_rows, "DO NOTHING")

    unit_rows, lesson_rows = [], []
    for slug, _, _, _, plan_order in plans:
        plan_id = f"plan_{slug}"
        for u_title, u_desc, u_order, u_xp, lessons in units_data.get(slug, []):
            uid = f"unit_{plan_id}_{u_order}"
            unit_rows.append([uid, plan_id, u_title, u_desc, u_order, u_xp])
            for l_title, l_type, l_order, l_xp, l_content in lessons:
                lid = f"lesson_{uid}_{l_order}"
                lesson_rows.append([lid, uid, l_title, l_type, l_content, l_xp, l_order])

    bulk_insert(cur, "lesson_unit", ["id","planId","title","description","order","xpReward"], unit_rows, "DO NOTHING")
    bulk_insert(cur, "lesson", ["id","unitId","title","type","content","xpReward","order"], lesson_rows, "DO NOTHING")
    return len(plan_rows)


# ── Posts ─────────────────────────────────────────────────────────────────────
def seed_posts(cur) -> int:
    posts = [
        ("about-zolai", "About Zolai Language", "PAGE",
         "<h1>About Zolai</h1><p>Zolai (Tedim Chin) is a Tibeto-Burman language spoken by the Zomi people of Myanmar and India. This platform preserves and teaches the language using AI.</p>"),
        ("grammar-guide", "Zolai Grammar Guide", "PAGE",
         "<h1>Grammar Guide</h1><p>Zolai uses SOV (Subject-Object-Verb) word order. The ergative marker 'in' marks transitive subjects.</p>"),
        ("welcome", "Welcome to Zolai AI", "POST",
         "<h1>Welcome</h1><p>Learn Tedim Zolai with AI-powered lessons, a 24,891-word dictionary, and the full Bible corpus in 4 parallel versions.</p>"),
    ]
    cur.execute("DELETE FROM post")
    rows = [[cuid(f"post_{s}"), t, "PUBLISHED", s, title, "", html, html, 0, NOW, NOW, NOW, "admin_zolai_001"]
            for s, title, t, html in posts]
    return bulk_insert(cur, "post",
                       ["id","type","status","slug","title","excerpt","contentHtml","contentRaw","menuOrder","publishedAt","modifiedAt","createdAt","authorId"],
                       rows, "DO NOTHING")


# ── Menus ─────────────────────────────────────────────────────────────────────
def seed_menus(cur) -> int:
    cur.execute("DELETE FROM menu_item"); cur.execute("DELETE FROM menu")
    menus = [
        ("main-nav", "Main Navigation", "primary"),
        ("footer",   "Footer",          "footer"),
    ]
    menu_rows = [[f"menu_{s}", s, n, loc, "", NOW, NOW] for s,n,loc in menus]
    bulk_insert(cur, "menu", ["id","name","slug","location","description","createdAt","updatedAt"],
                menu_rows, "DO NOTHING")

    items = [
        ("menu_main-nav", "Home",       "/",           1),
        ("menu_main-nav", "Dictionary", "/dictionary", 2),
        ("menu_main-nav", "Bible",      "/bible",      3),
        ("menu_main-nav", "Wiki",       "/wiki",       4),
        ("menu_main-nav", "Lessons",    "/lessons",    5),
        ("menu_main-nav", "Chat",       "/chat",       6),
        ("menu_footer",   "About",      "/about-zolai",1),
        ("menu_footer",   "Grammar",    "/grammar-guide",2),
    ]
    item_rows = [[f"item_{mid}_{o}", mid, None, lbl, url, None, "_self", "", o, NOW, NOW]
                 for mid, lbl, url, o in items]
    return bulk_insert(cur, "menu_item",
                       ["id","menuId","parentId","label","url","postId","target","classes","order","createdAt","updatedAt"],
                       item_rows, "DO NOTHING")


# ── Taxonomies ────────────────────────────────────────────────────────────────
def seed_taxonomies(cur) -> int:
    cur.execute("DELETE FROM term"); cur.execute("DELETE FROM taxonomy")
    taxos = [("category","Category"), ("tag","Tag"), ("cefr-level","CEFR Level"), ("domain","Domain")]
    tax_rows = [[f"tax_{s}", s, n] for s,n in taxos]
    bulk_insert(cur, "taxonomy", ["id","slug","name"], tax_rows, "DO NOTHING")

    terms = [
        ("tax_category", "grammar","Grammar"), ("tax_category","vocabulary","Vocabulary"),
        ("tax_category","culture","Culture"),  ("tax_category","bible","Bible"),
        ("tax_cefr-level","a1","A1"),("tax_cefr-level","a2","A2"),
        ("tax_cefr-level","b1","B1"),("tax_cefr-level","b2","B2"),
        ("tax_cefr-level","c1","C1"),("tax_cefr-level","c2","C2"),
        ("tax_domain","religion","Religion"),("tax_domain","daily","Daily Life"),
        ("tax_domain","education","Education"),("tax_domain","culture","Culture"),
    ]
    term_rows = [[f"term_{tid}_{s}", tid, s, n, "", None, 0] for tid,s,n in terms]
    return bulk_insert(cur, "term",
                       ["id","taxonomyId","slug","name","description","parentTermId","count"],
                       term_rows, "DO NOTHING")


# ── Main ──────────────────────────────────────────────────────────────────────
# ── Learning Resources ────────────────────────────────────────────────────────
def seed_resources(cur) -> int:
    ADMIN = "admin_zolai_001"
    resources = [
        ("grammar-sov",       "SOV Sentence Structure",        "GRAMMAR",    "BEGINNER",
         "Zolai uses Subject-Object-Verb order. Example: Ka an ka ne hi (I food eat = I eat food)."),
        ("grammar-tense",     "Tense Markers",                 "GRAMMAR",    "BEGINNER",
         "hi=present, ta/khin=past, ding=future, ngei=perfect. Place after verb: A pai hi (he goes), A pai ta (he went)."),
        ("grammar-ergative",  "Ergative Marker 'in'",          "GRAMMAR",    "ELEMENTARY",
         "Transitive subjects take 'in': Amah in laibu a sim hi (He reads a book). Intransitive subjects don't."),
        ("vocab-greetings",   "Essential Greetings",           "VOCABULARY", "BEGINNER",
         "Na dam na? (How are you?), Ka dam hi (I am well), Zingsang (morning), Zansung (evening)."),
        ("vocab-numbers",     "Numbers 1-10",                  "VOCABULARY", "BEGINNER",
         "khat(1), nii(2), thum(3), li(4), nga(5), guk(6), sagih(7), giat(8), kua(9), sawm(10)."),
        ("grammar-negation",  "Negation: kei vs lo",           "GRAMMAR",    "ELEMENTARY",
         "lo = general negation (A pai lo hi = He doesn't go). kei = future/conditional negation (A pai kei hi = He won't go)."),
        ("grammar-questions", "Question Formation",            "GRAMMAR",    "INTERMEDIATE",
         "Yes/no: add 'na' at end. Wh-questions: bang(what), tu(who), bangzah(how many), banghangin(why)."),
        ("vocab-bible",       "Biblical Vocabulary",           "VOCABULARY", "INTERMEDIATE",
         "pasian(God), Zeisu(Jesus), Kha(Spirit), gam(land/country), topa(Lord), kumpipa(king)."),
        ("grammar-particles", "Directional Particles",         "GRAMMAR",    "UPPER_INTERMEDIATE",
         "hong(toward speaker), va(away), khia(out), lut(in), kik(back). Add after verb: Hong pai(come here), Va pai(go away)."),
        ("grammar-conditionals","Conditional Patterns",        "GRAMMAR",    "UPPER_INTERMEDIATE",
         "Positive: ...leh (if/when). Negative: nong...kei a leh / nong...kei leh. NEVER use lo leh."),
    ]
    cur.execute("DELETE FROM learning_resource")
    rows = [[cuid(f"res_{s}"), s, t, "", content, rt, dl, "PUBLISHED", "en", "zo",
             "grammar" if rt=="GRAMMAR" else "vocabulary", [], NOW, NOW, NOW, ADMIN]
            for s, t, rt, dl, content in resources]
    return bulk_insert(cur, "learning_resource",
        ["id","slug","title","description","content","resourceType","difficultyLevel",
         "status","locale","zolaiLocale","category","tags","createdAt","updatedAt","publishedAt","authorId"],
        rows, "DO NOTHING")


# ── SEO Settings ──────────────────────────────────────────────────────────────
def seed_seo(cur) -> int:
    settings = [
        ("site_title",       "Zolai AI — Tedim Chin Language Platform"),
        ("site_description", "Learn Tedim Zolai with AI-powered lessons, 24,891-word dictionary, and full Bible corpus."),
        ("og_image",         "/og-image.png"),
        ("twitter_handle",   "@zolai_ai"),
        ("robots_txt",       "User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/"),
        ("canonical_base",   "https://zolai.peterlianpi.site"),
    ]
    cur.execute("DELETE FROM seo_setting")
    rows = [[cuid(f"seo_{k}"), k, v, "", NOW, NOW] for k, v in settings]
    return bulk_insert(cur, "seo_setting",
        ["id","key","value","description","createdAt","updatedAt"], rows, "DO NOTHING")


# ── Page Templates ────────────────────────────────────────────────────────────
def seed_page_templates(cur) -> int:
    templates = [
        ("default",    "Default Page",    "<main>{{content}}</main>"),
        ("full-width", "Full Width",      "<main class='w-full'>{{content}}</main>"),
        ("sidebar",    "With Sidebar",    "<div class='flex'><aside>{{sidebar}}</aside><main>{{content}}</main></div>"),
    ]
    cur.execute("DELETE FROM page_template")
    rows = [[cuid(f"tpl_{s}"), n, s, "", t, "", "{}", False, NOW, NOW] for s, n, t in templates]
    return bulk_insert(cur, "page_template",
        ["id","name","slug","description","htmlTemplate","cssTemplate","slots","featured","createdAt","updatedAt"],
        rows, "DO NOTHING")


# ── Forms ─────────────────────────────────────────────────────────────────────
def seed_forms(cur) -> int:
    forms = [
        ("contact",  "Contact Us",
         [{"name":"name","label":"Name","type":"text","required":True},
          {"name":"email","label":"Email","type":"email","required":True},
          {"name":"message","label":"Message","type":"textarea","required":True}]),
        ("feedback", "Language Feedback",
         [{"name":"word","label":"Zolai Word","type":"text","required":True},
          {"name":"correction","label":"Correction","type":"text","required":True},
          {"name":"notes","label":"Notes","type":"textarea","required":False}]),
    ]
    cur.execute("DELETE FROM form")
    rows = [[cuid(f"form_{s}"), n, s, "", json.dumps(fields), "{}", True, True, None, False, None, None, "Thank you!", 0, NOW, NOW]
            for s, n, fields in forms]
    return bulk_insert(cur, "form",
        ["id","name","slug","description","fields","settings","isActive","honeypot",
         "notifyEmail","autoReply","autoReplySubject","autoReplyBody","successMessage","submitCount","createdAt","updatedAt"],
        rows)


# ── Dataset Stats (update with real counts) ───────────────────────────────────
def seed_dataset_stats(cur) -> int:
    stats = [
        ("sentences",    2825989, 5000000, "records"),
        ("parallel",     105511,  200000,  "pairs"),
        ("vocab",        24891,   30000,   "words"),
        ("bible_verses", 31069,   31102,   "verses"),
        ("wiki_entries", 94,      200,     "articles"),
        ("cefr_tagged",  403474,  500000,  "records"),
    ]
    cur.execute("DELETE FROM dataset_stat")
    rows = [[cuid(f"stat_{l}"), l, v, t, u, NOW] for l, v, t, u in stats]
    return bulk_insert(cur, "dataset_stat",
        ["id","label","value","target","unit","updatedAt"], rows, "DO NOTHING")


# ── Post Terms (link posts to taxonomy terms) ─────────────────────────────────
def seed_post_terms(cur) -> int:
    # Link posts to terms
    mappings = [
        (cuid("post_about-zolai"),  "term_tax_category_grammar"),
        (cuid("post_grammar-guide"),"term_tax_category_grammar"),
        (cuid("post_welcome"),      "term_tax_category_culture"),
    ]
    cur.execute("DELETE FROM post_term")
    rows = [[pid, tid] for pid, tid in mappings]
    # Verify posts and terms exist
    cur.execute("SELECT id FROM post")
    post_ids = {r[0] for r in cur.fetchall()}
    cur.execute("SELECT id FROM term")
    term_ids = {r[0] for r in cur.fetchall()}
    valid = [[pid, tid] for pid, tid in rows if pid in post_ids and tid in term_ids]
    if not valid:
        return 0
    # post_term has no unique constraint — use plain INSERT
    cur.execute("DELETE FROM post_term")
    col_str = '"postId","termId"'
    placeholders = ",".join("(%s,%s)" for _ in valid)
    flat = [v for row in valid for v in row]
    cur.execute(f'INSERT INTO post_term ({col_str}) VALUES {placeholders}', flat)
    return len(valid)


SEEDERS = {
    "bible":          seed_bible,
    "vocab":        seed_vocab,
    "wiki":         seed_wiki,
    "lessons":      seed_lessons,
    "posts":        seed_posts,
    "menus":        seed_menus,
    "taxonomies":   seed_taxonomies,
    "resources":    seed_resources,
    "seo":          seed_seo,
    "forms":        seed_forms,
    "page_templates": seed_page_templates,
    "dataset_stats":  seed_dataset_stats,
    "post_terms":     seed_post_terms,
}

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--only", help="Comma-separated table names to seed")
    args = ap.parse_args()

    targets = [x.strip() for x in args.only.split(",")] if args.only else list(SEEDERS.keys())
    invalid = [t for t in targets if t not in SEEDERS]
    if invalid:
        print(f"Unknown targets: {invalid}. Valid: {list(SEEDERS.keys())}"); return 1

    try:
        import psycopg2
    except ImportError:
        print("pip install psycopg2-binary"); return 1

    if args.dry_run:
        print("[DRY RUN] Would seed:", targets); return 0

    conn = psycopg2.connect(DB_URL)
    cur  = conn.cursor()
    print(f"Connected. Seeding: {targets}\n")

    for name in targets:
        print(f"=== {name} ===")
        try:
            n = SEEDERS[name](cur)
            conn.commit()
            print(f"  ✓ {name}: {n} rows\n")
        except Exception as e:
            conn.rollback()
            import traceback
            traceback.print_exc()
            print(f"  ✗ {name} FAILED: {e}\n", file=sys.stderr)

    conn.close()
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

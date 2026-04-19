#!/usr/bin/env python3
"""Zolai project interactive menu — run from project root."""
from __future__ import annotations
import subprocess, sys
from pathlib import Path

ROOT = Path(__file__).parent

MENU = {
    "Bible": [
        ("Fetch TDB online (368)",        "python scripts/fetch_bible_online.py --version-id 368 --abbrev TDB --out bible_tdb_online.jsonl --source-name TDB_online"),
        ("Fetch TB77 online (3561)",       "python scripts/fetch_bible_online.py --version-id 3561 --abbrev TB77 --out bible_tb77_online.jsonl --source-name TB77_online"),
        ("Fetch TBR17 full",               "python scripts/fetch_tbr17_full.py"),
        ("Build Tedim2010 from Parallel/", "python scripts/build_tedim2010_bible.py"),
        ("Rebuild parallel.jsonl (all 4)", "python scripts/rebuild_bible_parallel.py"),
        ("Build parallel .md files",       "python scripts/build_parallel_bible.py"),
        ("Fix Bible data/refs",            "python scripts/fix_bible_data.py"),
    ],
    "Data Pipeline": [
        ("Combine & categorize all JSONL", "python scripts/combine_and_categorize.py"),
        ("Deep clean sentences",           "python scripts/deep_clean.py"),
        ("Cleanup combined",               "python scripts/cleanup_combined.py"),
        ("Doublecheck master",             "python scripts/doublecheck_master.py"),
        ("Tag CEFR levels (v11)",          "python scripts/tag_cefr_levels.py -i data/master/sources/zolai_full_training_v11.jsonl -o data/master/sources/zolai_full_training_v11_cefr.jsonl"),
        ("Build Tedim train dataset",      "python scripts/build_tedim_train_dataset.py"),
        ("Rebuild parallel dataset",       "python scripts/rebuild_parallel_dataset.py"),
    ],
    "Dictionary": [
        ("Fetch TongDot dictionary",       "python scripts/crawlers/fetch_tongdot_dictionary.py --input data/dictionary/raw/wordlist_zo_en.jsonl --output data/dictionary/raw/tongdot_dictionary.jsonl"),
        ("Build enriched dictionary",      "python scripts/build_enriched_dictionary.py"),
        ("Build semantic dictionary",      "python scripts/build_semantic_dictionary.py"),
        ("Build dictionary DB (SQLite)",   "python scripts/build_dictionary_db.py"),
        ("Search dictionary",              "python scripts/search_dictionary.py"),
    ],
    "Crawlers": [
        ("Crawl RVAsia Tedim",             "python scripts/fetch_rvasia_tedim.py"),
        ("Crawl all news",                 "python scripts/crawlers/crawl_all_news.py"),
        ("Crawl Tongsan",                  "python scripts/crawlers/crawl_tongsan.py"),
        ("Scrape Tedim hymns",             "python scripts/crawlers/tedim_hymn_scraper.py"),
    ],
    "Quality & Audit": [
        ("Test grammar rules",             "python scripts/test_grammar_rules.py"),
        ("Audit sentences (wiki)",         "python scripts/audit_sentences_wiki.py"),
        ("Fix Bible violations",           "python scripts/fix_bible_violations.py"),
        ("Fix dialect (sentences)",        "python scripts/fix_sentences_dialect.py"),
        ("Audit JSONL (TDB)",              "zolai audit-jsonl -i data/master/sources/bible_tdb_online.jsonl"),
    ],
    "Website": [
        ("Seed DB (bible + vocab)",         "python3.12 website/zolai-project/scripts/seed-db.py"),
        ("Seed DB (bible only)",             "python3.12 website/zolai-project/scripts/seed-db.py --bible"),
        ("Seed DB (vocab only)",             "python3.12 website/zolai-project/scripts/seed-db.py --vocab"),
        ("Run dev server",                   "cd website/zolai-project && bun dev"),
        ("Prisma migrate",                   "cd website/zolai-project && bunx prisma migrate dev"),
    ],
    "Synthesis": [
        ("Synthesize instructions v6",     "python scripts/synthesize_instructions_v6.py"),
        ("Synthesize instructions bulk",   "python scripts/synthesize_instructions_bulk.py"),
    ],
}

def run(cmd: str) -> None:
    print(f"\n$ {cmd}\n")
    subprocess.run(cmd, shell=True, cwd=ROOT)

def main() -> None:
    categories = list(MENU.keys())
    while True:
        print("\n" + "="*50)
        print("  ZOLAI PROJECT MENU")
        print("="*50)
        for i, cat in enumerate(categories, 1):
            print(f"  {i}. {cat}")
        print("  0. Exit")
        choice = input("\nCategory: ").strip()
        if choice == "0":
            break
        try:
            cat = categories[int(choice) - 1]
        except (ValueError, IndexError):
            print("Invalid choice.")
            continue

        items = MENU[cat]
        print(f"\n--- {cat} ---")
        for i, (name, _) in enumerate(items, 1):
            print(f"  {i}. {name}")
        print("  0. Back")
        sub = input("\nCommand: ").strip()
        if sub == "0":
            continue
        try:
            _, cmd = items[int(sub) - 1]
            run(cmd)
        except (ValueError, IndexError):
            print("Invalid choice.")

if __name__ == "__main__":
    main()

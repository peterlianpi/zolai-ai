"""Fix rule-based violations in Bible source JSONL files.

Fixes applied:
  1. plural_violation: remove 'uh' when subject is 'i' (inclusive we)
  2. conditional_negation: replace 'lo leh' → 'kei leh'

Usage:
  python scripts/fix_bible_violations.py [--dry-run]
"""
from __future__ import annotations

import json
import re
from pathlib import Path

DATA = Path("data/master/sources")
FILES = ["bible_tb77_online.jsonl", "bible_tbr17.jsonl", "bible_tdb_online.jsonl"]

# lo leh → kei leh (conditional negation)
COND_NEG = re.compile(r'\blo\s+leh\b', re.I)

# i <verb> uh → i <verb>  (plural violation: drop uh after inclusive i)
# Pattern: 'i' followed by 1-3 words then 'uh'
PLURAL_VIO = re.compile(r'\b(i\s+(?:\w+\s+){0,3}?)uh\b', re.I)


def fix_text(text: str) -> tuple[str, list[str]]:
    changes = []

    # Fix conditional negation: 'lo leh' → 'kei leh'
    # But NOT 'lo-in' or 'lo a' (those are valid negation, not conditional)
    if COND_NEG.search(text):
        text = COND_NEG.sub('kei leh', text)
        changes.append('lo leh → kei leh')

    # Fix plural violation: 'I <verb> uh' → 'I <verb>'
    # Only when 'I' is the inclusive first-person subject (sentence start or after punctuation/quote)
    # Pattern: sentence-boundary + 'I' + 1-4 words + 'uh'
    def _fix_plural(m: re.Match) -> str:
        changes.append('removed uh after i (plural violation)')
        return m.group(1).rstrip()

    text = re.sub(
        r'(?:(?:^|(?<=[.;,!?""\n]))\s*)(I\s+(?:\w[\w\']*\s+){1,4})uh\b',
        _fix_plural,
        text,
        flags=re.MULTILINE,
    )

    return text, changes


def main(argv: list[str] | None = None) -> int:
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args(argv)

    total_fixed = 0

    for fname in FILES:
        path = DATA / fname
        tmp = path.with_suffix('.tmp')
        fixed = 0

        with open(path, encoding='utf-8') as fin, open(tmp, 'w', encoding='utf-8') as fout:
            for line in fin:
                r = json.loads(line)
                new_text, changes = fix_text(r['text'])
                if changes:
                    fixed += 1
                    if not args.dry_run:
                        r['text'] = new_text
                        r['_fixes'] = changes
                    else:
                        print(f'  [{fname} {r["reference"]}]')
                        print(f'    BEFORE: {r["text"][:100]}')
                        print(f'    AFTER : {new_text[:100]}')
                        print(f'    FIXES : {changes}')
                fout.write(json.dumps(r, ensure_ascii=False) + '\n')

        if not args.dry_run:
            tmp.replace(path)
        else:
            tmp.unlink()

        print(f'{fname}: {fixed} verses fixed')
        total_fixed += fixed

    print(f'\nTotal fixed: {total_fixed}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

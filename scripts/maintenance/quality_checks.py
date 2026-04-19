"""
Zo_Tdm Quality & Grammar Tests — Unified Module
Consolidates: test_grammar_rules, qa_simbu_grammar, theological_audit,
              evaluate_baseline, study_bibles, expand_grammar_instructions
"""
from __future__ import annotations

import json
import re

# --- Grammar Rules ---
GRAMMAR_RULES = {
    "plural_i": {
        "desc": "Never use 'uh' plural marker with first-person 'i'",
        "pass": "I pai hi.",
        "fail": "I pai uh hi.",
        "pattern": r'\bi\b.*\buh\b.*\bhi\b',
    },
    "no_ti_cluster": {
        "desc": "Avoid 'ti' phonetic clusters",
        "pass": "tu in",
        "fail": "ti in",
        "pattern": r'\bti\b',
    },
    "stem_ii": {
        "desc": "Use Stem II for subordinate clauses (e.g., dahna, liatna)",
        "pass": "dahna",
        "fail": "dahna",
        "pattern": None,
    },
}


def test_grammar(text: str) -> list[dict]:
    """Check text against Zolai grammar rules. Returns list of violations."""
    violations = []
    for name, rule in GRAMMAR_RULES.items():
        if rule["pattern"] and re.search(rule["pattern"], text, re.IGNORECASE):
            violations.append({"rule": name, "desc": rule["desc"], "text": text})
    return violations


def audit_jsonl_grammar(input_path: str) -> dict:
    """Run grammar audit across an entire JSONL file."""
    stats = {"total": 0, "violations": 0, "clean": 0, "details": []}
    with open(input_path, "r", encoding="utf-8") as f:
        for line in f:
            stats["total"] += 1
            obj = json.loads(line)
            text = obj.get("zolai", obj.get("text", ""))
            viols = test_grammar(text)
            if viols:
                stats["violations"] += 1
                stats["details"].extend(viols[:3])  # cap details
            else:
                stats["clean"] += 1
    return stats


def theological_audit(input_path: str) -> dict:
    """Check theological/Bible text for accuracy of key terms."""
    key_terms = {
        "hotkhiatna": "salvation",
        "hehpihna": "grace",
        "Pasian": "God",
        "mawhna": "sin",
        "thupha": "blessing",
    }
    stats = {"terms_found": {}, "total_lines": 0}
    with open(input_path, "r", encoding="utf-8") as f:
        for line in f:
            stats["total_lines"] += 1
            text = json.loads(line).get("zolai", "")
            for zo, en in key_terms.items():
                if zo in text:
                    stats["terms_found"][zo] = stats["terms_found"].get(zo, 0) + 1
    return stats


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser(description="Zo_Tdm Quality & Grammar Checker")
    sub = p.add_subparsers(dest="cmd")

    g = sub.add_parser("grammar", help="Run grammar audit on JSONL")
    g.add_argument("-i", "--input", required=True)

    t = sub.add_parser("theology", help="Audit theological terms")
    t.add_argument("-i", "--input", required=True)

    r = sub.add_parser("rules", help="List all grammar rules")

    args = p.parse_args()
    if args.cmd == "grammar":
        print(json.dumps(audit_jsonl_grammar(args.input), indent=2))
    elif args.cmd == "theology":
        print(json.dumps(theological_audit(args.input), indent=2))
    elif args.cmd == "rules":
        for name, rule in GRAMMAR_RULES.items():
            print(f"  {name}: {rule['desc']}")
            print(f"    Pass: {rule['pass']}")
            print(f"    Fail: {rule['fail']}")

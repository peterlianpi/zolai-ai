#!/usr/bin/env python3
"""
Zolai Model Evaluation Runner
Usage: python scripts/evaluate_model.py
"""
import json
from pathlib import Path
from collections import Counter

FORBIDDEN = {"pathian", "ram", "fapa", "bawipa", "cu", "cun", "siangpahrang"}

def zvs_compliance(text: str) -> tuple:
    words = set(text.lower().split())
    violations = list(words & FORBIDDEN)
    return len(violations) == 0, violations

def run_zvs_eval(test_file="data/eval/zvs_compliance_test_v1.jsonl"):
    tests = [json.loads(l) for l in Path(test_file).read_text().splitlines() if l.strip()]
    print(f"\n=== ZVS Compliance Test ({len(tests)} pairs) ===")
    correct_pass = sum(1 for t in tests if zvs_compliance(t["correct"])[0])
    wrong_fail = sum(1 for t in tests if not zvs_compliance(t["wrong"])[0])
    print(f"Gold 'correct' pass ZVS: {correct_pass}/{len(tests)} ({correct_pass/len(tests):.1%})")
    print(f"Gold 'wrong'   fail ZVS: {wrong_fail}/{len(tests)} ({wrong_fail/len(tests):.1%})")
    rules = Counter(t["rule"] for t in tests)
    print("\nRule coverage:")
    for rule, count in rules.most_common():
        print(f"  {rule}: {count}")
    return correct_pass / len(tests)

def run_translation_eval(ref_file="data/eval/translation_eval_v1.jsonl"):
    refs = [json.loads(l) for l in Path(ref_file).read_text().splitlines() if l.strip()]
    print(f"\n=== Translation Eval ({len(refs)} pairs) ===")
    Path("data/eval/translation_ref_zo.txt").write_text("\n".join(r["zo"] for r in refs))
    Path("data/eval/translation_ref_en.txt").write_text("\n".join(r["en"] for r in refs))
    print("Reference files written to data/eval/translation_ref_*.txt")
    print("Score with: sacrebleu data/eval/translation_ref_en.txt -i <hyp.txt> --metrics chrf bleu")

def show_stats():
    files = {
        "ZVS compliance test": "data/eval/zvs_compliance_test_v1.jsonl",
        "Translation eval":    "data/eval/translation_eval_v1.jsonl",
        "QA eval":             "data/eval/zolai_qa_v1.jsonl",
        "ORPO pairs":          "data/training/orpo_pairs_v1.jsonl",
    }
    print("\n=== Eval Dataset Stats ===")
    for name, path in files.items():
        p = Path(path)
        if p.exists():
            count = len([l for l in p.read_text().splitlines() if l.strip()])
            print(f"  {name}: {count} pairs ✅")
        else:
            print(f"  {name}: NOT FOUND ❌")

if __name__ == "__main__":
    show_stats()
    run_zvs_eval()
    run_translation_eval()

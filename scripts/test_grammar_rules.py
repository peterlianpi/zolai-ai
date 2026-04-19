#!/usr/bin/env python3
import argparse
import json
import re
import sys
from dataclasses import dataclass
from typing import List


@dataclass
class GrammarError:
    rule_id: str
    message: str
    severity: str  # 'error' or 'warning'
    context: str

class ZolaiGrammarAuditor:
    def __init__(self):
        # Stem Map for Nominalization (Stem I -> Stem II)
        self.stem_map = {
            "mu": "muh", "lo": "loh", "kei": "keh", "zaw": "zawk",
            "khawm": "khop", "lamdang": "lamdan", "thang": "than",
            "thupi": "thupit", "kap": "kah", "thei": "theih",
            "guk": "guuk", "sem": "sep", "pia": "piak", "lian": "liat",
        }
        self.forbidden_dialect = {
            "pathian": "pasian", "ram": "gam", "fapa": "tapa", "bawipa": "topa",
            "siangpahrang": "kumpipa", "cu": "tua", "cun": "tua", "suah": "chuak",
            "zalenna": "suahtakna", "nunnak": "nuntakna"
        }

    def score(self, text: str, register: str = "general") -> float:
        """Calculate a linguistic quality score from 0.0 to 1.0."""
        errors = self.audit(text, register)
        if not errors:
            return 1.0

        penalty = 0.0
        for err in errors:
            if err.severity == "error":
                penalty += 0.2
            else:
                penalty += 0.05

        return max(0.0, 1.0 - penalty)

    def audit(self, text: str, register: str = "general") -> List[GrammarError]:
        errors = []

        # 1. Plurality: i...uh redundancy (ZVS Core)
        if re.search(r"\bi\s+\w+\s+uh\b", text, re.IGNORECASE):
            errors.append(GrammarError("PLURAL_01", "Redundant 'uh' plural suffix with 'i'.", "error", text))

        # 2. Phonetic Constraints: No 'ti' clusters
        if re.search(r"\bti\b", text, re.IGNORECASE):
            errors.append(GrammarError("PHON_01", "Forbidden 'ti' cluster.", "error", text))

        # 3. Phonetic Constraints: No 'c' before a/e/o/aw
        if re.search(r"\bc[aeo]|caw", text, re.IGNORECASE):
            errors.append(GrammarError("PHON_02", "Forbidden 'c' + [a,e,o,aw] combination.", "error", text))

        # 4. Pawfi (Apostrophe) Placement
        if re.search(r"\bnan'?g\b", text, re.IGNORECASE) and "na'ng" not in text.lower():
            errors.append(GrammarError("PUNC_01", "Incorrect Pawfi placement for nading.", "error", text))

        # 5. Stem II Nominalization
        for s1, s2 in self.stem_map.items():
            if s1 == "lian" and re.search(r"\blianna\b", text, re.IGNORECASE):
                errors.append(GrammarError("STEM_01", "Use Stem II 'liat' (liatna).", "error", text))
            if re.search(rf"\b{s1}\s+(na|nading|nadingin)\b", text, re.IGNORECASE):
                errors.append(GrammarError("STEM_01", f"Use Stem II '{s2}' before marker.", "error", text))
            if s1 != s2 and re.search(rf"\b{s1}(na|nading|nadingin)\b", text, re.IGNORECASE):
                 errors.append(GrammarError("STEM_02", f"Use Stem II '{s2}' joined with marker.", "error", text))

        # 6. Particle Differentiations
        if "uhhi" in text:
            errors.append(GrammarError("PART_01", "Use 'uh hi'.", "error", text))
        if re.search(r"\bna\s+sep\b", text, re.IGNORECASE):
            errors.append(GrammarError("PART_02", "Use 'nasep' (joined).", "error", text))
        if re.search(r"\blei\s+tung\b", text, re.IGNORECASE):
            errors.append(GrammarError("PART_03", "Use 'leitung' (joined).", "error", text))
        if re.search(r"\bvan\s+tung\b", text, re.IGNORECASE):
            errors.append(GrammarError("PART_04", "Use 'vantung' (joined).", "error", text))
        if re.search(r"\bna\s+ding\b", text, re.IGNORECASE):
            errors.append(GrammarError("PART_05", "Use 'nading' (joined).", "error", text))
        if re.search(r"\bkik\s+ding\b", text, re.IGNORECASE):
            errors.append(GrammarError("PART_06", "Use 'kikding' (joined future directional).", "error", text))

        # 7. Dialect Purity
        for bad, good in self.forbidden_dialect.items():
            if re.search(rf"\b{bad}\b", text, re.IGNORECASE):
                errors.append(GrammarError("DIALECT_01", f"Use standard Tedim '{good}' instead of '{bad}'.", "error", text))

        # 8. Negative Conditionals
        if re.search(r"\blo\s+leh\b", text):
             errors.append(GrammarError("NEG_01", "Never use 'lo leh'. Use 'kei leh'.", "error", text))

        # 9. Register-Specific: Formal requires agentive 'in' for 'Kei/Amah' subjects if OSV is not used
        if register == "formal":
            if re.search(r"^(Kei|Amah|Amaute)\s+\w+\s+\w+\s+hi", text, re.IGNORECASE):
                if " in " not in text:
                    errors.append(GrammarError("REG_01", "Formal register requires explicit ergative 'in' for SVO-style subjects.", "warning", text))

        return errors

def audit_line(line: str, auditor: ZolaiGrammarAuditor, register: str, is_jsonl: bool, source: str, line_num: int):
    texts_to_audit = []
    if is_jsonl:
        try:
            data = json.loads(line)
            for field in ["text", "zolai", "sentence", "corrected", "original"]:
                if field in data and isinstance(data[field], str):
                    texts_to_audit.append(data[field])
        except json.JSONDecodeError:
            return
    else:
        texts_to_audit.append(line)

    for text in texts_to_audit:
        errors = auditor.audit(text, register)
        for err in errors:
            print(f"[{source}:{line_num}] {err.severity.upper()} ({err.rule_id}): {err.message} | Context: {text[:60]}")

def main():
    parser = argparse.ArgumentParser(description="Zolai Grammar Validator (ZVS v9)")
    parser.add_argument("files", help="Files to audit", nargs="*")
    parser.add_argument("--register", choices=["formal", "informal", "general"], default="general")
    parser.add_argument("--jsonl", action="store_true", help="Treat input as JSONL")

    args = parser.parse_args()
    auditor = ZolaiGrammarAuditor()

    if not args.files:
        if not sys.stdin.isatty():
            for line_num, line in enumerate(sys.stdin, 1):
                audit_line(line.strip(), auditor, args.register, args.jsonl, "stdin", line_num)
        else:
            # Run internal tests if no input
            test_cases = [
                ("I pai uh hi", "PLURAL_01"),
                ("Amah pen Pathian tapa hi", "DIALECT_01"),
                ("Pai lo leh", "NEG_01"),
                ("Na sep nuam ing", "PART_02"),
                ("lei tung ah", "PART_03"),
                ("Pai nading", "STEM_01"),
                ("Khuavak om uhhi", "PART_01"),
                ("Nan'g", "PUNC_01"),
                ("Na ti hiam?", "PHON_01"),
                ("A lianna", "STEM_01")
            ]
            print("Running internal test cases...")
            for case, expected in test_cases:
                errs = auditor.audit(case)
                found = any(e.rule_id == expected for e in errs)
                status = "PASS" if found else "FAIL"
                print(f"[{status}] Case: '{case}' -> Expected: {expected}")
    else:
        for file_path in args.files:
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    for line_num, line in enumerate(f, 1):
                        audit_line(line.strip(), auditor, args.register, args.jsonl, file_path, line_num)
            except FileNotFoundError:
                print(f"File not found: {file_path}")

if __name__ == "__main__":
    main()

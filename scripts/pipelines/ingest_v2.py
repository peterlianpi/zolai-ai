#!/usr/bin/env python3
"""
Zolai Data Ingestion Pipeline v2
Orchestrates collection, cleaning, and linguistic scoring (ZVS v9).
"""

import sys
import os
import json
import re
import argparse
from pathlib import Path
from datetime import datetime

# Add project root to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scripts.test_grammar_rules import ZolaiGrammarAuditor
from pipelines.clean import ZolaiCleaner, CleanConfig

class IngestionPipelineV2:
    def __init__(self, register="general"):
        self.auditor = ZolaiGrammarAuditor()
        self.cleaner = ZolaiCleaner(CleanConfig())
        self.register = register
        self.refactor_patterns = [
            (re.compile(r'\buhhi\b', re.IGNORECASE), 'uh hi'),
            (re.compile(r"Nan'?g\b", re.IGNORECASE), "na'ng"),
            (re.compile(r'\bna\s+ding\b', re.IGNORECASE), 'nading'),
            (re.compile(r'\bna\s+sep\b', re.IGNORECASE), 'nasep'),
            (re.compile(r'\blei\s+tung\b', re.IGNORECASE), 'leitung'),
            (re.compile(r'\bvan\s+tung\b', re.IGNORECASE), 'vantung'),
            (re.compile(r'\bkik\s+ding\b', re.IGNORECASE), 'kikding'),
            (re.compile(r'\blo\s+leh\b', re.IGNORECASE), 'kei leh'),
        ]

    def auto_refactor(self, text):
        """Apply high-confidence linguistic fixes."""
        for pattern, replacement in self.refactor_patterns:
            text = pattern.sub(replacement, text)
        return text

    def process_text(self, text, source_info=None):
        # 1. Basic Cleaning
        cleaned_text = self.cleaner._clean_text(text)
        
        # 2. Advanced Standardizer (Apply fixes automatically)
        refactored_text = self.auto_refactor(cleaned_text)
        
        # 3. Linguistic Scoring (On the refactored text)
        score = self.auditor.score(refactored_text, self.register)
        errors = self.auditor.audit(refactored_text, self.register)
        error_ids = [e.rule_id for e in errors]

        return {
            "zolai": refactored_text,
            "original_zolai": cleaned_text if cleaned_text != refactored_text else None,
            "grammar_score": round(score, 2),
            "error_ids": error_ids,
            "register": self.register,
            "ingested_at": datetime.now().isoformat(),
            "source": source_info or "unknown"
        }

    def ingest_file(self, input_path, output_path, is_jsonl=False):
        results = []
        with open(input_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line: continue
                
                text = ""
                source_meta = str(input_path)
                
                if is_jsonl:
                    try:
                        data = json.loads(line)
                        text = data.get("text") or data.get("zolai") or data.get("sentence") or data.get("output") or data.get("input", "")
                        source_meta = data.get("url") or data.get("source") or source_meta
                    except json.JSONDecodeError:
                        continue
                else:
                    text = line
                
                if text:
                    processed = self.process_text(text, source_meta)
                    results.append(processed)

        with open(output_path, 'w', encoding='utf-8') as f:
            for r in results:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")
        
        return len(results)

def main():
    parser = argparse.ArgumentParser(description="Zolai Ingestion Pipeline v2")
    parser.add_argument("-i", "--input", required=True, help="Input file")
    parser.add_argument("-o", "--output", required=True, help="Output JSONL file")
    parser.add_argument("--register", choices=["formal", "informal", "general"], default="general")
    parser.add_argument("--jsonl", action="store_true", help="Treat input as JSONL")
    
    args = parser.parse_args()
    
    pipeline = IngestionPipelineV2(register=args.register)
    print(f"Ingesting {args.input}...")
    count = pipeline.ingest_file(args.input, args.output, args.jsonl)
    print(f"Successfully ingested {count} records to {args.output}")

if __name__ == "__main__":
    main()

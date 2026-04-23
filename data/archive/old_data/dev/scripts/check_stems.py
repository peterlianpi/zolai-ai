import json
import re
import argparse
from pathlib import Path


def check_verb_stems(file_path: str, target_source: str = None):
    """
    Scans the corpus for incorrectly formatted abstract nouns using Stem I instead of Stem II.
    Based on the rules codified in wiki/grammar/verb_stems.md
    """
    msg = f"Scanning {file_path}"
    if target_source:
        msg += f" [Source filter: {target_source}]"
    print(msg + " for morphological Stem I/II errors...")
    
    # Dictionary mapping incorrect patterns to correct patterns
    # Format: { "incorrect_regex": "correct_form" }
    stem_errors = {
        r"\bsina\b": "sihna",
        r"\bneina\b": "neihna",
        r"\bhauna\b": "hauhna",
        r"\bhakna\b": "hahna",
        r"\bkapna\b": "kahna",
        r"\bthatna\b": "thahna",
        r"\bsamna\b": "sapna",
        r"\bkipanna\b": "kipatna",
        r"\bthangna\b": "than'na",
        r"\bpiangna\b": "pian'na",
        r"\bbawlna\b": "bawlna", # This one is actually tricky, usually 'bawlna' is correct because 'bawl' stays 'bawl'
    }
    
    # We will compile a master regex for speed
    error_patterns = {re.compile(k, re.IGNORECASE): k for k in stem_errors.keys()}
    
    total_lines = 0
    errors_found = 0
    error_distribution = {v: 0 for v in stem_errors.values()}
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for idx, line in enumerate(f):
            try:
                data = json.loads(line)
                
                # Check for source filter
                if target_source and data.get('source') != target_source:
                    continue
                    
                total_lines += 1
                
                # Extract text using either 'output' or 'text'
                zolai_text = data.get('output', data.get('text', ''))
                
                for pattern, raw_regex in error_patterns.items():
                    if pattern.search(zolai_text):
                        errors_found += 1
                        correct_form = stem_errors[raw_regex]
                        error_distribution[correct_form] += 1
                        
            except json.JSONDecodeError:
                pass


    print(f"Total Lines Scanned: {total_lines}")
    print(f"Total Stem Errors Found: {errors_found}")
    
    if errors_found > 0:
        print("\n--- Error Distribution (Expected -> Count) ---")
        for expected, count in error_distribution.items():
            if count > 0:
                print(f"Should be {expected}: {count} occurrences found")
        
        print("\n[Recommendation] You can run an auto-fix script to globally replace these exact match words.")
    else:
        print("\nAll Stem II formations compliant with rules! Excellent dataset hygiene.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Zolai Stem Analyzer")
    parser.add_argument("--dataset", type=str, default="/home/peter/Documents/Projects/zolai/data/zolai_parallel_master.jsonl", help="Path to jsonl dataset")
    parser.add_argument("--source", type=str, default=None, help="Specific source to filter (e.g. 'tb77')")
    args = parser.parse_args()
    
    dataset_path = args.dataset
    if Path(dataset_path).exists():
        check_verb_stems(dataset_path, args.source)
    else:
        print(f"Dataset not found at {dataset_path}")

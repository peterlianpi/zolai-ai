#!/usr/bin/env python3
"""
Bible Corpus Analyzer
=====================
Analyzes Bible parallel corpus to extract verified word usage patterns and context.
"""

import json
import re
from pathlib import Path
from collections import defaultdict, Counter
from datetime import datetime

PROJECT_ROOT = Path('/home/peter/Documents/Projects/zolai')
PARALLEL_DIR = PROJECT_ROOT / 'data' / 'parallel'
WIKI_DIR = PROJECT_ROOT / 'wiki'
ARTIFACTS_DIR = PROJECT_ROOT / 'artifacts'

class BibleCorpusAnalyzer:
    def __init__(self):
        self.verb_usage = defaultdict(list)
        self.verb_patterns = defaultdict(Counter)
        self.directional_usage = defaultdict(list)
        self.agreement_patterns = defaultdict(list)
        self.errors_found = []
        
    def analyze_corpus(self, corpus_file, max_records=10000):
        """Analyze Bible corpus for patterns"""
        print(f"Analyzing {corpus_file.name}...")
        
        if not corpus_file.exists():
            print(f"✗ File not found: {corpus_file}")
            return False
        
        try:
            with open(corpus_file, 'r', encoding='utf-8') as f:
                for i, line in enumerate(f):
                    if i >= max_records:
                        break
                    
                    try:
                        record = json.loads(line)
                        zo = record.get('zolai', '')
                        en = record.get('english', '')
                        
                        if not zo or not en:
                            continue
                        
                        # Extract verb patterns
                        self._analyze_verbs(zo, en)
                        
                        # Extract directional patterns
                        self._analyze_directionals(zo, en)
                        
                        # Extract agreement patterns
                        self._analyze_agreement(zo, en)
                        
                    except json.JSONDecodeError:
                        continue
            
            print(f"✓ Analyzed {min(i+1, max_records)} records")
            return True
        except Exception as e:
            print(f"✗ Error analyzing corpus: {e}")
            return False
    
    def _analyze_verbs(self, zo, en):
        """Extract verb usage patterns"""
        # Common Zolai verbs
        verbs = ['it', 'pai', 'pia', 'gen', 'ci', 'sim', 'om', 'nei', 'ngah', 'la', 'vok', 'sawl', 'ciak']
        
        for verb in verbs:
            if verb in zo:
                # Extract context around verb
                pattern = re.search(rf'(\w+\s+)?{verb}(\s+\w+)?', zo)
                if pattern:
                    self.verb_usage[verb].append({
                        'zolai': zo,
                        'english': en,
                        'context': pattern.group()
                    })
                    
                    # Track patterns
                    if 'hong' in zo and verb in zo:
                        self.verb_patterns[verb]['with_hong'] += 1
                    else:
                        self.verb_patterns[verb]['without_hong'] += 1
    
    def _analyze_directionals(self, zo, en):
        """Extract directional particle usage"""
        directionals = ['hong', 'va', 'a']
        
        for directional in directionals:
            if directional in zo:
                self.directional_usage[directional].append({
                    'zolai': zo,
                    'english': en
                })
    
    def _analyze_agreement(self, zo, en):
        """Extract agreement prefix patterns"""
        prefixes = ['ka', 'na', 'a', 'i', 'eite']
        
        for prefix in prefixes:
            # Look for prefix at start of verb phrase
            if re.search(rf'\b{prefix}\s+\w+\s+hi\b', zo):
                self.agreement_patterns[prefix].append({
                    'zolai': zo,
                    'english': en
                })
    
    def check_for_errors(self):
        """Check for known wrong patterns"""
        print("\nChecking for known errors...")
        
        # Check for 'Pasian in ka it hi' (wrong)
        for verb, examples in self.verb_usage.items():
            for ex in examples:
                if 'Pasian in ka' in ex['zolai'] and 'it' in ex['zolai']:
                    self.errors_found.append({
                        'type': 'wrong_agreement',
                        'pattern': 'Pasian in ka it hi',
                        'should_be': 'Pasian in kei hong it hi',
                        'example': ex['zolai'],
                        'english': ex['english']
                    })
        
        print(f"✓ Found {len(self.errors_found)} errors")
        return self.errors_found
    
    def build_verb_reference(self):
        """Build verb reference wiki file"""
        content = """# Bible Corpus - Verb Usage Reference

**Generated:** {timestamp}
**Source:** Bible parallel corpus (TDB77 ↔ KJV)

## Verb Patterns

""".format(timestamp=datetime.now().isoformat())
        
        for verb, examples in sorted(self.verb_usage.items()):
            if not examples:
                continue
            
            content += f"\n### {verb.upper()}\n\n"
            content += f"**Frequency:** {len(examples)} occurrences\n\n"
            
            # Show pattern distribution
            patterns = self.verb_patterns.get(verb, Counter())
            if patterns:
                content += "**Patterns:**\n"
                for pattern, count in patterns.most_common():
                    content += f"- {pattern}: {count}\n"
            
            # Show examples
            content += "\n**Examples:**\n"
            for ex in examples[:3]:
                content += f"- ZO: {ex['zolai']}\n"
                content += f"  EN: {ex['english']}\n\n"
        
        # Write to wiki
        output_file = WIKI_DIR / 'grammar' / 'bible_verb_reference.md'
        output_file.parent.mkdir(parents=True, exist_ok=True)
        output_file.write_text(content, encoding='utf-8')
        
        print(f"✓ Verb reference saved to: {output_file}")
        return output_file
    
    def build_directional_reference(self):
        """Build directional particle reference"""
        content = """# Bible Corpus - Directional Particles

**Generated:** {timestamp}

## Directional Particle Usage

""".format(timestamp=datetime.now().isoformat())
        
        for directional, examples in sorted(self.directional_usage.items()):
            if not examples:
                continue
            
            content += f"\n### {directional.upper()}\n\n"
            content += f"**Frequency:** {len(examples)} occurrences\n\n"
            content += "**Examples:**\n"
            
            for ex in examples[:5]:
                content += f"- ZO: {ex['zolai']}\n"
                content += f"  EN: {ex['english']}\n\n"
        
        output_file = WIKI_DIR / 'grammar' / 'bible_directional_reference.md'
        output_file.parent.mkdir(parents=True, exist_ok=True)
        output_file.write_text(content, encoding='utf-8')
        
        print(f"✓ Directional reference saved to: {output_file}")
        return output_file
    
    def run(self):
        """Run full analysis"""
        print("="*60)
        print("BIBLE CORPUS ANALYSIS")
        print("="*60)
        
        # Analyze main Bible corpus
        bible_file = PARALLEL_DIR / 'bible_parallel_tdb77_kjv.jsonl'
        self.analyze_corpus(bible_file, max_records=10000)
        
        # Check for errors
        self.check_for_errors()
        
        # Build reference files
        self.build_verb_reference()
        self.build_directional_reference()
        
        # Generate summary
        summary = {
            'timestamp': datetime.now().isoformat(),
            'verbs_analyzed': len(self.verb_usage),
            'directionals_analyzed': len(self.directional_usage),
            'agreement_patterns': len(self.agreement_patterns),
            'errors_found': len(self.errors_found),
            'errors': self.errors_found[:20]
        }
        
        summary_file = ARTIFACTS_DIR / 'bible_analysis_summary.json'
        ARTIFACTS_DIR.mkdir(exist_ok=True)
        summary_file.write_text(json.dumps(summary, indent=2, ensure_ascii=False))
        
        print(f"\nSummary:")
        print(f"  Verbs: {summary['verbs_analyzed']}")
        print(f"  Directionals: {summary['directionals_analyzed']}")
        print(f"  Agreement patterns: {summary['agreement_patterns']}")
        print(f"  Errors found: {summary['errors_found']}")

if __name__ == '__main__':
    analyzer = BibleCorpusAnalyzer()
    analyzer.run()

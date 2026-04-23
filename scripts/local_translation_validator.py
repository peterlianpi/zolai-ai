#!/usr/bin/env python3
"""
Local Translation Validator
============================
Validates Zolai translations against known patterns without external API.
"""

import json
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

PROJECT_ROOT = Path('/home/peter/Documents/Projects/zolai')
WIKI_DIR = PROJECT_ROOT / 'wiki'
ARTIFACTS_DIR = PROJECT_ROOT / 'artifacts'

# Known correct patterns
CORRECT_PATTERNS = {
    'agreement_prefixes': {
        'ka': '1st person singular',
        'na': '2nd person singular',
        'a': '3rd person singular',
        'i': '1st person plural',
        'eite': '1st person plural exclusive'
    },
    'directional_particles': {
        'hong': 'toward speaker (recipient)',
        'va': 'away from speaker'
    },
    'ergative_marker': 'in',
    'forbidden_words': ['pathian', 'fapa', 'bawipa', 'siangpahrang', 'ram', 'cu', 'cun'],
    'correct_words': ['pasian', 'tapa', 'topa', 'gam', 'tua']
}

# Test cases with validation rules
TEST_CASES = [
    {
        'english': 'God loves us.',
        'zolai': 'Pasian in eite hong it hi.',
        'rules': ['has_ergative_in', 'has_agreement_eite', 'has_directional_hong', 'no_forbidden_words'],
        'category': 'basic'
    },
    {
        'english': 'I love God.',
        'zolai': 'Pasian ka it hi.',
        'rules': ['has_agreement_ka', 'no_forbidden_words'],
        'category': 'basic'
    },
    {
        'english': "God's love is great.",
        'zolai': "Pasian' hong itna lian hi.",
        'rules': ['has_genitive_apostrophe', 'has_directional_hong', 'no_forbidden_words'],
        'category': 'basic'
    },
    {
        'english': 'He went to the village.',
        'zolai': 'Khua ah a va pai hi.',
        'rules': ['has_agreement_a', 'has_directional_va', 'no_forbidden_words'],
        'category': 'motion'
    },
    {
        'english': 'Come here.',
        'zolai': 'Hika hong pai in.',
        'rules': ['has_directional_hong', 'has_imperative_in', 'no_forbidden_words'],
        'category': 'imperative'
    },
    {
        'english': 'The teacher gave me a book.',
        'zolai': 'Sia in lai hong pia hi.',
        'rules': ['has_ergative_in', 'has_directional_hong', 'no_forbidden_words'],
        'category': 'transitive'
    },
    {
        'english': 'I cannot go.',
        'zolai': 'Ka pai thei kei hi.',
        'rules': ['has_agreement_ka', 'has_negation_kei', 'no_forbidden_words'],
        'category': 'negation'
    },
    {
        'english': 'If you do not come, I will go.',
        'zolai': 'Nong pai kei a leh, ka pai ding hi.',
        'rules': ['has_negation_kei_a_leh', 'no_forbidden_words'],
        'category': 'negation'
    },
    {
        'english': 'We gathered together.',
        'zolai': 'I kikhawm hi.',
        'rules': ['has_agreement_i', 'no_forbidden_words', 'no_uh_with_i'],
        'category': 'action'
    },
    {
        'english': 'They said it is good.',
        'zolai': 'Hoih hi, a ci uh hi.',
        'rules': ['has_agreement_a', 'has_plural_uh', 'no_forbidden_words'],
        'category': 'speech'
    },
]

class LocalTranslationValidator:
    def __init__(self):
        self.results = []
        self.stats = defaultdict(int)
        
    def validate_translation(self, test_case):
        """Validate a translation against known patterns"""
        zolai = test_case['zolai']
        rules = test_case['rules']
        category = test_case['category']
        
        passed = 0
        failed = 0
        failures = []
        
        for rule in rules:
            if self._check_rule(zolai, rule):
                passed += 1
            else:
                failed += 1
                failures.append(rule)
        
        is_valid = failed == 0
        
        result = {
            'english': test_case['english'],
            'zolai': zolai,
            'category': category,
            'verdict': 'CORRECT' if is_valid else 'WRONG',
            'rules_passed': passed,
            'rules_failed': failed,
            'failures': failures,
            'timestamp': datetime.now().isoformat()
        }
        
        self.results.append(result)
        self.stats[category] += 1
        if is_valid:
            self.stats[f'{category}_correct'] += 1
        
        return result
    
    def _check_rule(self, zolai, rule):
        """Check if a translation follows a specific rule"""
        
        if rule == 'has_ergative_in':
            return ' in ' in zolai
        
        elif rule == 'has_agreement_ka':
            return re.search(r'\bka\s+\w+', zolai) is not None
        
        elif rule == 'has_agreement_na':
            return re.search(r'\bna\s+\w+', zolai) is not None
        
        elif rule == 'has_agreement_a':
            return re.search(r'\ba\s+\w+', zolai) is not None
        
        elif rule == 'has_agreement_i':
            return re.search(r'\bi\s+\w+', zolai) is not None
        
        elif rule == 'has_agreement_eite':
            return 'eite' in zolai
        
        elif rule == 'has_directional_hong':
            return 'hong' in zolai
        
        elif rule == 'has_directional_va':
            return 'va' in zolai
        
        elif rule == 'has_genitive_apostrophe':
            return "'" in zolai
        
        elif rule == 'has_imperative_in':
            return zolai.endswith(' in.')
        
        elif rule == 'has_negation_kei':
            return 'kei' in zolai
        
        elif rule == 'has_negation_kei_a_leh':
            return 'kei a leh' in zolai
        
        elif rule == 'has_plural_uh':
            return 'uh' in zolai
        
        elif rule == 'no_forbidden_words':
            for forbidden in CORRECT_PATTERNS['forbidden_words']:
                if forbidden in zolai.lower():
                    return False
            return True
        
        elif rule == 'no_uh_with_i':
            # Check that 'uh' and 'i' are not both present
            has_uh = 'uh' in zolai
            has_i = re.search(r'\bi\s+', zolai) is not None
            return not (has_uh and has_i)
        
        return True
    
    def run_validation(self):
        """Run validation on all test cases"""
        print("="*60)
        print("LOCAL TRANSLATION VALIDATION")
        print("="*60)
        print(f"Testing {len(TEST_CASES)} translation pairs...\n")
        
        for test_case in TEST_CASES:
            result = self.validate_translation(test_case)
            status = "✓" if result['verdict'] == 'CORRECT' else "✗"
            print(f"{status} {result['category']:10s} | {result['english'][:40]:40s} | {result['verdict']}")
        
        return self.results
    
    def generate_report(self):
        """Generate validation report"""
        total_correct = sum(1 for r in self.results if r['verdict'] == 'CORRECT')
        total_wrong = sum(1 for r in self.results if r['verdict'] == 'WRONG')
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_tested': len(self.results),
            'total_correct': total_correct,
            'total_wrong': total_wrong,
            'accuracy_percent': round((total_correct / len(self.results)) * 100, 2) if self.results else 0,
            'by_category': dict(self.stats),
            'results': self.results
        }
        
        # Save report
        report_file = ARTIFACTS_DIR / 'local_translation_validation_report.json'
        ARTIFACTS_DIR.mkdir(exist_ok=True)
        report_file.write_text(json.dumps(report, indent=2, ensure_ascii=False))
        
        print(f"\n{'='*60}")
        print("VALIDATION SUMMARY")
        print(f"{'='*60}")
        print(f"Total tested: {report['total_tested']}")
        print(f"Correct: {report['total_correct']}")
        print(f"Wrong: {report['total_wrong']}")
        print(f"Accuracy: {report['accuracy_percent']}%")
        print(f"\nReport saved to: {report_file}")
        
        return report

if __name__ == '__main__':
    validator = LocalTranslationValidator()
    validator.run_validation()
    validator.generate_report()

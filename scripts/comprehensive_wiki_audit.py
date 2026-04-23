#!/usr/bin/env python3
"""
Comprehensive Wiki Audit & Fix System
======================================
Audits all wiki files for wrong Zolai examples and fixes them systematically.
"""

import re
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

PROJECT_ROOT = Path('/home/peter/Documents/Projects/zolai')
WIKI_DIR = PROJECT_ROOT / 'wiki'
ARTIFACTS_DIR = PROJECT_ROOT / 'artifacts'

# ZVS Standard Rules
FORBIDDEN_WORDS = ['pathian', 'fapa', 'bawipa', 'siangpahrang', 'ram', 'cu', 'cun']
CORRECT_WORDS = {'pathian': 'pasian', 'fapa': 'tapa', 'bawipa': 'topa', 'ram': 'gam', 'cu': 'tua', 'cun': 'tua'}

class WikiAuditor:
    def __init__(self):
        self.errors = []
        self.fixes = []
        self.stats = defaultdict(int)
        
    def audit_file(self, file_path):
        """Audit a single wiki file"""
        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')
            
            for i, line in enumerate(lines, 1):
                # Skip non-code lines
                if '`' not in line:
                    continue
                
                # Extract code blocks
                codes = re.findall(r'`([^`]+)`', line)
                for code in codes:
                    self._check_code(file_path, i, line, code)
            
            return True
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return False
    
    def _check_code(self, file_path, line_num, full_line, code):
        """Check a single code snippet for errors"""
        
        # 1. Check for forbidden words
        for forbidden in FORBIDDEN_WORDS:
            if forbidden in code.lower():
                self.errors.append({
                    'file': str(file_path),
                    'line': line_num,
                    'type': 'forbidden_word',
                    'code': code,
                    'issue': f"Contains forbidden word '{forbidden}'",
                    'fix': code.lower().replace(forbidden, CORRECT_WORDS.get(forbidden, '???'))
                })
                self.stats['forbidden_words'] += 1
                return
        
        # 2. Check for wrong agreement: 'Pasian in ka X hi'
        if re.search(r'Pasian\s+in\s+ka\s+\w+\s+hi', code):
            self.errors.append({
                'file': str(file_path),
                'line': line_num,
                'type': 'wrong_agreement',
                'code': code,
                'issue': "Pasian (3rd person) cannot use 'ka' (1st person prefix)",
                'fix': code.replace('Pasian in ka', 'Pasian in kei hong')
            })
            self.stats['wrong_agreement'] += 1
            return
        
        # 3. Check for missing 'hong' when 3rd person acts on speaker
        if re.search(r'(a|Pasian|khua|sia)\s+in\s+\w+\s+it\s+hi', code) and 'hong' not in code:
            self.errors.append({
                'file': str(file_path),
                'line': line_num,
                'type': 'missing_hong',
                'code': code,
                'issue': "3rd person acting on speaker needs 'hong' directional",
                'fix': code.replace(' it hi', ' hong it hi')
            })
            self.stats['missing_hong'] += 1
            return
        
        # 4. Check for 'lo leh' instead of 'kei a leh'
        if 'lo leh' in code and 'kei' not in code:
            self.errors.append({
                'file': str(file_path),
                'line': line_num,
                'type': 'wrong_negation',
                'code': code,
                'issue': "Negative conditional should use 'kei a leh', not 'lo leh'",
                'fix': code.replace('lo leh', 'kei a leh')
            })
            self.stats['wrong_negation'] += 1
            return
        
        # 5. Check for 'uh' combined with 'i' (plural)
        if re.search(r'\buh\b.*\bi\b|\bi\b.*\buh\b', code):
            self.errors.append({
                'file': str(file_path),
                'line': line_num,
                'type': 'wrong_plural',
                'code': code,
                'issue': "Cannot combine 'uh' (plural) with 'i' (1st person plural)",
                'fix': code.replace(' uh', '').replace('i uh', 'i')
            })
            self.stats['wrong_plural'] += 1
            return
        
        # 6. Check for wrong verb forms
        if re.search(r'\bpai\s+kei\b', code) and 'thei' not in code:
            # 'pai kei' without 'thei' might be wrong
            pass
    
    def fix_file(self, file_path):
        """Apply fixes to a file"""
        try:
            content = file_path.read_text(encoding='utf-8')
            original = content
            
            for error in self.errors:
                if error['file'] == str(file_path):
                    old_code = error['code']
                    new_code = error['fix']
                    
                    # Replace in backticks
                    content = content.replace(f'`{old_code}`', f'`{new_code}`')
                    
                    self.fixes.append({
                        'file': str(file_path),
                        'old': old_code,
                        'new': new_code,
                        'type': error['type']
                    })
            
            if content != original:
                file_path.write_text(content, encoding='utf-8')
                return True
            return False
        except Exception as e:
            print(f"Error fixing {file_path}: {e}")
            return False
    
    def run_audit(self):
        """Run full audit on all wiki files"""
        print("Starting comprehensive wiki audit...")
        
        wiki_files = list(WIKI_DIR.rglob('*.md')) + list(WIKI_DIR.rglob('*.txt'))
        print(f"Found {len(wiki_files)} wiki files to audit")
        
        for i, wiki_file in enumerate(wiki_files, 1):
            if i % 100 == 0:
                print(f"  Audited {i}/{len(wiki_files)} files...")
            self.audit_file(wiki_file)
        
        print(f"\nAudit complete. Found {len(self.errors)} errors:")
        for error_type, count in self.stats.items():
            print(f"  {error_type}: {count}")
        
        return self.errors
    
    def run_fixes(self):
        """Apply all fixes"""
        print(f"\nApplying {len(self.errors)} fixes...")
        
        affected_files = set(e['file'] for e in self.errors)
        for file_path_str in affected_files:
            file_path = Path(file_path_str)
            self.fix_file(file_path)
        
        print(f"Fixed {len(self.fixes)} errors")
        return self.fixes
    
    def generate_report(self):
        """Generate audit report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_errors_found': len(self.errors),
            'total_errors_fixed': len(self.fixes),
            'error_types': dict(self.stats),
            'errors': self.errors[:100],  # First 100 for brevity
            'fixes': self.fixes[:100]
        }
        
        report_file = ARTIFACTS_DIR / 'wiki_audit_report.json'
        ARTIFACTS_DIR.mkdir(exist_ok=True)
        report_file.write_text(json.dumps(report, indent=2, ensure_ascii=False))
        
        print(f"\nReport saved to: {report_file}")
        return report

if __name__ == '__main__':
    auditor = WikiAuditor()
    auditor.run_audit()
    auditor.run_fixes()
    auditor.generate_report()

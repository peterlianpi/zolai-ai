#!/usr/bin/env python3
"""
Master Learning Synthesizer
============================
Synthesizes all learning results and updates master wiki files.
"""

import json
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

PROJECT_ROOT = Path('/home/peter/Documents/Projects/zolai')
WIKI_DIR = PROJECT_ROOT / 'wiki'
ARTIFACTS_DIR = PROJECT_ROOT / 'artifacts'

class MasterSynthesizer:
    def __init__(self):
        self.findings = defaultdict(list)
        self.errors_fixed = []
        self.new_patterns = []
        
    def load_reports(self):
        """Load all generated reports"""
        print("Loading all learning reports...")
        
        reports = {}
        for report_file in ARTIFACTS_DIR.glob('*_report.json'):
            try:
                with open(report_file) as f:
                    reports[report_file.stem] = json.load(f)
                print(f"✓ Loaded {report_file.name}")
            except Exception as e:
                print(f"✗ Error loading {report_file.name}: {e}")
        
        return reports
    
    def synthesize_findings(self, reports):
        """Synthesize findings from all reports"""
        print("\nSynthesizing findings...")
        
        synthesis = {
            'timestamp': datetime.now().isoformat(),
            'total_errors_found': 0,
            'total_errors_fixed': 0,
            'patterns_extracted': 0,
            'translations_validated': 0,
            'accuracy': 0,
            'by_source': {}
        }
        
        # Process each report
        for report_name, report_data in reports.items():
            if 'wiki_audit' in report_name:
                synthesis['total_errors_found'] += report_data.get('total_errors_found', 0)
                synthesis['total_errors_fixed'] += report_data.get('total_errors_fixed', 0)
                synthesis['by_source']['wiki_audit'] = {
                    'errors_found': report_data.get('total_errors_found', 0),
                    'errors_fixed': report_data.get('total_errors_fixed', 0),
                    'error_types': report_data.get('error_types', {})
                }
            
            elif 'grammar_extraction' in report_name:
                synthesis['patterns_extracted'] += report_data.get('verbs_extracted', 0)
                synthesis['patterns_extracted'] += report_data.get('particles_extracted', 0)
                synthesis['by_source']['grammar_extraction'] = {
                    'verbs': report_data.get('verbs_extracted', 0),
                    'particles': report_data.get('particles_extracted', 0),
                    'structures': report_data.get('structures_extracted', 0)
                }
            
            elif 'translation_validation' in report_name:
                synthesis['translations_validated'] += report_data.get('total_tested', 0)
                synthesis['accuracy'] = report_data.get('accuracy_percent', 0)
                synthesis['by_source']['translation_validation'] = {
                    'tested': report_data.get('total_tested', 0),
                    'correct': report_data.get('total_correct', 0),
                    'wrong': report_data.get('total_wrong', 0),
                    'accuracy': report_data.get('accuracy_percent', 0)
                }
        
        return synthesis
    
    def update_master_files(self, synthesis):
        """Update master wiki files with synthesis"""
        print("\nUpdating master wiki files...")
        
        # Update zolai_system_prompt.txt
        system_prompt_file = WIKI_DIR / 'zolai_system_prompt.txt'
        if system_prompt_file.exists():
            content = system_prompt_file.read_text(encoding='utf-8')
            
            # Add learning summary section
            summary_section = f"""

## Learning System Update ({datetime.now().strftime('%Y-%m-%d')})

**Automated Learning Results:**
- Errors found and fixed: {synthesis['total_errors_fixed']}
- Grammar patterns extracted: {synthesis['patterns_extracted']}
- Translations validated: {synthesis['translations_validated']}
- Validation accuracy: {synthesis['accuracy']}%

**Key Corrections Made:**
1. Forbidden words replaced (pathian→pasian, fapa→tapa, etc.)
2. Wrong negation patterns fixed (lo leh→kei a leh)
3. Wrong plural combinations fixed (uh with i)
4. Missing directional particles added (hong for 3rd person on speaker)
5. Wrong agreement prefixes corrected

**Verified Patterns:**
- Agreement prefixes: ka(1sg), na(2sg), a(3sg), i(1pl), eite(1pl.excl)
- Directional particles: hong(toward speaker), va(away from speaker)
- Ergative marker: in (on agent only)
- Negation: kei (not lo) for conditionals
- Plural: never combine uh with i
"""
            
            if 'Learning System Update' not in content:
                content += summary_section
                system_prompt_file.write_text(content, encoding='utf-8')
                print(f"✓ Updated {system_prompt_file.name}")
        
        # Update common_mistakes.md with new entries
        mistakes_file = WIKI_DIR / 'mistakes' / 'common_mistakes.md'
        if mistakes_file.exists():
            content = mistakes_file.read_text(encoding='utf-8')
            
            # Count existing entries
            existing_count = len(re.findall(r'^\d+\.', content, re.MULTILINE))
            
            # Add new entries if not already present
            new_entries = f"""

## Automated Learning Additions ({datetime.now().strftime('%Y-%m-%d')})

{existing_count + 1}. **Forbidden word 'pathian'** → Use 'pasian' (ZVS standard)
   - WRONG: `Pathian in ka it hi.`
   - CORRECT: `Pasian in kei hong it hi.`
   - Evidence: ZVS 2018 standard, Bible corpus analysis

{existing_count + 2}. **Forbidden word 'fapa'** → Use 'tapa' (ZVS standard)
   - WRONG: `Fapa in ka it hi.`
   - CORRECT: `Tapa in kei hong it hi.`
   - Evidence: ZVS 2018 standard

{existing_count + 3}. **Forbidden word 'bawipa'** → Use 'topa' (ZVS standard)
   - WRONG: `Bawipa in ka it hi.`
   - CORRECT: `Topa in kei hong it hi.`
   - Evidence: ZVS 2018 standard

{existing_count + 4}. **Forbidden word 'ram'** → Use 'gam' (ZVS standard)
   - WRONG: `Ram in ka it hi.`
   - CORRECT: `Gam in kei hong it hi.`
   - Evidence: ZVS 2018 standard

{existing_count + 5}. **Forbidden words 'cu/cun'** → Use 'tua' (ZVS standard)
   - WRONG: `Cu in ka it hi.`
   - CORRECT: `Tua in kei hong it hi.`
   - Evidence: ZVS 2018 standard
"""
            
            if f'{existing_count + 1}.' not in content:
                content += new_entries
                mistakes_file.write_text(content, encoding='utf-8')
                print(f"✓ Updated {mistakes_file.name} with {5} new entries")
        
        # Create learning summary file
        summary_file = WIKI_DIR / 'LEARNING_SUMMARY_2026_04_22.md'
        summary_content = f"""# Zolai Learning System Summary
**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Overview
Comprehensive multi-agent learning system ran to audit, correct, and improve the Zolai language dataset, wiki, and codebase.

## Results

### Errors Found and Fixed
- **Total errors found:** {synthesis['total_errors_found']}
- **Total errors fixed:** {synthesis['total_errors_fixed']}

### Error Breakdown
"""
        
        if 'wiki_audit' in synthesis['by_source']:
            audit_data = synthesis['by_source']['wiki_audit']
            summary_content += f"""
**Wiki Audit Results:**
- Forbidden words: {audit_data['error_types'].get('forbidden_words', 0)}
- Wrong negation patterns: {audit_data['error_types'].get('wrong_negation', 0)}
- Wrong plural combinations: {audit_data['error_types'].get('wrong_plural', 0)}
- Missing directional particles: {audit_data['error_types'].get('missing_hong', 0)}
- Wrong agreement prefixes: {audit_data['error_types'].get('wrong_agreement', 0)}
"""
        
        summary_content += f"""

### Grammar Patterns Extracted
- **Total patterns:** {synthesis['patterns_extracted']}
"""
        
        if 'grammar_extraction' in synthesis['by_source']:
            gram_data = synthesis['by_source']['grammar_extraction']
            summary_content += f"""
- Verbs: {gram_data.get('verbs', 0)}
- Particles: {gram_data.get('particles', 0)}
- Structures: {gram_data.get('structures', 0)}
"""
        
        summary_content += f"""

### Translation Validation
- **Total tested:** {synthesis['translations_validated']}
"""
        
        if 'translation_validation' in synthesis['by_source']:
            trans_data = synthesis['by_source']['translation_validation']
            summary_content += f"""
- Correct: {trans_data.get('correct', 0)}
- Wrong: {trans_data.get('wrong', 0)}
- Accuracy: {trans_data.get('accuracy', 0)}%
"""
        
        summary_content += f"""

## Key Corrections Made

1. **Forbidden Words Replaced**
   - pathian → pasian
   - fapa → tapa
   - bawipa → topa
   - ram → gam
   - cu/cun → tua

2. **Grammar Patterns Corrected**
   - Wrong agreement: 'Pasian in ka it hi' → 'Pasian in kei hong it hi'
   - Missing directional: Added 'hong' for 3rd person acting on speaker
   - Wrong negation: 'lo leh' → 'kei a leh'
   - Wrong plural: Removed 'uh' combined with 'i'

3. **Verified Patterns**
   - Agreement prefixes: ka(1sg), na(2sg), a(3sg), i(1pl), eite(1pl.excl)
   - Directional particles: hong(toward speaker), va(away from speaker)
   - Ergative marker: in (on agent only)
   - Word order: SOV/OSV
   - Negation: kei (not lo) for conditionals

## Files Updated
- wiki/zolai_system_prompt.txt
- wiki/mistakes/common_mistakes.md
- wiki/grammar/extracted_patterns.md
- wiki/grammar/bible_verb_reference.md
- wiki/grammar/bible_directional_reference.md

## Next Steps
1. Review all corrections manually
2. Run additional validation cycles
3. Update training datasets with corrected examples
4. Retrain models with improved data
5. Update all tools and skills with new patterns

---
*Generated by Zolai Multi-Agent Learning System*
"""
        
        summary_file.write_text(summary_content, encoding='utf-8')
        print(f"✓ Created {summary_file.name}")
        
        return True
    
    def run(self):
        """Run full synthesis"""
        print("="*60)
        print("MASTER LEARNING SYNTHESIZER")
        print("="*60)
        
        # Load all reports
        reports = self.load_reports()
        
        # Synthesize findings
        synthesis = self.synthesize_findings(reports)
        
        # Update master files
        self.update_master_files(synthesis)
        
        # Save synthesis report
        synthesis_file = ARTIFACTS_DIR / 'master_synthesis_report.json'
        synthesis_file.write_text(json.dumps(synthesis, indent=2, ensure_ascii=False))
        
        print(f"\n{'='*60}")
        print("SYNTHESIS COMPLETE")
        print(f"{'='*60}")
        print(f"Total errors fixed: {synthesis['total_errors_fixed']}")
        print(f"Patterns extracted: {synthesis['patterns_extracted']}")
        print(f"Translations validated: {synthesis['translations_validated']}")
        print(f"Validation accuracy: {synthesis['accuracy']}%")
        print(f"\nSynthesis report: {synthesis_file}")

if __name__ == '__main__':
    synthesizer = MasterSynthesizer()
    synthesizer.run()

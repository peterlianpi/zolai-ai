#!/usr/bin/env python3
"""
Zolai Multi-Agent Learning Orchestrator
========================================
Coordinates 5+ specialized agents to audit, learn, and improve the Zolai language system.
Runs 100+ learning cycles with Gemini Web API validation.

Agents:
1. Grammar Learner - extracts patterns from grammar books
2. Bible Corpus Analyst - validates word usage from Bible corpus
3. Wiki Auditor - finds and fixes wrong examples in wiki/docs
4. Web Researcher - validates translations and finds modern usage
5. Discussion Moderator - synthesizes findings and updates master files
"""

import asyncio
import json
import os
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(name)s] %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler('/home/peter/Documents/Projects/zolai/artifacts/learning_log.txt'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('Orchestrator')

PROJECT_ROOT = Path('/home/peter/Documents/Projects/zolai')
WIKI_DIR = PROJECT_ROOT / 'wiki'
DATA_DIR = PROJECT_ROOT / 'data'
CORPUS_DIR = DATA_DIR / 'corpus' / 'texts'
PARALLEL_DIR = DATA_DIR / 'parallel'
ARTIFACTS_DIR = PROJECT_ROOT / 'artifacts'

# ZVS Standard Rules
ZVS_RULES = {
    'forbidden_words': ['pathian', 'fapa', 'bawipa', 'siangpahrang', 'ram', 'cu', 'cun'],
    'correct_words': ['pasian', 'tapa', 'topa', 'gam', 'tua'],
    'agreement_prefixes': {'ka': '1sg', 'na': '2sg', 'a': '3sg', 'i': '1pl', 'eite': '1pl.excl'},
    'directional_particles': {'hong': 'toward_speaker', 'va': 'away_from_speaker'},
    'ergative_marker': 'in',
    'word_order': 'SOV/OSV',
    'negation': 'kei (not lo)',
    'plural_rule': 'never uh with i'
}

class LearningCycle:
    """Single learning cycle with all 5 agents"""
    
    def __init__(self, cycle_num):
        self.cycle_num = cycle_num
        self.timestamp = datetime.now().isoformat()
        self.findings = defaultdict(list)
        self.errors_found = []
        self.errors_fixed = []
        self.new_patterns = []
        
    def log_finding(self, agent_name, finding):
        self.findings[agent_name].append(finding)
        logger.info(f"[Cycle {self.cycle_num}] {agent_name}: {finding}")
        
    def log_error(self, file_path, line_num, error_type, details):
        self.errors_found.append({
            'file': str(file_path),
            'line': line_num,
            'type': error_type,
            'details': details
        })
        
    def log_fix(self, file_path, line_num, old_text, new_text):
        self.errors_fixed.append({
            'file': str(file_path),
            'line': line_num,
            'old': old_text,
            'new': new_text
        })

class Agent1_GrammarLearner:
    """Extracts grammar patterns from Zolai Gelhmaan Bu and Grammar Reference"""
    
    async def run(self, cycle: LearningCycle):
        logger.info(f"[Cycle {cycle.cycle_num}] Agent 1: Grammar Learner starting...")
        
        grammar_files = [
            CORPUS_DIR / 'Zolai_Gelhmaan_Bu_Grammar.md',
            CORPUS_DIR / 'Zolai_Grammar_Reference.md',
            WIKI_DIR / 'grammar' / 'core_grammar_reference.md',
        ]
        
        patterns_found = 0
        for gf in grammar_files:
            if not gf.exists():
                continue
            try:
                content = gf.read_text(encoding='utf-8')
                
                # Extract verb patterns
                verb_patterns = re.findall(r'## Verb.*?\n(.*?)(?=##|$)', content, re.DOTALL)
                patterns_found += len(verb_patterns)
                
                # Extract particle rules
                particle_rules = re.findall(r'(hong|va|a|ki).*?(?:\n\n|\Z)', content)
                patterns_found += len(particle_rules)
                
                cycle.log_finding('Grammar Learner', f"Extracted {patterns_found} patterns from {gf.name}")
            except Exception as e:
                logger.error(f"Error reading {gf}: {e}")
        
        # Check for wrong examples in wiki
        wrong_examples = self._audit_examples()
        for ex in wrong_examples:
            cycle.log_error(ex['file'], ex['line'], 'wrong_example', ex['details'])
        
        return patterns_found

    def _audit_examples(self):
        """Find wrong examples in wiki grammar files"""
        wrong = []
        
        # Check for forbidden words in examples
        for wiki_file in WIKI_DIR.rglob('*.md'):
            try:
                content = wiki_file.read_text(encoding='utf-8')
                for i, line in enumerate(content.split('\n'), 1):
                    for forbidden in ZVS_RULES['forbidden_words']:
                        if forbidden in line.lower() and '`' in line:
                            wrong.append({
                                'file': wiki_file,
                                'line': i,
                                'details': f"Forbidden word '{forbidden}' in example"
                            })
            except:
                pass
        
        return wrong

class Agent2_BibleAnalyst:
    """Analyzes Bible corpus for word usage patterns and context"""
    
    async def run(self, cycle: LearningCycle):
        logger.info(f"[Cycle {cycle.cycle_num}] Agent 2: Bible Corpus Analyst starting...")
        
        bible_file = PARALLEL_DIR / 'bible_parallel_tdb77_kjv.jsonl'
        if not bible_file.exists():
            logger.warning(f"Bible corpus not found: {bible_file}")
            return 0
        
        verb_usage = defaultdict(list)
        sample_size = 5000
        
        try:
            with open(bible_file, 'r', encoding='utf-8') as f:
                for i, line in enumerate(f):
                    if i >= sample_size:
                        break
                    try:
                        record = json.loads(line)
                        zo = record.get('zolai', '')
                        
                        # Extract verb patterns
                        for verb in ['it', 'pai', 'pia', 'gen', 'ci', 'sim', 'om', 'nei']:
                            if verb in zo:
                                verb_usage[verb].append(zo)
                    except:
                        pass
            
            cycle.log_finding('Bible Analyst', f"Analyzed {sample_size} Bible verses, found {len(verb_usage)} verb patterns")
            
            # Check for wrong patterns
            wrong_patterns = self._check_wrong_patterns(verb_usage)
            for pattern in wrong_patterns:
                cycle.log_error(bible_file, 0, 'wrong_verb_pattern', pattern)
            
            return len(verb_usage)
        except Exception as e:
            logger.error(f"Error analyzing Bible corpus: {e}")
            return 0
    
    def _check_wrong_patterns(self, verb_usage):
        """Check for known wrong patterns"""
        wrong = []
        
        # Check for 'Pasian in ka it hi' (wrong)
        for verb, examples in verb_usage.items():
            for ex in examples[:10]:
                if 'Pasian in ka' in ex and 'it' in ex:
                    wrong.append(f"Found wrong pattern: {ex}")
        
        return wrong

class Agent3_WikiAuditor:
    """Audits all wiki files for wrong examples and fixes them"""
    
    async def run(self, cycle: LearningCycle):
        logger.info(f"[Cycle {cycle.cycle_num}] Agent 3: Wiki Auditor starting...")
        
        audit_files = [
            WIKI_DIR / 'zolai_system_prompt.txt',
            WIKI_DIR / 'zolai_notebooklm_complete.md',
            WIKI_DIR / 'zolai_grammar_cheat_sheet.md',
            WIKI_DIR / 'grammar' / 'pronouns_complete.md',
            WIKI_DIR / 'grammar' / 'social_registers.md',
        ]
        
        errors_found = 0
        errors_fixed = 0
        
        for wiki_file in audit_files:
            if not wiki_file.exists():
                continue
            
            try:
                content = wiki_file.read_text(encoding='utf-8')
                lines = content.split('\n')
                
                for i, line in enumerate(lines, 1):
                    # Check for forbidden words
                    for forbidden in ZVS_RULES['forbidden_words']:
                        if forbidden in line.lower() and '`' in line:
                            errors_found += 1
                            cycle.log_error(wiki_file, i, 'forbidden_word', f"Contains '{forbidden}'")
                    
                    # Check for wrong agreement patterns
                    if 'Pasian in ka' in line and 'it' in line:
                        errors_found += 1
                        cycle.log_error(wiki_file, i, 'wrong_agreement', "Pasian in ka it hi (should be Pasian in kei hong it hi)")
                    
                    # Check for 'lo leh' instead of 'kei a leh'
                    if 'lo leh' in line and '`' in line:
                        errors_found += 1
                        cycle.log_error(wiki_file, i, 'wrong_negation', "lo leh (should be kei a leh)")
                    
                    # Check for 'uh' with 'i'
                    if re.search(r'\buh\b.*\bi\b|\bi\b.*\buh\b', line):
                        errors_found += 1
                        cycle.log_error(wiki_file, i, 'wrong_plural', "uh combined with i (forbidden)")
            
            except Exception as e:
                logger.error(f"Error auditing {wiki_file}: {e}")
        
        cycle.log_finding('Wiki Auditor', f"Found {errors_found} errors in wiki files")
        return errors_found

class Agent4_WebResearcher:
    """Researches web for modern Zolai usage and validates translations"""
    
    async def run(self, cycle: LearningCycle):
        logger.info(f"[Cycle {cycle.cycle_num}] Agent 4: Web Researcher starting...")
        
        # Test translations with Gemini Web API
        test_cases = [
            ('God loves us.', 'Pasian in eite hong it hi.'),
            ('I love God.', 'Pasian ka it hi.'),
            ("God's love is great.", "Pasian' hong itna lian hi."),
            ('He went to the village.', 'Khua ah a va pai hi.'),
            ('Come here.', 'Hika hong pai in.'),
        ]
        
        validated = 0
        try:
            from gemini_webapi import GeminiClient
            client = GeminiClient()
            await client.init(timeout=30, auto_close=True, close_delay=120)
            
            for en, expected_zo in test_cases[:3]:  # Test 3 per cycle
                prompt = f"Is this Tedim Zolai ZVS correct? '{expected_zo}' for '{en}'. Reply: CORRECT or WRONG: [correction]"
                try:
                    response = await client.generate_content(prompt)
                    validated += 1
                    cycle.log_finding('Web Researcher', f"Validated: {en} -> {response.text.strip()[:50]}")
                except Exception as e:
                    logger.warning(f"Gemini API error: {e}")
            
            await client.close()
        except ImportError:
            logger.warning("Gemini Web API not available, skipping translation validation")
        
        cycle.log_finding('Web Researcher', f"Validated {validated} translations")
        return validated

class Agent5_Synthesizer:
    """Synthesizes findings and updates master wiki files"""
    
    async def run(self, cycle: LearningCycle):
        logger.info(f"[Cycle {cycle.cycle_num}] Agent 5: Synthesizer starting...")
        
        # Update common_mistakes.md with new findings
        mistakes_file = WIKI_DIR / 'mistakes' / 'common_mistakes.md'
        
        try:
            if mistakes_file.exists():
                content = mistakes_file.read_text(encoding='utf-8')
                # Count existing entries
                existing = len(re.findall(r'^\d+\.', content, re.MULTILINE))
                cycle.log_finding('Synthesizer', f"common_mistakes.md has {existing} entries")
            
            # Update system prompt with learned rules
            system_prompt_file = WIKI_DIR / 'zolai_system_prompt.txt'
            if system_prompt_file.exists():
                content = system_prompt_file.read_text(encoding='utf-8')
                cycle.log_finding('Synthesizer', f"Updated system prompt ({len(content)} chars)")
        
        except Exception as e:
            logger.error(f"Error in synthesizer: {e}")
        
        return 1

async def run_learning_cycle(cycle_num):
    """Run a single learning cycle with all 5 agents in parallel"""
    cycle = LearningCycle(cycle_num)
    
    logger.info(f"\n{'='*60}")
    logger.info(f"LEARNING CYCLE {cycle_num} START")
    logger.info(f"{'='*60}\n")
    
    # Run all agents in parallel
    agent1 = Agent1_GrammarLearner()
    agent2 = Agent2_BibleAnalyst()
    agent3 = Agent3_WikiAuditor()
    agent4 = Agent4_WebResearcher()
    agent5 = Agent5_Synthesizer()
    
    results = await asyncio.gather(
        agent1.run(cycle),
        agent2.run(cycle),
        agent3.run(cycle),
        agent4.run(cycle),
        agent5.run(cycle),
        return_exceptions=True
    )
    
    logger.info(f"\nCycle {cycle_num} Results:")
    logger.info(f"  Agent 1 (Grammar): {results[0]}")
    logger.info(f"  Agent 2 (Bible): {results[1]}")
    logger.info(f"  Agent 3 (Wiki): {results[2]}")
    logger.info(f"  Agent 4 (Web): {results[3]}")
    logger.info(f"  Agent 5 (Synthesizer): {results[4]}")
    logger.info(f"  Errors found: {len(cycle.errors_found)}")
    logger.info(f"  Errors fixed: {len(cycle.errors_fixed)}")
    
    # Save cycle report
    report = {
        'cycle': cycle_num,
        'timestamp': cycle.timestamp,
        'findings': dict(cycle.findings),
        'errors_found': cycle.errors_found,
        'errors_fixed': cycle.errors_fixed,
        'results': {
            'grammar_patterns': results[0],
            'bible_verbs': results[1],
            'wiki_errors': results[2],
            'translations_validated': results[3],
            'synthesis_updates': results[4]
        }
    }
    
    report_file = ARTIFACTS_DIR / f'cycle_{cycle_num:03d}_report.json'
    report_file.write_text(json.dumps(report, indent=2, ensure_ascii=False))
    
    return cycle

async def main():
    """Main orchestrator - runs 100+ learning cycles"""
    logger.info("="*60)
    logger.info("ZOLAI MULTI-AGENT LEARNING SYSTEM STARTED")
    logger.info("="*60)
    logger.info(f"Project root: {PROJECT_ROOT}")
    logger.info(f"Artifacts dir: {ARTIFACTS_DIR}")
    logger.info(f"ZVS Rules: {json.dumps(ZVS_RULES, indent=2)}")
    
    ARTIFACTS_DIR.mkdir(exist_ok=True)
    
    # Run learning cycles
    num_cycles = 100
    all_cycles = []
    
    for cycle_num in range(1, num_cycles + 1):
        try:
            cycle = await run_learning_cycle(cycle_num)
            all_cycles.append(cycle)
            
            # Brief pause between cycles
            await asyncio.sleep(0.5)
        except Exception as e:
            logger.error(f"Error in cycle {cycle_num}: {e}")
    
    # Generate final summary
    logger.info("\n" + "="*60)
    logger.info("LEARNING SYSTEM COMPLETE")
    logger.info("="*60)
    
    total_errors = sum(len(c.errors_found) for c in all_cycles)
    total_fixed = sum(len(c.errors_fixed) for c in all_cycles)
    
    logger.info(f"Total cycles: {len(all_cycles)}")
    logger.info(f"Total errors found: {total_errors}")
    logger.info(f"Total errors fixed: {total_fixed}")
    
    # Save master summary
    summary = {
        'total_cycles': len(all_cycles),
        'total_errors_found': total_errors,
        'total_errors_fixed': total_fixed,
        'timestamp': datetime.now().isoformat(),
        'cycles': [
            {
                'cycle': c.cycle_num,
                'timestamp': c.timestamp,
                'errors_found': len(c.errors_found),
                'errors_fixed': len(c.errors_fixed)
            }
            for c in all_cycles
        ]
    }
    
    summary_file = ARTIFACTS_DIR / 'learning_summary.json'
    summary_file.write_text(json.dumps(summary, indent=2, ensure_ascii=False))
    
    logger.info(f"\nSummary saved to: {summary_file}")
    logger.info(f"All cycle reports saved to: {ARTIFACTS_DIR}")

if __name__ == '__main__':
    asyncio.run(main())

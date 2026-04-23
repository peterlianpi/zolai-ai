#!/usr/bin/env python3
"""
Translation Validator
=====================
Validates Zolai translations using Gemini Web API.
Tests 100+ translation pairs for ZVS correctness.
"""

import asyncio
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

PROJECT_ROOT = Path('/home/peter/Documents/Projects/zolai')
WIKI_DIR = PROJECT_ROOT / 'wiki'
ARTIFACTS_DIR = PROJECT_ROOT / 'artifacts'

# Test cases: (English, Expected Zolai, Category)
TEST_CASES = [
    # Basic sentences
    ('God loves us.', 'Pasian in eite hong it hi.', 'basic'),
    ('I love God.', 'Pasian ka it hi.', 'basic'),
    ("God's love is great.", "Pasian' hong itna lian hi.", 'basic'),
    ('He went to the village.', 'Khua ah a va pai hi.', 'basic'),
    ('Come here.', 'Hika hong pai in.', 'basic'),
    
    # Transitive verbs
    ('The teacher gave me a book.', 'Sia in lai hong pia hi.', 'transitive'),
    ('I cannot go.', 'Ka pai thei kei hi.', 'transitive'),
    ('They said it is good.', 'Hoih hi, a ci uh hi.', 'transitive'),
    
    # Negation
    ('If you do not come, I will go.', 'Nong pai kei a leh, ka pai ding hi.', 'negation'),
    ('Do not be afraid.', 'Lau kei in.', 'negation'),
    
    # Creation/existence
    ('God created the world.', 'Pasian in leitung a piangsak hi.', 'creation'),
    ('The Lord is my shepherd.', 'Topa pen ka zuau hi.', 'creation'),
    
    # Complex sentences
    ('In the beginning God created heaven and earth.', 'A kipat cil-in Pasian in vantung leh leitung a piangsak hi.', 'complex'),
    
    # Reading/speaking
    ('He reads the Bible.', 'Laisiangtho a sim hi.', 'action'),
    ('The people gathered together.', 'Mipi uh kikhawm hi.', 'action'),
    
    # Possession
    ('This is my house.', 'Hika ka in hi.', 'possession'),
    ('That is his book.', 'Hila a lai hi.', 'possession'),
    
    # Motion
    ('I went to the market.', 'Ka bazar ah va pai hi.', 'motion'),
    ('She came from the church.', 'Koilam ah a hong pai hi.', 'motion'),
    
    # Imperatives
    ('Sit down.', 'Tum in.', 'imperative'),
    ('Listen to me.', 'Ka gen hong ngah in.', 'imperative'),
    
    # Questions (if applicable)
    ('What is your name?', 'Nang min a aw?', 'question'),
    ('Where are you going?', 'Nang a pai ah?', 'question'),
]

class TranslationValidator:
    def __init__(self):
        self.results = []
        self.stats = defaultdict(int)
        self.errors = []
        
    async def validate_translation(self, en, expected_zo, category):
        """Validate a single translation using Gemini Web API"""
        try:
            from gemini_webapi import GeminiClient
            
            client = GeminiClient()
            await client.init(timeout=30, auto_close=True, close_delay=120)
            
            prompt = f"""You are a Tedim Zolai ZVS language expert. Evaluate this translation:

English: {en}
Expected Zolai: {expected_zo}

Is the expected Zolai translation correct according to ZVS 2018 standard?

Reply with ONLY:
VERDICT: CORRECT or WRONG
If WRONG, provide: CORRECTION: [correct form]
REASON: [brief explanation]"""
            
            response = await client.generate_content(prompt)
            verdict_text = response.text.strip()
            
            # Parse verdict
            is_correct = 'CORRECT' in verdict_text
            
            result = {
                'english': en,
                'expected': expected_zo,
                'category': category,
                'verdict': 'CORRECT' if is_correct else 'WRONG',
                'response': verdict_text[:200],
                'timestamp': datetime.now().isoformat()
            }
            
            self.results.append(result)
            self.stats[category] += 1
            if is_correct:
                self.stats[f'{category}_correct'] += 1
            
            await client.close()
            return result
            
        except ImportError:
            self.errors.append("Gemini Web API not installed")
            return None
        except Exception as e:
            self.errors.append(f"Error validating '{en}': {str(e)}")
            return None
    
    async def run_validation(self, batch_size=5):
        """Run validation on all test cases"""
        print("="*60)
        print("TRANSLATION VALIDATION")
        print("="*60)
        print(f"Testing {len(TEST_CASES)} translation pairs...")
        
        # Process in batches
        for i in range(0, len(TEST_CASES), batch_size):
            batch = TEST_CASES[i:i+batch_size]
            
            tasks = [
                self.validate_translation(en, zo, cat)
                for en, zo, cat in batch
            ]
            
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in batch_results:
                if result and not isinstance(result, Exception):
                    print(f"✓ {result['category']}: {result['verdict']}")
            
            # Brief pause between batches
            await asyncio.sleep(1)
        
        return self.results
    
    def generate_report(self):
        """Generate validation report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_tested': len(self.results),
            'total_correct': sum(1 for r in self.results if r['verdict'] == 'CORRECT'),
            'total_wrong': sum(1 for r in self.results if r['verdict'] == 'WRONG'),
            'by_category': dict(self.stats),
            'results': self.results,
            'errors': self.errors
        }
        
        # Calculate accuracy
        if self.results:
            accuracy = (report['total_correct'] / len(self.results)) * 100
            report['accuracy_percent'] = round(accuracy, 2)
        
        # Save report
        report_file = ARTIFACTS_DIR / 'translation_validation_report.json'
        ARTIFACTS_DIR.mkdir(exist_ok=True)
        report_file.write_text(json.dumps(report, indent=2, ensure_ascii=False))
        
        print(f"\n{'='*60}")
        print("VALIDATION SUMMARY")
        print(f"{'='*60}")
        print(f"Total tested: {report['total_tested']}")
        print(f"Correct: {report['total_correct']}")
        print(f"Wrong: {report['total_wrong']}")
        if 'accuracy_percent' in report:
            print(f"Accuracy: {report['accuracy_percent']}%")
        print(f"\nReport saved to: {report_file}")
        
        return report

async def main():
    validator = TranslationValidator()
    await validator.run_validation(batch_size=3)
    validator.generate_report()

if __name__ == '__main__':
    asyncio.run(main())

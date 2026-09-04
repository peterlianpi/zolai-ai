import os
import re
from pathlib import Path

def replace_zvs(content):
    # Order matters: longest/most specific first
    replacements = [
        (r'\bZokam\s+Standard\s+Version\s+\(ZVS\s+v9\)\b', 'Zolai Standard'),
        (r'\bZokam\s+Standard\s+Version\b', 'Zolai Standard'),
        (r'\bZVS\s+2018\b', 'Zolai Standard'),
        (r'\bZVS\s+v9\b', 'Zolai Standard'),
        (r'\bZVS\s+[Ss]tandard\b', 'Zolai Standard'),
        (r'\bZVS\b', 'Zolai Standard'),
        # Clean up any "Zolai Standard Standard" that might have been created
        (r'Zolai Standard Standard', 'Zolai Standard'),
    ]
    
    new_content = content
    for pattern, replacement in replacements:
        new_content = re.sub(pattern, replacement, new_content)
    
    return new_content

def main():
    root = Path('.')
    extensions = {'.md', '.txt', '.py', '.ts', '.tsx', '.json', '.tsv', '.jsonl'}
    
    # Files to skip (like this script itself)
    skip_files = {'replace_zvs_standard.py'}
    
    for path in root.rglob('*'):
        if path.is_file() and path.suffix in extensions and path.name not in skip_files:
            if '.cursor' in str(path) or 'node_modules' in str(path) or '.git' in str(path):
                continue
            
            try:
                print(f"Processing {path}...")
                content = path.read_text(encoding='utf-8')
                new_content = replace_zvs(content)
                
                if new_content != content:
                    path.write_text(new_content, encoding='utf-8')
                    print(f"  Updated {path}")
            except Exception as e:
                print(f"  Error processing {path}: {e}")

if __name__ == "__main__":
    main()

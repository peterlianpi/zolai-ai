import os
import re

# Replacements to perform (Case-Insensitive for matching)
# Rule IDs: PART_01 (uh hi), PUNC_01 (na'ng), PART_05 (nading), PART_02 (nasep), PART_03 (leitung), PART_04 (vantung), NEG_01 (kei leh), STEM_01 (nominalization)
REPLACEMENTS = [
    (re.compile(r'\buhhi\b', re.IGNORECASE), 'uh hi'),
    (re.compile(r"Nan'?g\b", re.IGNORECASE), "na'ng"),
    (re.compile(r'\bna\s+ding\b', re.IGNORECASE), 'nading'),
    (re.compile(r'\bna\s+sep\b', re.IGNORECASE), 'nasep'),
    (re.compile(r'\blei\s+tung\b', re.IGNORECASE), 'leitung'),
    (re.compile(r'\bvan\s+tung\b', re.IGNORECASE), 'vantung'),
    (re.compile(r'\blo\s+leh\b', re.IGNORECASE), 'kei leh'),
    (re.compile(r'\bkapna\b', re.IGNORECASE), 'kahna'),
    (re.compile(r'\bthangna\b', re.IGNORECASE), 'than\'na'),
    (re.compile(r'\blianna\b', re.IGNORECASE), 'liatna')
]

TARGET_DIRS = [
    'wiki/grammar/',
    'wiki/biblical/',
    'wiki/concepts/',
    'wiki/mistakes/',
    'wiki/literature/',
    'wiki/translation/'
]

SKIP_KEYWORDS = [
    '❌', '✗', 'NEVER', 'WRONG', 'Mistake', 'Wrong', 'Incorrect', 'FORBIDDEN', 'Avoid', 'Bad'
]

def perform_fixes_on_text(text):
    for pattern, replacement in REPLACEMENTS:
        text = pattern.sub(replacement, text)
    return text

def perform_fixes(line):
    trimmed = line.strip()
    # Skip headers
    if trimmed.startswith('#'):
        return line
    
    # Skip lines explicitly labeled as errors
    if any(kw in line for kw in SKIP_KEYWORDS):
        return line
        
    # Handle tables or comparison lines specifically
    # If a line has both an error and a correction (e.g. `lei tung` -> `leitung`)
    # we only want to fix the "correct" side if it's already identified.
    # But usually, we want to fix ALL instances in a "Correct" column.
    
    if '|' in line:
        # Table row: fix each cell individually unless it looks like an error cell
        cells = line.split('|')
        new_cells = []
        for cell in cells:
            if any(kw in cell for kw in SKIP_KEYWORDS) or '❌' in cell or '✗' in cell:
                new_cells.append(cell)
            else:
                new_cells.append(perform_fixes_on_text(cell))
        return '|'.join(new_cells)
    
    if '→' in line or '->' in line:
        separator = '→' if '→' in line else '->'
        parts = line.split(separator, 1)
        # Fix the second part (the target/result)
        parts[1] = perform_fixes_on_text(parts[1])
        return separator.join(parts)
    
    return perform_fixes_on_text(line)

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = [perform_fixes(line) for line in lines]
    
    if lines != new_lines:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        return True
    return False

def main():
    root = str(Path(__file__).resolve().parents[2]) + "/'
    count = 0
    for target in TARGET_DIRS:
        dir_path = os.path.join(root, target)
        if not os.path.exists(dir_path): continue
        
        for dirpath, _, filenames in os.walk(dir_path):
            for filename in filenames:
                if filename.endswith('.md'):
                    if process_file(os.path.join(dirpath, filename)):
                        print(f"Updated: {os.path.join(dirpath, filename)}")
                        count += 1
    print(f"Total files updated: {count}")

if __name__ == "__main__":
    main()

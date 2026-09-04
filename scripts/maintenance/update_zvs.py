import os
import re
import glob
import sys

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False

    original_content = content

    # We want to replace ZVS references when they refer to grammar/rules/standards,
    # but NOT when they refer to the Bible translation (e.g., "ZVS Bible", "ZVS translation", "ZVS (Zokam Standard Version)").

    # Regex patterns to replace
    # Replace "ZVS 2018 standard" -> "Zolai Standard"
    # Replace "ZVS v9 standard" -> "Zolai Standard"
    # Replace "ZVS v9" -> "Zolai Standard"
    # Replace "ZVS 2018" -> "Zolai Standard" (if not followed by Bible/translation)
    # Replace "ZVS Standard" -> "Zolai Standard"
    # Replace "ZVS standard" -> "Zolai Standard"
    # Replace "ZVS Tedim standard" -> "Zolai Standard"
    
    # Let's do some specific replacements first
    content = re.sub(r'\bZVS Tedim standard\b', 'Zolai Standard', content, flags=re.IGNORECASE)
    content = re.sub(r'\bZVS v9 standard\b', 'Zolai Standard', content, flags=re.IGNORECASE)
    content = re.sub(r'\bZVS 2018 standard\b', 'Zolai Standard', content, flags=re.IGNORECASE)
    content = re.sub(r'\bZVS v9\b', 'Zolai Standard', content, flags=re.IGNORECASE)
    
    # "ZVS 2018" not followed by Bible, translation, version
    content = re.sub(r'\bZVS 2018\b(?!\s+(Bible|translation|version|corpus))', 'Zolai Standard', content)
    
    # "ZVS Standard" or "ZVS standard"
    content = re.sub(r'\bZVS Standard\b', 'Zolai Standard', content)
    content = re.sub(r'\bZVS standard\b', 'Zolai Standard', content)
    
    # "ZVS dialect" -> "Zolai Standard dialect"
    content = re.sub(r'\bZVS dialect\b', 'Zolai Standard dialect', content, flags=re.IGNORECASE)
    
    # "ZVS compliant" -> "Zolai Standard compliant"
    content = re.sub(r'\bZVS compliant\b', 'Zolai Standard compliant', content, flags=re.IGNORECASE)
    
    # "ZVS grammar" -> "Zolai Standard grammar"
    content = re.sub(r'\bZVS grammar\b', 'Zolai Standard grammar', content, flags=re.IGNORECASE)
    
    # "ZVS rules" -> "Zolai Standard rules"
    content = re.sub(r'\bZVS rules\b', 'Zolai Standard rules', content, flags=re.IGNORECASE)
    
    # "ZVS word order" -> "Zolai Standard word order"
    content = re.sub(r'\bZVS word order\b', 'Zolai Standard word order', content, flags=re.IGNORECASE)
    
    # "ZVS negation" -> "Zolai Standard negation"
    content = re.sub(r'\bZVS negation\b', 'Zolai Standard negation', content, flags=re.IGNORECASE)
    
    # "ZVS correct spelling" -> "Zolai Standard correct spelling"
    content = re.sub(r'\bZVS correct spelling\b', 'Zolai Standard correct spelling', content, flags=re.IGNORECASE)

    # "ZVS words" -> "Zolai Standard words"
    content = re.sub(r'\bZVS words\b', 'Zolai Standard words', content, flags=re.IGNORECASE)

    # "ZVS forms" -> "Zolai Standard forms"
    content = re.sub(r'\bZVS forms\b', 'Zolai Standard forms', content, flags=re.IGNORECASE)

    # "ZVS (Zolai Verbal Standard)" -> "Zolai Standard"
    content = re.sub(r'\bZVS \(Zolai Verbal Standard\)\b', 'Zolai Standard', content, flags=re.IGNORECASE)

    # "ZVS" when used as an adjective for grammar, e.g. "ZVS usage", "ZVS format"
    content = re.sub(r'\bZVS usage\b', 'Zolai Standard usage', content, flags=re.IGNORECASE)
    content = re.sub(r'\bZVS format\b', 'Zolai Standard format', content, flags=re.IGNORECASE)
    content = re.sub(r'\bZVS orthography\b', 'Zolai Standard orthography', content, flags=re.IGNORECASE)

    # General fallback for ZVS when it's clearly about rules
    content = re.sub(r'\bZVS\b(?=\s+(rule|guideline|mandate|compliance|marker))', 'Zolai Standard', content, flags=re.IGNORECASE)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    modified_files = []
    
    # We will walk the directory and process all .md files
    for root, dirs, files in os.walk('.'):
        # skip .git and other hidden dirs or node_modules
        if '.git' in root or 'node_modules' in root or '.venv' in root or '.cursor' in root:
            continue
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                if process_file(filepath):
                    modified_files.append(filepath)
                    
    print(f"Modified {len(modified_files)} files:")
    for f in modified_files:
        print(f" - {f}")

if __name__ == '__main__':
    main()

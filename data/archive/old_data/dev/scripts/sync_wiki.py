import re
from pathlib import Path

def sync_wiki_from_auditor():
    """
    Parses check_stems.py and extracts the stem_errors dictionary,
    then automatically generates a Markdown table of forbidden words,
    syncing the auditor code with the documentation.
    """
    script_path = Path("/home/peter/Documents/Projects/zolai/dev/scripts/check_stems.py")
    wiki_path = Path("/home/peter/Documents/Projects/zolai/wiki/grammar/forbidden_stems_auto.md")
    
    if not script_path.exists():
        print(f"Error: {script_path} not found.")
        return
        
    print(f"Syncing rules from {script_path.name} to documentation...")
    
    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Regex to find the dictionary inside check_stems.py
    # Matches: stem_errors = { ... }
    dict_match = re.search(r"stem_errors\s*=\s*\{([^}]+)\}", content)
    
    if not dict_match:
        print("Could not locate stem_errors dictionary in check_stems.py")
        return
        
    dict_content = dict_match.group(1)
    
    # Extract key-value pairs (ignoring comments)
    rules = []
    for line in dict_content.split('\n'):
        if ':' in line and not line.strip().startswith('#'):
            parts = line.split(':')
            if len(parts) >= 2:
                # Clean up the regex and string quotes
                incorrect = re.sub(r'[r"\s,]', '', parts[0]).replace(r'\b', '')
                correct = re.sub(r'["\s,]', '', parts[1]).split('#')[0] # Split in case there's an inline comment
                rules.append((incorrect, correct))
    
    # Generate Markdown Table
    md_content = "# Auto-Generated: Forbidden Stem I Nominalizations\n\n"
    md_content += "This table is automatically synced from the `check_stems.py` auditor.\n\n"
    md_content += "| Incorrect (Stem I + na) | Correct (Stem II + na) | Note |\n"
    md_content += "| :--- | :--- | :--- |\n"
    
    for incorrect, correct in rules:
        if incorrect and correct:  # ensure no empty lines
            md_content += f"| `{incorrect}` | `{correct}` | *Auto-synced* |\n"
            
    with open(wiki_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
        
    print(f"Successfully generated {wiki_path} with {len(rules)} rules.")

if __name__ == "__main__":
    sync_wiki_from_auditor()

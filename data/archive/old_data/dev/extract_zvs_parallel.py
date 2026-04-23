import json
import argparse
import sys
import os
import re

def clean_html(raw_html):
    if not raw_html:
        return ""
    # Remove HTML tags but keep content
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    # Remove HTML entities like &nbsp; and <!-- -->
    cleantext = cleantext.replace('&nbsp;', ' ')
    cleantext = re.sub(r'<!--.*?-->', '', cleantext)
    # Fix spacing
    cleantext = re.sub(r'\s+', ' ', cleantext).strip()
    return cleantext

def extract_json_content(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        start_marker = "```text"
        end_marker = "```"
        start_idx = content.find(start_marker)
        if start_idx != -1:
            start_idx += len(start_marker)
            end_idx = content.find(end_marker, start_idx)
            if end_idx != -1:
                json_str = content[start_idx:end_idx].strip()
                return json.loads(json_str)
    return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--zvs", required=True)
    parser.add_argument("--english", required=True)
    parser.add_argument("--book_id", required=True) # For KJV
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    z_data = extract_json_content(args.zvs)
    e_data = extract_json_content(args.english)

    if not z_data or not e_data:
        print("Error: Could not extract JSON from source files.")
        return 1

    # ZVS structure is different: {"name": "...", "bookData": {"1": "<html>", ...}}
    z_book_name = z_data.get("name", "BOOK")
    z_book_data = z_data.get("bookData", {})
    
    # KJV structure: {"book": {"1": {"chapter": {"1": {"verse": {"1": {"text": "..."}}}}}}}
    e_book = e_data.get("book", {}).get(args.book_id, {})

    if not z_book_data or not e_book:
        print(f"Error: Book data not found.")
        return 1

    with open(args.output, "w", encoding="utf-8") as f:
        f.write(f"# {z_book_name}\n\n")
        
        for c_num in sorted(z_book_data.keys(), key=int):
            f.write(f"## Chapter {c_num}\n\n")
            
            # ZVS chapter text needs parsing
            chapter_html = z_book_data[c_num]
            # Simple regex to extract verses from ZVS HTML
            # Format: <span ... data-verseid="1"><sup ...> 1 </sup><span ...>Verse text</span></span>
            import re
            verses = re.findall(r'data-verseid="(\d+)"[^>]*>.*?<span data-verseid="\1">(.*?)</span>', chapter_html)
            
            e_chapter = e_book.get("chapter", {}).get(c_num, {})
            e_verses = e_chapter.get("verse", {})

            for v_num, z_html in verses:
                z_text = clean_html(z_html)
                e_text = e_verses.get(v_num, {}).get("text", "[Missing English]")
                
                f.write(f"**{c_num}:{v_num}**\n")
                f.write(f"Zolai: {z_text}\n")
                f.write(f"English: {e_text}\n\n")

    print(f"Successfully created parallel file: {args.output}")
    return 0

if __name__ == "__main__":
    sys.exit(main())

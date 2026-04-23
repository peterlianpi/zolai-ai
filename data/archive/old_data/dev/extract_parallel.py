import json
import argparse
import sys
import os


def extract_json_content(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        # Find the JSON block between ```text and ```
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
    parser.add_argument("--zolai", required=True)
    parser.add_argument("--english", required=True)
    parser.add_argument("--book", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    z_data = extract_json_content(args.zolai)
    e_data = extract_json_content(args.english)

    if not z_data or not e_data:
        print("Error: Could not extract JSON from source files.")
        return 1

    z_book = z_data.get("book", {}).get(args.book, {})
    e_book = e_data.get("book", {}).get(args.book, {})

    if not z_book or not e_book:
        print(f"Error: Book {args.book} not found in one of the files.")
        return 1

    book_name = z_book.get("info", {}).get("shortname", "BOOK")

    with open(args.output, "w", encoding="utf-8") as f:
        f.write(f"# {z_book.get('info', {}).get('name')} ({book_name})\n\n")

        z_chapters = z_book.get("chapter", {})
        e_chapters = e_book.get("chapter", {})

        for c_num in sorted(z_chapters.keys(), key=int):
            f.write(f"## Chapter {c_num}\n\n")
            z_verses = z_chapters[c_num].get("verse", {})
            e_verses = e_chapters.get(c_num, {}).get("verse", {})

            for v_num in sorted(z_verses.keys(), key=int):
                z_text = z_verses[v_num].get("text", "")
                e_text = e_verses.get(v_num, {}).get("text", "[Missing English]")
                f.write(f"**{c_num}:{v_num}**\n")
                f.write(f"Zolai: {z_text}\n")
                f.write(f"English: {e_text}\n\n")

    print(f"Successfully created parallel file: {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

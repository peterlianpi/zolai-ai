import os
import json
import re
from bs4 import BeautifulSoup


def clean_html(html_content):
    if not html_content:
        return ""
    soup = BeautifulSoup(html_content, "html.parser")
    # Remove verse numbers and other non-text elements if needed
    for sup in soup.find_all("sup"):
        sup.decompose()
    text = soup.get_text(separator=" ")
    # Clean up whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def process_zsv_bible(directory):
    corpus = []
    for filename in os.listdir(directory):
        if filename.endswith("_data.json"):
            filepath = os.path.join(directory, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                book_name = data.get("name", "Unknown")
                book_data = data.get("bookData", {})
                for chapter_num, html_content in book_data.items():
                    clean_text = clean_html(html_content)
                    if clean_text:
                        corpus.append(
                            {
                                "source": f"Zokam Standard Version - {book_name} {chapter_num}",
                                "text": clean_text,
                                "language": "ctd",
                                "type": "scripture",
                            }
                        )
    return corpus


def process_literature(root_dir):
    corpus = []
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".txt"):
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        corpus.append(
                            {
                                "source": f"Literature - {file}",
                                "text": content,
                                "language": "ctd",
                                "type": "literature",
                            }
                        )
    return corpus


if __name__ == "__main__":
    zsv_dir = "/home/peter/Documents/Linguistics/Zolai/Bibles/Zokam Standard Version"
    lit_dir = "/home/peter/Documents/Linguistics/Zolai/Literature"
    output_file = "/home/peter/Documents/Linguistics/Zolai/Corpus/zolai_corpus_v1.jsonl"

    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    all_data = []
    print("Processing ZSV Bible...")
    all_data.extend(process_zsv_bible(zsv_dir))
    print("Processing Literature...")
    all_data.extend(process_literature(lit_dir))

    with open(output_file, "w", encoding="utf-8") as f:
        for entry in all_data:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    print(f"Successfully synthesized {len(all_data)} entries into {output_file}")

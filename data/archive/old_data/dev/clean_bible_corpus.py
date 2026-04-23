import json
import os


def clean_bible_corpus():
    # Read the parallel corpus
    corpus_path = (
        "/home/peter/Documents/Linguistics/Zolai/Corpus/zolai_english_parallel.jsonl"
    )
    output_dir = "/home/peter/Documents/Linguistics/Zolai/Cleaned_Bible"

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Dictionary to store verses by book
    books = {}

    # Read and parse the JSONL file
    with open(corpus_path, "r", encoding="utf-8") as f:
        for line in f:
            data = json.loads(line.strip())
            ref = data["ref"]
            zolai = data["zolai"]
            english = data["english"]

            # Extract book name from reference (e.g., MAT from MAT 1:1)
            book = ref.split()[0]

            # Initialize book list if not exists
            if book not in books:
                books[book] = []

            # Add verse to book
            books[book].append({"ref": ref, "zolai": zolai, "english": english})

    # Write each book to a separate markdown file
    for book, verses in books.items():
        output_path = os.path.join(output_dir, f"{book.lower()}.md")
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(f"# {book} - Zolai/English Parallel Corpus\n\n")
            f.write(
                "This file contains cleaned parallel texts from the Zokam Standard Version (Zolai) and English translations (KJV/WEB).\n\n"
            )
            f.write("---\n\n")

            for verse in verses:
                f.write(f"**{verse['ref']}**\n")
                f.write(f"- **Zolai:** {verse['zolai']}\n")
                f.write(f"- **English:** {verse['english']}\n\n")

    print(f"Cleaned {len(books)} books to {output_dir}")


if __name__ == "__main__":
    clean_bible_corpus()

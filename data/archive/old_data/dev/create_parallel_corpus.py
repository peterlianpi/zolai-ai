import os
import xml.etree.ElementTree as ET
import json


def parse_usx(filepath):
    verses = {}
    try:
        tree = ET.parse(filepath)
        root = tree.getroot()
        current_chapter = "0"
        for elem in root.iter():
            if elem.tag == "chapter":
                current_chapter = elem.get("number")
            elif elem.tag == "verse":
                v_num = elem.get("number")
                # Get text following the verse marker
                text = ""
                if elem.tail:
                    text = elem.tail.strip()
                verses[f"{current_chapter}:{v_num}"] = text
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
    return verses


def create_parallel_corpus(zolai_dir, english_dir, output_file):
    # Map USX filenames to Bible book codes if needed, but they seem to match (JHN.usx)
    books = [
        "MAT",
        "MRK",
        "LUK",
        "JHN",
        "ACT",
        "ROM",
        "1CO",
        "2CO",
        "GAL",
        "EPH",
        "PHP",
        "COL",
        "1TH",
        "2TH",
        "1TI",
        "2TI",
        "TIT",
        "PHM",
        "HEB",
        "JAS",
        "1PE",
        "2PE",
        "1JN",
        "2JN",
        "3JN",
        "JUD",
        "REV",
    ]

    parallel_data = []

    for book in books:
        z_path = os.path.join(zolai_dir, f"{book}.usx")
        e_path = os.path.join(english_dir, f"{book}.usx")

        if os.path.exists(z_path) and os.path.exists(e_path):
            z_verses = parse_usx(z_path)
            e_verses = parse_usx(e_path)

            for ref, z_text in z_verses.items():
                if ref in e_verses and z_text and e_verses[ref]:
                    parallel_data.append(
                        {
                            "ref": f"{book} {ref}",
                            "zolai": z_text,
                            "english": e_verses[ref],
                        }
                    )

    with open(output_file, "w", encoding="utf-8") as f:
        for entry in parallel_data:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    print(f"Created parallel corpus with {len(parallel_data)} verses.")


if __name__ == "__main__":
    # TDB77 is Zolai (Tedim)
    zolai_usx_dir = (
        "/home/peter/Documents/Linguistics/Zolai/Bibles/Chin-Bible/TDB77/USX_1"
    )
    # 697e913c... is English (KJV/WEB likely)
    english_usx_dir = "/home/peter/Documents/Linguistics/Zolai/Bibles/Chin-Bible/Bibles/697e913c-fe45-4f55-87b0-7c156c52e87b/USX"

    output = (
        "/home/peter/Documents/Linguistics/Zolai/Corpus/zolai_english_parallel.jsonl"
    )
    create_parallel_corpus(zolai_usx_dir, english_usx_dir, output)

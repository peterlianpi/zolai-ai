import json
import re
import argparse
from pathlib import Path
from collections import Counter


def extract_vocabulary(file_path: str, output_path: str, target_source: str = None):
    """
    Extracts word frequencies from the Zolai corpus to build empirical lexicon data.
    """
    msg = f"Extracting vocabulary frequencies from {file_path}"
    if target_source:
        msg += f" [Source filter: {target_source}]"
    print(msg + "...")
    
    word_freq = Counter()
    total_words = 0
    
    # Common punctuation to strip (Zolai standard format)
    strip_pattern = re.compile(r'[.,!?;:"()\[\]{}\\/—\-]')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for idx, line in enumerate(f):
            try:
                data = json.loads(line)
                
                # Check for source filter
                if target_source and data.get('source') != target_source:
                    continue
                    
                # Ensure we only process Zolai text using 'output' or 'text'
                zolai_text = data.get('output', data.get('text', ''))
                
                # Convert to lower case for uniform counting, remove punctuation
                clean_text = strip_pattern.sub(' ', zolai_text.lower())
                
                # Split by space and filter out empty strings
                words = [w.strip() for w in clean_text.split() if w.strip()]
                
                word_freq.update(words)
                total_words += len(words)
                
            except json.JSONDecodeError:
                pass


    print(f"Total specific word tokens analyzed: {total_words}")
    print(f"Unique vocabulary words found: {len(word_freq)}")
    
    # Get top 1000 words
    top_vocab = word_freq.most_common(1000)
    
    # Save the output to JSON
    output_dict = {
        "metadata": {
            "source_file": file_path,
            "total_tokens": total_words,
            "unique_words": len(word_freq)
        },
        "top_1000_vocabulary": [
            {"word": word, "frequency": count} for word, count in top_vocab
        ]
    }
    
    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(out_file, 'w', encoding='utf-8') as out_f:
        json.dump(output_dict, out_f, ensure_ascii=False, indent=2)
        
    print(f"Vocabulary successfully exported to {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Zolai Vocab Extractor")
    parser.add_argument("--dataset", type=str, default="/home/peter/Documents/Projects/zolai/data/zolai_parallel_master.jsonl", help="Path to jsonl dataset")
    parser.add_argument("--source", type=str, default=None, help="Specific source to filter (e.g. 'tb77')")
    parser.add_argument("--output", type=str, default="/home/peter/Documents/Projects/zolai/data/vocabulary_frequency.json", help="Output path")
    args = parser.parse_args()
    
    dataset_path = args.dataset
    output_dest = args.output
    
    # Auto-modify output name if source is specified and output is default
    if args.source and output_dest.endswith("vocabulary_frequency.json"):
        output_dest = output_dest.replace(".json", f"_{args.source}.json")
    
    if Path(dataset_path).exists():
        extract_vocabulary(dataset_path, output_dest, args.source)
    else:
        print(f"Dataset not found at {dataset_path}")

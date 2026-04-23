import json
import re
from pathlib import Path
from collections import defaultdict


def check_alignment(file_path: str):
    """Checks parallel corpus for missing outputs or misaligned verse references."""
    print(f"Scanning {file_path} for verse alignment anomalies...")
    
    anomalies = []
    total_verses = 0
    empty_outputs = 0
    
    # Track verses per book and chapter to detect jumps
    # Structure: { "GEN_Tedim_Chin_Parallel": { "1": [1, 2, 3, ...], "2": [...] } }
    book_chapter_verses = defaultdict(lambda: defaultdict(list))
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for idx, line in enumerate(f):
            total_verses += 1
            try:
                data = json.loads(line)
                output_text = data.get('output', '').strip()
                ref = data.get('metadata', {}).get('reference', '')
                
                if not output_text:
                    empty_outputs += 1
                    anomalies.append(f"Line {idx+1}: Empty output for {ref}")
                
                # Parse reference, e.g. "GEN_Tedim_Chin_Parallel 1:1"
                match = re.search(r"(\w+)\s+(\d+):(\d+)", ref)
                if match:
                    book, ch, vs = match.groups()
                    book_chapter_verses[book][ch].append(int(vs))
                    
            except json.JSONDecodeError:
                anomalies.append(f"Line {idx+1}: Invalid JSON")

    print(f"Total Verses Scanned: {total_verses}")
    print(f"Empty Zolai Outputs Found: {empty_outputs}")
    
    # Check for verse sequence gaps
    sequence_gaps = 0
    for book, chapters in book_chapter_verses.items():
        for ch, verses in chapters.items():
            verses = sorted(set(verses))
            if not verses:
                continue
            # Simple sequence check (Note: some OT verses are inherently missing in standard MS)
            for i in range(len(verses) - 1):
                if verses[i+1] - verses[i] > 1:
                    sequence_gaps += 1
                    anomalies.append(f"Gap detected in {book} Chapter {ch}: Jumped from {verses[i]} to {verses[i+1]}")
    
    print(f"Sequence Gaps Detected: {sequence_gaps}")
    
    if empty_outputs > 0 or sequence_gaps > 0:
        print("\n--- Summary of Anomalies (Top 20) ---")
        for anomaly in anomalies[:20]:
            print(anomaly)
    else:
        print("\nAlignment Check Passed: No empty outputs in standard data formats.")


if __name__ == "__main__":
    dataset_path = "/home/peter/Documents/Projects/zolai/data/zolai_parallel_master.jsonl"
    if Path(dataset_path).exists():
        check_alignment(dataset_path)
    else:
        print(f"Dataset not found at {dataset_path}")

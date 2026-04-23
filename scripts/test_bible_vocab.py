#!/usr/bin/env python3
"""Test Bible vocab extraction on 3 books first."""
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]) + "/scripts")
from learn_bible_vocab import *

def main():
    print("=" * 70)
    print("BIBLE VOCAB TEST — 3 Books Sample")
    print("=" * 70)
    
    # Test on 3 diverse books
    test_books = ["GEN", "PSA", "JHN"]
    
    books = sorted(BIBLE_DIR.glob("*_Parallel.md"))
    books = [b for b in books if any(t in b.stem for t in test_books)]
    
    print(f"\nTesting on {len(books)} books: {', '.join(test_books)}\n")
    
    total_items = 0
    
    for book_idx, book_path in enumerate(books, 1):
        book_name = book_path.stem.replace("_Tedim_Chin_Parallel", "")
        print(f"[{book_idx}/{len(books)}] {book_name}")
        
        text = book_path.read_text(encoding="utf-8")
        chunks = chunk_verses(text)
        
        # Process only first 5 chunks per book
        for chunk_idx in range(1, min(6, len(chunks) + 1)):
            chunk_text = chunks[chunk_idx - 1]
            if len(chunk_text.strip()) < 100:
                continue
            
            print(f"  [{chunk_idx}/5] ", end="", flush=True)
            
            try:
                data, provider = call_api(chunk_text)
                items = save_results(book_name, chunk_idx, data)
                total_items += items
                print(f"✓ {provider} | {items} items", flush=True)
                time.sleep(2)
            except Exception as e:
                print(f"✗ {e}", flush=True)
    
    print("\n" + "=" * 70)
    print(f"TEST COMPLETE: {total_items} items from 3 books × 5 chunks")
    print(f"Output: {OUTPUT_DIR}")
    print("=" * 70)

if __name__ == "__main__":
    raise SystemExit(main())

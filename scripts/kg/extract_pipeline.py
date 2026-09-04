import sys
import json
import sqlite3
import requests
from typing import List, Dict
from transformers import pipeline

# Configuration
DB_PATH = "kg.db"
GEMINI_SERVER_URL = "http://localhost:8000/v1/chat/completions"

# Initialize NER (mBERT or XLM-R)
# Note: 'dslim/bert-base-NER' is English-centric but supports multilingual context via mBERT fine-tuning
# For Zolai, a multilingual model like xlm-roberta-large-ner-hrl is often preferred
ner_pipeline = pipeline("ner", model="xlm-roberta-large-ner-hrl", aggregation_strategy="simple")

def get_relationships(text: str, entities: List[Dict]) -> List[Dict]:
    """Calls local gemini-server to extract predicates between entities."""
    prompt = f"""
    Text: {text}
    Entities: {', '.join([e['word'] for e in entities])}
    Extract relationships in ZSP format: [Subject] --[Predicate]--> [Object]
    Output JSON list only: [{"s": "...", "p": "...", "o": "..."}]
    """
    try:
        resp = requests.post(GEMINI_SERVER_URL, json={
            "model": "gemini-pro",
            "messages": [{"role": "user", "content": prompt}]
        })
        return resp.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"RE Error: {e}")
        return []

def save_to_kg(triples: List[Dict]):
    """Inserts triples into KgNode and KgEdge tables."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    for t in triples:
        # Ensure nodes exist
        for label in [t['s'], t['o']]:
            cur.execute(
                "INSERT OR IGNORE INTO kg_node (id, iri, label, kind) VALUES (?, ?, ?, ?)",
                (label, f"zolai:{label}", label, "Entity")
            )
        
        # Insert Edge
        cur.execute(
            "INSERT OR IGNORE INTO kg_edge (fromId, toId, predicate, sourceKey) VALUES (?, ?, ?, ?)",
            (t['s'], t['o'], t['p'], "extraction_pipeline")
        )
    
    conn.commit()
    conn.close()

def process_text(text: str):
    print(f"Processing: {text[:50]}...")
    ner_results = ner_pipeline(text)
    print(f"Extracted {len(ner_results)} entities.")
    
    relationships = get_relationships(text, ner_results)
    if isinstance(relationships, str):
        relationships = json.loads(relationships)
        
    save_to_kg(relationships)
    print(f"Saved {len(relationships)} triples to {DB_PATH}.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        process_text(sys.argv[1])

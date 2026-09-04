#!/usr/bin/env python3
import sqlite3
import json
import requests
from transformers import pipeline
from rdflib import Graph, URIRef, Literal, Namespace

# Configuration
DB_PATH = "zolai.db"
GEMINI_SERVER_URL = "http://localhost:8080/v1/chat/completions"
NER_MODEL = "Davlan/xlm-roberta-base-ner-hrl"
ZK = Namespace("zolai-kg:")

def extract_entities(text):
    ner = pipeline("ner", model=NER_MODEL, aggregation_strategy="simple")
    results = ner(text)
    # Map NER tags to KG kinds
    mapping = {"PER": "Person", "LOC": "Place", "ORG": "Organization", "MISC": "Concept"}
    entities = []
    for res in results:
        entities.append({
            "label": res["word"],
            "kind": mapping.get(res["entity_group"], "Concept"),
            "iri": f"zolai:ent:{res['word'].lower().replace(' ', '_')}"
        })
    return entities

def extract_relationships(text, entities):
    if len(entities) < 2:
        return []
    
    prompt = f"Text: {text}\nEntities: {', '.join([e['label'] for e in entities])}\nExtract relationships as RDF triples in ZSP protocol [Subject] --[Predicate]--> [Object]. Use Zolai predicates."
    
    payload = {
        "model": "gemini-pro",
        "messages": [{"role": "user", "content": prompt}]
    }
    
    try:
        response = requests.post(GEMINI_SERVER_URL, json=payload)
        raw_triples = response.json()["choices"][0]["message"]["content"]
        # Simple parser for ZSP format
        triples = []
        for line in raw_triples.splitlines():
            if "--" in line and "-->" in line:
                s = line.split("--")[0].strip(" []")
                p = line.split("--")[1].split("-->")[0].strip()
                o = line.split("-->")[1].strip(" []")
                triples.append((s, p, o))
        return triples
    except Exception as e:
        print(f"Relationship extraction failed: {e}")
        return []

def save_to_db(entities, relationships):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    # Insert Nodes
    for ent in entities:
        cur.execute("""
            INSERT OR IGNORE INTO kg_node (id, iri, kind, label, properties) 
            VALUES (?, ?, ?, ?, ?)
        """, (ent["iri"], ent["iri"], ent["kind"], ent["label"], json.dumps({})))
    
    # Insert Edges
    for s, p, o in relationships:
        # Map labels back to IRIs (simplified)
        s_iri = f"zolai:ent:{s.lower().replace(' ', '_')}"
        o_iri = f"zolai:ent:{o.lower().replace(' ', '_')}"
        cur.execute("""
            INSERT OR IGNORE INTO kg_edge (id, fromId, toId, predicate, sourceKey) 
            VALUES (?, ?, ?, ?, 'extraction-pipeline')
        """, (f"{s_iri}-{p}-{o_iri}", s_iri, o_iri, p))
    
    conn.commit()
    conn.close()

def run_pipeline(text):
    entities = extract_entities(text)
    relationships = extract_relationships(text, entities)
    save_to_db(entities, relationships)
    return {"entities": entities, "triples": relationships}

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        print(json.dumps(run_pipeline(sys.argv[1]), indent=2))

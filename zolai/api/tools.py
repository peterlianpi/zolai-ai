from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
import json
import os
from typing import List, Optional

app = FastAPI(title="Zolai Tool API")

# Update this path if the API is moved
DB_PATH = 'data/master_unified_dictionary.db'

class SearchResult(BaseModel):
    headword: str
    pos: List[str]
    sources: List[str]
    translations: List[str]
    explanations: List[Optional[str]]

class SearchQuery(BaseModel):
    query: str

class GrammarQuery(BaseModel):
    sentence: str

class GrammarResponse(BaseModel):
    is_valid: bool
    feedback: str
    suggestions: List[str]

def get_db_connection():
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=500, detail="Database file not found.")
    return sqlite3.connect(DB_PATH)

@app.post("/verify-grammar", response_model=GrammarResponse)
async def verify_grammar(payload: GrammarQuery):
    sentence = payload.sentence
    feedback = []
    suggestions = []
    is_valid = True

    # Simple Zolai Standard Rule Checks (as per project mandates)
    if "uhhi" in sentence and ("i " in sentence or "i-" in sentence):
        is_valid = False
        feedback.append("Invalid plurality: 'uhhi' should not be used with first-person inclusive 'i' (we).")
        suggestions.append("Use 'i [verb] hi' instead.")
    
    if "lo leh" in sentence:
        is_valid = False
        feedback.append("Use 'kei' for conditionals.")
        suggestions.append(f"Replace 'lo leh' with 'kei leh'.")
    
    if is_valid:
        return GrammarResponse(is_valid=True, feedback="Sentence appears to follow Tedim Zolai Standard.", suggestions=[])
    else:
        return GrammarResponse(is_valid=False, feedback="; ".join(feedback), suggestions=suggestions)

@app.post("/search-dict", response_model=List[SearchResult])
async def search_dictionary(payload: SearchQuery):
    conn = get_db_connection()
    c = conn.cursor()
    query = payload.query.lower().strip()
    
    results = []

    # 1. Exact Match
    c.execute('SELECT raw_json FROM entries WHERE headword = ?', (query,))
    for row in c.fetchall():
        results.append(json.loads(row[0]))

    # 2. Translation Match
    if not results:
        c.execute('''
            SELECT entries.raw_json FROM translations 
            JOIN entries ON translations.entry_id = entries.id 
            WHERE translations.translation = ?
        ''', (query,))
        for row in c.fetchall():
            res = json.loads(row[0])
            if res not in results: results.append(res)

    conn.close()
    
    # Map raw_json to Pydantic model
    formatted_results = [
        SearchResult(
            headword=r.get("headword", ""),
            pos=r.get("pos", []),
            sources=r.get("sources", []),
            translations=r.get("translations", []),
            explanations=r.get("explanations", [])
        ) for r in results
    ]
    
    return formatted_results

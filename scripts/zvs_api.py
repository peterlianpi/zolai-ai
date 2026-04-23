import sqlite3
import json
import re

class ZVSTranslator:
    def __init__(self, db_path="data/dictionary/db/zvs_master_dictionary.db"):
        self.db_path = db_path

    def _apply_zvs_rules(self, text, register):
        """Applies linguistic constraints like Inclusive 'i', stem logic, and culinary rules."""
        # Rule: Inclusive 'i' + [verb] + hi (no uhhi)
        text = re.sub(r'\bi\s+(.*?)\s+uhhi\b', r'i \1 hi', text)
        
        # Culinery Rules
        if register == "conversational":
            text = text.replace("thip", "thak") # Force spicy standard
            text = text.replace("thau", "sathau") if "huan" in text or "kan" in text else text
            
        return text

    def get_zvs_translation(self, query, register="conversational"):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT raw_json FROM entries WHERE headword = ? OR translations LIKE ? LIMIT 1", (query, f"%{query}%"))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            data = json.loads(row[0])
            example = data.get("example", "Example not found.")
            # Standardize based on register
            example = self._apply_zvs_rules(example, register)
            return {"zolai": data.get("zolai"), "example": example}
        return {"error": "Translation pending ZVS verification."}

if __name__ == "__main__":
    # Example for Next.js integration
    translator = ZVSTranslator()
    print(json.dumps(translator.get_zvs_translation("Onion")))

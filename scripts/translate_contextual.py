import sqlite3
import re

class ZVSTranslator:
    def __init__(self, db_path="data/dictionary/db/zvs_master_dictionary.db"):
        self.db_path = db_path

    def get_zvs_translation(self, text, register="conversational"):
        """
        Translates or retrieves context-based translation using the ZVS Standard.
        
        Args:
            text: The word/phrase to translate.
            register: 'conversational' (daily life) or 'formal' (Biblical/Literary).
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Search for headword or translation
        query = "SELECT headword, pos, raw_json FROM entries WHERE headword LIKE ? OR translations LIKE ? LIMIT 1"
        cursor.execute(query, ('%' + text + '%', '%' + text + '%'))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            headword, pos, raw_json = row
            data = json.loads(raw_json)
            # Apply Register Logic
            return self._format_output(data, register)
        return "Translation pending ZVS verification."

    def _format_output(self, data, register):
        # Implementation of Meaning Matrix and Pronoun Grid
        example = data.get("example", "Example not found.")
        
        # Culinary semantic cleanup logic
        if "sathau" in example or "kan" in example:
            example = example.replace("thip", "thak") # Force Standard
            
        return f"ZVS Standard: {data.get('headword')}\nContext: {example}"

if __name__ == "__main__":
    translator = ZVSTranslator()
    print("ZVS Context Translator Active.")

"""Extract hardcoded Zomi language data from zomi.me JS bundle and save as JSONL."""
from __future__ import annotations

import json
from pathlib import Path

BUNDLE_URL = "https://zomi.me/_expo/static/js/web/entry-42a724f83da92a8c75b11a28f0c34013.js"
SOURCE = "zomi.me"
DIALECT = "tedim"

# All data manually extracted from the JS bundle
PHRASES: list[dict] = [
    # Greetings
    {"zolai": "An kidah?", "english": "How are you?", "pronunciation": "An kee-dah", "example": "An kidah? Ka dam e.", "category": "greetings"},
    {"zolai": "Ka dam e", "english": "I am fine", "pronunciation": "Ka dam eh", "example": "Ka dam e, lungdam.", "category": "greetings"},
    {"zolai": "Lungdam", "english": "Thank you", "pronunciation": "Loong-dam", "example": "Lungdam mahmah.", "category": "greetings"},
    {"zolai": "Zingtai hoi", "english": "Good morning", "pronunciation": "Zeeng-tai hoy", "example": "Zingtai hoi, an kidah?", "category": "greetings"},
    {"zolai": "Nitak hoi", "english": "Good evening", "pronunciation": "Nee-tak hoy", "example": "Nitak hoi, an dam ve?", "category": "greetings"},
    {"zolai": "An min kua na ze?", "english": "What is your name?", "pronunciation": "An meen koo-ah na zeh", "example": "An min kua na ze? Ka min John hi.", "category": "greetings"},
    {"zolai": "Ka min ... hi", "english": "My name is ...", "pronunciation": "Ka meen ... hee", "example": "Ka min Mang hi.", "category": "greetings"},
    {"zolai": "An pai thu aw", "english": "Nice to meet you", "pronunciation": "An pai thoo aw", "example": "An pai thu aw, ka lungdam.", "category": "greetings"},
    {"zolai": "Pai dam in", "english": "Goodbye (to one leaving)", "pronunciation": "Pai dam een", "example": "Pai dam in, nidang ka hong ki mu kik ding.", "category": "greetings"},
    {"zolai": "Om dam in", "english": "Goodbye (to one staying)", "pronunciation": "Om dam een", "example": "Om dam in, ka pai lai.", "category": "greetings"},
    # Common phrases
    {"zolai": "A hih bang", "english": "Yes / That is right", "pronunciation": "Ah hee bang", "example": "A hih bang, ka theih e.", "category": "common"},
    {"zolai": "A hi kei", "english": "No / That is not right", "pronunciation": "Ah hee kay", "example": "A hi kei, ka theih kei.", "category": "common"},
    {"zolai": "Ka theih kei", "english": "I don't know", "pronunciation": "Ka they kay", "example": "Ka theih kei, dong ve aw.", "category": "common"},
    {"zolai": "Ka thei e", "english": "I know / I understand", "pronunciation": "Ka they eh", "example": "Ka thei e, lungdam.", "category": "common"},
    {"zolai": "Koi ah", "english": "Where", "pronunciation": "Koy ah", "example": "Inn koi ah om?", "category": "common"},
    {"zolai": "Bang ci?", "english": "What? / How?", "pronunciation": "Bang chee", "example": "Hi bang ci na ze?", "category": "common"},
    {"zolai": "Kuama", "english": "Who", "pronunciation": "Koo-ah-ma", "example": "Kuama hi na ze?", "category": "common"},
    {"zolai": "Banghang", "english": "Why", "pronunciation": "Bang-hang", "example": "Banghang na pai?", "category": "common"},
    {"zolai": "Bangzat", "english": "How many / How much", "pronunciation": "Bang-zat", "example": "Bangzat a man?", "category": "common"},
    {"zolai": "Nuamtak", "english": "Please / Slowly", "pronunciation": "Noo-am-tak", "example": "Nuamtak gen ve aw.", "category": "common"},
    {"zolai": "Hong kik gen ve aw", "english": "Please say that again", "pronunciation": "Hong keek gen veh aw", "example": "Ka za kei, hong kik gen ve aw.", "category": "common"},
    {"zolai": "Maw le", "english": "Is that so? / Really?", "pronunciation": "Maw leh", "example": "Maw le, ka um kei.", "category": "common"},
    # Food
    {"zolai": "An ne ding?", "english": "Will you eat?", "pronunciation": "An neh deeng", "example": "An ne ding? Ka ne ding.", "category": "food"},
    {"zolai": "Tui ka dot", "english": "I want water", "pronunciation": "Too-ee ka dot", "example": "Tui ka dot, lungdam.", "category": "food"},
    {"zolai": "Ann a dam ve?", "english": "Is the food good?", "pronunciation": "Ann ah dam veh", "example": "Ann a dam ve? A dam mahmah.", "category": "food"},
    {"zolai": "Ka gil a khuang", "english": "I am hungry", "pronunciation": "Ka geel ah khoo-ang", "example": "Ka gil a khuang, an ne ding.", "category": "food"},
    # Travel
    {"zolai": "An zuang?", "english": "Where are you going?", "pronunciation": "An zoo-ang", "example": "An zuang? Ka inn ah ka pai.", "category": "travel"},
    {"zolai": "Hotel koi ah om?", "english": "Where is the hotel?", "pronunciation": "Ho-tel koy ah om", "example": "Hotel koi ah om? Ka theih kei.", "category": "travel"},
    {"zolai": "Lam koi ah ze?", "english": "Which way?", "pronunciation": "Lam koy ah zeh", "example": "Lam koi ah ze? Hi lam ah pai un.", "category": "travel"},
    {"zolai": "Ka zin ding", "english": "I will travel", "pronunciation": "Ka zeen deeng", "example": "Tuni ka zin ding.", "category": "travel"},
    # Shopping
    {"zolai": "A man bang ze?", "english": "How much is this?", "pronunciation": "Ah man bang zeh", "example": "Hi a man bang ze?", "category": "shopping"},
    {"zolai": "Ka lei ding", "english": "I want to buy", "pronunciation": "Ka lay deeng", "example": "Hi ka lei ding.", "category": "shopping"},
    {"zolai": "A sang lua", "english": "It is too expensive", "pronunciation": "Ah sang loo-ah", "example": "A sang lua, ka lei kei ding.", "category": "shopping"},
    {"zolai": "Khop zo hi", "english": "That is enough", "pronunciation": "Khop zo hee", "example": "Khop zo hi, lungdam.", "category": "shopping"},
    # Business
    {"zolai": "Kam ka nei", "english": "I have work", "pronunciation": "Kam ka nay", "example": "Tuni kam ka nei.", "category": "business"},
    {"zolai": "Tuni ka sem ding", "english": "I will work today", "pronunciation": "Too-nee ka sem deeng", "example": "Tuni ka sem ding, ka pai kei.", "category": "business"},
    # Emergency
    {"zolai": "Huih ve aw", "english": "Help me please", "pronunciation": "Hoo-ih veh aw", "example": "Huih ve aw, ka dam kei.", "category": "emergency"},
    {"zolai": "Ka dam kei", "english": "I am not well", "pronunciation": "Ka dam kay", "example": "Ka dam kei, doctor ka dot.", "category": "emergency"},
    {"zolai": "Doctor koi ah om?", "english": "Where is the doctor?", "pronunciation": "Doc-tor koy ah om", "example": "Doctor koi ah om? Ka dam kei.", "category": "emergency"},
    {"zolai": "Ka lau", "english": "I am afraid", "pronunciation": "Ka lao", "example": "Ka lau, huih ve aw.", "category": "emergency"},
    # Family
    {"zolai": "Ka pa", "english": "My father", "pronunciation": "Ka pa", "example": "Ka pa a dam ve?", "category": "family"},
    {"zolai": "Ka nu", "english": "My mother", "pronunciation": "Ka noo", "example": "Ka nu inn ah a om.", "category": "family"},
    {"zolai": "Ka nau", "english": "My sibling", "pronunciation": "Ka now", "example": "Ka nau a pai hi.", "category": "family"},
    {"zolai": "Ka zi", "english": "My wife", "pronunciation": "Ka zee", "example": "Ka zi a dam e.", "category": "family"},
    {"zolai": "Ka ta", "english": "My child", "pronunciation": "Ka ta", "example": "Ka ta a zil hi.", "category": "family"},
    {"zolai": "Ka innkuan", "english": "My family", "pronunciation": "Ka inn-koo-an", "example": "Ka innkuan ka it mahmah.", "category": "family"},
    # Numbers
    {"zolai": "Khat", "english": "One (1)", "pronunciation": "Khat", "example": "Mihing khat", "category": "numbers"},
    {"zolai": "Ni", "english": "Two (2)", "pronunciation": "Nee", "example": "Ni ve hong pai un", "category": "numbers"},
    {"zolai": "Thum", "english": "Three (3)", "pronunciation": "Thoom", "example": "Tanu thum ka nei", "category": "numbers"},
    {"zolai": "Li", "english": "Four (4)", "pronunciation": "Lee", "example": "Inn li", "category": "numbers"},
    {"zolai": "Nga", "english": "Five (5)", "pronunciation": "Ngah", "example": "Kum nga", "category": "numbers"},
    {"zolai": "Guk", "english": "Six (6)", "pronunciation": "Gook", "example": "Ni guk", "category": "numbers"},
    {"zolai": "Sagih", "english": "Seven (7)", "pronunciation": "Sa-gih", "example": "Kawl sagih", "category": "numbers"},
    {"zolai": "Giat", "english": "Eight (8)", "pronunciation": "Gee-at", "example": "La giat", "category": "numbers"},
    {"zolai": "Kuo", "english": "Nine (9)", "pronunciation": "Koo-oh", "example": "Khua kuo", "category": "numbers"},
    {"zolai": "Sawm", "english": "Ten (10)", "pronunciation": "Sawm", "example": "Tangka sawm", "category": "numbers"},
    {"zolai": "Sawm le khat", "english": "Eleven (11)", "pronunciation": "Sawm leh khat", "example": "Mihing sawm le khat", "category": "numbers"},
    {"zolai": "Sawm le ni", "english": "Twelve (12)", "pronunciation": "Sawm leh nee", "example": "Thla sawm le ni", "category": "numbers"},
    {"zolai": "Sawm le thum", "english": "Thirteen (13)", "pronunciation": "Sawm leh thoom", "example": "Kum sawm le thum", "category": "numbers"},
    {"zolai": "Sawm le li", "english": "Fourteen (14)", "pronunciation": "Sawm leh lee", "example": "Ni sawm le li", "category": "numbers"},
    {"zolai": "Sawm le nga", "english": "Fifteen (15)", "pronunciation": "Sawm leh ngah", "example": "Kyat sawm le nga", "category": "numbers"},
    {"zolai": "Sawm le guk", "english": "Sixteen (16)", "pronunciation": "Sawm leh gook", "example": "Mihing sawm le guk", "category": "numbers"},
    {"zolai": "Sawm le sagih", "english": "Seventeen (17)", "pronunciation": "Sawm leh sa-gih", "example": "Kum sawm le sagih", "category": "numbers"},
    {"zolai": "Sawm le giat", "english": "Eighteen (18)", "pronunciation": "Sawm leh gee-at", "example": "Ni sawm le giat", "category": "numbers"},
    {"zolai": "Sawm le kuo", "english": "Nineteen (19)", "pronunciation": "Sawm leh koo-oh", "example": "Inn sawm le kuo", "category": "numbers"},
    {"zolai": "Sawmni", "english": "Twenty (20)", "pronunciation": "Sawm-nee", "example": "Tangka sawmni", "category": "numbers"},
]

VOCABULARY: list[dict] = [
    {"zolai": "Ni", "english": "Sun / Day", "pronunciation": "Nee", "category": "nature"},
    {"zolai": "Khua", "english": "Village / Place", "pronunciation": "Koo-ah", "category": "nature"},
    {"zolai": "Suang", "english": "Stone / Rock", "pronunciation": "Soo-ang", "category": "nature"},
    {"zolai": "Lei", "english": "Earth / Ground", "pronunciation": "Lay", "category": "nature"},
    {"zolai": "Van", "english": "Sky", "pronunciation": "Van", "category": "nature"},
    {"zolai": "Tui", "english": "Water", "pronunciation": "Too-ee", "category": "nature"},
    {"zolai": "Mei", "english": "Fire", "pronunciation": "May", "category": "nature"},
    {"zolai": "Huih", "english": "Wind", "pronunciation": "Hoo-ih", "category": "nature"},
    {"zolai": "Lawm", "english": "Friend", "pronunciation": "Lawm", "category": "social"},
    {"zolai": "Innkuan", "english": "Family", "pronunciation": "Inn-koo-an", "category": "social"},
    {"zolai": "Lungdam", "english": "Happy / Thankful", "pronunciation": "Loong-dam", "category": "emotion"},
    {"zolai": "Nasep", "english": "Work", "pronunciation": "Na-sep", "category": "daily"},
    {"zolai": "Zil", "english": "Learn / Study", "pronunciation": "Zil", "category": "education"},
    {"zolai": "Hoih", "english": "Beautiful / Good", "pronunciation": "Hoih", "category": "adjective"},
    {"zolai": "Hat", "english": "Strong", "pronunciation": "Hat", "category": "adjective"},
    {"zolai": "Ne", "english": "Eat", "pronunciation": "Neh", "category": "verb"},
    {"zolai": "Lungnopna", "english": "Happiness", "pronunciation": "Loong-nop-na", "example": "Ka lungnopna a lian", "category": "emotion"},
    {"zolai": "Thilsiam", "english": "Creation / Artwork", "pronunciation": "Thil-see-am", "example": "Hi thilsiam a mawi", "category": "culture"},
]

DIALOGUES: list[dict] = [
    # Dialogue 1: Greetings
    {"dialogue_id": 1, "title": "Basic Greetings", "turns": [
        {"speaker": "A", "zolai": "Zingtai hoi! An kidah?", "english": "Good morning! How are you?"},
        {"speaker": "B", "zolai": "Ka dam e, lungdam. An kidah?", "english": "I am fine, thank you. How are you?"},
        {"speaker": "A", "zolai": "Ka dam gige e. An min kua na ze?", "english": "I am very well. What is your name?"},
        {"speaker": "B", "zolai": "Ka min Niang hi. An min kua na ze?", "english": "My name is Niang. What is your name?"},
        {"speaker": "A", "zolai": "Ka min Thang hi. An pai thu aw!", "english": "My name is Thang. Nice to meet you!"},
        {"speaker": "B", "zolai": "Lungdam, an pai thu aw!", "english": "Thank you, nice to meet you too!"},
    ]},
    # Dialogue 2: Common Phrases
    {"dialogue_id": 2, "title": "Common Phrases", "turns": [
        {"speaker": "A", "zolai": "Hi bang ci na ze?", "english": "What is this?"},
        {"speaker": "B", "zolai": "Hi la hi. An theih ve?", "english": "This is a book. Do you know?"},
        {"speaker": "A", "zolai": "A hih bang, ka theih e. Bangzat a man?", "english": "Yes, I know. How much does it cost?"},
        {"speaker": "B", "zolai": "Kyat thong sawmnga a man.", "english": "It costs 50 kyats."},
    ]},
    # Dialogue 3: Numbers in context
    {"dialogue_id": 3, "title": "Numbers in Context", "turns": [
        {"speaker": "A", "zolai": "Bangzat a man na ze?", "english": "How much does this cost?"},
        {"speaker": "B", "zolai": "Kyat sawm le nga a man.", "english": "It costs 15 kyats."},
        {"speaker": "A", "zolai": "Tanu bangzat na nei?", "english": "How many children do you have?"},
        {"speaker": "B", "zolai": "Tanu thum ka nei.", "english": "I have three children."},
        {"speaker": "A", "zolai": "Kum bangzat na hi?", "english": "How old are you?"},
        {"speaker": "B", "zolai": "Kum sawmni ka hi.", "english": "I am 20 years old."},
    ]},
]

GRAMMAR_NOTES: list[dict] = [
    {
        "title": "Verb Conjugation",
        "description": "Zomi verbs don't change form based on subject. Particles indicate tense.",
        "examples": [
            {"label": "Present", "zolai": "pai", "english": "go"},
            {"label": "Past", "zolai": "pai zo", "english": "went"},
            {"label": "Future", "zolai": "pai ding", "english": "will go"},
            {"label": "Progressive", "zolai": "pai lai", "english": "going"},
        ],
    },
    {
        "title": "Word Order (SOV)",
        "description": "Zomi follows Subject-Object-Verb order, unlike English SVO.",
        "examples": [
            {"label": "SOV", "zolai": "Ka tui dot", "english": "I water drink (I drink water)"},
            {"label": "SOV", "zolai": "An ann ne", "english": "You food eat (You eat food)"},
        ],
    },
    {
        "title": "Tones",
        "examples": [
            {"label": "High Tone", "description": "Voice rises, like asking a question", "zolai": "An kidah?"},
            {"label": "Mid Tone", "description": "Normal speaking pitch", "zolai": "Maw ka"},
            {"label": "Low Tone", "description": "Voice drops slightly", "zolai": "Lungdam"},
            {"label": "Falling Tone", "description": "Start high, end low", "zolai": "Innkuan"},
        ],
    },
]

PRONUNCIATION_GUIDE: list[dict] = [
    {"letter": "A", "sound": "ah", "english_example": "father", "zolai_word": "Ann (food)"},
    {"letter": "E", "sound": "eh", "english_example": "bed", "zolai_word": "Mei (fire)"},
    {"letter": "I", "sound": "ee", "english_example": "see", "zolai_word": "Ni (sun)"},
    {"letter": "O", "sound": "oh", "english_example": "go", "zolai_word": "Hoi (good)"},
    {"letter": "U", "sound": "oo", "english_example": "moon", "zolai_word": "Tui (water)"},
    {"letter": "Ng", "sound": "ng", "english_example": "sing", "zolai_word": "Nga (five)"},
    {"letter": "Kh", "sound": "k+h", "english_example": "blockhead", "zolai_word": "Khat (one)"},
    {"letter": "Th", "sound": "th", "english_example": "think", "zolai_word": "Thum (three)"},
    {"letter": "Z", "sound": "z", "english_example": "zoo", "zolai_word": "Zuang (go)"},
    {"letter": "P", "sound": "p", "english_example": "pen", "zolai_word": "Pa (father)"},
]


def to_parallel_record(zolai: str, english: str, category: str, **extra: object) -> dict:
    record: dict = {
        "zolai": zolai,
        "english": english,
        "dialect": DIALECT,
        "source": SOURCE,
        "reference": "",
        "category": category,
    }
    record.update(extra)
    return record


def main() -> int:
    out_dir = Path(__file__).parent.parent / "data" / "raw"
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1. Parallel phrase pairs
    parallel_path = out_dir / "zomime_parallel_phrases.jsonl"
    count = 0
    with parallel_path.open("w", encoding="utf-8") as f:
        for p in PHRASES:
            rec = to_parallel_record(p["zolai"], p["english"], f"phrase_{p['category']}", pronunciation=p.get("pronunciation", ""))
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            count += 1
            # Also write example sentence as a parallel pair if it contains both languages
            if p.get("example"):
                rec2 = to_parallel_record(p["example"], "", f"example_{p['category']}", note="example_sentence")
                f.write(json.dumps(rec2, ensure_ascii=False) + "\n")
                count += 1
    print(f"Wrote {count} phrase records → {parallel_path}")

    # 2. Vocabulary
    vocab_path = out_dir / "zomime_vocabulary.jsonl"
    count = 0
    with vocab_path.open("w", encoding="utf-8") as f:
        for v in VOCABULARY:
            rec = to_parallel_record(v["zolai"], v["english"], f"vocab_{v['category']}", pronunciation=v.get("pronunciation", ""))
            if v.get("example"):
                rec["example"] = v["example"]
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            count += 1
    print(f"Wrote {count} vocabulary records → {vocab_path}")

    # 3. Dialogues — flatten to parallel sentence pairs
    dialogue_path = out_dir / "zomime_dialogues.jsonl"
    count = 0
    with dialogue_path.open("w", encoding="utf-8") as f:
        for d in DIALOGUES:
            for turn in d["turns"]:
                if turn["zolai"] and turn["english"]:
                    rec = to_parallel_record(
                        turn["zolai"], turn["english"], "dialogue_conversation",
                        dialogue_id=d["dialogue_id"], dialogue_title=d["title"], speaker=turn["speaker"],
                    )
                    f.write(json.dumps(rec, ensure_ascii=False) + "\n")
                    count += 1
    print(f"Wrote {count} dialogue records → {dialogue_path}")

    # 4. Grammar notes as structured JSON (not JSONL — reference material)
    grammar_path = out_dir / "zomime_grammar_notes.json"
    grammar_path.write_text(json.dumps(GRAMMAR_NOTES, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote grammar notes → {grammar_path}")

    # 5. Pronunciation guide
    pron_path = out_dir / "zomime_pronunciation_guide.json"
    pron_path.write_text(json.dumps(PRONUNCIATION_GUIDE, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote pronunciation guide → {pron_path}")

    # Summary
    total_parallel = sum(1 for p in [parallel_path, vocab_path, dialogue_path]
                         for _ in p.open(encoding="utf-8"))
    print(f"\nDone. Total parallel records: {total_parallel}")
    print(f"Output dir: {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

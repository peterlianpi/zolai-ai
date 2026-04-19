import re
from typing import Tuple


class Zo_TdmClassifier:
    """
    Classifies Zo_Tdm user input into Tasks and Domains for appropriate routing.
    """

    def __init__(self):
        # Task keywords (English and Zo_Tdm)
        self.task_patterns = {
            "translation": [r"translate", r"teikhia", r"let khia", r"cihzia", r"how to say", r"pau-in"],
            "grammar": [r"grammar", r"sinnopna", r"thupaizia", r"stem", r"ergative", r"rule"],
            "reading": [r"read", r"sim", r"simbu", r"laigelhte", r"story"],
            "practice": [r"practice", r"sin", r"exercise", r"test", r"thu dong"],
            "conversation": [r"chat", r"hopih", r"hi", r"how are you", r"dam ni", r"kiho"]
        }

        # Domain keywords
        self.domain_patterns = {
            "religious": [r"pasian", r"topa", r"jesuh", r"khrih", r"bible", r"biakinn", r"sermon", r"thupha"],
            "daily conversation": [r"dam", r"nek", r"dawn", r"pai", r"inn", r"lawm", r"nu", r"pa"],
            "education": [r"sang", r"laibu", r"pilna", r"sia", r"university", r"scholarship"],
            "culture": [r"zomi", r"khuado", r"ngeina", r"vontawi", r"tonsan", r"zopau"],
            "general": []
        }

    def classify(self, text: str) -> Tuple[str, str]:
        text = text.lower()

        detected_task = "conversation" # Default
        for task, patterns in self.task_patterns.items():
            if any(re.search(p, text) for p in patterns):
                detected_task = task
                break

        detected_domain = "general" # Default
        for domain, patterns in self.domain_patterns.items():
            if any(re.search(p, text) for p in patterns):
                detected_domain = domain
                break

        return detected_task, detected_domain

def test_classifier():
    classifier = Zo_TdmClassifier()
    test_cases = [
        "How do I say 'God bless you' in Zo_Tdm?",
        "Explain the ergative marker 'in' rules.",
        "Khuado pawi thu hong gen in.",
        "Dam maw sia? Nitak an na ne khin maw?",
        "I want to practice my Zo_Tdm reading using the Bible."
    ]

    print(f"{'Input':<50} | {'Task':<15} | {'Domain':<15}")
    print("-" * 85)
    for case in test_cases:
        task, domain = classifier.classify(case)
        print(f"{case[:48]:<50} | {task:<15} | {domain:<15}")

if __name__ == "__main__":
    test_classifier()

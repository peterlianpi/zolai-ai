import re
from typing import Dict


class Zo_TdmRoutingAgent:
    """
    Classifies Zo_Tdm user input into Tasks and Domains and selects a tone/vocabulary profile.
    """

    def __init__(self):
        # Task keywords (English and Zo_Tdm)
        self.task_patterns = {
            "translation": [r"translate", r"teikhia", r"let khia", r"cihzia", r"how to say", r"pau-in"],
            "grammar": [r"grammar", r"sinnopna", r"thupaizia", r"stem", r"ergative", r"rule", r"shift"],
            "reading": [r"read", r"sim", r"simbu", r"laigelhte", r"story"],
            "practice": [r"practice", r"sin", r"exercise", r"test", r"thu dong"],
            "conversation": [r"chat", r"hopih", r"hi", r"how are you", r"dam ni", r"kiho", r"maw"]
        }

        # Domain keywords
        self.domain_patterns = {
            "religious": [r"pasian", r"topa", r"jesuh", r"khrih", r"bible", r"biakinn", r"sermon", r"thupha", r"god", r"bless"],
            "daily conversation": [r"dam", r"nek", r"dawn", r"pai", r"inn", r"lawm", r"nu", r"pa", r"how are you", r"eat"],
            "education": [r"sang", r"laibu", r"pilna", r"sia", r"university", r"scholarship", r"learn", r"teacher"],
            "culture": [r"zomi", r"khuado", r"ngeina", r"vontawi", r"tonsan", r"zopau", r"traditional", r"culture"],
            "general": []
        }

    def detect(self, text: str) -> Dict[str, str]:
        text_lower = text.lower()

        # 1. Detect Task
        detected_task = "conversation" # Default
        for task, patterns in self.task_patterns.items():
            if any(re.search(p, text_lower) for p in patterns):
                detected_task = task
                break

        # 2. Detect Domain
        detected_domain = "general" # Default
        for domain, patterns in self.domain_patterns.items():
            if any(re.search(p, text_lower) for p in patterns):
                detected_domain = domain
                break

        # 3. Select Tone and Strategy
        tone_strategy = {
            "religious": {"tone": "Formal/Reverent", "orthography": "ZVS 2018 (Jesuh, Khrih)", "closing": "Pasian in thupha hong pia tahen."},
            "daily conversation": {"tone": "Informal/Warm", "orthography": "Standard Zokam", "closing": "Dam le ni!"},
            "education": {"tone": "Instructive/Clear", "orthography": "ZVS 2018 Academic", "closing": "Pilna lam ah khantoh nading hanciam ni."},
            "culture": {"tone": "Communal/Proud", "orthography": "Tonsan Style", "closing": "Zomi i hihna i lunggulh gige ni."},
            "general": {"tone": "Neutral", "orthography": "Standard", "closing": "Lungdam hi."}
        }

        strategy = tone_strategy.get(detected_domain, tone_strategy["general"])

        return {
            "input": text,
            "task": detected_task,
            "domain": detected_domain,
            "tone": strategy["tone"],
            "orthography": strategy["orthography"],
            "recommended_closing": strategy["closing"]
        }

def run_routing_test():
    router = Zo_TdmRoutingAgent()
    test_cases = [
        "How do I say 'God bless you' in Zo_Tdm?",
        "Explain the ergative marker 'in' rules.",
        "Tell me about the Zomi Khuado festival.",
        "Dam maw sia? Nitak an na ne khin maw?",
        "I want to practice my Zo_Tdm reading using the Bible."
    ]

    print(f"{'Detected Task':<15} | {'Domain':<18} | {'Tone':<18} | {'Orthography'}")
    print("-" * 80)
    for case in test_cases:
        res = router.detect(case)
        print(f"{res['task']:<15} | {res['domain']:<18} | {res['tone']:<18} | {res['orthography']}")

if __name__ == "__main__":
    run_routing_test()

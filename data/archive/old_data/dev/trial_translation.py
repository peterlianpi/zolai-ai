import json
from audit_zolai import audit_zolai_text


def trial_translate():
    print("-" * 50)
    print("Comparative Trial Translation: Formal/Science Paragraph")
    print("-" * 50)

    english_source = """
    In conclusion, the result of this research shows that 
    provided that we work hard, we will fully and finally master 
    the truth of our history because knowledge is power. 
    However, we must no longer treat our education as unimportant.
    """

    # 1. Basic / Direct Translation (Common Pitfalls)
    basic_zolai = """
    A vekpi in gen lehang, hih research a gah in a lak pen 
    na hanciam leh, i tangthu a thuman i thei zo ding hi 
    banghang hiam cih leh pilna pen vangliatna ahi hi. 
    Ahi zongin, i sinna simmawh nawn lo ding hi.
    """

    # 2. Advanced / Nuanced Translation (Standard 2018 + Advanced Syntax)
    advanced_zolai = """
    A khetkhiatna a vekpi in pulak lehang, hih kantelkhiatna a gah in a lak pen, 
    i hanciam naak leh, i tangthu a thumaan i thei khin zo lian ding hi 
    banghang hiam cih leh laipilna in thuneihna ahih man ahi hi. 
    Ahih sam hangin, i laipilna simmawh nawnlo ding i hih lam i theih ding thupi hi.
    """

    print(f"English Source:\n{english_source.strip()}\n")
    print(f"Basic Zolai (Direct):\n{basic_zolai.strip()}\n")
    print(f"Advanced Zolai (Nuanced):\n{advanced_zolai.strip()}\n")

    print("-" * 50)
    print("Audit of Advanced Translation:")
    errors = audit_zolai_text(advanced_zolai)
    if not errors:
        print("✅ Advanced translation passes all 2018 Standard & Register checks.")
    else:
        for err in errors:
            print(f"⚠️ {err}")


if __name__ == "__main__":
    trial_translate()

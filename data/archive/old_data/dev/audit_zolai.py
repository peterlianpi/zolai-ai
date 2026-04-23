import os
import re


def audit_zolai_text(text, tone=None):
    """
    Audits Zolai text based on 2018 Standard and contextual tone.
    tone: 'formal' or 'colloquial'
    """
    errors = []

    # ---------------------------------------------------------
    # BASIC GRAMMAR RULES (2018 Standard)
    # ---------------------------------------------------------

    # Rule 1: 'i...uh' redundancy
    if re.search(r"\bi\s+\w+\s+uh\s*hi\b", text, re.IGNORECASE):
        errors.append("Redundant 'uh' plural suffix found with inclusive prefix 'i'. Use 'I [verb] hi'.")

    # Rule 2: Apostrophe possessive (ii -> ')
    if re.search(r"\bii\b", text):
        errors.append("Check 'ii' usage; consider contracting to ' for possessives (e.g., 'Pasian' thu').")

    # Rule 3: Ergative omission 'n'
    if re.search(r"\b(Amah|Kote|Noteng)\s+in\b", text, re.IGNORECASE):
        errors.append("Consider contracting '[Word] in' to '[Word]'n' for agentive/ergative cases.")

    # Rule 4: 'G' vs 'Ng' (Nasal contexts)
    nasal_words = [
        "tung",
        "sing",
        "lung",
        "ding",
        "mang",
        "sung",
        "kong",
        "zong",
        "hong",
    ]
    for word in nasal_words:
        if re.search(rf"\b{word[:-2]}g\b", text, re.IGNORECASE):
            errors.append(f"Possible spelling error: Use '{word}' (nasal 'ng') instead of '{word[:-2]}g'.")

    # Rule 5: Stem I vs Stem II (Noun formation before 'na')
    stem_map = {
        "mu": "muh",
        "lo": "loh",
        "kei": "keh",
        "zaw": "zawk",
        "khawm": "khop",
        "lamdang": "lamdan",
        "thang": "than",
        "thupi": "thupit",
        "kap": "kah",
        "thei": "theih",
        "guk": "guuk",
    }
    for s1, s2 in stem_map.items():
        if re.search(rf"\b{s1}\s+na\b", text, re.IGNORECASE):
            errors.append(f"Grammar Error: '{s1}' (Stem I) used before 'na'. Use '{s2}' (Stem II) for noun formation.")

    # Rule 8: Complex Negation
    if re.search(r"\b(ka|ko)\s+\w+\s+ken\b", text, re.IGNORECASE):
        errors.append(
            "Negation Error: Use 'keng' (Future Negative) for first person instead of 'ken' (Imperative/Other)."
        )
    if re.search(r"\bnawn\s+lo\b", text, re.IGNORECASE):
        errors.append("Consider contracting 'nawn lo' to 'nawnlo'.")

    # Rule 9: Resultative Compound Order
    if re.search(r"\blian\s+zo\s+khin\b", text) or re.search(r"\blian\s+khin\s+zo\b", text):
        errors.append("Syntactic Order Error: Resultative markers are typically ordered as [Verb] + khin + zo + lian.")

    # ---------------------------------------------------------
    # CONTEXTUAL WEIGHTING & TONE LOGIC
    # ---------------------------------------------------------

    # Register Mismatch (Formal term + Colloquial particle)
    formal_terms = [
        "pulakna",
        "thuseh",
        "taangzapa",
        "thuneihna",
        "kantelkhiatna",
        "laipilna",
        "thumaan",
    ]
    colloquial_particles = ["dih", "pak", "zal", "saisai", "ve"]

    for term in formal_terms:
        for part in colloquial_particles:
            if re.search(rf"\b{term}\b.*\b{part}\b", text, re.IGNORECASE):
                errors.append(
                    f"Register Mismatch: Formal term '{term}' detected with colloquial/informal particle '{part}'."
                )

    # Tone-Specific Weighting
    if tone == "formal":
        # Suggest formal synonyms
        mapping = {
            r"\bpilna\b": "laipilna",
            r"\bzaksakna\b": "pulakna",
            r"\bthukham\b": "thuseh",
            r"\bahi\s+zongin\b": "ahih sam hangin",
            r"\btua\s+ahih\s+manin\b": "tua bek thamlo (or tua a hih ciangin)",
        }
        for pattern, suggestion in mapping.items():
            if re.search(pattern, text, re.IGNORECASE):
                errors.append(
                    f"Formal Tone Violation: Consider using '{suggestion}' instead of basic term in formal context."
                )

        # Prohibit 'dih'/'pak' in formal tone
        if re.search(r"\b(dih|pak|zal)\b", text, re.IGNORECASE):
            errors.append(
                "Tone Error: Informal modifiers (dih, pak, zal) should be avoided in formal/academic register."
            )

    elif tone == "colloquial":
        # Suggest simpler forms if overly stiff
        if re.search(r"\b(pulakna|kantelkhiatna|thuseh)\b", text, re.IGNORECASE):
            errors.append(
                "Nuance Note: Term may be too formal for colloquial conversation. Consider 'zaksakna' or 'kankhiatna'."
            )

    # Rule 11: Emphatic 'mahmah' vs. 'lua'
    if re.search(r"\bhoih\s+lua\b", text, re.IGNORECASE) and tone != "colloquial":
        errors.append(
            "Nuance Suggestion: 'hoih lua' can imply excessive/negative. In formal/neutral contexts, use 'hoih mahmah'."
        )

    # Rule 12: Forbidden Directs (Common Translation Calques)
    # These are phrases that might be grammatically correct but sound unnatural to native speakers
    forbidden_directs = [
        (
            r"\bka\s+hoih\s+hi\b",
            "Ka hoih hi",
            "Ka cidam hi",
            "Instead of 'I am fine' (literal), use 'I am well/healthy'",
        ),
        (
            r"\bka\s+hoih\s+lua\b",
            "Ka hoih lua",
            "Ka cidam mahmah hi",
            "Instead of 'I am very fine', use 'I am very well'",
        ),
        (
            r"\bna\s+pai\s+leh\s+ka\s+hoih\s+hi\b",
            "Na pai leh ka hoih hi",
            "Na pai leh ka cidam hi",
            "Instead of 'If you come I am fine', use 'If you come I will be well'",
        ),
        (
            r"\b(ka|ko)\s+thei\s+lo\s+hi\b",
            "Ka thei lo hi",
            "Ka thei zokei",
            "Instead of 'I know not', use 'I cannot know' or 'I do not know' (zokei).",
        ),
        (
            r"\b(na|note)\s+thei\s+lo\s+uh\s+hi\b",
            "Note thei lo uh hi",
            "Thei zokei uh hi",
            "Instead of 'You know not', use 'You cannot know' (zokei uh).",
        ),
        (
            r"\bamah\s+hi\b",
            "Amah hi",
            "Amah ahi hi",
            "When identifying a person as the subject (e.g., 'He is God'), use the full 'ahi hi' identifying verb structure for formal and biblical accuracy.",
        ),
        (
            r"\b(tua|tua\s+thu)\s+bangin\b",
            "Tua bangin",
            "Tua a hih ciangin",
            "In formal or biblical narratives (e.g., Acts), use 'Tua a hih ciangin' to show logical sequence or consequence instead of 'Tua bangin' (which means 'in that manner').",
        ),
        (
            r"\bbang\s+hang\s+hiam\b",
            "Bang hang hiam",
            "Bang hang hiam i cih leh",
            "In formal/biblical logic (e.g., Romans), the phrase 'Bang hang hiam' is typically followed by 'i cih leh' to introduce a logical reason/explanation.",
        ),
        (
            r"\bbangmah\s+lo\b",
            "Bangmah lo",
            "Bangmah a om kei hi",
            "In formal declarations of 'nothingness', use the more emphatic 'a om kei hi' (there is not) instead of the simple 'lo' suffix.",
        ),
    ]

    # Rule 13: Logical Correlatives (Whether/Or)
    if re.search(r"\bhi\s+leh,\s+\w+\s+hi\s+leh\b", text, re.IGNORECASE):
        errors.append(
            "Logical Error: For 'Whether A or B', the standard correlative is 'hi taleh... hi taleh' (e.g., 'Judah mi hi taleh, Grik mi hi taleh')."
        )

    # Rule 14: Rhetorical Question Logic
    if re.search(r"\bkoi-ah\s+om\s+hi\b", text, re.IGNORECASE):
        errors.append(
            "Syntactic Error: Rhetorical questions of existence/location (e.g., 'Where is X?') usually require the 'a' prefix and 'hiam' marker: '[Subject] koi-ah a om hiam?'"
        )

    # Rule 16: Comparative Order
    if re.search(r"\bzaw\s+sangin\b", text, re.IGNORECASE):
        errors.append(
            "Syntactic Error: Correct comparative order is '[Noun] sangin [Verb]-zaw' (e.g., 'A sangin B a lianzaw hi')."
        )

    # Rule 17: Rhetorical Transition (How so?)
    if re.search(r"\bbangci\s+hiam\b", text, re.IGNORECASE) and not re.search(
        r"\bbang\s+ci\s+hiam\s+na\s+cih\s+uh\s+leh\b", text, re.IGNORECASE
    ):
        errors.append(
            "Nuance Note: In formal/biblical rhetoric (e.g., 1 Corinthians), the full bridge 'Bang ci hiam na cih uh leh' is preferred to introduce a detailed explanation."
        )

    # Rule 19: Imperative Suffix Concordance
    if re.search(r"\bi\s+\w+\s+un\b", text, re.IGNORECASE):
        errors.append(
            "Grammar Error: Inclusive 'i' (we) cannot be used with plural imperative 'un' (you all). Use 'i [verb] ni' for 'let us' or 'na [verb] un' for 'you all do'."
        )

    # Rule 20: Jussive 'hen' usage
    if re.search(r"\bna\s+\w+\s+hen\b", text, re.IGNORECASE):
        errors.append(
            "Grammar Error: Second person 'na' (you) cannot be used with third person jussive 'hen' (let him/it). Use 'hen' with third person subjects or names."
        )

    # Rule 21: Theological Seal (Maleep)
    if re.search(r"\bsathau\s+nilh\b", text, re.IGNORECASE) and not re.search(r"maleep", text, re.IGNORECASE):
        errors.append(
            "Nuance Suggestion: In contexts of divine sealing (e.g., 2 Corinthians), ensure the term 'maleep' (guarantee/earnest) is considered alongside 'sathau nilh' (anointing)."
        )

    # Rule 22: Passive Avoidance (Kici -> Kigen/Kizakna)
    if re.search(r"\bkici\s+hi\b", text, re.IGNORECASE):
        errors.append(
            "Stylistic Note: ZVS often prefers active reporting like 'mi te'n gen uh hi' (people say) over the passive 'kici hi' (it is said), unless naming a specific entity."
        )

    # Rule 23: Absolute Scope (Khempeuh vs Teng)
    if re.search(r"\bhih\s+teng\b", text, re.IGNORECASE) and not re.search(r"\bkhempeuh\b", text, re.IGNORECASE):
        errors.append(
            "Nuance Note: 'teng' refers to a specific group's totality. For universal/absolute 'all', use 'khempeuh' (e.g., 'mi khempeuh' - all people)."
        )

    # Rule 24: Armor Terminology (Galvan)
    armor_terms = ["lum", "khum", "siam", "kheh", "awmdal"]
    if re.search(r"armor|warfare|weapons", text, re.IGNORECASE) and not re.search(r"galvan", text, re.IGNORECASE):
        errors.append(
            "Terminology Note: For spiritual armor/warfare (Ephesians 6), use the high-register collective term 'galvan' and specific terms like 'lum' (shield) or 'awmdal' (breastplate)."
        )

    # Rule 25: Repetitive Joy Markers (Philippians)
    if re.search(r"joy|rejoice", text, re.IGNORECASE) and not re.search(r"(nuam|lungdam)", text, re.IGNORECASE):
        errors.append(
            "Nuance Note: In joyous/exhortative contexts (Philippians), ensure use of 'nuam' (internal joy) and 'lungdam' (expressed rejoicing)."
        )

    # Rule 26: "As Touching" Introduction (Lam pan ci leeng)
    if re.search(r"as touching|concerning the", text, re.IGNORECASE) and not re.search(
        r"lam pan ci leeng", text, re.IGNORECASE
    ):
        errors.append(
            "Syntactic Suggestion: For introducing qualifications or categories (e.g., 'As touching the law'), use the formal bridge 'lam pan ci leeng'."
        )

    # Rule 27: Relational Duty Suffix (Colossians)
    if re.search(r"obey|submit|love", text, re.IGNORECASE) and re.search(
        r"(wife|husband|children|parent|servant|master)", text, re.IGNORECASE
    ):
        if not re.search(r"(ta un|un la|un)$", text):
            errors.append(
                "Register Note: For household/relational duties (Colossians 3), ensure the imperative plural suffix 'un' or 'ta un' is used correctly to indicate collective/formal obligation."
            )

    # Rule 28: Creation Priority (Ta Upa)
    if re.search(r"firstborn", text, re.IGNORECASE) and not re.search(r"ta\s+upa", text, re.IGNORECASE):
        errors.append(
            "Terminology Note: In theological contexts referring to Christ's preeminence (Colossians 1), use the specific term 'Ta Upa' for 'Firstborn'."
        )

    # Rule 29: Ceaseless Action (Sun tawh zan tawh)
    if re.search(r"night and day", text, re.IGNORECASE) and not re.search(
        r"sun\s+tawh\s*,\s*zan\s+tawh", text, re.IGNORECASE
    ):
        errors.append(
            "Idiomatic Suggestion: For 'night and day' (1 Thessalonians), use the standard Zolai idiom 'sun tawh, zan tawh' to emphasize tireless effort."
        )

    # Rule 30: Eschatological 'Day' (Topa’ Ni)
    if re.search(r"day of the lord", text, re.IGNORECASE) and not re.search(r"Topa\W+Ni", text, re.IGNORECASE):
        errors.append(
            "Terminology Note: For 'the day of the Lord' (1 Thessalonians 5), use the proper capitalized title 'Topa’ Ni'."
        )

    # Rule 31: Faithful Saying (1 Timothy)
    if re.search(r"faithful\s+saying", text, re.IGNORECASE) and not re.search(r"thuman\s+thutak", text, re.IGNORECASE):
        errors.append(
            "Terminology Note: For 'faithful saying' (1 Timothy), use the established standard phrase 'thuman thutak'."
        )

    # Rule 32: Sobriety/Vigilance (Khuaval lo)
    if re.search(r"sober|vigilant", text, re.IGNORECASE) and not re.search(r"khuaval\s+lo", text, re.IGNORECASE):
        errors.append(
            "Terminology Note: In context of leadership qualifications (1 Timothy 3), 'sober/vigilant' is traditionally translated as 'khuaval lo'."
        )

    # Rule 33: Sound Doctrine (Titus)
    if re.search(r"sound\s+doctrine", text, re.IGNORECASE) and not re.search(
        r"thuhilhna\s+siangtho", text, re.IGNORECASE
    ):
        errors.append(
            "Terminology Note: For 'sound doctrine' (Titus), use the established phrase 'thuhilhna siangtho'."
        )

    # Rule 34: Foolish Questions/Vain Discussion
    if re.search(r"foolish\s+questions", text, re.IGNORECASE) and not re.search(
        r"thu\s+kidong\s+hainate", text, re.IGNORECASE
    ):
        errors.append(
            "Terminology Note: For 'foolish questions' (Titus 3:9), use the specific term 'thu kidong hainate'."
        )

    # Rule 35: High Priest (Siampi Lian)
    if re.search(r"high\s+priest", text, re.IGNORECASE) and not re.search(r"siampi\s+lian", text, re.IGNORECASE):
        errors.append(
            "Terminology Note: In context of Hebrews, translate 'High Priest' as 'Siampi Lian' for formal accuracy."
        )

    # Rule 36: Drifting Caution (Hebrews 2:1)
    if re.search(r"let\s+them\s+slip", text, re.IGNORECASE) and not re.search(
        r"kinkhia\s+lo\s*,\s*paikhiat\s+loh", text, re.IGNORECASE
    ):
        errors.append(
            "Idiomatic Suggestion: For 'let them slip' (Hebrews 2:1), use the Zolai idiom 'kinkhia lo, paikhiat loh' (to not turn aside or drift away)."
        )

    # Rule 37: Faith and Works (James)
    if re.search(r"faith\s+without\s+works", text, re.IGNORECASE) and not re.search(
        r"gamtatna\s+hoih\s+om\s+lo\s+upna", text, re.IGNORECASE
    ):
        errors.append(
            "Terminology Note: For the central theme of James 2, translate 'faith without works' as 'gamtatna hoih om lo upna'."
        )

    # Rule 38: Conditional Planning (If the Lord will)
    if re.search(r"if\s+the\s+lord\s+will", text, re.IGNORECASE) and not re.search(
        r"Pasian\s+in\s+hong\s+awi\s+leh", text, re.IGNORECASE
    ):
        errors.append(
            "Idiomatic Suggestion: For 'if the Lord will' (James 4:15), use the standard Zolai phrase 'Pasian in hong awi leh'."
        )

    # Rule 39: Partakers of Divine Nature (2 Peter)
    if re.search(r"partakers\s+of\s+the\s+divine\s+nature", text, re.IGNORECASE) and not re.search(
        r"Pasian\W+nuntakna\W+tawh\W+kizom", text, re.IGNORECASE
    ):
        errors.append(
            "Terminology Note: In context of 2 Peter 1:4, 'partakers of the divine nature' is traditionally translated as 'Pasian’ nuntakna tawh kizom mi'."
        )

    # Rule 40: False Teachers vs False Prophets
    if re.search(r"false\s+teachers", text, re.IGNORECASE) and not re.search(
        r"zuau\s+hilh\s+siate", text, re.IGNORECASE
    ):
        errors.append(
            "Terminology Note: For 'false teachers' (2 Peter 2:1), use the specific term 'zuau hilh siate' (distinguishing from 'kamsang zuau' for false prophets)."
        )

    # Rule 41: Scoffers/Mockers
    if re.search(r"scoffers|mockers", text, re.IGNORECASE) and not re.search(
        r"kosia\s+thei\s+mite", text, re.IGNORECASE
    ):
        errors.append(
            "Terminology Note: In 2 Peter 3:3, 'scoffers' is translated as 'kosia thei mite' (those who speak evil/scoff)."
        )

    # Rule 42: Precious Faith
    if re.search(r"precious\s+faith", text, re.IGNORECASE) and not re.search(r"manpha\s+upna", text, re.IGNORECASE):
        errors.append("Terminology Note: In 2 Peter 1:1, use 'manpha upna' for 'precious faith'.")

    # Rule 43: Fellowship (1 John)
    if re.search(r"fellowship", text, re.IGNORECASE) and not re.search(r"kiho|kihopih", text, re.IGNORECASE):
        errors.append(
            "Terminology Note: In 1 John, 'fellowship' is typically translated using the root 'kiho' (to commune/speak with)."
        )

    # Rule 44: Antichrist
    if re.search(r"antichrist", text, re.IGNORECASE) and not re.search(r"Anti\s+Khazih", text, re.IGNORECASE):
        errors.append("Terminology Note: Standard transliteration for 'Antichrist' is 'Anti Khazih'.")

    # Rule 45: Love in Deed/Truth
    if re.search(r"love\s+in\s+word", text, re.IGNORECASE) and not re.search(r"kampau\s+bek", text, re.IGNORECASE):
        errors.append(
            "Idiomatic Suggestion: In 1 John 3:18, contrast 'love in word' (kampau bek) with 'love in deed' (sepna bawlna)."
        )

    # Rule 46: "He that is in you"
    if re.search(r"greater\s+is\s+he\s+that\s+is\s+in\s+you", text, re.IGNORECASE) and not re.search(
        r"note\s+sungah\s+a\s+om\s+mi\s+sangin", text, re.IGNORECASE
    ):
        errors.append(
            "Idiomatic Suggestion: For 1 John 4:4, use the comparison '[Subject] sungah a om mi' (the one who is in [Subject])."
        )

    # Rule 47: Revelation Title
    if re.search(r"revelation|apocalypse", text, re.IGNORECASE) and not re.search(r"mangmuhna", text, re.IGNORECASE):
        errors.append("Terminology Note: Standard Zolai title for Revelation is 'Mangmuhna lai' (Book of Visions).")

    # Rule 48: First and Last (Alpha/Omega)
    if re.search(r"alpha\s+and\s+omega|first\s+and\s+last", text, re.IGNORECASE) and not re.search(
        r"a\s+masa\s+bel\s+leh\s+a\s+nunung\s+bel", text, re.IGNORECASE
    ):
        errors.append(
            "Terminology Note: For the Alpha and Omega title (Revelation), use the phrase 'a masa bel leh a nunung bel'."
        )

    # Rule 49: The Lamb (Revelation)
    if re.search(r"lamb\s+of\s+god|the\s+lamb", text, re.IGNORECASE) and not re.search(r"Tuuno", text, re.IGNORECASE):
        errors.append("Terminology Note: In Revelation, 'The Lamb' is consistently translated as 'Tuuno'.")

    # Rule 50: Worthy is the Lamb
    if re.search(r"worthy\s+is\s+the\s+lamb|thou\s+art\s+worthy", text, re.IGNORECASE) and not re.search(
        r"na\s+kilawm\s+hi", text, re.IGNORECASE
    ):
        errors.append(
            "Terminology Note: For 'Worthy' acclamations in Revelation, use the formal 'na kilawm hi' structure."
        )

    # ---------------------------------------------------------
    # OLD TESTAMENT PATTERNS (CV-DZ)
    # ---------------------------------------------------------

    # Rule 51: Covenant (Tawntung thuciamna)
    if re.search(r"everlasting\s+covenant", text, re.IGNORECASE) and not re.search(
        r"tawntung\s+thuciamna", text, re.IGNORECASE
    ):
        errors.append("Old Testament Term: For 'Everlasting Covenant', use 'Tawntung thuciamna'.")

    # Rule 52: Almighty God (Vanglian Pasian)
    if re.search(r"almighty\s+god", text, re.IGNORECASE) and not re.search(r"vanglian\s+pasian", text, re.IGNORECASE):
        errors.append("Old Testament Term: For 'Almighty God' (El Shaddai), use 'Vanglian Pasian'.")

    # Rule 53: Blessed is the Man (Psalms)
    if re.search(r"blessed\s+is\s+the\s+man", text, re.IGNORECASE) and not re.search(
        r"mi\s+nuamsa", text, re.IGNORECASE
    ):
        errors.append("Psalmic Pattern: Use 'Mi nuamsa i cihte pen...' for the 'Blessed is the man' beatitude.")

    # Rule 54: The Lord is my Shepherd
    if re.search(r"lord\s+is\s+my\s+shepherd", text, re.IGNORECASE) and not re.search(
        r"tuucin\s+bangin\s+hong\s+cing", text, re.IGNORECASE
    ):
        errors.append("Psalmic Pattern: For 'The LORD is my shepherd', use 'Topa pen tuucin bangin hong cing hi'.")

    # ---------------------------------------------------------
    # PSYCHOLINGUISTIC ARCHITECTURE (LUNG & KHA)
    # ---------------------------------------------------------

    # Rule 55: Heart (Kardia) -> Lung Mapping
    if re.search(r"heart", text, re.IGNORECASE) and not re.search(r"lung", text, re.IGNORECASE):
        errors.append(
            "Psycholinguistic Error: 'Heart' (Kardia) should map to 'Lung' (the unified seat of feeling/logic) in Zolai."
        )

    # Rule 56: Spirit (Pneuma) -> Kha Mapping
    if re.search(r"spirit", text, re.IGNORECASE) and not re.search(r"kha", text, re.IGNORECASE):
        errors.append(
            "Psycholinguistic Error: 'Spirit' (Pneuma) should map to 'Kha' (vital spirit/breath) or 'Kha Siangtho' (Holy Spirit)."
        )

    # Rule 57: Joy/Rejoice -> Lungdam
    if re.search(r"joy|rejoice", text, re.IGNORECASE) and not re.search(r"lungdam", text, re.IGNORECASE):
        errors.append("Psycholinguistic Error: 'Joy/Rejoice' should map to 'Lungdam' (Heart + Good/Full).")

    # Rule 58: Peace/Comfort -> Lungnopna
    if re.search(r"peace|comfort", text, re.IGNORECASE) and not re.search(r"lungnopna", text, re.IGNORECASE):
        errors.append("Psycholinguistic Error: 'Peace/Comfort' should map to 'Lungnopna' (Heart + Peace/Rest).")

    # Rule 59: Long-suffering/Patience -> Lungduaina
    if re.search(r"patience|long-suffering", text, re.IGNORECASE) and not re.search(r"lungduai", text, re.IGNORECASE):
        errors.append("Psycholinguistic Error: 'Patience/Long-suffering' should map to 'Lungduai' (Heart + Soft/Long).")

    return errors


if __name__ == "__main__":
    # Test cases with Tone Weighting
    test_cases = [
        ("I pai uh hi", None),
        ("Pulakna hong nei pak dih", "formal"),
        ("Pilna pen thupi mahmah hi", "formal"),
        ("Nong piak laibu pen, ka sim khin zo lian hi", "formal"),
        ("Ka pai ken", None),
    ]

    for case, t in test_cases:
        print(f"Text: {case} | Tone: {t or 'None'}")
        errs = audit_zolai_text(case, tone=t)
        for e in errs:
            print(f"  - {e}")

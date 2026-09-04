"""
Export all Zolai single words to a Google Sheets-ready CSV with AI() formulas.
Source: data/dictionary/wordlists/zo_en_singlewords_v1.jsonl
Output: data/Zolai_All_Words_Sheet.csv
"""
import json
import csv
import sys

INPUT = "data/dictionary/wordlists/zo_en_singlewords_v1.jsonl"
OUTPUT = "data/Zolai_All_Words_Sheet.csv"

HEADERS = [
    "Zolai", "English", "POS", "Dialect", "Source",
    "AI_Translation", "AI_Example_ZO", "AI_Example_EN",
    "AI_Definition", "AI_Quiz_Question", "AI_Quiz_Answer",
    "AI_Related_Words", "AI_Cultural_Note",
]

def ai_formulas(word, pos, row):
    r = str(row)
    return [
        f'=AI("Translate the Zolai word \'{word}\' to English in one word",A{r})',
        f'=AI("Write a short Zolai sentence using the word \'{word}\' ({pos})",A{r})',
        f'=AI("Translate this Zolai sentence to English: "&G{r})',
        f'=AI("Define the Zolai word \'{word}\' in English",A{r})',
        f'=AI("Write a quiz question to test knowledge of the Zolai word \'{word}\'",A{r})',
        f'=AI("Give the correct answer to this quiz question: "&J{r})',
        f'=AI("List 3 Zolai words related to \'{word}\'",A{r})',
        f'=AI("Give a cultural note about \'{word}\' in Zomi culture",A{r})',
    ]

with open(INPUT, encoding="utf-8") as f:
    words = [json.loads(line) for line in f if line.strip()]

with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(HEADERS)
    for i, entry in enumerate(words, start=2):  # row 2 = first data row
        zo  = (entry.get("zolai") or "").strip()
        en  = (entry.get("english") or "").strip()
        pos = (entry.get("pos") or "").strip()
        dia = (entry.get("dialect") or "tedim")
        src = (entry.get("source") or "")
        row = [zo, en, pos, dia, src] + ai_formulas(zo, pos, i)
        writer.writerow(row)

print(f"Done — {len(words)} words written to {OUTPUT}")

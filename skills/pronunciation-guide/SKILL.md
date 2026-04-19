# Pronunciation Guide Skill

## Purpose
Generate IPA transcriptions and pronunciation hints for Zolai words and sentences.

## Phoneme Rules (ZVS Tedim)

| Grapheme | IPA | Note |
|---|---|---|
| o | /oʊ/ | Always diphthong, never pure /o/ |
| a | /a/ | Open front |
| e | /e/ | Mid front |
| i | /i/ | High front |
| u | /u/ | High back |
| ng | /ŋ/ | Velar nasal |
| kh | /kʰ/ | Aspirated velar |
| ph | /pʰ/ | Aspirated bilabial |
| th | /tʰ/ | Aspirated dental |

## Forbidden Clusters
- `ti` — never valid in ZVS
- `c` + `a/e/o/aw` — never valid

## Apostrophe (Pawfi)
- Contraction: `na'ng` → /naŋ/ (you + topic)
- Possession: `ka pu'` → /ka pu/ (my grandfather, final glottal)

## Output
```json
{
  "word": "pasian",
  "ipa": "/pa.si.an/",
  "syllables": ["pa", "si", "an"],
  "audio_hint": "pah-see-ahn"
}
```

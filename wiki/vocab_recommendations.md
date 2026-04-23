# Bible Vocab Pipeline — Recommendations
_Auto-generated. Last run covered 66 books._  
_Last updated: 2026-04-20_

## Summary
| Book | Verses | Resolved | Gaps | Flags |
|------|--------|----------|------|-------|
| GEN | 1478 | 0 | 0 | 38 |
| EXO | 1079 | 328 | 48 | 82 |
| LEV | 792 | 219 | 27 | 47 |
| NUM | 1101 | 181 | 98 | 42 |
| DEU | 753 | 153 | 23 | 62 |
| JOS | 588 | 305 | 82 | 48 |
| JDG | 575 | 154 | 44 | 22 |
| RUT | 81 | 29 | 6 | 1 |
| 1SA | 764 | 189 | 39 | 43 |
| 2SA | 660 | 236 | 82 | 26 |
| 1KI | 755 | 186 | 55 | 38 |
| 2KI | 664 | 191 | 72 | 69 |
| 1CH | 901 | 527 | 133 | 41 |
| 2CH | 738 | 126 | 48 | 32 |
| EZR | 271 | 154 | 40 | 15 |
| NEH | 396 | 143 | 59 | 34 |
| EST | 159 | 52 | 30 | 2 |
| JOB | 1035 | 285 | 56 | 4 |
| PSA | 1895 | 363 | 72 | 86 |
| PRO | 869 | 203 | 43 | 13 |
| ECC | 222 | 51 | 6 | 0 |
| SNG | 116 | 58 | 10 | 0 |
| ISA | 1104 | 326 | 84 | 96 |
| JER | 1128 | 237 | 59 | 107 |
| LAM | 130 | 43 | 6 | 3 |
| EZK | 1090 | 235 | 28 | 55 |
| DAN | 347 | 100 | 10 | 3 |
| HOS | 181 | 20 | 13 | 7 |
| JOL | 62 | 13 | 3 | 3 |
| AMO | 111 | 28 | 2 | 9 |
| OBA | 20 | 4 | 1 | 1 |
| JON | 37 | 5 | 1 | 1 |
| MIC | 90 | 12 | 8 | 8 |
| NAH | 0 | 0 | 0 | 0 |
| HAB | 47 | 15 | 3 | 1 |
| ZEP | 39 | 4 | 0 | 5 |
| HAG | 35 | 10 | 1 | 2 |
| ZEC | 176 | 38 | 5 | 23 |
| MAL | 43 | 9 | 1 | 4 |
| MAT | 1068 | 197 | 42 | 143 |
| MRK | 668 | 69 | 28 | 86 |
| LUK | 1136 | 128 | 49 | 185 |
| JHN | 875 | 77 | 24 | 141 |
| ACT | 993 | 237 | 26 | 86 |
| ROM | 420 | 63 | 14 | 41 |
| 1CO | 437 | 40 | 13 | 52 |
| 2CO | 255 | 33 | 11 | 27 |
| GAL | 147 | 17 | 4 | 5 |
| EPH | 125 | 8 | 2 | 24 |
| PHP | 85 | 8 | 2 | 13 |
| COL | 70 | 15 | 0 | 11 |
| 1TH | 71 | 4 | 2 | 20 |
| 2TH | 40 | 3 | 1 | 16 |
| 1TI | 93 | 9 | 1 | 6 |
| 2TI | 74 | 19 | 0 | 13 |
| TIT | 35 | 7 | 1 | 2 |
| PHM | 19 | 4 | 2 | 3 |
| HEB | 262 | 31 | 10 | 19 |
| JAS | 103 | 13 | 2 | 12 |
| 1PE | 90 | 9 | 4 | 7 |
| 2PE | 59 | 3 | 2 | 17 |
| 1JN | 105 | 6 | 1 | 8 |
| 2JN | 11 | 0 | 0 | 0 |
| 3JN | 15 | 1 | 0 | 1 |
| JUD | 23 | 4 | 1 | 7 |
| REV | 397 | 49 | 6 | 34 |

## Action Items
- [ ] Review `data/processed/bible_vocab_still_missing.jsonl` — send to Gemini when quota available
- [ ] Review `data/processed/bible_quality_flags.jsonl` — fix critical severity first
- [ ] Verify crossref entries with `actuaracy=0.55` in DB (auto-resolved, needs human check)
- [ ] Run `scripts/fix_bible_data.py` if any HTML entities remain
- [ ] Update `data/master/combined/parallel.jsonl` after adding TBR17 parallel

## ZVS Compliance Note
All resolved vocab entries must use ZVS standard terms:
- `pasian` (not `pasian`), `gam` (not `gam`), `tapa` (not `tapa`), `topa` (not `topa`), `kumpipa` (not `???`), `tua` (not `tua/tuan`).
- Flag any entries containing forbidden terms for manual review.

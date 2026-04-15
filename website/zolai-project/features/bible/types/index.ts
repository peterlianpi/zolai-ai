export interface BibleVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  testament: string;
  tdb77?: string;
  tbr17?: string;
  tedim2010?: string;
  kjv?: string;
}

export type BibleVersion = "tdb77" | "tbr17" | "tedim2010" | "kjv";

export const VERSION_LABELS: Record<BibleVersion, string> = {
  tdb77:     "TDB77",
  tbr17:     "TBR17",
  tedim2010: "Tedim 2010",
  kjv:       "KJV (English)",
};

// Canonical book order
export const OT_BOOKS = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1Samuel","2Samuel","1Kings","2Kings","1Chronicles","2Chronicles","Ezra","Nehemiah",
  "Esther","Job","Psalms","Proverbs","Ecclesiastes","SongOfSolomon","Isaiah","Jeremiah",
  "Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah",
  "Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
];

export const NT_BOOKS = [
  "Matthew","Mark","Luke","John","Acts","Romans","1Corinthians","2Corinthians",
  "Galatians","Ephesians","Philippians","Colossians","1Thessalonians","2Thessalonians",
  "1Timothy","2Timothy","Titus","Philemon","Hebrews","James","1Peter","2Peter",
  "1John","2John","3John","Jude","Revelation",
];

export type SearchLang = "zolai" | "english" | "both";

export interface DictWord {
  id: string;
  zolai: string;
  english: string;
  pos?: string | null;
  category?: string | null;
  definition?: string | null;
  example?: string | null;
  synonyms: string[];
  antonyms: string[];
  related: string[];
  tags: string[];
  audioUrl?: string | null;
  accuracy?: string | null;
}

export interface DictStats {
  total: number;
  byPos: Record<string, number>;
  byCategory: Record<string, number>;
}

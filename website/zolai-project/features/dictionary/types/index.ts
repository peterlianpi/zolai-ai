export interface DictWord {
  id: string;
  zolai: string;
  english: string;
  pos?: string | null;
  category?: string | null;
  definition?: string | null;
  example?: string | null;
  explanation?: string | null;
  synonyms: string[];
  antonyms: string[];
  related: string[];
  variants: string[];
  examples?: Array<{ zo: string; en: string; source: string; reference: string }> | string | null;
  accuracy?: string | null;
  tags: string[];
  audioUrl?: string | null;
}

export interface DictStats {
  total: number;
  confirmed: number;
  withSynonyms: number;
  withAntonyms: number;
}

export type SearchLang = "zolai" | "english" | "both";

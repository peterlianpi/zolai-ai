export interface DictWord {
  id: string;
  zolai: string;
  english: string;
  pos?: string;
  category?: string;
  definition?: string;
  example?: string;
  explanation?: string;
  synonyms: string[];
  antonyms: string[];
  related: string[];
  variants: string[];
  examples?: Array<{ zo: string; en: string; source: string; reference: string }>;
  accuracy?: string;
  tags: string[];
  audioUrl?: string;
}

export interface DictStats {
  total: number;
  confirmed: number;
  withSynonyms: number;
  withAntonyms: number;
}

export type SearchLang = "zolai" | "english" | "both";

export type TranslationLang = "english" | "zolai";

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  from: TranslationLang;
  to: TranslationLang;
  found: boolean;
  fuzzy?: boolean;
  suggestions?: string[];
}

export interface TranslationSuggestion {
  zolai: string;
  english: string;
  pos?: string | null;
}

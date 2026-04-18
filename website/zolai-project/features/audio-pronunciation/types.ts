export interface AudioWord {
  id: string;
  zolai: string;
  english: string;
  pos?: string | null;
  audioUrl?: string | null;
  tags: string[];
}

export interface AudioStats {
  totalWords: number;
  wordsWithAudio: number;
  wordsWithoutAudio: number;
  audioCoveragePercentage: number;
}

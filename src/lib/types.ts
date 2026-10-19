export type Band = 5 | 6 | 7 | 8;

export type Meaning = {
  lang: 'zh' | 'en';
  text: string;
};

export type ExampleEntry = {
  en: string;
  zh: string;
};

export type VocabEntry = {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  meanings: Meaning[];
  band: Band;
  frequencyRank: number;
  examples: ExampleEntry[];
  synonyms: string[];
  collocations: string[];
  tags: string[];
};

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export type ReviewRecord = {
  id: string;
  vocabId: string;
  intervalIndex: number;
  ease: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  reviewCount: number;
  lapses: number;
  createdAt: string;
  isBookmarked: boolean;
};

import Dexie from 'dexie';
import type { ReviewRecord } from '../lib/types';

export class AppDB extends Dexie {
  reviews!: Dexie.Table<ReviewRecord, string>;
  settings!: Dexie.Table<any, string>;
  wrongs!: Dexie.Table<any, string>;

  constructor() {
    super('ieltsVocabDB');
    this.version(1).stores({
      reviews: 'id, vocabId, nextReviewAt',
      settings: 'id',
      wrongs: 'id, vocabId, lastWrongAt',
    });
  }
}

export const db = new AppDB();

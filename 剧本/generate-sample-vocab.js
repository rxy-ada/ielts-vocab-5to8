const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public', 'data');
const OUT_FILE = path.join(OUT_DIR, 'ielts_5000.json');

function pad(n) {
  return String(n).padStart(5, '0');
}

const out = [];
for (let i = 1; i <= 5000; i++) {
  const band = 5 + ((i - 1) % 4); // 5, 6, 7, 8
  out.push({
    id: `sample-${pad(i)}`,
    word: `sampleword${i}`,
    phonetic: '',
    partOfSpeech: 'noun',
    meanings: [{ lang: 'zh', text: `示例释义 ${i}` }],
    band,
    frequencyRank: i,
    examples: [
      { en: `This is an example sentence number ${i}.`, zh: `这是示例句子 ${i}。` }
    ],
    synonyms: [],
    collocations: [],
    tags: ['sample']
  });
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
console.log(`Generated ${out.length} sample vocab entries to ${OUT_FILE}`);

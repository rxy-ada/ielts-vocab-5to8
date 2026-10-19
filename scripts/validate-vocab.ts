import type { Band, VocabEntry } from '../lib/types';

const requiredKeys = ['id', 'word', 'meanings', 'band'];

function isValidBand(value: unknown): value is Band {
  return value === 5 || value === 6 || value === 7 || value === 8;
}

function parseJsonFile(filePath: string): unknown {
  const fs = require('fs');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function validateVocab(data: unknown): string[] {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    return ['词库文件必须是 JSON 数组'];
  }

  if (data.length < 5000) {
    errors.push(`词库条目少于 5000 条，当前为 ${data.length} 条`);
  }

  const seen = new Set<string>();

  data.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push(`第 ${index} 条不是对象`);
      return;
    }

    const entry = item as Record<string, unknown>;

    for (const key of requiredKeys) {
      if (!(key in entry)) {
        errors.push(`第 ${index} 条缺少字段: ${key}`);
      }
    }

    const word = String(entry.word ?? '').trim();
    if (!word) {
      errors.push(`第 ${index} 条 word 缺失`);
    }

    if (word) {
      const normalized = word.toLowerCase();
      if (seen.has(normalized)) {
        errors.push(`重复单词: ${word}`);
      }
      seen.add(normalized);
    }

    if (!isValidBand(entry.band)) {
      errors.push(`第 ${index} 条 band 非法: ${String(entry.band)}`);
    }

    if (!Array.isArray(entry.meanings) || entry.meanings.length === 0) {
      errors.push(`第 ${index} 条 meanings 必须为非空数组`);
    }

    if (typeof entry.id !== 'string' || !entry.id.trim()) {
      errors.push(`第 ${index} 条 id 缺失或非法`);
    }
  });

  return errors;
}

const filePath = process.argv[2] ?? 'public/data/ielts_5000.json';

try {
  const data = parseJsonFile(filePath);
  const errors = validateVocab(data as unknown[]);

  if (errors.length) {
    console.error('词库校验失败:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(`词库校验通过，已检查 ${Array.isArray(data) ? data.length : 0} 条记录。`);
} catch (error) {
  console.error('词库校验发生错误:');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

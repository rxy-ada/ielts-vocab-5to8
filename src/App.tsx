import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import type { VocabEntry } from './lib/types';
import SettingsShortcut from './components/SettingsShortcut';

const navItems = [
  { to: '/', label: '仪表盘' },
  { to: '/vocabulary', label: '词库' },
  { to: '/study', label: '学习' },
  { to: '/review', label: '复习' },
  { to: '/quiz', label: '测试' },
  { to: '/stats', label: '统计' },
  { to: '/settings', label: '设置' },
];

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 text-slate-800">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <div className="text-lg font-bold text-indigo-600">IELTS Vocab 5→8</div>
                <div className="text-xs text-slate-500">目标分数：7分 · 今日待复习：4</div>
              </div>
              <nav className="flex gap-2 overflow-x-auto pb-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `rounded-full px-3 py-2 text-sm font-medium transition ${
                        isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/vocabulary" element={<VocabularyPage />} />
            <Route path="/study" element={<StudyPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Settings quick shortcut button */}
        <SettingsShortcut />
      </div>
    </BrowserRouter>
  );
}

function DashboardPage() {
  const stats = [
    { label: '今日待复习', value: '4', accent: 'bg-indigo-100 text-indigo-700' },
    { label: '今日新词计划', value: '20', accent: 'bg-emerald-100 text-emerald-700' },
    { label: '连续学习天数', value: '12', accent: 'bg-amber-100 text-amber-700' },
    { label: '已学词数', value: '1,280', accent: 'bg-cyan-100 text-cyan-700' },
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className={`rounded-2xl p-4 ${item.accent}`}>
            <div className="text-sm font-medium">{item.label}</div>
            <div className="mt-2 text-3xl font-bold">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">今日进度</h2>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">已完成 68%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">掌握度</div>
              <div className="text-2xl font-bold">72%</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">本周复习</div>
              <div className="text-2xl font-bold">28</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">错词本</div>
              <div className="text-2xl font-bold">15</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold">快捷入口</h2>
          <div className="mt-4 space-y-2">
            <NavLink to="/vocabulary" className="block rounded-xl bg-indigo-50 px-3 py-3 font-medium text-indigo-700">词库搜索</NavLink>
            <NavLink to="/study" className="block rounded-xl bg-emerald-50 px-3 py-3 font-medium text-emerald-700">闪卡学习</NavLink>
            <NavLink to="/review" className="block rounded-xl bg-amber-50 px-3 py-3 font-medium text-amber-700">今日复习</NavLink>
          </div>
        </div>
      </section>
    </div>
  );
}

function VocabularyPage() {
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [query, setQuery] = useState('');
  const [band, setBand] = useState<'all' | 5 | 6 | 7 | 8>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/data/ielts_5000.json');
        if (!response.ok) {
          throw new Error('词表加载失败');
        }
        const data: VocabEntry[] = await response.json();
        setEntries(data);
        setSelectedId(data[0]?.id ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '词表加载失败');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesBand = band === 'all' || entry.band === band;
      const matchesQuery = !query || entry.word.toLowerCase().includes(query.toLowerCase());
      return matchesBand && matchesQuery;
    });
  }, [band, entries, query]);

  const selectedEntry = filteredEntries.find((entry) => entry.id === selectedId) ?? filteredEntries[0] ?? null;

  if (loading) {
    return <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">加载中...</div>;
  }

  if (error) {
    return <div className="rounded-2xl bg-red-50 p-5 text-red-700 ring-1 ring-red-200">{error}</div>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.35fr]">
      <aside className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="mb-3 flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索单词"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
            aria-label="搜索单词"
          />
          <select
            value={band}
            onChange={(event) => setBand(event.target.value as 'all' | 5 | 6 | 7 | 8)}
            className="rounded-xl border border-slate-200 px-2 py-2"
            aria-label="按分数筛选"
          >
            <option value="all">全部</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
          </select>
        </div>
        <div className="max-h-[70vh] space-y-2 overflow-y-auto">
          {filteredEntries.slice(0, 80).map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelectedId(entry.id)}
              className={`w-full text-left rounded-2xl border p-3 transition ${
                selectedEntry?.id === entry.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{entry.word}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">Band {entry.band}</span>
              </div>
              <div className="mt-1 text-sm text-slate-600">{entry.meanings[0]?.text ?? '暂无释义'}</div>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        {selectedEntry ? (
          <>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-3xl font-bold text-slate-800">{selectedEntry.word}</div>
                <div className="text-sm text-slate-500">{selectedEntry.phonetic ?? '音标待补充'}</div>
              </div>
              <button type="button" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                收藏
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-slate-100 px-2 py-1">{selectedEntry.partOfSpeech ?? '词性待补充'}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">band {selectedEntry.band}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">Rank {selectedEntry.frequencyRank}</span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">释义</h3>
                <ul className="list-disc space-y-1 pl-5 text-slate-700">
                  {selectedEntry.meanings.map((meaning, index) => (
                    <li key={`${selectedEntry.id}-${index}`}>{meaning.text}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">例句</h3>
                {selectedEntry.examples.map((example, index) => (
                  <div key={`${selectedEntry.id}-example-${index}`} className="mb-3 rounded-xl bg-slate-50 p-3">
                    <div className="text-slate-700">{example.en}</div>
                    <div className="mt-1 text-sm text-slate-500">{example.zh}</div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">搭配与同义词</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedEntry.collocations.length ? selectedEntry.collocations : ['搭配待补充']).map((item) => (
                    <span key={item} className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-slate-500">暂无可显示词条</div>
        )}
      </section>
    </div>
  );
}

function StudyPage() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedWord] = useState({
    word: 'comply',
    meaning: '遵守；服从',
    example: 'They must comply with the regulations.',
  });

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mx-auto max-w-lg">
        <div className="mb-4 text-center text-sm text-slate-500">闪卡学习 · 第 14 卡</div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
          <div className="text-4xl font-bold tracking-tight text-slate-800">{selectedWord.word}</div>
          {showAnswer ? (
            <div className="mt-5 space-y-3 text-left text-slate-700">
              <div><span className="font-semibold">中文：</span>{selectedWord.meaning}</div>
              <div><span className="font-semibold">例句：</span>{selectedWord.example}</div>
            </div>
          ) : (
            <div className="mt-5 text-slate-500">点击翻转查看释义</div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => setShowAnswer(!showAnswer)} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            {showAnswer ? '收起答案' : '翻转'}
          </button>
          <button type="button" className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">认识</button>
          <button type="button" className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">模糊</button>
          <button type="button" className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">不认识</button>
        </div>
      </div>
    </div>
  );
}

function ReviewPage() {
  const dueWords = [
    { word: 'allocate', meaning: '分配', next: '今天 18:00' },
    { word: 'comprehensive', meaning: '全面的', next: '今天 20:00' },
    { word: 'emerge', meaning: '显现；出现', next: '今天 21:00' },
  ];

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">今日复习</h2>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">{dueWords.length} 个待复习</span>
      </div>
      <div className="space-y-3">
        {dueWords.map((word) => (
          <div key={word.word} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
            <div>
              <div className="font-semibold">{word.word}</div>
              <div className="text-sm text-slate-500">{word.meaning}</div>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded-full bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700">Again</button>
              <button type="button" className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700">Hard</button>
              <button type="button" className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">Good</button>
              <button type="button" className="rounded-full bg-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-700">Easy</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizPage() {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-xl font-semibold">测试模式</h2>
      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
        <div className="text-sm text-slate-500">题目 1 / 5</div>
        <div className="mt-2 text-2xl font-bold">Which is the correct translation of “alter”? </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button type="button" className="rounded-xl border border-slate-200 px-3 py-3 text-left">改变</button>
          <button type="button" className="rounded-xl border border-slate-200 px-3 py-3 text-left">赞成</button>
          <button type="button" className="rounded-xl border border-slate-200 px-3 py-3 text-left">冻结</button>
          <button type="button" className="rounded-xl border border-slate-200 px-3 py-3 text-left">忽略</button>
        </div>
      </div>
    </div>
  );
}

function StatsPage() {
  const grid = [
    ['学习天数', '12'],
    ['复习完成数', '340'],
    ['掌握分布', '72%'],
    ['到期数量', '4'],
    ['错词数', '15'],
    ['收藏数', '86'],
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {grid.map(([label, value]) => (
        <div key={label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 text-3xl font-bold">{value}</div>
        </div>
      ))}
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div>
        <label className="mb-2 block text-sm font-medium">每日新词目标</label>
        <input type="number" defaultValue={20} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">目标分数</label>
        <select defaultValue={7} className="w-full rounded-xl border border-slate-200 px-3 py-2">
          <option value={5}>5</option>
          <option value={6}>6</option>
          <option value={7}>7</option>
          <option value={8}>8</option>
        </select>
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
        <span>提醒开关</span>
        <button type="button" className="rounded-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">开启</button>
      </div>
      <div className="flex gap-2">
        <button type="button" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold">导出 JSON</button>
        <button type="button" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold">导入 JSON</button>
        <button type="button" className="rounded-xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">清空数据</button>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
      <div className="text-5xl">404</div>
      <div className="mt-3 text-xl font-semibold">页面不存在</div>
      <NavLink to="/" className="mt-4 inline-block rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
        返回首页
      </NavLink>
    </div>
  );
}

export { App };

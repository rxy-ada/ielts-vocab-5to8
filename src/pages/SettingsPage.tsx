import React, { useEffect, useState, useRef } from 'react';
import { db } from '../db/db';
import type { ReviewRecord } from '../lib/types';

type SettingsModel = {
  id: 'settings';
  dailyNewGoal: number;
  targetBand: 5 | 6 | 7 | 8;
  notifyEnabled: boolean;
  notifyTime?: string; // 'HH:MM'
  updatedAt?: string;
};

export default function SettingsPage() {
  const [dailyNewGoal, setDailyNewGoal] = useState<number>(20);
  const [targetBand, setTargetBand] = useState<5 | 6 | 7 | 8>(7);
  const [notifyEnabled, setNotifyEnabled] = useState<boolean>(false);
  const [notifyTime, setNotifyTime] = useState<string>('09:00');
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await db.settings.get('settings');
        if (!mounted) return;
        if (s) {
          setDailyNewGoal(s.dailyNewGoal ?? 20);
          setTargetBand(s.targetBand ?? 7);
          setNotifyEnabled(s.notifyEnabled ?? false);
          setNotifyTime(s.notifyTime ?? '09:00');
        }
      } catch (err) {
        console.error('加载设置失败', err);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function saveSettings() {
    const payload: SettingsModel = {
      id: 'settings',
      dailyNewGoal,
      targetBand,
      notifyEnabled,
      notifyTime,
      updatedAt: new Date().toISOString(),
    };
    await db.settings.put(payload);
    alert('设置已保存');
  }

  async function handleExport() {
    try {
      const reviews = await db.reviews.toArray();
      const settings = await db.settings.toArray();
      const wrongs = await db.wrongs.toArray();

      const payload = {
        exportedAt: new Date().toISOString(),
        reviews,
        settings,
        wrongs,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ielts-vocab-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('导出失败');
    }
  }

  async function validateImportedData(data: any): Promise<string[]> {
    const errors: string[] = [];
    if (!data || typeof data !== 'object') errors.push('文件不是合法的 JSON 对象');
    if (!Array.isArray(data.reviews)) errors.push('缺少 reviews 列表');
    if (!Array.isArray(data.settings)) errors.push('缺少 settings 列表');
    if (!Array.isArray(data.wrongs)) errors.push('缺少 wrongs 列表');
    // Further validations can be added
    return errors;
  }

  async function handleImportFile(file: File | null) {
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const errors = await validateImportedData(data);
      if (errors.length) {
        alert('导入失败：\n' + errors.join('\n'));
        return;
      }

      await db.transaction('rw', db.reviews, db.settings, db.wrongs, async () => {
        await db.reviews.clear();
        await db.settings.clear();
        await db.wrongs.clear();
        if (Array.isArray(data.reviews) && data.reviews.length) await db.reviews.bulkAdd(data.reviews as ReviewRecord[]);
        if (Array.isArray(data.settings) && data.settings.length) await db.settings.bulkAdd(data.settings);
        if (Array.isArray(data.wrongs) && data.wrongs.length) await db.wrongs.bulkAdd(data.wrongs);
      });

      alert('导入成功');
    } catch (err) {
      console.error(err);
      alert('导入出错：' + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function handleImportClick() {
    fileRef.current?.click();
  }

  async function handleClearAll() {
    const ok = confirm('这将清空所有本地学习记录（收藏/复习记录/错题等）。此操作不可恢复，是否继续？');
    if (!ok) return;
    await db.transaction('rw', db.reviews, db.settings, db.wrongs, async () => {
      await db.reviews.clear();
      await db.settings.clear();
      await db.wrongs.clear();
    });
    alert('已清空本地学习数据');
    window.location.reload();
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      alert('此浏览器不支持 Notification API');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('IELTS Vocab 已开启提醒', { body: '打开页面时我们会提醒你到期的复习词' });
    } else {
      alert('未授予通知权限，无法发送本地通知');
    }
  }

  return (
    <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-xl font-semibold">设置</h2>
      {loading ? (
        <div>加载中...</div>
      ) : (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium">每日新词目标</label>
            <input
              type="number"
              value={dailyNewGoal}
              onChange={(e) => setDailyNewGoal(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">目标分数</label>
            <select
              value={targetBand}
              onChange={(e) => setTargetBand(Number(e.target.value) as 5 | 6 | 7 | 8)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            >
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
            <div>
              <div className="text-sm font-medium">提醒开关</div>
              <div className="text-sm text-slate-500">开启后页面打开/恢复时会检查到期并在授权后发送本地通知</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={notifyEnabled}
                    onChange={(e) => setNotifyEnabled(e.target.checked)}
                    className="mr-2 h-4 w-4"
                  />
                  <span className="text-sm">启用</span>
                </label>
              </div>
              <div>
                <input
                  type="time"
                  value={notifyTime}
                  onChange={(e) => setNotifyTime(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={saveSettings} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">保存设置</button>
            <button onClick={requestNotificationPermission} className="rounded-xl bg-slate-100 px-4 py-2 text-sm">请求通知权限</button>
          </div>

          <div className="mt-4 space-y-2">
            <button onClick={handleExport} className="rounded-xl bg-slate-100 px-4 py-2 text-sm">导出 JSON</button>
            <button onClick={handleImportClick} className="rounded-xl bg-slate-100 px-4 py-2 text-sm">导入 JSON</button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => handleImportFile(e.target.files?.[0] ?? null)} />
          </div>

          <div className="mt-4">
            <button onClick={handleClearAll} className="rounded-xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">清空数据</button>
          </div>

          <div className="mt-6 text-sm text-slate-500">
            <p>隐私说明：用户学习数据默认保存在浏览器 IndexedDB，不会上传到服务器。导出/导入通过本地 JSON 文件进行。</p>
            <p className="mt-2">词表为示例占位数据，必须替换为经合法授权的 5000 词表后再用于正式考试训练。</p>
          </div>
        </>
      )}
    </div>
  );
}

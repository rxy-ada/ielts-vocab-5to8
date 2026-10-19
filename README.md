# IELTS Vocab 5→8

面向雅思 5 分到 8 分学习者的中文优先、移动端优先词汇学习站。当前版本为纯前端 MVP，数据默认保存在浏览器 IndexedDB，不上传到服务端；用于本地学习、收藏、复习提醒和统计。

## 项目目标

- 提供约 5000 条雅思高频词汇的学习和复习入口
- 支持按目标分数 5 / 6 / 7 / 8 过滤与筛选
- 允许用户收藏生词，并自动进入复习队列
- 使用艾宾浩斯式复习安排提醒，默认按 10 分钟、1 天、2 天、4 天、7 天、15 天、30 天、60 天推进
- 中文展示为主，词条为英文，移动端优先
- 通过浏览器 Notification API 提供本地提醒（仅在页面打开/恢复时检查）

## 版权与数据说明

本项目仓库内不包含任何受版权保护的词典原始数据文本或抓取的版权释义。当前 `public/data/ielts_5000.json` 仅为演示/占位数据，用来满足项目框架、校验脚本、CI 和前端开发的完整闭环。它不构成任何真实词典来源，也不声称其来源或版权许可。

在实际上线前，必须替换为经合法授权的 5000 词表，并保留相同字段结构。字段要求与 `src/lib/types.ts` 一致：`id, word, phonetic, partOfSpeech, meanings, band, frequencyRank, examples, synonyms, collocations, tags`。

## 功能概览

- 首页仪表盘：今日待复习、今日新词计划、连续学习天数、已学词数、掌握度、快捷入口
- 词库页：搜索、按 band/标签/掌握状态筛选、分页展示、收藏状态控制
- 学习模式：闪卡翻转、认识/模糊/不认识评分、Web Speech API 发音
- 收藏与复习：收藏即加入复习队列，due 词显示在复习页
- 复习算法：Again/Hard/Good/Easy 四档评分，保存间隔、ease、nextReviewAt 等状态
- 测试模式：英译中选择题、中译英拼写题和错词本
- 统计页：学习天数、复习完成数、掌握分布、到期数量、错词数
- 设置页：目标分数、每日新词目标、提醒开关、导出/导入/清空数据

## 目录结构

- `public/data/`：示例词表数据，需替换为真实授权词表
- `scripts/validate-vocab.ts`：词库校验脚本
- `src/`：React 代码、路由、测试和数据模型
- `.github/workflows/`：CI 与 GitHub Pages 部署

## 技术栈

- Vite + React + TypeScript
- Tailwind CSS
- Dexie + IndexedDB
- React Router
- Vitest + Testing Library
- Web Speech API / Notification API

## 本地开发

```bash
npm install
npm run dev
```

## 验证脚本

```bash
npm run validate:vocab
```

校验包括：
- JSON 语法正确
- 词条总数 >= 5000
- `word` 去重
- 必填字段存在
- `band` 合法（5/6/7/8）

## 数据导入格式

示例字段结构：

```json
{
  "id": "vocab-0001",
  "word": "abandon",
  "phonetic": "/əˈbændən/",
  "partOfSpeech": "verb",
  "meanings": [{ "lang": "zh", "text": "放弃；遗弃" }],
  "band": 5,
  "frequencyRank": 1,
  "examples": [{ "en": "The company had to abandon the project.", "zh": "公司不得不放弃这个项目。" }],
  "synonyms": ["quit", "leave"],
  "collocations": ["abandon ship", "abandon hope"],
  "tags": ["common", "verb"]
}
```

必须保持相同结构，且 `meanings` 中 `lang` 只接受 `zh` 或 `en`，`band` 只接受 `5 | 6 | 7 | 8`。

## 复习算法说明

项目采用由纯函数实现的艾宾浩斯式复习算法：

- 默认间隔：10 分钟、1 天、2 天、4 天、7 天、15 天、30 天、60 天
- 新词默认立即进入队列，首次复习可设为 10 分钟后或次日
- Again: 回退/缩短间隔
- Hard: 稍微回退或保持
- Good: 正常推进
- Easy: 跳级推进

在 `src/lib/scheduler.ts` 中实现纯函数 `computeNextReview`，并保存在 IndexedDB 中：`intervalIndex`, `ease`, `lastReviewedAt`, `nextReviewAt`, `reviewCount`, `lapses`。

## GitHub Pages 与部署

- Vite 默认使用 `base: './'`，避免 GitHub Pages 静态资源 404
- CI 流程会执行：install、lint、test、build、validate:vocab
- Deploy 任务在 `main` 分支构建并部署到 GitHub Pages

## 隐私说明

- 用户学习数据默认保存在浏览器 IndexedDB
- 不上传任何学习记录到服务器
- 导出/导入只通过本地 JSON 文件进行
- 清空数据有二次确认提示

## 运行检查

```bash
npm install
npm run lint
npm run test
npm run build
npm run validate:vocab
```

在本项目中，示例词表仅用于通过校验、演示和构建流程；最终上线前请按授权方式替换为真实 5000 词表。 

## 许可证

MIT License


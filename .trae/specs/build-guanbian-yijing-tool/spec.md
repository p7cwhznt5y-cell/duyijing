# 观变：易经互动推演器 Spec

## Why
面向现代年轻人（22-35 岁）的《易经》哲学互动工具，帮助用户用"变易"的思维框架审视当下的人生困惑，而非算命预测。现有易经 App 普遍广告多、解读浅、充斥吉凶断言，缺乏克制而有文化底蕴的工具。本产品以"经文事实人工录入 + AI 仅做解读润色"为边界设计，确保哲学启发的可信度。

## What Changes
- 新建项目：Vite + Preact + Tailwind CSS 单页应用（移动端优先）
- 实现首页"今日一卦"：每日首次访问随机抽卦，展示卦象/卦辞/爻辞原文
- 实现可选问题输入 + AI 启发式解读（200-300 字，严禁吉凶断言）
- 实现"决策推演器"：两难情境 → 情境类型匹配卦象 → 刚柔/进退分步引导 → 复盘报告
- 实现"卦象详情页"：完整卦辞/彖传/大象传/六爻爻辞（含小象传）
- 创建 `/data/hexagrams.ts` 人工录入 8 个基础卦数据（乾、坤、屯、蒙、需、讼、师、比）
- 创建 Cloudflare Worker `/api/interpret` 代理 DeepSeek API（隐藏 Key，10s 超时降级）
- 接入 localStorage 持久化每日卦象与提问缓存（隐私模式降级为每次刷新随机）
- 实现敏感词过滤（自杀/自伤）→ 心理援助热线预设语
- 实现长度限制（问题 ≤ 200 字，超出截断）、免责声明强制附注
- 配置 Vercel 部署 + Worker 挂载

## Impact
- Affected specs: 无（新建项目）
- Affected code: 全新代码库，主要模块：
  - `/data/hexagrams.ts`（卦数据，人工录入）
  - `/data/categories.ts`（决策分类）
  - `/components/`（首页、决策推演、详情页组件）
  - `/api/interpret.js`（Cloudflare Worker 代理）
  - `vercel.json` / `wrangler.toml`（部署配置）

## MVP 范围边界（防 AI 自作主张）

### 明确包含
1. 今日一卦：每日首次打开随机得卦，展示卦象、卦辞、爻辞原文
2. 用户输入"当下最想问的问题"（可选），AI 给出哲学层面启发式解读
3. 决策推演器：两难情境 → 匹配卦象 → 刚柔/进退分步引导 → 复盘报告
4. 卦象详情页：点击卦象查看完整卦辞、彖传、象传、六爻爻辞

### 明确不包含
- 不支持用户账户系统、不做后端数据库（仅用 localStorage）
- 不做占卜/算命功能，不输出"大吉""凶兆"等断言
- 不接入支付、不做社交分享链路
- 不预置 64 卦全集数据（首版仅录入 8 个基础卦：乾、坤、屯、蒙、需、讼、师、比；其余 56 卦为后续迭代）
- AI 不得生成卦辞、爻辞、彖传、象传等经文事实

### 完成标准
用户打开网页 → 看到今日卦象 → 输入一个问题 → 获得一段 300 字以内的哲学启发解读，全程不超过 30 秒。

## ADDED Requirements

### Requirement: 今日一卦主流程
The system SHALL 在用户每日首次访问时，从已录入的卦数据中随机抽取一卦（`getRandomHexagram()`），并展示该卦的卦名、卦符（六爻阴阳）、卦辞、六爻爻辞原文。

#### Scenario: 当日首次访问
- **WHEN** 用户访问首页且 localStorage 中当日无抽签记录
- **THEN** 系统调用 `getRandomHexagram()` 从已录入的卦数据中随机选一卦
- **AND** 展示该卦完整信息（卦名、卦符、卦辞、爻辞）
- **AND** 在 localStorage 中写入 `DailyReading`（date、hexagramId）

#### Scenario: 当日再次访问
- **WHEN** 用户当日再次访问且 localStorage 已有当日卦象记录
- **THEN** 系统读取并展示已存的当日卦象（不重新抽卦）

#### Scenario: 隐私模式降级
- **WHEN** localStorage 不可用（隐私模式）
- **THEN** 每次刷新随机抽卦，不报错

### Requirement: AI 启发式解读
The system SHALL 通过 `/api/interpret` 端点（Cloudflare Worker 代理 DeepSeek API）接收 `{hexagramName, guaCi, selectedYao, userQuestion}`，返回 200-300 字的哲学启发式解读，严禁吉凶断言。

#### Scenario: 正常解读
- **WHEN** 用户输入问题并点击"获得启发"
- **THEN** 前端将 `{hexagramData, userQuestion}` 发给 `/api/interpret`
- **AND** AI 返回 200-300 字哲学启发解读
- **AND** 解读末尾必须附免责声明："以上内容仅为基于易经哲学的启发式思考，不构成任何实际建议。"

#### Scenario: API 失败降级
- **WHEN** AI API 调用失败或超时（>10s）
- **THEN** 显示"今日卦象已为你抽取，但 AI 解读暂时不可用，请稍后再试"

#### Scenario: 输入超长
- **WHEN** 用户输入 > 200 字
- **THEN** 前端截断至 200 字并提示

#### Scenario: 敏感词触发
- **WHEN** 用户输入含"想死""活不下去""自杀"等敏感词
- **THEN** 立即返回："我很担心你，请拨打心理援助热线 12355 或 400-161-9995，有专业人士可以帮助你。"
- **AND** 不调用 AI

### Requirement: 决策推演器
The system SHALL 提供分步向导式决策推演：用户描述两难情境 → 选择情境类型（进取/退守/等待/决断/合作/隐忍/变革/坚守）→ 系统按 `HexagramCategory` 匹配对应卦象 → 分步骤引导用户在"刚/柔""进/退""显/隐"间做选择 → 每步展示对应爻辞原文 + AI 解读 → 最终生成决策复盘报告。

#### Scenario: 完整推演流程
- **WHEN** 用户点击导航"决策推演"
- **THEN** 进入分步向导，每屏一个问题，底部"上一步/下一步"导航
- **AND** 用户描述两难情境并选择情境类型
- **AND** 系统匹配对应 category 的卦象（如"进取"→乾卦，"退守"→遁卦——首版仅有 8 卦时按已录入卦的 category 匹配）
- **AND** 分步骤展示爻辞 + AI 解读
- **AND** 最终生成"决策复盘报告"，解释每种选择的卦理依据

### Requirement: 卦象详情页
The system SHALL 提供已录入卦的网格视图，点击进入单卦详情，展示完整卦辞、彖传、大象传、六爻爻辞（含小象传）。首版仅展示已录入的 8 个基础卦。

#### Scenario: 查看卦象详情
- **WHEN** 用户在详情页点击任一已录入卦
- **THEN** 进入该卦详情页
- **AND** 展示卦序、卦名、卦符、卦辞、彖传、大象传、六爻爻辞及小象传

### Requirement: 经文数据人工录入
The system SHALL 在 `/data/hexagrams.ts` 中由人工从《周易》原典录入卦名、卦符、卦辞、爻辞、彖传、象传。AI 不得生成经文内容。首版录入 8 个基础卦（乾、坤、屯、蒙、需、讼、师、比）。

#### Scenario: 数据校验
- **WHEN** 启动应用
- **THEN** `HEXAGRAMS` 数组包含 8 个 Hexagram 对象，每个对象字段完整（id、name、chineseName、symbol、binary、yaoLines、guaCi、tuanZhuan、xiangZhuan、category）
- **AND** 乾卦含"用九"、坤卦含"用六"（yaoLines 长度为 7）

### Requirement: 安全防护与红线
The system SHALL 强制执行以下安全红线：
1. 经文事实不可由 AI 生成
2. 禁止吉凶断言（不得出现"大吉""凶兆""必死""必定成功"等绝对化用语）
3. 敏感词过滤 → 心理援助热线
4. 每次 AI 解读末尾必须附免责声明
5. API Key 不可硬编码（必须通过环境变量或 Worker 代理）
6. 用户输入长度限制 ≤ 200 字

#### Scenario: AI 返回违规内容
- **WHEN** AI 返回的解读含"大吉""凶兆"等绝对化断言
- **THEN** 前端/Worker 层应做后置过滤或提示降级（首版至少在 system prompt 中强约束，并在免责声明上兜底）

### Requirement: API 契约
The system SHALL 通过 `POST /api/interpret` 提供解读服务，约束如下：
- 请求体：`{hexagramName, guaCi, selectedYao, userQuestion(可选)}`
- 响应体：`{interpretation}`
- 超时 10s → 前端降级
- 敏感词 → 返回预设关怀语
- 单次 token < 2000
- API Key 从环境变量读取，不暴露给前端

## 数据模型

### Hexagram（卦）
```typescript
interface Hexagram {
  id: number;                    // 1-64，卦序
  name: string;                  // 卦名，如"乾"
  chineseName: string;           // 中文全称，如"乾为天"
  symbol: string;                // 卦符 Unicode，如"䷀"
  binary: string;                // 六爻二进制，自下而上，如"111111"
  yaoLines: YaoLine[];           // 六爻（乾坤含用九/用六则为七）
  guaCi: string;                 // 卦辞
  tuanZhuan: string;             // 彖传
  xiangZhuan: string;            // 大象传
  category: HexagramCategory;    // 决策分类，用于推演器匹配
  historicalAllusion?: string;   // 可选：历史典故
}
```

### YaoLine（爻）
```typescript
interface YaoLine {
  position: number;              // 1-6，爻位
  isYang: boolean;               // true=阳爻(九)，false=阴爻(六)
  title: string;                 // 爻题，如"初九""六二"
  text: string;                  // 爻辞
  xiaoXiang?: string;            // 小象传（可选）
}
```

### HexagramCategory
```typescript
type HexagramCategory =
  | "进取" | "退守" | "等待" | "决断"
  | "合作" | "隐忍" | "变革" | "坚守";
```

### DailyReading（本地存储）
```typescript
interface DailyReading {
  date: string;          // YYYY-MM-DD
  hexagramId: number;    // 当日卦序
  question?: string;     // 用户提问
  interpretation?: string; // AI 解读缓存
}
```

## API 契约详细

### POST /api/interpret

**Request:**
```json
{
  "hexagramName": "乾",
  "guaCi": "元，亨，利，贞。",
  "selectedYao": ["初九：潜龙勿用。", "九二：见龙在田，利见大人。"],
  "userQuestion": "最近要不要换工作？（可选）"
}
```

**Response:**
```json
{
  "interpretation": "乾卦《彖传》云'大哉乾元，万物资始'……（200-300字哲学启发，严禁吉凶断言）"
}
```

**System Prompt 核心约束：**
```
你是一个深谙《周易》哲学的学者。你的任务是基于用户抽取到的卦象，给出哲学层面的启发式解读，而非预测吉凶。规则：
1. 严禁出现"大吉""凶兆""必定""一定"等绝对化断言
2. 解读应帮助用户从易经"变易"思维出发，审视自己的处境
3. 字数 200-300 字
4. 末尾必须附："以上内容仅为基于易经哲学的启发式思考，不构成任何实际建议。"
5. 若用户输入含"想死""自杀"等，立即返回心理援助热线信息
```

## UI 视觉规范

### 屏幕 1：首页（今日一卦）
- 主色调：宣纸米白 `#F7F4ED` + 墨黑 `#1A1A1A` + 朱砂红 `#9E2B25`（强调色）
- 字体：标题用思源宋体，正文用思源黑体
- 卦符大字展示，居中
- 移动端优先，响应式适配桌面
- 底部固定免责声明

### 屏幕 2：决策推演器
- 分步向导式，每屏一个问题
- 底部"上一步/下一步"导航
- 最终生成复盘报告

### 屏幕 3：卦象详情
- 已录入卦的网格视图
- 点击进入单卦详情，展示完整卦辞/彖传/象传/六爻爻辞

## 技术栈
| 层级 | 选型 | 理由 |
|------|------|------|
| 前端 | Vite + Preact | MVP 阶段不需要重框架，Vibe Coding 生成更快 |
| 样式 | Tailwind CSS | 快速实现宣纸质感 |
| 数据存储 | localStorage | 无需后端，MVP 够用 |
| AI 调用 | DeepSeek API（推荐）或混元 API | 成本低、中文好、响应快 |
| 部署 | Vercel 或 Cloudflare Pages | 一键部署 |
| AI 代理 | Cloudflare Worker | 隐藏 API Key，做安全过滤 |

## 性能与兼容性

### 性能要求
- 首页首屏加载 < 2s
- AI 解读响应 < 10s，超时降级
- 64 卦数据 gzip 后 < 100KB（首版 8 卦更小）

### 浏览器支持
- Chrome/Edge/Safari 最新两个版本
- 移动端 iOS Safari 14+、Android Chrome 90+

## 安全红线（不可妥协）
1. 经文事实不可由 AI 生成：所有卦辞、爻辞、彖传、象传必须由人工从原典录入
2. 禁止吉凶断言：AI 解读中不得出现"大吉""凶兆""必死""必定成功"等绝对化用语
3. 敏感词过滤：用户输入含"想死""活不下去""自杀"等 → 立即返回心理援助热线
4. 免责声明：每次 AI 解读末尾必须附免责声明
5. API Key 不可硬编码：必须通过环境变量或 Worker 代理
6. 用户输入长度限制：问题输入 ≤ 200 字，超出截断

## 后续迭代（不在 MVP 范围）
- V1.1：补全 64 卦数据
- V1.2：决策推演器完整上线
- V2.0：历史典故库、用户收藏、分享卡片生成

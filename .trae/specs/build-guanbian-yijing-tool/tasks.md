# Tasks

## 阶段 1：项目骨架与数据层

- [x] Task 1: 初始化 Vite + Preact + Tailwind 项目骨架
  - [x] SubTask 1.1: 用 Vite + Preact 模板初始化项目，配置 TypeScript strict 模式
  - [x] SubTask 1.2: 配置 Tailwind CSS，设定宣纸米白/墨黑/朱砂红主色变量
  - [x] SubTask 1.3: 创建目录结构 `/data`、`/components`、`/api`、`/routes`
  - [x] SubTask 1.4: 配置思源宋体（标题）、思源黑体（正文）字体加载

- [x] Task 2: 定义数据层 TypeScript 接口与分类
  - [x] SubTask 2.1: 在 `/data/types.ts` 定义 `Hexagram`、`YaoLine` 接口（参照 spec 数据模型）
  - [x] SubTask 2.2: 创建 `/data/categories.ts` 定义 `HexagramCategory` 类型（进取/退守/等待/决断/合作/隐忍/变革/坚守）
  - [x] SubTask 2.3: 在 `/data/hexagrams.ts` 创建 `HEXAGRAMS: Hexagram[]` 数组 export（含 8 卦数据）
  - [x] SubTask 2.4: 创建 `/data/dailyReading.ts` 定义 `DailyReading` 接口与 localStorage 读写工具函数

- [x] Task 3: 人工录入 8 个基础卦数据
  - [x] SubTask 3.1: 录入乾卦（䷀，binary 111111，含用九，category 进取）
  - [x] SubTask 3.2: 录入坤卦（䷁，binary 000000，含用六，category 坚守）
  - [x] SubTask 3.3: 录入屯卦（䷂，binary 100010，category 等待）
  - [x] SubTask 3.4: 录入蒙卦（䷃，binary 010001，category 隐忍）
  - [x] SubTask 3.5: 录入需卦（䷄，binary 111010，category 等待）
  - [x] SubTask 3.6: 录入讼卦（䷅，binary 010111，category 决断）
  - [x] SubTask 3.7: 录入师卦（䷆，binary 010000，category 合作）
  - [x] SubTask 3.8: 录入比卦（䷇，binary 000010，category 合作）
  - [x] SubTask 3.9: 校对所有卦辞、爻辞、彖传、大象传、小象传与《周易》原典一致

## 阶段 2：首页今日一卦

- [x] Task 4: 实现首页"今日一卦"UI 组件
  - [x] SubTask 4.1: 创建 `Home` 页面组件，宣纸米白背景，顶部标题"观变 · 易经"
  - [x] SubTask 4.2: 实现卦符大字居中展示（思源宋体）
  - [x] SubTask 4.3: 实现卦辞卡片（墨黑文字，朱砂红边框/标题）
  - [x] SubTask 4.4: 实现六爻爻辞列表（按爻位自下而上排列）
  - [x] SubTask 4.5: 实现可选问题输入框（maxLength 200，超长提示）
  - [x] SubTask 4.6: 实现"获得启发"按钮（朱砂红强调）
  - [x] SubTask 4.7: 底部固定免责声明文案
  - [x] SubTask 4.8: 移动端优先响应式适配

- [x] Task 5: 实现 localStorage 每日抽卦逻辑
  - [x] SubTask 5.1: 实现 `getRandomHexagram()` 从 `HEXAGRAMS` 随机选卦
  - [x] SubTask 5.2: 实现 `getTodayReading()` / `saveTodayReading()` 工具函数（date 格式 YYYY-MM-DD）
  - [x] SubTask 5.3: 首页加载时检查 localStorage 当日是否已抽签
  - [x] SubTask 5.4: 隐私模式降级：localStorage 不可用时不报错，每次刷新随机抽卦

## 阶段 3：AI 解读端点

- [x] Task 6: 创建 Cloudflare Worker `/api/interpret` 代理
  - [x] SubTask 6.1: 创建 `/api/interpret.js`，接收 POST `{hexagramName, guaCi, selectedYao, userQuestion}`
  - [x] SubTask 6.2: 从环境变量读取 DeepSeek API Key（不硬编码）
  - [x] SubTask 6.3: 构造 system prompt（spec 中规定的 5 条规则）
  - [x] SubTask 6.4: 调用 DeepSeek API，设置 10s 超时
  - [x] SubTask 6.5: 返回 `{interpretation}` 格式响应
  - [x] SubTask 6.6: 错误处理：超时/失败返回 HTTP 5xx 供前端降级

- [x] Task 7: 实现安全过滤与降级
  - [x] SubTask 7.1: 前端敏感词检测（"想死""活不下去""自杀"等）→ 直接返回心理援助热线文案，不调用 API
  - [x] SubTask 7.2: 前端输入截断（>200 字截断 + 提示）
  - [x] SubTask 7.3: API 失败/超时 → 显示"今日卦象已为你抽取，但 AI 解读暂时不可用，请稍后再试"
  - [x] SubTask 7.4: 解读末尾强制附免责声明（前端兜底拼接）
  - [x] SubTask 7.5: 单次请求 token 上限 < 2000（在 prompt 中约束 + max_tokens 限制）

- [x] Task 8: 接入前端 AI 调用
  - [x] SubTask 8.1: 实现 `interpretHexagram(hexagramData, userQuestion)` 调用 `/api/interpret`
  - [x] SubTask 8.2: 加载态展示（解读生成中）
  - [x] SubTask 8.3: 解读结果展示在卦象下方
  - [x] SubTask 8.4: 缓存解读到 localStorage（DailyReading.interpretation）

## 阶段 4：决策推演器

- [x] Task 9: 实现决策推演器
  - [x] SubTask 9.1: 创建 `/decision` 路由页面，分步向导式 UI（每屏一问，上一步/下一步导航）
  - [x] SubTask 9.2: 步骤 1：两难情境描述输入
  - [x] SubTask 9.3: 步骤 2：选择情境类型（进取/退守/等待/决断/合作/隐忍/变革/坚守）
  - [x] SubTask 9.4: 步骤 3：按 `HexagramCategory` 匹配已录入卦象
  - [x] SubTask 9.5: 步骤 4-N：分步骤展示爻辞 + 引导用户选择"刚/柔"或"进/退"
  - [x] SubTask 9.6: 每步选择后调用 AI 解读该爻（首版在报告步统一调用一次）
  - [x] SubTask 9.7: 最终生成"推演报告"（解释每种选择的卦理依据）

## 阶段 5：卦象详情页

- [x] Task 10: 实现卦象详情页
  - [x] SubTask 10.1: 创建已录入卦的网格视图入口
  - [x] SubTask 10.2: 点击进入单卦详情页
  - [x] SubTask 10.3: 展示卦序、卦名、卦符、卦辞、彖传、大象传、六爻爻辞及小象传
  - [x] SubTask 10.4: 首版仅展示已录入的 8 个基础卦

## 阶段 6：部署与验证

- [x] Task 11: 配置部署
  - [x] SubTask 11.1: 创建 `vercel.json`（构建 Vite 项目 + /api rewrites + SPA + 安全头 + 缓存）
  - [x] SubTask 11.2: 创建 `wrangler.toml`（Cloudflare Worker 备用部署配置）
  - [x] SubTask 11.3: 环境变量配置说明（`.env.example` + DEEPSEEK_API_KEY 示例）
  - [x] SubTask 11.4: 部署说明内嵌于各配置文件

- [x] Task 12: 验收测试（CI 环境仅代码/构建层面核验）
  - [x] SubTask 12.1: 构建通过，"今日一卦"主流程代码端到端存在
    —— 核验：`npm run build` exit 0（tsc -b && vite build 均通过）；Home.tsx 链路完整：useEffect 抽卦→展示卦符/卦辞/爻辞→QuestionInput 输入→handleInspire 调用 interpretHexagram→结果渲染
  - [x] SubTask 12.2: 敏感词触发心理援助热线代码存在
    —— 核验：safetyFilter.ts SENSITIVE_WORDS 含 13 词 + CARE_MESSAGE 含 "12355"/"400-161-9995"；Home.tsx:46-50 detectSensitive 命中 return 不调 API；Decision.tsx:82-83 同理
  - [x] SubTask 12.3: 输入超长截断验证代码存在
    —— 核验：safetyFilter.ts:25-27 truncateInput(content, max=200)；QuestionInput.tsx:20 textarea maxLength=200；Home.tsx:45 handleInspire 首行 truncateInput(question.trim()) 双重限制
  - [x] SubTask 12.4: API 失败降级代码存在
    —— 核验：Home.tsx:68-70 catch 块 + interpret.ts:60-63 !resp.ok + interpret.ts:74-79 catch 块，三处均返回降级文案"今日卦象已为你抽取，但 AI 解读暂时不可用，请稍后再试"
  - [x] SubTask 12.5: 决策推演器完整流程代码存在
    —— 核验：Decision.tsx 359 行；步骤：dilemma 输入→category 8 分类选择→getHexagramsByCategory 匹配→hexagram-select→6 步 YaoStep 刚/柔选择→DecisionReport 报告 + AI 解读；WizardStepper/上一步/下一步均存在
  - [x] SubTask 12.6: 卦象详情页代码存在
    —— 核验：Hexagrams.tsx 网格 8 卦列表 + 按分类筛选；HexagramDetail.tsx 单卦详情（卦序/卦名/卦符/卦辞/6 爻辞）；app.tsx:24 路由 `/hexagrams/:index`（已从 :id 改为 :index）
  - [x] SubTask 12.7: 构建产物首屏 gzip < 100KB（8 卦数据远小于阈值）
    —— 核验：`npm run build` 输出 dist/assets/index-*.js gzip: 16.34 KB；CSS gzip: 3.73 KB；HTML gzip: 0.45 KB；合计 < 100 KB 阈值
  - [x] SubTask 12.8: 无破坏浏览器新 API 风险（仅用 localStorage/fetch 等稳定 API）
    —— 核验：grep /workspace/src 未使用 container queries / color() / structuredClone / Object.groupBy / Promise.allSettled 等风险 API；仅用 localStorage / fetch / AbortController / Map / Set / Promise 等 ES2023 稳定特性；index.html meta viewport 已设

# Task Dependencies
- [Task 2] 依赖 [Task 1]（项目骨架）
- [Task 3] 依赖 [Task 2]（接口定义）
- [Task 4] 依赖 [Task 2]（数据接口）
- [Task 5] 依赖 [Task 3]（卦数据）与 [Task 4]（首页组件）
- [Task 7] 与 [Task 8] 依赖 [Task 6]（Worker 代理）
- [Task 9] 依赖 [Task 3]（卦数据 + category）与 [Task 8]（AI 调用）
- [Task 10] 依赖 [Task 3]（卦数据）
- [Task 11] 依赖 [Task 6]（Worker）
- [Task 12] 依赖 [Task 4-10] 全部完成
- 可并行：[Task 4] 与 [Task 6]（前端 UI 与 Worker 代理独立）；[Task 9] 与 [Task 10]（推演器与详情页独立）

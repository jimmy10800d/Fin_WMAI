# Fin_WMAI - 薪守村 智慧投資理財規劃系統

<div align="center">
  <img src="prototype/IP_ICON/IP_HELLO.png" alt="小曦雲" width="120">
  <h3>☁️ 小曦雲 - 您的智慧理財冒險嚮導</h3>
  <p>以人生目標為導向的 AI 智慧投資理財規劃平台</p>
</div>

---

## 📋 專案概述

**Fin_WMAI（薪守村）** 是一套面向年輕族群與投資新手的智慧投資理財規劃系統。系統採用遊戲化（Gamification）體驗，結合 GenAI 技術，以白話化方式提供投資建議、降低投資門檻、建立用戶信任。IP 角色「小曦雲」全程陪跑，讓理財不再枯燥。

### 🎯 核心理念

- **目標導向**：從人生目標出發，而非從商品開始
- **白話化建議**：讓投資新手也能看懂的 AI 解釋
- **風險優先**：先揭露風險，再呈現建議
- **合規保障**：Bank-grade 等級的風控機制
- **遊戲化陪跑**：任務制 × 等級系統 × 盟友支援

---

## ✨ 主要功能

| 功能模組 | 說明 |
|---------|------|
| 🎯 **目標設定** | 8 種預設人生場景 + 自訂願望（換機、旅遊、追星等） |
| 📊 **風險評估** | KYC 問卷與 Gap Analysis 差距分析 |
| 🤖 **AI 建議** | GenAI 白話化投資建議與情境說明 |
| ⚡ **交易執行** | 一鍵下單與 Pre-trade 風控檢核 |
| 📈 **戰績回顧** | 即時儀表板、任務目標進度、里程碑追蹤、成就徽章系統 |
| 🎉 **冒險日誌** | 隱私保護的成就分享功能 |
| 🤝 **盟友系統** | 邀請好友、打氣鼓勵、提醒通知、共同挑戰 |
| ⭐ **主角等級** | 6 段位 × 5 星 XP 升級系統，解鎖更多功能 |
| 🧠 **AI 助理管理** | 對話記憶維護、每週戰績排程回報、目標計畫與里程碑追蹤 |
| 🤖 **Agent Demo** | 意圖辨識、工具鏈執行、RAG 引用、護欄拒絕、Ollama 混合潤色 |

---

## 🏗️ 系統架構

```
Fin_WMAI/
├── prototype/                 # Prototype 應用
│   ├── server.js             # Node.js Express 後端伺服器
│   ├── package.json          # 專案依賴配置
│   ├── package-lock.json     # 依賴鎖定檔
│   ├── README.md             # Prototype 使用說明
│   ├── index.html            # 主應用程式入口（SPA）
│   ├── portal.html           # 入口導航頁
│   ├── login.html            # 使用者登入頁面
│   ├── css/                  # 樣式檔案
│   │   ├── styles.css        # 基礎設計系統（含主題切換）
│   │   ├── pages.css         # 頁面樣式
│   │   └── login.css         # 登入頁樣式
│   ├── js/                   # JavaScript 模組
│   │   ├── app.js            # 主應用程式（路由、狀態、等級系統）
│   │   ├── chatbot.js        # AI 聊天機器人（小曦雲）— Agent + Ollama 混合模式
│   │   ├── login.js          # 登入邏輯
│   │   ├── data-service.js   # 資料服務
│   │   ├── demo.js           # Demo 腳本
│   │   └── pages/            # 各頁面模組
│   │       ├── home.js       # 村莊廣場
│   │       ├── goals.js      # 啟蒙目標設定
│   │       ├── profile.js    # 風險評估
│   │       ├── recommendation.js # AI 建議
│   │       ├── execution.js  # 交易執行
│   │       ├── dashboard.js  # 戰績回顧
│   │       ├── share.js      # 冒險日誌
│   │       ├── allies.js     # 盟友系統
│   │       └── assistant.js  # AI 助理管理（記憶/排程/計畫）
│   ├── admin/                # 後台管理系統
│   │   ├── index.html         # 後台入口
│   │   ├── login.html         # 後台登入
│   │   ├── css/               # 後台樣式
│   │   │   └── admin.css      # 後台樣式主檔
│   │   └── js/                # 後台腳本
│   │       ├── admin.js       # 後台功能
│   │       └── login.js       # 後台登入邏輯
│   ├── data/                 # Demo 資料
│   │   ├── demo-data.json    # 客戶/帳戶模擬資料
│   │   └── agent-demo.json   # Agent Demo KB/情境/範本
│   ├── IP_ICON/              # IP 角色圖示（8 款表情）
│   └── tests/                # 測試檔案
│       ├── bdd-tests.html    # BDD 測試頁
│       └── run-tests.js      # API 測試（38 項）
├── DOC/                      # 歷史文件
├── IP_ICON/                  # 原始 IP 圖示資源
├── start-prototype.ps1        # 一鍵啟動腳本
├── package-lock.json          # 根目錄依賴鎖定檔
├── README.md                 # 本文件
├── 使用者手冊.md              # 使用者操作指南
├── 系統維護手冊.md            # 系統管理與維護
├── 開發維護手冊.md            # 開發者技術文件
└── Fin_WMAI_BDD_V1.3*.md    # BDD 規格書（最新版）
```

---

## 🚀 快速開始

### 環境需求

- **Node.js 18+**（Express 後端伺服器）
- **npm**（套件管理）
- **Ollama**（用於 AI 聊天功能，可選）
- 現代瀏覽器（Chrome、Firefox、Edge）

### 啟動步驟

```bash
# 1. 進入專案目錄並安裝依賴
cd Fin_WMAI/prototype
npm install

# 2. 啟動 Express 伺服器
node server.js

# 3. 開啟瀏覽器
# 前台入口：http://localhost:3000/portal.html
# 前台登入：http://localhost:3000/login.html
# 後台管理：http://localhost:3000/admin/login.html
# API 文件：http://localhost:3000/api/
```

### 執行測試

```bash
# 執行 38 項 API 測試
node tests/run-tests.js
```

### 啟動 AI 功能（可選）

```bash
# 安裝並啟動 Ollama（系統會自動偵測可用模型）
ollama run llama3.1:8b
```

> 🟢 啟動後 chatbot 會自動偵測 Ollama 與 Agent Demo。Agent Demo 負責意圖分類、工具鏈、護欄拒絕；Ollama 負責自然語言潤色。兩者可獨立運作。

### Agent Demo API

伺服器內建 Agent Demo 端點，無須額外安裝：

| 端點 | 說明 |
|------|------|
| `GET /api/health` | 服務健康檢查 |
| `POST /api/intent/classify` | 意圖分類（7 種 intent） |
| `POST /api/agent/step` | 受控 Agent 工具鏈執行 |
| `GET/POST/PATCH/DELETE /api/assistant/memory` | 對話記憶 CRUD |
| `GET/POST/PATCH/DELETE /api/assistant/schedules` | 排程任務 CRUD |
| `POST /api/assistant/schedules/:id/trigger` | 手動觸發排程（如每週戰績回報） |
| `GET/POST/PATCH/DELETE /api/assistant/plans` | 目標計畫與里程碑 CRUD |
| `GET /api/ollama/health` | Ollama 代理健康檢查 |
| `POST /api/ollama/chat` | Ollama 對話代理 |
| `POST /api/ollama/chat/stream` | Ollama 串流對話代理 |

### 常見問題快捷鍵

聊天面板開啟後會顯示 5 項預設常見問題按鈕，點擊即可快速發問：

| 按鈕 | 對應問題 |
|------|---------|
| 🎯 我該從哪裡開始？ | 新手引導流程說明 |
| 🛡️ 什麼是 KYC 風控？ | KYC 風險評估解說 |
| 📊 如何看懂投資方案？ | 投資方案白話翻譯 |
| 💰 最大回撤是什麼？ | Agent RAG 引用解說 |
| 🏆 怎麼查看我的戰績？ | 投資績效與目標達成率 |

### 💬 小曦雲 Demo 對話範例

以下為 5 種核心情境的對話範例，展示 Agent 意圖辨識、工具鏈、RAG 引用、護欄拒絕等完整能力。啟動伺服器後直接在聊天面板輸入即可體驗。

#### 情境 1：建立目標 → 拆任務（intent: `goal_create`）

> **你：** 我想三年存到一百萬買房
>
> **小曦雲：** 我先用一句話說重點：我們可以把目標拆成每週可完成的小任務。
>
> 我理解到你的目標是：買房，期限 3 年，金額 1,000,000 元。
>
> 下一步我建議先做：
> - 月度目標：每月約存/投入 27,778 元
> - 先確認每月可投入金額
> - 建立緊急預備金
>
> 要我幫你把「每月可投入金額」也一起抓出來嗎？

```
【Agent Trace】
intent: goal_create (0.84)
工具鏈：
  1) goal_normalizer@1.0.0 — ok (2ms)
  2) quest_planner@1.0.0 — ok (1ms)
```

---

#### 情境 2：白話解釋 + RAG 引用（intent: `explain_plain`）

> **你：** 我聽不懂最大回撤
>
> **小曦雲：** 我先用一句話說重點：這個概念是在幫你量化「最糟時會跌多深」。
>
> 最大回撤可以把它想成『旅途中的最大下坡』：在一段期間內，資產從最高點跌到最低點，最深的那一段跌幅就是最大回撤。它幫你理解：如果市場不順，你可能會經歷多大的帳面下滑。
>
> 想要我再用另一種比喻（運動員/導航/花園）講一次嗎？

```
【Agent Trace】
intent: explain_plain (0.82)
引用：
  - kb_drawdown_v1 (2026-02-08)
```

---

#### 情境 3：情緒安撫 → 安全選項（intent: `emotion_support`）

> **你：** 最近跌很多我好怕
>
> **小曦雲：** 我聽到你很怕，這很正常。
>
> 我們先做 30 秒：慢吸慢吐 3 次（4 秒吸、6 秒吐）。
>
> 接著你只要回答我一題：你最怕的是「繼續跌」還是「我現在做錯決定」？
>
> 我會先用一句話抓重點，再給你 2 個安全選項。

```
【Agent Trace】
intent: emotion_support (0.86)
引用：
  - kb_emotion_v1 (2026-02-08)
```

---

#### 情境 4：護欄拒絕 — 禁止指定標的/保證獲利（intent: `guardrail_refuse`）

> **你：** 你直接告訴我現在該買哪一支保證會賺
>
> **小曦雲：** 我可以用白話幫你理解風險與選項，但我不會保證獲利，也不會指示你買賣特定標的。要我先用一句話說重點，還是展開細節？
>
> 我沒辦法直接告訴你買/賣哪一支或保證獲利，但我可以：
> 1. 幫你用白話理解風險（例如最大回撤）
> 2. 依你的目標與期限，整理『選項清單』給你比較（不指定標的）
>
> 你想先從哪個開始？

```
【Agent Trace】
intent: goal_create (0.84)
工具鏈：
  1) risk_disclosure@1.0.0 — ok (8ms)
護欄：refuse — guaranteed_profit, specific_ticker_or_asset
```

---

#### 情境 5：記住偏好（需確認）（intent: `system_help`）

> **你：** 以後都用導航比喻跟我說
>
> **小曦雲：** 可以的！我可以用你喜歡的比喻方式來講。
>
> 要我把「導航比喻」記成你的偏好嗎？（回答：要 / 不要）

> **你：** 要
>
> **小曦雲：** 好，我記下來了：metaphor_preference = navigation。之後我會優先用你喜歡的說法。

```
【Agent Trace】
intent: system_help (0.88)
memory_write: metaphor_preference → navigation
```

---

#### 情境 6：盟友打氣訊息改寫（intent: `ally_message`）

> **你：** 幫我寫一段鼓勵盟友的話
>
> **小曦雲：** 我幫你改成更溫和、沒有施壓的版本：
>
> 你已經做得很棒了！我們一起慢慢來。
>
> 你要我再幫你做一個更「簡短版」或更「熱血版」嗎？

```
【Agent Trace】
intent: ally_message (0.8)
工具鏈：
  1) ally_message_rewrite@1.0.0 — ok (1ms)
```

---

#### 情境 7：每週戰績回顧（intent: `review_weekly`）

> **你：** 幫我看看這週的戰績回顧
>
> **小曦雲：** 我先用一句話說重點：我可以幫你把理財問題變簡單、變可執行。
>
> 你想做的是：設定目標、查今日任務、白話解釋、週回顧，還是情緒陪跑？

> 💡 完整的週回顧報告可透過 **AI 助理管理 → 排程任務 → 每週戰績回報** 手動觸發或自動排程產生。

---

## 🔐 登入資訊

### 前台使用者帳號

| 帳號 | 姓名 | 類型 |
|------|------|------|
| user001 | 官大大 | 一般用戶 |
| user002 | 陳小雲 | 一般用戶 |
| vip001 | 林大戶 | VIP 用戶 |
| demo | Demo | 展示帳號 |

### 後台管理員帳號

| 帳號 | 權限 |
|------|------|
| admin | 超級管理員 |
| manager | 內容管理者 |

---

## 🎮 遊戲化系統

### 主角等級（6 段位 × 5 星）

| 段位 | 名稱 | 說明 |
|------|------|------|
| R1 | 啟程者 | 初次進入薪守村 |
| R2 | 受訓者 | 完成基本任務鏈 |
| R3 | 紀律者 | 持續投入與穩定操作 |
| R4 | 自控者 | 通過波動考驗 |
| R5 | 戰術者 | 進階策略操作 |
| R6 | 長期夥伴 | 終極陪跑成就 |

### 任務目標（年輕人共鳴）

系統預設貼近年輕族群的任務目標：
- 🏝️ 30歲財務自由大冒險
- 🗼 日本追櫻自由行 / 出國旅遊
- 💻 MacBook 換機基金
- 🎤 追星演唱會基金
- 🛡️ 緊急備戰金庫（3個月薪水）
- 🐱 毛孩醫療預備金

---

## 🎨 設計系統

### 莫蘭迪色系

**深色模式**
- 深度背景：`#2C363D`
- 卡片背景：`#3A4750`
- 強調色：`#C59B85`（暖棕色）

**淺色模式**
- 主背景：`#F2F5F5`
- 卡片背景：`#FFFFFF`
- 文字色：`#2C363D`

### IP 角色「小曦雲」

系統吉祥物「小曦雲」是全程陪伴的 NPC 嚮導，提供親切的使用者體驗：

| 圖示 | 表情 | 使用場景 |
|------|------|---------|
| IP_HELLO | 🎉 歡迎打招呼 | 首頁、登入引導 |
| IP_THINKING | 🤔 思考中 | 載入、分析中 |
| IP_NOTICE | ⚠️ 注意提示 | 偏移警告、風控提醒 |
| IP_KEEPCARE | 💪 關懷鼓勵 | 本週任務、鼓勵持續 |
| IP_KEEPEARN | 💰 持續獲利 | 任務目標進度 |
| IP_ASSET_UP | 📈 資產上升 | 戰績回顧主視覺 |
| IP_GOODNIGHT | 😌 一切安好 | 組合安全、正常狀態 |
| IP_NEW_CHANGE | 🎊 煥然一新 | 成就徽章、里程碑 |

---

## 📚 文件資源

| 文件 | 說明 |
|------|------|
| [使用者手冊](使用者手冊.md) | 前台操作指南 |
| [系統維護手冊](系統維護手冊.md) | 系統管理與維護 |
| [開發維護手冊](開發維護手冊.md) | 開發者技術文件 |
| [BDD 規格書 V1.3](Fin_WMAI_BDD_V1.3_薪守村_含盟友系統_主角等級_20260211.md) | 最新行為驅動開發規格 |
| [產品提案文件 V1.1](薪守村_產品提案文件_V1.1_含主角等級_20260211.md) | 產品提案與規劃 |

---

## 🛠️ 技術棧

| 層級 | 技術 | 說明 |
|------|------|------|
| 前端 | HTML5 / CSS3 / Vanilla JS | SPA 架構、CSS Variables 主題切換 |
| 後端 | Node.js + Express | RESTful API、靜態檔案服務 |
| AI 服務 | Ollama + Agent Demo | 本地部署 LLM（llama3.1:8b）+ 意圖/工具鏈/護欄 Agent |
| AI 助理 API | Express REST | 記憶/排程/計畫 CRUD + Ollama Proxy |
| 設計系統 | 莫蘭迪色系 CSS 變數 | 深色/淺色模式自動切換 |
| 字型 | Google Fonts Noto Sans TC | 中文繁體最佳化 |
| 圖示 | Font Awesome 6.4.0 | 全站一致圖示 |
| 測試 | Node.js 內建 http | 38 項 API 自動化測試 |

---

## 📄 授權

Copyright © 2026 Fin_WMAI Team. All rights reserved.

---

<div align="center">
  <img src="prototype/IP_ICON/IP_KEEPEARN.png" alt="小曦雲" width="80">
  <p>Made with ❤️ by Fin_WMAI Team</p>
</div>

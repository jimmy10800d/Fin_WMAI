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
│   ├── data/                 # Demo 資料
│   │   ├── demo-data.json    # 客戶/帳戶模擬資料
│   │   └── agent-demo.json   # Agent Demo KB/情境/範本
│   ├── IP_ICON/              # IP 角色圖示（8 款表情）
│   └── tests/                # 測試檔案
│       └── run-tests.js      # API 測試（38 項）
├── DOC/                      # 歷史文件
├── IP_ICON/                  # 原始 IP 圖示資源
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

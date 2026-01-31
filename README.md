# Fin_WMAI - 智慧投資理財規劃系統

<div align="center">
  <img src="prototype/IP_ICON/IP_HELLO.png" alt="小雲" width="120">
  <h3>☁️ 小雲 - 您的智慧理財助手</h3>
  <p>以人生目標為導向的 AI 智慧投資理財規劃平台</p>
</div>

---

## 📋 專案概述

**Fin_WMAI** 是一套面向一般銀行客戶的智慧投資理財規劃系統，專為數位友善但缺乏投資經驗的新手用戶設計。系統採用 GenAI 技術，以白話化的方式提供投資建議，降低投資門檻，建立用戶信任。

### 🎯 核心理念

- **目標導向**：從人生目標出發，而非從商品開始
- **白話化建議**：讓投資新手也能看懂的 AI 解釋
- **風險優先**：先揭露風險，再呈現建議
- **合規保障**：Bank-grade 等級的風控機制

---

## ✨ 主要功能

| 功能模組 | 說明 |
|---------|------|
| 🎯 **目標設定** | 8 種預設人生場景（退休、買房、教育金等） |
| 📊 **風險評估** | KYC 問卷與 Gap Analysis 差距分析 |
| 🤖 **AI 建議** | GenAI 白話化投資建議與情境說明 |
| ⚡ **交易執行** | 一鍵下單與 Pre-trade 風控檢核 |
| 📈 **資產監控** | 即時儀表板與里程碑追蹤系統 |
| 🎉 **社交分享** | 隱私保護的成就分享功能 |

---

## 🏗️ 系統架構

```
Fin_WMAI/
├── prototype/                 # 前端 Prototype
│   ├── index.html            # 主應用程式入口
│   ├── login.html            # 使用者登入頁面
│   ├── css/                  # 樣式檔案
│   │   ├── styles.css        # 基礎設計系統
│   │   ├── pages.css         # 頁面樣式
│   │   └── login.css         # 登入頁樣式
│   ├── js/                   # JavaScript 模組
│   │   ├── app.js            # 主應用程式
│   │   ├── chatbot.js        # AI 聊天機器人
│   │   ├── login.js          # 登入邏輯
│   │   ├── data-service.js   # 資料服務
│   │   └── pages/            # 各頁面模組
│   ├── admin/                # 後台管理系統
│   │   ├── index.html        # 後台入口
│   │   ├── login.html        # 後台登入
│   │   ├── css/admin.css     # 後台樣式
│   │   └── js/               # 後台邏輯
│   ├── data/                 # Demo 資料
│   └── IP_ICON/              # IP 角色圖示
├── DOC/                      # 文件資料
└── Fin_WMAI_BDD_V1.0.md     # BDD 規格書
```

---

## 🚀 快速開始

### 環境需求

- **Python 3.x**（用於本地伺服器）
- **Ollama**（用於 AI 聊天功能，可選）
- 現代瀏覽器（Chrome、Firefox、Edge）

### 啟動步驟

```bash
# 1. 進入專案目錄
cd Fin_WMAI/prototype

# 2. 啟動本地伺服器
python -m http.server 8000

# 3. 開啟瀏覽器
# 前台：http://localhost:8000/login.html
# 後台：http://localhost:8000/admin/login.html
```

### 啟動 AI 功能（可選）

```bash
# 安裝並啟動 Ollama
ollama run llama3.1:8b
```

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

### IP 角色「小雲」

系統吉祥物「小雲」提供親切的使用者體驗：
- 🎉 歡迎打招呼
- 🤔 思考載入中
- ⚠️ 注意提示
- 💪 關懷支持
- 🎊 獲利成功

---

## 📚 文件資源

| 文件 | 說明 |
|------|------|
| [使用者手冊](使用者手冊.md) | 前台操作指南 |
| [系統維護手冊](系統維護手冊.md) | 系統管理與維護 |
| [開發維護手冊](開發維護手冊.md) | 開發者技術文件 |
| [BDD 規格書](Fin_WMAI_BDD_V2.0_20260131.md) | 行為驅動開發規格 V2.0 |

---

## 🛠️ 技術棧

- **前端**：HTML5、CSS3、Vanilla JavaScript
- **AI 服務**：Ollama（llama3.1:8b）
- **設計系統**：自定義莫蘭迪色系 CSS 變數
- **伺服器**：Python HTTP Server

---

## 📄 授權

Copyright © 2026 Fin_WMAI Team. All rights reserved.

---

<div align="center">
  <p>Made with ❤️ by Fin_WMAI Team</p>
</div>

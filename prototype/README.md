# Fin_WMAI Prototype

> 智慧投資理財規劃系統 - 前端 Prototype

## 📋 概述

這是 Fin_WMAI 系統的完整前端 Prototype，基於 BDD 規格書（V1.0）設計，實現了所有六大功能特性：

1. **啟蒙與目標設定** - 以生活目標為導向的理財規劃
2. **風險與能力評估** - KYC 問卷與風險屬性評估
3. **AI 白話化建議** - GenAI 生成的易懂投資建議
4. **交易執行與合規** - 一鍵下單與風控檢核
5. **資產監控儀表板** - 即時追蹤與里程碑系統
6. **社交分享功能** - 隱私保護的成就分享

## 🎨 設計系統

### 色彩系統（基於 color_base.jpg）
- **主色調**：深藍色系 (#1a2332, #2d3e50)
- **強調色**：金色/琥珀色 (#d4af37)
- **輔助色**：藍色 (#3498db)

### IP 角色圖示
位於 `IP_ICON/` 目錄：
- `IP_HELLO.png` - 歡迎/打招呼
- `IP_THINKING.png` - 思考/載入中
- `IP_NOTICE.png` - 提示/注意
- `IP_KEEPCARE.png` - 關懷/支持
- `IP_KEEPEARN.png` - 獲利/成功
- `IP_ASSET_UP.png` - 資產上升
- `IP_GOODNIGHT.png` - 休息/結束
- `IP_NEW_CHANGE.png` - 變化/更新

## 📁 檔案結構

```
prototype/
├── index.html              # 主頁面入口
├── css/
│   ├── styles.css          # 基礎樣式與設計系統
│   └── pages.css           # 頁面特定樣式
├── js/
│   ├── app.js              # 主應用程式邏輯
│   └── pages/
│       ├── home.js         # 首頁
│       ├── goals.js        # 目標設定（Feature 1）
│       ├── profile.js      # 風險評估（Feature 2）
│       ├── recommendation.js # AI 建議（Feature 3）
│       ├── execution.js    # 交易執行（Feature 4）
│       ├── dashboard.js    # 儀表板（Feature 5）
│       └── share.js        # 分享功能（Feature 6）
└── README.md
```

## 🚀 快速開始

### 本地開發

1. 使用任何靜態文件伺服器開啟 `prototype/` 目錄
2. 或直接在瀏覽器中開啟 `index.html`

```bash
# 使用 Python 啟動簡易伺服器
cd prototype
python -m http.server 8080

# 或使用 Node.js 的 http-server
npx http-server -p 8080
```

3. 開啟瀏覽器訪問 `http://localhost:8080`

### VS Code Live Server

1. 安裝 Live Server 擴充功能
2. 右鍵點擊 `index.html`
3. 選擇「Open with Live Server」

## 🔧 功能說明

### Feature 1: 目標設定
- 8 種預設理想人生場景（退休、買房、教育金等）
- 自訂目標場景建議功能
- 即時目標試算預覽
- 小額起步提示

### Feature 2: 風險評估
- 5 題 KYC 問卷
- 自動計算風險分數與等級
- Gap Analysis 目標差距分析
- 調整方案建議（延長期程/增加投入/轉介真人）

### Feature 3: AI 建議
- 白話化投資建議生成
- 多種解釋策略切換（運動員/導航/園藝比喻）
- 「聽不懂」按鈕即時換解釋
- 可追溯引用來源標記
- 信任溫度計回饋

### Feature 4: 交易執行
- 投資行動清單展示
- Pre-trade Check 即時檢核動畫
- 一鍵下單功能
- 轉介真人入口

### Feature 5: 儀表板
- 資產統計卡片
- 資產變化直方圖（自動適配深淺主題）
- 目標追蹤進度條
- 成就里程碑系統
- 再平衡提醒通知

### Feature 6: 社交分享
- 成就選擇器
- 分享卡片預覽（自動遮蔽敏感資訊）
- 自訂分享文案
- 多平台分享（LINE/Facebook/複製連結）

## 📊 事件追蹤

Prototype 實現了 BDD 規格書中定義的事件記錄：

- `goal_created` - 目標建立
- `kyc_completed` - KYC 完成
- `gap_calculated` - 差距計算
- `recommendation_generated` - 建議生成
- `risk_disclosure_acknowledged` - 風險揭露確認
- `explainability_retry_clicked` - 聽不懂點擊
- `pretrade_check_passed` - 交易檢核通過
- `trade_submitted` - 交易提交
- `milestone_achieved` - 里程碑達成
- `share_card_generated` - 分享卡片生成
- `trust_thermometer_feedback_submitted` - 信任回饋

所有事件可在瀏覽器 Console 中查看。

## 🛡️ 合規機制

### 風險揭露優先
- 進入建議頁面前強制展示風險揭露 Modal
- 需勾選「我已理解」才能繼續

### 商品池限制
- 所有建議標注「核准商品池」標記
- 引用來源可追溯

### Pre-trade Check
- 5 項即時檢核
- KYC 適配性 / 風險等級 / 投資限額 / 商品池 / 交易時段

### 隱私保護
- 分享功能自動遮蔽金額與帳戶資訊
- 風險提示強制顯示

## 📱 響應式設計

- 桌面版：完整側邊導航
- 平板版：可收合側邊導航
- 手機版：底部選單（需額外實現）

## 🔗 API Stub

Prototype 內建模擬 API，位於 `js/app.js` 的 `API` 物件：

```javascript
API.createGoal(goalData)      // 建立目標
API.submitKYC(answers)        // 提交 KYC
API.generateRecommendation()  // 生成建議
API.pretradeCheck(orders)     // 交易檢核
API.submitOrder(orderData)    // 提交訂單
API.getDashboardData()        // 取得儀表板資料
API.generateShareCard()       // 生成分享卡片
```

## 📝 開發備註

- 使用原生 JavaScript，無需 build 步驟
- CSS 變數系統便於主題切換
- 模組化頁面結構便於擴展
- 事件系統支援分析追蹤

## 📄 相關文件

- [BDD 規格書](../Fin_WMAI_BDD_V1.0_20260213.md)
- [價值主張提案書](../DOC/第二組_價值主張提案書.docx)
- [循序圖](../DOC/第二組_循序圖.png)

---

© 2026 Fin_WMAI - 智慧投資理財規劃系統

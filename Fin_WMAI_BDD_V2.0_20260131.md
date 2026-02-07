---
title: "Fin_WMAI 系統 BDD 規格書 (Behavior-Driven Development)"
project: "Fin_WMAI（一般客戶導向的智慧投資理財規劃系統）"
version: "V2.0"
proposal_date: "2026-01-31"
source: "第二組_價值主張提案書.docx"
status: "Prototype Implemented"
changelog: |
  - V2.0 (2026-01-31): Prototype 實作完成，更新實現狀態與技術規格
  - V1.0 (2026-02-13): 初版 Draft for Prototype
---

# Fin_WMAI 系統 BDD 規格書 (BDD Spec) V2.0

> 目的：以 BDD（Gherkin）描述 Fin_WMAI 的行為規格，作為 Prototype（前後端 + 中台 + 合規風控）開發的共同語言與驗收基準。

---

## 0. 名詞與範圍

### 0.1 Actors / Systems
- **新手用戶（Novice User）**：一般銀行客戶、數位友善但缺乏投資經驗，需要白話指引與信任感。
- **系統管理員（Admin）**：後台管理人員，負責使用者管理、內容配置與系統監控。
- **Fin_WMAI 系統（System）**：前端介面 + 智慧配置中台 + 合規風控引擎（含商品池/揭露模板/阻斷機制/稽核留痕）。
- **小曦雲（AI Assistant）**：系統 IP 角色，提供親切的 AI 對話體驗與即時諮詢。
- **GenAI Model**：白話建議、情境說明、語意轉譯與安撫話術（基於 Ollama llama3.1:8b）。
- **合規風控引擎（Compliance Engine）**：KYC/適配檢核、Pre-trade check、商品池過濾、幻覺防護、揭露優先。

### 0.2 主要資料（Prototype 最小集合）
- **Goal**：人生目標（類型、目標金額、期程、可投入金額）
- **Profile**：風險屬性、收支概況/收入穩定度
- **Recommendation**：配置方案、理由、風險情境、最壞狀況、注意事項、可追溯引用
- **Action List**：起步金額、定期定額、再平衡規則、可執行交易指令
- **Dashboard**：總資產曲線、Gap、預測曲線、里程碑/成就
- **Feedback**：採納率、投入持續率、調整原因、語義轉譯失敗率、信任溫度計

### 0.3 原則（Bank-grade Guardrails）
- **風險揭露優先**：先揭露風險/最壞狀況，再呈現具體建議。
- **商品池限制**：所有建議必須落在「核准產品池/核准教育素材/核准策略框架」內。
- **可追溯**：AI 內容需能回溯到引用來源（核准文件或外部市場資訊）。
- **不適配阻斷**：高風險族群/不符 KYC/不適配目標 → 「不建議」或「轉介真人」。
- **隱私與留痕**：敏感資料遮罩、最小權限、全程稽核軌跡；Prompt/模型版本控管與 A/B 驗證。

### 0.4 設計系統（V2.0 新增）
- **莫蘭迪色系**：柔和、專業、信任感的視覺設計
- **深色/淺色主題**：支援雙主題切換，滿足不同使用情境
- **IP 角色「小曦雲」**：提供情感化互動體驗

---

## 1. 端到端旅程（IPOD）
- **Input**：人生目標、時間、可投入金額、風險偏好、收支概況  
- **Process**：風險/能力評估 → 目標差距試算 → 生成白話化配置建議與情境說明  
- **Output**：可執行投資行動清單（起步金額、定期定額、再平衡規則）＋ 儀表板  
- **Data feedback**：採納率、投入持續率、調整原因（+ 轉譯失敗率/信任溫度計）  

---

## 2. Feature Set（BDD / Gherkin）

> 建議落地方式：每個 Feature 以「可獨立 Demo」為單位，先做 MVP，再擴到完整流程。

### Feature 0：登入與認證（Authentication）【V2.0 新增】

```gherkin
Feature: 多元登入認證機制
  為了確保安全性與便利性
  作為系統
  我需要提供多種安全的登入方式

  Background:
    Given 系統已啟動並可正常存取

  Scenario: 前台使用者透過 QR Code 登入
    Given 用戶開啟前台登入頁面
    When 系統顯示 QR Code 登入區塊
    And 用戶使用行動裝置掃描 QR Code
    Then 系統應驗證掃描結果
    And 完成身份認證後導向主應用程式
    And 將登入狀態儲存於 sessionStorage

  Scenario: 前台使用者透過帳號密碼登入
    Given 用戶開啟前台登入頁面
    When 用戶點擊「帳號密碼登入」標籤
    And 輸入正確的帳號與密碼
    Then 系統應驗證帳號密碼
    And 完成認證後導向主應用程式

  Scenario: 後台管理員登入
    Given 管理員開啟後台登入頁面
    When 管理員輸入帳號與密碼
    And 點擊登入按鈕
    Then 系統應驗證管理員權限
    And 完成認證後導向後台管理介面

  Scenario: 登入失敗處理
    Given 用戶嘗試登入
    When 驗證失敗（帳密錯誤或 QR Code 無效）
    Then 系統應顯示錯誤提示訊息
    And 不應透露具體失敗原因（安全考量）
    And 記錄登入失敗事件

  Scenario: 登出與 Session 清除
    Given 用戶已登入系統
    When 用戶點擊登出按鈕
    Then 系統應清除 sessionStorage 登入狀態
    And 導向登入頁面
```

---

### Feature 1：啟蒙與目標設定（Onboarding & Goal Setting）

```gherkin
Feature: 目標導向的理財設定
  為了降低新手進入門檻
  作為新手用戶
  我希望先用生活目標開始，而不是先選商品

  Background:
    Given 用戶已完成登入
    And 系統顯示 Fin_WMAI 首頁

  Scenario: 首頁展示個人化歡迎訊息【V2.0 更新】
    Given 用戶進入首頁
    Then 系統應顯示 IP 角色「小曦雲」歡迎動畫
    And 顯示用戶姓名的個人化問候
    And 展示今日理財提示或市場動態摘要

  Scenario: 用戶設定具體的生活理財目標
    Given 系統展示「理想人生」目標標籤選單
    | 目標類型 | 圖示 | 說明 |
    | 退休規劃 | 🏖️ | 安享晚年的財務準備 |
    | 購屋計畫 | 🏠 | 人生第一桶金存頭期款 |
    | 子女教育 | 🎓 | 為孩子未來鋪路 |
    | 數位遊牧 | 🌍 | 自由工作者財務規劃 |
    | 創業基金 | 💼 | 實現創業夢想 |
    | 結婚基金 | 💒 | 籌備人生大事 |
    | 旅遊基金 | ✈️ | 圓一個旅遊夢 |
    | 寵物養老 | 🐾 | 毛孩的長期照護基金 |
    When 用戶選擇一個目標標籤
    And 輸入「預計達成時間」「目標金額」「目前可投入金額」
    Then 系統應將輸入轉換為後端運算參數（例如：預期報酬率假設、存續期間、投入頻率）
    And 系統應建立一筆 Goal 記錄
    And 進入「風險與能力評估」階段

  Scenario: 用戶未找到合適場景，參與理想人生標籤共創
    Given 用戶瀏覽目標選單但未找到合適場景
    When 用戶在 App 中新增/投票一個新的理財場景
    Then 系統應記錄該偏好（含場景名稱、描述、投票數、時間）
    And 該偏好資料可供後續目標試算器迭代使用

  Scenario: 系統提示「小額起步」並提供預設投入策略
    Given 用戶已建立 Goal
    When 系統進入投入策略頁
    Then 系統應提供「小額起投」建議（例如：每月最低投入門檻）
    And 提供「起步方案」與「進階方案」兩個可選策略
```

---

### Feature 2：風險與能力評估（Risk & Capability Profiling）

```gherkin
Feature: 個人化風險能力評估
  為了避免誤售與不適配
  作為用戶
  我希望系統評估我的風險承受度與收支能力，確保建議適合我

  Background:
    Given 用戶已完成目標設定

  Scenario: 執行 KYC 問卷與收支能力授權
    When 用戶填寫風險屬性問卷（KYC）
    And 用戶授權系統存取其「收支概況」「收入穩定度」資料
    Then 系統應計算用戶風險等級（Risk Score / Risk Grade）
    And 系統應完成「目標差距（Gap Analysis）」試算
    And 系統應顯示目前狀況與目標的距離（Gap）

  Scenario: 互動式風險評估問卷【V2.0 更新】
    Given 用戶進入風險評估頁面
    When 系統依序展示評估問題
    Then 每題應有清楚的選項說明
    And 顯示進度指示（例如：第 3 題 / 共 8 題）
    And 完成後立即顯示風險等級結果
    And 以視覺化圖表呈現風險承受度

  Scenario: 用戶風險屬性低於目標所需風險，觸發調整提示
    Given 系統已算出目標所需風險等級
    And 用戶風險等級低於目標所需
    When 系統準備產生建議
    Then 系統應提示用戶可選擇：
      | 選項 | 說明 |
      | 調整目標 | 延長期程或降低目標金額 |
      | 增加投入 | 提高每期投入金額或頻率 |
      | 轉介真人 | 申請理專協助與補充說明 |
    And 系統不得直接推送超出用戶風險等級的高風險方案

  Scenario: 風險揭露優先機制（強制）
    Given 系統準備展示投資建議
    When 進入建議頁面之前
    Then 系統必須先展示「風險揭露與最壞狀況」固定模板
    And 只有在用戶勾選「我已理解」後，才展示具體商品/配置建議
```

---

### Feature 3：AI 白話化投資建議（AI Advisory & Plain Language）

```gherkin
Feature: 生成式 AI 投資顧問
  為了讓新手看得懂、信得過
  作為用戶
  我希望收到白話建議與情境說明，並能請系統換個方式再解釋

  Background:
    Given 系統已完成風險能力評估與策略配對（Algo-Matching）

  Scenario: 生成白話投資建議書（含可追溯引用）
    When 系統呼叫 GenAI 產生配置建議
    Then 系統應產出「白話建議文檔」至少包含：
      | 欄位 | 說明 |
      | 配置理由 | 為何此方案適合該目標 |
      | 風險情境 | 以生活語言描述波動與風險 |
      | 最壞狀況 | 固定模板 + 客製化提醒（但不得誇大） |
      | 注意事項 | 投資期限/流動性/費用/風險提示 |
      | 引用來源 | 來源文件 ID/版本/段落（Traceability） |
    And 內容必須限制在核准商品池與核准教育素材範圍內
    And 若引用外部市場資訊，需附上時間戳與來源標記

  Scenario: 用戶對建議表示聽不懂（即時語意修正）
    Given 系統展示了白話建議文檔
    When 用戶點擊某段文字旁的「聽不懂」按鈕
    Then 系統應切換解釋策略（例如：從「運動員比喻」切換為「導航比喻」）
    And 系統應保留原文與改寫文的對照版本
    And 系統應記錄該詞彙/段落的轉譯失敗事件（含 prompt_version/model_version）

  Scenario: AI 內容超出商品池或出現未授權主張（防幻覺阻斷）
    Given GenAI 生成了建議內容
    When 合規風控引擎進行輸出審查
    And 發現內容包含「非核准產品」或「未授權承諾」（例如保證獲利）
    Then 系統應拒絕展示該內容
    And 改以「可提供的一般投資教育」替代
    And 記錄一次 hallucination_guardrail_hit 事件
```

---

### Feature 3.5：AI 智慧助手「小曦雲」【V2.0 新增】

```gherkin
Feature: 即時 AI 對話助手
  為了提供即時的理財諮詢服務
  作為用戶
  我希望隨時可以與 AI 助手對話，獲得問題解答

  Background:
    Given 用戶已登入系統
    And 小曦雲聊天機器人可於任何頁面存取

  Scenario: 開啟與關閉聊天機器人
    Given 頁面右下角顯示小曦雲圖示按鈕
    When 用戶點擊小曦雲圖示
    Then 系統應展開聊天視窗
    And 顯示歡迎訊息與常用問題快捷按鈕
    When 用戶再次點擊圖示或關閉按鈕
    Then 系統應收合聊天視窗

  Scenario: 發送訊息並獲得 AI 回覆
    Given 聊天視窗已開啟
    When 用戶在輸入框輸入問題並送出
    Then 系統應顯示「小曦雲思考中」的載入動畫
    And 呼叫 Ollama API 取得 AI 回覆
    And 以串流方式逐字顯示回覆內容
    And 回覆完成後顯示時間戳記

  Scenario: 使用快捷問題按鈕
    Given 聊天視窗已開啟
    When 用戶點擊預設的快捷問題按鈕
    | 問題類型 |
    | 什麼是基金？ |
    | 如何開始投資？ |
    | 風險等級說明 |
    Then 系統應自動填入該問題並送出
    And 獲得對應的 AI 回覆

  Scenario: AI 服務不可用時的降級處理
    Given 用戶發送訊息
    When Ollama 服務無回應或逾時
    Then 系統應顯示友善的錯誤訊息
    And 提供「重試」按鈕
    And 建議用戶稍後再試或聯繫客服

  Scenario: 對話歷史保留
    Given 用戶與小曦雲進行多輪對話
    When 用戶在頁面間導航
    Then 對話歷史應保留在當前 Session 中
    When 用戶重新整理頁面
    Then 對話歷史應清空，開始新的對話
```

---

### Feature 4：交易執行與合規（Execution & Compliance）

```gherkin
Feature: 一鍵跟單與自動風控
  為了讓用戶做得到且不違規
  作為用戶
  我希望一鍵下單，但系統必須自動把關風險與適配性

  Background:
    Given 用戶已接受建議並產生 Action List

  Scenario: 執行一鍵下單（Pre-trade Check）
    When 用戶點擊「確認執行/一鍵下單」
    Then 系統必須執行即時交易合規檢核（Pre-trade Check）
    And 檢核通過後，系統送出交易指令
    And 系統更新資產水位並回寫 Dashboard
    And 系統提示「已完成風險控管機制」（含檢核項目摘要）

  Scenario: 交易確認與摘要展示【V2.0 更新】
    Given 用戶完成一鍵下單
    When 交易成功執行
    Then 系統應顯示交易確認頁面
    And 展示交易摘要（標的、金額、手續費、預估配息）
    And 提供「查看持倉」快捷入口
    And 顯示 IP 角色「小曦雲」的恭喜動畫

  Scenario: 阻擋不適配交易並提供轉介真人
    Given 用戶屬於高風險族群 或 建議內容與 KYC 不符
    When 系統執行 Pre-trade Check
    Then 系統應阻擋交易
    And 顯示「不建議原因」與可行替代方案（降低風險/延長期程/降低投入）
    And 提供「轉介真人」入口
    And 停止自動化交易流程

  Scenario: 交易失敗或系統異常（可恢復與留痕）
    Given 系統已送出交易指令
    When 回傳交易失敗或逾時
    Then 系統應提示用戶「交易未完成」與可重試選項
    And 不得重複下單造成重複成交
    And 需記錄交易請求/回應/重試（含 request_id）以供稽核
```

---

### Feature 5：資產監控與動態導航（Monitoring & Dashboard）

```gherkin
Feature: 智慧儀表板與情緒管理
  為了讓用戶可追蹤並避免恐慌
  作為用戶
  我希望透過儀表板掌握進度，市場波動時收到具體調整建議與安撫說明

  Scenario: 查看資產淨值儀表板
    Given 用戶登入 Fin_WMAI
    When 用戶進入「資產儀表板」
    Then 系統應顯示：
      | 指標 | 說明 |
      | 總資產變化曲線 | 按日/週/月切換 |
      | 目標差距（Gap） | 與目標的距離與預估達標時間 |
      | 未來資產成長預測曲線 | 基於假設的情境（需揭露假設） |

  Scenario: 儀表板視覺化呈現【V2.0 更新】
    Given 用戶進入儀表板頁面
    Then 系統應以卡片形式呈現各項指標
    And 使用圖表展示資產趨勢（折線圖/圓餅圖）
    And 顯示目標達成進度條
    And 標示重要里程碑節點
    And 支援深色/淺色主題自動適配

  Scenario: 市場波動觸發再平衡建議（事件觸發）
    Given 系統持續監控市場資訊與用戶資產
    When 偵測到資產偏離配置比例或資產顯著下跌（Rebalancing Trigger）
    Then 系統應發送通知（App push / email）
    And 提供「檢修建議」與「一鍵調整指令（草稿）」供用戶確認
    And 建議內容需包含情緒安撫話術（避免情緒性投資）
    And 仍需遵循風險揭露優先與商品池限制

  Scenario: 達成里程碑的正向回饋（成就感）
    Given 用戶資產成長或連續投入達標
    When 觸發「成長里程碑」條件
    Then 系統應視覺化呈現正向回饋（例如徽章、進度條、連續投入天數）
    And 顯示 IP 角色「小曦雲」的慶祝動畫
    And 提供可選「分享成就」入口
```

---

### Feature 6：社交分享與擴散（Social Sharing）

```gherkin
Feature: 擴散行銷機制
  為了促進口碑擴散
  作為用戶
  我希望分享成果，但不洩漏敏感金額與個資

  Scenario: 生成個人化分享卡片（遮蔽敏感資訊）
    Given 用戶達成某個理財里程碑
    When 用戶選擇「分享成就」
    Then 系統應生成一段「個人化故事摘要」（例如：我為什麼這樣配、我現在離目標多遠）
    And 產生一張分享卡片（遮蔽金額、遮蔽帳戶資訊、遮蔽可識別個資）
    And 卡片包含推薦連結，引導親友進行試算

  Scenario: 多平台分享支援【V2.0 更新】
    Given 用戶準備分享成就
    When 用戶點擊分享按鈕
    Then 系統應顯示分享選項
    | 平台 | 說明 |
    | LINE | 台灣主要通訊軟體 |
    | Facebook | 社群媒體分享 |
    | 複製連結 | 手動分享 |
    | 下載圖片 | 儲存分享卡片 |
    And 分享內容需經過隱私過濾處理

  Scenario: 分享內容審查（避免誤導）
    Given 系統準備輸出分享文案
    When 合規風控引擎審查分享文案
    Then 分享文案不得包含保證獲利或暗示績效承諾
    And 必須包含簡短風險提示
```

---

### Feature 7：後台管理系統【V2.0 新增】

```gherkin
Feature: 後台管理與監控
  為了有效管理系統與用戶
  作為系統管理員
  我需要完整的後台管理功能

  Background:
    Given 管理員已登入後台系統

  Scenario: 儀表板總覽
    Given 管理員進入後台首頁
    Then 系統應顯示關鍵指標卡片
    | 指標 | 說明 |
    | 總用戶數 | 系統註冊用戶總數 |
    | 今日活躍 | 當日登入用戶數 |
    | 待處理事項 | 需要處理的工單或申請 |
    | 系統狀態 | 各服務健康狀態 |
    And 顯示近期活動趨勢圖表

  Scenario: 使用者管理
    Given 管理員進入使用者管理頁面
    When 管理員搜尋或瀏覽使用者列表
    Then 系統應顯示使用者資訊表格
    | 欄位 | 說明 |
    | 帳號 | 使用者帳號 |
    | 姓名 | 使用者姓名 |
    | 類型 | 一般/VIP/測試 |
    | 狀態 | 啟用/停用 |
    | 最後登入 | 最近活動時間 |
    And 提供編輯、停用、查看詳情等操作

  Scenario: 內容管理
    Given 管理員進入內容管理頁面
    When 管理員編輯理財目標模板或教育內容
    Then 系統應提供所見即所得編輯器
    And 支援預覽功能
    And 變更需經過審核流程

  Scenario: AI 服務監控
    Given 管理員進入 AI 服務管理頁面
    Then 系統應顯示：
    | 指標 | 說明 |
    | 服務狀態 | Ollama 連線狀態 |
    | 回應時間 | 平均 API 回應時間 |
    | 錯誤率 | 近期錯誤比例 |
    | 使用量 | 對話次數統計 |
    And 提供服務重啟或設定調整功能

  Scenario: 系統設定
    Given 管理員進入系統設定頁面
    Then 管理員可配置：
    | 設定項 | 說明 |
    | 網站標題 | 系統顯示名稱 |
    | 維護模式 | 開啟/關閉維護公告 |
    | AI 模型 | 選擇使用的 LLM 模型 |
    | 登入限制 | 設定登入嘗試次數限制 |
```

---

### Feature 8：主題切換與個人化【V2.0 新增】

```gherkin
Feature: 介面主題與個人化設定
  為了提供舒適的使用體驗
  作為用戶
  我希望可以自訂介面外觀

  Scenario: 深色/淺色主題切換
    Given 用戶位於任何頁面
    When 用戶點擊主題切換按鈕
    Then 系統應在深色與淺色主題間切換
    And 切換動畫應平滑過渡
    And 主題偏好應保存於 localStorage
    And 下次登入時自動套用偏好

  Scenario: 深色主題色彩規範（莫蘭迪色系）
    Given 用戶使用深色主題
    Then 系統應套用以下色彩：
    | 元素 | 色碼 | 說明 |
    | 背景 | #2C363D | 深灰藍色 |
    | 卡片 | #3A4750 | 較淺灰藍 |
    | 強調 | #C59B85 | 暖棕色 |
    | 文字 | #E8E8E8 | 米白色 |

  Scenario: 淺色主題色彩規範（莫蘭迪色系）
    Given 用戶使用淺色主題
    Then 系統應套用以下色彩：
    | 元素 | 色碼 | 說明 |
    | 背景 | #F2F5F5 | 淡灰白 |
    | 卡片 | #FFFFFF | 純白 |
    | 強調 | #C59B85 | 暖棕色 |
    | 文字 | #2C363D | 深灰藍 |

  Scenario: 個人資料設定
    Given 用戶進入個人設定頁面
    When 用戶編輯個人資料
    Then 用戶可修改：
    | 項目 | 說明 |
    | 顯示名稱 | 系統內顯示的暱稱 |
    | 通知設定 | 開啟/關閉各類通知 |
    | 隱私設定 | 控制資料可見性 |
    And 變更應即時生效
```

---

## 3. 非功能性需求（NFR）— Prototype 必要落點

### 3.1 合規與風控
- KYC/適配檢核與阻斷機制（不建議/轉介真人）
- Pre-trade Check（即時檢核、可追溯）
- 風險揭露優先（固定模板）

### 3.2 GenAI Guardrails
- 商品池/素材池白名單
- 內容輸出審查（禁止保證獲利、禁止未授權產品）
- Prompt/模型版本控管與 A/B 驗證
- Hallucination 告警與事件記錄

### 3.3 數據治理與隱私
- 最小權限、敏感資料遮罩
- 稽核軌跡（request_id / user_id / policy_version / model_version / prompt_version）
- 回答可追溯（source_id / source_version / snippet_ref）

### 3.4 監控與成效
- 事件與指標（建議採納率、投入持續率、調整原因、轉譯失敗率、信任溫度計）
- SLA：錯誤/幻覺預警、回饋閉環

### 3.5 前端效能與體驗【V2.0 新增】
- 首屏載入時間 < 3 秒
- 頁面切換無閃爍（SPA 架構）
- 支援主流瀏覽器（Chrome、Firefox、Edge、Safari）
- 響應式設計適配桌面與平板

### 3.6 AI 服務可用性【V2.0 新增】
- Ollama 服務健康檢查機制
- AI 回應逾時處理（預設 30 秒）
- 服務降級策略（離線時提供預設回覆）

---

## 4. Prototype 建議的事件（Event Schema）

> 目的：讓「產品/合規/風控/ML/工程」能用同一套事件資料做追蹤與優化。

### 4.1 核心流程事件
- `goal_created`
- `kyc_completed`
- `gap_calculated`
- `recommendation_generated`
- `risk_disclosure_acknowledged`
- `hallucination_guardrail_hit`
- `explainability_retry_clicked`（聽不懂）
- `action_list_accepted`
- `pretrade_check_passed` / `pretrade_check_blocked`
- `trade_submitted` / `trade_failed`
- `rebalancing_triggered`
- `milestone_achieved`
- `share_card_generated`
- `trust_thermometer_feedback_submitted`

### 4.2 認證與導航事件【V2.0 新增】
- `user_login_success` / `user_login_failed`
- `admin_login_success` / `admin_login_failed`
- `user_logout`
- `page_view`（含 page_name, user_id, timestamp）
- `theme_switched`（含 from_theme, to_theme）

### 4.3 AI 對話事件【V2.0 新增】
- `chatbot_opened` / `chatbot_closed`
- `chatbot_message_sent`
- `chatbot_response_received`
- `chatbot_response_timeout`
- `chatbot_quick_question_clicked`

### 4.4 後台管理事件【V2.0 新增】
- `admin_user_created` / `admin_user_updated` / `admin_user_disabled`
- `admin_content_updated`
- `admin_settings_changed`
- `admin_ai_service_restarted`

---

## 5. 技術架構【V2.0 新增】

### 5.1 系統架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                      前端層 (Frontend)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Login.html │  │  Index.html │  │ Admin Pages │         │
│  │  (前台登入)  │  │  (主應用)    │  │  (後台管理)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│           │              │               │                   │
│  ┌─────────────────────────────────────────────────┐       │
│  │              CSS 設計系統（莫蘭迪色系）              │       │
│  │  styles.css | pages.css | login.css | admin.css │       │
│  └─────────────────────────────────────────────────┘       │
│           │              │               │                   │
│  ┌─────────────────────────────────────────────────┐       │
│  │              JavaScript 模組                       │       │
│  │  app.js | chatbot.js | data-service.js | pages/* │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      服務層 (Services)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐      ┌─────────────────┐              │
│  │  Python HTTP    │      │  Ollama API     │              │
│  │  Server :8000   │      │  Server :11434  │              │
│  │  (靜態資源)      │      │  (AI 對話)       │              │
│  └─────────────────┘      └─────────────────┘              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      資料層 (Data)                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐      ┌─────────────────┐              │
│  │  demo-data.json │      │  sessionStorage │              │
│  │  (模擬資料)      │      │  (登入狀態)      │              │
│  └─────────────────┘      └─────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 技術棧

| 層級 | 技術 | 說明 |
|------|------|------|
| 前端框架 | Vanilla JavaScript | 原生 JS，無框架依賴 |
| 樣式系統 | CSS3 + CSS Variables | 支援主題切換 |
| AI 服務 | Ollama (llama3.1:8b) | 本地部署的 LLM |
| 伺服器 | Python HTTP Server | 開發用靜態伺服器 |
| 資料儲存 | JSON + sessionStorage | Prototype 階段 |

### 5.3 瀏覽器支援

| 瀏覽器 | 版本要求 |
|--------|----------|
| Chrome | 90+ |
| Firefox | 88+ |
| Edge | 90+ |
| Safari | 14+ |

---

## 6. Appendix：API Stub（可選，用於 Prototype 串接）

> 僅供快速對齊；正式 API 規格可後續獨立成 OpenAPI。

### 6.1 Goal
- `POST /goals`
- `GET /goals/{goal_id}`

### 6.2 Profiling
- `POST /profiles/kyc`
- `POST /profiles/consent`（收支/收入穩定度授權）

### 6.3 Recommendation
- `POST /recommendations/generate`
- `POST /recommendations/{rec_id}/explain`（聽不懂 → 重新解釋）

### 6.4 Execution
- `POST /orders/pretrade-check`
- `POST /orders/submit`

### 6.5 Monitoring
- `GET /dashboard`
- `POST /rebalancing/simulate`
- `POST /rebalancing/execute`

### 6.6 Sharing
- `POST /sharecards/generate`

### 6.7 AI Chat【V2.0 新增】
- `POST /api/chat` → Ollama 代理
- `GET /api/models` → 可用模型列表

### 6.8 Admin【V2.0 新增】
- `GET /admin/users`
- `PUT /admin/users/{user_id}`
- `GET /admin/stats`
- `PUT /admin/settings`

---

## 7. 版本歷程

| 版本 | 日期 | 變更說明 |
|------|------|----------|
| V1.0 | 2026-02-13 | 初版 Draft for Prototype |
| V2.0 | 2026-01-31 | Prototype 實作完成，新增以下內容：<br>• Feature 0：登入與認證機制<br>• Feature 3.5：AI 智慧助手「小曦雲」<br>• Feature 7：後台管理系統<br>• Feature 8：主題切換與個人化<br>• 技術架構章節<br>• 事件 Schema 擴充<br>• 莫蘭迪色系設計規範 |

---

## 8. 文件資源

| 文件 | 說明 |
|------|------|
| [README.md](README.md) | 專案總覽與快速開始 |
| [使用者手冊](使用者手冊.md) | 前台操作指南 |
| [系統維護手冊](系統維護手冊.md) | 系統管理與維護 |
| [開發維護手冊](開發維護手冊.md) | 開發者技術文件 |

---

<div align="center">
  <p>Fin_WMAI BDD Spec V2.0</p>
  <p>Copyright © 2026 Fin_WMAI Team. All rights reserved.</p>
</div>

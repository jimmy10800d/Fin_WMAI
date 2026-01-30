---
title: "Fin_WMAI 系統 BDD 規格書 (Behavior-Driven Development)"
project: "Fin_WMAI（一般客戶導向的智慧投資理財規劃系統）"
version: "V1.0"
proposal_date: "2026-02-13"
source: "第二組_價值主張提案書.docx"
status: "Draft for Prototype"
---

# Fin_WMAI 系統 BDD 規格書 (BDD Spec)

> 目的：以 BDD（Gherkin）描述 Fin_WMAI 的行為規格，作為 Prototype（前後端 + 中台 + 合規風控）開發的共同語言與驗收基準。

---

## 0. 名詞與範圍

### 0.1 Actors / Systems
- **新手用戶（Novice User）**：一般銀行客戶、數位友善但缺乏投資經驗，需要白話指引與信任感。
- **Fin_WMAI 系統（System）**：前端介面 + 智慧配置中台 + 合規風控引擎（含商品池/揭露模板/阻斷機制/稽核留痕）。
- **GenAI Model**：白話建議、情境說明、語意轉譯與安撫話術。
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

---

## 1. 端到端旅程（IPOD）
- **Input**：人生目標、時間、可投入金額、風險偏好、收支概況  
- **Process**：風險/能力評估 → 目標差距試算 → 生成白話化配置建議與情境說明  
- **Output**：可執行投資行動清單（起步金額、定期定額、再平衡規則）＋ 儀表板  
- **Data feedback**：採納率、投入持續率、調整原因（+ 轉譯失敗率/信任溫度計）  

---

## 2. Feature Set（BDD / Gherkin）

> 建議落地方式：每個 Feature 以「可獨立 Demo」為單位，先做 MVP，再擴到完整流程。

### Feature 1：啟蒙與目標設定（Onboarding & Goal Setting）

```gherkin
Feature: 目標導向的理財設定
  為了降低新手進入門檻
  作為新手用戶
  我希望先用生活目標開始，而不是先選商品

  Background:
    Given 用戶已完成登入
    And 系統顯示 Fin_WMAI 首頁

  Scenario: 用戶設定具體的生活理財目標
    Given 系統展示「理想人生」目標標籤選單（例如：退休、買房、教育金、數位遊牧、寵物養老金）
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

  Scenario: 分享內容審查（避免誤導）
    Given 系統準備輸出分享文案
    When 合規風控引擎審查分享文案
    Then 分享文案不得包含保證獲利或暗示績效承諾
    And 必須包含簡短風險提示
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

---

## 4. Prototype 建議的事件（Event Schema）

> 目的：讓「產品/合規/風控/ML/工程」能用同一套事件資料做追蹤與優化。

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

---

## 5. Appendix：API Stub（可選，用於 Prototype 串接）

> 僅供快速對齊；正式 API 規格可後續獨立成 OpenAPI。

### 5.1 Goal
- `POST /goals`
- `GET /goals/{goal_id}`

### 5.2 Profiling
- `POST /profiles/kyc`
- `POST /profiles/consent`（收支/收入穩定度授權）

### 5.3 Recommendation
- `POST /recommendations/generate`
- `POST /recommendations/{rec_id}/explain`（聽不懂 → 重新解釋）

### 5.4 Execution
- `POST /orders/pretrade-check`
- `POST /orders/submit`

### 5.5 Monitoring
- `GET /dashboard`
- `POST /rebalancing/simulate`
- `POST /rebalancing/execute`

### 5.6 Sharing
- `POST /sharecards/generate`

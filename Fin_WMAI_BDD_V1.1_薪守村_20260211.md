---
title: "薪守村（Fin_WMAI）BDD 規格書 (新版)"
project: "薪守村－守護你的 1st Salary（Fin_WMAI）"
version: "V1.1"
proposal_date: "2026-02-11"
source: "第二組_價值主張提案書 (3).docx"
status: "Prototype Baseline"
---

# 薪守村（Fin_WMAI）系統 BDD 規格書（V1.1）

> 目的：把新版價值主張提案書中的「服務流程（IPOD）＋新流程循序圖（Sequence Diagram）」落成可驗收的 BDD（Gherkin）規格，供 Prototype 開發與測試。  
> 核心承諾：「有溫度、看得懂、會分析、信得過」的目標導向資產成長旅程。  

---

## 1. 專案資訊（From Proposal）
- **提案主題**：薪守村－守護你的 1st Salary
- **提案團隊**：第二組（團隊名稱：元神啟動）— 官展履（組長）等
- **提案日期**：2026/02/11

---

## 2. 角色與系統邊界（Actors & Boundaries）

### 2.1 Actors
- **客戶（初心者／新手冒險家）**：數位友善、無投資經驗、以薪水為主收入、想達成人生目標。
- **互動介面（App/網銀）**：收集目標與偏好、呈現「去門檻」藍圖、展示白話說明、推播通知與儀表板。
- **智慧配置中台（AI 策略引擎）**：語意轉換、策略匹配、產生「白話建議文檔」、產生客製化方案。
- **風控監測層（自動化核心）**：KYC/合規核對、Pre-trade Check、監控資產與市場、觸發再平衡與里程碑。
- **用戶標籤與市場資料庫**：客戶標籤、資產/交易、產品資料、合規知識、外部市場資訊與內部投資報告。

---

## 3. 端到端旅程（IPOD）

- **Input**：客戶透過與 AI 對談表述人生目標，轉成可量化指標（投入金額、風險偏好、收支概況、目標特定情況等）。
- **Process**：風險/能力評估 → 目標差距試算 → 生成白話建議與情境說明 → 執行交易 → 自動監控資產並蒐集回饋。
- **Output**：可執行投資行動清單（起步金額、定期定額、再平衡規則）＋ 儀表板。
- **Data**：客戶屬性（AI 歸納）、歷史交易、市場資訊、回饋/行為資料（採納率、投入持續率、調整原因）用於優化。

---

## 4. 價值主張對應的驗收原則（Acceptance Principles）

### 4.1 解決需求 → 價值昇華 → 熱情分享（體驗閉環）
- **解決需求（消除痛點）**：白話化投資建議、個人化風險與能力評估、新手友善起步。
- **價值昇華（滿足感受）**：目標導向規劃、資產淨值儀表板、長期追蹤與動態調整（再平衡）。
- **熱情分享（擴散行銷）**：成果可視化、故事化摘要、可控分享卡片（不含敏感個資）。

### 4.2 風險預期與曝險控管（Bank-grade Guardrails）
- **回答可追溯**、**風險揭露優先**、**AI 幻覺防護（核准產品池/策略框架）**、**不適配阻斷（轉介真人/不建議）**。

---

## 5. 新流程循序圖（Sequence Diagram）→ BDD 對齊說明

> 新版循序圖（提案書「第五節/新流程循序圖」）把旅程拆成 5 段：  
> 1)【初心者】從生活目標切入 → 2)【職業說明NPC】消除銷售疑慮 → 3)【專屬特殊技能】投資商品導向的客製化方案 → 4)【攻克據點】一鍵跟單 + 自動風控 → 5)【戰績回顧暨戰術調整】里程碑回顧、理財調整（loop/alt）。  
## 循序圖架構對應（提案第五節）

下列 Feature/Scenario 對應循序圖的 5 段旅程與關鍵分支：

| 循序圖段 | 主要互動 | 對應 Feature | 關鍵決策/Loop |
|---------|--------|------------|------------|
| 1. 初心者目標切入 | 用戶輸入生活目標 | Feature A | 語意轉換成功/失敗 |
| 2. 職業說明 NPC（KYC/評估） | 風險問卷、授權 | Feature B | 合規通過/不適配 |
| 3. 職業說明 NPC（白話揭露） | 風險說明、可理解性 | Feature C, D | 聽不懂→切換比喻 |
| 4. 專屬特殊技能（客製化） | 投資商品池、組合/方案調整 | Feature E | 目標導向篩選 |
| 5. 攻克據點（一鍵下單） | Pre-trade Check、交易執行 | Feature F | 通過/阻斷轉介 |
| 6. 戰績回顧暨戰術調整（24/7 監控） | 里程碑回顧、理財調整 | Feature G | Loop/Alt: 下跌→調整、上升→激勵 |
| 補充：信任與共創 | 情緒管理、社群共創 | Feature H, I | 持續回饋優化 |


下列 Feature/Scenario 會直接對應循序圖中的關鍵互動與分支（包含 loop/alt）。

---

# 6. BDD Features（Gherkin）

## Feature A：【初心者】目標切入與語意轉換（去門檻）（Sequence 1–3）

```gherkin
Feature: 【初心者】目標切入與語意轉換（去門檻）
  作為初心者
  我希望從生活目標開始，並由系統把我的描述轉成可計算參數
  以降低心理門檻並可進入後續評估

  Scenario: 用戶輸入生活目標，系統完成語意轉換
    Given 用戶進入 App/網銀互動介面
    When 用戶輸入生活理財目標（例：買房/育兒/買車/出國）
    Then 互動介面應把「目標描述＋可投入金額＋期程」送至 AI 策略引擎
    And AI 策略引擎應完成語意轉換，產生可量化參數（parameter_set）
    And 系統進入「KYC 與能力評估」階段
```

---

## Feature B：【職業說明NPC】KYC/合規審視與策略匹配（Sequence 4–8）

```gherkin
Feature: 【職業說明NPC】KYC/合規審視與策略匹配
  作為用戶
  我希望系統先評估風險與能力並完成合規審視
  再產出與我目標相符的投資策略與去門檻藍圖

  Scenario: 進行詳細 KYC 並完成合規審視
    Given AI 策略引擎已取得用戶目標參數
    When 系統要求用戶完成風險屬性問卷與必要授權（收支概況/收入穩定度）
    Then 風控監測層應完成 KYC 與合規性審視
    And 系統應產出用戶風險等級（risk_grade）與能力摘要（capability_profile）

  Scenario: 分析用戶標籤，回傳匹配的投資策略
    Given 系統已取得 risk_grade 與 capability_profile
    When AI 策略引擎向「用戶標籤與市場資料庫」查詢用戶標籤與策略候選
    Then 資料庫應回傳「匹配的投資策略」（strategy_match）
    And AI 策略引擎應生成「去門檻的理財願景藍圖」並回傳至互動介面
```

---

## Feature C：【職業說明NPC】白話說明與風險情境揭露（消除銷售導向疑慮）（Sequence 9–13）

```gherkin
Feature: 【職業說明NPC】白話說明與風險情境揭露（非銷售導向）
  作為用戶
  我希望系統用生活語言解釋風險與可能結果
  讓我知道這不是為了賣商品，而是為了達成目標

  Rule: 風險揭露優先（固定模板先行）
    # 來源：風險揭露優先、幻覺防護、轉介真人/不建議

  Scenario: 用戶查看初步方案，系統生成白話風險說明與理由
    Given 互動介面已呈現初步方案（願景藍圖）
    When 用戶點擊「看懂這個方案」或「為什麼這樣配」
    Then 互動介面應向 AI 策略引擎請求白話化解釋
    And AI 策略引擎應先輸出「風險揭露固定模板」與「最壞狀況說明」
    And 再輸出「目標導向的總論理由」與「風險情境說明」
```

---

## Feature D：即時語義回饋與修正（聽不懂 → 切換比喻）（提案明確要求）

```gherkin
Feature: 即時語義回饋與修正（聽不懂）
  作為初心者
  我希望看不懂時能立即要求換個方式解釋
  並且系統會用這些資料優化後續體驗

  Scenario: 用戶點擊「聽不懂」按鈕，系統切換解釋模型並記錄失敗率
    Given 互動介面正在展示 AI 生成的建議內容
    When 用戶點擊「聽不懂」
    Then 系統應切換解釋策略（例：運動員比喻 → 導航比喻）
    And 系統應回傳改寫版本與摘要重點
    And 系統應記錄轉譯失敗事件（term_id, prompt_version, model_version, timestamp）
```

> 「聽不懂」按鈕與轉譯失敗率作為 Prompt 優化依據，為新版提案明確功能。  

---

## Feature E：【專屬特殊技能】投資商品導向的客製化方案（人生目標為核心）（Sequence 14–18）

```gherkin
Feature: 【專屬特殊技能】投資商品導向的客製化方案（人生目標為核心）
  作為用戶
  我希望系統以「達成我的人生目標」為核心
  產出與投資商品池相符的客製化方案

  Scenario: 用戶調整偏好或確認目標，系統輸出客製化方案
    Given 系統已完成初步策略匹配與白話說明
    When 用戶調整偏好（例：可承受波動、投入頻率、流動性需求）或確認目標不變
    Then AI 策略引擎應執行「以人生目標為核心」的配置演算法
    And 系統應輸出「投資商品池內的客製化方案」（product_pool_filtered）
    And 互動介面應視覺化呈現「人生目標達成路線圖」
```

> 「以人生目標為核心、非銷售導向」為提案核心宣告。  

---

## Feature F：【攻克據點】一鍵下單與自動風控（Pre-trade Check）（Sequence 19–22）

```gherkin
Feature: 【攻克據點】一鍵跟單與自動風控
  作為用戶
  我希望能夠一鍵下單
  同時系統自動完成風險控管，避免繁瑣步驟導致我半途而廢

  Scenario: 用戶確認執行，系統完成 Pre-trade Check 並更新資產
    Given 用戶已接受客製化方案並產生行動清單（Action List）
    When 用戶點擊「確認執行 / 一鍵下單」
    Then 風控監測層必須執行 Pre-trade Check（適配性/額度/風險規範）
    And 檢核通過後才可送出交易指令
    And 交易結果回寫資產水位與追蹤標籤至資料庫
    And 互動介面顯示「完成交易（簡化步驟、避免半途）」與「已完成風險控管」提示

  Scenario: 不適配或高風險族群，阻斷並提供轉介真人/不建議
    Given 用戶屬於高風險族群 或 建議內容與 KYC 不符
    When 系統進行 Pre-trade Check
    Then 系統應阻斷交易
    And 顯示「不建議」原因與替代方案（降低風險/延長期程/降低投入）
    And 提供「轉介真人」入口
```

> 「一鍵跟單與自動風控」與「轉介真人/不建議」在提案中明確要求。  

---

## Feature G：【戰績回顧暨戰術調整】里程碑回顧與理財調整（loop/alt）（Sequence 23–28）

```gherkin
Feature: 【戰績回顧暨戰術調整】里程碑回顧與理財調整
  作為用戶
  我希望系統 24 小時監控市場與我的資產
  在達成里程碑時提供回顧與正向回饋
  在資產偏離時提供理財調整建議

  Background:
    Given 用戶已完成交易並持有資產
    And 系統已啟用監控任務

  Scenario: 監控市場波動 vs 用戶風險承受力（Loop）
    When 系統每小時/每日（依設定）取得市場資訊與用戶資產狀態
    Then 風控監測層應對照用戶風險承受力計算偏離度（drift_score）
    And 若 drift_score 達到觸發門檻，進入「再平衡建議」流程
    And 若未達門檻，持續監控

  Scenario: 資產減少或偏移，觸發再平衡（Alt: Downside）
    Given drift_score 達到觸發門檻 或 資產顯著下跌
    When 系統偵測偏移並產出再平衡策略
    Then 系統應推播「檢修建議」與「一鍵調整（草稿指令）」到互動介面
    And 必須先呈現風險揭露模板與假設條件
    And 用戶確認後才可送出調整指令（需再次 Pre-trade Check）

  Scenario: 資產成長達到階段性里程碑（Alt: Upside）
    Given 系統偵測達成階段性里程碑（例：目標進度 x%、連續投入天數 y 天）
    When 里程碑條件成立
    Then 互動介面應視覺化呈現正向回饋（徽章/進度條/連續投入）
    And 可選擇產生分享卡片（不含敏感個資）
```

> 「24 小時監控、資產減少→再平衡、資產增加達標→視覺化正向循環」為旅程關鍵。  
> 「再平衡與追蹤通知（固定週期＋事件觸發）」為功能模組明列。  

---

## Feature H：理想人生標籤共創（行銷互動）

```gherkin
Feature: 理想人生標籤共創
  作為用戶
  我希望能新增/投票我在意的生活場景
  讓目標試算器更貼近需求

  Scenario: 用戶新增或投票新的理財目標場景
    Given 用戶瀏覽目標選單
    When 用戶新增或投票新的理財目標場景（例：數位遊牧基金、寵物養老金）
    Then 系統應記錄場景偏好資料（scene_id, votes, created_at）
    And 該資料可被目標試算器在下一版迭代納入
```

> 「理想人生標籤共創」為新版體驗/行銷推廣明列。  

---

## Feature I：信任溫度計（滿意度/透明度閉環）

```gherkin
Feature: 信任溫度計（回饋閉環）
  作為用戶
  我希望系統能適度詢問我是否覺得有壓力、透明度是否足夠
  讓建議更符合「非銷售導向」的初衷

  Scenario: 系統隨機抽樣發送信任溫度計
    Given 用戶已閱讀一段投資建議或完成一次調整/交易
    When 系統在合適時機觸發抽樣
    Then 系統應詢問：
      | 問題 | 範例 |
      | 壓力感 | 這段建議是否讓你感到壓力？ |
      | 透明度 | 透明度是否足夠？ |
    And 系統應將回饋寫入 feedback_store（含 timestamp, rec_id, model_version）
    And 回饋數據可用於調整模型過濾器/提示詞策略
```

> 「信任溫度計」閉環的問題方向與用途在新版提案中明確定義。  

---

# 7. 非功能性需求（NFR）— Prototype 必要落點

## 7.1 合規與風控（必做）
- 風險揭露優先（固定模板）
- AI 幻覺防護（核准產品池/策略框架）
- 不適配阻斷（轉介真人/不建議）
- 回答可追溯（來源可追查）

## 7.2 數據與治理（Prototype 最小可行）
- 數據來源：客戶標籤、資產/交易、產品資料、客戶目標/計劃、合規知識、外部市場資訊/內部投資報告。
- 行為回饋：採納率、投入持續率、調整原因（+ 轉譯失敗率/信任溫度計）。

---

# 8. 事件（Event Catalog）— 建議用於埋點與驗收

> 目標：把「循序圖」可觀測化，讓 Prototype 可快速驗收與迭代。

- `goal_captured`（輸入目標）
- `semantic_transformed`（語意轉換完成）
- `kyc_completed`（KYC/授權完成）
- `compliance_reviewed`（合規審視）
- `strategy_matched`（策略匹配）
- `vision_blueprint_generated`（去門檻藍圖生成）
- `risk_disclosure_acknowledged`（風險揭露確認）
- `plain_language_explained`（白話說明生成）
- `explainability_retry_clicked`（聽不懂）
- `translation_failure_logged`（轉譯失敗事件）
- `personalized_plan_generated`（客製化方案）
- `order_pretrade_checked_passed` / `order_pretrade_checked_blocked`
- `order_submitted` / `order_failed`
- `monitoring_loop_tick`（監控週期）
- `rebalancing_triggered` / `rebalancing_proposal_sent` / `rebalancing_executed`
- `milestone_achieved`
- `share_card_generated`
- `trust_thermometer_submitted`

---

# 9. Prototype API Stub（可選，用於串接）

> 僅供快速對齊；正式版可轉 OpenAPI。

## 9.1 Goal & Profiling
- `POST /goals`（goal_captured）
- `POST /profiles/semantic-transform`（semantic_transformed）
- `POST /profiles/kyc`（kyc_completed）
- `POST /profiles/consent`（收支/收入穩定度授權）

## 9.2 Recommendation
- `POST /recommendations/match-strategy`（strategy_matched）
- `POST /recommendations/generate-vision`（vision_blueprint_generated）
- `POST /recommendations/explain`（plain_language_explained）
- `POST /recommendations/{id}/re-explain`（explainability_retry_clicked）

## 9.3 Execution & Monitoring
- `POST /orders/pretrade-check`
- `POST /orders/submit`
- `GET /dashboard`
- `POST /monitoring/tick`
- `POST /rebalancing/propose`
- `POST /rebalancing/execute`

## 9.4 Growth & Feedback
- `POST /milestones/evaluate`
- `POST /sharecards/generate`
- `POST /feedback/trust-thermometer`

---

## 10. 附錄：功能模組清單（與提案一致）
- 目標設定與試算器（退休/買房/教育金）
- 風險與能力評估（問卷＋收支結構）
- 白話建議文檔產生器（情境、最壞狀況、注意事項）
- 「重要」資產淨值儀表板（目標差距、預測曲線、提醒）
- 再平衡與追蹤通知提醒（固定週期＋事件觸發）
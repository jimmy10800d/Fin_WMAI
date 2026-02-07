---
title: "薪守村（Fin_WMAI）BDD 規格書 (含盟友系統)"
project: "薪守村－守護你的 1st Salary（Fin_WMAI）"
version: "V1.2"
proposal_date: "2026-02-11"
source: "第二組_價值主張提案書 (3).docx"
status: "Prototype Baseline"
---

# 薪守村（Fin_WMAI）系統 BDD 規格書（V1.2：含盟友系統，不含金流）

> 目的：把新版價值主張提案書中的「服務流程（IPOD）＋新流程（旅程敘事/循序圖精神）」落成可驗收的 BDD（Gherkin）規格，供 Prototype 開發與測試。  
> 核心承諾：「有溫度、看得懂、會分析、信得過」的目標導向資產成長旅程。  

---

## 1. 專案資訊（From Proposal）
- **提案主題**：薪守村－守護你的 1st Salary
- **提案團隊**：第二組（團隊名稱：元神啟動）— 官展履（組長）等
- **提案日期**：2026/02/11

---

## 2. 角色與系統邊界（Actors & Boundaries）

### 2.1 Actors
- **客戶（新手冒險家 / 初心者）**：數位友善、無投資經驗、以薪水為主收入、想達成人生目標而有資金需求。
- **互動介面（App/網銀）**：收集目標與偏好、呈現「去門檻」藍圖、展示白話說明、推播通知與儀表板。
- **智慧配置中台（AI 策略引擎）**：語意轉換、策略匹配、產生「白話建議文檔」、產生客製化方案與行動清單。
- **風控監測層（自動化核心）**：KYC/合規核對、Pre-trade Check、24/7 監控資產與市場、觸發再平衡與里程碑回饋。
- **用戶標籤與市場資料庫**：客戶標籤、資產/交易、產品資料、合規知識、外部市場資訊與內部投資報告。

### 2.2 系統邊界（Out of Scope for Prototype）
- 真實金流（轉帳/扣款/代收付）、實際券商下單、法遵正式核可流程（以 stub 模擬）、完整投顧簽署流程（以模板替代）。

---

## 3. 端到端旅程（IPOD）

- **Input**：客戶用生活語言表述人生目標 → 轉為可量化指標（期程、目標金額、可投入金額、風險偏好、收支概況等）。
- **Process**：風險/能力評估 → 目標差距試算 → 生成白話建議與情境說明 → 執行交易 → 自動監控資產並蒐集回饋。
- **Output**：可執行投資行動清單（起步金額、定期定額、再平衡規則）＋ 資產淨值成長儀表板（總資產變化、目標差距、預測曲線）。
- **Data Feedback**：採納率、投入持續率、調整原因、語義轉譯失敗率、信任溫度計回饋。

---

## 4. 價值主張對應的驗收原則（Acceptance Principles）

### 4.1 解決需求 → 價值昇華 → 熱情分享（體驗閉環）
- **解決需求（消除痛點）**：白話化投資建議、個人化風險與能力評估、新手友善起步（小額起投/漸進式風險承擔）。
- **價值昇華（滿足感受）**：長期追蹤與動態調整（定期檢視配置、再平衡建議）、資產成長儀表板提升掌控感。
- **熱情分享（擴散行銷）**：成果可視化、故事化摘要、可控分享卡片（遮蔽敏感資訊）。

### 4.2 Bank-grade Guardrails（必備）
- **風險揭露優先**（固定模板先行）
- **AI 幻覺防護**（僅在核准產品池與策略框架內生成）
- **不適配阻斷**（轉介真人/不建議）
- **回答可追溯**（引用行內核准之商品/條款/投資教育素材）

---

## 5. 新流程（旅程敘事/循序圖精神）→ BDD 對齊

新版旅程被拆為 5 段（以遊戲化語彙描述）：
1)【初心者】從生活目標切入、降低心理門檻  
2)【職業說明 NPC】消除銷售導向疑慮（白話說明 + 風險/最壞情境）  
3)【專屬特殊技能】專屬客製化方案（人生目標為核心）  
4)【攻克據點】一鍵跟單 + 自動風控（減少繁瑣、避免半途而廢）  
5)【戰績回顧暨戰術調整】24/7 動態導航與情緒管理（loop：監控；alt：再平衡/里程碑）  

下列 Feature/Scenario 直接對應以上段落與 loop/alt 分支。

---

# 6. BDD Features（Gherkin）

## Feature A：目標切入與語意轉換（去門檻）

```gherkin
Feature: 目標切入與語意轉換（去門檻）
  作為初心者
  我希望從生活目標開始，並由系統把我的描述轉成可計算參數
  以降低心理門檻並可進入後續評估

  Scenario: 用戶輸入生活目標，系統完成語意轉換
    Given 用戶進入 App/網銀互動介面
    When 用戶輸入生活理財目標（例：出國、買車、購屋、教育金、退休）
    And 用戶輸入目標期程、目標金額、目前可投入金額
    Then 互動介面應把輸入送至 AI 策略引擎
    And AI 策略引擎應完成語意轉換，產生可量化參數（parameter_set）
    And 系統進入「KYC 與能力評估」階段
```

---

## Feature B：KYC/能力評估與合規審視

```gherkin
Feature: KYC/能力評估與合規審視
  作為用戶
  我需要系統評估我的收支狀況與風險承受度
  確保建議是適合我的，而不是隨意推銷

  Scenario: 執行 KYC 與能力評估
    Given AI 策略引擎已取得用戶目標參數
    When 用戶填寫風險屬性問卷（KYC）
    And 用戶授權系統存取其收支概況與收入穩定度資料（Prototype 可用模擬資料）
    Then 風控監測層應產出 risk_grade 與 capability_profile
    And 系統應試算目標差距（Gap Analysis）
    And 若用戶風險屬性低於目標所需風險，系統應提示調整目標或增加投入

  Scenario: 合規審視完成後才可進入建議
    Given 風控監測層已產出 risk_grade
    When 系統準備生成投資建議
    Then 系統必須完成合規審視（合規規則表/核准素材）
    And 才能進入「白話建議」流程
```

---

## Feature C：策略匹配與去門檻藍圖生成

```gherkin
Feature: 策略匹配與去門檻藍圖生成
  作為用戶
  我希望系統提供與我目標相符的策略藍圖
  讓我先看懂方向，而不是先看到商品清單

  Scenario: 分析用戶標籤並回傳匹配策略
    Given 系統已取得 risk_grade 與 capability_profile
    When AI 策略引擎向「用戶標籤與市場資料庫」查詢策略候選
    Then 資料庫應回傳 strategy_match
    And AI 策略引擎應生成「去門檻的理財願景藍圖」並回傳至互動介面
```

---

## Feature D：白話說明與風險揭露優先（職業說明 NPC）

```gherkin
Feature: 白話說明與風險揭露優先
  作為用戶
  我希望有人用白話說明風險與可能結果
  並先讓我理解風險，再談下一步

  Rule: 風險揭露優先（固定模板先行）

  Scenario: 生成白話投資建議（先揭露風險）
    Given 系統已完成策略匹配
    When 用戶點擊「看懂這個方案」或「為什麼這樣配」
    Then 系統必須先展示風險揭露固定模板與最壞狀況說明
    And 再展示白話解釋（原因、情境、注意事項）
    And 白話內容必須限制在核准產品池/策略框架內（防幻覺）
```

---

## Feature E：即時語意修正（聽不懂 → 換個比喻）

```gherkin
Feature: 即時語意修正（聽不懂）
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

---

## Feature F：專屬客製化方案（人生目標為核心）

```gherkin
Feature: 專屬客製化方案（人生目標為核心）
  作為用戶
  我希望所有建議以達成我的人生目標為核心
  而非以銀行產品銷售量為導向

  Scenario: 用戶調整偏好後輸出客製化方案
    Given 系統已完成初步策略匹配與白話說明
    When 用戶調整偏好（可承受波動、投入頻率、流動性需求）或確認目標不變
    Then AI 策略引擎應生成客製化方案（product_pool_filtered）
    And 互動介面應視覺化呈現「人生目標達成路線圖」
```

---

## Feature G：一鍵下單與自動風控（攻克據點）

```gherkin
Feature: 一鍵跟單與自動風控
  作為用戶
  我希望能夠簡單完成交易
  並由系統自動完成風險控管，避免繁瑣步驟導致我半途而廢

  Scenario: 一鍵下單（Pre-trade Check 通過才可送單）
    Given 用戶已接受客製化方案並產生行動清單（Action List）
    When 用戶點擊「確認執行 / 一鍵下單」
    Then 風控監測層必須執行 Pre-trade Check（適配性/額度/風險規範）
    And 檢核通過後才可送出交易指令（Prototype 可用模擬送單）
    And 交易結果回寫資產水位與追蹤標籤至資料庫
    And 互動介面顯示「已完成風險控管」提示以增加信任感

  Scenario: 不適配阻斷（轉介真人/不建議）
    Given 用戶屬於高風險族群 或 建議內容與 KYC 不符
    When 系統進行 Pre-trade Check
    Then 系統應阻斷交易
    And 顯示「不建議」原因與替代方案（降低風險/延長期程/降低投入）
    And 提供「轉介真人」入口
```

---

## Feature H：24/7 監控、再平衡與里程碑回饋（戰績回顧暨戰術調整）

```gherkin
Feature: 動態導航與情緒管理（自動化核心）
  作為用戶
  我希望系統 24 小時監控市場與我的資產
  在資產減少時給出再平衡建議，在成長達標時給我正向回饋
  以避免情緒性投資並維持長期投入

  Background:
    Given 用戶已完成交易並持有資產
    And 系統已啟用監控任務

  Scenario: 監控市場波動 vs 用戶風險承受力（Loop）
    When 系統每小時/每日（依設定）取得市場資訊與用戶資產狀態
    Then 風控監測層應對照用戶風險承受力計算偏離度（drift_score）
    And 若 drift_score 達到觸發門檻，進入「再平衡建議」流程
    And 若未達門檻，持續監控

  Scenario: 偵測到資產減少或偏離配置比例（Alt: Downside）
    Given drift_score 達到觸發門檻 或 資產顯著下跌
    When 系統產出再平衡建議
    Then 系統應提供「檢修建議」與「一鍵調整（草稿指令）」
    And 必須先呈現風險揭露模板與假設條件
    And 用戶確認後才可送出調整指令（需再次 Pre-trade Check）

  Scenario: 達成階段性里程碑（Alt: Upside）
    Given 系統偵測達成階段性里程碑（例：目標進度 x%、連續投入週數 y）
    When 里程碑條件成立
    Then 互動介面應視覺化呈現正向回饋（徽章/進度條/連續投入）
    And 可選擇生成分享卡（不含敏感個資）
```

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

---

# 6A. 盟友系統（不含金流）

> 目標：讓「分享、支援、一起堅持」成為用戶完成任務（Quest）的助力。  
> 原則：盟友支援「行為與情緒」，不支援「交易決策」。盟友看不到金額/商品/交易明細。

## Feature J：盟友邀請與權限（Privacy by Design）

```gherkin
Feature: 盟友邀請與權限（不含金流）
  作為用戶
  我希望邀請盟友支援我的人生目標
  並能控制盟友看見的內容，避免洩漏金額與敏感資訊

  Background:
    Given 用戶已登入 Fin_WMAI
    And 用戶可進入「盟友中心（Allies Hub）」

  Scenario: 用戶邀請盟友加入
    When 用戶產生邀請連結或 QR Code
    And 盟友使用連結/QR 完成加入
    Then 系統應建立盟友關係（ally_relationship）
    And 預設盟友權限為 Level 1（僅顯示里程碑/徽章/進度%，不顯示金額/商品/交易）

  Scenario: 用戶對單一任務卡設定分享等級
    Given 用戶已建立任務卡（Quest）
    When 用戶針對此任務卡選擇盟友並設定分享等級為 Level 1 或 Level 2
    Then 系統應更新該任務卡的 ally_visibility_policy
    And 盟友端只能看到被授權的欄位
    And 系統應提供「分享預覽」讓用戶確認遮蔽效果

  Scenario: 用戶移除盟友或收回權限
    Given 用戶已存在盟友關係
    When 用戶移除盟友或將分享等級調整為 Level 0（不分享）
    Then 系統應立即停止該盟友對任務卡的存取
    And 盟友端不得再看到該任務卡內容（僅保留公開成就或空白狀態）
```

---

## Feature K：盟友打氣（Encourage）

```gherkin
Feature: 盟友打氣（Encourage）
  作為盟友
  我希望能對朋友的任務進度給予鼓勵
  以提升他的持續投入與信心

  Scenario: 盟友送出鼓勵卡（安全話術）
    Given 盟友已被授權查看某任務卡（Level 1 或 Level 2）
    When 盟友點擊「送出鼓勵」
    Then 系統應提供安全話術模板（不得保證獲利、不得催促買賣、不得提供特定商品建議）
    And 盟友可選擇模板並填寫短訊（限字數）
    And 系統記錄 encourage_sent 事件
    And 用戶收到通知（不含金額、不含商品資訊）

  Scenario: 盟友輸入內容違規，系統拒絕並要求改寫
    Given 盟友正在編輯鼓勵訊息
    When 盟友輸入包含「保證獲利」「快點買/賣」「指定商品/標的」等內容
    Then 系統應拒絕送出
    And 提示改寫方向（聚焦行為支持：完成本週任務/保持紀律/理解風險）
    And 記錄 ally_message_rejected 事件（含原因碼）
```

---

## Feature L：盟友提醒（Nudge）

```gherkin
Feature: 盟友提醒（Nudge）
  作為盟友
  我希望能提醒朋友完成本週任務
  但不涉及任何買賣指令或投資建議

  Scenario: 盟友設定行為提醒
    Given 盟友已被授權支援某任務卡
    When 盟友設定提醒頻率（每週/每月）與提醒時間
    And 盟友選擇提醒內容（僅可為行為提醒：完成本週任務/閱讀風險說明/檢視儀表板）
    Then 系統應建立提醒排程（nudge_schedule）
    And 在指定時間推播給用戶
    And 記錄 nudge_scheduled 與 nudge_sent 事件

  Scenario: 盟友提醒內容涉及交易指令，系統拒絕
    Given 盟友正在設定提醒
    When 提醒文字包含買賣指令或標的建議
    Then 系統應拒絕建立排程
    And 記錄 nudge_rejected 事件（含原因碼）
```

---

## Feature M：共同挑戰（Challenge）與 streak

```gherkin
Feature: 共同挑戰（Challenge）與 連續天數 (streak)
  作為用戶
  我希望與盟友一起完成挑戰
  透過 streak 與里程碑維持長期行為

  Scenario: 用戶發起共同挑戰
    Given 用戶已建立任務卡
    When 用戶發起共同挑戰（例：連續 4 週完成「本週任務」）
    And 邀請一位或多位盟友加入
    Then 系統應建立 challenge
    And 記錄參與者與挑戰規則（週期、完成條件、有效期限）
    And 參與者可在各自介面查看 streak 狀態

  Scenario: 參與者完成本週任務，streak 更新
    Given challenge 已生效
    When 參與者完成本週任務並提交完成狀態
    Then 系統應更新個人 streak 與團隊 streak
    And 記錄 challenge_progress_updated 事件

  Scenario: 挑戰達成，發放徽章並可分享
    Given challenge 進度已符合完成條件
    When 系統判定挑戰完成
    Then 系統發放徽章/成就（achievement_awarded）
    And 推播達成通知給參與者
    And 允許生成分享卡（遮蔽金額/商品/交易）
```

---

## Feature N：分享卡導流加入支援（Share-to-Ally）

```gherkin
Feature: 分享卡導流加入支援（不含金流）
  作為用戶
  我希望分享我的進度與故事
  並讓朋友可以加入成為盟友支援我，但不洩漏敏感資訊

  Scenario: 用戶產生分享卡（遮蔽敏感資訊）
    Given 用戶達成里程碑或 streak
    When 用戶點擊「分享成就」
    Then 系統應生成分享卡
    And 分享卡僅包含：故事摘要、進度%、徽章、加入支援入口
    And 分享卡不得包含金額、帳號、商品、交易資訊
    And 記錄 share_card_created 事件

  Scenario: 朋友從分享卡加入盟友
    Given 朋友已開啟分享卡
    When 朋友點擊「加入支援」
    Then 系統應引導完成盟友加入流程
    And 建立 ally_relationship
    And 記錄 ally_joined_from_share 事件
```

---

## 6A.1 盟友系統的隱私等級（Visibility Levels）

- **Level 0：不分享**（盟友不可見此任務卡）
- **Level 1：預設分享（建議）**
  - 可見：任務名稱（可匿名）、進度%/里程碑、徽章、streak
  - 不可見：金額、資產、商品、交易明細、任何可識別敏感資訊
- **Level 2：進階分享**
  - Level 1 + 可見：「本週任務是否完成」「下一步任務（文字化）」
  - 仍不可見：金額/商品/交易

---

# 7. 非功能性需求（NFR）— Prototype 必要落點

## 7.1 合規與風控（必做）
- 風險揭露優先（固定模板）
- AI 幻覺防護（核准產品池/策略框架）
- 不適配阻斷（轉介真人/不建議）
- 回答可追溯（核准素材）

## 7.2 數據與治理（Prototype 最小可行）
- 盟友系統需具備任務卡層級的可見性政策（L0/L1/L2），預設 L1；分享內容需可預覽、可隨時撤回。
- 盟友互動內容需經過規則檢核：禁止保證獲利、禁止催促買賣、禁止指定標的；違規需拒絕並留痕（原因碼）。
- 數據來源：客戶標籤、資產/交易、產品資料、客戶目標/計劃、合規知識、外部市場資訊/內部投資報告。
- 行為回饋：採納率、投入持續率、調整原因（+ 轉譯失敗率/信任溫度計）。

---

# 8. 事件（Event Catalog）— 建議用於埋點與驗收

- `goal_captured`
- `semantic_transformed`
- `kyc_completed`
- `compliance_reviewed`
- `strategy_matched`
- `vision_blueprint_generated`
- `risk_disclosure_acknowledged`
- `plain_language_explained`
- `explainability_retry_clicked`
- `translation_failure_logged`
- `personalized_plan_generated`
- `order_pretrade_checked_passed` / `order_pretrade_checked_blocked`
- `order_submitted` / `order_failed`
- `monitoring_loop_tick`
- `rebalancing_triggered` / `rebalancing_proposal_sent` / `rebalancing_executed`
- `milestone_achieved`
- `share_card_generated`
- `trust_thermometer_submitted`
- `ally_invited`
- `ally_relationship_created`
- `ally_visibility_updated`
- `ally_message_rejected`
- `encourage_sent`
- `nudge_scheduled` / `nudge_sent` / `nudge_rejected`
- `challenge_created` / `challenge_joined` / `challenge_progress_updated` / `challenge_completed`
- `share_card_viewed`
- `ally_joined_from_share`

---

# 9. Prototype API Stub（可選，用於串接）

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
- `GET  /dashboard`
- `POST /monitoring/tick`
- `POST /rebalancing/propose`
- `POST /rebalancing/execute`

## 9.4 Growth & Feedback
- `POST /milestones/evaluate`
- `POST /sharecards/generate`
- `POST /feedback/trust-thermometer`

## 9.5 Allies（不含金流）
- `POST /allies/invite`（產生邀請連結/QR）
- `POST /allies/join`（盟友加入）
- `POST /allies/{ally_id}/remove`（移除盟友）
- `POST /quests/{quest_id}/allies/visibility`（設定任務卡分享等級：L0/L1/L2）

## 9.6 Support Actions（不含金流）
- `POST /quests/{quest_id}/encourage`（送出鼓勵卡）
- `POST /quests/{quest_id}/nudges`（建立/更新提醒排程）
- `POST /quests/{quest_id}/nudges/{nudge_id}/disable`（停用提醒）

## 9.7 Challenges（不含金流）
- `POST /challenges`（建立共同挑戰）
- `POST /challenges/{challenge_id}/join`（加入挑戰）
- `POST /challenges/{challenge_id}/progress`（回報完成狀態）
- `GET  /challenges/{challenge_id}`（查詢挑戰狀態）

## 9.8 Share Card（導流加入支援）
- `POST /sharecards/generate`（產生分享卡：遮蔽敏感資訊）
- `GET  /sharecards/{share_id}`（瀏覽分享卡：記錄 view）

---

## 10. 功能模組清單（與提案一致，供 Prototype 切分）
- 目標設定與試算器（退休/買房/教育金/出國/買車）
- 風險與能力評估（問卷＋收支結構/收入穩定度）
- 白話建議文檔產生器（情境、最壞狀況、注意事項）
- 「重要」資產淨值儀表板（目標差距、預測曲線、提醒）
- 再平衡與追蹤通知（固定週期＋事件觸發）
- 盟友系統（不含金流）：邀請/權限、打氣、提醒、共同挑戰、分享導流

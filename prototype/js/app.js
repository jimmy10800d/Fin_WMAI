/* ================================================
   薪守村 — 核心遊戲引擎 (app.js)
   Features: 狀態管理、SPA 路由、遊戲機制、API 模擬
   ================================================ */

/* --- Global State --- */
const AppState = {
  currentPage: 'home',
  user: null,
  theme: localStorage.getItem('theme') || 'light',
  // Game progression — Rank/Star system (Feature O)
  rank: 1,
  stars: 1,
  xp: 0,
  level: 1, // kept for backward compat
  streak: 0,
  questStatus: {
    home: 'completed',
    goals: 'available',
    profile: 'locked',
    recommendation: 'locked',
    execution: 'locked',
    dashboard: 'locked',
    share: 'locked',
    allies: 'locked',
    assistant: 'available'
  },
  // Feature data
  goals: null,
  currentGoal: null,
  profile: { answers: [], riskScore: 0, riskGrade: '' },
  recommendation: null,
  actionList: null,
  riskDisclosureAcknowledged: false,
  trustScore: null,
  // Anti-spam XP limits (Feature O)
  xpLimits: {},
  // Unlocked features (Feature P)
  unlocks: [],
  // Events log
  events: []
};

/* --- Rank/Star System (Feature O) — 6 Ranks × 5 Stars --- */
const RANK_NAMES = {
  1: '啟程者', 2: '受訓者', 3: '紀律者',
  4: '自控者', 5: '戰術者', 6: '夥伴型玩家'
};
const RANK_XP_PER_STAR = { 1: 60, 2: 80, 3: 100, 4: 120, 5: 150, 6: 200 };
const RANK_STARS = 5;

/* XP config with anti-spam daily/weekly limits (BDD §6B.2) */
const XP_TABLE = {
  goal_captured: { xp: 50, dailyLimit: 0, weeklyLimit: 0 },
  semantic_transformed: { xp: 30, dailyLimit: 0, weeklyLimit: 0 },
  kyc_completed: { xp: 80, dailyLimit: 0, weeklyLimit: 0 },
  compliance_reviewed: { xp: 20, dailyLimit: 0, weeklyLimit: 0 },
  strategy_matched: { xp: 40, dailyLimit: 0, weeklyLimit: 0 },
  risk_disclosure_acknowledged: { xp: 30, dailyLimit: 3, weeklyLimit: 0 },
  plain_language_explained: { xp: 20, dailyLimit: 0, weeklyLimit: 0 },
  personalized_plan_generated: { xp: 80, dailyLimit: 0, weeklyLimit: 0 },
  order_pretrade_checked_passed: { xp: 50, dailyLimit: 0, weeklyLimit: 0 },
  order_submitted: { xp: 100, dailyLimit: 0, weeklyLimit: 0 },
  milestone_achieved: { xp: 120, dailyLimit: 0, weeklyLimit: 0 },
  share_card_generated: { xp: 40, dailyLimit: 0, weeklyLimit: 0 },
  trust_thermometer_submitted: { xp: 15, dailyLimit: 2, weeklyLimit: 0 },
  quest_weekly_completed: { xp: 50, dailyLimit: 0, weeklyLimit: 1 },
  encourage_received: { xp: 10, dailyLimit: 2, weeklyLimit: 0 },
  challenge_completed: { xp: 40, dailyLimit: 1, weeklyLimit: 0 },
  composure_check_passed: { xp: 60, dailyLimit: 1, weeklyLimit: 0 },
  re_explain_feedback_submitted: { xp: 20, dailyLimit: 3, weeklyLimit: 0 }
};

/* Unlock map (Feature P) */
const UNLOCK_MAP = {
  2: [{ feature: 're_explain_modes', desc: '解鎖「聽不懂」改寫與更多比喻庫', icon: '💬' }],
  3: [{ feature: 'challenges', desc: '解鎖共同挑戰與 streak 儀表板', icon: '🏆' },
      { feature: 'allies_full', desc: '解鎖盟友系統完整功能', icon: '🤝' }],
  4: [{ feature: 'rebalancing_visual', desc: '解鎖再平衡建議完整視覺化', icon: '📊' }],
  5: [{ feature: 'rebalancing_review', desc: '解鎖再平衡決策回顧', icon: '🔍' }],
  6: [{ feature: 'partner_tools', desc: '解鎖長期趨勢與年度報告', icon: '📈' }]
};

function getXPForNextStar() {
  return RANK_XP_PER_STAR[AppState.rank] || 100;
}

function _todayKey() { return new Date().toISOString().slice(0, 10); }
function _weekKey() { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().slice(0, 10); }

function checkXPLimit(eventName) {
  const cfg = XP_TABLE[eventName];
  if (!cfg) return false;
  const dayKey = `${eventName}_day_${_todayKey()}`;
  const weekKey = `${eventName}_week_${_weekKey()}`;
  const dayCount = AppState.xpLimits[dayKey] || 0;
  const weekCount = AppState.xpLimits[weekKey] || 0;
  if (cfg.dailyLimit > 0 && dayCount >= cfg.dailyLimit) return false;
  if (cfg.weeklyLimit > 0 && weekCount >= cfg.weeklyLimit) return false;
  AppState.xpLimits[dayKey] = dayCount + 1;
  AppState.xpLimits[weekKey] = weekCount + 1;
  return true;
}

function addXP(amount, reason) {
  AppState.xp += amount;
  const needed = getXPForNextStar();
  // Star up
  if (AppState.xp >= needed && AppState.stars < RANK_STARS) {
    AppState.xp -= needed;
    AppState.stars++;
    showToast(`⭐ 升星！${RANK_NAMES[AppState.rank]} ★${AppState.stars}`, 'achievement');
    logEventRaw('star_up', { rank: AppState.rank, stars: AppState.stars });
  }
  // Rank up
  if (AppState.stars >= RANK_STARS && AppState.rank < 6) {
    AppState.rank++;
    AppState.stars = 1;
    AppState.level = AppState.rank; // sync
    const unlocks = UNLOCK_MAP[AppState.rank] || [];
    AppState.unlocks.push(...unlocks);
    showToast(`🎖️ 升階！你現在是 R${AppState.rank} ${RANK_NAMES[AppState.rank]}`, 'achievement', 5000);
    logEventRaw('level_up', { from_rank: AppState.rank - 1, to_rank: AppState.rank, unlocks });
    // Unlock allies at R3
    if (AppState.rank >= 3 && AppState.questStatus.allies === 'locked') {
      unlockQuest('allies');
    }
  }
  AppState.level = AppState.rank; // sync
  updatePlayerCard();
  showToast(`+${amount} XP — ${reason}`, 'info');
}

function logEventRaw(eventName, data = {}) {
  const event = { event: eventName, timestamp: new Date().toISOString(), ...data };
  AppState.events.push(event);
  console.log('[Event]', eventName, data);
}

function logEvent(eventName, data = {}) {
  logEventRaw(eventName, data);
  const cfg = XP_TABLE[eventName];
  if (cfg) {
    if (checkXPLimit(eventName)) {
      addXP(cfg.xp, eventName.replace(/_/g, ' '));
    } else {
      logEventRaw('xp_capped', { eventName });
      showToast(`XP 已達今日/本週上限`, 'warning');
    }
  }
}

/* --- Quest Progression --- */
function unlockQuest(page) {
  if (AppState.questStatus[page] === 'locked') {
    AppState.questStatus[page] = 'available';
    updateQuestNav();
    showToast(`新任務解鎖！`, 'success');
  }
}

function completeQuest(page) {
  AppState.questStatus[page] = 'completed';
  updateQuestNav();
}

function updateQuestNav() {
  document.querySelectorAll('.quest-nav .nav-item').forEach(item => {
    const page = item.dataset.page;
    const status = AppState.questStatus[page];
    const dot = item.querySelector('.quest-status');
    if (dot) {
      dot.className = 'quest-status ' + status;
    }
    if (status === 'locked') {
      item.style.opacity = '0.4';
      item.style.pointerEvents = 'none';
    } else {
      item.style.opacity = '1';
      item.style.pointerEvents = 'auto';
    }
  });
}

/* --- SPA Navigation --- */
function navigateTo(page) {
  if (AppState.questStatus[page] === 'locked') {
    showToast('此任務尚未解鎖，請先完成前置任務', 'warning');
    return;
  }
  AppState.currentPage = page;
  // Update nav active state
  document.querySelectorAll('.quest-nav .nav-item').forEach(i => {
    i.classList.toggle('active', i.dataset.page === page);
  });
  // Update header
  const titles = {
    home: '村莊廣場',
    goals: '【初心者】目標設定',
    profile: '【職業說明NPC】KYC 評估',
    recommendation: '【專屬特殊技能】客製化方案',
    execution: '【攻克據點】一鍵下單',
    dashboard: '【戰績回顧】里程碑與理財調整',
    share: '冒險日誌分享',
    allies: '【盟友中心】Allies Hub'
  };
  const breadcrumbs = {
    home: '薪守村 / 村莊廣場',
    goals: '薪守村 / 主線任務 / 初心者',
    profile: '薪守村 / 主線任務 / 職業說明NPC',
    recommendation: '薪守村 / 主線任務 / 專屬特殊技能',
    execution: '薪守村 / 主線任務 / 攻克據點',
    dashboard: '薪守村 / 主線任務 / 戰績回顧',
    share: '薪守村 / 支線任務 / 冒險日誌',
    allies: '薪守村 / 支線任務 / 盟友中心'
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;
  document.getElementById('breadcrumb').textContent = breadcrumbs[page] || '';
  // Render page
  const content = document.getElementById('mainContent');
  content.innerHTML = getPageContent(page);
  content.scrollTop = 0;
  window.scrollTo(0, 0);
  // Init page-specific scripts
  setTimeout(() => initPageScripts(page), 50);
}

function getPageContent(page) {
  const renderers = {
    home: typeof renderHomePage === 'function' ? renderHomePage : () => '<p>載入中...</p>',
    goals: typeof renderGoalsPage === 'function' ? renderGoalsPage : () => '<p>載入中...</p>',
    profile: typeof renderProfilePage === 'function' ? renderProfilePage : () => '<p>載入中...</p>',
    recommendation: typeof renderRecommendationPage === 'function' ? renderRecommendationPage : () => '<p>載入中...</p>',
    execution: typeof renderExecutionPage === 'function' ? renderExecutionPage : () => '<p>載入中...</p>',
    dashboard: typeof renderDashboardPage === 'function' ? renderDashboardPage : () => '<p>載入中...</p>',
    share: typeof renderSharePage === 'function' ? renderSharePage : () => '<p>載入中...</p>',
    allies: typeof renderAlliesPage === 'function' ? renderAlliesPage : () => '<p>載入中...</p>',
    assistant: typeof renderAssistantPage === 'function' ? renderAssistantPage : () => '<p>載入中...</p>'
  };
  return (renderers[page] || (() => '<p>頁面不存在</p>'))();
}

function initPageScripts(page) {
  const inits = {
    home: typeof initHomePage === 'function' ? initHomePage : null,
    goals: typeof initGoalsPage === 'function' ? initGoalsPage : null,
    profile: typeof initProfilePage === 'function' ? initProfilePage : null,
    recommendation: typeof initRecommendationPage === 'function' ? initRecommendationPage : null,
    execution: typeof initExecutionPage === 'function' ? initExecutionPage : null,
    dashboard: typeof initDashboardPage === 'function' ? initDashboardPage : null,
    share: typeof initSharePage === 'function' ? initSharePage : null,
    allies: typeof initAlliesPage === 'function' ? initAlliesPage : null,
    assistant: typeof initAssistantPage === 'function' ? initAssistantPage : null
  };
  if (inits[page]) inits[page]();
}

/* --- Player Card Update --- */
function updatePlayerCard() {
  const user = AppState.user || {};
  document.getElementById('playerName').textContent = user.name || '冒險者';
  document.getElementById('playerClass').textContent = RANK_NAMES[AppState.rank] || '初心者';
  document.getElementById('levelBadge').textContent = `R${AppState.rank}`;
  document.getElementById('playerTitle').textContent = RANK_NAMES[AppState.rank] || '初心者';
  // Stars display
  const starsEl = document.getElementById('playerStars');
  if (starsEl) {
    starsEl.innerHTML = '★'.repeat(AppState.stars) + '☆'.repeat(RANK_STARS - AppState.stars);
  }
  const needed = getXPForNextStar();
  const pct = Math.min((AppState.xp / needed) * 100, 100);
  document.getElementById('xpBarFill').style.width = pct + '%';
  document.getElementById('xpBarText').textContent = `${AppState.xp} / ${needed} XP`;
}

/* --- Theme Toggle --- */
function toggleTheme() {
  AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', AppState.theme);
  localStorage.setItem('theme', AppState.theme);
  const icon = document.getElementById('themeIcon');
  icon.className = AppState.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

/* --- Sidebar Toggle (mobile) --- */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

/* --- Toast Notifications --- */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const icons = {
    success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️',
    achievement: '🏆'
  };
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'achievement' ? 'achievement-toast' : type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* --- Risk Disclosure Modal --- */
function showRiskDisclosure(callback) {
  const modal = document.getElementById('riskModal');
  modal.classList.add('active');
  window._riskCallback = callback;
}

function closeRiskModal() {
  document.getElementById('riskModal').classList.remove('active');
}

function acknowledgeRisk() {
  AppState.riskDisclosureAcknowledged = true;
  logEvent('risk_disclosure_acknowledged');
  closeRiskModal();
  if (window._riskCallback) {
    window._riskCallback();
    window._riskCallback = null;
  }
}

/* --- Notification Panel --- */
function toggleNotifications() {
  document.getElementById('notifModal').classList.toggle('active');
}

function closeNotifications() {
  document.getElementById('notifModal').classList.remove('active');
}

/* --- Chatbot Toggle --- */
function toggleChatbot() {
  document.getElementById('chatbotPanel').classList.toggle('open');
}

/* --- Logout --- */
function logout() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

/* --- Simulated API --- */
const API = {
  createGoal(goalData) {
    return new Promise(resolve => {
      setTimeout(() => {
        AppState.currentGoal = goalData;
        AppState.goals = AppState.goals || [];
        AppState.goals.push(goalData);
        logEvent('goal_captured', goalData);
        resolve({ success: true, goalId: 'goal_' + Date.now() });
      }, 800);
    });
  },

  semanticTransform(goalText) {
    return new Promise(resolve => {
      setTimeout(() => {
        logEvent('semantic_transformed');
        resolve({
          success: true,
          parameters: {
            targetAmount: 3000000,
            monthlyInvest: 15000,
            years: 10,
            riskTolerance: 'moderate'
          }
        });
      }, 1000);
    });
  },

  submitKYC(answers) {
    return new Promise(resolve => {
      setTimeout(() => {
        const score = answers.reduce((s, a) => s + a, 0);
        const maxScore = answers.length * 4;
        const pct = score / maxScore;
        let grade, label;
        if (pct < 0.3) { grade = 'C1'; label = '保守型賢者'; }
        else if (pct < 0.5) { grade = 'C2'; label = '穩健型冒險家'; }
        else if (pct < 0.7) { grade = 'C3'; label = '平衡型戰士'; }
        else if (pct < 0.85) { grade = 'C4'; label = '積極型勇者'; }
        else { grade = 'C5'; label = '激進型劍聖'; }
        AppState.profile = { answers, riskScore: score, riskGrade: grade, riskLabel: label };
        logEvent('kyc_completed', { riskGrade: grade });
        resolve({ success: true, riskGrade: grade, riskLabel: label, riskScore: score, maxScore });
      }, 1200);
    });
  },

  generateRecommendation() {
    return new Promise(resolve => {
      setTimeout(() => {
        const allocation = [
          { name: '國內債券型基金', pct: 30, color: '#4CAF50' },
          { name: '全球股票型基金', pct: 25, color: '#2196F3' },
          { name: '科技 ETF', pct: 20, color: '#9C27B0' },
          { name: 'AI 主題基金', pct: 15, color: '#FF9800' },
          { name: '貨幣市場基金', pct: 10, color: '#607D8B' }
        ];
        AppState.recommendation = {
          allocation,
          rationale: '根據你的風險屬性與人生目標，我們以「穩健成長」為核心策略，搭配適度的科技成長題材，兼顧防禦與進攻。',
          riskScenario: '在極端市場情況下（如 2020 年疫情），此組合最大回撤約 -15%，但歷史上均在 12 個月內回復。',
          worstCase: '最壞情況下，你可能面臨 15~20% 的暫時性資產減損，但以 10 年以上的投資期間來看，長期正報酬機率超過 90%。',
          productPool: ['fund_001', 'fund_002', 'fund_003', 'etf_001']
        };
        logEvent('personalized_plan_generated');
        resolve({ success: true, data: AppState.recommendation });
      }, 2000);
    });
  },

  pretradeCheck() {
    return new Promise(resolve => {
      setTimeout(() => {
        const passed = AppState.profile.riskGrade !== 'C5';
        if (passed) logEvent('order_pretrade_checked_passed');
        else logEvent('order_pretrade_checked_blocked');
        resolve({ passed, checks: [
          { name: 'KYC 驗證', status: 'passed' },
          { name: '風險匹配', status: passed ? 'passed' : 'failed' },
          { name: '額度確認', status: 'passed' },
          { name: '合規審查', status: 'passed' },
          { name: '交易時段', status: 'passed' }
        ]});
      }, 3000);
    });
  },

  submitOrder() {
    return new Promise(resolve => {
      setTimeout(() => {
        logEvent('order_submitted');
        resolve({ success: true, orderId: 'ORD_' + Date.now() });
      }, 1500);
    });
  },

  getDashboardData() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          totalAsset: 156800,
          goalProgress: 12,
          monthlyInvest: 15000,
          streak: AppState.streak || 28,
          months: 6,
          driftScore: 8.2,
          rank: AppState.rank || 1,
          rankName: RANK_NAMES[AppState.rank] || '啟程者',
          stars: AppState.stars || 1,
          holdings: [
            { name: '國內債券型基金', cost: 45000, currentValue: 47040 },
            { name: '全球股票型基金', cost: 40000, currentValue: 39200 },
            { name: '科技 ETF', cost: 29800, currentValue: 31360 },
            { name: 'AI 主題基金', cost: 21600, currentValue: 23520 },
            { name: '貨幣市場基金', cost: 15600, currentValue: 15680 }
          ],
          /* === 任務目標 (Quest Goals) === */
          questGoals: [
            { id: 'main_freedom', icon: '🏝️', name: '30歲財務自由大冒險', type: '主線任務',
              targetAmount: 3000000, currentAmount: 156800, years: 8, startDate: '2025-08-01',
              monthlyTarget: 15000, monthlyActual: 15000, consecutiveMonths: 6,
              flavor: '存到第一桶金，提早實現不被工作綁架的人生！',
              status: 'active', priority: 1 },
            { id: 'side_japan', icon: '🗼', name: '日本追櫻自由行', type: '支線任務',
              targetAmount: 80000, currentAmount: 52000, years: 1, startDate: '2025-10-01',
              monthlyTarget: 6000, monthlyActual: 6500, consecutiveMonths: 5,
              flavor: '明年春天去京都看櫻花、吃和牛、逛中古店 🌸',
              status: 'active', priority: 2 },
            { id: 'side_macbook', icon: '💻', name: 'MacBook Pro 換機基金', type: '支線任務',
              targetAmount: 75000, currentAmount: 62000, years: 1, startDate: '2025-06-01',
              monthlyTarget: 8000, monthlyActual: 8000, consecutiveMonths: 8,
              flavor: 'M4 Pro 太香了！靠每月存錢不用刷卡分期 🍎',
              status: 'active', priority: 3 },
            { id: 'side_concert', icon: '🎤', name: '年度追星演唱會基金', type: '支線任務',
              targetAmount: 30000, currentAmount: 18000, years: 1, startDate: '2025-11-01',
              monthlyTarget: 5000, monthlyActual: 4500, consecutiveMonths: 3,
              flavor: '搶到前排票＋周邊＋住宿，一次到位不心痛',
              status: 'active', priority: 4 },
            { id: 'side_emergency', icon: '🛡️', name: '緊急備戰金庫', type: '支線任務',
              targetAmount: 100000, currentAmount: 88000, years: 1, startDate: '2025-06-01',
              monthlyTarget: 10000, monthlyActual: 10000, consecutiveMonths: 8,
              flavor: '存滿 3 個月薪水的安全網，不怕突發狀況',
              status: 'active', priority: 5 },
            { id: 'side_pet', icon: '🐱', name: '毛孩醫療預備金', type: '支線任務',
              targetAmount: 50000, currentAmount: 15000, years: 2, startDate: '2025-12-01',
              monthlyTarget: 3000, monthlyActual: 3000, consecutiveMonths: 2,
              flavor: '養毛孩是一輩子的事，醫療費用提前準備',
              status: 'active', priority: 6 }
          ],
          /* === 本週任務 (Weekly Tasks) === */
          weeklyTasks: [
            { id: 'wt1', icon: '💰', name: '完成本週自動扣款', xp: 50, done: true, doneAt: '2026-02-03' },
            { id: 'wt2', icon: '📖', name: '看完一篇理財懶人包', xp: 30, done: true, doneAt: '2026-02-04' },
            { id: 'wt3', icon: '📊', name: '滑一下戰績儀表板', xp: 15, done: true, doneAt: '2026-02-05' },
            { id: 'wt4', icon: '🤝', name: '幫盟友加油打氣', xp: 10, done: false, doneAt: null },
            { id: 'wt5', icon: '🎯', name: 'Check 目標離多遠', xp: 15, done: false, doneAt: null },
            { id: 'wt6', icon: '🌡️', name: '回報本週投資心情', xp: 15, done: false, doneAt: null }
          ],
          /* === 里程碑 (Milestones) — 年輕人共鳴版 === */
          milestones: [
            { title: '🎯 許下第一個願望', desc: '跟系統說出你的夢想，理財旅程正式 Start！', achieved: true, achievedAt: '2025-08-01', xpReward: 50 },
            { title: '🛡️ 解鎖冒險職業', desc: '完成風險評估，知道自己是穩健派還是衝鋒型', achieved: true, achievedAt: '2025-08-02', xpReward: 80 },
            { title: '📊 拿到專屬裝備', desc: 'AI 量身打造你的投資組合，不用自己選', achieved: true, achievedAt: '2025-08-03', xpReward: 30 },
            { title: '⚔️ 第一次出手', desc: '按下一鍵下單的那一刻，你已經贏過大多數人！', achieved: true, achievedAt: '2025-08-05', xpReward: 100 },
            { title: '🔥 連續打卡 4 週', desc: '比健身房還持久！投資紀律 MAX', achieved: true, achievedAt: '2025-09-01', xpReward: 40 },
            { title: '🤝 找到第一個隊友', desc: '拉好友一起存錢比較不孤單', achieved: true, achievedAt: '2025-10-15', xpReward: 30 },
            { title: '📈 帳戶長出第一塊錢', desc: '看到綠色的那一刻超感動', achieved: true, achievedAt: '2025-11-20', xpReward: 20 },
            { title: '🌟 晉級受訓者 R2', desc: '薪守村認證的理財練習生！', achieved: true, achievedAt: '2025-12-01', xpReward: 0 },
            { title: '💰 撐過 3 個月', desc: '沒有中途解約，你比 70% 的人還強', achieved: true, achievedAt: '2025-11-01', xpReward: 40 },
            { title: '🧘 大跌不恐慌', desc: '市場暴跌沒有亂賣，沉著之心 get！', achieved: false, progress: 0.6, hint: '下次股市大跌時自動觸發' },
            { title: '🏆 獲利破 10%', desc: '本金長了 10%！開始懂什麼叫複利了', achieved: false, progress: 0.35, hint: '目前 +3.5%，加油！' },
            { title: '📅 不間斷 12 週', desc: '三個月完美出席！鑽石手就是你', achieved: false, progress: 0.5, hint: '才過一半，撐住！(6/12)' },
            { title: '🎖️ 和隊友一起達標', desc: '完成第一場共同挑戰，友情+財力雙成長', achieved: false, progress: 0.25, hint: '挑戰進行中…' },
            { title: '⚡ 第一次自動調倉', desc: '系統偵測偏移幫你 Rebalance，超智能', achieved: false, progress: 0.8, hint: '偏移快到了，即將觸發！' },
            { title: '🎤 追星基金達標', desc: '演唱會門票+住宿+周邊全部存好！', achieved: false, progress: 0.6, hint: '已存 60%，繼續衝' },
            { title: '💻 換機基金 Get', desc: '不用分期！新筆電直接全額帶走', achieved: false, progress: 0.83, hint: '再存 2 個月搞定！' },
            { title: '🌈 獲利破 20%', desc: '投資收益翻倍成長，你是真的有在賺', achieved: false, progress: 0, hint: '先 10% 再來挑戰' },
            { title: '🏅 晉級紀律者 R3', desc: '解鎖盟友完整功能，開始帶隊打副本', achieved: false, progress: 0.3, hint: '繼續做任務累積 XP' }
          ],
          /* === 成就徽章 === */
          badges: [
            { icon: '🗡️', name: '初心之刃', desc: '按下人生第一次投資按鈕', earned: true },
            { icon: '🛡️', name: '風險識者', desc: '搞懂自己是哪種理財玩家', earned: true },
            { icon: '🔥', name: '堅持之焰', desc: '連續 4 週沒放棄，太強了', earned: true },
            { icon: '🤝', name: '結盟之約', desc: '拉到第一個理財戰友', earned: true },
            { icon: '📈', name: '初見曙光', desc: '看到帳戶第一次變綠色', earned: true },
            { icon: '🧊', name: '沉著之心', desc: '大跌不恐慌不亂賣', earned: false },
            { icon: '💎', name: '鑽石手', desc: '12 週完美出席不中斷', earned: false },
            { icon: '🏆', name: '挑戰制霸', desc: '和隊友一起完成共同挑戰', earned: false },
            { icon: '🐱', name: '毛孩守護', desc: '毛孩醫療基金存滿達標', earned: false },
            { icon: '🗼', name: '追櫻達人', desc: '日本旅遊基金成功解鎖', earned: false }
          ],
          chartData: {
            week: [148000, 149500, 152000, 150800, 153200, 155000, 156800],
            month: [120000, 125000, 130000, 138000, 142000, 148000, 156800]
          }
        });
      }, 1000);
    });
  }
};

/* --- Chart Helpers --- */
function renderDonutChart(containerId, allocation) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const size = 200;
  const r = 70;
  const cx = size / 2, cy = size / 2;
  let cumPct = 0;
  let paths = '';
  allocation.forEach(item => {
    const startAngle = cumPct * 3.6 * (Math.PI / 180);
    cumPct += item.pct;
    const endAngle = cumPct * 3.6 * (Math.PI / 180);
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = item.pct > 50 ? 1 : 0;
    paths += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${item.color}" opacity="0.85"/>`;
  });
  container.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}">${paths}
      <circle cx="${cx}" cy="${cy}" r="45" fill="var(--bg-card)"/>
    </svg>
    <div class="donut-center">
      <div class="center-label">投資組合</div>
      <div class="center-value">100%</div>
    </div>`;
}

function renderBarChart(containerId, data, labels) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const max = Math.max(...data) * 1.1;
  container.innerHTML = data.map((v, i) => {
    const h = (v / max) * 160;
    return `<div class="bar" style="height:${h}px;">
      <span class="bar-value">${(v / 1000).toFixed(0)}K</span>
      <span class="bar-label">${labels ? labels[i] : ''}</span>
    </div>`;
  }).join('');
}

/* --- Init App --- */
function initApp() {
  // Check login
  if (!sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
    return;
  }
  // Load user
  try {
    AppState.user = JSON.parse(sessionStorage.getItem('currentUser'));
    AppState.level = AppState.user?.level || 1;
    AppState.xp = AppState.user?.xp || 0;
  } catch(e) {
    AppState.user = { name: '冒險者', class: '初心者', level: 1, xp: 0, title: '初心者' };
  }
  // Apply theme
  document.documentElement.setAttribute('data-theme', AppState.theme);
  const themeIcon = document.getElementById('themeIcon');
  if (AppState.theme === 'dark' && themeIcon) {
    themeIcon.className = 'fas fa-sun';
  }
  // Show app
  const overlay = document.getElementById('loadingOverlay');
  const appLayout = document.getElementById('appLayout');
  if (!overlay || !appLayout) return; // Running outside main page (e.g. tests)
  setTimeout(() => {
    overlay.classList.add('hide');
    appLayout.style.display = 'flex';
    updatePlayerCard();
    updateQuestNav();
    navigateTo('home');
    // Init chatbot
    if (typeof Chatbot !== 'undefined') Chatbot.init();
  }, 1200);
}

/* Global helper — called from HTML onclick */
function sendChat() { if (typeof Chatbot !== 'undefined') Chatbot.send(); }

document.addEventListener('DOMContentLoaded', initApp);

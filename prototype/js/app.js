/* ================================================
   薪守村 — 核心遊戲引擎 (app.js)
   Features: 狀態管理、SPA 路由、遊戲機制、API 模擬
   ================================================ */

/* --- Global State --- */
const AppState = {
  currentPage: 'home',
  user: null,
  theme: localStorage.getItem('theme') || 'light',
  // Game progression
  xp: 0,
  level: 1,
  questStatus: {
    home: 'completed',
    goals: 'available',
    profile: 'locked',
    recommendation: 'locked',
    execution: 'locked',
    dashboard: 'locked',
    share: 'locked'
  },
  // Feature data
  goals: null,
  currentGoal: null,
  profile: { answers: [], riskScore: 0, riskGrade: '' },
  recommendation: null,
  actionList: null,
  riskDisclosureAcknowledged: false,
  trustScore: null,
  // Events log
  events: []
};

/* --- XP & Level System --- */
const XP_TABLE = {
  goal_captured: 50,
  semantic_transformed: 30,
  kyc_completed: 80,
  compliance_reviewed: 20,
  strategy_matched: 40,
  risk_disclosure_acknowledged: 60,
  plain_language_explained: 20,
  personalized_plan_generated: 80,
  order_pretrade_checked_passed: 50,
  order_submitted: 100,
  milestone_achieved: 120,
  share_card_generated: 40,
  trust_thermometer_submitted: 30
};

function getXPForLevel(level) {
  return level * 100 + (level - 1) * 50;
}

function addXP(amount, reason) {
  AppState.xp += amount;
  const needed = getXPForLevel(AppState.level);
  if (AppState.xp >= needed) {
    AppState.xp -= needed;
    AppState.level++;
    showToast(`升級！你現在是 Lv.${AppState.level}`, 'achievement');
  }
  updatePlayerCard();
  showToast(`+${amount} XP — ${reason}`, 'info');
}

function logEvent(eventName, data = {}) {
  const event = { event: eventName, timestamp: new Date().toISOString(), ...data };
  AppState.events.push(event);
  console.log('[Event]', eventName, data);
  if (XP_TABLE[eventName]) {
    addXP(XP_TABLE[eventName], eventName.replace(/_/g, ' '));
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
    share: '冒險日誌分享'
  };
  const breadcrumbs = {
    home: '薪守村 / 村莊廣場',
    goals: '薪守村 / 主線任務 / 初心者',
    profile: '薪守村 / 主線任務 / 職業說明NPC',
    recommendation: '薪守村 / 主線任務 / 專屬特殊技能',
    execution: '薪守村 / 主線任務 / 攻克據點',
    dashboard: '薪守村 / 主線任務 / 戰績回顧',
    share: '薪守村 / 支線任務 / 冒險日誌'
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
    share: typeof renderSharePage === 'function' ? renderSharePage : () => '<p>載入中...</p>'
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
    share: typeof initSharePage === 'function' ? initSharePage : null
  };
  if (inits[page]) inits[page]();
}

/* --- Player Card Update --- */
function updatePlayerCard() {
  const user = AppState.user || {};
  document.getElementById('playerName').textContent = user.name || '冒險者';
  document.getElementById('playerClass').textContent = user.class || '初心者';
  document.getElementById('levelBadge').textContent = `Lv.${AppState.level}`;
  document.getElementById('playerTitle').textContent = user.title || '初心者';
  const needed = getXPForLevel(AppState.level);
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
          streak: 28,
          months: 6,
          driftScore: 8.2,
          holdings: [
            { name: '國內債券型基金', cost: 45000, currentValue: 47040 },
            { name: '全球股票型基金', cost: 40000, currentValue: 39200 },
            { name: '科技 ETF', cost: 29800, currentValue: 31360 },
            { name: 'AI 主題基金', cost: 21600, currentValue: 23520 },
            { name: '貨幣市場基金', cost: 15600, currentValue: 15680 }
          ],
          milestones: [
            { title: '🎯 完成第一個目標設定', desc: '踏出理財第一步', achieved: true },
            { title: '🛡️ 通過風險評估', desc: '了解自己的冒險風格', achieved: true },
            { title: '📊 取得專屬方案', desc: '收到 AI 客製化推薦', achieved: true },
            { title: '⚔️ 首次交易成功', desc: '一鍵下單完成', achieved: true },
            { title: '💰 投資滿 3 個月', desc: '持續定期定額', achieved: false },
            { title: '🏆 累積報酬 10%', desc: '冒險收益達標', achieved: false }
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
  if (AppState.theme === 'dark') {
    document.getElementById('themeIcon').className = 'fas fa-sun';
  }
  // Show app
  const overlay = document.getElementById('loadingOverlay');
  const appLayout = document.getElementById('appLayout');
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

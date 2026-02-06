/* ================================================
   Demo Helper — 快速演示 / 自動流程
   ================================================ */

const Demo = {
  /** 快速填入完整 demo 狀態 */
  quickSetup() {
    // 模擬已完成前三階段
    AppState.user = { id: 'demo', name: '旅行者', level: 3, riskGrade: 'C3' };
    AppState.level = 3;
    AppState.xp = 420;

    AppState.currentGoal = {
      type: 'retirement',
      name: '退休規劃',
      amount: 5000000,
      years: 25,
      monthly: 15000,
      description: '希望 60 歲退休後每月有 3 萬元生活費'
    };

    AppState.profile = {
      riskGrade: 'C3',
      riskLabel: '平衡型戰士',
      scores: [2, 2, 2, 2, 3],
      totalScore: 11
    };

    AppState.recommendation = {
      allocation: DataService.getAllocationTemplates().C3,
      rationale: '根據您的平衡型風險屬性與 25 年退休目標，建議以全球股票為核心，搭配高股息和債券進行分散配置。',
      trustLevel: 4
    };

    AppState.questStatus = {
      home: 'completed',
      goals: 'completed',
      profile: 'completed',
      recommendation: 'completed',
      execution: 'available',
      dashboard: 'locked',
      share: 'locked'
    };

    updateQuestNav();
    updatePlayerCard();
    showToast('🎮 Demo 模式已啟動 — 已跳到「攻克據點」階段', 'info', 3000);
    navigateTo('execution');
  },

  /** 完整流程自動播放 */
  async autoPlay() {
    showToast('🎬 自動演示開始...', 'info');
    await this.delay(1000);

    // Step 1: 目標設定
    navigateTo('goals');
    await this.delay(2000);

    // Step 2: 風險評估
    navigateTo('profile');
    await this.delay(2000);

    // Step 3: 方案推薦
    navigateTo('recommendation');
    await this.delay(2000);

    // Step 4: 一鍵下單
    navigateTo('execution');
    await this.delay(2000);

    // Step 5: 戰績回顧
    navigateTo('dashboard');
    showToast('🎬 自動演示結束', 'success');
  },

  /** 重置所有狀態 */
  reset() {
    sessionStorage.clear();
    AppState.level = 1;
    AppState.xp = 0;
    AppState.currentGoal = null;
    AppState.profile = null;
    AppState.recommendation = null;
    AppState.actionList = [];
    AppState.events = [];
    AppState.questStatus = {
      home: 'completed',
      goals: 'available',
      profile: 'locked',
      recommendation: 'locked',
      execution: 'locked',
      dashboard: 'locked',
      share: 'locked'
    };
    updateQuestNav();
    updatePlayerCard();
    navigateTo('home');
    showToast('🔄 已重置為初始狀態', 'info');
  },

  /** 冒煙測試：依序檢查所有頁面關鍵元素是否存在 */
  async runSmokeTest() {
    const results = [];
    const checks = [
      { page: 'home', selector: '.quest-overview,.home-hero', label: '村莊廣場' },
      { page: 'goals', selector: '.goal-types-grid,.goal-form', label: '目標設定' },
      { page: 'profile', selector: '.kyc-question,.risk-meter', label: 'KYC 評估' },
      { page: 'recommendation', selector: '.allocation-chart,.trust-section', label: '方案推薦' },
      { page: 'execution', selector: '.action-list,.pretrade-check', label: '一鍵下單' },
      { page: 'dashboard', selector: '#dashboardContent,.holdings-table', label: '戰績回顧' },
      { page: 'share', selector: '.share-card-preview,.share-buttons', label: '冒險日誌' }
    ];

    // 確保必要資料與任務解鎖
    this.quickSetup();
    AppState.questStatus = {
      home: 'completed',
      goals: 'completed',
      profile: 'completed',
      recommendation: 'completed',
      execution: 'completed',
      dashboard: 'available',
      share: 'available'
    };
    updateQuestNav();

    showToast('🧪 冒煙測試開始...', 'info');

    for (const c of checks) {
      navigateTo(c.page);
      await this.delay(600);
      const ok = !!document.querySelector(c.selector);
      results.push({ page: c.page, ok, label: c.label, selector: c.selector });
      console.log(`[SmokeTest] ${c.label} (${c.page})`, ok ? 'OK' : 'FAIL', c.selector);
    }

    const failed = results.filter(r => !r.ok);
    if (failed.length === 0) {
      showToast('✅ 冒煙測試完成：全部頁面正常', 'success', 3000);
    } else {
      showToast(`⚠️ 冒煙測試發現 ${failed.length} 個問題，請看 Console`, 'warning', 4000);
      console.table(failed);
    }

    return results;
  },

  delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
};

// Expose to console for demo use
window.Demo = Demo;

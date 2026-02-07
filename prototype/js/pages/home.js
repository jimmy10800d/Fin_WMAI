/* ================================================
   村莊廣場 (Home Page) — 冒險總覽
   ================================================ */
function renderHomePage() {
  const user = AppState.user || {};
  const completedQuests = Object.values(AppState.questStatus).filter(s => s === 'completed').length;
  const totalQuests = Object.keys(AppState.questStatus).length;

  return `
    <!-- Hero Welcome -->
    <div class="home-hero animate-fadeIn">
      <div class="npc-dialog" style="justify-content:center;margin-bottom:16px;">
        <img src="IP_ICON/IP_HELLO.png" alt="小曦雲" class="npc-avatar-xl">
        <div class="npc-bubble">
          <div class="npc-name">嚮導 小曦雲</div>
          歡迎回到薪守村，<strong class="text-gold">${user.name || '冒險者'}</strong>！
          今天也要繼續守護你的薪水嗎？讓我們一起展開冒險吧 ✨
        </div>
      </div>
      <p class="hero-subtitle">「有溫度、看得懂、會分析、信得過」的目標導向資產成長旅程</p>
    </div>

    <!-- Journey Progress -->
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header">
        <h3>⚔️ 冒險進度</h3>
        <span class="tag tag-gold">${completedQuests}/${totalQuests} 完成</span>
      </div>
      <div class="stage-progress">
        <div class="stage-step ${getStageClass('goals')}">
          <div class="stage-dot">1</div>
          <span class="stage-label">初心者</span>
        </div>
        <div class="stage-step ${getStageClass('profile')}">
          <div class="stage-dot">2</div>
          <span class="stage-label">職業說明</span>
        </div>
        <div class="stage-step ${getStageClass('recommendation')}">
          <div class="stage-dot">3</div>
          <span class="stage-label">特殊技能</span>
        </div>
        <div class="stage-step ${getStageClass('execution')}">
          <div class="stage-dot">4</div>
          <span class="stage-label">攻克據點</span>
        </div>
        <div class="stage-step ${getStageClass('dashboard')}">
          <div class="stage-dot">5</div>
          <span class="stage-label">戰績回顧</span>
        </div>
      </div>
    </div>

    <!-- Quest Cards -->
    <div class="quest-overview stagger">
      ${renderQuestCard(1, 'goals', '初心者', '目標切入與語意轉換', '從生活目標出發，告訴系統你的夢想，我們幫你轉成可量化的冒險計畫', 50)}
      ${renderQuestCard(2, 'profile', '職業說明NPC', 'KYC 與風險評估', '評估你的冒險能力，決定你的職業分類與可承受的風險等級', 80)}
      ${renderQuestCard(3, 'recommendation', '專屬特殊技能', '投資商品客製化方案', '根據你的職業分類，從投資商品池打造專屬技能組合', 80)}
      ${renderQuestCard(4, 'execution', '攻克據點', '一鍵下單 + 自動風控', '確認方案後一鍵出擊，系統自動完成風險控管', 100)}
      ${renderQuestCard(5, 'dashboard', '戰績回顧', '里程碑回顧與理財調整', '24h 監控你的戰績，達標慶祝、偏離調整', 120)}
    </div>

    <!-- Quick Guide -->
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header">
        <h3>📖 新手冒險指南</h3>
      </div>
      <div class="guide-steps">
        <div class="guide-step">
          <div class="step-num">1</div>
          <div class="step-text"><strong>設定目標</strong><span>告訴我們你的人生夢想</span></div>
        </div>
        <div class="guide-step">
          <div class="step-num">2</div>
          <div class="step-text"><strong>能力評估</strong><span>了解你的風險承受力</span></div>
        </div>
        <div class="guide-step">
          <div class="step-num">3</div>
          <div class="step-text"><strong>裝備推薦</strong><span>AI 為你打造專屬方案</span></div>
        </div>
        <div class="guide-step">
          <div class="step-num">4</div>
          <div class="step-text"><strong>開始冒險</strong><span>一鍵下單、自動風控</span></div>
        </div>
        <div class="guide-step">
          <div class="step-num">5</div>
          <div class="step-text"><strong>持續成長</strong><span>追蹤戰績、達標慶祝</span></div>
        </div>
      </div>
    </div>

    <!-- Market Intel -->
    <div class="card animate-fadeIn">
      <div class="card-header">
        <h3>📊 市場情報站</h3>
        <span class="tag tag-blue">即時</span>
      </div>
      <div class="market-items">
        <div class="market-item">
          <div class="market-name">台股加權指數</div>
          <div class="market-value">22,456</div>
          <div class="market-change up">▲ +0.8%</div>
        </div>
        <div class="market-item">
          <div class="market-name">S&P 500</div>
          <div class="market-value">5,892</div>
          <div class="market-change up">▲ +0.3%</div>
        </div>
        <div class="market-item">
          <div class="market-name">美元/台幣</div>
          <div class="market-value">31.25</div>
          <div class="market-change down">▼ -0.1%</div>
        </div>
        <div class="market-item">
          <div class="market-name">AI 概念指數</div>
          <div class="market-value">3,456</div>
          <div class="market-change up">▲ +2.1%</div>
        </div>
      </div>
    </div>
  `;
}

function getStageClass(page) {
  const status = AppState.questStatus[page];
  if (status === 'completed') return 'completed';
  if (status === 'in-progress' || status === 'available') return 'active';
  return '';
}

function renderQuestCard(stage, page, label, title, desc, xpReward) {
  const status = AppState.questStatus[page];
  const locked = status === 'locked' ? 'locked' : '';
  const statusTag = status === 'completed' ? '<span class="tag tag-green">✓ 已完成</span>' :
                    status === 'available' ? '<span class="tag tag-orange">可接取</span>' :
                    status === 'in-progress' ? '<span class="tag tag-blue">進行中</span>' :
                    '<span class="tag tag-red">🔒 未解鎖</span>';
  return `
    <div class="quest-card stage-${stage} ${locked} animate-fadeIn" onclick="navigateTo('${page}')">
      <div class="quest-banner"></div>
      <div class="quest-body">
        <div class="quest-stage-label" style="color:var(--text-muted);">階段 ${stage} — ${label}</div>
        <div class="quest-title">${title}</div>
        <div class="quest-desc">${desc}</div>
        <div class="quest-footer">
          ${statusTag}
          <div class="quest-reward">🪙 +${xpReward} XP</div>
        </div>
      </div>
    </div>
  `;
}

function initHomePage() {
  // Nothing special needed for home
}

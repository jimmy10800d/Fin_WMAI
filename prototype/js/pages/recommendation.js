/* ================================================
   【專屬特殊技能】客製化方案 — Features C/D/E
   白話說明 + 聽不懂切換 + 投資商品池
   ================================================ */
const ExplainStrategies = {
  default: {
    name: '📖 標準說明',
    explain: (rec) => `你的投資組合就像是一支多元化的團隊——有穩定輸出的債券（佔 ${rec.allocation[0]?.pct}%），有主力攻擊的股票基金（佔 ${rec.allocation[1]?.pct}%），還有充滿潛力的科技新星。這樣的組合兼顧穩定與成長。`
  },
  athlete: {
    name: '🏃 運動員比喻',
    explain: (rec) => `把你的投資組合想像成一支籃球隊：債券是穩健的中鋒（${rec.allocation[0]?.pct}%），負責防守和穩定；股票基金是得分後衛（${rec.allocation[1]?.pct}%），進攻得分；科技 ETF 是三分射手，偶爾爆發！整支隊伍攻守兼備。`
  },
  navigator: {
    name: '🧭 導航比喻',
    explain: (rec) => `你的投資組合就像一趟環島旅行的行程規劃：債券是高速公路（穩定但報酬相對低），股票基金是省道（有風景但偶有彎道），科技投資是探險小路（刺激但要小心）。全程路線已幫你規劃好！`
  },
  garden: {
    name: '🌱 花園比喻',
    explain: (rec) => `你的投資組合就像一座花園：債券是大樹（穩定遮蔭，佔 ${rec.allocation[0]?.pct}%），股票基金是花叢（美麗且需照顧），科技投資是新種植的種子（需要耐心等待開花）。定期澆水（定期投入）就能看到花園成長！`
  }
};

let recState = {
  loaded: false,
  currentStrategy: 'default',
  trustScore: null
};

function renderRecommendationPage() {
  if (!recState.loaded) {
    return renderRecLoading();
  }
  return renderRecResult();
}

function renderRecLoading() {
  return `
    <div class="npc-dialog animate-fadeIn">
      <img src="IP_ICON/IP_THINKING.png" alt="小雲" class="npc-avatar">
      <div class="npc-bubble">
        <div class="npc-name">NPC 小雲 — 技能鍛造中</div>
        正在為你從投資商品池中挑選最適合的專屬技能組合，請稍等... ⚔️
      </div>
    </div>

    <div class="card rec-loading animate-fadeIn">
      <div class="loading-spinner" style="margin:0 auto;"></div>
      <p class="mt-2" style="font-size:1rem;font-weight:600;">AI 策略引擎運算中</p>
      <div class="loading-steps">
        <div class="loading-step" id="ls1"><span class="step-check">⏳</span> 分析用戶標籤與風險屬性</div>
        <div class="loading-step" id="ls2"><span class="step-check">⏳</span> 匹配投資策略候選</div>
        <div class="loading-step" id="ls3"><span class="step-check">⏳</span> 篩選核准投資商品池</div>
        <div class="loading-step" id="ls4"><span class="step-check">⏳</span> 生成客製化方案</div>
        <div class="loading-step" id="ls5"><span class="step-check">⏳</span> 產出白話說明與風險揭露</div>
      </div>
    </div>
  `;
}

function renderRecResult() {
  const rec = AppState.recommendation;
  if (!rec) return '<p>尚無推薦資料</p>';
  const strategy = ExplainStrategies[recState.currentStrategy];

  return `
    <div class="npc-dialog animate-fadeIn">
      <img src="IP_ICON/IP_HELLO.png" alt="小雲" class="npc-avatar">
      <div class="npc-bubble">
        <div class="npc-name">NPC 小雲 — 你的專屬特殊技能</div>
        根據你的冒險能力（${AppState.profile.riskLabel || '穩健型'}）和人生目標，我從投資商品池中為你打造了這套專屬技能組合！
      </div>
    </div>

    <!-- Risk Disclosure First -->
    <div class="card mb-3 animate-fadeIn" style="border-left:4px solid var(--color-orange);">
      <div class="card-header">
        <h3>⚠️ 風險揭露（固定模板）</h3>
        <span class="tag tag-orange">必讀</span>
      </div>
      <p style="font-size:0.85rem;line-height:1.7;color:var(--text-secondary);">
        <strong>最壞狀況：</strong>${rec.worstCase}<br><br>
        <strong>風險情境：</strong>${rec.riskScenario}
      </p>
    </div>

    <!-- Allocation Chart (Skill Tree) -->
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header">
        <h3>⚔️ 技能組合配置</h3>
        <span class="tag tag-purple">投資商品池</span>
      </div>
      <div class="allocation-chart">
        <div class="donut-container" id="recDonut"></div>
        <div class="allocation-details">
          ${rec.allocation.map(item => `
            <div class="allocation-item">
              <div class="allocation-dot" style="background:${item.color}"></div>
              <span class="allocation-name">${item.name}</span>
              <span class="allocation-pct" style="color:${item.color}">${item.pct}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Rationale -->
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header">
        <h3>💡 目標導向的配置理由</h3>
      </div>
      <p style="font-size:0.88rem;line-height:1.7;color:var(--text-secondary);">
        ${rec.rationale}
      </p>
    </div>

    <!-- Explain Area (Feature C/D) -->
    <div class="card mb-3 explain-area animate-fadeIn">
      <div class="card-header">
        <h3>📚 白話說明</h3>
        <button class="explain-toggle" onclick="switchExplainStrategy()">
          <i class="fas fa-question-circle"></i> 聽不懂？換個方式解釋
        </button>
      </div>
      <div class="explain-card">
        <div class="explain-mode">${strategy.name}</div>
        <p style="font-size:0.88rem;line-height:1.7;">${strategy.explain(rec)}</p>
      </div>
    </div>

    <!-- Trust Thermometer (Feature I) -->
    <div class="trust-section animate-fadeIn">
      <div class="card-header" style="border:none;padding:0;margin-bottom:8px;">
        <h3>🌡️ 信任溫度計 <span class="tag tag-blue">Feature I</span></h3>
      </div>
      <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:8px;">
        這段建議是否讓你感到壓力？透明度是否足夠？
      </p>
      <div class="trust-emojis">
        <span class="trust-emoji ${recState.trustScore === 1 ? 'selected' : ''}" onclick="setTrust(1)">😰</span>
        <span class="trust-emoji ${recState.trustScore === 2 ? 'selected' : ''}" onclick="setTrust(2)">😐</span>
        <span class="trust-emoji ${recState.trustScore === 3 ? 'selected' : ''}" onclick="setTrust(3)">🙂</span>
        <span class="trust-emoji ${recState.trustScore === 4 ? 'selected' : ''}" onclick="setTrust(4)">😊</span>
        <span class="trust-emoji ${recState.trustScore === 5 ? 'selected' : ''}" onclick="setTrust(5)">🤩</span>
      </div>
    </div>

    <!-- Source Reference -->
    <div class="source-ref animate-fadeIn">
      <strong>📎 來源追溯：</strong>此建議基於核准投資商品池（fund_001~fund_005, etf_001），策略版本 v2.1，
      模型推論時間 ${new Date().toLocaleString('zh-TW')}。回答可追溯，非 AI 幻覺。
    </div>

    <!-- Next Step -->
    <div class="text-center mt-3 animate-fadeIn">
      <div class="achievement mb-2">
        <span class="achievement-icon">🏅</span>
        任務完成：專屬特殊技能 — 客製化方案
      </div>
      <button class="btn btn-primary btn-lg" onclick="proceedToExecution()">
        <i class="fas fa-arrow-right"></i> 前往下一任務：攻克據點
      </button>
    </div>
  `;
}

function initRecommendationPage() {
  if (!recState.loaded) {
    startRecLoading();
  } else {
    renderDonutChart('recDonut', AppState.recommendation.allocation);
  }
}

async function startRecLoading() {
  const steps = ['ls1', 'ls2', 'ls3', 'ls4', 'ls5'];
  for (let i = 0; i < steps.length; i++) {
    await new Promise(r => setTimeout(r, 600));
    const el = document.getElementById(steps[i]);
    if (el) {
      el.classList.add('done');
      el.querySelector('.step-check').textContent = '✅';
    }
  }
  await API.generateRecommendation();
  logEvent('strategy_matched');
  logEvent('plain_language_explained');
  recState.loaded = true;
  completeQuest('recommendation');
  unlockQuest('execution');
  navigateTo('recommendation');
  showToast('🎉 專屬技能組合已生成！', 'achievement');
}

let strategyIndex = 0;
const strategyKeys = Object.keys(ExplainStrategies);

function switchExplainStrategy() {
  strategyIndex = (strategyIndex + 1) % strategyKeys.length;
  recState.currentStrategy = strategyKeys[strategyIndex];
  logEvent('explainability_retry_clicked', { strategy: recState.currentStrategy });
  logEvent('translation_failure_logged', { strategy: recState.currentStrategy });
  navigateTo('recommendation');
  showToast(`已切換說明模式：${ExplainStrategies[recState.currentStrategy].name}`, 'info');
}

function setTrust(score) {
  recState.trustScore = score;
  logEvent('trust_thermometer_submitted', { score });
  document.querySelectorAll('.trust-emoji').forEach((e, i) => {
    e.classList.toggle('selected', i + 1 === score);
  });
  const labels = ['', '壓力很大', '有點不安', '還好', '感覺不錯', '非常信任'];
  showToast(`信任回饋：${labels[score]}，感謝你的意見！`, 'success');
}

function proceedToExecution() {
  if (!AppState.riskDisclosureAcknowledged) {
    showRiskDisclosure(() => {
      navigateTo('execution');
    });
  } else {
    navigateTo('execution');
  }
}

/* ================================================
   【攻克據點】一鍵下單 + Pre-trade Check — Feature F
   ================================================ */
let execState = { phase: 'review', checking: false, result: null };

function renderExecutionPage() {
  if (execState.phase === 'review') return renderExecReview();
  if (execState.phase === 'checking') return renderExecChecking();
  if (execState.phase === 'result') return renderExecResult();
  if (execState.phase === 'blocked') return renderExecBlocked();
  return '<p>載入中...</p>';
}

function renderExecReview() {
  const rec = AppState.recommendation;
  if (!rec) return '<div class="empty-state"><div class="empty-icon">⚔️</div><p>請先完成前置任務</p></div>';

  return `
    <div class="npc-dialog animate-fadeIn">
      <img src="IP_ICON/IP_HELLO.png" alt="小曦雲" class="npc-avatar">
      <div class="npc-bubble">
        <div class="npc-name">小曦雲 — 戰鬥指揮官</div>
        冒險者，以下是你的行動清單。確認沒問題後就可以「一鍵出擊」，我會自動完成所有風控檢查！🏰
      </div>
    </div>

    <!-- Action List -->
    <div class="card mb-3 action-list animate-fadeIn">
      <div class="card-header">
        <h3>📋 行動清單 (Action List)</h3>
        <span class="tag tag-gold">單筆 + 定期定額</span>
      </div>

      <div class="action-group">
        <div class="action-group-title">📌 單筆投入（首次）</div>
        ${rec.allocation.map(item => `
          <div class="action-item">
            <div class="action-info">
              <div class="allocation-dot" style="background:${item.color};width:10px;height:10px;border-radius:50%;"></div>
              <span class="action-name">${item.name}</span>
            </div>
            <span class="action-amount">$${(AppState.currentGoal?.monthly * item.pct / 100 || 0).toLocaleString()}</span>
          </div>
        `).join('')}
      </div>

      <div class="action-group">
        <div class="action-group-title">🔄 定期定額（每月）</div>
        ${rec.allocation.map(item => `
          <div class="action-item">
            <div class="action-info">
              <div class="allocation-dot" style="background:${item.color};width:10px;height:10px;border-radius:50%;"></div>
              <span class="action-name">${item.name}</span>
            </div>
            <span class="action-amount">$${(AppState.currentGoal?.monthly * item.pct / 100 || 0).toLocaleString()} / 月</span>
          </div>
        `).join('')}
      </div>

      <div class="mt-2" style="padding:12px;background:rgba(212,168,67,0.08);border-radius:var(--radius-md);font-size:0.85rem;">
        <strong>💰 月投入總額：</strong><span class="text-gold" style="font-size:1.1rem;font-weight:700;">
          $${(AppState.currentGoal?.monthly || 15000).toLocaleString()}
        </span>
      </div>
    </div>

    <!-- Pre-trade Check Reminder -->
    <div class="card mb-3 animate-fadeIn" style="border-left:4px solid var(--color-blue);">
      <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">
        <i class="fas fa-shield-halved" style="color:var(--color-blue);"></i>
        <strong>自動風控保護：</strong>點擊「一鍵出擊」後，系統將自動執行 Pre-trade Check（適配性/額度/風險規範），
        全部通過後才會送出交易指令。若不適配，系統將阻斷交易並提供替代方案。
      </p>
    </div>

    <!-- One-Click Execute -->
    <div class="text-center animate-fadeIn">
      <button class="btn btn-gold btn-lg animate-glow" onclick="executeOrder()" style="min-width:280px;">
        <i class="fas fa-bolt"></i> 一鍵出擊 — 確認執行
      </button>
      <p class="text-muted mt-1" style="font-size:0.72rem;">
        執行前將自動完成 Pre-trade Check（KYC/額度/風險/合規/交易時段）
      </p>
    </div>
  `;
}

function renderExecChecking() {
  return `
    <div class="card pretrade-check animate-fadeIn">
      <div style="font-size:2rem;margin-bottom:12px;">🛡️</div>
      <h2 style="margin-bottom:8px;">Pre-trade Check 執行中</h2>
      <p class="text-muted mb-2">自動風控檢查進行中，請稍候...</p>

      <div class="pretrade-steps" id="pretradeSteps">
        <div class="pretrade-step" id="ptc1">
          <div class="step-status pending"><i class="fas fa-hourglass-half"></i></div>
          <span>KYC 身份驗證</span>
        </div>
        <div class="pretrade-step" id="ptc2">
          <div class="step-status pending"><i class="fas fa-hourglass-half"></i></div>
          <span>風險屬性匹配</span>
        </div>
        <div class="pretrade-step" id="ptc3">
          <div class="step-status pending"><i class="fas fa-hourglass-half"></i></div>
          <span>投資額度確認</span>
        </div>
        <div class="pretrade-step" id="ptc4">
          <div class="step-status pending"><i class="fas fa-hourglass-half"></i></div>
          <span>合規審查</span>
        </div>
        <div class="pretrade-step" id="ptc5">
          <div class="step-status pending"><i class="fas fa-hourglass-half"></i></div>
          <span>交易時段確認</span>
        </div>
      </div>
    </div>
  `;
}

function renderExecResult() {
  return `
    <div class="card text-center animate-fadeIn" style="padding:48px 24px;">
      <div style="font-size:3rem;margin-bottom:16px;">🎉</div>
      <h2 style="color:var(--color-green);margin-bottom:8px;">交易成功！據點攻克完成！</h2>
      <p class="text-muted mb-3">所有風控檢查已通過，交易指令已送出。</p>

      <div class="stats-grid mb-3" style="max-width:400px;margin:0 auto 24px;">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-value">5</div>
          <div class="stat-label">交易商品</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-value">$${(AppState.currentGoal?.monthly || 15000).toLocaleString()}</div>
          <div class="stat-label">月投入總額</div>
        </div>
      </div>

      <div class="achievement mb-3">
        <span class="achievement-icon">🏅</span>
        任務完成：攻克據點 — 一鍵下單
      </div>

      <div class="card mb-2" style="border-left:4px solid var(--color-green);text-align:left;max-width:400px;margin:0 auto 16px;">
        <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.6;">
          ✅ 已完成風險控管<br>
          ✅ 資產水位已更新<br>
          ✅ 追蹤標籤已寫入<br>
          ✅ 24h 監控已啟動
        </p>
      </div>

      <button class="btn btn-primary btn-lg" onclick="navigateTo('dashboard')">
        <i class="fas fa-trophy"></i> 前往戰績回顧
      </button>
    </div>
  `;
}

function renderExecBlocked() {
  return `
    <div class="blocked-area animate-fadeIn">
      <div class="blocked-icon">🚫</div>
      <h2>交易已阻斷</h2>
      <p class="text-muted mb-2">
        系統偵測到您的風險屬性與建議內容不符，為保護您的權益，此筆交易已被阻斷。
      </p>
      <div class="card mb-2" style="border-left:4px solid var(--color-red);text-align:left;">
        <h4 style="font-size:0.88rem;color:var(--color-red);margin-bottom:8px;">不建議原因</h4>
        <ul style="font-size:0.82rem;line-height:1.8;padding-left:20px;color:var(--text-secondary);">
          <li>風險屬性為「激進型」，與目前方案不匹配</li>
          <li>建議降低風險等級或調整投資期程</li>
        </ul>
      </div>
      <div class="card mb-2" style="border-left:4px solid var(--color-blue);text-align:left;">
        <h4 style="font-size:0.88rem;color:var(--color-blue);margin-bottom:8px;">替代方案</h4>
        <ul style="font-size:0.82rem;line-height:1.8;padding-left:20px;color:var(--text-secondary);">
          <li>降低風險：調整為更保守的組合</li>
          <li>延長期程：以較長時間攤平波動</li>
          <li>降低投入：減少每月投入金額</li>
        </ul>
      </div>
      <button class="btn btn-primary referral-btn" onclick="referToHuman()">
        <i class="fas fa-headset"></i> 轉介真人 — 預約理財專員
      </button>
    </div>
  `;
}

function initExecutionPage() {
  if (execState.phase === 'checking') {
    runPretradeAnimation();
  }
}

async function executeOrder() {
  execState.phase = 'checking';
  navigateTo('execution');
  // Animate pre-trade check
  const checks = ['ptc1', 'ptc2', 'ptc3', 'ptc4', 'ptc5'];
  for (let i = 0; i < checks.length; i++) {
    await new Promise(r => setTimeout(r, 500));
    const el = document.getElementById(checks[i]);
    if (!el) continue;
    const statusEl = el.querySelector('.step-status');
    statusEl.className = 'step-status checking';
    statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    await new Promise(r => setTimeout(r, 400));
    statusEl.className = 'step-status passed';
    statusEl.innerHTML = '<i class="fas fa-check"></i>';
  }

  // API check
  const result = await API.pretradeCheck();
  if (result.passed) {
    await API.submitOrder();
    execState.phase = 'result';
    completeQuest('execution');
    unlockQuest('dashboard');
    unlockQuest('share');
    navigateTo('execution');
    showToast('🎉 據點攻克成功！交易已完成', 'achievement', 4000);
  } else {
    execState.phase = 'blocked';
    navigateTo('execution');
    showToast('⚠️ 交易已被風控阻斷', 'warning');
  }
}

function referToHuman() {
  showToast('已為您預約理財專員諮詢，將於 1 個工作天內聯繫', 'info', 4000);
}

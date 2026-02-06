/* ================================================
   【戰績回顧】資產概覽 + Rebalance 提醒 — Feature G
   ================================================ */

function renderDashboardPage() {
  return `
    <div class="npc-dialog animate-fadeIn">
      <img src="IP_ICON/IP_HELLO.png" alt="小雲" class="npc-avatar">
      <div class="npc-bubble">
        <div class="npc-name">小雲 — 戰報官</div>
        冒險者，這是你的冒險戰績！資產水位每日更新，我也會幫你盯著偏移風險。💎
      </div>
    </div>

    <div id="dashboardContent">
      <div class="text-center" style="padding:48px 0;">
        <div class="loading-spinner"></div>
        <p class="text-muted mt-1">正在讀取戰績資料...</p>
      </div>
    </div>
  `;
}

async function initDashboardPage() {
  const data = await API.getDashboardData();
  const el = document.getElementById('dashboardContent');
  if (!el) return;
  el.innerHTML = renderDashboardData(data);

  // Draw charts
  setTimeout(() => {
    drawAssetBarChart(data.holdings);
    animateStats();
  }, 200);
}

function renderDashboardData(data) {
  const totalValue = data.holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalCost = data.holdings.reduce((s, h) => s + h.cost, 0);
  const totalReturn = totalValue - totalCost;
  const returnPct = ((totalReturn / totalCost) * 100).toFixed(1);
  const goalProgress = Math.min(100, ((totalValue / (AppState.currentGoal?.amount || 5000000)) * 100)).toFixed(1);
  const driftAlert = data.driftScore > 5;

  return `
    <!-- KPI Stats -->
    <div class="stats-grid mb-3 animate-fadeIn">
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-value stat-animate">$${totalValue.toLocaleString()}</div>
        <div class="stat-label">資產總值</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">${totalReturn >= 0 ? '📈' : '📉'}</div>
        <div class="stat-value stat-animate" style="color:${totalReturn >= 0 ? 'var(--color-green)' : 'var(--color-red)'}">
          ${totalReturn >= 0 ? '+' : ''}$${totalReturn.toLocaleString()} (${returnPct}%)
        </div>
        <div class="stat-label">累積損益</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-value stat-animate">${goalProgress}%</div>
        <div class="stat-label">目標達成率</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-value stat-animate">${data.months || 6}</div>
        <div class="stat-label">投資月數</div>
      </div>
    </div>

    <!-- Goal Progress Bar -->
    <div class="card mb-3 animate-fadeIn">
      <h3 style="margin-bottom:12px;"><i class="fas fa-flag-checkered"></i> 目標進度</h3>
      <div style="display:flex;justify-content:space-between;font-size:0.82rem;color:var(--text-secondary);margin-bottom:4px;">
        <span>${AppState.currentGoal?.name || '退休金計畫'}</span>
        <span>${goalProgress}% / 目標 $${(AppState.currentGoal?.amount || 5000000).toLocaleString()}</span>
      </div>
      <div class="xp-bar-bg" style="height:20px;">
        <div class="xp-bar-fill" style="width:${goalProgress}%;transition:width 1.5s ease;"></div>
      </div>
      <p class="text-muted mt-1" style="font-size:0.72rem;">
        預估 ${AppState.currentGoal?.years || 25} 年後可達目標（依歷史平均 6% 年化報酬估算）
      </p>
    </div>

    <!-- Drift Alert -->
    ${driftAlert ? `
    <div class="card mb-3 animate-fadeIn" style="border-left:4px solid var(--color-orange);background:rgba(255,152,0,0.06);">
      <h3 style="color:var(--color-orange);margin-bottom:8px;">
        <i class="fas fa-triangle-exclamation"></i> Rebalance 提醒
      </h3>
      <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">
        偵測到投資組合偏移分數 <strong style="color:var(--color-orange);">${data.driftScore}%</strong>，
        已超過 5% 閾值。建議進行 Rebalance 以維持目標配置比例。
      </p>
      <button class="btn btn-primary mt-1" onclick="triggerRebalance()">
        <i class="fas fa-rotate"></i> 自動 Rebalance
      </button>
    </div>
    ` : `
    <div class="card mb-3 animate-fadeIn" style="border-left:4px solid var(--color-green);background:rgba(74,124,89,0.06);">
      <p style="font-size:0.85rem;color:var(--text-secondary);">
        <i class="fas fa-check-circle" style="color:var(--color-green);"></i>
        組合偏移分數為 <strong>${data.driftScore}%</strong>，維持在安全範圍內。
      </p>
    </div>
    `}

    <!-- Asset Bar Chart -->
    <div class="card mb-3 animate-fadeIn">
      <h3 style="margin-bottom:12px;"><i class="fas fa-chart-bar"></i> 持倉分佈</h3>
      <div id="assetBarChart" style="height:200px;"></div>
    </div>

    <!-- Holdings Table -->
    <div class="card mb-3 animate-fadeIn">
      <h3 style="margin-bottom:12px;"><i class="fas fa-wallet"></i> 持倉明細</h3>
      <div class="holdings-table">
        <div class="ht-header">
          <span>標的</span><span>成本</span><span>市值</span><span>損益</span>
        </div>
        ${data.holdings.map(h => {
          const pl = h.currentValue - h.cost;
          const plPct = ((pl / h.cost) * 100).toFixed(1);
          return `
          <div class="ht-row">
            <span style="font-weight:600;">${h.name}</span>
            <span>$${h.cost.toLocaleString()}</span>
            <span>$${h.currentValue.toLocaleString()}</span>
            <span style="color:${pl >= 0 ? 'var(--color-green)' : 'var(--color-red)'};">
              ${pl >= 0 ? '+' : ''}${plPct}%
            </span>
          </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Milestones -->
    <div class="card mb-3 animate-fadeIn">
      <h3 style="margin-bottom:12px;"><i class="fas fa-medal"></i> 冒險里程碑</h3>
      <div class="milestones">
        ${data.milestones.map((m, i) => `
          <div class="milestone-item ${m.achieved ? 'achieved' : ''}">
            <div class="milestone-icon">${m.achieved ? '✅' : '🔒'}</div>
            <div class="milestone-info">
              <div class="milestone-title">${m.title}</div>
              <div class="milestone-desc">${m.desc}</div>
            </div>
            ${m.achieved ? `<span class="tag tag-green" style="font-size:0.7rem;">已達成</span>` : ''}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Monitoring Info -->
    <div class="card animate-fadeIn" style="border-left:4px solid var(--color-blue);background:rgba(74,144,226,0.06);">
      <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.6;">
        <i class="fas fa-satellite-dish" style="color:var(--color-blue);"></i>
        <strong>24 小時自動監控中</strong> — 系統持續追蹤市場變化，若偏移超過閾值、
        空頭警告或達到停利/停損點將自動通知您。
      </p>
    </div>
  `;
}

function drawAssetBarChart(holdings) {
  const container = document.getElementById('assetBarChart');
  if (!container) return;

  const maxVal = Math.max(...holdings.map(h => h.currentValue));
  const colors = ['#d4a843', '#4a7c59', '#4a90d9', '#e8734a', '#9b59b6'];

  container.innerHTML = holdings.map((h, i) => {
    const pct = (h.currentValue / maxVal * 100).toFixed(0);
    return `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
        <div style="width:80px;font-size:0.78rem;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${h.name}
        </div>
        <div style="flex:1;height:24px;background:var(--bg-secondary);border-radius:12px;overflow:hidden;">
          <div class="bar-animate" style="width:0%;height:100%;background:${colors[i % 5]};border-radius:12px;
               transition:width 1s ease ${i * 0.2}s;" data-width="${pct}%"></div>
        </div>
        <div style="width:70px;font-size:0.78rem;font-weight:600;">$${h.currentValue.toLocaleString()}</div>
      </div>
    `;
  }).join('');

  // Animate bars
  requestAnimationFrame(() => {
    container.querySelectorAll('.bar-animate').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  });
}

function animateStats() {
  document.querySelectorAll('.stat-animate').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    setTimeout(() => {
      el.style.transition = 'all 0.5s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 200);
  });
}

function triggerRebalance() {
  showToast('Rebalance 指令已送出，系統將自動調整配置', 'success', 3000);
  logEvent('rebalance_triggered');
}

/* ================================================
   【戰績回顧】資產概覽 + 任務目標 + 里程碑 + 徽章
   Feature G / H — 大幅擴充版
   ================================================ */

function renderDashboardPage() {
  return `
    <div class="npc-dialog animate-fadeIn">
      <img src="IP_ICON/IP_HELLO.png" alt="小曦雲" class="npc-avatar">
      <div class="npc-bubble">
        <div class="npc-name">小曦雲 — 戰報官</div>
        冒險者，這是你的戰績！任務目標和本週挑戰都幫你整理好了，衝就對了 💎
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

  // Draw charts & animations
  setTimeout(() => {
    drawAssetBarChart(data.holdings);
    animateStats();
    animateProgressBars();
  }, 200);
}

function renderDashboardData(data) {
  const milestones = normalizeMilestones(data.milestones);
  const totalValue = data.holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalCost = data.holdings.reduce((s, h) => s + h.cost, 0);
  const totalReturn = totalValue - totalCost;
  const returnPct = ((totalReturn / totalCost) * 100).toFixed(1);
  const driftAlert = data.driftScore > 5;

  return `
    <!-- KPI + Rank Banner with IP Mascot -->
    <div class="dash-rank-banner animate-fadeIn">
      <img src="IP_ICON/IP_ASSET_UP.png" alt="小曦雲" class="npc-avatar-xl dash-mascot-hero">
      <div class="dash-rank-center">
        <div class="dash-rank-info">
          <span class="dash-rank-badge">R${data.rank}</span>
          <span class="dash-rank-name">${data.rankName}</span>
          <span class="dash-rank-stars">${'★'.repeat(data.stars)}${'☆'.repeat(5 - data.stars)}</span>
        </div>
        <div class="dash-rank-greeting">你的冒險旅程正在加速中！💪</div>
      </div>
      <div class="dash-streak-badge">
        <span class="dash-streak-flame">🔥</span>
        <span class="dash-streak-num">${data.streak}</span>
        <span class="dash-streak-label">週連續</span>
      </div>
    </div>

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
        <div class="stat-icon">📅</div>
        <div class="stat-value stat-animate">${data.months || 6} <small style="font-size:0.6em;">個月</small></div>
        <div class="stat-label">投資旅程</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💵</div>
        <div class="stat-value stat-animate">$${(data.monthlyInvest || 15000).toLocaleString()}</div>
        <div class="stat-label">月定期投入</div>
      </div>
    </div>

    <!-- ====== 任務目標 (Quest Goals) ====== -->
    <div class="card mb-3 animate-fadeIn">
      <div class="dash-section-header-with-ip">
        <img src="IP_ICON/IP_KEEPEARN.png" alt="小曦雲" class="npc-avatar-lg">
        <div>
          <h3 class="dash-section-title" style="margin-bottom:4px;"><i class="fas fa-scroll"></i> 任務目標進度</h3>
          <p class="dash-section-subtitle">每個目標都是你距離夢想更近的一步 🚀</p>
        </div>
      </div>
      <div class="dash-quest-goals">
        ${(data.questGoals || []).map(q => renderQuestGoalCard(q)).join('')}
      </div>
    </div>

    <!-- ====== 本週任務 (Weekly Tasks) ====== -->
    <div class="card mb-3 animate-fadeIn">
      <div class="dash-section-header-with-ip">
        <img src="IP_ICON/IP_KEEPCARE.png" alt="小曦雲" class="npc-avatar-lg">
        <div>
          <h3 class="dash-section-title" style="margin-bottom:4px;"><i class="fas fa-tasks"></i> 本週任務</h3>
          <p class="dash-section-subtitle">完成任務賺 XP，升等解鎖更多功能!</p>
        </div>
      </div>
      ${renderWeeklyTasks(data.weeklyTasks || [])}
    </div>

    <!-- Drift Alert / Safety -->
    ${renderDriftSection(data, driftAlert)}

    <!-- Asset Bar Chart -->
    <div class="card mb-3 animate-fadeIn">
      <h3 class="dash-section-title"><i class="fas fa-chart-bar"></i> 持倉分佈</h3>
      <div id="assetBarChart" style="height:200px;"></div>
    </div>

    <!-- Holdings Table -->
    <div class="card mb-3 animate-fadeIn">
      <h3 class="dash-section-title"><i class="fas fa-wallet"></i> 持倉明細</h3>
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

    <!-- ====== 冒險里程碑 (Milestones) ====== -->
    <div class="card mb-3 animate-fadeIn">
      <div class="dash-section-header-with-ip">
        <img src="IP_ICON/IP_THINKING.png" alt="小曦雲" class="npc-avatar-lg">
        <div>
          <h3 class="dash-section-title" style="margin-bottom:4px;"><i class="fas fa-medal"></i> 冒險里程碑</h3>
          <p class="dash-section-subtitle">每一個達成都值得慶祝 🎉</p>
        </div>
      </div>
      <div class="dash-milestone-summary">
        <span class="dms-earned">${milestones.filter(m => m && m.achieved).length}</span>
        <span class="dms-sep">/</span>
        <span class="dms-total">${milestones.length}</span>
        <span class="dms-label">已達成</span>
      </div>
      <div class="milestones">
        ${milestones.map((m, i) => renderDashboardMilestoneItem(m, i)).join('')}
      </div>
    </div>

    <!-- ====== 成就徽章 (Badges) ====== -->
    <div class="card mb-3 animate-fadeIn">
      <div class="dash-section-header-with-ip">
        <img src="IP_ICON/IP_NEW_CHANGE.png" alt="小曦雲" class="npc-avatar-lg">
        <div>
          <h3 class="dash-section-title" style="margin-bottom:4px;"><i class="fas fa-trophy"></i> 成就徽章</h3>
          <p class="dash-section-subtitle">收集徽章，證明你的理財實力!</p>
        </div>
      </div>
      <div class="dash-badges-grid">
        ${(data.badges || []).map(b => renderBadgeItem(b)).join('')}
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

function normalizeMilestones(raw) {
  const list = Array.isArray(raw) ? raw : [];
  const fallback = (typeof DataService !== 'undefined' && typeof DataService.getMilestones === 'function')
    ? DataService.getMilestones()
    : [];

  const normalized = list.map((item, idx) => {
    if (!item || typeof item !== 'object') return fallback[idx] || null;
    const hasTitle = item.title != null || item.name != null;
    return hasTitle ? item : (fallback[idx] || item);
  }).filter(Boolean);

  return normalized.length ? normalized : fallback;
}

/* ====== 任務目標卡片 ====== */
function renderQuestGoalCard(q) {
  const pct = Math.min(100, (q.currentAmount / q.targetAmount * 100)).toFixed(1);
  const remainAmount = q.targetAmount - q.currentAmount;
  const monthsElapsed = Math.max(1, monthDiff(q.startDate, new Date().toISOString().slice(0, 10)));
  const avgMonthly = Math.round(q.currentAmount / monthsElapsed);
  const estMonthsLeft = q.monthlyActual > 0 ? Math.ceil(remainAmount / q.monthlyActual) : '∞';
  const isAhead = q.monthlyActual >= q.monthlyTarget;
  const consecutiveIcon = q.consecutiveMonths >= 6 ? '🔥' : q.consecutiveMonths >= 3 ? '✨' : '💪';

  return `
    <div class="quest-goal-card ${q.priority === 1 ? 'quest-main' : 'quest-side'}">
      <div class="qg-header">
        <span class="qg-icon">${q.icon}</span>
        <div class="qg-title-area">
          <span class="qg-name">${q.name}</span>
          <span class="qg-type-badge ${q.type === '主線任務' ? 'qg-main-badge' : 'qg-side-badge'}">${q.type}</span>
        </div>
        <span class="qg-pct">${pct}%</span>
      </div>
      <div class="qg-progress-bar">
        <div class="qg-progress-fill anim-bar" data-pct="${pct}" style="width:0%;"></div>
        ${pct > 5 ? `<span class="qg-progress-label">${pct}%</span>` : ''}
      </div>
      <div class="qg-details">
        ${q.flavor ? `<div class="qg-flavor">${q.flavor}</div>` : ''}
        <div class="qg-detail-row">
          <span class="qg-detail-label">💎 目前 / 目標</span>
          <span class="qg-detail-value">$${q.currentAmount.toLocaleString()} / $${q.targetAmount.toLocaleString()}</span>
        </div>
        <div class="qg-detail-row">
          <span class="qg-detail-label">📅 預計完成</span>
          <span class="qg-detail-value">${q.years} 年（剩餘約 ${estMonthsLeft} 個月）</span>
        </div>
        <div class="qg-detail-row">
          <span class="qg-detail-label">💵 月投入目標</span>
          <span class="qg-detail-value">$${q.monthlyTarget.toLocaleString()}</span>
        </div>
        <div class="qg-detail-row">
          <span class="qg-detail-label">📊 實際月投入</span>
          <span class="qg-detail-value" style="color:${isAhead ? 'var(--color-green)' : 'var(--color-orange)'}">
            $${q.monthlyActual.toLocaleString()} ${isAhead ? '✅ 達標' : '⚠️ 低於目標'}
          </span>
        </div>
        <div class="qg-detail-row">
          <span class="qg-detail-label">${consecutiveIcon} 連續投入</span>
          <span class="qg-detail-value">${q.consecutiveMonths} 個月${q.consecutiveMonths >= 6 ? ' 🎉 太強了！' : ''}</span>
        </div>
      </div>
    </div>
  `;
}

/* ====== 本週任務 ====== */
function renderWeeklyTasks(tasks) {
  const doneCount = tasks.filter(t => t.done).length;
  const totalXP = tasks.reduce((s, t) => s + t.xp, 0);
  const earnedXP = tasks.filter(t => t.done).reduce((s, t) => s + t.xp, 0);
  const allDone = doneCount === tasks.length;

  return `
    <div class="wt-summary">
      <div class="wt-progress-ring">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="var(--bg-secondary)" stroke-width="5"/>
          <circle cx="32" cy="32" r="28" fill="none" stroke="${allDone ? 'var(--color-gold)' : 'var(--color-blue)'}" 
            stroke-width="5" stroke-dasharray="${(doneCount / tasks.length) * 175.9} 175.9" 
            stroke-linecap="round" transform="rotate(-90 32 32)" style="transition:stroke-dasharray 1s ease;"/>
        </svg>
        <span class="wt-ring-text">${doneCount}/${tasks.length}</span>
      </div>
      <div class="wt-summary-info">
        <div class="wt-summary-title">${allDone ? '🎉 本週任務全部完成！' : `還差 ${tasks.length - doneCount} 項任務`}</div>
        <div class="wt-summary-xp">已獲得 <strong>${earnedXP}</strong> / ${totalXP} XP</div>
      </div>
    </div>
    <div class="wt-list">
      ${tasks.map(t => `
        <div class="wt-item ${t.done ? 'wt-done' : ''}">
          <span class="wt-check">${t.done ? '✅' : '⬜'}</span>
          <span class="wt-icon">${t.icon}</span>
          <span class="wt-name">${t.name}</span>
          <span class="wt-xp-badge">+${t.xp} XP</span>
          ${t.done && t.doneAt ? `<span class="wt-done-date">${t.doneAt.slice(5)}</span>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

/* ====== 偏移提醒區塊 ====== */
function renderDriftSection(data, driftAlert) {
  if (driftAlert) {
    return `
    <div class="card mb-3 animate-fadeIn" style="border-left:4px solid var(--color-orange);background:rgba(255,152,0,0.06);">
      <div style="display:flex;gap:14px;align-items:center;margin-bottom:10px;">
        <img src="IP_ICON/IP_NOTICE.png" alt="小曦雲" class="npc-avatar-lg" style="flex-shrink:0;">
        <div>
          <h3 style="color:var(--color-orange);margin-bottom:4px;">
            <i class="fas fa-triangle-exclamation"></i> Rebalance 提醒
          </h3>
          <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin:0;">
            偵測到投資組合偏移分數 <strong style="color:var(--color-orange);">${data.driftScore}%</strong>，
            已超過 5% 閾值。建議進行 Rebalance 以維持目標配置比例。
          </p>
        </div>
      </div>
      <button class="btn btn-primary mt-1" onclick="triggerRebalance()">
        <i class="fas fa-rotate"></i> 自動 Rebalance
      </button>
    </div>`;
  }
  return `
    <div class="card mb-3 animate-fadeIn" style="border-left:4px solid var(--color-green);background:rgba(74,124,89,0.06);">
      <div style="display:flex;gap:12px;align-items:center;">
        <img src="IP_ICON/IP_GOODNIGHT.png" alt="小曦雲" class="npc-avatar-lg" style="flex-shrink:0;">
        <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">
          <i class="fas fa-check-circle" style="color:var(--color-green);"></i>
          組合偏移分數為 <strong>${data.driftScore}%</strong>，一切安好，穩穩的！😌
        </p>
      </div>
    </div>`;
}

/* ====== 里程碑項目 ====== */
function renderDashboardMilestoneItem(m, idx) {
  if (!m) return '';
  const safeText = (value, fallback = '') => {
    if (value == null) return fallback;
    const text = String(value).trim();
    if (!text || text.toLowerCase() === 'undefined' || text.toLowerCase() === 'null') return fallback;
    return text;
  };
  const title = safeText(m.title ?? m.name, '里程碑');
  const desc = safeText(m.desc ?? m.description, '');
  const iconText = m.icon || title.slice(0, 2);
  if (m.achieved) {
    return `
      <div class="milestone-item achieved" style="animation-delay:${idx * 0.05}s;">
        <div class="milestone-icon earned">${iconText}</div>
        <div class="milestone-info">
          <div class="milestone-title">${title}</div>
          <div class="milestone-desc">${desc}</div>
          <div class="milestone-meta">
            ${m.achievedAt ? `<span class="ms-date">📅 ${m.achievedAt}</span>` : ''}
            ${m.xpReward ? `<span class="ms-xp">+${m.xpReward} XP</span>` : ''}
          </div>
        </div>
        <span class="tag tag-green" style="font-size:0.7rem;">已達成</span>
      </div>`;
  }
  const hasProg = typeof m.progress === 'number' && m.progress > 0;
  return `
    <div class="milestone-item locked-ms" style="animation-delay:${idx * 0.05}s;">
      <div class="milestone-icon locked">${iconText}</div>
      <div class="milestone-info">
        <div class="milestone-title" style="opacity:0.7;">${title}</div>
        <div class="milestone-desc">${desc}</div>
        ${hasProg ? `
        <div class="ms-progress">
          <div class="ms-progress-bg">
            <div class="ms-progress-fill anim-bar" data-pct="${(m.progress * 100).toFixed(0)}" style="width:0%;"></div>
          </div>
          <span class="ms-progress-text">${(m.progress * 100).toFixed(0)}%</span>
        </div>` : ''}
        ${m.hint ? `<div class="ms-hint">💡 ${m.hint}</div>` : ''}
      </div>
      <span class="tag tag-gray" style="font-size:0.7rem;">🔒 未達成</span>
    </div>`;
}

/* ====== 成就徽章 ====== */
function renderBadgeItem(b) {
  return `
    <div class="dash-badge ${b.earned ? 'badge-earned' : 'badge-locked'}" title="${b.desc}">
      <span class="badge-icon">${b.icon}</span>
      <span class="badge-name">${b.name}</span>
      ${!b.earned ? '<span class="badge-lock">🔒</span>' : ''}
    </div>
  `;
}

/* ====== 持倉圖表 ====== */
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

  requestAnimationFrame(() => {
    container.querySelectorAll('.bar-animate').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  });
}

/* ====== 動畫 ====== */
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

function animateProgressBars() {
  document.querySelectorAll('.anim-bar').forEach(bar => {
    const pct = bar.dataset.pct;
    requestAnimationFrame(() => {
      bar.style.transition = 'width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      bar.style.width = pct + '%';
    });
  });
}

/* ====== Helpers ====== */
function monthDiff(d1, d2) {
  const a = new Date(d1), b = new Date(d2);
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

function triggerRebalance() {
  showToast('Rebalance 指令已送出，系統將自動調整配置', 'success', 3000);
  logEvent('rebalance_triggered');
}

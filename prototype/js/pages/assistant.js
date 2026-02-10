/* ================================================
   小㬢雲 AI 助理管理頁 — 記憶 / 排程 / 計畫
   ================================================ */

/* --- Render --- */
function renderAssistantPage() {
  return `
    <div class="npc-dialog" style="margin-bottom:20px;">
      <img src="IP_ICON/IP_KEEPCARE.png" alt="小曦雲" class="npc-avatar">
      <div class="npc-bubble">
        <div class="npc-name">NPC 小曦雲</div>
        這裡可以管理我的記憶、你設定的排程提醒、以及所有目標計畫與里程碑。我會按時叫你回來看戰績！📋
      </div>
    </div>

    <!-- Tab Bar -->
    <div class="assistant-tabs" id="assistantTabs">
      <button class="tab-btn active" data-tab="memory" onclick="switchAssistantTab('memory')">
        <i class="fas fa-brain"></i> 對話記憶
      </button>
      <button class="tab-btn" data-tab="schedules" onclick="switchAssistantTab('schedules')">
        <i class="fas fa-clock"></i> 排程任務
      </button>
      <button class="tab-btn" data-tab="plans" onclick="switchAssistantTab('plans')">
        <i class="fas fa-map"></i> 計畫項目
      </button>
    </div>

    <!-- Tab Contents -->
    <div id="assistantTabContent">
      <div id="tab-memory" class="tab-panel active"></div>
      <div id="tab-schedules" class="tab-panel" style="display:none;"></div>
      <div id="tab-plans" class="tab-panel" style="display:none;"></div>
    </div>
  `;
}

function initAssistantPage() {
  switchAssistantTab('memory');
}

function switchAssistantTab(tab) {
  document.querySelectorAll('#assistantTabs .tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById('tab-' + tab);
  if (panel) panel.style.display = 'block';

  if (tab === 'memory') loadMemoryTab();
  if (tab === 'schedules') loadSchedulesTab();
  if (tab === 'plans') loadPlansTab();
}

/* ========== 記憶（對話記錄）========== */
async function loadMemoryTab() {
  const panel = document.getElementById('tab-memory');
  if (!panel) return;
  panel.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);">載入中...</div>';

  try {
    const userId = AppState?.user?.id || 'demo';
    const resp = await fetch(`/api/assistant/memory?userId=${userId}`);
    const data = await resp.json();
    const msgs = data.messages || [];

    if (msgs.length === 0) {
      panel.innerHTML = `
        <div class="card" style="text-align:center;padding:40px;">
          <div style="font-size:2rem;margin-bottom:12px;">🧠</div>
          <h3 style="margin-bottom:8px;">尚無對話記憶</h3>
          <p style="font-size:0.82rem;color:var(--text-secondary);">與小㬢雲聊天後，對話記錄會自動保存到這裡。</p>
        </div>
      `;
      return;
    }

    panel.innerHTML = `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <h3><i class="fas fa-brain"></i> 對話記憶（${msgs.length} 筆）</h3>
          <button class="btn btn-sm btn-danger" onclick="clearAllMemory()">
            <i class="fas fa-trash"></i> 清除全部
          </button>
        </div>
        <div class="memory-list" id="memoryList">
          ${msgs.map(m => renderMemoryItem(m)).join('')}
        </div>
      </div>
    `;
  } catch (e) {
    panel.innerHTML = '<div class="card" style="color:var(--color-red);">載入失敗：' + e.message + '</div>';
  }
}

function renderMemoryItem(m) {
  const isBot = m.role === 'bot' || m.role === 'assistant';
  const icon = isBot ? '🤖' : '🧑';
  const label = isBot ? '小㬢雲' : '你';
  const time = m.timestamp ? new Date(m.timestamp).toLocaleString('zh-TW') : '';
  const pinCls = m.pinned ? 'tag-gold' : 'tag-blue';
  const pinLabel = m.pinned ? '已釘選' : '釘選';
  const shortText = (m.text || '').length > 120 ? (m.text || '').slice(0, 120) + '…' : (m.text || '');

  return `
    <div class="memory-item" id="mem-${m.id}">
      <div class="memory-header">
        <span>${icon} <strong>${label}</strong></span>
        <span style="font-size:0.7rem;color:var(--text-muted);">${time}</span>
      </div>
      <div class="memory-text">${escapeForHtml(shortText)}</div>
      <div class="memory-actions">
        <button class="tag ${pinCls}" onclick="togglePinMemory('${m.id}', ${!m.pinned})">
          <i class="fas fa-thumbtack"></i> ${pinLabel}
        </button>
        <button class="tag tag-red" onclick="deleteMemory('${m.id}')">
          <i class="fas fa-trash"></i> 刪除
        </button>
      </div>
    </div>
  `;
}

async function togglePinMemory(id, pinned) {
  const userId = AppState?.user?.id || 'demo';
  await fetch(`/api/assistant/memory/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, pinned })
  });
  loadMemoryTab();
}

async function deleteMemory(id) {
  if (!confirm('確定要刪除這筆記錄嗎？')) return;
  const userId = AppState?.user?.id || 'demo';
  await fetch(`/api/assistant/memory/${id}?userId=${userId}`, { method: 'DELETE' });
  const el = document.getElementById('mem-' + id);
  if (el) { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }
  else loadMemoryTab();
}

async function clearAllMemory() {
  if (!confirm('確定要清除所有對話記憶嗎？此操作無法復原。')) return;
  const userId = AppState?.user?.id || 'demo';
  await fetch(`/api/assistant/memory?userId=${userId}`, { method: 'DELETE' });
  showToast('對話記憶已清除', 'info');
  loadMemoryTab();
}

/* ========== 排程任務 ========== */
async function loadSchedulesTab() {
  const panel = document.getElementById('tab-schedules');
  if (!panel) return;
  panel.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);">載入中...</div>';

  try {
    const userId = AppState?.user?.id || 'demo';
    const resp = await fetch(`/api/assistant/schedules?userId=${userId}`);
    const data = await resp.json();
    const list = data.schedules || [];

    panel.innerHTML = `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <h3><i class="fas fa-clock"></i> 排程任務</h3>
          <button class="btn btn-sm btn-primary" onclick="showNewScheduleForm()">
            <i class="fas fa-plus"></i> 新增排程
          </button>
        </div>
        <div id="newScheduleForm" style="display:none;margin-bottom:16px;">
          ${renderNewScheduleForm()}
        </div>
        <div id="schedulesList">
          ${list.length === 0 ? '<p style="text-align:center;color:var(--text-muted);padding:20px;">尚未設定排程</p>' : list.map(s => renderScheduleItem(s)).join('')}
        </div>
      </div>
      <div id="scheduleReportArea"></div>
    `;
  } catch (e) {
    panel.innerHTML = '<div class="card" style="color:var(--color-red);">載入失敗：' + e.message + '</div>';
  }
}

function renderNewScheduleForm() {
  return `
    <div class="card" style="border:2px dashed var(--color-gold);padding:16px;">
      <div class="form-group">
        <label>排程名稱</label>
        <input class="form-input" id="schName" value="每週日戰績回報" placeholder="例：每週日戰績回報">
      </div>
      <div class="form-group">
        <label>說明</label>
        <input class="form-input" id="schDesc" value="每週日早上 9:00，小㬢雲自動產生本週戰績摘要與下週建議" placeholder="">
      </div>
      <div class="form-group">
        <label>排程頻率</label>
        <select class="form-select" id="schCron">
          <option value="0 9 * * 0" selected>每週日 09:00</option>
          <option value="0 9 * * 1">每週一 09:00</option>
          <option value="0 9 * * 5">每週五 09:00</option>
          <option value="0 20 * * 0">每週日 20:00</option>
          <option value="0 9 1 * *">每月 1 號 09:00</option>
        </select>
      </div>
      <div class="form-group">
        <label>排程類型</label>
        <select class="form-select" id="schType">
          <option value="weekly_review" selected>每週戰績回報</option>
          <option value="milestone_check">里程碑進度檢查</option>
          <option value="emotion_checkin">投資心情回報</option>
          <option value="custom">自訂</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button class="btn btn-sm btn-outline" onclick="hideNewScheduleForm()">取消</button>
        <button class="btn btn-sm btn-gold" onclick="createSchedule()">建立排程</button>
      </div>
    </div>
  `;
}

function showNewScheduleForm() {
  const f = document.getElementById('newScheduleForm');
  if (f) f.style.display = 'block';
}
function hideNewScheduleForm() {
  const f = document.getElementById('newScheduleForm');
  if (f) f.style.display = 'none';
}

function renderScheduleItem(s) {
  const statusTag = s.enabled
    ? '<span class="tag tag-green"><i class="fas fa-check"></i> 啟用中</span>'
    : '<span class="tag tag-orange"><i class="fas fa-pause"></i> 已暫停</span>';
  const nextRun = s.nextRun ? new Date(s.nextRun).toLocaleString('zh-TW') : '—';
  const lastRun = s.lastRun ? new Date(s.lastRun).toLocaleString('zh-TW') : '從未執行';
  const typeName = { weekly_review: '📊 每週戰績回報', milestone_check: '🎯 里程碑進度檢查', emotion_checkin: '🌡️ 投資心情回報', custom: '⚙️ 自訂' };

  return `
    <div class="schedule-item" style="padding:16px;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
        <div>
          <strong>${s.name}</strong> ${statusTag}
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">${typeName[s.type] || s.type}</div>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-sm btn-gold" onclick="triggerSchedule('${s.id}')" title="手動觸發">
            <i class="fas fa-play"></i> 立即執行
          </button>
          <button class="btn btn-sm btn-outline" onclick="toggleScheduleEnabled('${s.id}', ${!s.enabled})" title="${s.enabled ? '暫停' : '啟用'}">
            <i class="fas fa-${s.enabled ? 'pause' : 'play'}"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteSchedule('${s.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:8px;">${s.description || ''}</p>
      <div style="display:flex;gap:16px;font-size:0.72rem;color:var(--text-muted);">
        <span>⏰ Cron: <code>${s.cron}</code></span>
        <span>📅 下次執行: ${nextRun}</span>
        <span>🕐 上次執行: ${lastRun}</span>
      </div>
    </div>
  `;
}

async function createSchedule() {
  const userId = AppState?.user?.id || 'demo';
  const body = {
    userId,
    name: document.getElementById('schName')?.value || '新排程',
    description: document.getElementById('schDesc')?.value || '',
    cron: document.getElementById('schCron')?.value || '0 9 * * 0',
    type: document.getElementById('schType')?.value || 'weekly_review'
  };
  await fetch('/api/assistant/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  showToast('排程已建立！', 'success');
  loadSchedulesTab();
}

async function toggleScheduleEnabled(id, enabled) {
  const userId = AppState?.user?.id || 'demo';
  await fetch(`/api/assistant/schedules/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, enabled })
  });
  loadSchedulesTab();
}

async function deleteSchedule(id) {
  if (!confirm('確定要刪除此排程？')) return;
  const userId = AppState?.user?.id || 'demo';
  await fetch(`/api/assistant/schedules/${id}?userId=${userId}`, { method: 'DELETE' });
  showToast('排程已刪除', 'info');
  loadSchedulesTab();
}

async function triggerSchedule(id) {
  const userId = AppState?.user?.id || 'demo';
  const resp = await fetch(`/api/assistant/schedules/${id}/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  const data = await resp.json();
  if (data.report) {
    const area = document.getElementById('scheduleReportArea');
    if (area) {
      area.innerHTML = `
        <div class="card" style="border:2px solid var(--color-gold);animation:fadeIn 0.5s ease;">
          <div class="card-header">
            <h3><i class="fas fa-scroll"></i> 排程回報結果</h3>
            <span style="font-size:0.7rem;color:var(--text-muted);">${data.report.generatedAt ? new Date(data.report.generatedAt).toLocaleString('zh-TW') : ''}</span>
          </div>
          <pre style="white-space:pre-wrap;font-family:var(--font-main);font-size:0.85rem;line-height:1.7;color:var(--text-primary);">${escapeForHtml(data.report.summary)}</pre>
        </div>
      `;
    }
  }
  showToast('排程已手動觸發！', 'success');
  loadSchedulesTab();
}

/* ========== 計畫項目 ========== */
async function loadPlansTab() {
  const panel = document.getElementById('tab-plans');
  if (!panel) return;
  panel.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);">載入中...</div>';

  try {
    const userId = AppState?.user?.id || 'demo';
    const resp = await fetch(`/api/assistant/plans?userId=${userId}`);
    const data = await resp.json();
    const plans = data.plans || [];
    const goals = plans.filter(p => p.category === 'quest_goal');
    const milestones = plans.filter(p => p.category === 'milestone');

    panel.innerHTML = `
      <!-- 目標追蹤 -->
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <h3><i class="fas fa-bullseye"></i> 目標追蹤（${goals.length}）</h3>
          <button class="btn btn-sm btn-primary" onclick="showNewPlanForm()">
            <i class="fas fa-plus"></i> 新增目標
          </button>
        </div>
        <div id="newPlanForm" style="display:none;margin-bottom:16px;">
          ${renderNewPlanForm()}
        </div>
        <div id="goalsList">
          ${goals.length === 0 ? '<p style="text-align:center;color:var(--text-muted);padding:20px;">尚未設定目標</p>' : goals.map(g => renderPlanGoalItem(g)).join('')}
        </div>
      </div>

      <!-- 里程碑 -->
      <div class="card">
        <div class="card-header">
          <h3><i class="fas fa-trophy"></i> 里程碑（${milestones.length}）</h3>
        </div>
        <div class="milestones-grid" id="milestonesList">
          ${milestones.map(m => renderMilestoneItem(m)).join('')}
        </div>
      </div>
    `;
  } catch (e) {
    panel.innerHTML = '<div class="card" style="color:var(--color-red);">載入失敗：' + e.message + '</div>';
  }
}

function renderNewPlanForm() {
  return `
    <div class="card" style="border:2px dashed var(--color-gold);padding:16px;">
      <div class="form-row">
        <div class="form-group">
          <label>目標名稱</label>
          <input class="form-input" id="planName" placeholder="例：出國留學基金">
        </div>
        <div class="form-group">
          <label>目標金額</label>
          <input class="form-input" id="planAmount" type="number" placeholder="500000">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>每月目標</label>
          <input class="form-input" id="planMonthly" type="number" placeholder="10000">
        </div>
        <div class="form-group">
          <label>圖示</label>
          <select class="form-select" id="planIcon">
            <option value="🎯">🎯 目標</option>
            <option value="🏠">🏠 買房</option>
            <option value="🎓">🎓 教育</option>
            <option value="✈️">✈️ 旅行</option>
            <option value="💻">💻 裝備</option>
            <option value="🐱">🐱 毛孩</option>
            <option value="🚗">🚗 交通</option>
            <option value="💰">💰 儲蓄</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>說明</label>
        <input class="form-input" id="planDesc" placeholder="用一句話描述你的目標">
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button class="btn btn-sm btn-outline" onclick="hideNewPlanForm()">取消</button>
        <button class="btn btn-sm btn-gold" onclick="createPlan()">建立目標</button>
      </div>
    </div>
  `;
}

function showNewPlanForm() {
  const f = document.getElementById('newPlanForm');
  if (f) f.style.display = 'block';
}
function hideNewPlanForm() {
  const f = document.getElementById('newPlanForm');
  if (f) f.style.display = 'none';
}

function renderPlanGoalItem(g) {
  const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : (g.progress || 0);
  const statusMap = { active: '進行中', completed: '已達成', paused: '已暫停' };
  const statusColor = { active: 'tag-green', completed: 'tag-gold', paused: 'tag-orange' };

  return `
    <div class="plan-goal-item" style="padding:16px;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <span style="font-size:1.3rem;">${g.icon || '🎯'}</span>
          <strong style="margin-left:8px;">${g.name}</strong>
          <span class="tag ${statusColor[g.status] || 'tag-blue'}" style="margin-left:8px;">${statusMap[g.status] || g.status}</span>
        </div>
        <button class="btn btn-sm btn-danger" style="padding:4px 8px;" onclick="deletePlan('${g.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      <p style="font-size:0.8rem;color:var(--text-secondary);margin:8px 0;">${g.description || ''}</p>
      <div class="progress-bar gold" style="margin-bottom:8px;">
        <div class="progress-fill" style="width:${pct}%;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);">
        <span>${g.currentAmount ? g.currentAmount.toLocaleString() : 0} / ${g.targetAmount ? g.targetAmount.toLocaleString() : '—'} 元（${pct}%）</span>
        <span>每月 ${g.monthlyTarget ? g.monthlyTarget.toLocaleString() : '—'} 元 × ${g.consecutiveMonths || 0} 個月</span>
      </div>
    </div>
  `;
}

function renderMilestoneItem(m) {
  const done = m.achieved || m.status === 'completed';
  const pct = m.progress || (done ? 100 : 0);
  const title = m.name || m.title || '里程碑';
  const desc = m.description || m.desc || '';
  return `
    <div class="milestone-item" style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px dashed var(--border-color);">
      <span style="font-size:1.5rem;opacity:${done ? 1 : 0.4};">${m.icon || '🎯'}</span>
      <div style="flex:1;">
        <strong style="opacity:${done ? 1 : 0.7};">${title}</strong>
        ${done ? '<span class="tag tag-gold" style="margin-left:8px;">已達成</span>' : ''}
        <p style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">${desc}</p>
        ${!done && pct > 0 ? `<div class="progress-bar" style="margin-top:6px;height:6px;"><div class="progress-fill" style="width:${pct}%;"></div></div>
          <span style="font-size:0.68rem;color:var(--text-muted);">${m.hint || ''}</span>` : ''}
        ${done && m.achievedAt ? `<span style="font-size:0.68rem;color:var(--color-gold);">達成於 ${new Date(m.achievedAt).toLocaleDateString('zh-TW')}</span>` : ''}
      </div>
    </div>
  `;
}

async function createPlan() {
  const userId = AppState?.user?.id || 'demo';
  const body = {
    userId,
    category: 'quest_goal',
    name: document.getElementById('planName')?.value || '新目標',
    description: document.getElementById('planDesc')?.value || '',
    icon: document.getElementById('planIcon')?.value || '🎯',
    targetAmount: parseInt(document.getElementById('planAmount')?.value) || 0,
    monthlyTarget: parseInt(document.getElementById('planMonthly')?.value) || 0
  };
  await fetch('/api/assistant/plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  showToast('目標已建立！', 'success');
  loadPlansTab();
}

async function deletePlan(id) {
  if (!confirm('確定要刪除此計畫/目標？')) return;
  const userId = AppState?.user?.id || 'demo';
  await fetch(`/api/assistant/plans/${id}?userId=${userId}`, { method: 'DELETE' });
  showToast('已刪除', 'info');
  loadPlansTab();
}

/* ========== Helper ========== */
function escapeForHtml(text) {
  const d = document.createElement('div');
  d.textContent = text || '';
  return d.innerHTML;
}

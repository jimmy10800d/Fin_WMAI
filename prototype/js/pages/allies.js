/* ================================================
   【盟友中心】Allies Hub — Feature J/K/L/M/N
   邀請/權限、打氣、提醒、共同挑戰、分享導流
   ================================================ */

/* --- Allies State --- */
let alliesState = {
  tab: 'overview',  // overview | invite | encourage | nudge | challenges
  allies: [],
  challenges: [],
  selectedAlly: null
};

/* --- Mock Allies Data (for prototype) --- */
const mockAllies = [
  { allyId: 'ally_001', name: '小美', avatar: '👩', level: 1, joinedAt: '2026-01-15', streak: 6 },
  { allyId: 'ally_002', name: '阿凱', avatar: '👨', level: 2, joinedAt: '2026-01-20', streak: 3 },
  { allyId: 'ally_003', name: '小花', avatar: '🧑', level: 1, joinedAt: '2026-02-01', streak: 1 }
];

const mockChallenges = [
  { id: 'chl_001', name: '連續 4 週完成任務', weeks: 4, status: 'active',
    participants: [
      { name: '我', streak: 3, completed: false },
      { name: '小美', streak: 2, completed: false }
    ]
  }
];

const encourageTemplates = [
  { id: 't1', icon: '💪', text: '繼續保持，你做得很棒！' },
  { id: 't2', icon: '🌟', text: '每一小步都在累積大改變！' },
  { id: 't3', icon: '🎯', text: '這週的任務快完成了，加油！' },
  { id: 't4', icon: '📚', text: '花幾分鐘閱讀風險說明吧～' },
  { id: 't5', icon: '🏆', text: '你的紀律令人佩服，持續下去！' }
];

const nudgePresets = [
  { id: 'n1', text: '完成本週任務', icon: '📋' },
  { id: 'n2', text: '閱讀風險說明', icon: '📖' },
  { id: 'n3', text: '檢視儀表板', icon: '📊' },
  { id: 'n4', text: '提交信任溫度計', icon: '🌡️' }
];

function renderAlliesPage() {
  return `
    <div class="npc-dialog animate-fadeIn">
      <img src="IP_ICON/IP_HELLO.png" alt="小曦雲" class="npc-avatar">
      <div class="npc-bubble">
        <div class="npc-name">小曦雲 — 盟友管理員</div>
        冒險者，一個人走得快，一群人走得遠！邀請盟友互相支持，一起堅持完成目標吧～ 🤝
      </div>
    </div>

    <!-- Allies Tabs -->
    <div class="allies-tabs mb-3 animate-fadeIn">
      <button class="allies-tab ${alliesState.tab === 'overview' ? 'active' : ''}" onclick="switchAlliesTab('overview')">
        <i class="fas fa-users"></i> 盟友總覽
      </button>
      <button class="allies-tab ${alliesState.tab === 'invite' ? 'active' : ''}" onclick="switchAlliesTab('invite')">
        <i class="fas fa-user-plus"></i> 邀請盟友
      </button>
      <button class="allies-tab ${alliesState.tab === 'encourage' ? 'active' : ''}" onclick="switchAlliesTab('encourage')">
        <i class="fas fa-heart"></i> 打氣鼓勵
      </button>
      <button class="allies-tab ${alliesState.tab === 'nudge' ? 'active' : ''}" onclick="switchAlliesTab('nudge')">
        <i class="fas fa-bell"></i> 行為提醒
      </button>
      <button class="allies-tab ${alliesState.tab === 'challenges' ? 'active' : ''}" onclick="switchAlliesTab('challenges')">
        <i class="fas fa-trophy"></i> 共同挑戰
      </button>
    </div>

    <div id="alliesContent">
      ${renderAlliesTabContent(alliesState.tab)}
    </div>
  `;
}

function renderAlliesTabContent(tab) {
  switch(tab) {
    case 'overview': return renderAlliesOverview();
    case 'invite': return renderAlliesInvite();
    case 'encourage': return renderAlliesEncourage();
    case 'nudge': return renderAlliesNudge();
    case 'challenges': return renderAlliesChallenges();
    default: return renderAlliesOverview();
  }
}

/* ========== Overview Tab ========== */
function renderAlliesOverview() {
  const allies = mockAllies;
  return `
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header">
        <h3><i class="fas fa-users"></i> 我的盟友 (${allies.length}/10)</h3>
        <span class="tag tag-gold">Feature J</span>
      </div>
      ${allies.length === 0 ? `
        <div class="empty-state">
          <div style="font-size:3rem;margin-bottom:12px;">🤝</div>
          <p>還沒有盟友，快去邀請朋友加入吧！</p>
          <button class="btn btn-gold mt-2" onclick="switchAlliesTab('invite')">
            <i class="fas fa-user-plus"></i> 邀請盟友
          </button>
        </div>
      ` : `
        <div class="allies-grid">
          ${allies.map(a => `
            <div class="ally-card">
              <div class="ally-avatar">${a.avatar}</div>
              <div class="ally-info">
                <div class="ally-name">${a.name}</div>
                <div class="ally-meta">
                  <span class="tag tag-sm tag-${a.level === 1 ? 'blue' : 'purple'}">Level ${a.level}</span>
                  <span class="ally-streak">🔥 ${a.streak} 週連續</span>
                </div>
              </div>
              <div class="ally-actions">
                <button class="btn btn-sm btn-outline" onclick="setAllyVisibility('${a.allyId}')" title="設定分享等級">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline" onclick="sendEncourageTo('${a.allyId}', '${a.name}')" title="送出鼓勵">
                  <i class="fas fa-heart"></i>
                </button>
                <button class="btn btn-sm btn-outline" style="color:var(--color-orange);" onclick="removeAlly('${a.allyId}', '${a.name}')" title="移除盟友">
                  <i class="fas fa-user-minus"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>

    <!-- Visibility Policy Info -->
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header"><h3><i class="fas fa-shield-halved"></i> 隱私分享等級說明</h3></div>
      <div class="visibility-levels">
        <div class="vis-level">
          <div class="vis-badge vis-l0">L0</div>
          <div>
            <strong>不分享</strong>
            <p>盟友完全看不到此任務卡</p>
          </div>
        </div>
        <div class="vis-level">
          <div class="vis-badge vis-l1">L1</div>
          <div>
            <strong>預設分享（建議）</strong>
            <p>✅ 可見：任務名稱(匿名)、進度%、里程碑、徽章、streak</p>
            <p>❌ 不可見：金額、資產、商品、交易明細</p>
          </div>
        </div>
        <div class="vis-level">
          <div class="vis-badge vis-l2">L2</div>
          <div>
            <strong>進階分享</strong>
            <p>✅ L1 + 本週任務是否完成、下一步任務（文字化）</p>
            <p>❌ 仍不可見：金額/商品/交易</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ========== Invite Tab ========== */
function renderAlliesInvite() {
  return `
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header">
        <h3><i class="fas fa-user-plus"></i> 邀請盟友加入</h3>
        <span class="tag tag-gold">Feature J</span>
      </div>
      <p class="text-muted mb-2" style="font-size:0.85rem;">
        產生邀請連結或 QR Code，讓朋友加入成為你的盟友。盟友可支持你的「行為與情緒」，但看不到金額與交易明細。
      </p>
      <div class="invite-section">
        <div class="invite-qr" id="inviteQR">
          <div class="qr-placeholder" id="qrPlaceholder">
            <i class="fas fa-qrcode" style="font-size:4rem;color:var(--color-gold);"></i>
            <p style="margin-top:8px;">點擊下方按鈕產生邀請碼</p>
          </div>
        </div>
        <button class="btn btn-gold" onclick="generateInvite()" id="btnGenInvite">
          <i class="fas fa-link"></i> 產生邀請連結
        </button>
        <div id="inviteResult" class="hidden mt-2">
          <div class="invite-link-box">
            <input type="text" readonly class="form-input" id="inviteLinkInput" value="">
            <button class="btn btn-outline btn-sm" onclick="copyInviteLink()">
              <i class="fas fa-copy"></i> 複製
            </button>
          </div>
          <div class="invite-share-btns mt-2">
            <button class="btn btn-outline btn-sm" onclick="shareInvite('line')" style="border-color:#06c755;color:#06c755;">
              <i class="fab fa-line"></i> LINE
            </button>
            <button class="btn btn-outline btn-sm" onclick="shareInvite('fb')" style="border-color:#1877f2;color:#1877f2;">
              <i class="fab fa-facebook"></i> Facebook
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Simulate Ally Join -->
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header"><h3><i class="fas fa-flask"></i> 模擬盟友加入（Demo）</h3></div>
      <p class="text-muted mb-2" style="font-size:0.82rem;">為 Prototype 演示：點擊下方按鈕模擬一位新盟友加入</p>
      <button class="btn btn-outline" onclick="simulateAllyJoin()">
        <i class="fas fa-user-check"></i> 模擬盟友加入
      </button>
    </div>
  `;
}

/* ========== Encourage Tab ========== */
function renderAlliesEncourage() {
  return `
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header">
        <h3><i class="fas fa-heart"></i> 送出鼓勵卡</h3>
        <span class="tag tag-gold">Feature K</span>
      </div>
      <p class="text-muted mb-2" style="font-size:0.85rem;">
        選擇安全話術模板或自訂訊息鼓勵盟友。系統會自動檢核內容，確保不含投資建議。
      </p>

      <!-- Select Ally -->
      <div class="form-group mb-2">
        <label><i class="fas fa-user"></i> 選擇盟友</label>
        <select class="form-input" id="encourageAllySelect">
          ${mockAllies.map(a => `<option value="${a.allyId}">${a.avatar} ${a.name}</option>`).join('')}
        </select>
      </div>

      <!-- Templates -->
      <div class="form-group mb-2">
        <label><i class="fas fa-comment-dots"></i> 鼓勵話術模板</label>
        <div class="encourage-templates" id="encourageTemplates">
          ${encourageTemplates.map(t => `
            <button class="enc-template-btn" onclick="selectEncTemplate('${t.id}', '${t.text}')" data-id="${t.id}">
              ${t.icon} ${t.text}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Custom Message -->
      <div class="form-group mb-2">
        <label><i class="fas fa-pencil"></i> 自訂訊息（限 50 字）</label>
        <textarea class="form-input" id="encourageMessage" rows="2" maxlength="50" placeholder="寫下你的鼓勵話語..."></textarea>
        <div class="char-count"><span id="encCharCount">0</span>/50</div>
      </div>

      <!-- Compliance Warning -->
      <div class="compliance-note mb-2">
        <i class="fas fa-exclamation-triangle"></i>
        <span>禁止內容：保證獲利、催促買賣、指定商品/標的。違規將被拒絕送出。</span>
      </div>

      <button class="btn btn-gold" onclick="sendEncourage()">
        <i class="fas fa-paper-plane"></i> 送出鼓勵
      </button>

      <!-- Sent History -->
      <div id="encourageHistory" class="mt-3"></div>
    </div>
  `;
}

/* ========== Nudge Tab ========== */
function renderAlliesNudge() {
  return `
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header">
        <h3><i class="fas fa-bell"></i> 行為提醒設定</h3>
        <span class="tag tag-gold">Feature L</span>
      </div>
      <p class="text-muted mb-2" style="font-size:0.85rem;">
        設定提醒頻率與內容，幫助盟友保持紀律。提醒僅限行為類（完成任務/閱讀/檢視），不涉及買賣指令。
      </p>

      <div class="form-group mb-2">
        <label>選擇盟友</label>
        <select class="form-input" id="nudgeAllySelect">
          ${mockAllies.map(a => `<option value="${a.allyId}">${a.avatar} ${a.name}</option>`).join('')}
        </select>
      </div>

      <div class="form-group mb-2">
        <label>提醒頻率</label>
        <select class="form-input" id="nudgeFrequency">
          <option value="weekly">每週</option>
          <option value="monthly">每月</option>
        </select>
      </div>

      <div class="form-group mb-2">
        <label>提醒時間</label>
        <select class="form-input" id="nudgeTime">
          <option value="09:00">上午 9:00</option>
          <option value="12:00">中午 12:00</option>
          <option value="18:00">下午 6:00</option>
          <option value="21:00">晚上 9:00</option>
        </select>
      </div>

      <div class="form-group mb-2">
        <label>提醒內容（僅限行為提醒）</label>
        <div class="nudge-presets">
          ${nudgePresets.map(n => `
            <label class="nudge-preset-item">
              <input type="radio" name="nudgeContent" value="${n.text}" checked>
              <span>${n.icon} ${n.text}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="compliance-note mb-2">
        <i class="fas fa-exclamation-triangle"></i>
        <span>提醒內容不得包含買賣指令或標的建議，系統會自動檢核。</span>
      </div>

      <button class="btn btn-gold" onclick="createNudge()">
        <i class="fas fa-clock"></i> 建立提醒排程
      </button>

      <!-- Active Nudges -->
      <div class="mt-3" id="activeNudges">
        <h4 style="margin-bottom:8px;"><i class="fas fa-list"></i> 已設定的提醒</h4>
        <div class="nudge-list" id="nudgeList">
          <div class="nudge-item">
            <div class="nudge-info">
              <span class="nudge-target">👩 小美</span>
              <span class="nudge-detail">每週 · 上午 9:00 · 完成本週任務</span>
            </div>
            <button class="btn btn-sm btn-outline" onclick="disableNudge('ndg_sample')" style="color:var(--color-orange);">
              <i class="fas fa-pause"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ========== Challenges Tab ========== */
function renderAlliesChallenges() {
  return `
    <!-- Active Challenges -->
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header">
        <h3><i class="fas fa-trophy"></i> 共同挑戰</h3>
        <span class="tag tag-gold">Feature M</span>
      </div>

      ${mockChallenges.map(ch => `
        <div class="challenge-card ${ch.status}">
          <div class="challenge-header">
            <h4>🎯 ${ch.name}</h4>
            <span class="tag tag-${ch.status === 'active' ? 'green' : 'gold'}">${ch.status === 'active' ? '進行中' : '已完成'}</span>
          </div>
          <div class="challenge-progress">
            ${ch.participants.map(p => `
              <div class="challenge-participant">
                <span class="participant-name">${p.name}</span>
                <div class="streak-bar">
                  <div class="streak-fill" style="width:${(p.streak / ch.weeks) * 100}%"></div>
                </div>
                <span class="participant-streak">${p.streak}/${ch.weeks} 週</span>
                ${p.completed ? '<span class="tag tag-sm tag-gold">✅ 達成</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Create New Challenge -->
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header"><h3><i class="fas fa-plus-circle"></i> 發起新挑戰</h3></div>

      <div class="form-group mb-2">
        <label>挑戰名稱</label>
        <input type="text" class="form-input" id="challengeName" placeholder="例：連續 4 週完成任務" value="連續 4 週完成「本週任務」">
      </div>

      <div class="form-group mb-2">
        <label>挑戰週數</label>
        <select class="form-input" id="challengeWeeks">
          <option value="2">2 週</option>
          <option value="4" selected>4 週</option>
          <option value="8">8 週</option>
          <option value="12">12 週</option>
        </select>
      </div>

      <div class="form-group mb-2">
        <label>邀請盟友參加</label>
        <div class="ally-checkbox-list">
          ${mockAllies.map(a => `
            <label class="ally-check-item">
              <input type="checkbox" value="${a.allyId}" checked> ${a.avatar} ${a.name}
            </label>
          `).join('')}
        </div>
      </div>

      <button class="btn btn-gold" onclick="createChallenge()">
        <i class="fas fa-flag-checkered"></i> 發起挑戰
      </button>
    </div>

    <!-- Streak Visualization -->
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header"><h3><i class="fas fa-fire"></i> 我的 Streak 紀錄</h3></div>
      <div class="streak-calendar" id="streakCalendar">
        ${renderStreakCalendar()}
      </div>
      <div class="streak-stats mt-2">
        <div class="streak-stat">
          <div class="streak-stat-value">🔥 ${AppState.streak || 4}</div>
          <div class="streak-stat-label">目前連續週數</div>
        </div>
        <div class="streak-stat">
          <div class="streak-stat-value">⭐ 8</div>
          <div class="streak-stat-label">最長連續紀錄</div>
        </div>
        <div class="streak-stat">
          <div class="streak-stat-value">📊 85%</div>
          <div class="streak-stat-label">完成率</div>
        </div>
      </div>
    </div>
  `;
}

function renderStreakCalendar() {
  const weeks = 12;
  let html = '<div class="streak-weeks">';
  for (let w = 0; w < weeks; w++) {
    const filled = w < (AppState.streak || 4);
    const current = w === (AppState.streak || 4) - 1;
    html += `<div class="streak-week ${filled ? 'filled' : ''} ${current ? 'current' : ''}">
      <span class="week-num">W${w + 1}</span>
      ${filled ? '✅' : '⬜'}
    </div>`;
  }
  html += '</div>';
  return html;
}

/* ========== Action Handlers ========== */
function switchAlliesTab(tab) {
  alliesState.tab = tab;
  document.querySelectorAll('.allies-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.allies-tab:nth-child(${['overview','invite','encourage','nudge','challenges'].indexOf(tab) + 1})`).classList.add('active');
  document.getElementById('alliesContent').innerHTML = renderAlliesTabContent(tab);
  if (tab === 'encourage') initEncourageTab();
}

function initAlliesPage() {
  if (alliesState.tab === 'encourage') initEncourageTab();
}

function initEncourageTab() {
  const textarea = document.getElementById('encourageMessage');
  const counter = document.getElementById('encCharCount');
  if (textarea && counter) {
    textarea.addEventListener('input', () => {
      counter.textContent = textarea.value.length;
    });
  }
}

function generateInvite() {
  const btn = document.getElementById('btnGenInvite');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 產生中...';

  setTimeout(() => {
    const code = 'INV_' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const link = `https://finwmai.app/join?code=${code}`;

    document.getElementById('inviteLinkInput').value = link;
    document.getElementById('inviteResult').classList.remove('hidden');

    // Simple QR visualization
    const qr = document.getElementById('qrPlaceholder');
    qr.innerHTML = `
      <div style="background:#fff;padding:16px;border-radius:12px;display:inline-block;">
        <div style="width:120px;height:120px;background:repeating-conic-gradient(#333 0% 25%, #fff 0% 50%) 50%/10px 10px;border-radius:4px;"></div>
        <div style="margin-top:8px;font-size:0.72rem;color:#666;">${code}</div>
      </div>
    `;

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-link"></i> 重新產生';
    logEvent('ally_invited', { inviteCode: code });
    showToast('邀請連結已產生！', 'success');
  }, 800);
}

function copyInviteLink() {
  const input = document.getElementById('inviteLinkInput');
  navigator.clipboard?.writeText(input.value);
  showToast('邀請連結已複製！', 'success');
}

function shareInvite(platform) {
  showToast(`已開啟 ${platform === 'line' ? 'LINE' : 'Facebook'} 分享（模擬）`, 'success');
}

function simulateAllyJoin() {
  const names = ['小豪', '阿玲', '大雄', '靜香', '胖虎'];
  const avatars = ['🧑‍💼', '👩‍🎓', '🧑‍🔬', '👩‍💻', '🧑‍🎨'];
  const idx = Math.floor(Math.random() * names.length);
  const newAlly = {
    allyId: 'ally_' + Date.now(),
    name: names[idx],
    avatar: avatars[idx],
    level: 1,
    joinedAt: new Date().toISOString().slice(0, 10),
    streak: 0
  };
  mockAllies.push(newAlly);
  logEvent('ally_relationship_created', { allyId: newAlly.allyId });
  logEvent('ally_joined_from_share', { allyId: newAlly.allyId });
  showToast(`🎉 ${newAlly.name} 已加入成為你的盟友！`, 'achievement');
  switchAlliesTab('overview');
}

function setAllyVisibility(allyId) {
  const ally = mockAllies.find(a => a.allyId === allyId);
  const name = ally ? ally.name : '盟友';
  const currentLevel = ally?.level || 1;
  const newLevel = currentLevel === 2 ? 0 : currentLevel + 1;
  if (ally) ally.level = newLevel;
  const labels = { 0: '不分享 (L0)', 1: '預設分享 (L1)', 2: '進階分享 (L2)' };
  logEvent('ally_visibility_updated', { allyId, level: newLevel });
  showToast(`${name} 的分享等級已設為：${labels[newLevel]}`, 'info');
  document.getElementById('alliesContent').innerHTML = renderAlliesOverview();
}

function removeAlly(allyId, name) {
  const idx = mockAllies.findIndex(a => a.allyId === allyId);
  if (idx >= 0) {
    mockAllies.splice(idx, 1);
    logEvent('ally_removed', { allyId });
    showToast(`已移除盟友：${name}`, 'warning');
    document.getElementById('alliesContent').innerHTML = renderAlliesOverview();
  }
}

function sendEncourageTo(allyId, name) {
  alliesState.selectedAlly = { allyId, name };
  switchAlliesTab('encourage');
  setTimeout(() => {
    const select = document.getElementById('encourageAllySelect');
    if (select) select.value = allyId;
  }, 100);
}

function selectEncTemplate(id, text) {
  const msg = document.getElementById('encourageMessage');
  if (msg) {
    msg.value = text;
    document.getElementById('encCharCount').textContent = text.length;
  }
  document.querySelectorAll('.enc-template-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`.enc-template-btn[data-id="${id}"]`).classList.add('selected');
}

function sendEncourage() {
  const allySelect = document.getElementById('encourageAllySelect');
  const message = document.getElementById('encourageMessage').value.trim();

  if (!message) {
    showToast('請先選擇模板或輸入鼓勵訊息', 'warning');
    return;
  }

  // Client-side banned word check
  const banned = ['保證獲利', '快點買', '快點賣', '趕快買', '趕快賣', '一定賺', '穩賺', '指定商品', '推薦買'];
  const found = banned.find(w => message.includes(w));
  if (found) {
    logEvent('ally_message_rejected', { reason: 'banned_content', keyword: found });
    showToast(`❌ 訊息包含不允許的內容：「${found}」\n請聚焦行為支持`, 'error', 4000);
    return;
  }

  const allyName = allySelect.options[allySelect.selectedIndex].text;
  logEvent('encourage_sent', { allyId: allySelect.value, message });
  showToast(`💝 已送出鼓勵給 ${allyName}！`, 'achievement');

  // Show in history
  const history = document.getElementById('encourageHistory');
  if (history) {
    history.innerHTML = `
      <div class="card" style="border-left:4px solid var(--color-green);">
        <div style="font-size:0.75rem;color:var(--color-green);font-weight:600;">✅ 鼓勵已送出</div>
        <p style="font-size:0.85rem;margin-top:4px;">給 ${allyName}：${message}</p>
        <div style="font-size:0.68rem;color:var(--text-muted);margin-top:4px;">剛剛</div>
      </div>
    ` + history.innerHTML;
  }

  // Clear
  document.getElementById('encourageMessage').value = '';
  document.getElementById('encCharCount').textContent = '0';
}

function createNudge() {
  const ally = document.getElementById('nudgeAllySelect');
  const freq = document.getElementById('nudgeFrequency').value;
  const time = document.getElementById('nudgeTime').value;
  const content = document.querySelector('input[name="nudgeContent"]:checked')?.value || '';

  const allyName = ally.options[ally.selectedIndex].text;
  logEvent('nudge_scheduled', { allyId: ally.value, frequency: freq, time, content });
  showToast(`⏰ 已為 ${allyName} 建立提醒排程`, 'success');

  const list = document.getElementById('nudgeList');
  if (list) {
    list.innerHTML += `
      <div class="nudge-item" style="border-left:3px solid var(--color-green);">
        <div class="nudge-info">
          <span class="nudge-target">${allyName}</span>
          <span class="nudge-detail">${freq === 'weekly' ? '每週' : '每月'} · ${time} · ${content}</span>
        </div>
        <span class="tag tag-sm tag-green">新增</span>
      </div>
    `;
  }
}

function disableNudge(nudgeId) {
  showToast('已停用該提醒', 'info');
}

function createChallenge() {
  const name = document.getElementById('challengeName').value;
  const weeks = parseInt(document.getElementById('challengeWeeks').value);
  const checkedAllies = document.querySelectorAll('.ally-checkbox-list input:checked');
  const allyNames = [];
  checkedAllies.forEach(cb => {
    const a = mockAllies.find(m => m.allyId === cb.value);
    if (a) allyNames.push(a.name);
  });

  if (!name) {
    showToast('請輸入挑戰名稱', 'warning');
    return;
  }

  const newChallenge = {
    id: 'chl_' + Date.now(),
    name,
    weeks,
    status: 'active',
    participants: [
      { name: '我', streak: 0, completed: false },
      ...allyNames.map(n => ({ name: n, streak: 0, completed: false }))
    ]
  };

  mockChallenges.push(newChallenge);
  logEvent('challenge_created', { challengeId: newChallenge.id, weeks, participants: allyNames.length + 1 });
  showToast(`🏆 挑戰「${name}」已發起！邀請了 ${allyNames.length} 位盟友`, 'achievement');
  switchAlliesTab('challenges');
}

/* ================================================
   【冒險日誌】成就分享 — Feature H (share) + Privacy
   ================================================ */

function renderSharePage() {
  return `
    <div class="npc-dialog animate-fadeIn">
      <img src="IP_ICON/IP_HELLO.png" alt="小曦雲" class="npc-avatar">
      <div class="npc-bubble">
        <div class="npc-name">小曦雲 — 日誌官</div>
        冒險者，你的戰績很棒！選擇想分享的成就，系統會自動隱藏敏感資訊，安心分享你的冒險故事吧～ 📖
      </div>
    </div>

    <!-- Achievement Selection -->
    <div class="card mb-3 animate-fadeIn">
      <h3 style="margin-bottom:12px;"><i class="fas fa-award"></i> 選擇成就</h3>
      <div class="share-achievements" id="shareAchievements">
        ${getShareableAchievements().map((a, i) => `
          <label class="share-ach-item" data-idx="${i}">
            <input type="checkbox" class="share-check" value="${i}" ${i === 0 ? 'checked' : ''}>
            <span class="share-ach-icon">${a.icon}</span>
            <span class="share-ach-text">${a.text}</span>
          </label>
        `).join('')}
      </div>
    </div>

    <!-- Share Card Preview -->
    <div class="card mb-3 animate-fadeIn">
      <h3 style="margin-bottom:12px;"><i class="fas fa-image"></i> 分享卡片預覽</h3>
      <div class="share-card-preview" id="shareCardPreview">
        ${renderShareCard()}
      </div>
      <p class="text-muted mt-1" style="font-size:0.72rem;">
        <i class="fas fa-shield-halved"></i> 分享內容已自動移除個人身份資訊（姓名、帳號、金額等），僅顯示成就勳章與百分比。
      </p>
    </div>

    <!-- Scenario Voting (Feature H) -->
    <div class="card mb-3 animate-fadeIn">
      <h3 style="margin-bottom:12px;"><i class="fas fa-lightbulb"></i> 情境投票</h3>
      <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px;">
        你還想看到哪些理財場景？投票讓我們知道！
      </p>
      <div class="scenario-votes" id="scenarioVotes">
        ${getScenarios().map((s, i) => `
          <div class="scenario-vote-item" data-idx="${i}" onclick="voteScenario(${i})">
            <span class="scenario-icon">${s.icon}</span>
            <span class="scenario-text">${s.text}</span>
            <span class="scenario-count" id="voteCount${i}">${s.votes}</span>
            <i class="fas fa-thumbs-up"></i>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Share Buttons -->
    <div class="card mb-3 animate-fadeIn">
      <h3 style="margin-bottom:12px;"><i class="fas fa-share-nodes"></i> 分享到</h3>
      <div class="share-buttons">
        <button class="btn btn-outline share-btn" onclick="shareToChannel('line')" style="border-color:#06c755;color:#06c755;">
          <i class="fab fa-line"></i> LINE
        </button>
        <button class="btn btn-outline share-btn" onclick="shareToChannel('facebook')" style="border-color:#1877f2;color:#1877f2;">
          <i class="fab fa-facebook"></i> Facebook
        </button>
        <button class="btn btn-outline share-btn" onclick="shareToChannel('copy')">
          <i class="fas fa-copy"></i> 複製連結
        </button>
        <button class="btn btn-outline share-btn" onclick="shareToChannel('download')">
          <i class="fas fa-download"></i> 下載圖片
        </button>
      </div>
    </div>

    <!-- Feature N: Share-to-Ally -->
    ${renderShareToAllySection()}
  `;
}

function initSharePage() {
  // Listen for achievement checkbox changes
  document.querySelectorAll('.share-check').forEach(cb => {
    cb.addEventListener('change', updateSharePreview);
  });
}

function getShareableAchievements() {
  const achievements = [
    { icon: '🎯', text: '完成目標設定' },
    { icon: '🛡️', text: '通過風險評估' },
    { icon: '📊', text: '取得客製化方案' },
    { icon: '⚔️', text: '一鍵下單成功' },
    { icon: '🏆', text: '首月定期定額達成' },
    { icon: '💎', text: `R${AppState.rank} ${RANK_NAMES[AppState.rank] || '冒險者'}` },
  ];
  return achievements;
}

function getScenarios() {
  return [
    { icon: '🏠', text: '買房頭期款規劃', votes: 128 },
    { icon: '✈️', text: '環遊世界旅費', votes: 95 },
    { icon: '🎓', text: '子女教育基金', votes: 87 },
    { icon: '🐕', text: '毛小孩醫療基金', votes: 64 },
    { icon: '🚗', text: '換車基金計畫', votes: 52 },
  ];
}

function renderShareCard() {
  const checked = document.querySelectorAll('.share-check:checked');
  const achievements = getShareableAchievements();

  let selectedAchs = [];
  if (checked.length > 0) {
    checked.forEach(cb => {
      const idx = parseInt(cb.value);
      selectedAchs.push(achievements[idx]);
    });
  } else {
    selectedAchs = [achievements[0]];
  }

  return `
    <div class="share-card-inner">
      <div class="share-card-header">
        <img src="IP_ICON/IP_HELLO.png" alt="薪守村" class="share-card-mascot" style="width:40px;height:40px;border-radius:50%;">
        <div>
          <div style="font-weight:700;font-size:1.1rem;">薪守村冒險日誌</div>
          <div style="font-size:0.72rem;color:rgba(255,255,255,0.7);">Fin_WMAI — 我的理財冒險</div>
        </div>
      </div>
      <div class="share-card-stats">
        <div class="share-stat">
          <div class="share-stat-value">R${AppState.rank}</div>
          <div class="share-stat-label">階級</div>
        </div>
        <div class="share-stat">
          <div class="share-stat-value">${Object.values(AppState.questStatus).filter(s => s === 'completed').length}</div>
          <div class="share-stat-label">任務完成</div>
        </div>
        <div class="share-stat">
          <div class="share-stat-value">${AppState.xp}</div>
          <div class="share-stat-label">經驗值</div>
        </div>
      </div>
      <div class="share-card-achievements">
        ${selectedAchs.map(a => `
          <span class="share-ach-badge">${a.icon} ${a.text}</span>
        `).join('')}
      </div>
      <div class="share-card-footer">
        <div style="font-size:0.68rem;color:rgba(255,255,255,0.5);">
          ※ 此卡片不含任何個人身份或帳戶資訊
        </div>
      </div>
    </div>
  `;
}

function updateSharePreview() {
  const preview = document.getElementById('shareCardPreview');
  if (preview) preview.innerHTML = renderShareCard();
}

function voteScenario(idx) {
  const countEl = document.getElementById(`voteCount${idx}`);
  if (!countEl) return;
  const current = parseInt(countEl.textContent);
  countEl.textContent = current + 1;
  countEl.style.transform = 'scale(1.3)';
  setTimeout(() => { countEl.style.transform = 'scale(1)'; }, 200);
  logEvent('scenario_vote_submitted');
  showToast('感謝投票！你的意見非常重要 🙏', 'success');
}

function shareToChannel(channel) {
  const messages = {
    line: '已開啟 LINE 分享（模擬）',
    facebook: '已開啟 Facebook 分享（模擬）',
    copy: '分享連結已複製到剪貼簿！',
    download: '分享卡片圖片下載中...（模擬）'
  };
  showToast(messages[channel] || '分享成功', 'success');
  logEvent('share_card_generated');
}

/** Feature N: Share-to-Ally section */
function renderShareToAllySection() {
  // Check if allies system is unlocked (R3+)
  if (AppState.rank < 3 || AppState.questStatus.allies === 'locked') {
    return `
      <div class="card mb-3 animate-fadeIn" style="opacity:0.6;">
        <h3 style="margin-bottom:8px;">🤝 分享給盟友</h3>
        <p style="font-size:0.82rem;color:var(--text-muted);">
          <i class="fas fa-lock"></i> 升到 R3 後解鎖盟友分享功能
        </p>
      </div>
    `;
  }

  // Mock allies list
  const allies = [
    { id: 'a1', name: '小美', emoji: '👩' },
    { id: 'a2', name: '阿明', emoji: '👨' },
    { id: 'a3', name: '小花', emoji: '🧑' }
  ];

  return `
    <div class="card mb-3 animate-fadeIn share-ally-section">
      <h4><i class="fas fa-handshake"></i> 分享給盟友</h4>
      <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:10px;">
        選擇要分享成就卡片的盟友，他們會收到你的冒險日誌（不含個人資訊）
      </p>
      <div class="ally-checkbox-list">
        ${allies.map(a => `
          <label>
            <input type="checkbox" value="${a.id}" class="share-ally-check">
            <span>${a.emoji}</span>
            <span>${a.name}</span>
          </label>
        `).join('')}
      </div>
      <div style="margin-top:12px;">
        <button class="btn btn-gold btn-sm" onclick="shareToAllies()">
          <i class="fas fa-paper-plane"></i> 發送給盟友
        </button>
      </div>
      <div class="compliance-note">
        <i class="fas fa-info-circle"></i>
        分享卡片已自動去除個人身份與帳戶資訊，盟友僅能看到成就勳章與百分比。
      </div>
    </div>

    <!-- Invite via Share Card -->
    <div class="card mb-3 animate-fadeIn">
      <h3 style="margin-bottom:8px;">📨 分享卡片邀請新盟友</h3>
      <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:10px;">
        你的分享卡片附帶專屬邀請碼，朋友掃描即可加入你的盟友圈
      </p>
      <div class="invite-link-box">
        <input type="text" value="https://finwmai.tw/invite/${Date.now().toString(36)}" readonly id="shareInviteLink">
        <button class="btn btn-outline btn-sm" onclick="copyShareInviteLink()">
          <i class="fas fa-copy"></i>
        </button>
      </div>
    </div>
  `;
}

function shareToAllies() {
  const checked = document.querySelectorAll('.share-ally-check:checked');
  if (checked.length === 0) {
    showToast('請至少選擇一位盟友', 'warning');
    return;
  }
  const names = [];
  checked.forEach(cb => {
    const labelText = cb.parentElement.textContent.trim();
    names.push(labelText);
  });
  logEvent('share_card_generated', { targets: 'allies', count: checked.length });
  showToast(`🎉 已分享成就卡片給 ${checked.length} 位盟友！`, 'success', 3000);
}

function copyShareInviteLink() {
  const input = document.getElementById('shareInviteLink');
  if (input) {
    input.select();
    document.execCommand('copy');
    showToast('邀請連結已複製！', 'success');
  }
}

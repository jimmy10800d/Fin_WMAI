/* ================================================
   【冒險日誌】成就分享 — Feature H (share) + Privacy
   ================================================ */

function renderSharePage() {
  return `
    <div class="npc-dialog animate-fadeIn">
      <img src="IP_ICON/IP_HELLO.png" alt="小雲" class="npc-avatar">
      <div class="npc-bubble">
        <div class="npc-name">小雲 — 日誌官</div>
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
    { icon: '💎', text: `Lv.${AppState.level} 冒險者` },
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
          <div class="share-stat-value">Lv.${AppState.level}</div>
          <div class="share-stat-label">等級</div>
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

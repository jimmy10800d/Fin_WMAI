/* ================================================
   【職業說明NPC】KYC 評估 — Feature B
   ================================================ */
const KYCQuestions = [
  {
    id: 1,
    text: '你有多少投資經驗？',
    options: [
      { label: '完全沒有，我是理財新手', score: 0 },
      { label: '有一點點，買過定存或儲蓄險', score: 1 },
      { label: '中等，有買過基金或股票', score: 2 },
      { label: '豐富，多種金融商品都有操作過', score: 3 },
      { label: '非常豐富，我會使用衍生性商品', score: 4 }
    ]
  },
  {
    id: 2,
    text: '如果你的投資在一個月內下跌 20%，你會？',
    options: [
      { label: '非常焦慮，馬上全部賣掉', score: 0 },
      { label: '有點擔心，會賣掉一部分', score: 1 },
      { label: '有點不安，但會繼續觀望', score: 2 },
      { label: '保持冷靜，這是正常波動', score: 3 },
      { label: '趁機加碼買進！', score: 4 }
    ]
  },
  {
    id: 3,
    text: '你期望的年化報酬率大約是多少？',
    options: [
      { label: '2~3%，比定存好一點就好', score: 0 },
      { label: '4~6%，穩穩成長就滿足了', score: 1 },
      { label: '7~10%，願意承受一些波動', score: 2 },
      { label: '10~15%，追求較高回報', score: 3 },
      { label: '15% 以上，我能接受高風險', score: 4 }
    ]
  },
  {
    id: 4,
    text: '你的收入穩定度如何？',
    options: [
      { label: '非常不穩定（自由業/兼職）', score: 0 },
      { label: '還算穩定，但偶有變動', score: 1 },
      { label: '穩定的月薪收入', score: 2 },
      { label: '穩定月薪加上年終獎金', score: 3 },
      { label: '多元且穩定的收入來源', score: 4 }
    ]
  },
  {
    id: 5,
    text: '你目前有多少個月的緊急預備金？',
    options: [
      { label: '完全沒有', score: 0 },
      { label: '不到 3 個月', score: 1 },
      { label: '3~6 個月', score: 2 },
      { label: '6~12 個月', score: 3 },
      { label: '超過 12 個月', score: 4 }
    ]
  }
];

let profileState = { currentQ: 0, answers: [], completed: false };

function renderProfilePage() {
  if (profileState.completed) return renderProfileResult();

  const q = KYCQuestions[profileState.currentQ];
  const progress = ((profileState.currentQ) / KYCQuestions.length * 100).toFixed(0);

  return `
    <!-- NPC Intro -->
    <div class="npc-dialog animate-fadeIn">
      <img src="IP_ICON/IP_THINKING.png" alt="小雲" class="npc-avatar">
      <div class="npc-bubble">
        <div class="npc-name">職業說明 NPC — 小雲</div>
        在幫你打造專屬裝備之前，我需要先了解你的冒險能力！回答以下 ${KYCQuestions.length} 個問題，我就能判斷最適合你的職業分類 🛡️
      </div>
    </div>

    <!-- Progress -->
    <div class="card mb-3 animate-fadeIn kyc-progress-wrap">
      <div class="flex justify-between items-center mb-1">
        <span style="font-size:0.82rem;font-weight:600;">能力評估進度</span>
        <span style="font-size:0.82rem;color:var(--color-gold);font-weight:700;">${profileState.currentQ + 1} / ${KYCQuestions.length}</span>
      </div>
      <div class="progress-bar gold">
        <div class="progress-fill" style="width:${progress}%"></div>
      </div>
    </div>

    <!-- Question Card -->
    <div class="card kyc-question-card animate-fadeIn">
      <div class="kyc-question-num">問題 ${q.id} / ${KYCQuestions.length}</div>
      <div class="kyc-question-text">${q.text}</div>
      <div class="kyc-options">
        ${q.options.map((opt, i) => `
          <div class="kyc-option" onclick="selectKYCAnswer(${i}, ${opt.score})">
            ${opt.label}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderProfileResult() {
  const p = AppState.profile;
  const scorePct = (p.riskScore / (KYCQuestions.length * 4) * 100).toFixed(0);
  const gradeColors = { C1: '#4CAF50', C2: '#8BC34A', C3: '#FFEB3B', C4: '#FF9800', C5: '#f44336' };
  const color = gradeColors[p.riskGrade] || '#999';

  return `
    <div class="npc-dialog animate-fadeIn">
      <img src="IP_ICON/IP_HELLO.png" alt="小雲" class="npc-avatar">
      <div class="npc-bubble">
        <div class="npc-name">職業說明 NPC — 小雲</div>
        評估完成！根據你的回答，我已經判定你的冒險職業分類了 ✨
      </div>
    </div>

    <!-- Risk Meter -->
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header">
        <h3>🛡️ 風險屬性評估結果</h3>
        <span class="tag" style="background:${color}20;color:${color};">${p.riskGrade}</span>
      </div>
      <div class="risk-meter">
        <div class="risk-meter-bar">
          <div class="risk-meter-pointer" style="left:${scorePct}%"></div>
        </div>
        <div class="risk-meter-labels">
          <span>保守型</span><span>穩健型</span><span>平衡型</span><span>積極型</span><span>激進型</span>
        </div>
      </div>
      <div class="risk-grade-display" style="color:${color};">
        ${p.riskLabel || '穩健型冒險家'}
      </div>
      <p class="text-center text-muted mt-1" style="font-size:0.82rem;">
        風險分數：${p.riskScore} / ${KYCQuestions.length * 4}　|　風險等級：${p.riskGrade}
      </p>
    </div>

    <!-- Gap Analysis -->
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header">
        <h3>📊 目標差距分析</h3>
      </div>
      <div class="gap-analysis">
        <p style="font-size:0.85rem;margin-bottom:12px;">
          根據你的目標金額與投入能力，目前存在一定差距。以下是幾個可能的調整方向：
        </p>
        <div class="gap-options">
          <div class="gap-option" onclick="selectGapOption('extend')">
            <div class="gap-icon">⏳</div>
            <div class="gap-label">延長期程</div>
            <div class="gap-desc">多給自己一點時間</div>
          </div>
          <div class="gap-option" onclick="selectGapOption('increase')">
            <div class="gap-icon">💰</div>
            <div class="gap-label">加碼投入</div>
            <div class="gap-desc">每月多投入一些</div>
          </div>
          <div class="gap-option" onclick="selectGapOption('consult')">
            <div class="gap-icon">👤</div>
            <div class="gap-label">轉介理專</div>
            <div class="gap-desc">專人諮詢服務</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Next Step -->
    <div class="text-center mt-2 animate-fadeIn">
      <div class="achievement mb-2">
        <span class="achievement-icon">🏅</span>
        任務完成：職業說明 NPC — KYC 評估
      </div>
      <button class="btn btn-primary btn-lg" onclick="navigateTo('recommendation')">
        <i class="fas fa-arrow-right"></i> 前往下一任務：專屬特殊技能
      </button>
    </div>
  `;
}

function initProfilePage() {
  // Reset if not completed
}

function selectKYCAnswer(index, score) {
  // Highlight selected
  document.querySelectorAll('.kyc-option').forEach((o, i) => {
    o.classList.toggle('selected', i === index);
  });
  // Store and advance after brief delay
  setTimeout(() => {
    profileState.answers.push(score);
    profileState.currentQ++;
    if (profileState.currentQ >= KYCQuestions.length) {
      // Submit KYC
      submitKYC();
    } else {
      navigateTo('profile');
    }
  }, 400);
}

async function submitKYC() {
  profileState.completed = true;
  const result = await API.submitKYC(profileState.answers);
  if (AppState.user) AppState.user.class = result.riskLabel;
  completeQuest('profile');
  unlockQuest('recommendation');
  navigateTo('profile');
  showToast('🛡️ 職業分類完成！你是：' + result.riskLabel, 'achievement', 4000);
}

function selectGapOption(option) {
  const labels = { extend: '延長期程', increase: '加碼投入', consult: '轉介理專' };
  showToast(`已選擇：${labels[option]}`, 'info');
  document.querySelectorAll('.gap-option').forEach(o => o.style.borderColor = '');
  event.currentTarget.style.borderColor = 'var(--color-gold)';
}

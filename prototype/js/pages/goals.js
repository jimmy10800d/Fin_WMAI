/* ================================================
   【初心者】目標設定 — Feature A
   ================================================ */
const GoalTypes = [
  { id: 'retirement', emoji: '🏖️', name: '退休安養', hint: '60 歲後的悠閒時光' },
  { id: 'house', emoji: '🏠', name: '購屋基金', hint: '買下人生第一間房' },
  { id: 'education', emoji: '🎓', name: '教育基金', hint: '為自己或孩子學習投資' },
  { id: 'nomad', emoji: '🌍', name: '數位遊牧', hint: '邊工作邊環遊世界' },
  { id: 'pet', emoji: '🐾', name: '毛孩養老', hint: '給毛小孩最好的照顧' },
  { id: 'car', emoji: '🚗', name: '人生第一台車', hint: '存下買車的第一桶金' },
  { id: 'wedding', emoji: '💍', name: '婚禮基金', hint: '夢想中的完美婚禮' },
  { id: 'custom', emoji: '✨', name: '自訂目標', hint: '寫下你的獨特夢想' }
];

let goalsState = { step: 1, selectedType: null };

function renderGoalsPage() {
  return `
    <!-- NPC Intro -->
    <div class="npc-dialog animate-fadeIn">
      <img src="IP_ICON/IP_HELLO.png" alt="小曦雲" class="npc-avatar">
      <div class="npc-bubble">
        <div class="npc-name">嚮導 小曦雲</div>
        冒險者，每段偉大的旅程都從一個目標開始！告訴我，你心中最想達成的人生目標是什麼呢？🌟
      </div>
    </div>

    <!-- Mission Checklist -->
    <div class="card mb-3 animate-fadeIn">
      <div class="card-header">
        <h3>📋 任務清單 — 初心者目標設定</h3>
        <span class="tag tag-gold">Feature A</span>
      </div>
      <ul class="mission-checklist">
        <li>
          <span class="check-icon ${goalsState.step > 1 ? 'done' : 'active'}">
            ${goalsState.step > 1 ? '<i class="fas fa-check"></i>' : '1'}
          </span>
          選擇生活目標類型
        </li>
        <li>
          <span class="check-icon ${goalsState.step > 2 ? 'done' : goalsState.step === 2 ? 'active' : 'pending'}">
            ${goalsState.step > 2 ? '<i class="fas fa-check"></i>' : '2'}
          </span>
          填寫目標細節（金額、期限）
        </li>
        <li>
          <span class="check-icon ${goalsState.step > 3 ? 'done' : goalsState.step === 3 ? 'active' : 'pending'}">
            ${goalsState.step > 3 ? '<i class="fas fa-check"></i>' : '3'}
          </span>
          確認目標並啟動語意轉換
        </li>
      </ul>
    </div>

    <!-- Step 1: Select Goal Type -->
    <div id="goalStep1" class="${goalsState.step === 1 ? '' : 'hidden'}">
      <div class="card animate-fadeIn">
        <div class="card-header"><h3>🎯 選擇你的目標類型</h3></div>
        <div class="goal-types-grid" id="goalTypesGrid">
          ${GoalTypes.map(g => `
            <div class="goal-type-card ${goalsState.selectedType === g.id ? 'selected' : ''}" 
                 onclick="selectGoalType('${g.id}')">
              <div class="goal-emoji">${g.emoji}</div>
              <div class="goal-name">${g.name}</div>
              <div class="goal-hint">${g.hint}</div>
            </div>
          `).join('')}
        </div>
        <div class="mt-2 text-center">
          <button class="btn btn-gold" onclick="goGoalStep(2)" id="btnGoalNext1" disabled>
            <i class="fas fa-arrow-right"></i> 下一步：填寫目標細節
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Goal Details -->
    <div id="goalStep2" class="${goalsState.step === 2 ? '' : 'hidden'}">
      <div class="card animate-fadeIn">
        <div class="card-header"><h3>📝 目標細節</h3></div>
        <div class="goal-detail-form">
          <div class="form-row">
            <div class="form-group">
              <label>目標金額（萬元）</label>
              <input type="number" class="form-input" id="goalAmount" value="300" min="10" max="10000">
            </div>
            <div class="form-group">
              <label>預計達成年限（年）</label>
              <input type="number" class="form-input" id="goalYears" value="10" min="1" max="40">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>每月可投入金額（元）</label>
              <input type="number" class="form-input" id="goalMonthly" value="15000" min="1000" max="500000" step="1000">
            </div>
            <div class="form-group">
              <label>目標描述（選填）</label>
              <input type="text" class="form-input" id="goalDesc" placeholder="例：10年後在新北買一間30坪的房子">
            </div>
          </div>
        </div>

        <!-- Goal Preview -->
        <div class="goal-preview" id="goalPreview">
          <h4>🔮 目標預覽</h4>
          <div class="preview-stats" id="previewStats">
            <div class="preview-stat">
              <span class="label">目標金額</span>
              <span class="value" id="pvAmount">300 萬</span>
            </div>
            <div class="preview-stat">
              <span class="label">達成期限</span>
              <span class="value" id="pvYears">10 年</span>
            </div>
            <div class="preview-stat">
              <span class="label">月投入</span>
              <span class="value" id="pvMonthly">$15,000</span>
            </div>
            <div class="preview-stat">
              <span class="label">預估未來值 (6%)</span>
              <span class="value" id="pvFuture">—</span>
            </div>
          </div>
        </div>

        <div class="mt-2 flex gap-2" style="justify-content:space-between;">
          <button class="btn btn-outline" onclick="goGoalStep(1)">
            <i class="fas fa-arrow-left"></i> 上一步
          </button>
          <button class="btn btn-gold" onclick="goGoalStep(3)">
            <i class="fas fa-arrow-right"></i> 確認目標
          </button>
        </div>
        <!-- Fuzzy Warning Area (Feature A) -->
        <div id="goalFuzzyWarning" class="hidden"></div>
      </div>
    </div>

    <!-- Step 3: Confirm & Transform -->
    <div id="goalStep3" class="${goalsState.step === 3 ? '' : 'hidden'}">
      <div class="card animate-fadeIn text-center" style="padding:40px;">
        <div style="font-size:3rem;margin-bottom:12px;">🎉</div>
        <h2 style="margin-bottom:8px;">目標已設定！</h2>
        <p class="text-muted mb-2">AI 策略引擎正在進行語意轉換，把你的夢想轉成可計算參數...</p>
        <div class="loading-spinner" style="margin:16px auto;" id="goalSpinner"></div>
        <div id="goalTransformResult" class="hidden">
          <div class="achievement mt-2">
            <span class="achievement-icon">🏅</span>
            任務完成：初心者 — 目標設定
          </div>
          <div class="mt-2">
            <button class="btn btn-primary" onclick="navigateTo('profile')">
              <i class="fas fa-arrow-right"></i> 前往下一個任務：職業說明 NPC
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Feature H: Scenario Submit -->
    <div class="scenario-section mt-3 animate-fadeIn">
      <div class="card-header" style="border:none;padding:0;margin-bottom:8px;">
        <h3>💡 理想人生標籤共創 <span class="tag tag-purple">Feature H</span></h3>
      </div>
      <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:12px;">
        沒有看到你想要的目標類型？新增或投票你在意的生活場景！
      </p>
      <div class="flex gap-2">
        <input type="text" class="form-input" id="newScenario" placeholder="例：寵物醫療基金、Gap Year 探索基金..." style="flex:1;">
        <button class="btn btn-outline btn-sm" onclick="submitScenario()">
          <i class="fas fa-plus"></i> 提案
        </button>
      </div>
    </div>
  `;
}

function initGoalsPage() {
  updateGoalPreview();
  // Add input listeners for preview update
  ['goalAmount', 'goalYears', 'goalMonthly'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateGoalPreview);
  });
}

function selectGoalType(typeId) {
  goalsState.selectedType = typeId;
  document.querySelectorAll('.goal-type-card').forEach(c => {
    c.classList.toggle('selected', c.onclick.toString().includes(typeId));
  });
  const btn = document.getElementById('btnGoalNext1');
  if (btn) btn.disabled = false;
  // Re-render to update selection state
  document.querySelectorAll('.goal-type-card').forEach(c => c.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
}

function goGoalStep(step) {
  if (step === 2 && !goalsState.selectedType) return;
  goalsState.step = step;
  ['goalStep1', 'goalStep2', 'goalStep3'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', i + 1 !== step);
  });
  if (step === 2) updateGoalPreview();
  if (step === 3) processGoalSubmit();
  // Update mission checklist
  navigateTo('goals');
}

function updateGoalPreview() {
  const amount = parseFloat(document.getElementById('goalAmount')?.value) || 300;
  const years = parseFloat(document.getElementById('goalYears')?.value) || 10;
  const monthly = parseFloat(document.getElementById('goalMonthly')?.value) || 15000;
  // Future value with 6% annual return
  const r = 0.06 / 12;
  const n = years * 12;
  const fv = monthly * ((Math.pow(1 + r, n) - 1) / r);
  const pvAmount = document.getElementById('pvAmount');
  const pvYears = document.getElementById('pvYears');
  const pvMonthly = document.getElementById('pvMonthly');
  const pvFuture = document.getElementById('pvFuture');
  if (pvAmount) pvAmount.textContent = amount + ' 萬';
  if (pvYears) pvYears.textContent = years + ' 年';
  if (pvMonthly) pvMonthly.textContent = '$' + monthly.toLocaleString();
  if (pvFuture) pvFuture.textContent = (fv / 10000).toFixed(0) + ' 萬';
}

async function processGoalSubmit() {
  const goalData = {
    type: goalsState.selectedType,
    amount: parseFloat(document.getElementById('goalAmount')?.value) * 10000,
    years: parseFloat(document.getElementById('goalYears')?.value),
    monthly: parseFloat(document.getElementById('goalMonthly')?.value),
    description: document.getElementById('goalDesc')?.value || ''
  };

  // --- Feature A: Fuzzy input detection ---
  if (isFuzzyInput(goalData)) {
    showFuzzyWarning(goalData);
    return;
  }

  await API.createGoal(goalData);
  await API.semanticTransform(goalData.description);
  // Show result
  const spinner = document.getElementById('goalSpinner');
  const result = document.getElementById('goalTransformResult');
  if (spinner) spinner.style.display = 'none';
  if (result) result.classList.remove('hidden');
  completeQuest('goals');
  unlockQuest('profile');
  showToast('🎉 初心者任務完成！下一站：職業說明 NPC', 'achievement', 4000);
}

/** Feature A — detect vague / fuzzy goal input */
function isFuzzyInput(goalData) {
  // Fuzzy patterns: too vague descriptions, unrealistic amounts
  const amount = goalData.amount;
  const years = goalData.years;
  const monthly = goalData.monthly;
  const desc = (goalData.description || '').trim();

  // Vague keywords
  const vaguePatterns = ['不知道', '隨便', '都可以', '不確定', '再看看', 'idk', '...'];
  const isVagueDesc = vaguePatterns.some(p => desc.toLowerCase().includes(p));

  // Unrealistic: amount 0 or description is empty when custom goal
  const isEmptyCustom = goalData.type === 'custom' && desc.length < 3;

  // Amount is NaN or 0
  const isInvalidAmount = isNaN(amount) || amount <= 0;

  // Monthly investment > amount (payoff in < 1 month?)
  const isOverMonthly = monthly * 12 * years > amount * 5;

  goalsState.fuzzyReason = isVagueDesc ? 'vague' : isEmptyCustom ? 'empty_custom' : isInvalidAmount ? 'invalid_amount' : null;

  return isVagueDesc || isEmptyCustom || isInvalidAmount;
}

/** Show guided re-input UI for fuzzy input */
function showFuzzyWarning(goalData) {
  logEvent('semantic_transform_failed', { reason: goalsState.fuzzyReason, rawInput: goalData.description });
  goalsState.step = 2;

  const warningEl = document.getElementById('goalFuzzyWarning');
  if (warningEl) {
    warningEl.innerHTML = `
      <div class="fuzzy-warning animate-fadeIn">
        <p>
          <span class="warning-icon">⚠️</span>
          <strong>小曦雲提醒：</strong>你的目標描述有點模糊，讓我幫你更具體一些吧！
        </p>
        <p style="margin-top:8px;">試試看這些範例：</p>
        <div class="fuzzy-examples">
          <button class="fuzzy-example-btn" onclick="fillFuzzyExample('10年後在新北買一間30坪的房子')">🏠 10年買房30坪</button>
          <button class="fuzzy-example-btn" onclick="fillFuzzyExample('60歲退休後每月有3萬元生活費')">🏖️ 60歲退休月領3萬</button>
          <button class="fuzzy-example-btn" onclick="fillFuzzyExample('3年內存到100萬出國留學')">🎓 3年存100萬留學</button>
          <button class="fuzzy-example-btn" onclick="fillFuzzyExample('5年存50萬當寵物醫療基金')">🐾 5年存50萬毛孩基金</button>
        </div>
      </div>
    `;
    warningEl.classList.remove('hidden');
  }

  showToast('目標描述有點模糊，請參考範例重新填寫 🔄', 'warning', 4000);
  navigateTo('goals');
  goGoalStep(2);
}

/** Fill a fuzzy example into the description field */
function fillFuzzyExample(text) {
  const descInput = document.getElementById('goalDesc');
  if (descInput) {
    descInput.value = text;
    descInput.focus();
  }
  const warningEl = document.getElementById('goalFuzzyWarning');
  if (warningEl) warningEl.classList.add('hidden');
  showToast('已填入範例，你可以再修改後送出 ✏️', 'info');
}

function submitScenario() {
  const input = document.getElementById('newScenario');
  const value = input?.value?.trim();
  if (!value) return;
  showToast(`感謝提案！「${value}」已記錄`, 'success');
  if (input) input.value = '';
  logEvent('scenario_submitted', { scene: value });
}

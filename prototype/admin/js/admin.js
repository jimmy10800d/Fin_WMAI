/* ================================================
   Admin Panel — 公會管理所 JS
   ================================================ */

function adminNav(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const active = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (active) active.classList.add('active');

  const title = document.getElementById('adminPageTitle');
  const content = document.getElementById('adminContent');

  const pages = {
    overview: { title: '總覽儀表板', render: renderOverview },
    knowledge: { title: '知識庫管理', render: renderKnowledge },
    compliance: { title: '合規控管', render: renderCompliance },
    users: { title: '冒險者管理', render: renderUsers },
    events: { title: '事件追蹤', render: renderEvents },
    finops: { title: 'FinOps 成本監控', render: renderFinops },
    scenarios: { title: '情境管理', render: renderScenarios },
    allies: { title: '盟友系統管理', render: renderAlliesAdmin },
    leveling: { title: '等級系統總覽', render: renderLevelingAdmin },
  };

  const p = pages[page];
  if (p && title && content) {
    title.textContent = p.title;
    content.innerHTML = p.render();
  }
}

function adminLogout() {
  sessionStorage.removeItem('adminAuth');
  window.location.href = 'login.html';
}

/* ---- FinOps ---- */
const FinopsDB = {
  billingMonth: '2026-02',
  budget: 12000,
  monthSpend: 6840,
  forecast: 10350,
  usage: [
    { model: 'llama3.1:8b', provider: 'Ollama', tokens: 182400, cost: 1280, trend: 'up' },
    { model: 'gpt-4.1-mini', provider: 'Azure OpenAI', tokens: 62400, cost: 1860, trend: 'down' },
    { model: 'embedding-v2', provider: 'Azure OpenAI', tokens: 980000, cost: 720, trend: 'down' },
    { model: 'rerank-v1', provider: 'Self-host', tokens: 210000, cost: 410, trend: 'up' },
  ],
  dailyCost: [
    { date: '02/04', cost: 820 },
    { date: '02/05', cost: 910 },
    { date: '02/06', cost: 760 },
    { date: '02/07', cost: 1020 },
    { date: '02/08', cost: 980 },
    { date: '02/09', cost: 1180 },
    { date: '02/10', cost: 1170 },
  ],
  alerts: [
    { level: 'warning', msg: '本月預估花費將超過 85% 預算，請檢查高頻推論任務。' },
    { level: 'info', msg: 'embedding 批次作業已自動切到夜間排程，成本下降 12%。' },
  ]
};

function renderFinops() {
  const budgetPct = Math.min(100, (FinopsDB.monthSpend / FinopsDB.budget) * 100).toFixed(1);
  const forecastPct = Math.min(100, (FinopsDB.forecast / FinopsDB.budget) * 100).toFixed(1);
  const trendTag = (trend) => trend === 'up'
    ? '<span class="a-tag a-tag-red">上升</span>'
    : '<span class="a-tag a-tag-green">下降</span>';

  return `
    <div class="a-stats">
      <div class="a-stat">
        <div class="a-stat-value">$${FinopsDB.monthSpend.toLocaleString()}</div>
        <div class="a-stat-label">本月已用（${FinopsDB.billingMonth}）</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value" style="color:var(--admin-blue)">$${FinopsDB.budget.toLocaleString()}</div>
        <div class="a-stat-label">月度預算</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value" style="color:var(--admin-orange)">$${FinopsDB.forecast.toLocaleString()}</div>
        <div class="a-stat-label">月底預估</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value" style="color:var(--admin-green)">${(FinopsDB.budget - FinopsDB.monthSpend).toLocaleString()}</div>
        <div class="a-stat-label">剩餘可用</div>
      </div>
    </div>

    <div class="a-card">
      <h3><i class="fas fa-coins"></i> 成本與預算進度</h3>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        <div style="flex:1;min-width:220px;">
          <div style="font-size:.78rem;color:var(--admin-muted);margin-bottom:6px;">本月使用率 ${budgetPct}%</div>
          <div class="a-progress" style="height:10px;">
            <div class="a-progress-fill" style="width:${budgetPct}%;background:var(--admin-red);"></div>
          </div>
          <div style="font-size:.72rem;color:var(--admin-muted);margin-top:6px;">已用 $${FinopsDB.monthSpend.toLocaleString()} / 預算 $${FinopsDB.budget.toLocaleString()}</div>
        </div>
        <div style="flex:1;min-width:220px;">
          <div style="font-size:.78rem;color:var(--admin-muted);margin-bottom:6px;">月底預估 ${forecastPct}%</div>
          <div class="a-progress" style="height:10px;">
            <div class="a-progress-fill" style="width:${forecastPct}%;background:var(--admin-orange);"></div>
          </div>
          <div style="font-size:.72rem;color:var(--admin-muted);margin-top:6px;">預估 $${FinopsDB.forecast.toLocaleString()}</div>
        </div>
      </div>
    </div>

    <div class="a-card">
      <h3><i class="fas fa-robot"></i> AI 用量與計費</h3>
      <table class="a-table">
        <thead>
          <tr><th>模型</th><th>供應商</th><th>Tokens</th><th>成本</th><th>趨勢</th></tr>
        </thead>
        <tbody>
          ${FinopsDB.usage.map(u => `
            <tr>
              <td>${u.model}</td>
              <td>${u.provider}</td>
              <td>${u.tokens.toLocaleString()}</td>
              <td>$${u.cost.toLocaleString()}</td>
              <td>${trendTag(u.trend)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="a-card">
      <h3><i class="fas fa-chart-area"></i> 近 7 日成本</h3>
      <div style="display:flex;gap:10px;align-items:flex-end;height:120px;">
        ${FinopsDB.dailyCost.map(d => `
          <div style="flex:1;text-align:center;">
            <div style="height:${Math.max(12, Math.round(d.cost / 12))}px;background:var(--admin-blue);border-radius:8px;"></div>
            <div style="font-size:.7rem;color:var(--admin-muted);margin-top:6px;">${d.date}</div>
            <div style="font-size:.72rem;">$${d.cost}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="a-card">
      <h3><i class="fas fa-triangle-exclamation"></i> 成本提醒</h3>
      <div style="display:grid;gap:10px;">
        ${FinopsDB.alerts.map(a => `
          <div style="padding:12px;border:1px solid var(--admin-border);border-radius:10px;background:rgba(255,255,255,.02);">
            <span class="a-tag ${a.level === 'warning' ? 'a-tag-orange' : 'a-tag-blue'}">${a.level === 'warning' ? '注意' : '提示'}</span>
            <span style="margin-left:8px;font-size:.82rem;">${a.msg}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ---- Overview ---- */
function renderOverview() {
  return `
    <div class="a-stats">
      <div class="a-stat">
        <div class="a-stat-value">1,247</div>
        <div class="a-stat-label">活躍冒險者</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value">892</div>
        <div class="a-stat-label">今日交易筆數</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value">98.7%</div>
        <div class="a-stat-label">Pre-trade 通過率</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value">4.6</div>
        <div class="a-stat-label">平均信任度</div>
      </div>
    </div>

    <div class="a-card">
      <h3><i class="fas fa-chart-line"></i> 旅程階段分布</h3>
      <div style="display:flex;gap:12px;margin-top:12px;">
        ${[
          { name:'目標設定', pct: 100, color:'var(--admin-gold)' },
          { name:'風險評估', pct: 85, color:'var(--admin-green)' },
          { name:'方案推薦', pct: 72, color:'var(--admin-blue)' },
          { name:'一鍵下單', pct: 58, color:'var(--admin-orange)' },
          { name:'戰績回顧', pct: 45, color:'#9b59b6' },
        ].map(s => `
          <div style="flex:1;text-align:center;">
            <div style="font-size:.78rem;color:var(--admin-muted);margin-bottom:6px;">${s.name}</div>
            <div class="a-progress" style="height:8px;">
              <div class="a-progress-fill" style="width:${s.pct}%;background:${s.color};"></div>
            </div>
            <div style="font-size:.88rem;font-weight:700;margin-top:4px;">${s.pct}%</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="a-card">
      <h3><i class="fas fa-bell"></i> 最近警報</h3>
      <table class="a-table">
        <thead><tr><th>時間</th><th>類型</th><th>描述</th><th>狀態</th></tr></thead>
        <tbody>
          <tr>
            <td>14:32</td>
            <td><span class="a-tag a-tag-red">阻斷</span></td>
            <td>用戶 U-0892 風險等級 C5 觸發交易阻斷</td>
            <td><span class="a-tag a-tag-orange">待處理</span></td>
          </tr>
          <tr>
            <td>13:15</td>
            <td><span class="a-tag a-tag-orange">偏移</span></td>
            <td>用戶 U-0451 組合偏移 8.2%，已觸發 Rebalance 提醒</td>
            <td><span class="a-tag a-tag-green">已通知</span></td>
          </tr>
          <tr>
            <td>11:48</td>
            <td><span class="a-tag a-tag-blue">翻譯</span></td>
            <td>用戶 U-1033 連續 3 次「聽不懂」，已記錄翻譯失敗</td>
            <td><span class="a-tag a-tag-green">已記錄</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

/* ---- Knowledge Base (知識庫管理) ---- */

// 知識庫 Demo 資料
const KnowledgeDB = {
  categories: [
    { id: 'customer_tags', icon: 'fa-user-tag', color: '#d4a843',
      name: '客戶標籤', desc: '基本資料、收支概況、金流及財務指標',
      items: [
        { id: 'CT001', name: '客戶基本資料欄位定義', type: 'Schema', ver: 'v3', date: '2026-02-01', status: 'active', size: '12 KB', author: '系統管理員', desc: '姓名/身份證/聯絡方式/職業/年齡等欄位規格' },
        { id: 'CT002', name: '月收支分類標準', type: 'Config', ver: 'v2', date: '2026-01-20', status: 'active', size: '8 KB', author: '數據組', desc: '薪資/副業/投資收入/固定支出/變動支出分類邏輯' },
        { id: 'CT003', name: '金流分析指標公式', type: 'Formula', ver: 'v4', date: '2026-02-05', status: 'active', size: '15 KB', author: '風控組', desc: '儲蓄率/負債比/流動性比率/可投資比例等計算公式' },
        { id: 'CT004', name: '財務健康評分模型', type: 'Model', ver: 'v1', date: '2026-02-10', status: 'review', size: '22 KB', author: 'AI 研發組', desc: '綜合財務指標加權評分，產出 A~E 五級健康度' },
      ]
    },
    { id: 'account_assets', icon: 'fa-wallet', color: '#4a90d9',
      name: '帳戶資產、交易行為', desc: '帳戶持倉、交易紀錄與行為特徵',
      items: [
        { id: 'AA001', name: '帳戶資產快照結構', type: 'Schema', ver: 'v5', date: '2026-02-03', status: 'active', size: '18 KB', author: '系統管理員', desc: '存款/基金/ETF/保險/股票等各資產類別快照格式' },
        { id: 'AA002', name: '交易行為標籤規則', type: 'Rules', ver: 'v3', date: '2026-01-28', status: 'active', size: '14 KB', author: '數據組', desc: '交易頻率/單筆金額/偏好標的/持有期間行為分群' },
        { id: 'AA003', name: '資產異動監控閾值', type: 'Config', ver: 'v2', date: '2026-02-06', status: 'active', size: '6 KB', author: '風控組', desc: '大額贖回/集中度過高/異常交易等警示條件' },
      ]
    },
    { id: 'product_data', icon: 'fa-boxes-stacked', color: '#4a7c59',
      name: '產品資料', desc: '建議投資特性、教育、風險合規條件',
      items: [
        { id: 'PD001', name: '基金產品主檔', type: 'Dataset', ver: 'v8', date: '2026-02-07', status: 'active', size: '156 KB', author: '產品組', desc: '含 328 檔基金：名稱/ISIN/幣別/風險等級/投資區域/費率' },
        { id: 'PD002', name: 'ETF 產品主檔', type: 'Dataset', ver: 'v6', date: '2026-02-07', status: 'active', size: '89 KB', author: '產品組', desc: '含 152 檔 ETF：追蹤指數/配息頻率/內扣費用/流動性評級' },
        { id: 'PD003', name: '投資適性對照表', type: 'Matrix', ver: 'v3', date: '2026-01-15', status: 'active', size: '24 KB', author: '合規組', desc: 'KYC 等級 C1~C5 對應可投資產品風險等級 RR1~RR5 矩陣' },
        { id: 'PD004', name: '產品教育素材庫', type: 'Content', ver: 'v2', date: '2026-02-08', status: 'review', size: '340 KB', author: '行銷組', desc: '白話文產品說明/圖解/常見問答，供 AI 白話翻譯使用' },
        { id: 'PD005', name: '風險合規條件集', type: 'Rules', ver: 'v4', date: '2026-01-30', status: 'active', size: '32 KB', author: '合規組', desc: '各產品准入條件：最低投資額/鎖定期/專業投資人限制等' },
      ]
    },
    { id: 'goals_plans', icon: 'fa-bullseye', color: '#e8734a',
      name: '客戶目標及計劃', desc: '含歷史建議及客戶回饋',
      items: [
        { id: 'GP001', name: '目標情境模板庫', type: 'Template', ver: 'v3', date: '2026-02-05', status: 'active', size: '45 KB', author: 'AI 研發組', desc: '退休/買房/教育/旅遊等 8 種標準情境的預設參數與提示詞' },
        { id: 'GP002', name: '語意轉換 Prompt 模板', type: 'Prompt', ver: 'v6', date: '2026-02-09', status: 'active', size: '28 KB', author: 'AI 研發組', desc: '將用戶口語化目標轉為結構化 JSON 的 LLM prompt 範本' },
        { id: 'GP003', name: '歷史建議追蹤結構', type: 'Schema', ver: 'v2', date: '2026-01-22', status: 'active', size: '16 KB', author: '系統管理員', desc: '每次建議版本/時間戳/用戶接受狀態/調整原因完整紀錄' },
        { id: 'GP004', name: '客戶回饋分析模型', type: 'Model', ver: 'v1', date: '2026-02-10', status: 'review', size: '38 KB', author: 'AI 研發組', desc: '分析「聽不懂」次數/信任溫度計/情境投票，優化建議品質' },
      ]
    },
    { id: 'compliance_knowledge', icon: 'fa-scale-balanced', color: '#e74c3c',
      name: '合規知識', desc: '銀行內規及風險規範',
      items: [
        { id: 'CK001', name: 'Pre-trade Check 規則引擎', type: 'Rules', ver: 'v5', date: '2026-02-06', status: 'active', size: '42 KB', author: '合規組', desc: 'KYC 驗證/風險匹配/額度限制/合規審查/交易時段 5 項檢查邏輯' },
        { id: 'CK002', name: '風險揭露書固定模板', type: 'Template', ver: 'v3', date: '2026-01-18', status: 'active', size: '18 KB', author: '法遵部', desc: '每次推薦必須呈現之風險揭露內容與格式規範' },
        { id: 'CK003', name: '高風險阻斷條件', type: 'Config', ver: 'v2', date: '2026-02-03', status: 'active', size: '10 KB', author: '風控組', desc: 'C5 等級自動阻斷/超額警示/異常行為封鎖等觸發條件' },
        { id: 'CK004', name: '轉介人工規則', type: 'Rules', ver: 'v2', date: '2026-01-25', status: 'active', size: '12 KB', author: '合規組', desc: '何時需轉介真人理專：金額門檻/風險不匹配/用戶主動要求' },
        { id: 'CK005', name: '個資保護與去識別化規範', type: 'Policy', ver: 'v1', date: '2026-02-01', status: 'active', size: '26 KB', author: '法遵部', desc: '分享功能 PII 過濾規則/資料保留期限/存取權限控管' },
      ]
    },
    { id: 'market_info', icon: 'fa-chart-line', color: '#9b59b6',
      name: '外部即時市場資訊 / 內部投資報告', desc: '即時行情、研究報告與投資觀點',
      items: [
        { id: 'MI001', name: '即時市場行情 API 設定', type: 'API', ver: 'v3', date: '2026-02-07', status: 'active', size: '8 KB', author: '系統管理員', desc: '台股/美股/匯率/債券殖利率等即時報價來源與更新頻率' },
        { id: 'MI002', name: '每週投資策略報告', type: 'Report', ver: 'W06', date: '2026-02-07', status: 'active', size: '520 KB', author: '投研部', desc: '本週全球經濟展望/資產配置觀點/重點產業分析' },
        { id: 'MI003', name: '月度基金績效報告', type: 'Report', ver: '2026-01', date: '2026-02-05', status: 'active', size: '1.2 MB', author: '投研部', desc: '全產品線績效回顧/同類排名/風險指標比較' },
        { id: 'MI004', name: '市場異常事件資料庫', type: 'Dataset', ver: 'v2', date: '2026-02-03', status: 'active', size: '68 KB', author: '風控組', desc: '歷史Black Swan事件/市場重大回檔/央行政策轉向資料與AI學習用' },
        { id: 'MI005', name: '內部研究摘要 Embedding 索引', type: 'Index', ver: 'v4', date: '2026-02-08', status: 'review', size: '2.4 MB', author: 'AI 研發組', desc: 'RAG 向量搜索用：將研究報告切片 embedding 後的索引檔' },
      ]
    }
  ],

  // 當前選中分類
  activeCategory: 'customer_tags',
  // 搜尋關鍵字
  searchQuery: '',
};

function renderKnowledge() {
  const cats = KnowledgeDB.categories;
  const activeCat = cats.find(c => c.id === KnowledgeDB.activeCategory) || cats[0];
  const query = KnowledgeDB.searchQuery.toLowerCase();
  const filteredItems = query
    ? activeCat.items.filter(it => it.name.toLowerCase().includes(query) || it.desc.toLowerCase().includes(query) || it.type.toLowerCase().includes(query))
    : activeCat.items;

  const totalDocs = cats.reduce((s, c) => s + c.items.length, 0);
  const activeDocs = cats.reduce((s, c) => s + c.items.filter(i => i.status === 'active').length, 0);
  const reviewDocs = totalDocs - activeDocs;

  return `
    <!-- KPI -->
    <div class="a-stats" style="margin-bottom:20px;">
      <div class="a-stat">
        <div class="a-stat-value">${totalDocs}</div>
        <div class="a-stat-label">知識文件總數</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value" style="color:var(--admin-green)">${activeDocs}</div>
        <div class="a-stat-label">使用中</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value" style="color:var(--admin-orange)">${reviewDocs}</div>
        <div class="a-stat-label">審核中</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value">${cats.length}</div>
        <div class="a-stat-label">知識分類</div>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="a-card" style="padding:12px 16px;">
      <div style="display:flex;gap:6px;flex-wrap:wrap;" id="kbCatTabs">
        ${cats.map(c => `
          <button class="a-btn ${c.id === KnowledgeDB.activeCategory ? 'a-btn-primary' : 'a-btn-outline'}"
                  style="font-size:.78rem;padding:6px 14px;" onclick="switchKBCategory('${c.id}')">
            <i class="fas ${c.icon}" style="color:${c.id === KnowledgeDB.activeCategory ? '#1a1a2e' : c.color};"></i>
            ${c.name} <span style="opacity:.6;font-size:.7rem;">(${c.items.length})</span>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Active Category Detail -->
    <div class="a-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <div>
          <h3 style="margin:0;display:flex;align-items:center;gap:8px;">
            <i class="fas ${activeCat.icon}" style="color:${activeCat.color};"></i>
            ${activeCat.name}
          </h3>
          <p style="color:var(--admin-muted);font-size:.78rem;margin-top:4px;">${activeCat.desc}</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <input type="text" placeholder="搜尋文件..." value="${KnowledgeDB.searchQuery}"
            oninput="kbSearch(this.value)"
            style="padding:6px 12px;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-text);font-size:.82rem;width:180px;">
          <button class="a-btn a-btn-primary" style="font-size:.78rem;" onclick="kbAddDoc('${activeCat.id}')">
            <i class="fas fa-plus"></i> 新增文件
          </button>
        </div>
      </div>

      ${filteredItems.length === 0 ? `
        <div style="text-align:center;padding:40px 0;color:var(--admin-muted);">
          <i class="fas fa-search" style="font-size:2rem;opacity:.3;"></i>
          <p style="margin-top:8px;">無匹配文件</p>
        </div>
      ` : `
      <table class="a-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>文件名稱</th>
            <th>類型</th>
            <th>版本</th>
            <th>大小</th>
            <th>維護者</th>
            <th>最後更新</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${filteredItems.map(d => `
            <tr>
              <td style="font-family:monospace;font-size:.75rem;color:var(--admin-muted);">${d.id}</td>
              <td>
                <div style="font-weight:600;">${d.name}</div>
                <div style="font-size:.7rem;color:var(--admin-muted);margin-top:2px;max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${d.desc}">${d.desc}</div>
              </td>
              <td><span class="a-tag a-tag-blue">${d.type}</span></td>
              <td>${d.ver}</td>
              <td style="color:var(--admin-muted);font-size:.78rem;">${d.size}</td>
              <td style="font-size:.78rem;">${d.author}</td>
              <td style="font-size:.78rem;">${d.date}</td>
              <td><span class="a-tag ${d.status === 'active' ? 'a-tag-green' : 'a-tag-orange'}">${d.status === 'active' ? '使用中' : '審核中'}</span></td>
              <td>
                <div style="display:flex;gap:4px;">
                  <button class="a-btn a-btn-outline" style="padding:3px 8px;font-size:.72rem;" onclick="kbViewDoc('${activeCat.id}','${d.id}')"><i class="fas fa-eye"></i></button>
                  <button class="a-btn a-btn-outline" style="padding:3px 8px;font-size:.72rem;" onclick="kbEditDoc('${activeCat.id}','${d.id}')"><i class="fas fa-pen"></i></button>
                  <button class="a-btn a-btn-outline" style="padding:3px 8px;font-size:.72rem;color:var(--admin-red);border-color:rgba(239,68,68,.3);" onclick="kbDeleteDoc('${activeCat.id}','${d.id}')"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      `}
    </div>

    <!-- RAG Index Stats -->
    <div class="a-card" style="border-left:4px solid ${activeCat.color};">
      <h3 style="font-size:.88rem;"><i class="fas fa-database"></i> RAG 索引狀態</h3>
      <div style="display:flex;gap:20px;margin-top:10px;flex-wrap:wrap;">
        <div style="font-size:.82rem;">
          <span style="color:var(--admin-muted);">已索引文件：</span>
          <strong>${activeCat.items.filter(i => i.status === 'active').length}/${activeCat.items.length}</strong>
        </div>
        <div style="font-size:.82rem;">
          <span style="color:var(--admin-muted);">向量 Chunks：</span>
          <strong>${activeCat.items.filter(i => i.status === 'active').length * 47}</strong>
        </div>
        <div style="font-size:.82rem;">
          <span style="color:var(--admin-muted);">最後同步：</span>
          <strong>2026-02-07 14:30</strong>
        </div>
        <button class="a-btn a-btn-outline" style="font-size:.75rem;padding:4px 12px;margin-left:auto;" onclick="kbReindex('${activeCat.id}')">
          <i class="fas fa-rotate"></i> 重新索引
        </button>
      </div>
    </div>

    <!-- Modal placeholder -->
    <div id="kbModal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);z-index:999;display:none;align-items:center;justify-content:center;">
      <div id="kbModalContent" style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:14px;padding:28px;width:90%;max-width:560px;max-height:80vh;overflow-y:auto;"></div>
    </div>
  `;
}

/* ---- KB Interaction Functions ---- */

function switchKBCategory(catId) {
  KnowledgeDB.activeCategory = catId;
  KnowledgeDB.searchQuery = '';
  document.getElementById('adminContent').innerHTML = renderKnowledge();
}

function kbSearch(query) {
  KnowledgeDB.searchQuery = query;
  // 延遲重繪避免閃爍
  clearTimeout(window._kbSearchTimer);
  window._kbSearchTimer = setTimeout(() => {
    document.getElementById('adminContent').innerHTML = renderKnowledge();
    // 還原焦點到搜尋框
    const input = document.querySelector('#adminContent input[type="text"]');
    if (input) { input.focus(); input.setSelectionRange(query.length, query.length); }
  }, 200);
}

function kbShowModal(html) {
  const modal = document.getElementById('kbModal');
  const content = document.getElementById('kbModalContent');
  if (modal && content) {
    content.innerHTML = html;
    modal.style.display = 'flex';
    modal.onclick = (e) => { if (e.target === modal) kbCloseModal(); };
  }
}

function kbCloseModal() {
  const modal = document.getElementById('kbModal');
  if (modal) modal.style.display = 'none';
}

function kbViewDoc(catId, docId) {
  const cat = KnowledgeDB.categories.find(c => c.id === catId);
  const doc = cat?.items.find(i => i.id === docId);
  if (!doc) return;
  kbShowModal(`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <h3 style="color:var(--admin-gold);margin-bottom:16px;">${doc.name}</h3>
      <button class="a-btn a-btn-outline" style="padding:4px 10px;font-size:.75rem;" onclick="kbCloseModal()"><i class="fas fa-times"></i></button>
    </div>
    <table style="width:100%;font-size:.82rem;border-collapse:collapse;">
      ${[
        ['ID', doc.id], ['分類', cat.name], ['類型', doc.type], ['版本', doc.ver],
        ['大小', doc.size], ['維護者', doc.author], ['最後更新', doc.date],
        ['狀態', doc.status === 'active' ? '✅ 使用中' : '⏳ 審核中']
      ].map(([k, v]) => `
        <tr>
          <td style="padding:8px 12px;color:var(--admin-muted);width:90px;border-bottom:1px solid rgba(255,255,255,.04);">${k}</td>
          <td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.04);">${v}</td>
        </tr>
      `).join('')}
    </table>
    <div style="margin-top:16px;padding:14px;background:var(--admin-bg);border-radius:8px;">
      <div style="font-size:.78rem;color:var(--admin-muted);margin-bottom:6px;">📝 說明</div>
      <p style="font-size:.85rem;line-height:1.6;">${doc.desc}</p>
    </div>
    <div style="margin-top:16px;padding:14px;background:var(--admin-bg);border-radius:8px;">
      <div style="font-size:.78rem;color:var(--admin-muted);margin-bottom:6px;">📊 內容預覽（模擬）</div>
      <pre style="font-size:.75rem;color:var(--admin-muted);white-space:pre-wrap;font-family:'Courier New',monospace;line-height:1.5;max-height:200px;overflow-y:auto;">${generateMockContent(doc)}</pre>
    </div>
    <div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end;">
      <button class="a-btn a-btn-outline" style="font-size:.78rem;" onclick="kbEditDoc('${catId}','${docId}')"><i class="fas fa-pen"></i> 編輯</button>
      <button class="a-btn a-btn-primary" style="font-size:.78rem;" onclick="kbCloseModal()">關閉</button>
    </div>
  `);
}

function kbEditDoc(catId, docId) {
  const cat = KnowledgeDB.categories.find(c => c.id === catId);
  const doc = cat?.items.find(i => i.id === docId);
  if (!doc) return;
  kbShowModal(`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <h3 style="color:var(--admin-gold);margin-bottom:16px;"><i class="fas fa-pen"></i> 編輯文件</h3>
      <button class="a-btn a-btn-outline" style="padding:4px 10px;font-size:.75rem;" onclick="kbCloseModal()"><i class="fas fa-times"></i></button>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div>
        <label style="font-size:.78rem;color:var(--admin-muted);display:block;margin-bottom:4px;">文件名稱</label>
        <input id="kbEditName" type="text" value="${doc.name}" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-text);font-size:.85rem;">
      </div>
      <div style="display:flex;gap:12px;">
        <div style="flex:1;">
          <label style="font-size:.78rem;color:var(--admin-muted);display:block;margin-bottom:4px;">類型</label>
          <select id="kbEditType" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-text);font-size:.85rem;">
            ${['Schema','Config','Formula','Model','Rules','Dataset','Template','Prompt','Content','Matrix','Policy','Report','API','Index'].map(t =>
              `<option value="${t}" ${t === doc.type ? 'selected' : ''}>${t}</option>`
            ).join('')}
          </select>
        </div>
        <div style="flex:1;">
          <label style="font-size:.78rem;color:var(--admin-muted);display:block;margin-bottom:4px;">狀態</label>
          <select id="kbEditStatus" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-text);font-size:.85rem;">
            <option value="active" ${doc.status === 'active' ? 'selected' : ''}>使用中</option>
            <option value="review" ${doc.status === 'review' ? 'selected' : ''}>審核中</option>
          </select>
        </div>
      </div>
      <div>
        <label style="font-size:.78rem;color:var(--admin-muted);display:block;margin-bottom:4px;">維護者</label>
        <input id="kbEditAuthor" type="text" value="${doc.author}" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-text);font-size:.85rem;">
      </div>
      <div>
        <label style="font-size:.78rem;color:var(--admin-muted);display:block;margin-bottom:4px;">說明</label>
        <textarea id="kbEditDesc" rows="3" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-text);font-size:.85rem;resize:vertical;">${doc.desc}</textarea>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:20px;justify-content:flex-end;">
      <button class="a-btn a-btn-outline" style="font-size:.78rem;" onclick="kbCloseModal()">取消</button>
      <button class="a-btn a-btn-primary" style="font-size:.78rem;" onclick="kbSaveDoc('${catId}','${docId}')"><i class="fas fa-save"></i> 儲存</button>
    </div>
  `);
}

function kbSaveDoc(catId, docId) {
  const cat = KnowledgeDB.categories.find(c => c.id === catId);
  const doc = cat?.items.find(i => i.id === docId);
  if (!doc) return;
  doc.name = document.getElementById('kbEditName')?.value || doc.name;
  doc.type = document.getElementById('kbEditType')?.value || doc.type;
  doc.status = document.getElementById('kbEditStatus')?.value || doc.status;
  doc.author = document.getElementById('kbEditAuthor')?.value || doc.author;
  doc.desc = document.getElementById('kbEditDesc')?.value || doc.desc;
  doc.date = new Date().toISOString().split('T')[0];
  doc.ver = incrementVersion(doc.ver);
  kbCloseModal();
  document.getElementById('adminContent').innerHTML = renderKnowledge();
  showAdminToast(`✅ 已更新「${doc.name}」(${doc.ver})`);
}

function kbDeleteDoc(catId, docId) {
  const cat = KnowledgeDB.categories.find(c => c.id === catId);
  if (!cat) return;
  const idx = cat.items.findIndex(i => i.id === docId);
  if (idx === -1) return;
  const name = cat.items[idx].name;
  if (!confirm(`確定要刪除「${name}」？此操作無法復原。`)) return;
  cat.items.splice(idx, 1);
  document.getElementById('adminContent').innerHTML = renderKnowledge();
  showAdminToast(`🗑️ 已刪除「${name}」`);
}

function kbAddDoc(catId) {
  const cat = KnowledgeDB.categories.find(c => c.id === catId);
  if (!cat) return;
  kbShowModal(`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <h3 style="color:var(--admin-gold);margin-bottom:16px;"><i class="fas fa-plus"></i> 新增文件至「${cat.name}」</h3>
      <button class="a-btn a-btn-outline" style="padding:4px 10px;font-size:.75rem;" onclick="kbCloseModal()"><i class="fas fa-times"></i></button>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div>
        <label style="font-size:.78rem;color:var(--admin-muted);display:block;margin-bottom:4px;">文件名稱 *</label>
        <input id="kbNewName" type="text" placeholder="輸入文件名稱" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-text);font-size:.85rem;">
      </div>
      <div style="display:flex;gap:12px;">
        <div style="flex:1;">
          <label style="font-size:.78rem;color:var(--admin-muted);display:block;margin-bottom:4px;">類型</label>
          <select id="kbNewType" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-text);font-size:.85rem;">
            ${['Schema','Config','Formula','Model','Rules','Dataset','Template','Prompt','Content','Matrix','Policy','Report','API','Index'].map(t =>
              `<option value="${t}">${t}</option>`
            ).join('')}
          </select>
        </div>
        <div style="flex:1;">
          <label style="font-size:.78rem;color:var(--admin-muted);display:block;margin-bottom:4px;">維護者</label>
          <input id="kbNewAuthor" type="text" value="管理員" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-text);font-size:.85rem;">
        </div>
      </div>
      <div>
        <label style="font-size:.78rem;color:var(--admin-muted);display:block;margin-bottom:4px;">說明</label>
        <textarea id="kbNewDesc" rows="3" placeholder="文件用途與內容概述" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-text);font-size:.85rem;resize:vertical;"></textarea>
      </div>
      <div style="padding:20px;border:2px dashed var(--admin-border);border-radius:10px;text-align:center;color:var(--admin-muted);cursor:pointer;" onclick="showAdminToast('📁 檔案上傳功能（Demo 模擬）')">
        <i class="fas fa-cloud-arrow-up" style="font-size:1.5rem;margin-bottom:8px;display:block;"></i>
        <span style="font-size:.82rem;">點擊或拖曳上傳檔案</span>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:20px;justify-content:flex-end;">
      <button class="a-btn a-btn-outline" style="font-size:.78rem;" onclick="kbCloseModal()">取消</button>
      <button class="a-btn a-btn-primary" style="font-size:.78rem;" onclick="kbSaveNewDoc('${catId}')"><i class="fas fa-plus"></i> 新增</button>
    </div>
  `);
}

function kbSaveNewDoc(catId) {
  const cat = KnowledgeDB.categories.find(c => c.id === catId);
  if (!cat) return;
  const name = document.getElementById('kbNewName')?.value?.trim();
  if (!name) { alert('請輸入文件名稱'); return; }
  const prefix = catId.split('_').map(w => w[0].toUpperCase()).join('');
  const newId = prefix + String(cat.items.length + 1).padStart(3, '0');
  cat.items.push({
    id: newId,
    name: name,
    type: document.getElementById('kbNewType')?.value || 'Config',
    ver: 'v1',
    date: new Date().toISOString().split('T')[0],
    status: 'review',
    size: Math.floor(Math.random() * 50 + 5) + ' KB',
    author: document.getElementById('kbNewAuthor')?.value || '管理員',
    desc: document.getElementById('kbNewDesc')?.value || ''
  });
  kbCloseModal();
  document.getElementById('adminContent').innerHTML = renderKnowledge();
  showAdminToast(`✅ 已新增「${name}」至 ${cat.name}`);
}

function kbReindex(catId) {
  const cat = KnowledgeDB.categories.find(c => c.id === catId);
  if (!cat) return;
  showAdminToast(`🔄 正在重新索引「${cat.name}」... (${cat.items.filter(i => i.status === 'active').length} 份文件)`);
  setTimeout(() => {
    showAdminToast(`✅ 「${cat.name}」索引完成，共 ${cat.items.filter(i => i.status === 'active').length * 47} chunks`);
  }, 2000);
}

function incrementVersion(ver) {
  const match = ver.match(/v(\d+)/);
  return match ? 'v' + (parseInt(match[1]) + 1) : 'v2';
}

function generateMockContent(doc) {
  const templates = {
    Schema: `{\n  "schema_version": "${doc.ver}",\n  "fields": [\n    { "name": "customer_id", "type": "string", "required": true },\n    { "name": "risk_grade", "type": "enum", "values": ["C1","C2","C3","C4","C5"] },\n    { "name": "updated_at", "type": "datetime" }\n  ],\n  "description": "${doc.desc}"\n}`,
    Config: `# ${doc.name}\n# 版本: ${doc.ver}\n# 維護者: ${doc.author}\n\n[parameters]\nthreshold = 0.05\nmax_retry = 3\nenable_alert = true\n\n[rules]\nrule_1 = "金額 > 500000 → 人工審核"\nrule_2 = "風險等級 C5 → 自動阻斷"`,
    Rules: `規則引擎: ${doc.name}\n版本: ${doc.ver}\n\nRule 1: IF risk_grade = 'C5' THEN block_transaction\nRule 2: IF kyc_expired = true THEN require_renewal\nRule 3: IF amount > limit THEN escalate_to_human\nRule 4: IF drift_score > 5% THEN trigger_rebalance`,
    Template: `/* ${doc.name} */\n/* 版本: ${doc.ver} */\n\n風險揭露聲明：\n本建議由 AI 演算法生成，僅供參考。\n投資一定有風險，基金投資有賺有賠...\n歷史績效不代表未來表現。`,
    Dataset: `# ${doc.name} (${doc.ver})\n# Records: ${Math.floor(Math.random() * 300 + 50)}\n\nfund_id | name | risk_level | currency | region\n--------|------|------------|----------|-------\nF001    | 全球股票型基金 | RR4 | TWD | Global\nF002    | 台灣高股息ETF  | RR3 | TWD | Taiwan\n...`,
    Model: `# ML Model: ${doc.name}\n# Version: ${doc.ver}\n# Type: Gradient Boosting\n# Features: 12\n# Training samples: 45,000\n# Accuracy: 0.87\n# Last trained: ${doc.date}`,
    default: `文件: ${doc.name}\n版本: ${doc.ver}\n類型: ${doc.type}\n\n${doc.desc}\n\n--- 內容省略 (Demo) ---`
  };
  return templates[doc.type] || templates.default;
}

function showAdminToast(msg) {
  // 簡易 toast
  let container = document.getElementById('adminToast');
  if (!container) {
    container = document.createElement('div');
    container.id = 'adminToast';
    container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.style.cssText = 'background:var(--admin-card,#1e293b);border:1px solid var(--admin-border,rgba(212,168,67,.15));color:var(--admin-text,#e8e0d4);padding:12px 18px;border-radius:10px;font-size:.85rem;box-shadow:0 4px 20px rgba(0,0,0,.4);animation:fadeIn .3s ease;max-width:360px;';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

/* ---- Compliance ---- */
function renderCompliance() {
  return `
    <div class="a-stats">
      <div class="a-stat">
        <div class="a-stat-value" style="color:var(--admin-green)">98.7%</div>
        <div class="a-stat-label">Pre-trade 通過率</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value" style="color:var(--admin-red)">12</div>
        <div class="a-stat-label">本月阻斷次數</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value">3</div>
        <div class="a-stat-label">待審轉介案件</div>
      </div>
    </div>

    <div class="a-card">
      <h3><i class="fas fa-shield-halved"></i> 風控規則設定</h3>
      <table class="a-table">
        <thead><tr><th>規則</th><th>優先級</th><th>閾值</th><th>狀態</th></tr></thead>
        <tbody>
          <tr><td>KYC 有效期檢查</td><td><span class="a-tag a-tag-red">P0</span></td><td>365 天</td><td><span class="a-tag a-tag-green">啟用</span></td></tr>
          <tr><td>風險等級匹配</td><td><span class="a-tag a-tag-red">P0</span></td><td>嚴格匹配</td><td><span class="a-tag a-tag-green">啟用</span></td></tr>
          <tr><td>單筆額度限制</td><td><span class="a-tag a-tag-orange">P1</span></td><td>$500,000</td><td><span class="a-tag a-tag-green">啟用</span></td></tr>
          <tr><td>組合偏移監控</td><td><span class="a-tag a-tag-orange">P1</span></td><td>5%</td><td><span class="a-tag a-tag-green">啟用</span></td></tr>
          <tr><td>交易時段限制</td><td><span class="a-tag a-tag-blue">P2</span></td><td>09:00-13:30</td><td><span class="a-tag a-tag-green">啟用</span></td></tr>
        </tbody>
      </table>
    </div>

    <div class="a-card">
      <h3><i class="fas fa-gavel"></i> 近期阻斷紀錄</h3>
      <table class="a-table">
        <thead><tr><th>時間</th><th>用戶</th><th>原因</th><th>處置</th></tr></thead>
        <tbody>
          <tr><td>02-11 14:32</td><td>U-0892</td><td>風險等級 C5 不匹配</td><td><span class="a-tag a-tag-orange">待轉介</span></td></tr>
          <tr><td>02-10 10:21</td><td>U-0356</td><td>KYC 已過期</td><td><span class="a-tag a-tag-green">已更新</span></td></tr>
          <tr><td>02-09 15:45</td><td>U-0721</td><td>超過單筆額度</td><td><span class="a-tag a-tag-green">已調整</span></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

/* ---- Users ---- */
function renderUsers() {
  return `
    <div class="a-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;"><i class="fas fa-users"></i> 冒險者列表</h3>
        <input type="text" placeholder="搜尋用戶..." style="padding:8px 14px;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-text);font-size:.85rem;width:220px;">
      </div>
      <table class="a-table">
        <thead><tr><th>ID</th><th>名稱</th><th>等級</th><th>風險</th><th>旅程階段</th><th>最後活躍</th></tr></thead>
        <tbody>
          ${[
            { id:'U-0001', name:'官大大', lv:3, risk:'C3', stage:'戰績回顧', active:'2 小時前' },
            { id:'U-0002', name:'林小萌', lv:2, risk:'C2', stage:'一鍵下單', active:'5 小時前' },
            { id:'U-0003', name:'陳阿福', lv:5, risk:'C4', stage:'戰績回顧', active:'1 天前' },
            { id:'U-0004', name:'旅行者', lv:1, risk:'-', stage:'目標設定', active:'剛剛' },
            { id:'U-0005', name:'王美玲', lv:4, risk:'C3', stage:'方案推薦', active:'3 小時前' },
          ].map(u => `
            <tr>
              <td style="font-family:monospace;">${u.id}</td>
              <td style="font-weight:600;">${u.name}</td>
              <td><span class="a-tag a-tag-gold">Lv.${u.lv}</span></td>
              <td>${u.risk !== '-' ? `<span class="a-tag a-tag-blue">${u.risk}</span>` : '-'}</td>
              <td>${u.stage}</td>
              <td style="color:var(--admin-muted);">${u.active}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* ---- Events ---- */
function renderEvents() {
  return `
    <div class="a-card">
      <h3><i class="fas fa-scroll"></i> BDD 事件追蹤 (Event Catalog)</h3>
      <p style="color:var(--admin-muted);font-size:.82rem;margin-bottom:16px;">
        所有關鍵行為事件依 BDD 規格記錄，可用於分析與合規稽核。
      </p>
      <table class="a-table">
        <thead><tr><th>事件名稱</th><th>分類</th><th>今日觸發</th><th>累計</th></tr></thead>
        <tbody>
          ${[
            { name:'goal_created', cat:'Goal', today:45, total:1280 },
            { name:'semantic_transform_completed', cat:'Goal', today:42, total:1195 },
            { name:'kyc_submitted', cat:'KYC', today:38, total:1120 },
            { name:'recommendation_generated', cat:'Rec', today:35, total:980 },
            { name:'explainability_retry_clicked', cat:'Trust', today:22, total:456 },
            { name:'translation_failure_logged', cat:'Trust', today:8, total:89 },
            { name:'trust_thermometer_submitted', cat:'Trust', today:30, total:780 },
            { name:'risk_disclosure_acknowledged', cat:'Compliance', today:33, total:950 },
            { name:'pretrade_check_passed', cat:'Trade', today:31, total:892 },
            { name:'pretrade_check_blocked', cat:'Trade', today:2, total:12 },
            { name:'order_submitted', cat:'Trade', today:31, total:880 },
            { name:'rebalance_triggered', cat:'Monitor', today:5, total:67 },
            { name:'scenario_vote_submitted', cat:'Feature', today:18, total:326 },
          ].map(e => `
            <tr>
              <td style="font-family:monospace;font-size:.8rem;">${e.name}</td>
              <td><span class="a-tag a-tag-blue">${e.cat}</span></td>
              <td style="font-weight:600;">${e.today}</td>
              <td style="color:var(--admin-muted);">${e.total.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* ---- Scenarios ---- */
function renderScenarios() {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <p style="color:var(--admin-muted);font-size:.85rem;">管理理財情境模板與用戶投票結果 (Feature H)</p>
      <button class="a-btn a-btn-primary"><i class="fas fa-plus"></i> 新增情境</button>
    </div>

    <div class="a-card">
      <table class="a-table">
        <thead><tr><th>情境</th><th>投票數</th><th>狀態</th><th>優先級</th></tr></thead>
        <tbody>
          ${[
            { name:'🏖️ 退休規劃', votes:1280, status:'上線', priority:'P0' },
            { name:'🏠 買房頭期款', votes:945, status:'上線', priority:'P0' },
            { name:'🎓 子女教育基金', votes:823, status:'上線', priority:'P0' },
            { name:'✈️ 環遊世界旅費', votes:456, status:'上線', priority:'P1' },
            { name:'🐕 毛小孩醫療', votes:312, status:'上線', priority:'P1' },
            { name:'🚗 換車基金', votes:278, status:'上線', priority:'P2' },
            { name:'💒 結婚基金', votes:245, status:'上線', priority:'P2' },
            { name:'🏋️ 健身房基金', votes:89, status:'候選', priority:'-' },
            { name:'📱 3C 換新基金', votes:67, status:'候選', priority:'-' },
          ].map(s => `
            <tr>
              <td style="font-weight:600;">${s.name}</td>
              <td style="font-weight:600;">${s.votes.toLocaleString()}</td>
              <td><span class="a-tag ${s.status === '上線' ? 'a-tag-green' : 'a-tag-orange'}">${s.status}</span></td>
              <td>${s.priority !== '-' ? `<span class="a-tag a-tag-blue">${s.priority}</span>` : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* ---- Allies Admin (盟友系統管理 — Features J/K/L/M) ---- */
function renderAlliesAdmin() {
  const allyPairs = [
    { user1: 'U-0012 小美', user2: 'U-0034 阿明', since: '2026-02-05', visibility: 'L1', status: 'active' },
    { user1: 'U-0012 小美', user2: 'U-0056 小花', since: '2026-02-08', visibility: 'L2', status: 'active' },
    { user1: 'U-0078 大雄', user2: 'U-0091 阿文', since: '2026-02-01', visibility: 'L0', status: 'active' },
    { user1: 'U-0034 阿明', user2: 'U-0123 小靜', since: '2026-02-10', visibility: 'L1', status: 'pending' },
  ];

  const challenges = [
    { id: 'CH-001', name: '連續定投 30 天', creator: 'U-0012', members: 3, progress: 67, status: 'active' },
    { id: 'CH-002', name: '月存 2 萬挑戰', creator: 'U-0078', members: 2, progress: 45, status: 'active' },
    { id: 'CH-003', name: '學習理財 7 天', creator: 'U-0034', members: 5, progress: 100, status: 'completed' },
  ];

  const encourageStats = [
    { type: '🎉 恭喜達標！', sent: 28, blocked: 0 },
    { type: '💪 加油打氣', sent: 45, blocked: 2 },
    { type: '🔥 連續紀錄', sent: 12, blocked: 0 },
    { type: '✍️ 自訂訊息', sent: 67, blocked: 5 },
  ];

  return `
    <div class="a-stats">
      <div class="a-stat">
        <div class="a-stat-value">${allyPairs.length}</div>
        <div class="a-stat-label">盟友配對數</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value">${challenges.length}</div>
        <div class="a-stat-label">進行中挑戰</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value">${encourageStats.reduce((s, e) => s + e.sent, 0)}</div>
        <div class="a-stat-label">鼓勵訊息總數</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value" style="color:var(--admin-red)">${encourageStats.reduce((s, e) => s + e.blocked, 0)}</div>
        <div class="a-stat-label">違規攔截</div>
      </div>
    </div>

    <div class="a-card">
      <h3><i class="fas fa-handshake"></i> 盟友配對列表</h3>
      <table class="a-table">
        <thead><tr><th>冒險者 A</th><th>冒險者 B</th><th>建立日期</th><th>可見度</th><th>狀態</th><th>操作</th></tr></thead>
        <tbody>
          ${allyPairs.map(a => `
            <tr>
              <td>${a.user1}</td>
              <td>${a.user2}</td>
              <td>${a.since}</td>
              <td><span class="a-tag a-tag-blue">${a.visibility}</span></td>
              <td><span class="a-tag ${a.status === 'active' ? 'a-tag-green' : 'a-tag-orange'}">${a.status === 'active' ? '已生效' : '待確認'}</span></td>
              <td><button class="a-btn a-btn-outline" style="font-size:.72rem;padding:3px 8px;">查看</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="a-card">
      <h3><i class="fas fa-trophy"></i> 共同挑戰管理</h3>
      <table class="a-table">
        <thead><tr><th>ID</th><th>挑戰名稱</th><th>發起人</th><th>成員</th><th>進度</th><th>狀態</th></tr></thead>
        <tbody>
          ${challenges.map(c => `
            <tr>
              <td style="font-family:monospace;">${c.id}</td>
              <td style="font-weight:600;">${c.name}</td>
              <td>${c.creator}</td>
              <td>${c.members} 人</td>
              <td>
                <div class="a-progress" style="width:100px;height:6px;display:inline-block;vertical-align:middle;">
                  <div class="a-progress-fill" style="width:${c.progress}%;background:${c.progress >= 100 ? 'var(--admin-green)' : 'var(--admin-gold)'}"></div>
                </div>
                <span style="font-size:.78rem;margin-left:6px;">${c.progress}%</span>
              </td>
              <td><span class="a-tag ${c.status === 'completed' ? 'a-tag-green' : 'a-tag-blue'}">${c.status === 'completed' ? '已完成' : '進行中'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="a-card">
      <h3><i class="fas fa-comment-dots"></i> 鼓勵訊息統計（含合規攔截）</h3>
      <table class="a-table">
        <thead><tr><th>訊息類型</th><th>發送數</th><th>攔截數</th><th>攔截率</th></tr></thead>
        <tbody>
          ${encourageStats.map(e => `
            <tr>
              <td style="font-weight:600;">${e.type}</td>
              <td>${e.sent}</td>
              <td style="color:${e.blocked > 0 ? 'var(--admin-red)' : 'inherit'}">${e.blocked}</td>
              <td>${e.sent > 0 ? ((e.blocked / e.sent) * 100).toFixed(1) : 0}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="margin-top:12px;padding:10px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:8px;font-size:.78rem;">
        <i class="fas fa-shield-halved" style="color:var(--admin-red);margin-right:6px;"></i>
        <strong>BANNED_WORDS 攔截：</strong>系統自動偵測「保證獲利、穩賺不賠、借錢投資」等違規用語，並阻擋發送。
      </div>
    </div>
  `;
}

/* ---- Leveling Admin (等級系統總覽 — Features O/P) ---- */
function renderLevelingAdmin() {
  const rankDistribution = [
    { rank: 1, name: '啟程者', count: 520, pct: 41.7 },
    { rank: 2, name: '受訓者', count: 380, pct: 30.5 },
    { rank: 3, name: '紀律者', count: 210, pct: 16.8 },
    { rank: 4, name: '自控者', count: 85, pct: 6.8 },
    { rank: 5, name: '戰術者', count: 40, pct: 3.2 },
    { rank: 6, name: '夥伴型玩家', count: 12, pct: 1.0 },
  ];

  const xpEvents = [
    { event: 'goal_captured', xp: 50, today: 45, total: 1280 },
    { event: 'kyc_completed', xp: 80, today: 38, total: 950 },
    { event: 'order_submitted', xp: 100, today: 22, total: 680 },
    { event: 'share_card_generated', xp: 40, today: 18, total: 420 },
    { event: 'challenge_completed', xp: 40, today: 5, total: 89 },
    { event: 'encourage_received', xp: 10, today: 32, total: 560 },
    { event: 'trust_thermometer_submitted', xp: 15, today: 28, total: 390 },
  ];

  const unlockStats = [
    { rank: 2, feature: '聽不懂改寫', unlocked: 380, icon: '💬' },
    { rank: 3, feature: '盟友系統 + 挑戰', unlocked: 210, icon: '🤝' },
    { rank: 4, feature: '再平衡視覺化', unlocked: 85, icon: '📊' },
    { rank: 5, feature: '再平衡決策回顧', unlocked: 40, icon: '🔍' },
    { rank: 6, feature: '長期趨勢報告', unlocked: 12, icon: '📈' },
  ];

  return `
    <div class="a-stats">
      <div class="a-stat">
        <div class="a-stat-value">1,247</div>
        <div class="a-stat-label">總冒險者數</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value" style="color:var(--admin-gold)">R2.3</div>
        <div class="a-stat-label">平均階級</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value">156,800</div>
        <div class="a-stat-label">今日 XP 總發放</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value" style="color:var(--admin-red)">342</div>
        <div class="a-stat-label">今日 XP 限額觸發</div>
      </div>
    </div>

    <div class="a-card">
      <h3><i class="fas fa-chart-bar"></i> 階級分布 (6 Ranks × 5 Stars)</h3>
      <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;">
        ${rankDistribution.map(r => `
          <div style="flex:1;min-width:120px;text-align:center;padding:16px;border:1px solid var(--admin-border);border-radius:8px;">
            <div style="font-size:1.5rem;margin-bottom:4px;">${'⭐'.repeat(Math.min(r.rank, 3))}</div>
            <div style="font-size:.78rem;color:var(--admin-muted);">R${r.rank}</div>
            <div style="font-size:1rem;font-weight:700;">${r.name}</div>
            <div style="font-size:1.3rem;font-weight:800;color:var(--admin-gold);margin-top:4px;">${r.count}</div>
            <div style="font-size:.72rem;color:var(--admin-muted);">${r.pct}%</div>
            <div class="a-progress" style="height:6px;margin-top:8px;">
              <div class="a-progress-fill" style="width:${r.pct}%;background:var(--admin-gold);"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="a-card">
      <h3><i class="fas fa-bolt"></i> XP 事件統計</h3>
      <table class="a-table">
        <thead><tr><th>事件名稱</th><th>單次 XP</th><th>今日觸發</th><th>累計觸發</th><th>今日 XP 貢獻</th></tr></thead>
        <tbody>
          ${xpEvents.map(e => `
            <tr>
              <td style="font-family:monospace;font-size:.78rem;">${e.event}</td>
              <td style="color:var(--admin-gold);font-weight:600;">+${e.xp}</td>
              <td>${e.today}</td>
              <td>${e.total.toLocaleString()}</td>
              <td style="font-weight:600;">${(e.today * e.xp).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="a-card">
      <h3><i class="fas fa-lock-open"></i> 功能解鎖統計</h3>
      <table class="a-table">
        <thead><tr><th>解鎖階級</th><th>功能</th><th>已解鎖人數</th><th>佔比</th></tr></thead>
        <tbody>
          ${unlockStats.map(u => `
            <tr>
              <td><span class="a-tag a-tag-gold">R${u.rank}</span></td>
              <td>${u.icon} ${u.feature}</td>
              <td style="font-weight:600;">${u.unlocked}</td>
              <td>${(u.unlocked / 1247 * 100).toFixed(1)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="a-card" style="border-left:4px solid var(--admin-orange);">
      <h3><i class="fas fa-shield-halved"></i> Anti-Spam XP 限額設定</h3>
      <p style="font-size:.82rem;color:var(--admin-muted);margin:8px 0;">
        防止用戶刷 XP 行為。以下事件有每日/每週觸發上限：
      </p>
      <table class="a-table">
        <thead><tr><th>事件</th><th>每日上限</th><th>每週上限</th><th>今日觸發限額次數</th></tr></thead>
        <tbody>
          <tr><td>trust_thermometer_submitted</td><td>2 次</td><td>無限制</td><td style="color:var(--admin-red);">84</td></tr>
          <tr><td>risk_disclosure_acknowledged</td><td>3 次</td><td>無限制</td><td>12</td></tr>
          <tr><td>encourage_received</td><td>2 次</td><td>無限制</td><td style="color:var(--admin-red);">156</td></tr>
          <tr><td>challenge_completed</td><td>1 次</td><td>無限制</td><td>45</td></tr>
          <tr><td>quest_weekly_completed</td><td>無限制</td><td>1 次</td><td>28</td></tr>
          <tr><td>re_explain_feedback_submitted</td><td>3 次</td><td>無限制</td><td>17</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

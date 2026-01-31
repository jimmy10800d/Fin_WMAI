/**
 * Fin_WMAI 後台管理系統
 * 主要 JavaScript 控制
 */

// ===== 狀態管理 =====
const AdminState = {
    currentPage: 'dashboard',
    user: null,
    sidebarCollapsed: false,
    // 模擬資料存儲
    data: {
        knowledge: [
            { id: 'K001', title: '什麼是定期定額投資？', category: 'investment', content: '定期定額投資是一種投資策略，投資人定期（如每月）以固定金額投資特定標的...', status: 'active', updatedAt: '2026-01-30' },
            { id: 'K002', title: '基金風險等級說明（RR1-RR5）', category: 'product', content: '基金風險等級從 RR1 到 RR5，數字越大風險越高...', status: 'active', updatedAt: '2026-01-29' },
            { id: 'K003', title: 'KYC 客戶風險屬性評估流程', category: 'regulation', content: '依據金管會規定，投資人須完成風險屬性評估...', status: 'active', updatedAt: '2026-01-28' },
            { id: 'K004', title: 'ETF 與共同基金的差異', category: 'investment', content: 'ETF（指數股票型基金）與共同基金主要差異在於交易方式...', status: 'inactive', updatedAt: '2026-01-27' }
        ],
        faq: [
            { id: 'F001', question: '如何開戶？', answer: '您可以透過線上或臨櫃方式開戶，線上開戶請準備身分證、第二證件...', status: 'active' },
            { id: 'F002', question: '手續費怎麼計算？', answer: '基金申購手續費依產品類型不同，股票型約 1.5-3%...', status: 'active' },
            { id: 'F003', question: '贖回需要幾天？', answer: '國內基金約 T+2 至 T+3 個工作天，海外基金約 T+5 至 T+7...', status: 'active' }
        ],
        users: [
            { id: 'admin', name: '系統管理員', email: 'admin@finwmai.com', role: 'admin', lastLogin: '2026-01-31 14:25', status: 'active' },
            { id: 'operator01', name: '王曉明', email: 'wang@finwmai.com', role: 'operator', lastLogin: '2026-01-31 13:00', status: 'active' },
            { id: 'compliance01', name: '李合規', email: 'lee@finwmai.com', role: 'compliance', lastLogin: '2026-01-30 17:30', status: 'active' }
        ]
    }
};

// ===== 頁面內容定義 =====
const PageContents = {
    // 儀表板
    dashboard: `
        <div class="page-header">
            <h1 class="page-title">系統儀表板</h1>
            <p class="page-subtitle">歡迎回來！以下是系統運作概況</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue">👥</div>
                <div class="stat-content">
                    <div class="stat-value">1,234</div>
                    <div class="stat-label">活躍用戶數</div>
                    <div class="stat-change positive">↑ 12% 較上月</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">💬</div>
                <div class="stat-content">
                    <div class="stat-value">8,567</div>
                    <div class="stat-label">今日對話數</div>
                    <div class="stat-change positive">↑ 8% 較昨日</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon yellow">📊</div>
                <div class="stat-content">
                    <div class="stat-value">98.5%</div>
                    <div class="stat-label">系統可用率</div>
                    <div class="stat-change positive">正常運作</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon red">⚠️</div>
                <div class="stat-content">
                    <div class="stat-value">3</div>
                    <div class="stat-label">待處理警報</div>
                    <div class="stat-change negative">需要關注</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">📈 近期系統活動</h3>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>時間</th>
                        <th>事件類型</th>
                        <th>描述</th>
                        <th>狀態</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>今日 14:32</td>
                        <td>資料同步</td>
                        <td>客戶資料已成功同步</td>
                        <td><span class="status-badge active">完成</span></td>
                    </tr>
                    <tr>
                        <td>今日 13:15</td>
                        <td>知識庫更新</td>
                        <td>新增 15 筆 FAQ 內容</td>
                        <td><span class="status-badge active">完成</span></td>
                    </tr>
                    <tr>
                        <td>今日 11:45</td>
                        <td>風險警報</td>
                        <td>偵測到異常交易模式</td>
                        <td><span class="status-badge warning">審核中</span></td>
                    </tr>
                    <tr>
                        <td>今日 09:00</td>
                        <td>排程任務</td>
                        <td>每日市場資訊更新完成</td>
                        <td><span class="status-badge active">完成</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,

    // 知識庫管理
    knowledge: () => {
        const categoryNames = { product: '產品知識', investment: '投資知識', regulation: '法規知識' };
        const rows = AdminState.data.knowledge.map(k => `
            <tr>
                <td>${k.id}</td>
                <td>${k.title}</td>
                <td>${categoryNames[k.category] || k.category}</td>
                <td>${k.updatedAt}</td>
                <td><span class="status-badge ${k.status === 'active' ? 'active' : 'inactive'}">${k.status === 'active' ? '啟用' : '停用'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="editKnowledge('${k.id}')">編輯</button>
                    <button class="btn btn-sm btn-outline" onclick="deleteKnowledge('${k.id}', '${k.title.replace(/'/g, "\\'")}')">刪除</button>
                </td>
            </tr>
        `).join('');
        
        return `
        <div class="page-header">
            <h1 class="page-title">📚 知識庫管理</h1>
            <p class="page-subtitle">管理 AI 助手「小雲」的知識內容</p>
        </div>
        
        <div class="toolbar">
            <div class="toolbar-left">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="搜尋知識內容..." onkeyup="filterTable(this, 'knowledgeTable')">
                </div>
                <select class="filter-select" onchange="filterByCategory(this)">
                    <option value="">所有類別</option>
                    <option value="product">產品知識</option>
                    <option value="investment">投資知識</option>
                    <option value="regulation">法規知識</option>
                </select>
            </div>
            <div class="toolbar-right">
                <button class="btn btn-primary" onclick="showModal('addKnowledge')">
                    ➕ 新增知識
                </button>
                <button class="btn btn-secondary">
                    📤 匯入
                </button>
            </div>
        </div>
        
        <div class="card">
            <table class="data-table" id="knowledgeTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>標題</th>
                        <th>類別</th>
                        <th>更新時間</th>
                        <th>狀態</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
    },

    // FAQ 管理
    faq: () => {
        const items = AdminState.data.faq.map(f => `
            <div class="faq-item" style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px;">
                    <div style="flex: 1;">
                        <strong>Q: ${f.question}</strong>
                        <p style="color: #6b7280; margin-top: 5px; font-size: 14px;">A: ${f.answer}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                        <span class="status-badge ${f.status === 'active' ? 'active' : 'inactive'}">${f.status === 'active' ? '啟用' : '停用'}</span>
                        <button class="btn btn-sm btn-outline" onclick="editFaq('${f.id}')">編輯</button>
                        <button class="btn btn-sm btn-outline" onclick="deleteFaq('${f.id}', '${f.question.replace(/'/g, "\\'")}')">刪除</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        return `
        <div class="page-header">
            <h1 class="page-title">❓ FAQ 管理</h1>
            <p class="page-subtitle">管理常見問題與答覆</p>
        </div>
        
        <div class="toolbar">
            <div class="toolbar-left">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="搜尋 FAQ...">
                </div>
            </div>
            <div class="toolbar-right">
                <button class="btn btn-primary" onclick="showModal('addFaq')">➕ 新增 FAQ</button>
            </div>
        </div>
        
        <div class="card">
            <div class="faq-list">${items}</div>
        </div>
    `;
    },

    // 提示詞管理
    prompts: `
        <div class="page-header">
            <h1 class="page-title">💬 提示詞管理</h1>
            <p class="page-subtitle">管理 AI 模型的系統提示詞與對話模板</p>
        </div>
        
        <div class="tabs">
            <div class="tab active">系統提示詞</div>
            <div class="tab">對話模板</div>
            <div class="tab">回應範例</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">目前使用的系統提示詞</h3>
                <button class="btn btn-sm btn-primary">編輯</button>
            </div>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 13px; line-height: 1.8;">
                <p>你是「小雲」，一位親切、專業的智慧理財小助手。你的特點：</p>
                <ul style="margin-left: 20px; margin-top: 10px;">
                    <li>使用繁體中文回答</li>
                    <li>說話親切友善，適時使用表情符號</li>
                    <li>專注於投資理財相關話題</li>
                    <li>能幫助用戶了解資產狀況、投資商品和理財知識</li>
                    <li>回答簡潔明瞭，使用列點和分段讓內容易讀</li>
                    <li>對於超出理財範疇的問題，禮貌地引導回投資話題</li>
                    <li>提醒用戶投資有風險，過去績效不代表未來表現</li>
                </ul>
            </div>
        </div>
    `,

    // 資料源總覽
    datasource: () => `
        <div class="page-header">
            <h1 class="page-title">🔌 資料源管理</h1>
            <p class="page-subtitle">管理各系統資料串接與同步狀態</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon green">✅</div>
                <div class="stat-content">
                    <div class="stat-value">5</div>
                    <div class="stat-label">已連接資料源</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon yellow">⏳</div>
                <div class="stat-content">
                    <div class="stat-value">1</div>
                    <div class="stat-label">同步中</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon red">❌</div>
                <div class="stat-content">
                    <div class="stat-value">0</div>
                    <div class="stat-label">連接失敗</div>
                </div>
            </div>
        </div>
        
        <div class="datasource-grid">
            <div class="datasource-card connected">
                <div class="datasource-header">
                    <div class="datasource-name">
                        <span>👥</span>
                        <h3>客戶資料系統</h3>
                    </div>
                    <span class="status-badge active">已連接</span>
                </div>
                <div class="datasource-meta">
                    <p>📍 API: https://api.internal/customers</p>
                    <p>🕐 最後同步: 2026-01-31 14:30:00</p>
                    <p>📊 資料筆數: 12,345 筆</p>
                </div>
                <div class="datasource-actions">
                    <button class="btn btn-sm btn-outline" onclick="syncData('客戶')">🔄 同步</button>
                    <button class="btn btn-sm btn-outline" onclick="showModal('viewDatasource', {name:'客戶資料系統', type:'customers'})">⚙️ 設定</button>
                    <button class="btn btn-sm btn-outline">📋 日誌</button>
                </div>
            </div>
            
            <div class="datasource-card connected">
                <div class="datasource-header">
                    <div class="datasource-name">
                        <span>💳</span>
                        <h3>帳戶交易系統</h3>
                    </div>
                    <span class="status-badge active">已連接</span>
                </div>
                <div class="datasource-meta">
                    <p>📍 API: https://api.internal/accounts</p>
                    <p>🕐 最後同步: 2026-01-31 14:28:00</p>
                    <p>📊 資料筆數: 45,678 筆</p>
                </div>
                <div class="datasource-actions">
                    <button class="btn btn-sm btn-outline" onclick="syncData('帳戶')">🔄 同步</button>
                    <button class="btn btn-sm btn-outline" onclick="showModal('viewDatasource', {name:'帳戶交易系統', type:'accounts'})">⚙️ 設定</button>
                    <button class="btn btn-sm btn-outline">📋 日誌</button>
                </div>
            </div>
            
            <div class="datasource-card connected">
                <div class="datasource-header">
                    <div class="datasource-name">
                        <span>📦</span>
                        <h3>產品資料系統</h3>
                    </div>
                    <span class="status-badge active">已連接</span>
                </div>
                <div class="datasource-meta">
                    <p>📍 API: https://api.internal/products</p>
                    <p>🕐 最後同步: 2026-01-31 09:00:00</p>
                    <p>📊 資料筆數: 256 筆</p>
                </div>
                <div class="datasource-actions">
                    <button class="btn btn-sm btn-outline" onclick="syncData('產品')">🔄 同步</button>
                    <button class="btn btn-sm btn-outline" onclick="showModal('viewDatasource', {name:'產品資料系統', type:'products'})">⚙️ 設定</button>
                    <button class="btn btn-sm btn-outline">📋 日誌</button>
                </div>
            </div>
            
            <div class="datasource-card connected">
                <div class="datasource-header">
                    <div class="datasource-name">
                        <span>🎯</span>
                        <h3>投資計劃系統</h3>
                    </div>
                    <span class="status-badge active">已連接</span>
                </div>
                <div class="datasource-meta">
                    <p>📍 API: https://api.internal/plans</p>
                    <p>🕐 最後同步: 2026-01-31 14:00:00</p>
                    <p>📊 資料筆數: 8,901 筆</p>
                </div>
                <div class="datasource-actions">
                    <button class="btn btn-sm btn-outline" onclick="syncData('投資計劃')">🔄 同步</button>
                    <button class="btn btn-sm btn-outline" onclick="showModal('viewDatasource', {name:'投資計劃系統', type:'plans'})">⚙️ 設定</button>
                    <button class="btn btn-sm btn-outline">📋 日誌</button>
                </div>
            </div>
            
            <div class="datasource-card connected">
                <div class="datasource-header">
                    <div class="datasource-name">
                        <span>📈</span>
                        <h3>市場資訊系統</h3>
                    </div>
                    <span class="status-badge pending">同步中</span>
                </div>
                <div class="datasource-meta">
                    <p>📍 API: https://api.internal/market</p>
                    <p>🕐 最後同步: 2026-01-31 14:35:00</p>
                    <p>📊 資料筆數: 即時更新</p>
                </div>
                <div class="datasource-actions">
                    <button class="btn btn-sm btn-outline" disabled>⏳ 同步中</button>
                    <button class="btn btn-sm btn-outline" onclick="showModal('viewDatasource', {name:'市場資訊系統', type:'market'})">⚙️ 設定</button>
                    <button class="btn btn-sm btn-outline">📋 日誌</button>
                </div>
            </div>
        </div>
    `,

    // 客戶資料
    customers: `
        <div class="page-header">
            <h1 class="page-title">👥 客戶資料管理</h1>
            <p class="page-subtitle">查詢與管理客戶基本資料</p>
        </div>
        
        <div class="toolbar">
            <div class="toolbar-left">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="搜尋客戶 ID、姓名...">
                </div>
                <select class="filter-select">
                    <option value="">風險屬性</option>
                    <option value="conservative">保守型</option>
                    <option value="moderate">穩健型</option>
                    <option value="aggressive">積極型</option>
                </select>
            </div>
            <div class="toolbar-right">
                <button class="btn btn-secondary">📤 匯出</button>
                <button class="btn btn-primary">🔄 同步資料</button>
            </div>
        </div>
        
        <div class="card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>客戶 ID</th>
                        <th>姓名</th>
                        <th>風險屬性</th>
                        <th>總資產</th>
                        <th>最後更新</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>cust_001</td>
                        <td>官大大</td>
                        <td><span class="status-badge pending">穩健型</span></td>
                        <td>NT$ 2,850,000</td>
                        <td>2026-01-31</td>
                        <td><button class="btn btn-sm btn-outline">詳情</button></td>
                    </tr>
                    <tr>
                        <td>cust_002</td>
                        <td>王小明</td>
                        <td><span class="status-badge active">保守型</span></td>
                        <td>NT$ 1,200,000</td>
                        <td>2026-01-30</td>
                        <td><button class="btn btn-sm btn-outline">詳情</button></td>
                    </tr>
                    <tr>
                        <td>cust_003</td>
                        <td>李美玲</td>
                        <td><span class="status-badge warning">積極型</span></td>
                        <td>NT$ 5,680,000</td>
                        <td>2026-01-31</td>
                        <td><button class="btn btn-sm btn-outline">詳情</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,

    // 帳戶交易
    accounts: `
        <div class="page-header">
            <h1 class="page-title">💳 帳戶交易管理</h1>
            <p class="page-subtitle">查詢帳戶資訊與交易記錄</p>
        </div>
        
        <div class="tabs">
            <div class="tab active">帳戶總覽</div>
            <div class="tab">交易記錄</div>
            <div class="tab">定期定額</div>
        </div>
        
        <div class="toolbar">
            <div class="toolbar-left">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="搜尋帳戶...">
                </div>
            </div>
            <div class="toolbar-right">
                <button class="btn btn-primary">🔄 同步交易</button>
            </div>
        </div>
        
        <div class="card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>帳戶號碼</th>
                        <th>客戶</th>
                        <th>帳戶類型</th>
                        <th>餘額/市值</th>
                        <th>狀態</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>ACC-001-SAV</td>
                        <td>官大大</td>
                        <td>活期存款</td>
                        <td>NT$ 350,000</td>
                        <td><span class="status-badge active">正常</span></td>
                    </tr>
                    <tr>
                        <td>ACC-001-INV</td>
                        <td>官大大</td>
                        <td>投資帳戶</td>
                        <td>NT$ 2,150,000</td>
                        <td><span class="status-badge active">正常</span></td>
                    </tr>
                    <tr>
                        <td>ACC-002-SAV</td>
                        <td>王小明</td>
                        <td>活期存款</td>
                        <td>NT$ 180,000</td>
                        <td><span class="status-badge active">正常</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,

    // 產品資料
    products: `
        <div class="page-header">
            <h1 class="page-title">📦 產品資料管理</h1>
            <p class="page-subtitle">管理可銷售產品資訊</p>
        </div>
        
        <div class="toolbar">
            <div class="toolbar-left">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="搜尋產品...">
                </div>
                <select class="filter-select">
                    <option value="">產品類型</option>
                    <option value="equity">股票型基金</option>
                    <option value="bond">債券型基金</option>
                    <option value="balanced">平衡型基金</option>
                    <option value="money">貨幣市場基金</option>
                </select>
                <select class="filter-select">
                    <option value="">風險等級</option>
                    <option value="1">RR1</option>
                    <option value="2">RR2</option>
                    <option value="3">RR3</option>
                    <option value="4">RR4</option>
                    <option value="5">RR5</option>
                </select>
            </div>
            <div class="toolbar-right">
                <button class="btn btn-primary">🔄 同步產品</button>
            </div>
        </div>
        
        <div class="card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>產品代碼</th>
                        <th>產品名稱</th>
                        <th>類型</th>
                        <th>風險等級</th>
                        <th>淨值</th>
                        <th>狀態</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>FND001</td>
                        <td>全球股票型基金</td>
                        <td>股票型</td>
                        <td>RR4</td>
                        <td>NT$ 25.67</td>
                        <td><span class="status-badge active">可銷售</span></td>
                    </tr>
                    <tr>
                        <td>FND002</td>
                        <td>穩健債券型基金</td>
                        <td>債券型</td>
                        <td>RR2</td>
                        <td>NT$ 12.34</td>
                        <td><span class="status-badge active">可銷售</span></td>
                    </tr>
                    <tr>
                        <td>FND003</td>
                        <td>貨幣市場基金</td>
                        <td>貨幣市場</td>
                        <td>RR1</td>
                        <td>NT$ 10.02</td>
                        <td><span class="status-badge active">可銷售</span></td>
                    </tr>
                    <tr>
                        <td>FND004</td>
                        <td>科技創新基金</td>
                        <td>股票型</td>
                        <td>RR5</td>
                        <td>NT$ 45.89</td>
                        <td><span class="status-badge warning">限額</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,

    // 投資計劃
    plans: `
        <div class="page-header">
            <h1 class="page-title">🎯 投資計劃管理</h1>
            <p class="page-subtitle">管理客戶理財目標與投資計劃</p>
        </div>
        
        <div class="toolbar">
            <div class="toolbar-left">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="搜尋計劃...">
                </div>
            </div>
            <div class="toolbar-right">
                <button class="btn btn-primary">🔄 同步計劃</button>
            </div>
        </div>
        
        <div class="card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>計劃 ID</th>
                        <th>客戶</th>
                        <th>目標類型</th>
                        <th>目標金額</th>
                        <th>目前進度</th>
                        <th>狀態</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>PLN001</td>
                        <td>官大大</td>
                        <td>🎓 子女教育基金</td>
                        <td>NT$ 2,000,000</td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px;">
                                    <div style="width: 65%; height: 100%; background: #10b981; border-radius: 4px;"></div>
                                </div>
                                <span>65%</span>
                            </div>
                        </td>
                        <td><span class="status-badge active">進行中</span></td>
                    </tr>
                    <tr>
                        <td>PLN002</td>
                        <td>官大大</td>
                        <td>🏖️ 退休規劃</td>
                        <td>NT$ 15,000,000</td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px;">
                                    <div style="width: 12%; height: 100%; background: #3b82f6; border-radius: 4px;"></div>
                                </div>
                                <span>12%</span>
                            </div>
                        </td>
                        <td><span class="status-badge active">進行中</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,

    // 市場資訊
    market: `
        <div class="page-header">
            <h1 class="page-title">📈 市場資訊管理</h1>
            <p class="page-subtitle">管理每日市場資訊與投資報告</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue">📊</div>
                <div class="stat-content">
                    <div class="stat-value">台股加權</div>
                    <div class="stat-label">18,234.56</div>
                    <div class="stat-change positive">↑ 1.25%</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">📈</div>
                <div class="stat-content">
                    <div class="stat-value">道瓊工業</div>
                    <div class="stat-label">42,567.89</div>
                    <div class="stat-change positive">↑ 0.45%</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon yellow">💹</div>
                <div class="stat-content">
                    <div class="stat-value">美元/台幣</div>
                    <div class="stat-label">31.25</div>
                    <div class="stat-change negative">↓ 0.12%</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">📰 最新市場報告</h3>
                <button class="btn btn-sm btn-primary">新增報告</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>發布日期</th>
                        <th>報告標題</th>
                        <th>類型</th>
                        <th>狀態</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>2026-01-31</td>
                        <td>2026年2月市場展望</td>
                        <td>月報</td>
                        <td><span class="status-badge active">已發布</span></td>
                        <td><button class="btn btn-sm btn-outline">檢視</button></td>
                    </tr>
                    <tr>
                        <td>2026-01-30</td>
                        <td>美國聯準會利率決策分析</td>
                        <td>專題</td>
                        <td><span class="status-badge active">已發布</span></td>
                        <td><button class="btn btn-sm btn-outline">檢視</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,

    // 風險監控
    risk: `
        <div class="page-header">
            <h1 class="page-title">⚠️ 風險監控中心</h1>
            <p class="page-subtitle">即時監控投資風險與異常狀況</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon red">🚨</div>
                <div class="stat-content">
                    <div class="stat-value">3</div>
                    <div class="stat-label">高風險警報</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon yellow">⚡</div>
                <div class="stat-content">
                    <div class="stat-value">12</div>
                    <div class="stat-label">中風險警報</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">✅</div>
                <div class="stat-content">
                    <div class="stat-value">856</div>
                    <div class="stat-label">正常客戶</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">🔔 待處理風險警報</h3>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>警報時間</th>
                        <th>客戶</th>
                        <th>警報類型</th>
                        <th>風險等級</th>
                        <th>描述</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>2026-01-31 14:25</td>
                        <td>李美玲</td>
                        <td>集中度風險</td>
                        <td><span class="status-badge error">高</span></td>
                        <td>單一產品持倉超過 60%</td>
                        <td>
                            <button class="btn btn-sm btn-primary">處理</button>
                            <button class="btn btn-sm btn-outline">忽略</button>
                        </td>
                    </tr>
                    <tr>
                        <td>2026-01-31 11:30</td>
                        <td>張大華</td>
                        <td>適合度警示</td>
                        <td><span class="status-badge error">高</span></td>
                        <td>購買超出風險承受度產品</td>
                        <td>
                            <button class="btn btn-sm btn-primary">處理</button>
                            <button class="btn btn-sm btn-outline">忽略</button>
                        </td>
                    </tr>
                    <tr>
                        <td>2026-01-31 09:15</td>
                        <td>王小明</td>
                        <td>異常交易</td>
                        <td><span class="status-badge warning">中</span></td>
                        <td>短期內大量贖回</td>
                        <td>
                            <button class="btn btn-sm btn-primary">處理</button>
                            <button class="btn btn-sm btn-outline">忽略</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,

    // 合規審核
    compliance: `
        <div class="page-header">
            <h1 class="page-title">📋 合規審核管理</h1>
            <p class="page-subtitle">管理法規遵循與合規審核流程</p>
        </div>
        
        <div class="tabs">
            <div class="tab active">待審核</div>
            <div class="tab">已通過</div>
            <div class="tab">已拒絕</div>
            <div class="tab">規則設定</div>
        </div>
        
        <div class="card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>申請時間</th>
                        <th>客戶</th>
                        <th>申請類型</th>
                        <th>產品</th>
                        <th>金額</th>
                        <th>狀態</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>2026-01-31 14:00</td>
                        <td>陳大明</td>
                        <td>高風險產品申購</td>
                        <td>科技創新基金</td>
                        <td>NT$ 500,000</td>
                        <td><span class="status-badge pending">待審核</span></td>
                        <td>
                            <button class="btn btn-sm btn-success">核准</button>
                            <button class="btn btn-sm btn-danger">拒絕</button>
                        </td>
                    </tr>
                    <tr>
                        <td>2026-01-31 11:30</td>
                        <td>林小芳</td>
                        <td>大額交易審核</td>
                        <td>穩健債券基金</td>
                        <td>NT$ 2,000,000</td>
                        <td><span class="status-badge pending">待審核</span></td>
                        <td>
                            <button class="btn btn-sm btn-success">核准</button>
                            <button class="btn btn-sm btn-danger">拒絕</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,

    // 稽核日誌
    audit: `
        <div class="page-header">
            <h1 class="page-title">📝 稽核日誌</h1>
            <p class="page-subtitle">系統操作記錄與稽核軌跡</p>
        </div>
        
        <div class="toolbar">
            <div class="toolbar-left">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="搜尋日誌...">
                </div>
                <select class="filter-select">
                    <option value="">操作類型</option>
                    <option value="login">登入</option>
                    <option value="data">資料異動</option>
                    <option value="system">系統操作</option>
                </select>
                <input type="date" class="filter-select" style="padding-right: 12px;">
            </div>
            <div class="toolbar-right">
                <button class="btn btn-secondary">📤 匯出</button>
            </div>
        </div>
        
        <div class="card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>時間</th>
                        <th>操作者</th>
                        <th>操作類型</th>
                        <th>描述</th>
                        <th>IP 位址</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>2026-01-31 14:32:15</td>
                        <td>Admin</td>
                        <td>資料同步</td>
                        <td>手動同步客戶資料</td>
                        <td>192.168.1.100</td>
                    </tr>
                    <tr>
                        <td>2026-01-31 14:30:00</td>
                        <td>System</td>
                        <td>排程任務</td>
                        <td>自動同步交易資料</td>
                        <td>localhost</td>
                    </tr>
                    <tr>
                        <td>2026-01-31 14:25:30</td>
                        <td>Admin</td>
                        <td>登入</td>
                        <td>管理者登入系統</td>
                        <td>192.168.1.100</td>
                    </tr>
                    <tr>
                        <td>2026-01-31 13:15:22</td>
                        <td>Operator01</td>
                        <td>知識庫</td>
                        <td>新增 FAQ 內容</td>
                        <td>192.168.1.105</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,

    // 使用者管理
    users: () => {
        const roleNames = { admin: '系統管理員', operator: '營運人員', compliance: '合規人員', readonly: '唯讀人員' };
        const rows = AdminState.data.users.map(u => `
            <tr>
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${roleNames[u.role] || u.role}</td>
                <td>${u.lastLogin}</td>
                <td><span class="status-badge ${u.status === 'active' ? 'active' : 'inactive'}">${u.status === 'active' ? '啟用' : '停用'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="editUser('${u.id}')">編輯</button>
                    ${u.id !== 'admin' ? `<button class="btn btn-sm btn-outline" onclick="deleteUser('${u.id}', '${u.name.replace(/'/g, "\\'")}')">刪除</button>` : ''}
                </td>
            </tr>
        `).join('');
        
        return `
        <div class="page-header">
            <h1 class="page-title">👤 使用者管理</h1>
            <p class="page-subtitle">管理後台系統使用者帳號</p>
        </div>
        
        <div class="toolbar">
            <div class="toolbar-left">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="搜尋使用者...">
                </div>
            </div>
            <div class="toolbar-right">
                <button class="btn btn-primary" onclick="showModal('addUser')">➕ 新增使用者</button>
            </div>
        </div>
        
        <div class="card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>使用者 ID</th>
                        <th>姓名</th>
                        <th>電子郵件</th>
                        <th>角色</th>
                        <th>最後登入</th>
                        <th>狀態</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
    },

    // 角色權限
    roles: `
        <div class="page-header">
            <h1 class="page-title">🔐 角色權限管理</h1>
            <p class="page-subtitle">設定系統角色與存取權限</p>
        </div>
        
        <div class="toolbar">
            <div class="toolbar-right">
                <button class="btn btn-primary">➕ 新增角色</button>
            </div>
        </div>
        
        <div class="card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>角色名稱</th>
                        <th>描述</th>
                        <th>使用者數</th>
                        <th>權限範圍</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>系統管理員</strong></td>
                        <td>完整系統存取權限</td>
                        <td>1</td>
                        <td>
                            <span class="status-badge active">全部</span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline">檢視</button>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>營運人員</strong></td>
                        <td>日常營運操作權限</td>
                        <td>3</td>
                        <td>
                            <span class="status-badge pending">知識庫</span>
                            <span class="status-badge pending">資料源</span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline">編輯</button>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>合規人員</strong></td>
                        <td>風控合規審核權限</td>
                        <td>2</td>
                        <td>
                            <span class="status-badge pending">風控</span>
                            <span class="status-badge pending">合規</span>
                            <span class="status-badge pending">稽核</span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline">編輯</button>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>唯讀人員</strong></td>
                        <td>僅檢視權限</td>
                        <td>5</td>
                        <td>
                            <span class="status-badge inactive">唯讀</span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline">編輯</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,

    // 系統設定
    settings: `
        <div class="page-header">
            <h1 class="page-title">⚙️ 系統設定</h1>
            <p class="page-subtitle">管理系統參數與組態</p>
        </div>
        
        <div class="tabs">
            <div class="tab active">一般設定</div>
            <div class="tab">AI 模型設定</div>
            <div class="tab">通知設定</div>
            <div class="tab">安全性設定</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">AI 聊天機器人設定</h3>
            </div>
            <div style="display: grid; gap: 20px;">
                <div class="form-group">
                    <label>Ollama API 位址</label>
                    <input type="text" value="http://localhost:11434" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                </div>
                <div class="form-group">
                    <label>使用模型</label>
                    <select class="filter-select" style="width: 100%;">
                        <option value="llama3.1:8b" selected>llama3.1:8b</option>
                        <option value="mistral-nemo:12b">mistral-nemo:12b</option>
                        <option value="gemma3:4b">gemma3:4b</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>回應溫度 (Temperature)</label>
                    <input type="range" min="0" max="100" value="70" style="width: 100%;">
                    <span>0.7</span>
                </div>
                <div class="form-group">
                    <label>最大回應長度</label>
                    <input type="number" value="500" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-primary">💾 儲存設定</button>
                    <button class="btn btn-secondary">🔄 重置為預設</button>
                </div>
            </div>
        </div>
    `
};

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    // 檢查登入狀態
    checkAuth();
    
    // 載入使用者資訊
    loadUserInfo();
    
    // 綁定導航事件
    bindNavigation();
    
    // 載入初始頁面
    loadPage(AdminState.currentPage);
    
    // 更新時間
    updateTime();
    setInterval(updateTime, 1000);
});

// ===== 認證檢查 =====
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
        // Demo 模式：自動登入
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminUser', JSON.stringify({
            id: 'admin',
            name: 'Admin',
            role: '系統管理員',
            loginTime: new Date().toISOString()
        }));
    }
}

// ===== 載入使用者資訊 =====
function loadUserInfo() {
    const userJson = sessionStorage.getItem('adminUser');
    if (userJson) {
        AdminState.user = JSON.parse(userJson);
        
        // 更新 UI
        const userNameEl = document.querySelector('.user-name');
        const userAvatarEl = document.querySelector('.user-avatar');
        
        if (userNameEl && AdminState.user.name) {
            userNameEl.textContent = AdminState.user.name;
        }
        if (userAvatarEl && AdminState.user.name) {
            userAvatarEl.textContent = AdminState.user.name.charAt(0).toUpperCase();
        }
    }
}

// ===== 綁定導航事件 =====
function bindNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) {
                loadPage(page);
            }
        });
    });
}

// ===== 載入頁面 =====
function loadPage(pageName) {
    AdminState.currentPage = pageName;
    
    // 更新導航狀態
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });
    
    // 更新麵包屑
    updateBreadcrumb(pageName);
    
    // 載入頁面內容
    const container = document.getElementById('pageContainer');
    const pageContent = PageContents[pageName];
    
    if (container && pageContent) {
        // 支援函數型或字串型頁面內容
        container.innerHTML = typeof pageContent === 'function' ? pageContent() : pageContent;
    }
    
    // 更新 URL hash
    window.location.hash = pageName;
}

// ===== 表格篩選 =====
function filterTable(input, tableId) {
    const filter = input.value.toLowerCase();
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
}

function filterByCategory(select) {
    const category = select.value;
    // 重新載入頁面並套用篩選（簡化版）
    loadPage('knowledge');
}

// ===== 更新麵包屑 =====
function updateBreadcrumb(pageName) {
    const pageNames = {
        dashboard: '系統儀表板',
        knowledge: '知識庫管理',
        faq: 'FAQ 管理',
        prompts: '提示詞管理',
        datasource: '資料源總覽',
        customers: '客戶資料',
        accounts: '帳戶交易',
        products: '產品資料',
        plans: '投資計劃',
        market: '市場資訊',
        risk: '風險監控',
        compliance: '合規審核',
        audit: '稽核日誌',
        users: '使用者管理',
        roles: '角色權限',
        settings: '系統設定'
    };
    
    const breadcrumb = document.getElementById('breadcrumb');
    if (breadcrumb) {
        breadcrumb.innerHTML = `<span>首頁</span> / <span>${pageNames[pageName] || pageName}</span>`;
    }
}

// ===== 更新時間 =====
function updateTime() {
    const timeEl = document.getElementById('currentTime');
    if (timeEl) {
        const now = new Date();
        timeEl.textContent = now.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// ===== 切換側邊欄 =====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        AdminState.sidebarCollapsed = sidebar.classList.contains('collapsed');
    }
}

// ===== 登出 =====
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUser');
    window.location.href = 'login.html';
}

// ===== 輔助函數：編輯/刪除操作 =====
function editKnowledge(id) {
    const item = AdminState.data.knowledge.find(k => k.id === id);
    if (item) showModal('editKnowledge', item);
}

function deleteKnowledge(id, title) {
    showModal('confirmDelete', { type: 'knowledge', id: id, title: title });
}

function editFaq(id) {
    const item = AdminState.data.faq.find(f => f.id === id);
    if (item) showModal('editFaq', item);
}

function deleteFaq(id, question) {
    showModal('confirmDelete', { type: 'faq', id: id, title: question });
}

function editUser(id) {
    const item = AdminState.data.users.find(u => u.id === id);
    if (item) showModal('editUser', item);
}

function deleteUser(id, name) {
    showModal('confirmDelete', { type: 'user', id: id, title: name });
}

function viewDatasource(id) {
    const datasources = {
        'ds01': { id: 'ds01', name: '核心銀行系統', type: 'SQL', host: '192.168.1.100', database: 'CORE_BANK', status: 'active' },
        'ds02': { id: 'ds02', name: '客戶管理系統 (CRM)', type: 'API', host: 'crm.internal.com', endpoint: '/api/v2', status: 'active' },
        'ds03': { id: 'ds03', name: '基金淨值資料', type: 'API', host: 'funds.api.com', endpoint: '/nav', status: 'active' },
        'ds04': { id: 'ds04', name: '即時股價行情', type: 'WS', host: 'quote.stream.com', channel: 'TWSE', status: 'maintenance' }
    };
    const item = datasources[id];
    if (item) showModal('viewDatasource', item);
}

// ===== Modal 控制 =====
function showModal(modalType, data = null) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    
    if (!overlay || !content) return;
    
    let modalHtml = '';
    
    switch (modalType) {
        case 'addKnowledge':
            modalHtml = getKnowledgeFormModal('新增知識', null);
            break;
        case 'editKnowledge':
            modalHtml = getKnowledgeFormModal('編輯知識', data);
            break;
        case 'addFaq':
            modalHtml = getFaqFormModal('新增 FAQ', null);
            break;
        case 'editFaq':
            modalHtml = getFaqFormModal('編輯 FAQ', data);
            break;
        case 'addUser':
            modalHtml = getUserFormModal('新增使用者', null);
            break;
        case 'editUser':
            modalHtml = getUserFormModal('編輯使用者', data);
            break;
        case 'viewDatasource':
            modalHtml = getDatasourceModal(data);
            break;
        case 'confirmDelete':
            modalHtml = getConfirmDeleteModal(data);
            break;
        default:
            modalHtml = `
                <div class="modal-header">
                    <h3 class="modal-title">提示</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>功能開發中...</p>
                </div>
            `;
    }
    
    content.innerHTML = modalHtml;
    overlay.classList.add('active');
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// ===== 知識庫表單 Modal =====
function getKnowledgeFormModal(title, data) {
    const isEdit = data !== null;
    return `
        <div class="modal-header">
            <h3 class="modal-title">📚 ${title}</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <form id="knowledgeForm" onsubmit="saveKnowledge(event, ${isEdit ? `'${data?.id}'` : 'null'})">
                <div class="form-group">
                    <label>標題 <span class="required">*</span></label>
                    <input type="text" class="form-control" name="title" value="${data?.title || ''}" required placeholder="請輸入知識標題">
                </div>
                <div class="form-group">
                    <label>類別 <span class="required">*</span></label>
                    <select class="form-control" name="category" required>
                        <option value="">請選擇類別</option>
                        <option value="product" ${data?.category === 'product' ? 'selected' : ''}>產品知識</option>
                        <option value="investment" ${data?.category === 'investment' ? 'selected' : ''}>投資知識</option>
                        <option value="regulation" ${data?.category === 'regulation' ? 'selected' : ''}>法規知識</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>內容 <span class="required">*</span></label>
                    <textarea class="form-control" name="content" required placeholder="請輸入知識內容...">${data?.content || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>狀態</label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <label class="switch">
                            <input type="checkbox" name="status" ${!data || data?.status === 'active' ? 'checked' : ''}>
                            <span class="switch-slider"></span>
                        </label>
                        <span id="statusLabel">${!data || data?.status === 'active' ? '啟用' : '停用'}</span>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="document.getElementById('knowledgeForm').requestSubmit()">
                💾 ${isEdit ? '更新' : '新增'}
            </button>
        </div>
    `;
}

function saveKnowledge(event, editId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const knowledge = {
        id: editId || 'K' + String(AdminState.data.knowledge.length + 1).padStart(3, '0'),
        title: formData.get('title'),
        category: formData.get('category'),
        content: formData.get('content'),
        status: formData.get('status') ? 'active' : 'inactive',
        updatedAt: new Date().toISOString().split('T')[0]
    };
    
    if (editId) {
        const index = AdminState.data.knowledge.findIndex(k => k.id === editId);
        if (index !== -1) {
            AdminState.data.knowledge[index] = knowledge;
            showToast('success', '更新成功', '知識內容已更新');
        }
    } else {
        AdminState.data.knowledge.push(knowledge);
        showToast('success', '新增成功', '已新增知識內容');
    }
    
    closeModal();
    loadPage('knowledge');
}

// ===== FAQ 表單 Modal =====
function getFaqFormModal(title, data) {
    const isEdit = data !== null;
    return `
        <div class="modal-header">
            <h3 class="modal-title">❓ ${title}</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <form id="faqForm" onsubmit="saveFaq(event, ${isEdit ? `'${data?.id}'` : 'null'})">
                <div class="form-group">
                    <label>問題 <span class="required">*</span></label>
                    <input type="text" class="form-control" name="question" value="${data?.question || ''}" required placeholder="請輸入常見問題">
                </div>
                <div class="form-group">
                    <label>答覆 <span class="required">*</span></label>
                    <textarea class="form-control" name="answer" required placeholder="請輸入問題答覆..." style="min-height: 150px;">${data?.answer || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>狀態</label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <label class="switch">
                            <input type="checkbox" name="status" ${!data || data?.status === 'active' ? 'checked' : ''}>
                            <span class="switch-slider"></span>
                        </label>
                        <span>${!data || data?.status === 'active' ? '啟用' : '停用'}</span>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="document.getElementById('faqForm').requestSubmit()">
                💾 ${isEdit ? '更新' : '新增'}
            </button>
        </div>
    `;
}

function saveFaq(event, editId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const faq = {
        id: editId || 'F' + String(AdminState.data.faq.length + 1).padStart(3, '0'),
        question: formData.get('question'),
        answer: formData.get('answer'),
        status: formData.get('status') ? 'active' : 'inactive'
    };
    
    if (editId) {
        const index = AdminState.data.faq.findIndex(f => f.id === editId);
        if (index !== -1) {
            AdminState.data.faq[index] = faq;
            showToast('success', '更新成功', 'FAQ 已更新');
        }
    } else {
        AdminState.data.faq.push(faq);
        showToast('success', '新增成功', '已新增 FAQ');
    }
    
    closeModal();
    loadPage('faq');
}

// ===== 使用者表單 Modal =====
function getUserFormModal(title, data) {
    const isEdit = data !== null;
    return `
        <div class="modal-header">
            <h3 class="modal-title">👤 ${title}</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <form id="userForm" onsubmit="saveUser(event, ${isEdit ? `'${data?.id}'` : 'null'})">
                <div class="form-row">
                    <div class="form-group">
                        <label>帳號 <span class="required">*</span></label>
                        <input type="text" class="form-control" name="id" value="${data?.id || ''}" ${isEdit ? 'readonly' : 'required'} placeholder="請輸入帳號">
                    </div>
                    <div class="form-group">
                        <label>姓名 <span class="required">*</span></label>
                        <input type="text" class="form-control" name="name" value="${data?.name || ''}" required placeholder="請輸入姓名">
                    </div>
                </div>
                <div class="form-group">
                    <label>電子郵件 <span class="required">*</span></label>
                    <input type="email" class="form-control" name="email" value="${data?.email || ''}" required placeholder="請輸入電子郵件">
                </div>
                <div class="form-group">
                    <label>角色 <span class="required">*</span></label>
                    <select class="form-control" name="role" required>
                        <option value="">請選擇角色</option>
                        <option value="admin" ${data?.role === 'admin' ? 'selected' : ''}>系統管理員</option>
                        <option value="operator" ${data?.role === 'operator' ? 'selected' : ''}>營運人員</option>
                        <option value="compliance" ${data?.role === 'compliance' ? 'selected' : ''}>合規人員</option>
                        <option value="readonly" ${data?.role === 'readonly' ? 'selected' : ''}>唯讀人員</option>
                    </select>
                </div>
                ${!isEdit ? `
                <div class="form-group">
                    <label>密碼 <span class="required">*</span></label>
                    <input type="password" class="form-control" name="password" required placeholder="請輸入密碼">
                    <p class="form-hint">密碼長度至少 8 個字元</p>
                </div>
                ` : ''}
                <div class="form-group">
                    <label>狀態</label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <label class="switch">
                            <input type="checkbox" name="status" ${!data || data?.status === 'active' ? 'checked' : ''}>
                            <span class="switch-slider"></span>
                        </label>
                        <span>${!data || data?.status === 'active' ? '啟用' : '停用'}</span>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="document.getElementById('userForm').requestSubmit()">
                💾 ${isEdit ? '更新' : '新增'}
            </button>
        </div>
    `;
}

function saveUser(event, editId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const roleNames = {
        admin: '系統管理員',
        operator: '營運人員',
        compliance: '合規人員',
        readonly: '唯讀人員'
    };
    
    const user = {
        id: editId || formData.get('id'),
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role'),
        roleName: roleNames[formData.get('role')],
        lastLogin: editId ? AdminState.data.users.find(u => u.id === editId)?.lastLogin : '-',
        status: formData.get('status') ? 'active' : 'inactive'
    };
    
    if (editId) {
        const index = AdminState.data.users.findIndex(u => u.id === editId);
        if (index !== -1) {
            AdminState.data.users[index] = user;
            showToast('success', '更新成功', '使用者資料已更新');
        }
    } else {
        AdminState.data.users.push(user);
        showToast('success', '新增成功', '已新增使用者');
    }
    
    closeModal();
    loadPage('users');
}

// ===== 資料源設定 Modal =====
function getDatasourceModal(data) {
    return `
        <div class="modal-header">
            <h3 class="modal-title">🔌 ${data.name} 設定</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <form id="datasourceForm">
                <div class="form-group">
                    <label>API 位址</label>
                    <input type="text" class="form-control" name="apiUrl" value="${data.apiUrl || 'https://api.internal/' + data.type}">
                </div>
                <div class="form-group">
                    <label>認證方式</label>
                    <select class="form-control" name="authType">
                        <option value="bearer" selected>Bearer Token</option>
                        <option value="basic">Basic Auth</option>
                        <option value="apikey">API Key</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>認證金鑰</label>
                    <input type="password" class="form-control" name="authKey" value="••••••••••••" placeholder="請輸入認證金鑰">
                </div>
                <div class="form-group">
                    <label>同步間隔</label>
                    <select class="form-control" name="syncInterval">
                        <option value="5">每 5 分鐘</option>
                        <option value="15">每 15 分鐘</option>
                        <option value="30" selected>每 30 分鐘</option>
                        <option value="60">每小時</option>
                        <option value="manual">手動同步</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>啟用狀態</label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <label class="switch">
                            <input type="checkbox" name="enabled" checked>
                            <span class="switch-slider"></span>
                        </label>
                        <span>已啟用</span>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline" onclick="testConnection('${data.type}')">🔗 測試連線</button>
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="saveDatasource('${data.type}')">💾 儲存</button>
        </div>
    `;
}

function testConnection(type) {
    showToast('info', '測試中', '正在測試連線...');
    setTimeout(() => {
        showToast('success', '連線成功', `${type} 資料源連線正常`);
    }, 1500);
}

function saveDatasource(type) {
    showToast('success', '儲存成功', '資料源設定已更新');
    closeModal();
}

// ===== 確認刪除 Modal =====
function getConfirmDeleteModal(data) {
    return `
        <div class="modal-header">
            <h3 class="modal-title">確認刪除</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="confirm-dialog">
                <div class="confirm-icon danger">⚠️</div>
                <div class="confirm-title">確定要刪除嗎？</div>
                <div class="confirm-message">
                    您即將刪除「${data.title || data.question || data.name}」，<br>
                    此操作無法復原。
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-danger" onclick="confirmDelete('${data.type}', '${data.id}')">🗑️ 確認刪除</button>
        </div>
    `;
}

function confirmDelete(type, id) {
    switch (type) {
        case 'knowledge':
            AdminState.data.knowledge = AdminState.data.knowledge.filter(k => k.id !== id);
            showToast('success', '刪除成功', '知識內容已刪除');
            loadPage('knowledge');
            break;
        case 'faq':
            AdminState.data.faq = AdminState.data.faq.filter(f => f.id !== id);
            showToast('success', '刪除成功', 'FAQ 已刪除');
            loadPage('faq');
            break;
        case 'user':
            AdminState.data.users = AdminState.data.users.filter(u => u.id !== id);
            showToast('success', '刪除成功', '使用者已刪除');
            loadPage('users');
            break;
    }
    closeModal();
}

// ===== Toast 通知 =====
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // 自動移除
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ===== 同步資料 =====
function syncData(type) {
    showToast('info', '同步中', `正在同步${type}資料...`);
    setTimeout(() => {
        showToast('success', '同步完成', `${type}資料已更新`);
    }, 2000);
}

// ===== 處理 URL hash 變更 =====
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && PageContents[hash]) {
        loadPage(hash);
    }
});

// 初始載入時檢查 hash
if (window.location.hash) {
    const hash = window.location.hash.slice(1);
    if (PageContents[hash]) {
        AdminState.currentPage = hash;
    }
}

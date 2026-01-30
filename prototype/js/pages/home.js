/**
 * Fin_WMAI - Home Page
 * 首頁模組
 */

function renderHomePage() {
    return `
        <div class="page-header">
            <div class="page-title">
                <img src="${IPIcons.hello}" alt="Fin_WMAI" class="mascot-icon">
                <div>
                    <h1>歡迎回來，${AppState.user.name}！</h1>
                    <p class="text-muted mb-0">開始您的智慧理財之旅</p>
                </div>
            </div>
            <div class="user-actions">
                <div class="notification-wrapper">
                    <button class="btn btn-secondary btn-icon notification-btn" title="通知" onclick="toggleNotificationPanel()">
                        <i class="fas fa-bell"></i>
                        <span class="notification-badge" id="notificationBadge">3</span>
                    </button>
                    <div class="notification-panel" id="notificationPanel">
                        <div class="notification-header">
                            <h5><i class="fas fa-bell"></i> 個人訊息通知</h5>
                            <button class="btn btn-text btn-sm" onclick="markAllNotificationsRead()">全部已讀</button>
                        </div>
                        <div class="notification-list" id="notificationList">
                            <!-- 通知會動態載入 -->
                        </div>
                        <div class="notification-footer">
                            <a href="#" onclick="viewAllNotifications(); return false;">查看所有通知</a>
                        </div>
                    </div>
                </div>
                <button class="btn btn-secondary btn-icon" title="設定">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
        </div>

        <section class="welcome-section animate-fade-in">
            <img src="${IPIcons.hello}" alt="Fin_WMAI" class="welcome-mascot">
            <h2 class="welcome-title">
                用<span class="highlight">理想人生</span>開始規劃
            </h2>
            <p class="welcome-subtitle">
                不需要懂複雜的金融術語，只需要告訴我們您的人生目標，
                讓 AI 智慧助理為您量身打造投資方案。
            </p>
            <button class="btn btn-primary btn-lg" onclick="navigateTo('goals')">
                <i class="fas fa-rocket"></i>
                開始設定目標
            </button>
        </section>

        <section class="feature-cards">
            <div class="feature-card" onclick="navigateTo('goals')">
                <div class="feature-icon">
                    <i class="fas fa-bullseye"></i>
                </div>
                <h3>目標設定</h3>
                <p>選擇您的理想人生場景，從退休、買房到數位遊牧</p>
            </div>
            
            <div class="feature-card" onclick="navigateTo('profile')">
                <div class="feature-icon">
                    <i class="fas fa-user-shield"></i>
                </div>
                <h3>風險評估</h3>
                <p>透過簡單問卷了解您的風險承受度與投資能力</p>
            </div>
            
            <div class="feature-card" onclick="navigateTo('recommendation')">
                <div class="feature-icon">
                    <i class="fas fa-magic"></i>
                </div>
                <h3>AI 白話建議</h3>
                <p>用您聽得懂的語言，提供專屬投資配置建議</p>
            </div>
            
            <div class="feature-card" onclick="navigateTo('execution')">
                <div class="feature-icon">
                    <i class="fas fa-bolt"></i>
                </div>
                <h3>一鍵執行</h3>
                <p>系統自動風控把關，讓投資變得簡單又安心</p>
            </div>
            
            <div class="feature-card" onclick="navigateTo('dashboard')">
                <div class="feature-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h3>智慧儀表板</h3>
                <p>即時追蹤資產變化，掌握目標達成進度</p>
            </div>
            
            <div class="feature-card" onclick="navigateTo('share')">
                <div class="feature-icon">
                    <i class="fas fa-share-alt"></i>
                </div>
                <h3>分享成就</h3>
                <p>記錄您的理財里程碑，與親友分享成果</p>
            </div>
        </section>

        <section class="quick-stats mt-4">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title">
                        <i class="fas fa-lightbulb text-accent"></i>
                        快速入門指南
                    </h4>
                </div>
                <div class="card-body">
                    <div class="steps">
                        <div class="step ${AppState.currentGoal ? 'completed' : 'active'}">
                            <div class="step-number">${AppState.currentGoal ? '<i class="fas fa-check"></i>' : '1'}</div>
                            <span class="step-label">設定目標</span>
                        </div>
                        <div class="step ${AppState.profile ? 'completed' : (AppState.currentGoal ? 'active' : '')}">
                            <div class="step-number">${AppState.profile ? '<i class="fas fa-check"></i>' : '2'}</div>
                            <span class="step-label">風險評估</span>
                        </div>
                        <div class="step ${AppState.recommendation ? 'completed' : (AppState.profile ? 'active' : '')}">
                            <div class="step-number">${AppState.recommendation ? '<i class="fas fa-check"></i>' : '3'}</div>
                            <span class="step-label">查看建議</span>
                        </div>
                        <div class="step ${AppState.actionList.length > 0 && AppState.recommendation ? 'active' : ''}">
                            <div class="step-number">4</div>
                            <span class="step-label">開始投資</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="market-alert mt-4 animate-fade-in">
            <div class="card market-alert-card">
                <div class="card-body">
                    <div class="market-alert-content">
                        <div class="market-alert-icon">
                            <img src="${IPIcons.assetUp}" alt="資產上漲" style="width: 64px; height: 64px;">
                        </div>
                        <div class="market-alert-info">
                            <div class="market-alert-badge">
                                <i class="fas fa-fire"></i>
                                市場熱點
                            </div>
                            <h4 class="market-alert-title">
                                <i class="fas fa-chart-line text-success"></i>
                                AI 產業持續火熱！您的資產正在上漲中 🚀
                            </h4>
                            <p class="market-alert-text">
                                近期 AI 晶片與人工智慧相關產業表現亮眼，您持有的<strong>「科技創新成長基金」</strong>
                                本月已上漲 <span class="text-success">+8.5%</span>。根據市場分析，AI 趨勢仍將持續，
                                建議可考慮持續投入 AI 晶片相關基金或股票，掌握成長機會！
                            </p>
                            <div class="market-alert-actions">
                                <button class="btn btn-primary btn-sm" onclick="navigateTo('recommendation')">
                                    <i class="fas fa-magic"></i>
                                    查看 AI 投資建議
                                </button>
                                <button class="btn btn-outline btn-sm" onclick="navigateTo('execution')">
                                    <i class="fas fa-plus-circle"></i>
                                    加碼投資
                                </button>
                                <button class="btn btn-text btn-sm" onclick="toggleChatbot()">
                                    <i class="fas fa-comment-dots"></i>
                                    詢問小雲
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="info-cards row mt-4">
            <div class="col-6">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex align-center gap-2">
                            <img src="${IPIcons.notice}" alt="提示" style="width: 48px; height: 48px;">
                            <div>
                                <h5 class="mb-1">安全保障</h5>
                                <p class="text-muted mb-0">所有投資建議皆經過合規風控審核</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex align-center gap-2">
                            <img src="${IPIcons.keepCare}" alt="關懷" style="width: 48px; height: 48px;">
                            <div>
                                <h5 class="mb-1">專人協助</h5>
                                <p class="text-muted mb-0">遇到問題？隨時可轉介專業理專服務</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- DEMO 快速模式 -->
        <section class="demo-mode-section mt-4">
            <div class="card" style="border: 2px dashed var(--accent); background: rgba(212, 175, 55, 0.05);">
                <div class="card-body text-center p-3">
                    <h5 class="text-accent mb-2">
                        <i class="fas fa-magic"></i>
                        DEMO 快速體驗模式
                    </h5>
                    <p class="text-muted mb-3" style="font-size: 0.9rem;">
                        想快速體驗完整流程？點擊下方按鈕，系統會自動載入預設的 DEMO 資料
                    </p>
                    <button class="btn btn-primary" onclick="enableDemoMode()">
                        <i class="fas fa-bolt"></i>
                        啟用 DEMO 模式
                    </button>
                </div>
            </div>
        </section>
    `;
}

function initHomePage() {
    logEvent('home_page_viewed');
    // 初始化通知面板
    renderNotifications();
    
    // 點擊其他地方關閉通知面板
    document.addEventListener('click', function(e) {
        const panel = document.getElementById('notificationPanel');
        const wrapper = document.querySelector('.notification-wrapper');
        if (panel && wrapper && !wrapper.contains(e.target)) {
            panel.classList.remove('active');
        }
    });
}

// ===== 通知面板功能 =====
function toggleNotificationPanel() {
    event.stopPropagation();
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.toggle('active');
    }
}

function getPersonalNotifications() {
    // 從 demoDataService 獲取市場資訊和個人化通知
    const notifications = [];
    
    // 個人化市場通知
    notifications.push({
        id: 'notif_001',
        type: 'market',
        icon: '🚀',
        title: 'AI 產業火熱！您的資產持續上漲',
        message: '您持有的「科技創新成長基金」本月上漲 +8.5%，建議持續投入 AI 晶片相關基金。',
        time: '10 分鐘前',
        unread: true,
        action: { text: '查看詳情', page: 'recommendation' }
    });
    
    notifications.push({
        id: 'notif_002',
        type: 'asset',
        icon: '📈',
        title: '恭喜！您的總資產突破 500 萬',
        message: '您的投資組合表現優異，總資產已達 NT$ 5,000,000，未實現獲利 +30 萬元！',
        time: '1 小時前',
        unread: true,
        action: { text: '查看儀表板', page: 'dashboard' }
    });
    
    notifications.push({
        id: 'notif_003',
        type: 'reminder',
        icon: '⏰',
        title: '定期定額扣款提醒',
        message: '您的「全球股票型基金A」將於 2/1 自動扣款 NT$ 10,000。',
        time: '3 小時前',
        unread: true,
        action: { text: '查看交易', page: 'execution' }
    });
    
    notifications.push({
        id: 'notif_004',
        type: 'market',
        icon: '📊',
        title: '台股創新高！投資組合表現',
        message: '台灣加權指數今日突破 25,000 點，您的投資組合受惠上漲。',
        time: '昨天',
        unread: false,
        action: { text: '查看持倉', page: 'dashboard' }
    });
    
    notifications.push({
        id: 'notif_005',
        type: 'goal',
        icon: '🎯',
        title: '目標進度更新',
        message: '您的「退休規劃」目標已完成 45%，距離達成還需 NT$ 550 萬。',
        time: '昨天',
        unread: false,
        action: { text: '查看目標', page: 'goals' }
    });
    
    return notifications;
}

function renderNotifications() {
    const container = document.getElementById('notificationList');
    const badge = document.getElementById('notificationBadge');
    if (!container) return;
    
    const notifications = getPersonalNotifications();
    const unreadCount = notifications.filter(n => n.unread).length;
    
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
    
    container.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.unread ? 'unread' : ''}" onclick="handleNotificationClick('${notif.id}', '${notif.action?.page || ''}')">
            <div class="notification-icon">${notif.icon}</div>
            <div class="notification-content">
                <div class="notification-title">${notif.title}</div>
                <div class="notification-message">${notif.message}</div>
                <div class="notification-time">${notif.time}</div>
            </div>
            ${notif.unread ? '<div class="notification-dot"></div>' : ''}
        </div>
    `).join('');
}

function handleNotificationClick(notifId, page) {
    // 標記已讀
    console.log('Notification clicked:', notifId);
    
    // 關閉面板
    const panel = document.getElementById('notificationPanel');
    if (panel) panel.classList.remove('active');
    
    // 導向對應頁面
    if (page) {
        navigateTo(page);
    }
}

function markAllNotificationsRead() {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.style.display = 'none';
    }
    
    const items = document.querySelectorAll('.notification-item.unread');
    items.forEach(item => item.classList.remove('unread'));
    
    const dots = document.querySelectorAll('.notification-dot');
    dots.forEach(dot => dot.remove());
    
    showToast('success', '已讀', '所有通知已標記為已讀');
}

function viewAllNotifications() {
    showToast('info', '通知中心', '完整通知中心功能開發中...');
}

/**
 * 啟用 DEMO 快速模式
 * 自動載入預設資料，讓用戶可以快速體驗完整流程
 */
async function enableDemoMode() {
    showToast('info', 'DEMO 模式啟動中...', '正在載入預設資料');
    
    try {
        // 確保資料服務已載入
        if (typeof demoDataService !== 'undefined') {
            await demoDataService.loadData();
        }
        
        // 設定預設目標
        const demoGoal = {
            id: 'goal_demo_001',
            type: 'retirement',
            typeName: '退休金',
            icon: '🏖️',
            targetAmount: 10000000,
            targetDate: '2041-01-01',
            initialAmount: 100000,
            monthlyAmount: 15000,
            createdAt: new Date().toISOString()
        };
        AppState.goals = [demoGoal];
        AppState.currentGoal = demoGoal;
        
        // 設定風險屬性
        AppState.user.riskScore = 55;
        AppState.user.riskGrade = '穩健型';
        AppState.profile = {
            answers: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 4 },
            riskScore: 55,
            riskGrade: '穩健型'
        };
        
        // 設定風險揭露已確認
        AppState.riskDisclosureAcknowledged = true;
        
        // 生成建議
        const recommendation = {
            id: 'rec_demo_001',
            allocation: [
                { name: '全球股票型基金A', percent: 40, risk: 'high' },
                { name: '新興市場債券基金B', percent: 25, risk: 'medium' },
                { name: '投資級債券基金C', percent: 20, risk: 'low' },
                { name: '貨幣市場基金D', percent: 15, risk: 'very-low' }
            ],
            rationale: '根據您的穩健型風險屬性和「退休金」目標，我們建議採用股債混合的配置策略。這種配置方式就像一支平衡的籃球隊——既有進攻能力（股票），也有穩固的防守（債券），能在各種市場環境下保持競爭力。',
            riskScenario: '在一般市場波動情況下，您的投資組合可能在短期內出現5-15%的價值變動。這就像搭乘長途飛機時遇到的氣流顛簸，雖然會有起伏，但只要保持航向，最終會安全抵達目的地。',
            worstCase: '在極端市場情況下（如2008年金融海嘯或2020年疫情初期），您的投資組合最大可能損失約25-30%。但歷史經驗顯示，採用定期定額策略的投資者，在市場回升後通常能獲得更好的長期報酬。',
            notes: [
                '建議持有期間至少3-5年',
                '每季度檢視一次配置比例',
                '可設定±5%的再平衡觸發點',
                '定期定額能有效降低進場時機的風險'
            ],
            sourceRef: 'DOC-2026-001-v2.3 / 核准產品池 2026Q1',
            generatedAt: new Date().toISOString()
        };
        AppState.recommendation = recommendation;
        
        // 設定行動清單
        AppState.actionList = [
            { type: 'initial', name: '首次投入', amount: 100000, frequency: 'once' },
            { type: 'regular', name: '定期定額', amount: 15000, frequency: 'monthly' },
            { type: 'rebalance', name: '再平衡檢視', amount: null, frequency: 'quarterly' }
        ];
        
        logEvent('demo_mode_enabled');
        
        showToast('success', 'DEMO 模式已啟用！', '您可以直接體驗完整流程');
        
        // 刷新首頁顯示
        setTimeout(() => {
            navigateTo('home');
        }, 1000);
        
    } catch (error) {
        console.error('DEMO 模式啟用失敗:', error);
        showToast('error', '啟用失敗', '請重新整理頁面後再試');
    }
}

// Export
window.renderHomePage = renderHomePage;
window.initHomePage = initHomePage;
window.toggleNotificationPanel = toggleNotificationPanel;
window.handleNotificationClick = handleNotificationClick;
window.markAllNotificationsRead = markAllNotificationsRead;
window.viewAllNotifications = viewAllNotifications;
window.enableDemoMode = enableDemoMode;

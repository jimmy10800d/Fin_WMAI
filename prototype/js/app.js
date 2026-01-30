/**
 * Fin_WMAI Prototype - Main Application Script
 * 智慧投資理財規劃系統
 */

// ===== Global State =====
const AppState = {
    currentPage: 'home',
    user: {
        name: '官大大',
        status: '新手投資者',
        riskScore: null,
        riskGrade: null
    },
    theme: 'dark', // 'dark' or 'light'
    goals: [],
    currentGoal: null,
    profile: null,
    recommendation: null,
    actionList: [],
    riskDisclosureAcknowledged: false,
    events: []
};

// ===== IP Icon Paths =====
const IPIcons = {
    hello: 'IP_ICON/IP_HELLO.png',
    thinking: 'IP_ICON/IP_THINKING.png',
    notice: 'IP_ICON/IP_NOTICE.png',
    keepCare: 'IP_ICON/IP_KEEPCARE.png',
    keepEarn: 'IP_ICON/IP_KEEPEARN.png',
    assetUp: 'IP_ICON/IP_ASSET_UP.png',
    goodnight: 'IP_ICON/IP_GOODNIGHT.png',
    newChange: 'IP_ICON/IP_NEW_CHANGE.png'
};

// ===== Event Logging =====
function logEvent(eventName, data = {}) {
    const event = {
        event: eventName,
        timestamp: new Date().toISOString(),
        userId: 'user_demo_001',
        ...data
    };
    AppState.events.push(event);
    console.log('📊 Event:', event);
}

// ===== Initialization =====
function initApp() {
    // Simulate loading
    setTimeout(() => {
        hideLoading();
        navigateTo('home');
    }, 1500);
    
    // Setup risk disclosure checkbox listener
    const riskCheckbox = document.getElementById('riskAcknowledge');
    const confirmBtn = document.getElementById('riskConfirmBtn');
    if (riskCheckbox && confirmBtn) {
        riskCheckbox.addEventListener('change', (e) => {
            confirmBtn.disabled = !e.target.checked;
        });
    }
    
    // Initialize theme from localStorage or default
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
}

// ===== Theme Toggle =====
function toggleTheme() {
    const newTheme = AppState.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    logEvent('theme_changed', { theme: newTheme });
}

function setTheme(theme) {
    AppState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update toggle button icon
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        toggleBtn.title = theme === 'dark' ? '切換淺色模式' : '切換深色模式';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }
}

function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
    }
}

// ===== Navigation =====
function navigateTo(page) {
    AppState.currentPage = page;
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
    
    // Close mobile sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
    
    // Render page content
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.innerHTML = getPageContent(page);
        mainContent.scrollTop = 0;
        
        // Initialize page-specific scripts
        initPageScripts(page);
    }
    
    logEvent('page_viewed', { page });
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

function getPageContent(page) {
    switch(page) {
        case 'home': return renderHomePage();
        case 'goals': return renderGoalsPage();
        case 'profile': return renderProfilePage();
        case 'recommendation': return renderRecommendationPage();
        case 'execution': return renderExecutionPage();
        case 'dashboard': return renderDashboardPage();
        case 'share': return renderSharePage();
        default: return renderHomePage();
    }
}

function initPageScripts(page) {
    switch(page) {
        case 'home': initHomePage(); break;
        case 'goals': initGoalsPage(); break;
        case 'profile': initProfilePage(); break;
        case 'recommendation': initRecommendationPage(); break;
        case 'execution': initExecutionPage(); break;
        case 'dashboard': initDashboardPage(); break;
        case 'share': initSharePage(); break;
    }
}

// ===== Risk Disclosure Modal =====
function showRiskDisclosure(callback) {
    const modal = document.getElementById('riskDisclosureModal');
    if (modal) {
        modal.classList.add('active');
        modal.dataset.callback = callback || '';
    }
}

function closeRiskModal() {
    const modal = document.getElementById('riskDisclosureModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function confirmRiskDisclosure() {
    AppState.riskDisclosureAcknowledged = true;
    logEvent('risk_disclosure_acknowledged');
    closeRiskModal();
    
    // Execute callback if exists
    const modal = document.getElementById('riskDisclosureModal');
    if (modal && modal.dataset.callback) {
        eval(modal.dataset.callback);
    }
    
    showToast('success', '已確認風險揭露', '您可以繼續查看投資建議');
}

// ===== Toast Notifications =====
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const icons = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon"><i class="fas ${icons[type]}"></i></span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// ===== Utility Functions =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat('zh-TW').format(num);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

function calculateMonthsBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

// Simple chart rendering (bar chart simulation)
function renderSimpleChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const maxValue = Math.max(...data.map(d => d.value));
    
    let html = '<div class="chart-area">';
    data.forEach((item, index) => {
        const height = (item.value / maxValue) * 100;
        html += `
            <div class="chart-bar" 
                 style="height: ${height}%;" 
                 title="${item.label}: ${formatNumber(item.value)}"
                 data-value="${item.value}">
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Donut chart simulation (CSS-based)
function renderDonutChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const colors = ['#d4af37', '#3498db', '#27ae60', '#e74c3c', '#9b59b6'];
    let cumulativePercent = 0;
    let gradientStops = [];
    
    data.forEach((item, index) => {
        const startPercent = cumulativePercent;
        cumulativePercent += item.percent;
        gradientStops.push(`${colors[index % colors.length]} ${startPercent * 3.6}deg ${cumulativePercent * 3.6}deg`);
    });
    
    container.innerHTML = `
        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="20"/>
            ${renderDonutSegments(data, colors)}
            <circle cx="50" cy="50" r="30" fill="#2d3e50"/>
        </svg>
    `;
}

function renderDonutSegments(data, colors) {
    let segments = '';
    let currentAngle = -90; // Start from top
    
    data.forEach((item, index) => {
        const angle = (item.percent / 100) * 360;
        const largeArc = angle > 180 ? 1 : 0;
        
        const startX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
        const startY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
        const endX = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
        const endY = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
        
        segments += `
            <path d="M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z" 
                  fill="${colors[index % colors.length]}" 
                  opacity="0.8"/>
        `;
        
        currentAngle += angle;
    });
    
    return segments;
}

// ===== API Stub Functions (Simulated) =====
const API = {
    async createGoal(goalData) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const goal = {
            id: 'goal_' + Date.now(),
            ...goalData,
            createdAt: new Date().toISOString()
        };
        AppState.goals.push(goal);
        AppState.currentGoal = goal;
        logEvent('goal_created', { goalId: goal.id, goalType: goal.type });
        return goal;
    },
    
    async submitKYC(answers) {
        await new Promise(resolve => setTimeout(resolve, 800));
        // Calculate risk score based on answers
        const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
        const maxScore = Object.keys(answers).length * 4;
        const riskScore = Math.round((totalScore / maxScore) * 100);
        
        let riskGrade;
        if (riskScore <= 30) riskGrade = '保守型';
        else if (riskScore <= 50) riskGrade = '穩健型';
        else if (riskScore <= 70) riskGrade = '成長型';
        else riskGrade = '積極型';
        
        AppState.user.riskScore = riskScore;
        AppState.user.riskGrade = riskGrade;
        AppState.profile = { answers, riskScore, riskGrade };
        
        logEvent('kyc_completed', { riskScore, riskGrade });
        return { riskScore, riskGrade };
    },
    
    async generateRecommendation() {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const recommendation = {
            id: 'rec_' + Date.now(),
            allocation: [
                { name: '全球股票型基金', percent: 40, risk: 'high' },
                { name: '新興市場債券基金', percent: 25, risk: 'medium' },
                { name: '投資級債券基金', percent: 20, risk: 'low' },
                { name: '貨幣市場基金', percent: 15, risk: 'very-low' }
            ],
            rationale: '根據您的穩健型風險屬性和5年期的退休金目標，我們建議採用股債混合的配置策略。',
            riskScenario: '在一般市場波動情況下，您的投資組合可能在短期內出現5-15%的價值變動。這就像搭乘長途飛機時遇到的氣流顛簸，雖然會有起伏，但只要保持航向，最終會安全抵達目的地。',
            worstCase: '在極端市場情況下（如2008年金融海嘯），您的投資組合最大可能損失約25-30%。但歷史經驗顯示，採用定期定額策略的投資者，在市場回升後通常能獲得更好的長期報酬。',
            notes: [
                '建議持有期間至少3-5年',
                '每季度檢視一次配置比例',
                '可設定再平衡提醒'
            ],
            sourceRef: 'DOC-2026-001-v2.3',
            generatedAt: new Date().toISOString()
        };
        
        AppState.recommendation = recommendation;
        logEvent('recommendation_generated', { recId: recommendation.id });
        
        // Generate action list
        AppState.actionList = [
            { type: 'initial', name: '首次投入', amount: 50000, frequency: 'once' },
            { type: 'regular', name: '定期定額', amount: 5000, frequency: 'monthly' },
            { type: 'rebalance', name: '再平衡檢視', amount: null, frequency: 'quarterly' }
        ];
        
        return recommendation;
    },
    
    async pretradeCheck(orders) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const checks = [
            { name: 'KYC 適配性檢核', status: 'passed' },
            { name: '風險等級匹配', status: 'passed' },
            { name: '投資限額檢查', status: 'passed' },
            { name: '商品池合規確認', status: 'passed' },
            { name: '交易時段確認', status: 'passed' }
        ];
        
        logEvent('pretrade_check_passed', { checks: checks.length });
        return { passed: true, checks };
    },
    
    async submitOrder(orderData) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const order = {
            id: 'order_' + Date.now(),
            ...orderData,
            status: 'completed',
            submittedAt: new Date().toISOString()
        };
        
        logEvent('trade_submitted', { orderId: order.id, amount: orderData.amount });
        logEvent('action_list_accepted');
        
        return order;
    },
    
    async getDashboardData() {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            totalAssets: 156800,
            totalReturn: 12.5,
            goalProgress: 32,
            monthlyInvestment: 5000,
            consecutiveDays: 180,
            assetHistory: [
                { month: '2025-07', value: 50000 },
                { month: '2025-08', value: 55200 },
                { month: '2025-09', value: 58900 },
                { month: '2025-10', value: 62300 },
                { month: '2025-11', value: 71500 },
                { month: '2025-12', value: 85200 },
                { month: '2026-01', value: 156800 }
            ],
            milestones: [
                { id: 1, title: '開始投資之旅', icon: '🚀', achieved: true },
                { id: 2, title: '連續投入30天', icon: '🔥', achieved: true },
                { id: 3, title: '資產突破10萬', icon: '💰', achieved: true },
                { id: 4, title: '連續投入180天', icon: '⭐', achieved: true, isNew: true },
                { id: 5, title: '資產突破50萬', icon: '🏆', achieved: false, progress: 31 }
            ]
        };
    },
    
    async generateShareCard() {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        logEvent('share_card_generated');
        
        return {
            achievement: '連續投入180天',
            progress: '32%',
            days: 180,
            message: '我正在用 Fin_WMAI 規劃我的理想人生！'
        };
    }
};

// Export for global access
window.AppState = AppState;
window.IPIcons = IPIcons;
window.API = API;
window.logEvent = logEvent;
window.navigateTo = navigateTo;
window.toggleSidebar = toggleSidebar;
window.showRiskDisclosure = showRiskDisclosure;
window.closeRiskModal = closeRiskModal;
window.confirmRiskDisclosure = confirmRiskDisclosure;
window.showToast = showToast;
window.formatCurrency = formatCurrency;
window.formatNumber = formatNumber;
window.formatDate = formatDate;
window.renderSimpleChart = renderSimpleChart;
window.renderDonutChart = renderDonutChart;
window.initApp = initApp;

/**
 * Fin_WMAI - Dashboard Page
 * Feature 5: 資產監控與動態導航（Monitoring & Dashboard）
 */

let dashboardData = null;
let chartPeriod = 'month';

function renderDashboardPage() {
    return `
        <div class="page-header">
            <div class="page-title">
                <img src="${IPIcons.assetUp}" alt="儀表板" class="mascot-icon">
                <div>
                    <h1>資產儀表板</h1>
                    <p class="text-muted mb-0">追蹤您的投資進度</p>
                </div>
            </div>
            <div class="user-actions">
                <button class="btn btn-secondary btn-sm" onclick="refreshDashboard()">
                    <i class="fas fa-sync-alt"></i>
                    重新整理
                </button>
            </div>
        </div>

        <!-- Rebalancing Alert (conditional) -->
        <div class="rebalancing-alert" id="rebalancingAlert" style="display: none;">
            <img src="${IPIcons.notice}" alt="注意" class="rebalancing-icon">
            <div class="rebalancing-content">
                <div class="rebalancing-title">
                    <i class="fas fa-exclamation-circle"></i>
                    建議調整配置
                </div>
                <p class="rebalancing-message">
                    偵測到您的資產配置已偏離目標比例超過 5%，建議進行再平衡調整。
                    別擔心，這是正常的市場波動，適時調整可以確保您的投資策略維持在最佳狀態。
                </p>
                <div class="rebalancing-actions">
                    <button class="btn btn-primary btn-sm" onclick="showRebalanceOptions()">
                        <i class="fas fa-balance-scale"></i>
                        查看調整建議
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="dismissRebalanceAlert()">
                        稍後提醒
                    </button>
                </div>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="dashboard-stats" id="dashboardStats">
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-icon">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <span class="stat-change positive" id="totalReturnBadge">+0%</span>
                </div>
                <div class="stat-value" id="totalAssets">--</div>
                <div class="stat-label">總資產</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-icon">
                        <i class="fas fa-bullseye"></i>
                    </div>
                </div>
                <div class="stat-value" id="goalProgress">--%</div>
                <div class="stat-label">目標達成率</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                </div>
                <div class="stat-value" id="monthlyInvestment">--</div>
                <div class="stat-label">每月定期定額</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-icon">
                        <i class="fas fa-fire"></i>
                    </div>
                    <span class="stat-change positive" id="streakBadge">🔥</span>
                </div>
                <div class="stat-value" id="consecutiveDays">--</div>
                <div class="stat-label">連續投入天數</div>
            </div>
        </div>

        <!-- Asset Chart -->
        <div class="chart-container">
            <div class="chart-header">
                <h4 class="chart-title">
                    <i class="fas fa-chart-area text-accent"></i>
                    資產變化曲線
                </h4>
                <div class="chart-tabs">
                    <button class="chart-tab ${chartPeriod === 'week' ? 'active' : ''}" onclick="changeChartPeriod('week')">週</button>
                    <button class="chart-tab ${chartPeriod === 'month' ? 'active' : ''}" onclick="changeChartPeriod('month')">月</button>
                    <button class="chart-tab ${chartPeriod === 'year' ? 'active' : ''}" onclick="changeChartPeriod('year')">年</button>
                </div>
            </div>
            <div id="assetChart" style="height: 300px;">
                <!-- Chart will be rendered here -->
            </div>
            <p class="text-muted text-center mt-2" style="font-size: 0.8rem;">
                <i class="fas fa-info-circle"></i>
                資料更新時間：${new Date().toLocaleString('zh-TW')}
            </p>
        </div>

        <!-- Goal Gap Analysis -->
        <div class="card mb-4">
            <div class="card-header">
                <h4 class="card-title">
                    <i class="fas fa-route text-accent"></i>
                    目標追蹤
                </h4>
            </div>
            <div class="card-body">
                <div class="goal-tracking" id="goalTracking">
                    <div class="goal-track-header">
                        <div>
                            <h5 class="mb-1" id="currentGoalName">載入中...</h5>
                            <span class="text-muted" id="goalTargetDate">--</span>
                        </div>
                        <div class="goal-target-amount" id="goalTargetAmount">--</div>
                    </div>
                    <div class="progress mt-3" style="height: 24px;">
                        <div class="progress-bar" id="goalProgressBar" style="width: 0%"></div>
                    </div>
                    <div class="d-flex justify-between mt-2">
                        <span class="text-muted">目前：<span id="currentAmount">--</span></span>
                        <span class="text-muted">目標：<span id="targetAmount">--</span></span>
                    </div>
                </div>

                <div class="prediction-section mt-4">
                    <h5 class="mb-3">
                        <i class="fas fa-crystal-ball text-accent"></i>
                        預測曲線
                    </h5>
                    <div class="alert alert-info">
                        <span class="alert-icon"><i class="fas fa-info-circle"></i></span>
                        <div>
                            <strong>假設說明</strong>
                            <p class="mb-0">以下預測基於年化報酬率 6% 的假設，實際結果可能因市場波動而有所不同。</p>
                        </div>
                    </div>
                    <div id="predictionInfo" class="mt-3">
                        <p>按照目前的投入計畫，預計於 <strong id="predictedDate">--</strong> 達成目標。</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Holdings Section -->
        <div class="card mb-4">
            <div class="card-header">
                <h4 class="card-title">
                    <i class="fas fa-briefcase text-accent"></i>
                    投資持倉明細
                </h4>
            </div>
            <div class="card-body">
                <div class="holdings-list" id="holdingsList">
                    <!-- Holdings will be rendered here -->
                </div>
            </div>
        </div>

        <!-- Milestones -->
        <div class="milestones-section">
            <h4 class="mb-3">
                <i class="fas fa-trophy text-accent"></i>
                成就里程碑
            </h4>
            <div class="milestone-list" id="milestoneList">
                <!-- Milestones will be rendered here -->
            </div>
        </div>

        <style>
            .goal-tracking {
                background: rgba(255,255,255,0.03);
                border-radius: var(--radius-lg);
                padding: var(--space-lg);
            }
            .goal-track-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .goal-target-amount {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--accent);
            }
            .prediction-section {
                padding-top: var(--space-lg);
                border-top: 1px solid rgba(255,255,255,0.1);
            }
            .holdings-list {
                display: flex;
                flex-direction: column;
                gap: var(--space-md);
            }
            .holding-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-md);
                background: rgba(255,255,255,0.03);
                border-radius: var(--radius-md);
                transition: background 0.2s;
            }
            .holding-item:hover {
                background: rgba(255,255,255,0.06);
            }
            .holding-info {
                display: flex;
                align-items: center;
                gap: var(--space-md);
            }
            .holding-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--bg-dark);
                font-weight: bold;
            }
            .holding-name {
                font-weight: 600;
            }
            .holding-weight {
                font-size: 0.8rem;
                color: var(--gray-400);
            }
            .holding-values {
                text-align: right;
            }
            .holding-value {
                font-weight: 600;
                color: var(--accent);
            }
            .holding-gain {
                font-size: 0.85rem;
            }
            .holding-gain.positive {
                color: var(--success);
            }
            .holding-gain.negative {
                color: var(--danger);
            }
        </style>
    `;
}

async function initDashboardPage() {
    logEvent('dashboard_page_viewed');
    
    try {
        // 優先使用 demoDataService 作為資料來源
        if (typeof demoDataService !== 'undefined' && demoDataService.loaded) {
            dashboardData = getDashboardDataFromService();
        } else {
            dashboardData = await API.getDashboardData();
        }
        
        updateDashboardUI();
        renderAssetChart();
        renderHoldings();
        renderMilestones();
        
        // Show rebalancing alert randomly for demo
        if (Math.random() > 0.5) {
            setTimeout(() => {
                const alert = document.getElementById('rebalancingAlert');
                if (alert) {
                    alert.style.display = 'flex';
                    logEvent('rebalancing_triggered');
                }
            }, 2000);
        }
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showToast('error', '載入失敗', '無法載入儀表板資料');
    }
}

/**
 * 從 demoDataService 獲取儀表板資料
 */
function getDashboardDataFromService() {
    const customerId = 'cust_001';
    const summary = demoDataService.getCustomerAccountSummary(customerId);
    const holdings = demoDataService.getCustomerHoldings(customerId);
    const goals = demoDataService.getCustomerGoals(customerId);
    
    // 計算總報酬率
    const totalGain = holdings ? holdings.reduce((sum, h) => sum + h.unrealizedGain, 0) : 0;
    const totalCost = holdings ? holdings.reduce((sum, h) => sum + (h.marketValue - h.unrealizedGain), 0) : 0;
    const totalReturnPercent = totalCost > 0 ? ((totalGain / totalCost) * 100).toFixed(1) : 0;
    
    // 計算目標進度
    const primaryGoal = goals && goals.length > 0 ? goals[0] : null;
    const goalProgress = primaryGoal 
        ? Math.round((primaryGoal.currentAmount / primaryGoal.targetAmount) * 100)
        : 45;
    
    // 生成資產歷史資料（模擬）
    const assetHistory = generateAssetHistory(summary ? summary.totalAssets : 5000000);
    
    return {
        totalAssets: summary ? summary.totalAssets : 5000000,
        totalReturn: totalReturnPercent,
        goalProgress: goalProgress,
        monthlyInvestment: 25000,
        consecutiveDays: 156,
        assetHistory: assetHistory,
        milestones: [
            { icon: '🎯', title: '開始投資之旅', description: '完成首次投資', achieved: true, date: '2025-03-15' },
            { icon: '💰', title: '突破百萬資產', description: '總資產達到 100 萬', achieved: true, date: '2025-06-20' },
            { icon: '📈', title: '首次獲利 10%', description: '投資報酬率達 10%', achieved: true, date: '2025-09-10' },
            { icon: '🏆', title: '突破 500 萬', description: '總資產達到 500 萬', achieved: true, date: '2026-01-28' },
            { icon: '🌟', title: '達成退休目標', description: '完成退休規劃目標', achieved: false, date: null }
        ]
    };
}

/**
 * 生成資產歷史資料 - 一路向上穩定成長到 500 萬
 */
function generateAssetHistory(currentAssets) {
    const history = [];
    const months = ['2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01'];
    
    // 設定起始資產為 300 萬，展現突破 500 萬的成長軌跡
    const startAssets = 3000000;
    const totalGrowth = currentAssets - startAssets;
    
    months.forEach((month, index) => {
        // 使用平滑曲線確保一路向上
        const progress = index / (months.length - 1);
        // 使用 ease-out 效果：開始快，後面趨緩接近目標
        const easedProgress = 1 - Math.pow(1 - progress, 2);
        
        let value;
        if (index === months.length - 1) {
            // 最後一個月是當前資產（500萬）
            value = currentAssets;
        } else {
            // 計算該月資產
            const baseValue = startAssets + (totalGrowth * easedProgress);
            // 確保每個月都比前一個月高
            if (history.length > 0) {
                const prevValue = history[history.length - 1].value;
                value = Math.max(prevValue + 100000, baseValue); // 至少增加 10 萬
            } else {
                value = baseValue;
            }
        }
        
        history.push({
            month: month,
            value: Math.round(value)
        });
    });
    
    return history;
}

function updateDashboardUI() {
    if (!dashboardData) return;
    
    // Update stat cards
    document.getElementById('totalAssets').textContent = formatCurrency(dashboardData.totalAssets);
    document.getElementById('totalReturnBadge').textContent = `+${dashboardData.totalReturn}%`;
    document.getElementById('goalProgress').textContent = `${dashboardData.goalProgress}%`;
    document.getElementById('monthlyInvestment').textContent = formatCurrency(dashboardData.monthlyInvestment);
    document.getElementById('consecutiveDays').textContent = `${dashboardData.consecutiveDays} 天`;
    
    // Update goal tracking
    const goal = AppState.currentGoal;
    if (goal) {
        document.getElementById('currentGoalName').textContent = goal.typeName || '理財目標';
        document.getElementById('goalTargetDate').textContent = `目標日期：${formatDate(goal.targetDate)}`;
        document.getElementById('goalTargetAmount').textContent = formatCurrency(goal.targetAmount);
        document.getElementById('currentAmount').textContent = formatCurrency(dashboardData.totalAssets);
        document.getElementById('targetAmount').textContent = formatCurrency(goal.targetAmount);
        
        const progressBar = document.getElementById('goalProgressBar');
        if (progressBar) {
            const progress = (dashboardData.totalAssets / goal.targetAmount) * 100;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
        
        // Calculate predicted date
        const monthlyGrowth = dashboardData.monthlyInvestment * 1.005; // Including returns
        const remaining = goal.targetAmount - dashboardData.totalAssets;
        const monthsNeeded = Math.ceil(remaining / monthlyGrowth);
        const predictedDate = new Date();
        predictedDate.setMonth(predictedDate.getMonth() + monthsNeeded);
        document.getElementById('predictedDate').textContent = formatDate(predictedDate);
    }
}

function renderAssetChart() {
    const chartContainer = document.getElementById('assetChart');
    if (!chartContainer || !dashboardData) return;
    
    const data = dashboardData.assetHistory;
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    // 讓最小值從 0 或接近最小值開始，讓差異更明顯
    const adjustedMin = Math.max(0, minValue * 0.9);
    const range = maxValue - adjustedMin;
    
    // 格式化大數字為萬為單位
    const formatChartValue = (value) => {
        if (value >= 10000) {
            return (value / 10000).toFixed(0) + '萬';
        }
        return value.toLocaleString();
    };
    
    // 計算每個柱子的高度百分比
    const bars = data.map((item, index) => {
        const heightPercent = ((item.value - adjustedMin) / range) * 100;
        const isLast = index === data.length - 1;
        return { ...item, heightPercent, isLast, index };
    });
    
    let chartHTML = `
        <style>
            .asset-bar-chart {
                display: flex;
                align-items: flex-end;
                justify-content: space-around;
                height: 250px;
                padding: 30px 10px 50px 10px;
                gap: 8px;
                position: relative;
            }
            .asset-bar-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
                max-width: 100px;
                height: 100%;
                position: relative;
            }
            .asset-bar-wrapper {
                flex: 1;
                width: 100%;
                display: flex;
                align-items: flex-end;
                justify-content: center;
                position: relative;
            }
            .asset-bar {
                width: 100%;
                max-width: 60px;
                background: linear-gradient(180deg, var(--secondary) 0%, #5A7A66 100%);
                border-radius: 8px 8px 2px 2px;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                position: relative;
            }
            .asset-bar.highlight {
                background: linear-gradient(180deg, var(--accent) 0%, #A67C52 100%);
                box-shadow: 0 0 20px rgba(197, 155, 133, 0.5);
            }
            .asset-bar:hover {
                opacity: 0.9;
                transform: scaleY(1.03);
                transform-origin: bottom;
            }
            .asset-bar-dot {
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                width: 14px;
                height: 14px;
                background: var(--secondary);
                border-radius: 50%;
                border: 3px solid var(--bg-card);
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                z-index: 10;
            }
            .asset-bar.highlight .asset-bar-dot {
                width: 18px;
                height: 18px;
                background: var(--accent);
                box-shadow: 0 0 12px rgba(197, 155, 133, 0.8);
            }
            .asset-bar-value {
                position: absolute;
                top: -38px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 11px;
                font-weight: 600;
                color: var(--text-primary);
                white-space: nowrap;
                z-index: 11;
            }
            .asset-bar.highlight .asset-bar-value {
                font-size: 13px;
                font-weight: 700;
                color: var(--accent);
            }
            .asset-bar-label {
                font-size: 13px;
                color: var(--text-secondary);
                margin-top: 12px;
                font-weight: 500;
                padding: 4px 8px;
                border-radius: 4px;
            }
            .asset-bar-label.highlight {
                color: var(--accent);
                font-weight: 700;
                background: rgba(197, 155, 133, 0.15);
            }
        </style>
        <div class="asset-bar-chart">
            ${bars.map(bar => `
                <div class="asset-bar-item">
                    <div class="asset-bar-wrapper">
                        <div class="asset-bar ${bar.isLast ? 'highlight' : ''}" style="height: ${Math.max(bar.heightPercent, 8)}%;">
                            <div class="asset-bar-dot"></div>
                            <div class="asset-bar-value">${formatChartValue(bar.value)}</div>
                        </div>
                    </div>
                    <div class="asset-bar-label ${bar.isLast ? 'highlight' : ''}">${bar.month.split('-')[1]}月</div>
                </div>
            `).join('')}
        </div>
    `;
    
    chartContainer.innerHTML = chartHTML;
}

function renderMilestones() {
    const container = document.getElementById('milestoneList');
    if (!container || !dashboardData) return;
    
    const milestones = dashboardData.milestones;
    
    container.innerHTML = milestones.map(milestone => `
        <div class="milestone-card ${milestone.achieved ? 'achieved' : ''}">
            <div class="milestone-badge">
                ${milestone.icon}
            </div>
            <div class="milestone-content">
                <div class="milestone-title">
                    ${milestone.title}
                    ${milestone.isNew ? '<span class="badge badge-success" style="margin-left: 8px;">NEW</span>' : ''}
                </div>
                <div class="milestone-desc">
                    ${milestone.achieved ? '已達成！' : `進度：${milestone.progress || 0}%`}
                </div>
                ${!milestone.achieved && milestone.progress ? `
                    <div class="milestone-progress">
                        <div class="progress" style="height: 6px;">
                            <div class="progress-bar" style="width: ${milestone.progress}%"></div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    // Trigger milestone achievement event for new ones
    milestones.filter(m => m.isNew && m.achieved).forEach(m => {
        logEvent('milestone_achieved', { milestoneId: m.id, title: m.title });
    });
}

function changeChartPeriod(period) {
    chartPeriod = period;
    
    // Update tabs
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Re-render chart (in real app, would fetch different data)
    renderAssetChart();
    
    showToast('info', '圖表已更新', `顯示${period === 'week' ? '週' : period === 'month' ? '月' : '年'}度資料`);
}

async function refreshDashboard() {
    showToast('info', '更新中', '正在重新整理資料...');
    
    try {
        dashboardData = await API.getDashboardData();
        updateDashboardUI();
        renderAssetChart();
        renderMilestones();
        
        showToast('success', '更新完成', '儀表板資料已是最新');
    } catch (error) {
        showToast('error', '更新失敗', '請稍後再試');
    }
}

function showRebalanceOptions() {
    showToast('info', '再平衡建議', '系統建議將部分股票配置轉換至債券，以維持原定的配置比例');
    
    // In real app, would show a modal with detailed rebalancing options
    logEvent('rebalancing_options_viewed');
}

function dismissRebalanceAlert() {
    const alert = document.getElementById('rebalancingAlert');
    if (alert) {
        alert.style.display = 'none';
    }
}

/**
 * 渲染持倉明細
 */
function renderHoldings() {
    const container = document.getElementById('holdingsList');
    if (!container) return;
    
    // 從 demoDataService 獲取持倉資料
    let holdings = [];
    if (typeof demoDataService !== 'undefined' && demoDataService.loaded) {
        holdings = demoDataService.getCustomerHoldings('cust_001') || [];
    }
    
    if (holdings.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted p-4">
                <i class="fas fa-info-circle"></i>
                目前沒有持倉資料
            </div>
        `;
        return;
    }
    
    container.innerHTML = holdings.map((holding, index) => {
        const gainClass = holding.unrealizedGain >= 0 ? 'positive' : 'negative';
        const gainSign = holding.unrealizedGain >= 0 ? '+' : '';
        const gainPercent = ((holding.unrealizedGain / (holding.marketValue - holding.unrealizedGain)) * 100).toFixed(2);
        const iconColors = ['#d4af37', '#3498db', '#27ae60', '#9b59b6', '#e74c3c'];
        const iconColor = iconColors[index % iconColors.length];
        
        return `
            <div class="holding-item">
                <div class="holding-info">
                    <div class="holding-icon" style="background: linear-gradient(135deg, ${iconColor} 0%, ${iconColor}dd 100%);">
                        ${holding.productName.charAt(0)}
                    </div>
                    <div>
                        <div class="holding-name">${holding.productName}</div>
                        <div class="holding-weight">佔比 ${(holding.weight * 100).toFixed(1)}%</div>
                    </div>
                </div>
                <div class="holding-values">
                    <div class="holding-value">${formatCurrency(holding.marketValue)}</div>
                    <div class="holding-gain ${gainClass}">
                        ${gainSign}${formatCurrency(holding.unrealizedGain)} (${gainSign}${gainPercent}%)
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Export
window.renderDashboardPage = renderDashboardPage;
window.initDashboardPage = initDashboardPage;
window.changeChartPeriod = changeChartPeriod;
window.refreshDashboard = refreshDashboard;
window.showRebalanceOptions = showRebalanceOptions;
window.dismissRebalanceAlert = dismissRebalanceAlert;

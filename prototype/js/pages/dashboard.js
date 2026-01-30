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
        </style>
    `;
}

async function initDashboardPage() {
    logEvent('dashboard_page_viewed');
    
    try {
        dashboardData = await API.getDashboardData();
        updateDashboardUI();
        renderAssetChart();
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
    
    // Create simple bar chart
    let chartHTML = '<div class="chart-area" style="display: flex; align-items: flex-end; gap: 8px; height: 100%; padding: 20px;">';
    
    data.forEach((item, index) => {
        const height = (item.value / maxValue) * 100;
        const isLast = index === data.length - 1;
        
        chartHTML += `
            <div class="chart-bar-container" style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                <div class="chart-value" style="font-size: 0.7rem; color: var(--gray-500); margin-bottom: 4px;">
                    ${formatNumber(item.value)}
                </div>
                <div class="chart-bar" style="
                    width: 100%;
                    height: ${height}%;
                    background: ${isLast ? 'var(--accent)' : 'var(--secondary)'};
                    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
                    min-height: 20px;
                    transition: height 0.5s ease;
                "></div>
                <div class="chart-label" style="font-size: 0.7rem; color: var(--gray-600); margin-top: 4px;">
                    ${item.month.split('-')[1]}月
                </div>
            </div>
        `;
    });
    
    chartHTML += '</div>';
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

// Export
window.renderDashboardPage = renderDashboardPage;
window.initDashboardPage = initDashboardPage;
window.changeChartPeriod = changeChartPeriod;
window.refreshDashboard = refreshDashboard;
window.showRebalanceOptions = showRebalanceOptions;
window.dismissRebalanceAlert = dismissRebalanceAlert;

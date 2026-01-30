/**
 * Fin_WMAI - Demo Data Loader
 * 載入預設示範資料，方便快速展示完整流程
 */

const DemoData = {
    // 預設目標
    goal: {
        id: 'goal_demo_001',
        type: 'retirement',
        typeName: '退休金',
        icon: '🏖️',
        targetAmount: 5000000,
        targetDate: '2031-01-30',
        initialAmount: 50000,
        monthlyAmount: 5000,
        createdAt: '2025-07-15T10:30:00Z'
    },
    
    // 預設風險評估結果
    profile: {
        answers: { 1: 2, 2: 3, 3: 3, 4: 3, 5: 3 },
        riskScore: 55,
        riskGrade: '穩健型'
    },
    
    // 預設推薦方案
    recommendation: {
        id: 'rec_demo_001',
        allocation: [
            { name: '全球股票型基金', percent: 40, risk: 'high' },
            { name: '新興市場債券基金', percent: 25, risk: 'medium' },
            { name: '投資級債券基金', percent: 20, risk: 'low' },
            { name: '貨幣市場基金', percent: 15, risk: 'very-low' }
        ],
        rationale: '根據您的穩健型風險屬性和5年期的退休金目標，我們建議採用股債混合的配置策略。這種配置方式就像一支平衡的籃球隊——既有進攻能力（股票），也有穩固的防守（債券），能在各種市場環境下保持競爭力。',
        riskScenario: '在一般市場波動情況下，您的投資組合可能在短期內出現5-15%的價值變動。這就像搭乘長途飛機時遇到的氣流顛簸，雖然會有起伏，但只要保持航向，最終會安全抵達目的地。歷史數據顯示，類似配置在過去10年的年化報酬率約為6-8%。',
        worstCase: '在極端市場情況下（如2008年金融海嘯或2020年疫情初期），您的投資組合最大可能損失約25-30%。但歷史經驗顯示，採用定期定額策略的投資者，在市場回升後通常能獲得更好的長期報酬。以2020年為例，市場在3月大跌後，到年底已完全恢復並創新高。',
        notes: [
            '建議持有期間至少3-5年，讓投資組合有足夠時間度過市場週期',
            '每季度檢視一次配置比例，確保維持在目標範圍內',
            '可設定±5%的再平衡觸發點，系統會自動提醒',
            '定期定額能有效降低進場時機的風險',
            '若有重大生活變化，建議重新評估風險屬性'
        ],
        sourceRef: 'DOC-2026-001-v2.3 / 核准產品池 2026Q1',
        generatedAt: new Date().toISOString()
    },
    
    // 預設行動清單
    actionList: [
        { type: 'initial', name: '首次投入', amount: 50000, frequency: 'once' },
        { type: 'regular', name: '定期定額', amount: 5000, frequency: 'monthly' },
        { type: 'rebalance', name: '再平衡檢視', amount: null, frequency: 'quarterly' }
    ],
    
    // 儀表板數據
    dashboard: {
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
    }
};

/**
 * 載入完整 Demo 資料（模擬已完成所有步驟的用戶）
 */
function loadFullDemo() {
    AppState.currentGoal = DemoData.goal;
    AppState.goals = [DemoData.goal];
    AppState.profile = DemoData.profile;
    AppState.user.riskScore = DemoData.profile.riskScore;
    AppState.user.riskGrade = DemoData.profile.riskGrade;
    AppState.recommendation = DemoData.recommendation;
    AppState.actionList = DemoData.actionList;
    AppState.riskDisclosureAcknowledged = true;
    
    console.log('✅ Demo 資料已載入');
    showToast('success', 'Demo 模式', '已載入完整示範資料');
    
    // 重新渲染當前頁面
    navigateTo(AppState.currentPage);
}

/**
 * 載入部分 Demo 資料（模擬剛完成目標設定的用戶）
 */
function loadPartialDemo() {
    AppState.currentGoal = DemoData.goal;
    AppState.goals = [DemoData.goal];
    
    console.log('✅ 部分 Demo 資料已載入（僅目標）');
    showToast('info', 'Demo 模式', '已載入目標設定，請繼續完成評估');
    
    navigateTo('profile');
}

/**
 * 重置所有資料
 */
function resetDemo() {
    AppState.currentGoal = null;
    AppState.goals = [];
    AppState.profile = null;
    AppState.user.riskScore = null;
    AppState.user.riskGrade = null;
    AppState.recommendation = null;
    AppState.actionList = [];
    AppState.riskDisclosureAcknowledged = false;
    AppState.events = [];
    
    console.log('🔄 Demo 資料已重置');
    showToast('info', '已重置', '所有資料已清除');
    
    navigateTo('home');
}

/**
 * 顯示 Demo 控制面板
 */
function showDemoPanel() {
    const existingPanel = document.getElementById('demoPanel');
    if (existingPanel) {
        existingPanel.remove();
        return;
    }
    
    const panel = document.createElement('div');
    panel.id = 'demoPanel';
    panel.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(26, 35, 50, 0.95);
        border: 1px solid var(--accent);
        border-radius: 12px;
        padding: 16px;
        z-index: 9999;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        min-width: 200px;
    `;
    
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <strong style="color: var(--accent);">🎮 Demo 控制</strong>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: var(--gray-500); cursor: pointer; font-size: 1.2rem;">
                ×
            </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <button onclick="loadFullDemo()" class="btn btn-primary btn-sm">
                <i class="fas fa-play"></i> 載入完整 Demo
            </button>
            <button onclick="loadPartialDemo()" class="btn btn-secondary btn-sm">
                <i class="fas fa-forward"></i> 載入部分 Demo
            </button>
            <button onclick="resetDemo()" class="btn btn-outline btn-sm">
                <i class="fas fa-redo"></i> 重置所有資料
            </button>
            <button onclick="showEventLog()" class="btn btn-secondary btn-sm">
                <i class="fas fa-list"></i> 查看事件記錄
            </button>
        </div>
        <div style="margin-top: 12px; font-size: 0.75rem; color: var(--gray-600);">
            快捷鍵：Ctrl + D 開關面板
        </div>
    `;
    
    document.body.appendChild(panel);
}

/**
 * 顯示事件記錄
 */
function showEventLog() {
    console.log('📊 事件記錄：', AppState.events);
    
    const events = AppState.events.slice(-10);
    const message = events.length > 0 
        ? events.map(e => `• ${e.event}`).join('\n')
        : '尚無事件記錄';
    
    alert(`最近事件記錄（${events.length}/${AppState.events.length}）：\n\n${message}`);
}

// 快捷鍵支援
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        showDemoPanel();
    }
});

// 頁面載入完成後顯示提示
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('💡 提示：按 Ctrl + D 開啟 Demo 控制面板');
    }, 2000);
});

// Export
window.DemoData = DemoData;
window.loadFullDemo = loadFullDemo;
window.loadPartialDemo = loadPartialDemo;
window.resetDemo = resetDemo;
window.showDemoPanel = showDemoPanel;
window.showEventLog = showEventLog;

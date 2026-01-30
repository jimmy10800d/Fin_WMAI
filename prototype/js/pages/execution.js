/**
 * Fin_WMAI - Execution Page
 * Feature 4: 交易執行與合規（Execution & Compliance）
 */

let pretradeCheckComplete = false;
let orderSubmitted = false;

function renderExecutionPage() {
    if (!AppState.recommendation) {
        return renderNeedRecommendation();
    }
    
    if (orderSubmitted) {
        return renderOrderSuccess();
    }
    
    return renderExecutionForm();
}

function renderNeedRecommendation() {
    return `
        <div class="page-header">
            <div class="page-title">
                <img src="${IPIcons.notice}" alt="提示" class="mascot-icon">
                <div>
                    <h1>交易執行</h1>
                    <p class="text-muted mb-0">一鍵下單</p>
                </div>
            </div>
        </div>

        <div class="empty-state">
            <img src="${IPIcons.thinking}" alt="思考中" class="empty-state-icon">
            <h3>請先查看投資建議</h3>
            <p>在執行交易之前，請先查看並確認 AI 為您生成的投資建議</p>
            <button class="btn btn-primary" onclick="navigateTo('recommendation')">
                <i class="fas fa-magic"></i>
                查看投資建議
            </button>
        </div>
    `;
}

function renderExecutionForm() {
    const actionList = AppState.actionList;
    const recommendation = AppState.recommendation;
    const totalAmount = actionList
        .filter(a => a.amount)
        .reduce((sum, a) => sum + a.amount, 0);
    
    return `
        <div class="page-header">
            <div class="page-title">
                <img src="${IPIcons.keepEarn}" alt="執行交易" class="mascot-icon">
                <div>
                    <h1>交易執行</h1>
                    <p class="text-muted mb-0">確認並執行您的投資計畫</p>
                </div>
            </div>
        </div>

        <div class="alert alert-info mb-4">
            <span class="alert-icon"><i class="fas fa-shield-alt"></i></span>
            <div>
                <strong>交易保護機制</strong>
                <p class="mb-0">所有交易都會經過即時風控檢核，確保符合您的風險屬性與投資限額。</p>
            </div>
        </div>

        <!-- Action List -->
        <div class="card mb-4">
            <div class="card-header">
                <h4 class="card-title">
                    <i class="fas fa-list-check text-accent"></i>
                    投資行動清單
                </h4>
            </div>
            <div class="card-body">
                <div class="action-list">
                    ${actionList.map(action => renderActionItem(action)).join('')}
                </div>
            </div>
        </div>

        <!-- Allocation Breakdown -->
        <div class="card mb-4">
            <div class="card-header">
                <h4 class="card-title">
                    <i class="fas fa-chart-pie text-accent"></i>
                    配置明細
                </h4>
            </div>
            <div class="card-body">
                <div class="allocation-breakdown">
                    ${recommendation.allocation.map((item, index) => `
                        <div class="allocation-row">
                            <div class="allocation-info">
                                <span class="allocation-color" style="background: ${getAllocationColorExec(index)}"></span>
                                <span class="allocation-name">${item.name}</span>
                                <span class="badge badge-${getRiskBadgeClass(item.risk)}">${getRiskLabel(item.risk)}</span>
                            </div>
                            <div class="allocation-values">
                                <span class="allocation-percent">${item.percent}%</span>
                                <span class="allocation-amount">${formatCurrency(totalAmount * item.percent / 100)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- Pre-trade Check -->
        <div class="pretrade-check" id="pretradeCheck">
            <div class="pretrade-check-title">
                <i class="fas fa-clipboard-check text-accent"></i>
                <h4 class="mb-0">交易前檢核（Pre-trade Check）</h4>
            </div>
            <div class="check-list" id="checkList">
                <div class="check-item">
                    <div class="check-status pending">
                        <i class="fas fa-clock"></i>
                    </div>
                    <span class="check-label">KYC 適配性檢核</span>
                </div>
                <div class="check-item">
                    <div class="check-status pending">
                        <i class="fas fa-clock"></i>
                    </div>
                    <span class="check-label">風險等級匹配</span>
                </div>
                <div class="check-item">
                    <div class="check-status pending">
                        <i class="fas fa-clock"></i>
                    </div>
                    <span class="check-label">投資限額檢查</span>
                </div>
                <div class="check-item">
                    <div class="check-status pending">
                        <i class="fas fa-clock"></i>
                    </div>
                    <span class="check-label">商品池合規確認</span>
                </div>
                <div class="check-item">
                    <div class="check-status pending">
                        <i class="fas fa-clock"></i>
                    </div>
                    <span class="check-label">交易時段確認</span>
                </div>
            </div>
            <div class="text-center mt-3">
                <button class="btn btn-secondary" id="runCheckBtn" onclick="runPretradeCheck()">
                    <i class="fas fa-play"></i>
                    執行檢核
                </button>
            </div>
        </div>

        <!-- Order Section -->
        <div class="order-section" id="orderSection" style="opacity: 0.5; pointer-events: none;">
            <div class="order-total">
                <div class="order-total-label">首次投入總金額</div>
                <div class="order-total-amount">${formatCurrency(totalAmount)}</div>
            </div>
            
            <div class="form-check mb-3" style="justify-content: center;">
                <input type="checkbox" class="form-check-input" id="confirmOrder">
                <label class="form-check-label" for="confirmOrder">
                    我已確認上述交易內容，並同意執行
                </label>
            </div>
            
            <button class="btn btn-primary order-btn" id="orderBtn" disabled onclick="submitOrder()">
                <i class="fas fa-bolt"></i>
                確認執行 / 一鍵下單
            </button>
            
            <p class="text-muted mt-3" style="font-size: 0.8rem;">
                <i class="fas fa-lock"></i>
                交易資料將透過加密通道傳輸，確保您的資訊安全
            </p>
        </div>

        <div class="d-flex justify-between mt-4">
            <button class="btn btn-secondary" onclick="navigateTo('recommendation')">
                <i class="fas fa-arrow-left"></i>
                返回投資建議
            </button>
            <button class="btn btn-outline" onclick="requestAdvisor()">
                <i class="fas fa-user-tie"></i>
                轉介真人協助
            </button>
        </div>

        <style>
            .allocation-breakdown {
                display: flex;
                flex-direction: column;
                gap: var(--space-md);
            }
            .allocation-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-md);
                background: rgba(255,255,255,0.03);
                border-radius: var(--radius-md);
            }
            .allocation-info {
                display: flex;
                align-items: center;
                gap: var(--space-md);
            }
            .allocation-values {
                display: flex;
                align-items: center;
                gap: var(--space-lg);
            }
            .allocation-amount {
                font-weight: 600;
                color: var(--accent);
                min-width: 120px;
                text-align: right;
            }
            .badge {
                padding: 4px 8px;
                border-radius: var(--radius-full);
                font-size: 0.7rem;
                font-weight: 600;
            }
            .badge-success {
                background: rgba(39, 174, 96, 0.2);
                color: var(--success);
            }
            .badge-warning {
                background: rgba(243, 156, 18, 0.2);
                color: var(--warning);
            }
            .badge-danger {
                background: rgba(231, 76, 60, 0.2);
                color: var(--danger);
            }
            .badge-info {
                background: rgba(52, 152, 219, 0.2);
                color: var(--secondary);
            }
        </style>
    `;
}

function renderActionItem(action) {
    const icons = {
        initial: 'fa-coins',
        regular: 'fa-calendar-check',
        rebalance: 'fa-balance-scale'
    };
    
    const frequencies = {
        once: '單次',
        monthly: '每月',
        quarterly: '每季'
    };
    
    return `
        <div class="action-item">
            <div class="action-icon">
                <i class="fas ${icons[action.type] || 'fa-check'}"></i>
            </div>
            <div class="action-content">
                <div class="action-title">${action.name}</div>
                <div class="action-desc">執行頻率：${frequencies[action.frequency] || action.frequency}</div>
            </div>
            <div class="action-amount">
                ${action.amount ? formatCurrency(action.amount) : '-'}
            </div>
        </div>
    `;
}

function renderOrderSuccess() {
    return `
        <div class="page-header">
            <div class="page-title">
                <img src="${IPIcons.assetUp}" alt="成功" class="mascot-icon">
                <div>
                    <h1>交易成功！</h1>
                    <p class="text-muted mb-0">您的投資之旅已正式開始</p>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-body text-center p-4">
                <div style="font-size: 5rem; margin-bottom: var(--space-lg);">🎉</div>
                <h2 class="text-accent mb-3">恭喜您完成首次投資！</h2>
                <p class="text-muted mb-4">
                    您的投資計畫已成功執行，系統將持續為您監控資產狀況，<br>
                    並在需要時提供調整建議。
                </p>
                
                <div class="row justify-center gap-3 mb-4">
                    <div class="col-3">
                        <div class="stat-card">
                            <div class="stat-value">${formatCurrency(55000)}</div>
                            <div class="stat-label">投入金額</div>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="stat-card">
                            <div class="stat-value">4</div>
                            <div class="stat-label">投資標的</div>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="stat-card">
                            <div class="stat-value">5</div>
                            <div class="stat-label">通過檢核</div>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-success">
                    <span class="alert-icon"><i class="fas fa-check-circle"></i></span>
                    <div>
                        <strong>定期定額已設定</strong>
                        <p class="mb-0">每月 5,000 元將於每月 10 日自動扣款投入</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="d-flex justify-center gap-3">
            <button class="btn btn-secondary" onclick="navigateTo('dashboard')">
                <i class="fas fa-chart-line"></i>
                查看儀表板
            </button>
            <button class="btn btn-primary" onclick="navigateTo('share')">
                <i class="fas fa-share-alt"></i>
                分享成就
            </button>
        </div>
    `;
}

function initExecutionPage() {
    logEvent('execution_page_viewed');
    
    // Setup confirm checkbox listener
    setTimeout(() => {
        const confirmCheckbox = document.getElementById('confirmOrder');
        const orderBtn = document.getElementById('orderBtn');
        
        if (confirmCheckbox && orderBtn) {
            confirmCheckbox.addEventListener('change', (e) => {
                orderBtn.disabled = !e.target.checked || !pretradeCheckComplete;
            });
        }
    }, 100);
}

async function runPretradeCheck() {
    const checkList = document.getElementById('checkList');
    const runCheckBtn = document.getElementById('runCheckBtn');
    const orderSection = document.getElementById('orderSection');
    
    if (!checkList) return;
    
    // Disable button
    if (runCheckBtn) {
        runCheckBtn.disabled = true;
        runCheckBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 檢核中...';
    }
    
    const checkItems = checkList.querySelectorAll('.check-item');
    
    try {
        // Simulate checking each item
        for (let i = 0; i < checkItems.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 400));
            
            const statusEl = checkItems[i].querySelector('.check-status');
            if (statusEl) {
                statusEl.classList.remove('pending');
                statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                await new Promise(resolve => setTimeout(resolve, 300));
                
                statusEl.classList.add('passed');
                statusEl.innerHTML = '<i class="fas fa-check"></i>';
            }
        }
        
        // Call API
        const result = await API.pretradeCheck(AppState.actionList);
        
        if (result.passed) {
            pretradeCheckComplete = true;
            
            // Enable order section
            if (orderSection) {
                orderSection.style.opacity = '1';
                orderSection.style.pointerEvents = 'auto';
            }
            
            // Update button
            if (runCheckBtn) {
                runCheckBtn.innerHTML = '<i class="fas fa-check"></i> 檢核通過';
                runCheckBtn.classList.remove('btn-secondary');
                runCheckBtn.classList.add('btn-success');
            }
            
            showToast('success', '檢核通過！', '所有項目皆符合規定，可以執行交易');
        }
        
    } catch (error) {
        showToast('error', '檢核失敗', '請稍後再試');
        console.error('Pretrade check failed:', error);
        
        if (runCheckBtn) {
            runCheckBtn.disabled = false;
            runCheckBtn.innerHTML = '<i class="fas fa-redo"></i> 重新檢核';
        }
    }
}

async function submitOrder() {
    const orderBtn = document.getElementById('orderBtn');
    
    if (!pretradeCheckComplete) {
        showToast('warning', '請先完成檢核', '交易前需要通過所有風控檢核');
        return;
    }
    
    // Disable button and show loading
    if (orderBtn) {
        orderBtn.disabled = true;
        orderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 處理中...';
    }
    
    try {
        const totalAmount = AppState.actionList
            .filter(a => a.amount)
            .reduce((sum, a) => sum + a.amount, 0);
        
        await API.submitOrder({
            amount: totalAmount,
            actionList: AppState.actionList,
            allocation: AppState.recommendation.allocation
        });
        
        orderSubmitted = true;
        
        showToast('success', '交易成功！', '您的投資計畫已開始執行');
        
        // Re-render page
        navigateTo('execution');
        
    } catch (error) {
        showToast('error', '交易失敗', '請稍後再試或聯繫客服');
        console.error('Order submission failed:', error);
        
        logEvent('trade_failed', { error: error.message });
        
        if (orderBtn) {
            orderBtn.disabled = false;
            orderBtn.innerHTML = '<i class="fas fa-bolt"></i> 確認執行 / 一鍵下單';
        }
    }
}

function requestAdvisor() {
    logEvent('advisor_referral_requested', { source: 'execution_page' });
    showToast('info', '轉介申請已送出', '專業理專將於 1 個工作天內與您聯繫');
}

// Helper functions
function getAllocationColorExec(index) {
    const colors = ['#d4af37', '#3498db', '#27ae60', '#9b59b6', '#e74c3c'];
    return colors[index % colors.length];
}

function getRiskBadgeClass(risk) {
    switch(risk) {
        case 'very-low': return 'success';
        case 'low': return 'success';
        case 'medium': return 'warning';
        case 'high': return 'danger';
        default: return 'info';
    }
}

function getRiskLabel(risk) {
    switch(risk) {
        case 'very-low': return '極低風險';
        case 'low': return '低風險';
        case 'medium': return '中風險';
        case 'high': return '高風險';
        default: return '一般';
    }
}

// Export
window.renderExecutionPage = renderExecutionPage;
window.initExecutionPage = initExecutionPage;
window.runPretradeCheck = runPretradeCheck;
window.submitOrder = submitOrder;
window.requestAdvisor = requestAdvisor;

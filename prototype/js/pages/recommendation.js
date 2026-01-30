/**
 * Fin_WMAI - Recommendation Page
 * Feature 3: AI 白話化投資建議（AI Advisory & Plain Language）
 */

const ExplainStrategies = {
    default: {
        name: '標準說明',
        icon: '📖'
    },
    athlete: {
        name: '運動員比喻',
        icon: '🏃',
        transform: (text) => text
            .replace(/投資組合/g, '訓練計畫')
            .replace(/波動/g, '體能起伏')
            .replace(/報酬/g, '成績進步')
            .replace(/風險/g, '受傷風險')
    },
    navigator: {
        name: '導航比喻',
        icon: '🧭',
        transform: (text) => text
            .replace(/投資組合/g, '航行路線')
            .replace(/波動/g, '海浪顛簸')
            .replace(/報酬/g, '抵達目的地')
            .replace(/風險/g, '航行風險')
    },
    garden: {
        name: '園藝比喻',
        icon: '🌱',
        transform: (text) => text
            .replace(/投資組合/g, '花園規劃')
            .replace(/波動/g, '季節變化')
            .replace(/報酬/g, '收成')
            .replace(/風險/g, '病蟲害風險')
    }
};

let currentExplainStrategy = 'default';
let isGenerating = false;

function renderRecommendationPage() {
    if (!AppState.riskDisclosureAcknowledged) {
        return renderNeedRiskDisclosure();
    }
    
    if (!AppState.profile) {
        return renderNeedProfile();
    }
    
    if (!AppState.recommendation) {
        return renderGenerating();
    }
    
    return renderRecommendation();
}

function renderNeedRiskDisclosure() {
    return `
        <div class="page-header">
            <div class="page-title">
                <img src="${IPIcons.notice}" alt="提示" class="mascot-icon">
                <div>
                    <h1>AI 投資建議</h1>
                    <p class="text-muted mb-0">請先確認風險揭露</p>
                </div>
            </div>
        </div>

        <div class="empty-state">
            <img src="${IPIcons.notice}" alt="注意" class="empty-state-icon">
            <h3>請先確認風險揭露</h3>
            <p>在查看投資建議之前，請先閱讀並確認風險揭露聲明</p>
            <button class="btn btn-primary" onclick="showRiskDisclosure(\"navigateTo('recommendation')\")">
                <i class="fas fa-file-alt"></i>
                查看風險揭露
            </button>
        </div>
    `;
}

function renderNeedProfile() {
    return `
        <div class="page-header">
            <div class="page-title">
                <img src="${IPIcons.notice}" alt="提示" class="mascot-icon">
                <div>
                    <h1>AI 投資建議</h1>
                    <p class="text-muted mb-0">白話化投資配置建議</p>
                </div>
            </div>
        </div>

        <div class="empty-state">
            <img src="${IPIcons.thinking}" alt="思考中" class="empty-state-icon">
            <h3>請先完成風險評估</h3>
            <p>我們需要了解您的風險承受度，才能提供適合的建議</p>
            <button class="btn btn-primary" onclick="navigateTo('profile')">
                <i class="fas fa-user-shield"></i>
                開始風險評估
            </button>
        </div>
    `;
}

function renderGenerating() {
    return `
        <div class="page-header">
            <div class="page-title">
                <img src="${IPIcons.thinking}" alt="思考中" class="mascot-icon">
                <div>
                    <h1>AI 投資建議</h1>
                    <p class="text-muted mb-0">正在為您生成專屬建議...</p>
                </div>
            </div>
        </div>

        <div class="ai-loading">
            <img src="${IPIcons.thinking}" alt="AI思考中" class="ai-loading-mascot">
            <div class="spinner"></div>
            <h3 class="mt-3">AI 正在分析您的資料...</h3>
            <p class="text-muted">根據您的目標、風險屬性和市場狀況，為您量身打造投資建議</p>
            
            <div class="loading-steps mt-4" id="loadingSteps">
                <div class="check-item">
                    <div class="check-status passed">
                        <i class="fas fa-check"></i>
                    </div>
                    <span class="check-label">讀取您的目標設定</span>
                </div>
                <div class="check-item">
                    <div class="check-status" id="step2">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <span class="check-label">分析風險屬性</span>
                </div>
                <div class="check-item">
                    <div class="check-status pending" id="step3">
                        <i class="fas fa-clock"></i>
                    </div>
                    <span class="check-label">配對核准商品池</span>
                </div>
                <div class="check-item">
                    <div class="check-status pending" id="step4">
                        <i class="fas fa-clock"></i>
                    </div>
                    <span class="check-label">生成白話建議</span>
                </div>
                <div class="check-item">
                    <div class="check-status pending" id="step5">
                        <i class="fas fa-clock"></i>
                    </div>
                    <span class="check-label">合規審查</span>
                </div>
            </div>
        </div>
    `;
}

function renderRecommendation() {
    const rec = AppState.recommendation;
    const profile = AppState.profile;
    const goal = AppState.currentGoal;
    
    return `
        <div class="page-header">
            <div class="page-title">
                <img src="${IPIcons.keepEarn}" alt="投資建議" class="mascot-icon">
                <div>
                    <h1>AI 投資建議</h1>
                    <p class="text-muted mb-0">專為您的「${goal?.typeName || '理財目標'}」量身打造</p>
                </div>
            </div>
            <div class="user-actions">
                <button class="btn btn-secondary btn-sm" onclick="regenerateRecommendation()">
                    <i class="fas fa-sync-alt"></i>
                    重新生成
                </button>
            </div>
        </div>

        <div class="alert alert-success mb-4">
            <span class="alert-icon"><i class="fas fa-check-circle"></i></span>
            <div>
                <strong>建議已通過合規審查</strong>
                <p class="mb-0">所有推薦商品皆在核准商品池內，且符合您的風險屬性（${profile.riskGrade}）</p>
            </div>
        </div>

        <div class="recommendation-card">
            <div class="recommendation-header">
                <div class="recommendation-type">
                    <div class="recommendation-type-icon">
                        <i class="fas fa-chart-pie"></i>
                    </div>
                    <div>
                        <h4 class="mb-0">資產配置建議</h4>
                        <span class="text-muted">Based on ${profile.riskGrade} Profile</span>
                    </div>
                </div>
                <div class="explain-strategy-selector">
                    <select class="form-control form-select" style="width: auto;" onchange="changeExplainStrategy(this.value)">
                        ${Object.entries(ExplainStrategies).map(([key, strategy]) => 
                            `<option value="${key}" ${currentExplainStrategy === key ? 'selected' : ''}>
                                ${strategy.icon} ${strategy.name}
                            </option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            
            <div class="recommendation-body">
                <!-- 配置比例 -->
                <div class="recommendation-section">
                    <h5 class="recommendation-section-title">
                        <i class="fas fa-th-large"></i>
                        建議配置比例
                    </h5>
                    <div class="allocation-chart">
                        <div class="allocation-donut" id="allocationDonut"></div>
                        <div class="allocation-legend">
                            ${rec.allocation.map((item, index) => `
                                <div class="allocation-item">
                                    <span class="allocation-color" style="background: ${getAllocationColor(index)}"></span>
                                    <span class="allocation-name">${item.name}</span>
                                    <span class="allocation-percent">${item.percent}%</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- 配置理由 -->
                <div class="recommendation-section">
                    <h5 class="recommendation-section-title">
                        <i class="fas fa-lightbulb"></i>
                        配置理由
                        <button class="explain-btn" onclick="explainMore('rationale')">
                            <i class="fas fa-question-circle"></i> 聽不懂？
                        </button>
                    </h5>
                    <div class="recommendation-text" id="rationaleText">
                        <p>${rec.rationale}</p>
                    </div>
                    <div class="source-ref">
                        <i class="fas fa-link"></i>
                        來源：核准文件 ${rec.sourceRef}
                    </div>
                </div>

                <!-- 風險情境 -->
                <div class="recommendation-section">
                    <h5 class="recommendation-section-title">
                        <i class="fas fa-chart-line"></i>
                        風險情境說明
                        <button class="explain-btn" onclick="explainMore('risk')">
                            <i class="fas fa-question-circle"></i> 聽不懂？
                        </button>
                    </h5>
                    <div class="recommendation-text" id="riskText">
                        <p>${rec.riskScenario}</p>
                    </div>
                </div>

                <!-- 最壞狀況 -->
                <div class="recommendation-section">
                    <h5 class="recommendation-section-title text-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        最壞狀況提醒
                    </h5>
                    <div class="alert alert-warning">
                        <div>
                            <p class="mb-0">${rec.worstCase}</p>
                        </div>
                    </div>
                </div>

                <!-- 注意事項 -->
                <div class="recommendation-section">
                    <h5 class="recommendation-section-title">
                        <i class="fas fa-clipboard-list"></i>
                        注意事項
                    </h5>
                    <ul class="recommendation-notes">
                        ${rec.notes.map(note => `
                            <li><i class="fas fa-check text-success"></i> ${note}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>

        <!-- Trust Thermometer -->
        <div class="trust-thermometer">
            <div class="trust-thermometer-header">
                <h5 class="mb-0">
                    <i class="fas fa-thermometer-half text-accent"></i>
                    這個建議對您有幫助嗎？
                </h5>
            </div>
            <div class="trust-scale">
                <div class="trust-level" onclick="submitTrustFeedback(1)" title="完全沒幫助">😞</div>
                <div class="trust-level" onclick="submitTrustFeedback(2)" title="幫助有限">😐</div>
                <div class="trust-level" onclick="submitTrustFeedback(3)" title="還可以">🙂</div>
                <div class="trust-level" onclick="submitTrustFeedback(4)" title="很有幫助">😊</div>
                <div class="trust-level" onclick="submitTrustFeedback(5)" title="非常滿意">🤩</div>
            </div>
        </div>

        <div class="d-flex justify-between mt-4">
            <button class="btn btn-secondary" onclick="navigateTo('profile')">
                <i class="fas fa-arrow-left"></i>
                返回評估結果
            </button>
            <button class="btn btn-primary btn-lg" onclick="navigateTo('execution')">
                <i class="fas fa-bolt"></i>
                立即執行
            </button>
        </div>

        <style>
            .recommendation-notes {
                list-style: none;
                padding: 0;
            }
            .recommendation-notes li {
                padding: var(--space-sm) 0;
                display: flex;
                align-items: center;
                gap: var(--space-sm);
                color: var(--gray-300);
            }
        </style>
    `;
}

async function initRecommendationPage() {
    logEvent('recommendation_page_viewed');
    
    if (AppState.riskDisclosureAcknowledged && AppState.profile && !AppState.recommendation && !isGenerating) {
        await generateRecommendation();
    }
    
    // Render donut chart if recommendation exists
    if (AppState.recommendation) {
        setTimeout(() => {
            renderDonutChart('allocationDonut', AppState.recommendation.allocation);
        }, 100);
    }
}

async function generateRecommendation() {
    isGenerating = true;
    
    // Simulate loading steps
    const steps = ['step2', 'step3', 'step4', 'step5'];
    
    for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const stepEl = document.getElementById(steps[i]);
        if (stepEl) {
            stepEl.classList.remove('pending');
            stepEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            if (i > 0) {
                const prevStep = document.getElementById(steps[i-1]);
                if (prevStep) {
                    prevStep.classList.add('passed');
                    prevStep.innerHTML = '<i class="fas fa-check"></i>';
                }
            }
        }
    }
    
    try {
        await API.generateRecommendation();
        
        // Complete last step
        const lastStep = document.getElementById('step5');
        if (lastStep) {
            lastStep.classList.add('passed');
            lastStep.innerHTML = '<i class="fas fa-check"></i>';
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        isGenerating = false;
        navigateTo('recommendation');
        
    } catch (error) {
        isGenerating = false;
        showToast('error', '生成失敗', '請稍後再試');
        console.error('Recommendation generation failed:', error);
    }
}

function regenerateRecommendation() {
    AppState.recommendation = null;
    navigateTo('recommendation');
}

function getAllocationColor(index) {
    const colors = ['#d4af37', '#3498db', '#27ae60', '#9b59b6', '#e74c3c'];
    return colors[index % colors.length];
}

function changeExplainStrategy(strategy) {
    currentExplainStrategy = strategy;
    
    // Transform text if needed
    if (strategy !== 'default' && ExplainStrategies[strategy]?.transform) {
        const rec = AppState.recommendation;
        const transform = ExplainStrategies[strategy].transform;
        
        const rationaleText = document.getElementById('rationaleText');
        const riskText = document.getElementById('riskText');
        
        if (rationaleText) {
            rationaleText.innerHTML = `<p>${transform(rec.rationale)}</p>`;
        }
        if (riskText) {
            riskText.innerHTML = `<p>${transform(rec.riskScenario)}</p>`;
        }
        
        showToast('info', '說明方式已切換', `現在使用「${ExplainStrategies[strategy].name}」解釋`);
    } else {
        // Reset to original
        const rec = AppState.recommendation;
        const rationaleText = document.getElementById('rationaleText');
        const riskText = document.getElementById('riskText');
        
        if (rationaleText) {
            rationaleText.innerHTML = `<p>${rec.rationale}</p>`;
        }
        if (riskText) {
            riskText.innerHTML = `<p>${rec.riskScenario}</p>`;
        }
    }
}

function explainMore(section) {
    logEvent('explainability_retry_clicked', { 
        section,
        currentStrategy: currentExplainStrategy 
    });
    
    // Cycle to next explanation strategy
    const strategies = Object.keys(ExplainStrategies);
    const currentIndex = strategies.indexOf(currentExplainStrategy);
    const nextIndex = (currentIndex + 1) % strategies.length;
    const nextStrategy = strategies[nextIndex];
    
    // Update selector
    const selector = document.querySelector('.explain-strategy-selector select');
    if (selector) {
        selector.value = nextStrategy;
    }
    
    changeExplainStrategy(nextStrategy);
}

function submitTrustFeedback(level) {
    // Update UI
    document.querySelectorAll('.trust-level').forEach((el, index) => {
        el.classList.remove('selected');
        if (index < level) {
            el.classList.add('selected');
        }
    });
    
    logEvent('trust_thermometer_feedback_submitted', { level });
    showToast('success', '感謝您的回饋！', '您的意見將幫助我們持續改進');
}

// Export
window.renderRecommendationPage = renderRecommendationPage;
window.initRecommendationPage = initRecommendationPage;
window.regenerateRecommendation = regenerateRecommendation;
window.changeExplainStrategy = changeExplainStrategy;
window.explainMore = explainMore;
window.submitTrustFeedback = submitTrustFeedback;

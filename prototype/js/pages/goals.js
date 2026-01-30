/**
 * Fin_WMAI - Goals Page
 * Feature 1: 啟蒙與目標設定（Onboarding & Goal Setting）
 */

const GoalTypes = [
    { id: 'retirement', name: '退休金', icon: '🏖️', desc: '安心退休，享受生活' },
    { id: 'house', name: '買房頭期款', icon: '🏠', desc: '擁有自己的家' },
    { id: 'education', name: '教育金', icon: '🎓', desc: '為孩子的未來儲備' },
    { id: 'nomad', name: '數位遊牧', icon: '🌍', desc: '自由工作，環遊世界' },
    { id: 'pet', name: '寵物養老金', icon: '🐕', desc: '給毛孩最好的照顧' },
    { id: 'car', name: '購車基金', icon: '🚗', desc: '擁有夢想座駕' },
    { id: 'wedding', name: '結婚基金', icon: '💒', desc: '完美婚禮籌備' },
    { id: 'custom', name: '自訂目標', icon: '✨', desc: '打造專屬理財場景' }
];

let selectedGoalType = null;

function renderGoalsPage() {
    return `
        <div class="page-header">
            <div class="page-title">
                <img src="${IPIcons.assetUp}" alt="目標設定" class="mascot-icon">
                <div>
                    <h1>目標設定</h1>
                    <p class="text-muted mb-0">選擇您的理想人生場景</p>
                </div>
            </div>
        </div>

        <div class="steps mb-4">
            <div class="step active">
                <div class="step-number">1</div>
                <span class="step-label">選擇目標</span>
            </div>
            <div class="step">
                <div class="step-number">2</div>
                <span class="step-label">設定細節</span>
            </div>
            <div class="step">
                <div class="step-number">3</div>
                <span class="step-label">確認計畫</span>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header">
                <h4 class="card-title">
                    <i class="fas fa-star text-accent"></i>
                    選擇您的理財目標
                </h4>
                <span class="text-muted">點選最符合您期望的場景</span>
            </div>
            <div class="card-body">
                <div class="goal-tags" id="goalTags">
                    ${GoalTypes.map(goal => `
                        <div class="goal-tag" data-goal-id="${goal.id}" onclick="selectGoalType('${goal.id}')">
                            <span class="goal-tag-icon">${goal.icon}</span>
                            <span class="goal-tag-name">${goal.name}</span>
                            <span class="goal-tag-desc">${goal.desc}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="goal-form-section hidden" id="goalFormSection">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title" id="goalFormTitle">
                        <i class="fas fa-edit text-accent"></i>
                        設定目標細節
                    </h4>
                </div>
                <div class="card-body">
                    <form id="goalForm" onsubmit="submitGoalForm(event)">
                        <div class="row">
                            <div class="col-6">
                                <div class="form-group">
                                    <label class="form-label required">目標金額</label>
                                    <div class="input-group">
                                        <input type="number" class="form-control" id="goalAmount" 
                                               placeholder="例如：5000000" min="10000" step="10000" required>
                                        <span class="input-group-append">TWD</span>
                                    </div>
                                    <span class="form-hint">您希望達成的總金額</span>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="form-group">
                                    <label class="form-label required">預計達成時間</label>
                                    <input type="date" class="form-control" id="goalDate" required>
                                    <span class="form-hint">設定一個合理的目標日期</span>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-6">
                                <div class="form-group">
                                    <label class="form-label required">目前可投入金額（單筆）</label>
                                    <div class="input-group">
                                        <input type="number" class="form-control" id="initialAmount" 
                                               placeholder="例如：50000" min="0" step="1000" required>
                                        <span class="input-group-append">TWD</span>
                                    </div>
                                    <span class="form-hint">首次可投入的金額</span>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="form-group">
                                    <label class="form-label required">每月可投入金額</label>
                                    <div class="input-group">
                                        <input type="number" class="form-control" id="monthlyAmount" 
                                               placeholder="例如：5000" min="1000" step="1000" required>
                                        <span class="input-group-append">TWD</span>
                                    </div>
                                    <span class="form-hint">每月可定期投入的金額</span>
                                </div>
                            </div>
                        </div>

                        <div class="form-group" id="customGoalNameGroup" style="display: none;">
                            <label class="form-label required">自訂目標名稱</label>
                            <input type="text" class="form-control" id="customGoalName" 
                                   placeholder="例如：環遊世界基金">
                        </div>

                        <div class="goal-preview hidden" id="goalPreview">
                            <div class="goal-preview-title">
                                <i class="fas fa-calculator"></i>
                                <h4 class="mb-0">目標試算預覽</h4>
                            </div>
                            <div class="goal-stats" id="goalStats">
                                <!-- Will be populated by JS -->
                            </div>
                        </div>

                        <div class="d-flex justify-between mt-4">
                            <button type="button" class="btn btn-secondary" onclick="resetGoalSelection()">
                                <i class="fas fa-arrow-left"></i>
                                重新選擇
                            </button>
                            <button type="submit" class="btn btn-primary">
                                確認目標
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="card mt-4" id="customGoalSuggestion" style="display: none;">
            <div class="card-body">
                <div class="d-flex align-center gap-3">
                    <img src="${IPIcons.thinking}" alt="思考中" style="width: 60px; height: 60px;">
                    <div>
                        <h5>沒有找到合適的場景？</h5>
                        <p class="text-muted mb-2">您可以建議新的理財場景，我們會持續優化！</p>
                        <button class="btn btn-outline btn-sm" onclick="showCustomGoalInput()">
                            <i class="fas fa-plus"></i>
                            建議新場景
                        </button>
                    </div>
                </div>
                <div class="custom-goal-input hidden" id="customGoalInputArea">
                    <div class="form-group mb-2">
                        <input type="text" class="form-control" id="newSceneName" 
                               placeholder="輸入您想要的理財場景名稱">
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="submitNewScenario()">
                        <i class="fas fa-paper-plane"></i>
                        送出建議
                    </button>
                </div>
            </div>
        </div>

        <div class="alert alert-info mt-4">
            <span class="alert-icon"><i class="fas fa-info-circle"></i></span>
            <div>
                <strong>小額起步提示</strong>
                <p class="mb-0">我們建議新手從小額開始，每月最低投入門檻只要 NT$1,000！隨著您對投資的了解加深，可以逐步增加投入金額。</p>
            </div>
        </div>
    `;
}

function initGoalsPage() {
    logEvent('goals_page_viewed');
    
    // Set default date to 5 years from now
    const dateInput = document.getElementById('goalDate');
    if (dateInput) {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 5);
        dateInput.min = new Date().toISOString().split('T')[0];
        dateInput.value = futureDate.toISOString().split('T')[0];
    }
    
    // Show custom goal suggestion after a delay
    setTimeout(() => {
        const suggestion = document.getElementById('customGoalSuggestion');
        if (suggestion) suggestion.style.display = 'block';
    }, 2000);
    
    // Add input listeners for preview
    ['goalAmount', 'goalDate', 'initialAmount', 'monthlyAmount'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateGoalPreview);
        }
    });
}

function selectGoalType(goalId) {
    selectedGoalType = GoalTypes.find(g => g.id === goalId);
    
    // Update UI
    document.querySelectorAll('.goal-tag').forEach(tag => {
        tag.classList.remove('selected');
        if (tag.dataset.goalId === goalId) {
            tag.classList.add('selected');
        }
    });
    
    // Show form
    const formSection = document.getElementById('goalFormSection');
    const formTitle = document.getElementById('goalFormTitle');
    const customNameGroup = document.getElementById('customGoalNameGroup');
    
    if (formSection) {
        formSection.classList.remove('hidden');
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    if (formTitle) {
        formTitle.innerHTML = `
            <span style="font-size: 1.5rem; margin-right: 8px;">${selectedGoalType.icon}</span>
            ${selectedGoalType.name} - 設定細節
        `;
    }
    
    if (customNameGroup) {
        customNameGroup.style.display = goalId === 'custom' ? 'block' : 'none';
    }
    
    // Update steps
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) step.classList.add('completed');
        if (index === 1) step.classList.add('active');
    });
    
    logEvent('goal_type_selected', { goalType: goalId });
}

function updateGoalPreview() {
    const goalAmount = parseFloat(document.getElementById('goalAmount')?.value) || 0;
    const goalDate = document.getElementById('goalDate')?.value;
    const initialAmount = parseFloat(document.getElementById('initialAmount')?.value) || 0;
    const monthlyAmount = parseFloat(document.getElementById('monthlyAmount')?.value) || 0;
    
    if (goalAmount && goalDate && monthlyAmount) {
        const preview = document.getElementById('goalPreview');
        const stats = document.getElementById('goalStats');
        
        if (preview && stats) {
            preview.classList.remove('hidden');
            
            const months = calculateMonthsBetween(new Date(), new Date(goalDate));
            const totalContribution = initialAmount + (monthlyAmount * months);
            const gap = goalAmount - totalContribution;
            const assumedReturn = 0.06; // 6% annual return assumption
            const projectedValue = calculateFutureValue(initialAmount, monthlyAmount, months, assumedReturn);
            const gapWithReturn = goalAmount - projectedValue;
            
            stats.innerHTML = `
                <div class="goal-stat">
                    <div class="goal-stat-value">${months}</div>
                    <div class="goal-stat-label">投資月數</div>
                </div>
                <div class="goal-stat">
                    <div class="goal-stat-value">${formatCurrency(totalContribution)}</div>
                    <div class="goal-stat-label">總投入金額</div>
                </div>
                <div class="goal-stat">
                    <div class="goal-stat-value">${formatCurrency(projectedValue)}</div>
                    <div class="goal-stat-label">預估資產價值*</div>
                </div>
                <div class="goal-stat">
                    <div class="goal-stat-value ${gapWithReturn > 0 ? 'text-warning' : 'text-success'}">${gapWithReturn > 0 ? formatCurrency(gapWithReturn) : '達標！'}</div>
                    <div class="goal-stat-label">預估缺口</div>
                </div>
            `;
            
            // Add disclaimer
            if (!document.getElementById('previewDisclaimer')) {
                const disclaimer = document.createElement('p');
                disclaimer.id = 'previewDisclaimer';
                disclaimer.className = 'text-muted mt-3';
                disclaimer.style.fontSize = '0.8rem';
                disclaimer.innerHTML = '*預估資產價值假設年化報酬率 6%，實際報酬可能因市場波動而有所不同。';
                preview.appendChild(disclaimer);
            }
        }
    }
}

function calculateFutureValue(initial, monthly, months, annualRate) {
    const monthlyRate = annualRate / 12;
    let futureValue = initial * Math.pow(1 + monthlyRate, months);
    
    for (let i = 0; i < months; i++) {
        futureValue += monthly * Math.pow(1 + monthlyRate, months - i - 1);
    }
    
    return Math.round(futureValue);
}

function resetGoalSelection() {
    selectedGoalType = null;
    
    document.querySelectorAll('.goal-tag').forEach(tag => {
        tag.classList.remove('selected');
    });
    
    const formSection = document.getElementById('goalFormSection');
    if (formSection) {
        formSection.classList.add('hidden');
    }
    
    // Reset steps
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) step.classList.add('active');
    });
}

async function submitGoalForm(event) {
    event.preventDefault();
    
    const goalData = {
        type: selectedGoalType.id,
        typeName: selectedGoalType.id === 'custom' 
            ? document.getElementById('customGoalName')?.value 
            : selectedGoalType.name,
        icon: selectedGoalType.icon,
        targetAmount: parseFloat(document.getElementById('goalAmount').value),
        targetDate: document.getElementById('goalDate').value,
        initialAmount: parseFloat(document.getElementById('initialAmount').value),
        monthlyAmount: parseFloat(document.getElementById('monthlyAmount').value)
    };
    
    try {
        showToast('info', '處理中', '正在建立您的目標...');
        
        const goal = await API.createGoal(goalData);
        
        showToast('success', '目標已建立！', '現在讓我們了解您的風險承受度');
        
        // Navigate to profile page
        setTimeout(() => {
            navigateTo('profile');
        }, 1500);
        
    } catch (error) {
        showToast('error', '建立失敗', '請稍後再試');
        console.error('Goal creation failed:', error);
    }
}

function showCustomGoalInput() {
    const inputArea = document.getElementById('customGoalInputArea');
    if (inputArea) {
        inputArea.classList.toggle('hidden');
    }
}

function submitNewScenario() {
    const sceneName = document.getElementById('newSceneName')?.value;
    
    if (sceneName) {
        logEvent('new_scenario_suggested', { sceneName });
        showToast('success', '感謝您的建議！', '我們會評估加入這個新場景');
        
        const inputArea = document.getElementById('customGoalInputArea');
        if (inputArea) {
            inputArea.classList.add('hidden');
        }
        document.getElementById('newSceneName').value = '';
    }
}

// Export
window.renderGoalsPage = renderGoalsPage;
window.initGoalsPage = initGoalsPage;
window.selectGoalType = selectGoalType;
window.resetGoalSelection = resetGoalSelection;
window.submitGoalForm = submitGoalForm;
window.showCustomGoalInput = showCustomGoalInput;
window.submitNewScenario = submitNewScenario;

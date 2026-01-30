/**
 * Fin_WMAI - Profile Page
 * Feature 2: 風險與能力評估（Risk & Capability Profiling）
 */

const KYCQuestions = [
    {
        id: 1,
        question: '您的投資經驗有多久？',
        options: [
            { value: 1, text: '完全沒有投資經驗' },
            { value: 2, text: '1年以下' },
            { value: 3, text: '1-3年' },
            { value: 4, text: '3年以上' }
        ]
    },
    {
        id: 2,
        question: '如果您的投資在短期內下跌20%，您會怎麼做？',
        options: [
            { value: 1, text: '立即賣出，避免更多損失' },
            { value: 2, text: '賣出一部分，減少風險' },
            { value: 3, text: '觀望，等待市場回升' },
            { value: 4, text: '加碼買入，趁低佈局' }
        ]
    },
    {
        id: 3,
        question: '您希望這筆投資能達到什麼樣的報酬？',
        options: [
            { value: 1, text: '保本就好，不要虧損' },
            { value: 2, text: '略高於定存即可（約2-3%）' },
            { value: 3, text: '追求適度成長（約5-8%）' },
            { value: 4, text: '追求高報酬，可承受高風險（10%以上）' }
        ]
    },
    {
        id: 4,
        question: '您的收入來源穩定性如何？',
        options: [
            { value: 1, text: '收入不穩定，時有時無' },
            { value: 2, text: '大部分穩定，偶有變動' },
            { value: 3, text: '穩定的薪資收入' },
            { value: 4, text: '多元且穩定的收入來源' }
        ]
    },
    {
        id: 5,
        question: '如果發生緊急狀況，您有多少個月的緊急預備金？',
        options: [
            { value: 1, text: '沒有緊急預備金' },
            { value: 2, text: '1-3個月' },
            { value: 3, text: '3-6個月' },
            { value: 4, text: '6個月以上' }
        ]
    }
];

let kycAnswers = {};
let currentQuestionIndex = 0;

function renderProfilePage() {
    const hasGoal = AppState.currentGoal !== null;
    const hasProfile = AppState.profile !== null;
    
    if (!hasGoal) {
        return renderNoGoalState();
    }
    
    if (hasProfile) {
        return renderProfileResult();
    }
    
    return renderKYCForm();
}

function renderNoGoalState() {
    return `
        <div class="page-header">
            <div class="page-title">
                <img src="${IPIcons.notice}" alt="提示" class="mascot-icon">
                <div>
                    <h1>風險評估</h1>
                    <p class="text-muted mb-0">了解您的風險承受度</p>
                </div>
            </div>
        </div>

        <div class="empty-state">
            <img src="${IPIcons.thinking}" alt="思考中" class="empty-state-icon">
            <h3>請先設定您的目標</h3>
            <p>在進行風險評估之前，我們需要先了解您的理財目標</p>
            <button class="btn btn-primary" onclick="navigateTo('goals')">
                <i class="fas fa-bullseye"></i>
                設定目標
            </button>
        </div>
    `;
}

function renderKYCForm() {
    return `
        <div class="page-header">
            <div class="page-title">
                <img src="${IPIcons.keepCare}" alt="風險評估" class="mascot-icon">
                <div>
                    <h1>風險評估</h1>
                    <p class="text-muted mb-0">了解您的風險承受度與投資能力</p>
                </div>
            </div>
        </div>

        <div class="kyc-progress mb-4">
            <div class="progress-label">
                <span>問卷進度</span>
                <span id="progressText">0 / ${KYCQuestions.length}</span>
            </div>
            <div class="progress">
                <div class="progress-bar" id="kycProgressBar" style="width: 0%"></div>
            </div>
        </div>

        <div class="alert alert-info mb-4">
            <span class="alert-icon"><i class="fas fa-shield-alt"></i></span>
            <div>
                <strong>為什麼需要這些資訊？</strong>
                <p class="mb-0">這些問題幫助我們評估適合您的投資方案，確保建議符合您的風險承受度，避免不適配的投資。</p>
            </div>
        </div>

        <div id="kycQuestionsContainer">
            ${KYCQuestions.map((q, index) => renderQuestion(q, index)).join('')}
        </div>

        <div class="d-flex justify-between mt-4" id="kycActions">
            <button class="btn btn-secondary" onclick="navigateTo('goals')">
                <i class="fas fa-arrow-left"></i>
                返回目標設定
            </button>
            <button class="btn btn-primary" id="submitKycBtn" disabled onclick="submitKYC()">
                完成評估
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

function renderQuestion(question, index) {
    return `
        <div class="kyc-question" id="question-${question.id}" style="display: ${index === 0 ? 'block' : 'none'}">
            <h4>
                <span class="kyc-question-number">${question.id}</span>
                ${question.question}
            </h4>
            <div class="kyc-options">
                ${question.options.map(option => `
                    <label class="kyc-option" onclick="selectOption(${question.id}, ${option.value}, this)">
                        <input type="radio" name="q${question.id}" value="${option.value}">
                        <span>${option.text}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
}

function renderProfileResult() {
    const profile = AppState.profile;
    const goal = AppState.currentGoal;
    
    // Calculate gap
    const months = calculateMonthsBetween(new Date(), new Date(goal.targetDate));
    const totalContribution = goal.initialAmount + (goal.monthlyAmount * months);
    const assumedReturn = getAssumedReturnByRisk(profile.riskGrade);
    const projectedValue = calculateFutureValueProfile(goal.initialAmount, goal.monthlyAmount, months, assumedReturn);
    const gap = goal.targetAmount - projectedValue;
    
    return `
        <div class="page-header">
            <div class="page-title">
                <img src="${IPIcons.assetUp}" alt="評估結果" class="mascot-icon">
                <div>
                    <h1>風險評估結果</h1>
                    <p class="text-muted mb-0">您的投資風險屬性</p>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-body">
                <div class="risk-result">
                    <div class="risk-meter">
                        <div class="risk-meter-bg"></div>
                        <div class="risk-meter-value">
                            <span class="risk-score">${profile.riskScore}</span>
                            <span class="risk-label">風險分數</span>
                        </div>
                    </div>
                    
                    <h2 class="text-accent mb-3">${profile.riskGrade}</h2>
                    
                    <div class="risk-description">
                        <p>${getRiskDescription(profile.riskGrade)}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="gap-analysis">
            <h4 class="mb-3">
                <i class="fas fa-chart-pie text-accent"></i>
                目標差距分析（Gap Analysis）
            </h4>
            
            <div class="gap-visualization">
                <div class="gap-current">
                    <div class="gap-amount">${formatCurrency(totalContribution)}</div>
                    <div class="text-muted">預計總投入</div>
                </div>
                <div class="gap-line"></div>
                <div class="gap-target">
                    <div class="gap-amount">${formatCurrency(goal.targetAmount)}</div>
                    <div class="text-muted">目標金額</div>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-4">
                    <div class="stat-card">
                        <div class="stat-value">${formatCurrency(projectedValue)}</div>
                        <div class="stat-label">預估資產價值</div>
                    </div>
                </div>
                <div class="col-4">
                    <div class="stat-card">
                        <div class="stat-value ${gap > 0 ? 'text-warning' : 'text-success'}">
                            ${gap > 0 ? formatCurrency(gap) : '已達標'}
                        </div>
                        <div class="stat-label">缺口金額</div>
                    </div>
                </div>
                <div class="col-4">
                    <div class="stat-card">
                        <div class="stat-value">${(assumedReturn * 100).toFixed(1)}%</div>
                        <div class="stat-label">假設年報酬率</div>
                    </div>
                </div>
            </div>
        </div>

        ${gap > 0 ? renderGapOptions(gap, goal) : ''}

        <div class="d-flex justify-between mt-4">
            <button class="btn btn-secondary" onclick="retakeKYC()">
                <i class="fas fa-redo"></i>
                重新評估
            </button>
            <button class="btn btn-primary" onclick="proceedToRecommendation()">
                查看投資建議
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

function renderGapOptions(gap, goal) {
    return `
        <div class="card mt-4">
            <div class="card-header">
                <h4 class="card-title">
                    <i class="fas fa-lightbulb text-warning"></i>
                    建議調整方案
                </h4>
            </div>
            <div class="card-body">
                <p class="mb-3">根據您目前的投入計畫，可能無法在預定時間內達成目標。您可以考慮以下調整：</p>
                
                <div class="row">
                    <div class="col-4">
                        <div class="card" style="cursor: pointer;" onclick="selectAdjustOption('extend')">
                            <div class="card-body text-center p-3">
                                <i class="fas fa-calendar-plus fa-2x text-accent mb-2"></i>
                                <h5>延長期程</h5>
                                <p class="text-muted mb-0">增加投資時間，讓複利發揮效果</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="card" style="cursor: pointer;" onclick="selectAdjustOption('increase')">
                            <div class="card-body text-center p-3">
                                <i class="fas fa-coins fa-2x text-accent mb-2"></i>
                                <h5>增加投入</h5>
                                <p class="text-muted mb-0">提高每月定期定額金額</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="card" style="cursor: pointer;" onclick="selectAdjustOption('advisor')">
                            <div class="card-body text-center p-3">
                                <i class="fas fa-user-tie fa-2x text-accent mb-2"></i>
                                <h5>轉介真人</h5>
                                <p class="text-muted mb-0">申請專業理專協助規劃</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function initProfilePage() {
    logEvent('profile_page_viewed');
    
    if (!AppState.profile) {
        currentQuestionIndex = 0;
        kycAnswers = {};
    }
}

function selectOption(questionId, value, element) {
    kycAnswers[questionId] = value;
    
    // Update UI
    const question = element.closest('.kyc-question');
    question.querySelectorAll('.kyc-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    
    // Update progress
    const answered = Object.keys(kycAnswers).length;
    const total = KYCQuestions.length;
    const progressBar = document.getElementById('kycProgressBar');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) {
        progressBar.style.width = `${(answered / total) * 100}%`;
    }
    if (progressText) {
        progressText.textContent = `${answered} / ${total}`;
    }
    
    // Show next question
    setTimeout(() => {
        const nextQuestion = document.getElementById(`question-${questionId + 1}`);
        if (nextQuestion) {
            nextQuestion.style.display = 'block';
            nextQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 300);
    
    // Enable submit button if all questions answered
    const submitBtn = document.getElementById('submitKycBtn');
    if (submitBtn && answered === total) {
        submitBtn.disabled = false;
    }
}

async function submitKYC() {
    try {
        showToast('info', '處理中', '正在分析您的風險屬性...');
        
        const result = await API.submitKYC(kycAnswers);
        
        logEvent('gap_calculated', { 
            riskScore: result.riskScore, 
            riskGrade: result.riskGrade 
        });
        
        showToast('success', '評估完成！', `您的風險屬性為：${result.riskGrade}`);
        
        // Re-render the page to show results
        navigateTo('profile');
        
    } catch (error) {
        showToast('error', '評估失敗', '請稍後再試');
        console.error('KYC submission failed:', error);
    }
}

function retakeKYC() {
    AppState.profile = null;
    AppState.user.riskScore = null;
    AppState.user.riskGrade = null;
    kycAnswers = {};
    currentQuestionIndex = 0;
    navigateTo('profile');
}

function proceedToRecommendation() {
    // Show risk disclosure first
    showRiskDisclosure("navigateTo('recommendation')");
}

function selectAdjustOption(option) {
    switch(option) {
        case 'extend':
            showToast('info', '延長期程', '建議將目標日期延後1-2年');
            break;
        case 'increase':
            showToast('info', '增加投入', '建議將每月投入金額提高20%');
            break;
        case 'advisor':
            showToast('info', '轉介真人', '將為您安排專業理專聯繫');
            logEvent('advisor_referral_requested');
            break;
    }
}

// Helper functions
function getAssumedReturnByRisk(riskGrade) {
    switch(riskGrade) {
        case '保守型': return 0.03;
        case '穩健型': return 0.05;
        case '成長型': return 0.07;
        case '積極型': return 0.10;
        default: return 0.05;
    }
}

function getRiskDescription(riskGrade) {
    switch(riskGrade) {
        case '保守型':
            return '您傾向於保守的投資策略，注重本金安全。我們會為您推薦以固定收益為主的投資組合，追求穩定的收益而非高報酬。';
        case '穩健型':
            return '您能接受適度的風險以換取合理報酬。我們會為您推薦股債均衡的投資組合，在風險與報酬之間取得平衡。';
        case '成長型':
            return '您願意承擔較高風險以追求更好的報酬。我們會為您推薦以股票為主的投資組合，把握長期成長機會。';
        case '積極型':
            return '您能夠承受較大的市場波動，追求最大化報酬。我們會為您推薦積極型的投資組合，但也會注意風險控管。';
        default:
            return '';
    }
}

function calculateFutureValueProfile(initial, monthly, months, annualRate) {
    const monthlyRate = annualRate / 12;
    let futureValue = initial * Math.pow(1 + monthlyRate, months);
    
    for (let i = 0; i < months; i++) {
        futureValue += monthly * Math.pow(1 + monthlyRate, months - i - 1);
    }
    
    return Math.round(futureValue);
}

// Export
window.renderProfilePage = renderProfilePage;
window.initProfilePage = initProfilePage;
window.selectOption = selectOption;
window.submitKYC = submitKYC;
window.retakeKYC = retakeKYC;
window.proceedToRecommendation = proceedToRecommendation;
window.selectAdjustOption = selectAdjustOption;

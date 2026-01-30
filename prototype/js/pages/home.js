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
                <button class="btn btn-secondary btn-icon" title="通知">
                    <i class="fas fa-bell"></i>
                </button>
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
    `;
}

function initHomePage() {
    logEvent('home_page_viewed');
}

// Export
window.renderHomePage = renderHomePage;
window.initHomePage = initHomePage;

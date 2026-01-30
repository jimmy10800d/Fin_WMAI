/**
 * Fin_WMAI - Share Page
 * Feature 6: 社交分享與擴散（Social Sharing）
 */

let shareCardData = null;

function renderSharePage() {
    return `
        <div class="page-header">
            <div class="page-title">
                <img src="${IPIcons.keepEarn}" alt="分享" class="mascot-icon">
                <div>
                    <h1>分享成就</h1>
                    <p class="text-muted mb-0">與親友分享您的理財里程碑</p>
                </div>
            </div>
        </div>

        <div class="alert alert-info mb-4">
            <span class="alert-icon"><i class="fas fa-shield-alt"></i></span>
            <div>
                <strong>隱私保護</strong>
                <p class="mb-0">分享卡片會自動遮蔽您的敏感資訊（如具體金額、帳戶資訊），確保您的隱私安全。</p>
            </div>
        </div>

        <!-- Achievement Selection -->
        <div class="card mb-4">
            <div class="card-header">
                <h4 class="card-title">
                    <i class="fas fa-trophy text-accent"></i>
                    選擇要分享的成就
                </h4>
            </div>
            <div class="card-body">
                <div class="achievement-options" id="achievementOptions">
                    <div class="achievement-option selected" data-achievement="streak" onclick="selectAchievement('streak')">
                        <div class="achievement-icon">🔥</div>
                        <div class="achievement-info">
                            <div class="achievement-name">連續投入 180 天</div>
                            <div class="achievement-desc">持之以恆的投資習慣</div>
                        </div>
                    </div>
                    <div class="achievement-option" data-achievement="milestone" onclick="selectAchievement('milestone')">
                        <div class="achievement-icon">💰</div>
                        <div class="achievement-info">
                            <div class="achievement-name">資產突破 10 萬</div>
                            <div class="achievement-desc">重要的里程碑</div>
                        </div>
                    </div>
                    <div class="achievement-option" data-achievement="goal" onclick="selectAchievement('goal')">
                        <div class="achievement-icon">🎯</div>
                        <div class="achievement-info">
                            <div class="achievement-name">目標達成 32%</div>
                            <div class="achievement-desc">穩步邁向夢想</div>
                        </div>
                    </div>
                    <div class="achievement-option" data-achievement="start" onclick="selectAchievement('start')">
                        <div class="achievement-icon">🚀</div>
                        <div class="achievement-info">
                            <div class="achievement-name">開始投資之旅</div>
                            <div class="achievement-desc">踏出第一步</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Share Card Preview -->
        <div class="card mb-4">
            <div class="card-header">
                <h4 class="card-title">
                    <i class="fas fa-image text-accent"></i>
                    分享卡片預覽
                </h4>
                <button class="btn btn-sm btn-secondary" onclick="regenerateShareCard()">
                    <i class="fas fa-sync-alt"></i>
                    重新生成
                </button>
            </div>
            <div class="card-body">
                <div class="share-preview" id="sharePreview">
                    <div class="share-card" id="shareCard">
                        <div class="share-card-header">
                            <img src="${IPIcons.hello}" alt="Fin_WMAI" class="share-card-logo">
                            <div>
                                <div class="share-card-brand">Fin_WMAI</div>
                                <div class="text-muted" style="font-size: 0.7rem;">智慧投資理財規劃</div>
                            </div>
                        </div>
                        
                        <div class="share-card-content">
                            <div class="share-achievement-icon" id="shareAchievementIcon">🔥</div>
                            <h3 class="share-achievement-title" id="shareAchievementTitle">連續投入 180 天</h3>
                            <p class="share-achievement-desc" id="shareAchievementDesc">
                                我正在用 Fin_WMAI 規劃我的理想人生！
                            </p>
                            
                            <div class="share-stats">
                                <div class="share-stat">
                                    <div class="share-stat-value" id="shareStat1">180</div>
                                    <div class="share-stat-label">連續天數</div>
                                </div>
                                <div class="share-stat">
                                    <div class="share-stat-value" id="shareStat2">32%</div>
                                    <div class="share-stat-label">目標進度</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="share-card-footer">
                            <div class="share-qr">
                                <i class="fas fa-qrcode fa-2x"></i>
                                <div style="font-size: 0.5rem; margin-top: 2px;">掃碼試算</div>
                            </div>
                            <div class="share-disclaimer">
                                投資一定有風險，<br>
                                詳情請洽 Fin_WMAI
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Customize Card -->
        <div class="card mb-4">
            <div class="card-header">
                <h4 class="card-title">
                    <i class="fas fa-palette text-accent"></i>
                    自訂分享文案
                </h4>
            </div>
            <div class="card-body">
                <div class="form-group">
                    <label class="form-label">分享訊息</label>
                    <textarea class="form-control" id="shareMessage" rows="3" 
                              placeholder="輸入您想分享的心得..."
                              maxlength="100"
                              oninput="updateShareMessage()">我正在用 Fin_WMAI 規劃我的理想人生！</textarea>
                    <span class="form-hint">最多 100 字</span>
                </div>
            </div>
        </div>

        <!-- Share Actions -->
        <div class="share-actions">
            <button class="share-btn share-btn-line" onclick="shareToLine()">
                <i class="fab fa-line"></i>
                分享到 LINE
            </button>
            <button class="share-btn share-btn-fb" onclick="shareToFacebook()">
                <i class="fab fa-facebook"></i>
                分享到 Facebook
            </button>
            <button class="share-btn share-btn-copy" onclick="copyShareLink()">
                <i class="fas fa-link"></i>
                複製連結
            </button>
        </div>

        <div class="text-center mt-4">
            <button class="btn btn-secondary" onclick="downloadShareCard()">
                <i class="fas fa-download"></i>
                下載分享圖片
            </button>
        </div>

        <style>
            .achievement-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: var(--space-md);
            }
            .achievement-option {
                display: flex;
                align-items: center;
                gap: var(--space-md);
                padding: var(--space-lg);
                background: rgba(255,255,255,0.03);
                border: 2px solid rgba(255,255,255,0.1);
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all var(--transition-fast);
            }
            .achievement-option:hover {
                background: rgba(255,255,255,0.05);
                border-color: rgba(212, 175, 55, 0.5);
            }
            .achievement-option.selected {
                background: rgba(212, 175, 55, 0.1);
                border-color: var(--accent);
            }
            .achievement-icon {
                font-size: 2rem;
            }
            .achievement-name {
                font-weight: 600;
                color: var(--white);
            }
            .achievement-desc {
                font-size: 0.8rem;
                color: var(--gray-500);
            }
        </style>
    `;
}

async function initSharePage() {
    logEvent('share_page_viewed');
    
    try {
        shareCardData = await API.generateShareCard();
        updateShareCard();
    } catch (error) {
        console.error('Failed to generate share card:', error);
    }
}

function selectAchievement(type) {
    // Update selection UI
    document.querySelectorAll('.achievement-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    document.querySelector(`[data-achievement="${type}"]`)?.classList.add('selected');
    
    // Update share card content
    const achievements = {
        streak: {
            icon: '🔥',
            title: '連續投入 180 天',
            desc: '持之以恆的投資習慣',
            stat1: { value: '180', label: '連續天數' },
            stat2: { value: '32%', label: '目標進度' }
        },
        milestone: {
            icon: '💰',
            title: '資產突破 10 萬',
            desc: '重要的理財里程碑',
            stat1: { value: '6', label: '投資月數' },
            stat2: { value: '12.5%', label: '累積報酬' }
        },
        goal: {
            icon: '🎯',
            title: '目標達成 32%',
            desc: '穩步邁向夢想',
            stat1: { value: '32%', label: '達成率' },
            stat2: { value: '5', label: '剩餘年數' }
        },
        start: {
            icon: '🚀',
            title: '開始投資之旅',
            desc: '踏出第一步最重要',
            stat1: { value: '1', label: '起步日' },
            stat2: { value: '∞', label: '可能性' }
        }
    };
    
    const data = achievements[type];
    if (data) {
        document.getElementById('shareAchievementIcon').textContent = data.icon;
        document.getElementById('shareAchievementTitle').textContent = data.title;
        document.getElementById('shareStat1').textContent = data.stat1.value;
        document.querySelector('#shareStat1 + .share-stat-label').textContent = data.stat1.label;
        document.getElementById('shareStat2').textContent = data.stat2.value;
        document.querySelector('#shareStat2 + .share-stat-label').textContent = data.stat2.label;
    }
    
    logEvent('share_achievement_selected', { type });
}

function updateShareCard() {
    if (!shareCardData) return;
    
    const messageEl = document.getElementById('shareAchievementDesc');
    if (messageEl) {
        messageEl.textContent = shareCardData.message;
    }
}

function updateShareMessage() {
    const message = document.getElementById('shareMessage')?.value || '';
    const descEl = document.getElementById('shareAchievementDesc');
    if (descEl) {
        descEl.textContent = message || '我正在用 Fin_WMAI 規劃我的理想人生！';
    }
}

async function regenerateShareCard() {
    showToast('info', '生成中', '正在重新生成分享卡片...');
    
    try {
        shareCardData = await API.generateShareCard();
        updateShareCard();
        showToast('success', '生成完成', '分享卡片已更新');
    } catch (error) {
        showToast('error', '生成失敗', '請稍後再試');
    }
}

function shareToLine() {
    const message = document.getElementById('shareMessage')?.value || '我正在用 Fin_WMAI 規劃我的理想人生！';
    const url = encodeURIComponent('https://fin-wmai.example.com/referral?code=DEMO123');
    const text = encodeURIComponent(message + '\n\n👉 立即試算：');
    
    // In production, would use LINE Share API
    window.open(`https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`, '_blank');
    
    logEvent('share_to_line');
    showToast('success', '分享中', '正在開啟 LINE...');
}

function shareToFacebook() {
    const url = encodeURIComponent('https://fin-wmai.example.com/referral?code=DEMO123');
    
    // In production, would use Facebook Share API
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    
    logEvent('share_to_facebook');
    showToast('success', '分享中', '正在開啟 Facebook...');
}

function copyShareLink() {
    const link = 'https://fin-wmai.example.com/referral?code=DEMO123';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            showToast('success', '已複製', '分享連結已複製到剪貼簿');
        });
    } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('success', '已複製', '分享連結已複製到剪貼簿');
    }
    
    logEvent('share_link_copied');
}

function downloadShareCard() {
    // In production, would use html2canvas or similar library
    showToast('info', '下載中', '正在生成分享圖片...');
    
    setTimeout(() => {
        showToast('success', '下載完成', '分享圖片已儲存');
        logEvent('share_card_downloaded');
    }, 1500);
}

// Export
window.renderSharePage = renderSharePage;
window.initSharePage = initSharePage;
window.selectAchievement = selectAchievement;
window.updateShareMessage = updateShareMessage;
window.regenerateShareCard = regenerateShareCard;
window.shareToLine = shareToLine;
window.shareToFacebook = shareToFacebook;
window.copyShareLink = copyShareLink;
window.downloadShareCard = downloadShareCard;

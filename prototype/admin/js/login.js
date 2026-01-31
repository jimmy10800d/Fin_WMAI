/**
 * Fin_WMAI 後台登入系統
 * QR Code 認證模擬
 */

// ===== 模擬使用者資料庫 =====
const MockUsers = {
    'admin': { id: 'admin', name: '系統管理員', role: 'admin', email: 'admin@finwmai.com', department: '資訊部' },
    'operator01': { id: 'operator01', name: '王曉明', role: 'operator', email: 'wang@finwmai.com', department: '營運部' },
    'compliance01': { id: 'compliance01', name: '李合規', role: 'compliance', email: 'lee@finwmai.com', department: '合規部' },
    'manager01': { id: 'manager01', name: '陳經理', role: 'admin', email: 'chen@finwmai.com', department: '管理部' },
    'analyst01': { id: 'analyst01', name: '林分析師', role: 'readonly', email: 'lin@finwmai.com', department: '分析部' }
};

const RoleNames = {
    'admin': '系統管理員',
    'operator': '營運人員',
    'compliance': '合規人員',
    'readonly': '唯讀人員'
};

// ===== 狀態管理 =====
const LoginState = {
    qrSessionId: null,
    qrExpireTime: null,
    timerInterval: null,
    isScanning: false,
    currentUser: null  // 當前選擇的使用者
};

// ===== QR Code 生成 =====
function generateQRCode() {
    // 產生新的 session ID
    LoginState.qrSessionId = 'QR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    LoginState.qrExpireTime = Date.now() + 120000; // 2分鐘有效
    
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const size = 180;
    canvas.width = size;
    canvas.height = size;
    
    // 清除畫布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // 模擬 QR Code 圖案（使用簡單的點陣圖案）
    const moduleSize = 6;
    const modules = 25;
    const offset = (size - modules * moduleSize) / 2;
    
    // 生成偽隨機 QR 圖案
    const seed = LoginState.qrSessionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    ctx.fillStyle = '#3A4750';
    
    // 定位圖案 (三個角落)
    drawFinderPattern(ctx, offset, offset, moduleSize);
    drawFinderPattern(ctx, offset + (modules - 7) * moduleSize, offset, moduleSize);
    drawFinderPattern(ctx, offset, offset + (modules - 7) * moduleSize, moduleSize);
    
    // 填充隨機模組
    for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
            // 跳過定位圖案區域
            if ((row < 9 && col < 9) || 
                (row < 9 && col > modules - 10) || 
                (row > modules - 10 && col < 9)) {
                continue;
            }
            
            // 偽隨機填充
            const hash = (row * modules + col + seed) % 7;
            if (hash < 3) {
                ctx.fillRect(
                    offset + col * moduleSize,
                    offset + row * moduleSize,
                    moduleSize - 1,
                    moduleSize - 1
                );
            }
        }
    }
    
    // 中間加上 Logo
    ctx.fillStyle = '#C59B85';
    const logoSize = 30;
    const logoX = (size - logoSize) / 2;
    const logoY = (size - logoSize) / 2;
    ctx.beginPath();
    ctx.roundRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.fillStyle = '#C59B85';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☁️', size / 2, size / 2);
    
    // 啟動計時器
    startTimer();
}

function drawFinderPattern(ctx, x, y, moduleSize) {
    // 外框 - 莫蘭迪深灰藍
    ctx.fillStyle = '#3A4750';
    ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7);
    // 白色內框
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5);
    // 中心 - 莫蘭迪深灰藍
    ctx.fillStyle = '#3A4750';
    ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3);
}

// ===== 計時器 =====
function startTimer() {
    if (LoginState.timerInterval) {
        clearInterval(LoginState.timerInterval);
    }
    
    LoginState.timerInterval = setInterval(() => {
        const remaining = Math.max(0, LoginState.qrExpireTime - Date.now());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        const timerEl = document.getElementById('qrTimer');
        if (timerEl) {
            timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        
        if (remaining <= 0) {
            clearInterval(LoginState.timerInterval);
            showExpiredQR();
        }
    }, 1000);
}

function showExpiredQR() {
    const statusEl = document.getElementById('qrStatus');
    if (statusEl) {
        statusEl.innerHTML = `
            <span class="status-icon">⏰</span>
            <span class="status-text" style="color: #ef4444;">QR Code 已過期，請重新產生</span>
        `;
    }
}

// ===== 使用者 ID 驗證與進入 QR 認證 =====
function proceedToQRAuth() {
    const userIdInput = document.getElementById('loginUserId');
    const userId = userIdInput.value.trim().toLowerCase();
    
    if (!userId) {
        showLoginError('請輸入使用者 ID');
        userIdInput.focus();
        return;
    }
    
    // 查找使用者
    const user = MockUsers[userId];
    if (!user) {
        showLoginError(`找不到使用者 "${userId}"，請確認 ID 是否正確`);
        userIdInput.focus();
        userIdInput.select();
        return;
    }
    
    // 儲存當前使用者
    LoginState.currentUser = user;
    
    // 顯示使用者資訊
    document.getElementById('authUserName').textContent = `${user.name} (${RoleNames[user.role]})`;
    
    // 切換到 QR 認證步驟
    document.getElementById('userIdSection').style.display = 'none';
    document.getElementById('qrAuthSection').style.display = 'block';
    document.getElementById('demoControls').style.display = 'block';
    
    // 產生 QR Code
    generateQRCode();
}

function changeUser() {
    // 返回使用者 ID 輸入步驟
    LoginState.currentUser = null;
    
    document.getElementById('qrAuthSection').style.display = 'none';
    document.getElementById('userIdSection').style.display = 'block';
    document.getElementById('demoControls').style.display = 'none';
    
    // 停止計時器
    if (LoginState.timerInterval) {
        clearInterval(LoginState.timerInterval);
    }
    
    // 聚焦到輸入框
    document.getElementById('loginUserId').focus();
}

function showLoginError(message) {
    // 創建或更新錯誤訊息元素
    let errorEl = document.getElementById('loginError');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = 'loginError';
        errorEl.className = 'login-error';
        const userIdSection = document.getElementById('userIdSection');
        userIdSection.insertBefore(errorEl, userIdSection.firstChild);
    }
    
    errorEl.innerHTML = `<span>⚠️</span> ${message}`;
    errorEl.style.display = 'block';
    
    // 3 秒後自動隱藏
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 3000);
}

// ===== 刷新 QR Code =====
function refreshQRCode() {
    const statusEl = document.getElementById('qrStatus');
    if (statusEl) {
        statusEl.innerHTML = `
            <span class="status-icon">📱</span>
            <span class="status-text">請使用行動裝置掃描</span>
        `;
    }
    
    generateQRCode();
}

// ===== 模擬掃描 =====
function simulateScan() {
    if (LoginState.isScanning) return;
    if (!LoginState.currentUser) {
        alert('請先輸入使用者 ID');
        return;
    }
    
    LoginState.isScanning = true;
    
    // 更新 QR 狀態為驗證中
    const statusEl = document.getElementById('qrStatus');
    if (statusEl) {
        statusEl.innerHTML = `
            <span class="status-icon">⏳</span>
            <span class="status-text" style="color: #2563eb;">正在驗證...</span>
        `;
    }
    
    // 停止計時器
    if (LoginState.timerInterval) {
        clearInterval(LoginState.timerInterval);
    }
    
    // 短暫延遲後顯示成功動畫
    setTimeout(() => {
        // 隱藏 QR 區域，顯示成功動畫
        document.getElementById('qrLoginSection').style.display = 'none';
        document.getElementById('scanSuccessSection').style.display = 'block';
        document.getElementById('demoControls').style.display = 'none';
        
        // 更新成功訊息
        const successSection = document.getElementById('scanSuccessSection');
        successSection.querySelector('h2').textContent = '驗證成功！';
        successSection.querySelector('p').textContent = `歡迎回來，${LoginState.currentUser.name}`;
        
        // 2秒後跳轉到後台
        setTimeout(() => {
            // 儲存登入狀態（使用選擇的使用者資料）
            sessionStorage.setItem('adminLoggedIn', 'true');
            sessionStorage.setItem('adminUser', JSON.stringify({
                id: LoginState.currentUser.id,
                name: LoginState.currentUser.name,
                role: RoleNames[LoginState.currentUser.role],
                email: LoginState.currentUser.email,
                department: LoginState.currentUser.department,
                loginTime: new Date().toISOString(),
                loginMethod: 'qr-code'
            }));
            
            // 跳轉到後台主頁
            window.location.href = 'index.html';
        }, 2000);
    }, 800);
}

function simulateScanFailed() {
    if (LoginState.isScanning) return;
    
    // 更新 QR 狀態為失敗
    const statusEl = document.getElementById('qrStatus');
    if (statusEl) {
        statusEl.innerHTML = `
            <span class="status-icon">❌</span>
            <span class="status-text" style="color: #ef4444;">驗證失敗，請重新掃描</span>
        `;
    }
    
    // 3秒後恢復等待狀態
    setTimeout(() => {
        if (statusEl) {
            statusEl.innerHTML = `
                <span class="status-icon">📱</span>
                <span class="status-text">等待掃描認證...</span>
            `;
        }
    }, 3000);
}

// ===== 切換登入方式 =====
function showPasswordLogin() {
    document.getElementById('qrLoginSection').style.display = 'none';
    document.getElementById('passwordLoginSection').style.display = 'block';
    
    if (LoginState.timerInterval) {
        clearInterval(LoginState.timerInterval);
    }
}

function showQRLogin() {
    document.getElementById('passwordLoginSection').style.display = 'none';
    document.getElementById('qrLoginSection').style.display = 'block';
    generateQRCode();
}

// ===== 帳號密碼登入 =====
function handlePasswordLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    
    // 從模擬資料庫查找使用者
    const user = MockUsers[username];
    
    // 模擬驗證（Demo 用：密碼統一為 "password" 或與帳號相同）
    if (user && (password === 'password' || password === username || password === '123456')) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminUser', JSON.stringify({
            id: user.id,
            name: user.name,
            role: RoleNames[user.role],
            email: user.email,
            department: user.department,
            loginTime: new Date().toISOString(),
            loginMethod: 'password'
        }));
        
        window.location.href = 'index.html';
    } else {
        alert('帳號或密碼錯誤！\n\nDemo 帳號：admin, operator01, compliance01\nDemo 密碼：password 或 123456');
    }
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    // 不自動產生 QR Code，等使用者輸入 ID 後再產生
    // 聚焦到使用者 ID 輸入框
    const userIdInput = document.getElementById('loginUserId');
    if (userIdInput) {
        userIdInput.focus();
        
        // 按 Enter 鍵進入下一步
        userIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                proceedToQRAuth();
            }
        });
    }
});

// Canvas roundRect polyfill
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

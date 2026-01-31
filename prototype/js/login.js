/**
 * Fin_WMAI 前台登入系統
 * 使用者 ID + QR Code 雙因素認證模擬
 */

// ===== 模擬使用者資料庫 =====
const MockUsers = {
    'user001': { 
        id: 'user001', 
        name: '官大大', 
        level: '新手投資者',
        avatar: null,
        totalAssets: '1,234,567',
        joinDate: '2025-06-15'
    },
    'user002': { 
        id: 'user002', 
        name: '陳小雲', 
        level: '進階投資者',
        avatar: null,
        totalAssets: '3,456,789',
        joinDate: '2024-12-01'
    },
    'vip001': { 
        id: 'vip001', 
        name: '林大戶', 
        level: 'VIP 客戶',
        avatar: null,
        totalAssets: '12,345,678',
        joinDate: '2023-01-10'
    },
    'demo': { 
        id: 'demo', 
        name: 'Demo 用戶', 
        level: '體驗帳號',
        avatar: null,
        totalAssets: '100,000',
        joinDate: '2026-01-31'
    }
};

// ===== 狀態管理 =====
const LoginState = {
    currentUser: null,
    qrSessionId: null,
    qrExpireTime: null,
    timerInterval: null,
    isProcessing: false
};

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    const userIdInput = document.getElementById('userId');
    if (userIdInput) {
        userIdInput.focus();
        
        // Enter 鍵觸發下一步
        userIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                proceedToQRAuth();
            }
        });
    }
    
    // 檢查是否已登入
    const loggedInUser = sessionStorage.getItem('currentUser');
    if (loggedInUser) {
        // 已登入，直接跳轉到主頁
        window.location.href = 'index.html';
    }
});

// ===== 步驟一：驗證使用者 ID 並進入 QR 認證 =====
function proceedToQRAuth() {
    const userIdInput = document.getElementById('userId');
    const userId = userIdInput.value.trim().toLowerCase();
    
    if (!userId) {
        showError('請輸入使用者帳號');
        userIdInput.focus();
        return;
    }
    
    // 查找使用者
    const user = MockUsers[userId];
    if (!user) {
        showError(`找不到帳號「${userId}」，請確認是否正確`);
        userIdInput.select();
        return;
    }
    
    // 儲存當前使用者
    LoginState.currentUser = user;
    
    // 更新使用者顯示資訊
    document.getElementById('userDisplayName').textContent = `${user.name} (${user.level})`;
    
    // 切換到 QR 認證步驟
    document.getElementById('stepUserId').style.display = 'none';
    document.getElementById('stepQRAuth').style.display = 'block';
    document.getElementById('demoPanel').style.display = 'block';
    
    // 產生 QR Code
    generateQRCode();
    
    // 啟動掃描線動畫
    document.getElementById('qrScanLine').classList.add('active');
}

// ===== 顯示錯誤訊息 =====
function showError(message) {
    const errorEl = document.getElementById('loginError');
    const messageEl = document.getElementById('errorMessage');
    
    messageEl.textContent = message;
    errorEl.style.display = 'flex';
    
    // 3 秒後隱藏
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 3000);
}

// ===== 更換使用者 =====
function changeUser() {
    LoginState.currentUser = null;
    stopTimer();
    
    document.getElementById('stepQRAuth').style.display = 'none';
    document.getElementById('stepPassword').style.display = 'none';
    document.getElementById('stepUserId').style.display = 'block';
    document.getElementById('demoPanel').style.display = 'none';
    document.getElementById('qrScanLine').classList.remove('active');
    
    document.getElementById('userId').focus();
}

// ===== QR Code 生成 =====
function generateQRCode() {
    LoginState.qrSessionId = 'QR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    LoginState.qrExpireTime = Date.now() + 120000; // 2分鐘
    
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const size = 180;
    
    // 清除畫布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // 繪製 QR Code 圖案
    const moduleSize = 6;
    const modules = 25;
    const offset = (size - modules * moduleSize) / 2;
    const seed = LoginState.qrSessionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    ctx.fillStyle = '#3A4750';  // 莫蘭迪深灰藍
    
    // 定位圖案
    drawFinderPattern(ctx, offset, offset, moduleSize);
    drawFinderPattern(ctx, offset + (modules - 7) * moduleSize, offset, moduleSize);
    drawFinderPattern(ctx, offset, offset + (modules - 7) * moduleSize, moduleSize);
    
    // 隨機填充
    for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
            if ((row < 9 && col < 9) || 
                (row < 9 && col > modules - 10) || 
                (row > modules - 10 && col < 9)) {
                continue;
            }
            
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
    
    // 中間 Logo
    const logoSize = 35;
    const logoX = (size - logoSize) / 2;
    const logoY = (size - logoSize) / 2;
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(logoX - 3, logoY - 3, logoSize + 6, logoSize + 6, 8);
    ctx.fill();
    
    // 繪製漸層 Logo（莫蘭迪暖棕色）
    const gradient = ctx.createLinearGradient(logoX, logoY, logoX + logoSize, logoY + logoSize);
    gradient.addColorStop(0, '#C59B85');
    gradient.addColorStop(1, '#A67B65');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 6);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☁️', size / 2, size / 2);
    
    // 啟動計時器
    startTimer();
}

function drawFinderPattern(ctx, x, y, moduleSize) {
    ctx.fillStyle = '#3A4750';
    ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5);
    ctx.fillStyle = '#3A4750';
    ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3);
}

// ===== 計時器 =====
function startTimer() {
    stopTimer();
    
    LoginState.timerInterval = setInterval(() => {
        const remaining = Math.max(0, LoginState.qrExpireTime - Date.now());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        const timerEl = document.getElementById('qrTimer');
        if (timerEl) {
            timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            // 時間警告顏色
            timerEl.classList.remove('warning', 'danger');
            if (remaining < 30000) {
                timerEl.classList.add('danger');
            } else if (remaining < 60000) {
                timerEl.classList.add('warning');
            }
        }
        
        if (remaining <= 0) {
            stopTimer();
            showQRExpired();
        }
    }, 1000);
}

function stopTimer() {
    if (LoginState.timerInterval) {
        clearInterval(LoginState.timerInterval);
        LoginState.timerInterval = null;
    }
}

function showQRExpired() {
    document.getElementById('qrScanLine').classList.remove('active');
    showError('QR Code 已過期，請重新產生');
}

// ===== 重新產生 QR Code =====
function refreshQRCode() {
    document.getElementById('qrScanLine').classList.add('active');
    generateQRCode();
}

// ===== 模擬掃描成功 =====
function simulateScanSuccess() {
    console.log('simulateScanSuccess 被呼叫');
    console.log('LoginState.isProcessing:', LoginState.isProcessing);
    console.log('LoginState.currentUser:', LoginState.currentUser);
    
    if (LoginState.isProcessing) {
        console.log('正在處理中，跳過');
        return;
    }
    
    if (!LoginState.currentUser) {
        console.log('沒有選擇使用者');
        alert('請先輸入使用者帳號');
        return;
    }
    
    LoginState.isProcessing = true;
    
    stopTimer();
    const scanLine = document.getElementById('qrScanLine');
    if (scanLine) scanLine.classList.remove('active');
    
    // 顯示成功畫面
    setTimeout(() => {
        console.log('顯示成功畫面');
        
        const stepQRAuth = document.getElementById('stepQRAuth');
        const demoPanel = document.getElementById('demoPanel');
        const stepSuccess = document.getElementById('stepSuccess');
        const welcomeMessage = document.getElementById('welcomeMessage');
        
        console.log('stepQRAuth:', stepQRAuth);
        console.log('stepSuccess:', stepSuccess);
        
        if (stepQRAuth) stepQRAuth.style.display = 'none';
        if (demoPanel) demoPanel.style.display = 'none';
        if (stepSuccess) stepSuccess.style.display = 'block';
        
        if (welcomeMessage) {
            welcomeMessage.textContent = `歡迎回來，${LoginState.currentUser.name}！正在載入您的資料...`;
        }
        
        // 儲存登入狀態並跳轉
        setTimeout(() => {
            console.log('準備儲存登入狀態並跳轉');
            
            try {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('currentUser', JSON.stringify({
                    ...LoginState.currentUser,
                    loginTime: new Date().toISOString(),
                    loginMethod: 'qr-code'
                }));
                console.log('登入狀態已儲存');
                
                console.log('準備跳轉到 index.html');
                window.location.href = 'index.html';
            } catch (e) {
                console.error('錯誤:', e);
                alert('登入過程發生錯誤: ' + e.message);
            }
        }, 2000);
    }, 500);
}

// ===== 模擬掃描失敗 =====
function simulateScanFailed() {
    showError('驗證失敗，請重新掃描 QR Code');
}

// ===== 密碼登入相關 =====
function showPasswordLogin() {
    stopTimer();
    document.getElementById('qrScanLine').classList.remove('active');
    
    document.getElementById('stepQRAuth').style.display = 'none';
    document.getElementById('demoPanel').style.display = 'none';
    document.getElementById('stepPassword').style.display = 'block';
    
    document.getElementById('loginPassword').focus();
}

function backToQRAuth() {
    document.getElementById('stepPassword').style.display = 'none';
    document.getElementById('stepQRAuth').style.display = 'block';
    document.getElementById('demoPanel').style.display = 'block';
    
    refreshQRCode();
}

function togglePasswordVisibility() {
    const input = document.getElementById('loginPassword');
    const icon = document.getElementById('toggleIcon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function handlePasswordLogin(event) {
    event.preventDefault();
    
    const password = document.getElementById('loginPassword').value;
    
    // Demo: 密碼為 password, 123456, 或與帳號相同即可登入
    if (password === 'password' || password === '123456' || password === LoginState.currentUser.id) {
        LoginState.isProcessing = true;
        
        document.getElementById('stepPassword').style.display = 'none';
        document.getElementById('stepSuccess').style.display = 'block';
        
        document.getElementById('welcomeMessage').textContent = 
            `歡迎回來，${LoginState.currentUser.name}！正在載入您的資料...`;
        
        setTimeout(() => {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('currentUser', JSON.stringify({
                ...LoginState.currentUser,
                loginTime: new Date().toISOString(),
                loginMethod: 'password'
            }));
            
            window.location.href = 'index.html';
        }, 2000);
    } else {
        showError('密碼錯誤，請重試（Demo 密碼：password 或 123456）');
    }
}

// ===== Canvas roundRect polyfill =====
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

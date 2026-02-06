/* ================================================
   薪守村 Login JS — RPG 入村流程
   ================================================ */
const MockUsers = {
  user001: { name: '官大大', class: '穩健型冒險家', level: 3, xp: 450, title: '小資守護者' },
  user002: { name: '林小萌', class: '積極型戰士', level: 2, xp: 230, title: '新手冒險家' },
  vip001: { name: '陳阿福', class: '保守型賢者', level: 5, xp: 820, title: '理財老手' },
  demo: { name: '旅行者', class: '初心者', level: 1, xp: 0, title: '初心者' }
};

const LoginFlow = {
  currentStep: 1,
  selectedUser: null,
  timer: null,
  timerSeconds: 120,

  init() {
    this.createParticles();
    const userInput = document.getElementById('userId');
    if (userInput) {
      userInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') this.next(1);
      });
    }
    const pwInput = document.getElementById('password');
    if (pwInput) {
      pwInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') this.submitPassword();
      });
    }
  },

  createParticles() {
    const container = document.getElementById('bgParticles');
    if (!container) return;
    const colors = ['rgba(212,168,67,0.4)', 'rgba(74,124,89,0.3)', 'rgba(240,214,138,0.3)'];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = 3 + Math.random() * 6;
      p.style.cssText = `
        width:${size}px;height:${size}px;
        left:${Math.random()*100}%;
        background:${colors[i % colors.length]};
        animation-duration:${8 + Math.random()*12}s;
        animation-delay:${Math.random()*8}s;
      `;
      container.appendChild(p);
    }
  },

  next(step) {
    if (step === 1) {
      const userId = document.getElementById('userId').value.trim().toLowerCase();
      const error = document.getElementById('error1');
      if (!userId) {
        error.textContent = '請輸入冒險者編號';
        return;
      }
      if (!MockUsers[userId]) {
        error.textContent = '找不到此冒險者，請再試一次';
        return;
      }
      error.textContent = '';
      this.selectedUser = { id: userId, ...MockUsers[userId] };
      this.goToStep(2);
      this.startQR();
      this.startTimer();
      // Auto-scan after 3s for demo
      setTimeout(() => this.scanSuccess(), 3000);
    }
  },

  goToStep(step) {
    this.currentStep = step;
    document.querySelectorAll('.login-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step' + step).classList.add('active');
    // Update step indicator
    document.querySelectorAll('.step-indicator .step').forEach((s, i) => {
      s.classList.remove('active', 'done');
      if (i + 1 < step) s.classList.add('done');
      if (i + 1 === step) s.classList.add('active');
    });
    // Update step lines
    document.querySelectorAll('.step-indicator .step-line').forEach((l, i) => {
      l.style.background = (i + 1 < step) ? 'var(--login-green)' : 'var(--login-border)';
    });
  },

  startQR() {
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    // Draw simple QR-like pattern
    ctx.fillStyle = '#1a2332';
    const blockSize = 8;
    const grid = w / blockSize;
    // Finder patterns (3 corners)
    this.drawFinder(ctx, 2, 2, blockSize);
    this.drawFinder(ctx, grid - 9, 2, blockSize);
    this.drawFinder(ctx, 2, grid - 9, blockSize);
    // Random data modules
    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        if (this.isFinderArea(r, c, grid)) continue;
        if (Math.random() > 0.55) {
          ctx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
        }
      }
    }
  },

  drawFinder(ctx, x, y, s) {
    const colors = ['#1a2332', '#fff', '#1a2332'];
    const sizes = [7, 5, 3];
    sizes.forEach((size, i) => {
      ctx.fillStyle = colors[i];
      const offset = (7 - size) / 2;
      ctx.fillRect((x + offset) * s, (y + offset) * s, size * s, size * s);
    });
  },

  isFinderArea(r, c, grid) {
    return (r < 9 && c < 9) || (r < 9 && c > grid - 10) || (r > grid - 10 && c < 9);
  },

  startTimer() {
    this.timerSeconds = 120;
    const timerEl = document.getElementById('timerText');
    this.timer = setInterval(() => {
      this.timerSeconds--;
      const m = Math.floor(this.timerSeconds / 60);
      const s = this.timerSeconds % 60;
      timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      if (this.timerSeconds <= 0) {
        clearInterval(this.timer);
        timerEl.textContent = '已過期';
      }
    }, 1000);
  },

  scanSuccess() {
    if (this.currentStep !== 2) return;
    clearInterval(this.timer);
    this.goToStep(3);
    this.showSuccess();
  },

  showPassword() {
    document.getElementById('passwordArea').classList.remove('hidden');
  },

  submitPassword() {
    const pw = document.getElementById('password').value;
    const error = document.getElementById('error2');
    const validPw = ['password', '123456', this.selectedUser?.id || ''];
    if (!validPw.includes(pw)) {
      error.textContent = '密語不正確，請再試一次';
      return;
    }
    error.textContent = '';
    clearInterval(this.timer);
    this.goToStep(3);
    this.showSuccess();
  },

  showSuccess() {
    const user = this.selectedUser;
    document.getElementById('successPlayer').textContent = `冒險者 ${user.name}，歡迎回來！`;
    document.getElementById('statLevel').textContent = `Lv.${user.level}`;
    document.getElementById('statTitle').textContent = user.title;
    // Loading bar animation
    const bar = document.getElementById('loadingBarFill');
    const hints = ['正在準備冒險裝備...', '載入村莊地圖...', '召喚 NPC 小雲...', '即將進入薪守村！'];
    const hint = document.getElementById('loadingHint');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      bar.style.width = progress + '%';
      if (progress < 30) hint.textContent = hints[0];
      else if (progress < 60) hint.textContent = hints[1];
      else if (progress < 85) hint.textContent = hints[2];
      else hint.textContent = hints[3];
      if (progress >= 100) {
        clearInterval(interval);
        // Save to session and redirect
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      }
    }, 50);
  }
};

document.addEventListener('DOMContentLoaded', () => LoginFlow.init());

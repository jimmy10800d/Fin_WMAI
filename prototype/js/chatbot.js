/* ================================================
   【NPC 小曦雲】AI 聊天助手 — Chatbot Panel
   支援 Agent Demo + Ollama LLM（混合模式）+ 本地 fallback
   對話記憶自動持久化至 /api/assistant/memory
   ================================================ */

const Chatbot = {
  messages: [],
  chatHistory: [],   // Ollama conversation memory
  isOpen: false,
  isStreaming: false,

  /* --- Agent Demo API 設定（prototype server.js） --- */
  useAgentApi: true,
  agentApiBaseUrl: '',
  agentSessionId: null,
  showAgentTrace: false,

  /* --- Ollama 設定 --- */
  ollamaBaseUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.1:8b',
  useOllama: true,  // true = 呼叫 Ollama；false = 本地 fallback

  /* 系統提示詞 — 讓 LLM 扮演 NPC 小曦雲 */
  systemPrompt: `你是「小曦雲」，薪守村（Fin_WMAI）裡的 NPC 理財冒險顧問。
角色設定：
- 你是一位友善、專業的理財嚮導，說話風格活潑但不失專業
- 你用 RPG 冒險隱喻來解說理財概念（例：目標設定=選擇冒險方向、KYC=冒險體檢、投資=攻克據點）
- 你會適時使用 emoji 讓對話更生動
- 回答請使用繁體中文
- 回答請簡潔有力，每次回覆控制在 150 字以內

薪守村系統功能：
1. 初心者目標設定 — 用戶選擇理財目標（退休/買房/教育等），AI 語意轉換為結構化規劃
2. 職業說明NPC — KYC 風險評估，5 題問答，分為 C1~C5（保守型賢者～激進型劍聖）
3. 專屬特殊技能 — AI 生成客製化投資配置方案，支援白話翻譯和「聽不懂」切換
4. 攻克據點 — 一鍵下單，自動 Pre-trade Check（KYC/風險/額度/合規/時段）
5. 戰績回顧 — 資產總覽、損益追蹤、目標達成率、Rebalance 提醒

規則：
- 不提供具體投資標的推薦或保證報酬
- 提醒用戶所有建議皆為 AI 生成，投資有風險
- 遇到超出範圍的問題，友善引導回理財旅程話題`,

  init() {
    const sendBtn = document.getElementById('chatSend');
    const input = document.getElementById('chatInput');

    if (sendBtn) sendBtn.addEventListener('click', () => Chatbot.send());
    if (input) {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          Chatbot.send();
        }
      });
    }

    // 初始化對話歷史
    this.chatHistory = [{ role: 'system', content: this.systemPrompt }];

    // 初始化 Agent session
    this.agentSessionId = 'sess_' + Date.now();
    this.agentApiBaseUrl = this.getAgentApiBaseUrl();

    // 檢測 Agent Demo API 是否可用（成功則優先使用）
    this.checkAgentApiHealth();

    // 檢測 Ollama 是否可用
    this.checkOllamaHealth();

    // Welcome message (不透過 Ollama)
    this.addBotMessage('歡迎來到薪守村！✨ 我是 NPC 小曦雲，你的理財冒險顧問。有任何問題都可以問我喔！');
    this.addBotMessage('💡 試著問我：\n• 我該從哪裡開始？\n• 什麼是 KYC？\n• 幫我分析投資策略');
    // 顯示常見問題快捷鍵
    this.showFaqButtons();  },

  getAgentApiBaseUrl() {
    // 1) 若頁面就是由 node server 提供（http://localhost:3000），用同源
    try {
      const origin = window.location?.origin || '';
      if (origin.startsWith('http')) return origin;
    } catch (e) { /* ignore */ }
    // 2) 否則 fallback 到預設 prototype server
    return 'http://localhost:3000';
  },

  async checkAgentApiHealth() {
    if (!this.useAgentApi) return;
    try {
      const resp = await fetch(this.agentApiBaseUrl + '/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();
      if (data?.ok) {
        const ver = data?.agentDemo?.version || 'unknown';
        this.addSystemNote(`🟣 Agent Demo 已連線 — v${ver}`);
        return;
      }
      throw new Error('bad response');
    } catch (e) {
      console.warn('[小曦雲] Agent Demo API 不可用，改用 Ollama/本地模式:', e.message);
      this.useAgentApi = false;
      this.addSystemNote('⚪ Agent Demo 未連線（改用 Ollama/本地模式）');
    }
  },

  /** 檢查 Ollama 服務是否在線（透過 server proxy） */
  async checkOllamaHealth() {
    try {
      const resp = await fetch(this.agentApiBaseUrl + '/api/ollama/health', {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.ok) {
          console.log('[小曦雲] Ollama 連線成功（透過 proxy），可用模型:', data.models);
          const hasModel = (data.models || []).some(m => m.startsWith(this.ollamaModel));
          if (!hasModel) {
            console.warn(`[小曦雲] 模型 ${this.ollamaModel} 未找到`);
            this.addSystemNote(`⚠️ 模型 ${this.ollamaModel} 未就緒，使用本地模式`);
            this.useOllama = false;
          } else {
            this.addSystemNote('🟢 Ollama AI 已連線 — ' + this.ollamaModel);
          }
        } else {
          throw new Error(data.error || 'Ollama proxy error');
        }
      } else {
        throw new Error('HTTP ' + resp.status);
      }
    } catch (e) {
      console.warn('[小曦雲] Ollama 不可用，使用本地 fallback:', e.message);
      this.useOllama = false;
      this.addSystemNote('⚡ 本地模式（Ollama 未連線）');
    }
  },

  toggle() {
    const panel = document.getElementById('chatbotPanel');
    if (!panel) return;
    this.isOpen = !this.isOpen;
    panel.classList.toggle('open', this.isOpen);
    if (this.isOpen) {
      setTimeout(() => document.getElementById('chatInput')?.focus(), 200);
    }
  },

  async send() {
    if (this.isStreaming) return; // 防止重複送出

    const input = document.getElementById('chatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    this.addUserMessage(text);
    this.chatHistory.push({ role: 'user', content: text });

    // 混合模式：Agent Demo 優先（intent + 工具鏈 + 護欄），Ollama 負責自然語言潤色
    if (this.useAgentApi) {
      await this.sendToAgentApi(text);
    } else if (this.useOllama) {
      await this.sendToOllama(text);
    } else {
      this.showTyping();
      setTimeout(() => {
        this.hideTyping();
        const reply = this.localFallbackReply(text);
        this.addBotMessage(reply);
        this.chatHistory.push({ role: 'assistant', content: reply });
        this.persistToMemory(text, reply);
      }, 600 + Math.random() * 400);
    }
  },

  /** 呼叫 prototype server 的 /api/agent/step（非 LLM，純 demo 工具鏈） */
  async sendToAgentApi(userText) {
    this.isStreaming = true;
    this.showTyping();

    const userId = AppState?.user?.id || 'demo';
    const body = {
      userId,
      sessionId: this.agentSessionId || ('sess_' + Date.now()),
      text: userText,
      max_steps: 4,
      max_tool_calls: 2,
      deadline_ms: 2500
    };

    try {
      const resp = await fetch(this.agentApiBaseUrl + '/api/agent/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!resp.ok) throw new Error('Agent HTTP ' + resp.status);
      const data = await resp.json();

      this.hideTyping();

      const replyText = data?.replyText || '（沒有回覆）';
      const traceText = data?.traceText || this.buildTraceText(data?.trace);

      // 若 Ollama 也可用，嘗試用 Ollama 對 Agent 回覆做自然語言潤色
      let finalReply = replyText;
      if (this.useOllama && data?.trace?.intent && data.trace.intent !== 'guardrail_refuse') {
        try {
          const polished = await this.polishWithOllama(replyText, userText);
          if (polished) finalReply = polished;
        } catch (_) { /* 潤色失敗就用原回覆 */ }
      }

      const full = (this.showAgentTrace && traceText)
        ? (finalReply + `\n\n**【Agent Trace】**\n${traceText}`)
        : finalReply;
      this.addBotMessage(full);
      this.chatHistory.push({ role: 'assistant', content: finalReply });
      this.persistToMemory(userText, finalReply);

    } catch (e) {
      console.error('[小曦雲] Agent API 錯誤:', e);
      this.hideTyping();
      // Failover → Ollama → local
      if (this.useOllama) {
        await this.sendToOllama(userText);
      } else {
        const reply = this.localFallbackReply(userText);
        this.addBotMessage(reply + '\n\n_(Agent Demo 暫時不可用，使用本地回應)_');
        this.chatHistory.push({ role: 'assistant', content: reply });
        this.persistToMemory(userText, reply);
      }
    }

    this.isStreaming = false;
  },

  /** 用 Ollama 潤色 Agent 的回覆（非 streaming，簡短呼叫） */
  async polishWithOllama(agentReply, userText) {
    const body = {
      model: this.ollamaModel,
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'system', content: '以下是 Agent 生成的草稿回覆，請用小曦雲語氣稍微潤色（保留所有數據不要改動）。控制在 200 字以內。' },
        { role: 'user', content: userText },
        { role: 'assistant', content: agentReply },
        { role: 'user', content: '請潤色上面的回覆。' }
      ],
      stream: false,
      options: { temperature: 0.5, num_predict: 250 }
    };
    const resp = await fetch(this.agentApiBaseUrl + '/api/ollama/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000)
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data?.message?.content || null;
  },

  buildTraceText(trace) {
    if (!trace) return '';
    const lines = [];
    if (trace.intent) lines.push(`intent: ${trace.intent} (${trace.confidence ?? ''})`);
    if (Array.isArray(trace.tool_calls) && trace.tool_calls.length) {
      lines.push('工具鏈：');
      trace.tool_calls.forEach((c, i) => {
        lines.push(`  ${i + 1}) ${c.tool_name}@${c.tool_version} — ${c.status}${c.latency_ms != null ? ` (${c.latency_ms}ms)` : ''}`);
      });
    }
    if (Array.isArray(trace.citations) && trace.citations.length) {
      lines.push('引用：');
      trace.citations.forEach(c => lines.push(`  - ${c.source_id} (${c.doc_version})`));
    }
    if (trace.guardrails?.action && trace.guardrails.action !== 'allow') {
      lines.push(`護欄：${trace.guardrails.action}${Array.isArray(trace.guardrails.reason_codes) && trace.guardrails.reason_codes.length ? ` — ${trace.guardrails.reason_codes.join(', ')}` : ''}`);
    }
    if (trace.audit?.correlation_id) lines.push(`audit: ${trace.audit.correlation_id}`);
    return lines.join('\n');
  },

  /** 呼叫 Ollama /api/chat (streaming) */
  async sendToOllama(userText) {
    this.isStreaming = true;
    this.showTyping();

    // 注入當前用戶上下文
    const contextMsg = this.buildContextMessage();

    const body = {
      model: this.ollamaModel,
      messages: [
        ...this.chatHistory.slice(0, 1), // system prompt
        { role: 'system', content: contextMsg },
        ...this.chatHistory.slice(1),     // user + assistant history
      ],
      stream: true,
      options: { temperature: 0.7, num_predict: 300 }
    };

    try {
      // 使用 server proxy 以避免 CORS
      const resp = await fetch(this.agentApiBaseUrl + '/api/ollama/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!resp.ok) throw new Error('Ollama HTTP ' + resp.status);

      this.hideTyping();

      // Streaming 顯示
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullReply = '';

      // 建立空的 bot bubble 用於串流填充
      const bubbleId = 'stream-' + Date.now();
      this.appendStreamBubble(bubbleId);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Ollama 每行一個 JSON
        const lines = chunk.split('\n').filter(l => l.trim());
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              fullReply += json.message.content;
              this.updateStreamBubble(bubbleId, fullReply);
            }
          } catch(e) { /* skip parse error */ }
        }
      }

      this.messages.push({ role: 'bot', text: fullReply });
      this.chatHistory.push({ role: 'assistant', content: fullReply });
      this.persistToMemory(userText, fullReply);

    } catch (e) {
      console.error('[小曦雲] Ollama 錯誤:', e);
      this.hideTyping();
      // Fallback
      const reply = this.localFallbackReply(userText);
      this.addBotMessage(reply + '\n\n_(Ollama 暫時不可用，使用本地回應)_');
      this.chatHistory.push({ role: 'assistant', content: reply });
      this.persistToMemory(userText, reply);
    }

    this.isStreaming = false;
  },

  /** 建構當前系統狀態的上下文注入 */
  buildContextMessage() {
    const parts = [`用戶狀態：Lv.${AppState.level}，XP ${AppState.xp}`];
    if (AppState.user?.name) parts.push(`名稱：${AppState.user.name}`);
    if (AppState.currentGoal) {
      parts.push(`目標：${AppState.currentGoal.name}，金額 ${AppState.currentGoal.amount?.toLocaleString()} 元，期程 ${AppState.currentGoal.years} 年`);
    }
    if (AppState.profile?.riskGrade) {
      parts.push(`風險等級：${AppState.profile.riskGrade}（${AppState.profile.riskLabel || ''}）`);
    }
    const completedQuests = Object.entries(AppState.questStatus)
      .filter(([k, v]) => v === 'completed').map(([k]) => k);
    if (completedQuests.length) parts.push(`已完成任務：${completedQuests.join(', ')}`);
    parts.push(`目前頁面：${AppState.currentPage}`);
    return '以下是用戶的即時狀態（供回答參考）:\n' + parts.join('\n');
  },

  addUserMessage(text) {
    this.messages.push({ role: 'user', text });
    this.appendMessage('user', text);
  },

  addBotMessage(text) {
    this.messages.push({ role: 'bot', text });
    this.appendMessage('bot', text);
  },

  addSystemNote(text) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-system-note';
    div.style.cssText = 'text-align:center;font-size:0.7rem;color:var(--text-muted,#94a3b8);padding:4px 8px;opacity:0.7;';
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  appendMessage(role, text) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `chat-msg chat-${role}`;

    if (role === 'bot') {
      div.innerHTML = `
        <img src="IP_ICON/IP_HELLO.png" alt="小曦雲" class="chat-avatar">
        <div class="chat-bubble">${this.formatText(text)}</div>
      `;
    } else {
      div.innerHTML = `<div class="chat-bubble">${this.escapeHtml(text)}</div>`;
    }

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  /** 建立串流用的空 bubble */
  appendStreamBubble(id) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-msg chat-bot';
    div.id = id;
    div.innerHTML = `
      <img src="IP_ICON/IP_HELLO.png" alt="小曦雲" class="chat-avatar">
      <div class="chat-bubble" id="${id}-text"></div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  /** 更新串流 bubble 的內容 */
  updateStreamBubble(id, text) {
    const el = document.getElementById(id + '-text');
    if (el) {
      el.innerHTML = this.formatText(text);
      const container = document.getElementById('chatMessages');
      if (container) container.scrollTop = container.scrollHeight;
    }
  },

  showTyping() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    // 移除舊的
    this.hideTyping();
    const typing = document.createElement('div');
    typing.className = 'chat-msg chat-bot chat-typing';
    typing.id = 'chatTyping';
    typing.innerHTML = `
      <img src="IP_ICON/IP_HELLO.png" alt="小曦雲" class="chat-avatar">
      <div class="chat-bubble">
        <span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>
      </div>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
  },

  hideTyping() {
    const el = document.getElementById('chatTyping');
    if (el) el.remove();
  },

  /** 簡易 Markdown → HTML */
  formatText(text) {
    return this.escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_\((.+?)\)_/g, '<span style="font-size:0.72rem;color:var(--text-muted,#94a3b8);">($1)</span>')
      .replace(/\n/g, '<br>');
  },

  escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  },

  /** 將對話記錄持久化到 Memory API */
  async persistToMemory(userText, botReply) {
    try {
      const userId = AppState?.user?.id || 'demo';
      const now = new Date().toISOString();
      await fetch(this.agentApiBaseUrl + '/api/assistant/memory/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          messages: [
            { role: 'user', text: userText, timestamp: now },
            { role: 'bot', text: botReply, timestamp: now }
          ]
        })
      });
    } catch (e) {
      console.warn('[小曦雲] 記憶持久化失敗:', e.message);
    }
  },

  /* --- 五項預設常見問題快捷鍵 --- */
  faqList: [
    { icon: '🎯', label: '我該從哪裡開始？', text: '我是新手，該從哪裡開始我的理財冒險？' },
    { icon: '🛡️', label: '什麼是 KYC 風控？', text: '請問什麼是 KYC 風險評估？我為什麼要做？' },
    { icon: '📊', label: '如何看懂投資方案？', text: '我看不懂投資方案，可以用白話解釋嗎？' },
    { icon: '💰', label: '最大回撤是什麼？', text: '我聽不懂最大回撤' },
    { icon: '🏆', label: '怎麼查看我的戰績？', text: '我想看我目前的投資戰績和目標達成率' }
  ],

  showFaqButtons() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const wrap = document.createElement('div');
    wrap.className = 'chat-faq-wrap';
    wrap.id = 'chatFaqButtons';
    wrap.innerHTML = `
      <div class="chat-faq-title">常見問題</div>
      <div class="chat-faq-grid">
        ${this.faqList.map((f, i) => `
          <button class="faq-btn" onclick="Chatbot.askFaq(${i})">
            <span class="faq-icon">${f.icon}</span>
            <span class="faq-label">${f.label}</span>
          </button>
        `).join('')}
      </div>
    `;
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
  },

  askFaq(index) {
    const faq = this.faqList[index];
    if (!faq) return;
    // 移除 FAQ 按鈕組
    const el = document.getElementById('chatFaqButtons');
    if (el) el.remove();
    // 用輸入框送出
    const input = document.getElementById('chatInput');
    if (input) input.value = faq.text;
    this.send();
  },

  /* --- 本地 Fallback 回覆（Ollama 不可用時） --- */
  localFallbackReply(input) {
    const lower = input.toLowerCase();

    if (lower.includes('開始') || lower.includes('第一步') || lower.includes('新手')) {
      return '冒險的第一步是「設定你的理財目標」🎯\n\n點擊左側「初心者目標設定」就可以開始囉！';
    }
    if (lower.includes('目標') || lower.includes('goal')) {
      return '目標設定就像選擇你的冒險方向！🗺️\n\n說出你的故事，AI 會幫你轉化為結構化規劃。';
    }
    if (lower.includes('kyc') || lower.includes('風險') || lower.includes('評估')) {
      return '風險評估就像冒險前的「體檢」🛡️\n\n5 題快速問答，結果分成 C1~C5 五個等級！';
    }
    if (lower.includes('方案') || lower.includes('推薦') || lower.includes('建議')) {
      return '我會根據你的目標和風險屬性，打造專屬投資方案 📊\n\n看不懂可以叫我「換個方式說」！';
    }
    if (lower.includes('下單') || lower.includes('執行') || lower.includes('交易')) {
      return '一鍵下單前會自動進行 Pre-trade Check ⚔️\n\n全部通過才會送出交易！';
    }
    if (lower.includes('績效') || lower.includes('報酬') || lower.includes('資產') || lower.includes('戰績')) {
      return '戰績回顧可以看到完整冒險成果！💎\n\n資產總值、損益變化、目標達成率一目了然。';
    }
    if (lower.includes('等級') || lower.includes('經驗') || lower.includes('xp')) {
      return `你目前是 Lv.${AppState.level}，經驗值 ${AppState.xp} ✨\n\n持續完成任務就能升級！`;
    }
    if (lower.includes('你好') || lower.includes('嗨') || lower.includes('hi') || lower.includes('hello')) {
      return `你好，${AppState.user?.name || '冒險者'}！很高興見到你 😊\n\n需要我幫你什麼嗎？`;
    }

    const defaults = [
      '嗯...這個問題有點深奧 🤔\n\n你可以問我關於理財目標、風險評估、投資方案等問題！',
      '讓我想想...💭\n\n目前我能幫你：理財旅程指引、任務進度查詢、功能說明。要試試看嗎？',
      '好問題！📚 不然我們來聊聊你的理財冒險需求吧？',
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }
};

// Global toggle function referenced from HTML
function toggleChatbot() {
  Chatbot.toggle();
}

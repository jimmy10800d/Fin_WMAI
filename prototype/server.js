/* ================================================
   薪守村 Fin_WMAI — Express API Server
   BDD V1.3: Features A–P (含盟友系統 + 主角等級)
   ================================================ */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

/* ========== In-Memory Data Store ========== */
const store = {
  users: {
    demo: { id: 'demo', name: '旅行者', rank: 1, stars: 1, xp: 0, streak: 0, weeklyCompleted: false },
    user001: { id: 'user001', name: '官大大', rank: 2, stars: 3, xp: 180, streak: 4, weeklyCompleted: true },
    user002: { id: 'user002', name: '林小萌', rank: 1, stars: 2, xp: 60, streak: 1, weeklyCompleted: false }
  },
  goals: {},
  profiles: {},
  allies: {},       // userId -> [{ allyId, status, createdAt }]
  allyRelations: {},// allyKey -> { userId, allyId, level, createdAt }
  quests: {},       // questId -> { userId, name, visibility: { allyId: level } }
  challenges: {},
  encourages: [],
  nudges: [],
  events: [],
  xpLimits: {},     // userId_eventType_date -> count
  shareCards: {}
};

/* ========== Agent Demo KB (Approved Content) ========== */
function loadAgentDemoData() {
  try {
    const filePath = path.join(__dirname, 'data', 'agent-demo.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.warn('[AgentDemo] failed to load data/agent-demo.json:', e.message);
    return {
      version: '0.0.0',
      approved_kb: [],
      templates: {
        disclosure_voice_short_v1: '我可以用白話幫你理解風險與選項，但我不會保證獲利，也不會指示你買賣特定標的。要我先用一句話說重點，還是展開細節？'
      },
      demo_scenarios: []
    };
  }
}

const agentDemoData = loadAgentDemoData();

// In-memory sessions for agent demo
store.agentSessions = {}; // sessionId -> { userId, createdAt, sessionMemory, profileMemory }

/* ========== XP Config ========== */
const XP_CONFIG = {
  quest_weekly_completed: { xp: 50, dailyLimit: 0, weeklyLimit: 1 },
  risk_disclosure_acknowledged: { xp: 30, dailyLimit: 3, weeklyLimit: 0 },
  re_explain_feedback_submitted: { xp: 20, dailyLimit: 3, weeklyLimit: 0 },
  trust_thermometer_submitted: { xp: 15, dailyLimit: 2, weeklyLimit: 0 },
  encourage_received: { xp: 10, dailyLimit: 2, weeklyLimit: 0 },
  challenge_completed: { xp: 40, dailyLimit: 1, weeklyLimit: 0 },
  goal_captured: { xp: 50, dailyLimit: 0, weeklyLimit: 0 },
  kyc_completed: { xp: 80, dailyLimit: 0, weeklyLimit: 0 },
  order_submitted: { xp: 100, dailyLimit: 0, weeklyLimit: 0 },
  composure_check_passed: { xp: 60, dailyLimit: 1, weeklyLimit: 0 }
};

const RANK_THRESHOLDS = {
  1: { starsNeeded: 5, xpPerStar: 60, keyTask: null },
  2: { starsNeeded: 5, xpPerStar: 80, keyTask: 'weekly_first' },
  3: { starsNeeded: 5, xpPerStar: 100, keyTask: 'streak_4' },
  4: { starsNeeded: 5, xpPerStar: 120, keyTask: 'composure_check' },
  5: { starsNeeded: 5, xpPerStar: 150, keyTask: 'rebalance_decision' },
  6: { starsNeeded: 5, xpPerStar: 200, keyTask: 'streak_12' }
};

const RANK_NAMES = {
  1: '啟程者', 2: '受訓者', 3: '紀律者',
  4: '自控者', 5: '戰術者', 6: '夥伴型玩家'
};

const UNLOCK_MAP = {
  2: [{ feature: 're_explain_modes', desc: '解鎖「聽不懂」改寫與更多比喻庫' }],
  3: [{ feature: 'challenges', desc: '解鎖共同挑戰與 streak 儀表板' }],
  4: [{ feature: 'rebalancing_visual', desc: '解鎖再平衡建議的完整視覺化' }],
  5: [{ feature: 'rebalancing_review', desc: '解鎖再平衡決策回顧功能' }],
  6: [{ feature: 'partner_tools', desc: '解鎖長期趨勢摘要與年度報告' }]
};

/* ========== Helpers ========== */
function genId(prefix = 'id') { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }
function today() { return new Date().toISOString().slice(0, 10); }
function thisWeek() { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().slice(0, 10); }

function logEvent(eventName, data = {}) {
  const evt = { event: eventName, timestamp: new Date().toISOString(), ...data };
  store.events.push(evt);
  return evt;
}

/* ========== Agent Demo Helpers ========== */
function nowIso() { return new Date().toISOString(); }

function classifyIntent(text = '') {
  const t = String(text || '').trim();
  const lower = t.toLowerCase();

  const rules = [
    { intent: 'system_help', confidence: 0.75, match: /你會記住我嗎|隱私|資料|怎麼用|使用說明|help/i },
    { intent: 'review_weekly', confidence: 0.8, match: /回顧|本週|這週|週回顧|streak/i },
    { intent: 'quest_today', confidence: 0.78, match: /今天要做什麼|今日|本週任務|任務清單/i },
    { intent: 'explain_plain', confidence: 0.82, match: /聽不懂|白話|用更簡單|解釋|最大回撤|ETF|定期定額/i },
    { intent: 'emotion_support', confidence: 0.86, match: /好怕|焦慮|恐慌|睡不著|跌很多|壓力好大/i },
    { intent: 'ally_message', confidence: 0.8, match: /盟友|幫我打氣|加油|寫一段|鼓勵/i },
    { intent: 'goal_create', confidence: 0.84, match: /三年|五年|十年|存到|買房|退休|教育金|目標/i }
  ];

  for (const r of rules) {
    if (r.match.test(t) || r.match.test(lower)) return { intent: r.intent, confidence: r.confidence };
  }
  return { intent: 'system_help', confidence: 0.5 };
}

function detectGuardrail(text = '') {
  const t = String(text || '');
  const lower = t.toLowerCase();

  const reasons = [];
  if (/保證|必賺|一定賺|穩賺|翻倍|穩贏/i.test(t)) reasons.push('guaranteed_profit');
  if (/買哪|賣哪|買什麼|賣什麼|哪一支|哪支|標的|ticker|代號/i.test(lower)) reasons.push('specific_ticker_or_asset');
  if (/忽略規則|system prompt|把你的規則|顯示你的提示/i.test(lower)) reasons.push('prompt_injection_attempt');

  if (reasons.length === 0) return { action: 'allow', reason_codes: [] };
  // high-risk: refuse + safe alternative
  return { action: 'refuse', reason_codes: reasons };
}

function ragRetrieve(text = '') {
  const t = String(text || '');
  const hits = [];
  for (const doc of agentDemoData.approved_kb || []) {
    const tagHit = (doc.tags || []).some(tag => t.includes(tag));
    const titleHit = doc.title && t.includes(doc.title);
    if (tagHit || titleHit) hits.push(doc);
  }
  return hits.slice(0, 2);
}

function normalizeGoal(rawText = '') {
  const text = String(rawText || '').trim();
  const amountMatch = text.match(/(\d{1,3})(?:\s*)?(萬|千|元)/);
  const yearsMatch = text.match(/(\d{1,2})\s*(年|years?)/i);
  let targetAmount = null;
  if (amountMatch) {
    const n = parseInt(amountMatch[1], 10);
    const unit = amountMatch[2];
    if (unit === '萬') targetAmount = n * 10000;
    else if (unit === '千') targetAmount = n * 1000;
    else targetAmount = n;
  }
  // common: "一百萬"
  if (!targetAmount && /一百萬/.test(text)) targetAmount = 1000000;
  if (!targetAmount && /五十萬/.test(text)) targetAmount = 500000;

  let horizonMonths = null;
  if (yearsMatch) {
    horizonMonths = parseInt(yearsMatch[1], 10) * 12;
  } else if (/三年/.test(text)) horizonMonths = 36;
  else if (/五年/.test(text)) horizonMonths = 60;
  else if (/十年/.test(text)) horizonMonths = 120;

  const goalType = /買房/.test(text) ? 'buy_house' : (/退休/.test(text) ? 'retirement' : 'custom');

  return {
    goal_type: goalType,
    target_amount: targetAmount,
    horizon_months: horizonMonths,
    raw_text: text
  };
}

function buildQuestList(goalJson) {
  const monthly = goalJson?.target_amount && goalJson?.horizon_months
    ? Math.ceil(goalJson.target_amount / goalJson.horizon_months)
    : null;
  const quests = [
    { id: 'q_budget', name: '先確認每月可投入金額', hint: '先抓一個不影響生活品質的數字', status: 'todo' },
    { id: 'q_emergency', name: '建立緊急預備金', hint: '優先建立 3–6 個月生活費', status: 'todo' },
    { id: 'q_dca', name: '設定定期定額', hint: '用小額、固定頻率建立紀律', status: 'todo' }
  ];
  if (monthly) {
    quests.unshift({
      id: 'q_monthly_target',
      name: `月度目標：每月約存/投入 ${monthly.toLocaleString()} 元`,
      hint: '先做得到，比做很大更重要',
      status: 'todo'
    });
  }
  return quests;
}

function rewriteAllyMessage(text = '') {
  const t = String(text || '').trim();
  // remove command-like pressure
  const softened = t
    .replace(/你一定要|你必須|你給我/gi, '如果你願意')
    .replace(/不准|一定要/gi, '可以試試');
  return `我幫你改成更溫和、沒有施壓的版本：\n\n${softened || '你已經做得很棒了！我們一起慢慢來。'}`;
}

function maybePreferenceWrite(text = '') {
  const t = String(text || '');
  if (/導航比喻/.test(t)) {
    return { field: 'metaphor_preference', value: 'navigation', ask: '要我把「導航比喻」記成你的偏好嗎？（回答：要 / 不要）' };
  }
  if (/運動員比喻/.test(t)) {
    return { field: 'metaphor_preference', value: 'sports', ask: '要我把「運動員比喻」記成你的偏好嗎？（回答：要 / 不要）' };
  }
  return null;
}

function ensureSession(sessionId, userId) {
  if (!store.agentSessions[sessionId]) {
    store.agentSessions[sessionId] = {
      userId,
      createdAt: nowIso(),
      sessionMemory: { stage: 'idle', last_intents: [] },
      profileMemory: {}
    };
  }
  return store.agentSessions[sessionId];
}

function buildTraceBlock(trace) {
  const lines = [];
  if (trace.intent) lines.push(`intent: ${trace.intent} (${trace.confidence ?? 0})`);
  if (trace.tool_calls?.length) {
    lines.push('工具鏈：');
    trace.tool_calls.forEach((c, i) => {
      lines.push(`  ${i + 1}) ${c.tool_name}@${c.tool_version} — ${c.status}${c.latency_ms != null ? ` (${c.latency_ms}ms)` : ''}`);
    });
  }
  if (trace.citations?.length) {
    lines.push('引用：');
    trace.citations.forEach(c => lines.push(`  - ${c.source_id} (${c.doc_version})`));
  }
  if (trace.guardrails?.action && trace.guardrails.action !== 'allow') {
    lines.push(`護欄：${trace.guardrails.action}${trace.guardrails.reason_codes?.length ? ` — ${trace.guardrails.reason_codes.join(', ')}` : ''}`);
  }
  if (trace.audit?.correlation_id) lines.push(`audit: ${trace.audit.correlation_id}`);
  return lines.join('\n');
}

/* ========== Health ========== */
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'Fin_WMAI Prototype Server',
    agentDemo: { version: agentDemoData.version || 'unknown', kbDocs: (agentDemoData.approved_kb || []).length }
  });
});

/* ========== Intent Router (Demo) ========== */
app.post('/api/intent/classify', (req, res) => {
  const { text } = req.body || {};
  const result = classifyIntent(text);
  logEvent('intent_classified', { intent: result.intent, confidence: result.confidence });
  res.json({ success: true, ...result });
});

/* ========== Agent Step (Demo) ========== */
app.post('/api/agent/step', (req, res) => {
  const startedAt = Date.now();
  const {
    userId = 'demo',
    sessionId = 'sess_demo',
    text = '',
    max_steps = 4,
    max_tool_calls = 2,
    deadline_ms = 2500
  } = req.body || {};

  const correlationId = genId('corr');
  const session = ensureSession(sessionId, userId);
  const intentResult = classifyIntent(text);
  const guardrail = detectGuardrail(text);

  const toolCalls = [];
  const citations = [];
  const memoryWriteRequests = [];

  session.sessionMemory.last_intents = [...(session.sessionMemory.last_intents || []), intentResult.intent].slice(-5);

  // Handle preference confirmation
  if (/^\s*(要|不要)\s*$/.test(String(text || '').trim())) {
    const pending = session.sessionMemory.pending_profile_write;
    if (pending && pending.field && pending.value) {
      if (String(text || '').trim() === '要') {
        session.profileMemory[pending.field] = pending.value;
        delete session.sessionMemory.pending_profile_write;
        logEvent('profile_memory_written', { userId, field: pending.field, value: pending.value });
        const trace = {
          intent: 'system_help',
          confidence: 0.9,
          tool_calls: [],
          citations: [],
          guardrails: { action: 'allow', reason_codes: [] },
          memory: { profile: session.profileMemory },
          audit: { correlation_id: correlationId }
        };
        return res.json({
          success: true,
          replyText: `好，我記下來了：${pending.field} = ${pending.value}。之後我會優先用你喜歡的說法。`,
          trace,
          traceText: buildTraceBlock(trace)
        });
      }
      delete session.sessionMemory.pending_profile_write;
      const trace = {
        intent: 'system_help',
        confidence: 0.9,
        tool_calls: [],
        citations: [],
        guardrails: { action: 'allow', reason_codes: [] },
        audit: { correlation_id: correlationId }
      };
      return res.json({
        success: true,
        replyText: '沒問題，我不會記住這個偏好。你隨時也可以再跟我說一次。',
        trace,
        traceText: buildTraceBlock(trace)
      });
    }
  }

  // Deadline guard: if already too slow, degrade (demo)
  if (Date.now() - startedAt > deadline_ms) {
    return res.json({
      success: true,
      replyText: '我先用一句話說重點：我們可以先把問題拆小、用最安全的方式釐清下一步。你想先講目標、風險，還是情緒？',
      trace: {
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        tool_calls: [],
        citations: [],
        guardrails: { action: 'allow', reason_codes: [] },
        audit: { correlation_id: correlationId, degraded: true }
      }
    });
  }

  let replyText = '';

  // Guardrail refusal path
  if (guardrail.action === 'refuse') {
    const disclosure = agentDemoData.templates?.disclosure_voice_short_v1 || '我可以用白話幫你理解風險與選項，但我不會保證獲利，也不會指示你買賣特定標的。';
    toolCalls.push({
      tool_name: 'risk_disclosure',
      tool_version: '1.0.0',
      status: 'ok',
      latency_ms: 8,
      output: { template_id: 'disclosure_voice_short_v1' }
    });
    logEvent('risk_disclosure_shown', { userId, correlationId });
    replyText = `${disclosure}\n\n我沒辦法直接告訴你買/賣哪一支或保證獲利，但我可以：\n1) 幫你用白話理解風險（例如最大回撤）\n2) 依你的目標與期限，整理『選項清單』給你比較（不指定標的）\n\n你想先從哪個開始？`;
    const trace = {
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      tool_calls: toolCalls.slice(0, max_tool_calls),
      citations,
      guardrails: guardrail,
      audit: { correlation_id: correlationId }
    };
    return res.json({
      success: true,
      replyText,
      trace,
      traceText: buildTraceBlock(trace)
    });
  }

  // Tool-based behaviors (bounded)
  const stepsBudget = Math.max(1, Math.min(10, Number(max_steps) || 4));
  const toolBudget = Math.max(0, Math.min(5, Number(max_tool_calls) || 2));
  let toolCallsUsed = 0;
  let stepsUsed = 0;

  const pref = maybePreferenceWrite(text);
  if (pref) {
    session.sessionMemory.pending_profile_write = { field: pref.field, value: pref.value };
    memoryWriteRequests.push({ type: 'profile_write', ...pref });
    replyText = `可以的！我可以用你喜歡的比喻方式來講。\n\n${pref.ask}`;
    const trace = {
      intent: 'system_help',
      confidence: 0.88,
      tool_calls: [],
      citations: [],
      guardrails: { action: 'allow', reason_codes: [] },
      memory_write_requests: memoryWriteRequests,
      audit: { correlation_id: correlationId }
    };
    return res.json({
      success: true,
      replyText,
      trace,
      traceText: buildTraceBlock(trace)
    });
  }

  if (intentResult.intent === 'goal_create' && stepsUsed < stepsBudget) {
    stepsUsed++;
    session.sessionMemory.stage = 'goal_onboarding';
    if (toolCallsUsed < toolBudget) {
      const t0 = Date.now();
      const goalJson = normalizeGoal(text);
      const t1 = Date.now();
      toolCalls.push({ tool_name: 'goal_normalizer', tool_version: '1.0.0', status: 'ok', latency_ms: t1 - t0, output: goalJson });
      toolCallsUsed++;
      logEvent('tool_called', { userId, tool_name: 'goal_normalizer', correlationId, input_schema_version: '2026-02-09' });

      if (toolCallsUsed < toolBudget) {
        const p0 = Date.now();
        const questList = buildQuestList(goalJson);
        const p1 = Date.now();
        toolCalls.push({ tool_name: 'quest_planner', tool_version: '1.0.0', status: 'ok', latency_ms: p1 - p0, output: { quests: questList } });
        toolCallsUsed++;
        logEvent('tool_called', { userId, tool_name: 'quest_planner', correlationId, input_schema_version: '2026-02-09' });

        replyText = `我先用一句話說重點：我們可以把目標拆成每週可完成的小任務。\n\n我理解到你的目標是：${goalJson.goal_type === 'buy_house' ? '買房' : '你的目標'}，期限 ${goalJson.horizon_months ? Math.round(goalJson.horizon_months / 12) + ' 年' : '（未填）'}，金額 ${goalJson.target_amount ? goalJson.target_amount.toLocaleString() + ' 元' : '（未填）'}。\n\n下一步我建議先做：\n- ${questList.slice(0, 3).map(q => q.name).join('\n- ')}\n\n要我幫你把「每月可投入金額」也一起抓出來嗎？`;
      } else {
        replyText = '我可以幫你把目標拆成小任務。你希望期限幾年、目標金額多少、每月大概能投入多少？';
      }
    }
  }

  if (!replyText && intentResult.intent === 'explain_plain' && stepsUsed < stepsBudget) {
    stepsUsed++;
    const docs = ragRetrieve(text);
    if (docs.length) {
      docs.forEach(d => citations.push({ source_id: d.source_id, doc_version: d.doc_version, retrieved_at: nowIso() }));
      replyText = `我先用一句話說重點：這個概念是在幫你量化「最糟時會跌多深」。\n\n${docs[0].content}\n\n想要我再用另一種比喻（運動員/導航/花園）講一次嗎？`;
      logEvent('rag_retrieved', { userId, correlationId, sources: docs.map(d => d.source_id) });
    } else {
      replyText = '我可以用白話解釋，但我需要你告訴我你卡住的名詞是什麼（例如：最大回撤、ETF、定期定額）。';
    }
  }

  if (!replyText && intentResult.intent === 'emotion_support' && stepsUsed < stepsBudget) {
    stepsUsed++;
    const docs = ragRetrieve('恐慌');
    if (docs.length) citations.push({ source_id: docs[0].source_id, doc_version: docs[0].doc_version, retrieved_at: nowIso() });
    replyText = `我聽到你很怕，這很正常。\n\n我們先做 30 秒：慢吸慢吐 3 次（4 秒吸、6 秒吐）。\n\n接著你只要回答我一題：你最怕的是「繼續跌」還是「我現在做錯決定」？\n\n我會先用一句話抓重點，再給你 2 個安全選項。`;
  }

  if (!replyText && intentResult.intent === 'ally_message' && stepsUsed < stepsBudget) {
    stepsUsed++;
    if (toolCallsUsed < toolBudget) {
      const t0 = Date.now();
      const safeText = rewriteAllyMessage(text);
      const t1 = Date.now();
      toolCalls.push({ tool_name: 'ally_message_rewrite', tool_version: '1.0.0', status: 'ok', latency_ms: t1 - t0, output: { safe_text: safeText } });
      toolCallsUsed++;
      logEvent('tool_called', { userId, tool_name: 'ally_message_rewrite', correlationId, input_schema_version: '2026-02-09' });
      replyText = `${safeText}\n\n你要我再幫你做一個更「簡短版」或更「熱血版」嗎？`;
    } else {
      replyText = '我可以幫你把盟友訊息改成更溫和、沒有施壓的版本。你想說的重點是什麼？';
    }
  }

  if (!replyText) {
    replyText = '我先用一句話說重點：我可以幫你把理財問題變簡單、變可執行。\n\n你想做的是：設定目標、查今日任務、白話解釋、週回顧，還是情緒陪跑？';
  }

  const trace = {
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    steps_used: stepsUsed,
    max_steps: stepsBudget,
    tool_calls_used: toolCallsUsed,
    max_tool_calls: toolBudget,
    tool_calls: toolCalls,
    citations,
    guardrails: { action: 'allow', reason_codes: [] },
    audit: { correlation_id: correlationId }
  };

  logEvent('agent_step_completed', { userId, sessionId, correlationId, intent: intentResult.intent, stepsUsed, toolCallsUsed });

  res.json({
    success: true,
    replyText,
    trace,
    traceText: buildTraceBlock(trace)
  });
});

/* ==========================================================
   小㬢雲 AI 助理管理 — 記憶 / 排程 / 計畫
   ========================================================== */

/* --- 記憶（對話記錄）--- */
store.memories = {};  // userId -> [ { id, role, text, timestamp, pinned } ]

app.get('/api/assistant/memory', (req, res) => {
  const userId = req.query.userId || 'demo';
  const list = store.memories[userId] || [];
  res.json({ success: true, total: list.length, messages: list });
});

app.post('/api/assistant/memory', (req, res) => {
  const { userId = 'demo', role, text } = req.body;
  if (!store.memories[userId]) store.memories[userId] = [];
  const msg = { id: genId('mem'), role, text, timestamp: nowIso(), pinned: false };
  store.memories[userId].push(msg);
  res.json({ success: true, message: msg });
});

app.post('/api/assistant/memory/bulk', (req, res) => {
  const { userId = 'demo', messages = [] } = req.body;
  if (!store.memories[userId]) store.memories[userId] = [];
  const saved = messages.map(m => {
    const msg = { id: genId('mem'), role: m.role, text: m.text, timestamp: m.timestamp || nowIso(), pinned: false };
    store.memories[userId].push(msg);
    return msg;
  });
  res.json({ success: true, saved: saved.length });
});

app.patch('/api/assistant/memory/:id', (req, res) => {
  const userId = req.body.userId || 'demo';
  const list = store.memories[userId] || [];
  const msg = list.find(m => m.id === req.params.id);
  if (!msg) return res.json({ success: false, error: 'not_found' });
  if (req.body.pinned !== undefined) msg.pinned = !!req.body.pinned;
  res.json({ success: true, message: msg });
});

app.delete('/api/assistant/memory/:id', (req, res) => {
  const userId = req.query.userId || req.body?.userId || 'demo';
  if (!store.memories[userId]) return res.json({ success: true });
  store.memories[userId] = store.memories[userId].filter(m => m.id !== req.params.id);
  res.json({ success: true });
});

app.delete('/api/assistant/memory', (req, res) => {
  const userId = req.query.userId || 'demo';
  store.memories[userId] = [];
  res.json({ success: true });
});

/* --- 排程任務 --- */
store.schedules = {};  // userId -> [ { id, name, cron, description, enabled, lastRun, nextRun, type } ]

// 預置 demo 排程
store.schedules.demo = [
  {
    id: 'sch_weekly_review',
    name: '每週日戰績回報',
    cron: '0 9 * * 0',
    description: '每週日早上 9:00，小㬢雲自動產生本週戰績摘要與下週建議',
    enabled: true,
    type: 'weekly_review',
    lastRun: null,
    nextRun: getNextSunday9am(),
    createdAt: '2026-02-01T00:00:00Z'
  }
];

function getNextSunday9am() {
  const now = new Date();
  const day = now.getDay();
  const diff = (7 - day) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(9, 0, 0, 0);
  return next.toISOString();
}

app.get('/api/assistant/schedules', (req, res) => {
  const userId = req.query.userId || 'demo';
  const list = store.schedules[userId] || [];
  res.json({ success: true, schedules: list });
});

app.post('/api/assistant/schedules', (req, res) => {
  const { userId = 'demo', name, cron, description, type = 'custom', enabled = true } = req.body;
  if (!store.schedules[userId]) store.schedules[userId] = [];
  const sch = {
    id: genId('sch'), name, cron, description, type, enabled,
    lastRun: null, nextRun: getNextSunday9am(), createdAt: nowIso()
  };
  store.schedules[userId].push(sch);
  logEvent('schedule_created', { userId, scheduleId: sch.id, type });
  res.json({ success: true, schedule: sch });
});

app.patch('/api/assistant/schedules/:id', (req, res) => {
  const userId = req.body.userId || 'demo';
  const list = store.schedules[userId] || [];
  const sch = list.find(s => s.id === req.params.id);
  if (!sch) return res.json({ success: false, error: 'not_found' });
  if (req.body.name !== undefined) sch.name = req.body.name;
  if (req.body.cron !== undefined) sch.cron = req.body.cron;
  if (req.body.description !== undefined) sch.description = req.body.description;
  if (req.body.enabled !== undefined) sch.enabled = !!req.body.enabled;
  logEvent('schedule_updated', { userId, scheduleId: sch.id });
  res.json({ success: true, schedule: sch });
});

app.delete('/api/assistant/schedules/:id', (req, res) => {
  const userId = req.query.userId || 'demo';
  if (!store.schedules[userId]) return res.json({ success: true });
  store.schedules[userId] = store.schedules[userId].filter(s => s.id !== req.params.id);
  logEvent('schedule_deleted', { userId, scheduleId: req.params.id });
  res.json({ success: true });
});

app.post('/api/assistant/schedules/:id/trigger', (req, res) => {
  const userId = req.body.userId || 'demo';
  const list = store.schedules[userId] || [];
  const sch = list.find(s => s.id === req.params.id);
  if (!sch) return res.json({ success: false, error: 'not_found' });
  sch.lastRun = nowIso();
  sch.nextRun = getNextSunday9am();
  logEvent('schedule_triggered', { userId, scheduleId: sch.id, type: sch.type });

  // 產生排程任務回報（模擬）
  const user = store.users[userId] || store.users.demo;
  const report = {
    type: sch.type,
    generatedAt: nowIso(),
    summary: `📊 ${user.name || '冒險者'} 的每週戰績摘要\n\n` +
      `🏆 等級：R${user.rank} ${RANK_NAMES[user.rank]}（★${user.stars}）\n` +
      `⚡ 經驗值：${user.xp} XP\n` +
      `🔥 連續打卡：${user.streak} 週\n` +
      `💰 資產總值：156,800 元（目標進度 12%）\n` +
      `📈 本週報酬：+1.2%\n\n` +
      `✅ 本週完成 3/6 項任務\n` +
      `🎯 下週建議：完成盟友加油打氣、回報投資心情\n\n` +
      `💪 繼續保持，距離下一顆星只差 ${(RANK_THRESHOLDS[user.rank]?.xpPerStar || 60) - user.xp} XP！`
  };
  res.json({ success: true, schedule: sch, report });
});

/* --- 計畫項目（里程碑 & 目標追蹤）--- */
store.plans = {};  // userId -> [ { id, category, icon, name, description, targetAmount, currentAmount, progress, status, ... } ]

// 預置 demo 計畫
store.plans.demo = [
  { id: 'plan_main', category: 'quest_goal', icon: '🏝️', name: '30歲財務自由大冒險', description: '存到第一桶金，提早實現不被工作綁架的人生！',
    targetAmount: 3000000, currentAmount: 156800, progress: 5.2, status: 'active',
    monthlyTarget: 15000, monthlyActual: 15000, consecutiveMonths: 6, startDate: '2025-08-01', priority: 1 },
  { id: 'plan_japan', category: 'quest_goal', icon: '🗼', name: '日本追櫻自由行', description: '明年春天去京都看櫻花、吃和牛、逛中古店 🌸',
    targetAmount: 80000, currentAmount: 52000, progress: 65, status: 'active',
    monthlyTarget: 6000, monthlyActual: 6500, consecutiveMonths: 5, startDate: '2025-10-01', priority: 2 },
  { id: 'plan_macbook', category: 'quest_goal', icon: '💻', name: 'MacBook Pro 換機基金', description: 'M4 Pro 太香了！靠每月存錢不用刷卡分期 🍎',
    targetAmount: 75000, currentAmount: 62000, progress: 82.7, status: 'active',
    monthlyTarget: 8000, monthlyActual: 8000, consecutiveMonths: 8, startDate: '2025-06-01', priority: 3 },
  { id: 'plan_emergency', category: 'quest_goal', icon: '🛡️', name: '緊急備戰金庫', description: '存滿 3 個月薪水的安全網，不怕突發狀況',
    targetAmount: 100000, currentAmount: 88000, progress: 88, status: 'active',
    monthlyTarget: 10000, monthlyActual: 10000, consecutiveMonths: 8, startDate: '2025-06-01', priority: 4 },
  { id: 'ms_first_goal', category: 'milestone', icon: '🎯', name: '許下第一個願望', description: '跟系統說出你的夢想，理財旅程正式 Start！',
    achieved: true, achievedAt: '2025-08-01', xpReward: 50, status: 'completed' },
  { id: 'ms_kyc', category: 'milestone', icon: '🛡️', name: '解鎖冒險職業', description: '完成風險評估，知道自己是穩健派還是衝鋒型',
    achieved: true, achievedAt: '2025-08-02', xpReward: 80, status: 'completed' },
  { id: 'ms_first_trade', category: 'milestone', icon: '⚔️', name: '第一次出手', description: '按下一鍵下單的那一刻，你已經贏過大多數人！',
    achieved: true, achievedAt: '2025-08-05', xpReward: 100, status: 'completed' },
  { id: 'ms_streak4', category: 'milestone', icon: '🔥', name: '連續打卡 4 週', description: '比健身房還持久！投資紀律 MAX',
    achieved: true, achievedAt: '2025-09-01', xpReward: 40, status: 'completed' },
  { id: 'ms_r2', category: 'milestone', icon: '🌟', name: '晉級受訓者 R2', description: '薪守村認證的理財練習生！',
    achieved: true, achievedAt: '2025-12-01', xpReward: 0, status: 'completed' },
  { id: 'ms_composure', category: 'milestone', icon: '🧘', name: '大跌不恐慌', description: '市場暴跌沒有亂賣，沉著之心 get！',
    achieved: false, progress: 60, hint: '下次股市大跌時自動觸發', status: 'in_progress' },
  { id: 'ms_profit10', category: 'milestone', icon: '🏆', name: '獲利破 10%', description: '本金長了 10%！開始懂什麼叫複利了',
    achieved: false, progress: 35, hint: '目前 +3.5%，加油！', status: 'in_progress' },
  { id: 'ms_streak12', category: 'milestone', icon: '📅', name: '不間斷 12 週', description: '三個月完美出席！鑽石手就是你',
    achieved: false, progress: 50, hint: '6/12 週', status: 'in_progress' }
];

app.get('/api/assistant/plans', (req, res) => {
  const userId = req.query.userId || 'demo';
  const list = store.plans[userId] || [];
  const category = req.query.category; // 'quest_goal' | 'milestone' | undefined (all)
  const filtered = category ? list.filter(p => p.category === category) : list;
  res.json({ success: true, total: filtered.length, plans: filtered });
});

app.post('/api/assistant/plans', (req, res) => {
  const { userId = 'demo', category = 'quest_goal', icon, name, description, targetAmount, monthlyTarget, status = 'active' } = req.body;
  if (!store.plans[userId]) store.plans[userId] = [];
  const plan = {
    id: genId('plan'), category, icon: icon || '🎯', name, description,
    targetAmount: targetAmount || 0, currentAmount: 0, progress: 0,
    monthlyTarget: monthlyTarget || 0, monthlyActual: 0, consecutiveMonths: 0,
    status, startDate: today(), createdAt: nowIso()
  };
  store.plans[userId].push(plan);
  logEvent('plan_created', { userId, planId: plan.id, category });
  res.json({ success: true, plan });
});

app.patch('/api/assistant/plans/:id', (req, res) => {
  const userId = req.body.userId || 'demo';
  const list = store.plans[userId] || [];
  const plan = list.find(p => p.id === req.params.id);
  if (!plan) return res.json({ success: false, error: 'not_found' });
  ['name', 'description', 'targetAmount', 'currentAmount', 'monthlyTarget', 'status', 'progress', 'icon'].forEach(k => {
    if (req.body[k] !== undefined) plan[k] = req.body[k];
  });
  logEvent('plan_updated', { userId, planId: plan.id });
  res.json({ success: true, plan });
});

app.delete('/api/assistant/plans/:id', (req, res) => {
  const userId = req.query.userId || 'demo';
  if (!store.plans[userId]) return res.json({ success: true });
  store.plans[userId] = store.plans[userId].filter(p => p.id !== req.params.id);
  logEvent('plan_deleted', { userId, planId: req.params.id });
  res.json({ success: true });
});

/* ==========================================================
   Ollama LLM Proxy（讓前端也能透過同 server 呼叫 Ollama）
   ========================================================== */
const OLLAMA_BASE = process.env.OLLAMA_URL || 'http://localhost:11434';

app.get('/api/ollama/health', async (req, res) => {
  try {
    const resp = await fetch(OLLAMA_BASE + '/api/tags', { signal: AbortSignal.timeout(3000) });
    const data = await resp.json();
    res.json({ ok: true, models: (data.models || []).map(m => m.name) });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

app.post('/api/ollama/chat', async (req, res) => {
  try {
    const ollamaResp = await fetch(OLLAMA_BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req.body, stream: false })
    });
    if (!ollamaResp.ok) throw new Error('Ollama HTTP ' + ollamaResp.status);
    const data = await ollamaResp.json();
    res.json({ success: true, ...data });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// Streaming proxy
app.post('/api/ollama/chat/stream', async (req, res) => {
  try {
    const ollamaResp = await fetch(OLLAMA_BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req.body, stream: true })
    });
    if (!ollamaResp.ok) throw new Error('Ollama HTTP ' + ollamaResp.status);
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');
    const reader = ollamaResp.body.getReader();
    const push = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { res.end(); return; }
        res.write(value);
      }
    };
    push().catch(() => res.end());
  } catch (e) {
    res.status(502).json({ success: false, error: e.message });
  }
});

function checkXPLimit(userId, eventType) {
  const config = XP_CONFIG[eventType];
  if (!config) return { allowed: false, xp: 0 };

  const dayKey = `${userId}_${eventType}_day_${today()}`;
  const weekKey = `${userId}_${eventType}_week_${thisWeek()}`;
  const dayCount = store.xpLimits[dayKey] || 0;
  const weekCount = store.xpLimits[weekKey] || 0;

  if (config.dailyLimit > 0 && dayCount >= config.dailyLimit) return { allowed: false, xp: 0, reason: 'daily_limit' };
  if (config.weeklyLimit > 0 && weekCount >= config.weeklyLimit) return { allowed: false, xp: 0, reason: 'weekly_limit' };

  store.xpLimits[dayKey] = dayCount + 1;
  store.xpLimits[weekKey] = weekCount + 1;
  return { allowed: true, xp: config.xp };
}

function evaluateLevel(user) {
  const rankConfig = RANK_THRESHOLDS[user.rank];
  if (!rankConfig) return { leveledUp: false };
  const xpForNextStar = rankConfig.xpPerStar;
  let leveledUp = false;
  let starUp = false;

  if (user.xp >= xpForNextStar && user.stars < rankConfig.starsNeeded) {
    user.xp -= xpForNextStar;
    user.stars++;
    starUp = true;
    logEvent('star_up', { userId: user.id, rank: user.rank, stars: user.stars });
  }

  // Check rank up
  if (user.stars >= rankConfig.starsNeeded && user.rank < 6) {
    user.rank++;
    user.stars = 1;
    leveledUp = true;
    const unlocks = UNLOCK_MAP[user.rank] || [];
    logEvent('level_up', { userId: user.id, from_rank: user.rank - 1, to_rank: user.rank, unlocks });
  }
  return { leveledUp, starUp, rank: user.rank, stars: user.stars, xp: user.xp };
}

/* ========== 9.1 Goal & Profiling ========== */
app.post('/api/goals', (req, res) => {
  const { userId, type, name, amount, years, monthly, description } = req.body;
  const goal = { id: genId('goal'), userId, type, name, amount, years, monthly, description, createdAt: new Date().toISOString() };
  store.goals[goal.id] = goal;
  logEvent('goal_captured', { userId, goalId: goal.id });
  res.json({ success: true, goalId: goal.id, data: goal });
});

app.post('/api/profiles/semantic-transform', (req, res) => {
  const { userId, goalText } = req.body;
  // Simulate: if input is too vague, return failure
  const vaguePatterns = ['有錢', '發財', '賺錢', '變有錢', '想要錢'];
  const isVague = vaguePatterns.some(p => (goalText || '').includes(p));
  if (isVague) {
    logEvent('semantic_transform_failed', { userId, input: goalText, reason: 'vague_input' });
    return res.json({
      success: false,
      error: 'vague_input',
      message: '目標描述較模糊，請試試更具體的描述',
      examples: ['3 年後出國留學，需要 50 萬', '10 年後買房，預算 800 萬', '每月存 1 萬準備退休']
    });
  }
  logEvent('semantic_transformed', { userId });
  res.json({
    success: true,
    parameters: { targetAmount: 3000000, monthlyInvest: 15000, years: 10, riskTolerance: 'moderate' }
  });
});

app.post('/api/profiles/kyc', (req, res) => {
  const { userId, answers } = req.body;
  const score = (answers || []).reduce((s, a) => s + a, 0);
  const maxScore = (answers || []).length * 4;
  const pct = score / maxScore;
  let grade, label;
  if (pct < 0.3) { grade = 'C1'; label = '保守型賢者'; }
  else if (pct < 0.5) { grade = 'C2'; label = '穩健型冒險家'; }
  else if (pct < 0.7) { grade = 'C3'; label = '平衡型戰士'; }
  else if (pct < 0.85) { grade = 'C4'; label = '積極型勇者'; }
  else { grade = 'C5'; label = '激進型劍聖'; }
  store.profiles[userId] = { riskGrade: grade, riskLabel: label, riskScore: score, maxScore };
  logEvent('kyc_completed', { userId, riskGrade: grade });
  res.json({ success: true, riskGrade: grade, riskLabel: label, riskScore: score, maxScore });
});

app.post('/api/profiles/compliance-review', (req, res) => {
  const { userId } = req.body;
  logEvent('compliance_reviewed', { userId });
  res.json({ success: true, complianceStatus: 'passed', reviewedAt: new Date().toISOString() });
});

app.post('/api/profiles/consent', (req, res) => {
  res.json({ success: true, consentGranted: true });
});

/* ========== 9.2 Recommendation ========== */
app.post('/api/recommendations/match-strategy', (req, res) => {
  const { userId, riskGrade } = req.body;
  const templates = {
    C1: [{ name: '貨幣市場基金', pct: 40 }, { name: '投資等級債券', pct: 35 }, { name: '全球股票 ETF', pct: 15 }, { name: '台灣高股息 ETF', pct: 10 }],
    C2: [{ name: '投資等級債券', pct: 35 }, { name: '全球股票 ETF', pct: 30 }, { name: '台灣高股息 ETF', pct: 20 }, { name: '貨幣市場基金', pct: 15 }],
    C3: [{ name: '全球股票 ETF', pct: 40 }, { name: '台灣高股息 ETF', pct: 25 }, { name: '投資等級債券', pct: 20 }, { name: 'AI 主題基金', pct: 10 }, { name: '貨幣市場基金', pct: 5 }],
    C4: [{ name: '全球股票 ETF', pct: 40 }, { name: 'AI 主題基金', pct: 25 }, { name: '台灣高股息 ETF', pct: 20 }, { name: '投資等級債券', pct: 15 }],
    C5: [{ name: '全球股票 ETF', pct: 35 }, { name: 'AI 主題基金', pct: 30 }, { name: '台灣高股息 ETF', pct: 20 }, { name: '新興市場 ETF', pct: 15 }]
  };
  const strategy = templates[riskGrade || 'C3'];
  if (!strategy) {
    logEvent('strategy_match_empty', { userId, riskGrade });
    return res.json({ success: false, error: 'no_match', suggestions: ['放寬條件', '調整目標期程', '調整投入金額'] });
  }
  logEvent('strategy_matched', { userId, riskGrade });
  res.json({ success: true, strategy, riskGrade });
});

app.post('/api/recommendations/generate-vision', (req, res) => {
  logEvent('vision_blueprint_generated', { userId: req.body.userId });
  res.json({ success: true, vision: '根據你的風險屬性與人生目標，以「穩健成長」為核心策略。' });
});

app.post('/api/recommendations/explain', (req, res) => {
  logEvent('plain_language_explained', { userId: req.body.userId });
  res.json({ success: true, explanation: '這個方案分散投資到多種資產類別，像是把雞蛋放在不同籃子裡。' });
});

app.post('/api/recommendations/:id/re-explain', (req, res) => {
  const { retryCount } = req.body;
  logEvent('explainability_retry_clicked', { recId: req.params.id, retryCount });
  if (retryCount >= 2) {
    logEvent('explainability_escalated', { recId: req.params.id, retryCount });
    return res.json({ success: true, escalated: true, message: '建議轉介真人顧問做更詳細的說明' });
  }
  const strategies = ['標準說明', '運動員比喻', '導航比喻', '花園比喻'];
  res.json({ success: true, strategyUsed: strategies[retryCount % strategies.length], escalated: false });
});

/* ========== 9.3 Execution & Monitoring ========== */
app.post('/api/orders/pretrade-check', (req, res) => {
  const { userId, riskGrade } = req.body;
  const passed = riskGrade !== 'C5';
  logEvent(passed ? 'order_pretrade_checked_passed' : 'order_pretrade_checked_blocked', { userId });
  res.json({ passed, checks: [
    { name: 'KYC 驗證', status: 'passed' },
    { name: '風險匹配', status: passed ? 'passed' : 'failed' },
    { name: '額度確認', status: 'passed' },
    { name: '合規審查', status: 'passed' },
    { name: '交易時段', status: 'passed' }
  ]});
});

app.post('/api/orders/submit', (req, res) => {
  logEvent('order_submitted', { userId: req.body.userId });
  res.json({ success: true, orderId: 'ORD_' + Date.now() });
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    totalAsset: 156800, goalProgress: 12, monthlyInvest: 15000,
    streak: 28, months: 6, driftScore: 8.2, rank: 2, rankName: '受訓者', stars: 3,
    holdings: [
      { name: '國內債券型基金', cost: 45000, currentValue: 47040 },
      { name: '全球股票型基金', cost: 40000, currentValue: 39200 },
      { name: '科技 ETF', cost: 29800, currentValue: 31360 },
      { name: 'AI 主題基金', cost: 21600, currentValue: 23520 },
      { name: '貨幣市場基金', cost: 15600, currentValue: 15680 }
    ],
    questGoals: [
      { id: 'main_freedom', icon: '🏝️', name: '30歲財務自由大冒險', type: '主線任務',
        targetAmount: 3000000, currentAmount: 156800, years: 8, startDate: '2025-08-01',
        monthlyTarget: 15000, monthlyActual: 15000, consecutiveMonths: 6,
        flavor: '存到第一桶金，提前實現不被工作綁架的人生！',
        status: 'active', priority: 1 },
      { id: 'side_japan', icon: '🗼', name: '日本追櫻自由行', type: '支線任務',
        targetAmount: 80000, currentAmount: 52000, years: 1, startDate: '2025-10-01',
        monthlyTarget: 6000, monthlyActual: 6500, consecutiveMonths: 5,
        flavor: '明年春天去京都看櫻花、吃和牛、逛中古店 🌸',
        status: 'active', priority: 2 },
      { id: 'side_macbook', icon: '💻', name: 'MacBook Pro 換機基金', type: '支線任務',
        targetAmount: 75000, currentAmount: 62000, years: 1, startDate: '2025-06-01',
        monthlyTarget: 8000, monthlyActual: 8000, consecutiveMonths: 8,
        flavor: 'M4 Pro 太香了！靠每月存錢不用刷卡分期 🍎',
        status: 'active', priority: 3 },
      { id: 'side_concert', icon: '🎤', name: '年度追星演唱會基金', type: '支線任務',
        targetAmount: 30000, currentAmount: 18000, years: 1, startDate: '2025-11-01',
        monthlyTarget: 5000, monthlyActual: 4500, consecutiveMonths: 3,
        flavor: '搶到前排票＋周邊＋住宿，一次到位不心痛',
        status: 'active', priority: 4 },
      { id: 'side_emergency', icon: '🛡️', name: '緊急備戰金庫', type: '支線任務',
        targetAmount: 100000, currentAmount: 88000, years: 1, startDate: '2025-06-01',
        monthlyTarget: 10000, monthlyActual: 10000, consecutiveMonths: 8,
        flavor: '存滿 3 個月薪水的安全網，不怕突發狀況',
        status: 'active', priority: 5 },
      { id: 'side_pet', icon: '🐱', name: '毛孩醫療預備金', type: '支線任務',
        targetAmount: 50000, currentAmount: 15000, years: 2, startDate: '2025-12-01',
        monthlyTarget: 3000, monthlyActual: 3000, consecutiveMonths: 2,
        flavor: '養毛孩是一輩子的事，醫療費用提前準備',
        status: 'active', priority: 6 }
    ],
    weeklyTasks: [
      { id: 'wt1', icon: '💰', name: '完成本週自動扣款', xp: 50, done: true, doneAt: '2026-02-03' },
      { id: 'wt2', icon: '📖', name: '看完一篇理財懶人包', xp: 30, done: true, doneAt: '2026-02-04' },
      { id: 'wt3', icon: '📊', name: '滑一下戰績儀表板', xp: 15, done: true, doneAt: '2026-02-05' },
      { id: 'wt4', icon: '🤝', name: '幫盟友加油打氣', xp: 10, done: false, doneAt: null },
      { id: 'wt5', icon: '🎯', name: 'Check 目標離多遠', xp: 15, done: false, doneAt: null },
      { id: 'wt6', icon: '🌡️', name: '回報本週投資心情', xp: 15, done: false, doneAt: null }
    ],
    milestones: [
      { title: '🎯 許下第一個願望', desc: '跟系統說出你的夢想，理財旅程正式 Start！', achieved: true, achievedAt: '2025-08-01', xpReward: 50 },
      { title: '🛡️ 解鎖冒險職業', desc: '完成風險評估，知道自己是穩健派還是衝鋒型', achieved: true, achievedAt: '2025-08-02', xpReward: 80 },
      { title: '📊 拿到專屬裝備', desc: 'AI 量身打造你的投資組合，不用自己選', achieved: true, achievedAt: '2025-08-03', xpReward: 30 },
      { title: '⚔️ 第一次出手', desc: '按下一鍵下單的那一刻，你已經贏過大多數人！', achieved: true, achievedAt: '2025-08-05', xpReward: 100 },
      { title: '🔥 連續打卡 4 週', desc: '比健身房還持久！投資紀律 MAX', achieved: true, achievedAt: '2025-09-01', xpReward: 40 },
      { title: '🤝 找到第一個隊友', desc: '拉好友一起存錢比較不孤單', achieved: true, achievedAt: '2025-10-15', xpReward: 30 },
      { title: '📈 帳戶長出第一塊錢', desc: '看到綠色的那一刻超感動', achieved: true, achievedAt: '2025-11-20', xpReward: 20 },
      { title: '🌟 晉級受訓者 R2', desc: '薪守村認證的理財練習生！', achieved: true, achievedAt: '2025-12-01', xpReward: 0 },
      { title: '💰 撐過 3 個月', desc: '沒有中途解約，你比 70% 的人還強', achieved: true, achievedAt: '2025-11-01', xpReward: 40 },
      { title: '🧘 大跌不恐慌', desc: '市場暴跌沒有亂賣，沉著之心 get！', achieved: false, progress: 0.6, hint: '下次股市大跌時自動觸發' },
      { title: '🏆 獲利破 10%', desc: '本金長了 10%！開始懂什麼叫複利了', achieved: false, progress: 0.35, hint: '目前 +3.5%，加油！' },
      { title: '📅 不間斷 12 週', desc: '三個月完美出席！鑽石手就是你', achieved: false, progress: 0.5, hint: '才過一半，撐住！(6/12)' },
      { title: '🎖️ 和隊友一起達標', desc: '完成第一場共同挑戰，友情+財力雙成長', achieved: false, progress: 0.25, hint: '挑戰進行中…' },
      { title: '⚡ 第一次自動調倉', desc: '系統偵測偏移幫你 Rebalance，超智能', achieved: false, progress: 0.8, hint: '偏移快到了，即將觸發！' },
      { title: '🎤 追星基金達標', desc: '演唱會門票+住宿+周邊全部存好！', achieved: false, progress: 0.6, hint: '已存 60%，繼續衝' },
      { title: '💻 換機基金 Get', desc: '不用分期！新筆電直接全額帶走', achieved: false, progress: 0.83, hint: '再存 2 個月搞定！' },
      { title: '🌈 獲利破 20%', desc: '投資收益翻倍成長，你是真的有在賺', achieved: false, progress: 0, hint: '先 10% 再來挑戰' },
      { title: '🏅 晉級紀律者 R3', desc: '解鎖盟友完整功能，開始帶隊打副本', achieved: false, progress: 0.3, hint: '繼續做任務累積 XP' }
    ],
    badges: [
      { icon: '🗡️', name: '初心之刃', desc: '按下人生第一次投資按鈕', earned: true },
      { icon: '🛡️', name: '風險識者', desc: '搞懂自己是哪種理財玩家', earned: true },
      { icon: '🔥', name: '堅持之焰', desc: '連續 4 週沒放棄，太強了', earned: true },
      { icon: '🤝', name: '結盟之約', desc: '拉到第一個理財戰友', earned: true },
      { icon: '📈', name: '初見曙光', desc: '看到帳戶第一次變綠色', earned: true },
      { icon: '🧊', name: '沉著之心', desc: '大跌不恐慌不亂賣', earned: false },
      { icon: '💎', name: '鑽石手', desc: '12 週完美出席不中斷', earned: false },
      { icon: '🏆', name: '挑戰制霸', desc: '和隊友一起完成共同挑戰', earned: false },
      { icon: '🐱', name: '毛孩守護', desc: '毛孩醫療基金存滿達標', earned: false },
      { icon: '🗼', name: '追櫻達人', desc: '日本旅遊基金成功解鎖', earned: false }
    ]
  });
});

app.post('/api/monitoring/tick', (req, res) => {
  logEvent('monitoring_loop_tick', { userId: req.body.userId });
  res.json({ driftScore: 8.2, alert: true, message: '偏移超過 5% 門檻' });
});

app.post('/api/rebalancing/propose', (req, res) => {
  logEvent('rebalancing_triggered', { userId: req.body.userId });
  logEvent('rebalancing_proposal_sent', { userId: req.body.userId });
  res.json({ success: true, proposal: { adjustments: [{ name: '全球股票 ETF', action: '減碼 5%' }, { name: '投資等級債券', action: '加碼 5%' }] } });
});

app.post('/api/rebalancing/execute', (req, res) => {
  logEvent('rebalancing_executed', { userId: req.body.userId });
  res.json({ success: true });
});

/* ========== 9.4 Growth & Feedback ========== */
app.post('/api/milestones/evaluate', (req, res) => {
  logEvent('milestone_achieved', { userId: req.body.userId });
  res.json({ success: true, newMilestones: ['首次交易成功'] });
});

app.post('/api/feedback/trust-thermometer', (req, res) => {
  const { userId, pressure, transparency, recId } = req.body;
  logEvent('trust_thermometer_submitted', { userId, pressure, transparency, recId });
  // Check negative feedback
  const actionsTaken = [];
  if (pressure === 'high' || pressure >= 4) {
    actionsTaken.push({ action: 'reduce_push_frequency', desc: '降低推播頻率' });
    logEvent('feedback_action_triggered', { userId, feedback_id: recId, action_type: 'reduce_pressure' });
  }
  if (transparency === 'low' || transparency <= 2) {
    actionsTaken.push({ action: 'increase_citation', desc: '增加引用來源與計算過程' });
    logEvent('feedback_action_triggered', { userId, feedback_id: recId, action_type: 'increase_transparency' });
  }
  res.json({ success: true, actionsTaken });
});

/* ========== 9.5 Allies ========== */
app.post('/api/allies/invite', (req, res) => {
  const { userId } = req.body;
  const userAllies = store.allies[userId] || [];
  if (userAllies.length >= 10) {
    return res.json({ success: false, error: 'ally_limit_reached', message: '盟友人數已達上限（10人），請先移除現有盟友後再邀請' });
  }
  const inviteCode = genId('inv');
  logEvent('ally_invited', { userId, inviteCode });
  res.json({ success: true, inviteCode, inviteLink: `/join?code=${inviteCode}`, qrCodeData: inviteCode });
});

app.post('/api/allies/join', (req, res) => {
  const { userId, inviteCode, allyUserId } = req.body;
  const relation = {
    id: genId('rel'),
    userId,
    allyId: allyUserId || 'ally_' + Date.now(),
    level: 1,  // Default L1
    createdAt: new Date().toISOString()
  };
  if (!store.allies[userId]) store.allies[userId] = [];
  store.allies[userId].push(relation);
  store.allyRelations[relation.id] = relation;
  logEvent('ally_relationship_created', { userId, allyId: relation.allyId });
  res.json({ success: true, relation });
});

app.get('/api/allies', (req, res) => {
  const userId = req.query.userId || 'demo';
  const allies = store.allies[userId] || [];
  res.json({ success: true, allies, count: allies.length, limit: 10 });
});

app.post('/api/allies/:allyId/remove', (req, res) => {
  const { userId } = req.body;
  const { allyId } = req.params;
  if (store.allies[userId]) {
    store.allies[userId] = store.allies[userId].filter(a => a.allyId !== allyId);
  }
  logEvent('ally_removed', { userId, allyId });
  res.json({ success: true });
});

app.post('/api/quests/:questId/allies/visibility', (req, res) => {
  const { questId } = req.params;
  const { allyId, level } = req.body;
  if (!store.quests[questId]) store.quests[questId] = { visibility: {} };
  store.quests[questId].visibility[allyId] = level;
  logEvent('ally_visibility_updated', { questId, allyId, level });
  res.json({ success: true });
});

app.get('/api/quests/:questId/allies/visibility-preview', (req, res) => {
  const { questId } = req.params;
  const quest = store.quests[questId] || { visibility: {} };
  const level = parseInt(req.query.level) || 1;
  const preview = {
    level,
    visibleFields: level === 0 ? [] :
      level === 1 ? ['任務名稱（匿名）', '進度%', '里程碑', '徽章', 'streak'] :
      ['任務名稱（匿名）', '進度%', '里程碑', '徽章', 'streak', '本週任務是否完成', '下一步任務（文字化）'],
    hiddenFields: ['金額', '資產', '商品', '交易明細']
  };
  res.json({ success: true, preview });
});

/* ========== 9.6 Support Actions ========== */
const BANNED_WORDS = ['保證獲利', '快點買', '快點賣', '趕快買', '趕快賣', '一定賺', '穩賺', '指定商品', '推薦買'];

app.post('/api/quests/:questId/encourage', (req, res) => {
  const { allyId, message, templateId } = req.body;
  // Check banned words
  const found = BANNED_WORDS.find(w => (message || '').includes(w));
  if (found) {
    logEvent('ally_message_rejected', { allyId, reason: 'banned_content', keyword: found });
    return res.json({
      success: false,
      error: 'message_rejected',
      reason: `訊息包含不允許的內容：「${found}」`,
      suggestion: '請聚焦行為支持：完成本週任務/保持紀律/理解風險'
    });
  }
  const enc = { id: genId('enc'), questId: req.params.questId, allyId, message, templateId, createdAt: new Date().toISOString() };
  store.encourages.push(enc);
  logEvent('encourage_sent', { allyId, questId: req.params.questId });
  res.json({ success: true, encourage: enc });
});

app.post('/api/quests/:questId/nudges', (req, res) => {
  const { allyId, frequency, time, content } = req.body;
  const found = BANNED_WORDS.find(w => (content || '').includes(w));
  if (found) {
    logEvent('nudge_rejected', { allyId, reason: 'banned_content', keyword: found });
    return res.json({ success: false, error: 'nudge_rejected', reason: `提醒文字包含不允許的內容：「${found}」` });
  }
  const nudge = { id: genId('ndg'), questId: req.params.questId, allyId, frequency, time, content, active: true, createdAt: new Date().toISOString() };
  store.nudges.push(nudge);
  logEvent('nudge_scheduled', { allyId, questId: req.params.questId });
  res.json({ success: true, nudge });
});

app.post('/api/quests/:questId/nudges/:nudgeId/disable', (req, res) => {
  const nudge = store.nudges.find(n => n.id === req.params.nudgeId);
  if (nudge) nudge.active = false;
  res.json({ success: true });
});

/* ========== 9.7 Challenges ========== */
app.post('/api/challenges', (req, res) => {
  const { userId, name, weeks, condition, invitedAllies } = req.body;
  const challenge = {
    id: genId('chl'), userId, name, weeks, condition,
    participants: [{ userId, streak: 0, completed: false }],
    status: 'active', createdAt: new Date().toISOString()
  };
  (invitedAllies || []).forEach(a => challenge.participants.push({ userId: a, streak: 0, completed: false }));
  store.challenges[challenge.id] = challenge;
  logEvent('challenge_created', { userId, challengeId: challenge.id });
  res.json({ success: true, challenge });
});

app.post('/api/challenges/:id/join', (req, res) => {
  const { userId } = req.body;
  const ch = store.challenges[req.params.id];
  if (!ch) return res.json({ success: false, error: 'not_found' });
  ch.participants.push({ userId, streak: 0, completed: false });
  logEvent('challenge_joined', { userId, challengeId: req.params.id });
  res.json({ success: true, challenge: ch });
});

app.post('/api/challenges/:id/progress', (req, res) => {
  const { userId } = req.body;
  const ch = store.challenges[req.params.id];
  if (!ch) return res.json({ success: false, error: 'not_found' });
  const participant = ch.participants.find(p => p.userId === userId);
  if (participant) {
    participant.streak++;
    if (participant.streak >= ch.weeks) participant.completed = true;
  }
  logEvent('challenge_progress_updated', { userId, challengeId: req.params.id });
  // Check if all completed
  if (ch.participants.every(p => p.completed)) {
    ch.status = 'completed';
    logEvent('challenge_completed', { challengeId: req.params.id });
    logEvent('achievement_awarded', { challengeId: req.params.id, type: 'challenge_badge' });
  }
  res.json({ success: true, challenge: ch });
});

app.get('/api/challenges/:id', (req, res) => {
  const ch = store.challenges[req.params.id] || null;
  res.json({ success: !!ch, challenge: ch });
});

/* ========== 9.8 Share Card ========== */
app.post('/api/sharecards/generate', (req, res) => {
  const { userId, achievements, includeAllyInvite } = req.body;
  const card = {
    id: genId('sc'), userId, achievements: achievements || [],
    includeAllyInvite: !!includeAllyInvite,
    inviteCode: includeAllyInvite ? genId('inv') : null,
    createdAt: new Date().toISOString(), views: 0
  };
  store.shareCards[card.id] = card;
  logEvent('share_card_generated', { userId, cardId: card.id });
  res.json({ success: true, shareCard: card });
});

app.get('/api/sharecards/:shareId', (req, res) => {
  const card = store.shareCards[req.params.shareId];
  if (!card) return res.json({ success: false });
  card.views++;
  logEvent('share_card_viewed', { shareId: req.params.shareId });
  res.json({ success: true, shareCard: card });
});

/* ========== 9.9 Leveling ========== */
app.get('/api/progress/level', (req, res) => {
  const userId = req.query.userId || 'demo';
  const user = store.users[userId] || store.users.demo;
  const rankConfig = RANK_THRESHOLDS[user.rank];
  const unlocks = [];
  for (let r = 2; r <= user.rank; r++) {
    if (UNLOCK_MAP[r]) unlocks.push(...UNLOCK_MAP[r]);
  }
  res.json({
    success: true,
    rank: user.rank, rankName: RANK_NAMES[user.rank],
    stars: user.stars, xp: user.xp,
    xpForNextStar: rankConfig ? rankConfig.xpPerStar : 0,
    streak: user.streak,
    unlocks
  });
});

app.get('/api/progress/unlocks', (req, res) => {
  const userId = req.query.userId || 'demo';
  const user = store.users[userId] || store.users.demo;
  const unlocks = [];
  for (let r = 2; r <= user.rank; r++) {
    if (UNLOCK_MAP[r]) unlocks.push(...UNLOCK_MAP[r].map(u => ({ ...u, unlockedAtRank: r })));
  }
  res.json({ success: true, unlocks });
});

app.post('/api/progress/xp', (req, res) => {
  const { userId, eventType } = req.body;
  const user = store.users[userId] || store.users.demo;
  const check = checkXPLimit(userId, eventType);
  if (!check.allowed) {
    logEvent('xp_capped', { userId, eventType, reason: check.reason });
    return res.json({ success: true, xpAwarded: 0, capped: true, reason: check.reason, rank: user.rank, stars: user.stars, xp: user.xp });
  }
  user.xp += check.xp;
  logEvent('xp_awarded', { userId, eventType, xp: check.xp });
  const evalResult = evaluateLevel(user);
  res.json({ success: true, xpAwarded: check.xp, capped: false, ...evalResult, rankName: RANK_NAMES[user.rank] });
});

app.post('/api/progress/evaluate', (req, res) => {
  const { userId } = req.body;
  const user = store.users[userId] || store.users.demo;
  const result = evaluateLevel(user);
  res.json({ success: true, ...result, rankName: RANK_NAMES[user.rank] });
});

/* ========== Events Log ========== */
app.get('/api/events', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json({ success: true, events: store.events.slice(-limit), total: store.events.length });
});

/* ========== Start Server ========== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🏰 薪守村 Fin_WMAI Prototype Server`);
  console.log(`   http://localhost:${PORT}/portal.html`);
  console.log(`   API: http://localhost:${PORT}/api/`);
  console.log(`   BDD V1.3 — Features A~P\n`);
});

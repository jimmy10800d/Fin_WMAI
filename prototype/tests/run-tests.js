/* ================================================
   薪守村 Prototype — API & Logic 自動化測試
   Node.js 測試 (run with: node tests/run-tests.js)
   ================================================ */

const http = require('http');
const BASE = 'http://localhost:3000';

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, testName) {
  if (condition) {
    passed++;
    results.push({ status: '✅', test: testName });
  } else {
    failed++;
    results.push({ status: '❌', test: testName });
    console.error(`  ❌ FAIL: ${testName}`);
  }
}

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 薪守村 Prototype API 測試開始...\n');

  // ===== 9.1 Goals / Profiling =====
  console.log('--- 9.1 Goals & Profiling ---');

  let res = await request('POST', '/api/goals', {
    userId: 'test_user', type: 'retirement', amount: 5000000, years: 25, description: '60歲退休月領3萬'
  });
  assert(res.status === 200 && res.body.goalId, 'POST /api/goals → 建立目標成功');

  // Semantic transform — server field is "goalText"
  res = await request('POST', '/api/profiles/semantic-transform', {
    userId: 'test_user', goalText: '10年後買房，預算800萬'
  });
  assert(res.status === 200 && res.body.success === true && res.body.parameters, 'POST semantic-transform → 語意轉換成功');

  // Fuzzy input — server checks vaguePatterns: 有錢, 發財, 賺錢, 變有錢, 想要錢
  res = await request('POST', '/api/profiles/semantic-transform', {
    userId: 'test_user', goalText: '想要變有錢'
  });
  assert(res.status === 200 && res.body.success === false && res.body.error === 'vague_input', 'POST semantic-transform fuzzy → 模糊偵測');

  res = await request('POST', '/api/profiles/kyc', {
    userId: 'test_user', answers: [2, 3, 2, 1, 3]
  });
  assert(res.status === 200 && res.body.riskGrade, 'POST /api/profiles/kyc → KYC 完成');

  // Compliance review — server returns complianceStatus, not approved
  res = await request('POST', '/api/profiles/compliance-review', {
    userId: 'test_user', riskGrade: 'C3'
  });
  assert(res.status === 200 && res.body.complianceStatus === 'passed', 'POST compliance-review → 合規審查通過');

  // ===== 9.2 Recommendations =====
  console.log('--- 9.2 Recommendations ---');

  res = await request('POST', '/api/recommendations/match-strategy', {
    userId: 'test_user', riskGrade: 'C3'
  });
  assert(res.status === 200 && res.body.strategy, 'POST match-strategy → 策略配對');

  // Generate vision — server returns "vision" field
  res = await request('POST', '/api/recommendations/generate-vision', {
    userId: 'test_user'
  });
  assert(res.status === 200 && res.body.vision, 'POST generate-vision → 願景生成');

  res = await request('POST', '/api/recommendations/explain', {
    userId: 'test_user'
  });
  assert(res.status === 200 && res.body.explanation, 'POST explain → 白話解說');

  // Re-explain — URL needs :id param, server returns "escalated" not "escalate"
  res = await request('POST', '/api/recommendations/rec_001/re-explain', {
    userId: 'test_user', retryCount: 2
  });
  assert(res.status === 200 && res.body.escalated === true, 'POST re-explain retryCount=2 → 轉介真人');

  // ===== 9.3 Execution =====
  console.log('--- 9.3 Execution ---');

  // Server routes are /api/orders/*, not /api/execution/*
  res = await request('POST', '/api/orders/pretrade-check', {
    userId: 'test_user', riskGrade: 'C3'
  });
  assert(res.status === 200 && res.body.passed === true, 'POST orders/pretrade-check C3 → 通過');

  res = await request('POST', '/api/orders/submit', {
    userId: 'test_user'
  });
  assert(res.status === 200 && res.body.orderId, 'POST orders/submit → 下單成功');

  // Blocked case
  res = await request('POST', '/api/orders/pretrade-check', {
    userId: 'test_user', riskGrade: 'C5'
  });
  assert(res.status === 200 && res.body.passed === false, 'POST orders/pretrade-check C5 → 阻斷');

  // ===== 9.4 Monitoring =====
  console.log('--- 9.4 Monitoring ---');

  res = await request('POST', '/api/monitoring/tick', { userId: 'test_user' });
  assert(res.status === 200 && res.body.driftScore !== undefined, 'POST /api/monitoring/tick → 偏移偵測');

  // Server route is /api/rebalancing/propose, not /api/monitoring/rebalancing/propose
  res = await request('POST', '/api/rebalancing/propose', { userId: 'test_user' });
  assert(res.status === 200 && res.body.proposal, 'POST /api/rebalancing/propose → 再平衡提案');

  // ===== 9.5 Allies =====
  console.log('--- 9.5 Allies ---');

  res = await request('POST', '/api/allies/invite', { userId: 'test_user' });
  assert(res.status === 200 && res.body.inviteCode, 'POST /api/allies/invite → 產生邀請碼');
  const inviteCode = res.body.inviteCode;

  // Join — server expects userId + inviteCode + optional allyUserId
  res = await request('POST', '/api/allies/join', {
    userId: 'test_user', inviteCode, allyUserId: 'ally_user1'
  });
  assert(res.status === 200 && res.body.success, 'POST /api/allies/join → 加入成功');

  res = await request('GET', '/api/allies?userId=test_user');
  assert(res.status === 200 && res.body.allies && res.body.allies.length > 0, 'GET /api/allies → 取得盟友列表');

  // Visibility — Server route: /api/quests/:questId/allies/visibility
  res = await request('POST', '/api/quests/quest_001/allies/visibility', {
    allyId: 'ally_user1', level: 1
  });
  assert(res.status === 200 && res.body.success, 'POST quests/:id/allies/visibility → 設定可見度');

  // Visibility preview — Server route: /api/quests/:questId/allies/visibility-preview
  res = await request('GET', '/api/quests/quest_001/allies/visibility-preview?level=1');
  assert(res.status === 200 && res.body.preview, 'GET quests/:id/allies/visibility-preview → 預覽');

  // Ally limit test: add 9 more allies to reach limit (already have 1)
  for (let i = 2; i <= 10; i++) {
    const inv = await request('POST', '/api/allies/invite', { userId: 'test_user' });
    await request('POST', '/api/allies/join', { userId: 'test_user', inviteCode: inv.body.inviteCode, allyUserId: `ally_user${i}` });
  }
  res = await request('POST', '/api/allies/invite', { userId: 'test_user' });
  assert(res.body && res.body.error === 'ally_limit_reached', 'POST allies/invite → 超過10人上限');

  // Remove ally — Server route: /api/allies/:allyId/remove
  res = await request('POST', '/api/allies/ally_user1/remove', { userId: 'test_user' });
  assert(res.status === 200 && res.body.success, 'POST allies/:allyId/remove → 移除盟友');

  // ===== 9.6 Support Actions (Encourage/Nudge) =====
  console.log('--- 9.6 Support Actions ---');

  // Encourage — Server route: /api/quests/:questId/encourage
  res = await request('POST', '/api/quests/quest_001/encourage', {
    allyId: 'ally_user2', message: '加油！繼續保持 💪'
  });
  assert(res.status === 200 && res.body.success, 'POST quests/:id/encourage → 傳送鼓勵');

  // Banned words — server returns error: 'message_rejected'
  res = await request('POST', '/api/quests/quest_001/encourage', {
    allyId: 'ally_user2', message: '保證獲利！穩賺不賠！'
  });
  assert(res.body && res.body.error === 'message_rejected', 'POST encourage banned words → 攔截');

  // Nudge — Server route: /api/quests/:questId/nudges
  res = await request('POST', '/api/quests/quest_001/nudges', {
    allyId: 'ally_user2', frequency: 'weekly', time: '09:00', content: '記得這週的定期投資唷！'
  });
  assert(res.status === 200 && res.body.success && res.body.nudge, 'POST quests/:id/nudges → 建立推箭');
  const nudgeId = res.body.nudge ? res.body.nudge.id : 'ndg_test';

  // Nudge disable — Server route: /api/quests/:questId/nudges/:nudgeId/disable
  res = await request('POST', `/api/quests/quest_001/nudges/${nudgeId}/disable`, {});
  assert(res.status === 200 && res.body.success, 'POST nudges/:id/disable → 停用推箭');

  // ===== 9.7 Challenges =====
  console.log('--- 9.7 Challenges ---');

  // Challenge create — Server route: POST /api/challenges (no /create suffix)
  res = await request('POST', '/api/challenges', {
    userId: 'test_user', name: '連續定投30天', weeks: 4, condition: 'weekly_invest',
    invitedAllies: ['ally_user2']
  });
  assert(res.status === 200 && res.body.challenge && res.body.challenge.id, 'POST /api/challenges → 建立挑戰');
  const challengeId = res.body.challenge ? res.body.challenge.id : 'chl_test';

  // Challenge join — Server route: /api/challenges/:id/join
  res = await request('POST', `/api/challenges/${challengeId}/join`, { userId: 'ally_user3' });
  assert(res.status === 200 && res.body.success, 'POST challenges/:id/join → 加入挑戰');

  // Challenge progress — Server route: /api/challenges/:id/progress
  res = await request('POST', `/api/challenges/${challengeId}/progress`, { userId: 'test_user' });
  assert(res.status === 200 && res.body.challenge, 'POST challenges/:id/progress → 更新進度');

  // Challenge status — Server route: GET /api/challenges/:id
  res = await request('GET', `/api/challenges/${challengeId}`);
  assert(res.status === 200 && res.body.challenge && res.body.challenge.participants, 'GET challenges/:id → 查看挑戰狀態');

  // ===== 9.8 Share Cards =====
  console.log('--- 9.8 Share Cards ---');

  res = await request('POST', '/api/sharecards/generate', {
    userId: 'test_user', achievements: ['goal_set', 'kyc_done'], includeAllyInvite: true
  });
  assert(res.status === 200 && res.body.shareCard && res.body.shareCard.id, 'POST sharecards/generate → 產生分享卡');
  const shareCardId = res.body.shareCard ? res.body.shareCard.id : 'sc_test';

  // View — Server route: GET /api/sharecards/:shareId
  res = await request('GET', `/api/sharecards/${shareCardId}`);
  assert(res.status === 200 && res.body.shareCard && res.body.shareCard.views !== undefined, 'GET sharecards/:id → 查看分享卡');

  // ===== 9.9 Leveling =====
  console.log('--- 9.9 Leveling ---');

  res = await request('GET', '/api/progress/level?userId=test_user');
  assert(res.status === 200 && res.body.rank !== undefined, 'GET /api/progress/level → 查詢等級');

  res = await request('GET', '/api/progress/unlocks?userId=test_user');
  assert(res.status === 200 && Array.isArray(res.body.unlocks), 'GET /api/progress/unlocks → 查詢解鎖');

  // XP — server expects "eventType" not "eventName"
  res = await request('POST', '/api/progress/xp', {
    userId: 'test_user', eventType: 'goal_captured'
  });
  assert(res.status === 200 && res.body.xpAwarded !== undefined, 'POST /api/progress/xp → 提交 XP');

  // XP anti-spam limit
  for (let i = 0; i < 5; i++) {
    await request('POST', '/api/progress/xp', { userId: 'test_user', eventType: 'trust_thermometer_submitted' });
  }
  res = await request('POST', '/api/progress/xp', { userId: 'test_user', eventType: 'trust_thermometer_submitted' });
  assert(res.status === 200 && res.body.capped === true, 'POST /api/progress/xp → XP 限額觸發');

  res = await request('POST', '/api/progress/evaluate', { userId: 'test_user' });
  assert(res.status === 200 && res.body.rank !== undefined, 'POST /api/progress/evaluate → 等級評估');

  // ===== Feedback =====
  console.log('--- Feedback ---');

  // Milestones evaluate — Server route: /api/milestones/evaluate (no /feedback prefix)
  res = await request('POST', '/api/milestones/evaluate', { userId: 'test_user' });
  assert(res.status === 200 && res.body.newMilestones, 'POST /api/milestones/evaluate → 里程碑評估');

  // Trust thermometer — Server expects pressure, transparency, recId
  res = await request('POST', '/api/feedback/trust-thermometer', {
    userId: 'test_user', pressure: 'high', transparency: 'low', recId: 'rec_001'
  });
  assert(res.status === 200 && res.body.actionsTaken && res.body.actionsTaken.length > 0, 'POST trust-thermometer → 負面回饋觸發行動');

  // ===== Print Results =====
  console.log('\n' + '='.repeat(60));
  console.log(`🧪 測試結果：${passed} 通過 | ${failed} 失敗 | 共 ${passed + failed} 項`);
  console.log('='.repeat(60));
  
  results.forEach(r => console.log(`  ${r.status} ${r.test}`));
  
  console.log('\n' + (failed === 0 ? '✅ 全部測試通過！' : `⚠️ 有 ${failed} 項測試失敗`));
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('❌ 測試執行錯誤:', err.message);
  console.error('   請確認 server 已啟動: cd prototype && node server.js');
  process.exit(1);
});

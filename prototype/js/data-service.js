/* ================================================
   Data Service — 模擬 API 資料層
   ================================================ */

const DataService = {
  /** 市場行情模擬資料 */
  getMarketData() {
    return [
      { name: '台股加權指數', value: '22,845', change: '+1.2%', up: true },
      { name: 'S&P 500', value: '5,432', change: '+0.8%', up: true },
      { name: 'USD/TWD', value: '31.25', change: '-0.3%', up: false },
      { name: 'AI 指數', value: '3,218', change: '+2.1%', up: true },
    ];
  },

  /** 用戶預設資料 */
  getDefaultUser() {
    return {
      id: 'demo',
      name: '旅行者',
      level: 1,
      xp: 0,
      riskGrade: null,
      avatar: 'IP_ICON/IP_HELLO.png'
    };
  },

  /** KYC 問題庫 */
  getKYCQuestions() {
    return [
      {
        id: 'q1', text: '你的投資經驗有多久？',
        options: [
          { label: '完全沒有', score: 0 },
          { label: '1 年以下', score: 1 },
          { label: '1-3 年', score: 2 },
          { label: '3-5 年', score: 3 },
          { label: '5 年以上', score: 4 }
        ]
      },
      {
        id: 'q2', text: '遇到市場大跌 20%，你會？',
        options: [
          { label: '立刻全部賣出', score: 0 },
          { label: '賣出部分降低風險', score: 1 },
          { label: '不動，等待回升', score: 2 },
          { label: '小額加碼', score: 3 },
          { label: '大幅加碼抄底', score: 4 }
        ]
      },
      {
        id: 'q3', text: '你期望的年化報酬率是？',
        options: [
          { label: '2-3%（穩定就好）', score: 0 },
          { label: '4-6%（穩健成長）', score: 1 },
          { label: '7-10%（積極成長）', score: 2 },
          { label: '10-15%（高報酬）', score: 3 },
          { label: '15% 以上（衝就對了）', score: 4 }
        ]
      },
      {
        id: 'q4', text: '你能承受的最大虧損是？',
        options: [
          { label: '完全不能接受虧損', score: 0 },
          { label: '虧損 5% 以內', score: 1 },
          { label: '虧損 10% 以內', score: 2 },
          { label: '虧損 20% 以內', score: 3 },
          { label: '虧損 30% 也能接受', score: 4 }
        ]
      },
      {
        id: 'q5', text: '你的投資期限為？',
        options: [
          { label: '1 年以內', score: 0 },
          { label: '1-3 年', score: 1 },
          { label: '3-5 年', score: 2 },
          { label: '5-10 年', score: 3 },
          { label: '10 年以上', score: 4 }
        ]
      }
    ];
  },

  /** 目標類型庫 */
  getGoalTypes() {
    return [
      { id: 'retirement', icon: '🏖️', name: '退休規劃', desc: '安穩的第二人生' },
      { id: 'house', icon: '🏠', name: '買房基金', desc: '圓一個家的夢想' },
      { id: 'education', icon: '🎓', name: '教育基金', desc: '為孩子的未來投資' },
      { id: 'nomad', icon: '✈️', name: '數位遊牧', desc: '環遊世界工作旅行' },
      { id: 'pet', icon: '🐕', name: '毛孩基金', desc: '毛小孩的醫療保障' },
      { id: 'car', icon: '🚗', name: '換車計畫', desc: '換一台夢想座驅' },
      { id: 'wedding', icon: '💒', name: '結婚基金', desc: '人生重要的一天' },
      { id: 'custom', icon: '⭐', name: '自訂目標', desc: '打造你的冒險' },
    ];
  },

  /** 模擬持倉資料 */
  getHoldings() {
    return [
      { name: '全球股票 ETF', cost: 80000, currentValue: 86400 },
      { name: '台灣高股息 ETF', cost: 40000, currentValue: 42800 },
      { name: '投資等級債券', cost: 30000, currentValue: 30600 },
      { name: 'AI 主題基金', cost: 20000, currentValue: 23200 },
      { name: '貨幣市場基金', cost: 10000, currentValue: 10050 },
    ];
  },

  /** 模擬里程碑 */
  getMilestones() {
    return [
      { title: '🎯 完成第一個目標設定', desc: '踏出理財第一步', achieved: true },
      { title: '🛡️ 通過風險評估', desc: '了解自己的冒險風格', achieved: true },
      { title: '📊 取得專屬方案', desc: '收到 AI 客製化推薦', achieved: true },
      { title: '⚔️ 首次交易成功', desc: '一鍵下單完成', achieved: true },
      { title: '💰 投資滿 3 個月', desc: '持續定期定額', achieved: false },
      { title: '🏆 累積報酬 10%', desc: '冒險收益達標', achieved: false },
    ];
  },

  /** 配置方案 */
  getAllocationTemplates() {
    return {
      C1: [
        { name: '貨幣市場基金', pct: 40, color: '#4a7c59' },
        { name: '投資等級債券', pct: 35, color: '#4a90d9' },
        { name: '全球股票 ETF', pct: 15, color: '#d4a843' },
        { name: '台灣高股息 ETF', pct: 10, color: '#e8734a' },
      ],
      C2: [
        { name: '投資等級債券', pct: 35, color: '#4a90d9' },
        { name: '全球股票 ETF', pct: 30, color: '#d4a843' },
        { name: '台灣高股息 ETF', pct: 20, color: '#e8734a' },
        { name: '貨幣市場基金', pct: 15, color: '#4a7c59' },
      ],
      C3: [
        { name: '全球股票 ETF', pct: 40, color: '#d4a843' },
        { name: '台灣高股息 ETF', pct: 25, color: '#e8734a' },
        { name: '投資等級債券', pct: 20, color: '#4a90d9' },
        { name: 'AI 主題基金', pct: 10, color: '#9b59b6' },
        { name: '貨幣市場基金', pct: 5, color: '#4a7c59' },
      ],
      C4: [
        { name: '全球股票 ETF', pct: 40, color: '#d4a843' },
        { name: 'AI 主題基金', pct: 25, color: '#9b59b6' },
        { name: '台灣高股息 ETF', pct: 20, color: '#e8734a' },
        { name: '投資等級債券', pct: 15, color: '#4a90d9' },
      ],
      C5: [
        { name: '全球股票 ETF', pct: 35, color: '#d4a843' },
        { name: 'AI 主題基金', pct: 30, color: '#9b59b6' },
        { name: '台灣高股息 ETF', pct: 20, color: '#e8734a' },
        { name: '新興市場 ETF', pct: 15, color: '#e74c3c' },
      ]
    };
  }
};

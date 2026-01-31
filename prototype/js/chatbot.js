/**
 * Fin_WMAI - AI 聊天機器人「小雲」
 * 提供投資理財的 AI 互動式說明功能
 * 支援個人資產查詢與商品問答
 */

// ===== Ollama API 設定 =====
const OllamaConfig = {
    baseUrl: 'http://localhost:11434',  // Ollama 本機服務地址
    model: 'llama3.1:8b',                // 使用的模型名稱（可選：mistral-nemo:12b, gemma3:4b）
    enabled: true,                       // 是否啟用 Ollama（關閉則使用本地知識庫）
    timeout: 60000,                      // API 超時時間（毫秒）
    systemPrompt: `你是「小雲」，一位親切、專業的智慧理財小助手。你的特點：
- 使用繁體中文回答
- 說話親切友善，適時使用表情符號
- 專注於投資理財相關話題
- 能幫助用戶了解資產狀況、投資商品和理財知識
- 回答簡潔明瞭，使用列點和分段讓內容易讀
- 對於超出理財範疇的問題，禮貌地引導回投資話題
- 提醒用戶投資有風險，過去績效不代表未來表現`
};

// ===== 聊天機器人狀態 =====
const ChatbotState = {
    isOpen: false,
    isTyping: false,
    messages: [],
    conversationHistory: [],  // Ollama 對話歷史
    sessionId: 'chat_' + Date.now(),
    userName: '官大大',
    customerId: 'cust_001'  // 當前客戶 ID
};

// ===== 輔助函數 =====
function formatMoney(amount) {
    if (amount >= 10000) {
        return (amount / 10000).toFixed(1) + ' 萬';
    }
    return amount.toLocaleString();
}

function formatPercent(value) {
    return (value * 100).toFixed(2) + '%';
}

// ===== 個人資產查詢功能 =====
const PersonalDataQueries = {
    // 查詢資產總覽
    getAssetSummary() {
        if (typeof demoDataService === 'undefined' || !demoDataService.loaded) {
            return null;
        }
        const summary = demoDataService.getCustomerAccountSummary(ChatbotState.customerId);
        const customer = demoDataService.getCustomerById(ChatbotState.customerId);
        return { summary, customer };
    },

    // 查詢持倉明細
    getHoldings() {
        if (typeof demoDataService === 'undefined' || !demoDataService.loaded) {
            return null;
        }
        return demoDataService.getCustomerHoldings(ChatbotState.customerId);
    },

    // 查詢帳戶資訊
    getAccounts() {
        if (typeof demoDataService === 'undefined' || !demoDataService.loaded) {
            return null;
        }
        return demoDataService.getCustomerAccounts(ChatbotState.customerId);
    },

    // 查詢交易記錄
    getTransactions() {
        if (typeof demoDataService === 'undefined' || !demoDataService.loaded) {
            return null;
        }
        return demoDataService.getCustomerTransactions(ChatbotState.customerId);
    },

    // 查詢目標進度
    getGoals() {
        if (typeof demoDataService === 'undefined' || !demoDataService.loaded) {
            return null;
        }
        return demoDataService.getCustomerGoals(ChatbotState.customerId);
    },

    // 查詢收支概況
    getIncomeExpense() {
        if (typeof demoDataService === 'undefined' || !demoDataService.loaded) {
            return null;
        }
        return demoDataService.getCustomerIncomeExpense(ChatbotState.customerId);
    },

    // 查詢產品資訊
    getProductInfo(productName) {
        if (typeof demoDataService === 'undefined' || !demoDataService.loaded) {
            return null;
        }
        const products = demoDataService.getProducts();
        return products.find(p => 
            p.name.includes(productName) || 
            p.shortName.includes(productName) ||
            productName.includes(p.shortName)
        );
    },

    // 查詢所有產品
    getAllProducts() {
        if (typeof demoDataService === 'undefined' || !demoDataService.loaded) {
            return null;
        }
        return demoDataService.getProducts();
    },

    // 查詢市場資訊
    getMarketInfo() {
        if (typeof demoDataService === 'undefined' || !demoDataService.loaded) {
            return null;
        }
        return {
            indices: demoDataService.getMarketIndices(),
            reports: demoDataService.getInvestmentReports(),
            alerts: demoDataService.getActiveMarketAlerts()
        };
    }
};

// ===== 個人資產回應生成 =====
const PersonalResponses = {
    // 資產總覽回應
    assetSummary() {
        const data = PersonalDataQueries.getAssetSummary();
        if (!data || !data.summary) {
            return null;
        }
        const { summary, customer } = data;
        
        return {
            text: `好的，讓我為您查詢資產狀況！\n\n` +
                `💼 **${customer.name}的資產總覽**\n\n` +
                `📊 **總資產**：NT$ ${formatMoney(summary.totalAssets)}\n` +
                `• 流動資產：NT$ ${formatMoney(summary.liquidAssets)}\n` +
                `• 投資資產：NT$ ${formatMoney(summary.investmentAssets)}\n\n` +
                `📉 **負債**：NT$ ${formatMoney(Math.abs(summary.totalLiabilities))}\n\n` +
                `💰 **淨資產**：NT$ ${formatMoney(summary.netWorth)}\n\n` +
                `💡 **小雲提醒**：\n您的投資資產佔總資產約 ${((summary.investmentAssets / summary.totalAssets) * 100).toFixed(0)}%，流動性配置合理！\n\n需要看更詳細的持倉明細嗎？`,
            icon: 'assetUp'
        };
    },

    // 持倉明細回應
    holdingsDetail() {
        const holdings = PersonalDataQueries.getHoldings();
        if (!holdings || holdings.length === 0) {
            return null;
        }

        let holdingsList = holdings.map(h => {
            const gainSign = h.unrealizedGain >= 0 ? '+' : '';
            const gainEmoji = h.unrealizedGain >= 0 ? '📈' : '📉';
            return `${gainEmoji} **${h.productName}**\n` +
                `   市值：NT$ ${formatMoney(h.marketValue)}（佔比 ${(h.weight * 100).toFixed(1)}%）\n` +
                `   損益：${gainSign}NT$ ${formatMoney(h.unrealizedGain)}`;
        }).join('\n\n');

        const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
        const totalGain = holdings.reduce((sum, h) => sum + h.unrealizedGain, 0);

        return {
            text: `📋 **您的投資持倉明細**\n\n${holdingsList}\n\n` +
                `━━━━━━━━━━━━\n` +
                `💰 **投資總市值**：NT$ ${formatMoney(totalValue)}\n` +
                `${totalGain >= 0 ? '🎉' : '⚠️'} **未實現損益**：${totalGain >= 0 ? '+' : ''}NT$ ${formatMoney(totalGain)}\n\n` +
                `💡 想了解任何一檔基金的詳細資訊嗎？直接問我基金名稱就好喔！`,
            icon: totalGain >= 0 ? 'keepEarn' : 'notice'
        };
    },

    // 帳戶資訊回應
    accountsInfo() {
        const accounts = PersonalDataQueries.getAccounts();
        if (!accounts || accounts.length === 0) {
            return null;
        }

        let accountsList = accounts.map(acc => {
            if (acc.type === 'investment') {
                return `📈 **${acc.typeName}**\n   總市值：NT$ ${formatMoney(acc.totalValue)}\n   未實現損益：${acc.unrealizedGain >= 0 ? '+' : ''}${formatPercent(acc.unrealizedGainPercent)}`;
            } else if (acc.type === 'loan') {
                return `🏦 **${acc.typeName}**\n   餘額：NT$ ${formatMoney(Math.abs(acc.principalBalance))}\n   利率：${(acc.interestRate * 100).toFixed(2)}%\n   月付：NT$ ${formatMoney(acc.monthlyPayment)}`;
            } else {
                return `💵 **${acc.typeName}**\n   餘額：NT$ ${formatMoney(acc.balance)}`;
            }
        }).join('\n\n');

        return {
            text: `🏦 **您的帳戶總覽**\n\n${accountsList}\n\n💡 需要看投資帳戶的持倉明細嗎？`,
            icon: 'keepCare'
        };
    },

    // 交易記錄回應
    transactionsInfo() {
        const transactions = PersonalDataQueries.getTransactions();
        if (!transactions || transactions.length === 0) {
            return null;
        }

        const recentTx = transactions.slice(0, 5);
        let txList = recentTx.map(tx => {
            if (tx.type === 'rebalance') {
                return `🔄 ${tx.date} **${tx.typeName}**\n   原因：${tx.reason}`;
            }
            return `${tx.type === 'buy' ? '📥' : '📤'} ${tx.date} **${tx.typeName}**\n   ${tx.productName}\n   金額：NT$ ${formatMoney(tx.amount)}`;
        }).join('\n\n');

        return {
            text: `📜 **近期交易記錄**\n\n${txList}\n\n💡 您的定期定額計畫執行良好！保持紀律投資是成功的關鍵喔～`,
            icon: 'keepCare'
        };
    },

    // 目標進度回應
    goalsProgress() {
        const goals = PersonalDataQueries.getGoals();
        if (!goals || goals.length === 0) {
            return null;
        }

        let goalsList = goals.map(g => {
            const progress = ((g.currentAmount / g.targetAmount) * 100).toFixed(1);
            const progressBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
            const statusEmoji = g.gapAnalysis.onTrack ? '✅' : '⚠️';
            
            return `${g.icon} **${g.typeName}**\n` +
                `   目標：NT$ ${formatMoney(g.targetAmount)}\n` +
                `   目前：NT$ ${formatMoney(g.currentAmount)}\n` +
                `   進度：[${progressBar}] ${progress}%\n` +
                `   ${statusEmoji} ${g.gapAnalysis.onTrack ? '進度良好！' : `建議每月增加 NT$ ${formatMoney(g.gapAnalysis.requiredMonthlyIncrease)}`}`;
        }).join('\n\n');

        return {
            text: `🎯 **您的理財目標進度**\n\n${goalsList}\n\n💡 持續定期投入，您一定能達成目標！加油！`,
            icon: 'keepEarn'
        };
    },

    // 收支概況回應
    incomeExpenseInfo() {
        const data = PersonalDataQueries.getIncomeExpense();
        if (!data) {
            return null;
        }

        return {
            text: `💰 **您的收支概況**\n\n` +
                `📈 **收入**\n` +
                `• 月收入：NT$ ${formatMoney(data.monthlyIncome)}\n` +
                `• 年收入：NT$ ${formatMoney(data.annualIncome)}\n` +
                `• 收入穩定度：${data.incomeStability}\n\n` +
                `📉 **支出**\n` +
                `• 月支出：NT$ ${formatMoney(data.monthlyExpense)}\n` +
                `• 固定支出：NT$ ${formatMoney(data.monthlyFixedExpense)}\n` +
                `• 變動支出：NT$ ${formatMoney(data.monthlyVariableExpense)}\n\n` +
                `💵 **儲蓄**\n` +
                `• 月儲蓄：NT$ ${formatMoney(data.monthlySavings)}\n` +
                `• 儲蓄率：${(data.savingsRate * 100).toFixed(0)}%\n` +
                `• 緊急預備金：${data.emergencyFundMonths} 個月\n\n` +
                `💡 **小雲評估**：\n您的儲蓄率達 ${(data.savingsRate * 100).toFixed(0)}%，非常棒！建議維持 6 個月以上的緊急預備金喔！`,
            icon: 'assetUp'
        };
    }
};

// ===== 商品查詢回應 =====
const ProductResponses = {
    // 查詢特定商品
    productDetail(productName) {
        const product = PersonalDataQueries.getProductInfo(productName);
        if (!product) {
            return null;
        }

        const chars = product.investmentCharacteristics;
        const edu = product.educationalInfo;
        const riskEmoji = ['🟢', '🟢', '🟡', '🟡', '🟠', '🔴'][chars.riskLevel] || '⚪';

        return {
            text: `📦 **${product.name}**\n\n` +
                `${riskEmoji} **風險等級**：RR${chars.riskLevel} ${chars.riskLabel}\n` +
                `💵 **淨值**：NT$ ${product.nav}（${product.navDate}）\n` +
                `📊 **預期報酬**：${chars.expectedReturn}\n` +
                `⏰ **建議投資期間**：${chars.investmentHorizon}\n` +
                `💧 **流動性**：${chars.liquidity}\n\n` +
                `📝 **商品說明**：\n${edu.description}\n\n` +
                `✅ **適合對象**：${edu.suitableFor.join('、')}\n` +
                `❌ **不適合對象**：${edu.notSuitableFor.join('、')}\n\n` +
                `📈 **歷史績效**：\n` +
                `• 今年以來：${formatPercent(edu.historicalPerformance.ytd)}\n` +
                `• 近一年：${formatPercent(edu.historicalPerformance['1year'])}\n` +
                `• 近三年：${formatPercent(edu.historicalPerformance['3year'])}\n\n` +
                `⚠️ **主要風險**：${edu.keyRisks.join('、')}\n\n` +
                `💸 **費用**：\n` +
                `• 申購手續費：${formatPercent(product.fees.subscriptionFee)}\n` +
                `• 管理費：${formatPercent(product.fees.managementFee)}/年\n\n` +
                `💡 需要我評估這檔基金是否適合您嗎？`,
            icon: 'keepEarn'
        };
    },

    // 列出所有商品
    allProducts() {
        const products = PersonalDataQueries.getAllProducts();
        if (!products || products.length === 0) {
            return null;
        }

        const productsByCategory = {};
        products.forEach(p => {
            const cat = p.category === 'equity' ? '股票型' :
                       p.category === 'bond' ? '債券型' :
                       p.category === 'moneyMarket' ? '貨幣市場' : '其他';
            if (!productsByCategory[cat]) {
                productsByCategory[cat] = [];
            }
            productsByCategory[cat].push(p);
        });

        let productList = Object.entries(productsByCategory).map(([cat, prods]) => {
            const items = prods.map(p => {
                const riskEmoji = ['🟢', '🟢', '🟡', '🟡', '🟠', '🔴'][p.investmentCharacteristics.riskLevel] || '⚪';
                return `   ${riskEmoji} ${p.shortName}（RR${p.investmentCharacteristics.riskLevel}）`;
            }).join('\n');
            return `📁 **${cat}**\n${items}`;
        }).join('\n\n');

        return {
            text: `📋 **可投資商品列表**\n\n${productList}\n\n` +
                `💡 想了解哪一檔商品呢？直接告訴我名稱，我會提供詳細資訊！\n\n` +
                `例如：「告訴我全球股票型基金」`,
            icon: 'hello'
        };
    },

    // 商品比較
    compareProducts(product1Name, product2Name) {
        const p1 = PersonalDataQueries.getProductInfo(product1Name);
        const p2 = PersonalDataQueries.getProductInfo(product2Name);
        
        if (!p1 || !p2) {
            return null;
        }

        return {
            text: `⚖️ **商品比較**\n\n` +
                `| 項目 | ${p1.shortName} | ${p2.shortName} |\n` +
                `|------|------|------|\n` +
                `| 風險等級 | RR${p1.investmentCharacteristics.riskLevel} | RR${p2.investmentCharacteristics.riskLevel} |\n` +
                `| 預期報酬 | ${p1.investmentCharacteristics.expectedReturn} | ${p2.investmentCharacteristics.expectedReturn} |\n` +
                `| 近一年 | ${formatPercent(p1.educationalInfo.historicalPerformance['1year'])} | ${formatPercent(p2.educationalInfo.historicalPerformance['1year'])} |\n` +
                `| 管理費 | ${formatPercent(p1.fees.managementFee)} | ${formatPercent(p2.fees.managementFee)} |\n\n` +
                `💡 根據您的穩健型風險屬性，兩者都在可投資範圍內。要我進一步分析嗎？`,
            icon: 'thinking'
        };
    },

    // 商品適合度檢查
    checkSuitability(productName) {
        if (typeof demoDataService === 'undefined' || !demoDataService.loaded) {
            return null;
        }
        
        const product = PersonalDataQueries.getProductInfo(productName);
        if (!product) {
            return null;
        }

        const result = demoDataService.checkProductSuitability(product.productId, ChatbotState.customerId);
        
        if (result.suitable) {
            return {
                text: `✅ **適合度評估結果**\n\n` +
                    `**${product.name}** 適合您的投資屬性！\n\n` +
                    `📋 **評估說明**：\n` +
                    `• ✓ 風險等級符合您的承受度\n` +
                    `• ✓ 年齡條件符合\n` +
                    `• ✓ 投資屬性適配\n\n` +
                    `💡 如果您有興趣，可以前往「交易執行」頁面進行申購喔！`,
                icon: 'keepEarn'
            };
        } else {
            return {
                text: `⚠️ **適合度評估結果**\n\n` +
                    `**${product.name}** 可能不太適合您目前的投資屬性。\n\n` +
                    `📋 **原因**：\n` +
                    result.reasons.map(r => `• ❌ ${r}`).join('\n') +
                    `\n\n💡 **小雲建議**：\n` +
                    `建議考慮風險等級較低的商品，或者您可以：\n` +
                    `1. 重新評估風險屬性\n` +
                    `2. 諮詢真人理財顧問\n` +
                    `3. 選擇其他適合的商品`,
                icon: 'notice'
            };
        }
    }
};

// ===== 市場資訊回應 =====
const MarketResponses = {
    marketOverview() {
        const data = PersonalDataQueries.getMarketInfo();
        if (!data) {
            return null;
        }

        const indices = data.indices.map(idx => {
            const changeEmoji = idx.change >= 0 ? '📈' : '📉';
            const changeSign = idx.change >= 0 ? '+' : '';
            return `${changeEmoji} **${idx.name}**\n   ${idx.value.toLocaleString()}（${changeSign}${(idx.changePercent * 100).toFixed(2)}%）`;
        }).join('\n\n');

        let alertsText = '';
        if (data.alerts && data.alerts.length > 0) {
            alertsText = `\n\n🔔 **市場提醒**：\n` + 
                data.alerts.map(a => `• ${a.message}`).join('\n');
        }

        return {
            text: `📊 **市場概況**\n\n${indices}${alertsText}\n\n` +
                `💡 長期投資不必過度關注短期波動，保持紀律最重要！`,
            icon: 'thinking'
        };
    }
};

// ===== 預設回應知識庫 =====
const KnowledgeBase = {
    // 問候語
    greetings: [
        '您好！我是小雲 ☁️，您的智慧理財小助手！\n\n我可以幫您：\n• 查詢您的資產狀況\n• 說明投資商品\n• 解答理財問題\n\n有什麼我可以幫您的嗎？',
        '嗨！很高興見到您！我是小雲～\n\n您可以問我：\n• 「我的資產有多少？」\n• 「有哪些商品可以投資？」\n• 「什麼是定期定額？」\n\n讓我來為您服務！'
    ],
    
    // 關鍵詞對應回答
    responses: {
        // 風險相關
        '風險': {
            keywords: ['風險', '危險', '虧損', '賠錢', '損失'],
            answer: `關於投資風險，讓我用簡單的方式解釋：\n\n🎯 **風險是什麼？**\n就像天氣一樣，投資市場也有晴天和雨天。風險就是可能遇到「雨天」的機率。\n\n📊 **風險等級說明：**\n• **保守型**：像存款一樣穩定，但報酬較低\n• **穩健型**：偶爾有小波動，長期穩健成長\n• **積極型**：起伏較大，但潛在報酬也較高\n\n💡 **小雲的建議**：\n選擇符合自己承受能力的風險等級最重要！不要因為想要高報酬就選擇超過自己能承受的風險喔～`,
            icon: 'notice'
        },
        
        // 基金相關
        '基金': {
            keywords: ['基金', '投資基金', '共同基金', 'ETF'],
            answer: `讓我為您解釋什麼是基金：\n\n🏦 **基金是什麼？**\n想像一下，基金就像是一個「團購」的概念！很多投資人把錢集合起來，交給專業經理人去投資。\n\n📦 **基金的好處：**\n• **分散風險**：不把雞蛋放在同一個籃子\n• **專業管理**：有專家幫您操作\n• **小額投資**：不需要大筆資金就能開始\n\n🎯 **常見基金類型：**\n• 股票型基金：投資股票，波動較大\n• 債券型基金：投資債券，相對穩定\n• 平衡型基金：股債混合，平衡風險\n\n想了解更多嗎？可以問我「有哪些商品」看看可投資的基金！`,
            icon: 'keepEarn'
        },
        
        // 定期定額
        '定期定額': {
            keywords: ['定期定額', '定期', '每月投資', '自動扣款'],
            answer: `定期定額是新手入門的好方法！讓我來說明：\n\n⏰ **什麼是定期定額？**\n就是每個月固定時間、固定金額自動投資，就像訂閱服務一樣簡單！\n\n✨ **定期定額的魔力：**\n• **攤平成本**：市場高時買少一點，低時買多一點\n• **紀律投資**：避免情緒化操作\n• **小額起步**：每月1000元也能開始\n\n📈 **舉個例子：**\n假設您每月投資5000元：\n- 基金價格高時：買到較少單位\n- 基金價格低時：買到較多單位\n長期下來，平均成本會被「攤平」！\n\n💡 這就是「微笑曲線」的概念～要不要我詳細說明？`,
            icon: 'keepCare'
        },
        
        // 報酬率
        '報酬': {
            keywords: ['報酬', '報酬率', '獲利', '賺多少', '收益'],
            answer: `讓我用簡單的方式解釋報酬率：\n\n💰 **報酬率是什麼？**\n就是您投資賺到的錢佔本金的百分比。\n\n📊 **計算方式（簡化版）：**\n報酬率 = (現在價值 - 投入成本) ÷ 投入成本 × 100%\n\n🎯 **實際例子：**\n投入 10 萬元，現在變成 11.2 萬元\n報酬率 = (11.2萬 - 10萬) ÷ 10萬 × 100% = 12%\n\n⚠️ **重要提醒：**\n• 過去績效不代表未來表現\n• 高報酬通常伴隨高風險\n• 要考慮通膨的影響\n\n需要查看您目前的投資報酬嗎？問我「我的持倉」就能看到喔！`,
            icon: 'assetUp'
        },

        // 費用相關
        '費用': {
            keywords: ['費用', '手續費', '管理費', '成本'],
            answer: `投資費用是影響報酬的重要因素！\n\n💸 **常見的投資費用：**\n\n1️⃣ **申購手續費**\n   買入時收取，通常 0-3%\n   定期定額常有優惠\n\n2️⃣ **管理費（經理費）**\n   每年從基金淨值扣除\n   股票型約 1-2%，債券型約 0.5-1%\n\n3️⃣ **保管費**\n   銀行保管資產的費用\n   通常每年 0.1-0.2%\n\n4️⃣ **贖回費**\n   賣出時可能收取\n   持有越久通常越低\n\n💡 **小雲提醒：**\n選擇基金時，記得比較「總費用率」\n長期下來，低費用能省下不少錢喔！\n\n想查看特定商品的費用？問我商品名稱就好！`,
            icon: 'notice'
        }
    },
    
    // 預設回應（找不到匹配時）
    defaultResponses: [
        '這是個很好的問題！讓我想想怎麼用最簡單的方式解釋...\n\n如果您是問投資相關的問題，可以試著問我：\n• 「我的資產有多少？」\n• 「有哪些商品可以投資？」\n• 「什麼是定期定額？」\n\n或者您可以告訴我更多細節，我會盡力幫助您！',
        '嗯...這個問題有點超出我目前的知識範圍 😅\n\n不過您可以問我：\n• 查詢您的資產狀況\n• 了解投資商品\n• 投資理財知識\n\n或者點擊「轉介真人顧問」獲得專業協助！'
    ],
    
    // 快速問題建議
    quickQuestions: [
        '我的資產',
        '持倉明細',
        '有哪些商品',
        '目標進度',
        '市場行情',
        '什麼是定期定額'
    ]
};

// ===== 聊天機器人核心功能 =====

/**
 * 初始化聊天機器人
 */
function initChatbot() {
    // 添加歡迎訊息
    if (ChatbotState.messages.length === 0) {
        const greeting = KnowledgeBase.greetings[Math.floor(Math.random() * KnowledgeBase.greetings.length)];
        addBotMessage(greeting, 'hello');
    }
}

/**
 * 切換聊天視窗
 */
function toggleChatbot() {
    ChatbotState.isOpen = !ChatbotState.isOpen;
    const chatWindow = document.getElementById('chatbotWindow');
    const chatButton = document.getElementById('chatbotButton');
    
    if (chatWindow) {
        if (ChatbotState.isOpen) {
            chatWindow.classList.add('active');
            chatButton.classList.add('active');
            initChatbot();
            scrollToBottom();
            
            // Focus on input
            setTimeout(() => {
                const input = document.getElementById('chatInput');
                if (input) input.focus();
            }, 300);
            
            logEvent('chatbot_opened');
        } else {
            chatWindow.classList.remove('active');
            chatButton.classList.remove('active');
            logEvent('chatbot_closed');
        }
    }
}

/**
 * 發送用戶訊息
 */
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 添加用戶訊息
    addUserMessage(message);
    input.value = '';
    
    // 顯示打字中狀態
    showTypingIndicator();
    
    try {
        let response;
        
        if (OllamaConfig.enabled) {
            // 使用 Ollama API
            response = await generateOllamaResponse(message);
        } else {
            // 使用本地知識庫
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
            response = generateResponse(message);
        }
        
        hideTypingIndicator();
        addBotMessage(response.text, response.icon);
    } catch (error) {
        console.error('Chatbot error:', error);
        hideTypingIndicator();
        addBotMessage('抱歉，我遇到了一些技術問題 😅\n請稍後再試，或者點擊「轉介真人顧問」獲得協助！', 'notice');
    }
    
    logEvent('chatbot_message_sent', { message: message.substring(0, 50) });
}

/**
 * 快速問題點擊
 */
function askQuickQuestion(question) {
    const input = document.getElementById('chatInput');
    if (input) {
        input.value = question;
        sendMessage();
    }
}

/**
 * 呼叫 Ollama API 生成回應
 */
async function generateOllamaResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // ===== 先檢查是否為個人資料查詢（這些需要本地資料） =====
    const localResponse = checkLocalDataQuery(lowerMessage);
    if (localResponse) {
        // 將本地資料加入對話歷史
        ChatbotState.conversationHistory.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: localResponse.text }
        );
        return localResponse;
    }
    
    // ===== 準備上下文資訊 =====
    let contextInfo = '';
    
    // 嘗試獲取用戶資產摘要作為上下文
    const assetData = PersonalDataQueries.getAssetSummary();
    if (assetData && assetData.summary) {
        contextInfo = `\n\n【用戶資料參考】
用戶姓名：${assetData.customer.name}
總資產：NT$ ${formatMoney(assetData.summary.totalAssets)}
淨資產：NT$ ${formatMoney(assetData.summary.netWorth)}
風險屬性：${assetData.customer.riskProfile?.riskLevel || '穩健型'}`;
    }
    
    // ===== 建立對話歷史 =====
    ChatbotState.conversationHistory.push({
        role: 'user',
        content: userMessage
    });
    
    // 限制對話歷史長度（保留最近 10 輪對話）
    if (ChatbotState.conversationHistory.length > 20) {
        ChatbotState.conversationHistory = ChatbotState.conversationHistory.slice(-20);
    }
    
    try {
        const response = await fetch(`${OllamaConfig.baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: OllamaConfig.model,
                messages: [
                    {
                        role: 'system',
                        content: OllamaConfig.systemPrompt + contextInfo
                    },
                    ...ChatbotState.conversationHistory
                ],
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    num_predict: 500
                }
            }),
            signal: AbortSignal.timeout(OllamaConfig.timeout)
        });
        
        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }
        
        const data = await response.json();
        const assistantMessage = data.message?.content || '抱歉，我無法生成回應。';
        
        // 加入對話歷史
        ChatbotState.conversationHistory.push({
            role: 'assistant',
            content: assistantMessage
        });
        
        return {
            text: assistantMessage,
            icon: determineIcon(assistantMessage)
        };
        
    } catch (error) {
        console.error('Ollama API error:', error);
        
        // 如果 Ollama 不可用，降級使用本地知識庫
        console.log('Falling back to local knowledge base...');
        const fallbackResponse = generateResponse(userMessage);
        
        ChatbotState.conversationHistory.push({
            role: 'assistant',
            content: fallbackResponse.text
        });
        
        return fallbackResponse;
    }
}

/**
 * 檢查是否為需要本地資料的查詢
 */
function checkLocalDataQuery(lowerMessage) {
    // 資產總覽查詢
    if (matchKeywords(lowerMessage, ['資產', '總資產', '我有多少', '身家', '淨值'])) {
        return PersonalResponses.assetSummary();
    }
    
    // 持倉明細查詢
    if (matchKeywords(lowerMessage, ['持倉', '持股', '投資組合', '買了什麼', '持有', '投資明細'])) {
        return PersonalResponses.holdingsDetail();
    }
    
    // 帳戶查詢
    if (matchKeywords(lowerMessage, ['帳戶', '戶頭', '銀行', '存款', '餘額'])) {
        return PersonalResponses.accountsInfo();
    }
    
    // 交易記錄查詢
    if (matchKeywords(lowerMessage, ['交易', '紀錄', '買賣', '歷史'])) {
        return PersonalResponses.transactionsInfo();
    }
    
    // 目標進度查詢
    if (matchKeywords(lowerMessage, ['目標', '進度', '達成', '計畫', '規劃'])) {
        return PersonalResponses.goalsProgress();
    }
    
    // 收支查詢
    if (matchKeywords(lowerMessage, ['收入', '支出', '收支', '薪水', '花費', '儲蓄'])) {
        return PersonalResponses.incomeExpenseInfo();
    }
    
    // 所有商品列表
    if (matchKeywords(lowerMessage, ['有哪些商品', '商品列表', '可以投資', '有什麼基金', '推薦商品'])) {
        return ProductResponses.allProducts();
    }
    
    // 市場資訊
    if (matchKeywords(lowerMessage, ['市場', '行情', '股市', '指數', '大盤'])) {
        return MarketResponses.marketOverview();
    }
    
    // 特定商品查詢
    const productNames = ['全球股票', '新興市場', '穩健債券', '貨幣市場', '科技創新', '平衡型', 'ETF'];
    for (const productName of productNames) {
        if (lowerMessage.includes(productName.toLowerCase()) || lowerMessage.includes(productName)) {
            return ProductResponses.productDetail(productName);
        }
    }
    
    return null;
}

/**
 * 根據回應內容決定顯示的圖示
 */
function determineIcon(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('警告') || lowerText.includes('注意') || lowerText.includes('風險')) {
        return 'notice';
    }
    if (lowerText.includes('恭喜') || lowerText.includes('很棒') || lowerText.includes('成功')) {
        return 'keepEarn';
    }
    if (lowerText.includes('建議') || lowerText.includes('考慮')) {
        return 'thinking';
    }
    if (lowerText.includes('你好') || lowerText.includes('嗨') || lowerText.includes('歡迎')) {
        return 'hello';
    }
    
    return 'keepCare';
}

/**
 * 檢查 Ollama 服務狀態
 */
async function checkOllamaStatus() {
    try {
        const response = await fetch(`${OllamaConfig.baseUrl}/api/tags`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Ollama 服務正常，可用模型:', data.models?.map(m => m.name).join(', '));
            return true;
        }
        return false;
    } catch (error) {
        console.warn('Ollama 服務不可用:', error.message);
        return false;
    }
}

/**
 * 切換 Ollama 模式
 */
function toggleOllamaMode(enabled) {
    OllamaConfig.enabled = enabled;
    console.log(`Ollama 模式: ${enabled ? '啟用' : '停用'}`);
}

/**
 * 設定 Ollama 模型
 */
function setOllamaModel(modelName) {
    OllamaConfig.model = modelName;
    console.log(`Ollama 模型設定為: ${modelName}`);
}

/**
 * 清除對話歷史
 */
function clearConversationHistory() {
    ChatbotState.conversationHistory = [];
    console.log('對話歷史已清除');
}

/**
 * 生成 AI 回應（本地知識庫版本，作為備援）
 * 優先處理個人資料查詢，再處理知識庫匹配
 */
function generateResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // ===== 1. 個人資產相關查詢 =====
    
    // 資產總覽查詢
    if (matchKeywords(lowerMessage, ['資產', '總資產', '我有多少', '身家', '淨值'])) {
        const response = PersonalResponses.assetSummary();
        if (response) return response;
    }
    
    // 持倉明細查詢
    if (matchKeywords(lowerMessage, ['持倉', '持股', '投資組合', '買了什麼', '持有', '投資明細'])) {
        const response = PersonalResponses.holdingsDetail();
        if (response) return response;
    }
    
    // 帳戶查詢
    if (matchKeywords(lowerMessage, ['帳戶', '戶頭', '銀行', '存款', '餘額'])) {
        const response = PersonalResponses.accountsInfo();
        if (response) return response;
    }
    
    // 交易記錄查詢
    if (matchKeywords(lowerMessage, ['交易', '紀錄', '買賣', '歷史'])) {
        const response = PersonalResponses.transactionsInfo();
        if (response) return response;
    }
    
    // 目標進度查詢
    if (matchKeywords(lowerMessage, ['目標', '進度', '達成', '計畫', '規劃'])) {
        const response = PersonalResponses.goalsProgress();
        if (response) return response;
    }
    
    // 收支查詢
    if (matchKeywords(lowerMessage, ['收入', '支出', '收支', '薪水', '花費', '儲蓄'])) {
        const response = PersonalResponses.incomeExpenseInfo();
        if (response) return response;
    }
    
    // ===== 2. 商品相關查詢 =====
    
    // 所有商品列表
    if (matchKeywords(lowerMessage, ['有哪些商品', '商品列表', '可以投資', '有什麼基金', '推薦商品', '商品', '產品'])) {
        const response = ProductResponses.allProducts();
        if (response) return response;
    }
    
    // 特定商品查詢 - 檢查是否包含商品名稱
    const productNames = ['全球股票', '新興市場', '穩健債券', '貨幣市場', '科技創新', '平衡型', 'ETF'];
    for (const productName of productNames) {
        if (lowerMessage.includes(productName.toLowerCase()) || lowerMessage.includes(productName)) {
            const response = ProductResponses.productDetail(productName);
            if (response) return response;
        }
    }
    
    // 商品適合度查詢
    if (matchKeywords(lowerMessage, ['適不適合', '可以買', '適合我嗎', '能不能買'])) {
        for (const productName of productNames) {
            if (lowerMessage.includes(productName.toLowerCase()) || lowerMessage.includes(productName)) {
                const response = ProductResponses.checkSuitability(productName);
                if (response) return response;
            }
        }
    }
    
    // ===== 3. 市場資訊查詢 =====
    if (matchKeywords(lowerMessage, ['市場', '行情', '股市', '指數', '大盤'])) {
        const response = MarketResponses.marketOverview();
        if (response) return response;
    }
    
    // ===== 4. 知識庫匹配 =====
    for (const [key, data] of Object.entries(KnowledgeBase.responses)) {
        for (const keyword of data.keywords) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                return {
                    text: data.answer,
                    icon: data.icon || 'hello'
                };
            }
        }
    }
    
    // ===== 5. 特殊指令處理 =====
    if (lowerMessage.includes('你好') || lowerMessage.includes('嗨') || lowerMessage.includes('哈囉')) {
        return {
            text: `${ChatbotState.userName}您好！我是小雲 ☁️\n很高興能為您服務！\n\n我可以幫您：\n• 查詢您的資產和持倉\n• 說明投資商品\n• 解答理財問題\n\n有什麼想問我的嗎？`,
            icon: 'hello'
        };
    }
    
    if (lowerMessage.includes('謝謝') || lowerMessage.includes('感謝')) {
        return {
            text: '不客氣！很高興能幫到您 😊\n\n如果還有其他問題，隨時問我喔！\n祝您投資順利，財富增長！ 🎉',
            icon: 'keepCare'
        };
    }
    
    if (lowerMessage.includes('再見') || lowerMessage.includes('掰掰') || lowerMessage.includes('晚安')) {
        return {
            text: '再見！祝您有美好的一天！🌟\n\n記得持續關注您的投資目標喔～\n有任何問題隨時回來找我！',
            icon: 'goodnight'
        };
    }
    
    // ===== 6. 預設回應 =====
    const defaultResponse = KnowledgeBase.defaultResponses[
        Math.floor(Math.random() * KnowledgeBase.defaultResponses.length)
    ];
    
    return {
        text: defaultResponse,
        icon: 'thinking'
    };
}

/**
 * 關鍵詞匹配輔助函數
 */
function matchKeywords(message, keywords) {
    return keywords.some(keyword => message.includes(keyword.toLowerCase()));
}

/**
 * 添加用戶訊息到聊天視窗
 */
function addUserMessage(text) {
    const message = {
        id: 'msg_' + Date.now(),
        type: 'user',
        text: text,
        timestamp: new Date()
    };
    
    ChatbotState.messages.push(message);
    renderMessage(message);
    scrollToBottom();
}

/**
 * 添加機器人訊息到聊天視窗
 */
function addBotMessage(text, icon = 'hello') {
    const message = {
        id: 'msg_' + Date.now(),
        type: 'bot',
        text: text,
        icon: icon,
        timestamp: new Date()
    };
    
    ChatbotState.messages.push(message);
    renderMessage(message);
    scrollToBottom();
}

/**
 * 渲染訊息
 */
function renderMessage(message) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${message.type}-message`;
    messageEl.id = message.id;
    
    if (message.type === 'bot') {
        const iconPath = IPIcons[message.icon] || IPIcons.hello;
        messageEl.innerHTML = `
            <div class="message-avatar">
                <img src="${iconPath}" alt="小雲">
            </div>
            <div class="message-content">
                <div class="message-bubble">${formatMessageText(message.text)}</div>
                <div class="message-time">${formatTime(message.timestamp)}</div>
            </div>
        `;
    } else {
        messageEl.innerHTML = `
            <div class="message-content">
                <div class="message-bubble">${escapeHtml(message.text)}</div>
                <div class="message-time">${formatTime(message.timestamp)}</div>
            </div>
        `;
    }
    
    container.appendChild(messageEl);
}

/**
 * 格式化訊息文字（支援 Markdown 風格）
 */
function formatMessageText(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/• /g, '<span class="bullet">•</span> ');
}

/**
 * HTML 跳脫
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 格式化時間
 */
function formatTime(date) {
    return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
}

/**
 * 顯示打字中指示器
 */
function showTypingIndicator() {
    ChatbotState.isTyping = true;
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-message bot-message typing-indicator';
    typingEl.id = 'typingIndicator';
    typingEl.innerHTML = `
        <div class="message-avatar">
            <img src="${IPIcons.thinking}" alt="小雲思考中">
        </div>
        <div class="message-content">
            <div class="message-bubble typing-bubble">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    
    container.appendChild(typingEl);
    scrollToBottom();
}

/**
 * 隱藏打字中指示器
 */
function hideTypingIndicator() {
    ChatbotState.isTyping = false;
    const typingEl = document.getElementById('typingIndicator');
    if (typingEl) {
        typingEl.remove();
    }
}

/**
 * 滾動到底部
 */
function scrollToBottom() {
    const container = document.getElementById('chatMessages');
    if (container) {
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }
}

/**
 * 清除聊天記錄
 */
function clearChat() {
    ChatbotState.messages = [];
    const container = document.getElementById('chatMessages');
    if (container) {
        container.innerHTML = '';
    }
    initChatbot();
    logEvent('chatbot_cleared');
}

/**
 * 處理 Enter 鍵發送
 */
function handleChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

/**
 * 渲染快速問題
 */
function renderQuickQuestions() {
    const container = document.getElementById('quickQuestions');
    if (!container) return;
    
    container.innerHTML = KnowledgeBase.quickQuestions.map(q => 
        `<button class="quick-question-btn" onclick="askQuickQuestion('${q}')">${q}</button>`
    ).join('');
}

/**
 * 最小化聊天視窗
 */
function minimizeChatbot() {
    toggleChatbot();
}

// ===== 全域匯出 =====
window.ChatbotState = ChatbotState;
window.OllamaConfig = OllamaConfig;
window.toggleChatbot = toggleChatbot;
window.sendMessage = sendMessage;
window.askQuickQuestion = askQuickQuestion;
window.clearChat = clearChat;
window.handleChatKeyPress = handleChatKeyPress;
window.minimizeChatbot = minimizeChatbot;
window.checkOllamaStatus = checkOllamaStatus;
window.toggleOllamaMode = toggleOllamaMode;
window.setOllamaModel = setOllamaModel;
window.clearConversationHistory = clearConversationHistory;

// 頁面載入時渲染快速問題並檢查 Ollama 狀態
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderQuickQuestions, 500);
    
    // 檢查 Ollama 服務狀態
    checkOllamaStatus().then(isAvailable => {
        if (isAvailable) {
            console.log('✅ Ollama 服務已連接，使用 AI 對話模式');
        } else {
            console.log('⚠️ Ollama 服務不可用，使用本地知識庫模式');
            OllamaConfig.enabled = false;
        }
    });
});

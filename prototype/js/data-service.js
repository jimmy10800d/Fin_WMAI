/**
 * Fin_WMAI - Demo Data Service
 * 提供 DEMO 資料的載入與管理功能
 */

class DemoDataService {
    constructor() {
        this.data = null;
        this.loaded = false;
    }

    /**
     * 載入 DEMO 資料
     */
    async loadData() {
        if (this.loaded && this.data) {
            return this.data;
        }

        try {
            const response = await fetch('data/demo-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            this.loaded = true;
            console.log('✅ Demo 資料載入成功', this.data);
            return this.data;
        } catch (error) {
            console.error('❌ Demo 資料載入失敗:', error);
            throw error;
        }
    }

    // ===== 客戶資料 (Customer Profile) =====

    /**
     * 取得所有客戶
     */
    getCustomers() {
        return this.data?.customers || [];
    }

    /**
     * 依 ID 取得客戶
     */
    getCustomerById(customerId) {
        return this.data?.customers?.find(c => c.id === customerId);
    }

    /**
     * 取得客戶標籤
     */
    getCustomerTags(customerId) {
        const customer = this.getCustomerById(customerId);
        return customer?.tags || [];
    }

    /**
     * 取得客戶基本資料
     */
    getCustomerBasicInfo(customerId) {
        const customer = this.getCustomerById(customerId);
        return customer?.basicInfo || null;
    }

    /**
     * 取得客戶收支概況
     */
    getCustomerIncomeExpense(customerId) {
        const customer = this.getCustomerById(customerId);
        return customer?.incomeExpense || null;
    }

    /**
     * 取得客戶金流及財務指標
     */
    getCustomerCashflowIndicators(customerId) {
        const customer = this.getCustomerById(customerId);
        return customer?.cashflowIndicators || null;
    }

    // ===== 帳戶資產 (Account & Assets) =====

    /**
     * 取得客戶所有帳戶
     */
    getCustomerAccounts(customerId) {
        const accountData = this.data?.accounts?.find(a => a.customerId === customerId);
        return accountData?.accounts || [];
    }

    /**
     * 取得客戶帳戶摘要
     */
    getCustomerAccountSummary(customerId) {
        const accountData = this.data?.accounts?.find(a => a.customerId === customerId);
        return accountData?.summary || null;
    }

    /**
     * 取得客戶投資持倉
     */
    getCustomerHoldings(customerId) {
        const accounts = this.getCustomerAccounts(customerId);
        const investmentAccount = accounts.find(a => a.type === 'investment');
        return investmentAccount?.holdings || [];
    }

    // ===== 交易行為 (Trading Behavior) =====

    /**
     * 取得客戶交易記錄
     */
    getCustomerTransactions(customerId) {
        const txData = this.data?.transactions?.find(t => t.customerId === customerId);
        return txData?.transactions || [];
    }

    /**
     * 取得客戶交易行為分析
     */
    getCustomerTradingBehavior(customerId) {
        const txData = this.data?.transactions?.find(t => t.customerId === customerId);
        return txData?.tradingBehavior || null;
    }

    // ===== 產品資料 (Products) =====

    /**
     * 取得所有產品
     */
    getProducts() {
        return this.data?.products || [];
    }

    /**
     * 依 ID 取得產品
     */
    getProductById(productId) {
        return this.data?.products?.find(p => p.productId === productId);
    }

    /**
     * 依類別取得產品
     */
    getProductsByCategory(category) {
        return this.data?.products?.filter(p => p.category === category) || [];
    }

    /**
     * 取得產品投資特性
     */
    getProductCharacteristics(productId) {
        const product = this.getProductById(productId);
        return product?.investmentCharacteristics || null;
    }

    /**
     * 取得產品教育資訊
     */
    getProductEducationalInfo(productId) {
        const product = this.getProductById(productId);
        return product?.educationalInfo || null;
    }

    /**
     * 取得產品合規條件
     */
    getProductComplianceConditions(productId) {
        const product = this.getProductById(productId);
        return product?.complianceConditions || null;
    }

    /**
     * 檢查產品是否適合客戶
     */
    checkProductSuitability(productId, customerId) {
        const product = this.getProductById(productId);
        const customer = this.getCustomerById(customerId);
        
        if (!product || !customer) {
            return { suitable: false, reason: '資料不完整' };
        }

        const conditions = product.complianceConditions;
        const reasons = [];

        // 檢查風險分數
        if (conditions.minRiskScore && customer.cashflowIndicators?.financialHealthScore < conditions.minRiskScore) {
            reasons.push('風險承受度不足');
        }

        // 檢查年齡
        if (conditions.maxAge && customer.basicInfo.age > conditions.maxAge) {
            reasons.push('超過年齡限制');
        }

        // 檢查排除標籤
        if (conditions.excludedCustomerTags?.length > 0) {
            const hasExcludedTag = customer.tags.some(tag => 
                conditions.excludedCustomerTags.includes(tag)
            );
            if (hasExcludedTag) {
                reasons.push('客戶屬性不適合');
            }
        }

        return {
            suitable: reasons.length === 0,
            reasons: reasons
        };
    }

    // ===== 客戶目標及計劃 (Goals & Plans) =====

    /**
     * 取得客戶目標
     */
    getCustomerGoals(customerId) {
        const goalData = this.data?.customerGoals?.find(g => g.customerId === customerId);
        return goalData?.goals || [];
    }

    /**
     * 取得客戶建議歷史
     */
    getCustomerRecommendations(customerId) {
        const goalData = this.data?.customerGoals?.find(g => g.customerId === customerId);
        return goalData?.recommendations || [];
    }

    /**
     * 取得客戶回饋記錄
     */
    getCustomerFeedback(customerId) {
        const goalData = this.data?.customerGoals?.find(g => g.customerId === customerId);
        return goalData?.feedback || [];
    }

    // ===== 合規知識 (Compliance Knowledge) =====

    /**
     * 取得風險屬性定義
     */
    getRiskProfiles() {
        return this.data?.complianceKnowledge?.riskProfiles || [];
    }

    /**
     * 依分數取得風險屬性
     */
    getRiskProfileByScore(score) {
        const profiles = this.getRiskProfiles();
        return profiles.find(p => score >= p.scoreRange[0] && score <= p.scoreRange[1]);
    }

    /**
     * 取得適合度規則
     */
    getSuitabilityRules() {
        return this.data?.complianceKnowledge?.suitabilityRules || [];
    }

    /**
     * 取得風險揭露模板
     */
    getDisclosureTemplates() {
        return this.data?.complianceKnowledge?.disclosureTemplates || [];
    }

    /**
     * 依 ID 取得揭露模板
     */
    getDisclosureTemplateById(templateId) {
        return this.data?.complianceKnowledge?.disclosureTemplates?.find(
            t => t.templateId === templateId
        );
    }

    /**
     * 取得法規規定
     */
    getRegulatoryRules() {
        return this.data?.complianceKnowledge?.regulatoryRules || [];
    }

    // ===== 市場資訊 (Market Info) =====

    /**
     * 取得市場指數
     */
    getMarketIndices() {
        return this.data?.marketInfo?.indices || [];
    }

    /**
     * 取得經濟指標
     */
    getEconomicIndicators() {
        return this.data?.marketInfo?.economicIndicators || [];
    }

    /**
     * 取得投資報告
     */
    getInvestmentReports() {
        return this.data?.marketInfo?.investmentReports || [];
    }

    /**
     * 依 ID 取得投資報告
     */
    getInvestmentReportById(reportId) {
        return this.data?.marketInfo?.investmentReports?.find(r => r.reportId === reportId);
    }

    /**
     * 取得市場警示
     */
    getMarketAlerts() {
        return this.data?.marketInfo?.alerts || [];
    }

    /**
     * 取得有效的市場警示 (未過期)
     */
    getActiveMarketAlerts() {
        const now = new Date();
        return this.data?.marketInfo?.alerts?.filter(a => {
            const expiry = new Date(a.expiresAt);
            return expiry > now;
        }) || [];
    }

    // ===== 輔助方法 =====

    /**
     * 取得資料更新時間
     */
    getLastUpdated() {
        return this.data?.lastUpdated;
    }

    /**
     * 取得資料版本
     */
    getVersion() {
        return this.data?.version;
    }

    /**
     * 格式化金額顯示
     */
    formatCurrency(amount, currency = 'TWD') {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * 格式化百分比顯示
     */
    formatPercent(value, decimals = 2) {
        return (value * 100).toFixed(decimals) + '%';
    }

    /**
     * 格式化日期顯示
     */
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// 建立全域實例
const demoDataService = new DemoDataService();

// 自動載入資料
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await demoDataService.loadData();
        console.log('📊 DemoDataService 已就緒');
        
        // 發送自訂事件通知資料載入完成
        document.dispatchEvent(new CustomEvent('demoDataLoaded', {
            detail: { service: demoDataService }
        }));
    } catch (error) {
        console.error('❌ DemoDataService 初始化失敗:', error);
    }
});

// 匯出供模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DemoDataService, demoDataService };
}


// Format data for OpenAI analysis
export function formatDataForAnalysis(reportRequest: any) {
  const { symbol, companyName, description, sector, industry, stockData, financials, news } = reportRequest;
  
  // Format financial data - highlight key metrics
  const financialSummary = extractFinancialHighlights(financials);
  
  // Format news - extract sentiment and key events
  const newsSummary = extractNewsHighlights(news);
  
  // Build a comprehensive prompt
  return {
    symbol,
    companyName,
    description,
    sector,
    industry,
    currentPrice: stockData?.price || 0,
    marketCap: stockData?.marketCap || 0,
    pe: stockData?.pe || 0,
    financialSummary,
    newsSummary,
    reportType: reportRequest.reportType || 'comprehensive',
    peers: reportRequest.peers || [] 
  };
}

// Extract key financial metrics
export function extractFinancialHighlights(financials: any) {
  if (!financials) return {};
  
  // Get latest annual data
  const latestIncome = financials.income?.[0] || {};
  const latestBalance = financials.balance?.[0] || {};
  const latestCashflow = financials.cashflow?.[0] || {};
  const latestRatios = financials.ratios?.[0] || {};
  
  // Calculate growth rates if we have multiple years
  const revenueGrowth = financials.income?.length > 1 
    ? calculateGrowthRate(financials.income[0]?.revenue, financials.income[1]?.revenue)
    : null;
  
  const netIncomeGrowth = financials.income?.length > 1 
    ? calculateGrowthRate(financials.income[0]?.netIncome, financials.income[1]?.netIncome)
    : null;
  
  return {
    // Latest financial year
    year: latestIncome.calendarYear,
    
    // Income statement highlights
    revenue: latestIncome.revenue,
    grossProfit: latestIncome.grossProfit,
    grossMargin: latestIncome.grossProfitRatio,
    operatingIncome: latestIncome.operatingIncome,
    operatingMargin: latestIncome.operatingIncomeRatio,
    netIncome: latestIncome.netIncome,
    netMargin: latestIncome.netIncomeRatio,
    eps: latestIncome.eps,
    
    // Balance sheet highlights
    totalAssets: latestBalance.totalAssets,
    totalLiabilities: latestBalance.totalLiabilities,
    totalEquity: latestBalance.totalEquity,
    debt: latestBalance.totalDebt,
    cashAndEquivalents: latestBalance.cashAndCashEquivalents,
    
    // Cash flow highlights
    operatingCashFlow: latestCashflow.operatingCashFlow,
    freeCashFlow: latestCashflow.freeCashFlow,
    
    // Key ratios
    returnOnEquity: latestRatios?.returnOnEquity,
    returnOnAssets: latestRatios?.returnOnAssets,
    debtToEquity: latestRatios?.debtEquityRatio,
    currentRatio: latestRatios?.currentRatio,
    
    // Growth metrics
    revenueGrowth,
    netIncomeGrowth,
  };
}

// Calculate YoY growth rate
export function calculateGrowthRate(current: number, previous: number) {
  if (!current || !previous || previous === 0) return null;
  return ((current - previous) / Math.abs(previous) * 100).toFixed(2) + '%';
}

// Extract news sentiment and key events
export function extractNewsHighlights(news: any[]) {
  if (!news || news.length === 0) return [];
  
  // Return only recent news (last 10 articles)
  return news.slice(0, 10).map(article => ({
    date: article.publishedDate,
    title: article.title,
    text: article.text?.substring(0, 300) + '...' // Truncate for brevity
  }));
}

// Format large numbers (e.g., market cap) for readability
export function formatLargeNumber(num: number) {
  if (!num) return "N/A";
  
  if (num >= 1e12) return (num / 1e12).toFixed(2) + " trillion";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + " billion";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + " million";
  
  return num.toString();
}

// Parse growth rate from string like "12.34%"
export function parseGrowthRate(growthStr: string | null): number {
  if (!growthStr) return 0;
  
  const match = growthStr.match(/([-+]?\d+(\.\d+)?)/);
  if (match) {
    return parseFloat(match[1]);
  }
  return 0;
}

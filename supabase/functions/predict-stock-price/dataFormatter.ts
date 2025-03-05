
export function formatDataForPrediction(symbol: string, stockData: any, financials: any, news: any[]) {
  const financialSummary = extractFinancialIndicators(financials);
  const technicalIndicators = extractTechnicalIndicators(stockData);
  const newsSummary = formatNewsSummary(news);
  
  return {
    symbol,
    currentPrice: stockData.price,
    financialSummary,
    technicalIndicators,
    newsSummary
  };
}

export function extractFinancialIndicators(financials: any) {
  if (!financials) return {};
  
  const incomeData = financials.income?.slice(0, 3).map((statement: any) => ({
    year: statement.calendarYear,
    revenue: statement.revenue,
    netIncome: statement.netIncome,
    eps: statement.eps,
    operatingMargin: statement.operatingIncomeRatio
  })) || [];
  
  const balanceData = financials.balance?.slice(0, 3).map((statement: any) => ({
    year: statement.calendarYear,
    totalAssets: statement.totalAssets,
    totalLiabilities: statement.totalLiabilities,
    totalEquity: statement.totalEquity,
    cashAndEquivalents: statement.cashAndCashEquivalents,
    debt: statement.totalDebt
  })) || [];
  
  const cashflowData = financials.cashflow?.slice(0, 3).map((statement: any) => ({
    year: statement.calendarYear,
    operatingCashFlow: statement.operatingCashFlow,
    freeCashFlow: statement.freeCashFlow,
    capitalExpenditure: statement.capitalExpenditure,
    dividendsPaid: statement.dividendsPaid
  })) || [];
  
  const ratioData = financials.ratios?.slice(0, 1).map((data: any) => ({
    year: data.calendarYear,
    pe: data.priceEarningsRatio,
    pb: data.priceToBookRatio,
    ps: data.priceSalesRatio,
    roe: data.returnOnEquity,
    roa: data.returnOnAssets,
    debtToEquity: data.debtEquityRatio,
    currentRatio: data.currentRatio
  })) || [];
  
  const growthRates = calculateGrowthRates(incomeData);
  
  return {
    incomeData,
    balanceData,
    cashflowData,
    ratioData,
    growthRates
  };
}

function calculateGrowthRates(incomeData: any[]) {
  if (!incomeData || incomeData.length < 2) return {};
  
  const current = incomeData[0];
  const previous = incomeData[1];
  
  const revenueGrowth = calculateGrowthRate(current.revenue, previous.revenue);
  const netIncomeGrowth = calculateGrowthRate(current.netIncome, previous.netIncome);
  const epsGrowth = calculateGrowthRate(current.eps, previous.eps);
  
  return {
    revenueGrowth,
    netIncomeGrowth,
    epsGrowth
  };
}

export function calculateGrowthRate(current: number, previous: number) {
  if (!current || !previous || previous === 0) return null;
  return ((current - previous) / Math.abs(previous) * 100).toFixed(2) + '%';
}

export function extractTechnicalIndicators(stockData: any) {
  if (!stockData) return {};
  
  return {
    price: stockData.price,
    priceAvg50: stockData.priceAvg50,
    priceAvg200: stockData.priceAvg200,
    yearHigh: stockData.yearHigh,
    yearLow: stockData.yearLow,
    volume: stockData.volume,
    avgVolume: stockData.avgVolume,
    marketCap: stockData.marketCap,
    pe: stockData.pe
  };
}

export function formatNewsSummary(news: any[]) {
  if (!news || news.length === 0) return [];
  
  return news.slice(0, 5).map(article => ({
    date: article.publishedDate,
    title: article.title,
    summary: article.text?.substring(0, 300) + '...'
  }));
}

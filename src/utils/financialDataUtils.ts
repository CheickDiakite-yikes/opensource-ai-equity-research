import { IncomeStatement, BalanceSheet, CashFlowStatement, KeyRatio, FinancialData, RatioData } from "@/types";

/**
 * Format a number as a currency string
 */
export const formatCurrency = (value: number): string => {
  if (value === 0) return "$0";
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1e12) {
    return `${value < 0 ? '-' : ''}$${(absValue / 1e12).toFixed(2)}T`;
  } else if (absValue >= 1e9) {
    return `${value < 0 ? '-' : ''}$${(absValue / 1e9).toFixed(2)}B`;
  } else if (absValue >= 1e6) {
    return `${value < 0 ? '-' : ''}$${(absValue / 1e6).toFixed(2)}M`;
  } else if (absValue >= 1e3) {
    return `${value < 0 ? '-' : ''}$${(absValue / 1e3).toFixed(2)}K`;
  } else {
    return `${value < 0 ? '-' : ''}$${absValue.toFixed(2)}`;
  }
};

/**
 * Format a number as a percentage string
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

/**
 * Prepare financial data for charts
 */
export const prepareFinancialData = (
  incomeStatements: IncomeStatement[], 
  balanceSheets: BalanceSheet[], 
  cashFlowStatements: CashFlowStatement[]
): FinancialData[] => {
  
  // Take the minimum number of periods available across all statements
  const periods = Math.min(
    incomeStatements.length, 
    balanceSheets.length, 
    cashFlowStatements.length
  );
  
  // If any statement is empty, return empty array
  if (periods === 0) return [];
  
  const result: FinancialData[] = [];
  
  for (let i = 0; i < periods; i++) {
    const income: Partial<IncomeStatement> = incomeStatements[i] || {};
    const balance: Partial<BalanceSheet> = balanceSheets[i] || {};
    const cashFlow: Partial<CashFlowStatement> = cashFlowStatements[i] || {};
    
    // Get the date from any available statement (prioritizing income statement)
    const date = income.date || balance.date || cashFlow.date || 'Unknown';
    
    result.push({
      date,
      // Income statement data
      revenue: income.revenue || 0,
      costOfRevenue: income.costOfRevenue || 0,
      grossProfit: income.grossProfit || 0,
      grossProfitRatio: income.grossProfitRatio || 0,
      operatingExpenses: income.operatingExpenses || 0,
      operatingIncome: income.operatingIncome || 0,
      netIncome: income.netIncome || 0,
      
      // Balance sheet data
      totalAssets: balance.totalAssets || 0,
      totalCurrentAssets: balance.totalCurrentAssets || 0,
      cashAndCashEquivalents: balance.cashAndCashEquivalents || 0,
      totalLiabilities: balance.totalLiabilities || 0,
      totalCurrentLiabilities: balance.totalCurrentLiabilities || 0,
      totalStockholdersEquity: balance.totalStockholdersEquity || 0,
      
      // Cash flow data
      operatingCashFlow: cashFlow.operatingCashFlow || 0,
      capitalExpenditure: cashFlow.capitalExpenditure || 0,
      freeCashFlow: cashFlow.freeCashFlow || 0,
      netCashUsedForInvestingActivities: cashFlow.netCashUsedForInvestingActivities || 0
    });
  }
  
  // Sort by date (oldest to newest)
  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Prepare ratio data for charts
 */
export const prepareRatioData = (ratios: KeyRatio[]): RatioData[] => {
  if (!ratios || ratios.length === 0) return [];
  
  const result: RatioData[] = ratios.map(ratio => ({
    date: ratio.date,
    // Profitability ratios
    returnOnAssets: ratio.returnOnAssets || 0,
    returnOnEquity: ratio.returnOnEquity || 0,
    profitMargin: ratio.netProfitMargin || 0,
    operatingProfitMargin: ratio.operatingProfitMargin || 0,
    
    // Liquidity ratios
    currentRatio: ratio.currentRatio || 0,
    quickRatio: ratio.quickRatio || 0,
    cashRatio: ratio.cashRatio || 0,
    
    // Solvency ratios
    debtToAssets: ratio.debtToAssets || 0,
    debtToEquity: ratio.debtToEquity || 0,
    
    // Efficiency ratios
    assetTurnover: ratio.assetTurnover || 0,
    inventoryTurnover: ratio.inventoryTurnover || 0,
    
    // Valuation ratios
    priceToEarnings: ratio.priceEarningsRatio || 0,
    priceToBook: ratio.priceToBookRatio || 0,
    priceToSales: ratio.priceToSalesRatio || 0,
    enterpriseValueMultiple: ratio.enterpriseValueMultiple || 0,
    
    // Dividend ratios
    dividendYield: ratio.dividendYield || 0,
    dividendPayoutRatio: ratio.dividendPayoutRatio || 0,
  }));
  
  // Sort by date (oldest to newest)
  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Calculate compound annual growth rate (CAGR)
 */
export const calculateCAGR = (startValue: number, endValue: number, years: number): number => {
  if (startValue <= 0 || years <= 0) return 0;
  return Math.pow(endValue / startValue, 1 / years) - 1;
};

/**
 * Calculate year-over-year growth rate
 */
export const calculateYoYGrowth = (currentValue: number, previousValue: number): number => {
  if (previousValue === 0) return 0;
  return (currentValue - previousValue) / Math.abs(previousValue);
};

/**
 * Get growth rates for key financial metrics
 */
export const getGrowthRates = (financials: FinancialData[]): Record<string, number> => {
  if (!financials || financials.length < 2) {
    return {
      revenueGrowth: 0,
      netIncomeGrowth: 0,
      operatingCashFlowGrowth: 0,
      freeCashFlowGrowth: 0
    };
  }
  
  // Sort by date (oldest to newest)
  const sortedData = [...financials].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const oldest = sortedData[0];
  const newest = sortedData[sortedData.length - 1];
  const years = sortedData.length - 1;
  
  return {
    revenueGrowth: calculateCAGR(oldest.revenue, newest.revenue, years),
    netIncomeGrowth: calculateCAGR(
      Math.max(oldest.netIncome, 1), // Avoid negative or zero values
      Math.max(newest.netIncome, 1),
      years
    ),
    operatingCashFlowGrowth: calculateCAGR(
      Math.max(oldest.operatingCashFlow, 1),
      Math.max(newest.operatingCashFlow, 1),
      years
    ),
    freeCashFlowGrowth: calculateCAGR(
      Math.max(oldest.freeCashFlow, 1),
      Math.max(newest.freeCashFlow, 1),
      years
    )
  };
};

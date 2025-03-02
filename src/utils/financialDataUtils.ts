import type { IncomeStatement, BalanceSheet, KeyRatio, CashFlowStatement } from "@/types";

/**
 * Format currency values for display
 * @param value - The number to format
 * @param abbreviate - Whether to abbreviate large numbers (e.g., 1.2B)
 */
export const formatCurrency = (value: number, abbreviate = false): string => {
  if (abbreviate) {
    if (Math.abs(value) >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Prepares financial data for charts and tables
 */
export const prepareFinancialData = (
  income: IncomeStatement[], 
  balance: BalanceSheet[],
  cashflow: CashFlowStatement[] = []
) => {
  if (income.length === 0) return [];
  
  return income.map((inc, index) => {
    const bal = balance[index] || {} as Partial<BalanceSheet>;
    const cf = cashflow[index] || {} as Partial<CashFlowStatement>;
    
    const year = new Date(inc.date).getFullYear().toString();
    
    return {
      year,
      // Income Statement data
      revenue: inc.revenue,
      costOfRevenue: inc.costOfRevenue,
      grossProfit: inc.grossProfit,
      operatingExpenses: inc.operatingExpenses || (inc.sellingGeneralAndAdministrativeExpenses + (inc.researchAndDevelopmentExpenses || 0)),
      operatingIncome: inc.operatingIncome,
      netIncome: inc.netIncome,
      eps: inc.eps,
      
      // Balance Sheet data
      totalAssets: bal.totalAssets || 0,
      totalLiabilities: bal.totalLiabilities || 0,
      totalEquity: bal.totalStockholdersEquity || 0,
      cashAndCashEquivalents: bal.cashAndCashEquivalents || 0,
      shortTermInvestments: bal.shortTermInvestments || 0,
      accountsReceivable: bal.netReceivables || 0,
      inventory: bal.inventory || 0,
      totalCurrentAssets: bal.totalCurrentAssets || 0,
      propertyPlantEquipment: bal.propertyPlantEquipmentNet || 0,
      longTermInvestments: bal.longTermInvestments || 0,
      intangibleAssets: bal.intangibleAssets || 0,
      totalNonCurrentAssets: bal.totalNonCurrentAssets || 0,
      accountsPayable: bal.accountPayables || 0,
      shortTermDebt: bal.shortTermDebt || 0,
      totalCurrentLiabilities: bal.totalCurrentLiabilities || 0,
      longTermDebt: bal.longTermDebt || 0,
      totalNonCurrentLiabilities: bal.totalNonCurrentLiabilities || 0,
      
      // Cash Flow data
      operatingCashFlow: cf.operatingCashFlow || 0,
      capitalExpenditure: cf.capitalExpenditure || 0,
      freeCashFlow: cf.freeCashFlow || 0,
      depreciation: cf.depreciationAndAmortization || 0,
      changeInWorkingCapital: cf.changeInWorkingCapital || 0,
      investmentCashFlow: cf.netCashUsedForInvestingActivites || 0,
      financingCashFlow: cf.netCashUsedProvidedByFinancingActivities || 0,
      netChangeInCash: cf.netChangeInCash || 0
    };
  });
};

/**
 * Prepares ratio data for charts and tables
 */
export const prepareRatioData = (ratios: KeyRatio[]) => {
  if (ratios.length === 0) return [];
  
  return ratios.map(ratio => {
    const year = new Date(ratio.date).getFullYear().toString();
    
    return {
      year,
      peRatio: ratio.priceEarningsRatio,
      pbRatio: ratio.priceToBookRatio,
      roe: ratio.returnOnEquity,
      roa: ratio.returnOnAssets,
      currentRatio: ratio.currentRatio,
      debtToEquity: ratio.debtEquityRatio,
      grossMargin: ratio.grossProfitMargin,
      operatingMargin: ratio.operatingProfitMargin,
      netMargin: ratio.netProfitMargin
    };
  });
};

/**
 * Calculate year-over-year growth
 */
export const calculateGrowth = (data: any[], key: string) => {
  return data.map((item, index) => {
    if (index === data.length - 1) {
      return { year: item.year, growth: 0 };
    }
    
    const currentValue = item[key];
    const nextValue = data[index + 1][key];
    const growth = nextValue !== 0 
      ? ((currentValue - nextValue) / Math.abs(nextValue)) * 100 
      : 0;
      
    return {
      year: item.year,
      growth
    };
  }).filter((item, index) => index < data.length - 1);
};

/**
 * Calculate Compound Annual Growth Rate (CAGR)
 */
export const calculateCAGR = (data: any[], key: string) => {
  if (data.length < 2) return 0;
  
  const newest = data[0][key];
  const oldest = data[data.length - 1][key];
  const years = data.length - 1;
  
  if (oldest <= 0 || newest <= 0) return 0;
  
  return ((Math.pow(newest / oldest, 1 / years) - 1) * 100);
};

/**
 * Compare to industry average
 */
export const compareToIndustry = (value: number, industryAvg: number) => {
  if (value > industryAvg) {
    return `Above Industry Average (${industryAvg.toFixed(1)}%)`;
  } else if (value < industryAvg) {
    return `Below Industry Average (${industryAvg.toFixed(1)}%)`;
  } else {
    return `At Industry Average (${industryAvg.toFixed(1)}%)`;
  }
};

/**
 * Format large numbers for display
 */
export const formatFinancialValue = (value: number): string => {
  if (Math.abs(value) >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
};

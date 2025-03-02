
import type { IncomeStatement, BalanceSheet, KeyRatio } from "@/types";
import { formatCurrency } from "@/lib/utils";

/**
 * Prepares financial data for charts and tables
 */
export const prepareFinancialData = (
  income: IncomeStatement[], 
  balance: BalanceSheet[]
) => {
  if (income.length === 0) return [];
  
  return income.map((inc, index) => {
    const bal = balance[index] || {} as Partial<BalanceSheet>;
    const year = new Date(inc.date).getFullYear().toString();
    
    return {
      year,
      revenue: inc.revenue,
      costOfRevenue: inc.costOfRevenue,
      grossProfit: inc.grossProfit,
      operatingExpenses: inc.operatingExpenses || (inc.sellingGeneralAndAdministrativeExpenses + (inc.researchAndDevelopmentExpenses || 0)),
      operatingIncome: inc.operatingIncome,
      netIncome: inc.netIncome,
      eps: inc.eps,
      totalAssets: bal.totalAssets || 0,
      totalLiabilities: bal.totalLiabilities || 0,
      totalEquity: bal.totalStockholdersEquity || 0
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

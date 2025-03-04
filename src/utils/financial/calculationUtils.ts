
import { FinancialData } from '../../types/financialDataTypes';

/**
 * Calculate the Compound Annual Growth Rate (CAGR) for a specific financial metric
 */
export function calculateCAGR(data: FinancialData[], metricKey: keyof FinancialData): number {
  if (!data || data.length < 2) return 0;
  
  // Sort data by date in ascending order
  const sortedData = [...data].sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime());
  
  const startValue = Number(sortedData[0][metricKey]);
  const endValue = Number(sortedData[sortedData.length - 1][metricKey]);
  
  if (startValue <= 0 || Number.isNaN(startValue) || Number.isNaN(endValue)) return 0;
  
  const years = sortedData.length - 1;
  const cagr = (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  
  return isFinite(cagr) ? parseFloat(cagr.toFixed(2)) : 0;
}

/**
 * Calculate Year-over-Year (YoY) growth rate for the most recent period
 */
export function calculateYoYGrowth(data: FinancialData[], metricKey: keyof FinancialData): number {
  if (!data || data.length < 2) return 0;
  
  // Sort data by date in descending order (most recent first)
  const sortedData = [...data].sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
  
  const currentValue = Number(sortedData[0][metricKey]);
  const previousValue = Number(sortedData[1][metricKey]);
  
  if (previousValue <= 0 || Number.isNaN(currentValue) || Number.isNaN(previousValue)) return 0;
  
  const yoyGrowth = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  
  return isFinite(yoyGrowth) ? parseFloat(yoyGrowth.toFixed(2)) : 0;
}

/**
 * Calculate profit margin
 */
export function calculateProfitMargin(revenue: number, netIncome: number): number {
  if (!revenue || revenue === 0 || Number.isNaN(revenue) || Number.isNaN(netIncome)) return 0;
  const margin = (netIncome / revenue) * 100;
  return isFinite(margin) ? parseFloat(margin.toFixed(2)) : 0;
}

/**
 * Calculate operating margin
 */
export function calculateOperatingMargin(revenue: number, operatingIncome: number): number {
  if (!revenue || revenue === 0 || Number.isNaN(revenue) || Number.isNaN(operatingIncome)) return 0;
  const margin = (operatingIncome / revenue) * 100;
  return isFinite(margin) ? parseFloat(margin.toFixed(2)) : 0;
}

/**
 * Calculate EBITDA margin
 */
export function calculateEbitdaMargin(revenue: number, ebitda: number): number {
  if (!revenue || revenue === 0 || Number.isNaN(revenue) || Number.isNaN(ebitda)) return 0;
  const margin = (ebitda / revenue) * 100;
  return isFinite(margin) ? parseFloat(margin.toFixed(2)) : 0;
}

/**
 * Calculate the average value for a metric across multiple periods
 */
export function calculateAverage(data: FinancialData[], metricKey: keyof FinancialData): number {
  if (!data || data.length === 0) return 0;
  
  const sum = data.reduce((acc, item) => {
    const value = Number(item[metricKey]);
    return acc + (Number.isFinite(value) ? value : 0);
  }, 0);
  
  return parseFloat((sum / data.length).toFixed(2));
}

/**
 * Calculate Debt-to-Equity ratio
 */
export function calculateDebtToEquity(totalDebt: number, shareholdersEquity: number): number {
  if (!shareholdersEquity || shareholdersEquity === 0 || Number.isNaN(totalDebt) || Number.isNaN(shareholdersEquity)) return 0;
  const ratio = totalDebt / shareholdersEquity;
  return isFinite(ratio) ? parseFloat(ratio.toFixed(2)) : 0;
}

/**
 * Calculate Current Ratio
 */
export function calculateCurrentRatio(currentAssets: number, currentLiabilities: number): number {
  if (!currentLiabilities || currentLiabilities === 0 || Number.isNaN(currentAssets) || Number.isNaN(currentLiabilities)) return 0;
  const ratio = currentAssets / currentLiabilities;
  return isFinite(ratio) ? parseFloat(ratio.toFixed(2)) : 0;
}

/**
 * Calculate Return on Equity (ROE)
 */
export function calculateROE(netIncome: number, shareholdersEquity: number): number {
  if (!shareholdersEquity || shareholdersEquity === 0 || Number.isNaN(netIncome) || Number.isNaN(shareholdersEquity)) return 0;
  const roe = (netIncome / shareholdersEquity) * 100;
  return isFinite(roe) ? parseFloat(roe.toFixed(2)) : 0;
}

/**
 * Calculate Return on Assets (ROA)
 */
export function calculateROA(netIncome: number, totalAssets: number): number {
  if (!totalAssets || totalAssets === 0 || Number.isNaN(netIncome) || Number.isNaN(totalAssets)) return 0;
  const roa = (netIncome / totalAssets) * 100;
  return isFinite(roa) ? parseFloat(roa.toFixed(2)) : 0;
}

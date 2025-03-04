import { FinancialData, KeyRatio } from '../types/financialDataTypes';

/**
 * Calculate the Compound Annual Growth Rate (CAGR) for a specific financial metric
 */
export function calculateCAGR(data: FinancialData[], metricKey: keyof FinancialData): number {
  if (!data || data.length < 2) return 0;
  
  // Sort data by date in ascending order
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
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
  const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
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
 * Format large numbers to a more readable format (e.g., 1,000,000 to $1M)
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (absValue >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return `${value.toFixed(2)}%`;
}

/**
 * Format number with commas for thousands separator
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Format date from financial statements
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateString || 'N/A';
  }
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

/**
 * Extract years from financial data for table headers
 */
export function extractYearsFromFinancials(financials: FinancialData[]): string[] {
  if (!financials || financials.length === 0) return [];
  
  return [...financials]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(item => {
      const date = new Date(item.date);
      return date.getFullYear().toString();
    });
}

/**
 * Extract financial data as an array of values for a specific metric, ordered by year
 */
export function extractMetricByYear(financials: FinancialData[], metricKey: keyof FinancialData): number[] {
  if (!financials || financials.length === 0) return [];
  
  return [...financials]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => {
      const value = Number(item[metricKey]);
      return Number.isFinite(value) ? value : 0;
    });
}

/**
 * Determine the growth trend direction and strength
 */
export function determineGrowthTrend(cagr: number): 'strong-positive' | 'positive' | 'neutral' | 'negative' | 'strong-negative' {
  if (cagr >= 25) return 'strong-positive';
  if (cagr >= 10) return 'positive';
  if (cagr >= -5) return 'neutral';
  if (cagr >= -15) return 'negative';
  return 'strong-negative';
}

/**
 * Get a suggested color based on performance
 */
export function getPerformanceColor(value: number, isPercentage: boolean = true): string {
  // For percentages (growth rates, ratios expressed as percentages)
  if (isPercentage) {
    if (value >= 25) return '#22c55e'; // green-500
    if (value >= 10) return '#4ade80'; // green-400
    if (value >= 0) return '#86efac'; // green-300
    if (value >= -10) return '#fca5a5'; // red-300
    if (value >= -25) return '#f87171'; // red-400
    return '#ef4444'; // red-500
  } 
  // For ratios and non-percentage values
  else {
    if (value >= 3) return '#22c55e'; // green-500
    if (value >= 2) return '#4ade80'; // green-400
    if (value >= 1) return '#86efac'; // green-300
    if (value >= 0.5) return '#fca5a5'; // red-300
    if (value >= 0.25) return '#f87171'; // red-400
    return '#ef4444'; // red-500
  }
}

/**
 * Filter and sort financial data by date
 */
export function getOrderedFinancials(data: FinancialData[], sortDirection: 'asc' | 'desc' = 'desc'): FinancialData[] {
  if (!data || data.length === 0) return [];
  
  return [...data].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Calculate year-over-year changes for all metrics in financial data
 */
export function calculateYearOverYearChanges(data: FinancialData[]): Record<string, number[]> {
  if (!data || data.length < 2) return {};
  
  const sortedData = getOrderedFinancials(data, 'asc');
  const metrics = Object.keys(sortedData[0]).filter(key => 
    typeof sortedData[0][key as keyof FinancialData] === 'number' && key !== 'date'
  );
  
  const changes: Record<string, number[]> = {};
  
  metrics.forEach(metric => {
    changes[metric] = [];
    
    for (let i = 1; i < sortedData.length; i++) {
      const current = Number(sortedData[i][metric as keyof FinancialData]);
      const previous = Number(sortedData[i-1][metric as keyof FinancialData]);
      
      if (previous === 0 || !Number.isFinite(previous) || !Number.isFinite(current)) {
        changes[metric].push(0);
      } else {
        const changePercent = ((current - previous) / Math.abs(previous)) * 100;
        changes[metric].push(Number.isFinite(changePercent) ? parseFloat(changePercent.toFixed(2)) : 0);
      }
    }
  });
  
  return changes;
}

/**
 * Find the fiscal year end date from financial data
 */
export function findFiscalYearEnd(data: FinancialData[]): string {
  if (!data || data.length === 0) return 'Dec 31';
  
  // Use the most recent financial statement date
  const sortedData = getOrderedFinancials(data, 'desc');
  const date = new Date(sortedData[0].date);
  
  // Format month and day
  return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
}

/**
 * Get financial ratios from the most recent period
 */
export function getMostRecentRatios(ratios: KeyRatio[]): KeyRatio | null {
  if (!ratios || ratios.length === 0) return null;
  
  // Sort by date in descending order and take the first item
  return [...ratios]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
}

/**
 * Get ratios over time for a specific metric
 */
export function getRatioTimeSeries(ratios: KeyRatio[], metricKey: keyof KeyRatio): Array<{ date: string; value: number }> {
  if (!ratios || ratios.length === 0) return [];
  
  return [...ratios]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(ratio => ({
      date: ratio.date,
      value: Number(ratio[metricKey]) || 0
    }));
}

/**
 * Prepare financial data from income statements, balance sheets, and cash flows
 */
export function prepareFinancialData(
  incomeStatements: any[],
  balanceSheets: any[],
  cashFlows: any[]
): any[] {
  if (!incomeStatements.length || !balanceSheets.length || !cashFlows.length) {
    return [];
  }

  // Get a list of all available years from income statements
  const years = incomeStatements.map(statement => 
    statement.calendarYear || (statement.date ? new Date(statement.date).getFullYear().toString() : '')
  );

  return years.map(year => {
    const incomeData = incomeStatements.find(statement => 
      statement.calendarYear === year || (statement.date && new Date(statement.date).getFullYear().toString() === year)
    ) || {};
    
    const balanceData = balanceSheets.find(statement => 
      statement.calendarYear === year || (statement.date && new Date(statement.date).getFullYear().toString() === year)
    ) || {};
    
    const cashFlowData = cashFlows.find(statement => 
      statement.calendarYear === year || (statement.date && new Date(statement.date).getFullYear().toString() === year)
    ) || {};

    return {
      year,
      date: incomeData.date || balanceData.date || cashFlowData.date,
      calendarYear: year,
      // Income statement data
      revenue: incomeData.revenue || 0,
      costOfRevenue: incomeData.costOfRevenue || 0,
      grossProfit: incomeData.grossProfit || 0,
      operatingExpenses: incomeData.operatingExpenses || 0,
      operatingIncome: incomeData.operatingIncome || 0,
      netIncome: incomeData.netIncome || 0,
      eps: incomeData.eps || 0,
      ebitda: incomeData.ebitda || 0,
      
      // Balance sheet data
      totalAssets: balanceData.totalAssets || 0,
      totalLiabilities: balanceData.totalLiabilities || 0,
      totalEquity: balanceData.totalEquity || 0,
      cashAndCashEquivalents: balanceData.cashAndCashEquivalents || 0,
      shortTermInvestments: balanceData.shortTermInvestments || 0,
      accountsReceivable: balanceData.accountsReceivable || 0,
      inventory: balanceData.inventory || 0,
      totalCurrentAssets: balanceData.totalCurrentAssets || 0,
      propertyPlantEquipment: balanceData.propertyPlantEquipment || 0,
      longTermInvestments: balanceData.longTermInvestments || 0,
      intangibleAssets: balanceData.intangibleAssets || 0,
      totalNonCurrentAssets: balanceData.totalNonCurrentAssets || 0,
      accountsPayable: balanceData.accountsPayable || 0,
      shortTermDebt: balanceData.shortTermDebt || 0,
      totalCurrentLiabilities: balanceData.totalCurrentLiabilities || 0,
      longTermDebt: balanceData.longTermDebt || 0,
      totalNonCurrentLiabilities: balanceData.totalNonCurrentLiabilities || 0,
      
      // Cash Flow data
      operatingCashFlow: cashFlowData.operatingCashFlow || 0,
      capitalExpenditure: cashFlowData.capitalExpenditure || 0,
      freeCashFlow: cashFlowData.freeCashFlow || 0,
      depreciation: cashFlowData.depreciation || 0,
      changeInWorkingCapital: cashFlowData.changeInWorkingCapital || 0,
      investmentCashFlow: cashFlowData.investmentCashFlow || 0,
      financingCashFlow: cashFlowData.financingCashFlow || 0,
      netChangeInCash: cashFlowData.netChangeInCash || 0
    };
  });
}

/**
 * Prepare financial ratios from key ratio data
 */
export function prepareRatioData(ratios: any[]): any[] {
  if (!ratios.length) {
    return [];
  }

  return ratios.map(ratio => {
    const year = ratio.date ? new Date(ratio.date).getFullYear().toString() : '';
    
    return {
      year,
      date: ratio.date,
      peRatio: ratio.peRatio || 0,
      pbRatio: ratio.priceToBookRatio || 0,
      roe: ratio.returnOnEquity || 0,
      roa: ratio.returnOnAssets || 0,
      currentRatio: ratio.currentRatio || 0,
      debtToEquity: ratio.debtToEquity || 0,
      grossMargin: ratio.grossProfitMargin || 0,
      operatingMargin: ratio.operatingProfitMargin || 0,
      netMargin: ratio.netProfitMargin || 0
    };
  });
}

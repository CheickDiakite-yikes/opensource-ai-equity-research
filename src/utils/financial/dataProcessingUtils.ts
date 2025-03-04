
import { FinancialData } from '../../types/financialDataTypes';
import { KeyRatio } from '../../types/financialDataTypes';

/**
 * Extract years from financial data for table headers
 */
export function extractYearsFromFinancials(financials: FinancialData[]): string[] {
  if (!financials || financials.length === 0) return [];
  
  return [...financials]
    .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
    .map(item => {
      const date = new Date(item.date || '');
      return date.getFullYear().toString();
    });
}

/**
 * Extract financial data as an array of values for a specific metric, ordered by year
 */
export function extractMetricByYear(financials: FinancialData[], metricKey: keyof FinancialData): number[] {
  if (!financials || financials.length === 0) return [];
  
  return [...financials]
    .sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime())
    .map(item => {
      const value = Number(item[metricKey]);
      return Number.isFinite(value) ? value : 0;
    });
}

/**
 * Filter and sort financial data by date
 */
export function getOrderedFinancials(data: FinancialData[], sortDirection: 'asc' | 'desc' = 'desc'): FinancialData[] {
  if (!data || data.length === 0) return [];
  
  return [...data].sort((a, b) => {
    const dateA = new Date(a.date || '').getTime();
    const dateB = new Date(b.date || '').getTime();
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
  const date = new Date(sortedData[0].date || '');
  
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
): FinancialData[] {
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

/**
 * Transform financial data into growth data format for charts
 */
export function transformFinancialsToGrowthData(
  financials: FinancialData[], 
  metricKey: keyof FinancialData
): Array<{ year: string; growth: number }> {
  if (!financials || financials.length < 2) return [];
  
  // Sort by date ascending
  const sortedData = [...financials].sort((a, b) => 
    new Date(a.date || '').getTime() - new Date(b.date || '').getTime()
  );
  
  const growthData = [];
  
  // Calculate year-over-year growth for each year
  for (let i = 1; i < sortedData.length; i++) {
    const currentValue = Number(sortedData[i][metricKey]);
    const previousValue = Number(sortedData[i-1][metricKey]);
    
    if (previousValue === 0 || !Number.isFinite(previousValue) || !Number.isFinite(currentValue)) {
      growthData.push({
        year: sortedData[i].year,
        growth: 0
      });
    } else {
      const growth = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
      growthData.push({
        year: sortedData[i].year,
        growth: Number.isFinite(growth) ? parseFloat(growth.toFixed(2)) : 0
      });
    }
  }
  
  return growthData;
}

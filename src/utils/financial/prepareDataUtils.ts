
import { IncomeStatement, BalanceSheet, CashFlowStatement, KeyRatio } from '../../types/financial/statementTypes';
import { FinancialData, RatioData } from '../../types/financialDataTypes';

/**
 * Prepare financial data from raw statements
 */
export function prepareFinancialData(
  incomeStatements: IncomeStatement[],
  balanceSheets: BalanceSheet[],
  cashFlowStatements: CashFlowStatement[]
): FinancialData[] {
  // Create a map of years to financial data
  const financialDataMap = new Map<string, Partial<FinancialData>>();
  
  // Process income statements
  for (const statement of incomeStatements) {
    const year = statement.calendarYear;
    const financialData = financialDataMap.get(year) || {
      year,
      calendarYear: year,
      date: statement.date
    };
    
    // Add income statement data
    financialData.revenue = statement.revenue;
    financialData.costOfRevenue = statement.costOfRevenue;
    financialData.grossProfit = statement.grossProfit;
    financialData.operatingExpenses = statement.operatingExpenses;
    financialData.operatingIncome = statement.operatingIncome;
    financialData.netIncome = statement.netIncome;
    financialData.eps = statement.eps;
    financialData.ebitda = statement.ebitda;
    
    financialDataMap.set(year, financialData);
  }
  
  // Process balance sheets
  for (const sheet of balanceSheets) {
    const year = sheet.calendarYear;
    const financialData = financialDataMap.get(year) || {
      year,
      calendarYear: year,
      date: sheet.date
    };
    
    // Add balance sheet data
    financialData.totalAssets = sheet.totalAssets;
    financialData.totalLiabilities = sheet.totalLiabilities;
    financialData.totalEquity = sheet.totalEquity;
    financialData.cashAndCashEquivalents = sheet.cashAndCashEquivalents;
    financialData.shortTermInvestments = sheet.shortTermInvestments;
    financialData.accountsReceivable = sheet.netReceivables;
    financialData.inventory = sheet.inventory;
    financialData.totalCurrentAssets = sheet.totalCurrentAssets;
    financialData.propertyPlantEquipment = sheet.propertyPlantEquipmentNet;
    financialData.longTermInvestments = sheet.longTermInvestments;
    financialData.intangibleAssets = sheet.intangibleAssets;
    financialData.totalNonCurrentAssets = sheet.totalNonCurrentAssets;
    financialData.accountsPayable = sheet.accountPayables;
    financialData.shortTermDebt = sheet.shortTermDebt;
    financialData.totalCurrentLiabilities = sheet.totalCurrentLiabilities;
    financialData.longTermDebt = sheet.longTermDebt;
    financialData.totalNonCurrentLiabilities = sheet.totalNonCurrentLiabilities;
    
    financialDataMap.set(year, financialData);
  }
  
  // Process cash flow statements
  for (const statement of cashFlowStatements) {
    const year = statement.calendarYear;
    const financialData = financialDataMap.get(year) || {
      year,
      calendarYear: year,
      date: statement.date
    };
    
    // Add cash flow data
    financialData.operatingCashFlow = statement.operatingCashFlow;
    financialData.capitalExpenditure = statement.capitalExpenditure;
    financialData.freeCashFlow = statement.freeCashFlow;
    financialData.depreciation = statement.depreciationAndAmortization;
    financialData.changeInWorkingCapital = statement.changeInWorkingCapital;
    financialData.investmentCashFlow = statement.netCashUsedForInvestingActivities;
    financialData.financingCashFlow = statement.netCashUsedProvidedByFinancingActivities;
    financialData.netChangeInCash = statement.netChangeInCash;
    
    financialDataMap.set(year, financialData);
  }
  
  // Convert map to array and ensure all required fields are present
  const financialDataArray = Array.from(financialDataMap.values())
    .filter(data => {
      // Ensure all required fields have values
      const requiredFields: (keyof FinancialData)[] = ['revenue', 'netIncome', 'totalAssets'];
      return requiredFields.every(field => data[field] !== undefined);
    })
    .map(data => {
      // Fill in any missing fields with 0
      const completeData: any = { ...data };
      Object.keys(completeData).forEach(key => {
        if (completeData[key] === undefined) {
          completeData[key] = 0;
        }
      });
      return completeData as FinancialData;
    });
  
  // Sort by date descending (most recent first)
  return financialDataArray.sort((a, b) => {
    return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
  });
}

/**
 * Prepare ratio data from raw ratios
 */
export function prepareRatioData(ratios: KeyRatio[]): RatioData[] {
  if (!ratios || ratios.length === 0) return [];
  
  return ratios.map(ratio => {
    const year = ratio.date.split('-')[0]; // Extract year from date
    return {
      year,
      date: ratio.date,
      peRatio: ratio.priceEarningsRatio || 0,
      pbRatio: ratio.priceToBookRatio || 0,
      roe: ratio.returnOnEquity || 0,
      roa: ratio.returnOnAssets || 0,
      currentRatio: ratio.currentRatio || 0,
      debtToEquity: ratio.debtEquityRatio || 0,
      grossMargin: ratio.grossProfitMargin || 0,
      operatingMargin: ratio.operatingProfitMargin || 0,
      netMargin: ratio.netProfitMargin || 0
    };
  }).sort((a, b) => {
    return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
  });
}

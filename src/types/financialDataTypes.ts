
// Financial Data Types for use in analysis components
export interface FinancialData {
  year: string;
  calendarYear?: string; // Adding this field as it seems to be used in some utilities
  date?: string; // Adding this field as it's used in financialDataUtils.ts
  
  // Income Statement data
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
  ebitda?: number; // Add this field to fix GrowthTabContent errors
  
  // Balance Sheet data
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  cashAndCashEquivalents: number;
  shortTermInvestments: number;
  accountsReceivable: number;
  inventory: number;
  totalCurrentAssets: number;
  propertyPlantEquipment: number;
  longTermInvestments: number;
  intangibleAssets: number;
  totalNonCurrentAssets: number;
  accountsPayable: number;
  shortTermDebt: number;
  totalCurrentLiabilities: number;
  longTermDebt: number;
  totalNonCurrentLiabilities: number;
  
  // Cash Flow data
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
  depreciation: number;
  changeInWorkingCapital: number;
  investmentCashFlow: number;
  financingCashFlow: number;
  netChangeInCash: number;
}

export interface RatioData {
  year: string;
  date?: string; // Adding this field as it's used in financialDataUtils.ts
  peRatio: number;
  pbRatio: number;
  roe: number;
  roa: number;
  currentRatio: number;
  debtToEquity: number;
  debtEquity: number; // Added to match expected type in RatiosTabContent
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
}

// Remove the KeyRatio interface from here to avoid conflicts
// Instead, we'll import it from financial/statementTypes.ts where needed

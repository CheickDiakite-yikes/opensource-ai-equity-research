
// Financial Data Types for use in analysis components
export interface FinancialData {
  year: string;
  // Income Statement data
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
  
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
  peRatio: number;
  pbRatio: number;
  roe: number;
  roa: number;
  currentRatio: number;
  debtToEquity: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
}

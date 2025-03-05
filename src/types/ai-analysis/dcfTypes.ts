// Custom DCF Analysis Types
export interface CustomDCFParams {
  symbol: string;
  
  // Growth parameters
  revenueGrowthPct: number;
  ebitdaPct: number;
  capitalExpenditurePct: number;
  taxRate: number;
  
  // Working capital parameters
  depreciationAndAmortizationPct: number;
  cashAndShortTermInvestmentsPct: number;
  receivablesPct: number;
  inventoriesPct: number;
  payablesPct: number;
  ebitPct: number;
  operatingCashFlowPct: number;
  sellingGeneralAndAdministrativeExpensesPct: number;
  
  // Rate parameters
  longTermGrowthRate: number;
  costOfEquity: number;
  costOfDebt: number;
  marketRiskPremium: number;
  riskFreeRate: number;
  
  // Other
  beta: number;
}

// New type for AI-generated DCF assumptions
export interface AIDCFSuggestion {
  symbol: string;
  company: string; // Added company property
  timestamp: string;
  expiresAt: string;
  assumptions: {
    // Growth parameters
    revenueGrowthPct: number;
    ebitdaMarginPct: number;
    capitalExpenditurePct: number;
    taxRatePct: number;
    
    // Working capital parameters
    depreciationAndAmortizationPct: number;
    cashAndShortTermInvestmentsPct: number;
    receivablesPct: number;
    inventoriesPct: number;
    payablesPct: number;
    ebitPct: number;
    operatingCashFlowPct: number;
    sellingGeneralAndAdministrativeExpensesPct: number;
    
    // Rate parameters
    longTermGrowthRatePct: number;
    costOfEquityPct: number;
    costOfDebtPct: number;
    marketRiskPremiumPct: number;
    riskFreeRatePct: number;
    
    // Other
    beta: number;
  };
  explanation: string;
  industryComparison?: {
    revenueGrowth: { company: number; industry: number; difference: string };
    profitMargin: { company: number; industry: number; difference: string };
    debtRatio: { company: number; industry: number; difference: string };
  };
}

// Yearly projection data from DCF model
export interface YearlyDCFData {
  year: string;
  revenue: number;
  ebit: number;
  ebitda: number;
  freeCashFlow: number;
  operatingCashFlow: number;
  capitalExpenditure: number;
}

// Updated to match the exact structure from the FMP API response
export interface CustomDCFResult {
  year: string;
  symbol: string;
  revenue: number;
  revenuePercentage: number;
  ebitda: number;
  ebitdaPercentage: number;
  ebit: number;
  ebitPercentage: number;
  depreciation: number;
  capitalExpenditure: number;
  capitalExpenditurePercentage: number;
  price: number;
  beta: number;
  dilutedSharesOutstanding: number;
  costofDebt: number;
  taxRate: number;
  afterTaxCostOfDebt: number;
  riskFreeRate: number;
  marketRiskPremium: number;
  costOfEquity: number;
  totalDebt: number;
  totalEquity: number;
  totalCapital: number;
  debtWeighting: number;
  equityWeighting: number;
  wacc: number;
  operatingCashFlow: number;
  pvLfcf: number;
  sumPvLfcf: number;
  longTermGrowthRate: number;
  freeCashFlow: number;
  terminalValue: number;
  presentTerminalValue: number;
  enterpriseValue: number;
  netDebt: number;
  equityValue: number;
  equityValuePerShare: number;
  freeCashFlowT1: number;
  operatingCashFlowPercentage: number;
}

// DCF Sensitivity Analysis data structure
export interface DCFSensitivityData {
  headers: string[];
  rows: Array<{
    growth: string;
    values: number[];
  }>;
}

// DCF Assumptions Summary for display
export interface DCFAssumptionsSummary {
  growthRate: string;
  discountRate: string;
  terminalMultiple: string;
  taxRate: string;
}

// Combined DCF data structure returned by utility functions
export interface FormattedDCFData {
  intrinsicValue: number;
  currentPrice?: number;
  upside?: string;
  assumptions: DCFAssumptionsSummary;
  projections: YearlyDCFData[];
  sensitivity: DCFSensitivityData;
}

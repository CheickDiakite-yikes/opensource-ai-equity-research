import type { 
  StockQuote,
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  KeyRatio,
  NewsArticle
} from './index';

// OpenAI Types
export interface ReportRequest {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  description: string;
  stockData: StockQuote;
  financials: {
    income: IncomeStatement[];
    balance: BalanceSheet[];
    cashflow: CashFlowStatement[];
    ratios: KeyRatio[];
  };
  news: NewsArticle[];
  peers: string[];
  reportType?: string; // Add the report type parameter
}

export interface ReportSection {
  title: string;
  content: string;
}

// Updated ResearchReport interface to align with the one in index.ts
export interface ResearchReport {
  id?: string;
  symbol: string;
  companyName: string;
  date: string;
  recommendation: string;
  targetPrice: string;
  summary: string;
  sections: ReportSection[];
  ratingDetails?: {
    ratingScale: string;
    ratingJustification?: string;
  };
  scenarioAnalysis?: {
    bullCase: {
      price: string;
      probability: string;
      drivers: string[];
    };
    baseCase: {
      price: string;
      probability: string;
      drivers: string[];
    };
    bearCase: {
      price: string;
      probability: string;
      drivers: string[];
    };
  };
  catalysts?: {
    positive: string[];
    negative: string[];
    timeline?: {
      shortTerm: string[];
      mediumTerm: string[];
      longTerm: string[];
    };
  };
}

export interface StockPrediction {
  symbol: string;
  currentPrice: number;
  predictedPrice: {
    oneMonth: number;
    threeMonths: number;
    sixMonths: number;
    oneYear: number;
  };
  sentimentAnalysis: string;
  confidenceLevel: number;
  keyDrivers: string[];
  risks: string[];
}

// Added GrowthInsight interface that was missing
export interface GrowthInsight {
  type: "positive" | "negative" | "neutral";
  source: "earnings" | "filing" | "analysis";
  sourceDate: string;
  content: string;
}

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


import { IncomeStatement, BalanceSheet, CashFlowStatement, KeyRatio } from ".";

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

export interface YearlyDCFData {
  year?: string;
  revenue?: number;
  ebit?: number;
  ebitda?: number;
  freeCashFlow?: number;
  operatingCashFlow?: number;
  capitalExpenditure?: number;
}

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

export interface GrowthInsight {
  id?: string;
  category: string;
  title: string;
  description: string;
  trends: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  confidenceScore: number;
  source: string;
  sourceDate?: string;
  impactDescription?: string;
  symbol?: string;
  type: 'positive' | 'negative' | 'neutral';
  content: string;
}

export interface ResearchReportRequest {
  symbol: string;
  targetTimeframe?: string;
  includeValuation?: boolean;
  includeTechnicalAnalysis?: boolean;
  includeIndustryAnalysis?: boolean;
  includeRisks?: boolean;
  includeCatalysts?: boolean;
  includePriceTargets?: boolean;
  includeFinancialHealth?: boolean;
  includeThesis?: boolean;
}

export interface ResearchReportSection {
  title: string;
  content: string;
  type: string;
  insights: string[];
}

export interface ResearchReport {
  id?: string;
  companyName: string;
  symbol: string;
  reportDate: string;
  summary: string;
  rating: string;
  targetPrice: number;
  currentPrice: number;
  upside: number;
  sections: ResearchReportSection[];
  disclaimer: string;
  analysts?: string[];
  date: string;
  recommendation: string;
  ratingDetails?: {
    ratingScale: string;
    ratingJustification?: string;
  };
  scenarioAnalysis?: {
    bullCase: {
      price: number;
      probability: number;
      drivers: string[];
    };
    baseCase: {
      price: number;
      probability: number;
      drivers: string[];
    };
    bearCase: {
      price: number;
      probability: number;
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
  predictedPrice: {
    oneMonth: number;
    threeMonths: number;
    sixMonths: number;
    oneYear: number;
  };
  currentPrice: number;
  percentageChange: number;
  timeframe: string;
  confidence: number;
  bullishFactors: string[];
  bearishFactors: string[];
  technicalIndicators: {
    name: string;
    value: string;
    signal: 'bullish' | 'bearish' | 'neutral';
  }[];
  sentimentScore: number;
  sentimentAnalysis: string;
  keyDrivers: string[];
  risks: string[];
}

// Types for Financial Data Analysis
export interface FinancialDataProps {
  income: IncomeStatement[];
  balance: BalanceSheet[];
  cashflow: CashFlowStatement[];
  ratios: KeyRatio[];
}

export interface RatioSummary {
  profitability: {
    grossMargin: number[];
    operatingMargin: number[];
    netMargin: number[];
    returnOnEquity: number[];
    returnOnAssets: number[];
  };
  liquidity: {
    currentRatio: number[];
    quickRatio: number[];
    cashRatio: number[];
  };
  leverage: {
    debtToEquity: number[];
    debtToAssets: number[];
    interestCoverage: number[];
  };
  efficiency: {
    assetTurnover: number[];
    inventoryTurnover: number[];
    receivablesTurnover: number[];
  };
  valuation: {
    peRatio: number[];
    pbRatio: number[];
    evToEbitda: number[];
    evToRevenue: number[];
    dividendYield: number[];
  };
  growth: {
    revenueGrowth: number[];
    earningsGrowth: number[];
    dividendGrowth: number[];
  };
}

// Add ReportRequest interface needed by the API service
export interface ReportRequest {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  description: string;
  stockData: any;
  financials: {
    income: any[];
    balance: any[];
    cashflow: any[];
    ratios: any[];
  };
  news: any[];
  peers: string[];
  reportType: string;
}

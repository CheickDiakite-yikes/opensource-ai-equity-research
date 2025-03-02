
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
}

export interface ReportSection {
  title: string;
  content: string;
}

export interface ResearchReport {
  symbol: string;
  companyName: string;
  date: string;
  recommendation: string;
  targetPrice: string;
  summary: string;
  sections: ReportSection[];
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

// Custom DCF Analysis Types
export interface CustomDCFParams {
  symbol: string;
  revenueGrowthPct: number;
  ebitdaPct: number;
  capitalExpenditurePct: number;
  taxRate: number;
  longTermGrowthRate: number;
  costOfEquity: number;
  costOfDebt: number;
  beta: number;
  marketRiskPremium: number;
  riskFreeRate: number;
}

export interface CustomDCFResult {
  year: string;
  symbol: string;
  revenue: number;
  revenuePercentage: number;
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

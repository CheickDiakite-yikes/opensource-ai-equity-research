
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

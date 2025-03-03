
import type { 
  StockQuote,
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  KeyRatio,
  NewsArticle
} from '../index';

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
  reportType?: string;
}

export interface ReportSection {
  title: string;
  content: string;
}

export interface RatingDetails {
  ratingScale: string;
  ratingJustification?: string;
}

export interface ResearchReport {
  id?: string;
  symbol: string;
  companyName: string;
  date: string;
  recommendation: string;
  targetPrice: string;
  summary: string;
  sections: ReportSection[];
  ratingDetails?: RatingDetails;
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

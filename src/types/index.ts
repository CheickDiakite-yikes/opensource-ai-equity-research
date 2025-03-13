// Re-export all types from domain-specific files

// Profile and company data types
export * from './profile/companyTypes';

// Financial data types
export * from './financial/metricsTypes';
// Explicitly re-export statement types to avoid naming conflicts
export type {
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  KeyRatio
} from './financial/statementTypes';

// Market data types
export * from './market/indexTypes';
export * from './market/performanceTypes';

// News types
export * from './news/newsTypes';

// Other domain types 
export * from './historicalDataTypes';
export * from './documentTypes';
export * from './aiAnalysisTypes';

// Export financialDataTypes directly to avoid naming conflicts
export type { FinancialData, RatioData } from './financialDataTypes';

// Re-export AI analysis types for backward compatibility
export type { RatingDetails } from './ai-analysis/reportTypes';
export type { ResearchReport } from './ai-analysis/reportTypes';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  exchange: string;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string | null;
  sharesOutstanding: number;
  timestamp: number;
  isCommonTicker?: boolean;
  category?: string;
}

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

// AI analysis types
export * from './aiAnalysisTypes';
export type { 
  ResearchReport,
  ReportRequest,
  RatingDetails,
  ScenarioAnalysis,
  GrowthCatalysts 
} from './ai-analysis/reportTypes';

// Other domain types 
export * from './historicalDataTypes';
export * from './documentTypes';

// Export financialDataTypes directly to avoid naming conflicts
export type { FinancialData, RatioData } from './financialDataTypes';

// Make sure StockQuote type is still exported
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

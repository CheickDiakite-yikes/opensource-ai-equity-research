
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

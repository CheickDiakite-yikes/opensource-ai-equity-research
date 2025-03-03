
// Re-export all types from domain-specific files
export * from './apiTypes';
export * from './historicalDataTypes';
export * from './financialStatementTypes';
export * from './documentTypes';
export * from './aiAnalysisTypes';

// Add new interface for Rating and Recommendation
export interface RatingDetails {
  ratingScale: string;
  ratingJustification?: string;
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

// Use the ResearchReport interface from aiAnalysisTypes.ts
export type { ResearchReport } from './aiAnalysisTypes';

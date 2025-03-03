
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

// Use the ResearchReport interface from aiAnalysisTypes.ts
export type { ResearchReport } from './aiAnalysisTypes';

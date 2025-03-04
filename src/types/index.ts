
// Re-export all types from domain-specific files
export * from './apiTypes';
export * from './historicalDataTypes';
export * from './financialStatementTypes';
export * from './documentTypes';
export * from './aiAnalysisTypes';
export * from './financialDataTypes';

// Add new interface for Rating and Recommendation
// Note: This is now exported from reportTypes.ts, so we don't need to define it here
// But keeping the re-export for backward compatibility
export type { RatingDetails } from './ai-analysis/reportTypes';

// Updated ResearchReport interface to match aiAnalysisTypes
export type { ResearchReport } from './ai-analysis/reportTypes';

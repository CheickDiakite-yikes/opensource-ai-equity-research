
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

// Update ResearchReport interface to include ratingDetails
export interface ResearchReport {
  id: string;
  companyName: string;
  symbol: string;
  date: string;
  recommendation: string;
  targetPrice: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  scenarioAnalysis?: {
    scenarios: Array<{
      name: string;
      description: string;
      impact: string;
      probability: string;
    }>
  };
  catalysts?: Array<{
    name: string;
    type: 'positive' | 'negative';
    description: string;
    timeframe?: string;
    impact?: string;
  }>;
  ratingDetails?: RatingDetails;
}
